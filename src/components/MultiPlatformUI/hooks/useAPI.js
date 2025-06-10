// ============ 3. API Hook - 修复版本 ============
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
            console.log('[API] 开始加载平台配置...');

            const response = await fetch(`${API_BASE}/platforms`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                // 添加超时处理
                signal: AbortSignal.timeout(10000) // 10秒超时
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('[API] 平台配置响应:', data);

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
                console.log('[API] ✅ 平台配置加载成功:', configs);
                return true;
            } else {
                throw new Error(data.error || '平台配置加载失败');
            }
        } catch (error) {
            console.error('[API] ❌ 平台配置加载失败:', error);

            // 使用增强的默认配置作为后备
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
                    },
                    features: {
                        useIframe: true,
                        needShortTitle: true,
                        supportLocation: true
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
                    },
                    features: {
                        needClickUpload: true,
                        supportHashtags: true
                    }
                },
                {
                    id: 'xiaohongshu',
                    name: '小红书',
                    icon: '📝',
                    color: 'bg-red-500',
                    status: 'testing',
                    fields: {
                        title: { required: true, maxLength: 20 },
                        description: { required: true, maxLength: 1000 }
                    }
                },
                {
                    id: 'kuaishou',
                    name: '快手',
                    icon: '⚡',
                    color: 'bg-orange-500',
                    status: 'testing',
                    fields: {
                        title: { required: false },
                        description: { required: true, maxLength: 300 }
                    },
                    features: {
                        noTitle: true
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

            // 设置错误但不阻塞应用
            setError(`平台配置加载失败，使用默认配置: ${error.message}`);
            console.log('[API] 🔄 使用默认平台配置');
            return false;
        }
    }, []);

    const loadAvailableBrowsers = useCallback(async () => {
        try {
            console.log('[API] 开始加载浏览器列表...');

            const response = await fetch(`${API_BASE}/browsers`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: AbortSignal.timeout(8000) // 8秒超时
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('[API] 浏览器列表响应:', data);

            if (data.success) {
                const runningBrowsers = data.browsers.filter(b => b.status === 'running');
                setAvailableBrowsers(runningBrowsers);
                console.log(`[API] ✅ 浏览器列表加载成功: ${runningBrowsers.length} 个运行中`);
                return true;
            } else {
                throw new Error(data.error || '浏览器列表加载失败');
            }
        } catch (error) {
            console.error('[API] ⚠️ 浏览器列表加载失败:', error);
            // 浏览器列表失败不阻塞应用，设置空数组
            setAvailableBrowsers([]);
            return false;
        }
    }, []);

    const loadUploadedFiles = useCallback(async () => {
        try {
            console.log('[API] 开始加载文件列表...');

            const response = await fetch(`${API_BASE}/files`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: AbortSignal.timeout(5000) // 5秒超时
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('[API] 文件列表响应:', data);

            if (data.success) {
                const videoFiles = data.files.filter(file => file.type === 'video');
                setUploadedFiles(videoFiles);
                console.log(`[API] ✅ 文件列表加载成功: ${videoFiles.length} 个视频文件`);
                return true;
            } else {
                throw new Error(data.error || '文件列表加载失败');
            }
        } catch (error) {
            console.error('[API] ⚠️ 文件列表加载失败:', error);
            // 文件列表失败不阻塞应用，设置空数组
            setUploadedFiles([]);
            return false;
        }
    }, []);

    const refreshData = useCallback(async () => {
        console.log('[API] 🔄 开始刷新数据...');
        setIsLoading(true);
        setError(null);

        try {
            // 并行加载浏览器和文件数据
            const [browserResult, filesResult] = await Promise.allSettled([
                loadAvailableBrowsers(),
                loadUploadedFiles()
            ]);

            // 记录结果但不因为失败而终止
            console.log('[API] 浏览器加载结果:', browserResult.status);
            console.log('[API] 文件加载结果:', filesResult.status);

        } catch (error) {
            console.error('[API] ❌ 数据刷新失败:', error);
            setError('数据刷新部分失败');
        } finally {
            setIsLoading(false);
            console.log('[API] 🔄 数据刷新完成');
        }
    }, [loadAvailableBrowsers, loadUploadedFiles]);

    // 初始化加载函数
    const initializeData = useCallback(async () => {
        console.log('[API] 🚀 开始初始化系统数据...');
        setIsLoading(true);
        setError(null);

        try {
            // 1. 首先加载平台配置（最重要）
            const platformResult = await loadPlatformConfigs();

            // 2. 并行加载其他数据（失败不影响应用启动）
            const [browserResult, filesResult] = await Promise.allSettled([
                loadAvailableBrowsers(),
                loadUploadedFiles()
            ]);

            console.log('[API] 初始化结果:', {
                platform: platformResult,
                browser: browserResult.status,
                files: filesResult.status
            });

            // 只要平台配置成功就算初始化成功
            if (platformResult) {
                console.log('[API] ✅ 系统初始化成功');
            } else {
                console.log('[API] 🔄 系统初始化完成（使用默认配置）');
            }

        } catch (error) {
            console.error('[API] ❌ 系统初始化失败:', error);
            setError(`系统初始化失败: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [loadPlatformConfigs, loadAvailableBrowsers, loadUploadedFiles]);

    return {
        // 数据状态
        platformConfigs,
        availablePlatforms,
        availableBrowsers,
        uploadedFiles,
        isLoading,
        error,

        // 方法
        loadPlatformConfigs,
        loadAvailableBrowsers,
        loadUploadedFiles,
        refreshData,
        initializeData, // 新增初始化方法

        // 辅助信息
        hasData: availablePlatforms.length > 0,
        isReady: !isLoading && availablePlatforms.length > 0
    };
};