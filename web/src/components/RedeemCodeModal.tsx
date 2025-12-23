import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';
import { Codes } from '../lib/codes';
import LoadingSpinner from './LoadingSpinner';

interface RedeemCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    studentName: string;
    onSuccess: () => void;
}

export const RedeemCodeModal: React.FC<RedeemCodeModalProps> = ({
    isOpen,
    onClose,
    studentId,
    studentName,
    onSuccess
}) => {
    const { t } = useTranslation();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRedeem = async () => {
        if (!code.trim()) return;
        setLoading(true);
        setError(null);
        try {
            await Codes.redeem(studentId, studentName, code.trim());
            onSuccess();
            setCode('');
            onClose();
        } catch (e: any) {
            setError(t('invalidCode'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('redeemCode')}>
            <div className="redeem-form" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <p style={{ color: 'var(--text-secondary)' }}>{t('enterCode')}</p>
                <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="XXXX-XXXX"
                    style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '2px' }}
                    disabled={loading}
                />
                {error && <div className="alert alert-error">{error}</div>}
                <div className="modal-actions" style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                    <button className="btn-secondary w-full" onClick={onClose} disabled={loading}>
                        {t('cancel')}
                    </button>
                    <button className="btn-primary w-full" onClick={handleRedeem} disabled={loading || !code.trim()}>
                        {loading ? <LoadingSpinner size="sm" /> : t('generate')}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
