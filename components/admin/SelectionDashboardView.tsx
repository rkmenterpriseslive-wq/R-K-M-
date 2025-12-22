
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Candidate, CandidateStatus, PanelConfig, UserProfile, CandidateDocument, UserType } from '../../types';
import { updateCandidateStatus, updateCandidate, getPanelConfig, getUsers } from '../../services/firebaseService';
import Button from '../Button';
import Modal from '../Modal';
import Input from '../Input';

interface SelectionDashboardViewProps {
    allUsers: UserProfile[];
    candidates: Candidate[];
    currentUserProfile: UserProfile | null;
}

const SelectionDashboardView: React.FC<SelectionDashboardViewProps> = ({ allUsers, candidates: allCandidates = [], currentUserProfile }) => {
    const [panelConfig, setPanelConfig] = useState<PanelConfig | null>(null);
    const [hrUsers, setHrUsers] = useState<UserProfile[]>([]);
    const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>(null);
    
    // State for action menu and edit modal
    const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
    const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const actionMenuRef = useRef<HTMLDivElement>(null);

    const [filters, setFilters] = useState({
        role: '',
        store: '',
        recruiter: '',
        stage: '',
        date: ''
    });

    useEffect(() => {
        getPanelConfig().then(setPanelConfig);
        getUsers().then(users => {
            setHrUsers(users.filter(u => ['HR', 'ADMIN', 'TEAM', 'TEAMLEAD'].includes(u.userType)));
        });
    }, []);

    const candidates = useMemo(() => {
        const todayStr = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD' in UTC

        // Sort all candidates by date descending (newest first) before filtering
        const sortedCandidates = [...allCandidates].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const visibleCandidates = sortedCandidates.filter(c => {
            if (!c.pipelineStartDate) return true;
            const startDateStr = c.pipelineStartDate.slice(0, 10);
            return startDateStr <= todayStr;
        });

        if (currentUserProfile && [UserType.TEAM, UserType.TEAMLEAD].includes(currentUserProfile.userType)) {
            return visibleCandidates.filter(c => c.recruiter === currentUserProfile.uid);
        }
        return visibleCandidates;
    }, [allCandidates, currentUserProfile]);

    // Effect to close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
                setOpenActionMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const pipelineStages: CandidateStatus[] = ['Sourced', 'On the way', 'Interview', 'Selected'];
    const allStatuses: CandidateStatus[] = ['Sourced', 'Screening', 'On the way', 'Interview', 'Selected', 'Offer Sent', 'Hired', 'Rejected', 'Quit'];

    const handleUpdateStatus = async (candidateId: string, status: CandidateStatus) => {
        try {
            await updateCandidateStatus(candidateId, status);
            setOpenActionMenuId(null);
        } catch (e) {
            alert("Update failed");
        }
    };
    
    const handleMoveCandidate = async (candidateId: string, status: CandidateStatus) => {
        try {
            await handleUpdateStatus(candidateId, status);
            alert(`Candidate moved to ${status}`);
            setOpenActionMenuId(null);
        } catch (e) {
            alert("Failed to move candidate.");
        }
    };

    const handleToggleDetails = (candidateId: string) => {
        setExpandedCandidateId(prevId => prevId === candidateId ? null : candidateId);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, candidateId: string) => {
        e.dataTransfer.setData("candidateId", candidateId);
        e.currentTarget.classList.add('opacity-75', 'rotate-3', 'scale-105', 'shadow-lg');
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('opacity-75', 'rotate-3', 'scale-105', 'shadow-lg');
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.add('bg-blue-100', 'border-blue-400', 'border-dashed', 'border-2');
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('bg-blue-100', 'border-blue-400', 'border-dashed', 'border-2');
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStage: CandidateStatus) => {
        e.preventDefault();
        e.currentTarget.classList.remove('bg-blue-100', 'border-blue-400', 'border-dashed', 'border-2');
        const candidateId = e.dataTransfer.getData("candidateId");
        
        if (candidateId) {
            handleUpdateStatus(candidateId, targetStage);
        }
    };
    
    const handleUpdateCandidate = async (updatedData: Partial<Candidate>) => {
        if (!editingCandidate) return;
        try {
            await updateCandidate(editingCandidate.id, updatedData);
            setIsEditModalOpen(false);
            setEditingCandidate(null);
        } catch (e) {
            alert("Update failed");
        }
    };


    const uniqueRoles = useMemo(() => [...new Set(candidates.map(c => c.role))].sort(), [candidates]);
    const uniqueStores = useMemo(() => [...new Set(candidates.map(c => c.storeName))].sort(), [candidates]);

    const summaryByRecruiter = useMemo(() => {
        const stats: Record<string, { sourced: number; onTheWay: number; interview: number; selected: number }> = {};
        const recruiterNameMap = new Map<string, string>(allUsers.map(u => [u.uid, u.name || u.uid]));
        recruiterNameMap.set('Admin', 'Admin');

        candidates.forEach(candidate => {
            const recruiterUid = candidate.recruiter;
            if (!recruiterUid) return;
            
            const recruiterName = recruiterNameMap.get(recruiterUid) || recruiterUid;


            if (!stats[recruiterName]) {
                stats[recruiterName] = { sourced: 0, onTheWay: 0, interview: 0, selected: 0 };
            }

            if (candidate.status === 'Sourced') stats[recruiterName].sourced++;
            else if (candidate.status === 'On the way') stats[recruiterName].onTheWay++;
            else if (candidate.status === 'Interview') stats[recruiterName].interview++;
            else if (candidate.status === 'Selected') stats[recruiterName].selected++;
        });

        return Object.entries(stats).map(([name, counts]) => ({
            name,
            ...counts,
            total: counts.sourced + counts.onTheWay + counts.interview + counts.selected,
        })).filter(item => item.total > 0)
          .sort((a, b) => b.total - a.total);
    }, [candidates, allUsers]);


    const clearFilters = () => {
        setFilters({ role: '', store: '', recruiter: '', stage: '', date: '' });
    };

    const filteredList = useMemo(() => {
        return candidates.filter(c => {
            const recruiterName = hrUsers.find(u => u.uid === c.recruiter)?.name || c.recruiter;
            const matchesRole = !filters.role || c.role === filters.role;
            const matchesStore = !filters.store || c.storeName === filters.store;
            const matchesRecruiter = !filters.recruiter || recruiterName === filters.recruiter;
            const matchesStage = !filters.stage || c.status === filters.stage;
            const matchesDate = !filters.date || c.date.startsWith(filters.date);
            return matchesRole && matchesStore && matchesRecruiter && matchesStage && matchesDate;
        });
    }, [candidates, filters, hrUsers]);

    const tableStatusColorMap: Record<CandidateStatus, string> = {
        'Sourced': 'bg-slate-100 text-slate-700',
        'On the way': 'bg-yellow-100 text-yellow-800',
        'Interview': 'bg-blue-100 text-blue-800',
        'Selected': 'bg-green-100 text-green-800',
        'Offer Sent': 'bg-teal-100 text-teal-800',
        'Hired': 'bg-emerald-100 text-emerald-800',
        'Rejected': 'bg-red-100 text-red-800',
        'Quit': 'bg-orange-100 text-orange-800',
        'Screening': 'bg-gray-100 text-gray-800',
    };
    
    const PipelineColumn: React.FC<{ stage: CandidateStatus }> = ({ stage }) => {
        const stageCandidates = candidates.filter(c => c.status === stage);
        return (
            <div
                className="flex-1 min-w-[280px] bg-gray-50/70 rounded-xl p-4 border border-gray-200/80 flex flex-col"
                onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, stage)} data-stage={stage}
            >
                <h3 className="text-sm font-bold text-gray-800 mb-4 px-1">{stage} <span className="text-gray-400 font-medium ml-1">({stageCandidates.length})</span></h3>
                <div className="space-y-3 flex-1">
                    {stageCandidates.map(c => (
                        <div key={c.id} className={`p-4 rounded-lg border bg-white shadow-sm transition-all duration-300 ${expandedCandidateId === c.id ? 'shadow-md' : ''}`} draggable="true" onDragStart={(e) => handleDragStart(e, c.id)} onDragEnd={handleDragEnd}>
                            <div className="flex items-start justify-between">
                                <div className="flex items-start flex-1 group">
                                    <div className="mr-3 text-gray-400 pt-1 cursor-move"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 12h16M4 16h16" /></svg></div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-gray-900 leading-tight">{c.name}</h4>
                                        <p className="text-xs text-gray-500 font-medium">{c.storeName || 'Unknown'}</p>
                                    </div>
                                </div>
                                {expandedCandidateId === c.id ? (<button onClick={() => handleToggleDetails(c.id)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold px-3 py-1 rounded">Hide</button>) : (<button onClick={() => handleToggleDetails(c.id)} className="text-xs font-bold text-blue-600 hover:text-blue-800 px-3 py-1">View</button>)}
                            </div>
                            {expandedCandidateId === c.id && (
                                <div className="mt-4 pt-4 border-t border-gray-200/80 space-y-2 text-sm animate-fade-in">
                                    <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-gray-800">
                                        <dt className="font-semibold text-gray-500">Role:</dt><dd className="font-medium">{c.role}</dd>
                                        <dt className="font-semibold text-gray-500">Phone:</dt><dd className="font-medium">{c.phone}</dd>
                                        <dt className="font-semibold text-gray-500">Recruiter:</dt><dd className="font-medium">{hrUsers.find(u => u.uid === c.recruiter)?.name || c.recruiter}</dd>
                                        <dt className="font-semibold text-gray-500">Date:</dt><dd className="font-medium">{new Date(c.date).toLocaleDateString('en-CA')}</dd>
                                    </dl>
                                </div>
                            )}
                        </div>
                    ))}
                    {stageCandidates.length === 0 && (<div className="h-full min-h-[150px] flex items-center justify-center border-2 border-dashed border-gray-200/80 rounded-xl"><p className="text-xs text-gray-400 font-medium italic">Drag candidates here</p></div>)}
                </div>
            </div>
        );
    };

    const selectStyle = "block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-600 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%201024%201024%22%3E%3Cpath%20d%3D%22M256%20384l256%20256%20256-256H256z%22%20fill%3D%22%23999%22%2F%3E%3C%2Fsvg%3E')] bg-[length:14px_14px] bg-[right_10px_center] bg-no-repeat";
    const labelStyle = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1";
    
    const formSelectStyle = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
    
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
            setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        };

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSave({ ...formData, documents });
        };

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
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Interview Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input id="interviewDate" name="interviewDate" label="Interview Date" type="date" value={formData.interviewDate || ''} onChange={handleChange} />
                        <Input id="interviewTime" name="interviewTime" label="Interview Time" type="time" value={formData.interviewTime || ''} onChange={handleChange} />
                        <div className="md:col-span-2">
                            <Input id="interviewPlace" name="interviewPlace" label="Interview Place / Link" value={formData.interviewPlace || ''} onChange={handleChange} />
                        </div>
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


    return (
        <div className="space-y-10 relative">
            <div>
                <p className="text-gray-600 font-medium">Track candidates through the hiring pipeline.</p>
            </div>
            <div className="flex flex-nowrap overflow-x-auto gap-6 pb-4 -mx-6 px-6">
                {pipelineStages.map(stage => <PipelineColumn key={stage} stage={stage} />)}
            </div>

            {/* Candidates List Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">Candidates List</h3>
                    <Button variant="secondary" className="bg-white border border-gray-200 text-gray-600 shadow-sm flex items-center px-4 py-2 text-xs">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download Report
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                    <div>
                        <label className={labelStyle}>Role</label>
                        <select name="role" className={selectStyle} value={filters.role} onChange={e => setFilters({...filters, role: e.target.value})}>
                            <option value="">All Roles</option>
                            {uniqueRoles.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelStyle}>Store</label>
                        <select name="store" className={selectStyle} value={filters.store} onChange={e => setFilters({...filters, store: e.target.value})}>
                            <option value="">All Stores</option>
                            {uniqueStores.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelStyle}>Recruiter</label>
                        <select name="recruiter" className={selectStyle} value={filters.recruiter} onChange={e => setFilters({...filters, recruiter: e.target.value})}>
                            <option value="">All Recruiters</option>
                            {hrUsers.map(u => <option key={u.uid} value={u.name}>{u.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelStyle}>Stage</label>
                        <select name="stage" className={selectStyle} value={filters.stage} onChange={e => setFilters({...filters, stage: e.target.value})}>
                            <option value="">All Stages</option>
                            {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelStyle}>Date</label>
                        <input type="date" name="date" className={selectStyle} value={filters.date} onChange={e => setFilters({...filters, date: e.target.value})} />
                    </div>
                    <Button variant="ghost" onClick={clearFilters} className="h-[38px] text-sm">Clear</Button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-100">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate Name</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Store</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Recruiter</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stage</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Applied Date</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Interview Date</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredList.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{c.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{c.storeName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{c.phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{hrUsers.find(u => u.uid === c.recruiter)?.name || c.recruiter}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tableStatusColorMap[c.status] || 'bg-gray-100 text-gray-800'}`}>{c.status}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(c.date).toLocaleDateString('en-CA')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                        {c.interviewDate ? new Date(c.interviewDate + 'T00:00:00').toLocaleDateString('en-CA') : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-center relative">
                                        <div ref={openActionMenuId === c.id ? actionMenuRef : null}>
                                            <button
                                                onClick={() => setOpenActionMenuId(openActionMenuId === c.id ? null : c.id)}
                                                className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                            </button>
                                            {openActionMenuId === c.id && (
                                                <div className="absolute right-12 top-full mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-100 origin-top-right text-left">
                                                    <div className="py-1">
                                                        <button
                                                            onClick={() => { setEditingCandidate(c); setIsEditModalOpen(true); setOpenActionMenuId(null); }}
                                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        >
                                                            Edit
                                                        </button>
                                                        <div className="border-t border-gray-100 my-1"></div>
                                                        {pipelineStages.filter(stage => stage !== c.status).map(stage => (
                                                            <button
                                                                key={stage}
                                                                onClick={() => handleMoveCandidate(c.id, stage)}
                                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                            >
                                                                Move to {stage}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Candidate Summary by Team Member */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                <h3 className="text-xl font-bold text-gray-800">Candidate Summary by Team Member</h3>
                <div className="overflow-x-auto rounded-lg border border-gray-100">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Team Member</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sourced</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">On the way</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Interview</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Selected</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {summaryByRecruiter.map(recruiter => (
                                <tr key={recruiter.name} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{recruiter.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{recruiter.sourced}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{recruiter.onTheWay}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{recruiter.interview}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${recruiter.selected > 0 ? 'text-green-600 font-bold' : 'text-gray-600'}`}>{recruiter.selected}</td>
                                    {/* FIX: The `total` property is a number, not a function. Removed parentheses. */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{recruiter.total}</td>
                                </tr>
                            ))}
                            {summaryByRecruiter.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-gray-500 italic">No summary data available.</td>
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
        </div>
    );
};

export default SelectionDashboardView;
