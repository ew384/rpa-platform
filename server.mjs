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

export default app;