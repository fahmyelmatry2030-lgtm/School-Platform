import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
    const sizeClass = size === 'lg' ? 'spinner-lg' : '';

    return (
        <div className={`spinner ${sizeClass} ${className}`} role="status" aria-label="Loading">
            <span className="sr-only">Loading...</span>
        </div>
    );
};

export default LoadingSpinner;
