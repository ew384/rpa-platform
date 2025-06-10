/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import {
    Video, Upload, Settings, Play, CheckCircle, XCircle, Clock, AlertCircle,
    RefreshCw, Monitor, MapPin, Hash, Eye, Edit, Trash2, Plus, Copy, X
} from 'lucide-react';

const MultiPlatformPublisher = () => {
    // ==================== 状态管理 ====================
    const [currentStep, setCurrentStep] = useState(1);
    const [videoFile, setVideoFile] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    const [availableBrowsers, setAvailableBrowsers] = useState([]);
    const [platformBrowserMapping, setPlatformBrowserMapping] = useState({});
    const [contentForm, setContentForm] = useState({
        title: '',
        description: '',
        location: '',
        tags: [],
        hashtags: []
    });
    const [executionStatus, setExecutionStatus] = useState('idle');
    const [executionResults, setExecutionResults] = useState([]);
    const [contentPreviews, setContentPreviews] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);

    // 平台配置 - 从后端API获取
    const [platformConfigs, setPlatformConfigs] = useState({});
    const [availablePlatforms, setAvailablePlatforms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE = 'http://localhost:3001/api';

    // ==================== 初始化和数据加载 ====================
    useEffect(() => {
        initializeComponent();
    }, []);

    // 监听内容变化，实时预览
    useEffect(() => {
        if (selectedPlatforms.length > 0 && (contentForm.title || contentForm.description)) {
            generateContentPreviews();
        }
    }, [contentForm, selectedPlatforms]);

    const initializeComponent = async () => {
        setIsLoading(true);
        try {
            await loadPlatformConfigs();
            await loadAvailableBrowsers();
            await loadUploadedFiles();
            setError(null);
        } catch (error) {
            console.error('[MultiPlatform] 初始化失败:', error);
            setError('系统初始化失败，请刷新页面重试');
        } finally {
            setIsLoading(false);
        }
    };

    // 从后端API加载平台配置
    const loadPlatformConfigs = async () => {
        try {
            const response = await fetch(`${API_BASE}/platforms`);
            const data = await response.json();

            if (data.success) {
                // 转换为前端需要的格式
                const configs = {};
                const platforms = [];

                data.platforms.forEach(platform => {
                    configs[platform.id] = {
                        ...platform,
                        maxTitle: platform.fields?.title?.maxLength || 0,
                        maxDescription: platform.fields?.description?.maxLength || 1000,
                        requiresTitle: platform.fields?.title?.required || false,
                        description: `发布到${platform.name}`
                    };
                    platforms.push(platform);
                });

                setPlatformConfigs(configs);
                setAvailablePlatforms(platforms);
                console.log('[MultiPlatform] 平台配置加载成功:', configs);
            } else {
                throw new Error(data.error || '加载平台配置失败');
            }
        } catch (error) {
            console.error('加载平台配置失败:', error);
            // 使用默认配置作为后备
            const fallbackPlatforms = [
                {
                    id: 'wechat',
                    name: '微信视频号',
                    icon: '🎬',
                    color: 'bg-green-500',
                    status: 'stable',
                    fields: {
                        title: { required: false, maxLength: 16 },
                        description: { required: true, maxLength: 500 }
                    }
                },
                {
                    id: 'douyin',
                    name: '抖音',
                    icon: '🎵',
                    color: 'bg-black',
                    status: 'testing',
                    fields: {
                        title: { required: true, maxLength: 55 },
                        description: { required: true, maxLength: 2200 }
                    }
                }
            ];

            const configs = {};
            fallbackPlatforms.forEach(platform => {
                configs[platform.id] = {
                    ...platform,
                    maxTitle: platform.fields?.title?.maxLength || 0,
                    maxDescription: platform.fields?.description?.maxLength || 1000,
                    requiresTitle: platform.fields?.title?.required || false,
                    description: `发布到${platform.name}`
                };
            });

            setPlatformConfigs(configs);
            setAvailablePlatforms(fallbackPlatforms);
        }
    };

    const loadAvailableBrowsers = async () => {
        try {
            const response = await fetch(`${API_BASE}/browsers`);
            const data = await response.json();
            if (data.success) {
                setAvailableBrowsers(data.browsers.filter(b => b.status === 'running'));
                console.log('[MultiPlatform] 浏览器列表加载成功:', data.browsers.length);
            }
        } catch (error) {
            console.error('加载浏览器失败:', error);
        }
    };

    const loadUploadedFiles = async () => {
        try {
            const response = await fetch(`${API_BASE}/files`);
            const data = await response.json();
            if (data.success) {
                setUploadedFiles(data.files.filter(file => file.type === 'video'));
                console.log('[MultiPlatform] 文件列表加载成功:', data.files.length);
            }
        } catch (error) {
            console.error('加载文件失败:', error);
        }
    };

    // ==================== 步骤1: 文件上传 ====================
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
            setUploadProgress(0);

            const formData = new FormData();
            formData.append('file', file);

            // 模拟上传进度
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + Math.random() * 10;
                });
            }, 200);

            const response = await fetch(`${API_BASE}/upload`, {
                method: 'POST',
                body: formData
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            const data = await response.json();
            if (data.success) {
                setVideoFile(data.file);
                setExecutionStatus('idle');
                await loadUploadedFiles();

                // 自动进入下一步
                setTimeout(() => {
                    setCurrentStep(2);
                }, 1000);

                console.log('[MultiPlatform] 文件上传成功:', data.file);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            setExecutionStatus('error');
            setUploadProgress(0);
            alert('文件上传失败: ' + error.message);
        }
    };

    const selectUploadedFile = (file) => {
        setVideoFile(file);
        setCurrentStep(2); // 自动进入下一步
        console.log('[MultiPlatform] 选择已上传文件:', file.name);
    };

    // ==================== 步骤2: 平台选择 ====================
    const togglePlatform = (platformId) => {
        setSelectedPlatforms(prev => {
            const newSelected = prev.includes(platformId)
                ? prev.filter(id => id !== platformId)
                : [...prev, platformId];

            // 如果有选中的平台，自动进入下一步
            if (newSelected.length > 0 && currentStep === 2) {
                setTimeout(() => setCurrentStep(3), 500);
            }

            return newSelected;
        });
    };

    // ==================== 步骤3: 浏览器映射 ====================
    const updateBrowserMapping = (platformId, browserId) => {
        setPlatformBrowserMapping(prev => ({
            ...prev,
            [platformId]: browserId
        }));
    };

    // ==================== 步骤4: 内容填写 ====================
    const updateContentForm = (field, value) => {
        setContentForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const addTag = () => {
        const input = document.getElementById('tag-input');
        const tag = input.value.trim();
        if (tag && !contentForm.tags.includes(tag)) {
            setContentForm(prev => ({
                ...prev,
                tags: [...prev.tags, tag]
            }));
            input.value = '';
        }
    };

    const removeTag = (tagToRemove) => {
        setContentForm(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const addHashtag = () => {
        const input = document.getElementById('hashtag-input');
        let hashtag = input.value.trim();

        // 自动去除#号
        if (hashtag.startsWith('#')) {
            hashtag = hashtag.substring(1);
        }

        if (hashtag && !contentForm.hashtags.includes(hashtag)) {
            setContentForm(prev => ({
                ...prev,
                hashtags: [...prev.hashtags, hashtag]
            }));
            input.value = '';
        }
    };

    const removeHashtag = (hashtagToRemove) => {
        setContentForm(prev => ({
            ...prev,
            hashtags: prev.hashtags.filter(hashtag => hashtag !== hashtagToRemove)
        }));
    };

    // 内容预览生成（使用后端API）
    const generateContentPreviews = async () => {
        if (selectedPlatforms.length === 0) return;

        try {
            const response = await fetch(`${API_BASE}/platforms/adapt-multi`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    platforms: selectedPlatforms,
                    content: contentForm
                })
            });

            const data = await response.json();
            if (data.success) {
                const previews = data.results.map(result => ({
                    platformId: result.platformId,
                    config: platformConfigs[result.platformId],
                    adaptedContent: result.adaptedContent,
                    isValid: result.validation.valid,
                    warnings: result.validation.errors || []
                }));

                setContentPreviews(previews);
            }
        } catch (error) {
            console.error('生成内容预览失败:', error);
            // 如果API失败，使用本地预览
            generateLocalContentPreviews();
        }
    };

    // 本地内容预览（后备方案）
    const generateLocalContentPreviews = () => {
        const previews = selectedPlatforms.map(platformId => {
            const config = platformConfigs[platformId];
            if (!config) return null;

            let adaptedContent = { ...contentForm };

            // 适配标题
            if (config.maxTitle === 0) {
                adaptedContent.title = ''; // 快手不需要标题
            } else if (contentForm.title.length > config.maxTitle) {
                adaptedContent.title = contentForm.title.substring(0, config.maxTitle - 3) + '...';
            }

            // 适配描述
            if (contentForm.description.length > config.maxDescription) {
                const truncated = contentForm.description.substring(0, config.maxDescription - 3);
                const lastSentence = truncated.lastIndexOf('。');
                adaptedContent.description = lastSentence > config.maxDescription * 0.7
                    ? contentForm.description.substring(0, lastSentence + 1)
                    : truncated + '...';
            }

            // 验证必需字段
            const isValid = !config.requiresTitle || adaptedContent.title.trim().length > 0;

            return {
                platformId,
                config,
                adaptedContent,
                isValid,
                warnings: []
            };
        }).filter(Boolean);

        setContentPreviews(previews);
    };

    // ==================== 步骤5: 执行发布 ====================
    const executeMultiPlatformPublish = async () => {
        if (!videoFile) {
            alert('请选择视频文件');
            return;
        }

        if (selectedPlatforms.length === 0) {
            alert('请选择至少一个平台');
            return;
        }

        // 检查浏览器映射
        const missingMappings = selectedPlatforms.filter(p => !platformBrowserMapping[p]);
        if (missingMappings.length > 0) {
            alert(`请为以下平台选择浏览器: ${missingMappings.map(p => platformConfigs[p]?.name || p).join(', ')}`);
            return;
        }

        // 检查内容验证
        const invalidPlatforms = contentPreviews.filter(p => !p.isValid);
        if (invalidPlatforms.length > 0) {
            alert(`以下平台内容验证失败: ${invalidPlatforms.map(p => p.config?.name || p.platformId).join(', ')}`);
            return;
        }

        try {
            setExecutionStatus('executing');
            setExecutionResults([]);

            // 准备发布数据
            const publishData = {
                workflowType: 'multi-platform-video',
                videoFile: videoFile.filename || videoFile.name,
                platforms: selectedPlatforms,
                content: contentForm,
                browserMapping: platformBrowserMapping
            };

            console.log('[MultiPlatform] 开始多平台发布:', publishData);

            const response = await fetch(`${API_BASE}/workflow/multi-execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(publishData)
            });

            const data = await response.json();

            if (data.success) {
                setExecutionResults(data.results || []);
                setExecutionStatus('completed');
                console.log('[MultiPlatform] 多平台发布完成:', data);
            } else {
                throw new Error(data.error || '发布失败');
            }

        } catch (error) {
            console.error('[MultiPlatform] 发布失败:', error);
            setExecutionStatus('error');
            setExecutionResults([{
                platform: 'system',
                platformName: '系统',
                success: false,
                error: error.message
            }]);
        }
    };

    // ==================== 工具函数 ====================
    const resetWorkflow = () => {
        setCurrentStep(1);
        setVideoFile(null);
        setSelectedPlatforms([]);
        setPlatformBrowserMapping({});
        setContentForm({
            title: '',
            description: '',
            location: '',
            tags: [],
            hashtags: []
        });
        setExecutionStatus('idle');
        setExecutionResults([]);
        setContentPreviews([]);
        setUploadProgress(0);
        setError(null);

        // 重置文件输入
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const refreshData = async () => {
        setIsLoading(true);
        try {
            await loadAvailableBrowsers();
            await loadUploadedFiles();
            setError(null);
        } catch (error) {
            setError('刷新数据失败');
        } finally {
            setIsLoading(false);
        }
    };

    // ==================== 组件渲染 ====================

    // 加载状态
    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto p-6 bg-white min-h-screen">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">正在加载系统配置...</p>
                    </div>
                </div>
            </div>
        );
    }

    // 错误状态
    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-6 bg-white min-h-screen">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={initializeComponent}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            重新加载
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 步骤指示器
    const StepIndicator = () => {
        const steps = [
            { number: 1, name: '上传文件' },
            { number: 2, name: '选择平台' },
            { number: 3, name: '配置浏览器' },
            { number: 4, name: '填写内容' },
            { number: 5, name: '执行发布' }
        ];

        return (
            <div className="flex items-center justify-center mb-8">
                {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center">
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${step.number <= currentStep
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-600'
                                    } ${step.number === currentStep ? 'ring-4 ring-blue-200 scale-110' : ''}`}
                            >
                                {step.number}
                            </div>
                            <span className={`text-xs mt-1 text-center ${step.number <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-500'
                                }`}>
                                {step.name}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={`w-16 h-1 mx-4 mt-[-20px] transition-all ${step.number < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>
        );
    };

    // 步骤1: 文件上传组件
    const Step1FileUpload = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">上传视频文件</h2>
                <p className="text-gray-600">选择要发布的视频文件，支持多种格式</p>
            </div>

            {/* 上传区域 */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors">
                <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <div className="mb-4">
                        <label className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors inline-block">
                            <span className="flex items-center space-x-2">
                                <Upload className="w-5 h-5" />
                                <span>选择视频文件</span>
                            </span>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleFileUpload}
                                className="hidden"
                                disabled={executionStatus === 'uploading'}
                            />
                        </label>
                    </div>
                    <p className="text-sm text-gray-500">
                        支持 MP4, AVI, MOV, WMV 等格式，最大 500MB
                    </p>

                    {/* 上传进度 */}
                    {executionStatus === 'uploading' && (
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-sm text-blue-600 mt-2">上传中... {Math.round(uploadProgress)}%</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 已上传文件列表 */}
            {uploadedFiles.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">或选择已上传的文件</h3>
                        <button
                            onClick={refreshData}
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>刷新</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                        {uploadedFiles.map((file, index) => (
                            <div
                                key={index}
                                onClick={() => selectUploadedFile(file)}
                                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${videoFile?.id === file.id
                                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <Video className="w-8 h-8 text-blue-500 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(file.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {videoFile?.id === file.id && (
                                        <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 当前选中文件 */}
            {videoFile && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                已选择: {videoFile.originalName || videoFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                                大小: {((videoFile.size || 0) / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // 步骤2: 平台选择组件
    const Step2PlatformSelection = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">选择发布平台</h2>
                <p className="text-gray-600">选择要发布视频的自媒体平台，支持多平台并行发布</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {availablePlatforms.map((platform) => {
                    const config = platformConfigs[platform.id];
                    const isSelected = selectedPlatforms.includes(platform.id);

                    return (
                        <div
                            key={platform.id}
                            onClick={() => togglePlatform(platform.id)}
                            className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 ${isSelected
                                ? 'border-blue-500 bg-blue-50 transform scale-105 shadow-lg'
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                }`}
                        >
                            <div className="text-center">
                                <div className={`w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center ${config?.color || 'bg-gray-500'
                                    }`}>
                                    <span className="text-2xl">{config?.icon || '📱'}</span>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">{platform.name}</h3>
                                <p className="text-xs text-gray-500 mb-2">
                                    {config?.description || `发布到${platform.name}`}
                                </p>
                                <div className="mb-3">
                                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${platform.status === 'stable'
                                        ? 'bg-green-100 text-green-800'
                                        : platform.status === 'testing'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : platform.status === 'beta'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {platform.status === 'stable' ? '稳定' :
                                            platform.status === 'testing' ? '测试中' :
                                                platform.status === 'beta' ? '公测版' :
                                                    '计划中'}
                                    </span>
                                </div>
                                {isSelected && (
                                    <CheckCircle className="w-6 h-6 text-blue-500 mx-auto" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedPlatforms.length > 0 && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <p className="text-sm text-green-800">
                            已选择 {selectedPlatforms.length} 个平台: {
                                selectedPlatforms.map(id => platformConfigs[id]?.name || id).join(', ')
                            }
                        </p>
                    </div>
                </div>
            )}

            {availablePlatforms.length === 0 && (
                <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
                    <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-yellow-800">暂无可用平台，请检查系统配置</p>
                </div>
            )}
        </div>
    );
    // 步骤3: 浏览器映射组件
    const Step3BrowserMapping = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">配置浏览器实例</h2>
                <p className="text-gray-600">为每个平台选择对应的浏览器实例，确保已登录相应账号</p>
            </div>

            <div className="space-y-4">
                {selectedPlatforms.map((platformId) => {
                    const config = platformConfigs[platformId];
                    const selectedBrowser = platformBrowserMapping[platformId];

                    return (
                        <div key={platformId} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded ${config?.color || 'bg-gray-500'} flex items-center justify-center`}>
                                        <span className="text-white text-sm">{config?.icon || '📱'}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">{config?.name || platformId}</h3>
                                        <p className="text-sm text-gray-500">选择运行该平台的浏览器实例</p>
                                    </div>
                                </div>
                                <div className="w-64">
                                    <select
                                        value={selectedBrowser || ''}
                                        onChange={(e) => updateBrowserMapping(platformId, e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">请选择浏览器实例</option>
                                        {availableBrowsers.map(browser => (
                                            <option key={browser.id} value={browser.id}>
                                                {browser.name} (端口: {browser.debugPort}) - {browser.status === 'running' ? '运行中' : '已停止'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {selectedBrowser && (
                                <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                    <p className="text-xs text-blue-800">
                                        已选择: {availableBrowsers.find(b => b.id === selectedBrowser)?.name}
                                        {availableBrowsers.find(b => b.id === selectedBrowser)?.url &&
                                            ` - 当前页面: ${availableBrowsers.find(b => b.id === selectedBrowser)?.url}`
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 浏览器状态检查 */}
            <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">浏览器状态</h4>
                    <button
                        onClick={refreshData}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>刷新</span>
                    </button>
                </div>

                {availableBrowsers.length === 0 ? (
                    <div className="text-center py-4">
                        <Monitor className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">未找到可用的浏览器实例</p>
                        <p className="text-xs text-gray-500">请确保已启动浏览器并开启调试端口</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availableBrowsers.map(browser => (
                            <div key={browser.id} className="flex items-center space-x-2 text-sm">
                                <div className={`w-2 h-2 rounded-full ${browser.status === 'running' ? 'bg-green-500' : 'bg-gray-400'
                                    }`}></div>
                                <span className="text-gray-700">{browser.name}</span>
                                <span className="text-gray-500">({browser.debugPort})</span>
                                {browser.tabsCount && (
                                    <span className="text-blue-600">{browser.tabsCount} 标签页</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 映射完成检查 */}
            {selectedPlatforms.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-3">配置状态检查</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedPlatforms.map(platformId => {
                            const mapped = !!platformBrowserMapping[platformId];
                            return (
                                <div key={platformId} className="flex items-center space-x-2">
                                    {mapped ?
                                        <CheckCircle className="w-4 h-4 text-green-500" /> :
                                        <XCircle className="w-4 h-4 text-red-500" />
                                    }
                                    <span className={`text-sm ${mapped ? 'text-green-700' : 'text-red-700'}`}>
                                        {platformConfigs[platformId]?.name || platformId}: {mapped ? '已配置' : '未配置'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-xs text-yellow-800">
                            💡 提示: 请确保在对应的浏览器实例中已登录相应平台账号，并打开了发布页面
                        </p>
                    </div>
                </div>
            )}
        </div>
    );

    // 步骤4: 内容表单组件
    const Step4ContentForm = () => {
        // 实时更新预览
        const updatePreview = () => {
            if (selectedPlatforms.length > 0) {
                generateContentPreviews();
            }
        };

        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 左侧: 内容表单 */}
                <div className="space-y-6">
                    <div className="text-center lg:text-left">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">填写发布内容</h2>
                        <p className="text-gray-600">内容将自动适配到各个平台的要求</p>
                    </div>

                    {/* 标题 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            视频标题
                            <span className="text-gray-500 text-xs ml-1">(部分平台必填)</span>
                        </label>
                        <input
                            type="text"
                            value={contentForm.title}
                            onChange={(e) => {
                                updateContentForm('title', e.target.value);
                                updatePreview();
                            }}
                            placeholder="输入视频标题，系统会根据平台要求自动适配..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            maxLength={100}
                        />
                        <div className="flex justify-between mt-1">
                            <p className="text-xs text-gray-500">
                                吸引人的标题有助于提高视频的点击率
                            </p>
                            <p className="text-xs text-gray-400">
                                {contentForm.title.length}/100
                            </p>
                        </div>
                    </div>

                    {/* 描述 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            视频描述 *
                            <span className="text-red-500">必填</span>
                        </label>
                        <textarea
                            value={contentForm.description}
                            onChange={(e) => {
                                updateContentForm('description', e.target.value);
                                updatePreview();
                            }}
                            placeholder="详细描述视频内容，让观众了解视频的精彩之处...&#10;&#10;可以包含:&#10;- 视频主要内容&#10;- 拍摄地点或背景&#10;- 想要传达的信息&#10;- 相关标签或话题"
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            maxLength={2500}
                        />
                        <div className="flex justify-between mt-1">
                            <p className="text-xs text-gray-500">
                                详细描述有助于提高视频的曝光度和搜索排名
                            </p>
                            <p className="text-xs text-gray-400">
                                {contentForm.description.length}/2500
                            </p>
                        </div>
                    </div>

                    {/* 位置 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            位置信息
                            <span className="text-gray-500 text-xs ml-1">(可选)</span>
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={contentForm.location}
                                onChange={(e) => {
                                    updateContentForm('location', e.target.value);
                                    updatePreview();
                                }}
                                placeholder="如：北京市朝阳区、上海外滩、杭州西湖..."
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            添加位置信息有助于本地推荐和发现
                        </p>
                    </div>

                    {/* 标签 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            内容标签
                            <span className="text-gray-500 text-xs ml-1">(用于分类)</span>
                        </label>
                        <div className="flex space-x-2 mb-2">
                            <input
                                id="tag-input"
                                type="text"
                                placeholder="添加标签，如：美食、旅行、生活..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addTag();
                                        updatePreview();
                                    }
                                }}
                                maxLength={20}
                            />
                            <button
                                onClick={() => {
                                    addTag();
                                    updatePreview();
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {contentForm.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                                >
                                    <span>{tag}</span>
                                    <button
                                        onClick={() => {
                                            removeTag(tag);
                                            updatePreview();
                                        }}
                                        className="hover:text-blue-900"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            最多添加 8 个标签，每个标签不超过 20 个字符
                        </p>
                    </div>

                    {/* 话题标签 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            话题标签 (#)
                            <span className="text-gray-500 text-xs ml-1">(用于话题讨论)</span>
                        </label>
                        <div className="flex space-x-2 mb-2">
                            <div className="relative flex-1">
                                <Hash className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    id="hashtag-input"
                                    type="text"
                                    placeholder="添加话题标签，如：生活记录、美好瞬间..."
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addHashtag();
                                            updatePreview();
                                        }
                                    }}
                                    maxLength={30}
                                />
                            </div>
                            <button
                                onClick={() => {
                                    addHashtag();
                                    updatePreview();
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {contentForm.hashtags.map((hashtag, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm"
                                >
                                    <span>#{hashtag}</span>
                                    <button
                                        onClick={() => {
                                            removeHashtag(hashtag);
                                            updatePreview();
                                        }}
                                        className="hover:text-green-900"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            话题标签有助于参与热门讨论，提高内容曝光度
                        </p>
                    </div>

                    {/* 快速填写模板 */}
                    <div className="p-4 bg-gray-50 rounded-lg border">
                        <h4 className="font-medium text-gray-900 mb-2">快速填写模板</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { name: '生活分享', title: '记录美好生活瞬间', desc: '分享日常生活中的美好时刻，记录值得珍藏的回忆。', tags: ['生活', '分享', '记录'], hashtags: ['生活记录', '美好瞬间'] },
                                { name: '美食推荐', title: '这家店太好吃了', desc: '发现了一家超赞的美食店，味道正宗，环境优美，强烈推荐给大家！', tags: ['美食', '推荐', '探店'], hashtags: ['美食推荐', '探店日记'] },
                                { name: '旅行记录', title: '旅行中的美景', desc: '旅行途中遇到的绝美风景，每一帧都像明信片一样美丽。', tags: ['旅行', '风景', '记录'], hashtags: ['旅行日记', '美景分享'] },
                                { name: '技能分享', title: '实用技巧分享', desc: '分享一个超实用的小技巧，学会了能让生活更便利！', tags: ['技巧', '分享', '实用'], hashtags: ['技能分享', '生活技巧'] }
                            ].map((template, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setContentForm(prev => ({
                                            ...prev,
                                            title: template.title,
                                            description: template.desc,
                                            tags: template.tags,
                                            hashtags: template.hashtags
                                        }));
                                        updatePreview();
                                    }}
                                    className="p-2 text-left text-xs border border-gray-200 rounded hover:bg-white hover:shadow-sm transition-all"
                                >
                                    <div className="font-medium text-gray-900">{template.name}</div>
                                    <div className="text-gray-600 mt-1 line-clamp-2">{template.desc.substring(0, 30)}...</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 右侧: 实时预览 */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                            <Eye className="w-5 h-5" />
                            <span>各平台预览效果</span>
                        </h3>

                        {contentPreviews.length === 0 ? (
                            <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                                <Eye className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500 mb-2">填写内容后将显示各平台预览效果</p>
                                <p className="text-xs text-gray-400">系统会自动适配各平台的字数限制和特殊要求</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {contentPreviews.map((preview) => (
                                    <div key={preview.platformId} className={`border rounded-lg p-4 transition-all ${preview.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                                        }`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-6 h-6 rounded ${preview.config?.color || 'bg-gray-500'} flex items-center justify-center`}>
                                                    <span className="text-white text-xs">{preview.config?.icon || '📱'}</span>
                                                </div>
                                                <span className="font-medium text-gray-900">{preview.config?.name || preview.platformId}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                {preview.isValid ? (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 text-red-500" />
                                                )}
                                                <span className={`text-xs font-medium ${preview.isValid ? 'text-green-600' : 'text-red-600'}`}>
                                                    {preview.isValid ? '验证通过' : '需要修改'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            {preview.adaptedContent.title && (
                                                <div className="bg-white rounded p-2">
                                                    <span className="font-medium text-gray-700">标题: </span>
                                                    <span className="text-gray-600">{preview.adaptedContent.title}</span>
                                                    {contentForm.title !== preview.adaptedContent.title && (
                                                        <span className="text-orange-600 text-xs ml-1 px-1 bg-orange-100 rounded">(已适配)</span>
                                                    )}
                                                </div>
                                            )}

                                            <div className="bg-white rounded p-2">
                                                <span className="font-medium text-gray-700">描述: </span>
                                                <div className="text-gray-600 mt-1">
                                                    {preview.adaptedContent.description.length > 150
                                                        ? (
                                                            <details>
                                                                <summary className="cursor-pointer text-blue-600">
                                                                    {preview.adaptedContent.description.substring(0, 150)}...
                                                                    <span className="text-xs">(点击展开)</span>
                                                                </summary>
                                                                <div className="mt-2">{preview.adaptedContent.description}</div>
                                                            </details>
                                                        )
                                                        : preview.adaptedContent.description
                                                    }
                                                </div>
                                                {contentForm.description !== preview.adaptedContent.description && (
                                                    <span className="text-orange-600 text-xs ml-1 px-1 bg-orange-100 rounded">(已适配)</span>
                                                )}
                                            </div>

                                            {preview.adaptedContent.location && (
                                                <div className="bg-white rounded p-2">
                                                    <span className="font-medium text-gray-700">位置: </span>
                                                    <span className="text-gray-600">{preview.adaptedContent.location}</span>
                                                </div>
                                            )}

                                            {/* 平台特性显示 */}
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {preview.config?.features?.supportHashtags && contentForm.hashtags.length > 0 && (
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">支持话题标签</span>
                                                )}
                                                {preview.config?.features?.supportLocation && contentForm.location && (
                                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">支持位置</span>
                                                )}
                                                {preview.config?.features?.needShortTitle && (
                                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">自动生成短标题</span>
                                                )}
                                            </div>
                                        </div>

                                        {preview.warnings.length > 0 && (
                                            <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                                                <p className="text-xs text-yellow-800">
                                                    ⚠️ {preview.warnings.join(', ')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 内容统计 */}
                        {contentForm.description && (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <h4 className="font-medium text-blue-900 mb-2">内容统计</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-blue-700">字数: </span>
                                        <span className="font-medium">{contentForm.description.length}</span>
                                    </div>
                                    <div>
                                        <span className="text-blue-700">标签: </span>
                                        <span className="font-medium">{contentForm.tags.length}</span>
                                    </div>
                                    <div>
                                        <span className="text-blue-700">话题: </span>
                                        <span className="font-medium">{contentForm.hashtags.length}</span>
                                    </div>
                                    <div>
                                        <span className="text-blue-700">平台: </span>
                                        <span className="font-medium">{selectedPlatforms.length}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // 步骤5: 执行结果组件
    const Step5Execution = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {executionStatus === 'executing' ? '正在发布...' :
                        executionStatus === 'completed' ? '发布完成' :
                            executionStatus === 'error' ? '发布失败' : '准备发布'}
                </h2>
                <p className="text-gray-600">
                    {executionStatus === 'executing' ? `请耐心等待，正在并行发布到 ${selectedPlatforms.length} 个平台` :
                        executionStatus === 'completed' ? '查看各平台的发布结果和统计信息' :
                            executionStatus === 'error' ? '部分或全部平台发布失败，请查看详细错误信息' :
                                '即将开始多平台发布，请确保网络连接稳定'}
                </p>
            </div>

            {/* 执行结果 */}
            {executionResults.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>发布结果详情</span>
                    </h3>

                    {executionResults.map((result, index) => {
                        const config = platformConfigs[result.platform];
                        return (
                            <div key={index} className={`border rounded-lg p-4 transition-all ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                                }`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-8 h-8 rounded ${config?.color || 'bg-gray-500'} flex items-center justify-center`}>
                                            <span className="text-white text-sm">{config?.icon || '📱'}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">
                                                {result.platformName || config?.name || result.platform}
                                            </h4>
                                            <p className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                                                {result.success ? '✅ 发布成功' : '❌ 发布失败'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {result.success ? (
                                            <div className="flex items-center space-x-1">
                                                <CheckCircle className="w-6 h-6 text-green-500" />
                                                <span className="text-xs text-green-600 font-medium">SUCCESS</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-1">
                                                <XCircle className="w-6 h-6 text-red-500" />
                                                <span className="text-xs text-red-600 font-medium">FAILED</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 成功详情 */}
                                {result.success && result.result && (
                                    <div className="mt-3 p-3 bg-green-100 rounded border border-green-200">
                                        <h5 className="font-medium text-green-800 mb-2">发布详情</h5>
                                        <div className="text-sm text-green-700 space-y-1">
                                            <p>📝 内容类型: {result.result.workflowType || 'video'}</p>
                                            <p>⏰ 发布时间: {new Date().toLocaleString()}</p>
                                            {result.result.steps && (
                                                <p>📊 执行步骤: {Object.keys(result.result.steps).join(' → ')}</p>
                                            )}
                                            {result.adaptedContent && (
                                                <div className="mt-2 p-2 bg-white rounded border">
                                                    <p className="font-medium text-green-800">已发布内容:</p>
                                                    <p className="text-xs text-gray-600">
                                                        {result.adaptedContent.title && `标题: ${result.adaptedContent.title.substring(0, 50)}...`}
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        描述: {result.adaptedContent.description?.substring(0, 100)}...
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* 错误详情 */}
                                {result.error && (
                                    <div className="mt-3 p-3 bg-red-100 rounded border border-red-200">
                                        <h5 className="font-medium text-red-800 mb-2">错误详情</h5>
                                        <p className="text-sm text-red-700 mb-2">{result.error}</p>

                                        {/* 常见错误解决方案 */}
                                        <div className="mt-2 p-2 bg-white rounded border text-xs">
                                            <p className="font-medium text-red-800 mb-1">可能的解决方案:</p>
                                            <ul className="text-red-700 space-y-1 list-disc list-inside">
                                                <li>检查浏览器是否已登录该平台账号</li>
                                                <li>确认浏览器实例正在运行且可访问</li>
                                                <li>验证网络连接是否稳定</li>
                                                <li>检查平台是否有新的界面变化</li>
                                            </ul>
                                        </div>

                                        {/* 重试按钮 */}
                                        <button
                                            onClick={() => {
                                                // 可以实现单个平台重试逻辑
                                                console.log('重试平台:', result.platform);
                                            }}
                                            className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                        >
                                            重试此平台
                                        </button>
                                    </div>
                                )}

                                {/* 执行时间 */}
                                <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
                                    <span>执行时间: {new Date().toLocaleTimeString()}</span>
                                    {result.result?.executionId && (
                                        <span>执行ID: {result.result.executionId}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* 统计信息 */}
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-4 flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                                <span className="text-white text-xs">📊</span>
                            </div>
                            <span>发布统计报告</span>
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                                <p className="text-2xl font-bold text-blue-600">{executionResults.length}</p>
                                <p className="text-sm text-blue-800">总平台数</p>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                                <p className="text-2xl font-bold text-green-600">
                                    {executionResults.filter(r => r.success).length}
                                </p>
                                <p className="text-sm text-green-800">成功发布</p>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                                <p className="text-2xl font-bold text-red-600">
                                    {executionResults.filter(r => !r.success).length}
                                </p>
                                <p className="text-sm text-red-800">发布失败</p>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                                <p className="text-2xl font-bold text-purple-600">
                                    {executionResults.length > 0 ?
                                        Math.round((executionResults.filter(r => r.success).length / executionResults.length) * 100) : 0
                                    }%
                                </p>
                                <p className="text-sm text-purple-800">成功率</p>
                            </div>
                        </div>

                        {/* 详细分析 */}
                        <div className="mt-4 p-3 bg-white rounded border">
                            <h5 className="font-medium text-gray-900 mb-2">执行分析</h5>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>• 视频文件: {videoFile?.originalName || videoFile?.name}</p>
                                <p>• 文件大小: {videoFile ? ((videoFile.size || 0) / 1024 / 1024).toFixed(2) + ' MB' : '未知'}</p>
                                <p>• 发布模式: 多平台并行发布</p>
                                <p>• 内容长度: 标题 {contentForm.title.length} 字符，描述 {contentForm.description.length} 字符</p>
                                <p>• 执行时间: {new Date().toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* 后续操作建议 */}
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h4 className="font-medium text-yellow-900 mb-2">🎯 后续操作建议</h4>
                        <div className="text-sm text-yellow-800 space-y-2">
                            <div className="flex items-start space-x-2">
                                <span>1.</span>
                                <span>检查各平台的发布状态，确认内容已正确显示</span>
                            </div>
                            <div className="flex items-start space-x-2">
                                <span>2.</span>
                                <span>对于发布失败的平台，可以手动补充发布或稍后重试</span>
                            </div>
                            <div className="flex items-start space-x-2">
                                <span>3.</span>
                                <span>关注各平台的数据表现，优化后续内容策略</span>
                            </div>
                            <div className="flex items-start space-x-2">
                                <span>4.</span>
                                <span>保存成功的配置模板，便于下次快速发布</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 空状态 */}
            {executionResults.length === 0 && executionStatus === 'completed' && (
                <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">未获取到执行结果</p>
                    <p className="text-sm text-gray-500">请检查网络连接或重新执行发布</p>
                </div>
            )}
        </div>
    );

    // 导航按钮组件
    const NavigationButtons = () => {
        const canProceed = () => {
            switch (currentStep) {
                case 1:
                    return !!videoFile;
                case 2:
                    return selectedPlatforms.length > 0;
                case 3:
                    return selectedPlatforms.every(p => platformBrowserMapping[p]);
                case 4:
                    return contentForm.description.trim().length > 0 &&
                        contentPreviews.every(p => p.isValid);
                case 5:
                    return true;
                default:
                    return false;
            }
        };

        const nextStep = () => {
            if (currentStep < 4) {
                setCurrentStep(currentStep + 1);
            } else if (currentStep === 4) {
                setCurrentStep(5);
                // 延迟执行发布，让用户看到步骤5界面
                setTimeout(() => {
                    executeMultiPlatformPublish();
                }, 1000);
            }
        };

        const prevStep = () => {
            if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
            }
        };

        const getNextButtonText = () => {
            if (currentStep < 4) return '下一步';
            if (currentStep === 4) {
                return executionStatus === 'executing' ? '发布中...' : '开始发布';
            }
            return '完成';
        };

        const getNextButtonIcon = () => {
            if (currentStep === 4) {
                return executionStatus === 'executing' ?
                    <Clock className="w-4 h-4 animate-spin" /> :
                    <Play className="w-4 h-4" />;
            }
            return null;
        };

        return (
            <div className="flex items-center justify-between pt-6 border-t bg-gray-50 -mx-6 px-6 -mb-6 pb-6">
                <button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center space-x-2 px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <span>← 上一步</span>
                </button>

                <div className="flex items-center space-x-4">
                    {/* 进度显示 */}
                    <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                        <span>步骤 {currentStep} / 5</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(currentStep / 5) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <button
                        onClick={resetWorkflow}
                        className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        🔄 重置
                    </button>

                    {currentStep < 4 ? (
                        <button
                            onClick={nextStep}
                            disabled={!canProceed()}
                            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <span>{getNextButtonText()}</span>
                            <span>→</span>
                        </button>
                    ) : currentStep === 4 ? (
                        <button
                            onClick={nextStep}
                            disabled={!canProceed() || executionStatus === 'executing'}
                            className="flex items-center space-x-2 px-8 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {getNextButtonIcon()}
                            <span>{getNextButtonText()}</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <span>🔄 重新开始</span>
                        </button>
                    )}
                </div>
            </div>
        );
    };

    // 渲染步骤内容
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return <Step1FileUpload />;
            case 2:
                return <Step2PlatformSelection />;
            case 3:
                return <Step3BrowserMapping />;
            case 4:
                return <Step4ContentForm />;
            case 5:
                return <Step5Execution />;
            default:
                return <Step1FileUpload />;
        }
    };

    // ==================== 主渲染 ====================
    return (
        <div className="max-w-7xl mx-auto p-6 bg-white min-h-screen">
            {/* 头部信息 */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            多平台视频发布工作流
                        </h1>
                        <p className="text-gray-600">
                            一键发布视频到多个自媒体平台，自动适配各平台的内容要求
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={refreshData}
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
                            disabled={isLoading}
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            <span>刷新数据</span>
                        </button>

                        {/* 系统状态指示 */}
                        <div className="flex items-center space-x-2 text-sm">
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-gray-600">系统正常</span>
                            </div>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-600">
                                {availableBrowsers.length} 个浏览器实例
                            </span>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-600">
                                {availablePlatforms.length} 个平台
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 步骤指示器 */}
            <StepIndicator />

            {/* 步骤内容 */}
            <div className="mb-8 min-h-[500px]">
                {renderStepContent()}
            </div>

            {/* 导航按钮 */}
            <NavigationButtons />

            {/* 状态提示 - 固定在右下角 */}
            {executionStatus === 'uploading' && (
                <div className="fixed bottom-4 right-4 p-4 bg-blue-100 rounded-lg border border-blue-200 shadow-lg z-50">
                    <div className="flex items-center space-x-3">
                        <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        <div>
                            <p className="text-blue-800 font-medium">正在上传文件</p>
                            <p className="text-blue-600 text-sm">{Math.round(uploadProgress)}% 完成</p>
                        </div>
                    </div>
                </div>
            )}

            {executionStatus === 'executing' && (
                <div className="fixed bottom-4 right-4 p-4 bg-green-100 rounded-lg border border-green-200 shadow-lg z-50">
                    <div className="flex items-center space-x-3">
                        <div className="animate-pulse w-5 h-5 bg-green-600 rounded-full"></div>
                        <div>
                            <p className="text-green-800 font-medium">正在发布</p>
                            <p className="text-green-600 text-sm">发布到 {selectedPlatforms.length} 个平台</p>
                        </div>
                    </div>
                </div>
            )}

            {executionStatus === 'completed' && executionResults.length > 0 && (
                <div className="fixed bottom-4 right-4 p-4 bg-green-100 rounded-lg border border-green-200 shadow-lg z-50">
                    <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                            <p className="text-green-800 font-medium">发布完成</p>
                            <p className="text-green-600 text-sm">
                                {executionResults.filter(r => r.success).length}/{executionResults.length} 成功
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {executionStatus === 'error' && (
                <div className="fixed bottom-4 right-4 p-4 bg-red-100 rounded-lg border border-red-200 shadow-lg z-50">
                    <div className="flex items-center space-x-3">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <div>
                            <p className="text-red-800 font-medium">发布失败</p>
                            <p className="text-red-600 text-sm">请查看详细错误信息</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiPlatformUI;