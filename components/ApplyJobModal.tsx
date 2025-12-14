import React, { useState, FC, useMemo, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import { ApplyJobModalProps } from '../types';
import { addDailyLineup } from '../services/firebaseService';

// Icons defined locally for simplicity
const BriefcaseIcon: FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2v-6a2 2 0 00-2-2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12V6a4 4 0 00-4-4H8a4 4 0 00-4 4v6" /></svg>;
const LocationIcon: FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;


const ApplyJobModal: FC<ApplyJobModalProps> = ({ isOpen, onClose, job, currentUserProfile }) => {
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedHr, setSelectedHr] = useState('');
    const [interviewDateTime, setInterviewDateTime] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (job) {
            setSelectedRole('');
            setSelectedHr('');
            setInterviewDateTime('');
        }
    }, [job, isOpen]);

    const availableRoles = useMemo(() => {
        return job ? job.title.split(/, | \/ /).map(role => role.trim()) : [];
    }, [job]);
    
    const hrMembers = ['Vikrant Singh', 'Rohit Kumar', 'Surekha Choudhry'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!currentUserProfile || !job) {
            alert("An error occurred. Missing user or job information.");
            setLoading(false);
            onClose();
            return;
        }
        
        try {
            const lineupData = {
                candidateName: currentUserProfile.name || 'Unknown',
                contact: currentUserProfile.phone || 'N/A',
                vendor: 'Direct',
                role: selectedRole,
                location: job.jobCity,
                storeName: job.storeName || job.locality,
                submittedBy: selectedHr, // Assigns the application to the selected HR person
                callStatus: 'Applied' as const,
                interviewDateTime: interviewDateTime,
            };

            await addDailyLineup(lineupData);

            alert('Application submitted successfully! Our team will contact you shortly.');
            onClose();

        } catch (error) {
            console.error("Failed to submit application:", error);
            alert("There was an error submitting your application. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!job || !currentUserProfile) return null;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={`Apply for ${job.title}`}
            description="Confirm your application details."
            maxWidth="max-w-lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-bold text-gray-800">{job.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1.5"><BriefcaseIcon /> {job.company}</span>
                        <span className="flex items-center gap-1.5"><LocationIcon /> {job.jobCity}</span>
                    </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                    <p>You are applying as: <strong>{currentUserProfile.name}</strong> ({currentUserProfile.email})</p>
                </div>

                <div>
                    <label htmlFor="selectRole" className="block text-sm font-medium text-gray-700 mb-1">Select Role *</label>
                    <select id="selectRole" value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required>
                        <option value="" disabled>Choose a role</option>
                        {availableRoles.map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                </div>
                
                <div>
                    <label htmlFor="selectHr" className="block text-sm font-medium text-gray-700 mb-1">Select Your HR *</label>
                    <select id="selectHr" value={selectedHr} onChange={e => setSelectedHr(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required>
                        <option value="" disabled>Choose your HR contact</option>
                        {hrMembers.map(hr => <option key={hr} value={hr}>{hr}</option>)}
                    </select>
                </div>

                <Input
                    id="interviewDateTime"
                    label="Preferred Interview Date & Time *"
                    type="datetime-local"
                    value={interviewDateTime}
                    onChange={e => setInterviewDateTime(e.target.value)}
                    required
                />

                <div className="pt-4">
                    <Button type="submit" className="w-full justify-center" loading={loading}>
                        Submit Application
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ApplyJobModal;