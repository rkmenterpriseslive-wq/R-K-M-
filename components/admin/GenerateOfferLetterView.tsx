import React, { useState, useRef, useEffect } from 'react';
import Input from '../Input';
import Button from '../Button';
import { getRules, calculateBreakdownFromRule, SalaryRule, CTCBreakdown, initialBreakdown } from '../../utils/salaryService';

// Add this line to inform TypeScript about the global html2pdf function
declare const html2pdf: any;

// --- Helper Functions ---
const formatCurrency = (amount: number) => `₹ ${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const numberToWords = (num: number): string => {
    if (num === 0) return 'Zero';
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convertLessThanThousand = (n: number): string => {
        if (n === 0) return '';
        if (n < 10) return units[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 > 0 ? ' ' + units[n % 10] : '');
        return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 > 0 ? ' ' + convertLessThanThousand(n % 100) : '');
    };
    
    let words = '';
    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const rest = num % 1000;

    if (crore > 0) words += convertLessThanThousand(crore) + ' Crore ';
    if (lakh > 0) words += convertLessThanThousand(lakh) + ' Lakh ';
    if (thousand > 0) words += convertLessThanThousand(thousand) + ' Thousand ';
    if (rest > 0) words += convertLessThanThousand(rest);
    
    return words.trim();
};


// --- Sub-components for the Letter ---
const LetterHeader: React.FC = () => (
    <div className="flex items-center justify-between pb-4">
        <div className="w-20 h-20 bg-white border-2 border-blue-900 rounded-full flex items-center justify-center">
            <span className="text-4xl font-bold text-blue-900">R</span>
        </div>
        <h2 className="text-4xl font-bold text-blue-900 tracking-wider">R.K.M ENTERPRISE</h2>
    </div>
);

const LetterFooter: React.FC<{ pageNum: number, totalPages: number }> = ({ pageNum, totalPages }) => (
    <div className="mt-auto pt-4 text-center text-xs text-gray-700 border-t-2 border-blue-900">
        <p>Regd. Office:- Plot No 727 Razapur Shastri Nagar Ghaziabad, UP 201001</p>
        <p>E-Mail:- info@rkm-enterprises.com, Phone no.- +91 9616411654,</p>
        <p>CIN:- U74999UP2022PTC164246</p>
        <p className="text-right mt-2 font-semibold">Page {pageNum} of {totalPages}</p>
    </div>
);


const BreakdownTable: React.FC<{breakdown: CTCBreakdown, candidateName: string, doj: string}> = ({ breakdown, candidateName, doj }) => {
    // This is a direct replication of the image's table structure.
    return (
        <div className="text-xs">
            <h2 className="text-center font-bold text-2xl mb-2">ANNEXURE-A</h2>
            <table className="w-full border-collapse border border-black">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-black p-1 text-center font-bold" colSpan={3}>CTC Breakup</th>
                    </tr>
                    <tr>
                        <th className="border border-black p-1 text-left font-semibold">{candidateName || "[Candidate Name]"}</th>
                        <th className="border border-black p-1 text-right font-semibold" colSpan={2}>
                           DOJ: {doj ? new Date(doj).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : "[Date of Joining]"}
                        </th>
                    </tr>
                    <tr className="font-semibold text-center">
                        <td className="border border-black p-1"></td>
                        <td className="border border-black p-1">Monthly</td>
                        <td className="border border-black p-1">Yearly</td>
                    </tr>
                </thead>
                <tbody>
                    <tr><td className="border border-black p-1 font-bold">Basic</td><td className="border border-black p-1 text-center">{breakdown.monthly.basic.toFixed(0)}</td><td className="border border-black p-1 text-center">{breakdown.annual.basic.toFixed(0)}</td></tr>
                    <tr><td className="border border-black p-1 font-bold">HRA</td><td className="border border-black p-1 text-center">{breakdown.monthly.hra.toFixed(0)}</td><td className="border border-black p-1 text-center">{breakdown.annual.hra.toFixed(0)}</td></tr>
                    <tr><td className="border border-black p-1 font-bold">Conveyance Allowance</td><td className="border border-black p-1 text-center">{breakdown.monthly.conveyance.toFixed(0)}</td><td className="border border-black p-1 text-center">{breakdown.annual.conveyance.toFixed(0)}</td></tr>
                    <tr><td className="border border-black p-1 font-bold">Medical Allowance</td><td className="border border-black p-1 text-center">{breakdown.monthly.medical.toFixed(0)}</td><td className="border border-black p-1 text-center">{breakdown.annual.medical.toFixed(0)}</td></tr>
                    <tr><td className="border border-black p-1 font-bold">Statutory Bonus</td><td className="border border-black p-1 text-center">{breakdown.monthly.statutoryBonus.toFixed(0)}</td><td className="border border-black p-1 text-center">{breakdown.annual.statutoryBonus.toFixed(0)}</td></tr>
                    <tr><td className="border border-black p-1 font-bold">Special Allowance</td><td className="border border-black p-1 text-center">{breakdown.monthly.specialAllowance.toFixed(0)}</td><td className="border border-black p-1 text-center">{breakdown.annual.specialAllowance.toFixed(0)}</td></tr>
                    <tr className="font-bold"><td className="border border-black p-1">Gross</td><td className="border border-black p-1 text-center">{breakdown.monthly.gross.toFixed(0)}</td><td className="border border-black p-1 text-center">{breakdown.annual.gross.toFixed(0)}</td></tr>
                    <tr><td className="border border-black p-1 font-bold" colSpan={3}>Deduction</td></tr>
                    <tr><td className="border border-black p-1 font-bold">PF Employee</td><td className="border border-black p-1 text-center">{breakdown.monthly.employeePF.toFixed(0)}</td><td className="border border-black p-1 text-center">{breakdown.annual.employeePF.toFixed(0)}</td></tr>
                    {breakdown.monthly.employeeESI > 0 && <tr><td className="border border-black p-1 font-bold">ESIC Employee</td><td className="border border-black p-1 text-center">{breakdown.monthly.employeeESI.toFixed(0)}</td><td className="border border-black p-1 text-center">{breakdown.annual.employeeESI.toFixed(0)}</td></tr>}
                    <tr className="font-bold"><td className="border border-black p-1">Take Home</td><td className="border border-black p-1 text-center">{breakdown.monthly.netSalary.toFixed(0)}</td><td className="border border-black p-1 text-center">{breakdown.annual.netSalary.toFixed(0)}</td></tr>
                    <tr><td className="border border-black p-1 font-bold" colSpan={3}>Contribution</td></tr>
                    <tr><td className="border border-black p-1 font-bold">PF Employer</td><td className="border border-black p-1 text-center">{breakdown.monthly.employerPF.toFixed(0)}</td><td className="border border-black p-1 text-center">{breakdown.annual.employerPF.toFixed(0)}</td></tr>
                    {breakdown.monthly.employerESI > 0 && <tr><td className="border border-black p-1 font-bold">ESIC Employer</td><td className="border border-black p-1 text-center">{breakdown.monthly.employerESI.toFixed(0)}</td><td className="border border-black p-1 text-center">{breakdown.annual.employerESI.toFixed(0)}</td></tr>}
                    <tr className="font-bold"><td className="border border-black p-1">CTC</td><td className="border border-black p-1 text-center">{breakdown.monthly.ctc.toFixed(0)}</td><td className="border border-black p-1 text-center">{breakdown.annual.ctc.toFixed(0)}</td></tr>
                </tbody>
            </table>
            <p className="text-center font-bold mt-2 text-xs">*** The monthly pay slips will be made available electronically***</p>
        </div>
    );
};


const GenerateOfferLetterView: React.FC = () => {
    const today = new Date().toISOString().split('T')[0];
    const [formData, setFormData] = useState({
        candidateName: '',
        email: '',
        offerDate: today,
        jobTitle: '',
        startDate: '',
        clientName: 'Organic Circle Pvt. Ltd.',
        annualCTC: '',
    });
    const [rules, setRules] = useState<SalaryRule[]>([]);
    const [breakdown, setBreakdown] = useState<CTCBreakdown>(initialBreakdown);
    const [isDownloading, setIsDownloading] = useState(false);
    const letterContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setRules(getRules());
    }, []);

    useEffect(() => {
        const ctc = parseFloat(formData.annualCTC);
        const selectedRule = rules.find(r => r.designation === formData.jobTitle);
        setBreakdown(calculateBreakdownFromRule(ctc, selectedRule));
    }, [formData.annualCTC, formData.jobTitle, rules]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDownloadPdf = () => {
        if (!letterContentRef.current) return;
        if (!formData.candidateName) {
            alert("Please enter the candidate's name before downloading.");
            return;
        }

        setIsDownloading(true);

        const element = letterContentRef.current;
        const opt = {
            margin:       [0.5, 0.5, 0.5, 0.5],
            filename:     `Offer_Letter_${formData.candidateName.replace(/\s+/g, '_') || 'Candidate'}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().from(element).set(opt).save().then(() => setIsDownloading(false));
    };

    const selectStyles = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <style>{`
                @media print {
                    .no-print { display: none; }
                    .page { page-break-after: always; }
                }
                .letter-preview { font-family: 'Times New Roman', Times, serif; color: #000; font-size: 12pt; line-height: 1.5; }
                .letter-preview h1, .letter-preview h2, .letter-preview h3, .letter-preview strong { font-weight: bold; }
                .letter-preview .page { min-height: 10.5in; display: flex; flex-direction: column; padding: 0.5in; box-sizing: border-box; }
                .letter-preview .page:last-child { page-break-after: avoid; }
            `}</style>
            {/* Form Panel */}
            <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit sticky top-6 no-print">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Offer Letter Details</h2>
                <form className="space-y-4 text-sm">
                    <Input id="candidateName" name="candidateName" label="Candidate Name" value={formData.candidateName} onChange={handleChange} required />
                    <Input id="email" name="email" label="Candidate Email" type="email" value={formData.email} onChange={handleChange} required />
                    <div>
                        <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                        <select id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleChange} className={selectStyles} required>
                            <option value="">Select a designation</option>
                            {rules.map(rule => (<option key={rule.designation} value={rule.designation}>{rule.designation}</option>))}
                        </select>
                    </div>
                    <Input id="annualCTC" name="annualCTC" label="Annual CTC (₹)" type="number" value={formData.annualCTC} onChange={handleChange} required />
                    <Input id="startDate" name="startDate" label="Joining Date" type="date" value={formData.startDate} onChange={handleChange} required />
                    <Input id="clientName" name="clientName" label="Client Name" value={formData.clientName} onChange={handleChange} />
                    <div className="pt-4 flex">
                       <Button type="button" variant="primary" className="w-full justify-center" onClick={handleDownloadPdf} loading={isDownloading}>Download PDF</Button>
                    </div>
                </form>
            </div>

            {/* Letter Preview Panel */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div ref={letterContentRef} className="letter-preview">
                    {/* --- PAGE 1 --- */}
                    <div className="page">
                        <LetterHeader />
                        <h1 className="text-center font-bold text-xl my-4 underline">OFFER LETTER</h1>
                        <div className="grid grid-cols-2 gap-4 my-4">
                            <div><strong>DATE:</strong> {new Date(formData.offerDate).toLocaleDateString('en-GB')}</div>
                            <div className="text-right">
                                <p><strong>NAME:</strong> {formData.candidateName || "[Candidate Name]"}</p>
                                <p><strong>EMAIL:</strong> {formData.email || "[Candidate Email]"}</p>
                            </div>
                        </div>
                        <p className="mt-4"><strong>DEAR {formData.candidateName ? formData.candidateName.toUpperCase() : "[CANDIDATE NAME]"},</strong></p>
                        <p>With reference to the discussions we had, we are pleased to offer you the position of “<strong>{formData.jobTitle || "[Job Title]"}</strong>” with <strong>R K M enterprises.</strong></p>
                        <p>You are expected to join on “<strong>{formData.startDate ? new Date(formData.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : "[Joining Date]"}</strong>”, failing which, Prime Hire Services Pvt. Ltd. reserves the right to rescind this letter. Your employment will be confirmed upon successful completion of a probation period of <strong>Three months (the same will be communicated to you via mail/letter)</strong>. During the probation period, your employment can be terminated on an immediate basis if your performance does not meet the expected standard or there are discipline/insubordination issues faced from your end.</p>
                        <p className="font-bold mt-4">After the completion of probation period:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Your daily attendance will be subject to achievement of specified minimum sales on that day which is considered as Qualified Working Day. Exact criteria of minimum sales will be communicated to you in advance from time to time through WhatsApp groups basis company's decision.</li>
                            <li>The contract shall be terminable by either party giving 12 working days (Qualified working days – as per minimum sales criteria) notice in writing or salary in lieu of notice during the contract period.</li>
                            <li>In case of any misconduct or non-performance at any time during the period of your service with us, we reserve the right to terminate your services without any pay and prior intimation.</li>
                        </ul>
                        <p className="mt-4">Your Annual Cost to Company (CTC) will be “<strong>{formatCurrency(parseFloat(formData.annualCTC) || 0)}” ({numberToWords(parseFloat(formData.annualCTC) || 0)} Only)</strong> as detailed in Annexure “A” and your work location will be required to work onsite as per the client requirement ({formData.clientName || '[Client Name]'}).</p>
                        <LetterFooter pageNum={1} totalPages={3} />
                    </div>

                    {/* --- PAGE 2 --- */}
                    <div className="page">
                        <LetterHeader />
                        <div className="flex-grow pt-8">
                            <p>Within seven (7) days of accepting our offer, please send us a copy of your resignation letter/mail, duly accepted by your current organization (not applicable to fresher’s).</p>
                            <p>You are required to acknowledge this mail within 24 hours failing which this letter stands null and void. We welcome you to PHI family and look forward to a long and fruitful association.</p>
                            <p className="mt-8">Sincerely,</p>
                            <div className="mt-16 space-y-2">
                                <p className="font-bold">R KM ENTERPRISES</p>
                                <p><strong>Head HR (Officiating)</strong></p>
                            </div>
                            <div className="mt-24 pt-8">
                                <p className="border-t border-black pt-2"><strong>Name and Signature of Employee</strong></p>
                            </div>
                        </div>
                        <LetterFooter pageNum={2} totalPages={3} />
                    </div>
                    
                    {/* --- PAGE 3 --- */}
                    {breakdown.annual.ctc > 0 && (
                        <div className="page">
                            <LetterHeader />
                            <div className="flex-grow pt-4">
                                <BreakdownTable breakdown={breakdown} candidateName={formData.candidateName} doj={formData.startDate} />
                                <div className="mt-16">
                                    <p><strong>ACCEPTANCE:</strong></p>
                                    <p>I have read and understood the above terms and conditions of employment and hereby signify my acceptance of the same.</p>
                                    <div className="mt-24 pt-8">
                                        <p className="border-t border-black pt-2"><strong>Name and Signature of Employee</strong></p>
                                    </div>
                                </div>
                            </div>
                            <LetterFooter pageNum={3} totalPages={3} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GenerateOfferLetterView;
