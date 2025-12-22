
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Candidate, CandidateStatus, PanelConfig, UserProfile, CandidateDocument, Store, UserType } from '../../types';
import { onCandidatesChange, getPanelConfig, getUsers, updateCandidate, updateCandidateStatus } from '../../services/firebaseService';
import Button from '../Button';
import Input from '../Input';
import Modal from '../Modal';

interface AllCandidatesViewProps {
    candidates: Candidate[];
    currentUserProfile: UserProfile | null;
}

const AllCandidatesView: React.FC<AllCandidatesViewProps> = ({ candidates: allCandidates = [], currentUserProfile }) => {
    const [panelConfig, setPanelConfig] = useState<PanelConfig | null>(null);
    const [hrUsers, setHrUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
    const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [transferringCandidate, setTransferringCandidate] = useState<Candidate | null>(null);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const actionMenuRef = useRef<HTMLDivElement>(null);

    const pipelineStages: CandidateStatus[] = ['Sourced', 'On the way', 'Interview', 'Selected'];
    const allStatuses: CandidateStatus[] = ['Sourced', 'Screening', 'On the way', 'Interview', 'Selected', 'Offer Sent', 'Hired', 'Rejected', 'Quit'];

    // Filter State - Matching screenshot fields
    const [filters, setFilters] = useState({
        search: '',
        role: '',
        vendor: '',
        location: '',
        status: '',
        recruiter: '',
        appliedDate: '',
        quitDate: ''
    });

    useEffect(() => {
        setIsLoading(true);
        getPanelConfig().then(setPanelConfig);
        getUsers().then(users => {
            setHrUsers(users.filter(u => ['HR', 'ADMIN', 'TEAM', 'TEAMLEAD'].includes(u.userType)));
        });
        setIsLoading(false);
    }, []);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
                setOpenActionMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const candidates = useMemo(() => {
        if (currentUserProfile && [UserType.TEAM, UserType.TEAMLEAD].includes(currentUserProfile.userType)) {
            return allCandidates.filter(c => c.recruiter === currentUserProfile.uid);
        }
        return allCandidates;
    }, [allCandidates, currentUserProfile]);

    const handleUpdateCandidate = async (updatedData: Partial<Candidate>) => {
        if (!editingCandidate) return;
        try {
            await updateCandidate(editingCandidate.id, updatedData);
            setIsEditModalOpen(false);
            setEditingCandidate(null);
            alert("Candidate updated successfully!");
        } catch (e) {
            console.error("Update failed:", e);
            alert("Failed to update candidate.");
        }
    };

    const handleTransferCandidate = async (data: { vendor: string; storeName: string }) => {
        if (!transferringCandidate) return;
        try {
            await updateCandidate(transferringCandidate.id, data);
            setIsTransferModalOpen(false);
            setTransferringCandidate(null);
            alert("Candidate transferred successfully!");
        } catch (e) {
            console.error("Transfer failed:", e);
            alert("Failed to transfer candidate.");
        }
    };

    const handleMoveCandidate = async (candidateId: string, status: CandidateStatus) => {
        try {
            await updateCandidateStatus(candidateId, status);
            alert(`Candidate moved to ${status}`);
            setOpenActionMenuId(null);
        } catch (e) {
            alert("Failed to move candidate.");
        }
    };

    const clearAll = () => {
        setFilters({
            search: '',
            role: '',
            vendor: '',
            location: '',
            status: '',
            recruiter: '',
            appliedDate: '',
            quitDate: ''
        });
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredCandidates = useMemo(() => {
        // Sort candidates by application date, newest first
        const sortedCandidates = [...candidates].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return sortedCandidates.filter(c => {
            const recruiterName = hrUsers.find(u => u.uid === c.recruiter)?.name || c.recruiter;
            const matchesSearch = !filters.search || 
                c.name.toLowerCase().includes(filters.search.toLowerCase()) || 
                (c.email || '').toLowerCase().includes(filters.search.toLowerCase());
            const matchesRole = !filters.role || c.role === filters.role;
            const matchesVendor = !filters.vendor || c.vendor === filters.vendor;
            const matchesLocation = !filters.location || c.storeName === filters.location; // Mapping store to location filter
            const matchesStatus = !filters.status || c.status === filters.status;
            const matchesRecruiter = !filters.recruiter || recruiterName === filters.recruiter;
            const matchesApplied = !filters.appliedDate || c.date.startsWith(filters.appliedDate);
            const matchesQuit = !filters.quitDate || (c.quitDate && c.quitDate.startsWith(filters.quitDate));
            
            return matchesSearch && matchesRole && matchesVendor && matchesLocation && 
                   matchesStatus && matchesRecruiter && matchesApplied && matchesQuit;
        });
    }, [candidates, filters, hrUsers]);

    // Color mapping for candidate status
    const statusColorMap: Record<CandidateStatus, string> = {
        'Sourced': 'bg-slate-100 text-slate-700',
        'On the way': 'bg-purple-100 text-purple-700',
        'Interview': 'bg-indigo-100 text-indigo-700',
        'Selected': 'bg-green-100 text-green-700',
        'Offer Sent': 'bg-teal-100 text-teal-700',
        'Hired': 'bg-emerald-100 text-emerald-800',
        'Rejected': 'bg-red-100 text-red-700',
        'Quit': 'bg-orange-100 text-orange-800',
        'Screening': 'bg-gray-100 text-gray-700',
    };

    // Unique values for dropdowns
    const uniqueVendors = useMemo(() => [...new Set(candidates.map(c => c.vendor).filter(Boolean)), 'Direct'].sort(), [candidates]);
    const uniqueLocations = useMemo(() => [...new Set(candidates.map(c => c.storeName).filter(Boolean))].sort(), [candidates]);
    const uniqueRecruiters = useMemo(() => [...new Set(candidates.map(c => hrUsers.find(u => u.uid === c.recruiter)?.name || c.recruiter).filter(Boolean))].sort(), [candidates, hrUsers]);

    const labelStyle = "block text-[11px] font-bold text-gray-500 uppercase tracking-tight mb-2";
    const selectStyle = "block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-600 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%201024%201024%22%3E%3Cpath%20d%3D%22M256%20384l256%20256%20256-256H256z%22%20fill%3D%22%23999%22%2F%3E%3C%2Fsvg%3E')] bg-[length:14px_14px] bg-[right_12px_center] bg-no-repeat";

    const EditCandidateForm: React.FC<{
        candidate: Candidate;
        onSave: (data: Partial<Candidate>) => void;
        onCancel: () => void;
    }> = ({ candidate, onSave, onCancel }) => {
        const [formData, setFormData] = useState<Partial<Candidate> & { activeStatus?: string }>(candidate);
        const [documents, setDocuments] = useState<CandidateDocument[]>([]);
        const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

        const defaultDocs: CandidateDocument[] = [
            { name: 'Resume / CV', status: 'Not Uploaded', fileName: null },
            { name: 'Aadhar Card', status: 'Not Uploaded', fileName: null },
            { name: 'PAN Card', status: 'Not Uploaded', fileName: null },
        ];
        
        useEffect(() => {
            setFormData(candidate);
            setDocuments(candidate.documents && candidate.documents.length > 0 ? candidate.documents : defaultDocs);
        }, [candidate]);
    
        const handleFileChange = (docName: string, e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                setDocuments(docs => docs.map(d => 
                    d.name === docName ? { ...d, status: 'Uploaded', fileName: file.name } : d
                ));
            }
        };

        const triggerFileInput = (docName: string) => {
            fileInputRefs.current[docName]?.click();
        };

        const getStatusClasses = (status: CandidateDocument['status']) => {
            switch(status) {
              case 'Verified': return 'bg-green-100 text-green-800';
              case 'Uploaded': return 'bg-blue-100 text-blue-800';
              default: return 'bg-gray-100 text-gray-800';
            }
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        };
    
        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSave({ ...formData, documents });
        };
        
        const formSelectStyle = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
    
        return (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input id="name" name="name" label="Name" value={formData.name || ''} onChange={handleChange} required />
                    <Input id="phone" name="phone" label="Contact" value={formData.phone || ''} onChange={handleChange} required />
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Role</label><select name="role" value={formData.role} onChange={handleChange} className={formSelectStyle}>{panelConfig?.jobRoles.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Store</label><select name="storeName" value={formData.storeName || ''} onChange={handleChange} className={formSelectStyle}><option value="">Unknown</option>{panelConfig?.stores.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}</select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Recruiter</label><select name="recruiter" value={formData.recruiter} onChange={handleChange} className={formSelectStyle}>{hrUsers.map(u => <option key={u.uid} value={u.name}>{u.name}</option>)}</select></div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select name="activeStatus" value={formData.activeStatus || 'Active'} onChange={handleChange} className={formSelectStyle}>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                        <select name="status" value={formData.status} onChange={handleChange} className={formSelectStyle}>
                            {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                <div className="pt-6 border-t mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
                    <div className="space-y-3">
                        {documents.map(doc => (
                            <div key={doc.name} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                <div className="flex-1 mb-2 sm:mb-0">
                                    <p className="font-semibold text-gray-800">{doc.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{doc.fileName || 'No file uploaded'}</p>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusClasses(doc.status)}`}>
                                        {doc.status}
                                    </span>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        ref={el => fileInputRefs.current[doc.name] = el}
                                        onChange={(e) => handleFileChange(doc.name, e)}
                                    />
                                    <Button type="button" variant="secondary" size="sm" onClick={() => triggerFileInput(doc.name)}>
                                        Upload
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                    <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" variant="primary">Save Changes</Button>
                </div>
            </form>
        );
    };

    const TransferCandidateForm: React.FC<{
        candidate: Candidate;
        onSave: (data: { vendor: string; storeName: string }) => void;
        onCancel: () => void;
        allVendors: string[];
        allStores: Store[];
    }> = ({ candidate, onSave, onCancel, allVendors, allStores }) => {
        const [newVendor, setNewVendor] = useState(candidate.vendor || '');
        const [newStoreName, setNewStoreName] = useState(candidate.storeName || '');

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSave({ vendor: newVendor, storeName: newStoreName });
        };

        const formSelectStyle = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-gray-600">Reassign <strong>{candidate.name}</strong> to a different vendor or store.</p>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Vendor</label>
                    <select value={newVendor} onChange={(e) => setNewVendor(e.target.value)} className={formSelectStyle}>
                        <option value="">Select New Vendor</option>
                        {allVendors.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Store</label>
                    <select value={newStoreName} onChange={(e) => setNewStoreName(e.target.value)} className={formSelectStyle}>
                        <option value="">Select New Store</option>
                        {allStores.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                    <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" variant="primary">Transfer Candidate</Button>
                </div>
            </form>
        );
    };


    return (
        <div className="space-y-10 pb-20 animate-fade-in">
            {/* Header */}
            <div>
                <h2 className="text-4xl font-black text-[#1e293b] tracking-tight">All Candidates</h2>
            </div>

            {/* Comprehensive Filter Panel */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {/* Row 1 */}
                    <div>
                        <label className={labelStyle}>Search Name/Email</label>
                        <Input 
                            id="search"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="e.g. Rahul Sharma"
                            wrapperClassName="mb-0"
                            className="py-2.5 rounded-xl border-gray-200"
                        />
                    </div>
                    <div>
                        <label className={labelStyle}>Role</label>
                        <select name="role" value={filters.role} onChange={handleFilterChange} className={selectStyle}>
                            <option value="">All</option>
                            {panelConfig?.jobRoles.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>

                    {/* Row 2 */}
                    <div>
                        <label className={labelStyle}>Vendor</label>
                        <select name="vendor" value={filters.vendor} onChange={handleFilterChange} className={selectStyle}>
                            <option value="">All</option>
                            {uniqueVendors.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelStyle}>Store / Location</label>
                        <select name="location" value={filters.location} onChange={handleFilterChange} className={selectStyle}>
                            <option value="">All</option>
                            {uniqueLocations.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>

                    {/* Row 3 */}
                    <div className="md:col-span-1">
                        <label className={labelStyle}>Status</label>
                        <select name="status" value={filters.status} onChange={handleFilterChange} className={selectStyle}>
                            <option value="">All</option>
                            {allStatuses.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    <div className="hidden md:block"></div> {/* Spacing spacer */}

                    {/* Row 4 */}
                    <div>
                        <label className={labelStyle}>Recruiter</label>
                        <select name="recruiter" value={filters.recruiter} onChange={handleFilterChange} className={selectStyle}>
                            <option value="">All</option>
                            {uniqueRecruiters.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelStyle}>Applied Date</label>
                        <input 
                            type="date" 
                            name="appliedDate"
                            value={filters.appliedDate}
                            onChange={handleFilterChange}
                            className={selectStyle}
                        />
                    </div>

                    {/* Row 5 */}
                    <div>
                        <label className={labelStyle}>Quit Date</label>
                        <input 
                            type="date" 
                            name="quitDate"
                            value={filters.quitDate}
                            onChange={handleFilterChange}
                            className={selectStyle}
                        />
                    </div>
                </div>

                {/* Buttons Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <button 
                        onClick={clearAll}
                        className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black rounded-xl transition-all uppercase tracking-wide text-sm"
                    >
                        Clear All
                    </button>
                    <button 
                        onClick={() => alert("Exporting " + filteredCandidates.length + " candidates...")}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-200 uppercase tracking-wide text-sm"
                    >
                        Export
                    </button>
                </div>
            </div>

            {/* Candidates Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-[#f8fafc]">
                            <tr>
                                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Candidate Name</th>
                                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Vendor</th>
                                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Store / Location</th>
                                <th className="px-6 py-5 text-center text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Recruiter</th>
                                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Applied Date</th>
                                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Quit Date</th>
                                <th className="px-6 py-5 text-center text-[11px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {isLoading ? (
                                <tr><td colSpan={9} className="text-center py-20 text-gray-400 italic">Loading candidates database...</td></tr>
                            ) : filteredCandidates.length > 0 ? filteredCandidates.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#1e293b]">
                                        <div className="flex flex-col">
                                            <span>{c.name}</span>
                                            <span className="text-[10px] text-gray-400 font-normal">{c.email || 'No Email'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600 font-medium">{c.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-blue-600 font-black uppercase tracking-tighter">{c.vendor}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{c.storeName}</td>
                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg ${statusColorMap[c.status]}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-700">{hrUsers.find(u => u.uid === c.recruiter)?.name || c.recruiter}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-medium">
                                        {new Date(c.date).toLocaleDateString('en-GB')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-red-400 font-medium">
                                        {c.quitDate ? new Date(c.quitDate).toLocaleDateString('en-GB') : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-center relative">
                                        <div ref={openActionMenuId === c.id ? actionMenuRef : null}>
                                            <button
                                                onClick={() => setOpenActionMenuId(openActionMenuId === c.id ? null : c.id)}
                                                className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                            </button>
                                            {openActionMenuId === c.id && (
                                                <div className="absolute right-12 top-full mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-100 origin-top-right">
                                                    <div className="py-1">
                                                        <button
                                                            onClick={() => {
                                                                setEditingCandidate(c);
                                                                setIsEditModalOpen(true);
                                                                setOpenActionMenuId(null);
                                                            }}
                                                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        >
                                                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setTransferringCandidate(c);
                                                                setIsTransferModalOpen(true);
                                                                setOpenActionMenuId(null);
                                                            }}
                                                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        >
                                                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                                            Transfer
                                                        </button>
                                                        <div className="border-t border-gray-100 my-1"></div>
                                                        {pipelineStages
                                                            .filter(stage => stage !== c.status)
                                                            .map(stage => (
                                                                <button
                                                                    key={stage}
                                                                    onClick={() => handleMoveCandidate(c.id, stage)}
                                                                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                >
                                                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                    Move to {stage}
                                                                </button>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={9} className="text-center py-24">
                                        <div className="flex flex-col items-center">
                                            <svg className="w-12 h-12 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            <p className="text-gray-400 font-bold tracking-tight">No candidates found matching your current filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {editingCandidate && (
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    title={`Edit Details for ${editingCandidate.name}`}
                    maxWidth="max-w-3xl"
                >
                    <EditCandidateForm
                        candidate={editingCandidate}
                        onSave={handleUpdateCandidate}
                        onCancel={() => setIsEditModalOpen(false)}
                    />
                </Modal>
            )}

            {transferringCandidate && (
                <Modal
                    isOpen={isTransferModalOpen}
                    onClose={() => setIsTransferModalOpen(false)}
                    title={`Transfer ${transferringCandidate.name}`}
                    maxWidth="max-w-lg"
                >
                    <TransferCandidateForm
                        candidate={transferringCandidate}
                        onSave={handleTransferCandidate}
                        onCancel={() => setIsTransferModalOpen(false)}
                        allVendors={uniqueVendors}
                        allStores={panelConfig?.stores || []}
                    />
                </Modal>
            )}
        </div>
    );
};

export default AllCandidatesView;