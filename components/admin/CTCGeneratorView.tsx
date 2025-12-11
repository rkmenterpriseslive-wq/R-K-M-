import React, { useState, useEffect } from 'react';
import Input from '../Input';
import Button from '../Button';
import Modal from '../Modal';
import { SalaryRule, getRules, saveRule, deleteRule, calculateBreakdownFromRule, calculateCTCFromNetSalary, CTCBreakdown, initialBreakdown } from '../../utils/salaryService';

const formatCurrency = (amount: number) => `₹ ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CTCGeneratorView: React.FC = () => {
    const [rules, setRules] = useState<SalaryRule[]>([]);
    const [isEditing, setIsEditing] = useState<SalaryRule | null>(null);

    // Form state for rules
    const [designation, setDesignation] = useState('');
    const [basicPercentage, setBasicPercentage] = useState('40');
    const [hraPercentage, setHraPercentage] = useState('50');
    const [conveyance, setConveyance] = useState('0');
    const [medical, setMedical] = useState('0');
    const [statutoryBonus, setStatutoryBonus] = useState('0');

    // State for Quick Calculator
    const [quickCtcType, setQuickCtcType] = useState<'monthly' | 'annual' | 'in-hand'>('annual');
    const [quickCtcAmount, setQuickCtcAmount] = useState('');
    const [showBreakdownModal, setShowBreakdownModal] = useState(false);
    const [breakdownResult, setBreakdownResult] = useState<CTCBreakdown | null>(null);


    useEffect(() => {
        setRules(getRules());
    }, []);

    const handleEditClick = (rule: SalaryRule) => {
        setIsEditing(rule);
        setDesignation(rule.designation);
        setBasicPercentage(rule.basic.percentage.toString());
        setHraPercentage(rule.hra.percentage.toString());
        setConveyance((rule.conveyance || 0).toString());
        setMedical((rule.medical || 0).toString());
        setStatutoryBonus((rule.statutoryBonus || 0).toString());
    };

    const handleCancelEdit = () => {
        setIsEditing(null);
        setDesignation('');
        setBasicPercentage('40');
        setHraPercentage('50');
        setConveyance('0');
        setMedical('0');
        setStatutoryBonus('0');
    };

    const handleDelete = (designation: string) => {
        if (window.confirm(`Are you sure you want to delete the rule for "${designation}"?`)) {
            deleteRule(designation);
            setRules(getRules());
        }
    };

    const handleSubmitRule = (e: React.FormEvent) => {
        e.preventDefault();
        const newRule: SalaryRule = {
            designation,
            basic: { percentage: parseFloat(basicPercentage), of: 'gross' },
            hra: { percentage: parseFloat(hraPercentage), of: 'basic' },
            conveyance: parseFloat(conveyance) || 0,
            medical: parseFloat(medical) || 0,
            statutoryBonus: parseFloat(statutoryBonus) || 0,
        };
        saveRule(newRule);
        setRules(getRules());
        handleCancelEdit(); // Reset form
    };

    const handleQuickCalculate = () => {
        const amount = parseFloat(quickCtcAmount);
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        let breakdown;
        if (quickCtcType === 'in-hand') {
            breakdown = calculateCTCFromNetSalary(amount, null); // Use default rule
        } else {
            const annualCTC = quickCtcType === 'monthly' ? amount * 12 : amount;
            breakdown = calculateBreakdownFromRule(annualCTC, null); // Use default rule
        }
        
        setBreakdownResult(breakdown);
        setShowBreakdownModal(true);
    };
    
    const getQuickCtcLabel = () => {
        if (quickCtcType === 'annual') return 'Enter Annual CTC';
        if (quickCtcType === 'monthly') return 'Enter Monthly CTC';
        return 'Enter Desired In-Hand Salary';
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Salary Structure Settings</h2>
            <p className="text-gray-600">
                Define the salary breakup rules for different designations. These rules will be automatically applied when generating offer letters.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit sticky top-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">{isEditing ? 'Edit Rule' : 'Add New Rule'}</h3>
                        <form onSubmit={handleSubmitRule} className="space-y-4">
                            <Input
                                id="designation"
                                label="Designation"
                                value={designation}
                                onChange={e => setDesignation(e.target.value)}
                                placeholder="e.g., Store Manager"
                                disabled={!!isEditing}
                                required
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary</label>
                                <div className="flex items-center gap-2">
                                    <Input id="basicPercentage" type="number" value={basicPercentage} onChange={e => setBasicPercentage(e.target.value)} wrapperClassName="flex-grow mb-0" required />
                                    <span className="text-gray-600 font-medium">% of Gross Salary</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">House Rent Allowance (HRA)</label>
                                <div className="flex items-center gap-2">
                                    <Input id="hraPercentage" type="number" value={hraPercentage} onChange={e => setHraPercentage(e.target.value)} wrapperClassName="flex-grow mb-0" required />
                                    <span className="text-gray-600 font-medium">% of Basic Salary</span>
                                </div>
                            </div>
                            <Input id="conveyance" label="Conveyance Allowance (Monthly, ₹)" type="number" value={conveyance} onChange={e => setConveyance(e.target.value)} />
                            <Input id="medical" label="Medical Allowance (Monthly, ₹)" type="number" value={medical} onChange={e => setMedical(e.target.value)} />
                            <Input id="statutoryBonus" label="Statutory Bonus (Monthly, ₹)" type="number" value={statutoryBonus} onChange={e => setStatutoryBonus(e.target.value)} />

                             <p className="text-xs text-gray-500 pt-2">
                                <strong>Note:</strong> Special Allowance will be the balancing component. PF (12%) and ESI (0.75% Emp. / 3.25% Emyr.) are calculated automatically.
                            </p>
                            <div className="flex gap-2 pt-2">
                                {isEditing && (
                                    <Button type="button" variant="secondary" onClick={handleCancelEdit} className="w-full justify-center">
                                        Cancel
                                    </Button>
                                )}
                                <Button type="submit" variant="primary" className="w-full justify-center">
                                    {isEditing ? 'Update Rule' : 'Save Rule'}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Quick CTC Calculator */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick CTC Calculator</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Calculation Type</label>
                                <div className="flex flex-wrap gap-4">
                                    <label className="flex items-center"><input type="radio" value="annual" checked={quickCtcType === 'annual'} onChange={() => setQuickCtcType('annual')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"/><span className="ml-2 text-sm text-gray-700">Annual CTC</span></label>
                                    <label className="flex items-center"><input type="radio" value="monthly" checked={quickCtcType === 'monthly'} onChange={() => setQuickCtcType('monthly')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"/><span className="ml-2 text-sm text-gray-700">Monthly CTC</span></label>
                                    <label className="flex items-center"><input type="radio" value="in-hand" checked={quickCtcType === 'in-hand'} onChange={() => setQuickCtcType('in-hand')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"/><span className="ml-2 text-sm text-gray-700">In-Hand (Monthly)</span></label>
                                </div>
                            </div>
                             <Input id="quickCtcAmount" label={getQuickCtcLabel()} type="number" value={quickCtcAmount} onChange={e => setQuickCtcAmount(e.target.value)} placeholder="Enter amount" />
                            <Button type="button" variant="primary" className="w-full justify-center" onClick={handleQuickCalculate}>Calculate Breakdown</Button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Basic</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">HRA</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fixed Allowances</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {rules.length > 0 ? rules.map(rule => (
                                        <tr key={rule.designation}>
                                            <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900">{rule.designation}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{rule.basic.percentage}% of Gross</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{rule.hra.percentage}% of Basic</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                                C: {rule.conveyance}, M: {rule.medical}, B: {rule.statutoryBonus}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleEditClick(rule)}>Edit</Button>
                                                <Button variant="danger" size="sm" onClick={() => handleDelete(rule.designation)}>Delete</Button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={5} className="text-center py-12 text-gray-500">No salary rules defined yet. Add a rule to get started.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            {breakdownResult && (
                <Modal isOpen={showBreakdownModal} onClose={() => setShowBreakdownModal(false)} title="CTC Breakdown" maxWidth="max-w-4xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2 pb-2 border-b">Monthly Breakdown</h4>
                            <table className="w-full">
                                <tbody>
                                    <tr className="font-bold bg-gray-50"><td className="p-2" colSpan={2}>A) Earnings</td></tr>
                                    <tr><td className="p-2">Basic Salary</td><td className="p-2 text-right">{formatCurrency(breakdownResult.monthly.basic)}</td></tr>
                                    <tr><td className="p-2">House Rent Allowance (HRA)</td><td className="p-2 text-right">{formatCurrency(breakdownResult.monthly.hra)}</td></tr>
                                    <tr><td className="p-2">Special Allowance</td><td className="p-2 text-right">{formatCurrency(breakdownResult.monthly.specialAllowance)}</td></tr>
                                    <tr className="font-bold bg-gray-100"><td>Gross Salary</td><td className="p-2 text-right">{formatCurrency(breakdownResult.monthly.gross)}</td></tr>
                                    <tr className="font-bold bg-gray-50"><td className="p-2" colSpan={2}>B) Deductions</td></tr>
                                    <tr><td className="p-2">Provident Fund (PF)</td><td className="p-2 text-right">{formatCurrency(breakdownResult.monthly.employeePF)}</td></tr>
                                    {breakdownResult.monthly.employeeESI > 0 && <tr><td className="p-2">ESI</td><td className="p-2 text-right">{formatCurrency(breakdownResult.monthly.employeeESI)}</td></tr>}
                                    <tr className="font-bold bg-gray-100"><td>Total Deductions</td><td className="p-2 text-right">{formatCurrency(breakdownResult.monthly.totalDeductions)}</td></tr>
                                    <tr className="font-bold bg-green-100 text-green-800 text-base"><td>Net Salary (Take Home)</td><td className="p-2 text-right">{formatCurrency(breakdownResult.monthly.netSalary)}</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2 pb-2 border-b">Annual Breakdown</h4>
                            <table className="w-full">
                                <tbody>
                                    <tr className="font-bold bg-gray-50"><td className="p-2" colSpan={2}>A) Earnings</td></tr>
                                    <tr><td className="p-2">Basic Salary</td><td className="p-2 text-right">{formatCurrency(breakdownResult.annual.basic)}</td></tr>
                                    <tr><td className="p-2">House Rent Allowance (HRA)</td><td className="p-2 text-right">{formatCurrency(breakdownResult.annual.hra)}</td></tr>
                                    <tr><td className="p-2">Special Allowance</td><td className="p-2 text-right">{formatCurrency(breakdownResult.annual.specialAllowance)}</td></tr>
                                    <tr className="font-bold bg-gray-100"><td>Gross Salary</td><td className="p-2 text-right">{formatCurrency(breakdownResult.annual.gross)}</td></tr>
                                    <tr className="font-bold bg-gray-50"><td className="p-2" colSpan={2}>B) Deductions</td></tr>
                                    <tr><td className="p-2">Provident Fund (PF)</td><td className="p-2 text-right">{formatCurrency(breakdownResult.annual.employeePF)}</td></tr>
                                    {breakdownResult.annual.employeeESI > 0 && <tr><td className="p-2">ESI</td><td className="p-2 text-right">{formatCurrency(breakdownResult.annual.employeeESI)}</td></tr>}
                                    <tr className="font-bold bg-gray-100"><td>Total Deductions</td><td className="p-2 text-right">{formatCurrency(breakdownResult.annual.totalDeductions)}</td></tr>
                                    <tr className="font-bold bg-green-100 text-green-800"><td>Net Salary (Take Home)</td><td className="p-2 text-right">{formatCurrency(breakdownResult.annual.netSalary)}</td></tr>
                                    <tr className="font-bold bg-gray-50"><td className="p-2" colSpan={2}>C) Employer Contributions</td></tr>
                                    <tr><td className="p-2">Employer PF</td><td className="p-2 text-right">{formatCurrency(breakdownResult.annual.employerPF)}</td></tr>
                                    {breakdownResult.annual.employerESI > 0 && <tr><td className="p-2">Employer ESI</td><td className="p-2 text-right">{formatCurrency(breakdownResult.annual.employerESI)}</td></tr>}
                                    <tr className="font-bold bg-blue-100 text-blue-800 text-base"><td>Cost To Company (CTC)</td><td className="p-2 text-right">{formatCurrency(breakdownResult.annual.ctc)}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default CTCGeneratorView;
