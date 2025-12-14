import React, { useState, useRef, useEffect } from 'react';
import Button from '../Button';
import Input from '../Input';
import { UserProfile, Experience, Education } from '../../types';

declare const html2pdf: any;

interface CVGeneratorViewProps {
    onCvComplete: (cvData: Partial<UserProfile>) => void;
    currentUserProfile?: UserProfile | null;
}

const CVGeneratorView: React.FC<CVGeneratorViewProps> = ({ onCvComplete, currentUserProfile }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [summary, setSummary] = useState('');
    const [skills, setSkills] = useState('');
    const [experiences, setExperiences] = useState<Experience[]>([
        { id: Date.now(), role: '', company: '', duration: '', description: '' },
    ]);
    const [educations, setEducations] = useState<Education[]>([
        { id: Date.now(), degree: '', university: '', duration: '' },
    ]);
    const cvPreviewRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // New Personal Details State
    const [fatherName, setFatherName] = useState('');
    const [dob, setDob] = useState('');
    const [nationality, setNationality] = useState('Indian');
    const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | ''>('');
    const [maritalStatus, setMaritalStatus] = useState<'Single' | 'Married' | 'Divorced' | 'Widowed' | ''>('');
    const [languagesKnown, setLanguagesKnown] = useState('');

    // New Declaration State
    const [declarationDate, setDeclarationDate] = useState('');
    const [declarationPlace, setDeclarationPlace] = useState('');

    useEffect(() => {
        const isProfileIncomplete = !currentUserProfile?.isCvComplete;

        if (currentUserProfile) {
            // Always set the user's actual email
            setEmail(currentUserProfile.email || '');

            if (isProfileIncomplete) {
                // Load demo data for new/incomplete profiles
                setName('HIMALAYA RAGHAV');
                setPhone('6397478526');
                setAddress('H.NO-515 Ghukna More, Near Mount Velly School, Ghaziabad UP-201001');
                setSummary('To apply my knowledge I gained my academies & corporate sector and put them in practice in corporate world.');
                setSkills('Basic Knowledge of Computer.');
                setExperiences([
                    { id: 1, role: 'Loan Verification Agent', company: 'HDFC Bank', duration: '1 Year', description: '' },
                    { id: 2, role: 'Associate', company: 'Bigbasket', duration: '2 Year', description: '' },
                    { id: 3, role: 'Associate', company: 'Amaron', duration: '1 Year', description: '' }
                ]);
                setEducations([
                    { id: 1, degree: 'High School', university: 'UP Board', duration: 'Passed' },
                    { id: 2, degree: 'Intermediate', university: 'UP Board', duration: 'Passed' },
                    { id: 3, degree: 'BA', university: 'CCS University', duration: 'Pursuing' }
                ]);
                setFatherName('Mr. Avdesh Kumar');
                setDob('2004-05-28');
                setNationality('Indian');
                setGender('Male');
                setMaritalStatus('Single'); // Mapping "Unmarried" to "Single"
                setLanguagesKnown('Hindi & English');
                setDeclarationDate(new Date().toISOString().split('T')[0]);
                setDeclarationPlace('Ghaziabad');
            } else {
                // Load saved data for existing, complete profiles
                setName(currentUserProfile.name || '');
                setPhone(currentUserProfile.phone || '');
                setAddress(currentUserProfile.address || '');
                setSummary(currentUserProfile.summary || '');
                setSkills(currentUserProfile.skills || '');
                if (currentUserProfile.experiences && currentUserProfile.experiences.length > 0) {
                    setExperiences(currentUserProfile.experiences);
                } else {
                     setExperiences([{ id: Date.now(), role: '', company: '', duration: '', description: '' }]);
                }
                if (currentUserProfile.educations && currentUserProfile.educations.length > 0) {
                    setEducations(currentUserProfile.educations);
                } else {
                    setEducations([{ id: Date.now(), degree: '', university: '', duration: '' }]);
                }
                setFatherName(currentUserProfile.fatherName || '');
                setDob(currentUserProfile.dob || '');
                setNationality(currentUserProfile.nationality || 'Indian');
                setGender(currentUserProfile.gender || '');
                setMaritalStatus(currentUserProfile.maritalStatus || '');
                setLanguagesKnown(currentUserProfile.languagesKnown || '');
                setDeclarationDate(currentUserProfile.declarationDate || '');
                setDeclarationPlace(currentUserProfile.declarationPlace || '');
            }
        }
    }, [currentUserProfile]);
    
    // --- Experience Handlers ---
    const handleExperienceChange = (index: number, field: keyof Omit<Experience, 'id'>, value: string) => {
        const newExperiences = [...experiences];
        newExperiences[index][field] = value;
        setExperiences(newExperiences);
    };

    const addExperience = () => {
        setExperiences([...experiences, { id: Date.now(), role: '', company: '', duration: '', description: '' }]);
    };

    const removeExperience = (index: number) => {
        if (experiences.length > 1) {
            const newExperiences = experiences.filter((_, i) => i !== index);
            setExperiences(newExperiences);
        }
    };

    // --- Education Handlers ---
    const handleEducationChange = (index: number, field: keyof Omit<Education, 'id'>, value: string) => {
        const newEducations = [...educations];
        newEducations[index][field] = value;
        setEducations(newEducations);
    };

    const addEducation = () => {
        setEducations([...educations, { id: Date.now(), degree: '', university: '', duration: '' }]);
    };

    const removeEducation = (index: number) => {
        if (educations.length > 1) {
            const newEducations = educations.filter((_, i) => i !== index);
            setEducations(newEducations);
        }
    };


    const handleDownload = () => {
        if (!cvPreviewRef.current) return;
        setIsDownloading(true);
        const element = cvPreviewRef.current;
        const opt = {
            margin:       0.5,
            filename:     `${name.replace(' ', '_') || 'CV'}_CV.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        html2pdf().from(element).set(opt).save().then(() => setIsDownloading(false));
    };

    const handleSave = () => {
        // Basic fields check
        if (!name.trim() || !email.trim() || !phone.trim() || !address.trim() || !summary.trim() || !skills.trim() || 
            !fatherName.trim() || !dob.trim() || !gender.trim() || !maritalStatus.trim() || !languagesKnown.trim() ||
            !declarationDate.trim() || !declarationPlace.trim()
        ) {
            alert('Please fill out all mandatory fields before saving.');
            return;
        }
    
        // Experience check
        for (const exp of experiences) {
            if (!exp.role.trim() || !exp.company.trim() || !exp.duration.trim()) {
                alert('Please fill out all mandatory fields in the Work Experience section.');
                return;
            }
        }
    
        // Education check
        for (const edu of educations) {
            if (!edu.degree.trim() || !edu.university.trim() || !edu.duration.trim()) {
                alert('Please fill out all mandatory fields in the Education section.');
                return;
            }
        }
        
        onCvComplete({
            name,
            phone,
            address,
            summary,
            skills,
            experiences,
            educations,
            fatherName,
            dob,
            nationality,
            gender,
            maritalStatus,
            languagesKnown,
            declarationDate,
            declarationPlace,
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">CV Generator</h2>
                    <p className="text-gray-500 text-sm mt-1">Complete your CV to unlock the rest of the portal.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={handleSave}>Save CV & to Apply job</Button>
                    <Button variant="primary" onClick={handleDownload} loading={isDownloading}>Download as PDF</Button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6 h-fit">
                    <h3 className="text-lg font-semibold">Enter Your Details</h3>
                    <Input id="name" label="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                    <Input id="email" label="Email" value={email} onChange={e => setEmail(e.target.value)} required disabled />
                    <Input id="phone" label="Phone" value={phone} onChange={e => setPhone(e.target.value)} required />
                    <Input id="address" label="Address" value={address} onChange={e => setAddress(e.target.value)} required />
                    
                    <div className="pt-4 border-t">
                        <h4 className="text-md font-semibold mb-3">Personal Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input id="fatherName" label="Father’s Name" value={fatherName} onChange={e => setFatherName(e.target.value)} required />
                            <Input id="dob" label="Date of Birth" type="date" value={dob} onChange={e => setDob(e.target.value)} required />
                            <Input id="nationality" label="Nationality" value={nationality} onChange={e => setNationality(e.target.value)} required />
                            <div>
                                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                <select id="gender" value={gender} onChange={e => setGender(e.target.value as any)} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                                <select id="maritalStatus" value={maritalStatus} onChange={e => setMaritalStatus(e.target.value as any)} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                    <option value="">Select Status</option>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Divorced">Divorced</option>
                                    <option value="Widowed">Widowed</option>
                                </select>
                            </div>
                            <Input id="languagesKnown" label="Languages Known" value={languagesKnown} onChange={e => setLanguagesKnown(e.target.value)} placeholder="e.g. English, Hindi" required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Career Objective</label>
                        <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={3} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
                    </div>
                    <Input id="skills" label="Technical Qualifications (comma-separated)" value={skills} onChange={e => setSkills(e.target.value)} required />
                    
                    {/* Experience Section */}
                    <div className="space-y-4 pt-4 border-t">
                        <h4 className="text-md font-semibold">Work Experience</h4>
                        {experiences.map((exp, index) => (
                            <div key={exp.id} className="p-4 border rounded-lg bg-gray-50/50 space-y-3 relative">
                                <Input id={`exp-role-${index}`} wrapperClassName="mb-0" label="Role / Title" value={exp.role} onChange={e => handleExperienceChange(index, 'role', e.target.value)} required />
                                <Input id={`exp-company-${index}`} wrapperClassName="mb-0" label="Company" value={exp.company} onChange={e => handleExperienceChange(index, 'company', e.target.value)} required />
                                <Input id={`exp-duration-${index}`} wrapperClassName="mb-0" label="Duration (e.g., 1 Year)" value={exp.duration} onChange={e => handleExperienceChange(index, 'duration', e.target.value)} required />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea value={exp.description} onChange={e => handleExperienceChange(index, 'description', e.target.value)} rows={2} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Optional short description of duties" />
                                </div>
                                {experiences.length > 1 && (
                                    <button type="button" onClick={() => removeExperience(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-600 p-1 rounded-full bg-transparent hover:bg-red-50">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                )}
                            </div>
                        ))}
                        <Button type="button" variant="secondary" size="sm" onClick={addExperience}>+ Add Experience</Button>
                    </div>

                    {/* Education Section */}
                    <div className="space-y-4 pt-4 border-t">
                        <h4 className="text-md font-semibold">Educational Qualifications</h4>
                        {educations.map((edu, index) => (
                            <div key={edu.id} className="p-4 border rounded-lg bg-gray-50/50 space-y-3 relative">
                                <Input id={`edu-degree-${index}`} wrapperClassName="mb-0" label="Qualification" value={edu.degree} onChange={e => handleEducationChange(index, 'degree', e.target.value)} placeholder="e.g. High School" required />
                                <Input id={`edu-university-${index}`} wrapperClassName="mb-0" label="Board / University" value={edu.university} onChange={e => handleEducationChange(index, 'university', e.target.value)} placeholder="e.g. UP Board" required />
                                <Input id={`edu-duration-${index}`} wrapperClassName="mb-0" label="Status (e.g., Passed, Pursuing)" value={edu.duration} onChange={e => handleEducationChange(index, 'duration', e.target.value)} required />
                                {educations.length > 1 && (
                                    <button type="button" onClick={() => removeEducation(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-600 p-1 rounded-full bg-transparent hover:bg-red-50">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                )}
                            </div>
                        ))}
                        <Button type="button" variant="secondary" size="sm" onClick={addEducation}>+ Add Education</Button>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <h4 className="text-md font-semibold">Declaration</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border">
                            I hereby submit my resume as a step in exploring the possibilities of the employment with your esteem organization.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input id="declarationDate" label="Date" type="date" value={declarationDate} onChange={e => setDeclarationDate(e.target.value)} required />
                            <Input id="declarationPlace" label="Place" value={declarationPlace} onChange={e => setDeclarationPlace(e.target.value)} required />
                        </div>
                    </div>

                </div>
                
                {/* Preview Section */}
                <div className="bg-white rounded-xl border-gray-200 shadow-sm p-4">
                    <div ref={cvPreviewRef} className="border border-black p-8 font-serif bg-white text-black">
                        <h1 className="text-center font-bold text-lg underline underline-offset-4 tracking-widest mb-4">CURRICULUM-VITAE</h1>
                        
                        <div className="mb-2">
                           <h2 className="font-bold uppercase text-lg">{name}</h2>
                           <p className="text-sm"><strong>Add:</strong> {address}</p>
                           <p className="text-sm"><strong>Mob:</strong> {phone}</p>
                           <p className="text-sm"><strong>Email ID:</strong> {email}</p>
                        </div>

                        <div className="bg-gray-300 p-1 my-2">
                            <h3 className="font-bold uppercase text-sm">CAREER OBJECTIVE:</h3>
                        </div>
                        <ul className="list-disc list-inside text-sm pl-2">
                            <li>{summary}</li>
                        </ul>

                        <div className="bg-gray-300 p-1 my-2">
                            <h3 className="font-bold uppercase text-sm">EDUCATIONAL QUALIFICATIONS:</h3>
                        </div>
                        <ul className="list-disc list-inside text-sm pl-2">
                             {educations.map(edu => (
                                <li key={edu.id}>{edu.degree} {edu.duration} From {edu.university}</li>
                            ))}
                        </ul>
                        
                        <div className="bg-gray-300 p-1 my-2">
                            <h3 className="font-bold uppercase text-sm">EXPERIENCE:</h3>
                        </div>
                        <ul className="list-disc list-inside text-sm pl-2">
                            {experiences.map(exp => (
                                <li key={exp.id}>{exp.duration} Experience in {exp.company} as {exp.role}</li>
                            ))}
                        </ul>

                         <div className="bg-gray-300 p-1 my-2">
                            <h3 className="font-bold uppercase text-sm">TECHNICAL QUALIFICATION:</h3>
                        </div>
                        <ul className="list-disc list-inside text-sm pl-2">
                            {skills.split(',').map((skill, i) => (
                                <li key={i}>{skill.trim()}</li>
                            ))}
                        </ul>
                        
                        <div className="bg-gray-300 p-1 my-2">
                            <h3 className="font-bold uppercase text-sm">PERSONAL DETAILS:</h3>
                        </div>
                        <div className="grid grid-cols-[max-content_max-content_1fr] gap-x-4 text-sm mt-2">
                            <span>Father’s name</span> <span className="font-bold">-</span> <span>{fatherName}</span>
                            <span>Date of Birth</span> <span className="font-bold">-</span> <span>{dob}</span>
                            <span>Nationality</span> <span className="font-bold">-</span> <span>{nationality}</span>
                            <span>Gender</span> <span className="font-bold">-</span> <span>{gender}</span>
                            <span>Marital Status</span> <span className="font-bold">-</span> <span>{maritalStatus}</span>
                            <span>Language Known</span> <span className="font-bold">-</span> <span>{languagesKnown}</span>
                        </div>
                        
                        <div className="bg-gray-300 p-1 my-2">
                            <h3 className="font-bold uppercase text-sm">DECLARATION:</h3>
                        </div>
                        <p className="text-sm italic my-2">
                            I hereby submit my resume as a step in exploring the possibilities of the employment with your esteem organization.
                        </p>

                        <p className="text-sm mt-4"><strong>DATE:</strong> {declarationDate}</p>
                        <p className="text-sm"><strong>PLACE:</strong> {declarationPlace}</p>
                        
                        <div className="text-right mt-16 font-bold uppercase">
                            ({name})
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CVGeneratorView;