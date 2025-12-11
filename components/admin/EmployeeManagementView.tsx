import React, { useState, useEffect } from 'react';
import { Employee } from '../../types';
import * as employeeService from '../../utils/employeeService';
import Button from '../Button';
import Input from '../Input';
import Modal from '../Modal';

type PartialEmployee = Omit<Employee, 'status' | 'dateOfJoining' | 'address' | 'bankName' | 'accountNumber' | 'ifscCode' | 'panNumber' | 'aadhaarNumber' | 'grossSalary'>;

const EmployeeManagementView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'onboarding' | 'employees'>('onboarding');
    const [onboardingCandidates, setOnboardingCandidates] = useState<PartialEmployee[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<Partial<Employee> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setOnboardingCandidates(employeeService.getOnboardingCandidates());
        setEmployees(employeeService.getEmployees());
    };

    const openOnboardingModal = (candidate: PartialEmployee) => {
        setSelectedEmployee({ ...candidate, status: 'Onboarding' });
        setIsModalOpen(true);
    };

    const openEditModal = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedEmployee(null);
        setIsModalOpen(false);
    };

    const handleSave = (employeeData: Employee) => {
        if (employeeData.status === 'Onboarding') {
            employeeService.addEmployee({ ...employeeData, status: 'Active' });
        } else {
            employeeService.updateEmployee(employeeData);
        }
        loadData();
        closeModal();
    };

    const EmployeeForm: React.FC<{ employee: Partial<Employee>; onSave: (data: Employee) => void; onCancel: () => void }> = ({ employee, onSave, onCancel }) => {
        const [formData, setFormData] = useState<Partial<Employee>>(employee);
        const [esiCardFile, setEsiCardFile] = useState<File | null>(null);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        };
        
        const handleEsiFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) {
                setEsiCardFile(e.target.files[0]);
            }
        };

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            
            const finalData: Partial<Employee> = { ...formData };
            if (employee.status === 'Onboarding') {
                if (!esiCardFile) {
                    alert('Please upload the ESI Card before completing onboarding.');
                    return;
                }
                finalData.esiCardFileName = esiCardFile.name;
                finalData.onboardingStatus = 'Onboarding Complete';
            }
            
            onSave(finalData as Employee);
        };

        const documentChecklist = [
            'Resume / CV', 'Passport-size photo', 'Aadhar Card Copy', 'PAN Card Copy',
            'Bank Account Details', 'Family Details', 'Combined Family Photo'
        ];

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input id="name" name="name" label="Full Name" value={formData.name || ''} onChange={handleChange} required />
                    <Input id="email" name="email" label="Email" type="email" value={formData.email || ''} onChange={handleChange} required />
                    <Input id="phone" name="phone" label="Phone" type="tel" value={formData.phone || ''} onChange={handleChange} required />
                    <Input id="role" name="role" label="Role / Designation" value={formData.role || ''} onChange={handleChange} required />
                    <Input id="dateOfJoining" name="dateOfJoining" label="Date of Joining" type="date" value={formData.dateOfJoining || ''} onChange={handleChange} required />
                    <Input id="grossSalary" name="grossSalary" label="Gross Monthly Salary (₹)" type="number" value={formData.grossSalary || ''} onChange={handleChange} required />
                </div>
                <Input id="address" name="address" label="Full Address" value={formData.address || ''} onChange={handleChange} required />
                <fieldset className="border border-gray-300 rounded-lg p-4">
                    <legend className="text-sm font-medium text-gray-700 px-2">Bank Details</legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input wrapperClassName='mb-0' id="bankName" name="bankName" label="Bank Name" value={formData.bankName || ''} onChange={handleChange} required />
                        <Input wrapperClassName='mb-0' id="accountNumber" name="accountNumber" label="Account Number" value={formData.accountNumber || ''} onChange={handleChange} required />
                        <Input wrapperClassName='mb-0' id="ifscCode" name="ifscCode" label="IFSC Code" value={formData.ifscCode || ''} onChange={handleChange} required />
                    </div>
                </fieldset>
                <fieldset className="border border-gray-300 rounded-lg p-4">
                    <legend className="text-sm font-medium text-gray-700 px-2">Statutory Details</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <Input wrapperClassName='mb-0' id="panNumber" name="panNumber" label="PAN Number" value={formData.panNumber || ''} onChange={handleChange} required />
                         <Input wrapperClassName='mb-0' id="aadhaarNumber" name="aadhaarNumber" label="Aadhaar Number" value={formData.aadhaarNumber || ''} onChange={handleChange} required />
                    </div>
                </fieldset>

                {employee.status === 'Onboarding' && (
                    <fieldset className="border border-blue-300 rounded-lg p-4 bg-blue-50">
                        <legend className="text-sm font-medium text-blue-700 px-2">HR Onboarding Actions</legend>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Submitted Document Checklist</h4>
                                <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-700">
                                    {documentChecklist.map(doc => (
                                        <li key={doc} className="flex items-center">
                                            <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            {doc}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload ESI Card</label>
                                <input type="file" onChange={handleEsiFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200" required />
                                {esiCardFile && <p className="text-xs text-gray-600 mt-1">Selected file: {esiCardFile.name}</p>}
                            </div>
                        </div>
                    </fieldset>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                    <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={employee.status === 'Onboarding' && !esiCardFile}>
                        {employee.status === 'Onboarding' ? 'Mark Onboarding Complete' : 'Save Details'}
                    </Button>
                </div>
            </form>
        );
    };

    const renderTable = (data: (PartialEmployee | Employee)[], isEmployeeList: boolean) => (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            {isEmployeeList && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>}
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.length > 0 ? data.map(item => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.role}</td>
                                {isEmployeeList && 'status' in item && (
                                     <td className="px-6 py-4 whitespace-nowrap text-sm">
                                         <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {item.status}
                                         </span>
                                     </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {isEmployeeList ? (
                                        <Button variant="ghost" size="sm" onClick={() => openEditModal(item as Employee)}>View / Edit</Button>
                                    ) : (
                                        <Button variant="primary" size="sm" onClick={() => openOnboardingModal(item as PartialEmployee)}>Complete Onboarding</Button>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={isEmployeeList ? 5 : 4} className="text-center py-10 text-gray-500">No records found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Employee Management</h2>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('onboarding')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'onboarding' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        Onboarding Candidates ({onboardingCandidates.length})
                    </button>
                    <button onClick={() => setActiveTab('employees')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'employees' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        Employee List ({employees.length})
                    </button>
                </nav>
            </div>
            
            {activeTab === 'onboarding' ? renderTable(onboardingCandidates, false) : renderTable(employees, true)}

            {isModalOpen && selectedEmployee && (
                <Modal 
                    isOpen={isModalOpen} 
                    onClose={closeModal} 
                    title={selectedEmployee.status === 'Onboarding' ? 'Onboard Candidate' : 'Edit Employee Details'}
                    maxWidth="max-w-4xl"
                >
                    <EmployeeForm employee={selectedEmployee} onSave={handleSave} onCancel={closeModal} />
                </Modal>
            )}
        </div>
    );
};

export default EmployeeManagementView;