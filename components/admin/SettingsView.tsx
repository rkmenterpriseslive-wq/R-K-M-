import React, { useState, useEffect } from 'react';
import { BrandingConfig, UserProfile, PanelConfig, BannerConfig } from '../../types';
import LogoUploader from '../LogoUploader';
import Input from '../Input';
import Button from '../Button';
import AddTeamMemberModal from './AddTeamMemberModal';

type SettingsTab = 'Team & Roles' | 'Permissions' | 'Role' | 'Panel Options' | 'My Account' | 'Branding';

interface SettingsViewProps {
    branding: BrandingConfig;
    onUpdateBranding: (branding: BrandingConfig) => void;
    currentLogoSrc: string | null;
    onLogoUpload: (base64Image: string) => void;
    currentUserProfile?: UserProfile | null;
    panelConfig: PanelConfig | null;
    onUpdatePanelConfig: (config: PanelConfig) => Promise<void>;
    vendors: any[];
}

const SettingsView: React.FC<SettingsViewProps> = ({
    branding,
    onUpdateBranding,
    currentLogoSrc,
    onLogoUpload,
    currentUserProfile,
    panelConfig,
    onUpdatePanelConfig,
    vendors
}) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('Team & Roles');
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    
    const [localBranding, setLocalBranding] = useState(branding);
    const [localPanelConfig, setLocalPanelConfig] = useState<PanelConfig | null>(panelConfig);

    useEffect(() => {
        setLocalPanelConfig(panelConfig);
    }, [panelConfig]);

    useEffect(() => {
        setLocalBranding(branding);
    }, [branding]);


    const handleBrandingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // This handles nested properties like "hireTalent.title"
        const keys = name.split('.');
        if (keys.length === 2) {
            // FIX: Refactored to be type-safe. This prevents 'unknown' index type errors by ensuring
            // keys are treated as valid keys of their respective object types.
            const key0 = keys[0];
            const key1 = keys[1] as keyof BannerConfig;
            
            if (key0 === 'hireTalent' || key0 === 'becomePartner') {
                setLocalBranding(prev => ({
                    ...prev,
                    [key0]: {
                        ...prev[key0],
                        [key1]: value
                    }
                }));
            }
        // FIX: The original 'else' was not type-safe. It could incorrectly assign a string
        // to a property that expects an object (e.g., 'hireTalent'). This explicit check
        // for 'portalName' ensures only string properties are updated this way, resolving the type error.
        } else if (name === 'portalName') {
             setLocalBranding(prev => ({ ...prev, portalName: value }));
        }
    };
    
    const handleSaveBranding = () => {
        onUpdateBranding(localBranding);
        alert('Branding updated successfully!');
    };
    
    const handlePanelConfigChange = (type: 'jobRoles' | 'locations', value: string) => {
        if (!localPanelConfig) return;
        setLocalPanelConfig({
            ...localPanelConfig,
            [type]: value.split(',').map(item => item.trim()).filter(Boolean)
        });
    };

    const handleSavePanelConfig = async () => {
        if (localPanelConfig) {
            await onUpdatePanelConfig(localPanelConfig);
            alert('Panel options updated successfully!');
        }
    };


    const renderTabContent = () => {
        switch (activeTab) {
            case 'Team & Roles':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Manage Team Members</h3>
                            <Button onClick={() => setIsTeamModalOpen(true)}>+ Add Member</Button>
                        </div>
                        <div className="p-8 text-center border-2 border-dashed rounded-lg text-gray-500">
                           Team management table will be displayed here.
                        </div>
                        <AddTeamMemberModal
                            isOpen={isTeamModalOpen}
                            onClose={() => setIsTeamModalOpen(false)}
                            onSave={(data) => {
                                console.log('New member:', data);
                                alert('Team member added (see console).');
                                setIsTeamModalOpen(false);
                            }}
                            availableLocations={panelConfig?.locations || []}
                            availableVendors={vendors.map(v => v.brandName)}
                        />
                    </div>
                );
            case 'Permissions':
                return (
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Role Permissions</h3>
                        <div className="p-8 text-center border-2 border-dashed rounded-lg text-gray-500">
                           A matrix of roles and their permissions will be displayed here.
                        </div>
                    </div>
                );
            case 'Role':
                 return (
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Manage Roles</h3>
                         <div className="p-8 text-center border-2 border-dashed rounded-lg text-gray-500">
                           UI to add/edit/delete role types (e.g., Recruiter, HR) will be implemented here.
                        </div>
                    </div>
                );
            case 'Panel Options':
                 return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Panel Options</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Available Job Roles (comma-separated)</label>
                            <textarea
                                value={localPanelConfig?.jobRoles.join(', ') || ''}
                                onChange={(e) => handlePanelConfigChange('jobRoles', e.target.value)}
                                rows={3}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Available Locations (comma-separated)</label>
                            <textarea
                                value={localPanelConfig?.locations.join(', ') || ''}
                                onChange={(e) => handlePanelConfigChange('locations', e.target.value)}
                                rows={3}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            />
                        </div>
                        <Button onClick={handleSavePanelConfig}>Save Panel Options</Button>
                    </div>
                );
            case 'My Account':
                 return (
                    <div>
                        <h3 className="text-xl font-semibold mb-4">My Account</h3>
                        {currentUserProfile ? (
                             <dl className="divide-y divide-gray-200">
                                <div className="py-3 grid grid-cols-3 gap-4"><dt className="font-medium text-gray-500">Name:</dt><dd className="col-span-2">{currentUserProfile.name}</dd></div>
                                <div className="py-3 grid grid-cols-3 gap-4"><dt className="font-medium text-gray-500">Email:</dt><dd className="col-span-2">{currentUserProfile.email}</dd></div>
                                <div className="py-3 grid grid-cols-3 gap-4"><dt className="font-medium text-gray-500">Role:</dt><dd className="col-span-2">{currentUserProfile.userType}</dd></div>
                             </dl>
                        ) : <p>Loading profile...</p>}
                    </div>
                );
            case 'Branding':
                return (
                     <div className="space-y-6">
                         <h3 className="text-xl font-semibold">Branding & Appearance</h3>
                         <LogoUploader currentLogoSrc={currentLogoSrc} onLogoUpload={onLogoUpload} />
                         
                         <div className="space-y-4 pt-6 border-t">
                             <Input 
                                id="portalName"
                                name="portalName"
                                label="Portal Name"
                                value={localBranding.portalName}
                                onChange={handleBrandingChange}
                             />
                             
                             <fieldset className="border p-4 rounded-md">
                                <legend className="font-medium px-2">"Hire Talent" Banner</legend>
                                 <Input id="hireTalent.title" name="hireTalent.title" label="Title" value={localBranding.hireTalent.title} onChange={handleBrandingChange} />
                                 <Input id="hireTalent.description" name="hireTalent.description" label="Description" value={localBranding.hireTalent.description} onChange={handleBrandingChange} />
                             </fieldset>

                             <fieldset className="border p-4 rounded-md">
                                <legend className="font-medium px-2">"Become a Partner" Banner</legend>
                                 <Input id="becomePartner.title" name="becomePartner.title" label="Title" value={localBranding.becomePartner.title} onChange={handleBrandingChange} />
                                 <Input id="becomePartner.description" name="becomePartner.description" label="Description" value={localBranding.becomePartner.description} onChange={handleBrandingChange} />
                             </fieldset>
                             <Button onClick={handleSaveBranding}>Save Branding</Button>
                         </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const tabs: SettingsTab[] = ['Team & Roles', 'Permissions', 'Role', 'Panel Options', 'My Account', 'Branding'];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Settings</h2>
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap px-1 py-4 text-sm font-medium ${
                                activeTab === tab 
                                    ? 'border-b-2 border-blue-600 text-blue-600' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default SettingsView;
