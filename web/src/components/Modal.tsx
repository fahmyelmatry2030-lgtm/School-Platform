import React, { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md'
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl'
    };

    return (
        <div
            className="modal-backdrop"
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 'var(--z-modal)',
                padding: 'var(--spacing-md)'
            }}
        >
            <div
                className={`modal ${sizeClasses[size]}`}
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    animation: 'modalSlideIn 0.3s ease-out'
                }}
            >
                {title && (
                    <div
                        className="modal-header"
                        style={{
                            padding: 'var(--spacing-lg)',
                            borderBottom: '1px solid var(--divider-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <h2 style={{ margin: 0, fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)' }}>
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="btn-secondary"
                            style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', minWidth: 'auto' }}
                            aria-label="Close modal"
                        >
                            ✕
                        </button>
                    </div>
                )}
                <div
                    className="modal-content"
                    style={{
                        padding: 'var(--spacing-lg)'
                    }}
                >
                    {children}
                </div>
            </div>

            <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .max-w-md { max-width: 28rem; }
        .max-w-lg { max-width: 32rem; }
        .max-w-2xl { max-width: 42rem; }
      `}</style>
        </div>
    );
};

export default Modal;
