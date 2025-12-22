
import React, { useState, useRef, useEffect } from 'react';
import Input from '../Input';
import Button from '../Button';
import { getRules, calculateBreakdownFromRule, SalaryRule, CTCBreakdown, initialBreakdown } from '../../utils/salaryService';

// Add this line to inform TypeScript about the global html2pdf function
declare const html2pdf: any;

// --- Helper Functions ---
const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/-`;

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
const LetterHeader: React.FC<{ logoSrc: string | null }> = ({ logoSrc }) => (
    <div className="relative pt-6 pb-6 min-h-[140px]">
        {/* Corner Graphic - Top Left Dark Blue Triangle */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#1c2246]" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
        
        <div className="relative z-10 flex items-center px-10">
            {/* Logo: Positioned near the left blue triangle */}
            {/* Added rounded-full, bg-white, border, shadow-sm for circular display */}
            <div className="w-20 h-20 flex items-center justify-center overflow-hidden flex-shrink-0 rounded-full bg-white border-2 border-[#1c2246] shadow-sm">
               {logoSrc ? (
                   <img src={logoSrc} alt="Company Logo" className="max-w-full max-h-full object-contain" />
               ) : (
                   <div className="w-16 h-16 rounded-full border-[3px] border-[#1c2246] p-0.5 flex items-center justify-center bg-white">
                      <div className="w-full h-full rounded-full border border-[#1c2246] flex items-center justify-center">
                          <span className="text-4xl font-serif font-black text-[#1c2246] mt-1">R</span>
                      </div>
                   </div>
               )}
            </div>
            
            {/* Company Name */}
            <div className="flex-1 text-center">
                <h1 className="text-3xl font-extrabold text-[#1c2246] tracking-[0.25em] font-sans -ml-16">
                    R.K.M ENTERPRISE
                </h1>
            </div>
        </div>
    </div>
);

const LetterFooter: React.FC<{ pageNum: number, totalPages: number }> = ({ pageNum, totalPages }) => (
    <div className="relative mt-auto w-full">
        {/* Contact Info Section */}
        <div className="relative z-10 text-center flex flex-col items-center">
            <div className="w-[70%] border-t-[3px] border-[#1c2246] mb-3"></div>
            <div className="text-[#1c2246] font-bold text-[10px] space-y-0.5 mb-1 tracking-tight">
                <p>Regd. Office:- Plot No 727 Razapur Shastri Nagar Ghaziabad, UP 201001</p>
                <p>E- Mail:- info@rkm-enterprises.com, Phone no.- +91 9616411654,</p>
                <p>CIN:- U74999UP2022PTC164246</p>
            </div>
            <div className="w-full flex justify-end px-10 mb-2">
                <p className="text-[10px] font-bold text-gray-500">Page {pageNum} of {totalPages}</p>
            </div>
        </div>

        {/* Decorative Stripes & Bottom Bar */}
        <div className="relative h-12 w-full overflow-hidden">
            {/* Full width bottom blue strip */}
            <div className="absolute bottom-0 left-0 w-full h-10 bg-[#1c2246]"></div>
            
            {/* Diagonal stripes on the far right edge */}
            <div className="absolute bottom-0 right-0 h-24 w-40 overflow-hidden">
                {/* Cyan Stripe */}
                <div 
                    className="absolute -bottom-8 right-12 w-8 h-40 bg-[#00a6e0] transform -rotate-45"
                ></div>
                {/* Dark Blue Stripe */}
                <div 
                    className="absolute -bottom-8 right-0 w-12 h-40 bg-[#1c2246] border-l-4 border-white transform -rotate-45"
                ></div>
            </div>
        </div>
    </div>
);

const Watermark: React.FC = () => (
    <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none z-0">
        <div className="transform -rotate-45 whitespace-nowrap text-[80px] md:text-[100px] font-black tracking-widest text-[#1c2246]">
            R.K.M ENTERPRISE
        </div>
    </div>
);

const BreakdownTable: React.FC<{breakdown: CTCBreakdown, candidateName: string, doj: string}> = ({ breakdown, candidateName, doj }) => {
    const rowClass = "border border-gray-500";
    const cellClass = "p-1.5 px-3 border-r border-gray-500";
    const headerClass = "bg-white font-bold text-center border border-gray-500";

    const formattedDoj = doj ? new Date(doj).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).replace(/ (\d{4})/, "'$1") : "14th November'2025";

    return (
        <div className="text-sm">
            <h2 className="text-center font-bold text-xl mb-6 tracking-widest text-black">ANNEXURE-A</h2>
            <div className="border border-gray-500 overflow-hidden">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className={headerClass}>
                            <th colSpan={3} className="p-2 text-md border-b border-gray-500 font-bold">CTC Breakup</th>
                        </tr>
                        <tr className="bg-white">
                            <th className={`${cellClass} text-left py-2 font-bold w-1/2`}>{candidateName || "Akash Singh"}</th>
                            <th colSpan={2} className="p-2 text-right font-bold w-1/2">
                               DOJ: {formattedDoj}
                            </th>
                        </tr>
                        <tr className="bg-white text-center font-bold text-xs uppercase">
                            <td className={cellClass}></td>
                            <td className={cellClass}>Monthly</td>
                            <td className="p-1 px-3">Yearly</td>
                        </tr>
                    </thead>
                    <tbody className="text-center text-xs">
                        <tr className={rowClass}><td className={`${cellClass} text-left font-semibold`}>Basic</td><td className={cellClass}>{breakdown.monthly.basic.toFixed(0)}</td><td>{breakdown.annual.basic.toFixed(0)}</td></tr>
                        <tr className={rowClass}><td className={`${cellClass} text-left font-semibold`}>HRA</td><td className={cellClass}>{breakdown.monthly.hra.toFixed(0)}</td><td>{breakdown.annual.hra.toFixed(0)}</td></tr>
                        <tr className={rowClass}><td className={`${cellClass} text-left font-semibold`}>Conveyance Allowance</td><td className={cellClass}>{breakdown.monthly.conveyance.toFixed(0)}</td><td>{breakdown.annual.conveyance.toFixed(0)}</td></tr>
                        <tr className={rowClass}><td className={`${cellClass} text-left font-semibold`}>Medical Allowance</td><td className={cellClass}>{breakdown.monthly.medical.toFixed(0)}</td><td>{breakdown.annual.medical.toFixed(0)}</td></tr>
                        <tr className={rowClass}><td className={`${cellClass} text-left font-semibold`}>Statutory Bonus</td><td className={cellClass}>{breakdown.monthly.statutoryBonus.toFixed(0)}</td><td>{breakdown.annual.statutoryBonus.toFixed(0)}</td></tr>
                        <tr className={rowClass}><td className={`${cellClass} text-left font-semibold`}>Special Allowance</td><td className={cellClass}>{breakdown.monthly.specialAllowance.toFixed(0)}</td><td>{breakdown.annual.specialAllowance.toFixed(0)}</td></tr>
                        <tr className={`${rowClass} font-bold`}><td className={`${cellClass} text-left`}>Gross</td><td className={cellClass}>{breakdown.monthly.gross.toFixed(0)}</td><td>{breakdown.annual.gross.toFixed(0)}</td></tr>
                        
                        <tr className="bg-white font-bold"><td colSpan={3} className="p-1 px-3 text-left border border-gray-500 uppercase text-[10px] tracking-wider">Deduction</td></tr>
                        <tr className={rowClass}><td className={`${cellClass} text-left font-semibold`}>PF Employee</td><td className={cellClass}>{breakdown.monthly.employeePF.toFixed(0)}</td><td>{breakdown.annual.employeePF.toFixed(0)}</td></tr>
                        <tr className={rowClass}><td className={`${cellClass} text-left font-semibold`}>ESIC Employee</td><td className={cellClass}>{breakdown.monthly.employeeESI.toFixed(0)}</td><td>{breakdown.annual.employeeESI.toFixed(0)}</td></tr>
                        <tr className={`${rowClass} font-bold`}><td className={`${cellClass} text-left`}>Monthly</td><td className={cellClass}>{breakdown.monthly.netSalary.toFixed(0)}</td><td>{breakdown.annual.netSalary.toFixed(0)}</td></tr>
                        
                        <tr className="bg-white font-bold"><td colSpan={3} className="p-1 px-3 text-left border border-gray-500 uppercase text-[10px] tracking-wider">Contribution</td></tr>
                        <tr className={rowClass}><td className={`${cellClass} text-left font-semibold`}>PF Employer</td><td className={cellClass}>{breakdown.monthly.employerPF.toFixed(0)}</td><td>{breakdown.annual.employerPF.toFixed(0)}</td></tr>
                        <tr className={rowClass}><td className={`${cellClass} text-left font-semibold`}>ESIC Employer</td><td className={cellClass}>{breakdown.monthly.employerESI.toFixed(0)}</td><td>{breakdown.annual.employerESI.toFixed(0)}</td></tr>
                        <tr className={`${rowClass} font-bold text-sm`}><td className={`${cellClass} text-left`}>CTC</td><td className={cellClass}>{breakdown.monthly.ctc.toFixed(0)}</td><td>{breakdown.annual.ctc.toFixed(0)}</td></tr>
                    </tbody>
                </table>
            </div>
            <p className="text-center font-bold mt-4 text-[11px] text-gray-800 italic">*** The monthly pay slips will be made available electronically***</p>
        </div>
    );
};

interface GenerateOfferLetterViewProps {
    logoSrc?: string | null;
}

const GenerateOfferLetterView: React.FC<GenerateOfferLetterViewProps> = ({ logoSrc = null }) => {
    const today = new Date().toISOString().split('T')[0];
    const [formData, setFormData] = useState({
        candidateName: '',
        email: '',
        offerDate: today,
        jobTitle: 'Process Associate',
        startDate: '',
        clientName: 'Organic Circle Pvt. Ltd.',
        annualCTC: '318000',
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
            margin:       [0, 0, 0, 0],
            filename:     `Offer_Letter_${formData.candidateName.replace(/\s+/g, '_') || 'Candidate'}.pdf`,
            image:        { type: 'jpeg', quality: 1.0 },
            html2canvas:  { scale: 3, useCORS: true, letterRendering: true },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().from(element).set(opt).save().then(() => setIsDownloading(false));
    };

    const selectStyles = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800;900&display=swap');
                
                @media print {
                    .no-print { display: none; }
                    .page { page-break-after: always; border: none !important; margin: 0 !important; }
                }
                .letter-preview { font-family: 'Montserrat', sans-serif; color: #000; line-height: 1.5; }
                .letter-preview .page { 
                    width: 210mm;
                    min-height: 297mm;
                    background: white;
                    display: flex; 
                    flex-direction: column; 
                    position: relative;
                    box-sizing: border-box;
                    margin: 0 auto;
                }
                .page-content {
                    padding: 0 50px;
                    flex: 1;
                    z-index: 10;
                    position: relative;
                }
                .letter-preview p, .letter-preview li { font-size: 13px; text-align: justify; }
                .letter-preview strong { font-weight: 800; }
                .letter-preview h1 { color: #1c2246; }
            `}</style>
            
            {/* Form Panel */}
            <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit sticky top-6 no-print">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Official Offer Letter</h2>
                <form className="space-y-4 text-sm">
                    <Input id="candidateName" name="candidateName" label="Candidate Name" value={formData.candidateName} onChange={handleChange} placeholder="Akash Singh" required />
                    <Input id="email" name="email" label="Candidate Email" type="email" value={formData.email} onChange={handleChange} placeholder="akash@gmail.com" required />
                    <div>
                        <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">Position / Designation</label>
                        <select id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleChange} className={selectStyles} required>
                            <option value="Process Associate">Process Associate</option>
                            {rules.map(rule => (<option key={rule.designation} value={rule.designation}>{rule.designation}</option>))}
                        </select>
                    </div>
                    <Input id="annualCTC" name="annualCTC" label="Annual CTC (₹)" type="number" value={formData.annualCTC} onChange={handleChange} required />
                    <Input id="startDate" name="startDate" label="Proposed DOJ" type="date" value={formData.startDate} onChange={handleChange} required />
                    <Input id="clientName" name="clientName" label="Client Organization" value={formData.clientName} onChange={handleChange} />
                    <div className="pt-4">
                       <Button type="button" variant="primary" className="w-full justify-center bg-[#1c2246] hover:bg-[#152a45] shadow-lg" onClick={handleDownloadPdf} loading={isDownloading}>
                         Generate PDF Offer
                       </Button>
                    </div>
                </form>
            </div>

            {/* Letter Preview Panel */}
            <div className="lg:col-span-2 bg-gray-300 p-8 flex justify-center overflow-auto no-print">
                <div ref={letterContentRef} className="letter-preview shadow-2xl">
                    {/* --- PAGE 1: CORE OFFER --- */}
                    <div className="page">
                        <Watermark />
                        <LetterHeader logoSrc={logoSrc} />
                        <div className="page-content">
                            <h1 className="text-center font-black text-2xl my-10 tracking-[0.15em]">OFFER LETTER</h1>
                            
                            <div className="flex justify-between items-start my-8">
                                <div className="font-bold text-lg">DATE</div>
                                <div className="text-left w-64 space-y-1 font-bold">
                                    <p>NAME: <span className="font-semibold">{formData.candidateName || "[Candidate Name]"}</span></p>
                                    <p>EMAIL: <span className="font-semibold">{formData.email || "[Candidate Email]"}</span></p>
                                </div>
                            </div>
                            
                            <p className="mt-8 mb-4 text-[15px]"><strong>DEAR {formData.candidateName ? formData.candidateName.toUpperCase() : "AKASH SINGH"},</strong></p>
                            
                            <p className="mb-4">With reference to the discussions we had, we are pleased to offer you the position of “<strong>{formData.jobTitle || "Process Associate"}</strong>” with <strong>R K M enterprises.</strong></p>
                            
                            <p className="mb-6">You are expected to join on “<strong>{formData.startDate ? new Date(formData.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).replace(/ (\d{4})/, "$1") : "14thNovember 2025"}</strong>”, failing which, R K M enterprises. reserves the right to rescind this letter. Your employment will be confirmed upon successful completion of a probation period of <strong>Three months (the same will be communicated to you via mail/letter)</strong>. During the probation period, your employment can be terminated on an immediate basis if your performance does not meet the expected standard or there are discipline/insubordination issues faced from your end.</p>
                            
                            <p className="font-black mb-3 text-[14px] uppercase tracking-wide">After the completion of probation period:</p>
                            <ul className="list-disc pl-5 space-y-4 mb-8">
                                <li>Your daily attendance will be subject to achievement of specified minimum sales on that day which is considered as Qualified Working Day. Exact criteria of minimum sales will be communicated to you in advance from time to time through WhatsApp groups basis company's decision.</li>
                                <li>The contract shall be terminable by either party giving 12 working days (Qualified working days – as per minimum sales criteria) notice in writing or salary in lieu of notice during the contract period.</li>
                                <li>In case of any misconduct or non-performance at any time during the period of your service with us, we reserve the right to terminate your services without any pay and prior intimation.</li>
                            </ul>
                            
                            <p className="leading-relaxed">Your Annual Cost to Company (CTC) will be “<strong>{formatCurrency(parseFloat(formData.annualCTC) || 318000)} ({numberToWords(parseFloat(formData.annualCTC) || 318000)} Only)</strong> as detailed in Annexure “A” and your work location will be required to work onsite as per the client requirement ({formData.clientName || 'Organic Circle Pvt. Ltd.'}).</p>
                        </div>
                        <LetterFooter pageNum={1} totalPages={3} />
                    </div>

                    {/* --- PAGE 2: SIGNATURES & CLOSING --- */}
                    <div className="page">
                        <Watermark />
                        <LetterHeader logoSrc={logoSrc} />
                        <div className="page-content pt-10">
                            <p className="mb-8">Within seven (7) days of accepting our offer, please send us a copy of your resignation letter/mail, duly accepted by your current organization (not applicable to fresher’s).</p>
                            <p className="mb-12">You are required to acknowledge this mail within 24 hours failing which this letter stands null and void. We welcome you to PHI family and look forward to a long and fruitful association.</p>
                            
                            <p className="mb-12 font-semibold">Sincerely,</p>
                            
                            <div className="mt-10 space-y-2">
                                <p className="font-black text-[#1c2246] text-lg">R K M ENTERPRISES</p>
                                <p className="font-black text-md">Head HR (Officiating)</p>
                            </div>
                            
                            <div className="mt-40 flex justify-end">
                                <div className="w-80 text-center">
                                    <div className="border-t-2 border-black pt-2">
                                        <p className="font-black text-md">Name and Signature of Employee</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <LetterFooter pageNum={2} totalPages={3} />
                    </div>
                    
                    {/* --- PAGE 3: ANNEXURE-A --- */}
                    <div className="page">
                        <Watermark />
                        <LetterHeader logoSrc={logoSrc} />
                        <div className="page-content">
                            <BreakdownTable breakdown={breakdown} candidateName={formData.candidateName} doj={formData.startDate} />
                            
                            <div className="mt-16 space-y-2">
                                <p className="font-black text-[#1c2246] text-lg">R K M ENTERPRISES</p>
                                <p className="font-black text-md">Head HR (Officiating)</p>
                            </div>

                            <div className="mt-16">
                                <p className="font-black text-md uppercase underline underline-offset-4">ACCEPTANCE:</p>
                                <p className="text-gray-900 mt-2 italic font-medium leading-relaxed">I have read and understood the above terms and conditions of employment and hereby signify my acceptance of the same.</p>
                            </div>

                            <div className="mt-32 flex justify-end">
                                <div className="w-80 text-center">
                                    <div className="border-t-2 border-black pt-2">
                                        <p className="font-black text-md">Name and Signature of Employee</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <LetterFooter pageNum={3} totalPages={3} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenerateOfferLetterView;