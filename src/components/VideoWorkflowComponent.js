// VideoWorkflowComponent.js - 独立组件文件
import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Play, Monitor, CheckCircle, AlertCircle, Clock, RefreshCw, Video, Settings } from 'lucide-react';

const VideoWorkflowComponent = () => {
    // 状态管理
    const [formData, setFormData] = useState({
        selectedBrowser: '',
        videoFile: null,
        title: '',
        description: '',
        location: '',
        debugPort: 9225
    });

    const [systemState, setSystemState] = useState({
        availableBrowsers: [],
        uploadedFiles: [],
        executionStatus: 'idle', // idle, uploading, executing, completed, error
        executionResult: null,
        uploadProgress: 0,
        backendConnected: false
    });

    const [template, setTemplate] = useState({
        description: '{{description}} - 发布于{{date}} #{{account.name}}'
    });

    // API 基础URL
    const API_BASE = 'http://localhost:3001/api';

    // 初始化组件
    useEffect(() => {
        console.log('[VideoWorkflow] 组件初始化');
        initializeComponent();
    }, []);

    const initializeComponent = useCallback(async () => {
        try {
            console.log('[VideoWorkflow] 开始初始化...');

            // 检查后端连接
            const healthCheck = await checkBackendHealth();
            setSystemState(prev => ({ ...prev, backendConnected: healthCheck }));

            if (healthCheck) {
                // 加载数据
                await Promise.all([
                    loadAvailableBrowsers(),
                    loadUploadedFiles()
                ]);
            }
        } catch (error) {
            console.error('[VideoWorkflow] 初始化失败:', error);
            setSystemState(prev => ({ ...prev, backendConnected: false }));
        }
    }, []);

    const checkBackendHealth = async () => {
        try {
            const response = await fetch(`${API_BASE}/health`);
            const data = await response.json();
            console.log('[VideoWorkflow] 后端状态:', data.status);
            return data.status === 'ok';
        } catch (error) {
            console.error('[VideoWorkflow] 后端连接失败:', error);
            return false;
        }
    };

    const loadAvailableBrowsers = async () => {
        try {
            const response = await fetch(`${API_BASE}/browsers`);
            const data = await response.json();

            if (data.success) {
                setSystemState(prev => ({
                    ...prev,
                    availableBrowsers: data.browsers
                }));
                console.log('[VideoWorkflow] 浏览器列表加载成功:', data.browsers.length);
            }
        } catch (error) {
            console.error('[VideoWorkflow] 加载浏览器失败:', error);
        }
    };

    const loadUploadedFiles = async () => {
        try {
            const response = await fetch(`${API_BASE}/files`);
            const data = await response.json();

            if (data.success) {
                const videoFiles = data.files.filter(file => file.type === 'video');
                setSystemState(prev => ({
                    ...prev,
                    uploadedFiles: videoFiles
                }));
                console.log('[VideoWorkflow] 文件列表加载成功:', videoFiles.length);
            }
        } catch (error) {
            console.error('[VideoWorkflow] 加载文件失败:', error);
        }
    };

    // 处理表单数据变化
    const handleFormChange = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    // 文件上传处理
    const handleFileUpload = useCallback(async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('video/')) {
            alert('请选择视频文件');
            return;
        }

        if (file.size > 500 * 1024 * 1024) {
            alert('视频文件大小不能超过500MB');
            return;
        }

        try {
            setSystemState(prev => ({ ...prev, executionStatus: 'uploading', uploadProgress: 0 }));

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE}/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                handleFormChange('videoFile', data.file);
                setSystemState(prev => ({
                    ...prev,
                    executionStatus: 'idle',
                    uploadProgress: 100
                }));

                // 刷新文件列表
                await loadUploadedFiles();

                console.log('[VideoWorkflow] 文件上传成功:', data.file.filename);
            } else {
                throw new Error(data.error || '文件上传失败');
            }
        } catch (error) {
            console.error('[VideoWorkflow] 文件上传失败:', error);
            setSystemState(prev => ({ ...prev, executionStatus: 'error' }));
            alert('文件上传失败: ' + error.message);
        }
    }, []);

    // 选择已上传文件
    const selectUploadedFile = useCallback((file) => {
        handleFormChange('videoFile', file);
        console.log('[VideoWorkflow] 选择文件:', file.name);
    }, [handleFormChange]);

    // 执行工作流
    const executeWorkflow = useCallback(async () => {
        const { selectedBrowser, videoFile, description, title, location, debugPort } = formData;

        // 表单验证
        if (!selectedBrowser) {
            alert('请选择浏览器实例');
            return;
        }

        if (!videoFile) {
            alert('请上传或选择视频文件');
            return;
        }

        if (!description.trim()) {
            alert('请填写视频描述');
            return;
        }

        try {
            setSystemState(prev => ({
                ...prev,
                executionStatus: 'executing',
                executionResult: null
            }));

            const workflowData = {
                workflowType: 'video',
                content: {
                    videoFile: videoFile.filename || videoFile.name,
                    description: description.trim(),
                    location: location.trim(),
                    title: title.trim()
                },
                template: template,
                account: {
                    id: selectedBrowser,
                    name: selectedBrowser
                },
                debugPort: debugPort
            };

            console.log('[VideoWorkflow] 提交工作流:', workflowData);

            const response = await fetch(`${API_BASE}/workflow/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(workflowData)
            });

            const data = await response.json();

            if (data.success) {
                setSystemState(prev => ({
                    ...prev,
                    executionStatus: 'completed',
                    executionResult: data.result
                }));

                console.log('[VideoWorkflow] 工作流执行成功:', data);
            } else {
                throw new Error(data.error || '工作流执行失败');
            }
        } catch (error) {
            console.error('[VideoWorkflow] 工作流执行失败:', error);
            setSystemState(prev => ({
                ...prev,
                executionStatus: 'error',
                executionResult: { error: error.message }
            }));
        }
    }, [formData, template]);

    // 重置表单
    const resetForm = useCallback(() => {
        setFormData({
            selectedBrowser: '',
            videoFile: null,
            title: '',
            description: '',
            location: '',
            debugPort: 9225
        });

        setSystemState(prev => ({
            ...prev,
            executionStatus: 'idle',
            executionResult: null,
            uploadProgress: 0
        }));

        // 重置文件输入
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.value = '';
        }
    }, []);

    // 渲染工具函数
    const getStatusIcon = () => {
        switch (systemState.executionStatus) {
            case 'uploading':
                return <Upload className="w-5 h-5 text-blue-500 animate-pulse" />;
            case 'executing':
                return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            default:
                return null;
        }
    };

    const getStatusText = () => {
        switch (systemState.executionStatus) {
            case 'uploading':
                return `正在上传文件... ${systemState.uploadProgress}%`;
            case 'executing':
                return '正在执行工作流...';
            case 'completed':
                return '工作流执行完成';
            case 'error':
                return '执行失败';
            default:
                return '';
        }
    };

    const getStatusColor = () => {
        switch (systemState.executionStatus) {
            case 'uploading':
            case 'executing':
                return 'bg-blue-50 border-blue-200';
            case 'completed':
                return 'bg-green-50 border-green-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    // 生成预览内容
    const generatePreview = () => {
        return template.description
            .replace('{{description}}', formData.description || '视频描述')
            .replace('{{date}}', new Date().toLocaleDateString('zh-CN'))
            .replace('{{account.name}}', formData.selectedBrowser || '账号名称')
            .replace('{{location}}', formData.location || '');
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white">
            {/* 标题 */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    微信视频号发布工作流
                </h2>
                <p className="text-gray-600">
                    上传视频文件，配置发布内容，连接到浏览器实例，一键自动发布到微信视频号
                </p>
            </div>

            {/* 服务状态 */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Monitor className="w-5 h-5" />
                        <span className="font-medium">服务状态:</span>
                        <span className={systemState.backendConnected ? 'text-green-600' : 'text-red-600'}>
                            {systemState.backendConnected ? 'RPA Platform Backend 已连接' : '后端服务未连接'}
                        </span>
                    </div>
                    <button
                        onClick={initializeComponent}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>刷新</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 左侧：配置区域 */}
                <div className="space-y-6">
                    {/* 浏览器选择 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            浏览器实例 *
                        </label>
                        <div className="flex items-center space-x-2">
                            <select
                                value={formData.selectedBrowser}
                                onChange={(e) => handleFormChange('selectedBrowser', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">请选择浏览器实例</option>
                                {systemState.availableBrowsers.map(browser => (
                                    <option key={browser.id} value={browser.id}>
                                        {browser.name} (端口: {browser.debugPort}) - {browser.status}
                                    </option>
                                ))}
                            </select>
                            <div className="flex items-center space-x-1">
                                <Settings className="w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    value={formData.debugPort}
                                    onChange={(e) => handleFormChange('debugPort', parseInt(e.target.value))}
                                    placeholder="端口"
                                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 视频文件 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            视频文件 *
                        </label>

                        {/* 上传区域 */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors mb-4">
                            <div className="text-center">
                                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                <div className="mt-2">
                                    <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-block">
                                        <span>选择视频文件</span>
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    支持 MP4, AVI, MOV 等格式，最大 500MB
                                </p>
                            </div>
                        </div>

                        {/* 已上传文件列表 */}
                        {systemState.uploadedFiles.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">已上传的视频文件:</p>
                                <div className="max-h-32 overflow-y-auto space-y-2">
                                    {systemState.uploadedFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            onClick={() => selectUploadedFile(file)}
                                            className={`p-3 border rounded cursor-pointer transition-colors ${formData.videoFile?.id === file.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <Video className="w-4 h-4 text-blue-500" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                                {formData.videoFile?.id === file.id && (
                                                    <CheckCircle className="w-4 h-4 text-blue-500" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 当前选中文件 */}
                        {formData.videoFile && (
                            <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                                <p className="text-sm text-gray-700">
                                    <strong>当前选择:</strong> {formData.videoFile.originalName || formData.videoFile.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    大小: {((formData.videoFile.size || 0) / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        )}
                    </div>

                    {/* 内容配置 */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">内容配置</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                视频标题 (可选)
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleFormChange('title', e.target.value)}
                                placeholder="视频标题（留空将自动生成）"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                maxLength={50}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                视频描述 *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleFormChange('description', e.target.value)}
                                placeholder="描述视频内容，让观众了解视频的精彩之处..."
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                maxLength={500}
                            />
                            <div className="flex justify-between mt-1">
                                <p className="text-xs text-gray-500">
                                    详细描述有助于提高视频的曝光度
                                </p>
                                <p className="text-xs text-gray-400">
                                    {formData.description.length}/500
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                位置信息 (可选)
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => handleFormChange('location', e.target.value)}
                                placeholder="如：北京市"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* 模板配置 */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">模板配置</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                描述模板
                            </label>
                            <input
                                type="text"
                                value={template.description}
                                onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="mt-2 p-3 bg-gray-50 rounded text-xs">
                                <p className="font-medium text-gray-700 mb-1">可用变量:</p>
                                <div className="text-gray-600">
                                    <span>{'{{description}}'} - 视频描述、</span>
                                    <span>{'{{date}}'} - 发布日期、</span>
                                    <span>{'{{account.name}}'} - 账号名称、</span>
                                    <span>{'{{location}}'} - 位置信息</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 右侧：执行区域 */}
                <div className="space-y-6">
                    {/* 预览效果 */}
                    {formData.description && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-gray-900 mb-2">发布预览</h4>
                            <div className="text-sm text-gray-700 space-y-2">
                                {formData.title && (
                                    <div>
                                        <span className="font-medium">标题: </span>
                                        {formData.title}
                                    </div>
                                )}
                                <div>
                                    <span className="font-medium">描述: </span>
                                    {generatePreview()}
                                </div>
                                {formData.location && (
                                    <div>
                                        <span className="font-medium">位置: </span>
                                        {formData.location}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 执行状态 */}
                    {systemState.executionStatus !== 'idle' && (
                        <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
                            <div className="flex items-center space-x-3 mb-3">
                                {getStatusIcon()}
                                <span className="font-medium">{getStatusText()}</span>
                            </div>

                            {/* 上传进度条 */}
                            {systemState.executionStatus === 'uploading' && (
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${systemState.uploadProgress}%` }}
                                    ></div>
                                </div>
                            )}

                            {/* 执行结果 */}
                            {systemState.executionResult && (
                                <div className="mt-3">
                                    {systemState.executionResult.success ? (
                                        <div className="p-3 bg-green-100 rounded border">
                                            <p className="text-sm font-medium text-green-800">执行成功！</p>
                                            <p className="text-xs text-green-600">
                                                工作流类型: {systemState.executionResult.workflowType}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-red-100 rounded border">
                                            <p className="text-sm font-medium text-red-800">执行失败</p>
                                            <p className="text-xs text-red-600">
                                                {systemState.executionResult.error}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="space-y-3">
                        <button
                            onClick={executeWorkflow}
                            disabled={
                                !systemState.backendConnected ||
                                !formData.selectedBrowser ||
                                !formData.videoFile ||
                                !formData.description.trim() ||
                                systemState.executionStatus === 'executing' ||
                                systemState.executionStatus === 'uploading'
                            }
                            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            <Play className="w-5 h-5" />
                            <span>
                                {systemState.executionStatus === 'executing' ? '执行中...' :
                                    systemState.executionStatus === 'uploading' ? '上传中...' :
                                        '执行工作流'}
                            </span>
                        </button>

                        <button
                            onClick={resetForm}
                            className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            重置配置
                        </button>
                    </div>

                    {/* 调试信息 */}
                    <div className="p-4 bg-gray-50 rounded-lg border">
                        <h4 className="font-medium text-gray-900 mb-3">调试信息</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                            <div>后端连接: {systemState.backendConnected ? '✅' : '❌'}</div>
                            <div>浏览器实例: {systemState.availableBrowsers.length} 个</div>
                            <div>已上传文件: {systemState.uploadedFiles.length} 个</div>
                            <div>当前状态: {systemState.executionStatus}</div>
                            <div>表单数据: {JSON.stringify({
                                selectedBrowser: !!formData.selectedBrowser,
                                videoFile: !!formData.videoFile,
                                description: formData.description.length + ' 字符'
                            })}</div>
                        </div>
                    </div>

                    {/* 使用说明 */}
                    <div className="p-4 bg-gray-50 rounded-lg border">
                        <h4 className="font-medium text-gray-900 mb-3">执行步骤</h4>
                        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                            <li>启动 Chrome 浏览器: <code>chrome --remote-debugging-port=9225</code></li>
                            <li>在浏览器中打开并登录微信视频号</li>
                            <li>确保后端服务运行: <code>node server.js</code></li>
                            <li>确保 automation 服务运行在正确路径</li>
                            <li>在本平台选择对应的浏览器实例</li>
                            <li>上传视频文件并配置发布内容</li>
                            <li>点击"执行工作流"开始自动发布</li>
                        </ol>

                        <div className="mt-3 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                            <strong>注意:</strong> 执行过程中请勿操作浏览器，避免干扰自动化流程
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoWorkflowComponent;