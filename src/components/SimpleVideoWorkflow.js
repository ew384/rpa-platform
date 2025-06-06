// SimpleVideoWorkflow.js - 简化版解决按钮问题
import React, { useState, useEffect } from 'react';
import { Upload, Play, Monitor, CheckCircle, AlertCircle, Clock, RefreshCw, Video, Settings } from 'lucide-react';

const SimpleVideoWorkflow = () => {
    // 简化的状态管理
    const [selectedBrowser, setSelectedBrowser] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [debugPort, setDebugPort] = useState(9225);

    const [availableBrowsers, setAvailableBrowsers] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [executionStatus, setExecutionStatus] = useState('idle');
    const [executionResult, setExecutionResult] = useState(null);
    const [backendConnected, setBackendConnected] = useState(false);

    const [template, setTemplate] = useState({
        description: '{{description}} - 发布于{{date}} #{{account.name}}'
    });

    const API_BASE = 'http://localhost:3001/api';

    // 初始化
    useEffect(() => {
        console.log('[SimpleVideoWorkflow] 组件初始化');
        initializeComponent();
    }, []);

    const initializeComponent = async () => {
        try {
            console.log('[SimpleVideoWorkflow] 开始初始化...');

            // 检查后端
            const response = await fetch(`${API_BASE}/health`);
            const data = await response.json();
            const connected = data.status === 'ok';
            setBackendConnected(connected);
            console.log('[SimpleVideoWorkflow] 后端连接状态:', connected);

            if (connected) {
                await loadBrowsersAndFiles();
            }
        } catch (error) {
            console.error('[SimpleVideoWorkflow] 初始化失败:', error);
            setBackendConnected(false);
        }
    };

    const loadBrowsersAndFiles = async () => {
        try {
            // 加载浏览器列表
            const browsersResponse = await fetch(`${API_BASE}/browsers`);
            const browsersData = await browsersResponse.json();
            if (browsersData.success) {
                setAvailableBrowsers(browsersData.browsers);
                console.log('[SimpleVideoWorkflow] 浏览器列表:', browsersData.browsers);
            }

            // 加载文件列表
            const filesResponse = await fetch(`${API_BASE}/files`);
            const filesData = await filesResponse.json();
            if (filesData.success) {
                const videoFiles = filesData.files.filter(file => file.type === 'video');
                setUploadedFiles(videoFiles);
                console.log('[SimpleVideoWorkflow] 视频文件列表:', videoFiles);
            }
        } catch (error) {
            console.error('[SimpleVideoWorkflow] 加载数据失败:', error);
        }
    };

    // 文件上传
    const handleFileUpload = async (event) => {
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
            setExecutionStatus('uploading');

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE}/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setVideoFile(data.file);
                setExecutionStatus('idle');
                await loadBrowsersAndFiles(); // 刷新文件列表
                console.log('[SimpleVideoWorkflow] 文件上传成功:', data.file.filename);
            } else {
                throw new Error(data.error || '文件上传失败');
            }
        } catch (error) {
            console.error('[SimpleVideoWorkflow] 文件上传失败:', error);
            setExecutionStatus('error');
            alert('文件上传失败: ' + error.message);
        }
    };

    // 选择已上传文件
    const selectUploadedFile = (file) => {
        setVideoFile(file);
        console.log('[SimpleVideoWorkflow] 选择文件:', file.name);
    };

    // 检查按钮是否应该启用
    const isExecuteButtonEnabled = () => {
        const conditions = {
            backendConnected: backendConnected,
            selectedBrowser: !!selectedBrowser,
            videoFile: !!videoFile,
            description: description.trim().length > 0,
            notExecuting: executionStatus !== 'executing' && executionStatus !== 'uploading'
        };

        console.log('[SimpleVideoWorkflow] 按钮启用条件:', conditions);

        return Object.values(conditions).every(condition => condition === true);
    };

    // 执行工作流
    const executeWorkflow = async () => {
        console.log('[SimpleVideoWorkflow] 开始执行工作流');
        console.log('表单数据:', {
            selectedBrowser,
            videoFile: videoFile?.filename,
            description: description.length,
            debugPort
        });

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
            setExecutionStatus('executing');
            setExecutionResult(null);

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

            console.log('[SimpleVideoWorkflow] 提交工作流数据:', workflowData);

            const response = await fetch(`${API_BASE}/workflow/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(workflowData)
            });

            const data = await response.json();
            console.log('[SimpleVideoWorkflow] 服务器响应:', data);

            if (data.success) {
                setExecutionResult(data.result);
                setExecutionStatus('completed');
                console.log('[SimpleVideoWorkflow] 工作流执行成功');
            } else {
                throw new Error(data.error || '工作流执行失败');
            }
        } catch (error) {
            console.error('[SimpleVideoWorkflow] 工作流执行失败:', error);
            setExecutionStatus('error');
            setExecutionResult({ error: error.message });
        }
    };

    // 重置表单
    const resetForm = () => {
        setSelectedBrowser('');
        setVideoFile(null);
        setTitle('');
        setDescription('');
        setLocation('');
        setExecutionStatus('idle');
        setExecutionResult(null);

        // 重置文件输入
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    // 生成预览
    const generatePreview = () => {
        return template.description
            .replace('{{description}}', description || '视频描述')
            .replace('{{date}}', new Date().toLocaleDateString('zh-CN'))
            .replace('{{account.name}}', selectedBrowser || '账号名称')
            .replace('{{location}}', location || '');
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white">
            {/* 标题 */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    微信视频号发布工作流 (简化版)
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
                        <span className={backendConnected ? 'text-green-600' : 'text-red-600'}>
                            {backendConnected ? 'RPA Platform Backend 已连接' : '后端服务未连接'}
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
                {/* 左侧：配置 */}
                <div className="space-y-6">
                    {/* 浏览器选择 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            浏览器实例 * (当前选择: {selectedBrowser || '未选择'})
                        </label>
                        <div className="flex items-center space-x-2">
                            <select
                                value={selectedBrowser}
                                onChange={(e) => {
                                    setSelectedBrowser(e.target.value);
                                    console.log('[SimpleVideoWorkflow] 选择浏览器:', e.target.value);
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">请选择浏览器实例</option>
                                {availableBrowsers.map(browser => (
                                    <option key={browser.id} value={browser.id}>
                                        {browser.name} (端口: {browser.debugPort}) - {browser.status}
                                    </option>
                                ))}
                            </select>
                            <div className="flex items-center space-x-1">
                                <Settings className="w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    value={debugPort}
                                    onChange={(e) => setDebugPort(parseInt(e.target.value))}
                                    placeholder="端口"
                                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                                />
                            </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            找到 {availableBrowsers.length} 个浏览器实例
                        </p>
                    </div>

                    {/* 视频文件 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            视频文件 * (当前选择: {videoFile ? videoFile.originalName || videoFile.name : '未选择'})
                        </label>

                        {/* 上传新文件 */}
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
                        {uploadedFiles.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                    已上传的视频文件 ({uploadedFiles.length} 个):
                                </p>
                                <div className="max-h-32 overflow-y-auto space-y-2">
                                    {uploadedFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            onClick={() => selectUploadedFile(file)}
                                            className={`p-3 border rounded cursor-pointer transition-colors ${videoFile?.id === file.id
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
                                                {videoFile?.id === file.id && (
                                                    <CheckCircle className="w-4 h-4 text-blue-500" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 内容配置 */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">内容配置</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                视频标题 (可选) - 当前长度: {title.length}
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    console.log('[SimpleVideoWorkflow] 标题更新:', e.target.value);
                                }}
                                placeholder="视频标题（留空将自动生成）"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                maxLength={50}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                视频描述 * - 当前长度: {description.length}
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => {
                                    setDescription(e.target.value);
                                    console.log('[SimpleVideoWorkflow] 描述更新:', e.target.value.length, '字符');
                                }}
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
                                    {description.length}/500
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                位置信息 (可选) - 当前长度: {location.length}
                            </label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => {
                                    setLocation(e.target.value);
                                    console.log('[SimpleVideoWorkflow] 位置更新:', e.target.value);
                                }}
                                placeholder="如：北京市"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* 右侧：执行区域 */}
                <div className="space-y-6">
                    {/* 调试信息 */}
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h4 className="font-medium text-gray-900 mb-3">实时状态检查</h4>
                        <div className="text-sm space-y-1">
                            <div className={`flex items-center ${backendConnected ? 'text-green-600' : 'text-red-600'}`}>
                                {backendConnected ? '✅' : '❌'} 后端连接: {backendConnected ? '正常' : '失败'}
                            </div>
                            <div className={`flex items-center ${selectedBrowser ? 'text-green-600' : 'text-red-600'}`}>
                                {selectedBrowser ? '✅' : '❌'} 浏览器选择: {selectedBrowser || '未选择'}
                            </div>
                            <div className={`flex items-center ${videoFile ? 'text-green-600' : 'text-red-600'}`}>
                                {videoFile ? '✅' : '❌'} 视频文件: {videoFile ? (videoFile.originalName || videoFile.name) : '未选择'}
                            </div>
                            <div className={`flex items-center ${description.trim() ? 'text-green-600' : 'text-red-600'}`}>
                                {description.trim() ? '✅' : '❌'} 视频描述: {description.trim() ? `${description.length} 字符` : '未填写'}
                            </div>
                            <div className={`flex items-center ${executionStatus === 'idle' ? 'text-green-600' : 'text-blue-600'}`}>
                                {executionStatus === 'idle' ? '✅' : '⏳'} 执行状态: {executionStatus}
                            </div>
                            <div className="mt-2 p-2 bg-white rounded border">
                                <strong>按钮是否启用:</strong> {isExecuteButtonEnabled() ? '✅ 是' : '❌ 否'}
                            </div>
                        </div>
                    </div>

                    {/* 预览效果 */}
                    {description && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-gray-900 mb-2">发布预览</h4>
                            <div className="text-sm text-gray-700 space-y-2">
                                {title && (
                                    <div>
                                        <span className="font-medium">标题: </span>
                                        {title}
                                    </div>
                                )}
                                <div>
                                    <span className="font-medium">描述: </span>
                                    {generatePreview()}
                                </div>
                                {location && (
                                    <div>
                                        <span className="font-medium">位置: </span>
                                        {location}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 执行状态 */}
                    {executionStatus !== 'idle' && (
                        <div className={`p-4 rounded-lg border ${executionStatus === 'uploading' || executionStatus === 'executing' ? 'bg-blue-50 border-blue-200' :
                                executionStatus === 'completed' ? 'bg-green-50 border-green-200' :
                                    'bg-red-50 border-red-200'
                            }`}>
                            <div className="flex items-center space-x-3 mb-3">
                                {executionStatus === 'uploading' && <Upload className="w-5 h-5 text-blue-500 animate-pulse" />}
                                {executionStatus === 'executing' && <Clock className="w-5 h-5 text-blue-500 animate-spin" />}
                                {executionStatus === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                                {executionStatus === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                                <span className="font-medium">
                                    {executionStatus === 'uploading' && '正在上传文件...'}
                                    {executionStatus === 'executing' && '正在执行工作流...'}
                                    {executionStatus === 'completed' && '工作流执行完成'}
                                    {executionStatus === 'error' && '执行失败'}
                                </span>
                            </div>

                            {executionResult && (
                                <div className="mt-3">
                                    {executionResult.success ? (
                                        <div className="p-3 bg-green-100 rounded border">
                                            <p className="text-sm font-medium text-green-800">执行成功！</p>
                                            <p className="text-xs text-green-600">
                                                工作流类型: {executionResult.workflowType}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-red-100 rounded border">
                                            <p className="text-sm font-medium text-red-800">执行失败</p>
                                            <p className="text-xs text-red-600">
                                                {executionResult.error}
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
                            disabled={!isExecuteButtonEnabled()}
                            className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-md transition-colors ${isExecuteButtonEnabled()
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                }`}
                        >
                            <Play className="w-5 h-5" />
                            <span>
                                {executionStatus === 'executing' ? '执行中...' :
                                    executionStatus === 'uploading' ? '上传中...' :
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
                </div>
            </div>
        </div>
    );
};

export default SimpleVideoWorkflow;