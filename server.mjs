// server.js 
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 获取 __dirname (ES modules 中需要手动构建)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 🔧 使用正确的路径导入（ES modules）
import { UniversalPublisher } from '../electron_browser/automation/core/index.js';
import { DouyinDownloader } from '../electron_browser/automation/engines/downloaders/douyin-downloader.js';
import { ChromeController } from '../electron_browser/automation/core/chrome-controller.js';
const app = express();
const port = process.env.PORT || 3211;

// 中间件
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(express.static('public'));

// 文件上传配置
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // 🔍 这里是根据文件的MIME类型来判断分类
        let uploadDir = './uploads';

        if (file.mimetype.startsWith('video/')) {
            // video/mp4, video/avi, video/quicktime 等都会进入这里
            uploadDir = './uploads/videos';
        } else if (file.mimetype.startsWith('audio/')) {
            // audio/mp3, audio/wav, audio/mpeg 等会进入这里
            uploadDir = './uploads/audios';
        } else if (file.mimetype.startsWith('image/')) {
            // image/jpeg, image/png, image/gif 等会进入这里
            uploadDir = './uploads/images';
        }

        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 500 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('只允许上传视频文件'));
        }
    }
});

// 🔧 延迟初始化发布器
let publisher = null;

const initializePublisher = () => {
    if (!publisher) {
        try {
            publisher = new UniversalPublisher({
                electronApiUrl: 'http://localhost:9528',
                enableConcurrency: true,
                maxConcurrentPlatforms: 4,
                timeout: 32100
            });
            console.log('✅ UniversalPublisher 初始化成功');
        } catch (error) {
            console.error('❌ UniversalPublisher 初始化失败:', error.message);
            throw error;
        }
    }
    return publisher;
};

// ==================== API 路由 ====================

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        service: 'RPA Platform API',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

// 获取平台配置
app.get('/api/platforms', async (req, res) => {
    try {
        const pub = initializePublisher();
        const platforms = pub.getSupportedPlatforms();
        const platformDetails = platforms.map(platformId => {
            const config = pub.getPlatformConfig(platformId);
            return {
                id: platformId,
                name: config?.name || platformId,
                icon: config?.icon || '📱',
                color: config?.color || 'bg-gray-500',
                status: config?.status || 'unknown',
                fields: config?.fields || {},
                features: config?.features || {}
            };
        });

        res.json({
            success: true,
            platforms: platformDetails,
            count: platformDetails.length
        });
    } catch (error) {
        console.error('❌ 获取平台配置失败:', error.message);
        res.status(500).json({
            success: false,
            error: error.message,
            platforms: []
        });
    }
});

// 获取浏览器实例
app.get('/api/browsers', async (req, res) => {
    try {
        const response = await fetch('http://localhost:9528/api/browsers');
        const data = await response.json();

        if (data.success) {
            res.json(data);
        } else {
            throw new Error(data.error || '获取浏览器实例失败');
        }
    } catch (error) {
        console.error('❌ 获取浏览器实例失败:', error.message);
        res.status(500).json({
            success: false,
            error: error.message,
            browsers: []
        });
    }
});

