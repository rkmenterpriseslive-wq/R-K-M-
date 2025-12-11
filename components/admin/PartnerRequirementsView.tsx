import React, { useState, useMemo, FC } from 'react';
import { PartnerRequirement } from '../../types';
import Input from '../Input';
import Button from '../Button';
import Modal from '../Modal';

// MOCK DATA has been removed.
const MOCK_ASSIGNED_REQUIREMENTS: PartnerRequirement[] = [];

const getStatusClasses = (status: PartnerRequirement['submissionStatus']) => {
    switch (status) {
        case 'Approved': return 'bg-green-100 text-green-800';
        case 'Pending Review': return 'bg-yellow-100 text-yellow-800';
        case 'Rejected': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const RequirementForm: FC<{
    onSave: (data: { role: string; client: string; location: string; count: number; }) => void;
    onClose: () => void;
}> = ({ onSave, onClose }) => {
    const [formData, setFormData] = useState({ role: '', client: '', location: '', count: 1 });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'count' ? parseInt(value) || 1 : value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.role || !formData.client || !formData.location || formData.count < 1) {
            alert('Please fill all fields.');
            return;
        }
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="role" name="role" label="Role / Job Title" value={formData.role} onChange={handleChange} required />
            <Input id="client" name="client" label="Client Name" value={formData.client} onChange={handleChange} required />
            <Input id="location" name="location" label="Job Location" value={formData.location} onChange={handleChange} required />
            <Input id="count" name="count" label="Number of Openings (Count)" type="number" min="1" value={formData.count.toString()} onChange={handleChange} required />
            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" variant="primary">Submit Requirement</Button>
            </div>
        </form>
    );
};

const PartnerRequirementsView: FC = () => {
    const [assignedRequirements] = useState<PartnerRequirement[]>(MOCK_ASSIGNED_REQUIREMENTS);
    const [myRequirements, setMyRequirements] = useState<PartnerRequirement[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSubmitRequirement = (data: { role: string; client: string; location: string; count: number; }) => {
        const newRequirement: PartnerRequirement = {
            id: `SUB-${Date.now()}`,
            title: data.role,
            client: data.client,
            location: data.location,
            openings: data.count,
            postedDate: new Date().toISOString(),
            submissionStatus: 'Pending Review',
            // Fields below are empty as they are submitted by partner for admin to fill
            salary: '',
            experience: '',
            description: '',
            jobType: '',
            workingDays: '',
            jobShift: '',
        };
        setMyRequirements(prev => [newRequirement, ...prev]);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-3xl font-bold text-gray-800">Partner Requirements</h2>
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                    + Submit New Requirement
                </Button>
            </div>

            {/* My Submitted Requirements */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                    <h3 className="text-lg font-bold text-gray-800">My Submitted Requirements</h3>
                    <p className="text-sm text-gray-500">Track the status of requirements you've sent to the admin.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client & Location</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Count</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted On</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {myRequirements.length > 0 ? myRequirements.map(req => (
                                <tr key={req.id}>
                                    <td className="px-6 py-4 font-medium text-gray-900">{req.title}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div>{req.client}</div>
                                        <div className="text-xs text-gray-400">{req.location}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-semibold text-gray-800">{req.openings}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(req.postedDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(req.submissionStatus)}`}>
                                            {req.submissionStatus}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5} className="text-center py-10 text-gray-500">You haven't submitted any requirements yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Open Requirements from RKM */}
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Open Requirements from RKM</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {assignedRequirements.map(req => (
                         <div key={req.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
                            <div>
                                <h4 className="text-lg font-bold text-gray-900">{req.title}</h4>
                                <p className="text-sm font-medium text-blue-600">{req.client}</p>
                                <p className="text-sm text-gray-500 mt-1">{req.location}</p>
                                <div className="mt-3 space-y-2 text-sm text-gray-700 border-t pt-3">
                                     <p><strong>Salary:</strong> {req.salary}</p>
                                     <p><strong>Experience:</strong> {req.experience}</p>
                                     <p><strong>Openings:</strong> {req.openings}</p>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <Button variant="ghost" size="sm">View Details</Button>
                            </div>
                        </div>
                    ))}
                    {assignedRequirements.length === 0 && <p className="text-gray-500 md:col-span-2">No open requirements assigned from RKM at this time.</p>}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit New Requirement">
                <RequirementForm onSave={handleSubmitRequirement} onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default PartnerRequirementsView;