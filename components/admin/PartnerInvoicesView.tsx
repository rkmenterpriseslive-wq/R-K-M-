import React, { useState, useMemo, FC, useRef } from 'react';
import { PartnerInvoice } from '../../types';
import Button from '../Button';
import Input from '../Input';
import Modal from '../Modal';

declare const html2pdf: any;

// --- MOCK DATA ---
const MOCK_INVOICES: PartnerInvoice[] = [];

// --- HELPER FUNCTIONS ---
const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;
const getStatusClasses = (status: PartnerInvoice['status']) => {
    switch (status) {
        case 'Paid': return 'bg-green-100 text-green-800';
        case 'Pending': return 'bg-yellow-100 text-yellow-800';
        case 'Overdue': return 'bg-red-100 text-red-800';
    }
};

// --- SUB-COMPONENTS ---
const StatCard: FC<{ title: string; value: string; color?: string; icon: React.ReactNode }> = ({ title, value, color = 'text-gray-900', icon }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
        <div>
            <h4 className="text-sm font-semibold text-gray-500 mb-1">{title}</h4>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">{icon}</div>
    </div>
);

const InvoiceModal: FC<{ invoice: PartnerInvoice, onClose: () => void }> = ({ invoice, onClose }) => {
    const invoiceRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = () => {
        if (!invoiceRef.current) return;
        setIsDownloading(true);
        const element = invoiceRef.current;
        const opt = {
            margin:       0.5,
            filename:     `Invoice_${invoice.id}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().from(element).set(opt).save().then(() => setIsDownloading(false));
    };

    return (
        <div>
            <div ref={invoiceRef} className="p-6 text-sm">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">R.K.M ENTERPRISE</h1>
                        <p>Plot No 727 Razapur Shastri Nagar</p>
                        <p>Ghaziabad, UP 201001</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-3xl font-bold text-gray-800 uppercase">Invoice</h2>
                        <p className="text-gray-600 mt-1"># {invoice.id}</p>
                    </div>
                </div>
                <div className="flex justify-between mb-8">
                    <div>
                        <h3 className="font-semibold text-gray-600">Bill To:</h3>
                        <p className="font-bold text-gray-900">Partner Vendor</p>
                    </div>
                    <div className="text-right">
                        <p><span className="font-semibold text-gray-600">Billed Date:</span> {new Date(invoice.billedDate).toLocaleDateString()}</p>
                        <p><span className="font-semibold text-gray-600">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
                        <div className={`mt-2 inline-block px-3 py-1 text-sm font-bold rounded-full ${getStatusClasses(invoice.status)}`}>{invoice.status}</div>
                    </div>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-3">Description</th>
                            <th className="p-3 text-center">Qty</th>
                            <th className="p-3 text-right">Unit Price</th>
                            <th className="p-3 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.lineItems.map((item, index) => (
                             <tr key={index} className="border-b">
                                <td className="p-3">{item.description}</td>
                                <td className="p-3 text-center">{item.quantity}</td>
                                <td className="p-3 text-right">{formatCurrency(item.unitPrice)}</td>
                                <td className="p-3 text-right">{formatCurrency(item.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex justify-end mt-6">
                    <div className="w-full max-w-xs space-y-2">
                        <div className="flex justify-between"><span className="font-semibold text-gray-600">Subtotal:</span> <span>{formatCurrency(invoice.subTotal)}</span></div>
                        <div className="flex justify-between"><span className="font-semibold text-gray-600">Tax (18%):</span> <span>{formatCurrency(invoice.tax)}</span></div>
                        <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2 mt-2"><span >Total:</span> <span>{formatCurrency(invoice.total)}</span></div>
                    </div>
                </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end gap-3">
                <Button variant="secondary" onClick={onClose}>Close</Button>
                <Button variant="primary" onClick={handleDownload} loading={isDownloading}>Download PDF</Button>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---
const PartnerInvoicesView: FC = () => {
    const [invoices, setInvoices] = useState<PartnerInvoice[]>(MOCK_INVOICES);
    const [filters, setFilters] = useState({ search: '', month: '', status: '' });
    const [selectedInvoice, setSelectedInvoice] = useState<PartnerInvoice | null>(null);

    const filteredInvoices = useMemo(() => {
        return invoices.filter(inv => 
            (inv.id.toLowerCase().includes(filters.search.toLowerCase()) || inv.clientName.toLowerCase().includes(filters.search.toLowerCase())) &&
            (filters.status === '' || inv.status === filters.status) &&
            (filters.month === '' || inv.billedDate.startsWith(filters.month))
        );
    }, [invoices, filters]);
    
    const summary = useMemo(() => {
        const totalBilled = invoices.reduce((sum, inv) => sum + inv.amount, 0);
        const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((sum, inv) => sum + inv.amount, 0);
        return {
            totalBilled,
            totalPaid,
            outstanding: totalBilled - totalPaid,
            overdue: invoices.filter(i => i.status === 'Overdue').length,
        };
    }, [invoices]);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Invoices</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard title="Total Billed" value={formatCurrency(summary.totalBilled)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
                 <StatCard title="Total Paid" value={formatCurrency(summary.totalPaid)} color="text-green-600" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                 <StatCard title="Outstanding" value={formatCurrency(summary.outstanding)} color="text-yellow-600" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                 <StatCard title="Overdue" value={summary.overdue.toString()} color="text-red-600" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input id="search" label="Search Invoice ID / Client" value={filters.search} onChange={(e) => setFilters(f => ({...f, search: e.target.value}))} wrapperClassName="mb-0" />
                <Input id="month" label="Filter by Month" type="month" value={filters.month} onChange={(e) => setFilters(f => ({...f, month: e.target.value}))} wrapperClassName="mb-0" />
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select id="status" value={filters.status} onChange={(e) => setFilters(f => ({...f, status: e.target.value}))} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        <option value="">All</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Overdue">Overdue</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Billed</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                             {filteredInvoices.map(inv => (
                                <tr key={inv.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{inv.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{inv.clientName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(inv.billedDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(inv.dueDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">{formatCurrency(inv.amount)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(inv.status)}`}>{inv.status}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedInvoice(inv)}>View</Button>
                                    </td>
                                </tr>
                             ))}
                              {filteredInvoices.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-gray-500">No invoices found.</td>
                                </tr>
                            )}
                         </tbody>
                    </table>
                 </div>
            </div>

            {selectedInvoice && (
                <Modal isOpen={!!selectedInvoice} onClose={() => setSelectedInvoice(null)} title="Invoice Details" maxWidth="max-w-3xl">
                    <InvoiceModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
                </Modal>
            )}
        </div>
    );
};

export default PartnerInvoicesView;