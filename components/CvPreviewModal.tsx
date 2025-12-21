
import React from 'react';
import Modal from './Modal';
import { UserProfile } from '../types';
import Button from './Button';

interface CvPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
}

const CvPreviewModal: React.FC<CvPreviewModalProps> = ({ isOpen, onClose, profile }) => {
  if (!profile) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Candidate Professional CV" maxWidth="max-w-4xl">
      <div className="border border-gray-300 p-8 font-serif bg-white text-black shadow-inner max-h-[70vh] overflow-y-auto print:max-h-none print:p-0 print:border-none print:shadow-none">
        <h1 className="text-center font-bold text-xl underline underline-offset-4 tracking-widest mb-6">CURRICULUM-VITAE</h1>
        
        <div className="mb-4">
           <h2 className="font-bold uppercase text-xl">{profile.name}</h2>
           <p className="text-sm"><strong>Add:</strong> {profile.address || 'N/A'}</p>
           <p className="text-sm"><strong>Mob:</strong> {profile.phone || 'N/A'}</p>
           <p className="text-sm"><strong>Email ID:</strong> {profile.email || 'N/A'}</p>
        </div>

        <div className="bg-gray-200 p-1.5 my-3">
            <h3 className="font-bold uppercase text-sm">CAREER OBJECTIVE:</h3>
        </div>
        <p className="text-sm pl-2">{profile.summary || 'To apply my knowledge I gained my academies & corporate sector and put them in practice in corporate world.'}</p>

        <div className="bg-gray-200 p-1.5 my-3">
            <h3 className="font-bold uppercase text-sm">EDUCATIONAL QUALIFICATIONS:</h3>
        </div>
        <ul className="list-disc list-inside text-sm pl-2 space-y-1">
             {profile.educations?.map((edu, idx) => (
                <li key={idx}>{edu.degree} {edu.duration} From {edu.university}</li>
            )) || <li>Details not provided</li>}
        </ul>
        
        <div className="bg-gray-200 p-1.5 my-3">
            <h3 className="font-bold uppercase text-sm">EXPERIENCE:</h3>
        </div>
        <ul className="list-disc list-inside text-sm pl-2 space-y-1">
            {profile.experiences?.map((exp, idx) => (
                <li key={idx}>{exp.duration} Experience in {exp.company} as {exp.role}</li>
            )) || <li>Fresher / Details not provided</li>}
        </ul>

         <div className="bg-gray-200 p-1.5 my-3">
            <h3 className="font-bold uppercase text-sm">TECHNICAL QUALIFICATION:</h3>
        </div>
        <p className="text-sm pl-2">{profile.skills || 'Basic knowledge'}</p>
        
        <div className="bg-gray-200 p-1.5 my-3">
            <h3 className="font-bold uppercase text-sm">PERSONAL DETAILS:</h3>
        </div>
        <div className="grid grid-cols-[max-content_max-content_1fr] gap-x-4 text-sm mt-2">
            <span>Father’s name</span> <span className="font-bold">-</span> <span>{profile.fatherName || 'N/A'}</span>
            <span>Date of Birth</span> <span className="font-bold">-</span> <span>{profile.dob || 'N/A'}</span>
            <span>Nationality</span> <span className="font-bold">-</span> <span>{profile.nationality || 'Indian'}</span>
            <span>Gender</span> <span className="font-bold">-</span> <span>{profile.gender || 'N/A'}</span>
            <span>Marital Status</span> <span className="font-bold">-</span> <span>{profile.maritalStatus || 'N/A'}</span>
            <span>Language Known</span> <span className="font-bold">-</span> <span>{profile.languagesKnown || 'N/A'}</span>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-100 flex justify-between items-end">
            <div>
                <p className="text-sm"><strong>DATE:</strong> {profile.declarationDate || new Date().toLocaleDateString()}</p>
                <p className="text-sm"><strong>PLACE:</strong> {profile.declarationPlace || 'India'}</p>
            </div>
            <div className="text-right font-bold uppercase border-t border-black pt-2 min-w-[150px]">
                ({profile.name})
            </div>
        </div>
      </div>
      <div className="flex justify-end mt-6 gap-3 no-print">
        <Button variant="secondary" onClick={onClose}>Close</Button>
        <Button variant="primary" onClick={() => window.print()}>Print CV</Button>
      </div>
    </Modal>
  );
};

export default CvPreviewModal;
