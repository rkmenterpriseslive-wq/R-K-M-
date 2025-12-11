import React, { useState, useMemo, useEffect } from 'react';
import Button from '../Button';
import Modal from '../Modal';

interface Payslip {
    id: string;
    month: string;
    year: number;
    netSalary: number;
    earnings: { label: string, amount: number }[];
    deductions: { label: string, amount: number }[];
}

const MOCK_PAYSLIPS: Payslip[] = [];

const formatCurrency = (amount: number) => `₹ ${amount.toLocaleString('en-IN')}`;

const PayslipModalContent: React.FC<{ payslip: Payslip }> = ({ payslip }) => {
    const totalEarnings = payslip.earnings.reduce((sum, item) => sum + item.amount, 0);
    const totalDeductions = payslip.deductions.reduce((sum, item) => sum + item.amount, 0);

    return (
        <div className="text-sm">
            <div className="text-center mb-6">
                <h3 className="font-bold text-xl">Payslip for {payslip.month} {payslip.year}</h3>
                <p className="text-gray-600">Employee ID: EMP12345</p>
            </div>
            <div className="grid grid-cols-2 gap-8">
                <div>
                    <h4 className="font-bold border-b pb-2 mb-2">Earnings</h4>
                    {payslip.earnings.map(item => (
                        <div key={item.label} className="flex justify-between py-1"><span>{item.label}</span><span>{formatCurrency(item.amount)}</span></div>
                    ))}
                </div>
                <div>
                    <h4 className="font-bold border-b pb-2 mb-2">Deductions</h4>
                    {payslip.deductions.map(item => (
                        <div key={item.label} className="flex justify-between py-1"><span>{item.label}</span><span>{formatCurrency(item.amount)}</span></div>
                    ))}
                </div>
            </div>
            <div className="mt-6 border-t pt-4">
                <div className="flex justify-between font-bold"><span>Gross Earnings</span><span>{formatCurrency(totalEarnings)}</span></div>
                <div className="flex justify-between font-bold mt-2"><span>Total Deductions</span><span>-{formatCurrency(totalDeductions)}</span></div>
                <div className="flex justify-between font-bold text-lg mt-4 text-green-600 bg-green-50 p-3 rounded-lg"><span>Net Salary</span><span>{formatCurrency(payslip.netSalary)}</span></div>
            </div>
        </div>
    );
};

const MyPayslipsView: React.FC = () => {
    const [selectedMonth, setSelectedMonth] = useState('');
    const [payslips] = useState<Payslip[]>(MOCK_PAYSLIPS);
    const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

     useEffect(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        setSelectedMonth(`${year}-${month}`);
    }, []);

    const filteredPayslips = useMemo(() => {
        if (!selectedMonth) return payslips;
        const [year, monthNum] = selectedMonth.split('-');
        const monthName = new Date(parseInt(year), parseInt(monthNum) - 1, 1).toLocaleString('default', { month: 'long' });
        return payslips.filter(p => p.month === monthName && p.year.toString() === year);
    }, [payslips, selectedMonth]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-3xl font-bold text-gray-800">My Payslips</h2>
                <div className="w-full sm:w-auto">
                    <label htmlFor="month-select" className="sr-only">Select Month</label>
                    <input 
                        type="month" 
                        id="month-select"
                        value={selectedMonth} 
                        onChange={e => setSelectedMonth(e.target.value)}
                        className="block w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPayslips.length > 0 ? filteredPayslips.map(p => (
                                <tr key={p.id}>
                                    <td className="px-6 py-4 font-medium text-gray-900">{p.month} {p.year}</td>
                                    <td className="px-6 py-4 text-right font-semibold text-green-600">{formatCurrency(p.netSalary)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedPayslip(p)}>View Details</Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3} className="text-center py-10 text-gray-500">No payslip found for the selected month.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedPayslip && (
                <Modal isOpen={!!selectedPayslip} onClose={() => setSelectedPayslip(null)} title="Payslip Details" maxWidth="max-w-xl">
                    <PayslipModalContent payslip={selectedPayslip} />
                </Modal>
            )}
        </div>
    );
};

export default MyPayslipsView;