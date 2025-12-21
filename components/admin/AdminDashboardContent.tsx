import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import {
  AdminMenuItem,
  AdminDashboardContentProps,
  UserType,
  ProcessMetric,
  RoleMetric,
  TeamMemberPerformance,
  Job,
  BrandingConfig,
  AppUser,
  Complaint,
  WarningLetter,
  Ticket,
  PanelConfig,
  Store,
  DailyLineup,
  CallStatus,
  Candidate,
  UserProfile,
  CommissionAttendanceRecord,
  DemoRequest,
  PartnerRequirement,
} from '../../types';
import JobPostingForm from '../JobPostingForm';
import LogoUploader from '../LogoUploader';
import JobList from '../JobList';
import Modal from '../Modal';
import Input from '../Input';
import Button from '../Button';
import ManagePayrollView from './ManagePayrollView';
import CTCGeneratorView from './CTCGeneratorView';
import GenerateOfferLetterView from './GenerateOfferLetterView';
import PayslipsView from './PayslipsView';
import EmployeeManagementView from './EmployeeManagementView';
import PartnerActiveCandidatesView from './PartnerActiveCandidatesView';
import PartnerUpdateStatusView from './PartnerUpdateStatusView';
import PartnerRequirementsView from './PartnerRequirementsView';
import PartnerInvoicesView from './PartnerInvoicesView';
import PartnerSalaryUpdatesView from './PartnerSalaryUpdatesView';
import PartnerManageSupervisorsView from './PartnerManageSupervisorsView';
import StatCard from './StatCard';
import ProgressBarCard from './ProgressBarCard';
import TeamPerformanceTable from './TeamPerformanceTable';
import AddTeamMemberModal from './AddTeamMemberModal';
import SupervisorDashboardView from '../supervisor/SupervisorDashboardView';
import StoreAttendanceView from '../supervisor/StoreAttendanceView';
import StoreEmployeesView from '../supervisor/StoreEmployeesView';
import HRDashboardView from '../hr/HRDashboardView';
import { getHRDashboardStats } from '../../utils/hrService';
import PartnerDashboardView from '../partner/PartnerDashboardView';
import { 
  getRevenueData, 
  RevenueData, 
  getPanelConfig, 
  updatePanelConfig, 
  createVendor, 
  getVendors, 
  onDailyLineupsChange, 
  addDailyLineup, 
  updateDailyLineup, 
  onCandidatesChange, 
  updateCandidateStatus, 
  addCandidateToSelection, 
  updateCandidate, 
  onAttendanceForMonthChange, 
  saveEmployeeAttendance, 
  onComplaintsChange, 
  addComplaint, 
  updateComplaint, 
  onWarningLettersChange, 
  addWarningLetter, 
  updateWarningLetter, 
  onDemoRequestsChange, 
  getDailyLineups, 
  getCandidates, 
  getComplaints, 
  getWarningLetters, 
  getAttendanceForMonth, 
  onAllPartnerRequirementsChange, 
  getUsers, 
  updateVendor,
  getUserProfileByMobile
} from '../../services/firebaseService';
import HelpCenterView from '../candidate/HelpCenterView';
import HRUpdatesCard from './HRUpdatesCard';
import SettingsView from './SettingsView';
import CvPreviewModal from '../CvPreviewModal';

declare const html2pdf: any;

// --- INTERNAL COMPONENTS ---

