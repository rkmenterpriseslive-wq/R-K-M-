
import React, { useState, useEffect, useMemo } from 'react';
import { DailyLineup, CallStatus, PanelConfig, UserProfile, UserType } from '../../types';
import { onDailyLineupsChange, updateDailyLineup, addCandidateToSelection, getPanelConfig, addDailyLineup } from '../../services/firebaseService';
import Button from '../Button';
import Input from '../Input';
import Modal from '../Modal';
import AddLineupForm from './AddLineupForm'; // Import the new component
import UpdateLineupStatusForm from './UpdateLineupStatusForm'; // Import the new update form

interface DailyLineupsViewProps {
    currentUserProfile?: UserProfile | null;
}


const DailyLineupsView: React.FC<DailyLineupsViewProps> = ({ currentUserProfile }) => {
    const [lineups, setLineups] = useState<DailyLineup[]>([]);
    const [panelConfig, setPanelConfig] = useState<PanelConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // UI State for Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // New: for edit modal
    const [editingLineup, setEditingLineup] = useState<DailyLineup | null>(null); // New: for currently edited lineup

    // Filter State
    const [filters, setFilters] = useState({
        search: '',
        vendor: '',
        role: '',
        location: '',
        storeName: '',
        submittedBy: '',
        callStatus: '' as CallStatus | '',
    });

    // Form State for Add New Lineup Modal (initial values for form resets)
    const [newForm, setNewForm] = useState<Omit<DailyLineup, 'id' | 'createdAt' | 'interviewDateTime' | 'submittedBy'>>({
        candidateName: '',
        contact: '',
        vendor: '',
        role: '',
        location: '',
        storeName: '',
        callStatus: 'Connected', // Default as per image
        interviewDate: null,
        interviewTime: null,
        interviewPlace: null,
    });

    useEffect(() => {
        const unsubLineups = onDailyLineupsChange(setLineups);
        getPanelConfig().then(setPanelConfig);
        setIsLoading(false);
        return () => unsubLineups();
    }, []);

    const myLineups = useMemo(() => {
        if (currentUserProfile && [UserType.TEAM, UserType.TEAMLEAD].includes(currentUserProfile.userType)) {
            return lineups.filter(l => l.recruiterUid === currentUserProfile.uid);
        }
        return lineups;
    }, [lineups, currentUserProfile]);

    const clearFilters = () => {
        setFilters({
            search: '',
            vendor: '',
            role: '',
            location: '',
            storeName: '',
            submittedBy: '',
            callStatus: '',
        });
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredLineups = useMemo(() => {
        return myLineups.filter(l => {
            const matchesSearch = !filters.search || 
                l.candidateName.toLowerCase().includes(filters.search.toLowerCase()) || 
                l.contact.includes(filters.search);
            const matchesVendor = !filters.vendor || l.vendor === filters.vendor;
            const matchesRole = !filters.role || l.role === filters.role;
            const matchesLoc = !filters.location || l.location === filters.location;
            const matchesStore = !filters.storeName || l.storeName === filters.storeName;
            const matchesHr = !filters.submittedBy || l.submittedBy === filters.submittedBy;
            const matchesStatus = !filters.callStatus || l.callStatus === filters.callStatus;
            
            return matchesSearch && matchesVendor && matchesRole && matchesLoc && matchesStore && matchesHr && matchesStatus;
        });
    }, [myLineups, filters]);

    // Renamed and updated to accept partial data for comprehensive updates
    const handleUpdateLineup = async (id: string, data: Partial<DailyLineup>) => {
        try {
            await updateDailyLineup(id, data);
            // Close the modal if it was an edit from the modal
            if (isEditModalOpen) {
                setIsEditModalOpen(false);
                setEditingLineup(null);
            }
        } catch (error) {
            alert("Failed to update lineup.");
            console.error("Error updating lineup:", error);
        }
    };

    const handleSaveNewLineup = async (data: Omit<DailyLineup, 'id' | 'createdAt' | 'interviewDateTime' | 'submittedBy'>) => {
        try {
            const lineupWithSubmittedBy: Omit<DailyLineup, 'id' | 'createdAt' | 'interviewDateTime'> = {
                ...data,
                submittedBy: currentUserProfile?.name || 'Admin',
                recruiterUid: currentUserProfile?.uid || 'Admin',
            };
            await addDailyLineup(lineupWithSubmittedBy);
            alert('Lineup added successfully!');
            setIsAddModalOpen(false);
            setNewForm({ // Reset form for next use
                candidateName: '',
                contact: '',
                vendor: '',
                role: '',
                location: '',
                storeName: '',
                callStatus: 'Connected',
                interviewDate: null,
                interviewTime: null,
                interviewPlace: null,
            });
        } catch (error) {
            alert('Failed to add lineup.');
            console.error(error);
            throw error;
        }
    };

    // Extract unique values for filters
    const uniqueVendors = [...new Set(myLineups.map(l => l.vendor))].sort();
    const uniqueStores = [...new Set(myLineups.map(l => l.storeName))].sort();
    const uniqueHrNames = [...new Set(myLineups.map(l => l.submittedBy))].sort();

    const labelStyle = "block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5";
    const selectStyle = "block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-600 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%201024%201024%22%3E%3Cpath%20d%3D%22M256%20384l256%20256%20256-256H256z%22%20fill%3D%22%23666%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat";

    return (
        <div className="space-y-8 pb-20">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-4xl font-black text-[#1e293b] tracking-tight">Daily Lineups</h2>
                <div className="flex gap-3">
                    <Button 
                        variant="secondary" 
                        onClick={() => alert("Downloading Report...")}
                        className="bg-white border border-gray-200 text-gray-700 shadow-sm flex items-center px-5 py-2.5 rounded-lg"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download Report
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-[#0f172a] hover:bg-black text-white px-6 py-2.5 rounded-lg shadow-lg font-bold"
                    >
                        Add New Lineup
                    </Button>
                </div>
            </div>

            {/* Filter Section - Redesigned to match image */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <div>
                            <label className={labelStyle}>Search Candidate</label>
                            <Input 
                                id="search"
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                placeholder="e.g. Amit Verma"
                                wrapperClassName="mb-0"
                                className="py-2.5 rounded-lg border-gray-200"
                            />
                        </div>
                        <div>
                            <label className={labelStyle}>Role</label>
                            <select name="role" value={filters.role} onChange={handleFilterChange} className={selectStyle}>
                                <option value="">All Roles</option>
                                {panelConfig?.jobRoles.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelStyle}>Store Name</label>
                            <select name="storeName" value={filters.storeName} onChange={handleFilterChange} className={selectStyle}>
                                <option value="">All Stores</option>
                                {uniqueStores.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelStyle}>Call Status</label>
                            <select name="callStatus" value={filters.callStatus} onChange={handleFilterChange} className={selectStyle}>
                                <option value="">All Statuses</option>
                                <option value="Applied">Applied</option>
                                <option value="Connected">Connected</option>
                                <option value="Interested">Interested</option>
                                <option value="No Answer">No Answer</option>
                                <option value="Callback">Callback</option>
                                <option value="Not Interested">Not Interested</option>
                                <option value="Already Call">Already Call</option>
                            </select>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <div>
                            <label className={labelStyle}>Vendor / Role</label>
                            <select name="vendor" value={filters.vendor} onChange={handleFilterChange} className={selectStyle}>
                                <option value="">All Vendors</option>
                                {uniqueVendors.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelStyle}>Location</label>
                            <select name="location" value={filters.location} onChange={handleFilterChange} className={selectStyle}>
                                <option value="">All Locations</option>
                                {panelConfig?.locations.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelStyle}>Submitted By</label>
                            <select name="submittedBy" value={filters.submittedBy} onChange={handleFilterChange} className={selectStyle}>
                                <option value="">All</option>
                                {uniqueHrNames.map(name => <option key={name} value={name}>{name}</option>)}
                            </select>
                        </div>
                        <div className="pt-5.5">
                            <button 
                                onClick={clearFilters}
                                className="w-full py-2.5 border border-gray-200 rounded-lg text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lineups Table - Matching structure of image */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-[#f8fafc]">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Candidate</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Vendor</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Store Name</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Submitted By</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Call Status</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Interview Date</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th> {/* New column */}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {isLoading ? (
                                <tr><td colSpan={10} className="text-center py-20 text-gray-400 italic">Loading lineups...</td></tr>
                            ) : filteredLineups.length > 0 ? filteredLineups.map(l => (
                                <tr key={l.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#1e293b]">{l.candidateName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{l.contact}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-bold">{l.vendor}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{l.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{l.location}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{l.storeName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{l.submittedBy}</td>
                                    <td className="px-6 py-4 text-center">
                                        {/* Status is now just displayed, edit happens in modal */}
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full border-none focus:ring-0 ${
                                            l.callStatus === 'Interested' ? 'bg-green-100 text-green-700' :
                                            l.callStatus === 'No Answer' || l.callStatus === 'Not Interested' ? 'bg-red-100 text-red-700' :
                                            l.callStatus === 'Callback' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {l.callStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-bold text-gray-500">
                                        {l.interviewDate ? new Date(l.interviewDate).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => { setEditingLineup(l); setIsEditModalOpen(true); }}
                                            className="text-indigo-600 hover:text-indigo-800"
                                        >
                                            Edit
                                        </Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={10} className="text-center py-20 text-gray-400 font-medium italic">No submissions found for your current filters.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add New Lineup Modal */}
            <Modal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                title="Add New Lineup"
                maxWidth="max-w-3xl"
            >
                <AddLineupForm
                    onSave={handleSaveNewLineup}
                    onCancel={() => setIsAddModalOpen(false)}
                    initialData={newForm}
                    panelConfig={panelConfig}
                    uniqueVendors={uniqueVendors}
                />
            </Modal>

            {/* New: Edit Lineup Modal */}
            {editingLineup && (
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    title={`Edit Lineup for ${editingLineup.candidateName}`}
                    maxWidth="max-w-3xl"
                >
                    <UpdateLineupStatusForm
                        lineup={editingLineup}
                        panelConfig={panelConfig}
                        onSave={handleUpdateLineup}
                        onCancel={() => setIsEditModalOpen(false)}
                    />
                </Modal>
            )}
        </div>
    );
};

export default DailyLineupsView;
