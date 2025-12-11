
import React from 'react';
import { AdminMenuItem, PartnerRequirementStats } from '../../types';
import StatCard from '../admin/StatCard';

interface PartnerDashboardViewProps {
    onNavigate: (item: AdminMenuItem) => void;
    partnerRequirementStats: PartnerRequirementStats;
    activeCandidatesCount: number;
    pendingInvoicesCount: number;
    supervisorsCount: number;
}

const PartnerDashboardView: React.FC<PartnerDashboardViewProps> = ({ 
    onNavigate, 
    partnerRequirementStats,
    activeCandidatesCount,
    pendingInvoicesCount,
    supervisorsCount
}) => {
    
    const ICONS = {
        candidates: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
        requirements: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
        invoices: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
        supervisors: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
    };

    const quickLinks = [
        { label: 'Update Candidate Status', item: AdminMenuItem.PartnerUpdateStatus },
        { label: 'Submit New Requirement', item: AdminMenuItem.PartnerRequirements },
        { label: 'View Invoices', item: AdminMenuItem.PartnerInvoices },
        { label: 'Manage Supervisors', item: AdminMenuItem.ManageSupervisors },
        { label: 'Check Salary Updates', item: AdminMenuItem.PartnerSalaryUpdates },
        { label: 'Get Help', item: AdminMenuItem.PartnerHelpCenter },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Partner Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="cursor-pointer" onClick={() => onNavigate(AdminMenuItem.PartnerActiveCandidates)}>
                    <StatCard title="Active Candidates" value={activeCandidatesCount} icon={ICONS.candidates} />
                </div>
                <div className="cursor-pointer" onClick={() => onNavigate(AdminMenuItem.PartnerRequirements)}>
                     <StatCard
                        title="Requirements Status"
                        metrics={[
                          { label: "Pending", value: partnerRequirementStats.pending, color: 'text-yellow-600' },
                          { label: "Approved", value: partnerRequirementStats.approved, color: 'text-green-600' },
                        ]}
                        icon={ICONS.requirements}
                    />
                </div>
                <div className="cursor-pointer" onClick={() => onNavigate(AdminMenuItem.PartnerInvoices)}>
                    <StatCard title="Pending Invoices" value={pendingInvoicesCount} valueColor="text-red-600" icon={ICONS.invoices} />
                </div>
                <div className="cursor-pointer" onClick={() => onNavigate(AdminMenuItem.ManageSupervisors)}>
                    <StatCard title="Supervisors Managed" value={supervisorsCount} icon={ICONS.supervisors} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h3>
                    <div className="space-y-3">
                        {quickLinks.map(link => (
                            <button 
                                key={link.item} 
                                onClick={() => onNavigate(link.item)} 
                                className="w-full text-left p-3 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h3>
                    <ul className="space-y-3">
                        <li className="text-sm text-gray-600">Requirement for 'Picker' was approved.</li>
                        <li className="text-sm text-gray-600">You updated the status for candidate 'Anjali Verma'.</li>
                        <li className="text-sm text-gray-600">A new invoice #INV-2023-010 was generated.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PartnerDashboardView;