// 文件上传
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: '未上传文件'
            });
        }

        const fileInfo = {
            id: Date.now().toString(),
            filename: req.file.filename,
            originalName: req.file.originalname,
            name: req.file.originalname,
            size: req.file.size,
            type: 'video',
            createdAt: new Date().toISOString()
        };

        res.json({
            success: true,
            file: fileInfo,
            message: '文件上传成功'
        });
    } catch (error) {
        console.error('❌ 文件上传失败:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取文件列表
app.get('/api/files', (req, res) => {
    try {
        const { type = 'video' } = req.query;

        // 🔍 根据查询参数确定目录
        const typeMap = {
            'video': './uploads/videos',
            'audio': './uploads/audios',
            'image': './uploads/images'
        };

        const uploadDir = typeMap[type] || './uploads/videos';

        // 🔧 修复：检查目录是否存在
        if (!fs.existsSync(uploadDir)) {
            console.log(`📁 目录不存在，创建: ${uploadDir}`);
            fs.mkdirSync(uploadDir, { recursive: true });
            return res.json({ success: true, files: [] });
        }

        // 🔧 修复：完整的文件处理逻辑
        const files = fs.readdirSync(uploadDir)
            .filter(filename => {
                const ext = path.extname(filename).toLowerCase();
                if (type === 'video') {
                    return ['.mp4', '.avi', '.mov', '.wmv', '.webm'].includes(ext);
                } else if (type === 'audio') {
                    return ['.mp3', '.wav', '.m4a', '.aac'].includes(ext);
                } else if (type === 'image') {
                    return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
                }
                return false;
            })
            .map(filename => {
                // 🔧 修复：构建完整的文件信息
                const filepath = path.join(uploadDir, filename);
                const stats = fs.statSync(filepath);
                return {
                    id: filename,
                    filename: filename,
                    name: filename,
                    size: stats.size,
                    type: type,
                    createdAt: stats.birthtime.toISOString()
                };
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        console.log(`📁 扫描 ${uploadDir}: 找到 ${files.length} 个${type}文件`);

        // 🔧 修复：返回响应
        res.json({
            success: true,
            files: files,
            directory: uploadDir,
            count: files.length
        });

    } catch (error) {
        // 🔧 修复：错误处理
        console.error('❌ 获取文件列表失败:', error.message);
        console.error('❌ 错误详情:', error);

        res.status(500).json({
            success: false,
            error: error.message,
            files: [],
            directory: req.query.type ? typeMap[req.query.type] : './uploads/videos'
        });
    }
});

// 内容适配预览
app.post('/api/platforms/adapt-multi', async (req, res) => {
    try {
        const { platforms, content } = req.body;

        if (!platforms || !Array.isArray(platforms)) {
            return res.status(400).json({
                success: false,
                error: '平台列表参数无效'
            });
        }

        const pub = initializePublisher();
        const results = platforms.map(platformId => {
            try {
                const adaptedContent = pub.multiPlatformEngine.adaptContentToPlatform(platformId, content);
                const validation = pub.multiPlatformEngine.validatePlatformConfig(platformId, adaptedContent);
                return { platformId, adaptedContent, validation };
            } catch (error) {
                return { platformId, error: error.message };
            }
        });

        res.json({ success: true, results });
    } catch (error) {
        console.error('❌ 内容适配失败:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 🔧 并发多平台发布
app.post('/api/workflow/multi-execute-concurrent', async (req, res) => {
    console.log('📦 收到并发多平台发布请求');

    try {
        const {
            workflowType = 'video',
            videoFile,
            platforms = [],
            content = {},
            browserMapping = {},
            template = {}
        } = req.body;

        // 参数验证
        if (!videoFile) {
            return res.status(400).json({
                success: false,
                error: '视频文件参数必填'
            });
        }

        if (platforms.length === 0) {
            return res.status(400).json({
                success: false,
                error: '至少选择一个发布平台'
            });
        }
        // 🔧 修复：根据工作流类型构建完整文件路径
        let fullVideoPath;
        if (videoFile) {
            const typeDir = workflowType === 'video' ? 'videos' :
                workflowType === 'audio' ? 'audios' :
                    workflowType === 'image' ? 'images' : 'videos';

            fullVideoPath = path.join(__dirname, 'uploads', typeDir, videoFile);

            console.log(`📁 构建文件路径: ${videoFile} → ${fullVideoPath}`);

            // 🔧 验证文件是否存在
            if (!fs.existsSync(fullVideoPath)) {
                console.error(`❌ 文件不存在: ${fullVideoPath}`);
                return res.status(400).json({
                    success: false,
                    error: `文件不存在: ${fullVideoPath}`,
                    requestedFile: videoFile,
                    expectedPath: fullVideoPath
                });
            }

            console.log(`✅ 文件验证通过: ${fullVideoPath}`);
        }
        // 构建账号列表
        const accounts = platforms.map(platformId => {
            const browserId = browserMapping[platformId];
            if (!browserId) {
                throw new Error(`平台 ${platformId} 未配置浏览器实例`);
            }
            return {
                id: browserId,
                name: `${platformId}_account`,
                platform: platformId
            };
        });

        const publishContent = {
            ...content,
            videoFile: fullVideoPath  // 使用完整路径而不是文件名
        };

        console.log(`🚀 开始并发多平台发布: ${platforms.join(', ')}`);
        console.log(`📄 发布内容:`, {
            ...publishContent,
            videoFile: `${fullVideoPath} (${fs.existsSync(fullVideoPath) ? '存在' : '不存在'})`
        });

        const pub = initializePublisher();
        const result = await pub.publishMultiPlatformConcurrent(
            platforms,
            workflowType,
            publishContent,  // 包含完整路径的内容
            template,
            accounts
        );

        const response = {
            success: result.success,
            message: `并发发布完成: ${result.totalSuccessCount}/${result.totalPlatforms} 个平台成功`,
            results: result.results,
            statistics: {
                totalPlatforms: result.totalPlatforms,
                successCount: result.totalSuccessCount,
                failureCount: result.totalFailureCount
            },
            // 🔧 新增：调试信息
            debug: {
                originalVideoFile: videoFile,
                resolvedVideoPath: fullVideoPath,
                fileExists: fs.existsSync(fullVideoPath),
                workflowType: workflowType
            }
        };

        res.json(response);
    } catch (error) {
        console.error('❌ 并发多平台发布失败:', error.message);
        res.status(500).json({
            success: false,
            error: error.message,
            results: []
        });
    }
});

// 兼容的多平台发布接口
app.post('/api/workflow/multi-execute', async (req, res) => {
    // 直接调用并发版本
    return app._router.handle(Object.assign(req, { url: '/api/workflow/multi-execute-concurrent' }), res);
});


// 在现有的API路由之后，app.listen之前添加以下路由：

// ==================== 视频下载API ====================

// 抖音视频下载接口
app.post('/api/download/douyin', async (req, res) => {
    console.log('📥 收到抖音视频下载请求');

    try {
        const { url, outputDir } = req.body;

        // 参数验证
        if (!url) {
            return res.status(400).json({
                success: false,
                error: '抖音视频URL必填',
                code: 'MISSING_URL'
            });
        }

        // URL格式简单验证
        if (!url.includes('douyin.com')) {
            return res.status(400).json({
                success: false,
                error: '不是有效的抖音视频URL',
                code: 'INVALID_URL',
                expectedFormats: [
                    'https://www.douyin.com/video/xxxxxxxxx',
                    'https://v.douyin.com/xxxxxxxx'
                ]
            });
        }

        console.log(`🎯 开始下载抖音视频: ${url}`);

        // 创建ChromeController和下载器
        const chromeController = new ChromeController({
            electronApiUrl: 'http://localhost:9528',
            timeout: 30000
        });

        const downloader = new DouyinDownloader(chromeController);

        // 执行下载
        const result = await downloader.downloadVideo(
            url,
            outputDir || '/oper/work/endian/rpa-platform/downloads/douyin/'
        );

        console.log(`✅ 抖音视频下载成功: ${result.fileName}`);

        res.json({
            success: true,
            message: '抖音视频下载成功',
            result: {
                fileName: result.fileName,
                filePath: result.filePath,
                fileSize: result.fileSize,
                fileSizeFormatted: formatFileSize(result.fileSize),
                originalUrl: result.originalUrl,
                videoUrl: result.videoUrl.substring(0, 100) + '...', // 截断显示
                downloadedAt: new Date().toISOString()
            },
            timing: {
                completedAt: Date.now()
            }
        });

    } catch (error) {
        console.error('❌ 抖音下载API失败:', error.message);

        // 错误分类
        let errorCode = 'DOWNLOAD_FAILED';
        let statusCode = 500;

        if (error.message.includes('会话创建失败')) {
            errorCode = 'BROWSER_SESSION_FAILED';
            statusCode = 503;
        } else if (error.message.includes('页面导航失败')) {
            errorCode = 'PAGE_NAVIGATION_FAILED';
            statusCode = 502;
        } else if (error.message.includes('视频URL提取失败')) {
            errorCode = 'VIDEO_URL_EXTRACTION_FAILED';
            statusCode = 404;
        } else if (error.message.includes('视频下载失败')) {
            errorCode = 'VIDEO_DOWNLOAD_FAILED';
            statusCode = 502;
        }

        res.status(statusCode).json({
            success: false,
            error: error.message,
            code: errorCode,
            timestamp: new Date().toISOString()
        });
    }
});

// 获取下载文件列表
app.get('/api/download/douyin/files', async (req, res) => {
    try {
        const downloadDir = '/opt/work/endian/rpa-platform/downloads/douyin/';

        // 检查目录是否存在
        if (!fs.existsSync(downloadDir)) {
            return res.json({
                success: true,
                files: [],
                total: 0,
                directory: downloadDir,
                message: '下载目录不存在'
            });
        }

        // 读取文件列表
        const files = fs.readdirSync(downloadDir)
            .filter(filename => {
                const ext = path.extname(filename).toLowerCase();
                return ['.mp4', '.avi', '.mov', '.wmv', '.webm'].includes(ext);
            })
            .map(filename => {
                const filepath = path.join(downloadDir, filename);
                const stats = fs.statSync(filepath);
                return {
                    filename: filename,
                    size: stats.size,
                    sizeFormatted: formatFileSize(stats.size),
                    createdAt: stats.birthtime.toISOString(),
                    modifiedAt: stats.mtime.toISOString(),
                    isVideo: true
                };
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // 按创建时间倒序

        console.log(`📁 扫描下载目录: 找到 ${files.length} 个视频文件`);

        res.json({
            success: true,
            files: files,
            total: files.length,
            directory: downloadDir,
            totalSize: files.reduce((sum, file) => sum + file.size, 0),
            totalSizeFormatted: formatFileSize(files.reduce((sum, file) => sum + file.size, 0))
        });

    } catch (error) {
        console.error('❌ 获取下载文件列表失败:', error.message);
        res.status(500).json({
            success: false,
            error: error.message,
            files: []
        });
    }
});

// 获取下载服务状态
app.get('/api/download/status', async (req, res) => {
    try {
        // 检查浏览器服务状态
        let browserStatus = 'unknown';
        try {
            const response = await fetch('http://localhost:9528/api/health');
            if (response.ok) {
                browserStatus = 'running';
            }
        } catch (error) {
            browserStatus = 'offline';
        }

        // 检查下载目录
        const downloadDir = '/opt/work/endian/rpa-platform/downloads/douyin/';
        const directoryExists = fs.existsSync(downloadDir);
        let directorySize = 0;
        let fileCount = 0;

        if (directoryExists) {
            try {
                const files = fs.readdirSync(downloadDir);
                fileCount = files.length;
                directorySize = files.reduce((total, filename) => {
                    const filePath = path.join(downloadDir, filename);
                    try {
                        return total + fs.statSync(filePath).size;
                    } catch (error) {
                        return total;
                    }
                }, 0);
            } catch (error) {
                console.warn('获取目录信息失败:', error.message);
            }
        }

        res.json({
            success: true,
            status: {
                service: 'running',
                browser: browserStatus,
                directory: {
                    path: downloadDir,
                    exists: directoryExists,
                    fileCount: fileCount,
                    totalSize: directorySize,
                    totalSizeFormatted: formatFileSize(directorySize)
                }
            },
            features: {
                supportedPlatforms: ['douyin'],
                supportedFormats: ['mp4'],
                maxFileSize: '500MB',
                concurrent: false
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 错误处理
app.use((error, req, res, next) => {
    console.error('API错误:', error);
    res.status(500).json({
        success: false,
        error: error.message || '服务器内部错误'
    });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'API路由不存在'
    });
});

// 启动服务器
app.listen(port, () => {
    console.log(`🚀 RPA Platform API 启动在端口 ${port}`);
    console.log(`📊 功能: 并发多平台发布, 文件管理, 平台配置`);

    // 延迟初始化
    setTimeout(() => {
        try {
            initializePublisher();
        } catch (error) {
            console.error('❌ 发布器初始化失败:', error.message);
        }
    }, 1000);
});
// ==================== 工具函数 ====================
// 在文件末尾添加工具函数：

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
export default app;