// ============ 9. 浏览器映射步骤组件 ============
// src/components/MultiPlatformUI/components/BrowserMappingStep.js
import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Monitor, RefreshCw } from 'lucide-react';

const BrowserMappingStep = ({
    selectedPlatforms,
    platformConfigs,
    availableBrowsers,
    platformBrowserMapping,
    setPlatformBrowserMapping,
    refreshData
}) => {
    const updateBrowserMapping = (platformId, browserId) => {
        setPlatformBrowserMapping(prev => ({
            ...prev,
            [platformId]: browserId
        }));
    };

    return (
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
};

export default BrowserMappingStep;

