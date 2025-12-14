import React from 'react';
import { UserProfile } from '../../types';

interface MyProfileViewProps {
    currentUserProfile?: UserProfile | null;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        {children}
    </div>
);

const ProfileField: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900">{value || '-'}</dd>
    </div>
);

const MyProfileView: React.FC<MyProfileViewProps> = ({ currentUserProfile }) => {
    if (!currentUserProfile) {
        return (
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
                <p>Loading profile...</p>
            </div>
        );
    }
    
    const {
        name, email, phone, address, fatherName, dob, nationality, gender, maritalStatus, languagesKnown,
        summary, skills, experiences, educations
    } = currentUserProfile;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>
            <p className="text-gray-600">This is a summary of the information you provided in your CV.</p>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold">
                        {name ? name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
                        <p className="text-gray-500">{email}</p>
                    </div>
                </div>

                {/* Personal Details */}
                <Section title="Personal Details">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6">
                        <ProfileField label="Phone Number" value={phone} />
                        <ProfileField label="Address" value={address} />
                        <ProfileField label="Father's Name" value={fatherName} />
                        <ProfileField label="Date of Birth" value={dob} />
                        <ProfileField label="Nationality" value={nationality} />
                        <ProfileField label="Gender" value={gender} />
                        <ProfileField label="Marital Status" value={maritalStatus} />
                        <ProfileField label="Languages Known" value={languagesKnown} />
                    </dl>
                </Section>
                
                {/* Career Objective */}
                {summary && (
                    <Section title="Career Objective">
                        <p className="text-gray-700 italic">"{summary}"</p>
                    </Section>
                )}
                
                {/* Skills */}
                {skills && (
                    <Section title="Technical Qualifications">
                        <div className="flex flex-wrap gap-2">
                            {skills.split(',').map((skill, i) => (
                                <span key={i} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">
                                    {skill.trim()}
                                </span>
                            ))}
                        </div>
                    </Section>
                )}

                {/* Work Experience */}
                {experiences && experiences.length > 0 && experiences[0].role && (
                    <Section title="Work Experience">
                        <div className="space-y-4">
                            {experiences.map(exp => (
                                <div key={exp.id} className="p-4 border rounded-lg bg-gray-50/50">
                                    <h4 className="font-bold text-gray-800">{exp.role}</h4>
                                    <p className="text-sm font-medium text-gray-600">{exp.company} | <span className="text-gray-500">{exp.duration}</span></p>
                                    {exp.description && <p className="text-sm text-gray-700 mt-2">{exp.description}</p>}
                                </div>
                            ))}
                        </div>
                    </Section>
                )}
                
                {/* Education */}
                {educations && educations.length > 0 && educations[0].degree && (
                    <Section title="Educational Qualifications">
                        <div className="space-y-3">
                            {educations.map(edu => (
                                <div key={edu.id}>
                                    <p className="font-semibold text-gray-800">{edu.degree}</p>
                                    <p className="text-sm text-gray-600">{edu.university} - {edu.duration}</p>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}
            </div>
        </div>
    );
};

export default MyProfileView;