
import React, { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';

interface RequestDemoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PersonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const EmailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

const RequestDemoModal: React.FC<RequestDemoModalProps> = ({ isOpen, onClose }) => {
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [teamHead, setTeamHead] = useState('');
    const [teamSize, setTeamSize] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            console.log({ companyName, email, address, teamHead, teamSize });
            alert('Demo request submitted successfully! Our team will get in touch with you shortly.');
            setLoading(false);
            onClose();
            // Reset form
            setCompanyName('');
            setEmail('');
            setAddress('');
            setTeamHead('');
            setTeamSize('');
        }, 1000);
    };

    const baseInputStyles = 'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm';
    const inputWithIconStyles = 'pl-10';
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Request a Demo">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    id="companyName"
                    label="Company Name"
                    icon={<PersonIcon />}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                />
                <Input
                    id="emailId"
                    label="Email ID"
                    type="email"
                    icon={<EmailIcon />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <div className="relative">
                        <div className="absolute top-3 left-0 pl-3 flex items-center pointer-events-none">
                            <LocationIcon />
                        </div>
                        <textarea
                            id="address"
                            rows={4}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className={`${baseInputStyles} ${inputWithIconStyles}`}
                            required
                        />
                    </div>
                </div>
                <Input
                    id="teamHead"
                    label="Name of Team Head"
                    icon={<PersonIcon />}
                    value={teamHead}
                    onChange={(e) => setTeamHead(e.target.value)}
                    required
                />
                <div>
                    <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700 mb-1">Team Size</label>
                    <select
                        id="teamSize"
                        value={teamSize}
                        onChange={(e) => setTeamSize(e.target.value)}
                        className={baseInputStyles}
                        required
                    >
                        <option value="" disabled>Select team size</option>
                        <option value="1-10">1-10 Members</option>
                        <option value="11-50">11-50 Members</option>
                        <option value="51-200">51-200 Members</option>
                        <option value="200+">200+ Members</option>
                    </select>
                </div>

                <p className="text-xs text-gray-500 pt-2">
                    This trial period will remain active for 7 days from the date of activation.
                </p>

                <div className="pt-4">
                    <Button type="submit" className="w-full justify-center" loading={loading}>
                        Submit Request
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default RequestDemoModal;
