import React, { useState, useEffect } from 'react';
import { BrandingConfig, UserProfile, PanelConfig, BannerConfig, Store, TeamMember } from '../../types';
import Input from '../Input';
import Button from '../Button';
import AddTeamMemberModal from './AddTeamMemberModal';
import Modal from '../Modal';

type SettingsTab = 'Team & Roles' | 'Permissions' | 'Role' | 'Panel Options' | 'My Account' | 'Branding';

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
    
    const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
    const [newRole, setNewRole] = useState('');

    const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
    const [newLocation, setNewLocation] = useState('');
    
    const [isAddStoreModalOpen, setIsAddStoreModalOpen] = useState(false);
    const [newStoreName, setNewStoreName] = useState('');
    const [newStoreLocation, setNewStoreLocation] = useState('');

    useEffect(() => {
        setConfig(initialConfig);
    }, [initialConfig]);
    
    if (!config) {
        return <div>Loading configuration...</div>;
    }

    const handleToggle = (key: 'emailNotifications' | 'maintenanceMode') => {
        setConfig(prev => prev ? { ...prev, [key]: !prev[key] } : null);
    };

    // Generic Add/Remove for Roles and Locations
    const handleAddItem = (type: 'jobRoles' | 'locations', value: string) => {
        if (!value.trim()) return;
        setConfig(prev => prev ? { ...prev, [type]: [...prev[type], value.trim()] } : null);
    };
    
    const handleRemoveItem = (type: 'jobRoles' | 'locations', index: number) => {
        setConfig(prev => prev ? { ...prev, [type]: prev[type].filter((_, i) => i !== index) } : null);
    };

    // Specific handlers for Stores
    const handleAddStore = () => {
        if (!newStoreName.trim() || !newStoreLocation.trim()) return;
        const newStore: Store = {
            id: `store_${Date.now()}`,
            name: newStoreName.trim(),
            location: newStoreLocation.trim(),
        };
        setConfig(prev => prev ? { ...prev, stores: [...prev.stores, newStore] } : null);
        setNewStoreName('');
        setNewStoreLocation('');
        setIsAddStoreModalOpen(false);
    };

    const handleRemoveStore = (id: string) => {
        setConfig(prev => prev ? { ...prev, stores: prev.stores.filter(store => store.id !== id) } : null);
    };
    
    const handleSaveConfig = async () => {
        if (config) {
            setIsSaving(true);
            await onSave(config);
            setIsSaving(false);
            alert('Panel configuration saved!');
        }
    };
    
    const Card: React.FC<{ title: string; onAdd: () => void; children: React.ReactNode }> = ({ title, onAdd, children }) => (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-800">{title}</h4>
                <button onClick={onAdd} className="text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-semibold px-3 py-1 rounded-md transition-colors">
                    + Add New
                </button>
            </div>
            <div className="flex-grow min-h-[12rem] max-h-[12rem] overflow-y-auto pr-2">
                {children}
            </div>
        </div>
    );
    
    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800">Panel Configuration</h3>

            {/* Toggles */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-200">
                <div className="flex justify-between items-center p-4">
                    <div>
                        <p className="font-semibold text-gray-800">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive emails for new applications.</p>
                    </div>
                    <ToggleSwitch enabled={!!config.emailNotifications} onChange={() => handleToggle('emailNotifications')} />
                </div>
                <div className="flex justify-between items-center p-4">
                    <div>
                        <p className="font-semibold text-gray-800">Maintenance Mode</p>
                        <p className="text-sm text-gray-500">Prevent users from accessing the portal.</p>
                    </div>
                    <ToggleSwitch enabled={!!config.maintenanceMode} onChange={() => handleToggle('maintenanceMode')} />
                </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Job Roles" onAdd={() => setIsAddRoleModalOpen(true)}>
                    <ul className="space-y-2">
                        {config.jobRoles.length > 0 ? config.jobRoles.map((role, index) => (
                            <li key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded-md text-sm">
                                <span>{role}</span>
                                <button onClick={() => handleRemoveItem('jobRoles', index)} className="text-xl text-gray-400 hover:text-red-600">&times;</button>
                            </li>
                        )) : <p className="text-center text-sm text-gray-400 mt-12">No job roles added.</p>}
                    </ul>
                </Card>
                <Card title="Locations" onAdd={() => setIsAddLocationModalOpen(true)}>
                    <ul className="space-y-2">
                         {config.locations.length > 0 ? config.locations.map((loc, index) => (
                            <li key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded-md text-sm">
                                <span>{loc}</span>
                                <button onClick={() => handleRemoveItem('locations', index)} className="text-xl text-gray-400 hover:text-red-600">&times;</button>
                            </li>
                        )) : <p className="text-center text-sm text-gray-400 mt-12">No locations added.</p>}
                    </ul>
                </Card>
                <Card title="Store Names" onAdd={() => setIsAddStoreModalOpen(true)}>
                    <ul className="space-y-2">
                        {config.stores.length > 0 ? config.stores.map(store => (
                            <li key={store.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-md text-sm">
                                <div>
                                    <p>{store.name}</p>
                                    <p className="text-xs text-gray-500">{store.location}</p>
                                </div>
                                <button onClick={() => handleRemoveStore(store.id)} className="text-xl text-gray-400 hover:text-red-600">&times;</button>
                            </li>
                        )) : <p className="text-center text-sm text-gray-400 mt-12">No stores added.</p>}
                    </ul>
                </Card>
            </div>
            
            <div className="flex justify-end pt-4">
                <Button onClick={handleSaveConfig} loading={isSaving}>Save Changes</Button>
            </div>
            
            {/* Modals */}
            <Modal isOpen={isAddRoleModalOpen} onClose={() => setIsAddRoleModalOpen(false)} title="Add Job Role">
                <Input id="new-role" label="Role Name" value={newRole} onChange={e => setNewRole(e.target.value)} />
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="secondary" onClick={() => setIsAddRoleModalOpen(false)}>Cancel</Button>
                    <Button onClick={() => { handleAddItem('jobRoles', newRole); setNewRole(''); setIsAddRoleModalOpen(false); }}>Add</Button>
                </div>
            </Modal>

            <Modal isOpen={isAddLocationModalOpen} onClose={() => setIsAddLocationModalOpen(false)} title="Add Location">
                <Input id="new-location" label="Location Name" value={newLocation} onChange={e => setNewLocation(e.target.value)} />
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="secondary" onClick={() => setIsAddLocationModalOpen(false)}>Cancel</Button>
                    <Button onClick={() => { handleAddItem('locations', newLocation); setNewLocation(''); setIsAddLocationModalOpen(false); }}>Add</Button>
                </div>
            </Modal>

            <Modal isOpen={isAddStoreModalOpen} onClose={() => setIsAddStoreModalOpen(false)} title="Add Store Name">
                <div className="space-y-4">
                    <Input id="new-store-name" label="Store Name" value={newStoreName} onChange={e => setNewStoreName(e.target.value)} required />
                    <div>
                        <label htmlFor="new-store-location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <select id="new-store-location" value={newStoreLocation} onChange={e => setNewStoreLocation(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required>
                            <option value="">Select a location</option>
                            {config.locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4 border-t pt-4">
                    <Button variant="secondary" onClick={() => setIsAddStoreModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddStore}>Add Store</Button>
                </div>
            </Modal>
        </div>
    );
};

const PermissionsView: React.FC = () => {
    const roles = ['Admin', 'HR', 'Team Lead', 'Partner'];
    const permissionsList = [
        'Manage Job Board',
        'Vendor Directory',
        'Demo Requests',
        'Revenue',
    ];

    // Initial state for permissions. In a real app, this would be fetched.
    const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({
        'Admin': permissionsList.reduce((acc, p) => ({ ...acc, [p]: true }), {}),
        'HR': {
            'Manage Job Board': true, 'Vendor Directory': false,
            'Demo Requests': false, 'Revenue': false
        },
        'Team Lead': {
            'Manage Job Board': false, 'Vendor Directory': false,
            'Demo Requests': false, 'Revenue': false
        },
        'Partner': {
            'Manage Job Board': false, 'Vendor Directory': false,
            'Demo Requests': false, 'Revenue': false
        }
    });

    const handleToggle = (role: string, permission: string) => {
        if (role === 'Admin') return;
        setPermissions(prev => {
            const updatedRolePermissions = {
                ...(prev[role] || {}),
                [permission]: !prev[role]?.[permission]
            };
            return {
                ...prev,
                [role]: updatedRolePermissions
            };
        });
    };

    const handleSave = () => {
        // In a real app, you'd save this to your backend/Firebase.
        console.log('Saving permissions:', permissions);
        alert('Permissions saved successfully!');
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Role Permissions</h3>
                <Button onClick={handleSave}>Save Permissions</Button>
            </div>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Permission</th>
                            {roles.map(role => (
                                <th key={role} className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{role}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {permissionsList.map(permission => (
                            <tr key={permission} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{permission}</td>
                                {roles.map(role => (
                                    <td key={role} className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex justify-center">
                                            <ToggleSwitch
                                                enabled={permissions[role]?.[permission] || false}
                                                onChange={() => handleToggle(role, permission)}
                                                disabled={role === 'Admin'}
                                            />
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

interface Role {
  id: string;
  name: string;
  panel: 'Admin' | 'HR' | 'Team' | 'Partner' | 'Candidate';
}

const RoleManagementView: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [name, setName] = useState('');
    const [panel, setPanel] = useState<Role['panel']>('HR');

    const handleAddRole = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert("Role name cannot be empty.");
            return;
        }
        const newRole: Role = { id: `role_${Date.now()}`, name, panel };
        setRoles([...roles, newRole]);
        
        // Reset form
        setName('');
        setPanel('HR');
    };

    const handleDeleteRole = (id: string) => {
        if (window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
            setRoles(roles.filter(r => r.id !== id));
        }
    };


    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add New Role Form */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Add New Role</h3>
                <form onSubmit={handleAddRole} className="space-y-6">
                    <Input
                        id="roleName"
                        label="Role Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g., Senior HR"
                        required
                    />
                    <div>
                        <label htmlFor="assignPanel" className="block text-sm font-medium text-gray-700 mb-1">Assign Panel</label>
                        <select
                            id="assignPanel"
                            value={panel}
                            onChange={e => setPanel(e.target.value as Role['panel'])}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="HR">HR Panel</option>
                            <option value="Admin">Admin Panel</option>
                            <option value="Team">Team Panel</option>
                            <option value="Partner">Partner Panel</option>
                            <option value="Candidate">Candidate Panel</option>
                        </select>
                    </div>
                    <Button type="submit" variant="primary" className="w-full justify-center bg-indigo-600 hover:bg-indigo-700">
                        Add Role
                    </Button>
                </form>
            </div>

            {/* Existing Roles List */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Existing Roles ({roles.length})</h3>
                <div className="overflow-x-auto">
                    {roles.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Panel</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {roles.map(role => (
                                    <tr key={role.id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{role.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{role.panel} Panel</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Button variant="danger" size="sm" onClick={() => handleDeleteRole(role.id)}>Delete</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex items-center justify-center h-full min-h-[200px]">
                             <p className="text-center text-gray-500">No roles added yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const MyAccountView: React.FC<{ currentUserProfile?: UserProfile | null }> = ({ currentUserProfile }) => {
    // State for personal information form
    const [personalInfo, setPersonalInfo] = useState({
        name: '',
        email: '',
        phone: ''
    });

    // State for password change form
    const [passwordInfo, setPasswordInfo] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    
    useEffect(() => {
        if(currentUserProfile) {
            setPersonalInfo({
                name: currentUserProfile.name || 'Admin User',
                email: currentUserProfile.email || 'rkrohit19kumar@gmail.com',
                phone: currentUserProfile.phone || '+1 234 567 890'
            });
        }
    }, [currentUserProfile]);


    const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPersonalInfo(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordInfo(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSaveChanges = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you would call a function to update the user profile here.
        alert('Personal information saved!');
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordInfo.newPassword !== passwordInfo.confirmNewPassword) {
            alert("New passwords do not match.");
            return;
        }
        if (!passwordInfo.newPassword) {
            alert("New password cannot be empty.");
            return;
        }
        // Password change logic would go here.
        alert('Password changed successfully!');
        setPasswordInfo({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    };


    if (!currentUserProfile) {
        return <p>Loading profile...</p>;
    }
    
    const initial = personalInfo.name ? personalInfo.name.charAt(0).toUpperCase() : 'A';
    const role = currentUserProfile.userType ? currentUserProfile.userType.charAt(0) + currentUserProfile.userType.slice(1).toLowerCase() : 'Admin';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Profile Avatar */}
            <div className="lg:col-span-1 flex flex-col items-center text-center p-4">
                 <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-5xl font-bold mb-4 border-4 border-white shadow-md">
                    {initial}
                </div>
                <h2 className="text-xl font-bold text-gray-800">{personalInfo.name}</h2>
                <p className="text-gray-500">{role}</p>
                <Button variant="secondary" className="mt-6">Change Photo</Button>
            </div>

            {/* Right Column: Forms */}
            <div className="lg:col-span-2 space-y-10">
                {/* Personal Information Form */}
                <form onSubmit={handleSaveChanges}>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h3>
                    <div className="space-y-4">
                        <Input 
                            id="fullName" 
                            name="name" 
                            label="Full Name" 
                            value={personalInfo.name} 
                            onChange={handlePersonalInfoChange} 
                        />
                        <Input 
                            id="emailAddress" 
                            name="email"
                            label="Email Address" 
                            type="email" 
                            value={personalInfo.email} 
                            onChange={handlePersonalInfoChange}
                            disabled 
                        />
                        <Input 
                            id="phoneNumber" 
                            name="phone"
                            label="Phone Number" 
                            type="tel" 
                            value={personalInfo.phone} 
                            onChange={handlePersonalInfoChange} 
                        />
                    </div>
                     <div className="flex justify-end mt-6">
                        <Button type="submit" variant='primary' className='bg-indigo-600 hover:bg-indigo-700'>Save Changes</Button>
                    </div>
                </form>

                {/* Change Password Form */}
                <form onSubmit={handleChangePassword} className="border-t border-gray-200 pt-8">
                     <h3 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h3>
                     <div className="space-y-4">
                        <Input 
                            id="currentPassword" 
                            name="currentPassword"
                            label="Current Password" 
                            type="password" 
                            value={passwordInfo.currentPassword}
                            onChange={handlePasswordInfoChange}
                            autoComplete="current-password"
                        />
                        <Input 
                            id="newPassword" 
                            name="newPassword"
                            label="New Password" 
                            type="password" 
                            value={passwordInfo.newPassword}
                            onChange={handlePasswordInfoChange}
                             autoComplete="new-password"
                        />
                        <Input 
                            id="confirmNewPassword" 
                            name="confirmNewPassword"
                            label="Confirm New Password" 
                            type="password" 
                            value={passwordInfo.confirmNewPassword}
                            onChange={handlePasswordInfoChange}
                            autoComplete="new-password"
                        />
                     </div>
                     <div className="flex justify-end mt-6">
                        <Button type="submit" variant='primary' className='bg-indigo-600 hover:bg-indigo-700'>Change Password</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

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
    const [activeTab, setActiveTab] = useState<SettingsTab>('My Account');
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

    const handleDeleteMember = (emailToDelete: string) => {
        if (window.confirm("Are you sure you want to remove this team member?")) {
            setTeamMembers(prev => prev.filter(member => member.email !== emailToDelete));
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
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reporting Manager</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salary</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {teamMembers.length > 0 ? teamMembers.map((member) => (
                                            <tr key={member.email}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">{member.name}</div>
                                                    <div className="text-sm text-gray-500">{member.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.role}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.reportingManager}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.salary}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                    <Button variant="ghost" size="sm">Edit</Button>
                                                    <Button variant="danger" size="sm" onClick={() => handleDeleteMember(member.email)}>Delete</Button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                    No team members added yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <AddTeamMemberModal
                            isOpen={isTeamModalOpen}
                            onClose={() => setIsTeamModalOpen(false)}
                            onSave={(data) => {
                                setTeamMembers(prev => [...prev, data]);
                                setIsTeamModalOpen(false);
                            }}
                            availableLocations={panelConfig?.locations || []}
                            availableVendors={vendors.map(v => v.brandName)}
                        />
                    </div>
                );
            case 'Permissions':
                return <PermissionsView />;
            case 'Role':
                 return <RoleManagementView />;
            case 'Panel Options':
                 return (
                    <PanelConfigurationView
                        initialConfig={panelConfig}
                        onSave={onUpdatePanelConfig}
                    />
                );
            case 'My Account':
                 return <MyAccountView currentUserProfile={currentUserProfile} />;
            case 'Branding':
                return (
                    <BrandingView
                        branding={branding}
                        onUpdateBranding={onUpdateBranding}
                        currentLogoSrc={currentLogoSrc}
                        onLogoUpload={onLogoUpload}
                    />
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


const BrandingView: React.FC<{
    branding: BrandingConfig;
    onUpdateBranding: (branding: BrandingConfig) => void;
    currentLogoSrc: string | null;
    onLogoUpload: (base64Image: string) => void;
}> = ({ branding, onUpdateBranding, currentLogoSrc, onLogoUpload }) => {
    
    const [localBranding, setLocalBranding] = useState(branding);
    const [logoPreview, setLogoPreview] = useState<string | null>(currentLogoSrc);
    const [logoFile, setLogoFile] = useState<File | null>(null);

    useEffect(() => {
        setLocalBranding(branding);
    }, [branding]);

     useEffect(() => {
        setLogoPreview(currentLogoSrc);
    }, [currentLogoSrc]);

    const handleBrandingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const keys = name.split('.');
        if (keys.length === 2) {
            const key0 = keys[0] as 'hireTalent' | 'becomePartner';
            const key1 = keys[1] as keyof BannerConfig;
            
            setLocalBranding(prev => ({
                ...prev,
                [key0]: {
                    ...prev[key0],
                    [key1]: value
                }
            }));
        } else if (name === 'portalName') {
             setLocalBranding(prev => ({ ...prev, portalName: value }));
        }
    };

    const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file (e.g., .png, .jpg, .jpeg).');
                return;
            }
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };
    
    const handleBannerImageChange = (banner: 'hireTalent' | 'becomePartner', event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    setLocalBranding(prev => ({
                        ...prev,
                        [banner]: {
                            ...prev[banner],
                            backgroundImage: reader.result,
                        }
                    }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveAllBranding = () => {
        onUpdateBranding(localBranding);

        if (logoFile) {
            const reader = new FileReader();
            reader.readAsDataURL(logoFile);
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    onLogoUpload(reader.result);
                    setLogoFile(null);
                }
            };
        }
        alert('Branding settings saved!');
    };


    return (
         <div className="space-y-8">
            <div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">Portal Logo & Name</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Portal Logo</label>
                        <div className="flex items-center gap-4">
                            <label htmlFor="logo-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Choose file
                            </label>
                            <input id="logo-upload" type="file" className="sr-only" onChange={handleLogoFileChange} accept="image/*" />
                            <span className="text-sm text-gray-500">{logoFile ? logoFile.name : (currentLogoSrc ? 'Logo uploaded' : 'No file chosen')}</span>
                            {logoPreview && <div className="w-10 h-10 border rounded-md p-1 flex items-center justify-center"><img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain" /></div>}
                        </div>
                    </div>
                    <Input 
                        id="portalName"
                        name="portalName"
                        label="Portal Name"
                        value={localBranding.portalName}
                        onChange={handleBrandingChange}
                        wrapperClassName="mb-0"
                    />
                </div>
            </div>

            <div className="space-y-4 pt-6 border-t">
                <h4 className="text-xl font-bold text-gray-900">Hire Top Talent Banner</h4>
                <Input id="hireTalent.title" name="hireTalent.title" label="Title" value={localBranding.hireTalent.title} onChange={handleBrandingChange} />
                <Input id="hireTalent.description" name="hireTalent.description" label="Description" value={localBranding.hireTalent.description} onChange={handleBrandingChange} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Background Image</label>
                        <div className="flex items-center gap-4">
                            <label htmlFor="hire-bg-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Choose file
                            </label>
                            <input id="hire-bg-upload" type="file" className="sr-only" onChange={(e) => handleBannerImageChange('hireTalent', e)} accept="image/*" />
                            <span className="text-sm text-gray-500">{localBranding.hireTalent.backgroundImage ? 'Image selected' : 'No file chosen'}</span>
                        </div>
                    </div>
                    <Input wrapperClassName="mb-0" id="hireTalent.link" name="hireTalent.link" label="Page Link" value={localBranding.hireTalent.link} onChange={handleBrandingChange} placeholder="https://example.com/hire" />
                </div>
            </div>

            <div className="space-y-4 pt-6 border-t">
                <h4 className="text-xl font-bold text-gray-900">Become a Partner Banner</h4>
                <Input id="becomePartner.title" name="becomePartner.title" label="Title" value={localBranding.becomePartner.title} onChange={handleBrandingChange} />
                <Input id="becomePartner.description" name="becomePartner.description" label="Description" value={localBranding.becomePartner.description} onChange={handleBrandingChange} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Background Image</label>
                        <div className="flex items-center gap-4">
                            <label htmlFor="partner-bg-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Choose file
                            </label>
                            <input id="partner-bg-upload" type="file" className="sr-only" onChange={(e) => handleBannerImageChange('becomePartner', e)} accept="image/*" />
                            <span className="text-sm text-gray-500">{localBranding.becomePartner.backgroundImage ? 'Image selected' : 'No file chosen'}</span>
                        </div>
                    </div>
                    <Input wrapperClassName="mb-0" id="becomePartner.link" name="becomePartner.link" label="Page Link" value={localBranding.becomePartner.link} onChange={handleBrandingChange} placeholder="https://example.com/register" />
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t">
                <Button onClick={handleSaveAllBranding}>Save Branding</Button>
            </div>
        </div>
    );
};

export default SettingsView;
