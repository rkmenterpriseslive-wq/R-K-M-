
import React, { useState, useEffect } from 'react';
import { BrandingConfig } from '../../types';
import Input from '../Input';
import Button from '../Button';

interface BrandingViewProps {
  initialBranding: BrandingConfig;
  initialLogoSrc: string | null;
  onUpdateBranding: (branding: BrandingConfig) => Promise<void>;
  onLogoUpload: (base64: string) => Promise<void>;
}

const BrandingView: React.FC<BrandingViewProps> = ({
  initialBranding,
  initialLogoSrc,
  onUpdateBranding,
  onLogoUpload,
}) => {
  const [localBranding, setLocalBranding] = useState<BrandingConfig>(initialBranding);
  const [isSaving, setIsSaving] = useState(false);

  // File and preview states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [hireTalentBgFile, setHireTalentBgFile] = useState<File | null>(null);
  const [partnerBgFile, setPartnerBgFile] = useState<File | null>(null);

  const [logoPreview, setLogoPreview] = useState<string | null>(initialLogoSrc);
  const [hireTalentBgPreview, setHireTalentBgPreview] = useState<string | null>(initialBranding.hireTalent.backgroundImage || null);
  const [partnerBgPreview, setPartnerBgPreview] = useState<string | null>(initialBranding.becomePartner.backgroundImage || null);

  useEffect(() => {
    setLocalBranding(initialBranding);
    setLogoPreview(initialLogoSrc);
    setHireTalentBgPreview(initialBranding.hireTalent.backgroundImage || null);
    setPartnerBgPreview(initialBranding.becomePartner.backgroundImage || null);
  }, [initialBranding, initialLogoSrc]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const [section, field] = name.split('.');

    if (field) { // Nested banner object
      setLocalBranding(prev => {
        const sectionKey = section as keyof Pick<BrandingConfig, 'hireTalent' | 'becomePartner'>;
        return {
          ...prev,
          [sectionKey]: {
            ...prev[sectionKey],
            [field]: value,
          },
        };
      });
    } else { // Top-level field like portalName
      setLocalBranding(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'hireTalentBg' | 'partnerBg') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (type === 'logo') {
          setLogoFile(file);
          setLogoPreview(base64String);
        } else if (type === 'hireTalentBg') {
          setHireTalentBgFile(file);
          setHireTalentBgPreview(base64String);
          setLocalBranding(prev => ({ ...prev, hireTalent: { ...prev.hireTalent, backgroundImage: base64String } }));
        } else { // partnerBg
          setPartnerBgFile(file);
          setPartnerBgPreview(base64String);
          setLocalBranding(prev => ({ ...prev, becomePartner: { ...prev.becomePartner, backgroundImage: base64String } }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (logoFile && logoPreview) {
        await onLogoUpload(logoPreview);
      }
      await onUpdateBranding(localBranding);
      alert('Branding saved successfully!');
      // Clear file inputs after save
      setLogoFile(null);
      setHireTalentBgFile(null);
      setPartnerBgFile(null);
    } catch (error) {
      alert('Failed to save branding settings.');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const FileInputDisplay: React.FC<{
    label: string;
    file: File | null;
    previewUrl?: string | null;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    hasPreviewBox?: boolean;
    currentFileName?: string | null;
  }> = ({ label, file, previewUrl, onChange, hasPreviewBox = false, currentFileName }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-4">
        <label className="cursor-pointer bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <span>Choose file</span>
          <input type="file" className="sr-only" accept="image/*" onChange={onChange} />
        </label>
        <span className="text-sm text-gray-500">
          {file ? file.name : (currentFileName ? 'File uploaded' : 'No file chosen')}
        </span>
        {hasPreviewBox && (
          <div className="w-12 h-12 border border-gray-200 rounded-md flex items-center justify-center bg-gray-50">
            {previewUrl && <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-10">
        
        {/* Portal Logo & Name */}
        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-6">Portal Logo & Name</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <FileInputDisplay
                label="Portal Logo"
                file={logoFile}
                previewUrl={logoPreview}
                onChange={(e) => handleFileChange(e, 'logo')}
                hasPreviewBox={true}
                currentFileName={initialLogoSrc}
             />
             <Input
                id="portalName"
                name="portalName"
                label="Portal Name"
                value={localBranding.portalName}
                onChange={handleInputChange}
                required
             />
          </div>
        </section>

        {/* Hire Top Talent Banner */}
        <section className="pt-8 border-t">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Hire Top Talent Banner</h3>
          <div className="space-y-6">
            <Input
              id="hireTalent.title"
              name="hireTalent.title"
              label="Title"
              value={localBranding.hireTalent.title}
              onChange={handleInputChange}
              required
            />
            <Input
              id="hireTalent.description"
              name="hireTalent.description"
              label="Description"
              value={localBranding.hireTalent.description}
              onChange={handleInputChange}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileInputDisplay
                label="Background Image"
                file={hireTalentBgFile}
                onChange={(e) => handleFileChange(e, 'hireTalentBg')}
                currentFileName={initialBranding.hireTalent.backgroundImage}
              />
              <Input
                id="hireTalent.link"
                name="hireTalent.link"
                label="Page Link"
                value={localBranding.hireTalent.link}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </section>

        {/* Become a Partner Banner */}
        <section className="pt-8 border-t">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Become a Partner Banner</h3>
          <div className="space-y-6">
            <Input
              id="becomePartner.title"
              name="becomePartner.title"
              label="Title"
              value={localBranding.becomePartner.title}
              onChange={handleInputChange}
              required
            />
            <Input
              id="becomePartner.description"
              name="becomePartner.description"
              label="Description"
              value={localBranding.becomePartner.description}
              onChange={handleInputChange}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileInputDisplay
                label="Background Image"
                file={partnerBgFile}
                onChange={(e) => handleFileChange(e, 'partnerBg')}
                currentFileName={initialBranding.becomePartner.backgroundImage}
              />
              <Input
                id="becomePartner.link"
                name="becomePartner.link"
                label="Page Link"
                value={localBranding.becomePartner.link}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end pt-8 border-t">
          <Button type="submit" loading={isSaving} className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3">
            Save Branding
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BrandingView;
