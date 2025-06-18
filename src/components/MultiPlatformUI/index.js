// ============ 1. 主组件 MultiPlatformUI.js - 修复版本 ============
// src/components/MultiPlatformUI/index.js
import React, { useEffect } from 'react';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

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
        hasData,
        isReady,
        initializeData,
        refreshData
    } = useAPI();

    // 初始化 - 使用新的 initializeData 方法
    useEffect(() => {
        console.log('[MultiPlatform] 组件挂载，开始初始化...');
        initializeData();
    }, [initializeData]);

    // 渲染加载状态
    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto p-6 bg-white">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 text-lg">正在加载系统配置...</p>
                        <p className="text-gray-500 text-sm mt-2">
                            正在连接后端服务并加载平台配置
                        </p>

                        {/* 加载状态指示器 */}
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                                <span>平台配置</span>
                            </div>
                            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                <span>浏览器实例</span>
                            </div>
                            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                <span>文件列表</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 渲染错误状态（改进版）
    if (error && !hasData) {
        return (
            <div className="max-w-7xl mx-auto pt-6 px-6 bg-white pb-0">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center max-w-md">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">系统初始化失败</h2>
                        <p className="text-red-600 mb-4">{error}</p>

                        <div className="space-y-3">
                            <button
                                onClick={initializeData}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                disabled={isLoading}
                            >
                                {isLoading ? '重新加载中...' : '重新加载'}
                            </button>

                            <div className="text-left p-3 bg-gray-50 rounded-md text-sm">
                                <h3 className="font-medium text-gray-900 mb-2">故障排除:</h3>
                                <ul className="text-gray-600 space-y-1 text-xs">
                                    <li>• 确保后端服务运行在 localhost:3001</li>
                                    <li>• 检查网络连接</li>
                                    <li>• 查看浏览器控制台错误信息</li>
                                    <li>• 确认 CORS 配置正确</li>
                                </ul>
                            </div>
                        </div>
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
                        videoFile={videoFile}
                        contentForm={contentForm}
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
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm transition-colors"
                            disabled={isLoading}
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            <span>刷新数据</span>
                        </button>

                        {/* 系统状态指示 */}
                        <div className="flex items-center space-x-2 text-sm">
                            <div className="flex items-center space-x-1">
                                {isReady ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                                )}
                                <span className={`${isReady ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {isReady ? '系统就绪' : '部分功能受限'}
                                </span>
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

                {/* 错误提示 (非阻塞性) */}
                {error && hasData && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <div className="flex items-center">
                            <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                            <span className="text-yellow-800 text-sm">{error}</span>
                        </div>
                    </div>
                )}
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