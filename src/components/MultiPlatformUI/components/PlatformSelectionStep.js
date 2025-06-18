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
                                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    {platform.id === 'wechat' ? (
                                        <img src="/logos/wechat_shipinghao.png" alt="微信视频号" className="w-16 h-16 object-contain" />
                                    ) : platform.id === 'douyin' ? (
                                        <img src="/logos/douyin.png" alt="抖音" className="w-16 h-16 object-contain" />
                                    ) : platform.id === 'xiaohongshu' ? (
                                        <img src="/logos/xiaohongshu.jpg" alt="小红书" className="w-16 h-16 object-contain" />
                                    ) : platform.id === 'kuaishou' ? (
                                        <img src="/logos/kuaishou.png" alt="快手" className="w-16 h-16 object-contain" />
                                    ) : (
                                        <span className="text-3xl">{config?.icon || '📱'}</span>
                                    )}
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">{platform.name}</h3>

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