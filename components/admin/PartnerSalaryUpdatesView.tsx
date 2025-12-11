import React, { useState, useMemo, FC } from 'react';
import { PartnerSalaryUpdate } from '../../types';
import { calculateBreakdownFromRule } from '../../utils/salaryService';
import Button from '../Button';
import Input from '../Input';
import Modal from '../Modal';

// --- MOCK DATA ---
const MOCK_UPDATES: PartnerSalaryUpdate[] = [];

// --- HELPER FUNCTIONS ---
const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const getStatusClasses = (status: PartnerSalaryUpdate['status']) => {
    switch (status) {
        case 'Confirmed': return 'bg-green-100 text-green-800';
        case 'Pending': return 'bg-yellow-100 text-yellow-800';
        case 'Discrepancy Reported': return 'bg-red-100 text-red-800';
    }
};

// --- SUB-COMPONENTS ---
const StatCard: FC<{ title: string; value: string; color?: string; icon: React.ReactNode }> = ({ title, value, color = 'text-gray-900', icon }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
        <div>
            <h4 className="text-sm font-semibold text-gray-500 mb-1">{title}</h4>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">{icon}</div>
    </div>
);

const ConfirmationModal: FC<{
    update: PartnerSalaryUpdate;
    onClose: () => void;
    onConfirm: (id: string) => void;
    onReportDiscrepancy: (id: string) => void;
}> = ({ update, onClose, onConfirm, onReportDiscrepancy }) => {
    const [isConfirmed, setIsConfirmed] = useState(false);
    const breakdown = calculateBreakdownFromRule(update.annualCTC, null);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold">Salary Breakdown for {update.candidateName}</h3>
            <div className="bg-gray-50 p-4 rounded-lg text-sm grid grid-cols-2 gap-x-4 gap-y-1">
                <span className="text-gray-600">Annual CTC:</span><span className="font-semibold text-right">{formatCurrency(breakdown.annual.ctc)}</span>
                <span className="text-gray-600">Gross Monthly:</span><span className="font-semibold text-right">{formatCurrency(breakdown.monthly.gross)}</span>
                <span className="text-gray-600">Total Deductions:</span><span className="font-semibold text-right text-red-600">-{formatCurrency(breakdown.monthly.totalDeductions)}</span>
                <span className="text-gray-600 font-bold border-t pt-2 mt-1">Net Salary (In-Hand):</span><span className="font-bold text-green-600 border-t pt-2 mt-1 text-right">{formatCurrency(breakdown.monthly.netSalary)}</span>
            </div>
            <div className="flex items-start space-x-3 mt-4">
                <input
                    id="confirmation-checkbox"
                    type="checkbox"
                    checked={isConfirmed}
                    onChange={(e) => setIsConfirmed(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                />
                <label htmlFor="confirmation-checkbox" className="text-sm text-gray-700">
                    I have verified the salary details and confirm they are correct as per the agreement.
                </label>
            </div>
            <div className="flex justify-between items-center pt-4 border-t mt-4">
                <Button variant="danger" size="sm" onClick={() => onReportDiscrepancy(update.id)}>Report Discrepancy</Button>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={() => onConfirm(update.id)} disabled={!isConfirmed}>Confirm & Approve</Button>
                </div>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---
const PartnerSalaryUpdatesView: FC = () => {
    const [updates, setUpdates] = useState<PartnerSalaryUpdate[]>(MOCK_UPDATES);
    const [filters, setFilters] = useState({ search: '', status: '' });
    const [selectedUpdate, setSelectedUpdate] = useState<PartnerSalaryUpdate | null>(null);

    const handleConfirmClick = (update: PartnerSalaryUpdate) => {
        setSelectedUpdate(update);
    };

    const handleStatusChange = (id: string, newStatus: PartnerSalaryUpdate['status']) => {
        setUpdates(prev => prev.map(up => up.id === id ? { ...up, status: newStatus } : up));
        setSelectedUpdate(null);
        alert(`Status for ${id} updated to ${newStatus}.`);
    };

    const filteredUpdates = useMemo(() => {
        return updates.filter(up =>
            (up.candidateName.toLowerCase().includes(filters.search.toLowerCase()) || up.client.toLowerCase().includes(filters.search.toLowerCase())) &&
            (filters.status === '' || up.status === filters.status)
        );
    }, [updates, filters]);

    const summary = useMemo(() => {
        const confirmedPayout = updates
            .filter(u => u.status === 'Confirmed')
            .reduce((sum, u) => sum + u.monthlyNetSalary, 0);
        return {
            total: updates.length,
            pending: updates.filter(u => u.status === 'Pending').length,
            confirmedPayout,
        };
    }, [updates]);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Salary Updates</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <StatCard title="Total Updates" value={summary.total.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
                 <StatCard title="Pending Confirmation" value={summary.pending.toString()} color="text-yellow-600" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                 <StatCard title="Confirmed Monthly Payout" value={formatCurrency(summary.confirmedPayout)} color="text-green-600" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input id="search" label="Search by Candidate or Client" value={filters.search} onChange={(e) => setFilters(f => ({...f, search: e.target.value}))} wrapperClassName="mb-0" />
                <div>
                    <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select id="status-filter" value={filters.status} onChange={(e) => setFilters(f => ({...f, status: e.target.value}))} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        <option value="">All</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Discrepancy Reported">Discrepancy Reported</option>
                    </select>
                </div>
            </div>

             <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client / Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joining Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Annual CTC</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monthly Net</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUpdates.map(up => (
                                <tr key={up.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{up.candidateName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500"><div>{up.client}</div><div className="text-xs">{up.role}</div></td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(up.joiningDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right text-sm font-semibold">{formatCurrency(up.annualCTC)}</td>
                                    <td className="px-6 py-4 text-right text-sm font-bold text-green-600">{formatCurrency(up.monthlyNetSalary)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(up.status)}`}>{up.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm">
                                        {up.status === 'Pending' ? (
                                            <Button variant="primary" size="sm" onClick={() => handleConfirmClick(up)}>Confirm Details</Button>
                                        ) : (
                                            <Button variant="ghost" size="sm" disabled>No Action</Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                             {filteredUpdates.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-gray-500">No salary updates match the current filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedUpdate && (
                <Modal isOpen={!!selectedUpdate} onClose={() => setSelectedUpdate(null)} title="Confirm Salary Details" maxWidth="max-w-lg">
                    <ConfirmationModal 
                        update={selectedUpdate}
                        onClose={() => setSelectedUpdate(null)}
                        onConfirm={(id) => handleStatusChange(id, 'Confirmed')}
                        onReportDiscrepancy={(id) => handleStatusChange(id, 'Discrepancy Reported')}
                    />
                </Modal>
            )}
        </div>
    );
};

export default PartnerSalaryUpdatesView;