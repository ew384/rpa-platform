// ============ 6. 文件上传步骤组件 ============
// src/components/MultiPlatformUI/components/FileUploadStep.js
import React from 'react';
import { Upload, Video, CheckCircle, RefreshCw } from 'lucide-react';

const FileUploadStep = ({
    videoFile,
    setVideoFile,
    uploadedFiles,
    uploadProgress,
    setUploadProgress,
    executionStatus,
    setExecutionStatus,
    setCurrentStep,
    refreshData
}) => {
    const API_BASE = 'http://localhost:3001/api';

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

                // 自动进入下一步
                setTimeout(() => {
                    setCurrentStep(2);
                }, 1000);

                console.log('[FileUpload] 文件上传成功:', data.file);
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
        setCurrentStep(2);
        console.log('[FileUpload] 选择已上传文件:', file.name);
    };

    return (
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
};

export default FileUploadStep;

// ============ 7. 平台选择步骤组件 ============
// src/components/MultiPlatformUI/components/PlatformSelectionStep.js
import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

const PlatformSelectionStep = ({
    availablePlatforms,
    platformConfigs,
    selectedPlatforms,
    setSelectedPlatforms,
    setCurrentStep
}) => {
    const togglePlatform = (platformId) => {
        setSelectedPlatforms(prev => {
            const newSelected = prev.includes(platformId)
                ? prev.filter(id => id !== platformId)
                : [...prev, platformId];

            // 如果有选中的平台，自动进入下一步
            if (newSelected.length > 0 && newSelected.length !== prev.length) {
                setTimeout(() => setCurrentStep(3), 500);
            }

            return newSelected;
        });
    };

    return (
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
};

export default PlatformSelectionStep;

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