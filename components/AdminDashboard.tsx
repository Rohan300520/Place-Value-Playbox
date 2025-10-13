import React, { useState } from 'react';
import type { GeneratedKey } from '../utils/license';
import { formatDuration } from '../utils/license';
import { AnalyticsDashboard } from './AnalyticsDashboard';

interface AdminDashboardProps {
  generatedKeys: GeneratedKey[];
  onGenerateKey: (details: {
    schoolName: string;
    usageLimit: number;
    validityDays: number;
    validityHours: number;
    validityMinutes: number;
  }) => void;
  onDeleteKey: (keyId: string) => void;
}

const NewKeyForm: React.FC<{ onGenerateKey: AdminDashboardProps['onGenerateKey'] }> = ({ onGenerateKey }) => {
  const [schoolName, setSchoolName] = useState('');
  const [usageLimit, setUsageLimit] = useState(100);
  const [validityDays, setValidityDays] = useState(30);
  const [validityHours, setValidityHours] = useState(0);
  const [validityMinutes, setValidityMinutes] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim() || usageLimit <= 0) {
      alert('Please fill in a valid school name and usage limit.');
      return;
    }
    onGenerateKey({ schoolName, usageLimit, validityDays, validityHours, validityMinutes });
    setSchoolName('');
    setUsageLimit(100);
    setValidityDays(30);
    setValidityHours(0);
    setValidityMinutes(0);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-2xl shadow-lg border" style={{ backgroundColor: 'var(--backdrop-bg)', borderColor: 'var(--border-primary)' }}>
      <h2 className="text-2xl font-bold font-display mb-4" style={{ color: 'var(--text-accent)' }}>Generate New Key</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          placeholder="School / Institution Name"
          required
          className="w-full p-3 text-lg rounded-lg border-2 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
          style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
        />
        <input
          type="number"
          value={usageLimit}
          onChange={(e) => setUsageLimit(parseInt(e.target.value, 10) || 0)}
          placeholder="e.g., 100 uses"
          required
          min="1"
          className="w-full p-3 text-lg rounded-lg border-2 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
          style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
        />
      </div>
      <div className="mt-4">
        <label className="block text-lg font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>Validity Period</label>
        <div className="grid grid-cols-3 gap-2">
          <input type="number" value={validityDays} onChange={e => setValidityDays(parseInt(e.target.value) || 0)} placeholder="e.g., 30 Days" className="w-full p-2 text-center rounded-md border-2" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
          <input type="number" value={validityHours} onChange={e => setValidityHours(parseInt(e.target.value) || 0)} placeholder="e.g., 12 Hours" className="w-full p-2 text-center rounded-md border-2" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
          <input type="number" value={validityMinutes} onChange={e => setValidityMinutes(parseInt(e.target.value) || 0)} placeholder="e.g., 0 Minutes" className="w-full p-2 text-center rounded-md border-2" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
        </div>
      </div>
      <button
        type="submit"
        className="mt-4 w-full text-white font-bold text-xl py-3 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 border-b-4 active:border-b-2 font-display"
        style={{ backgroundColor: 'var(--btn-action-bg)', borderColor: 'var(--btn-action-border)' }}
      >
        Generate Key
      </button>
    </form>
  );
};

const KeyTable: React.FC<{ keys: GeneratedKey[]; onDeleteKey: (keyId: string) => void }> = ({ keys, onDeleteKey }) => {
  const [copySuccess, setCopySuccess] = useState('');

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key).then(() => {
      setCopySuccess(key);
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  return (
    <div className="mt-8 p-6 rounded-2xl shadow-lg border" style={{ backgroundColor: 'var(--backdrop-bg)', borderColor: 'var(--border-primary)' }}>
      <h2 className="text-2xl font-bold font-display mb-4" style={{ color: 'var(--text-accent)' }}>Generated Keys</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border-primary)' }}>
              <th className="p-2">School</th>
              <th className="p-2">Key</th>
              <th className="p-2">Usage</th>
              <th className="p-2">Validity</th>
              <th className="p-2">Created</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.map(key => (
              <tr key={key.id} className="border-b hover:bg-white/5" style={{ borderColor: 'var(--border-primary)' }}>
                <td className="p-2 font-semibold">{key.school_name}</td>
                <td className="p-2 font-mono">
                  <button onClick={() => handleCopy(key.key)} className="p-1 rounded hover:bg-gray-600">
                    {key.key}
                  </button>
                  {copySuccess === key.key && <span className="text-green-400 ml-2">Copied!</span>}
                </td>
                <td className="p-2">{key.current_usage} / {key.usage_limit}</td>
                <td className="p-2">{formatDuration(key.validity_in_ms)}</td>
                <td className="p-2">{new Date(key.created_at).toLocaleDateString()}</td>
                <td className="p-2">
                  <button onClick={() => onDeleteKey(key.id)} className="text-red-400 hover:text-red-600 font-bold p-1 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ generatedKeys, onGenerateKey, onDeleteKey }) => {
    const [activeTab, setActiveTab] = useState('keys');

  return (
    <div className="w-full max-w-7xl animate-pop-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black font-display" style={{ color: 'var(--text-accent)' }}>Admin Dashboard</h1>
        <a href="/" className="font-bold text-lg hover:underline" style={{ color: 'var(--text-secondary)' }}>Back to App</a>
      </div>

      <div className="mb-6 border-b-2" style={{ borderColor: 'var(--border-primary)' }}>
          <button onClick={() => setActiveTab('keys')} className={`px-4 py-2 text-xl font-bold ${activeTab === 'keys' ? 'border-b-4 border-orange-500' : ''}`} style={{ color: 'var(--text-primary)' }}>Key Management</button>
          <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 text-xl font-bold ${activeTab === 'analytics' ? 'border-b-4 border-orange-500' : ''}`} style={{ color: 'var(--text-primary)' }}>Analytics</button>
      </div>
      
      {activeTab === 'keys' ? (
          <>
            <NewKeyForm onGenerateKey={onGenerateKey} />
            <KeyTable keys={generatedKeys} onDeleteKey={onDeleteKey} />
          </>
      ) : (
          <AnalyticsDashboard />
      )}
    </div>
  );
};