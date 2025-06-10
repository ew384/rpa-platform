// server.js - RPA Platform 后端服务器 (完整版)
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const fetch = require('node-fetch'); // 确保已安装: npm install node-fetch@2

const app = express();
const PORT = process.env.PORT || 3001;

// Electron HTTP API 配置
const ELECTRON_API_PORT = 9528; // 与 Electron 中的端口保持一致
const ELECTRON_API_BASE = `http://localhost:${ELECTRON_API_PORT}`;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 创建必要的目录
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const TEMP_DIR = path.join(__dirname, 'temp');
const LOGS_DIR = path.join(__dirname, 'logs');

[UPLOAD_DIR, TEMP_DIR, LOGS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// 配置文件上传
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = UPLOAD_DIR;

        // 根据文件类型分类存储
        if (file.mimetype.startsWith('video/')) {
            uploadPath = path.join(UPLOAD_DIR, 'videos');
        } else if (file.mimetype.startsWith('image/')) {
            uploadPath = path.join(UPLOAD_DIR, 'images');
        } else if (file.mimetype.startsWith('audio/')) {
            uploadPath = path.join(UPLOAD_DIR, 'audio');
        }

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // 生成唯一文件名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB 限制
    },
    fileFilter: (req, file, cb) => {
        // 文件类型验证
        const allowedTypes = /video|image|audio/;
        const mimeType = allowedTypes.test(file.mimetype);

        if (mimeType) {
            cb(null, true);
        } else {
            cb(new Error('不支持的文件类型'), false);
        }
    }
});

// 存储活跃的工作流执行
const activeWorkflows = new Map();

// ============ Electron API 集成函数 ============

