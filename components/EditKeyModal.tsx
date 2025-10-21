import React, { useState, useEffect } from 'react';
import type { GeneratedKey } from '../utils/license';

interface EditKeyModalProps {
  keyToEdit: GeneratedKey;
  onClose: () => void;
  onSaveKey: (keyId: string, updates: { usageLimit: number; validityInMs: number }) => Promise<boolean>;
}

const msToDurationParts = (ms: number) => {
    if (ms <= 0) return { days: 0, hours: 0, minutes: 0 };
    let remainingMs = ms;
    const days = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
    remainingMs %= (24 * 60 * 60 * 1000);
    const hours = Math.floor(remainingMs / (60 * 60 * 1000));
    remainingMs %= (60 * 60 * 1000);
    const minutes = Math.floor(remainingMs / (60 * 1000));
    return { days, hours, minutes };
};

export const EditKeyModal: React.FC<EditKeyModalProps> = ({ keyToEdit, onClose, onSaveKey }) => {
  const [usageLimit, setUsageLimit] = useState(keyToEdit.usage_limit);
  const [validityDays, setValidityDays] = useState(0);
  const [validityHours, setValidityHours] = useState(0);
  const [validityMinutes, setValidityMinutes] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const { days, hours, minutes } = msToDurationParts(keyToEdit.validity_in_ms);
    setUsageLimit(keyToEdit.usage_limit);
    setValidityDays(days);
    setValidityHours(hours);
    setValidityMinutes(minutes);
  }, [keyToEdit]);

  const handleSave = async () => {
    setIsSaving(true);
    const validityInMs = (validityDays * 24 * 60 * 60 * 1000) +
                         (validityHours * 60 * 60 * 1000) +
                         (validityMinutes * 60 * 1000);

    if (usageLimit <= 0 || validityInMs <= 0) {
      alert('Usage limit and validity must be greater than zero.');
      setIsSaving(false);
      return;
    }

    const success = await onSaveKey(keyToEdit.id, { usageLimit, validityInMs });
    setIsSaving(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
    >
        <div 
            className="border rounded-2xl shadow-2xl p-6 sm:p-8 max-w-lg w-full animate-pop-in"
            style={{ backgroundColor: 'var(--modal-bg)', borderColor: 'var(--border-primary)'}}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold font-display" style={{ color: 'var(--text-accent)'}}>Edit Key for {keyToEdit.school_name}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
                 <div>
                    <label className="block text-lg font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>Usage Limit</label>
                    <input
                      type="number"
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(parseInt(e.target.value, 10) || 0)}
                      min="1"
                      className="w-full p-3 text-lg rounded-lg border-2"
                      style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                    />
                 </div>
                 <div>
                    <label className="block text-lg font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>Validity Period</label>
                    <div className="grid grid-cols-3 gap-2">
                        <input type="number" value={validityDays} onChange={e => setValidityDays(parseInt(e.target.value) || 0)} placeholder="Days" className="w-full p-2 text-center rounded-md border-2" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
                        <input type="number" value={validityHours} onChange={e => setValidityHours(parseInt(e.target.value) || 0)} placeholder="Hours" className="w-full p-2 text-center rounded-md border-2" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
                        <input type="number" value={validityMinutes} onChange={e => setValidityMinutes(parseInt(e.target.value) || 0)} placeholder="Minutes" className="w-full p-2 text-center rounded-md border-2" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
                    </div>
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
                <button
                    onClick={onClose}
                    className="font-bold py-2 px-6 rounded-lg border-2"
                    style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)'}}
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="text-white font-bold py-2 px-6 rounded-lg shadow-md border-b-4 active:border-b-2 disabled:opacity-50"
                    style={{ backgroundColor: 'var(--btn-action-bg)', borderColor: 'var(--btn-action-border)' }}
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    </div>
  );
};
