// ============ 5. 状态提示组件 ============
// src/components/MultiPlatformUI/components/StatusToasts.js
import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const StatusToasts = ({ executionStatus, uploadProgress, selectedPlatforms, executionResults }) => {
    return (
        <>
            {/* 上传状态 */}
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

            {/* 执行状态 */}
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

            {/* 完成状态 */}
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

            {/* 错误状态 */}
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
        </>
    );
};

export default StatusToasts;