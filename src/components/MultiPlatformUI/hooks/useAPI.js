// src/components/MultiPlatformUI/hooks/useAPI.js - 修复版本
import { useState, useCallback } from 'react';

// 🔧 修复：使用环境变量，并提供后备选项
const API_BASE = process.env.REACT_APP_API_URL || '/api';

console.log('[API] 使用API基础地址:', API_BASE);
console.log('[API] 环境变量:', process.env.NODE_ENV);

export const useAPI = () => {
    const [platformConfigs, setPlatformConfigs] = useState({});
    const [availablePlatforms, setAvailablePlatforms] = useState([]);
    const [availableBrowsers, setAvailableBrowsers] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // 🔧 修复：创建一个通用的fetch函数，处理超时和错误
    const fetchWithTimeout = async (url, options = {}, timeoutMs = 10000) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`期望JSON响应，但收到: ${contentType}\n响应内容: ${text.substring(0, 200)}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error(`请求超时 (${timeoutMs}ms)`);
            }
            throw error;
        }
    };

    const loadPlatformConfigs = useCallback(async () => {
        try {
            console.log('[API] 开始加载平台配置...');
            console.log('[API] 请求URL:', `${API_BASE}/platforms`);

            const data = await fetchWithTimeout(`${API_BASE}/platforms`);
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
                console.log('[API] ✅ 平台配置加载成功:', Object.keys(configs));
                return true;
            } else {
                throw new Error(data.error || '平台配置加载失败');
            }
        } catch (error) {
            console.error('[API] ❌ 平台配置加载失败:', error);
            console.error('[API] 错误详情:', error.message);

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

            // 设置详细的错误信息
            setError(`平台配置加载失败: ${error.message}. 当前使用默认配置。`);
            console.log('[API] 🔄 使用默认平台配置');
            return false;
        }
    }, []);

    const loadAvailableBrowsers = useCallback(async () => {
        try {
            console.log('[API] 开始加载浏览器列表...');
            console.log('[API] 请求URL:', `${API_BASE}/browsers`);

            const data = await fetchWithTimeout(`${API_BASE}/browsers`, {}, 8000);
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
            setAvailableBrowsers([]);
            return false;
        }
    }, []);

    const loadUploadedFiles = useCallback(async () => {
        try {
            console.log('[API] 开始加载文件列表...');
            console.log('[API] 请求URL:', `${API_BASE}/files`);

            const data = await fetchWithTimeout(`${API_BASE}/files`, {}, 5000);
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
        console.log('[API] 当前环境:', process.env.NODE_ENV);
        console.log('[API] API基础地址:', API_BASE);

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
        initializeData,

        // 辅助信息
        hasData: availablePlatforms.length > 0,
        isReady: !isLoading && availablePlatforms.length > 0
    };
};