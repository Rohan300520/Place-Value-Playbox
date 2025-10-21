import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
    getGlobalStats, 
    getSchoolSummary, 
    getSchoolDetails, 
    getUserChallengeHistory,
    getDailyActivity,
    getSchoolChallengeStats
} from '../utils/analytics';
import type { 
    GlobalStats, 
    SchoolSummary, 
    SchoolUserDetails, 
    UserChallengeHistory,
    DailyActivity,
    SchoolChallengeStats
} from '../types';
import type { Chart as ChartJS, ChartConfiguration } from 'chart.js';

interface AnalyticsDashboardProps {
    modelFilter?: string;
}

// --- Reusable Chart Component ---
const Chart: React.FC<{ config: ChartConfiguration, title: string }> = ({ config, title }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<ChartJS | null>(null);

    useEffect(() => {
        if (canvasRef.current) {
            // Destroy previous chart instance if it exists
            if (chartRef.current) {
                chartRef.current.destroy();
            }
            // Create new chart instance
            chartRef.current = new (window as any).Chart(canvasRef.current, config);
        }
        
        // Cleanup function to destroy chart on component unmount
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [config]);

    return (
        <div className="p-4 rounded-lg shadow-md border h-full flex flex-col" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)' }}>
            <h3 className="text-xl font-bold mb-2 text-center" style={{ color: 'var(--text-secondary)' }}>{title}</h3>
            <div className="relative flex-grow">
                <canvas ref={canvasRef}></canvas>
            </div>
        </div>
    );
};

// --- UI Components ---
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

const NoDataMessage: React.FC<{ message: string }> = ({ message }) => (
    <div className="text-center py-10 col-span-full">
        <p className="text-xl font-semibold" style={{ color: 'var(--text-secondary)' }}>{message}</p>
        <p style={{ color: 'var(--text-secondary)' }}>Data will appear here once users start interacting with the app.</p>
    </div>
);


