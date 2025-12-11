


import React, { useState, useCallback, useEffect } from 'react';
import { Job } from '../types';
import Input from './Input';
import Button from './Button';
import { generateJobDescription } from '../services/geminiService';

interface JobPostingFormProps {
  onAddJob: (job: Omit<Job, 'id' | 'postedDate' | 'adminId'>) => void;
  isModalMode?: boolean;
  onClose?: () => void;
}

// Data for populating fields based on vendor selection
type VendorData = {
  [key: string]: {
    roles: string[];
    cities: string[];
    localities: {
      [key: string]: string[];
    };
  };
};

const VENDOR_DATA: VendorData = {
  'Vendor A': {
    roles: ['Picker', 'Packer', 'Sales Executive'],
    cities: ['Delhi', 'Noida'],
    localities: {
      'Delhi': ['Okhla', 'Connaught Place', 'Saket'],
      'Noida': ['Sector 62', 'Sector 18', 'Greater Noida']
    }
  },
  'Vendor B': {
    roles: ['Team Leader', 'Store Manager', 'Delivery Associate'],
    cities: ['Gurgaon', 'Faridabad'],
    localities: {
      'Gurgaon': ['Cyber Hub', 'MG Road', 'Sohna Road'],
      'Faridabad': ['Sector 15', 'NIT', 'Ballabgarh']
    }
  }
};