// 检查 Electron HTTP API 是否可用
async function checkElectronApiAvailability() {
    try {
        const response = await fetch(`${ELECTRON_API_BASE}/api/health`, {
            method: 'GET',
            timeout: 3000
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

// 从 Electron HTTP API 获取浏览器实例
async function getBrowserInstancesFromElectron() {
    try {
        console.log('[BrowserAPI] 🔗 Calling Electron HTTP API...');

        const response = await fetch(`${ELECTRON_API_BASE}/api/browsers`, {
            method: 'GET',
            timeout: 5000
        });

        if (!response.ok) {
            throw new Error(`Electron API responded with ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Electron API returned unsuccessful response');
        }

        console.log(`[BrowserAPI] ✅ Successfully got ${result.browsers.length} browsers from Electron`);
        return result.browsers;
    } catch (error) {
        console.error('[BrowserAPI] ❌ Failed to get browsers from Electron HTTP API:', error.message);
        throw error;
    }
}

// 获取特定浏览器的详细信息
async function getBrowserDetailsFromElectron(browserId) {
    try {
        const response = await fetch(`${ELECTRON_API_BASE}/api/browser/${browserId}`, {
            method: 'GET',
            timeout: 3000
        });

        if (!response.ok) {
            throw new Error(`Failed to get browser details: ${response.status}`);
        }

        const result = await response.json();
        return result.success ? result.browser : null;
    } catch (error) {
        console.error(`[BrowserAPI] Failed to get browser details for ${browserId}:`, error.message);
        return null;
    }
}

// 获取浏览器标签页信息
async function getBrowserTabsFromElectron(browserId) {
    try {
        const response = await fetch(`${ELECTRON_API_BASE}/api/browser/${browserId}/tabs`, {
            method: 'GET',
            timeout: 3000
        });

        if (!response.ok) {
            throw new Error(`Failed to get browser tabs: ${response.status}`);
        }

        const result = await response.json();
        return result.success ? result.tabs : [];
    } catch (error) {
        console.error(`[BrowserAPI] Failed to get browser tabs for ${browserId}:`, error.message);
        return [];
    }
}

// ============ API 路由 ============

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'RPA Platform Backend'
    });
});

// 获取可用的工作流类型
app.get('/api/workflows', (req, res) => {
    res.json({
        success: true,
        workflows: [
            {
                type: 'video',
                name: '视频发布',
                description: '上传视频到微信视频号',
                supportedFormats: ['mp4', 'avi', 'mov']
            },
            {
                type: 'article',
                name: '图文发布',
                description: '发布图文内容',
                supportedFormats: ['jpg', 'png', 'jpeg']
            },
            {
                type: 'music',
                name: '音乐发布',
                description: '上传音乐内容',
                supportedFormats: ['mp3', 'wav', 'm4a']
            },
            {
                type: 'audio',
                name: '音频发布',
                description: '上传音频内容',
                supportedFormats: ['mp3', 'wav', 'ogg']
            }
        ]
    });
});

// 文件上传接口
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: '没有上传文件'
            });
        }

        console.log('[Upload] 文件上传成功:', req.file.filename);

        res.json({
            success: true,
            file: {
                id: req.file.filename,
                originalName: req.file.originalname,
                filename: req.file.filename,
                path: req.file.path,
                size: req.file.size,
                mimetype: req.file.mimetype,
                uploadTime: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('[Upload] 文件上传失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取上传的文件列表
app.get('/api/files', (req, res) => {
    try {
        const files = [];
        const scanDir = (dir, type) => {
            if (fs.existsSync(dir)) {
                const items = fs.readdirSync(dir);
                items.forEach(item => {
                    const filePath = path.join(dir, item);
                    const stats = fs.statSync(filePath);
                    if (stats.isFile()) {
                        files.push({
                            id: item,
                            name: item,
                            type,
                            size: stats.size,
                            path: filePath,
                            createdAt: stats.birthtime
                        });
                    }
                });
            }
        };

        scanDir(path.join(UPLOAD_DIR, 'videos'), 'video');
        scanDir(path.join(UPLOAD_DIR, 'images'), 'image');
        scanDir(path.join(UPLOAD_DIR, 'audio'), 'audio');

        res.json({
            success: true,
            files: files.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============ 浏览器实例相关API (通过Electron HTTP API) ============

// 获取可用的浏览器实例
app.get('/api/browsers', async (req, res) => {
    try {
        console.log('[BrowserAPI] 🔍 Fetching browser instances...');

        // 检查 Electron API 可用性
        const isElectronAvailable = await checkElectronApiAvailability();

        if (!isElectronAvailable) {
            return res.json({
                success: true,
                browsers: [],
                message: 'Electron HTTP API not available. Please ensure Electron app is running.',
                timestamp: new Date().toISOString(),
                source: 'electron-unavailable'
            });
        }

        // 从 Electron 获取浏览器实例
        const browsers = await getBrowserInstancesFromElectron();

        const runningCount = browsers.filter(b => b.status === 'running').length;

        console.log(`[BrowserAPI] ✅ Found ${browsers.length} browser instances (${runningCount} running)`);

        res.json({
            success: true,
            browsers,
            statistics: {
                total: browsers.length,
                running: runningCount,
                stopped: browsers.length - runningCount
            },
            timestamp: new Date().toISOString(),
            source: 'electron-http-api'
        });

    } catch (error) {
        console.error('[BrowserAPI] ❌ Failed to get browser instances:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            browsers: [],
            timestamp: new Date().toISOString()
        });
    }
});

// 获取特定浏览器实例详情
app.get('/api/browsers/:browserId', async (req, res) => {
    try {
        const { browserId } = req.params;

        const isElectronAvailable = await checkElectronApiAvailability();
        if (!isElectronAvailable) {
            return res.status(503).json({
                success: false,
                error: 'Electron API not available'
            });
        }

        const browser = await getBrowserDetailsFromElectron(browserId);

        if (!browser) {
            return res.status(404).json({
                success: false,
                error: 'Browser instance not found'
            });
        }

        res.json({
            success: true,
            browser
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取浏览器实例的标签页
app.get('/api/browsers/:browserId/tabs', async (req, res) => {
    try {
        const { browserId } = req.params;

        const isElectronAvailable = await checkElectronApiAvailability();
        if (!isElectronAvailable) {
            return res.status(503).json({
                success: false,
                error: 'Electron API not available'
            });
        }

        const tabs = await getBrowserTabsFromElectron(browserId);

        res.json({
            success: true,
            browserId,
            tabs
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 刷新浏览器实例状态
app.post('/api/browsers/refresh', async (req, res) => {
    try {
        console.log('[BrowserAPI] 🔄 Refreshing browser instances...');

        const isElectronAvailable = await checkElectronApiAvailability();
        if (!isElectronAvailable) {
            return res.status(503).json({
                success: false,
                error: 'Electron API not available'
            });
        }

        // 调用 Electron API 的刷新接口
        const response = await fetch(`${ELECTRON_API_BASE}/api/browsers/refresh`, {
            method: 'POST',
            timeout: 5000
        });

        if (!response.ok) {
            throw new Error(`Electron refresh API failed: ${response.status}`);
        }

        const result = await response.json();

        res.json({
            success: true,
            message: 'Browser instances refreshed via Electron API',
            electronResponse: result,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 检查 Electron API 状态的接口
app.get('/api/electron/status', async (req, res) => {
    try {
        const isAvailable = await checkElectronApiAvailability();

        if (isAvailable) {
            const response = await fetch(`${ELECTRON_API_BASE}/api/health`);
            const healthData = await response.json();

            res.json({
                success: true,
                available: true,
                electronApi: healthData,
                endpoint: ELECTRON_API_BASE
            });
        } else {
            res.json({
                success: true,
                available: false,
                message: 'Electron HTTP API is not responding',
                endpoint: ELECTRON_API_BASE
            });
        }
    } catch (error) {
        res.json({
            success: false,
            available: false,
            error: error.message,
            endpoint: ELECTRON_API_BASE
        });
    }
});

// ============ 工作流执行相关API ============

// 执行工作流
app.post('/api/workflow/execute', async (req, res) => {
    try {
        const { workflowType, content, template, account, debugPort = 9711 } = req.body;

        console.log('[Workflow] 开始执行工作流:', {
            type: workflowType,
            debugPort,
            account: account?.id || 'default'
        });

        // 验证必需参数
        if (!workflowType || !content) {
            return res.status(400).json({
                success: false,
                error: '缺少必需参数: workflowType 或 content'
            });
        }

        // 生成执行ID
        const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // 创建临时配置文件
        const tempConfig = await createTempConfigFiles(executionId, {
            workflowType,
            content,
            template: template || getDefaultTemplate(workflowType),
            account: account || { id: 'default', name: '默认账号' }
        });

        // 启动自动化进程
        const automationResult = await executeAutomationWorkflow({
            executionId,
            workflowType,
            debugPort,
            tempConfig
        });

        // 清理临时文件
        cleanupTempFiles(tempConfig);

        console.log('[Workflow] 工作流执行完成:', executionId);

        res.json({
            success: true,
            executionId,
            result: automationResult
        });

    } catch (error) {
        console.error('[Workflow] 执行失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取工作流执行状态
app.get('/api/workflow/status/:executionId', (req, res) => {
    const { executionId } = req.params;
    const workflow = activeWorkflows.get(executionId);

    if (!workflow) {
        return res.status(404).json({
            success: false,
            error: '工作流不存在'
        });
    }

    res.json({
        success: true,
        status: workflow
    });
});
// ============ 使用说明 ============
/*
前端组件现在会通过以下API获取平台配置：

1. GET /api/platforms - 获取所有平台配置
2. POST /api/platforms/validate - 验证单个平台内容
3. POST /api/platforms/adapt - 适配内容到单个平台
4. POST /api/platforms/adapt-multi - 批量适配内容到多个平台
5. POST /api/workflow/multi-execute - 执行多平台发布工作流
*/
// 在 server.js 中修复平台配置接口
// 替换现有的 app.get('/api/platforms') 路由

app.get('/api/platforms', (req, res) => {
    try {
        console.log('[PlatformAPI] 收到平台配置请求');

        // 直接在这里定义平台配置，避免动态导入问题
        const PLATFORM_CONFIGS = {
            wechat: {
                id: 'wechat',
                name: '微信视频号',
                icon: '🎬',
                color: 'bg-green-500',
                status: 'stable',
                fields: {
                    title: { required: false, maxLength: 16, minLength: 6 },
                    description: { required: true, maxLength: 500 }
                },
                features: {
                    useIframe: true,
                    needShortTitle: true,
                    supportLocation: true
                },
                urls: {
                    upload: 'https://channels.weixin.qq.com/platform/post/create'
                }
            },
            douyin: {
                id: 'douyin',
                name: '抖音',
                icon: '🎵',
                color: 'bg-black',
                status: 'testing',
                fields: {
                    title: { required: true, maxLength: 55 },
                    description: { required: true, maxLength: 2200 }
                },
                features: {
                    needClickUpload: true,
                    supportHashtags: true
                },
                urls: {
                    upload: 'https://creator.douyin.com/creator-micro/content/upload'
                }
            },
            xiaohongshu: {
                id: 'xiaohongshu',
                name: '小红书',
                icon: '📝',
                color: 'bg-red-500',
                status: 'testing',
                fields: {
                    title: { required: true, maxLength: 20 },
                    description: { required: true, maxLength: 1000 }
                },
                features: {
                    supportEmoji: true,
                    supportMultiImage: true
                },
                urls: {
                    upload: 'https://creator.xiaohongshu.com/publish/publish?source=official'
                }
            },
            kuaishou: {
                id: 'kuaishou',
                name: '快手',
                icon: '⚡',
                color: 'bg-orange-500',
                status: 'testing',
                fields: {
                    title: { required: false },
                    description: { required: true, maxLength: 300 }
                },
                features: {
                    noTitle: true
                },
                urls: {
                    upload: 'https://cp.kuaishou.com/article/publish/video'
                }
            }
        };

        // 转换为数组格式
        const platforms = Object.values(PLATFORM_CONFIGS).filter(p => p.status !== 'planned');

        console.log(`[PlatformAPI] ✅ 返回 ${platforms.length} 个平台配置`);

        res.json({
            success: true,
            platforms: platforms,
            configs: PLATFORM_CONFIGS,
            timestamp: new Date().toISOString(),
            source: 'server-embedded'
        });

    } catch (error) {
        console.error('[PlatformAPI] ❌ 平台配置接口错误:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// 验证平台内容 - 修复版本
app.post('/api/platforms/validate', async (req, res) => {
    try {
        const { platformId, content } = req.body;
        console.log(`[PlatformAPI] 验证平台内容: ${platformId}`);

        // 使用内嵌的验证逻辑
        const validation = validatePlatformContent(platformId, content);

        res.json({
            success: true,
            validation,
            platformId
        });

    } catch (error) {
        console.error('[PlatformAPI] 验证失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 适配内容到平台 - 修复版本
app.post('/api/platforms/adapt', async (req, res) => {
    try {
        const { platformId, content } = req.body;
        console.log(`[PlatformAPI] 适配内容到平台: ${platformId}`);

        const adaptedContent = adaptContentToPlatform(platformId, content);

        res.json({
            success: true,
            adaptedContent,
            platformId
        });

    } catch (error) {
        console.error('[PlatformAPI] 适配失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 批量适配内容到多个平台 - 修复版本
app.post('/api/platforms/adapt-multi', async (req, res) => {
    try {
        const { platforms, content } = req.body;
        console.log(`[PlatformAPI] 批量适配到 ${platforms.length} 个平台`);

        const results = platforms.map(platformId => {
            try {
                const adaptedContent = adaptContentToPlatform(platformId, content);
                const validation = validatePlatformContent(platformId, adaptedContent);

                return {
                    platformId,
                    adaptedContent,
                    validation,
                    warnings: []
                };
            } catch (error) {
                return {
                    platformId,
                    error: error.message,
                    validation: { valid: false, errors: [error.message] }
                };
            }
        });

        res.json({
            success: true,
            results,
            platforms
        });

    } catch (error) {
        console.error('[PlatformAPI] 批量适配失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============ 辅助函数 ============

function validatePlatformContent(platformId, content) {
    const platformConfigs = {
        wechat: {
            name: '微信视频号',
            fields: {
                title: { required: false, maxLength: 16, minLength: 6 },
                description: { required: true, maxLength: 500 }
            }
        },
        douyin: {
            name: '抖音',
            fields: {
                title: { required: true, maxLength: 55 },
                description: { required: true, maxLength: 2200 }
            }
        },
        xiaohongshu: {
            name: '小红书',
            fields: {
                title: { required: true, maxLength: 20 },
                description: { required: true, maxLength: 1000 }
            }
        },
        kuaishou: {
            name: '快手',
            fields: {
                title: { required: false },
                description: { required: true, maxLength: 300 }
            }
        }
    };

    const config = platformConfigs[platformId];
    if (!config) {
        return { valid: false, errors: [`不支持的平台: ${platformId}`] };
    }

    const errors = [];

    // 验证标题
    if (config.fields.title?.required && !content.title?.trim()) {
        errors.push(`${config.name}需要标题`);
    }

    if (content.title && config.fields.title?.maxLength && content.title.length > config.fields.title.maxLength) {
        errors.push(`${config.name}标题超出限制(${config.fields.title.maxLength}字符)`);
    }

    if (content.title && config.fields.title?.minLength && content.title.length < config.fields.title.minLength) {
        errors.push(`${config.name}标题至少需要${config.fields.title.minLength}字符`);
    }

    // 验证描述
    if (config.fields.description?.required && !content.description?.trim()) {
        errors.push(`${config.name}需要描述`);
    }

    if (content.description && config.fields.description?.maxLength && content.description.length > config.fields.description.maxLength) {
        errors.push(`${config.name}描述超出限制(${config.fields.description.maxLength}字符)`);
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
}

function adaptContentToPlatform(platformId, content) {
    const platformConfigs = {
        wechat: { fields: { title: { maxLength: 16 }, description: { maxLength: 500 } } },
        douyin: { fields: { title: { maxLength: 55 }, description: { maxLength: 2200 } } },
        xiaohongshu: { fields: { title: { maxLength: 20 }, description: { maxLength: 1000 } } },
        kuaishou: { fields: { description: { maxLength: 300 } }, features: { noTitle: true } }
    };

    const config = platformConfigs[platformId];
    if (!config) return content;

    const adapted = { ...content };

    // 特殊处理：快手不需要标题
    if (config.features?.noTitle) {
        adapted.title = '';
    }

    // 适配标题
    if (adapted.title && config.fields.title?.maxLength) {
        if (adapted.title.length > config.fields.title.maxLength) {
            adapted.title = adapted.title.substring(0, config.fields.title.maxLength - 3) + '...';
        }
    }

    // 适配描述
    if (adapted.description && config.fields.description?.maxLength) {
        if (adapted.description.length > config.fields.description.maxLength) {
            const truncated = adapted.description.substring(0, config.fields.description.maxLength - 3);
            const lastSentence = truncated.lastIndexOf('。');

            if (lastSentence > config.fields.description.maxLength * 0.7) {
                adapted.description = adapted.description.substring(0, lastSentence + 1);
            } else {
                adapted.description = truncated + '...';
            }
        }
    }

    return adapted;
}

// ============ 工具函数 ============

// 创建临时配置文件
async function createTempConfigFiles(executionId, config) {
    const tempDir = path.join(TEMP_DIR, executionId);
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const files = {
        contentFile: path.join(tempDir, 'content.json'),
        templateFile: path.join(tempDir, 'template.json'),
        accountFile: path.join(tempDir, 'account.json')
    };

    // 处理文件路径
    if (config.content.videoFile && !path.isAbsolute(config.content.videoFile)) {
        const videoPath = path.join(UPLOAD_DIR, 'videos', config.content.videoFile);
        if (fs.existsSync(videoPath)) {
            config.content.videoFile = videoPath;
        }
    }

    fs.writeFileSync(files.contentFile, JSON.stringify(config.content, null, 2));
    fs.writeFileSync(files.templateFile, JSON.stringify(config.template, null, 2));
    fs.writeFileSync(files.accountFile, JSON.stringify(config.account, null, 2));

    return files;
}

// 执行自动化工作流
function executeAutomationWorkflow({ executionId, workflowType, debugPort, tempConfig }) {
    return new Promise((resolve, reject) => {
        // 🔧 修复：使用正确的 automation 路径
        // 从当前 rpa-platform 目录找到 electron_browser/automation
        const automationPath = path.join(__dirname, '../electron_browser/automation');
        const cliPath = path.join(automationPath, 'cli/automation-cli.js');

        console.log('[Automation] 查找路径:', {
            currentDir: __dirname,
            automationPath: automationPath,
            cliPath: cliPath
        });

        let finalCliPath = cliPath;
        let finalAutomationPath = automationPath;

        // 检查文件是否存在
        if (!fs.existsSync(cliPath)) {
            // 🔧 尝试其他可能的路径
            const alternativePaths = [
                path.join(__dirname, '../automation/cli/automation-cli.js'),
                path.join(__dirname, '../../automation/cli/automation-cli.js'),
                path.join(__dirname, '../electron_browser/automation/cli/automation-cli.js'),
                path.join(process.cwd(), '../automation/cli/automation-cli.js'),
                path.join(process.cwd(), '../electron_browser/automation/cli/automation-cli.js')
            ];

            console.log('[Automation] CLI文件不存在，尝试其他路径:');
            let foundPath = null;

            for (const altPath of alternativePaths) {
                console.log('[Automation] 检查:', altPath);
                if (fs.existsSync(altPath)) {
                    foundPath = altPath;
                    console.log('[Automation] ✅ 找到CLI文件:', foundPath);
                    break;
                }
            }

            if (!foundPath) {
                const error = `Automation CLI 不存在，已检查路径:\n${[cliPath, ...alternativePaths].join('\n')}`;
                console.error('[Automation]', error);
                reject(new Error(error));
                return;
            }

            // 更新找到的路径
            finalCliPath = foundPath;
            finalAutomationPath = path.dirname(path.dirname(foundPath));
        } else {
            console.log('[Automation] ✅ 找到CLI文件:', cliPath);
        }

        const args = [
            'publish',
            '-t', workflowType,
            '-c', tempConfig.contentFile,
            '-a', tempConfig.accountFile,
            '-p', tempConfig.templateFile,
            '--debug-port', debugPort.toString()
        ];

        console.log('[Automation] 执行命令:', 'node', finalCliPath, ...args);
        console.log('[Automation] 工作目录:', finalAutomationPath);

        const process = spawn('node', [finalCliPath, ...args], {
            cwd: finalAutomationPath,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let errorOutput = '';

        // 记录工作流状态
        activeWorkflows.set(executionId, {
            id: executionId,
            status: 'running',
            startTime: new Date().toISOString(),
            workflowType,
            debugPort,
            progress: 0
        });

        process.stdout.on('data', (data) => {
            const text = data.toString();
            output += text;
            console.log(`[Automation-${executionId}]`, text);

            // 更新进度（简单的文本匹配）
            let progress = 0;
            if (text.includes('文件上传成功')) progress = 30;
            else if (text.includes('填写')) progress = 60;
            else if (text.includes('发布')) progress = 90;

            if (progress > 0) {
                const workflow = activeWorkflows.get(executionId);
                if (workflow) {
                    workflow.progress = progress;
                    activeWorkflows.set(executionId, workflow);
                }
            }
        });

        process.stderr.on('data', (data) => {
            const text = data.toString();
            errorOutput += text;
            console.error(`[Automation-Error-${executionId}]`, text);
        });

        process.on('close', (code) => {
            const workflow = activeWorkflows.get(executionId);

            if (code === 0) {
                console.log(`[Automation] 工作流 ${executionId} 执行成功`);

                if (workflow) {
                    workflow.status = 'completed';
                    workflow.progress = 100;
                    workflow.endTime = new Date().toISOString();
                    activeWorkflows.set(executionId, workflow);
                }

                resolve({
                    success: true,
                    executionId,
                    output,
                    workflowType,
                    exitCode: code
                });
            } else {
                console.error(`[Automation] 工作流 ${executionId} 执行失败，退出码: ${code}`);

                if (workflow) {
                    workflow.status = 'failed';
                    workflow.error = errorOutput;
                    workflow.endTime = new Date().toISOString();
                    activeWorkflows.set(executionId, workflow);
                }

                reject(new Error(`工作流执行失败，退出码: ${code}\n${errorOutput}`));
            }
        });

        process.on('error', (error) => {
            console.error(`[Automation] 进程启动失败:`, error);

            const workflow = activeWorkflows.get(executionId);
            if (workflow) {
                workflow.status = 'failed';
                workflow.error = error.message;
                workflow.endTime = new Date().toISOString();
                activeWorkflows.set(executionId, workflow);
            }

            reject(error);
        });
    });
}

// 清理临时文件
function cleanupTempFiles(tempConfig) {
    try {
        Object.values(tempConfig).forEach(filePath => {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        // 删除临时目录
        const tempDir = path.dirname(tempConfig.contentFile);
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true });
        }
    } catch (error) {
        console.warn('[Cleanup] 清理临时文件失败:', error.message);
    }
}

// 获取默认模板
function getDefaultTemplate(workflowType) {
    const templates = {
        video: {
            description: '{{description}} - 发布于{{date}} #{{account.name}}',
            location: '{{location}}'
        },
        article: {
            title: '{{title}} - {{account.name}}',
            content: '{{content}}\n\n发布时间: {{time}}'
        },
        music: {
            title: '{{title}} - 音乐分享',
            description: '{{description}} #音乐 #{{account.name}}'
        },
        audio: {
            title: '{{title}} - 音频内容',
            description: '{{description}} #音频 #{{account.name}}'
        }
    };

    return templates[workflowType] || templates.video;
}

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 RPA Platform 后端服务启动在端口 ${PORT}`);
    console.log(`📁 上传目录: ${UPLOAD_DIR}`);
    console.log(`📄 临时目录: ${TEMP_DIR}`);
    console.log(`📝 日志目录: ${LOGS_DIR}`);
    console.log(`🔗 Electron API 端点: ${ELECTRON_API_BASE}`);
});

// 优雅退出
process.on('SIGINT', () => {
    console.log('\n📤 正在关闭服务器...');
    process.exit(0);
});

module.exports = app;