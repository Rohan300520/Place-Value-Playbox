import React, { useState, useEffect, useCallback } from 'react';
import { getGlobalStats, getSchoolSummary, getSchoolDetails, getUserChallengeHistory } from '../utils/analytics';
import type { GlobalStats, SchoolSummary, SchoolUserDetails, UserChallengeHistory } from '../types';

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="p-4 rounded-lg shadow-md border" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)' }}>
        <h3 className="text-lg font-bold" style={{ color: 'var(--text-secondary)' }}>{title}</h3>
        <p className="text-4xl font-black font-display" style={{ color: 'var(--text-accent)' }}>{value}</p>
    </div>
);

const Breadcrumbs: React.FC<{ path: string[], setPath: (path: string[]) => void }> = ({ path, setPath }) => (
    <nav className="mb-4 text-lg">
        <button onClick={() => setPath([])} className="font-bold hover:underline" style={{ color: 'var(--text-accent)'}}>Global</button>
        {path.map((segment, index) => (
            <React.Fragment key={index}>
                <span className="mx-2" style={{ color: 'var(--text-secondary)'}}>/</span>
                <button 
                    onClick={() => setPath(path.slice(0, index + 1))} 
                    className={`font-bold ${index === path.length - 1 ? '' : 'hover:underline'}`}
                    style={{ color: index === path.length - 1 ? 'var(--text-primary)' : 'var(--text-accent)'}}
                    disabled={index === path.length - 1}
                >
                    {segment}
                </button>
            </React.Fragment>
        ))}
    </nav>
);

const GlobalView: React.FC<{ stats: GlobalStats; schools: SchoolSummary[]; onSelectSchool: (school: string) => void; }> = ({ stats, schools, onSelectSchool }) => (
    <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard title="Total Users" value={stats.total_users} />
            <StatCard title="Total Sessions" value={stats.total_sessions} />
            <StatCard title="Challenge Attempts" value={stats.total_challenge_attempts} />
            <StatCard title="Avg. Success" value={`${(stats.avg_success_rate || 0).toFixed(1)}%`} />
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b" style={{ borderColor: 'var(--border-primary)' }}>
                        <th className="p-2">School</th>
                        <th className="p-2">Users</th>
                        <th className="p-2">Sessions</th>
                        <th className="p-2">Last Active</th>
                    </tr>
                </thead>
                <tbody>
                    {schools.map(school => (
                        <tr key={school.school_name} className="border-b hover:bg-white/5 cursor-pointer" style={{ borderColor: 'var(--border-primary)' }} onClick={() => onSelectSchool(school.school_name)}>
                            <td className="p-2 font-semibold">{school.school_name}</td>
                            <td className="p-2">{school.user_count}</td>
                            <td className="p-2">{school.session_count}</td>
                            <td className="p-2">{new Date(school.last_active).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </>
);

const SchoolView: React.FC<{ users: SchoolUserDetails[]; onSelectUser: (user: string) => void; }> = ({ users, onSelectUser }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-primary)' }}>
                    <th className="p-2">User Name</th>
                    <th className="p-2">Sessions</th>
                    <th className="p-2">Challenge Attempts</th>
                    <th className="p-2">Success Rate</th>
                    <th className="p-2">Last Active</th>
                </tr>
            </thead>
            <tbody>
                {users.map(user => {
                    const successRate = user.total_challenge_attempts > 0
                        ? (user.correct_challenge_attempts / user.total_challenge_attempts) * 100
                        : 0;
                    return (
                        <tr key={user.user_name} className="border-b hover:bg-white/5 cursor-pointer" style={{ borderColor: 'var(--border-primary)' }} onClick={() => onSelectUser(user.user_name)}>
                            <td className="p-2 font-semibold">{user.user_name}</td>
                            <td className="p-2">{user.session_count}</td>
                            <td className="p-2">{user.total_challenge_attempts}</td>
                            <td className="p-2">{successRate.toFixed(1)}%</td>
                            <td className="p-2">{new Date(user.last_active).toLocaleString()}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);

const UserView: React.FC<{ history: UserChallengeHistory[] }> = ({ history }) => (
     <div className="overflow-x-auto max-h-[60vh]">
        <table className="w-full text-left">
            <thead>
                <tr className="border-b sticky top-0" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--backdrop-bg)' }}>
                    <th className="p-2">Timestamp</th>
                    <th className="p-2">Question</th>
                    <th className="p-2">Level</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Duration (s)</th>
                </tr>
            </thead>
            <tbody>
                {history.map(item => (
                    <tr key={item.event_timestamp} className="border-b" style={{ borderColor: 'var(--border-primary)' }}>
                        <td className="p-2">{new Date(item.event_timestamp).toLocaleString()}</td>
                        <td className="p-2">{item.question}</td>
                        <td className="p-2 capitalize">{item.level}</td>
                        <td className={`p-2 font-bold ${item.status === 'correct' ? 'text-green-500' : 'text-red-500'}`}>{item.status}</td>
                        <td className="p-2">{item.duration.toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export const AnalyticsDashboard: React.FC = () => {
    const [path, setPath] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
    const [schoolSummary, setSchoolSummary] = useState<SchoolSummary[]>([]);
    const [schoolDetails, setSchoolDetails] = useState<SchoolUserDetails[]>([]);
    const [userHistory, setUserHistory] = useState<UserChallengeHistory[]>([]);

    const fetchData = useCallback(async (currentPath: string[]) => {
        setIsLoading(true);
        setError(null);
        try {
            if (currentPath.length === 0) { // Global View
                const [stats, schools] = await Promise.all([getGlobalStats(), getSchoolSummary()]);
                setGlobalStats(stats);
                setSchoolSummary(schools);
            } else if (currentPath.length === 1) { // School View
                const schoolName = currentPath[0];
                const details = await getSchoolDetails(schoolName);
                setSchoolDetails(details);
            } else if (currentPath.length === 2) { // User View
                const [schoolName, userName] = currentPath;
                const history = await getUserChallengeHistory(schoolName, userName);
                setUserHistory(history);
            }
        } catch (e: any) {
            setError(e.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(path);
    }, [path, fetchData]);
    
    const renderContent = () => {
        if (isLoading) return <div>Loading analytics...</div>;
        if (error) return <div className="text-red-500">Error: {error}</div>;

        if (path.length === 0) {
            return globalStats ? <GlobalView stats={globalStats} schools={schoolSummary} onSelectSchool={(school) => setPath([school])} /> : <div>No data available.</div>;
        }
        if (path.length === 1) {
            return <SchoolView users={schoolDetails} onSelectUser={(user) => setPath([path[0], user])} />;
        }
        if (path.length === 2) {
            return <UserView history={userHistory} />;
        }
        return null;
    }

    return (
        <div className="p-6 rounded-2xl shadow-lg border" style={{ backgroundColor: 'var(--backdrop-bg)', borderColor: 'var(--border-primary)' }}>
            <h2 className="text-2xl font-bold font-display mb-2" style={{ color: 'var(--text-accent)' }}>Usage Analytics</h2>
            <Breadcrumbs path={path} setPath={setPath} />
            <div className="mt-4">
                {renderContent()}
            </div>
        </div>
    );
};
