import React, { useState, useMemo, FC } from 'react';
import { PartnerUpdatableCandidate, PartnerUpdateStatus } from '../../types';
import Input from '../Input';
import Button from '../Button';
import Modal from '../Modal';
import StatCard from './StatCard';

// MOCK DATA has been removed.
const MOCK_UPDATABLE_CANDIDATES: PartnerUpdatableCandidate[] = [];

const ALL_STATUSES: PartnerUpdateStatus[] = [
    'Pending', 'Contacted - Interested', 'Contacted - Not Interested', 'Interview Scheduled', 'Interview Attended', 'Offer Accepted', 'Offer Rejected', 'Joined', 'Absconded'
];

const getStatusClasses = (status: PartnerUpdateStatus) => {
    if (status.includes('Interested') || status.includes('Accepted') || status.includes('Joined') || status.includes('Attended')) return 'bg-green-100 text-green-800';
    if (status.includes('Not Interested') || status.includes('Rejected') || status.includes('Absconded')) return 'bg-red-100 text-red-800';
    if (status.includes('Scheduled')) return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
};

const ICONS = {
    lineup: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    done: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    rejected: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>,
    pending: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    vendor: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
};


const UpdateStatusForm: FC<{ 
    candidate: PartnerUpdatableCandidate, 
    onSave: (id: string, newStatus: PartnerUpdateStatus, remarks: string) => void, 
    onClose: () => void 
}> = ({ candidate, onSave, onClose }) => {
    const [newStatus, setNewStatus] = useState<PartnerUpdateStatus>(candidate.status);
    const [remarks, setRemarks] = useState(candidate.remarks || '');

    const handleSave = () => {
        onSave(candidate.id, newStatus, remarks);
    };

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                <select 
                    id="status-select" 
                    value={newStatus} 
                    onChange={(e) => setNewStatus(e.target.value as PartnerUpdateStatus)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                    {ALL_STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
                <textarea 
                    id="remarks" 
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g., Scheduled interview for next Tuesday..."
                />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="primary" onClick={handleSave}>Save Status</Button>
            </div>
        </div>
    );
};

const PartnerUpdateStatusView: React.FC = () => {
    const [candidates, setCandidates] = useState<PartnerUpdatableCandidate[]>(MOCK_UPDATABLE_CANDIDATES);
    const [filters, setFilters] = useState({
        search: '',
        client: '',
        role: '',
        status: '',
        vendor: '',
        startDate: '',
        endDate: '',
    });
    const [selectedCandidate, setSelectedCandidate] = useState<PartnerUpdatableCandidate | null>(null);

    const summaryStats = useMemo(() => {
        const stats = {
            interviewLineups: 0,
            interviewDone: 0,
            interviewRejected: 0,
            interviewPending: 0,
            vendorCounts: {} as Record<string, number>,
        };

        candidates.forEach(c => {
            if (c.status === 'Interview Scheduled') stats.interviewLineups++;
            if (['Interview Attended', 'Offer Accepted', 'Joined'].includes(c.status)) stats.interviewDone++;
            if (['Contacted - Not Interested', 'Offer Rejected', 'Absconded'].includes(c.status)) stats.interviewRejected++;
            if (['Pending', 'Contacted - Interested'].includes(c.status)) stats.interviewPending++;
            if (c.vendor) {
                stats.vendorCounts[c.vendor] = (stats.vendorCounts[c.vendor] || 0) + 1;
            }
        });

        return stats;
    }, [candidates]);

    const uniqueClients = useMemo(() => [...new Set(candidates.map(c => c.client))], [candidates]);
    const uniqueRoles = useMemo(() => [...new Set(candidates.map(c => c.role))], [candidates]);
    const uniqueVendors = useMemo(() => [...new Set(candidates.map(c => c.vendor).filter(Boolean))], [candidates]) as string[];

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            client: '',
            role: '',
            status: '',
            vendor: '',
            startDate: '',
            endDate: '',
        });
    };

    const handleUpdateClick = (candidate: PartnerUpdatableCandidate) => {
        setSelectedCandidate(candidate);
    };

    const handleCloseModal = () => {
        setSelectedCandidate(null);
    };

    const handleSaveStatus = (id: string, newStatus: PartnerUpdateStatus, remarks: string) => {
        setCandidates(prev => prev.map(c => 
            c.id === id 
            ? { ...c, status: newStatus, remarks, lastUpdated: new Date().toISOString() } 
            : c
        ));
        handleCloseModal();
        alert('Status updated successfully!');
    };

    const filteredCandidates = useMemo(() => {
        return candidates.filter(c => {
            const searchMatch = filters.search === '' ||
                c.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                c.phone.toLowerCase().includes(filters.search.toLowerCase()) ||
                c.client.toLowerCase().includes(filters.search.toLowerCase()) ||
                c.role.toLowerCase().includes(filters.search.toLowerCase());
            
            const clientMatch = filters.client === '' || c.client === filters.client;
            const roleMatch = filters.role === '' || c.role === filters.role;
            const statusMatch = filters.status === '' || c.status === filters.status;
            const vendorMatch = filters.vendor === '' || c.vendor === filters.vendor;
    
            const lastUpdatedDate = new Date(c.lastUpdated);
            const startDateMatch = filters.startDate === '' || lastUpdatedDate >= new Date(filters.startDate);
            const endDateMatch = filters.endDate === '' || lastUpdatedDate <= new Date(new Date(filters.endDate).setHours(23, 59, 59, 999));
    
            return searchMatch && clientMatch && roleMatch && statusMatch && vendorMatch && startDateMatch && endDateMatch;
        });
    }, [candidates, filters]);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Interview Status Updates</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Interview Line-ups" value={summaryStats.interviewLineups} valueColor="text-blue-600" icon={ICONS.lineup} />
                <StatCard title="Interview Done" value={summaryStats.interviewDone} valueColor="text-green-600" icon={ICONS.done} />
                <StatCard title="Interview Rejected" value={summaryStats.interviewRejected} valueColor="text-red-600" icon={ICONS.rejected} />
                <StatCard title="Interview Pending" value={summaryStats.interviewPending} valueColor="text-yellow-600" icon={ICONS.pending} />
                {Object.entries(summaryStats.vendorCounts).map(([vendor, count]) => (
                    <StatCard key={vendor} title={vendor} value={count} valueColor="text-gray-700" icon={ICONS.vendor} />
                ))}
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <Input
                        id="search"
                        name="search"
                        label="Search"
                        placeholder="Name, Phone, Client, Role..."
                        value={filters.search}
                        onChange={handleFilterChange}
                        wrapperClassName="mb-0"
                    />
                    <div>
                        <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                        <select id="client" name="client" value={filters.client} onChange={handleFilterChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            <option value="">All</option>
                            {uniqueClients.map(client => <option key={client} value={client}>{client}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select id="role" name="role" value={filters.role} onChange={handleFilterChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            <option value="">All</option>
                            {uniqueRoles.map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select id="status" name="status" value={filters.status} onChange={handleFilterChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            <option value="">All</option>
                            {ALL_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="vendor" className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                        <select id="vendor" name="vendor" value={filters.vendor} onChange={handleFilterChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            <option value="">All</option>
                            {uniqueVendors.map(vendor => <option key={vendor} value={vendor}>{vendor}</option>)}
                        </select>
                    </div>
                    <Input
                        id="startDate"
                        name="startDate"
                        label="Updated From"
                        type="date"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        wrapperClassName="mb-0"
                    />
                    <Input
                        id="endDate"
                        name="endDate"
                        label="Updated To"
                        type="date"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        wrapperClassName="mb-0"
                    />
                    <Button variant="secondary" onClick={clearFilters} className="w-full h-[42px]">
                        Clear Filters
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client / Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCandidates.map(candidate => (
                                <tr key={candidate.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                                        <div className="text-sm text-gray-500">{candidate.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div>{candidate.client}</div>
                                        <div className="text-xs text-gray-400">{candidate.role}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(candidate.lastUpdated).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(candidate.status)}`}>
                                            {candidate.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Button variant="primary" size="sm" onClick={() => handleUpdateClick(candidate)}>Update</Button>
                                    </td>
                                </tr>
                            ))}
                             {filteredCandidates.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500">No candidates found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedCandidate && (
                <Modal 
                    isOpen={!!selectedCandidate} 
                    onClose={handleCloseModal} 
                    title={`Update Status for ${selectedCandidate.name}`}
                    description={`Current Status: ${selectedCandidate.status}`}
                >
                   <UpdateStatusForm 
                       candidate={selectedCandidate}
                       onSave={handleSaveStatus}
                       onClose={handleCloseModal}
                   />
                </Modal>
            )}
        </div>
    );
};

export default PartnerUpdateStatusView;