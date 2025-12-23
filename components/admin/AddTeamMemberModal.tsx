
import React, { useState } from 'react';
import Modal from '../Modal';
import Input from '../Input';
import Button from '../Button';
import { UserProfile, Role } from '../../types';

interface AddTeamMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (memberData: any) => void;
    availableLocations: string[];
    availableVendors: string[];
    potentialManagers: UserProfile[];
    customRoles: Role[]; // Added prop for dynamic roles
}

const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    availableLocations, 
    availableVendors,
    potentialManagers,
    customRoles
}) => {
    const initialFormData = {
        name: '',
        email: '',
        mobile: '',
        salary: '0',
        role: '',
        reportingManager: '',
        workingLocations: [],
        vendors: [],
    };
    const [formData, setFormData] = useState(initialFormData);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, options } = e.target;
        const value: string[] = [];
        for (let i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) {
                value.push(options[i].value);
            }
        }
        setFormData(prev => ({ ...prev, [name]: value as any[] }));
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.email || !formData.role) {
            alert("Please fill in the required fields.");
            return;
        }
        await onSave(formData);
        setFormData(initialFormData); // Reset form fields after successful save
    };
    
    const selectStyles = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Team Member" maxWidth="max-w-3xl">
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <Input id="name" name="name" label="Name *" value={formData.name} onChange={handleChange} wrapperClassName="mb-0" required />
                    <Input id="email" name="email" label="Email *" type="email" value={formData.email} onChange={handleChange} wrapperClassName="mb-0" required />
                    <Input id="mobile" name="mobile" label="Mobile Number" type="tel" value={formData.mobile} onChange={handleChange} wrapperClassName="mb-0" />
                    <Input id="salary" name="salary" label="Salary" type="number" value={formData.salary} onChange={handleChange} wrapperClassName="mb-0" />
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                        <select id="role" name="role" value={formData.role} onChange={handleChange} className={selectStyles} required>
                            <option value="">Select Role</option>
                            {/* Priority Roles */}
                            <option value="HR Manager">HR Manager</option>
                            <option value="Team Lead">Team Lead</option>
                            <option value="Recruiter">Recruiter</option>
                            <option value="Account Manager">Account Manager</option>
                            {/* Dynamically added roles from settings */}
                            {customRoles.map(role => (
                                <option key={role.id} value={role.name}>{role.name}</option>
                            ))}
                        </select>
                    </div>
                     <div className="md:col-span-1">
                        <label htmlFor="reportingManager" className="block text-sm font-medium text-gray-700 mb-1">Reporting Manager</label>
                        <select id="reportingManager" name="reportingManager" value={formData.reportingManager} onChange={handleChange} className={selectStyles}>
                            <option value="">Select Reporting Manager</option>
                            {potentialManagers.map(manager => (
                                <option key={manager.uid} value={manager.name}>{manager.name} ({manager.userType})</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="workingLocations" className="block text-sm font-medium text-gray-700 mb-1">Working Locations</label>
                        <select id="workingLocations" name="workingLocations" multiple value={formData.workingLocations} onChange={handleMultiSelectChange} className={`${selectStyles} h-24`}>
                            {availableLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="vendors" className="block text-sm font-medium text-gray-700 mb-1">Assign Vendor Process</label>
                        <select id="vendors" name="vendors" multiple value={formData.vendors} onChange={handleMultiSelectChange} className={`${selectStyles} h-24`}>
                            {(availableVendors as string[]).map(vendor => <option key={vendor} value={vendor}>{vendor}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                    <Button type="button" variant="secondary" onClick={onClose} className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700">Cancel</Button>
                    <Button type="button" variant="primary" onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700">Save Member</Button>
                </div>
            </div>
        </Modal>
    );
};

export default AddTeamMemberModal;
