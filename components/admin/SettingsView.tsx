
import React, { useState, useEffect, useMemo } from 'react';
import { BrandingConfig, UserProfile, PanelConfig, Store, TeamMember, Role, UserType } from '../../types';
import Input from '../Input';
import Button from '../Button';
import AddTeamMemberModal from './AddTeamMemberModal';
import Modal from '../Modal';
import { onRolesChange, addRole, deleteRole, onTeamMembersChange, createTeamMember, deleteTeamMember } from '../../services/firebaseService';
import BrandingView from './BrandingView'; // Import the new BrandingView
import MyAccountView from './MyAccountView'; // Import MyAccountView
import PermissionsView from './PermissionsView'; // Import PermissionsView

type SettingsTab = 'Team & Roles' | 'Permissions' | 'Role Management' | 'Panel Options' | 'My Account' | 'Branding';

// A simple toggle switch component
const ToggleSwitch: React.FC<{ enabled: boolean; onChange: () => void; disabled?: boolean }> = ({ enabled, onChange, disabled = false }) => (
    <button
        type="button"
        className={`${
            enabled ? 'bg-indigo-600' : 'bg-gray-200'
        } relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        }`}
        onClick={!disabled ? onChange : undefined}
        aria-pressed={enabled}
        disabled={disabled}
    >
        <span
            className={`${
                enabled ? 'translate-x-5' : 'translate-x-0'
            } inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
    </button>
);

const PanelConfigurationView: React.FC<{
    initialConfig: PanelConfig | null;
    onSave: (config: PanelConfig) => Promise<void>;
}> = ({ initialConfig, onSave }) => {
    const [config, setConfig] = useState<PanelConfig | null>(initialConfig);
    const [isSaving, setIsSaving] = useState(false);
    
    // State for modals
    const [isJobRoleModalOpen, setIsJobRoleModalOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

    // State for new items within modals
    const [newStoreName, setNewStoreName] = useState('');
    const [newStoreLocation, setNewStoreLocation] = useState('');
    const [newJobRole, setNewJobRole] = useState('');
    const [newLocation, setNewLocation] = useState('');

    useEffect(() => {
        setConfig(initialConfig);
    }, [initialConfig]);
    
    if (!config) {
        return <div className="text-center p-12 text-gray-500">Loading configuration...</div>;
    }

    const handleToggle = (key: 'emailNotifications' | 'maintenanceMode') => {
        setConfig(prev => prev ? { ...prev, [key]: !prev[key] } : null);
    };

    // --- Item Management Logic ---
    const handleAddItem = (type: 'jobRoles' | 'locations', value: string) => {
        if (!config || !value.trim()) return;
        const currentItems = config[type] || [];
        if (currentItems.includes(value.trim())) {
            alert('This item already exists.');
            return;
        }
        setConfig({ ...config, [type]: [...currentItems, value.trim()] });
        // Reset input fields
        if (type === 'jobRoles') setNewJobRole('');
        if (type === 'locations') setNewLocation('');
    };
    
    const handleRemoveItem = (type: 'jobRoles' | 'locations', index: number) => {
        if (!config) return;
        setConfig({ ...config, [type]: (config[type] || []).filter((_, i) => i !== index) });
    };

    const handleAddStore = () => {
        if (!config || !newStoreName.trim() || !newStoreLocation.trim()) {
            alert("Please provide a store name and select a location.");
            return;
        }
        const newStore: Store = {
            id: `store_${Date.now()}`,
            name: newStoreName.trim(),
            location: newStoreLocation.trim(),
        };
        setConfig({ ...config, stores: [...(config.stores || []), newStore] });
        setNewStoreName('');
        setNewStoreLocation('');
    };

    const handleRemoveStore = (id: string) => {
        if (!config) return;
        setConfig({
            ...config,
            stores: config.stores.filter(s => s.id !== id),
        });
    };
    
    const handleSave = async () => {
        if (config) {
            setIsSaving(true);
            await onSave(config);
            setIsSaving(false);
            alert('Panel configuration saved!');
        }
    };

    // Generic modal content for lists (Job Roles, Locations)
    const ListManagerModalContent: React.FC<{ 
      title: string; 
      items: string[]; 
      newItem: string;
      setNewItem: (val: string) => void;
      onAdd: () => void;
      onRemove: (index: number) => void;
    }> = ({ title, items, newItem, setNewItem, onAdd, onRemove }) => (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Input id={`new-${title}`} wrapperClassName="flex-grow mb-0" value={newItem} onChange={e => setNewItem(e.target.value)} placeholder={`New ${title.slice(0, -1)}`} />
                <Button type="button" variant="secondary" onClick={onAdd}>Add</Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto border p-2 rounded-md bg-gray-50">
                {(items || []).map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-white p-2 rounded text-sm shadow-sm">
                        <span>{item}</span>
                        <button type="button" onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700 font-bold text-lg leading-none">&times;</button>
                    </div>
                ))}
            </div>
        </div>
    );
    
    // --- RENDER ---
    return (
        <div className="space-y-8">
            <h3 className="text-2xl font-bold text-gray-800">Panel Configuration</h3>
            
            {/* Toggles Card */}
            <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
                <div className="flex justify-between items-center p-4">
                    <div>
                        <label className="font-semibold text-gray-800">Email Notifications</label>
                        <p className="text-sm text-gray-500">Receive emails for new applications.</p>
                    </div>
                    <ToggleSwitch enabled={config.emailNotifications || false} onChange={() => handleToggle('emailNotifications')} />
                </div>
                 <div className="flex justify-between items-center p-4">
                    <div>
                        <label className="font-semibold text-gray-800">Maintenance Mode</label>
                        <p className="text-sm text-gray-500">Prevent users from accessing the portal.</p>
                    </div>
                    <ToggleSwitch enabled={config.maintenanceMode || false} onChange={() => handleToggle('maintenanceMode')} />
                </div>
            </div>

            {/* List Management Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Job Roles */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center">
                        <h4 className="text-lg font-bold text-gray-800">Job Roles</h4>
                        <Button variant="small-light" size="sm" onClick={() => setIsJobRoleModalOpen(true)}>+ Add New</Button>
                    </div>
                </div>
                {/* Locations */}
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center">
                        <h4 className="text-lg font-bold text-gray-800">Locations</h4>
                        <Button variant="small-light" size="sm" onClick={() => setIsLocationModalOpen(true)}>+ Add New</Button>
                    </div>
                </div>
                {/* Store Names */}
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center">
                        <h4 className="text-lg font-bold text-gray-800">Store Names</h4>
                        <Button variant="small-light" size="sm" onClick={() => setIsStoreModalOpen(true)}>+ Add New</Button>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t mt-4">
                <Button onClick={handleSave} loading={isSaving}>Save Configuration</Button>
            </div>

            {/* --- Modals --- */}
            <Modal isOpen={isJobRoleModalOpen} onClose={() => setIsJobRoleModalOpen(false)} title="Manage Job Roles">
                <ListManagerModalContent 
                    title="Job Roles"
                    items={config.jobRoles || []}
                    newItem={newJobRole}
                    setNewItem={setNewJobRole}
                    onAdd={() => handleAddItem('jobRoles', newJobRole)}
                    onRemove={(idx) => handleRemoveItem('jobRoles', idx)}
                />
            </Modal>
            
            <Modal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} title="Manage Locations">
                <ListManagerModalContent 
                    title="Locations"
                    items={config.locations || []}
                    newItem={newLocation}
                    setNewItem={setNewLocation}
                    onAdd={() => handleAddItem('locations', newLocation)}
                    onRemove={(idx) => handleRemoveItem('locations', idx)}
                />
            </Modal>
            
            <Modal isOpen={isStoreModalOpen} onClose={() => setIsStoreModalOpen(false)} title="Manage Stores">
                 <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr,1fr,auto] gap-2 items-end">
                        <Input id="newStoreName" label="New Store Name" wrapperClassName="mb-0" value={newStoreName} onChange={e => setNewStoreName(e.target.value)} placeholder="e.g., Prime Mart" />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <select value={newStoreLocation} onChange={e => setNewStoreLocation(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                                <option value="">Select Location</option>
                                {(config.locations || []).map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>
                        </div>
                        <Button type="button" variant="secondary" onClick={handleAddStore}>Add</Button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto border p-2 rounded-md bg-gray-50">
                        {(config.stores || []).map(store => (
                            <div key={store.id} className="flex justify-between items-center bg-white p-2 rounded text-sm shadow-sm">
                                <span><strong>{store.name}</strong> ({store.location})</span>
                                <button type="button" onClick={() => handleRemoveStore(store.id)} className="text-red-500 hover:text-red-700 font-bold text-lg leading-none">&times;</button>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
};


interface SettingsViewProps {
    branding: BrandingConfig;
    onUpdateBranding: (branding: BrandingConfig) => void;
    currentLogoSrc: string | null;
    onLogoUpload: (base64: string) => void;
    currentUserProfile?: UserProfile | null;
    panelConfig: PanelConfig | null;
    onUpdatePanelConfig: (config: PanelConfig) => void;
    vendors: any[];
    allUsers: UserProfile[];
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
    branding, 
    onUpdateBranding, 
    currentLogoSrc, 
    onLogoUpload, 
    currentUserProfile,
    panelConfig,
    onUpdatePanelConfig,
    vendors,
    allUsers
}) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('Team & Roles');
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [customRoles, setCustomRoles] = useState<Role[]>([]);
    const [newRoleName, setNewRoleName] = useState('');
    const [newRolePanel, setNewRolePanel] = useState<Role['panel']>('HR');

    useEffect(() => {
        const unsubTeam = onTeamMembersChange(setTeamMembers);
        const unsubRoles = onRolesChange(setCustomRoles);
        return () => {
            unsubTeam();
            unsubRoles();
        };
    }, []);

    const handleAddTeamMember = async (memberData: Omit<TeamMember, 'id'>) => {
        try {
            await createTeamMember(memberData);
            alert('Team member added! Their temporary password is "password".');
            setIsTeamModalOpen(false);
        } catch (error) {
            console.error(error);
            alert('Failed to add team member.');
        }
    };

    const handleDeleteTeamMember = async (member: TeamMember) => {
        if (window.confirm(`Are you sure you want to delete ${member.name}? This action cannot be undone.`)) {
            if(member.id) {
                await deleteTeamMember(member.id);
            }
        }
    };
    
    const potentialManagers = useMemo(() => allUsers.filter(u => [UserType.ADMIN, UserType.HR, UserType.TEAMLEAD].includes(u.userType)), [allUsers]);
    const availableVendorNames = useMemo(() => [...new Set(vendors.map(v => v.brandName))], [vendors]);

    // This is needed for the "My Account" tab
    const teamMemberDetails = useMemo(() => {
        if (!currentUserProfile || !teamMembers) return null;
        return teamMembers.find(tm => tm.email === currentUserProfile.email);
    }, [currentUserProfile, teamMembers]);


    const handleAddRole = async () => {
        if (!newRoleName) return;
        await addRole(newRoleName, newRolePanel);
        setNewRoleName('');
    };
    
    const handleDeleteRole = async (roleId: string) => {
        if(window.confirm('Are you sure you want to delete this role?')) {
            await deleteRole(roleId);
        }
    };

    const tabs: { name: SettingsTab; label: string }[] = [
        { name: 'Team & Roles', label: 'Team & Roles' },
        { name: 'Permissions', label: 'Permissions' },
        { name: 'Role Management', label: 'Role' },
        { name: 'Panel Options', label: 'Panel Options' },
        { name: 'My Account', label: 'My Account' },
        { name: 'Branding', label: 'Branding' },
    ];
    
    const renderContent = () => {
        switch (activeTab) {
            case 'Team & Roles':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                            <h3 className="text-xl font-bold text-gray-800">Manage Team & Roles</h3>
                            <Button onClick={() => setIsTeamModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                Add Team Member
                            </Button>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Post</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manager</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salary</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {teamMembers.map(member => (
                                        <tr key={member.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">{member.name}</div>
                                                <div className="text-sm text-gray-500">{member.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.role}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">-</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.reportingManager || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.salary && member.salary !== '0' ? member.salary : '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-4">
                                                    <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                                    <Button variant="danger" size="sm" onClick={() => handleDeleteTeamMember(member)}>Delete</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <AddTeamMemberModal 
                            isOpen={isTeamModalOpen}
                            onClose={() => setIsTeamModalOpen(false)}
                            onSave={handleAddTeamMember}
                            availableLocations={panelConfig?.locations || []}
                            availableVendors={availableVendorNames}
                            potentialManagers={potentialManagers}
                            customRoles={customRoles}
                        />
                    </div>
                );
            case 'Permissions':
                return <PermissionsView initialConfig={panelConfig} onSave={onUpdatePanelConfig} />;
            case 'Role Management':
                 return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Add New Role Card */}
                        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Add New Role</h3>
                            <form onSubmit={(e) => { e.preventDefault(); handleAddRole(); }} className="space-y-6">
                                <Input 
                                    id="newRoleName" 
                                    label="Role Name" 
                                    value={newRoleName} 
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                    placeholder="e.g., Senior HR"
                                    required
                                />
                                <div>
                                    <label htmlFor="assignPanel" className="block text-sm font-medium text-gray-700 mb-1">Assign Panel</label>
                                    <select 
                                        id="assignPanel"
                                        value={newRolePanel} 
                                        onChange={(e) => setNewRolePanel(e.target.value as Role['panel'])} 
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    >
                                        <option value="HR">HR Panel</option>
                                        <option value="TeamLead">TeamLead Panel</option>
                                        <option value="Team">Team Panel</option>
                                        <option value="Admin">Admin Panel</option>
                                        <option value="Partner">Partner Panel</option>
                                    </select>
                                </div>
                                <Button type="submit" className="w-full justify-center py-3 bg-indigo-600 hover:bg-indigo-700">Add Role</Button>
                            </form>
                        </div>
                        {/* Existing Roles Card */}
                        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Existing Roles ({customRoles.length})</h3>
                            {customRoles.length > 0 ? (
                                <div className="space-y-3 overflow-y-auto">
                                    {customRoles.map(role => (
                                        <div key={role.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                                            <div>
                                                <p className="font-semibold text-gray-900">{role.name}</p>
                                                <p className="text-xs text-gray-500 font-medium">{role.panel} Panel</p>
                                            </div>
                                            <Button size="sm" variant="danger" onClick={() => handleDeleteRole(role.id)}>Delete</Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex-grow flex items-center justify-center">
                                    <p className="text-gray-500 italic">No roles added yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                 );
            case 'Panel Options':
                return <PanelConfigurationView initialConfig={panelConfig} onSave={onUpdatePanelConfig} />;
            case 'My Account':
                 return <MyAccountView profile={currentUserProfile || null} teamDetails={teamMemberDetails || null} />;
            case 'Branding':
                return (
                    <BrandingView 
                        initialBranding={branding} 
                        initialLogoSrc={currentLogoSrc} 
                        onUpdateBranding={onUpdateBranding}
                        onLogoUpload={onLogoUpload}
                    />
                );
            default:
                return <div>Select a setting to configure.</div>
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-2">
                <nav className="flex space-x-2" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`whitespace-nowrap py-3 px-4 rounded-lg font-bold text-sm transition-all duration-200 ${
                                activeTab === tab.name
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="animate-fade-in">
                {renderContent()}
            </div>
        </div>
    );
};

export default SettingsView;
