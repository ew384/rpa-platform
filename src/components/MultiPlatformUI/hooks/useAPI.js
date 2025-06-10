// ============ 3. API Hook ============
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
            const response = await fetch(`${API_BASE}/platforms`);
            const data = await response.json();

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
                console.log('[MultiPlatform] 平台配置加载成功:', configs);
            } else {
                throw new Error(data.error || '加载平台配置失败');
            }
        } catch (error) {
            console.error('加载平台配置失败:', error);
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
        }
    }, []);

    const loadAvailableBrowsers = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/browsers`);
            const data = await response.json();
            if (data.success) {
                setAvailableBrowsers(data.browsers.filter(b => b.status === 'running'));
                console.log('[MultiPlatform] 浏览器列表加载成功:', data.browsers.length);
            }
        } catch (error) {
            console.error('加载浏览器失败:', error);
        }
    }, []);

    const loadUploadedFiles = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/files`);
            const data = await response.json();
            if (data.success) {
                setUploadedFiles(data.files.filter(file => file.type === 'video'));
                console.log('[MultiPlatform] 文件列表加载成功:', data.files.length);
            }
        } catch (error) {
            console.error('加载文件失败:', error);
        }
    }, []);

    const refreshData = useCallback(async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                loadAvailableBrowsers(),
                loadUploadedFiles()
            ]);
            setError(null);
        } catch (error) {
            setError('刷新数据失败');
        } finally {
            setIsLoading(false);
        }
    }, [loadAvailableBrowsers, loadUploadedFiles]);

    return {
        platformConfigs,
        availablePlatforms,
        availableBrowsers,
        uploadedFiles,
        isLoading,
        error,
        loadPlatformConfigs,
        loadAvailableBrowsers,
        loadUploadedFiles,
        refreshData
    };
};
