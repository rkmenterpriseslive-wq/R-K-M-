
import React, { useState, FC, useMemo, useRef } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { ApplyJobModalProps } from '../types';
import { supabase } from '../services/supabaseClient';

// Icons defined locally for simplicity
const BriefcaseIcon: FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2v-6a2 2 0 00-2-2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12V6a4 4 0 00-4-4H8a4 4 0 00-4 4v6" /></svg>;
const LocationIcon: FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const PersonIcon: FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
const PhoneIcon: FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>;
const KeyIcon: FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.937-.625 1.492-.625H15.75z" /></svg>;
const EmailIcon: FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>;


const ApplyJobModal: FC<ApplyJobModalProps> = ({ isOpen, onClose, job }) => {
    const [fullName, setFullName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [email, setEmail] = useState('');
    const [loginCode, setLoginCode] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [reference, setReference] = useState('No Reference');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const resumeInputRef = useRef<HTMLInputElement>(null);

    const availableRoles = useMemo(() => {
        return job ? job.title.split(/, | \/ /).map(role => role.trim()) : [];
    }, [job]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            if (e.target.files[0].size > 512 * 1024) {
                alert('File size exceeds 512KB limit.');
                return;
            }
            setResumeFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loginCode.length !== 6) {
            alert('Your login code must be exactly 6 digits.');
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: loginCode,
                options: {
                    data: {
                        full_name: fullName,
                        phone: mobileNumber,
                    }
                }
            });

            if (error) {
                throw error;
            }

            alert('Application submitted successfully! A confirmation link has been sent to your email. Please verify your account to log in.');
            
            onClose();
            // Reset form
            setFullName('');
            setMobileNumber('');
            setEmail('');
            setLoginCode('');
            setSelectedRole('');
            setReference('No Reference');
            setResumeFile(null);

        } catch (error: any) {
            console.error("Error submitting application:", error);
            if (error.message.includes('User already registered')) {
                alert('An account with this email already exists. Please log in using the Employee Login panel.');
            } else {
                alert(`Submission failed: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!job) return null;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Apply for Job"
            description="Submit your application to join our team."
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

                <Input id="fullName" label="Full Name *" icon={<PersonIcon />} value={fullName} onChange={e => setFullName(e.target.value)} required />
                <Input id="mobileNumber" label="Mobile Number *" type="tel" icon={<PhoneIcon />} value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} required />
                <Input id="email" label="Email ID *" type="email" icon={<EmailIcon />} value={email} onChange={e => setEmail(e.target.value)} required />
                <Input id="loginCode" label="Set 6-digit login code *" type="text" maxLength={6} icon={<KeyIcon />} value={loginCode} onChange={e => setLoginCode(e.target.value.replace(/\D/g, ''))} required />

                <div>
                    <label htmlFor="selectRole" className="block text-sm font-medium text-gray-700 mb-1">Select Role *</label>
                    <select id="selectRole" value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required>
                        <option value="" disabled>Choose a role</option>
                        {availableRoles.map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                </div>
                
                 <div>
                    <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">Reference (Optional)</label>
                    <select id="reference" value={reference} onChange={e => setReference(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        <option>No Reference</option>
                        <option>Employee Referral</option>
                        <option>Online Ad</option>
                        <option>Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resume (Optional)</label>
                    <input type="file" ref={resumeInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx" />
                    <Button type="button" variant="secondary" onClick={() => resumeInputRef.current?.click()} className="w-full justify-center border-dashed">
                        {resumeFile ? resumeFile.name : 'Upload file'}
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX up to 512KB</p>
                </div>

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