const HRSummaryCard: React.FC<{ onNavigate: (item: AdminMenuItem) => void }> = ({ onNavigate }) => {
    const stats = getHRDashboardStats();
    const metrics = [
        { label: "Total Employees", value: stats.totalEmployees, color: "text-blue-600", item: AdminMenuItem.EmployeeManagement },
        { label: "Pending Onboarding", value: stats.pendingOnboarding, color: "text-yellow-600", item: AdminMenuItem.EmployeeManagement },
        { label: "New Hires (Month)", value: stats.newHires, color: "text-green-600", item: AdminMenuItem.EmployeeManagement },
        { label: "Pending Payroll", value: `₹${(stats.pendingPayroll / 100000).toFixed(1)}L`, color: "text-indigo-600", item: AdminMenuItem.ManagePayroll },
    ];
    return (
        <div className="bg-white rounded-xl shadow-md p-6 h-full border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">HR Summary</h3>
            <div className="space-y-4">
                {metrics.map((metric) => (
                    <div key={metric.label} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 cursor-pointer" onClick={() => onNavigate(metric.item)}>
                        <span className="text-gray-700 font-medium text-sm">{metric.label}</span>
                        <span className={`font-bold text-lg ${metric.color}`}>{metric.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DailyReportTemplate: React.FC<{ onBack: () => void; userType: UserType; currentUser: AppUser | null | undefined }> = ({ onBack, userType, currentUser }) => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-800">Daily Reports</h2>
            <Button variant="secondary" onClick={onBack}>Back</Button>
        </div>
        <div className="bg-white p-8 text-center text-gray-500 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-col items-center">
                <svg className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-xl font-semibold text-gray-700">Daily Report Generation</p>
                <p className="mt-2 text-gray-500 max-w-sm">
                    This feature is currently under development. Once available, you will be able to generate and download detailed daily reports for {userType.toLowerCase()} operations.
                </p>
            </div>
        </div>
    </div>
);

const AddLineupForm: React.FC<{ 
    onClose: () => void; 
    vendors: any[]; 
    panelConfig: PanelConfig | null; 
    onAddLineup: (lineupData: Omit<DailyLineup, 'id' | 'submittedBy' | 'createdAt'>) => void;
}> = ({ onClose, vendors, panelConfig, onAddLineup }) => {
  const [formData, setFormData] = useState({ 
    name: '', mobile: '', vendor: '', role: '', location: '', store: '', status: 'Connected', 
    interviewDate: '', interviewTime: '', interviewPlace: '' 
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const selectedVendor = useMemo(() => {
    if (!formData.vendor || formData.vendor === 'Direct' || !vendors) return null;
    return vendors.find(v => v.brandName === formData.vendor);
  }, [formData.vendor, vendors]);
  
  const availableRoles = useMemo<string[]>(() => {
    const rolesResult: any = formData.vendor === 'Direct' ? panelConfig?.jobRoles : (selectedVendor as any)?.roles;
    return (Array.isArray(rolesResult) ? (rolesResult as string[]) : []) as string[];
  }, [formData.vendor, selectedVendor, panelConfig]);
  
  const availableLocations = useMemo<string[]>(() => {
    const locationsResult: any = formData.vendor === 'Direct' ? panelConfig?.locations : (selectedVendor as any)?.locations;
    return (Array.isArray(locationsResult) ? (locationsResult as string[]) : []) as string[];
  }, [formData.vendor, selectedVendor, panelConfig]);
  
  const availableStores = useMemo(() => (!formData.location || !panelConfig?.stores) ? [] : panelConfig.stores.filter(s => s.location === formData.location), [formData.location, panelConfig]);
  const handleVendorChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setFormData(prev => ({ ...prev, vendor: e.target.value, role: '', location: '', store: '' })); };
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setFormData(prev => ({ ...prev, location: e.target.value, store: '' })); };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLineup({ 
      candidateName: formData.name, 
      contact: formData.mobile, 
      vendor: formData.vendor, 
      role: formData.role, 
      location: formData.location, 
      storeName: formData.store, 
      callStatus: formData.status as CallStatus,
      interviewDate: formData.status === 'Interested' ? formData.interviewDate : null,
      interviewTime: formData.status === 'Interested' ? formData.interviewTime : null,
      interviewPlace: formData.status === 'Interested' ? formData.interviewPlace : null,
    });
    onClose();
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input id="lineup-name" name="name" label="Candidate Name" value={formData.name} onChange={handleChange} required />
        <Input id="lineup-mobile" name="mobile" label="Mobile Number" value={formData.mobile} onChange={handleChange} required />
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Company / Vendor</label><select name="vendor" value={formData.vendor} onChange={handleVendorChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"><option value="">Select a vendor</option><option value="Direct">Direct</option>{vendors.map(v => ( <option key={v.id} value={v.brandName}>{v.brandName}</option> ))}</select></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Role</label><select name="role" value={formData.role} onChange={handleChange} disabled={!formData.vendor || availableRoles.length === 0} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"><option value="">Select a role</option>{availableRoles.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Location</label><select name="location" value={formData.location} onChange={handleLocationChange} disabled={!formData.vendor || availableLocations.length === 0} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"><option value="">Select a location</option>{availableLocations.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label><select name="store" value={formData.store} onChange={handleChange} disabled={!formData.location || availableStores.length === 0} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"><option value="">Select a store</option>{availableStores.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}</select></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Call Status</label><select name="status" value={formData.status} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"><option value="Connected">Connected</option><option value="Interested">Interested</option><option value="No Answer">No Answer</option><option value="Not Interested">Not Interested</option><option value="Callback">Callback</option><option value="Already Call">Already Call</option></select></div>
      </div>
      {formData.status === 'Interested' && (
        <div className="p-4 bg-blue-50 rounded-lg space-y-4">
          <p className="text-sm font-bold text-blue-800">Interview Confirmation Details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="lineup-interview-date" name="interviewDate" label="Interview Date" type="date" value={formData.interviewDate} onChange={handleChange} required />
            <Input id="lineup-interview-time" name="interviewTime" label="Interview Time" type="time" value={formData.interviewTime} onChange={handleChange} required />
            <div className="md:col-span-2">
                <Input id="lineup-interview-place" name="interviewPlace" label="Interview Place" value={formData.interviewPlace} onChange={handleChange} placeholder="Address for walk-in" required />
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary" className="bg-[#0f172a] hover:bg-[#1e293b] text-white">Add Lineup</Button></div>
    </form>
  );
};

const EditLineupForm: React.FC<{ lineup: DailyLineup; onSave: (data: DailyLineup) => void; onClose: () => void; }> = ({ lineup, onSave, onClose }) => {
    const [formData, setFormData] = useState<DailyLineup>(lineup);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };
    const callStatuses: CallStatus[] = ['Applied', 'Connected', 'Interested', 'No Answer', 'Not Interested', 'Callback', 'Already Call'];
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p><strong>Candidate:</strong> {formData.candidateName}</p><p><strong>Role:</strong> {formData.role} at {formData.vendor}</p><hr/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Call Status</label>
                <select name="callStatus" value={formData.callStatus} onChange={(e) => handleChange(e as any)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  {callStatuses.map(status => ( <option key={status} value={status}>{status}</option> ))}
                </select>
              </div>
            </div>
            {formData.callStatus === 'Interested' && (
              <div className="p-4 bg-blue-50 rounded-lg space-y-4">
                <p className="text-sm font-bold text-blue-800">Confirmed Interview Details</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input id="edit-interview-date" name="interviewDate" label="Interview Date" type="date" value={formData.interviewDate || ''} onChange={handleChange} required />
                  <Input id="edit-interview-time" name="interviewTime" label="Interview Time" type="time" value={formData.interviewTime || ''} onChange={handleChange} required />
                  <div className="md:col-span-2">
                      <Input id="edit-interview-place" name="interviewPlace" label="Interview Place" value={formData.interviewPlace || ''} onChange={handleChange} placeholder="Address for walk-in" required />
                  </div>
                </div>
                <p className="text-xs text-blue-600">Note: Updating these fields will reflect immediately in the candidate's My Interviews tab.</p>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary">Save Changes</Button></div>
        </form>
    );
};

const DailyLineupsView: React.FC<{ userType: UserType; vendors: any[]; panelConfig: PanelConfig | null; }> = ({ userType, vendors, panelConfig }) => {
  const [isAddLineupOpen, setIsAddLineupOpen] = useState(false);
  const [editingLineup, setEditingLineup] = useState<DailyLineup | null>(null);
  const [filters, setFilters] = useState({ search: '', vendor: '', role: '', location: '', storeName: '', submittedBy: '', callStatus: '' });
  const [lineups, setLineups] = useState<DailyLineup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
  const [isCvLoading, setIsCvLoading] = useState(false);

  useEffect(() => { setIsLoading(true); const unsubscribe = onDailyLineupsChange((data) => { setLineups(data); setIsLoading(false); }); return () => unsubscribe(); }, []);
  
  const handleAddLineup = async (data: Omit<DailyLineup, 'id' | 'submittedBy' | 'createdAt'>) => { try { await addDailyLineup({ ...data, submittedBy: 'Admin' }); } catch (e) { alert("Error adding lineup."); } };
  const handleSaveEdit = async (updated: DailyLineup) => { 
    try { 
      const { id, ...dataToUpdate } = updated; 
      await updateDailyLineup(id, dataToUpdate); 
      if (updated.callStatus === 'Interested' && updated.interviewDate) { 
        await addCandidateToSelection(updated); 
      } 
      setEditingLineup(null); 
    } catch (e) { alert("Error updating lineup."); } 
  };

  const handleViewCv = async (mobile: string) => {
      setIsCvLoading(true);
      try {
          const profile = await getUserProfileByMobile(mobile);
          if (profile) {
              setViewingProfile(profile);
          } else {
              alert("This candidate has not created their professional CV yet.");
          }
      } catch (err) {
          alert("Error fetching profile.");
      } finally {
          setIsCvLoading(false);
      }
  };

  // Fix: Explicitly type the result as string[] and use Array.from with Set<string> to avoid 'unknown[]' issues when spreading into string[].
  const uniqueOptions = (key: keyof DailyLineup): string[] => { const values = lineups.map(item => (item as any)[key]); return Array.from(new Set<string>(values.filter(v => v != null).map(v => String(v)))); };
  const FilterWrapper: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => ( <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{label}</label>{children}</div> );
  const displayLineups = lineups.filter(l => (filters.search === '' || l.candidateName.toLowerCase().includes(filters.search.toLowerCase())) && (filters.vendor === '' || l.vendor === filters.vendor) && (filters.role === '' || l.role === filters.role) && (filters.location === '' || l.location === filters.location) && (filters.storeName === '' || l.storeName === filters.storeName) && (filters.submittedBy === '' || l.submittedBy.includes(filters.submittedBy)) && (filters.callStatus === '' || l.callStatus === filters.callStatus));
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4"><h2 className="text-3xl font-bold text-gray-800">Daily Lineups</h2><div className="flex gap-3"><Button variant="secondary" size="sm" onClick={() => alert('Report downloaded!')}>Download Report</Button><Button onClick={() => setIsAddLineupOpen(true)}>Add New Lineup</Button></div></div>
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"><FilterWrapper label="Search"><input type="text" name="search" value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></FilterWrapper><FilterWrapper label="Vendor"><select name="vendor" value={filters.vendor} onChange={e => setFilters({...filters, vendor: e.target.value})} className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"><option value="">All</option>{uniqueOptions('vendor').map(v => <option key={v} value={v}>{v}</option>)}</select></FilterWrapper><FilterWrapper label="Status"><select name="callStatus" value={filters.callStatus} onChange={e => setFilters({...filters, callStatus: e.target.value})} className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"><option value="">All</option>{uniqueOptions('callStatus').map(s => <option key={s} value={s}>{s}</option>)}</select></FilterWrapper><div className="flex items-end"><Button variant="ghost" onClick={() => setFilters({search:'', vendor:'', role:'', location:'', storeName:'', submittedBy:'', callStatus:''})} className="w-full">Clear</Button></div></div></div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Candidate</th><th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Vendor</th><th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Role</th><th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Status</th><th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase">Actions</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{isLoading ? <tr><td colSpan={5} className="px-6 py-8 text-center">Loading...</td></tr> : displayLineups.map(item => ( <tr key={item.id} className="hover:bg-gray-50"><td className="px-6 py-4 text-sm font-semibold">{item.candidateName}</td><td className="px-6 py-4 text-sm">{item.vendor}</td><td className="px-6 py-4 text-sm">{item.role}</td><td className="px-6 py-4"><span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{item.callStatus}</span></td><td className="px-6 py-4 text-right flex justify-end gap-2"><Button variant="small-light" size="sm" onClick={() => handleViewCv(item.contact)} loading={isCvLoading}>View CV</Button><Button variant="ghost" size="sm" onClick={() => setEditingLineup(item)}>Edit</Button></td></tr> ))}</tbody></table></div>
      <Modal isOpen={isAddLineupOpen} onClose={() => setIsAddLineupOpen(false)} title="Add New Lineup" maxWidth="max-w-2xl"><AddLineupForm onClose={() => setIsAddLineupOpen(false)} vendors={vendors} panelConfig={panelConfig} onAddLineup={handleAddLineup} /></Modal>
      <Modal isOpen={!!editingLineup} onClose={() => setEditingLineup(null)} title="Edit Lineup" maxWidth="max-w-xl">{editingLineup && <EditLineupForm lineup={editingLineup} onSave={handleSaveEdit} onClose={() => setEditingLineup(null)} />}</Modal>
      <CvPreviewModal isOpen={!!viewingProfile} onClose={() => setViewingProfile(null)} profile={viewingProfile} />
    </div>
  );
};

const KanbanCard: React.FC<{ candidate: Candidate; onCvClick: () => void }> = ({ candidate, onCvClick }) => (
    <div className={`bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all`}>
        <div className="flex justify-between items-start mb-2"><h4 className="font-semibold text-gray-900 text-sm truncate">{candidate.name}</h4></div>
        <p className="text-xs text-gray-500 truncate">{candidate.role}</p>
        <div className="mt-3 flex justify-between items-center">
            <p className="text-[10px] text-gray-400 uppercase font-bold">{candidate.storeName}</p>
            <button onClick={(e) => { e.stopPropagation(); onCvClick(); }} className="text-[10px] text-blue-600 font-bold hover:underline">PROFESSIONAL CV</button>
        </div>
    </div>
);

const SelectionDashboardView: React.FC<{ teamData: TeamMemberPerformance[], userType: UserType }> = ({ userType }) => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);

    useEffect(() => { const unsubscribe = onCandidatesChange(data => { setCandidates(data); setIsLoading(false); }); return () => unsubscribe(); }, []);
    
    const handleViewCv = async (mobile: string) => {
        try {
            const profile = await getUserProfileByMobile(mobile);
            if (profile) setViewingProfile(profile);
            else alert("Candidate hasn't completed their CV.");
        } catch (err) { alert("Error loading CV."); }
    };

    const columns: Candidate['status'][] = ['Sourced', 'On the way', 'Interview', 'Selected'];
    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">Selection Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {columns.map(status => (
                    <div key={status} className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[400px]">
                        <div className="p-4 border-b font-bold text-gray-700">{status} ({candidates.filter(c => c.status === status).length})</div>
                        <div className="p-3 space-y-3 bg-gray-50/30 h-full">{isLoading ? '...' : candidates.filter(c => c.status === status).map(c => <KanbanCard key={c.id} candidate={c} onCvClick={() => handleViewCv(c.phone)} />)}</div>
                    </div>
                ))}
            </div>
            <CvPreviewModal isOpen={!!viewingProfile} onClose={() => setViewingProfile(null)} profile={viewingProfile} />
        </div>
    );
};

const AllCandidatesView: React.FC<{ userType: UserType; jobs: Job[] }> = ({ userType, jobs }) => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);

    useEffect(() => onCandidatesChange(setCandidates), []);

    const handleViewCv = async (mobile: string) => {
        try {
            const profile = await getUserProfileByMobile(mobile);
            if (profile) setViewingProfile(profile);
            else alert("Candidate hasn't completed their CV.");
        } catch (err) { alert("Error loading CV."); }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">All Candidates</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Role</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Status</th><th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase">Action</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{candidates.map(c => <tr key={c.id}><td className="px-6 py-4 text-sm font-medium">{c.name}</td><td className="px-6 py-4 text-sm">{c.role}</td><td className="px-6 py-4"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100">{c.status}</span></td><td className="px-6 py-4 text-right flex justify-end gap-2"><Button variant="small-light" size="sm" onClick={() => handleViewCv(c.phone)}>View CV</Button><Button variant="ghost" size="sm">View</Button></td></tr>)}</tbody></table></div>
            <CvPreviewModal isOpen={!!viewingProfile} onClose={() => setViewingProfile(null)} profile={viewingProfile} />
        </div>
    );
};

const AttendanceView: React.FC = () => ( <div className="p-8 text-center text-gray-500 bg-white rounded-xl border">Attendance View Content Here</div> );
const ComplaintsView: React.FC<{ userType: UserType, currentUserProfile?: UserProfile | null }> = () => ( <div className="p-8 text-center text-gray-500 bg-white rounded-xl border">Complaints View Content Here</div> );
const WarningLettersView: React.FC<{ userType: UserType, currentUserProfile?: UserProfile | null }> = () => ( <div className="p-8 text-center text-gray-500 bg-white rounded-xl border">Warning Letters Content Here</div> );

const VendorDirectoryView: React.FC = () => {
    const [vendors, setVendors] = useState<any[]>([]);
    useEffect(() => { getVendors().then(setVendors); }, []);
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Vendor Directory</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {vendors.map(v => (
                    <div key={v.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-lg">{v.partnerName || 'Unknown'}</h3>
                        <p className="text-blue-600 text-sm">{v.brandName}</p>
                        <p className="text-gray-500 text-xs mt-2">{v.email}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DemoRequestsView: React.FC = () => {
    const [requests, setRequests] = useState<DemoRequest[]>([]);
    useEffect(() => onDemoRequestsChange(setRequests), []);
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Demo Requests</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden"><table className="min-w-full"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Company</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Contact</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Date</th></tr></thead><tbody>{requests.map(r => <tr key={r.id}><td className="px-6 py-4 text-sm font-semibold">{r.companyName}</td><td className="px-6 py-4 text-sm">{r.email}</td><td className="px-6 py-4 text-sm text-gray-500">{new Date(r.requestDate).toLocaleDateString()}</td></tr>)}</tbody></table></div>
        </div>
    );
};

const RevenueView: React.FC = () => ( <div className="p-8 text-center text-gray-500 bg-white rounded-xl border">Revenue View Implementation Here</div> );

interface UnifiedRequirement { id: string; client: string; partner: string; role: string; total: number; pending: number; approved: number; location: string; store: string; team: string; }

const BreakdownTable: React.FC<{ title: string; data: { name: string; total: number; pending: number; approved: number }[] }> = ({ title, data }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-4">
        <h3 className="px-6 py-4 text-lg font-semibold text-gray-800 border-b">{title}</h3>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pending</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Approved</th></tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">{data.map(item => ( <tr key={item.name}><td className="px-6 py-4 font-semibold">{item.name}</td><td className="px-6 py-4 text-right">{item.total}</td><td className="px-6 py-4 text-right text-yellow-600">{item.pending}</td><td className="px-6 py-4 text-right text-green-600">{item.approved}</td></tr> ))}</tbody>
            </table>
        </div>
    </div>
);

const PartnerRequirementsDetailView: React.FC<{ onBack: () => void; jobs: Job[]; allPartnerRequirements: (PartnerRequirement & { partnerUid: string })[]; users: UserProfile[]; }> = ({ onBack, jobs, allPartnerRequirements, users }) => {
    const requirements = useMemo(() => {
        const userMap = new Map(users.map(u => [u.uid, u.partnerName || u.name]));
        const vendorJobs: UnifiedRequirement[] = jobs.filter(job => job.jobCategory !== 'Direct').map(job => ({ id: `job-${job.id}`, client: job.jobCategory, partner: job.company, role: job.title, total: job.numberOfOpenings, pending: 0, approved: job.numberOfOpenings, location: job.jobCity, store: job.storeName || job.locality, team: 'Unassigned' }));
        const partnerReqs: UnifiedRequirement[] = allPartnerRequirements.map(req => ({ id: `req-${req.id}`, client: req.client, partner: userMap.get(req.partnerUid) || 'Unknown', role: req.title, total: req.openings, pending: req.submissionStatus === 'Approved' ? 0 : req.openings, approved: req.submissionStatus === 'Approved' ? req.openings : 0, location: req.location, store: req.location, team: 'Unassigned' }));
        return [...vendorJobs, ...partnerReqs];
    }, [jobs, allPartnerRequirements, users]);
    const totalStats = requirements.reduce((acc, curr) => { acc.total += curr.total; acc.pending += curr.pending; acc.approved += curr.approved; return acc; }, { total: 0, pending: 0, approved: 0 });
    const createBreakdown = (data: UnifiedRequirement[], key: 'client' | 'partner' | 'role' | 'location' | 'store' | 'team') => {
        const breakdown: Record<string, { total: number, pending: number, approved: number }> = {};
        for (const item of data) { const group = item[key]; if (!breakdown[group]) breakdown[group] = { total: 0, pending: 0, approved: 0 }; breakdown[group].total += item.total; breakdown[group].pending += item.pending; breakdown[group].approved += item.approved; }
        return Object.entries(breakdown).map(([name, stats]) => ({ name, ...stats }));
    };
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-3xl font-bold text-gray-800">Requirements Breakdown</h2><Button variant="secondary" onClick={onBack}>Back</Button></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"><h4 className="text-sm font-semibold text-gray-500">Total Openings</h4><p className="text-3xl font-bold text-blue-600">{totalStats.total}</p></div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"><h4 className="text-sm font-semibold text-gray-500">Pending Approval</h4><p className="text-3xl font-bold text-yellow-600">{totalStats.pending}</p></div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"><h4 className="text-sm font-semibold text-gray-500">Approved Openings</h4><p className="text-3xl font-bold text-green-600">{totalStats.approved}</p></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BreakdownTable title="Store Wise Breakdown" data={createBreakdown(requirements, 'store')} />
                <BreakdownTable title="Role Wise Breakdown" data={createBreakdown(requirements, 'role')} />
            </div>
        </div>
    );
};


// --- MAIN DASHBOARD CONTENT COMPONENT ---

const AdminDashboardContent: React.FC<AdminDashboardContentProps> = ({
  pipelineStats,
  vendorStats,
  complaintStats,
  partnerRequirementStats,
  candidatesByProcess,
  candidatesByRole,
  teamPerformance,
  jobs,
  onAddJob,
  onUpdateJob,
  onDeleteJob,
  activeAdminMenuItem,
  onAdminMenuItemClick,
  userType,
  branding,
  onUpdateBranding,
  currentUser,
  currentUserProfile,
  onLogoUpload,
  currentLogoSrc
}) => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [panelConfig, setPanelConfig] = useState<PanelConfig | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allPartnerReqs, setAllPartnerReqs] = useState<(PartnerRequirement & { partnerUid: string })[]>([]);

  useEffect(() => {
    getVendors().then(setVendors);
    getPanelConfig().then(setPanelConfig);
    getUsers().then(setAllUsers);
    const unsub = onAllPartnerRequirementsChange(setAllPartnerReqs);
    return () => unsub();
  }, []);

  const handleUpdatePanelConfig = async (cfg: PanelConfig) => {
    await updatePanelConfig(cfg);
    setPanelConfig(cfg);
  };

  const renderContent = () => {
    switch (activeAdminMenuItem) {
      case AdminMenuItem.Dashboard:
        if (userType === UserType.HR) return <HRDashboardView onNavigate={onAdminMenuItemClick} />;
        if (userType === UserType.PARTNER) return <PartnerDashboardView onNavigate={onAdminMenuItemClick} partnerRequirementStats={partnerRequirementStats} activeCandidatesCount={0} pendingInvoicesCount={0} supervisorsCount={0} />;
        if (userType === UserType.STORE_SUPERVISOR) return <SupervisorDashboardView />;
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Pipeline Status" metrics={[
                { label: "Active", value: pipelineStats.active, color: "text-blue-600" },
                { label: "Interview", value: pipelineStats.interview, color: "text-indigo-600" },
                { label: "Rejected", value: pipelineStats.rejected, color: "text-red-600" },
                { label: "Quit", value: pipelineStats.quit, color: "text-gray-600" }
              ]} />
              <StatCard title="Total Vendors" value={vendorStats.total} icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" /></svg>} />
              <StatCard title="Complaints" metrics={[{ label: "Active", value: complaintStats.active, color: "text-red-600" }, { label: "Closed", value: complaintStats.closed, color: "text-green-600" }]} />
              <StatCard title="Requirements" metrics={[{ label: "Pending", value: partnerRequirementStats.pending, color: "text-yellow-600" }, { label: "Approved", value: partnerRequirementStats.approved, color: "text-green-600" }]} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProgressBarCard title="Candidates by Process" data={candidatesByProcess} />
              <ProgressBarCard title="Candidates by Role" data={candidatesByRole} />
            </div>
            <HRUpdatesCard />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2"><TeamPerformanceTable data={teamPerformance} /></div>
                <div className="lg:col-span-1"><HRSummaryCard onNavigate={onAdminMenuItemClick} /></div>
              </div>
            </div>
          </div>
        );
      case AdminMenuItem.DailyLineups:
        return <DailyLineupsView userType={userType} vendors={vendors} panelConfig={panelConfig} />;
      case AdminMenuItem.SelectionDashboard:
        return <SelectionDashboardView teamData={teamPerformance} userType={userType} />;
      case AdminMenuItem.AllCandidates:
        return <AllCandidatesView userType={userType} jobs={jobs} />;
      case AdminMenuItem.Attendance:
        return <AttendanceView />;
      case AdminMenuItem.Complaints:
        return <ComplaintsView userType={userType} currentUserProfile={currentUserProfile} />;
      case AdminMenuItem.WarningLetters:
        return <WarningLettersView userType={userType} currentUserProfile={currentUserProfile} />;
      case AdminMenuItem.Reports:
        return <DailyReportTemplate onBack={() => onAdminMenuItemClick(AdminMenuItem.Dashboard)} userType={userType} currentUser={currentUser} />;
      case AdminMenuItem.ManageJobBoard:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Job Board Management</h2>
            <JobPostingForm onAddJob={onAddJob} vendors={vendors} panelConfig={panelConfig} />
            <JobList jobs={jobs} currentUserType={userType} onDeleteJob={onDeleteJob} />
          </div>
        );
      case AdminMenuItem.VendorDirectory:
        return <VendorDirectoryView />;
      case AdminMenuItem.DemoRequests:
        return <DemoRequestsView />;
      case AdminMenuItem.Revenue:
        return <RevenueView />;
      case AdminMenuItem.ManagePayroll:
        return <ManagePayrollView />;
      case AdminMenuItem.GenerateOfferLetter:
        return <GenerateOfferLetterView />;
      case AdminMenuItem.CTCGenerate:
        return <CTCGeneratorView />;
      case AdminMenuItem.Payslips:
        return <PayslipsView />;
      case AdminMenuItem.EmployeeManagement:
        return <EmployeeManagementView />;
      case AdminMenuItem.PartnerUpdateStatus:
        return <PartnerUpdateStatusView />;
      case AdminMenuItem.PartnerActiveCandidates:
        return <PartnerActiveCandidatesView currentUserProfile={currentUserProfile} />;
      case AdminMenuItem.PartnerRequirements:
        return <PartnerRequirementsView currentUser={currentUser} currentUserProfile={currentUserProfile} jobs={jobs} />;
      case AdminMenuItem.PartnerInvoices:
        return <PartnerInvoicesView currentUser={currentUser} />;
      case AdminMenuItem.PartnerSalaryUpdates:
        return <PartnerSalaryUpdatesView currentUser={currentUser} />;
      case AdminMenuItem.ManageSupervisors:
        return <PartnerManageSupervisorsView />;
      case AdminMenuItem.PartnerRequirementsDetail:
        return <PartnerRequirementsDetailView onBack={() => onAdminMenuItemClick(AdminMenuItem.Dashboard)} jobs={jobs} allPartnerRequirements={allPartnerReqs} users={allUsers} />;
      case AdminMenuItem.SupervisorDashboard:
        return <SupervisorDashboardView />;
      case AdminMenuItem.StoreAttendance:
        return <StoreAttendanceView currentUserProfile={currentUserProfile} />;
      case AdminMenuItem.StoreEmployees:
        return <StoreEmployeesView />;
      case AdminMenuItem.MyProfile:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
               <p className="text-gray-600">Username: {currentUser?.email}</p>
               <p className="text-gray-600">Role: {userType}</p>
            </div>
          </div>
        );
      case AdminMenuItem.Settings:
        return (
          <SettingsView
            branding={branding}
            onUpdateBranding={onUpdateBranding}
            currentLogoSrc={currentLogoSrc}
            onLogoUpload={onLogoUpload}
            currentUserProfile={currentUserProfile}
            panelConfig={panelConfig}
            onUpdatePanelConfig={handleUpdatePanelConfig}
            vendors={vendors}
          />
        );
      default:
        return null;
    }
  };

  return <div className="animate-fade-in">{renderContent()}</div>;
};

export default AdminDashboardContent;