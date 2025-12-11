import React, { useState, useMemo } from 'react';
import StatCard from '../admin/StatCard';
import { StoreEmployee, AttendanceRecord } from '../../utils/supervisorService';
import * as supervisorService from '../../utils/supervisorService';

const SupervisorDashboardView: React.FC = () => {
    const [employees] = useState<StoreEmployee[]>(supervisorService.getStoreEmployees());
    const [todaysAttendance] = useState<AttendanceRecord[]>(supervisorService.getAttendanceForDate(new Date().toISOString().slice(0, 10)));

    const summary = useMemo(() => {
        const present = todaysAttendance.filter(rec => rec.status === 'Present').length;
        const absent = todaysAttendance.filter(rec => rec.status === 'Absent').length;
        const onLeave = todaysAttendance.filter(rec => rec.status === 'Leave').length;
        return { present, absent, onLeave, total: employees.length };
    }, [employees, todaysAttendance]);
    
    const absentEmployees = useMemo(() => {
        const absentIds = new Set(todaysAttendance.filter(r => r.status === 'Absent').map(r => r.employeeId));
        return employees.filter(emp => absentIds.has(emp.id));
    }, [employees, todaysAttendance]);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Supervisor Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total Employees" value={summary.total} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
                <StatCard title="Present Today" value={summary.present} valueColor="text-green-600" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <StatCard title="Absent Today" value={summary.absent} valueColor="text-red-600" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>} />
                <StatCard title="On Leave" value={summary.onLeave} valueColor="text-yellow-600" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <h3 className="px-6 py-4 text-lg font-semibold text-gray-800 border-b">Today's Absent Employees</h3>
                {absentEmployees.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {absentEmployees.map(emp => (
                            <li key={emp.id} className="px-6 py-4 flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                                    <p className="text-xs text-gray-500">{emp.role}</p>
                                </div>
                                <a href={`tel:${emp.phone}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">Call Now</a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="px-6 py-8 text-center text-sm text-gray-500">Full attendance today!</p>
                )}
            </div>
        </div>
    );
};

export default SupervisorDashboardView;
