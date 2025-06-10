// ============ 4. 步骤指示器组件 ============
// src/components/MultiPlatformUI/components/StepIndicator.js
import React from 'react';

const StepIndicator = ({ currentStep }) => {
    const steps = [
        { number: 1, name: '上传文件' },
        { number: 2, name: '选择平台' },
        { number: 3, name: '配置浏览器' },
        { number: 4, name: '填写内容' },
        { number: 5, name: '执行发布' }
    ];

    return (
        <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${step.number <= currentStep
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-600'
                                } ${step.number === currentStep ? 'ring-4 ring-blue-200 scale-110' : ''}`}
                        >
                            {step.number}
                        </div>
                        <span className={`text-xs mt-1 text-center ${step.number <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-500'
                            }`}>
                            {step.name}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div
                            className={`w-16 h-1 mx-4 mt-[-20px] transition-all ${step.number < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

export default StepIndicator;