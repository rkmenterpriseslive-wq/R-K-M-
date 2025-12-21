
import React, { useState, useMemo, useEffect } from 'react';
import { StoreEmployee } from '../../utils/supervisorService';
import * as supervisorService from '../../utils/supervisorService';
import Input from '../Input';
import Button from '../Button';
import { getUserProfileByMobile } from '../../services/firebaseService';
import CvPreviewModal from '../CvPreviewModal';
import { UserProfile } from '../../types';

const StoreEmployeesView: React.FC = () => {
    const [employees] = useState<StoreEmployee[]>(supervisorService.getStoreEmployees());
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
    const [isCvLoading, setIsCvLoading] = useState(false);

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp =>
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.role.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [employees, searchTerm]);

    const handleViewCv = async (mobile: string) => {
        setIsCvLoading(true);
        try {
            const profile = await getUserProfileByMobile(mobile);
            if (profile) setViewingProfile(profile);
            else alert("This employee has not uploaded a professional CV yet.");
        } catch (err) { alert("Error loading employee profile."); }
        finally { setIsCvLoading(false); }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Store Employees</h2>
            
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <Input
                    id="search"
                    label="Search by Name or Role"
                    placeholder="e.g., Aarav Sharma, Sales Associate..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    wrapperClassName="mb-0"
                />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joining Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredEmployees.length > 0 ? filteredEmployees.map(emp => (
                                <tr key={emp.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                                        <div className="text-xs text-gray-500">{emp.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(emp.joiningDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${emp.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Button variant="small-light" size="sm" onClick={() => handleViewCv(emp.phone)} loading={isCvLoading}>View CV</Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500 italic">No employees found in this store.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <CvPreviewModal isOpen={!!viewingProfile} onClose={() => setViewingProfile(null)} profile={viewingProfile} />
        </div>
    );
};

export default StoreEmployeesView;