// --- Dashboard Views ---
const GlobalView: React.FC<{ 
    stats: GlobalStats; 
    schools: SchoolSummary[]; 
    dailyActivity: DailyActivity[];
    onSelectSchool: (school: string) => void; 
}> = ({ stats, schools, dailyActivity, onSelectSchool }) => {

    const activityChartConfig: ChartConfiguration = {
        type: 'line',
        data: {
            labels: dailyActivity.map(d => new Date(d.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
            datasets: [
                {
                    label: 'Sessions',
                    data: dailyActivity.map(d => d.session_count),
                    borderColor: 'rgba(59, 130, 246, 0.8)',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: 'Unique Users',
                    data: dailyActivity.map(d => d.user_count),
                    borderColor: 'rgba(249, 115, 22, 0.8)',
                    backgroundColor: 'rgba(249, 115, 22, 0.2)',
                    fill: true,
                    tension: 0.4,
                }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false }
    };
    
    const topSchools = [...schools].sort((a,b) => b.session_count - a.session_count).slice(0, 5);
    const topSchoolsChartConfig: ChartConfiguration = {
        type: 'bar',
        data: {
            labels: topSchools.map(s => s.school_name),
            datasets: [{
                label: 'Total Sessions',
                data: topSchools.map(s => s.session_count),
                backgroundColor: 'rgba(22, 163, 74, 0.7)',
                borderColor: 'rgba(22, 163, 74, 1)',
                borderWidth: 1
            }]
        },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false }
    }

    if (schools.length === 0) {
        return <NoDataMessage message="No school data has been recorded yet." />;
    }
    
    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard title="Total Users" value={stats.total_users} />
                <StatCard title="Total Sessions" value={stats.total_sessions} />
                <StatCard title="Challenge Attempts" value={stats.total_challenge_attempts} />
                <StatCard title="Avg. Success" value={`${(stats.avg_success_rate || 0).toFixed(1)}%`} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 min-h-[300px]">
                 <Chart config={activityChartConfig} title="Activity Last 30 Days" />
                 <Chart config={topSchoolsChartConfig} title="Top 5 Schools by Sessions" />
            </div>

            <div className="overflow-x-auto p-4 rounded-lg shadow-md border" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)' }}>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>All Schools</h3>
                <table className="w-full text-left">
                    <thead className="sticky top-0" style={{ backgroundColor: 'var(--modal-bg)'}}>
                        <tr className="border-b" style={{ borderColor: 'var(--border-primary)' }}>
                            <th className="p-2">School Name</th>
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
                                <td className="p-2">{new Date(school.last_active).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

const SchoolView: React.FC<{ 
    users: SchoolUserDetails[]; 
    challengeStats: SchoolChallengeStats;
    onSelectUser: (user: string) => void; 
}> = ({ users, challengeStats, onSelectUser }) => {
    
    const challengeChartConfig: ChartConfiguration = {
        type: 'doughnut',
        data: {
            labels: ['Correct', 'Incorrect', 'Timed Out'],
            datasets: [{
                data: [challengeStats.correct_count, challengeStats.incorrect_count, challengeStats.timed_out_count],
                backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(245, 158, 11, 0.8)'],
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    };
    
    if (users.length === 0) {
        return <NoDataMessage message="No user data has been recorded for this school yet." />;
    }
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1 min-h-[300px]">
                <Chart config={challengeChartConfig} title="Challenge Performance" />
            </div>
            <div className="lg:col-span-2 p-4 rounded-lg shadow-md border" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)' }}>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>User Details</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="sticky top-0" style={{ backgroundColor: 'var(--modal-bg)' }}>
                            <tr className="border-b" style={{ borderColor: 'var(--border-primary)' }}>
                                <th className="p-2">User Name</th>
                                <th className="p-2">Sessions</th>
                                <th className="p-2">Challenges</th>
                                <th className="p-2">Success Rate</th>
                                <th className="p-2">Last Active</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => {
                                const successRate = user.total_challenge_attempts > 0 ? (user.correct_challenge_attempts / user.total_challenge_attempts) * 100 : 0;
                                return (
                                    <tr key={user.user_name} className="border-b hover:bg-white/5 cursor-pointer" style={{ borderColor: 'var(--border-primary)' }} onClick={() => onSelectUser(user.user_name)}>
                                        <td className="p-2 font-semibold">{user.user_name}</td>
                                        <td className="p-2">{user.session_count}</td>
                                        <td className="p-2">{user.total_challenge_attempts}</td>
                                        <td className="p-2">{successRate.toFixed(1)}%</td>
                                        <td className="p-2">{new Date(user.last_active).toLocaleDateString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const UserView: React.FC<{ history: UserChallengeHistory[]; }> = ({ history }) => {
    // Fix: Implemented the UserView component to display user challenge history, resolving the return type error.
    if (history.length === 0) {
        return <NoDataMessage message="This user has not attempted any challenges yet." />;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'correct': return 'bg-green-500/20 text-green-300';
            case 'incorrect': return 'bg-red-500/20 text-red-300';
            case 'timed_out': return 'bg-yellow-500/20 text-yellow-300';
            default: return 'bg-gray-500/20 text-gray-300';
        }
    };

    return (
        <div className="p-4 rounded-lg shadow-md border" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)' }}>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>User Challenge History</h3>
            <div className="overflow-x-auto max-h-[60vh]">
                <table className="w-full text-left">
                    <thead className="sticky top-0" style={{ backgroundColor: 'var(--modal-bg)'}}>
                        <tr className="border-b" style={{ borderColor: 'var(--border-primary)' }}>
                            <th className="p-2">Timestamp</th>
                            <th className="p-2">Question</th>
                            <th className="p-2">Level</th>
                            <th className="p-2">Status</th>
                            <th className="p-2">Duration (s)</th>
                            <th className="p-2">User Answer</th>
                            <th className="p-2">Correct Answer</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((item, index) => (
                            <tr key={index} className="border-b hover:bg-white/5" style={{ borderColor: 'var(--border-primary)' }}>
                                <td className="p-2">{new Date(item.event_timestamp).toLocaleString()}</td>
                                <td className="p-2">{item.question}</td>
                                <td className="p-2 capitalize">{item.level}</td>
                                <td className="p-2">
                                    <span className={`px-2 py-1 rounded-full text-sm font-semibold capitalize ${getStatusColor(item.status)}`}>
                                        {item.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="p-2">{item.duration.toFixed(2)}</td>
                                <td className="p-2">{item.user_answer}</td>
                                <td className="p-2">{item.correct_answer}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Main Dashboard Component ---
export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ modelFilter }) => {
    const [path, setPath] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
    const [isExporting, setIsExporting] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    // State for all data
    const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
    const [schoolSummary, setSchoolSummary] = useState<SchoolSummary[]>([]);
    const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
    const [schoolDetails, setSchoolDetails] = useState<SchoolUserDetails[]>([]);
    const [schoolChallengeStats, setSchoolChallengeStats] = useState<SchoolChallengeStats | null>(null);
    const [userHistory, setUserHistory] = useState<UserChallengeHistory[]>([]);

    const fetchData = useCallback(async (currentPath: string[], model?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            if (currentPath.length === 0) {
                const [stats, schools, activity] = await Promise.all([
                    getGlobalStats(model), 
                    getSchoolSummary(model),
                    getDailyActivity(model)
                ]);
                setGlobalStats(stats);
                setSchoolSummary(schools);
                setDailyActivity(activity);
            } else if (currentPath.length === 1) {
                const schoolName = currentPath[0];
                const [details, challengeStats] = await Promise.all([
                    getSchoolDetails(schoolName, model),
                    getSchoolChallengeStats(schoolName, model)
                ]);
                setSchoolDetails(details);
                setSchoolChallengeStats(challengeStats);
            } else if (currentPath.length === 2) {
                const [schoolName, userName] = currentPath;
                const history = await getUserChallengeHistory(schoolName, userName, model);
                setUserHistory(history);
            }
        } catch (e: any) {
            setError(e.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
            setLastRefreshed(new Date());
        }
    }, []);

    useEffect(() => {
        fetchData(path, modelFilter);
    }, [path, modelFilter, fetchData]);
    
    const handleExportPDF = async () => {
        if (isExporting || !contentRef.current) return;
        setIsExporting(true);

        try {
            const { jsPDF } = (window as any).jspdf;
            const html2canvas = (window as any).html2canvas;

            if (!jsPDF || !html2canvas) {
                alert("PDF export library not loaded. Please try again.");
                setIsExporting(false);
                return;
            }

            const canvas = await html2canvas(contentRef.current, {
                scale: 3,
                useCORS: true,
                backgroundColor: null,
                onclone: (clonedDoc) => {
                    const stickyHeaders = clonedDoc.querySelectorAll('.sticky');
                    stickyHeaders.forEach((header) => {
                        (header as HTMLElement).style.position = 'static';
                    });
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;

            const imgWidth = pdfWidth - 20;
            const imgHeight = imgWidth / ratio;
            let heightLeft = imgHeight;
            let position = 10;

            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= (pdfHeight - 20);

            while (heightLeft > 0) {
                position = -pdfHeight + 20;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= (pdfHeight - 20);
            }
            
            let filename = 'analytics_export.pdf';
            if (path.length === 0) filename = 'global_analytics.pdf';
            if (path.length === 1) filename = `school_${path[0].replace(/\s/g, '_')}_analytics.pdf`;
            if (path.length === 2) filename = `user_${path[1].replace(/\s/g, '_')}_analytics.pdf`;

            pdf.save(filename);
        } catch (error) {
            console.error("Error exporting to PDF:", error);
            alert("Failed to export PDF. See console for details.");
        } finally {
            setIsExporting(false);
        }
    };
    
    const renderContent = () => {
        if (isLoading) return <div className="text-center py-10">Loading analytics...</div>;
        if (error) return <div className="text-red-500 text-center py-10">Error: {error}</div>;

        if (path.length === 0) {
            return globalStats ? <GlobalView stats={globalStats} schools={schoolSummary} dailyActivity={dailyActivity} onSelectSchool={(school) => setPath([school])} /> : <NoDataMessage message="No global stats available." />;
        }
        if (path.length === 1) {
            return schoolChallengeStats ? <SchoolView users={schoolDetails} challengeStats={schoolChallengeStats} onSelectUser={(user) => setPath([path[0], user])} /> : <NoDataMessage message="No data for this school."/>;
        }
        if (path.length === 2) {
            return <UserView history={userHistory} />;
        }
        return null;
    }

    return (
        <div className="p-6 rounded-2xl shadow-lg border" style={{ backgroundColor: 'var(--backdrop-bg)', borderColor: 'var(--border-primary)' }}>
            <div className="flex justify-between items-center mb-2">
                 <h2 className="text-2xl font-bold font-display" style={{ color: 'var(--text-accent)' }}>Usage Analytics</h2>
                 <div className="flex items-center gap-2">
                     <button 
                        onClick={() => fetchData(path, modelFilter)} 
                        disabled={isLoading || isExporting}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-400 text-white font-bold py-2 px-4 rounded-lg shadow-md transform hover:scale-105 transition-all duration-200 border-b-4 border-indigo-700 active:border-b-2"
                     >
                         <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 11M20 20l-1.5-1.5A9 9 0 003.5 13" />
                        </svg>
                        <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
                     </button>
                      <button 
                        onClick={handleExportPDF} 
                        disabled={isLoading || isExporting}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-bold py-2 px-4 rounded-lg shadow-md transform hover:scale-105 transition-all duration-200 border-b-4 border-green-800 active:border-b-2"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" /></svg>
                        <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
                     </button>
                 </div>
            </div>
            <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)'}}>Last updated: {lastRefreshed.toLocaleTimeString()}</p>

            <Breadcrumbs path={path} setPath={setPath} />
            <div className="mt-4" ref={contentRef}>
                {renderContent()}
            </div>
        </div>
    );
};