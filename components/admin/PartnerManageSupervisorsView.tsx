import React, { useState, useMemo, FC } from 'react';
import { StoreSupervisor } from '../../types';
import Button from '../Button';
import Input from '../Input';
import Modal from '../Modal';

// --- MOCK DATA ---
const MOCK_SUPERVISORS: StoreSupervisor[] = [];

// --- SUB-COMPONENTS ---
const SupervisorForm: FC<{
    supervisor: Partial<StoreSupervisor> | null;
    onSave: (data: StoreSupervisor) => void;
    onClose: () => void;
}> = ({ supervisor, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<StoreSupervisor>>(
        supervisor || { name: '', email: '', phone: '', storeLocation: '', status: 'Active' }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation
        if (!formData.name || !formData.email || !formData.phone || !formData.storeLocation) {
            alert('Please fill all fields.');
            return;
        }
        onSave(formData as StoreSupervisor);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="name" name="name" label="Full Name" value={formData.name || ''} onChange={handleChange} required />
            <Input id="email" name="email" label="Email Address" type="email" value={formData.email || ''} onChange={handleChange} required />
            <Input id="phone" name="phone" label="Phone Number" type="tel" value={formData.phone || ''} onChange={handleChange} required />
            <Input id="storeLocation" name="storeLocation" label="Store Location / Address" value={formData.storeLocation || ''} onChange={handleChange} required />
            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" variant="primary">Save Supervisor</Button>
            </div>
        </form>
    );
};

const PartnerManageSupervisorsView: FC = () => {
    const [supervisors, setSupervisors] = useState<StoreSupervisor[]>(MOCK_SUPERVISORS);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupervisor, setEditingSupervisor] = useState<StoreSupervisor | null>(null);

    const summary = useMemo(() => ({
        total: supervisors.length,
        active: supervisors.filter(s => s.status === 'Active').length,
    }), [supervisors]);

    const filteredSupervisors = useMemo(() => {
        return supervisors.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.storeLocation.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [supervisors, searchTerm]);
    
    const openAddModal = () => {
        setEditingSupervisor(null);
        setIsModalOpen(true);
    };

    const openEditModal = (supervisor: StoreSupervisor) => {
        setEditingSupervisor(supervisor);
        setIsModalOpen(true);
    };

    const handleSave = (data: StoreSupervisor) => {
        if (editingSupervisor) { // Update
            setSupervisors(supervisors.map(s => s.id === editingSupervisor.id ? { ...s, ...data } : s));
        } else { // Add new
            const newSupervisor = { ...data, id: `SUP${Date.now()}` };
            setSupervisors([newSupervisor, ...supervisors]);
        }
        setIsModalOpen(false);
        setEditingSupervisor(null);
    };
    
    const handleToggleStatus = (id: string) => {
        setSupervisors(supervisors.map(s => s.id === id ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active'} : s));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-3xl font-bold text-gray-800">Manage Supervisors</h2>
                <Button variant="primary" onClick={openAddModal}>+ Add New Supervisor</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"><h4 className="text-sm font-semibold text-gray-500">Total Supervisors</h4><p className="text-3xl font-bold text-gray-900">{summary.total}</p></div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"><h4 className="text-sm font-semibold text-gray-500">Active</h4><p className="text-3xl font-bold text-green-600">{summary.active}</p></div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <Input id="search" label="Search by Name or Store Location" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supervisor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredSupervisors.map(sup => (
                                <tr key={sup.id}>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{sup.name}</div>
                                        <div className="text-xs text-gray-500">{sup.email} | {sup.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{sup.storeLocation}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${sup.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {sup.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(sup.id)}>
                                            {sup.status === 'Active' ? 'Deactivate' : 'Activate'}
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => openEditModal(sup)}>Edit</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSupervisor ? 'Edit Supervisor' : 'Add New Supervisor'}>
                <SupervisorForm supervisor={editingSupervisor} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default PartnerManageSupervisorsView;