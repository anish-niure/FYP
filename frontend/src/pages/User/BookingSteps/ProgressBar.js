import React from 'react';

const ProgressBar = ({ currentStep, totalSteps }) => {
    const stepTitles = [
        'Select Service',
        'Choose Stylist',
        'Choose Location',
        'Select Date & Time',
        'Confirmation'
    ];
    
    const progress = (currentStep / totalSteps) * 100;
    
    return (
        <div className="progress-container">
            <div className="progress-bar-wrapper">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
            
            <div className="step-indicators">
                {stepTitles.map((title, index) => (
                    <div 
                        key={index} 
                        className={`step-indicator ${currentStep > index + 1 ? 'completed' : ''} ${currentStep === index + 1 ? 'active' : ''}`}
                    >
                        <div className="step-number">{index + 1}</div>
                        <div className="step-title">{title}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProgressBar;