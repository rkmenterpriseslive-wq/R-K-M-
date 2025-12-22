
import React, { useState, useEffect } from 'react';
import Button from '../Button';
import Input from '../Input';
import { DailyLineup, CallStatus, PanelConfig, Store } from '../../types';
import { findCandidateInLineupsByMobile } from '../../services/firebaseService';

interface AddLineupFormProps {
    onSave: (data: Omit<DailyLineup, 'id' | 'createdAt' | 'interviewDateTime' | 'submittedBy'>) => Promise<void>;
    onCancel: () => void;
    initialData: Omit<DailyLineup, 'id' | 'createdAt' | 'interviewDateTime' | 'submittedBy'>;
    panelConfig: PanelConfig | null;
    uniqueVendors: string[];
}

const AddLineupForm: React.FC<AddLineupFormProps> = ({ 
    onSave, 
    onCancel, 
    initialData, 
    panelConfig, 
    uniqueVendors
}) => {
    const [formData, setFormData] = useState(initialData);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormErrors(prev => ({ ...prev, [name]: '' })); // Clear error on change
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!formData.candidateName) errors.candidateName = 'Candidate name is required.';
        if (!formData.contact) errors.contact = 'Mobile number is required.';
        if (!formData.vendor) errors.vendor = 'Vendor is required.';
        if (!formData.role) errors.role = 'Role is required.';
        if (!formData.location) errors.location = 'Location is required.';
        if (!formData.storeName) errors.storeName = 'Store name is required.';
        if (!formData.callStatus) errors.callStatus = 'Call status is required.';
        
        // Conditional validation for interview fields
        if (formData.callStatus === 'Interested') {
            if (!formData.interviewDate) errors.interviewDate = 'Interview date is required for "Interested" status.';
            if (!formData.interviewTime) errors.interviewTime = 'Interview time is required for "Interested" status.';
            if (!formData.interviewPlace) errors.interviewPlace = 'Interview place is required for "Interested" status.';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            alert('Please fill in all required fields.');
            return;
        }
        
        setIsSubmitting(true);
        try {
            const existingCandidate = await findCandidateInLineupsByMobile(formData.contact);
            if (existingCandidate) {
                setFormErrors(prev => ({ ...prev, contact: `This mobile number is already in the lineup as "${existingCandidate.candidateName}".` }));
                alert(`Duplicate Entry: This mobile number is already registered for candidate "${existingCandidate.candidateName}".`);
                setIsSubmitting(false);
                return;
            }
            await onSave(formData);
        } catch (error) {
            console.error('Error during lineup submission:', error);
            setIsSubmitting(false);
        }
    };

    const filteredStores: Store[] = panelConfig?.stores.filter(s => s.location === formData.location) || [];

    const selectStyle = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                    id="candidateName" 
                    name="candidateName" 
                    label="Candidate Name *" 
                    value={formData.candidateName} 
                    onChange={handleChange} 
                    placeholder="e.g. John Doe" 
                    error={formErrors.candidateName}
                    required 
                />
                <Input 
                    id="contact" 
                    name="contact" 
                    label="Mobile Number *" 
                    type="tel" 
                    value={formData.contact} 
                    onChange={handleChange} 
                    placeholder="+91 98765 43210" 
                    error={formErrors.contact}
                    required 
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="vendor" className="block text-sm font-medium text-gray-700 mb-1">Company / Vendor *"</label>
                    <select 
                        id="vendor" 
                        name="vendor" 
                        value={formData.vendor} 
                        onChange={handleChange} 
                        className={`${selectStyle} ${formErrors.vendor ? 'border-red-500' : ''}`} 
                        required
                    >
                        <option value="">Select a vendor</option>
                        {uniqueVendors.map(v => <option key={v} value={v}>{v}</option>)}
                        <option value="Direct">Direct</option>
                    </select>
                    {formErrors.vendor && <p className="mt-1 text-sm text-red-600">{formErrors.vendor}</p>}
                </div>
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role *"</label>
                    <select 
                        id="role" 
                        name="role" 
                        value={formData.role} 
                        onChange={handleChange} 
                        className={`${selectStyle} ${formErrors.role ? 'border-red-500' : ''}`} 
                        disabled={!panelConfig?.jobRoles.length}
                        required
                    >
                        <option value="">{panelConfig?.jobRoles.length ? 'Select a role' : 'No roles available'}</option>
                        {panelConfig?.jobRoles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    {formErrors.role && <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location *"</label>
                    <select 
                        id="location" 
                        name="location" 
                        value={formData.location} 
                        onChange={handleChange} 
                        className={`${selectStyle} ${formErrors.location ? 'border-red-500' : ''}`} 
                        disabled={!panelConfig?.locations.length}
                        required
                    >
                        <option value="">{panelConfig?.locations.length ? 'Select a location' : 'No locations available'}</option>
                        {panelConfig?.locations.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    {formErrors.location && <p className="mt-1 text-sm text-red-600">{formErrors.location}</p>}
                </div>
                <div>
                    <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-1">Store Name *"</label>
                    <select 
                        id="storeName" 
                        name="storeName" 
                        value={formData.storeName} 
                        onChange={handleChange} 
                        className={`${selectStyle} ${formErrors.storeName ? 'border-red-500' : ''}`} 
                        disabled={!formData.location || !filteredStores.length}
                        required
                    >
                        <option value="">{formData.location ? (filteredStores.length ? 'Select a store' : 'No stores for this location') : 'Select a location first'}</option>
                        {filteredStores.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                    {formErrors.storeName && <p className="mt-1 text-sm text-red-600">{formErrors.storeName}</p>}
                </div>
            </div>
            <div>
                <label htmlFor="callStatus" className="block text-sm font-medium text-gray-700 mb-1">Call Status *"</label>
                <select 
                    id="callStatus" 
                    name="callStatus" 
                    value={formData.callStatus} 
                    onChange={handleChange} 
                    className={`${selectStyle} ${formErrors.callStatus ? 'border-red-500' : ''}`} 
                    required
                >
                    <option value="Connected">Connected</option>
                    <option value="Applied">Applied</option>
                    <option value="Interested">Interested</option>
                    <option value="No Answer">No Answer</option>
                    <option value="Not Interested">Not Interested</option>
                    <option value="Callback">Callback</option>
                    <option value="Already Call">Already Call</option>
                </select>
                {formErrors.callStatus && <p className="mt-1 text-sm text-red-600">{formErrors.callStatus}</p>}
            </div>

            {/* Conditional Interview Fields */}
            {formData.callStatus === 'Interested' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                    <Input 
                        id="interviewDate" 
                        name="interviewDate" 
                        label="Interview Date *" 
                        type="date" 
                        value={formData.interviewDate || ''} 
                        onChange={handleChange} 
                        error={formErrors.interviewDate}
                        required 
                    />
                    <Input 
                        id="interviewTime" 
                        name="interviewTime" 
                        label="Interview Time *" 
                        type="time" 
                        value={formData.interviewTime || ''} 
                        onChange={handleChange} 
                        error={formErrors.interviewTime}
                        required 
                    />
                    <div className="md:col-span-2">
                        <Input 
                            id="interviewPlace" 
                            name="interviewPlace" 
                            label="Interview Place *" 
                            value={formData.interviewPlace || ''} 
                            onChange={handleChange} 
                            placeholder="e.g. Office Address / Online Meeting Link" 
                            error={formErrors.interviewPlace}
                            required 
                        />
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t mt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit" variant="primary" loading={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">Add Lineup</Button>
            </div>
        </form>
    );
};

export default AddLineupForm;
