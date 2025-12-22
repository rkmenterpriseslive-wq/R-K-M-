
import React, { useState, useEffect } from 'react';
import { PanelConfig, UserType } from '../../types';
import Button from '../Button';

interface PermissionsViewProps {
    initialConfig: PanelConfig | null;
    onSave: (config: PanelConfig) => Promise<void>;
}

// These are the core roles we want to manage permissions for.
const ROLES_TO_MANAGE = [UserType.HR, UserType.TEAMLEAD, UserType.TEAM, UserType.PARTNER];
// These are the features/pages we want to control access to, matching the user's image.
const FEATURES_TO_MANAGE = ['Manage Job Board', 'Vendor Directory', 'Demo Requests', 'Revenue'];

// Map enum to display name for table headers
const ROLE_DISPLAY_NAMES: Record<string, string> = {
    [UserType.HR]: 'HR',
    [UserType.TEAMLEAD]: 'Team Lead',
    [UserType.TEAM]: 'Team Member',
    [UserType.PARTNER]: 'Partner',
};

const PermissionsView: React.FC<PermissionsViewProps> = ({ initialConfig, onSave }) => {
    const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Initialize state from props or create a default structure
        if (initialConfig?.permissions) {
            setPermissions(initialConfig.permissions);
        } else {
            const defaultPermissions: Record<string, Record<string, boolean>> = {};
            FEATURES_TO_MANAGE.forEach(feature => {
                defaultPermissions[feature] = {};
                ROLES_TO_MANAGE.forEach(role => {
                    defaultPermissions[feature][role] = false;
                });
            });
            setPermissions(defaultPermissions);
        }
    }, [initialConfig]);

    const handleCheckboxChange = (feature: string, role: UserType) => {
        setPermissions(prev => ({
            ...prev,
            [feature]: {
                ...prev[feature],
                [role]: !prev[feature]?.[role],
            },
        }));
    };

    const handleSave = async () => {
        if (initialConfig) {
            setIsSaving(true);
            try {
                const updatedConfig = { ...initialConfig, permissions };
                await onSave(updatedConfig);
                alert('Permissions saved successfully!');
            } catch (error) {
                console.error("Failed to save permissions:", error);
                alert("An error occurred while saving permissions.");
            } finally {
                setIsSaving(false);
            }
        }
    };

    if (!initialConfig) {
        return <div className="text-center p-12 text-gray-500">Loading permissions settings...</div>;
    }

    return (
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Page Access Permissions</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Page / Feature</th>
                            {ROLES_TO_MANAGE.map(role => (
                                <th key={role} className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {ROLE_DISPLAY_NAMES[role]}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {FEATURES_TO_MANAGE.map(feature => (
                            <tr key={feature} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{feature}</td>
                                {ROLES_TO_MANAGE.map(role => (
                                    <td key={role} className="px-6 py-4 whitespace-nowrap text-center">
                                        <input
                                            type="checkbox"
                                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            checked={permissions[feature]?.[role] || false}
                                            onChange={() => handleCheckboxChange(feature, role)}
                                            aria-label={`Allow ${ROLE_DISPLAY_NAMES[role]} to access ${feature}`}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-end mt-6">
                <Button onClick={handleSave} loading={isSaving} className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5">
                    Save Permissions
                </Button>
            </div>
        </div>
    );
};

export default PermissionsView;
