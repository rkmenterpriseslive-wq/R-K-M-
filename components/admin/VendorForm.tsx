
import React, { useState, useEffect, useMemo } from 'react';
import {
  Vendor,
  PanelConfig,
  CommissionStructureType,
  Slab,
  AttendanceProfile,
  CommissionStructure,
} from '../../types';
import Input from '../Input';
import Button from '../Button';

interface VendorFormProps {
  vendor: Vendor | null;
  panelConfig: PanelConfig;
  onSave: (data: Omit<Vendor, 'id' | 'status'>) => Promise<void>;
  onClose: () => void;
}

const VendorForm: React.FC<VendorFormProps> = ({
  vendor,
  panelConfig,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<Omit<Vendor, 'id' | 'status'>>({
    partnerName: '',
    brandName: '',
    contactPerson: '',
    email: '',
    phone: '',
    fullAddress: '',
    operationalLocations: [],
    jobRoles: [],
    commissionStructure: { type: 'Percentage Based', percentage: 0 },
    termsAndConditions: '',
  });

  const [commissionType, setCommissionType] = useState<CommissionStructureType>('Percentage Based');
  const [percentageValue, setPercentageValue] = useState(0);
  const [slabs, setSlabs] = useState<Slab[]>([]);
  const [profiles, setProfiles] = useState<AttendanceProfile[]>([]);
  
  const [isSaving, setIsSaving] = useState(false);

  // Hardcoded experience levels, as they are not in panelConfig currently
  const experienceLevels = ['Fresher', 'Experience', 'Any'];

  useEffect(() => {
    if (vendor) {
      setFormData({
        partnerName: vendor.partnerName || '',
        brandName: vendor.brandName || '',
        contactPerson: vendor.contactPerson || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        fullAddress: vendor.fullAddress || '',
        operationalLocations: vendor.operationalLocations || [],
        jobRoles: vendor.jobRoles || [],
        termsAndConditions: vendor.termsAndConditions || '',
        commissionStructure: vendor.commissionStructure || { type: 'Percentage Based', percentage: 0 },
      });

      if (vendor.commissionStructure) {
        setCommissionType(vendor.commissionStructure.type);
        if (vendor.commissionStructure.type === 'Percentage Based') {
          setPercentageValue(vendor.commissionStructure.percentage);
        } else if (vendor.commissionStructure.type === 'Slab Based') {
          setSlabs(vendor.commissionStructure.slabs);
        } else if (vendor.commissionStructure.type === 'Attendance Based') {
          setProfiles(vendor.commissionStructure.profiles);
        }
      } else {
        setCommissionType('Percentage Based');
        setPercentageValue(0);
        setSlabs([]);
        setProfiles([]);
      }
    } else {
      // Reset form for new vendor
      setFormData({
        partnerName: '',
        brandName: '',
        contactPerson: '',
        email: '',
        phone: '',
        fullAddress: '',
        operationalLocations: [],
        jobRoles: [],
        termsAndConditions: '',
        commissionStructure: { type: 'Percentage Based', percentage: 0 }, // Default
      });
      setCommissionType('Percentage Based');
      setPercentageValue(0);
      setSlabs([]);
      // Initialize with an empty profile including new experienceType
      setProfiles([{ id: `profile-${Date.now()}`, role: '', experienceType: '', attendanceDays: 0, amount: 0 }]); 
    }
  }, [vendor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, field: 'operationalLocations' | 'jobRoles') => {
    const { options } = e.target;
    const value: string[] = [];
    for (let i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCommissionTypeChange = (type: CommissionStructureType) => {
    setCommissionType(type);
    // Reset relevant commission data when type changes
    if (type === 'Percentage Based') {
      setPercentageValue(0);
    } else if (type === 'Slab Based') {
      setSlabs([{ id: `slab-${Date.now()}`, from: 0, to: 0, amount: 0 }]);
    } else if (type === 'Attendance Based') {
      // Initialize with a default new profile structure
      setProfiles([{ id: `profile-${Date.now()}`, role: '', experienceType: '', attendanceDays: 0, amount: 0 }]);
    }
  };

  // Slab Commission Handlers
  const handleSlabChange = (index: number, field: keyof Slab, value: string) => {
    const newSlabs = [...slabs];
    // Ensure numeric fields are parsed as numbers
    (newSlabs[index] as any)[field] = (field === 'from' || field === 'to' || field === 'amount') ? parseFloat(value) || 0 : value;
    setSlabs(newSlabs);
  };

  const addSlab = () => {
    setSlabs([...slabs, { id: `slab-${Date.now()}`, from: 0, to: 0, amount: 0 }]);
  };

  const removeSlab = (id: string) => {
    setSlabs(slabs.filter((slab) => slab.id !== id));
  };

  // Attendance Commission Handlers
  const handleProfileChange = (index: number, field: keyof AttendanceProfile, value: string) => {
    const newProfiles = [...profiles];
    (newProfiles[index] as any)[field] = (field === 'attendanceDays' || field === 'amount') ? parseFloat(value) || 0 : value;
    setProfiles(newProfiles);
  };

  const addProfile = () => {
    // Initialize new AttendanceProfile with empty experienceType
    setProfiles([...profiles, { id: `profile-${Date.now()}`, role: '', experienceType: '', attendanceDays: 0, amount: 0 }]);
  };

  const removeProfile = (id: string) => {
    setProfiles(profiles.filter((profile) => profile.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const finalCommissionStructure: CommissionStructure = (() => {
      if (commissionType === 'Percentage Based') {
        return { type: 'Percentage Based', percentage: percentageValue };
      } else if (commissionType === 'Slab Based') {
        return { type: 'Slab Based', slabs: slabs.map(({ id, ...rest }) => rest) }; // Remove temporary id
      } else {
        return { type: 'Attendance Based', profiles: profiles.map(({ id, ...rest }) => rest) }; // Remove temporary id
      }
    })();

    try {
      await onSave({ ...formData, commissionStructure: finalCommissionStructure });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const radioClass = "h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const selectClass = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white";

  const { jobRoles: availableJobRoles, locations: availableLocations } = panelConfig;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="brandName"
          name="brandName"
          label="Brand Name"
          value={formData.brandName}
          onChange={handleChange}
          placeholder="e.g., Blinkit"
          required
        />
        <Input
          id="partnerName"
          name="partnerName"
          label="Partner Name"
          value={formData.partnerName}
          onChange={handleChange}
          placeholder="e.g., John Doe"
          required
        />
        <div className="md:col-span-2">
          <Input
            id="fullAddress"
            name="fullAddress"
            label="Full Address"
            value={formData.fullAddress}
            onChange={handleChange}
            placeholder="Enter full address"
            required
          />
        </div>
        <Input
          id="email"
          name="email"
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="contact@vendor.com"
          required
        />
        <Input
          id="phone"
          name="phone"
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+91 98765 43210"
          required
        />
        <div>
          <label htmlFor="operationalLocations" className={labelClass}>Operational Locations</label>
          <select
            id="operationalLocations"
            name="operationalLocations"
            multiple
            value={formData.operationalLocations}
            onChange={(e) => handleMultiSelectChange(e, 'operationalLocations')}
            className={`${selectClass} h-24`}
            aria-describedby="location-hint"
            required
          >
            {availableLocations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <p id="location-hint" className="mt-1 text-xs text-gray-500">Hold Ctrl (or Cmd on Mac) to select multiple.</p>
        </div>
        <div>
          <label htmlFor="jobRoles" className={labelClass}>Job Roles</label>
          <select
            id="jobRoles"
            name="jobRoles"
            multiple
            value={formData.jobRoles}
            onChange={(e) => handleMultiSelectChange(e, 'jobRoles')}
            className={`${selectClass} h-24`}
            aria-describedby="jobrole-hint"
            required
          >
            {availableJobRoles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <p id="jobrole-hint" className="mt-1 text-xs text-gray-500">Hold Ctrl (or Cmd on Mac) to select multiple.</p>
        </div>
      </div>

      {/* Commission Structure */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Commission Structure</h3>
        <div className="flex flex-wrap gap-4 mb-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="commissionType"
              value="Percentage Based"
              checked={commissionType === 'Percentage Based'}
              onChange={() => handleCommissionTypeChange('Percentage Based')}
              className={radioClass}
            />
            <span className="ml-2 text-sm text-gray-700">Percentage Based</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="commissionType"
              value="Slab Based"
              checked={commissionType === 'Slab Based'}
              onChange={() => handleCommissionTypeChange('Slab Based')}
              className={radioClass}
            />
            <span className="ml-2 text-sm text-gray-700">Slab Based</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="commissionType"
              value="Attendance Based"
              checked={commissionType === 'Attendance Based'}
              onChange={() => handleCommissionTypeChange('Attendance Based')}
              className={radioClass}
            />
            <span className="ml-2 text-sm text-gray-700">Attendance Based</span>
          </label>
        </div>

        {commissionType === 'Percentage Based' && (
          <div>
            <Input
              id="percentage"
              label="Percentage (%)"
              type="number"
              value={percentageValue.toString()}
              onChange={(e) => setPercentageValue(parseFloat(e.target.value) || 0)}
              placeholder="e.g., 10"
              required
            />
          </div>
        )}

        {commissionType === 'Slab Based' && (
          <div className="space-y-4">
            {slabs.map((slab, index) => (
              <div key={slab.id} className="flex items-end gap-3">
                <Input
                  label={index === 0 ? "From" : undefined} // Label only for the first row
                  type="number"
                  value={slab.from.toString()}
                  onChange={(e) => handleSlabChange(index, 'from', e.target.value)}
                  wrapperClassName="flex-1 mb-0"
                  placeholder={index === 0 ? "1" : undefined}
                  aria-label={`Slab ${index + 1} from value`}
                  required
                />
                <Input
                  label={index === 0 ? "To" : undefined}
                  type="number"
                  value={slab.to.toString()}
                  onChange={(e) => handleSlabChange(index, 'to', e.target.value)}
                  wrapperClassName="flex-1 mb-0"
                  placeholder={index === 0 ? "10" : undefined}
                  aria-label={`Slab ${index + 1} to value`}
                  required
                />
                <Input
                  label={index === 0 ? "Amount (₹)" : undefined}
                  type="number"
                  value={slab.amount.toString()}
                  onChange={(e) => handleSlabChange(index, 'amount', e.target.value)}
                  wrapperClassName="flex-1 mb-0"
                  placeholder={index === 0 ? "1000" : undefined}
                  aria-label={`Slab ${index + 1} amount`}
                  required
                />
                {slabs.length > 1 && (
                  <button type="button" onClick={() => removeSlab(slab.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={addSlab}>
              + Add Slab
            </Button>
          </div>
        )}

        {commissionType === 'Attendance Based' && (
          <div className="space-y-4">
            {profiles.map((profile, index) => (
              <div key={profile.id} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                {/* Profile/Role */}
                <div className="col-span-1">
                  <label htmlFor={`profile-role-${profile.id}`} className={index === 0 ? labelClass : "sr-only"}>Profile/Role</label>
                  <select
                    id={`profile-role-${profile.id}`}
                    value={profile.role}
                    onChange={(e) => handleProfileChange(index, 'role', e.target.value)}
                    className={selectClass}
                    aria-label={`Profile ${index + 1} role`}
                    required
                  >
                    <option value="">Select Role</option>
                    {availableJobRoles.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                {/* Experience Type */}
                <div className="col-span-1">
                  <label htmlFor={`profile-exp-type-${profile.id}`} className={index === 0 ? labelClass : "sr-only"}>Experience Type</label>
                  <select
                    id={`profile-exp-type-${profile.id}`}
                    value={profile.experienceType}
                    onChange={(e) => handleProfileChange(index, 'experienceType', e.target.value)}
                    className={selectClass}
                    aria-label={`Profile ${index + 1} experience type`}
                    required
                  >
                    <option value="">Select Exp. Type</option>
                    {experienceLevels.map((exp) => (
                      <option key={exp} value={exp}>{exp}</option>
                    ))}
                  </select>
                </div>

                {/* Attendance Days */}
                <Input
                  label={index === 0 ? "Attendance (Days)" : undefined}
                  type="number"
                  value={profile.attendanceDays.toString()}
                  onChange={(e) => handleProfileChange(index, 'attendanceDays', e.target.value)}
                  wrapperClassName="col-span-1 mb-0"
                  placeholder={index === 0 ? "26" : undefined}
                  aria-label={`Profile ${index + 1} attendance days`}
                  required
                />
                
                {/* Amount and Remove Button */}
                <div className="col-span-1 flex items-end gap-3">
                  <Input
                    label={index === 0 ? "Amount (₹)" : undefined}
                    type="number"
                    value={profile.amount.toString()}
                    onChange={(e) => handleProfileChange(index, 'amount', e.target.value)}
                    wrapperClassName="flex-1 mb-0"
                    placeholder={index === 0 ? "5000" : undefined}
                    aria-label={`Profile ${index + 1} amount`}
                    required
                  />
                  {profiles.length > 1 && (
                    <button type="button" onClick={() => removeProfile(profile.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={addProfile}>
              + Add Profile
            </Button>
          </div>
        )}
      </div>

      {/* Terms & Conditions */}
      <div className="pt-6 border-t border-gray-200">
        <label htmlFor="termsAndConditions" className={labelClass}>Terms & Conditions</label>
        <textarea
          id="termsAndConditions"
          name="termsAndConditions"
          rows={4}
          value={formData.termsAndConditions}
          onChange={handleChange}
          className={selectClass}
          placeholder="Enter any terms and conditions for this vendor..."
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t mt-6">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isSaving}>
          Add Vendor
        </Button>
      </div>
    </form>
  );
};

export default VendorForm;
