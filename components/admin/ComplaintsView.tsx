
import React, { useState, useEffect, useMemo } from 'react';
import { Complaint, Ticket, UserType, Candidate, UserProfile } from '../../types';
import { onComplaintsChange, addComplaint, updateComplaint, onTicketsChange, updateTicket, runEscalationPulse } from '../../services/firebaseService';
import Button from '../Button';
import Input from '../Input';
import Modal from '../Modal';

interface ComplaintsViewProps {
    candidates: Candidate[];
    currentUserProfile: UserProfile | null;
}

const ComplaintsView: React.FC<ComplaintsViewProps> = ({ candidates = [], currentUserProfile }) => {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [activeView, setActiveView] = useState<'grievances' | 'tickets'>('grievances');
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        candidate: '',
        vendor: '',
        role: '',
        issue: 'Salary Discrepancy',
        description: '',
        assignedManager: 'Operations Team',
    });

    const [resolutionData, setResolutionData] = useState({
        resolution: '',
    });

    useEffect(() => {
        const unsubComplaints = onComplaintsChange((data) => {
            setComplaints(data);
            if (activeView === 'grievances') setIsLoading(false);
        });
        
        const unsubTickets = onTicketsChange((data) => {
            setTickets(data);
            // Run escalation check whenever tickets data changes
            runEscalationPulse(data);
            if (activeView === 'tickets') setIsLoading(false);
        });

        return () => {
            unsubComplaints();
            unsubTickets();
        };
    }, [activeView]);

    const handleAddNew = async (e: React.FormEvent) => {
        e.preventDefault();
        const ticketNo = `TKT-${Date.now().toString().slice(-6)}`;
        const newComplaint = {
            ...formData,
            ticketNo,
            date: new Date().toISOString(),
            status: 'Active' as const,
        };

        try {
            await addComplaint(newComplaint);
            alert('Complaint registered successfully!');
            setIsModalOpen(false);
            setFormData({
                candidate: '',
                vendor: '',
                role: '',
                issue: 'Salary Discrepancy',
                description: '',
                assignedManager: 'Operations Team',
            });
        } catch (error) {
            alert('Failed to register complaint.');
        }
    };

    const handleResolveComplaint = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedComplaint) return;
        
        try {
            await updateComplaint(selectedComplaint.id, { 
                status: 'Closed',
                resolution: resolutionData.resolution,
                resolvedDate: new Date().toISOString()
            });
            alert('Complaint marked as resolved.');
            setSelectedComplaint(null);
            setResolutionData({ resolution: '' });
        } catch (error) {
            alert('Failed to update status.');
        }
    };

    const handleResolveTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTicket) return;

        try {
            await updateTicket(selectedTicket.id, {
                status: 'Resolved',
                hrRemarks: resolutionData.resolution,
                resolvedDate: new Date().toISOString()
            });
            alert('Ticket marked as resolved.');
            setSelectedTicket(null);
            setResolutionData({ resolution: '' });
        } catch (error) {
            alert('Failed to update ticket status.');
        }
    };
    
    const myCandidateNames = useMemo(() => {
        if (currentUserProfile && [UserType.TEAM, UserType.TEAMLEAD].includes(currentUserProfile.userType)) {
            return new Set(candidates.filter(c => c.recruiter === currentUserProfile.uid).map(c => c.name));
        }
        return null; // null means don't filter
    }, [candidates, currentUserProfile]);

    const filteredComplaints = useMemo(() => {
        let baseComplaints = complaints;
        if (myCandidateNames) {
            baseComplaints = complaints.filter(c => myCandidateNames.has(c.candidate));
        }
        return baseComplaints.filter(c =>
            c.candidate.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.ticketNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.issue.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [complaints, searchTerm, myCandidateNames]);

    const filteredTickets = useMemo(() => {
        return tickets.filter(t =>
            t.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [tickets, searchTerm]);

    const stats = useMemo(() => ({
        totalComplaints: filteredComplaints.length,
        activeComplaints: filteredComplaints.filter(c => c.status === 'Active').length,
        totalTickets: tickets.length,
        activeTickets: tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length,
        escalatedTickets: tickets.filter(t => t.escalationLevel > 0 && t.status !== 'Resolved').length,
    }), [filteredComplaints, tickets]);

    const getStatusClasses = (status: string) => {
        if (['Resolved', 'Closed'].includes(status)) return 'bg-green-100 text-green-700';
        if (['Active', 'Open'].includes(status)) return 'bg-red-100 text-red-700 animate-pulse';
        return 'bg-yellow-100 text-yellow-700';
    };

    const getSlaInfo = (ticket: Ticket) => {
        if (ticket.status === 'Resolved') return null;
        const now = new Date();
        const deadline = new Date(ticket.slaDeadline);
        const diff = deadline.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 3600 * 24));
        
        if (diff < 0) return { label: 'SLA BREACHED', color: 'text-red-600 font-black animate-bounce' };
        if (days <= 1) return { label: 'Urgent: Due Soon', color: 'text-orange-600 font-bold' };
        return { label: `Due in ${days} days`, color: 'text-gray-400' };
    };

    const issueCategories = [
        'Salary Discrepancy',
        'Attendance Issue',
        'App/Technical Issue',
        'Manager Behavior',
        'Work Environment',
        'Documentation Pending',
        'Other'
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Support & Grievances</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage grievances and employee help center tickets.</p>
                </div>
                {activeView === 'grievances' && (
                    <Button variant="primary" onClick={() => setIsModalOpen(true)} className="shadow-lg px-6">
                        + Register Grievance
                    </Button>
                )}
            </div>

            <div className="flex gap-4 p-1 bg-gray-200 w-fit rounded-lg">
                <button 
                    onClick={() => setActiveView('grievances')}
                    className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeView === 'grievances' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    Grievances ({stats.activeComplaints})
                </button>
                <button 
                    onClick={() => setActiveView('tickets')}
                    className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeView === 'tickets' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    Help Center Tickets ({stats.activeTickets})
                    {stats.escalatedTickets > 0 && <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{stats.escalatedTickets} ESCALATED</span>}
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <Input
                    id="complaintSearch"
                    placeholder={`Search ${activeView === 'grievances' ? 'grievances' : 'tickets'}...`}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    wrapperClassName="mb-0"
                />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">{activeView === 'grievances' ? 'Ticket / Candidate' : 'ID / Submitter'}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">{activeView === 'grievances' ? 'Issue Category' : 'Escalation / Handler'}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">{activeView === 'grievances' ? 'Vendor / Client' : 'Subject'}</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr><td colSpan={5} className="text-center py-20 text-gray-400 italic">Loading records...</td></tr>
                            ) : activeView === 'grievances' ? (
                                filteredComplaints.length > 0 ? filteredComplaints.map(complaint => (
                                    <tr key={complaint.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-900">{complaint.ticketNo}</div>
                                            <div className="text-xs text-blue-600 font-semibold">{complaint.candidate}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{complaint.issue}</div>
                                            <div className="text-[10px] text-gray-400 uppercase font-bold">{new Date(complaint.date).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.vendor}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${getStatusClasses(complaint.status)}`}>
                                                {complaint.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedComplaint(complaint)}>
                                                {complaint.status === 'Active' ? 'Resolve' : 'View'}
                                            </Button>
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan={5} className="text-center py-20 text-gray-500">No grievances found.</td></tr>
                            ) : (
                                filteredTickets.length > 0 ? filteredTickets.map(ticket => {
                                    const sla = getSlaInfo(ticket);
                                    return (
                                    <tr key={ticket.id} className={`hover:bg-gray-50 transition-colors ${ticket.escalationLevel > 0 ? 'bg-red-50/30' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-900">{ticket.id.slice(-6)}</div>
                                            <div className="text-xs text-indigo-600 font-semibold">{ticket.submittedBy}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {ticket.escalationLevel > 0 ? (
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded w-fit mb-1">LVL {ticket.escalationLevel} ESCALATED</span>
                                                    <span className="text-xs font-bold text-gray-900">Current: {ticket.assignedToName}</span>
                                                </div>
                                            ) : (
                                                <div className="text-xs text-gray-500 font-medium">Handler: {ticket.assignedToName}</div>
                                            )}
                                            {sla && <div className={`text-[10px] mt-1 ${sla.color}`}>{sla.label}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 font-medium truncate max-w-xs">{ticket.subject}</div>
                                            <div className="text-[10px] text-gray-400 uppercase font-bold">{new Date(ticket.submittedDate).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${getStatusClasses(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(ticket)}>
                                                {ticket.status !== 'Resolved' ? 'Resolve' : 'View'}
                                            </Button>
                                        </td>
                                    </tr>
                                )}) : <tr><td colSpan={5} className="text-center py-20 text-gray-500">No help center tickets found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Grievance Registration Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Grievance">
                <form onSubmit={handleAddNew} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input id="cand" label="Candidate Name" value={formData.candidate} onChange={e => setFormData({ ...formData, candidate: e.target.value })} required />
                        <Input id="vend" label="Vendor / Client" value={formData.vendor} onChange={e => setFormData({ ...formData, vendor: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input id="role_c" label="Role / Designation" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} required />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Category</label>
                            <select
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={formData.issue}
                                onChange={e => setFormData({ ...formData, issue: e.target.value })}
                            >
                                {issueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
                        <textarea
                            rows={4}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="primary">Submit Ticket</Button>
                    </div>
                </form>
            </Modal>

            {/* Grievance Resolution/Details Modal */}
            {selectedComplaint && (
                <Modal 
                    isOpen={!!selectedComplaint} 
                    onClose={() => setSelectedComplaint(null)} 
                    title={`Complaint ${selectedComplaint.ticketNo}`}
                    maxWidth="max-w-2xl"
                >
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><p className="text-gray-500">Candidate:</p><p className="font-bold">{selectedComplaint.candidate}</p></div>
                            <div><p className="text-gray-500">Vendor:</p><p className="font-bold">{selectedComplaint.vendor}</p></div>
                            <div><p className="text-gray-500">Issue:</p><p className="font-bold text-red-600">{selectedComplaint.issue}</p></div>
                            <div><p className="text-gray-500">Date:</p><p className="font-bold">{new Date(selectedComplaint.date).toLocaleString()}</p></div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Original Grievance:</p>
                            <p className="text-sm italic">"{selectedComplaint.description}"</p>
                        </div>

                        {selectedComplaint.status === 'Active' ? (
                            <form onSubmit={handleResolveComplaint} className="space-y-4 pt-4 border-t">
                                <h4 className="font-bold text-gray-800">Submit Resolution</h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Actions Taken</label>
                                    <textarea
                                        rows={3}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                        value={resolutionData.resolution}
                                        onChange={e => setResolutionData({ resolution: e.target.value })}
                                        placeholder="Describe how this issue was resolved..."
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button type="button" variant="secondary" onClick={() => setSelectedComplaint(null)}>Cancel</Button>
                                    <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">Mark Resolved</Button>
                                </div>
                            </form>
                        ) : (
                            <div className="pt-4 border-t">
                                <h4 className="font-bold text-green-700 flex items-center mb-3">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                                    Resolved Issue
                                </h4>
                                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                    <p className="text-sm font-medium text-green-800">{selectedComplaint.resolution}</p>
                                </div>
                                <div className="flex justify-end mt-6">
                                    <Button variant="secondary" onClick={() => setSelectedComplaint(null)}>Close</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {/* Help Ticket Resolution/Details Modal */}
            {selectedTicket && (
                <Modal 
                    isOpen={!!selectedTicket} 
                    onClose={() => setSelectedTicket(null)} 
                    title={`Help Center Ticket ${selectedTicket.id.slice(-6)}`}
                    maxWidth="max-w-2xl"
                >
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><p className="text-gray-500">Submitted By:</p><p className="font-bold">{selectedTicket.submittedBy}</p></div>
                            <div><p className="text-gray-500">Category:</p><p className="font-bold text-indigo-600">{selectedTicket.category}</p></div>
                            <div className="col-span-2"><p className="text-gray-500">Subject:</p><p className="font-bold">{selectedTicket.subject}</p></div>
                            <div><p className="text-gray-500">Date:</p><p className="font-bold">{new Date(selectedTicket.submittedDate).toLocaleString()}</p></div>
                            <div className="col-span-2"><p className="text-gray-500">Handler Chain:</p><p className="font-bold text-red-600">{selectedTicket.escalationLevel > 0 ? `Level ${selectedTicket.escalationLevel} Escalation` : 'Standard HR Queue'} - Currently with {selectedTicket.assignedToName}</p></div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Description:</p>
                            <p className="text-sm italic">"{selectedTicket.description}"</p>
                        </div>

                        {selectedTicket.status !== 'Resolved' ? (
                            <form onSubmit={handleResolveTicket} className="space-y-4 pt-4 border-t">
                                <h4 className="font-bold text-gray-800">Submit Resolution</h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">HR Remarks / Response</label>
                                    <textarea
                                        rows={3}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={resolutionData.resolution}
                                        onChange={e => setResolutionData({ resolution: e.target.value })}
                                        placeholder="Enter response for the employee..."
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button type="button" variant="secondary" onClick={() => setSelectedTicket(null)}>Cancel</Button>
                                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Send Response & Resolve</Button>
                                </div>
                            </form>
                        ) : (
                            <div className="pt-4 border-t">
                                <h4 className="font-bold text-green-700 flex items-center mb-3">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                                    Resolved
                                </h4>
                                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                    <p className="text-xs font-bold text-green-600 uppercase mb-1">Response provided:</p>
                                    <p className="text-sm font-medium text-green-800">{selectedTicket.hrRemarks}</p>
                                </div>
                                <div className="flex justify-end mt-6">
                                    <Button variant="secondary" onClick={() => setSelectedTicket(null)}>Close</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ComplaintsView;