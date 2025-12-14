import React, { useState, useMemo, useEffect } from 'react';
import { Candidate, UserProfile, AttendanceStatus, StoreAttendanceRecord } from '../../types';
import { onStoreEmployeesChange, onStoreAttendanceChange, saveStoreAttendance } from '../../services/firebaseService';
import Button from '../Button';

interface StoreAttendanceViewProps {
    currentUserProfile?: UserProfile | null;
}

const StoreAttendanceView: React.FC<StoreAttendanceViewProps> = ({ currentUserProfile }) => {
    const today = new Date().toISOString().slice(0, 10);
    const [selectedDate, setSelectedDate] = useState(today);
    const [employees, setEmployees] = useState<Candidate[]>([]);
    const [attendance, setAttendance] = useState<Map<string, AttendanceStatus>>(new Map());
    const [isLoading, setIsLoading] = useState(false);

    const storeLocation = currentUserProfile?.storeLocation;

    useEffect(() => {
        if (!storeLocation) return;
        
        setIsLoading(true);
        const unsubEmployees = onStoreEmployeesChange(storeLocation, setEmployees);
        
        return () => unsubEmployees();
    }, [storeLocation]);

    useEffect(() => {
        if (!storeLocation) return;
        
        const unsubAttendance = onStoreAttendanceChange(storeLocation, selectedDate, (records) => {
            const newAttendanceMap = new Map<string, AttendanceStatus>();
            if (records) {
                Object.entries(records).forEach(([employeeId, status]) => {
                    newAttendanceMap.set(employeeId, status);
                });
            }
            setAttendance(newAttendanceMap);
            setIsLoading(false);
        });

        return () => unsubAttendance();

    }, [storeLocation, selectedDate]);

    const handleStatusChange = (employeeId: string, status: AttendanceStatus) => {
        setAttendance(prev => new Map(prev).set(employeeId, status));
    };

    const handleSave = async () => {
        if (!storeLocation) return;
        setIsLoading(true);
        const recordsToSave: Record<string, AttendanceStatus> = {};
        employees.forEach(emp => {
            recordsToSave[emp.id] = attendance.get(emp.id) || 'Absent'; // Default to Absent if not marked
        });

        try {
            await saveStoreAttendance(storeLocation, selectedDate, recordsToSave);
            alert('Attendance saved successfully!');
        } catch (error) {
            console.error("Failed to save attendance:", error);
            alert('Error saving attendance. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const summary = useMemo(() => {
        const values = Array.from(attendance.values());
        return {
            total: employees.length,
            present: values.filter(s => s === 'Present').length,
            absent: values.filter(s => s === 'Absent').length,
            onLeave: values.filter(s => s === 'Leave').length,
            weekOff: values.filter(s => s === 'Week Off').length,
        };
    }, [attendance, employees]);
    
    const getStatusButtonClasses = (status: AttendanceStatus, currentStatus?: AttendanceStatus) => {
        const base = "px-3 py-1 text-xs font-semibold rounded-md cursor-pointer transition-colors";
        const selected = status === currentStatus;
        switch(status) {
            case 'Present': return `${base} ${selected ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'}`;
            case 'Absent': return `${base} ${selected ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'}`;
            case 'Leave': return `${base} ${selected ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`;
            case 'Week Off': return `${base} ${selected ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`;
        }
    };

    const StatCard: React.FC<{ title: string, value: number }> = ({ title, value }) => (
        <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-3xl font-bold text-gray-800">My Team Attendance</h2>
                <div className="flex items-center gap-4">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm"
                    />
                    <Button variant="secondary" size="sm">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download Report
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard title="Total Employees" value={summary.total} />
                <StatCard title="Present" value={summary.present} />
                <StatCard title="Absent" value={summary.absent} />
                <StatCard title="On Leave" value={summary.onLeave} />
                <StatCard title="Week Off" value={summary.weekOff} />
            </div>

            <div className="bg-white rounded-lg shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">EMPLOYEE</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">STATUS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {employees.map(emp => (
                                <tr key={emp.id}>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                                        <div className="text-xs text-gray-500">{emp.role}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {(['Present', 'Absent', 'Leave', 'Week Off'] as AttendanceStatus[]).map(status => (
                                                <button key={status} onClick={() => handleStatusChange(emp.id, status)} className={getStatusButtonClasses(status, attendance.get(emp.id))}>
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="flex justify-end pt-4">
                <Button variant="primary" size="md" onClick={handleSave} loading={isLoading}>
                    Save Attendance
                </Button>
            </div>
        </div>
    );
};

export default StoreAttendanceView;
