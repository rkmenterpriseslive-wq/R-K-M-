import React, { useState, useMemo, useEffect } from 'react';

type DayStatus = 'Present' | 'Absent' | 'Holiday' | 'Weekend' | 'Future';

interface Day {
    date: number;
    status: DayStatus;
}

const MyAttendanceView: React.FC = () => {
    const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

    const generateCalendarDays = (date: Date): Day[] => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 for Sunday, 1 for Monday...
        
        let calendarDays: Day[] = [];
        // Add empty cells for days before the 1st
        for (let i = 0; i < firstDayOfWeek; i++) {
            calendarDays.push({ date: 0, status: 'Future' });
        }

        // Add days of the month with mock status
        for (let day = 1; day <= daysInMonth; day++) {
            const weekDay = new Date(year, month, day).getDay();
            let status: DayStatus = 'Present'; // Default
            if (weekDay === 0 || weekDay === 6) status = 'Weekend'; // Sunday or Saturday
            if (day === 10 || day === 26) status = 'Holiday';
            if (day === 5 || day === 18) status = 'Absent';
            
            // For future months, all are future
            if (new Date(year, month, day) > new Date()) status = 'Future';

            calendarDays.push({ date: day, status });
        }
        return calendarDays;
    };

    const calendarDays = useMemo(() => generateCalendarDays(currentMonthDate), [currentMonthDate]);
    
    const summary = useMemo(() => {
        const present = calendarDays.filter(d => d.status === 'Present').length;
        const absent = calendarDays.filter(d => d.status === 'Absent').length;
        const totalWorkingDays = calendarDays.filter(d => d.status === 'Present' || d.status === 'Absent').length;
        return { present, absent, totalWorkingDays };
    }, [calendarDays]);

    const changeMonth = (offset: number) => {
        setCurrentMonthDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + offset);
            return newDate;
        });
    };
    
    const getDayClasses = (status: DayStatus) => {
        switch(status) {
            case 'Present': return 'bg-green-100 border-green-200 text-green-800';
            case 'Absent': return 'bg-red-100 border-red-200 text-red-800';
            case 'Holiday': return 'bg-yellow-100 border-yellow-200 text-yellow-800';
            case 'Weekend': return 'bg-gray-100 text-gray-400';
            default: return 'bg-white';
        }
    };
    
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">My Attendance</h2>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100">&lt;</button>
                    <h3 className="text-lg font-semibold">{currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100">&gt;</button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500 mb-2">
                    {weekDays.map(day => <div key={day}>{day}</div>)}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day, index) => (
                        <div key={index} className={`h-20 p-2 border rounded-lg flex flex-col items-center justify-center ${getDayClasses(day.status)}`}>
                            {day.date > 0 && <span className="text-lg font-bold">{day.date}</span>}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-500">Total Working Days</h4>
                    <p className="text-3xl font-bold text-gray-900">{summary.totalWorkingDays}</p>
                </div>
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-500">Present</h4>
                    <p className="text-3xl font-bold text-green-600">{summary.present}</p>
                </div>
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-500">Absent</h4>
                    <p className="text-3xl font-bold text-red-600">{summary.absent}</p>
                </div>
            </div>
        </div>
    );
};

export default MyAttendanceView;