
import React, { useState, useMemo, useEffect } from 'react';
import Button from '../Button';
import Input from '../Input';
import DailyReportView from './DailyReportView';
import { UserProfile, UserType } from '../../types';

// --- Types ---
type ReportType = 
    | 'Daily Report' 
    | 'Daily Lineup Report' 
    | 'Selection Pipeline' 
    | 'Attendance & Commission' 
    | 'Complaints Log' 
    | 'Warning Letters' 
    | 'Recruiter Performance' 
    | null;

interface RecentReport {
    name: string;
    date: string;
    generatedBy: string;
}

interface ReportsViewProps {
    allUsers: UserProfile[];
}

// --- Icons ---
const Icons = {
    Daily: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    Lineup: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
    Pipeline: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    Attendance: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Complaints: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    Warning: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    Performance: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    Placeholder: () => <svg className="w-16 h-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>,
    File: () => <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
};

// --- Sub-components ---
const ReportCard: React.FC<{ 
    title: ReportType; 
    description: string; 
    icon: React.ReactNode; 
    isSelected: boolean;
    onClick: () => void;
}> = ({ title, description, icon, isSelected, onClick }) => (
    <button 
        onClick={onClick}
        className={`flex items-start p-6 text-left bg-white border rounded-xl shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group ${
            isSelected ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-gray-200'
        }`}
    >
        <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
            {icon}
        </div>
        <div className="ml-4">
            <h4 className="text-base font-bold text-gray-900 leading-tight">{title}</h4>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</p>
        </div>
    </button>
);

const ReportsView: React.FC<ReportsViewProps> = ({ allUsers }) => {
    const [selectedReport, setSelectedReport] = useState<ReportType>('Daily Report');
    const [isGenerating, setIsGenerating] = useState(false);
    const [view, setView] = useState<'main' | 'dailyReport'>('main');

    // Filter states
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [exportFormat, setExportFormat] = useState('Excel (.xlsx)');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [selectedRecruiter, setSelectedRecruiter] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    const [recentReports] = useState<RecentReport[]>([
        { name: 'Attendance_Oct2023.csv', date: 'Oct 26, 2023', generatedBy: 'Admin' },
        { name: 'Daily_Lineup_W4_Oct.xlsx', date: 'Oct 25, 2023', generatedBy: 'Rahul' },
    ]);

    const recruiters = useMemo(() => 
        allUsers.filter(u => [UserType.TEAM, UserType.TEAMLEAD, UserType.HR, UserType.ADMIN].includes(u.userType))
    , [allUsers]);
    
    useEffect(() => {
        // Reset filters when report type changes for a cleaner UX
        setDateRange({ start: '', end: '' });
        setSelectedMonth(new Date().toISOString().slice(0, 7));
        setSelectedRecruiter('');
        setSelectedStatus('');
        setExportFormat('Excel (.xlsx)');
    }, [selectedReport]);

    const reportCategories = [
        { title: 'Daily Report' as ReportType, desc: 'View and export daily submissions and selections.', icon: <Icons.Daily /> },
        { title: 'Daily Lineup Report' as ReportType, desc: 'Daily candidate submission and call status logs.', icon: <Icons.Lineup /> },
        { title: 'Selection Pipeline' as ReportType, desc: 'Candidates stage-wise status from Sourced to Selected.', icon: <Icons.Pipeline /> },
        { title: 'Attendance & Commission' as ReportType, desc: 'Monthly attendance records and commission calculations.', icon: <Icons.Attendance /> },
        { title: 'Complaints Log' as ReportType, desc: 'Register of candidate grievances and resolutions.', icon: <Icons.Complaints /> },
        { title: 'Warning Letters' as ReportType, desc: 'History of disciplinary actions and warning letters.', icon: <Icons.Warning /> },
        { title: 'Recruiter Performance' as ReportType, desc: 'Efficiency metrics for individual team members.', icon: <Icons.Performance /> },
    ];
    
    const labelStyle = "block text-sm font-medium text-gray-700 mb-2";
    const dateInputStyle = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
    const selectStyle = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white";

    const handleGenerate = () => {
        if (!selectedReport) return;

        if (selectedReport === 'Daily Report' && exportFormat === 'View on Screen') {
            setView('dailyReport');
            return;
        }

        setIsGenerating(true);
        let filtersUsed = `Report: ${selectedReport}\nFormat: ${exportFormat}`;
        if (dateRange.start || dateRange.end) filtersUsed += `\nDate Range: ${dateRange.start || 'N/A'} to ${dateRange.end || 'N/A'}`;
        if (selectedReport === 'Attendance & Commission') filtersUsed += `\nMonth: ${selectedMonth}`;
        if (selectedRecruiter) filtersUsed += `\nRecruiter: ${selectedRecruiter}`;
        if (selectedStatus) filtersUsed += `\nStatus: ${selectedStatus}`;
        
        setTimeout(() => {
            alert(`Generating report with options:\n\n${filtersUsed}`);
            setIsGenerating(false);
        }, 1500);
    };

    const ConfigurationOptions = () => {
        const DateRangeFilter = () => (
            <div>
                <label className={labelStyle}>Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                    <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className={dateInputStyle} />
                    <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className={dateInputStyle} />
                </div>
            </div>
        );
        const ExportFormatFilter = ({ showViewOption = false }) => (
            <div>
                <label htmlFor="exportFormat" className={labelStyle}>Export Format</label>
                <select id="exportFormat" value={exportFormat} onChange={e => setExportFormat(e.target.value)} className={selectStyle}>
                    <option>Excel (.xlsx)</option>
                    <option>CSV (.csv)</option>
                    <option>PDF (.pdf)</option>
                    {showViewOption && <option>View on Screen</option>}
                </select>
            </div>
        );

        switch(selectedReport) {
            case 'Daily Report':
                return <div className="space-y-4"><DateRangeFilter /><ExportFormatFilter showViewOption /></div>;
            
            case 'Daily Lineup Report':
            case 'Recruiter Performance':
                return <div className="space-y-4"><DateRangeFilter /><ExportFormatFilter /></div>;

            case 'Selection Pipeline':
                return (
                    <div className="space-y-4">
                        <DateRangeFilter />
                        <div>
                            <label htmlFor="recruiter" className={labelStyle}>Recruiter</label>
                            <select id="recruiter" value={selectedRecruiter} onChange={e => setSelectedRecruiter(e.target.value)} className={selectStyle}>
                                <option value="">All Recruiters</option>
                                {recruiters.map(r => <option key={r.uid} value={r.name || r.uid}>{r.name || 'Unnamed'}</option>)}
                            </select>
                        </div>
                        <ExportFormatFilter />
                    </div>
                );

            case 'Attendance & Commission':
                 return (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="month" className={labelStyle}>Month</label>
                            <input id="month" type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className={dateInputStyle} />
                        </div>
                        <ExportFormatFilter />
                    </div>
                );

            case 'Complaints Log':
            case 'Warning Letters':
                const statusOptions = selectedReport === 'Complaints Log' ? ['Active', 'Closed'] : ['Active', 'Resolved'];
                return (
                    <div className="space-y-4">
                        <DateRangeFilter />
                        <div>
                            <label htmlFor="status" className={labelStyle}>Status</label>
                            <select id="status" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className={selectStyle}>
                                <option value="">All Statuses</option>
                                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <ExportFormatFilter />
                    </div>
                );

            default:
                return (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500">This report is ready to be generated.</p>
                        <ExportFormatFilter />
                    </div>
                );
        }
    };
    
    if (view === 'dailyReport') {
        return <DailyReportView onBack={() => setView('main')} />;
    }

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Reports Center</h2>
                <p className="text-gray-500 mt-1 font-medium">Generate and download system-wide reports.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Report Categories */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reportCategories.map((report) => (
                        <ReportCard 
                            key={report.title}
                            title={report.title}
                            description={report.desc}
                            icon={report.icon}
                            isSelected={selectedReport === report.title}
                            onClick={() => setSelectedReport(report.title)}
                        />
                    ))}
                </div>

                {/* Right Side: Configuration */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="text-base font-bold text-gray-800">Report Configuration</h3>
                        </div>
                        <div className="p-6 flex flex-col justify-between flex-grow">
                            {!selectedReport ? (
                                <div className="text-center space-y-4 py-12">
                                    <div className="flex justify-center"><Icons.Placeholder /></div>
                                    <p className="text-gray-400 font-medium">Select a report type from the list to configure details.</p>
                                </div>
                            ) : (
                                <div className="w-full space-y-6 animate-fade-in">
                                   <div>
                                       <h4 className="font-bold text-gray-800">{selectedReport}</h4>
                                       <p className="text-sm text-gray-500">Configure parameters to generate this report.</p>
                                   </div>
                                   <div className="space-y-4">
                                       <ConfigurationOptions />
                                   </div>
                                    <Button 
                                       variant='primary' 
                                       className="w-full justify-center py-3 font-bold shadow-lg shadow-blue-500/20 mt-auto"
                                       onClick={handleGenerate}
                                       loading={isGenerating}
                                   >
                                       Generate Report
                                   </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recently Generated Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-base font-bold text-gray-800">Recently Generated</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Report Name</th>
                                <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Generated By</th>
                                <th className="px-6 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {recentReports.map((report, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Icons.File />
                                            <span className="ml-3 text-sm font-bold text-gray-700">{report.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                        {report.date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                        {report.generatedBy}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                                        <button className="text-blue-600 hover:text-blue-800 transition-colors">Download</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsView;
