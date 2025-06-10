// ============ 8. 导航按钮组件 ============
// src/components/MultiPlatformUI/components/NavigationButtons.js
import React from 'react';
import { Play, Clock } from 'lucide-react';

const NavigationButtons = ({
    currentStep,
    setCurrentStep,
    videoFile,
    selectedPlatforms,
    platformBrowserMapping,
    contentForm,
    contentPreviews,
    executionStatus,
    setExecutionStatus,
    setExecutionResults,
    resetWorkflow
}) => {
    const API_BASE = 'http://localhost:3001/api';

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
            alert(`请为以下平台选择浏览器: ${missingMappings.join(', ')}`);
            return;
        }

        try {
            setExecutionStatus('executing');
            setExecutionResults([]);

            const publishData = {
                workflowType: 'multi-platform-video',
                videoFile: videoFile.filename || videoFile.name,
                platforms: selectedPlatforms,
                content: contentForm,
                browserMapping: platformBrowserMapping
            };

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
            } else {
                throw new Error(data.error || '发布失败');
            }

        } catch (error) {
            setExecutionStatus('error');
            setExecutionResults([{
                platform: 'system',
                platformName: '系统',
                success: false,
                error: error.message
            }]);
        }
    };

    const nextStep = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        } else if (currentStep === 4) {
            setCurrentStep(5);
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

export default NavigationButtons;