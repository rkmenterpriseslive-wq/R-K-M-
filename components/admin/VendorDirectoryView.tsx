
import React, { useState, useEffect, useMemo } from 'react';
import { getVendors, createVendor, updateVendor, getPanelConfig } from '../../services/firebaseService';
import { PanelConfig, Vendor as VendorType } from '../../types'; // Renamed Vendor import to VendorType
import Button from '../Button';
import Input from '../Input';
import Modal from '../Modal';
import VendorForm from './VendorForm'; // Import the new VendorForm component

// Using the updated VendorType from types.ts
interface Vendor extends VendorType {}


const VendorDirectoryView: React.FC = () => {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [panelConfig, setPanelConfig] = useState<PanelConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [vendorData, config] = await Promise.all([getVendors(), getPanelConfig()]);
            setVendors(vendorData as Vendor[]);
            setPanelConfig(config);
        } catch (error) {
            console.error("Error loading vendor data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (vendor: Vendor | null = null) => {
        setEditingVendor(vendor); // Pass the entire vendor object for editing
        setIsModalOpen(true);
    };

    const handleSaveVendor = async (vendorData: Omit<Vendor, 'id' | 'status'>) => {
        try {
            if (editingVendor) {
                // When updating, preserve the original status
                await updateVendor(editingVendor.id, { ...vendorData, status: editingVendor.status });
                alert('Vendor updated successfully!');
            } else {
                await createVendor({ ...vendorData, status: 'Active' });
                alert('Vendor added successfully!');
            }
            await loadData(); // IMPORTANT: Await data loading before closing the modal
            setIsModalOpen(false); // Close the modal *after* data is refreshed
        } catch (error) {
            alert('Failed to save vendor.');
            console.error("Error saving vendor:", error);
        }
    };
    
    const filteredVendors = useMemo(() => {
        return vendors.filter(v => 
            v.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [vendors, searchTerm]);

    const selectStyles = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white";

    const getContactString = (email?: string, phone?: string): string => {
        const e = email || '';
        const p = phone || '';
    
        if (e && p && e.includes(p)) {
            return e;
        }
        if (e && p && p.includes(e)) {
            return p;
        }
        return [e, p].filter(Boolean).join(' | ');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Vendor Directory</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage your business partners and brand affiliations.</p>
                </div>
                <Button variant="primary" onClick={() => handleOpenModal()} className="shadow-lg px-6 py-2.5">
                    + Add New Vendor
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Partners</h4>
                    <p className="text-4xl font-black text-blue-600 mt-1">{[...new Set(vendors.map(v => v.partnerName))].length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active Brands</h4>
                    <p className="text-4xl font-black text-green-600 mt-1">{vendors.length}</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <Input 
                    id="vendorSearch" 
                    placeholder="Search by Partner, Brand or Contact Person..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)}
                    wrapperClassName="mb-0"
                />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Partner / Brand</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Contact Details</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Locations</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr><td colSpan={4} className="text-center py-20 text-gray-400 italic">Loading vendors...</td></tr>
                            ) : filteredVendors.length > 0 ? filteredVendors.map(vendor => (
                                <tr key={vendor.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900">{vendor.partnerName}</div>
                                        <div className="text-xs text-blue-600 font-semibold">{vendor.brandName}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{vendor.contactPerson}</div>
                                        <div className="text-xs text-gray-500">{getContactString(vendor.email, vendor.phone)}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {vendor.operationalLocations?.slice(0, 3).map(loc => (
                                                <span key={loc} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">{loc}</span>
                                            ))}
                                            {vendor.operationalLocations?.length > 3 && <span className="text-[10px] text-gray-400">+{vendor.operationalLocations.length - 3} more</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleOpenModal(vendor)}>Edit</Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="text-center py-20 text-gray-500">No vendors found matching your search.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {panelConfig && (
                <Modal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    title={editingVendor ? 'Edit Vendor Details' : 'Add New Vendor'}
                    maxWidth="max-w-2xl"
                >
                    <VendorForm
                        vendor={editingVendor}
                        panelConfig={panelConfig}
                        onSave={handleSaveVendor}
                        onClose={() => setIsModalOpen(false)}
                    />
                </Modal>
            )}
        </div>
    );
};

export default VendorDirectoryView;
