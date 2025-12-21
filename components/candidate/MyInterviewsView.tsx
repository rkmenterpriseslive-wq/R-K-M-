
import React, { useState, useMemo, useEffect } from 'react';
import { DailyLineup, UserProfile } from '../../types';
import { onUserApplicationsChange } from '../../services/firebaseService';

interface MyInterviewsViewProps {
    currentUserProfile?: UserProfile | null;
}

const StatCard: React.FC<{ title: string; value: number; color: string }> = ({ title, value, color }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-500 mb-1">{title}</h4>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
);


const MyInterviewsView: React.FC<MyInterviewsViewProps> = ({ currentUserProfile }) => {
    const [lineups, setLineups] = useState<DailyLineup[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUserProfile?.phone) {
            const unsub = onUserApplicationsChange(currentUserProfile.phone, (data) => {
                setLineups(data);
                setLoading(false);
            });
            return () => unsub();
        } else {
            setLoading(false);
        }
    }, [currentUserProfile?.phone]);

    const isCvComplete = currentUserProfile?.isCvComplete === true;

    // Interviews are applications with specific interview details set or "Interested" status
    const interviews = useMemo(() => {
        return lineups.filter(l => l.callStatus === 'Interested' || (l.interviewDate && l.interviewTime));
    }, [lineups]);

    const summary = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        const upcoming = interviews.filter(i => {
            if (!i.interviewDate) return false;
            return new Date(i.interviewDate) >= today;
        }).length;
        const past = interviews.filter(i => {
            if (!i.interviewDate) return false;
            return new Date(i.interviewDate) < today;
        }).length;
        return { upcoming, past, total: interviews.length };
    }, [interviews]);

    const getStatusClasses = (status: string) => {
        switch(status) {
            case 'Interested': return 'bg-green-100 text-green-800';
            case 'Applied': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading interviews...</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">My Interviews</h2>
            <p className="text-gray-600">Track your confirmed interview schedules and locations.</p>

            {!isCvComplete && interviews.length > 0 && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
                    <div className="flex items-center">
                        <svg className="h-6 w-6 text-amber-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-amber-700 font-medium">
                            Mandatory: Complete your CV in the <span className="font-bold">"CV Generator"</span> tab to unlock and view your interview time and location details.
                        </p>
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Upcoming Interviews" value={summary.upcoming} color="text-blue-600" />
                <StatCard title="Past / Completed" value={summary.past} color="text-gray-600" />
                <StatCard title="Total Assigned" value={summary.total} color="text-indigo-600" />
            </div>

            <div className="space-y-4">
                {interviews.sort((a, b) => {
                    if (!a.interviewDate || !b.interviewDate) return 0;
                    return new Date(a.interviewDate).getTime() - new Date(b.interviewDate).getTime()
                }).map(interview => (
                    <div key={interview.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md border-l-4 border-l-blue-500">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{interview.role}</h3>
                                <p className="text-sm text-gray-600 font-medium">{interview.storeName || 'General Location'}</p>
                            </div>
                            <div className="mt-2 sm:mt-0 flex flex-col items-end">
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClasses(interview.callStatus)}`}>
                                    {interview.callStatus === 'Interested' ? 'Confirmed Interview' : 'Pending Confirmation'}
                                </span>
                                <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold">HR: {interview.submittedBy}</span>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                                <div>
                                    {isCvComplete ? (
                                        <>
                                            <p className="font-bold text-gray-900">
                                                {interview.interviewDate ? new Date(interview.interviewDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }) : 'Date TBD'}
                                            </p>
                                            <p className="text-gray-500 font-medium">{interview.interviewTime || 'Time TBD'}</p>
                                        </>
                                    ) : (
                                        <div className="space-y-1">
                                            <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
                                            <div className="h-3 w-20 bg-gray-100 animate-pulse rounded"></div>
                                            <p className="text-[10px] text-amber-600 font-bold uppercase">Locked - Complete CV</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                             <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Location / Venue</p>
                                    {isCvComplete ? (
                                        <p className="text-gray-500 text-xs leading-relaxed">{interview.interviewPlace || 'Address not provided'}</p>
                                    ) : (
                                        <div className="space-y-1">
                                            <div className="h-3 w-40 bg-gray-200 animate-pulse rounded"></div>
                                            <p className="text-[10px] text-amber-600 font-bold uppercase">Hidden - Complete CV</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                 {interviews.length === 0 && (
                    <div className="text-center py-16 text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed">
                        <svg className="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="font-medium">No interviews scheduled yet.</p>
                        <p className="text-xs mt-1">Confirmed interview details from HR will appear here.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default MyInterviewsView;
