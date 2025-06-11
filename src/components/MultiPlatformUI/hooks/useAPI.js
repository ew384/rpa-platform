// src/components/MultiPlatformUI/hooks/useAPI.js - 修复版本
import { useState, useCallback } from 'react';

// 🔧 修复：确保正确的API地址
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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
    const fetchWithTimeout = async (url, options = {}, timeoutMs = 15000) => {
        console.log(`[API] 发起请求: ${url}`);

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

            console.log(`[API] 响应状态: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error(`[API] 非JSON响应:`, text.substring(0, 200));
                throw new Error(`期望JSON响应，但收到: ${contentType}`);
            }

            const data = await response.json();
            console.log(`[API] 响应数据:`, data);
            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error(`请求超时 (${timeoutMs}ms)`);
            }
            console.error(`[API] 请求失败:`, error);
            throw error;
        }
    };

    const loadPlatformConfigs = useCallback(async () => {
        try {
            console.log('[API] 开始加载平台配置...');
            const data = await fetchWithTimeout(`${API_BASE}/platforms`);

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
            setError(`平台配置加载失败: ${error.message}. 当前使用默认配置。`);
            console.log('[API] 🔄 使用默认平台配置');
            return false;
        }
    }, []);

    const loadAvailableBrowsers = useCallback(async () => {
        try {
            console.log('[API] 开始加载浏览器列表...');
            const data = await fetchWithTimeout(`${API_BASE}/browsers`, {}, 10000);

            if (data.success && data.browsers) {
                console.log(`[API] 原始浏览器数据:`, data.browsers);

                // 🔧 修复：处理浏览器数据，确保显示所有信息
                const processedBrowsers = data.browsers.map(browser => ({
                    id: browser.id || browser.accountId,
                    accountId: browser.accountId,
                    name: browser.name || `浏览器-${browser.id}`,
                    status: browser.status || 'unknown',
                    debugPort: browser.debugPort,
                    url: browser.url,
                    tabsCount: browser.tabsCount || 0,
                    chromeVersion: browser.chromeVersion,
                    group: browser.group,
                    createdAt: browser.createdAt,
                    lastActive: browser.lastActive
                }));

                setAvailableBrowsers(processedBrowsers);
                console.log(`[API] ✅ 浏览器列表加载成功: ${processedBrowsers.length} 个浏览器`);
                console.log(`[API] 运行中的浏览器:`, processedBrowsers.filter(b => b.status === 'running'));

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
            const data = await fetchWithTimeout(`${API_BASE}/files`, {}, 8000);

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
        setError(null); // 清除之前的错误

        try {
            // 并行加载浏览器和文件数据
            const [browserResult, filesResult] = await Promise.allSettled([
                loadAvailableBrowsers(),
                loadUploadedFiles()
            ]);

            console.log('[API] 浏览器加载结果:', browserResult.status, browserResult.value);
            console.log('[API] 文件加载结果:', filesResult.status, filesResult.value);

            // 🔧 修复：更好的错误处理
            if (browserResult.status === 'rejected') {
                console.error('[API] 浏览器数据刷新失败:', browserResult.reason);
            }
            if (filesResult.status === 'rejected') {
                console.error('[API] 文件数据刷新失败:', filesResult.reason);
            }

        } catch (error) {
            console.error('[API] ❌ 数据刷新失败:', error);
            setError('数据刷新部分失败');
        } finally {
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
            console.log('[API] 步骤1: 加载平台配置...');
            const platformResult = await loadPlatformConfigs();

            // 2. 并行加载其他数据（失败不影响应用启动）
            console.log('[API] 步骤2: 加载浏览器和文件数据...');
            const [browserResult, filesResult] = await Promise.allSettled([
                loadAvailableBrowsers(),
                loadUploadedFiles()
            ]);

            console.log('[API] 初始化结果:', {
                platform: platformResult,
                browser: browserResult.status,
                browserValue: browserResult.value,
                files: filesResult.status,
                filesValue: filesResult.value
            });

            // 🔧 修复：更详细的状态报告
            const browserSuccess = browserResult.status === 'fulfilled' && browserResult.value;
            const filesSuccess = filesResult.status === 'fulfilled' && filesResult.value;

            if (platformResult) {
                if (browserSuccess && filesSuccess) {
                    console.log('[API] ✅ 系统完全初始化成功');
                } else if (browserSuccess || filesSuccess) {
                    console.log('[API] ✅ 系统部分初始化成功');
                    setError('部分功能可能受限，某些服务连接失败');
                } else {
                    console.log('[API] ⚠️ 系统初始化完成，但外部服务连接失败');
                    setError('外部服务连接失败，核心功能可用');
                }
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

    // 🔧 新增：获取系统状态信息
    const getSystemStatus = useCallback(() => {
        const runningBrowsers = availableBrowsers.filter(b => b.status === 'running');
        const totalBrowsers = availableBrowsers.length;

        return {
            platforms: {
                total: availablePlatforms.length,
                available: availablePlatforms.filter(p => p.status !== 'disabled').length
            },
            browsers: {
                total: totalBrowsers,
                running: runningBrowsers.length,
                stopped: totalBrowsers - runningBrowsers.length,
                details: availableBrowsers.map(b => ({
                    id: b.id,
                    name: b.name,
                    status: b.status,
                    port: b.debugPort,
                    url: b.url
                }))
            },
            files: {
                total: uploadedFiles.length
            },
            api: {
                baseUrl: API_BASE,
                connected: !error || availablePlatforms.length > 0
            }
        };
    }, [availablePlatforms, availableBrowsers, uploadedFiles, error]);

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
        getSystemStatus,

        // 辅助信息
        hasData: availablePlatforms.length > 0,
        isReady: !isLoading && availablePlatforms.length > 0,

        // 🔧 新增：更详细的状态信息
        systemStatus: getSystemStatus()
    };
};