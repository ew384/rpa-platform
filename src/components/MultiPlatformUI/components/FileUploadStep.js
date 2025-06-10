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