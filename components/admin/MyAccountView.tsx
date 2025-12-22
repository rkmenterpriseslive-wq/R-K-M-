
import React, { useState, useEffect } from 'react';
import { UserProfile, TeamMember } from '../../types';
import { updateUserProfile, reauthenticateUser, changeUserPassword } from '../../services/firebaseService';
import Input from '../Input';
import Button from '../Button';

interface MyAccountViewProps {
    profile: UserProfile | null;
    teamDetails: TeamMember | null;
}

const MyAccountView: React.FC<MyAccountViewProps> = ({ profile, teamDetails }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isSavingInfo, setIsSavingInfo] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    
    const [infoMessage, setInfoMessage] = useState({ type: '', text: '' });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (profile) {
            setName(profile.name || '');
            setPhone(profile.phone || '');
        }
    }, [profile]);

    if (!profile) {
        return <div>Loading profile...</div>;
    }

    const handleSaveInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingInfo(true);
        setInfoMessage({ type: '', text: '' });
        try {
            await updateUserProfile(profile.uid, { name, phone });
            setInfoMessage({ type: 'success', text: 'Information saved successfully!' });
        } catch (error) {
            setInfoMessage({ type: 'error', text: 'Failed to save information.' });
            console.error(error);
        } finally {
            setIsSavingInfo(false);
        }
    };
    
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: "New passwords do not match." });
            return;
        }
        if (newPassword.length < 6) {
             setPasswordMessage({ type: 'error', text: "Password must be at least 6 characters." });
            return;
        }

        setIsChangingPassword(true);
        setPasswordMessage({ type: '', text: '' });

        try {
            await reauthenticateUser(currentPassword);
            await changeUserPassword(newPassword);
            setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
            // Clear fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                 setPasswordMessage({ type: 'error', text: 'Incorrect current password.' });
            } else {
                setPasswordMessage({ type: 'error', text: 'An error occurred. Please try again.' });
            }
            console.error(error);
        } finally {
            setIsChangingPassword(false);
        }
    };
    
    const roleDisplay = teamDetails?.role || profile.role || profile.userType;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column: Profile Card */}
            <div className="lg:col-span-1 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                <div className="text-center">
                    <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-4xl font-bold mx-auto">
                        {name ? name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <h2 className="mt-4 text-xl font-bold text-gray-900">{name}</h2>
                    <p className="text-gray-500 capitalize">{roleDisplay.toLowerCase()}</p>
                    <Button variant="secondary" className="mt-6 w-full" disabled>Change Photo</Button>
                </div>
                
                {/* Professional Information - Moved to Left Column */}
                {teamDetails && (
                    <div className="text-left space-y-4 mt-8 pt-8 border-t">
                        <h3 className="text-lg font-semibold text-gray-800">Professional Information</h3>
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Reporting Manager</dt>
                                <dd className="mt-1 text-sm text-gray-900 font-bold">{teamDetails.reportingManager || '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Working Locations</dt>
                                <dd className="mt-1 flex flex-wrap gap-2">
                                    {teamDetails.workingLocations?.length > 0 ? teamDetails.workingLocations.map(loc => (
                                        <span key={loc} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">{loc}</span>
                                    )) : <span className="text-sm text-gray-900">-</span>}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Assigned Vendor Processes</dt>
                                <dd className="mt-1 flex flex-wrap gap-2">
                                    {teamDetails.vendors?.length > 0 ? teamDetails.vendors.map(vendor => (
                                        <span key={vendor} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">{vendor}</span>
                                    )) : <span className="text-sm text-gray-900">-</span>}
                                </dd>
                            </div>
                        </dl>
                    </div>
                )}
            </div>

            {/* Right Column: Forms */}
            <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-10">
                {/* Personal Information Form */}
                <form onSubmit={handleSaveInfo} className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
                    <Input id="fullName" label="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                    <Input id="emailAddress" label="Email Address" value={profile.email || ''} disabled />
                    <Input id="phoneNumber" label="Phone Number" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
                    {infoMessage.text && (
                        <p className={`text-sm ${infoMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{infoMessage.text}</p>
                    )}
                    <div className="text-right">
                        <Button type="submit" variant="primary" loading={isSavingInfo} className="bg-indigo-600 hover:bg-indigo-700">Save Changes</Button>
                    </div>
                </form>

                {/* Change Password Form */}
                <form onSubmit={handleChangePassword} className="space-y-6 pt-10 border-t">
                     <h3 className="text-xl font-semibold text-gray-800">Change Password</h3>
                     <Input id="currentPassword" label="Current Password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                     <Input id="newPassword" label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                     <Input id="confirmPassword" label="Confirm New Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                     {passwordMessage.text && (
                        <p className={`text-sm ${passwordMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{passwordMessage.text}</p>
                     )}
                     <div className="text-right">
                         <Button type="submit" variant="primary" loading={isChangingPassword} className="bg-indigo-600 hover:bg-indigo-700">Change Password</Button>
                     </div>
                </form>
            </div>
        </div>
    );
};

export default MyAccountView;
