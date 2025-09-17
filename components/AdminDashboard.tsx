import React, { useState } from 'react';
import { GeneratedKey, formatDuration } from '../utils/license';

interface AdminDashboardProps {
  generatedKeys: GeneratedKey[];
  onGenerateKey: (details: {
    schoolName: string;
    usageLimit: number;
    validityDays: number;
    validityHours: number;
    validityMinutes: number;
  }) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ generatedKeys, onGenerateKey }) => {
    const [schoolName, setSchoolName] = useState('');
    const [usageLimit, setUsageLimit] = useState(1);
    const [validityDays, setValidityDays] = useState(15);
    const [validityHours, setValidityHours] = useState(0);
    const [validityMinutes, setValidityMinutes] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!schoolName || usageLimit < 1) {
            alert('Please fill in a school name and a valid usage limit.');
            return;
        }
        onGenerateKey({ schoolName, usageLimit, validityDays, validityHours, validityMinutes });
        // Reset form
        setSchoolName('');
        setUsageLimit(1);
        setValidityDays(15);
        setValidityHours(0);
        setValidityMinutes(0);
    };

    const sortedKeys = [...generatedKeys].sort((a, b) => b.createdAt - a.createdAt);

    return (
        <div className="max-w-7xl mx-auto" style={{ color: 'var(--text-primary)' }}>
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-4xl font-black font-display" style={{ color: 'var(--text-accent)' }}>
                    Key Management
                </h1>
                <a href="/" className="font-bold py-2 px-4 rounded-lg hover:bg-white/20 transition">
                    &larr; Back to App
                </a>
            </div>

            {/* Key Generation Form */}
            <div className="p-6 rounded-2xl shadow-xl mb-8" style={{ backgroundColor: 'var(--backdrop-bg)', border: '1px solid var(--border-primary)'}}>
                <h2 className="text-2xl font-bold mb-4 font-display">Generate New Access Key</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="flex flex-col">
                        <label htmlFor="schoolName" className="font-bold mb-1">School Name</label>
                        <input id="schoolName" type="text" value={schoolName} onChange={e => setSchoolName(e.target.value)} required placeholder="e.g., Central High" className="p-2 rounded-md border" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)'}} />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="usageLimit" className="font-bold mb-1">Number of Uses</label>
                        <input id="usageLimit" type="number" min="1" value={usageLimit} onChange={e => setUsageLimit(parseInt(e.target.value, 10) || 1)} required className="p-2 rounded-md border" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)'}} />
                    </div>
                    <div className="flex flex-col">
                        <label className="font-bold mb-1">Validity Period</label>
                         <div className="flex gap-2">
                           <div className="flex-1">
                               <input id="validityDays" type="number" min="0" value={validityDays} onChange={e => setValidityDays(parseInt(e.target.value, 10) || 0)} required className="p-2 rounded-md border w-full" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)'}} title="Days" placeholder="Days" />
                           </div>
                           <div className="flex-1">
                               <input id="validityHours" type="number" min="0" max="23" value={validityHours} onChange={e => setValidityHours(parseInt(e.target.value, 10) || 0)} required className="p-2 rounded-md border w-full" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)'}} title="Hours" placeholder="Hrs" />
                           </div>
                           <div className="flex-1">
                               <input id="validityMinutes" type="number" min="0" max="59" value={validityMinutes} onChange={e => setValidityMinutes(parseInt(e.target.value, 10) || 0)} required className="p-2 rounded-md border w-full" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)'}} title="Minutes" placeholder="Mins" />
                           </div>
                        </div>
                    </div>
                    <button type="submit" className="w-full text-white font-bold text-lg py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 border-b-4 active:border-b-2 font-display" style={{ backgroundColor: 'var(--btn-action-bg)', borderColor: 'var(--btn-action-border)'}}>
                        Generate Key
                    </button>
                </form>
            </div>

            {/* Generated Keys List */}
            <div className="p-6 rounded-2xl shadow-xl" style={{ backgroundColor: 'var(--backdrop-bg)', border: '1px solid var(--border-primary)'}}>
                <h2 className="text-2xl font-bold mb-4 font-display">Generated Access Keys</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b-2" style={{ borderColor: 'var(--border-primary)'}}>
                            <tr>
                                <th className="p-2">School Name</th>
                                <th className="p-2">Access Key</th>
                                <th className="p-2">Usage</th>
                                <th className="p-2">Validity</th>
                                <th className="p-2">Created On</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedKeys.length > 0 ? sortedKeys.map(k => (
                                <tr key={k.id} className="border-b" style={{ borderColor: 'var(--border-primary)'}}>
                                    <td className="p-3 font-semibold">{k.schoolName}</td>
                                    <td className="p-3 font-mono">
                                        <input type="text" readOnly value={k.key} className="bg-transparent w-full" onFocus={(e) => e.target.select()} />
                                    </td>
                                    <td className="p-3">{k.currentUsage} / {k.usageLimit}</td>
                                    <td className="p-3">{formatDuration(k.validityInMs)}</td>
                                    <td className="p-3">{new Date(k.createdAt).toLocaleDateString()}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center" style={{ color: 'var(--text-secondary)'}}>No keys have been generated yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};