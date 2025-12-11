import React, { useState, useRef, ChangeEvent } from 'react';
import Button from '../Button';
import Input from '../Input';
import Modal from '../Modal';
import { FamilyMember } from '../../types';

interface Document {
  id: string;
  name: string;
  status: 'Not Uploaded' | 'Uploaded' | 'Verified';
  fileName: string | null;
}

type OnboardingStatus = 'Pending Submission' | 'Pending Verification' | 'Onboarding Complete';

const OnboardingTracker: React.FC<{ status: OnboardingStatus }> = ({ status }) => {
    const steps = ['Submit Documents', 'HR Verification', 'Onboarding Complete'];
    const currentStepIndex = status === 'Pending Submission' ? 0 : status === 'Pending Verification' ? 1 : 2;

    return (
        <div className="w-full">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isActive = index === currentStepIndex;
                    return (
                        <React.Fragment key={step}>
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted ? 'bg-green-500 border-green-500 text-white' : isActive ? 'bg-blue-500 border-blue-500 text-white' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>
                                    {isCompleted ? '✓' : index + 1}
                                </div>
                                <p className={`mt-2 text-xs font-semibold ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>{step}</p>
                            </div>
                            {index < steps.length - 1 && <div className={`flex-1 h-1 mx-2 transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}></div>}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};


const MyDocumentsView: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([
    { id: 'resume', name: 'Resume / CV', status: 'Not Uploaded', fileName: null },
    { id: 'photo', name: 'Passport-size photo', status: 'Not Uploaded', fileName: null },
    { id: 'aadhaar', name: 'Aadhar Card Copy', status: 'Not Uploaded', fileName: null },
    { id: 'pan', name: 'PAN Card Copy', status: 'Not Uploaded', fileName: null },
    { id: 'bank', name: 'Bank Account Details (Copy of Passbook)', status: 'Not Uploaded', fileName: null },
    { id: 'familyPhoto', name: 'Combined Family Photo (for ESIC Card)', status: 'Not Uploaded', fileName: null },
  ]);

  // Onboarding State
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>('Pending Submission');
  const [esiCardFileName, setEsiCardFileName] = useState<string | null>(null);

  const [maritalStatus, setMaritalStatus] = useState<'Single' | 'Married' | 'Divorced' | 'Widowed' | ''>('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [uan, setUan] = useState('');
  const [esi, setEsi] = useState('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  
  const [memberFormData, setMemberFormData] = useState({ 
      name: '', relation: '', dob: '', aadharFileName: null as string | null, photoFileName: null as string | null 
  });
  const [memberAadharFile, setMemberAadharFile] = useState<File | null>(null);
  const [memberPhotoFile, setMemberPhotoFile] = useState<File | null>(null);

  const fileInputRefs = {
    resume: useRef<HTMLInputElement>(null),
    photo: useRef<HTMLInputElement>(null),
    aadhaar: useRef<HTMLInputElement>(null),
    pan: useRef<HTMLInputElement>(null),
    bank: useRef<HTMLInputElement>(null),
    familyPhoto: useRef<HTMLInputElement>(null),
  };
  
  const isSubmitted = onboardingStatus !== 'Pending Submission';

  const handleFileChange = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDocuments(docs => docs.map(doc => doc.id === id ? { ...doc, status: 'Uploaded', fileName: file.name } : doc));
    }
  };

  const triggerFileInput = (id: keyof typeof fileInputRefs) => {
    fileInputRefs[id].current?.click();
  };
  
  const getStatusClasses = (status: Document['status']) => {
    switch(status) {
      case 'Verified': return 'bg-green-100 text-green-800';
      case 'Uploaded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleOpenModal = (member: FamilyMember | null) => {
    setEditingMember(member);
    setMemberFormData(member ? { ...member } : { name: '', relation: '', dob: '', aadharFileName: null, photoFileName: null });
    setMemberAadharFile(null);
    setMemberPhotoFile(null);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
  };
  
  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData = {
        ...memberFormData,
        aadharFileName: memberAadharFile ? memberAadharFile.name : memberFormData.aadharFileName,
        photoFileName: memberPhotoFile ? memberPhotoFile.name : memberFormData.photoFileName,
    };

    if (editingMember) {
        setFamilyMembers(members => members.map(m => m.id === editingMember.id ? { ...editingMember, ...updatedData } : m));
    } else {
        const newMember: FamilyMember = { id: Date.now().toString(), ...updatedData };
        setFamilyMembers(members => [...members, newMember]);
    }
    handleCloseModal();
  };
  
  const handleDeleteMember = (id: string) => {
      setFamilyMembers(members => members.filter(m => m.id !== id));
  };

  const handleMemberFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setMemberFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleMemberFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const { name, files } = e.target;
      if (files && files[0]) {
          if (name === 'aadharFile') setMemberAadharFile(files[0]);
          if (name === 'photoFile') setMemberPhotoFile(files[0]);
      }
  };

  const handleSubmitForVerification = () => {
    // In a real app, this would save all data and submit to the backend.
    setOnboardingStatus('Pending Verification');
    alert('Documents submitted for verification!');
  };

  // This is a temporary function for demonstration purposes to simulate HR approval.
  const handleSimulateHrApproval = () => {
    setOnboardingStatus('Onboarding Complete');
    setEsiCardFileName('ESI_Card_John_Doe.pdf');
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">My Documents & Details</h2>
        <p className="text-gray-600 mt-1">Please provide all necessary documents and information to complete your employee profile.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Onboarding Status</h3>
        <OnboardingTracker status={onboardingStatus} />
        {onboardingStatus === 'Pending Verification' && <p className="text-center text-sm text-yellow-700 bg-yellow-50 p-3 mt-4 rounded-lg">Your documents are under review by HR. You cannot make changes at this time.</p>}
        {onboardingStatus === 'Onboarding Complete' && <p className="text-center text-sm text-green-700 bg-green-50 p-3 mt-4 rounded-lg">Congratulations! Your onboarding is complete.</p>}
      </div>
      
      {/* Personal Information */}
      <fieldset className="bg-white rounded-xl border border-gray-200 shadow-sm p-6" disabled={isSubmitted}>
        <legend className="text-lg font-semibold text-gray-800 px-2">Personal Information</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
                <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                <select id="maritalStatus" value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value as any)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100">
                    <option value="">-- Select --</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                </select>
            </div>
            <Input id="mobileNumber" label="Mobile Number (Linked with Aadhar)" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="Enter your 10-digit mobile number" disabled={isSubmitted} />
        </div>
      </fieldset>

      {/* Statutory & Payroll Information */}
      <fieldset className="bg-white rounded-xl border border-gray-200 shadow-sm p-6" disabled={isSubmitted}>
        <legend className="text-lg font-semibold text-gray-800 px-2">Statutory & Payroll Information</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <Input id="uan" label="PF UAN Number (if previously generated)" value={uan} onChange={(e) => setUan(e.target.value)} placeholder="Enter your UAN" disabled={isSubmitted} />
            <Input id="esi" label="ESIC Insurance Number (if previously generated)" value={esi} onChange={(e) => setEsi(e.target.value)} placeholder="Enter your ESI Number" disabled={isSubmitted} />
        </div>
      </fieldset>
      
      {/* Your Documents */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <h3 className="px-6 py-4 text-lg font-semibold text-gray-800 border-b">Your Documents</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map(doc => (
                <tr key={doc.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">{doc.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{doc.fileName || 'No file selected'}</td>
                  <td className="px-6 py-4 text-right">
                    <input type="file" ref={fileInputRefs[doc.id as keyof typeof fileInputRefs]} className="hidden" onChange={(e) => handleFileChange(doc.id, e)} disabled={isSubmitted} />
                    <Button variant="primary" size="sm" onClick={() => triggerFileInput(doc.id as keyof typeof fileInputRefs)} disabled={isSubmitted}>
                      {doc.status === 'Not Uploaded' ? 'Upload' : 'Re-upload'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* ESI Card Download Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <h3 className="px-6 py-4 text-lg font-semibold text-gray-800 border-b">ESI Card</h3>
        {onboardingStatus === 'Onboarding Complete' && esiCardFileName ? (
            <div className="p-6 flex justify-between items-center">
                <div>
                    <p className="font-medium text-gray-900">Your ESI Card is ready.</p>
                    <p className="text-sm text-gray-500">{esiCardFileName}</p>
                </div>
                <Button variant="primary" onClick={() => alert(`Downloading ${esiCardFileName}...`)}>
                    Download
                </Button>
            </div>
        ) : (
            <div className="p-6 text-center text-gray-500">
                <p>Your ESI card will be available here for download once your onboarding is marked as complete by HR.</p>
            </div>
        )}
      </div>

      {/* Family Details */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Family Details</h3>
            <Button variant="primary" size="sm" onClick={() => handleOpenModal(null)} disabled={isSubmitted}>+ Add Member</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name / Relation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date of Birth</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aadhar Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Photo Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
            </thead>
             <tbody className="bg-white divide-y divide-gray-200">
                {familyMembers.length > 0 ? familyMembers.map(member => (
                    <tr key={member.id}>
                        <td className="px-6 py-4"><div className="font-medium text-gray-900">{member.name}</div><div className="text-sm text-gray-500">{member.relation}</div></td>
                        <td className="px-6 py-4 text-sm text-gray-600">{member.dob}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{member.aadharFileName || 'Not Uploaded'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{member.photoFileName || 'Not Uploaded'}</td>
                        <td className="px-6 py-4 text-right text-sm space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(member)} disabled={isSubmitted}>Edit</Button>
                            <Button variant="danger" size="sm" onClick={() => handleDeleteMember(member.id)} disabled={isSubmitted}>Remove</Button>
                        </td>
                    </tr>
                )) : (
                    <tr><td colSpan={5} className="text-center py-10 text-gray-500">No family members added yet.</td></tr>
                )}
             </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        {/* TEMPORARY BUTTON FOR DEMO */}
        <Button variant="secondary" onClick={handleSimulateHrApproval}>
            Simulate HR Approval (Dev)
        </Button>
        <Button 
          variant="primary" 
          size="lg" 
          onClick={handleSubmitForVerification}
          disabled={isSubmitted}
        >
          {onboardingStatus === 'Pending Submission' ? 'Save & Submit for Verification' : onboardingStatus === 'Pending Verification' ? 'Submitted' : 'Verified'}
        </Button>
      </div>

      {/* Modal for Family Member Form */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingMember ? 'Edit Family Member' : 'Add Family Member'}>
        <form onSubmit={handleSaveMember} className="space-y-4">
            <Input id="name" name="name" label="Full Name" value={memberFormData.name} onChange={handleMemberFormChange} required />
            <Input id="relation" name="relation" label="Relation" value={memberFormData.relation} onChange={handleMemberFormChange} placeholder="e.g., Father, Spouse" required />
            <Input id="dob" name="dob" label="Date of Birth" type="date" value={memberFormData.dob} onChange={handleMemberFormChange} required />
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Card Copy</label>
                <input type="file" name="aadharFile" onChange={handleMemberFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                {memberFormData.aadharFileName && <span className="text-xs text-gray-500">Current file: {memberFormData.aadharFileName}</span>}
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passport Size Photo</label>
                <input type="file" name="photoFile" onChange={handleMemberFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                {memberFormData.photoFileName && <span className="text-xs text-gray-500">Current file: {memberFormData.photoFileName}</span>}
             </div>
             <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                <Button type="submit" variant="primary">Save Member</Button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyDocumentsView;