// server.js - RPA Platform 后端服务器
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3001;

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

// 执行工作流
app.post('/api/workflow/execute', async (req, res) => {
    try {
        const { workflowType, content, template, account, debugPort = 9225 } = req.body;

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

// 获取可用的浏览器实例（模拟）
app.get('/api/browsers', (req, res) => {
    // 这里模拟检测可用的浏览器实例
    // 实际项目中可以通过检测Chrome调试端口来获取
    const browsers = [
        {
            id: 'browser_9225',
            name: '浏览器实例 1',
            debugPort: 9225,
            status: 'running',
            url: 'about:blank'
        },
        {
            id: 'browser_9226',
            name: '浏览器实例 2',
            debugPort: 9226,
            status: 'idle',
            url: null
        }
    ];

    res.json({
        success: true,
        browsers
    });
});

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
        // 修正：使用正确的 automation 路径
        const automationPath = path.join(__dirname, '../electron_browser/automation');
        const cliPath = path.join(automationPath, 'cli/automation-cli.js');

        // 检查文件是否存在
        if (!fs.existsSync(cliPath)) {
            const error = `Automation CLI 不存在: ${cliPath}`;
            console.error('[Automation]', error);
            reject(new Error(error));
            return;
        }

        const args = [
            'publish',
            '-t', workflowType,
            '-c', tempConfig.contentFile,
            '-a', tempConfig.accountFile,
            '-p', tempConfig.templateFile,
            '--debug-port', debugPort.toString()
        ];

        console.log('[Automation] 执行命令:', 'node', cliPath, ...args);
        console.log('[Automation] 工作目录:', automationPath);

        const process = spawn('node', [cliPath, ...args], {
            cwd: automationPath,
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
});

// 优雅退出
process.on('SIGINT', () => {
    console.log('\n📤 正在关闭服务器...');
    process.exit(0);
});

module.exports = app;