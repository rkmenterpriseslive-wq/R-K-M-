import React, { useState } from 'react';
import Button from '../Button';

const DailyReportView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    // Formatting date to dd-mm-yyyy from the image format
    const [selectedDate, setSelectedDate] = useState('22-12-2025');

    const tableHeaderClass = "px-4 py-2 border-r border-black text-xs font-bold text-black";
    const tableCellClass = "px-4 py-3 border-r border-gray-300 h-12";

    const renderTable = (title: string, data: any[]) => (
        <div className="bg-white border-2 border-black">
            <h3 className="text-center font-bold bg-yellow-400 border-b-2 border-black py-2">{title}</h3>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead className="bg-yellow-400">
                        <tr className="border-b-2 border-black">
                            <th className={`${tableHeaderClass} w-16 border-r border-black`}>S. NO.</th>
                            <th className={tableHeaderClass}>RECRUITER NAME</th>
                            <th className={tableHeaderClass}>CLIENT NAME</th>
                            <th className={tableHeaderClass}>POSITION</th>
                            <th className={tableHeaderClass}>CANDIDATE NAME</th>
                            <th className={tableHeaderClass}>MOBILE NO</th>
                            <th className={tableHeaderClass}>LOCATION</th>
                            <th className={`${tableHeaderClass} border-r-0`}>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr className="border-t border-gray-300">
                                <td colSpan={8} className="text-center py-16 text-gray-500">
                                    No {title.toLowerCase().includes('submissions') ? 'submissions' : 'selections'} found for your team today
                                </td>
                            </tr>
                        ) : (
                            <></>
                        )}
                        {[...Array(3)].map((_, i) => (
                            <tr key={i} className="border-t border-gray-300">
                                <td className={tableCellClass}></td>
                                <td className={tableCellClass}></td>
                                <td className={tableCellClass}></td>
                                <td className={tableCellClass}></td>
                                <td className={tableCellClass}></td>
                                <td className={tableCellClass}></td>
                                <td className={tableCellClass}></td>
                                <td className={`${tableCellClass} border-r-0`}></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Daily Report View</h2>
                <Button variant="secondary" onClick={onBack}>Back to Reports</Button>
            </div>
            <div className="border border-black inline-flex items-center bg-white">
                 <input 
                    type="text" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)} 
                    className="p-2 border-r border-black focus:outline-none"
                    placeholder="dd-mm-yyyy"
                 />
                 <span className="px-2 cursor-pointer">📅</span>
            </div>
            {renderTable('Daily New Submissions', [])}
            {renderTable('New Selection Today', [])}
        </div>
    );
};

export default DailyReportView;
