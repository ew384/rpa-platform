// ============ 10. 内容表单步骤组件 ============
// src/components/MultiPlatformUI/components/ContentFormStep.js
import React from 'react';
import { MapPin, Hash, Plus, X, Eye, CheckCircle, XCircle } from 'lucide-react';

const ContentFormStep = ({
    selectedPlatforms,
    platformConfigs,
    contentForm,
    setContentForm,
    contentPreviews,
    setContentPreviews
}) => {
    const API_BASE = 'http://localhost:3211/api';

    const updateContentForm = (field, value) => {
        setContentForm(prev => ({
            ...prev,
            [field]: value
        }));
        updatePreview();
    };

    const addTag = () => {
        const input = document.getElementById('tag-input');
        const tag = input.value.trim();
        if (tag && !contentForm.tags.includes(tag)) {
            setContentForm(prev => ({
                ...prev,
                tags: [...prev.tags, tag]
            }));
            input.value = '';
            updatePreview();
        }
    };

    const removeTag = (tagToRemove) => {
        setContentForm(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
        updatePreview();
    };

    const addHashtag = () => {
        const input = document.getElementById('hashtag-input');
        let hashtag = input.value.trim();

        if (hashtag.startsWith('#')) {
            hashtag = hashtag.substring(1);
        }

        if (hashtag && !contentForm.hashtags.includes(hashtag)) {
            setContentForm(prev => ({
                ...prev,
                hashtags: [...prev.hashtags, hashtag]
            }));
            input.value = '';
            updatePreview();
        }
    };

    const removeHashtag = (hashtagToRemove) => {
        setContentForm(prev => ({
            ...prev,
            hashtags: prev.hashtags.filter(hashtag => hashtag !== hashtagToRemove)
        }));
        updatePreview();
    };

    const updatePreview = async () => {
        if (selectedPlatforms.length === 0) return;

        try {
            const response = await fetch(`${API_BASE}/platforms/adapt-multi`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    platforms: selectedPlatforms,
                    content: contentForm
                })
            });

            const data = await response.json();
            if (data.success) {
                const previews = data.results.map(result => ({
                    platformId: result.platformId,
                    config: platformConfigs[result.platformId],
                    adaptedContent: result.adaptedContent,
                    isValid: result.validation.valid,
                    warnings: result.validation.errors || []
                }));

                setContentPreviews(previews);
            }
        } catch (error) {
            console.error('生成内容预览失败:', error);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左侧: 内容表单 */}
            <div className="space-y-6">
                <div className="text-center lg:text-left">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">填写发布内容</h2>
                    <p className="text-gray-600">内容将自动适配到各个平台的要求</p>
                </div>

                {/* 标题 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        视频标题
                        <span className="text-gray-500 text-xs ml-1">(部分平台必填)</span>
                    </label>
                    <input
                        type="text"
                        value={contentForm.title}
                        onChange={(e) => {
                            updateContentForm('title', e.target.value);
                            updatePreview();
                        }}
                        placeholder="输入视频标题，系统会根据平台要求自动适配..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        maxLength={100}
                    />
                    <div className="flex justify-between mt-1">
                        <p className="text-xs text-gray-500">
                            吸引人的标题有助于提高视频的点击率
                        </p>
                        <p className="text-xs text-gray-400">
                            {contentForm.title.length}/100
                        </p>
                    </div>
                </div>

                {/* 描述 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        视频描述 *
                        <span className="text-red-500">必填</span>
                    </label>
                    <textarea
                        value={contentForm.description}
                        onChange={(e) => {
                            updateContentForm('description', e.target.value);
                            updatePreview();
                        }}
                        placeholder="详细描述视频内容，让观众了解视频的精彩之处...&#10;&#10;可以包含:&#10;- 视频主要内容&#10;- 拍摄地点或背景&#10;- 想要传达的信息&#10;- 相关标签或话题"
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        maxLength={2500}
                    />
                    <div className="flex justify-between mt-1">
                        <p className="text-xs text-gray-500">
                            详细描述有助于提高视频的曝光度和搜索排名
                        </p>
                        <p className="text-xs text-gray-400">
                            {contentForm.description.length}/2500
                        </p>
                    </div>
                </div>

                {/* 位置 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        位置信息
                        <span className="text-gray-500 text-xs ml-1">(可选)</span>
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={contentForm.location}
                            onChange={(e) => {
                                updateContentForm('location', e.target.value);
                                updatePreview();
                            }}
                            placeholder="如：北京市朝阳区、上海外滩、杭州西湖..."
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        添加位置信息有助于本地推荐和发现
                    </p>
                </div>

                {/* 标签 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        内容标签
                        <span className="text-gray-500 text-xs ml-1">(用于分类)</span>
                    </label>
                    <div className="flex space-x-2 mb-2">
                        <input
                            id="tag-input"
                            type="text"
                            placeholder="添加标签，如：美食、旅行、生活..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addTag();
                                    updatePreview();
                                }
                            }}
                            maxLength={20}
                        />
                        <button
                            onClick={() => {
                                addTag();
                                updatePreview();
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {contentForm.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                            >
                                <span>{tag}</span>
                                <button
                                    onClick={() => {
                                        removeTag(tag);
                                        updatePreview();
                                    }}
                                    className="hover:text-blue-900"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        最多添加 8 个标签，每个标签不超过 20 个字符
                    </p>
                </div>

                {/* 话题标签 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        话题标签 (#)
                        <span className="text-gray-500 text-xs ml-1">(用于话题讨论)</span>
                    </label>
                    <div className="flex space-x-2 mb-2">
                        <div className="relative flex-1">
                            <Hash className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input
                                id="hashtag-input"
                                type="text"
                                placeholder="添加话题标签，如：生活记录、美好瞬间..."
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addHashtag();
                                        updatePreview();
                                    }
                                }}
                                maxLength={30}
                            />
                        </div>
                        <button
                            onClick={() => {
                                addHashtag();
                                updatePreview();
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {contentForm.hashtags.map((hashtag, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm"
                            >
                                <span>#{hashtag}</span>
                                <button
                                    onClick={() => {
                                        removeHashtag(hashtag);
                                        updatePreview();
                                    }}
                                    className="hover:text-green-900"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        话题标签有助于参与热门讨论，提高内容曝光度
                    </p>
                </div>

                {/* 快速填写模板 */}
                <div className="p-4 bg-gray-50 rounded-lg border">
                    <h4 className="font-medium text-gray-900 mb-2">快速填写模板</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { name: '生活分享', title: '记录美好生活瞬间', desc: '分享日常生活中的美好时刻，记录值得珍藏的回忆。', tags: ['生活', '分享', '记录'], hashtags: ['生活记录', '美好瞬间'] },
                            { name: '美食推荐', title: '这家店太好吃了', desc: '发现了一家超赞的美食店，味道正宗，环境优美，强烈推荐给大家！', tags: ['美食', '推荐', '探店'], hashtags: ['美食推荐', '探店日记'] },
                            { name: '旅行记录', title: '旅行中的美景', desc: '旅行途中遇到的绝美风景，每一帧都像明信片一样美丽。', tags: ['旅行', '风景', '记录'], hashtags: ['旅行日记', '美景分享'] },
                            { name: '技能分享', title: '实用技巧分享', desc: '分享一个超实用的小技巧，学会了能让生活更便利！', tags: ['技巧', '分享', '实用'], hashtags: ['技能分享', '生活技巧'] }
                        ].map((template, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setContentForm(prev => ({
                                        ...prev,
                                        title: template.title,
                                        description: template.desc,
                                        tags: template.tags,
                                        hashtags: template.hashtags
                                    }));
                                    updatePreview();
                                }}
                                className="p-2 text-left text-xs border border-gray-200 rounded hover:bg-white hover:shadow-sm transition-all"
                            >
                                <div className="font-medium text-gray-900">{template.name}</div>
                                <div className="text-gray-600 mt-1 line-clamp-2">{template.desc.substring(0, 30)}...</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 右侧: 实时预览 */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <Eye className="w-5 h-5" />
                        <span>各平台预览效果</span>
                    </h3>

                    {contentPreviews.length === 0 ? (
                        <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                            <Eye className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 mb-2">填写内容后将显示各平台预览效果</p>
                            <p className="text-xs text-gray-400">系统会自动适配各平台的字数限制和特殊要求</p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {contentPreviews.map((preview) => (
                                <div key={preview.platformId} className={`border rounded-lg p-4 transition-all ${preview.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                                    }`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-6 h-6 rounded ${preview.config?.color || 'bg-gray-500'} flex items-center justify-center`}>
                                                <span className="text-white text-xs">{preview.config?.icon || '📱'}</span>
                                            </div>
                                            <span className="font-medium text-gray-900">{preview.config?.name || preview.platformId}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            {preview.isValid ? (
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-red-500" />
                                            )}
                                            <span className={`text-xs font-medium ${preview.isValid ? 'text-green-600' : 'text-red-600'}`}>
                                                {preview.isValid ? '验证通过' : '需要修改'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        {preview.adaptedContent.title && (
                                            <div className="bg-white rounded p-2">
                                                <span className="font-medium text-gray-700">标题: </span>
                                                <span className="text-gray-600">{preview.adaptedContent.title}</span>
                                                {contentForm.title !== preview.adaptedContent.title && (
                                                    <span className="text-orange-600 text-xs ml-1 px-1 bg-orange-100 rounded">(已适配)</span>
                                                )}
                                            </div>
                                        )}

                                        <div className="bg-white rounded p-2">
                                            <span className="font-medium text-gray-700">描述: </span>
                                            <div className="text-gray-600 mt-1">
                                                {preview.adaptedContent.description.length > 150
                                                    ? (
                                                        <details>
                                                            <summary className="cursor-pointer text-blue-600">
                                                                {preview.adaptedContent.description.substring(0, 150)}...
                                                                <span className="text-xs">(点击展开)</span>
                                                            </summary>
                                                            <div className="mt-2">{preview.adaptedContent.description}</div>
                                                        </details>
                                                    )
                                                    : preview.adaptedContent.description
                                                }
                                            </div>
                                            {contentForm.description !== preview.adaptedContent.description && (
                                                <span className="text-orange-600 text-xs ml-1 px-1 bg-orange-100 rounded">(已适配)</span>
                                            )}
                                        </div>

                                        {preview.adaptedContent.location && (
                                            <div className="bg-white rounded p-2">
                                                <span className="font-medium text-gray-700">位置: </span>
                                                <span className="text-gray-600">{preview.adaptedContent.location}</span>
                                            </div>
                                        )}

                                        {/* 平台特性显示 */}
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {preview.config?.features?.supportHashtags && contentForm.hashtags.length > 0 && (
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">支持话题标签</span>
                                            )}
                                            {preview.config?.features?.supportLocation && contentForm.location && (
                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">支持位置</span>
                                            )}
                                            {preview.config?.features?.needShortTitle && (
                                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">自动生成短标题</span>
                                            )}
                                        </div>
                                    </div>

                                    {preview.warnings.length > 0 && (
                                        <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                                            <p className="text-xs text-yellow-800">
                                                ⚠️ {preview.warnings.join(', ')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 内容统计 */}
                    {contentForm.description && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-900 mb-2">内容统计</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-blue-700">字数: </span>
                                    <span className="font-medium">{contentForm.description.length}</span>
                                </div>
                                <div>
                                    <span className="text-blue-700">标签: </span>
                                    <span className="font-medium">{contentForm.tags.length}</span>
                                </div>
                                <div>
                                    <span className="text-blue-700">话题: </span>
                                    <span className="font-medium">{contentForm.hashtags.length}</span>
                                </div>
                                <div>
                                    <span className="text-blue-700">平台: </span>
                                    <span className="font-medium">{selectedPlatforms.length}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContentFormStep;