import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

interface AnalyticsData {
  id: number;
  timestamp: string;
  event_name: string;
  user_name: string;
  school_name: string;
  payload: Record<string, any>;
}

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="p-4 rounded-lg shadow-md border" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)' }}>
        <h3 className="text-lg font-bold" style={{ color: 'var(--text-secondary)' }}>{title}</h3>
        <p className="text-4xl font-black font-display" style={{ color: 'var(--text-accent)' }}>{value}</p>
    </div>
);

export const AnalyticsDashboard: React.FC = () => {
    const [data, setData] = useState<AnalyticsData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            const { data, error } = await supabase
                .from('analytics')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(1000); // Limit to last 1000 events for performance

            if (error) {
                setError(error.message);
            } else {
                setData(data || []);
            }
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const filteredData = data.filter(
        item => item.event_name.toLowerCase().includes(filter.toLowerCase()) ||
                item.user_name.toLowerCase().includes(filter.toLowerCase()) ||
                item.school_name.toLowerCase().includes(filter.toLowerCase())
    );

    const totalEvents = data.length;
    const uniqueUsers = new Set(data.map(d => d.user_name)).size;
    const uniqueSchools = new Set(data.map(d => d.school_name)).size;

    if (isLoading) return <div>Loading analytics...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    return (
        <div className="p-6 rounded-2xl shadow-lg border" style={{ backgroundColor: 'var(--backdrop-bg)', borderColor: 'var(--border-primary)' }}>
            <h2 className="text-2xl font-bold font-display mb-4" style={{ color: 'var(--text-accent)' }}>Usage Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard title="Total Events" value={totalEvents} />
                <StatCard title="Unique Users" value={uniqueUsers} />
                <StatCard title="Unique Schools" value={uniqueSchools} />
            </div>

            <input
                type="text"
                placeholder="Filter by event, user, or school..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="w-full p-3 text-lg rounded-lg border-2 mb-4"
                style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
            />

            <div className="overflow-x-auto max-h-[60vh]">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b sticky top-0" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--backdrop-bg)' }}>
                            <th className="p-2">Timestamp</th>
                            <th className="p-2">Event</th>
                            <th className="p-2">User</th>
                            <th className="p-2">School</th>
                            <th className="p-2">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map(item => (
                            <tr key={item.id} className="border-b hover:bg-white/5" style={{ borderColor: 'var(--border-primary)' }}>
                                <td className="p-2">{new Date(item.timestamp).toLocaleString()}</td>
                                <td className="p-2 font-semibold">{item.event_name}</td>
                                <td className="p-2">{item.user_name}</td>
                                <td className="p-2">{item.school_name}</td>
                                <td className="p-2 font-mono text-xs">{JSON.stringify(item.payload)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
