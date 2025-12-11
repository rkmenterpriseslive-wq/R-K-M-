import React, { useState, useRef } from 'react';
import Button from '../Button';
import Input from '../Input';

declare const html2pdf: any;

interface Experience { id: number; role: string; company: string; duration: string; description: string; }
interface Education { id: number; degree: string; university: string; duration: string; }

const CVGeneratorView: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [summary, setSummary] = useState('');
    const [skills, setSkills] = useState('');
    const [experiences, setExperiences] = useState<Experience[]>([
        { id: 1, role: '', company: '', duration: '', description: '' },
    ]);
    const [educations, setEducations] = useState<Education[]>([
        { id: 1, degree: '', university: '', duration: '' },
    ]);
    const cvPreviewRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-3xl font-bold text-gray-800">CV Generator</h2>
                <Button variant="primary" onClick={handleDownload} loading={isDownloading}>Download as PDF</Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6 h-fit">
                    <h3 className="text-lg font-semibold">Enter Your Details</h3>
                    <Input id="name" label="Full Name" value={name} onChange={e => setName(e.target.value)} />
                    <Input id="email" label="Email" value={email} onChange={e => setEmail(e.target.value)} />
                    <Input id="phone" label="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
                    <Input id="address" label="Address" value={address} onChange={e => setAddress(e.target.value)} />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
                        <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={3} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <Input id="skills" label="Skills (comma-separated)" value={skills} onChange={e => setSkills(e.target.value)} />
                    {/* Experience & Education would have "Add More" functionality in a real app */}
                </div>
                
                {/* Preview Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div ref={cvPreviewRef} className="p-8 font-serif text-sm">
                        <header className="text-center pb-4 border-b">
                            <h1 className="text-3xl font-bold tracking-wider">{name}</h1>
                            <p className="text-xs text-gray-600 mt-2">{email} | {phone} | {address}</p>
                        </header>
                        <section className="mt-6">
                            <h2 className="text-lg font-bold border-b pb-1">Summary</h2>
                            <p className="mt-2 text-gray-700">{summary}</p>
                        </section>
                        <section className="mt-6">
                            <h2 className="text-lg font-bold border-b pb-1">Skills</h2>
                            <p className="mt-2 text-gray-700">{skills}</p>
                        </section>
                        <section className="mt-6">
                            <h2 className="text-lg font-bold border-b pb-1">Experience</h2>
                            {experiences.map(exp => (
                                <div key={exp.id} className="mt-3">
                                    <div className="flex justify-between">
                                        <h3 className="font-semibold">{exp.role}</h3>
                                        <p className="text-xs font-medium text-gray-600">{exp.duration}</p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">{exp.company}</p>
                                    <p className="text-xs text-gray-600 mt-1">{exp.description}</p>
                                </div>
                            ))}
                        </section>
                        <section className="mt-6">
                            <h2 className="text-lg font-bold border-b pb-1">Education</h2>
                             {educations.map(edu => (
                                <div key={edu.id} className="mt-3">
                                    <div className="flex justify-between">
                                        <h3 className="font-semibold">{edu.degree}</h3>
                                        <p className="text-xs font-medium text-gray-600">{edu.duration}</p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">{edu.university}</p>
                                </div>
                            ))}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CVGeneratorView;