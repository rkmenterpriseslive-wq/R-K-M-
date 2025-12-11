import React, { useState, useMemo, FC, useEffect } from 'react';
import Button from '../Button';
import Modal from '../Modal';

// --- DATA TYPES ---
interface PayrollEmployee {
    id: string;
    name: string;
    vendor: string;
    role: string;
    accountNumber: string;
    ifsc: string;
    grossSalary: number;
    status: 'Pending' | 'Paid' | 'Failed';
}

interface PayslipDetails {
    earnings: { label: string; amount: number }[];
    deductions: { label: string; amount: number }[];
    grossEarnings: number;
    totalDeductions: number;
    netSalary: number;
}

// --- MOCK DATA ---
const MOCK_EMPLOYEES: PayrollEmployee[] = [];

// --- HELPER FUNCTIONS ---
const calculatePayslip = (grossSalary: number): PayslipDetails => {
    const basic = grossSalary * 0.5;
    const hra = grossSalary * 0.25;
    const specialAllowance = grossSalary * 0.25;

    const earnings = [
        { label: 'Basic Salary', amount: basic },
        { label: 'House Rent Allowance (HRA)', amount: hra },
        { label: 'Special Allowance', amount: specialAllowance },
    ];

    let pf = basic * 0.12;
    let esi = grossSalary <= 21000 ? grossSalary * 0.0075 : 0;
    let pt = grossSalary > 15000 ? 200 : 0;

    const deductions = [
        { label: 'Provident Fund (PF)', amount: pf },
        { label: 'Employee State Insurance (ESI)', amount: esi },
        { label: 'Professional Tax (PT)', amount: pt },
    ].filter(d => d.amount > 0);

    const grossEarnings = earnings.reduce((sum, item) => sum + item.amount, 0);
    const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);
    const netSalary = grossEarnings - totalDeductions;

    return { earnings, deductions, grossEarnings, totalDeductions, netSalary };
};

const formatCurrency = (amount: number) => `₹ ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// --- SUB-COMPONENTS ---
const StatCard: FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-500 mb-1">{title}</h4>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
);

const PayslipModalContent: FC<{ employee: PayrollEmployee, month: string }> = ({ employee, month }) => {
    const payslipDetails = calculatePayslip(employee.grossSalary);
    
    return (
        <div className="text-sm text-gray-800">
            <div className="text-center mb-6">
                <h3 className="font-bold text-xl">Payslip for {month}</h3>
                <p className="text-gray-600">{employee.name} ({employee.role})</p>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
                <div>
                    <h4 className="font-bold border-b pb-2 mb-2">Earnings</h4>
                    {payslipDetails.earnings.map(item => (
                        <div key={item.label} className="flex justify-between py-1">
                            <span>{item.label}</span>
                            <span>{formatCurrency(item.amount)}</span>
                        </div>
                    ))}
                </div>
                <div>
                    <h4 className="font-bold border-b pb-2 mb-2">Deductions</h4>
                     {payslipDetails.deductions.map(item => (
                        <div key={item.label} className="flex justify-between py-1">
                            <span>{item.label}</span>
                            <span>{formatCurrency(item.amount)}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6 border-t pt-4">
                <div className="flex justify-between font-bold">
                    <span>Gross Earnings</span>
                    <span>{formatCurrency(payslipDetails.grossEarnings)}</span>
                </div>
                 <div className="flex justify-between font-bold mt-2">
                    <span>Total Deductions</span>
                    <span>{formatCurrency(payslipDetails.totalDeductions)}</span>
                </div>
                 <div className="flex justify-between font-bold text-lg mt-4 text-green-600 bg-green-50 p-3 rounded-lg">
                    <span>Net Salary</span>
                    <span>{formatCurrency(payslipDetails.netSalary)}</span>
                </div>
            </div>
            <div className="mt-8 text-center">
                <Button variant="secondary" onClick={() => window.print()}>Print Payslip</Button>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---
const ManagePayrollView: FC = () => {
    const [employees, setEmployees] = useState<PayrollEmployee[]>([]);
    const [filters, setFilters] = useState({ month: '', status: '', vendor: '' });
    const [selectedEmployee, setSelectedEmployee] = useState<PayrollEmployee | null>(null);

    useEffect(() => {
        // In a real app, you would fetch employees here.
        // For now, it will be an empty list as MOCK_DATA is cleared.
        setEmployees(MOCK_EMPLOYEES);
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        setFilters(f => ({ ...f, month: `${year}-${month}`}));
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handlePay = (id: string) => {
        setEmployees(employees.map(emp => emp.id === id ? { ...emp, status: 'Paid' } : emp));
    };

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => 
            (filters.status === '' || emp.status === filters.status) &&
            (filters.vendor === '' || emp.vendor === filters.vendor)
        );
    }, [employees, filters]);

    const summary = useMemo(() => {
        const totalAmount = filteredEmployees.reduce((sum, emp) => sum + calculatePayslip(emp.grossSalary).netSalary, 0);
        const paidCount = filteredEmployees.filter(e => e.status === 'Paid').length;
        const pendingCount = filteredEmployees.filter(e => e.status === 'Pending').length;
        return { totalAmount, paidCount, pendingCount };
    }, [filteredEmployees]);
    
    const getStatusClasses = (status: PayrollEmployee['status']) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Failed': return 'bg-red-100 text-red-800';
        }
    };
    
    const selectedMonthName = useMemo(() => {
       if (!filters.month) return '';
       const [year, month] = filters.month.split('-');
       const date = new Date(parseInt(year), parseInt(month) - 1, 1);
       return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    }, [filters.month]);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Manage Payroll</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Payout" value={formatCurrency(summary.totalAmount)} color="text-blue-600" />
                <StatCard title="Employees Paid" value={summary.paidCount.toString()} color="text-green-600" />
                <StatCard title="Pending Payments" value={summary.pendingCount.toString()} color="text-yellow-600" />
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 w-full">
                    <label className="text-sm font-medium text-gray-700">Month</label>
                    <input type="month" name="month" value={filters.month} onChange={handleFilterChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="flex-1 w-full">
                    <label className="text-sm font-medium text-gray-700">Vendor</label>
                    <select name="vendor" value={filters.vendor} onChange={handleFilterChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                        <option value="">All Vendors</option>
                        <option value="Direct">Direct</option>
                        <option value="Vendor A">Vendor A</option>
                        <option value="Vendor B">Vendor B</option>
                    </select>
                </div>
                 <div className="flex-1 w-full">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <select name="status" value={filters.status} onChange={handleFilterChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                        <option value="">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Failed">Failed</option>
                    </select>
                </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank Details</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredEmployees.map(emp => {
                                const netSalary = calculatePayslip(emp.grossSalary).netSalary;
                                return (
                                <tr key={emp.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                                        <div className="text-sm text-gray-500">{emp.vendor} - {emp.role}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{emp.accountNumber}</div>
                                        <div className="text-sm text-gray-500">{emp.ifsc}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">{formatCurrency(netSalary)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(emp.status)}`}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedEmployee(emp)}>View Payslip</Button>
                                        {emp.status === 'Pending' && <Button variant="primary" size="sm" onClick={() => handlePay(emp.id)}>Pay Now</Button>}
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedEmployee && (
                <Modal isOpen={!!selectedEmployee} onClose={() => setSelectedEmployee(null)} title="Payslip Details" maxWidth="max-w-2xl">
                    <PayslipModalContent employee={selectedEmployee} month={selectedMonthName} />
                </Modal>
            )}
        </div>
    );
};

export default ManagePayrollView;