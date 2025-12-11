import React, { useState, useMemo } from 'react';
import { Ticket, UserType } from '../../types';
import Button from '../Button';
import Modal from '../Modal';
import Input from '../Input';

// Mock data, in a real app this would come from an API
const MOCK_TICKETS: Ticket[] = [
    // Empty for now, user can create them.
];

const HelpCenterView: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

    const [newTicketData, setNewTicketData] = useState({
        category: 'General Inquiry' as Ticket['category'],
        subject: '',
        description: '',
    });

    const handleOpenNewTicketModal = () => {
        setNewTicketData({
            category: 'General Inquiry',
            subject: '',
            description: '',
        });
        setIsModalOpen(true);
    };
    
    const handleViewTicket = (ticket: Ticket) => {
        setSelectedTicket(ticket);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTicket(null);
    };

    const handleNewTicketChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewTicketData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitTicket = (e: React.FormEvent) => {
        e.preventDefault();
        // FIX: Add missing 'submittedBy' and 'userType' properties to satisfy the 'Ticket' interface.
        const newTicket: Ticket = {
            id: `TKT-${Date.now()}`,
            submittedBy: "Current User", // Mocked user name as it's not available in props.
            userType: UserType.CANDIDATE,
            submittedDate: new Date().toISOString(),
            status: 'Open',
            ...newTicketData,
        };
        setTickets(prev => [newTicket, ...prev]);
        handleCloseModal();
        alert('Your ticket has been submitted successfully.');
    };

    const getStatusClasses = (status: Ticket['status']) => {
        switch (status) {
            case 'Resolved': return 'bg-green-100 text-green-800';
            case 'Open': return 'bg-blue-100 text-blue-800';
            case 'In Progress': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    const summaryStats = useMemo(() => {
        const open = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
        const resolved = tickets.filter(t => t.status === 'Resolved').length;
        return { open, resolved, total: tickets.length };
    }, [tickets]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-3xl font-bold text-gray-800">Help Center</h2>
                <Button variant="primary" onClick={handleOpenNewTicketModal}>
                    + Create New Ticket
                </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"><h4 className="text-sm font-semibold text-gray-500">Total Tickets</h4><p className="text-3xl font-bold text-gray-900">{summaryStats.total}</p></div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"><h4 className="text-sm font-semibold text-gray-500">Open</h4><p className="text-3xl font-bold text-blue-600">{summaryStats.open}</p></div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"><h4 className="text-sm font-semibold text-gray-500">Resolved</h4><p className="text-3xl font-bold text-green-600">{summaryStats.resolved}</p></div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {tickets.length > 0 ? tickets.map(ticket => (
                                <tr key={ticket.id}>
                                    <td className="px-6 py-4 text-sm font-medium text-blue-600">{ticket.id}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{ticket.subject}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{ticket.category}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(ticket.submittedDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusClasses(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleViewTicket(ticket)}>View</Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={6} className="text-center py-10 text-gray-500">You have not raised any tickets yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Create New Ticket">
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select id="category" name="category" value={newTicketData.category} onChange={handleNewTicketChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required>
                            <option>General Inquiry</option>
                            <option>Payroll</option>
                            <option>Attendance</option>
                            <option>Documents</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <Input id="subject" name="subject" label="Subject" value={newTicketData.subject} onChange={handleNewTicketChange} required />
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea id="description" name="description" rows={5} value={newTicketData.description} onChange={handleNewTicketChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button type="submit" variant="primary">Submit Ticket</Button>
                    </div>
                </form>
            </Modal>

            {selectedTicket && (
                <Modal isOpen={!!selectedTicket} onClose={handleCloseModal} title={`Details for Ticket ${selectedTicket.id}`}>
                    <div className="space-y-4 text-sm">
                        <div className="grid grid-cols-3 gap-2"><strong className="text-gray-600">Subject:</strong><span className="col-span-2">{selectedTicket.subject}</span></div>
                        <div className="grid grid-cols-3 gap-2"><strong className="text-gray-600">Category:</strong><span className="col-span-2">{selectedTicket.category}</span></div>
                        <div className="grid grid-cols-3 gap-2"><strong className="text-gray-600">Submitted:</strong><span className="col-span-2">{new Date(selectedTicket.submittedDate).toLocaleString()}</span></div>
                        <div className="grid grid-cols-3 gap-2 items-center"><strong className="text-gray-600">Status:</strong><span className={`px-2 py-0.5 text-xs font-semibold rounded-full w-fit ${getStatusClasses(selectedTicket.status)}`}>{selectedTicket.status}</span></div>
                        <div>
                            <strong className="text-gray-600">Description:</strong>
                            <p className="mt-1 p-3 bg-gray-50 rounded-md border">{selectedTicket.description}</p>
                        </div>
                        {selectedTicket.hrRemarks && (
                            <div>
                                <strong className="text-gray-600">HR Remarks:</strong>
                                <p className="mt-1 p-3 bg-blue-50 text-blue-800 rounded-md border border-blue-200">{selectedTicket.hrRemarks}</p>
                            </div>
                        )}
                        <div className="flex justify-end pt-4 border-t">
                             <Button variant="primary" onClick={handleCloseModal}>Close</Button>
                        </div>
                    </div>
                </Modal>
            )}

        </div>
    );
};

export default HelpCenterView;