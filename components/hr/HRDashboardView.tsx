import React from 'react';
import { AdminMenuItem } from '../../types';
import StatCard from '../admin/StatCard';
import { getHRDashboardStats, getRecentActivities } from '../../utils/hrService';

interface HRDashboardViewProps {
    onNavigate: (item: AdminMenuItem) => void;
}

const HRDashboardView: React.FC<HRDashboardViewProps> = ({ onNavigate }) => {
    const stats = getHRDashboardStats();
    const activities = getRecentActivities();

    const ICONS = {
        total: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
        newHires: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
        onboarding: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
        payroll: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">HR Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total Employees" value={stats.totalEmployees} icon={ICONS.total} />
                <StatCard title="New Hires This Month" value={stats.newHires} valueColor="text-green-600" icon={ICONS.newHires} />
                <StatCard title="Pending Onboarding" value={stats.pendingOnboarding} valueColor="text-yellow-600" icon={ICONS.onboarding} />
                <StatCard title="Total Monthly Payroll" value={`₹${(stats.pendingPayroll / 100000).toFixed(1)}L`} valueColor="text-blue-600" icon={ICONS.payroll} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h3>
                    <div className="space-y-3">
                        <button onClick={() => onNavigate(AdminMenuItem.EmployeeManagement)} className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700">Manage Employees & Onboarding</button>
                        <button onClick={() => onNavigate(AdminMenuItem.ManagePayroll)} className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700">Process Monthly Payroll</button>
                        <button onClick={() => onNavigate(AdminMenuItem.GenerateOfferLetter)} className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700">Generate Offer Letter</button>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                    <ul className="space-y-3">
                        {activities.map((activity, index) => (
                            <li key={index} className="flex items-center text-sm text-gray-600 border-b border-gray-100 pb-2 last:border-b-0">
                                <span className="mr-3 text-green-500">✓</span>
                                {activity}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default HRDashboardView;