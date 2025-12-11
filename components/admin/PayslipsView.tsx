import React, { useState, useMemo, FC, useEffect, useRef } from 'react';
import Button from '../Button';
import Modal from '../Modal';
import Input from '../Input';

// Add this line to inform TypeScript about the global html2pdf function
declare const html2pdf: any;

// --- DATA TYPES ---
interface PayrollEmployee {
    id: string;
    name: string;
    vendor: string;
    role: string;
    accountNumber: string;
    ifsc: string;
    grossSalary: number;
}

interface GeneratedPayslip extends PayrollEmployee {
    payslipDetails: PayslipDetails;
}

interface PayslipDetails {
    earnings: { label: string; amount: number }[];
    deductions: { label: string; amount: number }[];
    grossEarnings: number;
    totalDeductions: number;
    netSalary: number;
}

// --- MOCK DATA ---
const MOCK_EMPLOYEES: PayrollEmployee[] = [
    { id: 'EMP001', name: 'Ravi Kumar', vendor: 'Direct', role: 'Store Manager', accountNumber: '...XXXX1234', ifsc: 'HDFC000123', grossSalary: 35000 },
    { id: 'EMP002', name: 'Sunita Sharma', vendor: 'Vendor A', role: 'Picker', accountNumber: '...XXXX5678', ifsc: 'ICIC000567', grossSalary: 18000 },
    { id: 'EMP003', name: 'Amit Singh', vendor: 'Vendor A', role: 'Packer', accountNumber: '...XXXX9012', ifsc: 'SBIN000901', grossSalary: 19500 },
    { id: 'EMP004', name: 'Priya Verma', vendor: 'Direct', role: 'Team Leader', accountNumber: '...XXXX3456', ifsc: 'AXIS000345', grossSalary: 28000 },
    { id: 'EMP005', name: 'Mohan Das', vendor: 'Vendor B', role: 'Sales Executive', accountNumber: '...XXXX7890', ifsc: 'KKBK000789', grossSalary: 22000 },
];

