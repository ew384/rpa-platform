// ============ 11. 执行步骤组件 ============
// src/components/MultiPlatformUI/components/ExecutionStep.js
import React from 'react';
import {
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Play,
    RefreshCw,
    Monitor,
    Upload,
    MessageCircle,
    MapPin
} from 'lucide-react';

const ExecutionStep = ({
    selectedPlatforms,
    platformConfigs,
    executionStatus,
    executionResults,
    videoFile,
    contentForm
}) => {
    // 渲染执行前的准备状态
    const renderPreparationStatus = () => {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">准备发布</h2>
                    <p className="text-gray-600">即将开始多平台发布，请确认以下信息</p>
                </div>

                {/* 发布摘要 */}
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">发布摘要</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 视频信息 */}
                        <div className="bg-white rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <Upload className="w-5 h-5 text-gray-600" />
                                <span className="font-medium text-gray-900">视频文件</span>
                            </div>
                            <p className="text-sm text-gray-600">{videoFile?.originalName || videoFile?.name}</p>
                            <p className="text-xs text-gray-500">
                                大小: {((videoFile?.size || 0) / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>

                        {/* 平台信息 */}
                        <div className="bg-white rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <Monitor className="w-5 h-5 text-gray-600" />
                                <span className="font-medium text-gray-900">目标平台</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {selectedPlatforms.map(platformId => {
                                    const config = platformConfigs[platformId];
                                    return (
                                        <span
                                            key={platformId}
                                            className="inline-flex items-center space-x-1 bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs"
                                        >
                                            <span>{config?.icon || '📱'}</span>
                                            <span>{config?.name || platformId}</span>
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 内容信息 */}
                        <div className="bg-white rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <MessageCircle className="w-5 h-5 text-gray-600" />
                                <span className="font-medium text-gray-900">内容描述</span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-3">
                                {contentForm.description || '无描述'}
                            </p>
                        </div>

                        {/* 位置信息 */}
                        {contentForm.location && (
                            <div className="bg-white rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <MapPin className="w-5 h-5 text-gray-600" />
                                    <span className="font-medium text-gray-900">位置</span>
                                </div>
                                <p className="text-sm text-gray-600">{contentForm.location}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 准备检查清单 */}
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-green-900 mb-4">准备检查清单</h3>
                    <div className="space-y-2">
                        {[
                            { item: '视频文件已上传', status: !!videoFile },
                            { item: '平台已选择', status: selectedPlatforms.length > 0 },
                            { item: '浏览器已配置', status: selectedPlatforms.length > 0 },
                            { item: '内容已填写', status: !!contentForm.description },
                        ].map((check, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                {check.status ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                    <XCircle className="w-4 h-4 text-red-600" />
                                )}
                                <span className={`text-sm ${check.status ? 'text-green-800' : 'text-red-800'}`}>
                                    {check.item}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // 渲染执行中状态
    const renderExecutionStatus = () => {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">正在发布</h2>
                    <p className="text-gray-600">多平台发布正在进行中，请耐心等待...</p>
                </div>

                {/* 总体进度 */}
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="text-lg font-medium text-blue-900">发布进行中...</span>
                    </div>

                    <div className="text-center text-sm text-blue-700">
                        正在同时向 {selectedPlatforms.length} 个平台发布内容
                    </div>
                </div>

                {/* 平台状态列表 */}
                <div className="space-y-3">
                    {selectedPlatforms.map(platformId => {
                        const config = platformConfigs[platformId];
                        return (
                            <div
                                key={platformId}
                                className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded ${config?.color || 'bg-gray-500'} flex items-center justify-center`}>
                                        <span className="text-white text-sm">{config?.icon || '📱'}</span>
                                    </div>
                                    <span className="font-medium text-gray-900">{config?.name || platformId}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 text-yellow-600 animate-pulse" />
                                    <span className="text-sm text-yellow-800">处理中...</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 提示信息 */}
                <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-600 text-center">
                        💡 发布过程可能需要几分钟时间，请不要关闭浏览器
                    </p>
                </div>
            </div>
        );
    };

    // 渲染完成状态
    const renderCompletionStatus = () => {
        const successCount = executionResults.filter(r => r.success).length;
        const failureCount = executionResults.length - successCount;
        const isAllSuccess = failureCount === 0;

        return (
            <div className="space-y-6">
                <div className="text-center">
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isAllSuccess ? 'bg-green-100' : 'bg-yellow-100'
                        }`}>
                        {isAllSuccess ? (
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        ) : (
                            <AlertCircle className="w-10 h-10 text-yellow-600" />
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">发布完成</h2>
                    <p className={`text-lg ${isAllSuccess ? 'text-green-600' : 'text-yellow-600'}`}>
                        成功: {successCount} 个平台，失败: {failureCount} 个平台
                    </p>
                </div>

                {/* 结果统计 */}
                <div className={`rounded-lg p-6 border ${isAllSuccess
                    ? 'bg-green-50 border-green-200'
                    : 'bg-yellow-50 border-yellow-200'
                    }`}>
                    <h3 className={`text-lg font-semibold mb-4 ${isAllSuccess ? 'text-green-900' : 'text-yellow-900'
                        }`}>
                        发布结果统计
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{executionResults.length}</div>
                            <div className="text-sm text-gray-600">总平台数</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{successCount}</div>
                            <div className="text-sm text-gray-600">成功</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{failureCount}</div>
                            <div className="text-sm text-gray-600">失败</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {((successCount / executionResults.length) * 100).toFixed(0)}%
                            </div>
                            <div className="text-sm text-gray-600">成功率</div>
                        </div>
                    </div>
                </div>

                {/* 详细结果 */}
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">详细结果</h3>
                    {executionResults.map((result, index) => {
                        const config = platformConfigs[result.platform];
                        const isSuccess = result.success;

                        return (
                            <div
                                key={index}
                                className={`p-4 rounded-lg border ${isSuccess
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-red-50 border-red-200'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-8 h-8 rounded ${config?.color || 'bg-gray-500'} flex items-center justify-center`}>
                                            <span className="text-white text-sm">{config?.icon || '📱'}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-900">
                                                {result.platformName || config?.name || result.platform}
                                            </span>
                                            {!isSuccess && result.error && (
                                                <p className="text-sm text-red-600 mt-1">
                                                    错误: {result.error}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {isSuccess ? (
                                            <>
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                <span className="text-sm font-medium text-green-800">发布成功</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-5 h-5 text-red-600" />
                                                <span className="text-sm font-medium text-red-800">发布失败</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* 显示成功的详细信息 */}
                                {isSuccess && result.result && (
                                    <div className="mt-3 p-3 bg-white rounded border">
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">发布详情</h4>
                                        <div className="text-xs text-gray-600 space-y-1">
                                            {result.result.steps && (
                                                <div>执行步骤: {Object.keys(result.result.steps).join(', ')}</div>
                                            )}
                                            {result.adaptedContent && (
                                                <div>内容已自动适配该平台要求</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* 操作建议 */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">下一步建议</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                        {isAllSuccess ? (
                            <>
                                <li>• 所有平台发布成功，您可以前往各平台查看发布状态</li>
                                <li>• 建议关注各平台的数据表现和用户反馈</li>
                                <li>• 可以开始准备下一次内容发布</li>
                            </>
                        ) : (
                            <>
                                <li>• 检查失败平台的错误信息并尝试手动发布</li>
                                <li>• 确认失败平台的浏览器登录状态</li>
                                <li>• 可以单独重试失败的平台</li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        );
    };

    // 渲染错误状态
    const renderErrorStatus = () => {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <XCircle className="w-10 h-10 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">发布失败</h2>
                    <p className="text-red-600">多平台发布过程中出现错误</p>
                </div>

                <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                    <h3 className="text-lg font-semibold text-red-900 mb-4">错误详情</h3>
                    {executionResults.length > 0 ? (
                        <div className="space-y-3">
                            {executionResults.map((result, index) => (
                                <div key={index} className="p-3 bg-white rounded border">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <XCircle className="w-4 h-4 text-red-600" />
                                        <span className="font-medium text-gray-900">
                                            {result.platformName || result.platform}
                                        </span>
                                    </div>
                                    <p className="text-sm text-red-600">
                                        {result.error || '未知错误'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-red-800">
                            发布过程中出现系统错误，请检查网络连接和后端服务状态
                        </p>
                    )}
                </div>

                {/* 故障排除建议 */}
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-yellow-900 mb-2">故障排除建议</h4>
                    <ul className="text-sm text-yellow-800 space-y-1">
                        <li>• 检查网络连接是否正常</li>
                        <li>• 确认后端服务运行状态</li>
                        <li>• 验证浏览器实例是否正常运行</li>
                        <li>• 检查各平台账号登录状态</li>
                        <li>• 查看浏览器开发者工具的错误信息</li>
                    </ul>
                </div>
            </div>
        );
    };

    // 根据执行状态渲染不同内容
    const renderContent = () => {
        switch (executionStatus) {
            case 'idle':
                return renderPreparationStatus();
            case 'executing':
                return renderExecutionStatus();
            case 'completed':
                return renderCompletionStatus();
            case 'error':
                return renderErrorStatus();
            default:
                return renderPreparationStatus();
        }
    };

    return (
        <div className="space-y-6">
            {renderContent()}

            {/* 调试信息 (开发环境) */}
            {process.env.NODE_ENV === 'development' && (
                <details className="mt-8">
                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                        调试信息 (开发环境)
                    </summary>
                    <div className="mt-2 p-4 bg-gray-100 rounded text-xs">
                        <div className="space-y-2">
                            <div><strong>执行状态:</strong> {executionStatus}</div>
                            <div><strong>选中平台:</strong> {selectedPlatforms.join(', ')}</div>
                            <div><strong>视频文件:</strong> {videoFile?.name || '无'}</div>
                            <div><strong>结果数量:</strong> {executionResults.length}</div>
                            {executionResults.length > 0 && (
                                <div>
                                    <strong>执行结果:</strong>
                                    <pre className="mt-1 text-xs bg-white p-2 rounded overflow-auto max-h-32">
                                        {JSON.stringify(executionResults, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </details>
            )}
        </div>
    );
};

export default ExecutionStep;