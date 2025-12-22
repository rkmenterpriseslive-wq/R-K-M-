
import React, { useState, useEffect, useMemo } from 'react';
import { Candidate, AttendanceStatus, UserProfile, UserType } from '../../types';
import { onCandidatesChange, onAttendanceForMonthChange, saveEmployeeAttendance, getUsers } from '../../services/firebaseService';
import Button from '../Button';
import Modal from '../Modal';

const formatCurrency = (amount: number) => `₹ ${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

interface AttendanceViewProps {
    currentUserProfile?: UserProfile | null;
}

const AttendanceView: React.FC<AttendanceViewProps> = ({ currentUserProfile }) => {
    const [employees, setEmployees] = useState<Candidate[]>([]);
    const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [attendanceData, setAttendanceData] = useState<Record<string, Record<string, AttendanceStatus>>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'commission' | 'daily'>('commission');
    const [selectedEmpForDaily, setSelectedEmpForDaily] = useState<Candidate | null>(null);

    // Mock commissions - in a real app, this might come from Employee Profile or Settings
    const mockCommissions: Record<string, number> = {
        'Hired': 5000,
        'Selected': 2000
    };

    useEffect(() => {
        const unsubCandidates = onCandidatesChange(data => {
            const hired = data.filter(c => c.status === 'Hired');
            if (currentUserProfile && [UserType.TEAM, UserType.TEAMLEAD].includes(currentUserProfile.userType)) {
                setEmployees(hired.filter(e => e.recruiter === currentUserProfile.uid));
            } else {
                setEmployees(hired);
            }
        });
        const unsubAttendance = onAttendanceForMonthChange(month, data => {
            setAttendanceData(data || {});
            setIsLoading(false);
        });
        return () => { unsubCandidates(); unsubAttendance(); };
    }, [month, currentUserProfile]);

    const daysInMonth = useMemo(() => {
        const [year, m] = month.split('-').map(Number);
        return new Date(year, m, 0).getDate();
    }, [month]);

    const monthName = useMemo(() => {
        const [year, m] = month.split('-').map(Number);
        return new Date(year, m - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' });
    }, [month]);

    const commissionSummary = useMemo(() => {
        return employees.map(emp => {
            const records = attendanceData[emp.id] || {};
            const presentCount = Object.values(records).filter(status => status === 'Present').length;
            const totalWorkingDays = daysInMonth; // Or a custom business rule for working days
            const baseCommission = 15000; // Mock base
            const payableAmount = (presentCount / totalWorkingDays) * baseCommission;

            return {
                ...emp,
                presentCount,
                totalWorkingDays,
                baseCommission,
                payableAmount
            };
        });
    }, [employees, attendanceData, daysInMonth]);

    const handleMarkDaily = (empId: string, day: number, status: AttendanceStatus) => {
        const dayStr = day.toString().padStart(2, '0');
        setAttendanceData(prev => ({
            ...prev,
            [empId]: {
                ...(prev[empId] || {}),
                [dayStr]: status
            }
        }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await saveEmployeeAttendance(month, attendanceData);
            alert("Attendance records updated successfully!");
        } catch (e) {
            alert("Failed to save records.");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusChar = (status?: AttendanceStatus) => {
        switch (status) {
            case 'Present': return 'P';
            case 'Absent': return 'A';
            case 'Leave': return 'L';
            case 'Week Off': return 'W';
            default: return '-';
        }
    };

    const getCellColor = (status?: AttendanceStatus) => {
        switch (status) {
            case 'Present': return 'bg-green-50 text-green-700 font-black';
            case 'Absent': return 'bg-red-50 text-red-700 font-black';
            case 'Leave': return 'bg-yellow-50 text-yellow-700 font-black';
            case 'Week Off': return 'bg-gray-50 text-gray-400';
            default: return 'text-gray-300';
        }
    };

    const selectStyle = "block w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-600 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%201024%201024%22%3E%3Cpath%20d%3D%22M256%20384l256%20256%20256-256H256z%22%20fill%3D%22%23999%22%2F%3E%3C%2Fsvg%3E')] bg-[length:14px_14px] bg-[right_12px_center] bg-no-repeat";

    return (
        <div className="space-y-8 pb-24">
            {/* Header section matching screenshot */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-4xl font-black text-[#1e293b] tracking-tight">Commission Attendance</h2>
                    <p className="text-gray-500 font-medium mt-1">Manage attendance and track commission payouts.</p>
                </div>
                
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm min-w-[200px]">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Select Month</label>
                    <input 
                        type="month" 
                        value={month} 
                        onChange={e => setMonth(e.target.value)}
                        className="w-full text-sm font-bold text-gray-700 focus:outline-none"
                    />
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-4 p-1 bg-gray-200 w-fit rounded-lg">
                <button 
                    onClick={() => setActiveTab('commission')}
                    className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'commission' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    Commission Summary
                </button>
                <button 
                    onClick={() => setActiveTab('daily')}
                    className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'daily' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    Daily Log Grid
                </button>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                {activeTab === 'commission' ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-[#f8fafc]">
                                <tr>
                                    <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Candidate Name</th>
                                    <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Vendor</th>
                                    <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                                    <th className="px-8 py-5 text-center text-[11px] font-black text-gray-400 uppercase tracking-widest">Base Commission</th>
                                    <th className="px-8 py-5 text-center text-[11px] font-black text-gray-400 uppercase tracking-widest">Attendance</th>
                                    <th className="px-8 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">Payable Amount</th>
                                    <th className="px-8 py-5 text-center text-[11px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-50">
                                {isLoading ? (
                                    <tr><td colSpan={7} className="text-center py-24 text-gray-400 italic">Calculating records...</td></tr>
                                ) : commissionSummary.length > 0 ? commissionSummary.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-[#1e293b]">{item.name}</td>
                                        <td className="px-8 py-5 whitespace-nowrap text-xs text-blue-600 font-black uppercase tracking-tighter">{item.vendor}</td>
                                        <td className="px-8 py-5 whitespace-nowrap text-xs text-gray-500 font-medium">{item.role}</td>
                                        <td className="px-8 py-5 whitespace-nowrap text-center text-sm font-bold text-gray-700">{formatCurrency(item.baseCommission)}</td>
                                        <td className="px-8 py-5 whitespace-nowrap text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <span className="text-sm font-black text-indigo-600">{item.presentCount} / {item.totalWorkingDays}</span>
                                                <span className="text-[9px] font-black text-gray-300 uppercase">Days Present</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-black text-green-600">{formatCurrency(item.payableAmount)}</td>
                                        <td className="px-8 py-5 whitespace-nowrap text-center">
                                            <button 
                                                onClick={() => { setSelectedEmpForDaily(item); setActiveTab('daily'); }}
                                                className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                View Log
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="text-center py-32">
                                            <div className="flex flex-col items-center">
                                                <svg className="w-12 h-12 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                </svg>
                                                <p className="text-gray-400 font-bold tracking-tight text-lg">No attendance records found for this month.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-800 tracking-tight">Daily Attendance Log: {monthName}</h3>
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={() => setActiveTab('commission')} className="text-xs">Back to Summary</Button>
                                <Button onClick={handleSave} loading={isLoading} className="text-xs bg-indigo-600 shadow-lg shadow-indigo-100 font-bold">Save All Logs</Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-gray-100">
                            <table className="min-w-full text-center divide-y divide-gray-100">
                                <thead className="bg-[#f8fafc]">
                                    <tr>
                                        <th className="px-4 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest sticky left-0 bg-[#f8fafc] z-10">Employee</th>
                                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
                                            <th key={d} className="px-1 py-4 text-[9px] font-black text-gray-400 border-l border-gray-50">{d}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-50">
                                    {employees.map(emp => (
                                        <tr key={emp.id} className={`${selectedEmpForDaily?.id === emp.id ? 'bg-indigo-50/30' : ''} hover:bg-gray-50/50 transition-colors`}>
                                            <td className="px-4 py-4 text-left whitespace-nowrap sticky left-0 bg-white shadow-[2px_0_10px_rgb(0,0,0,0.02)] z-10">
                                                <div className="text-xs font-black text-gray-800">{emp.name}</div>
                                                <div className="text-[9px] text-gray-400 font-bold uppercase">{emp.role}</div>
                                            </td>
                                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                                                const dayStr = d.toString().padStart(2, '0');
                                                const status = attendanceData[emp.id]?.[dayStr];
                                                return (
                                                    <td key={d} 
                                                        className={`px-1 py-4 text-[10px] cursor-pointer hover:opacity-75 transition-opacity border-l border-gray-50/50 ${getCellColor(status)}`}
                                                        onClick={() => {
                                                            const statuses: AttendanceStatus[] = ['Present', 'Absent', 'Leave', 'Week Off'];
                                                            const currentIndex = status ? statuses.indexOf(status) : -1;
                                                            const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                                                            handleMarkDaily(emp.id, d, nextStatus);
                                                        }}
                                                    >
                                                        {getStatusChar(status)}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="mt-6 flex flex-wrap gap-4 items-center px-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Legend:</p>
                            <div className="flex items-center gap-1.5"><span className="w-5 h-5 flex items-center justify-center bg-green-100 text-green-700 text-[10px] font-black rounded-md">P</span><span className="text-[10px] font-bold text-gray-500 uppercase">Present</span></div>
                            <div className="flex items-center gap-1.5"><span className="w-5 h-5 flex items-center justify-center bg-red-100 text-red-700 text-[10px] font-black rounded-md">A</span><span className="text-[10px] font-bold text-gray-500 uppercase">Absent</span></div>
                            <div className="flex items-center gap-1.5"><span className="w-5 h-5 flex items-center justify-center bg-yellow-100 text-yellow-700 text-[10px] font-black rounded-md">L</span><span className="text-[10px] font-bold text-gray-500 uppercase">Leave</span></div>
                            <div className="flex items-center gap-1.5"><span className="w-5 h-5 flex items-center justify-center bg-gray-100 text-gray-500 text-[10px] font-black rounded-md">W</span><span className="text-[10px] font-bold text-gray-500 uppercase">Week Off</span></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendanceView;
