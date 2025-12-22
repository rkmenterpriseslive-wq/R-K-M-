
import React, { useState, useEffect } from 'react';
import Button from '../Button';
import Input from '../Input';
import { DailyLineup, CallStatus, PanelConfig } from '../../types';

interface UpdateLineupStatusFormProps {
    lineup: DailyLineup;
    panelConfig: PanelConfig | null; // For potential dynamic location/store dropdowns
    onSave: (id: string, data: Partial<DailyLineup>) => void;
    onCancel: () => void;
}

const UpdateLineupStatusForm: React.FC<UpdateLineupStatusFormProps> = ({
    lineup,
    panelConfig,
    onSave,
    onCancel,
}) => {
    const [newCallStatus, setNewCallStatus] = useState<CallStatus>(lineup.callStatus);
    const [interviewDate, setInterviewDate] = useState<string | null>(lineup.interviewDate || null);
    const [interviewTime, setInterviewTime] = useState<string | null>(lineup.interviewTime || null);
    const [interviewPlace, setInterviewPlace] = useState<string | null>(lineup.interviewPlace || null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        setNewCallStatus(lineup.callStatus);
        setInterviewDate(lineup.interviewDate || null);
        setInterviewTime(lineup.interviewTime || null);
        setInterviewPlace(lineup.interviewPlace || null);
        setFormErrors({});
    }, [lineup]);

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const status = e.target.value as CallStatus;
        setNewCallStatus(status);
        setFormErrors(prev => ({ ...prev, newCallStatus: '' }));

        // Clear interview fields if status is not 'Interested'
        if (status !== 'Interested') {
            setInterviewDate(null);
            setInterviewTime(null);
            setInterviewPlace(null);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'interviewDate') setInterviewDate(value);
        if (name === 'interviewTime') setInterviewTime(value);
        if (name === 'interviewPlace') setInterviewPlace(value);
        setFormErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (newCallStatus === 'Interested') {
            if (!interviewDate) errors.interviewDate = 'Interview date is required for "Interested" status.';
            if (!interviewTime) errors.interviewTime = 'Interview time is required for "Interested" status.';
            if (!interviewPlace) errors.interviewPlace = 'Interview place is required for "Interested" status.';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            alert('Please fill in all required fields for the selected status.');
            return;
        }

        const updatedData: Partial<DailyLineup> = {
            callStatus: newCallStatus,
            interviewDate: newCallStatus === 'Interested' ? interviewDate : null,
            interviewTime: newCallStatus === 'Interested' ? interviewTime : null,
            interviewPlace: newCallStatus === 'Interested' ? interviewPlace : null,
        };

        onSave(lineup.id, updatedData);
    };

    const selectStyle = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-gray-500">Candidate Name:</p>
                    <p className="font-semibold text-gray-900">{lineup.candidateName}</p>
                </div>
                <div>
                    <p className="text-gray-500">Mobile Number:</p>
                    <p className="font-semibold text-gray-900">{lineup.contact}</p>
                </div>
                <div>
                    <p className="text-gray-500">Role:</p>
                    <p className="font-semibold text-gray-900">{lineup.role}</p>
                </div>
                <div>
                    <p className="text-gray-500">Location:</p>
                    <p className="font-semibold text-gray-900">{lineup.location}, {lineup.storeName}</p>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
                <label htmlFor="newCallStatus" className="block text-sm font-medium text-gray-700 mb-1">
                    Update Call Status *
                </label>
                <select
                    id="newCallStatus"
                    name="newCallStatus"
                    value={newCallStatus}
                    onChange={handleStatusChange}
                    className={`${selectStyle} ${formErrors.newCallStatus ? 'border-red-500' : ''}`}
                    required
                >
                    <option value="Applied">Applied</option>
                    <option value="Connected">Connected</option>
                    <option value="Interested">Interested</option>
                    <option value="No Answer">No Answer</option>
                    <option value="Not Interested">Not Interested</option>
                    <option value="Callback">Callback</option>
                    <option value="Already Call">Already Call</option>
                </select>
                {formErrors.newCallStatus && <p className="mt-1 text-sm text-red-600">{formErrors.newCallStatus}</p>}
            </div>

            {newCallStatus === 'Interested' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in pt-4 border-t border-gray-200">
                    <h4 className="col-span-full text-md font-semibold text-gray-800">Interview Details</h4>
                    <Input
                        id="interviewDate"
                        name="interviewDate"
                        label="Interview Date *"
                        type="date"
                        value={interviewDate || ''}
                        onChange={handleInputChange}
                        error={formErrors.interviewDate}
                        required
                    />
                    <Input
                        id="interviewTime"
                        name="interviewTime"
                        label="Interview Time *"
                        type="time"
                        value={interviewTime || ''}
                        onChange={handleInputChange}
                        error={formErrors.interviewTime}
                        required
                    />
                    <div className="md:col-span-2">
                        <Input
                            id="interviewPlace"
                            name="interviewPlace"
                            label="Interview Place *"
                            value={interviewPlace || ''}
                            onChange={handleInputChange}
                            placeholder="e.g. Office Address / Online Meeting Link"
                            error={formErrors.interviewPlace}
                            required
                        />
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t mt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit" variant="primary" className="bg-indigo-600 hover:bg-indigo-700">Save Changes</Button>
            </div>
        </form>
    );
};

export default UpdateLineupStatusForm;
