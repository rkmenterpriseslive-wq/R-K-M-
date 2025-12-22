
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { WarningLetter, UserType, UserProfile, Candidate } from '../../types';
import { onWarningLettersChange, addWarningLetter, updateWarningLetter } from '../../services/firebaseService';
import Button from '../Button';
import Input from '../Input';
import Modal from '../Modal';

// Add this line to inform TypeScript about the global html2pdf function
declare const html2pdf: any;

interface WarningLettersViewProps {
    candidates: Candidate[];
    currentUserProfile: UserProfile | null;
}

const WarningLettersView: React.FC<WarningLettersViewProps> = ({ candidates = [], currentUserProfile }) => {
    const [letters, setLetters] = useState<WarningLetter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLetter, setSelectedLetter] = useState<WarningLetter | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const previewRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        employeeName: '',
        reason: '',
        description: '',
        issuedBy: 'HR Department',
    });

    useEffect(() => {
        const unsubscribe = onWarningLettersChange((data) => {
            setLetters(data);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleIssueNew = async (e: React.FormEvent) => {
        e.preventDefault();
        const ticketNo = `WL-${Date.now().toString().slice(-6)}`;
        const newLetter = {
            ...formData,
            ticketNo,
            issueDate: new Date().toISOString(),
            status: 'Active' as const,
        };

        try {
            await addWarningLetter(newLetter);
            alert('Warning letter issued successfully!');
            setIsModalOpen(false);
            setFormData({ employeeName: '', reason: '', description: '', issuedBy: 'HR Department' });
        } catch (error) {
            alert('Failed to issue warning letter.');
        }
    };

    const handleResolve = async (id: string) => {
        if (window.confirm('Mark this warning as resolved?')) {
            try {
                await updateWarningLetter(id, { status: 'Resolved' });
            } catch (error) {
                alert('Failed to update status.');
            }
        }
    };

    const handleDownloadPdf = () => {
        if (!previewRef.current) return;
        const element = previewRef.current;
        const opt = {
            margin: 0.5,
            filename: `Warning_Letter_${selectedLetter?.employeeName.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().from(element).set(opt).save();
    };

    const myEmployeeNames = useMemo(() => {
        if (currentUserProfile && [UserType.TEAM, UserType.TEAMLEAD].includes(currentUserProfile.userType)) {
            return new Set(candidates.filter(c => c.recruiter === currentUserProfile.uid).map(c => c.name));
        }
        return null; // null means don't filter
    }, [candidates, currentUserProfile]);

    const filteredLetters = useMemo(() => {
        let baseLetters = letters;
        if (myEmployeeNames) {
            baseLetters = letters.filter(l => myEmployeeNames.has(l.employeeName));
        }
        return baseLetters.filter(l =>
            l.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.ticketNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.reason.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [letters, searchTerm, myEmployeeNames]);

    const stats = useMemo(() => ({
        total: filteredLetters.length,
        active: filteredLetters.filter(l => l.status === 'Active').length,
        resolved: filteredLetters.filter(l => l.status === 'Resolved').length,
    }), [filteredLetters]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Warning Letters</h2>
                    <p className="text-gray-500 text-sm mt-1">Issue and track disciplinary warnings for employees.</p>
                </div>
                <Button variant="danger" onClick={() => setIsModalOpen(true)} className="shadow-lg px-6">
                    + Issue Warning Letter
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase">Total Issued</h4>
                    <p className="text-4xl font-black text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase">Active Warnings</h4>
                    <p className="text-4xl font-black text-red-600 mt-1">{stats.active}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase">Resolved</h4>
                    <p className="text-4xl font-black text-green-600 mt-1">{stats.resolved}</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <Input
                    id="letterSearch"
                    placeholder="Search by Employee Name, Ticket No, or Reason..."
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
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Employee / Ticket</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Reason</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Issue Date</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr><td colSpan={5} className="text-center py-20 text-gray-400 italic">Loading records...</td></tr>
                            ) : filteredLetters.length > 0 ? filteredLetters.map(letter => (
                                <tr key={letter.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900">{letter.employeeName}</div>
                                        <div className="text-xs text-blue-600 font-semibold">{letter.ticketNo}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 truncate max-w-xs">{letter.reason}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(letter.issueDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${letter.status === 'Active' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {letter.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedLetter(letter)}>View</Button>
                                        {letter.status === 'Active' && (
                                            <Button variant="small-light" size="sm" onClick={() => handleResolve(letter.id)}>Resolve</Button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5} className="text-center py-20 text-gray-500">No warning letters found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Issuance Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Issue New Warning Letter">
                <form onSubmit={handleIssueNew} className="space-y-4">
                    <Input id="empName" label="Employee Name" value={formData.employeeName} onChange={e => setFormData({ ...formData, employeeName: e.target.value })} required />
                    <Input id="reason" label="Reason for Warning" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} placeholder="e.g., Continuous Absenteeism" required />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
                        <textarea
                            rows={4}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>
                    <Input id="issuedBy" label="Issued By" value={formData.issuedBy} onChange={e => setFormData({ ...formData, issuedBy: e.target.value })} required />
                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="danger">Confirm & Issue</Button>
                    </div>
                </form>
            </Modal>

            {/* View/Print Modal */}
            {selectedLetter && (
                <Modal isOpen={!!selectedLetter} onClose={() => setSelectedLetter(null)} title="Warning Letter Details" maxWidth="max-w-3xl">
                    <div className="space-y-6">
                        <div ref={previewRef} className="p-10 border border-gray-200 bg-white text-gray-900 font-serif leading-relaxed shadow-inner">
                            <div className="text-center mb-10 border-b-2 border-black pb-4">
                                <h1 className="text-3xl font-black tracking-tighter uppercase">R.K.M ENTERPRISE</h1>
                                <p className="text-sm italic">Regd. Office:- Plot No 727 Razapur Shastri Nagar Ghaziabad, UP 201001</p>
                            </div>

                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <p><strong>Ref No:</strong> {selectedLetter.ticketNo}</p>
                                    <p><strong>Date:</strong> {new Date(selectedLetter.issueDate).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-red-600 uppercase underline">Letter of Warning</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <p><strong>To,</strong></p>
                                <p className="font-bold">{selectedLetter.employeeName}</p>
                                <p>Employee, R.K.M Enterprise</p>
                            </div>

                            <div className="mb-8">
                                <p className="font-bold mb-4 underline">Subject: Warning regarding {selectedLetter.reason}</p>
                                <p className="mb-4">Dear {selectedLetter.employeeName.split(' ')[0]},</p>
                                <p className="mb-4 text-justify">
                                    This letter serves as a formal warning for the disciplinary issues observed.
                                    Specifically, we have noted the following:
                                </p>
                                <div className="p-4 bg-gray-50 border-l-4 border-red-500 italic mb-6">
                                    "{selectedLetter.description}"
                                </div>
                                <p className="mb-4 text-justify">
                                    Please consider this a serious matter. We expect immediate improvement in your professional conduct. 
                                    Failure to comply with company policies or recurrence of such issues may lead to further 
                                    disciplinary action, including termination of employment as per company contract terms.
                                </p>
                                <p className="mb-10 text-justify">
                                    We value your contribution to the team and hope that you will take this feedback 
                                    constructively to align with our organizational standards.
                                </p>
                            </div>

                            <div className="mt-20 flex justify-between">
                                <div>
                                    <p className="font-bold">Authorized Signatory</p>
                                    <p className="text-sm">{selectedLetter.issuedBy}</p>
                                    <div className="h-10"></div>
                                    <p className="text-xs uppercase font-bold">R.K.M Enterprise</p>
                                </div>
                                <div className="text-center pt-20">
                                    <div className="border-t border-black w-40 mx-auto pt-1">
                                        <p className="text-xs font-bold uppercase text-gray-500">Employee Signature</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 no-print">
                            <Button variant="secondary" onClick={() => setSelectedLetter(null)}>Close</Button>
                            <Button variant="primary" onClick={handleDownloadPdf}>Download PDF</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default WarningLettersView;