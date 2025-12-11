import React, { useState, useMemo } from 'react';
import { Interview } from '../../types';

// Mock Data has been removed. The component now initializes with an empty state.
const MOCK_INTERVIEWS: Interview[] = [];

const StatCard: React.FC<{ title: string; value: number; color: string }> = ({ title, value, color }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-500 mb-1">{title}</h4>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
);


const MyInterviewsView: React.FC = () => {
    const [interviews] = useState<Interview[]>(MOCK_INTERVIEWS);

    const summary = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day
        const upcoming = interviews.filter(i => i.status === 'Scheduled' && new Date(i.date) >= today).length;
        const completed = interviews.filter(i => i.status === 'Completed').length;
        const rescheduled = interviews.filter(i => i.status === 'Rescheduled').length;
        return { upcoming, completed, rescheduled };
    }, [interviews]);

    const getStatusClasses = (status: Interview['status']) => {
        switch(status) {
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Scheduled': return 'bg-blue-100 text-blue-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            case 'Rescheduled': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">My Interviews</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Upcoming" value={summary.upcoming} color="text-blue-600" />
                <StatCard title="Completed" value={summary.completed} color="text-green-600" />
                <StatCard title="Rescheduled" value={summary.rescheduled} color="text-yellow-600" />
            </div>

            <div className="space-y-4">
                {interviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(interview => (
                    <div key={interview.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{interview.jobTitle}</h3>
                                <p className="text-sm text-gray-600">{interview.company} - <span className="font-medium">{interview.round}</span></p>
                            </div>
                            <span className={`mt-2 sm:mt-0 px-3 py-1 text-xs font-semibold rounded-full ${getStatusClasses(interview.status)}`}>
                                {interview.status}
                            </span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <div>
                                    {/* FIX: The `day` option for `toLocaleDateString` does not accept 'long'.
                                    Replaced with `day: 'numeric'` to show the date correctly. */}
                                    <p className="font-semibold">{new Date(interview.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    <p className="text-gray-500">{interview.time}</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={interview.type === 'Online' ? "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" : "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"} /></svg>
                                <div>
                                    <p className="font-semibold">{interview.type}</p>
                                    {interview.type === 'Online' ? (
                                        <a href={interview.locationOrLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs truncate">
                                            {interview.locationOrLink}
                                        </a>
                                    ) : (
                                        <p className="text-gray-500 text-xs">{interview.locationOrLink}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                 {interviews.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
                        You have no interviews scheduled.
                    </div>
                 )}
            </div>
        </div>
    );
};

export default MyInterviewsView;