const JobPostingForm: React.FC<JobPostingFormProps> = ({ onAddJob, isModalMode = false, onClose }) => {
  // Existing state
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [storeName, setStoreName] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Fresher');
  const [salaryRange, setSalaryRange] = useState('');
  const [numberOfOpenings, setNumberOfOpenings] = useState(1);
  const [companyLogoSrc, setCompanyLogoSrc] = useState('');
  const [description, setDescription] = useState('');
  
  // New state for added fields
  const [jobCategory, setJobCategory] = useState('Direct');
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
  
  const handleJobCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setJobCategory(newCategory);
    // Reset dependent fields when vendor changes
    setTitle('');
    setJobCity('');
    setLocality('');

    if (newCategory !== 'Direct' && VENDOR_DATA[newCategory]) {
        const initialOpenings = VENDOR_DATA[newCategory].roles.reduce((acc, role) => {
            acc[role] = 0;
            return acc;
        }, {} as Record<string, number>);
        setRoleOpenings(initialOpenings);
        setNumberOfOpenings(0);
    } else {
        setRoleOpenings({});
        setNumberOfOpenings(1);
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newCity = e.target.value;
    setJobCity(newCity);
    // When city changes, reset locality
    setLocality('');
  };

  const handleRoleOpeningChange = (role: string, value: string) => {
    const count = parseInt(value, 10) || 0;
    const newRoleOpenings = {
        ...roleOpenings,
        [role]: count < 0 ? 0 : count,
    };
    setRoleOpenings(newRoleOpenings);
  };

  useEffect(() => {
    if (jobCategory !== 'Direct' && VENDOR_DATA[jobCategory]) {
        // Fix: Explicitly type accumulator `sum` as `number` to prevent type inference issues.
        const totalOpenings = Object.values(roleOpenings).reduce((sum: number, currentCount) => sum + Number(currentCount), 0);
        setNumberOfOpenings(totalOpenings);
    }
  }, [roleOpenings, jobCategory]);

  const handleGenerateDescription = useCallback(async () => {
    // FIX: VENDOR_DATA[jobCategory] returns an object which is not assignable to a boolean. Coercing to boolean with '!!'.
    const isVendorJob = jobCategory !== 'Direct' && !!VENDOR_DATA[jobCategory];
    const finalTitle = isVendorJob
      ? Object.keys(roleOpenings).filter(role => roleOpenings[role] > 0).join(', ')
      : title;

    if (!finalTitle) {
      setGeminiError('Please enter a job title or select roles to generate a description.');
      return;
    }
    setIsLoadingGemini(true);
    setGeminiError('');
    try {
      const keywords = `${finalTitle}, ${company}, ${jobCity}, ${locality}, ${experienceLevel}`;
      const generatedDesc = await generateJobDescription(keywords);
      setDescription(generatedDesc);
    } catch (error) {
      console.error('Error generating description:', error);
      setGeminiError('Failed to generate description. Please try again or write it manually.');
    } finally {
      setIsLoadingGemini(false);
    }
  }, [title, roleOpenings, jobCategory, company, jobCity, locality, experienceLevel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // FIX: VENDOR_DATA[jobCategory] returns an object which is not assignable to a boolean. Coercing to boolean with '!!'.
    const isVendorJob = jobCategory !== 'Direct' && !!VENDOR_DATA[jobCategory];
    const finalTitle = isVendorJob
      ? Object.entries(roleOpenings)
          // FIX: Operator '>' cannot be applied to types 'unknown' and 'number'. Explicitly cast count to Number.
          .filter(([, count]) => Number(count) > 0)
          .map(([role]) => role)
          .join(', ')
      : title;

    if (!finalTitle || !company || !jobCity || !locality || !experienceLevel || !salaryRange || !description || numberOfOpenings <= 0 || !interviewAddress) {
      alert('Please fill in all required fields, and ensure at least one role has openings.');
      setIsSubmitting(false);
      return;
    }
    
    onAddJob({ 
      title: finalTitle, 
      company, 
      storeName: storeName || undefined,
      experienceLevel, 
      salaryRange, 
      numberOfOpenings, 
      companyLogoSrc: companyLogoSrc || undefined,
      description,
      // New fields
      jobCategory,
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
    setTitle('');
    setCompany('');
    setStoreName('');
    setExperienceLevel('Fresher');
    setSalaryRange('');
    setNumberOfOpenings(1);
    setCompanyLogoSrc('');
    setDescription('');
    setJobCategory('Direct');
    setJobCity('');
    setLocality('');
    setMinQualification('12th Pass');
    setGenderPreference('Any');
    setJobType('Full-time');
    setWorkLocationType('In-office');
    setWorkingDays('6 days');
    setJobShift('Day Shift');
    setInterviewAddress('');
    setSalaryType('Fixed');
    setIncentive('');
    setRoleOpenings({});
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
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCompanyLogoSrc(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } else {
        setCompanyLogoSrc('');
    }
  };

  const containerClasses = isModalMode ? "" : "bg-white p-6 rounded-lg shadow-md";
  const selectStyles = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

  // FIX: VENDOR_DATA[jobCategory] returns an object which is not assignable to a boolean. Coercing to boolean with '!!'. This fixes the error on line 380.
  const isVendorJob = jobCategory !== 'Direct' && !!VENDOR_DATA[jobCategory];

  return (
    <div className={containerClasses}>
      {!isModalMode && <h2 className="text-3xl font-bold text-gray-800 mb-6">Post New Job</h2>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="jobCategory" className="block text-sm font-medium text-gray-700 mb-1">Job Category / Vendor</label>
            <select id="jobCategory" className={selectStyles} value={jobCategory} onChange={handleJobCategoryChange} required>
              <option>Direct</option>
              {Object.keys(VENDOR_DATA).map(vendor => (
                <option key={vendor} value={vendor}>{vendor}</option>
              ))}
            </select>
          </div>

          {isVendorJob ? (
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Roles & Openings</label>
                <div className="p-4 border border-gray-300 rounded-md space-y-3 bg-gray-50">
                    {VENDOR_DATA[jobCategory]?.roles.map(role => (
                        <div key={role} className="flex items-center justify-between">
                            <label htmlFor={`role-${role}`} className="text-sm font-medium text-gray-800">{role}</label>
                            <Input
                                id={`role-${role}`}
                                type="number"
                                min="0"
                                value={roleOpenings[role] || '0'}
                                onChange={(e) => handleRoleOpeningChange(role, e.target.value)}
                                className="w-24 py-1 text-center"
                                wrapperClassName="mb-0"
                            />
                        </div>
                    ))}
                </div>
            </div>
          ) : (
            <Input id="jobTitle" label="Job Title / Role" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          )}

          <Input id="company" label="Company" type="text" value={company} onChange={(e) => setCompany(e.target.value)} required />
          <Input id="storeName" label="Store Name (Optional)" type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="e.g., DLF Mall of India" />
          
          {jobCategory === 'Direct' || !VENDOR_DATA[jobCategory] ? (
            <Input id="jobCity" label="Job City" type="text" value={jobCity} onChange={handleCityChange} required />
          ) : (
            <div>
              <label htmlFor="jobCity" className="block text-sm font-medium text-gray-700 mb-1">Job City</label>
              <select id="jobCity" name="jobCity" className={selectStyles} value={jobCity} onChange={handleCityChange} required>
                <option value="">Select a city</option>
                {VENDOR_DATA[jobCategory]?.cities.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
          )}

          {jobCategory === 'Direct' || !VENDOR_DATA[jobCategory] ? (
            <Input id="locality" label="Locality / Area" type="text" value={locality} onChange={(e) => setLocality(e.target.value)} required />
          ) : (
            <div>
              <label htmlFor="locality" className="block text-sm font-medium text-gray-700 mb-1">Locality / Area</label>
              <select id="locality" name="locality" className={selectStyles} value={locality} onChange={(e) => setLocality(e.target.value)} required disabled={!jobCity}>
                <option value="">{jobCity ? 'Select a locality' : 'Select a city first'}</option>
                {jobCity && VENDOR_DATA[jobCategory]?.localities[jobCity]?.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
          )}
          
          <div>
            <label htmlFor="minQualification" className="block text-sm font-medium text-gray-700 mb-1">Minimum Qualification</label>
            <select id="minQualification" className={selectStyles} value={minQualification} onChange={(e) => setMinQualification(e.target.value)} required>
              <option>10th Pass</option>
              <option>12th Pass</option>
              <option>Graduate</option>
              <option>Post Graduate</option>
            </select>
          </div>
          <div>
            <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
            <select id="experienceLevel" className={selectStyles} value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} required>
              <option>Fresher</option>
              <option>1-3 Years</option>
              <option>3-5 Years</option>
              <option>5+ Years</option>
            </select>
          </div>

          <div>
            <label htmlFor="genderPreference" className="block text-sm font-medium text-gray-700 mb-1">Gender Preference</label>
            <select id="genderPreference" className={selectStyles} value={genderPreference} onChange={(e) => setGenderPreference(e.target.value)} required>
              <option>Any</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>
          <div>
            <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
            <select id="jobType" className={selectStyles} value={jobType} onChange={(e) => setJobType(e.target.value)} required>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
            </select>
          </div>

          <div>
            <label htmlFor="workLocationType" className="block text-sm font-medium text-gray-700 mb-1">Work Location Type</label>
            <select id="workLocationType" className={selectStyles} value={workLocationType} onChange={(e) => setWorkLocationType(e.target.value)} required>
              <option>In-office</option>
              <option>Work from Home</option>
              <option>Hybrid</option>
            </select>
          </div>
          <div>
            <label htmlFor="workingDays" className="block text-sm font-medium text-gray-700 mb-1">Working Days</label>
            <select id="workingDays" className={selectStyles} value={workingDays} onChange={(e) => setWorkingDays(e.target.value)} required>
              <option>5 days</option>
              <option>6 days</option>
            </select>
          </div>

          <div>
            <label htmlFor="jobShift" className="block text-sm font-medium text-gray-700 mb-1">Job Shift</label>
            <select id="jobShift" className={selectStyles} value={jobShift} onChange={(e) => setJobShift(e.target.value)} required>
              <option>Day Shift</option>
              <option>Night Shift</option>
              <option>Rotational</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="salaryType" className="block text-sm font-medium text-gray-700 mb-1">Salary Type</label>
            <select id="salaryType" className={selectStyles} value={salaryType} onChange={(e) => setSalaryType(e.target.value)} required>
              <option>Fixed</option>
              <option>Fixed + Incentive</option>
            </select>
          </div>
          
          <Input id="salaryRange" label="Fixed Salary" type="text" value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} placeholder="e.g., ₹ 15,000 - 18,000 per month" required />
          
          {salaryType === 'Fixed + Incentive' && (
            <Input id="incentive" label="Incentive" type="text" value={incentive} onChange={(e) => setIncentive(e.target.value)} placeholder="e.g., Performance based" />
          )}

          <Input id="numberOfOpenings" label="Total Job Openings" type="number" value={numberOfOpenings} onChange={(e) => setNumberOfOpenings(parseInt(e.target.value, 10) || 1)} min="1" required disabled={isVendorJob} />
          
          <div>
            <label htmlFor="companyLogoSrc" className="block text-sm font-medium text-gray-700 mb-1">Company Logo (Optional)</label>
            <div className="flex items-center gap-4">
              {companyLogoSrc && (
                  <img src={companyLogoSrc} alt="Preview" className="h-10 w-10 rounded-md object-contain border p-1"/>
              )}
              <input
                id="companyLogoSrc"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
              />
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
          {onClose && (
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={handleGenerateDescription} loading={isLoadingGemini} disabled={(isVendorJob ? numberOfOpenings === 0 : !title) || isLoadingGemini}>
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