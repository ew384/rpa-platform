import React, { useState, useEffect } from 'react';
import SimpleVideoWorkflow from './components/SimpleVideoWorkflow';

import {
  User,
  Settings,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Bell,
  Menu,
  X,
  Video,
  Monitor,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const RPAPlatform = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPlatform, setSelectedPlatform] = useState('amazon');
  const [tasks, setTasks] = useState([]);
  const [taskStatus, setTaskStatus] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // 模拟登录
  const handleLogin = (username, password) => {
    if (username && password) {
      setCurrentUser({
        name: username,
        role: username === 'admin' ? 'admin' : 'user',
        permissions: username === 'admin' ? ['all'] : ['basic']
      });
      setIsLoggedIn(true);
      // 模拟获取任务数据
      loadTasks();
    }
  };

  // 模拟WebSocket连接
  useEffect(() => {
    if (isLoggedIn) {
      const interval = setInterval(() => {
        // 模拟任务状态更新
        setTaskStatus(prev => ({
          ...prev,
          [Math.floor(Math.random() * 5)]: {
            status: ['running', 'completed', 'failed', 'pending'][Math.floor(Math.random() * 4)],
            progress: Math.floor(Math.random() * 100),
            lastUpdate: new Date().toLocaleTimeString()
          }
        }));
      }, 30000); // 30秒更新一次

      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  const loadTasks = () => {
    const mockTasks = [
      {
        id: 1,
        name: 'Amazon产品详情抓取',
        platform: 'amazon',
        status: 'running',
        progress: 75,
        lastRun: '2025-06-04 14:30',
        nextRun: '2025-06-04 15:00'
      },
      {
        id: 2,
        name: 'Amazon库存监控',
        platform: 'amazon',
        status: 'completed',
        progress: 100,
        lastRun: '2025-06-04 14:00',
        nextRun: '2025-06-04 16:00'
      },
      {
        id: 3,
        name: 'Amazon评价自动回复',
        platform: 'amazon',
        status: 'failed',
        progress: 0,
        lastRun: '2025-06-04 13:30',
        nextRun: '2025-06-04 17:00'
      }
    ];
    setTasks(mockTasks);
  };

  // 登录组件
  const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Workflow</h1>
            <p className="text-gray-600">RPA自动化管理平台</p>
          </div>

          <div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入用户名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入密码"
                />
              </div>
              <button
                onClick={() => handleLogin(username, password)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                登录
              </button>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-gray-500">
            <p>测试账号: admin/admin 或 user/user</p>
          </div>
        </div>
      </div>
    );
  };

  // 视频工作流组件 (内联版本)
  const VideoWorkflowComponent = () => {
    const [availableBrowsers, setAvailableBrowsers] = useState([]);
    const [selectedBrowser, setSelectedBrowser] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [workflowConfig, setWorkflowConfig] = useState({
      description: '',
      location: '',
      title: ''
    });
    const [template, setTemplate] = useState({
      description: '{{description}} - 发布于{{date}} #{{account.name}}',
      location: '{{location}}'
    });
    const [executionStatus, setExecutionStatus] = useState('idle');
    const [executionResult, setExecutionResult] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [debugPort, setDebugPort] = useState(9225);

    // API 基础URL
    const API_BASE = 'http://localhost:3001/api';

    useEffect(() => {
      initializeComponent();
    }, []);

    const initializeComponent = async () => {
      console.log('[VideoWorkflow] 初始化组件...');

      try {
        // 检查后端服务状态
        await checkBackendHealth();

        // 加载可用浏览器
        await loadAvailableBrowsers();

        // 加载已上传文件
        await loadUploadedFiles();
      } catch (error) {
        console.error('[VideoWorkflow] 初始化失败:', error);
      }
    };

    const checkBackendHealth = async () => {
      try {
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        console.log('[VideoWorkflow] 后端服务状态:', data);
        return data.status === 'ok';
      } catch (error) {
        console.error('[VideoWorkflow] 后端服务不可用:', error);
        throw new Error('后端服务不可用，请确保服务已启动');
      }
    };

    const loadAvailableBrowsers = async () => {
      try {
        const response = await fetch(`${API_BASE}/browsers`);
        const data = await response.json();

        if (data.success) {
          setAvailableBrowsers(data.browsers);
          console.log('[VideoWorkflow] 加载浏览器列表:', data.browsers.length);
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
          setUploadedFiles(data.files.filter(file => file.type === 'video'));
          console.log('[VideoWorkflow] 加载文件列表:', data.files.length);
        }
      } catch (error) {
        console.error('[VideoWorkflow] 加载文件失败:', error);
      }
    };

    const handleFileSelect = async (event) => {
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

      console.log('[VideoWorkflow] 开始上传文件:', file.name);

      try {
        setExecutionStatus('uploading');
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (data.success) {
          setVideoFile(data.file);
          setUploadProgress(100);
          setExecutionStatus('idle');

          // 刷新文件列表
          await loadUploadedFiles();

          console.log('[VideoWorkflow] 文件上传成功:', data.file);
        } else {
          throw new Error(data.error || '文件上传失败');
        }
      } catch (error) {
        console.error('[VideoWorkflow] 文件上传失败:', error);
        setExecutionStatus('error');
        alert('文件上传失败: ' + error.message);
      }
    };

    const executeWorkflow = async () => {
      if (!selectedBrowser) {
        alert('请选择一个浏览器实例');
        return;
      }

      if (!videoFile && uploadedFiles.length === 0) {
        alert('请上传视频文件');
        return;
      }

      if (!workflowConfig.description.trim()) {
        alert('请填写视频描述');
        return;
      }

      try {
        setExecutionStatus('executing');
        setExecutionResult(null);

        // 使用当前视频文件或选中的已上传文件
        const fileToUse = videoFile || uploadedFiles[0];

        const workflowData = {
          workflowType: 'video',
          content: {
            videoFile: fileToUse.filename || fileToUse.name,
            description: workflowConfig.description,
            location: workflowConfig.location,
            title: workflowConfig.title
          },
          template: template,
          account: {
            id: selectedBrowser,
            name: selectedBrowser
          },
          debugPort: debugPort
        };

        console.log('[VideoWorkflow] 执行工作流:', workflowData);

        const response = await fetch(`${API_BASE}/workflow/execute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(workflowData)
        });

        const data = await response.json();

        if (data.success) {
          setExecutionResult(data.result);
          setExecutionStatus('completed');

          console.log('[VideoWorkflow] 工作流执行成功:', data);
        } else {
          throw new Error(data.error || '工作流执行失败');
        }
      } catch (error) {
        console.error('[VideoWorkflow] 工作流执行失败:', error);
        setExecutionStatus('error');
        setExecutionResult({ error: error.message });
      }
    };

    const resetWorkflow = () => {
      setExecutionStatus('idle');
      setExecutionResult(null);
      setVideoFile(null);
      setUploadProgress(0);
      setWorkflowConfig({
        description: '',
        location: '',
        title: ''
      });

      // 重置文件输入
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = '';
      }
    };

    const selectUploadedFile = (file) => {
      setVideoFile(file);
      console.log('[VideoWorkflow] 选择已上传文件:', file.name);
    };

    const getStatusIcon = () => {
      switch (executionStatus) {
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
      switch (executionStatus) {
        case 'uploading':
          return `正在上传文件... ${uploadProgress}%`;
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
      switch (executionStatus) {
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

    return (
      <div className="max-w-6xl mx-auto p-6 bg-white">
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
              <span className="text-green-600">RPA Platform Backend 已连接</span>
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
                  value={selectedBrowser}
                  onChange={(e) => setSelectedBrowser(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              {availableBrowsers.length === 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  未找到可用的浏览器实例，请确保 Chrome 已启动并开启调试端口
                </p>
              )}
            </div>

            {/* 视频文件上传 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                视频文件 *
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
                        onChange={handleFileSelect}
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
                  <p className="text-sm font-medium text-gray-700 mb-2">已上传的视频文件:</p>
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

              {/* 当前选中的文件 */}
              {videoFile && (
                <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-gray-700">
                    <strong>当前选择:</strong> {videoFile.originalName || videoFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    大小: {((videoFile.size || 0) / 1024 / 1024).toFixed(2)} MB
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
                  value={workflowConfig.title}
                  onChange={(e) => setWorkflowConfig(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="视频标题（留空将自动生成）"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  视频描述 *
                </label>
                <textarea
                  value={workflowConfig.description}
                  onChange={(e) => setWorkflowConfig(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="描述视频内容，让观众了解视频的精彩之处..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  maxLength={500}
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    详细描述有助于提高视频的曝光度
                  </p>
                  <p className="text-xs text-gray-400">
                    {workflowConfig.description.length}/500
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  位置信息 (可选)
                </label>
                <input
                  type="text"
                  value={workflowConfig.location}
                  onChange={(e) => setWorkflowConfig(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="如：北京市"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="mt-2 p-3 bg-gray-50 rounded text-xs">
                  <p className="font-medium text-gray-700 mb-1">可用变量:</p>
                  <div className="grid grid-cols-2 gap-1 text-gray-600">
                    <span>{'{{description}}'} - 视频描述</span>
                    <span>{'{{date}}'} - 发布日期</span>
                    <span>{'{{account.name}}'} - 账号名称</span>
                    <span>{'{{location}}'} - 位置信息</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：执行区域 */}
          <div className="space-y-6">
            {/* 预览效果 */}
            {workflowConfig.description && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-gray-900 mb-2">发布预览</h4>
                <div className="text-sm text-gray-700 space-y-2">
                  {workflowConfig.title && (
                    <div>
                      <span className="font-medium">标题: </span>
                      {workflowConfig.title}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">描述: </span>
                    {template.description
                      .replace('{{description}}', workflowConfig.description)
                      .replace('{{date}}', new Date().toLocaleDateString('zh-CN'))
                      .replace('{{account.name}}', selectedBrowser || '账号名称')
                      .replace('{{location}}', workflowConfig.location || '')
                    }
                  </div>
                  {workflowConfig.location && (
                    <div>
                      <span className="font-medium">位置: </span>
                      {workflowConfig.location}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 执行状态 */}
            {executionStatus !== 'idle' && (
              <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
                <div className="flex items-center space-x-3 mb-3">
                  {getStatusIcon()}
                  <span className="font-medium">{getStatusText()}</span>
                </div>

                {/* 上传进度条 */}
                {executionStatus === 'uploading' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}

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
                disabled={
                  !selectedBrowser ||
                  !videoFile ||
                  !workflowConfig.description.trim() ||
                  executionStatus === 'executing' ||
                  executionStatus === 'uploading'
                }
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Play className="w-5 h-5" />
                <span>
                  {executionStatus === 'executing' ? '执行中...' :
                    executionStatus === 'uploading' ? '上传中...' :
                      '执行工作流'}
                </span>
              </button>

              <button
                onClick={resetWorkflow}
                className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                重置配置
              </button>
            </div>

            {/* 说明文档 */}
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-3">执行步骤</h4>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>启动 Chrome 浏览器并开启调试端口</li>
                <li>在浏览器中打开并登录微信视频号</li>
                <li>在本平台选择对应的浏览器实例</li>
                <li>上传视频文件并配置发布内容</li>
                <li>点击"执行工作流"开始自动发布</li>
                <li>等待执行完成，查看结果</li>
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

  // 任务状态指示器
  const StatusIndicator = ({ status, progress }) => {
    const statusConfig = {
      running: { icon: Play, color: 'text-blue-500', bg: 'bg-blue-100' },
      completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
      failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100' },
      pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div className="flex items-center space-x-2">
        <div className={`p-1 rounded-full ${config.bg}`}>
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>
        <span className="text-sm font-medium">{status === 'running' ? `${progress}%` : status}</span>
      </div>
    );
  };

  // Amazon工作流市场组件
  const AmazonMarketplace = () => {
    const [selectedCategory, setSelectedCategory] = useState('运营精选');
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [showConfigModal, setShowConfigModal] = useState(false);

    const categories = [
      { id: '运营精选', name: '运营精选', color: 'bg-purple-600' },
      { id: '数据分析', name: '数据分析', color: 'bg-blue-600' },
      { id: '库存管理', name: '库存管理', color: 'bg-green-600' },
      { id: '客户服务', name: '客户服务', color: 'bg-orange-600' }
    ];

    const workflows = {
      '运营精选': [
        {
          id: 1,
          title: '【技术】子商品详情页明细',
          subtitle: '自动与访问量-报告asin',
          description: '历史每天报表数据、一键开通、一次性将金全部的详情页面开通或关闭、也无法开通或关闭数据、通过详情页面自动与访问量-报告asin',
          icon: '📊',
          category: '数据下载',
          popular: true
        },
        {
          id: 2,
          title: '店铺状态健康状况汇总',
          subtitle: 'Account Health',
          description: '自动检测店铺的健康状况汇总报表各项指标，政策合规性、操作中断或错误的通知可查看历史或实时，详情页面自动与访问量-报告asin',
          icon: '🏥',
          category: '数据监控',
          popular: true
        },
        {
          id: 3,
          title: 'IPI库存效率',
          subtitle: 'IPI Details',
          description: '亚马逊不会删除IPI库存效率数据下载，但使用RPA平台可以让多个人员、通过详情页面自动与访问量-报告asin',
          icon: '📦',
          category: '数据监控',
          popular: false
        },
        {
          id: 4,
          title: '亚马逊-批量上传商品表',
          subtitle: '批量上传商品表',
          description: '去现有商品表来源的方式自动上传批量上传商品表',
          icon: '⬆️',
          category: '功能操作',
          popular: false
        }
      ]
    };

    const WorkflowCard = ({ workflow }) => (
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 p-6 relative">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">{workflow.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{workflow.title}</h3>
              {workflow.popular && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">热门</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">{workflow.subtitle}</p>
            <p className="text-sm text-gray-500 line-clamp-3">{workflow.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                {workflow.category}
              </span>
              <button
                onClick={() => {
                  setSelectedWorkflow(workflow);
                  setShowConfigModal(true);
                }}
                className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-600 transition-colors"
              >
                运行
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    const ConfigModal = () => {
      const [config, setConfig] = useState({
        apiKey: '',
        secretKey: '',
        marketplace: 'US',
        sellerID: '',
        refreshInterval: 30,
        enableAutoReply: true
      });

      if (!showConfigModal || !selectedWorkflow) return null;

      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">配置工作流参数</h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">{selectedWorkflow.title}</p>
              <p className="text-sm text-gray-600">{selectedWorkflow.subtitle}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="输入Amazon API Key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                <input
                  type="password"
                  value={config.secretKey}
                  onChange={(e) => setConfig(prev => ({ ...prev, secretKey: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="输入Secret Key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">市场</label>
                <select
                  value={config.marketplace}
                  onChange={(e) => setConfig(prev => ({ ...prev, marketplace: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="US">美国</option>
                  <option value="UK">英国</option>
                  <option value="DE">德国</option>
                  <option value="JP">日本</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">卖家ID</label>
                <input
                  type="text"
                  value={config.sellerID}
                  onChange={(e) => setConfig(prev => ({ ...prev, sellerID: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="输入卖家ID"
                />
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  // 启动工作流
                  console.log('启动工作流:', selectedWorkflow, config);
                  setShowConfigModal(false);
                  // 这里可以添加实际的工作流启动逻辑
                }}
                className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
              >
                启动工作流
              </button>
              <button
                onClick={() => setShowConfigModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-6">
        {/* 头部导航 */}
        <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">亚马逊 RPA 工作流市场</h2>
          <p className="text-purple-100">选择并配置您需要的自动化工作流程</p>
        </div>

        {/* 分类导航 */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex space-x-4 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category.id
                  ? `${category.color} text-white`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* 工作流列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {workflows[selectedCategory]?.map((workflow) => (
            <WorkflowCard key={workflow.id} workflow={workflow} />
          ))}
        </div>

        {/* 配置模态框 */}
        <ConfigModal />
      </div>
    );
  };

  // 任务管理表格
  const TaskTable = () => {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">任务管理</h3>
            <div className="flex space-x-2">
              <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center">
                <Plus className="w-4 h-4 mr-1" />
                新建任务
              </button>
              <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-200 transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">任务名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平台</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">上次运行</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">下次运行</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{task.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Amazon
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusIndicator status={task.status} progress={task.progress} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.lastRun}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.nextRun}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Play className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 仪表板
  const Dashboard = () => {
    const stats = [
      { name: '运行中任务', value: '3', icon: Play, color: 'text-blue-600' },
      { name: '已完成任务', value: '12', icon: CheckCircle, color: 'text-green-600' },
      { name: '失败任务', value: '1', icon: XCircle, color: 'text-red-600' },
      { name: '待处理任务', value: '5', icon: Clock, color: 'text-yellow-600' }
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <TaskTable />
      </div>
    );
  };

  // 侧边栏
  const Sidebar = () => {
    const menuItems = [
      { id: 'dashboard', name: '仪表板', icon: Settings },
      { id: 'video-workflow', name: '视频工作流', icon: Video }, // 新增
      { id: 'amazon', name: 'Amazon工作流', icon: Settings },
      { id: 'tasks', name: '任务管理', icon: Play },
      { id: 'users', name: '用户管理', icon: User, adminOnly: true }
    ];

    return (
      <div className={`bg-gray-900 text-white ${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 flex flex-col`}>
        <div className="p-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">W</span>
            </div>
            {sidebarOpen && <span className="font-semibold">Workflow</span>}
          </div>
        </div>

        <nav className="flex-1 px-2 space-y-1">
          {menuItems.map((item) => {
            if (item.adminOnly && currentUser?.role !== 'admin') return null;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === item.id
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                {sidebarOpen && <span className="ml-3">{item.name}</span>}
              </button>
            );
          })}
        </nav>
      </div>
    );
  };

  // 主内容渲染
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'video-workflow':
        return <SimpleVideoWorkflow />; // 新增的视频工作流组件
      case 'amazon':
        return <AmazonMarketplace />;
      case 'tasks':
        return <TaskTable />;
      case 'users':
        return <div className="bg-white rounded-lg shadow p-6">用户管理功能开发中...</div>;
      default:
        return <Dashboard />;
    }
  };

  if (!isLoggedIn) {
    return <LoginForm />;
  }

  return (
    <div className="h-screen bg-gray-100 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航 */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {activeTab === 'dashboard' && '仪表板'}
                {activeTab === 'video-workflow' && '视频工作流'}
                {activeTab === 'amazon' && 'Amazon工作流市场'}
                {activeTab === 'tasks' && '任务管理'}
                {activeTab === 'users' && '用户管理'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                <Bell className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">欢迎, {currentUser?.name}</span>
                <button
                  onClick={() => setIsLoggedIn(false)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  登出
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* 主内容区域 */}
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default RPAPlatform;