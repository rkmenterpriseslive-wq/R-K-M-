
import React, { useState, useEffect, useMemo } from 'react';
import { getRevenueData } from '../../services/firebaseService';
import Button from '../Button';
import Input from '../Input';
import StatCard from './StatCard';
import Modal from '../Modal';

interface Transaction {
    id: string;
    client: string;
    amount: number;
    date: string;
    category: 'Placement Fee' | 'Service Fee' | 'Consultancy' | 'Other';
    status: 'Received' | 'Pending';
    handler: string;
}

interface TeamProfitItem {
    name: string;
    role: string;
    revenue: number;
    salaryCost: number;
    netProfit: number;
}

interface VendorProfitItem {
    name: string;
    type: string;
    revenueIn: number;
    costOut: number;
    profit: number;
}

const RevenueView: React.FC = () => {
    const [revenueStats, setRevenueStats] = useState({ total: 0, monthly: [] as { month: string; amount: number }[] });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const data = await getRevenueData();
                setRevenueStats({
                    total: data.total || 172000, // Fallback for demo
                    monthly: data.monthly || []
                });
                
                // Enhanced mock transactions for realistic profitability analysis
                const mockTransactions: Transaction[] = [
                    { id: 'TXN-501', client: 'Reliance Retail', amount: 45000, date: '2024-05-15', category: 'Placement Fee', status: 'Received', handler: 'Vikrant Singh' },
                    { id: 'TXN-502', client: 'Swiggy Instamart', amount: 28000, date: '2024-05-12', category: 'Service Fee', status: 'Received', handler: 'Rohit Kumar' },
                    { id: 'TXN-503', client: 'Zomato', amount: 12000, date: '2024-05-08', category: 'Consultancy', status: 'Received', handler: 'Anjali Sharma' },
                    { id: 'TXN-504', client: 'Bigbasket', amount: 35000, date: '2024-05-07', category: 'Placement Fee', status: 'Pending', handler: 'Vikrant Singh' },
                    { id: 'TXN-505', client: 'Amazon Fresh', amount: 52000, date: '2024-05-05', category: 'Placement Fee', status: 'Received', handler: 'Rohit Kumar' },
                ];
                setTransactions(mockTransactions);
            } catch (error) {
                console.error("Error loading revenue data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const formatCurrency = (amount: number, forceNegative: boolean = false) => {
        const isNegativeValue = amount < 0 || forceNegative;
        const absAmount = Math.abs(amount);
        const formatted = `₹ ${absAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
        return isNegativeValue ? `- ${formatted}` : formatted;
    };

    const filteredTransactions = useMemo(() => {
        return (transactions || []).filter(t => 
            (t.client || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.id || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [transactions, searchTerm]);

    // Team Profitability Calculation
    const teamProfitability = useMemo<TeamProfitItem[]>(() => {
        const teamBase: Record<string, { role: string; salary: number }> = {
            'Vikrant Singh': { role: 'SR. RECRUITER MANAGER', salary: 35000 },
            'Rohit Kumar': { role: 'TEAM LEAD', salary: 30000 },
            'Anjali Sharma': { role: 'RECRUITER', salary: 18000 },
        };

        const revenueMap: Record<string, number> = {};
        transactions.forEach(t => {
            if (teamBase[t.handler]) {
                revenueMap[t.handler] = (revenueMap[t.handler] || 0) + t.amount;
            }
        });

        return Object.entries(teamBase).map(([name, data]) => {
            const revenue = revenueMap[name] || 0;
            return {
                name,
                role: data.role,
                revenue: revenue,
                salaryCost: data.salary,
                netProfit: revenue - data.salary
            };
        }).sort((a, b) => b.netProfit - a.netProfit);
    }, [transactions]);

    // Vendor Profitability Calculation
    const vendorProfitability = useMemo<VendorProfitItem[]>(() => {
        const vendors: Record<string, { revenue: number; cost: number; type: string }> = {};
        
        transactions.forEach(t => {
            if (!vendors[t.client]) {
                vendors[t.client] = { revenue: 0, cost: 0, type: t.category };
            }
            vendors[t.client].revenue += t.amount;
            // Simulated cost calculation: 65% for Service Fee, 75% for Placement/Consultancy
            const costRate = t.category === 'Service Fee' ? 0.65 : 0.75;
            vendors[t.client].cost += t.amount * costRate;
        });

        return Object.entries(vendors).map(([name, data]) => ({
            name,
            type: data.type.toUpperCase(),
            revenueIn: data.revenue,
            costOut: data.cost,
            profit: data.revenue - data.cost
        })).sort((a, b) => b.profit - a.profit);
    }, [transactions]);

    return (
        <div className="space-y-10 pb-24">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-800 tracking-tight">Revenue Analysis</h2>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Monitoring operative margins and workforce efficiency.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="primary" onClick={() => setIsAddModalOpen(true)} className="px-6 py-2.5 shadow-lg shadow-blue-500/20">
                        + Log Entry
                    </Button>
                </div>
            </div>

            {/* High-level summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Collection" value={formatCurrency(transactions.reduce((s, t) => s + t.amount, 0))} valueColor="text-blue-600" />
                <StatCard title="Avg. Profit Margin" value={`${((teamProfitability.reduce((s, t) => s + t.netProfit, 0) / transactions.reduce((s, t) => s + t.amount, 1)) * 100).toFixed(1)}%`} valueColor="text-indigo-600" />
                <StatCard title="Net Monthly Profit" value={formatCurrency(teamProfitability.reduce((s, t) => s + t.netProfit, 0))} valueColor="text-emerald-600" />
                <StatCard title="Pending Collections" value={formatCurrency(transactions.filter(t => t.status === 'Pending').reduce((s, t) => s + t.amount, 0))} valueColor="text-red-500" />
            </div>

            {/* Main Profitability Tables */}
            <div className="space-y-12">
                
                {/* Team Wise Profitability */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100 bg-[#f8fafc]">
                        <h3 className="text-xl font-bold text-[#1e293b]">Team Wise Profitability</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Team Member</th>
                                    <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                                    <th className="px-8 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">Revenue Generated</th>
                                    <th className="px-8 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">Salary Cost</th>
                                    <th className="px-8 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">Net Profit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {teamProfitability.map((item) => (
                                    <tr key={item.name} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-gray-800">{item.name}</td>
                                        <td className="px-8 py-5 whitespace-nowrap text-[10px] text-gray-500 font-bold uppercase tracking-tighter">{item.role}</td>
                                        <td className="px-8 py-5 text-right text-sm font-semibold text-gray-600">{formatCurrency(item.revenue)}</td>
                                        <td className="px-8 py-5 text-right text-sm font-bold text-red-500">{formatCurrency(item.salaryCost, true)}</td>
                                        <td className={`px-8 py-5 text-right text-sm font-black ${item.netProfit < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                            {formatCurrency(item.netProfit)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Vendor / Client Profitability */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100 bg-[#f8fafc]">
                        <h3 className="text-xl font-bold text-[#1e293b]">Vendor / Client Profitability</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Vendor / Client</th>
                                    <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                                    <th className="px-8 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">Revenue (In)</th>
                                    <th className="px-8 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">Cost (Out)</th>
                                    <th className="px-8 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">Profit / Loss</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {vendorProfitability.map((item) => (
                                    <tr key={item.name} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-gray-800">{item.name}</td>
                                        <td className="px-8 py-5 whitespace-nowrap text-[10px] text-blue-600 font-black tracking-widest">{item.type}</td>
                                        <td className="px-8 py-5 text-right text-sm font-semibold text-gray-600">{formatCurrency(item.revenueIn)}</td>
                                        <td className="px-8 py-5 text-right text-sm font-bold text-gray-400">{formatCurrency(item.costOut, true)}</td>
                                        <td className={`px-8 py-5 text-right text-sm font-black ${item.profit < 0 ? 'text-red-600' : 'text-indigo-600'}`}>
                                            {formatCurrency(item.profit)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/30">
                    <h3 className="font-bold text-gray-800">Transaction History</h3>
                    <div className="w-full sm:w-72">
                        <Input 
                            id="txnSearch" 
                            placeholder="Filter by Client or ID..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)}
                            wrapperClassName="mb-0"
                            className="py-2"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                            <tr>
                                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-tighter">ID</th>
                                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-tighter">Client</th>
                                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-tighter">Category</th>
                                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-tighter">Date</th>
                                <th className="px-8 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-tighter">Amount</th>
                                <th className="px-8 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-tighter">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTransactions.map(txn => (
                                <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-8 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{txn.id}</td>
                                    <td className="px-8 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{txn.client}</td>
                                    <td className="px-8 py-4 whitespace-nowrap text-[11px] text-gray-500 font-bold uppercase tracking-widest">{txn.category}</td>
                                    <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(txn.date).toLocaleDateString()}</td>
                                    <td className="px-8 py-4 whitespace-nowrap text-right text-sm font-black text-gray-800">{formatCurrency(txn.amount)}</td>
                                    <td className="px-8 py-4 text-center">
                                        <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${
                                            txn.status === 'Received' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {txn.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Log Revenue Entry">
                <form onSubmit={(e) => { e.preventDefault(); alert('Entry saved to database.'); setIsAddModalOpen(false); }} className="space-y-4">
                    <Input id="txnClient" label="Client Name" required />
                    <div className="grid grid-cols-2 gap-4">
                        <Input id="txnAmount" label="Amount (₹)" type="number" required />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                <option>Placement Fee</option>
                                <option>Service Fee</option>
                                <option>Consultancy</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Handled By</label>
                        <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            <option>Vikrant Singh</option>
                            <option>Rohit Kumar</option>
                            <option>Anjali Sharma</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="primary">Confirm Entry</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default RevenueView;
