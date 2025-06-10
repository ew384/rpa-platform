// ============ 1. 主组件 MultiPlatformUI.js ============
// src/components/MultiPlatformUI/index.js
import React, { useState, useEffect } from 'react';
import { RefreshCw, Monitor } from 'lucide-react';

// 导入子组件
import StepIndicator from './components/StepIndicator';
import FileUploadStep from './components/FileUploadStep';
import PlatformSelectionStep from './components/PlatformSelectionStep';
import BrowserMappingStep from './components/BrowserMappingStep';
import ContentFormStep from './components/ContentFormStep';
import ExecutionStep from './components/ExecutionStep';
import NavigationButtons from './components/NavigationButtons';
import StatusToasts from './components/StatusToasts';

// 导入工具函数
import { useMultiPlatformState } from './hooks/useMultiPlatformState';
import { useAPI } from './hooks/useAPI';

const MultiPlatformUI = () => {
    // 使用自定义 hooks 管理状态
    const {
        currentStep,
        setCurrentStep,
        videoFile,
        setVideoFile,
        selectedPlatforms,
        setSelectedPlatforms,
        platformBrowserMapping,
        setPlatformBrowserMapping,
        contentForm,
        setContentForm,
        executionStatus,
        setExecutionStatus,
        executionResults,
        setExecutionResults,
        contentPreviews,
        setContentPreviews,
        uploadProgress,
        setUploadProgress,
        resetWorkflow
    } = useMultiPlatformState();

    // 使用 API hook
    const {
        platformConfigs,
        availablePlatforms,
        availableBrowsers,
        uploadedFiles,
        isLoading,
        error,
        loadPlatformConfigs,
        loadAvailableBrowsers,
        loadUploadedFiles,
        refreshData
    } = useAPI();

    // 初始化
    useEffect(() => {
        const initializeComponent = async () => {
            try {
                await loadPlatformConfigs();
                await loadAvailableBrowsers();
                await loadUploadedFiles();
            } catch (error) {
                console.error('[MultiPlatform] 初始化失败:', error);
            }
        };

        initializeComponent();
    }, [loadPlatformConfigs, loadAvailableBrowsers, loadUploadedFiles]);

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
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={refreshData}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            重新加载
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 渲染步骤内容
    const renderStepContent = () => {
        const commonProps = {
            platformConfigs,
            availablePlatforms,
            availableBrowsers,
            uploadedFiles,
            refreshData
        };

        switch (currentStep) {
            case 1:
                return (
                    <FileUploadStep
                        {...commonProps}
                        videoFile={videoFile}
                        setVideoFile={setVideoFile}
                        uploadProgress={uploadProgress}
                        setUploadProgress={setUploadProgress}
                        executionStatus={executionStatus}
                        setExecutionStatus={setExecutionStatus}
                        setCurrentStep={setCurrentStep}
                    />
                );
            case 2:
                return (
                    <PlatformSelectionStep
                        {...commonProps}
                        selectedPlatforms={selectedPlatforms}
                        setSelectedPlatforms={setSelectedPlatforms}
                        setCurrentStep={setCurrentStep}
                    />
                );
            case 3:
                return (
                    <BrowserMappingStep
                        {...commonProps}
                        selectedPlatforms={selectedPlatforms}
                        platformBrowserMapping={platformBrowserMapping}
                        setPlatformBrowserMapping={setPlatformBrowserMapping}
                    />
                );
            case 4:
                return (
                    <ContentFormStep
                        {...commonProps}
                        selectedPlatforms={selectedPlatforms}
                        contentForm={contentForm}
                        setContentForm={setContentForm}
                        contentPreviews={contentPreviews}
                        setContentPreviews={setContentPreviews}
                    />
                );
            case 5:
                return (
                    <ExecutionStep
                        {...commonProps}
                        selectedPlatforms={selectedPlatforms}
                        executionStatus={executionStatus}
                        executionResults={executionResults}
                    />
                );
            default:
                return <FileUploadStep {...commonProps} />;
        }
    };

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
            <StepIndicator currentStep={currentStep} />

            {/* 步骤内容 */}
            <div className="mb-8 min-h-[500px]">
                {renderStepContent()}
            </div>

            {/* 导航按钮 */}
            <NavigationButtons
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                videoFile={videoFile}
                selectedPlatforms={selectedPlatforms}
                platformBrowserMapping={platformBrowserMapping}
                contentForm={contentForm}
                contentPreviews={contentPreviews}
                executionStatus={executionStatus}
                setExecutionStatus={setExecutionStatus}
                setExecutionResults={setExecutionResults}
                resetWorkflow={resetWorkflow}
            />

            {/* 状态提示 */}
            <StatusToasts
                executionStatus={executionStatus}
                uploadProgress={uploadProgress}
                selectedPlatforms={selectedPlatforms}
                executionResults={executionResults}
            />
        </div>
    );
};

export default MultiPlatformUI;

// ============ 2. 状态管理 Hook ============
// src/components/MultiPlatformUI/hooks/useMultiPlatformState.js
import { useState } from 'react';

export const useMultiPlatformState = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [videoFile, setVideoFile] = useState(null);
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
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
    };

    return {
        currentStep,
        setCurrentStep,
        videoFile,
        setVideoFile,
        selectedPlatforms,
        setSelectedPlatforms,
        platformBrowserMapping,
        setPlatformBrowserMapping,
        contentForm,
        setContentForm,
        executionStatus,
        setExecutionStatus,
        executionResults,
        setExecutionResults,
        contentPreviews,
        setContentPreviews,
        uploadProgress,
        setUploadProgress,
        resetWorkflow
    };
};

// ============ 3. API Hook ============
// src/components/MultiPlatformUI/hooks/useAPI.js
import { useState, useCallback } from 'react';

const API_BASE = 'http://localhost:3001/api';

export const useAPI = () => {
    const [platformConfigs, setPlatformConfigs] = useState({});
    const [availablePlatforms, setAvailablePlatforms] = useState([]);
    const [availableBrowsers, setAvailableBrowsers] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadPlatformConfigs = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/platforms`);
            const data = await response.json();

            if (data.success) {
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
    }, []);

    const loadAvailableBrowsers = useCallback(async () => {
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
    }, []);

    const loadUploadedFiles = useCallback(async () => {
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
    }, []);

    const refreshData = useCallback(async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                loadAvailableBrowsers(),
                loadUploadedFiles()
            ]);
            setError(null);
        } catch (error) {
            setError('刷新数据失败');
        } finally {
            setIsLoading(false);
        }
    }, [loadAvailableBrowsers, loadUploadedFiles]);

    return {
        platformConfigs,
        availablePlatforms,
        availableBrowsers,
        uploadedFiles,
        isLoading,
        error,
        loadPlatformConfigs,
        loadAvailableBrowsers,
        loadUploadedFiles,
        refreshData
    };
};

// ============ 4. 步骤指示器组件 ============
// src/components/MultiPlatformUI/components/StepIndicator.js
import React from 'react';

const StepIndicator = ({ currentStep }) => {
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

export default StepIndicator;