// --- HELPER FUNCTIONS ---
const calculatePayslip = (grossSalary: number): PayslipDetails => {
    const basic = grossSalary * 0.5;
    const hra = grossSalary * 0.25;
    const specialAllowance = grossSalary * 0.25;
    const earnings = [{ label: 'Basic Salary', amount: basic }, { label: 'House Rent Allowance (HRA)', amount: hra }, { label: 'Special Allowance', amount: specialAllowance }];
    const pf = basic * 0.12;
    const esi = grossSalary <= 21000 ? grossSalary * 0.0075 : 0;
    const pt = grossSalary > 15000 ? 200 : 0;
    const deductions = [{ label: 'Provident Fund (PF)', amount: pf }, { label: 'Employee State Insurance (ESI)', amount: esi }, { label: 'Professional Tax (PT)', amount: pt }].filter(d => d.amount > 0);
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

const PayslipModalContent: FC<{ payslip: GeneratedPayslip, month: string }> = ({ payslip, month }) => {
    const payslipContentRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = () => {
        if (!payslipContentRef.current) return;
        setIsDownloading(true);
        const element = payslipContentRef.current;
        const opt = {
            margin:       0.5,
            filename:     `Payslip_${payslip.name.replace(' ', '_')}_${month}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().from(element).set(opt).save().then(() => setIsDownloading(false));
    };

    return (
        <div>
            <div ref={payslipContentRef} className="p-4 text-sm text-gray-800">
                <div className="text-center mb-6">
                    <h3 className="font-bold text-xl">Payslip for {month}</h3>
                    <p className="text-gray-600">{payslip.name} ({payslip.role})</p>
                    <p className="text-xs text-gray-500">R K M Career</p>
                </div>
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-bold border-b pb-2 mb-2">Earnings</h4>
                        {payslip.payslipDetails.earnings.map(item => (
                            <div key={item.label} className="flex justify-between py-1"><span>{item.label}</span><span>{formatCurrency(item.amount)}</span></div>
                        ))}
                    </div>
                    <div>
                        <h4 className="font-bold border-b pb-2 mb-2">Deductions</h4>
                        {payslip.payslipDetails.deductions.map(item => (
                            <div key={item.label} className="flex justify-between py-1"><span>{item.label}</span><span>{formatCurrency(item.amount)}</span></div>
                        ))}
                    </div>
                </div>
                <div className="mt-6 border-t pt-4">
                    <div className="flex justify-between font-bold"><span>Gross Earnings</span><span>{formatCurrency(payslip.payslipDetails.grossEarnings)}</span></div>
                    <div className="flex justify-between font-bold mt-2"><span>Total Deductions</span><span>{formatCurrency(payslip.payslipDetails.totalDeductions)}</span></div>
                    <div className="flex justify-between font-bold text-lg mt-4 text-green-600 bg-green-50 p-3 rounded-lg"><span>Net Salary</span><span>{formatCurrency(payslip.payslipDetails.netSalary)}</span></div>
                </div>
            </div>
            <div className="mt-6 text-center border-t pt-4">
                <Button variant="primary" onClick={handleDownload} loading={isDownloading}>Download PDF</Button>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const PayslipsView: FC = () => {
    const [selectedMonth, setSelectedMonth] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [generatedPayslips, setGeneratedPayslips] = useState<GeneratedPayslip[]>([]);
    const [selectedPayslip, setSelectedPayslip] = useState<GeneratedPayslip | null>(null);

    useEffect(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        setSelectedMonth(`${year}-${month}`);
    }, []);

    const handleGenerate = () => {
        const slips = MOCK_EMPLOYEES.map(emp => ({
            ...emp,
            payslipDetails: calculatePayslip(emp.grossSalary),
        }));
        setGeneratedPayslips(slips);
    };

    const filteredPayslips = useMemo(() => {
        return generatedPayslips.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [generatedPayslips, searchTerm]);

    const summary = useMemo(() => {
        const totalNetPay = filteredPayslips.reduce((sum, p) => sum + p.payslipDetails.netSalary, 0);
        const totalDeductions = filteredPayslips.reduce((sum, p) => sum + p.payslipDetails.totalDeductions, 0);
        const employeeCount = filteredPayslips.length;
        return { totalNetPay, totalDeductions, employeeCount };
    }, [filteredPayslips]);

    const selectedMonthName = useMemo(() => {
       if (!selectedMonth) return '';
       const [year, month] = selectedMonth.split('-');
       const date = new Date(parseInt(year), parseInt(month) - 1, 1);
       return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    }, [selectedMonth]);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Payslips</h2>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-end gap-4">
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Month</label>
                    <Input type="month" id="month-select" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} wrapperClassName="mb-0" />
                </div>
                <Button variant="primary" onClick={handleGenerate} className="w-full sm:w-auto">Generate Payslips</Button>
            </div>

            {generatedPayslips.length > 0 && (
                <div className="animate-fade-in space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard title="Total Employees" value={summary.employeeCount.toString()} color="text-blue-600" />
                        <StatCard title="Total Net Payout" value={formatCurrency(summary.totalNetPay)} color="text-green-600" />
                        <StatCard title="Total Deductions" value={formatCurrency(summary.totalDeductions)} color="text-red-600" />
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <Input type="text" id="search-employee" placeholder="Search by employee name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross Salary</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Deductions</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredPayslips.map(p => (
                                        <tr key={p.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{p.name}</div><div className="text-sm text-gray-500">{p.role}</div></td>
                                            <td className="px-6 py-4 text-right text-sm">{formatCurrency(p.payslipDetails.grossEarnings)}</td>
                                            <td className="px-6 py-4 text-right text-sm text-red-600">{formatCurrency(p.payslipDetails.totalDeductions)}</td>
                                            <td className="px-6 py-4 text-right text-sm font-bold text-green-600">{formatCurrency(p.payslipDetails.netSalary)}</td>
                                            <td className="px-6 py-4 text-right text-sm font-medium"><Button variant="ghost" size="sm" onClick={() => setSelectedPayslip(p)}>View Payslip</Button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {selectedPayslip && (
                <Modal isOpen={!!selectedPayslip} onClose={() => setSelectedPayslip(null)} title="Payslip Details" maxWidth="max-w-2xl">
                    <PayslipModalContent payslip={selectedPayslip} month={selectedMonthName} />
                </Modal>
            )}
        </div>
    );
};

export default PayslipsView;