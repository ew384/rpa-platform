// ============ 2. 状态管理 Hook ============
// src/components/MultiPlatformUI/hooks/useMultiPlatformState.js
import { useState } from 'react';

export const useMultiPlatformState = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [videoFile, setVideoFile] = useState(null);
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    const [platformBrowserMapping, setPlatformBrowserMapping] = useState({});
    const [contentForm, setContentForm] = useState({
        title: '',
        description: '',
        location: '',
        tags: [],
        hashtags: []
    });
    const [executionStatus, setExecutionStatus] = useState('idle');
    const [executionResults, setExecutionResults] = useState([]);
    const [contentPreviews, setContentPreviews] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);

    const resetWorkflow = () => {
        setCurrentStep(1);
        setVideoFile(null);
        setSelectedPlatforms([]);
        setPlatformBrowserMapping({});
        setContentForm({
            title: '',
            description: '',
            location: '',
            tags: [],
            hashtags: []
        });
        setExecutionStatus('idle');
        setExecutionResults([]);
        setContentPreviews([]);
        setUploadProgress(0);
    };

    return {
        currentStep,
        setCurrentStep,
        videoFile,
        setVideoFile,
        selectedPlatforms,
        setSelectedPlatforms,
        platformBrowserMapping,
        setPlatformBrowserMapping,
        contentForm,
        setContentForm,
        executionStatus,
        setExecutionStatus,
        executionResults,
        setExecutionResults,
        contentPreviews,
        setContentPreviews,
        uploadProgress,
        setUploadProgress,
        resetWorkflow
    };
};

