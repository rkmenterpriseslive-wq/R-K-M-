import React, { useState } from 'react';
import Modal from '../Modal';
import Input from '../Input';
import Button from '../Button';

interface AddTeamMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (memberData: any) => void;
    availableLocations: string[];
    availableVendors: string[];
}

const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({ isOpen, onClose, onSave, availableLocations, availableVendors }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        salary: '0',
        role: '',
        reportingManager: '',
        workingLocations: [],
        vendors: [],
    });

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

    const handleSubmit = () => {
        // Add validation here if needed
        onSave(formData);
    };
    
    const selectStyles = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Team Member" maxWidth="max-w-3xl">
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <Input id="name" name="name" label="Name" value={formData.name} onChange={handleChange} wrapperClassName="mb-0" />
                    <Input id="email" name="email" label="Email" type="email" value={formData.email} onChange={handleChange} wrapperClassName="mb-0" />
                    <Input id="mobile" name="mobile" label="Mobile Number" type="tel" value={formData.mobile} onChange={handleChange} wrapperClassName="mb-0" />
                    <Input id="salary" name="salary" label="Salary" type="number" value={formData.salary} onChange={handleChange} wrapperClassName="mb-0" />
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select id="role" name="role" value={formData.role} onChange={handleChange} className={selectStyles}>
                            <option value="">Select Role</option>
                            <option>Recruiter</option>
                            <option>Team Lead</option>
                            <option>HR Manager</option>
                        </select>
                    </div>
                     <div className="md:col-span-2">
                        <label htmlFor="reportingManager" className="block text-sm font-medium text-gray-700 mb-1">Reporting Manager</label>
                        <select id="reportingManager" name="reportingManager" value={formData.reportingManager} onChange={handleChange} className={selectStyles}>
                            <option value="">Select Reporting Manager</option>
                            <option>John Doe</option>
                            <option>Jane Smith</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="workingLocations" className="block text-sm font-medium text-gray-700 mb-1">Working Locations</label>
                        <select id="workingLocations" name="workingLocations" multiple value={formData.workingLocations} onChange={handleMultiSelectChange} className={`${selectStyles} h-24`}>
                            {availableLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="vendors" className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                        <select id="vendors" name="vendors" multiple value={formData.vendors} onChange={handleMultiSelectChange} className={`${selectStyles} h-24`}>
                            {/* FIX: Explicitly cast `availableVendors` to `string[]` as its type is inferred as `any[]`. */}
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
