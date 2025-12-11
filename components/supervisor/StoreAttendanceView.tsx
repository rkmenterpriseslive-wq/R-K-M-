import React, { useState, useMemo, useEffect } from 'react';
import { StoreEmployee, AttendanceRecord } from '../../utils/supervisorService';
import * as supervisorService from '../../utils/supervisorService';
import Button from '../Button';

type AttendanceStatus = 'Present' | 'Absent' | 'Leave';

const StoreAttendanceView: React.FC = () => {
    const today = new Date().toISOString().slice(0, 10);
    const [selectedDate, setSelectedDate] = useState(today);
    const [employees] = useState<StoreEmployee[]>(supervisorService.getStoreEmployees());
    const [attendance, setAttendance] = useState<Map<string, AttendanceStatus>>(new Map());
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const records = supervisorService.getAttendanceForDate(selectedDate);
        const attendanceMap = new Map<string, AttendanceStatus>();
        records.forEach(rec => {
            attendanceMap.set(rec.employeeId, rec.status);
        });
        setAttendance(attendanceMap);
    }, [selectedDate]);

    const handleStatusChange = (employeeId: string, status: AttendanceStatus) => {
        setAttendance(prev => new Map(prev).set(employeeId, status));
    };

    const handleSave = () => {
        setIsLoading(true);
        const recordsToSave: AttendanceRecord[] = employees.map(emp => ({
            employeeId: emp.id,
            date: selectedDate,
            status: attendance.get(emp.id) || 'Absent', // Default to absent if not set
        }));
        supervisorService.saveAttendanceForDate(selectedDate, recordsToSave);
        setTimeout(() => { // Simulate API call
            setIsLoading(false);
            alert('Attendance saved successfully!');
        }, 500);
    };

    const summary = useMemo(() => {
        const present = Array.from(attendance.values()).filter(s => s === 'Present').length;
        const absent = Array.from(attendance.values()).filter(s => s === 'Absent').length;
        const onLeave = Array.from(attendance.values()).filter(s => s === 'Leave').length;
        return { present, absent, onLeave, total: employees.length };
    }, [attendance, employees]);
    
    const getStatusRadioClasses = (status: AttendanceStatus, currentStatus?: AttendanceStatus) => {
        const base = "px-3 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors";
        const selected = status === currentStatus;
        switch(status) {
            case 'Present': return `${base} ${selected ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'}`;
            case 'Absent': return `${base} ${selected ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'}`;
            case 'Leave': return `${base} ${selected ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-3xl font-bold text-gray-800">Store Attendance</h2>
                <div className="w-full sm:w-auto">
                    <label htmlFor="attendance-date" className="sr-only">Select Date</label>
                    <input
                        type="date"
                        id="attendance-date"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="block w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200"><h4 className="text-sm text-gray-500">Total Employees</h4><p className="text-2xl font-bold">{summary.total}</p></div>
                <div className="bg-white p-4 rounded-xl border border-gray-200"><h4 className="text-sm text-gray-500">Present</h4><p className="text-2xl font-bold text-green-600">{summary.present}</p></div>
                <div className="bg-white p-4 rounded-xl border border-gray-200"><h4 className="text-sm text-gray-500">Absent</h4><p className="text-2xl font-bold text-red-600">{summary.absent}</p></div>
                <div className="bg-white p-4 rounded-xl border border-gray-200"><h4 className="text-sm text-gray-500">On Leave</h4><p className="text-2xl font-bold text-yellow-600">{summary.onLeave}</p></div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {employees.map(emp => (
                                <tr key={emp.id}>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                                        <div className="text-xs text-gray-500">{emp.role}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center items-center gap-2">
                                            {(['Present', 'Absent', 'Leave'] as AttendanceStatus[]).map(status => (
                                                <label key={status} className={getStatusRadioClasses(status, attendance.get(emp.id))}>
                                                    <input
                                                        type="radio"
                                                        name={`status-${emp.id}`}
                                                        value={status}
                                                        checked={attendance.get(emp.id) === status}
                                                        onChange={() => handleStatusChange(emp.id, status)}
                                                        className="sr-only"
                                                    />
                                                    {status}
                                                </label>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="flex justify-end">
                <Button variant="primary" size="lg" onClick={handleSave} loading={isLoading}>
                    Save Attendance
                </Button>
            </div>
        </div>
    );
};

export default StoreAttendanceView;
