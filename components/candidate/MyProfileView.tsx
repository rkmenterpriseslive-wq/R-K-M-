import React, { useState } from 'react';
import Button from '../Button';
import Input from '../Input';

const MyProfileView: React.FC = () => {
    const [profile, setProfile] = useState({
        // Personal
        fullName: '',
        email: '',
        phone: '',
        address: '',
        // Professional
        currentRole: '',
        company: '',
        totalExperience: '',
        skills: '',
        // Educational
        highestQualification: '',
        university: '',
        graduationYear: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Profile saved successfully!');
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>
            <p className="text-gray-600">Keep your profile updated to get the best job recommendations.</p>

            <form onSubmit={handleSave} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-8">
                {/* Personal Details */}
                <fieldset>
                    <legend className="text-lg font-semibold text-gray-800 pb-2 border-b mb-4">Personal Details</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input id="fullName" name="fullName" label="Full Name" value={profile.fullName} onChange={handleChange} />
                        <Input id="email" name="email" label="Email Address" type="email" value={profile.email} onChange={handleChange} disabled />
                        <Input id="phone" name="phone" label="Phone Number" type="tel" value={profile.phone} onChange={handleChange} />
                        <div className="md:col-span-2">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                            <textarea id="address" name="address" rows={3} value={profile.address} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
                        </div>
                    </div>
                </fieldset>

                {/* Professional Details */}
                <fieldset>
                    <legend className="text-lg font-semibold text-gray-800 pb-2 border-b mb-4">Professional Details</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input id="currentRole" name="currentRole" label="Current Role" value={profile.currentRole} onChange={handleChange} />
                        <Input id="company" name="company" label="Current Company" value={profile.company} onChange={handleChange} />
                        <Input id="totalExperience" name="totalExperience" label="Total Experience" value={profile.totalExperience} onChange={handleChange} />
                        <div className="md:col-span-2">
                            <Input id="skills" name="skills" label="Key Skills (comma-separated)" value={profile.skills} onChange={handleChange} />
                        </div>
                    </div>
                </fieldset>

                {/* Educational Details */}
                <fieldset>
                    <legend className="text-lg font-semibold text-gray-800 pb-2 border-b mb-4">Educational Details</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input id="highestQualification" name="highestQualification" label="Highest Qualification" value={profile.highestQualification} onChange={handleChange} />
                        <Input id="university" name="university" label="University / College" value={profile.university} onChange={handleChange} />
                        <Input id="graduationYear" name="graduationYear" label="Year of Graduation" value={profile.graduationYear} onChange={handleChange} />
                    </div>
                </fieldset>
                
                <div className="flex justify-end pt-4">
                    <Button type="submit" variant="primary">Save Changes</Button>
                </div>
            </form>
        </div>
    );
};

export default MyProfileView;