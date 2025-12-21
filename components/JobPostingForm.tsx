import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Job, PanelConfig } from '../types';
import Input from './Input';
import Button from './Button';
import { generateJobDescription } from '../services/geminiService';

interface JobPostingFormProps {
  onAddJob: (job: Omit<Job, 'id' | 'postedDate' | 'adminId'>) => void;
  isModalMode?: boolean;
  onClose?: () => void;
  vendors: any[];
  panelConfig: PanelConfig | null;
}

const JobPostingForm: React.FC<JobPostingFormProps> = ({ onAddJob, isModalMode = false, onClose, vendors, panelConfig }) => {
  // Existing state
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState(''); // This will store Partner Name
  const [experienceLevel, setExperienceLevel] = useState('Fresher');
  const [salaryRange, setSalaryRange] = useState('');
  const [numberOfOpenings, setNumberOfOpenings] = useState(1);
  const [companyLogoSrc, setCompanyLogoSrc] = useState('');
  const [description, setDescription] = useState('');
  
  // New state for added fields
  const [selectedPartner, setSelectedPartner] = useState('Direct');
  const [jobCategory, setJobCategory] = useState(''); // This stores Brand Name
  const [isManualBrand, setIsManualBrand] = useState(false);
  const [jobCity, setJobCity] = useState('');
  const [locality, setLocality] = useState('');
  const [minQualification, setMinQualification] = useState('12th Pass');
  const [genderPreference, setGenderPreference] = useState('Any');
  const [jobType, setJobType] = useState('Full-time');
  const [workLocationType, setWorkLocationType] = useState('In-office');
  const [workingDays, setWorkingDays] = useState('6 days');
  const [jobShift, setJobShift] = useState('Day Shift');
  const [interviewAddress, setInterviewAddress] = useState('');
  const [salaryType, setSalaryType] = useState('Fixed');
  const [incentive, setIncentive] = useState('');
  
  // New state for multiple roles and openings
  const [roleOpenings, setRoleOpenings] = useState<Record<string, number>>({});

  // UI state
  const [isLoadingGemini, setIsLoadingGemini] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [geminiError, setGeminiError] = useState('');
  
  const isDirectJob = selectedPartner === 'Direct';

  // Derived data
  const uniquePartners = useMemo(() => {
    const partners = vendors.map(v => v.partnerName).filter(Boolean);
    return Array.from(new Set(partners)) as string[];
  }, [vendors]);

  const brandsForPartner = useMemo(() => {
    if (isDirectJob) return [];
    return vendors.filter(v => v.partnerName === selectedPartner);
  }, [selectedPartner, vendors, isDirectJob]);

  const selectedVendorBrand = useMemo(() => {
    if (isDirectJob || isManualBrand || !jobCategory) return null;
    return vendors.find(v => v.partnerName === selectedPartner && v.brandName === jobCategory);
  }, [selectedPartner, jobCategory, vendors, isDirectJob, isManualBrand]);

  // Logic update: If manual brand, show ALL roles from panelConfig
  const availableRoles = useMemo(() => {
    if (isManualBrand) {
        return panelConfig?.jobRoles || [];
    }
    return selectedVendorBrand?.roles || [];
  }, [selectedVendorBrand, isManualBrand, panelConfig]);

  const availableLocations = useMemo(() => selectedVendorBrand?.locations || panelConfig?.locations || [], [selectedVendorBrand, panelConfig]);
  const availableStores = useMemo(() => {
      if (!jobCity || !panelConfig?.stores) return [];
      return panelConfig.stores.filter(s => s.location === jobCity);
  }, [jobCity, panelConfig]);

  const handlePartnerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const partner = e.target.value;
    setSelectedPartner(partner);
    setJobCategory(''); // Reset brand
    setIsManualBrand(false);
    setCompany(partner === 'Direct' ? '' : partner);
    setRoleOpenings({});
    setNumberOfOpenings(partner === 'Direct' ? 1 : 0);
    setJobCity('');
    setLocality('');
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brand = e.target.value;
    if (brand === 'ADD_NEW') {
        setIsManualBrand(true);
        setJobCategory('');
        
        // Initialize with all roles from config
        const initialOpenings = (panelConfig?.jobRoles || []).reduce((acc: Record<string, number>, role: string) => {
            acc[role] = 0;
            return acc;
        }, {});
        setRoleOpenings(initialOpenings);
        setNumberOfOpenings(0);
        return;
    }

    setJobCategory(brand);
    setIsManualBrand(false);
    
    const vendorMatch = vendors.find(v => v.partnerName === selectedPartner && v.brandName === brand);
    if (vendorMatch) {
        const initialOpenings = (vendorMatch.roles || []).reduce((acc: Record<string, number>, role: string) => {
            acc[role] = 0;
            return acc;
        }, {});
        setRoleOpenings(initialOpenings);
    } else {
        setRoleOpenings({});
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newCity = e.target.value;
    setJobCity(newCity);
    setLocality(''); // Reset store when city changes
  };

  const handleRoleOpeningChange = (role: string, value: string) => {
    const count = parseInt(value, 10) || 0;
    const newRoleOpenings = { ...roleOpenings, [role]: count < 0 ? 0 : count };
    setRoleOpenings(newRoleOpenings);
  };

  useEffect(() => {
    if (!isDirectJob) {
        const totalOpenings = Object.values(roleOpenings).reduce((sum: number, currentCount) => sum + Number(currentCount), 0);
        setNumberOfOpenings(totalOpenings);
    }
  }, [roleOpenings, isDirectJob]);

  const handleGenerateDescription = useCallback(async () => {
    const finalTitle = isDirectJob ? title : Object.keys(roleOpenings).filter(role => roleOpenings[role] > 0).join(', ');

    if (!finalTitle) {
      setGeminiError('Please enter a job title or select roles to generate a description.');
      return;
    }
    setIsLoadingGemini(true);
    setGeminiError('');
    try {
      const keywords = `${finalTitle}, ${company}${jobCategory ? ` (${jobCategory})` : ''}, ${jobCity}, ${locality}, ${experienceLevel}`;
      const generatedDesc = await generateJobDescription(keywords);
      setDescription(generatedDesc);
    } catch (error) {
      console.error('Error generating description:', error);
      setGeminiError('Failed to generate description. Please try again or write it manually.');
    } finally {
      setIsLoadingGemini(false);
    }
  }, [title, roleOpenings, isDirectJob, company, jobCategory, jobCity, locality, experienceLevel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const finalTitle = isDirectJob ? title : Object.entries(roleOpenings).filter(([, count]) => Number(count) > 0).map(([role]) => role).join(', ');

    if (!finalTitle || !company || !jobCity || !locality || !experienceLevel || !salaryRange || !description || numberOfOpenings <= 0 || !interviewAddress) {
      alert('Please fill in all required fields, and ensure at least one role has openings.');
      setIsSubmitting(false);
      return;
    }
    
    onAddJob({ 
      title: finalTitle, 
      company, // Partner Name
      storeName: locality,
      experienceLevel, 
      salaryRange, 
      numberOfOpenings, 
      companyLogoSrc: companyLogoSrc || undefined,
      description,
      jobCategory: isDirectJob ? 'General' : jobCategory, // Brand Name
      jobCity,
      locality,
      minQualification,
      genderPreference,
      jobType,
      workLocationType,
      workingDays,
      jobShift,
      interviewAddress,
      salaryType,
      incentive: salaryType === 'Fixed + Incentive' ? incentive : undefined,
    });

    // Clear form
    setTitle(''); setCompany(''); setExperienceLevel('Fresher'); setSalaryRange('');
    setNumberOfOpenings(1); setCompanyLogoSrc(''); setDescription(''); setSelectedPartner('Direct');
    setJobCategory(''); setIsManualBrand(false); setJobCity(''); setLocality(''); 
    setMinQualification('12th Pass'); setGenderPreference('Any');
    setJobType('Full-time'); setWorkLocationType('In-office'); setWorkingDays('6 days');
    setJobShift('Day Shift'); setInterviewAddress(''); setSalaryType('Fixed');
    setIncentive(''); setRoleOpenings({});
    setIsSubmitting(false);
  };
  
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => { if (typeof reader.result === 'string') { setCompanyLogoSrc(reader.result); } };
      reader.readAsDataURL(file);
    } else {
        setCompanyLogoSrc('');
    }
  };

  const containerClasses = isModalMode ? "" : "bg-white p-6 rounded-lg shadow-md";
  const selectStyles = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white";

  return (
    <div className={containerClasses}>
      {!isModalMode && <h2 className="text-3xl font-bold text-gray-800 mb-6">Post New Job</h2>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* STEP 1: SELECT PARTNER */}
          <div>
            <label htmlFor="selectedPartner" className="block text-sm font-medium text-gray-700 mb-1">Partner / Vendor</label>
            <select id="selectedPartner" className={selectStyles} value={selectedPartner} onChange={handlePartnerChange} required>
              <option value="Direct">Direct Posting (Internal)</option>
              {uniquePartners.map(p => ( <option key={p} value={p}>{p}</option> ))}
            </select>
          </div>

          {/* STEP 2: SELECT BRAND (Filtered by Partner) */}
          {!isDirectJob && (
            <div>
              <label htmlFor="jobCategory" className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
              {isManualBrand ? (
                  <div className="relative">
                      <Input 
                        id="jobCategoryManual" 
                        value={jobCategory} 
                        onChange={(e) => setJobCategory(e.target.value)} 
                        placeholder="Type Brand Name (e.g. Zepto)" 
                        wrapperClassName="mb-0" 
                        required 
                      />
                      <button 
                        type="button" 
                        onClick={() => { setIsManualBrand(false); setJobCategory(''); }} 
                        className="absolute right-0 -top-6 text-[10px] uppercase font-bold text-blue-600 hover:underline"
                      >
                        Select from list
                      </button>
                  </div>
              ) : (
                  <select id="jobCategory" className={selectStyles} value={jobCategory} onChange={handleBrandChange} required>
                    <option value="">Select a brand</option>
                    {brandsForPartner.map(b => ( <option key={b.id} value={b.brandName}>{b.brandName}</option> ))}
                    <option value="ADD_NEW" className="font-bold text-blue-600">+ Add New Brand Name</option>
                  </select>
              )}
            </div>
          )}

          {/* STEP 3: SELECT ROLES (Filtered by Brand OR All Roles for Manual Brand) */}
          {!isDirectJob && (jobCategory || isManualBrand) ? (
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isManualBrand ? 'Select Roles & Openings for New Brand' : `Roles & Openings for ${jobCategory}`}
                </label>
                <div className="p-4 border border-gray-300 rounded-md space-y-3 bg-gray-50 max-h-60 overflow-y-auto">
                    {availableRoles.length > 0 ? availableRoles.map(role => (
                        <div key={role} className="flex items-center justify-between">
                            <label htmlFor={`role-${role}`} className="text-sm font-medium text-gray-800">{role}</label>
                            <Input id={`role-${role}`} type="number" min="0" value={roleOpenings[role] || '0'} onChange={(e) => handleRoleOpeningChange(role, e.target.value)} className="w-24 py-1 text-center" wrapperClassName="mb-0" />
                        </div>
                    )) : <p className="text-sm text-gray-500 italic text-center py-2">No roles available. Please configure roles in Panel Settings.</p>}
                </div>
            </div>
          ) : isDirectJob ? (
            <Input id="jobTitle" label="Job Title / Role" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Graphic Designer" />
          ) : null}

          {isDirectJob && (
            <Input id="company" label="Company Name" type="text" value={company} onChange={(e) => setCompany(e.target.value)} required placeholder="e.g. RKM Enterprise" />
          )}
          
          <div>
              <label htmlFor="jobCity" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select id="jobCity" name="jobCity" className={selectStyles} value={jobCity} onChange={handleCityChange} required disabled={!isDirectJob && !jobCategory && !isManualBrand}>
                <option value="">Select a location</option>
                {availableLocations.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>

          <div>
              <label htmlFor="locality" className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
              <select id="locality" name="locality" className={selectStyles} value={locality} onChange={(e) => setLocality(e.target.value)} required disabled={!jobCity}>
                <option value="">{jobCity ? 'Select a store' : 'Select a location first'}</option>
                {availableStores.map(store => <option key={store.id} value={store.name}>{store.name}</option>)}
              </select>
            </div>
          
          <div>
            <label htmlFor="minQualification" className="block text-sm font-medium text-gray-700 mb-1">Minimum Qualification</label>
            <select id="minQualification" className={selectStyles} value={minQualification} onChange={(e) => setMinQualification(e.target.value)} required>
              <option>10th Pass</option> <option>12th Pass</option> <option>Graduate</option> <option>Post Graduate</option>
            </select>
          </div>
          <div>
            <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
            <select id="experienceLevel" className={selectStyles} value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} required>
              <option>Fresher</option> <option>1-3 Years</option> <option>3-5 Years</option> <option>5+ Years</option>
            </select>
          </div>

          <div>
            <label htmlFor="genderPreference" className="block text-sm font-medium text-gray-700 mb-1">Gender Preference</label>
            <select id="genderPreference" className={selectStyles} value={genderPreference} onChange={(e) => setGenderPreference(e.target.value)} required>
              <option>Any</option> <option>Male</option> <option>Female</option>
            </select>
          </div>
          <div>
            <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
            <select id="jobType" className={selectStyles} value={jobType} onChange={(e) => setJobType(e.target.value)} required>
              <option>Full-time</option> <option>Part-time</option> <option>Contract</option>
            </select>
          </div>

          <div>
            <label htmlFor="workLocationType" className="block text-sm font-medium text-gray-700 mb-1">Work Location Type</label>
            <select id="workLocationType" className={selectStyles} value={workLocationType} onChange={(e) => setWorkLocationType(e.target.value)} required>
              <option>In-office</option> <option>Work from Home</option> <option>Hybrid</option>
            </select>
          </div>
          <div>
            <label htmlFor="workingDays" className="block text-sm font-medium text-gray-700 mb-1">Working Days</label>
            <select id="workingDays" className={selectStyles} value={workingDays} onChange={(e) => setWorkingDays(e.target.value)} required>
              <option>5 days</option> <option>6 days</option>
            </select>
          </div>

          <div>
            <label htmlFor="jobShift" className="block text-sm font-medium text-gray-700 mb-1">Job Shift</label>
            <select id="jobShift" className={selectStyles} value={jobShift} onChange={(e) => setJobShift(e.target.value)} required>
              <option>Day Shift</option> <option>Night Shift</option> <option>Rotational</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="salaryType" className="block text-sm font-medium text-gray-700 mb-1">Salary Type</label>
            <select id="salaryType" className={selectStyles} value={salaryType} onChange={(e) => setSalaryType(e.target.value)} required>
              <option>Fixed</option> <option>Fixed + Incentive</option>
            </select>
          </div>
          
          <Input id="salaryRange" label="Fixed Salary" type="text" value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} placeholder="e.g., ₹ 15,000 - 18,000 per month" required />
          
          {salaryType === 'Fixed + Incentive' && (
            <Input id="incentive" label="Incentive" type="text" value={incentive} onChange={(e) => setIncentive(e.target.value)} placeholder="e.g., Performance based" />
          )}

          <Input id="numberOfOpenings" label="Total Job Openings" type="number" value={numberOfOpenings} onChange={(e) => setNumberOfOpenings(parseInt(e.target.value, 10) || 1)} min="1" required disabled={!isDirectJob} />
          
          <div>
            <label htmlFor="companyLogoSrc" className="block text-sm font-medium text-gray-700 mb-1">Company Logo (Optional)</label>
            <div className="flex items-center gap-4">
              {companyLogoSrc && <img src={companyLogoSrc} alt="Preview" className="h-10 w-10 rounded-md object-contain border p-1"/>}
              <input id="companyLogoSrc" type="file" accept="image/*" onChange={handleLogoChange} className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none" />
            </div>
          </div>
        </div>

        <div>
            <label htmlFor="interviewAddress" className="block text-sm font-medium text-gray-700 mb-1">Interview Address</label>
            <textarea id="interviewAddress" rows={3} className={selectStyles} value={interviewAddress} onChange={(e) => setInterviewAddress(e.target.value)} placeholder="Full address for walk-in interviews" required></textarea>
        </div>
        
        <div>
          <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
          <textarea id="jobDescription" rows={6} className={selectStyles} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter job description or use AI to generate one..." required></textarea>
        </div>

        {geminiError && <p className="text-red-500 text-sm">{geminiError}</p>}
        
        <div className="flex justify-end gap-3 pt-4">
          {onClose && <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>}
          <Button type="button" variant="secondary" onClick={handleGenerateDescription} loading={isLoadingGemini} disabled={(!isDirectJob && !isManualBrand ? numberOfOpenings === 0 : (isDirectJob ? !title : numberOfOpenings === 0)) || isLoadingGemini}>
            Generate with AI
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting} disabled={isLoadingGemini}>
            Post Job
          </Button>
        </div>
      </form>
    </div>
  );
};

export default JobPostingForm;