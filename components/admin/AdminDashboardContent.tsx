
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { getRevenueData, RevenueData, getPanelConfig, updatePanelConfig, createVendor, getVendors } from '../../services/firebaseService';
import HelpCenterView from '../candidate/HelpCenterView';

declare const html2pdf: any;

// --- SETTINGS TABS TYPE ---
type SettingsTab = 'Team & Roles' | 'Permissions' | 'Role' | 'Panel Options' | 'My Account' | 'Branding';


const TeamWiseTable = () => {
    const [activeTab, setActiveTab] = useState('Team Wise');
    const tabs = ['Team Wise', 'Partner Wise', 'Store Wise', 'Role Wise'];

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
            <div className="p-4 border-b">
                <div className="flex space-x-2">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                activeTab === tab 
                                ? 'bg-yellow-400 text-yellow-900' 
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>
            <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{activeTab}</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                {['TEAM', 'LOCATION', 'ROLE', 'STORE', 'BRAND', 'PARTNER', 'TOTAL OPENINGS', 'PENDING', 'APPROVED'].map(header => (
                                    <th key={header} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={9} className="text-center py-10 text-gray-400">
                                    No data available
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


// New HR Summary Card component
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
                    <div
                        key={metric.label}
                        className="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
                        onClick={() => onNavigate(metric.item)}
                    >
                        <span className="text-gray-700 font-medium text-sm">{metric.label}</span>
                        <span className={`font-bold text-lg ${metric.color}`}>{metric.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Internal Components merged for file size optimization

const AddLineupForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    vendor: '',
    role: '',
    location: '',
    store: '',
    status: 'Connected',
    interviewDateTime: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically call a prop function to add the lineup
    console.log('Lineup Data:', formData);
    alert('Lineup added successfully (Demo)!');
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
          id="lineup-name" 
          name="name"
          label="Candidate Name" 
          placeholder="e.g. John Doe"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <Input 
          id="lineup-mobile" 
          name="mobile"
          label="Mobile Number" 
          placeholder="+91 98765 43210"
          value={formData.mobile}
          onChange={handleChange}
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company / Vendor</label>
          <select 
            name="vendor"
            value={formData.vendor}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select a vendor</option>
            <option value="Vendor A">Vendor A</option>
            <option value="Vendor B">Vendor B</option>
            <option value="Direct">Direct</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select 
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={!formData.vendor}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">{formData.vendor ? "Select a role" : "Select a vendor first"}</option>
            <option value="Picker">Picker</option>
            <option value="Packer">Packer</option>
            <option value="Sales Executive">Sales Executive</option>
            <option value="Team Leader">Team Leader</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <select 
            name="location"
            value={formData.location}
            onChange={handleChange}
            disabled={!formData.vendor}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">{formData.vendor ? "Select a location" : "Select a vendor first"}</option>
            <option value="Delhi">Delhi</option>
            <option value="Noida">Noida</option>
            <option value="Gurgaon">Gurgaon</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
          <select 
            name="store"
            value={formData.store}
            onChange={handleChange}
            disabled={!formData.location}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">{formData.location ? "Select a store" : "Select a location first"}</option>
            <option value="DLF Mall">DLF Mall</option>
            <option value="GIP Mall">GIP Mall</option>
            <option value="Select Citywalk">Select Citywalk</option>
          </select>
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Call Status</label>
          <select 
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="Connected">Connected</option>
            <option value="Interested">Interested</option>
            <option value="No Answer">No Answer</option>
            <option value="Not Interested">Not Interested</option>
            <option value="Callback">Callback</option>
            <option value="Already Call">Already Call</option>
          </select>
        </div>

        {formData.status === 'Interested' && (
            <Input
                id="lineup-interview-datetime"
                name="interviewDateTime"
                label="Interview Date & Time"
                type="datetime-local"
                value={formData.interviewDateTime}
                onChange={handleChange}
                required
            />
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
        <Button 
            type="button" 
            variant="secondary" 
            onClick={onClose}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button 
            type="submit" 
            variant="primary"
            className="bg-[#0f172a] hover:bg-[#1e293b] text-white"
        >
          Add Lineup
        </Button>
      </div>
    </form>
  );
};

type CallStatus = 'Interested' | 'Connected' | 'No Answer' | 'Not Interested' | 'Callback' | 'Already Call';
interface DailyLineup {
    id: string;
    candidateName: string;
    contact: string;
    vendor: string;
    role: string;
    location: string;
    storeName: string;
    submittedBy: string;
    callStatus: CallStatus;
    interviewDateTime: string | null;
}

const EditLineupForm: React.FC<{
    lineup: DailyLineup;
    onSave: (data: DailyLineup) => void;
    onClose: () => void;
}> = ({ lineup, onSave, onClose }) => {
    const [formData, setFormData] = useState<DailyLineup>(lineup);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };
    
    const callStatuses: CallStatus[] = ['Connected', 'Interested', 'No Answer', 'Not Interested', 'Callback', 'Already Call'];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Displaying some fields as read-only for context */}
            <p><strong>Candidate:</strong> {formData.candidateName}</p>
            <p><strong>Role:</strong> {formData.role} at {formData.vendor}</p>
            <hr/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Call Status</label>
                    <select
                        name="callStatus"
                        value={formData.callStatus}
                        onChange={(e) => handleChange(e as any)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        {callStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>

                {formData.callStatus === 'Interested' && (
                    <Input
                        id="lineup-interview-datetime-edit"
                        name="interviewDateTime"
                        label="Interview Date & Time"
                        type="datetime-local"
                        value={formData.interviewDateTime || ''}
                        onChange={handleChange}
                        required
                    />
                )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" variant="primary">Save Changes</Button>
            </div>
        </form>
    );
};


const DailyLineupsView: React.FC<{ userType: UserType }> = ({ userType }) => {
  const [isAddLineupOpen, setIsAddLineupOpen] = useState(false);
  const [editingLineup, setEditingLineup] = useState<DailyLineup | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    vendor: '',
    role: '',
    location: '',
    storeName: '',
    submittedBy: '',
    callStatus: '',
  });

  const formatInterviewDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
        });
    } catch (e) {
        return 'Invalid Date';
    }
  };

  const isToday = (dateString: string) => {
      if (!dateString) return false;
      const interviewDate = new Date(dateString);
      const today = new Date();
      return interviewDate.toDateString() === today.toDateString();
  };

  const [lineups, setLineups] = useState<DailyLineup[]>([
    { id: 'L001', candidateName: 'Amit Verma', contact: '+919876543210', vendor: 'Vendor A', role: 'Picker', location: 'Delhi', storeName: 'Select Citywalk', submittedBy: 'Rahul', callStatus: 'Interested', interviewDateTime: '2023-10-28T11:00' },
    { id: 'L002', candidateName: 'Priya Sharma', contact: '+919876543211', vendor: 'Vendor B', role: 'Sales Executive', location: 'Noida', storeName: 'GIP Mall', submittedBy: 'Sneha', callStatus: 'Connected', interviewDateTime: null },
    { id: 'L003', candidateName: 'Rohan Gupta', contact: '+919876543212', vendor: 'Vendor A', role: 'Picker', location: 'Delhi', storeName: 'Select Citywalk', submittedBy: 'Rahul', callStatus: 'Callback', interviewDateTime: null },
  ]);

  const handleSaveEdit = (updatedLineup: DailyLineup) => {
    setLineups(lineups.map(l => l.id === updatedLineup.id ? updatedLineup : l));
    setEditingLineup(null); // This will close the modal
  };

  // Filtering Logic for Team Lead
  const isTeamLead = userType === UserType.TEAMLEAD;
  const myTeamMembers = ['Rahul', 'Sneha']; 
  
  const baseLineups = isTeamLead 
    ? lineups.filter(l => myTeamMembers.some(member => l.submittedBy.includes(member)))
    : lineups;

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      vendor: '',
      role: '',
      location: '',
      storeName: '',
      submittedBy: '',
      callStatus: '',
    });
  };

  const displayLineups = baseLineups.filter(l => {
    return (
      (filters.search === '' || l.candidateName.toLowerCase().includes(filters.search.toLowerCase())) &&
      (filters.vendor === '' || l.vendor === filters.vendor) &&
      (filters.role === '' || l.role === filters.role) &&
      (filters.location === '' || l.location === filters.location) &&
      (filters.storeName === '' || l.storeName === filters.storeName) &&
      (filters.submittedBy === '' || l.submittedBy.includes(filters.submittedBy)) &&
      (filters.callStatus === '' || l.callStatus === filters.callStatus)
    );
  }).sort((a, b) => {
      const aIsInterested = a.callStatus === 'Interested' && a.interviewDateTime;
      const bIsInterested = b.callStatus === 'Interested' && b.interviewDateTime;

      if (aIsInterested && !bIsInterested) return -1;
      if (!aIsInterested && bIsInterested) return 1;
      if (aIsInterested && bIsInterested) {
          return new Date(a.interviewDateTime!).getTime() - new Date(b.interviewDateTime!).getTime();
      }
      return 0;
  });

  const uniqueOptions = (key: keyof DailyLineup) => [...new Set(lineups.map(item => item[key]))];
  
  const FilterWrapper: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
      {children}
    </div>
  );

  const selectClassName = "block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Daily Lineups {isTeamLead && <span className="text-base font-normal text-indigo-600 ml-2">(My Team)</span>}</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => alert('Report downloaded!')}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Report
          </button>
          <button 
            onClick={() => setIsAddLineupOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 bg-[#0f172a] text-white rounded-lg hover:bg-[#1e293b] text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            Add New Lineup
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FilterWrapper label="Search Candidate">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className={selectClassName.replace('bg-white', '')}
              placeholder="e.g. Amit Verma"
            />
          </FilterWrapper>
          <FilterWrapper label="Vendor / Role">
            <select name="vendor" value={filters.vendor} onChange={handleFilterChange} className={selectClassName}>
              <option value="">All Vendors</option>
              {uniqueOptions('vendor').map(v => <option key={v as string} value={v as string}>{v}</option>)}
            </select>
          </FilterWrapper>
          <FilterWrapper label="Role">
            <select name="role" value={filters.role} onChange={handleFilterChange} className={selectClassName}>
              <option value="">All Roles</option>
              {uniqueOptions('role').map(r => <option key={r as string} value={r as string}>{r}</option>)}
            </select>
          </FilterWrapper>
          <FilterWrapper label="Location">
            <select name="location" value={filters.location} onChange={handleFilterChange} className={selectClassName}>
              <option value="">All Locations</option>
              {uniqueOptions('location').map(l => <option key={l as string} value={l as string}>{l}</option>)}
            </select>
          </FilterWrapper>
          <FilterWrapper label="Store Name">
            <select name="storeName" value={filters.storeName} onChange={handleFilterChange} className={selectClassName}>
              <option value="">All Stores</option>
              {uniqueOptions('storeName').map(s => <option key={s as string} value={s as string}>{s}</option>)}
            </select>
          </FilterWrapper>
          <FilterWrapper label="Submitted By">
            <select name="submittedBy" value={filters.submittedBy} onChange={handleFilterChange} className={selectClassName}>
              <option value="">All</option>
              {uniqueOptions('submittedBy').map(s => <option key={s as string} value={s as string}>{s}</option>)}
            </select>
          </FilterWrapper>
          <FilterWrapper label="Call Status">
            <select name="callStatus" value={filters.callStatus} onChange={handleFilterChange} className={selectClassName}>
              <option value="">All Statuses</option>
              {uniqueOptions('callStatus').map(s => <option key={s as string} value={s as string}>{s}</option>)}
            </select>
          </FilterWrapper>
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full h-[42px] bg-white border border-gray-300 text-gray-700 font-medium py-2 px-6 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/50">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Candidate</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Vendor</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Store Name</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Submitted By</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Call Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Interview Date</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {displayLineups.length > 0 ? displayLineups.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900">{item.candidateName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600">{item.contact}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600">{item.vendor}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600">{item.role}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600">{item.location}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600">{item.storeName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600">{item.submittedBy}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    item.callStatus === 'Interested' ? 'bg-green-100 text-green-800' :
                                    item.callStatus === 'Connected' ? 'bg-blue-100 text-blue-800' :
                                    item.callStatus === 'No Answer' ? 'bg-yellow-100 text-yellow-800' :
                                    item.callStatus === 'Already Call' ? 'bg-purple-100 text-purple-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {item.callStatus}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {item.interviewDateTime ? (
                                    <div>
                                        <span className="text-gray-800 font-medium">{formatInterviewDate(item.interviewDateTime)}</span>
                                        {isToday(item.interviewDateTime) && (
                                            <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800 animate-pulse">
                                                Today
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-gray-400">--</span>
                                )}
                            </td>
                             <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setEditingLineup(item)} className="text-gray-400 hover:text-blue-600">Edit</button>
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan={10} className="px-6 py-8 text-center text-gray-500">No lineups found for the current filters.</td></tr>
                    )}
                </tbody>
            </table>
         </div>
         <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{displayLineups.length > 0 ? 1 : 0}</span> to <span className="font-medium">{displayLineups.length}</span> of <span className="font-medium">{baseLineups.length}</span> results
            </div>
         </div>
      </div>

      <Modal 
        isOpen={isAddLineupOpen} 
        onClose={() => setIsAddLineupOpen(false)} 
        title="Add New Lineup"
        maxWidth="max-w-2xl"
      >
        <AddLineupForm onClose={() => setIsAddLineupOpen(false)} />
      </Modal>

      <Modal
        isOpen={!!editingLineup}
        onClose={() => setEditingLineup(null)}
        title="Edit Lineup"
        maxWidth="max-w-xl"
      >
        {editingLineup && (
            <EditLineupForm
                lineup={editingLineup}
                onSave={handleSaveEdit}
                onClose={() => setEditingLineup(null)}
            />
        )}
      </Modal>
    </div>
  );
}

const KanbanCard: React.FC<{ candidate: any; isDragging: boolean }> = ({ candidate, isDragging }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 ${isDragging ? 'transform rotate-3 shadow-xl' : 'cursor-grab active:cursor-grabbing'}`}>
       <div className="flex justify-between items-start">
          <div className="flex items-center overflow-hidden min-w-0 mr-2 gap-2">
             {/* Drag Handle */}
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
             <div className='truncate'>
                <h4 className="font-semibold text-gray-900 text-sm truncate">{candidate.name}</h4>
                <span className="text-xs text-gray-600 truncate" title={candidate.storeName}>{candidate.storeName}</span>
             </div>
          </div>
          <button
             onClick={() => setIsExpanded(!isExpanded)}
             className="text-blue-600 text-xs font-semibold hover:text-blue-800 whitespace-nowrap bg-blue-50 px-2 py-0.5 rounded shrink-0"
          >
             {isExpanded ? 'Hide' : 'View'}
          </button>
       </div>
       {isExpanded && (
          <div className="mt-2 pt-2 border-t border-gray-100 space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">Role:</span> <span className="text-gray-800 font-medium">{candidate.role}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Phone:</span> <span className="text-gray-800 font-medium">{candidate.phone}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Recruiter:</span> <span className="text-gray-800 font-medium">{candidate.recruiter}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Date:</span> <span className="text-gray-800 font-medium">{candidate.date}</span></div>
          </div>
       )}
    </div>
  );
};

const SelectionDashboardView: React.FC<{ teamData: TeamMemberPerformance[], userType: UserType }> = ({ teamData, userType }) => {
  const [filters, setFilters] = useState({
    role: '',
    store: '',
    recruiter: '',
    stage: '',
    date: '',
  });

  const allKanbanData: any[] = [
    { id: 'C001', name: 'Amit Verma', role: 'Picker', storeName: 'Select Citywalk', phone: '9876543210', recruiter: 'Rahul', status: 'Sourced', date: '2023-10-27' },
    { id: 'C002', name: 'Priya Sharma', role: 'Sales Executive', storeName: 'GIP Mall', phone: '9876543211', recruiter: 'Sneha', status: 'Interview', date: '2023-10-26' },
    { id: 'C003', name: 'Rohan Gupta', role: 'Team Leader', storeName: 'DLF Mall', phone: '9876543212', recruiter: 'Rahul', status: 'Selected', date: '2023-10-25' },
    { id: 'C004', name: 'Anjali Singh', role: 'Packer', storeName: 'Ambience Mall', phone: '9876543213', recruiter: 'Sneha', status: 'On the way', date: '2023-10-27' },
    { id: 'C005', name: 'Vikram Singh', role: 'Driver', storeName: 'Okhla Warehouse', phone: '9876543214', recruiter: 'Rahul', status: 'Sourced', date: '2023-10-27' },
    { id: 'C006', name: 'Neha Gupta', role: 'Store Manager', storeName: 'Logix City Center', phone: '9876543215', recruiter: 'Sneha', status: 'Interview', date: '2023-10-24' },
    { id: 'C007', name: 'Suresh Raina', role: 'Helper', storeName: 'Sector 18 Store', phone: '9876543216', recruiter: 'Amit', status: 'Sourced', date: '2023-10-27' },
    { id: 'C008', name: 'Kavita Mishra', role: 'Sales Associate', storeName: 'Pacific Mall', phone: '9876543217', recruiter: 'Rahul', status: 'On the way', date: '2023-10-26' },
  ];

  const allSummaryData: any[] = [
    { member: 'Rahul', sourced: 15, onWay: 8, interview: 5, selected: 3, total: 31 },
    { member: 'Sneha', sourced: 12, onWay: 6, interview: 7, selected: 2, total: 27 },
    { member: 'Amit', sourced: 10, onWay: 4, interview: 2, selected: 1, total: 17 },
  ];

  // Filtering Logic for Team Lead
  const isTeamLead = userType === UserType.TEAMLEAD;
  // Mock Team Members for current Team Lead
  const myTeamMembers = ['Rahul', 'Sneha'];

  const initialKanbanData = useMemo(() => isTeamLead
      ? allKanbanData.filter(c => myTeamMembers.includes(c.recruiter))
      : allKanbanData, [isTeamLead]);

  const [candidates, setCandidates] = useState(initialKanbanData);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const summaryData = isTeamLead
    ? allSummaryData.filter(s => myTeamMembers.some(m => s.member.includes(m)))
    : allSummaryData;

  const columns = ['Sourced', 'On the way', 'Interview', 'Selected'];

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData('candidateId', id);
    setDraggedItemId(id);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnter = (status: string) => {
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: string) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData('candidateId');
    if (candidateId) {
        setCandidates(prev => 
          prev.map(c => c.id === candidateId ? { ...c, status: newStatus } : c)
        );
    }
    setDragOverColumn(null);
  };

  const handleDownloadReport = () => {
    alert("Downloading Candidates List Report...");
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const clearFilters = () => {
    setFilters({ role: '', store: '', recruiter: '', stage: '', date: '' });
  };
  
  const selectClassName = "w-full border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

  const uniqueRoles = useMemo(() => [...new Set(candidates.map(c => c.role))], [candidates]);
  const uniqueStores = useMemo(() => [...new Set(candidates.map(c => c.storeName))], [candidates]);
  const uniqueRecruiters = useMemo(() => [...new Set(candidates.map(c => c.recruiter))], [candidates]);
  const uniqueStages = useMemo(() => [...new Set(candidates.map(c => c.status))], [candidates]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => 
      (filters.role === '' || c.role === filters.role) &&
      (filters.store === '' || c.storeName === filters.store) &&
      (filters.recruiter === '' || c.recruiter === filters.recruiter) &&
      (filters.stage === '' || c.status === filters.stage) &&
      (filters.date === '' || c.date === filters.date)
    );
  }, [candidates, filters]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Selection Dashboard {isTeamLead && <span className="text-base font-normal text-indigo-600 ml-2">(My Team)</span>}</h2>
        <p className="text-gray-600 mt-1">Track candidates through the hiring pipeline.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((status) => {
           const items = candidates.filter(c => c.status === status);
           const isDragOver = dragOverColumn === status;
           return (
            <div 
              key={status} 
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragEnter(status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
              className={`bg-white rounded-xl shadow-sm border-2 flex flex-col h-full transition-all duration-300 ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-700">{status} <span className="text-gray-500 font-normal">({items.length})</span></h3>
              </div>
              <div className={`p-3 space-y-3 bg-gray-50/50 flex-1 min-h-[300px] transition-colors duration-300 ${isDragOver ? 'bg-blue-100' : ''}`}>
                {items.length > 0 ? items.map((candidate) => (
                  <div
                    key={candidate.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, candidate.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <KanbanCard candidate={candidate} isDragging={draggedItemId === candidate.id} />
                  </div>
                )) : (
                   <div className="flex items-center justify-center h-full text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-300 rounded-lg">
                     {isDragOver ? (
                        <span className="font-bold text-blue-600">Drop Here</span>
                     ) : (
                        <span>Drag candidates here</span>
                     )}
                   </div>
                )}
              </div>
            </div>
           );
        })}
      </div>

      {/* Candidates List Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-lg text-gray-800">Candidates List</h3>
          <button 
              onClick={handleDownloadReport}
              className="flex items-center text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
             </svg>
             Download Report
          </button>
        </div>

        {/* NEW FILTERS */}
        <div className="p-4 bg-gray-50/50 border-b border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
                <div>
                    <label className="text-xs font-semibold text-gray-500">Role</label>
                    <select name="role" value={filters.role} onChange={handleFilterChange} className={selectClassName}>
                        <option value="">All Roles</option>
                        {uniqueRoles.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="text-xs font-semibold text-gray-500">Store</label>
                    <select name="store" value={filters.store} onChange={handleFilterChange} className={selectClassName}>
                        <option value="">All Stores</option>
                        {uniqueStores.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="text-xs font-semibold text-gray-500">Recruiter</label>
                    <select name="recruiter" value={filters.recruiter} onChange={handleFilterChange} className={selectClassName}>
                        <option value="">All Recruiters</option>
                        {uniqueRecruiters.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="text-xs font-semibold text-gray-500">Stage</label>
                    <select name="stage" value={filters.stage} onChange={handleFilterChange} className={selectClassName}>
                        <option value="">All Stages</option>
                        {uniqueStages.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="text-xs font-semibold text-gray-500">Date</label>
                    <input type="date" name="date" value={filters.date} onChange={handleFilterChange} className={selectClassName} />
                </div>
                <div>
                    <button onClick={clearFilters} className="w-full text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                        Clear
                    </button>
                </div>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Candidate Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Store</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Recruiter</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stage</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCandidates.length > 0 ? filteredCandidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{candidate.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{candidate.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{candidate.storeName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{candidate.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{candidate.recruiter}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      candidate.status === 'Selected' ? 'bg-green-100 text-green-800' :
                      candidate.status === 'Interview' ? 'bg-blue-100 text-blue-800' :
                      candidate.status === 'On the way' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {candidate.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{candidate.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => alert('View details clicked!')} className="text-blue-600 hover:text-blue-900">View</button>
                  </td>
                </tr>
              )) : (
                 <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">No candidates found for the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-lg text-gray-800">Candidate Summary by Team Member</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Team Member</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Sourced</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">On the Way</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Interview</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Selected</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summaryData.length > 0 ? summaryData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{row.member}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">{row.sourced}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">{row.onWay}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">{row.interview}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">{row.selected}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">{row.total}</td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No team member data found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AllCandidatesView: React.FC<{ userType: UserType; jobs: Job[] }> = ({ userType, jobs }) => {
  const [allCandidates, setAllCandidates] = useState([
    { id: 'C001', name: 'Rahul Sharma', email: 'rahul.s@example.com', phone: '+91 98765 43210', role: 'Sales Executive', status: 'Interview', date: '2023-10-24', recruiter: 'Rahul', vendor: 'Vendor A', storeName: 'Select Citywalk', quitDate: null as string | null, documents: [
        { name: 'Resume / CV', status: 'Verified', fileName: 'resume.pdf' }, { name: 'Aadhar Card', status: 'Verified', fileName: 'aadhar.pdf' }, { name: 'PAN Card', status: 'Uploaded', fileName: 'pan.pdf' }, { name: 'Bank Details', status: 'Not Uploaded', fileName: null },
    ]},
    { id: 'C002', name: 'Priya Singh', email: 'priya.singh@example.com', phone: '+91 98765 43211', role: 'Team Leader', status: 'Sourced', date: '2023-10-25', recruiter: 'Sneha', vendor: 'Direct', storeName: 'Head Office', quitDate: null as string | null, documents: [
        { name: 'Resume / CV', status: 'Uploaded', fileName: 'resume.pdf' }, { name: 'Aadhar Card', status: 'Not Uploaded', fileName: null }, { name: 'PAN Card', status: 'Not Uploaded', fileName: null },
    ]},
    { id: 'C003', name: 'Amit Kumar', email: 'amit.k@example.com', phone: '+91 98765 43212', role: 'Picker', status: 'Rejected', date: '2023-10-23', recruiter: 'Rahul', vendor: 'Vendor B', storeName: 'Ambience Mall', quitDate: null as string | null, documents: [] },
    { id: 'C004', name: 'Sneha Gupta', email: 'sneha.g@example.com', phone: '+91 98765 43213', role: 'Store Manager', status: 'Hired', date: '2023-10-20', recruiter: 'Amit', vendor: 'Direct', storeName: 'Head Office', quitDate: null as string | null, documents: [
        { name: 'Resume / CV', status: 'Verified', fileName: 'resume.pdf' }, { name: 'Aadhar Card', status: 'Verified', fileName: 'aadhar.pdf' }, { name: 'PAN Card', status: 'Verified', fileName: 'pan.pdf' }, { name: 'Bank Details', status: 'Verified', fileName: 'bank.pdf' },
    ]},
    { id: 'C005', name: 'Vikram Malhotra', email: 'vikram.m@example.com', phone: '+91 98765 43214', role: 'Sales Executive', status: 'Screening', date: '2023-10-26', recruiter: 'Priya', vendor: 'Vendor A', storeName: 'DLF Mall', quitDate: null as string | null, documents: [
        { name: 'Resume / CV', status: 'Uploaded', fileName: 'resume.pdf' },
    ]},
    { id: 'C006', name: 'Anjali Verma', email: 'anjali.v@example.com', phone: '+91 98765 43215', role: 'Back Office', status: 'Sourced', date: '2023-10-26', recruiter: 'Sneha', vendor: 'Direct', storeName: 'Head Office', quitDate: null as string | null, documents: [] },
    { id: 'C007', name: 'Rohit Mehta', email: 'rohit.m@example.com', phone: '+91 98765 43216', role: 'Driver', status: 'Hired', date: '2023-10-22', recruiter: 'Rahul', vendor: 'Vendor C', storeName: 'Warehouse Okhla', quitDate: null as string | null, documents: [
        { name: 'Resume / CV', status: 'Verified', fileName: 'resume.pdf' }, { name: 'Aadhar Card', status: 'Verified', fileName: 'aadhar.pdf' }, { name: 'PAN Card', status: 'Verified', fileName: 'pan.pdf' },
    ]},
    { id: 'C008', name: 'Sunita Devi', email: 'sunita.d@example.com', phone: '+91 98765 43217', role: 'Packer', status: 'Quit', date: '2023-09-15', recruiter: 'Priya', vendor: 'Vendor B', storeName: 'GIP Mall', quitDate: '2023-11-10' as string | null, documents: [
        { name: 'Resume / CV', status: 'Verified', fileName: 'resume.pdf' },
    ]},
  ]);

  const [quittingCandidate, setQuittingCandidate] = useState<any | null>(null);
  const [viewingCandidate, setViewingCandidate] = useState<any | null>(null);
  const [transferCandidate, setTransferCandidate] = useState<any | null>(null);
  const [quitDate, setQuitDate] = useState('');
  
  const [filters, setFilters] = useState({
    search: '', role: '', vendor: '', storeName: '', status: '', recruiter: '', appliedDate: '', quitDate: ''
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({...prev, [e.target.name]: e.target.value}));
  };

  const clearFilters = () => {
    setFilters({ search: '', role: '', vendor: '', storeName: '', status: '', recruiter: '', appliedDate: '', quitDate: '' });
  };

  const uniqueRoles = useMemo(() => [...new Set(allCandidates.map(c => c.role))], [allCandidates]);
  const uniqueVendors = useMemo(() => [...new Set(allCandidates.map(c => c.vendor))], [allCandidates]);
  const uniqueStoreNames = useMemo(() => [...new Set(allCandidates.map(c => c.storeName))], [allCandidates]);
  const uniqueStatuses = useMemo(() => [...new Set(allCandidates.map(c => c.status))], [allCandidates]);
  const uniqueRecruiters = useMemo(() => [...new Set(allCandidates.map(c => c.recruiter))], [allCandidates]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Hired': return 'bg-green-100 text-green-800';
      case 'Quit': return 'bg-gray-200 text-gray-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Interview': return 'bg-blue-100 text-blue-800';
      case 'Offer Sent': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getDocStatusClasses = (status: 'Uploaded' | 'Not Uploaded' | 'Verified') => {
    switch(status) {
      case 'Verified': return 'bg-green-100 text-green-800';
      case 'Uploaded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleMarkQuitClick = (candidate: any) => {
    setQuittingCandidate(candidate);
    setQuitDate(new Date().toISOString().split('T')[0]); // Pre-fill with today's date
  };

  const handleConfirmQuit = () => {
    if (!quittingCandidate) return;
    setAllCandidates(prev => prev.map(c => 
      c.id === quittingCandidate.id ? { ...c, status: 'Quit', quitDate: quitDate } : c
    ));
    setQuittingCandidate(null);
    setQuitDate('');
  };

  const handleConfirmTransfer = (candidateId: string, newJobId: string) => {
    if (!newJobId) {
        alert('Please select a new job.');
        return;
    }
    const job = jobs.find(j => j.id === newJobId);
    if (!job) {
        alert('Selected job not found.');
        return;
    }

    setAllCandidates(prev => prev.map(c =>
        c.id === candidateId
            ? {
                ...c,
                role: job.title,
                vendor: job.jobCategory,
                storeName: job.storeName || c.storeName,
                client: job.company, // This field seems to be missing in the UI, but let's assume it exists.
                status: 'Sourced', // Reset status for the new application
                date: new Date().toISOString().split('T')[0], // Update to today's date
                quitDate: null, // Clear any previous quit date
              }
            : c
    ));
    
    const candidateName = allCandidates.find(c => c.id === candidateId)?.name;
    setTransferCandidate(null);
    alert(`Successfully transferred ${candidateName} to the "${job.title}" role.`);
  };


  const isTeamLead = userType === UserType.TEAMLEAD;
  const myTeamMembers = ['Rahul', 'Sneha'];

  const filteredCandidates = useMemo(() => {
    return (isTeamLead 
        ? allCandidates.filter(c => myTeamMembers.includes(c.recruiter))
        : allCandidates
    ).filter(c => 
        (c.name.toLowerCase().includes(filters.search.toLowerCase()) || c.email.toLowerCase().includes(filters.search.toLowerCase())) &&
        (filters.role === '' || c.role === filters.role) &&
        (filters.vendor === '' || c.vendor === filters.vendor) &&
        (filters.storeName === '' || c.storeName === filters.storeName) &&
        (filters.status === '' || c.status === filters.status) &&
        (filters.recruiter === '' || c.recruiter === filters.recruiter) &&
        (filters.appliedDate === '' || c.date === filters.appliedDate) &&
        (filters.quitDate === '' || c.quitDate === filters.quitDate)
    );
  }, [allCandidates, filters, isTeamLead]);

  const selectClassName = "block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500";


  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">All Candidates {isTeamLead && <span className="text-base font-normal text-indigo-600 ml-2">(My Team)</span>}</h2>
      
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <Input id="search" name="search" label="Search Name/Email" value={filters.search} onChange={handleFilterChange} wrapperClassName='mb-0' />
          <div>
            <label className="text-sm font-medium text-gray-700">Role</label>
            <select name="role" value={filters.role} onChange={handleFilterChange} className={selectClassName}><option value="">All</option>{uniqueRoles.map(o => <option key={o} value={o}>{o}</option>)}</select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Vendor</label>
            <select name="vendor" value={filters.vendor} onChange={handleFilterChange} className={selectClassName}><option value="">All</option>{uniqueVendors.map(o => <option key={o} value={o}>{o}</option>)}</select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Store / Location</label>
            <select name="storeName" value={filters.storeName} onChange={handleFilterChange} className={selectClassName}><option value="">All</option>{uniqueStoreNames.map(o => <option key={o} value={o}>{o}</option>)}</select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange} className={selectClassName}><option value="">All</option>{uniqueStatuses.map(o => <option key={o} value={o}>{o}</option>)}</select>
          </div>
           <div>
            <label className="text-sm font-medium text-gray-700">Recruiter</label>
            <select name="recruiter" value={filters.recruiter} onChange={handleFilterChange} className={selectClassName}><option value="">All</option>{uniqueRecruiters.map(o => <option key={o} value={o}>{o}</option>)}</select>
          </div>
          <Input id="appliedDate" name="appliedDate" label="Applied Date" type="date" value={filters.appliedDate} onChange={handleFilterChange} wrapperClassName='mb-0' />
          <Input id="quitDate" name="quitDate" label="Quit Date" type="date" value={filters.quitDate} onChange={handleFilterChange} wrapperClassName='mb-0' />
          <div className="flex items-end gap-2 col-span-full md:col-span-2 lg:col-span-1">
             <Button variant="secondary" onClick={clearFilters} className="w-full">Clear All</Button>
             <Button variant="primary" onClick={() => alert('Exporting...')} className="w-full">Export</Button>
          </div>
        </div>
      </div>


      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store / Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recruiter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quit Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCandidates.length > 0 ? filteredCandidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                        {candidate.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                        <div className="text-sm text-gray-500">{candidate.email}</div>
                         <div className="text-sm text-gray-500">{candidate.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{candidate.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{candidate.vendor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{candidate.storeName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(candidate.status)}`}>
                      {candidate.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{candidate.recruiter}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(candidate.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {candidate.quitDate ? new Date(candidate.quitDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {candidate.status === 'Hired' && (
                      <Button variant="danger" size="sm" onClick={() => handleMarkQuitClick(candidate)}>
                        Mark as Quit
                      </Button>
                    )}
                    {['Rejected', 'Quit'].includes(candidate.status) && (
                      <Button variant="secondary" size="sm" onClick={() => setTransferCandidate(candidate)}>
                        Transfer
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setViewingCandidate(candidate)}>
                      View
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={9} className="px-6 py-8 text-center text-gray-500">No candidates found for the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
           <span className="text-sm text-gray-700">Showing <span className="font-medium">{filteredCandidates.length > 0 ? 1 : 0}</span> to <span className="font-medium">{filteredCandidates.length}</span> of <span className="font-medium">{filteredCandidates.length}</span> results</span>
        </div>
      </div>
      {quittingCandidate && (
        <Modal isOpen={!!quittingCandidate} onClose={() => setQuittingCandidate(null)} title={`Mark ${quittingCandidate.name} as Quit`}>
            <div className="space-y-4">
                <Input
                    id="quitDate"
                    label="Last Working Day"
                    type="date"
                    value={quitDate}
                    onChange={(e) => setQuitDate(e.target.value)}
                    required
                />
                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="secondary" onClick={() => setQuittingCandidate(null)}>Cancel</Button>
                    <Button variant="primary" onClick={handleConfirmQuit}>Confirm Quit</Button>
                </div>
            </div>
        </Modal>
      )}
      {viewingCandidate && (
        <Modal isOpen={!!viewingCandidate} onClose={() => setViewingCandidate(null)} title="Candidate Details" maxWidth="max-w-2xl">
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500">Full Name</p>
                <p className="font-semibold text-gray-800">{viewingCandidate.name}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500">Role</p>
                <p className="font-semibold text-gray-800">{viewingCandidate.role}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500">Email</p>
                <p className="font-semibold text-gray-800">{viewingCandidate.email}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500">Phone</p>
                <p className="font-semibold text-gray-800">{viewingCandidate.phone}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500">Vendor</p>
                <p className="font-semibold text-gray-800">{viewingCandidate.vendor}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500">Store / Location</p>
                <p className="font-semibold text-gray-800">{viewingCandidate.storeName}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500">Recruiter</p>
                <p className="font-semibold text-gray-800">{viewingCandidate.recruiter}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500">Application Status</p>
                <p className="font-semibold text-gray-800">{viewingCandidate.status}</p>
              </div>
               <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500">Applied Date</p>
                <p className="font-semibold text-gray-800">{new Date(viewingCandidate.date).toLocaleDateString()}</p>
              </div>
              {viewingCandidate.quitDate && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500">Quit Date</p>
                  <p className="font-semibold text-gray-800">{new Date(viewingCandidate.quitDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            {/* Documents Section */}
            {viewingCandidate.documents?.length > 0 && (
              <div className="pt-4">
                  <h4 className="text-base font-semibold text-gray-800 mb-2">Documents</h4>
                  <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                              <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Name</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                              </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                              {viewingCandidate.documents.map((doc: any, index: number) => (
                                  <tr key={index}>
                                      <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-800">{doc.name}</td>
                                      <td className="px-4 py-2 whitespace-nowrap">
                                          <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getDocStatusClasses(doc.status)}`}>
                                              {doc.status}
                                          </span>
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-right">
                                          <Button variant="ghost" size="sm" onClick={() => alert(`Viewing ${doc.fileName}`)} disabled={doc.status === 'Not Uploaded'}>
                                              View
                                          </Button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
            )}
            
            <div className="flex justify-end pt-4 border-t mt-4">
                <Button variant="secondary" onClick={() => setViewingCandidate(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
       {transferCandidate && (
        <Modal isOpen={!!transferCandidate} onClose={() => setTransferCandidate(null)} title={`Transfer ${transferCandidate.name}`}>
            <div className="space-y-4">
                <p>Select a new job to transfer this candidate to. Their status will be reset to 'Sourced'.</p>
                <select 
                    defaultValue=""
                    onChange={(e) => {
                        const selectedJobId = e.target.value;
                        if (transferCandidate) {
                            handleConfirmTransfer(transferCandidate.id, selectedJobId);
                        }
                    }}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                    <option value="" disabled>Select a new job...</option>
                    {jobs.map(job => (
                        <option key={job.id} value={job.id}>{job.title} at {job.company}</option>
                    ))}
                </select>
                <div className="flex justify-end pt-4 border-t">
                    <Button variant="secondary" onClick={() => setTransferCandidate(null)}>Cancel</Button>
                </div>
            </div>
        </Modal>
      )}
    </div>
  );
};

const AttendanceView: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>('2025-12');
  const [attendanceData, setAttendanceData] = useState<any[]>([]);

  const handlePresentDaysChange = (id: number, val: string) => {
    let days = parseInt(val);
    if (isNaN(days)) days = 0;
    if (days > 31) days = 31;
    if (days < 0) days = 0;
    
    setAttendanceData(prev => prev.map(item => item.id === id ? { ...item, presentDays: days } : item));
  };

  const calculatePayable = (commission: number, present: number, total: number) => {
     if (!commission || total === 0) return 0;
     // Assuming commission is paid pro-rata based on attendance days
     return Math.round((commission / total) * present);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
        <div>
           <h2 className="text-3xl font-bold text-gray-800">Commission Attendance</h2>
           <p className="text-gray-600 mt-1">Manage attendance and track commission payouts.</p>
        </div>
        <div className="w-full sm:w-auto">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Select Month</label>
            <input 
                type="month" 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white shadow-sm" 
            />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">CANDIDATE NAME</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">VENDOR</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">ROLE</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">BASE COMMISSION</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">ATTENDANCE</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">PAYABLE AMOUNT</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">ACTION</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
               {attendanceData.length > 0 ? (
                 attendanceData.map((item) => {
                   const payable = calculatePayable(item.commission, item.presentDays, item.totalDays);
                   return (
                   <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.vendor}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                          {item.commission > 0 ? `₹${item.commission.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center items-center gap-2">
                               <input 
                                  type="number" 
                                  min="0" 
                                  max="31"
                                  value={item.presentDays}
                                  onChange={(e) => handlePresentDaysChange(item.id, e.target.value)}
                                  className="w-16 px-2 py-1.5 text-center border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                              />
                              <span className="text-gray-400 text-sm">/ {item.totalDays}</span>
                          </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`font-bold ${payable > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                              {payable > 0 ? `₹${payable.toLocaleString()}` : '-'}
                          </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button onClick={() => alert(`Attendance saved for ${item.name}`)} className="text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">
                              Save
                          </button>
                      </td>
                   </tr>
                 )})
               ) : (
                <tr>
                    <td colSpan={7} className="px-6 py-24 text-center text-gray-500">
                      No attendance records found for this month.
                    </td>
                </tr>
               )}
            </tbody>
          </table>
        </div>
         {attendanceData.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{attendanceData.length}</span> of <span className="font-medium">{attendanceData.length}</span> results
                </div>
            </div>
         )}
      </div>
    </div>
  );
};

const ComplaintsView: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  const [newStatus, setNewStatus] = useState<Ticket['status']>('Open');
  const [hrRemarks, setHrRemarks] = useState('');

  const stats = useMemo(() => {
    const active = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
    const closed = tickets.filter(t => t.status === 'Resolved').length;
    return { total: tickets.length, active, closed };
  }, [tickets]);
  
  const getStatusClasses = (status: Ticket['status']) => {
    switch (status) {
        case 'Resolved': return 'bg-green-100 text-green-800';
        case 'Open': return 'bg-blue-100 text-blue-800';
        case 'In Progress': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openTicketModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.status);
    setHrRemarks(ticket.hrRemarks || '');
    setIsModalOpen(true);
  };
  
  const closeTicketModal = () => {
    setSelectedTicket(null);
    setIsModalOpen(false);
  };
  
  const handleUpdateTicket = () => {
    if (!selectedTicket) return;
    setTickets(prev => prev.map(t => 
        t.id === selectedTicket.id 
        ? { ...t, status: newStatus, hrRemarks, resolvedDate: newStatus === 'Resolved' ? new Date().toISOString() : t.resolvedDate } 
        : t
    ));
    closeTicketModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Help Desk</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-500 mb-1">Total Tickets</h4>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
         </div>
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-500 mb-1">Active</h4>
            <p className="text-3xl font-bold text-red-600">{stats.active}</p>
         </div>
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-500 mb-1">Resolved</h4>
            <p className="text-3xl font-bold text-green-600">{stats.closed}</p>
         </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Ticket / User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {tickets.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                             No tickets found.
                        </td>
                    </tr>
                ) : (
                    tickets.map(ticket => (
                        <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-blue-600">{ticket.id}</div>
                                <div className="text-xs text-gray-500">{ticket.submittedBy}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{ticket.subject}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{ticket.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(ticket.submittedDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                 <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(ticket.status)}`}>
                                    {ticket.status}
                                 </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                               <Button variant="ghost" size="sm" onClick={() => openTicketModal(ticket)}>View / Update</Button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
          </table>
        </div>
      </div>
      
      {isModalOpen && selectedTicket && (
          <Modal isOpen={isModalOpen} onClose={closeTicketModal} title={`Ticket: ${selectedTicket.id}`} maxWidth="max-w-2xl">
              <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                      <p><strong>From:</strong> {selectedTicket.submittedBy} ({selectedTicket.userType})</p>
                      <p><strong>Date:</strong> {new Date(selectedTicket.submittedDate).toLocaleString()}</p>
                      <p><strong>Subject:</strong> {selectedTicket.subject}</p>
                      <p className="mt-2"><strong>Description:</strong></p>
                      <p className="italic">{selectedTicket.description}</p>
                  </div>
                  <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                      <select id="status" value={newStatus} onChange={e => setNewStatus(e.target.value as Ticket['status'])} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                          <option>Open</option>
                          <option>In Progress</option>
                          <option>Resolved</option>
                      </select>
                  </div>
                   <div>
                      <label htmlFor="hrRemarks" className="block text-sm font-medium text-gray-700 mb-1">Internal Remarks / Response</label>
                      <textarea id="hrRemarks" rows={4} value={hrRemarks} onChange={e => setHrRemarks(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Add a response or internal note..."></textarea>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button variant="secondary" onClick={closeTicketModal}>Cancel</Button>
                      <Button variant="primary" onClick={handleUpdateTicket}>Save Changes</Button>
                  </div>
              </div>
          </Modal>
      )}
    </div>
  );
};


const WarningLettersView: React.FC = () => {
    const [letters, setLetters] = useState<WarningLetter[]>([]);
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const [selectedLetter, setSelectedLetter] = useState<WarningLetter | null>(null);
    const letterContentRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const stats = useMemo(() => ({
        total: letters.length,
        active: letters.filter(l => l.status === 'Active').length,
        resolved: letters.filter(l => l.status === 'Resolved').length,
    }), [letters]);

    const handleIssueLetter = (data: Omit<WarningLetter, 'ticketNo' | 'issueDate' | 'status' | 'issuedBy'>) => {
        const newLetter: WarningLetter = {
            ...data,
            ticketNo: `#WL-${String(letters.length + 1).padStart(4, '0')}`,
            issueDate: new Date().toISOString().split('T')[0],
            issuedBy: 'Admin', // In a real app, this would be the current user's name
            status: 'Active',
        };
        setLetters(prev => [newLetter, ...prev]);
        setIsIssueModalOpen(false);
    };

    const handleResolveLetter = (ticketNo: string) => {
        setLetters(prev => prev.map(l => l.ticketNo === ticketNo ? { ...l, status: 'Resolved' } : l));
    };
    
    const handleDownloadPdf = () => {
        if (!letterContentRef.current || !selectedLetter) return;

        setIsDownloading(true);

        const element = letterContentRef.current;
        const opt = {
            margin:       [0.8, 0.8, 0.8, 0.8],
            filename:     `Warning_Letter_${selectedLetter.employeeName.replace(/\s+/g, '_')}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().from(element).set(opt).save().then(() => setIsDownloading(false));
    };

    const IssueLetterForm: React.FC<{ onSave: (data: any) => void, onCancel: () => void }> = ({ onSave, onCancel }) => {
        const [formData, setFormData] = useState({ employeeName: '', reason: 'Absenteeism', description: '' });
        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
        };
        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSave(formData);
        };
        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input id="employeeName" name="employeeName" label="Employee Name" value={formData.employeeName} onChange={handleChange} required />
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason for Warning</label>
                  <select id="reason" name="reason" value={formData.reason} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required>
                    <option>Absenteeism</option>
                    <option>Performance Issue</option>
                    <option>Misconduct</option>
                    <option>Policy Violation</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Detailed Description of Incident</label>
                  <textarea id="description" name="description" rows={5} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={formData.description} onChange={handleChange} required></textarea>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" variant="primary">Issue Letter</Button>
                </div>
            </form>
        );
    };

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Warning Letters</h2>
        <button onClick={() => setIsIssueModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110 2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Issue New Letter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-500 mb-1">Total Letters Issued</h4>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
         </div>
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-500 mb-1">Active Warnings</h4>
            <p className="text-3xl font-bold text-red-600">{stats.active}</p>
         </div>
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-500 mb-1">Resolved</h4>
            <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
         </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Ticket No</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Employee Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Issue Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
               {letters.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-24 text-center text-gray-500">No warning letters issued.</td>
                  </tr>
               ) : (
                  letters.map((item) => (
                      <tr key={item.ticketNo}>
                          <td className="px-6 py-4 text-sm font-medium text-indigo-600">{item.ticketNo}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-800">{item.employeeName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.reason}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{new Date(item.issueDate).toLocaleDateString()}</td>
                          <td className="px-6 py-4"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${item.status === 'Active' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{item.status}</span></td>
                          <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedLetter(item)}>View</Button>
                            {item.status === 'Active' && <Button variant="ghost" size="sm" onClick={() => handleResolveLetter(item.ticketNo)}>Mark as Resolved</Button>}
                          </td>
                      </tr>
                  ))
               )}
            </tbody>
          </table>
        </div>
      </div>
      
      <Modal isOpen={isIssueModalOpen} onClose={() => setIsIssueModalOpen(false)} title="Issue New Warning Letter" maxWidth="max-w-2xl">
          <IssueLetterForm onSave={handleIssueLetter} onCancel={() => setIsIssueModalOpen(false)} />
      </Modal>

      {selectedLetter && (
        <Modal isOpen={!!selectedLetter} onClose={() => setSelectedLetter(null)} title="Warning Letter" maxWidth="max-w-4xl">
            <div>
                <div ref={letterContentRef} className="p-8 font-serif text-sm leading-relaxed">
                    <h2 className="text-center text-2xl font-bold mb-2">WARNING LETTER</h2>
                    <p className="text-right mb-6"><strong>Date:</strong> {new Date(selectedLetter.issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p><strong>To,</strong><br/>{selectedLetter.employeeName}</p>
                    <p className="mt-4"><strong>Subject: Warning for {selectedLetter.reason}</strong></p>
                    <p className="mt-4">Dear {selectedLetter.employeeName},</p>
                    <p>This letter is to formally warn you regarding an incident of professional misconduct. It has been observed that:</p>
                    <p className="my-4 p-4 bg-gray-50 border-l-4 border-gray-300 italic">"{selectedLetter.description}"</p>
                    <p>This behavior is a direct violation of our company's code of conduct and is unacceptable. We expect all our employees to adhere to the highest standards of professionalism and discipline.</p>
                    <p>Please consider this a formal warning. Any recurrence of such behavior will result in stricter disciplinary action, which may include suspension or termination of your employment.</p>
                    <p>We trust that you will take this matter seriously and rectify your conduct immediately. A copy of this letter will be placed in your employee file.</p>
                    <p className="mt-8">Sincerely,</p>
                    <p className="mt-12 font-semibold">
                        {selectedLetter.issuedBy}<br/>
                        Management<br/>
                        R.K.M ENTERPRISE
                    </p>
                </div>
                 <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t">
                    <Button variant="secondary" onClick={() => setSelectedLetter(null)}>Close</Button>
                    <Button variant="primary" onClick={handleDownloadPdf} loading={isDownloading}>Download PDF</Button>
                </div>
            </div>
        </Modal>
      )}
    </div>
  );
};

const DailyReportTemplate = ({ onBack, userType, currentUser }: { onBack: () => void, userType: UserType, currentUser?: AppUser | null }) => {
    // ... existing DailyReportTemplate code ...
  const currentDate = new Date().toLocaleDateString('en-GB'); // Formats as DD/MM/YYYY
  const isTeamLead = userType === UserType.TEAMLEAD || userType === UserType.TEAM;

  // Mock Team Members for the logged-in Team Lead
  // In a real app, this mapping comes from the backend
  const myTeamMembers = ['Rahul', 'Sneha']; 

  const allDailySubmissions: any[] = [];
  const allNewSelections: any[] = [];

  // Filter logic based on user type
  const dailySubmissions = isTeamLead 
    ? allDailySubmissions.filter(item => myTeamMembers.includes(item.recruiter))
    : allDailySubmissions;

  const newSelections = isTeamLead
    ? allNewSelections.filter(item => myTeamMembers.includes(item.recruiter))
    : allNewSelections;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-[500px]">
        <div className="flex justify-between items-center mb-6">
            <div>
                 <h3 className="text-2xl font-bold text-gray-800">Daily Report View</h3>
                 {isTeamLead && <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">My Team's Report</span>}
            </div>
            <button onClick={onBack} className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
                Back to Reports
            </button>
        </div>

        {/* Daily New Submissions Table */}
        <div className="mb-8 border border-black">
            <div className="flex border-b border-black">
                <div className="w-48 p-2 font-bold text-lg border-r border-black bg-white flex items-center justify-center">
                    {currentDate}
                </div>
                <div className="flex-1 p-2 font-bold text-lg text-center bg-white flex items-center justify-center">
                    Daily New Submissions
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-yellow-400 text-black font-bold border-b border-black">
                        <tr>
                            <th className="p-2 border-r border-black text-center w-16">S. No.</th>
                            <th className="p-2 border-r border-black">Recruiter Name</th>
                            <th className="p-2 border-r border-black">Client Name</th>
                            <th className="p-2 border-r border-black">Position</th>
                            <th className="p-2 border-r border-black">Candidate Name</th>
                            <th className="p-2 border-r border-black">Mobile No</th>
                            <th className="p-2 border-r border-black">Location</th>
                            <th className="p-2 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dailySubmissions.length > 0 ? dailySubmissions.map((item, index) => (
                            <tr key={item.id} className="border-b border-gray-300 last:border-b-0 hover:bg-gray-50">
                                <td className="p-2 border-r border-gray-300 text-center">{index + 1}</td>
                                <td className="p-2 border-r border-gray-300">{item.recruiter}</td>
                                <td className="p-2 border-r border-gray-300">{item.client}</td>
                                <td className="p-2 border-r border-gray-300">{item.position}</td>
                                <td className="p-2 border-r border-gray-300">{item.candidate}</td>
                                <td className="p-2 border-r border-gray-300">{item.mobile}</td>
                                <td className="p-2 border-r border-gray-300">{item.location}</td>
                                <td className="p-2 text-center font-medium">{item.status}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={8} className="p-4 text-center text-gray-500">No submissions found for your team today</td></tr>
                        )}
                        {/* Empty rows to match visual style if needed, or just standard rows */}
                        {[...Array(Math.max(0, 3 - dailySubmissions.length))].map((_, i) => (
                             <tr key={`empty-${i}`} className="border-b border-gray-200 h-10">
                                <td className="border-r border-gray-300"></td><td className="border-r border-gray-300"></td><td className="border-r border-gray-300"></td><td className="border-r border-gray-300"></td><td className="border-r border-gray-300"></td><td className="border-r border-gray-300"></td><td className="border-r border-gray-300"></td><td></td>
                             </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* New Selection Today Table */}
        <div className="border border-black">
             <div className="p-2 font-bold text-lg text-center bg-white border-b border-black">
                New Selection Today
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-yellow-400 text-black font-bold border-b border-black">
                        <tr>
                            <th className="p-2 border-r border-black text-center w-16">S. No.</th>
                            <th className="p-2 border-r border-black">Recruiter Name</th>
                            <th className="p-2 border-r border-black">Client Name</th>
                            <th className="p-2 border-r border-black">Position</th>
                            <th className="p-2 border-r border-black">Candidate Name</th>
                            <th className="p-2 border-r border-black">Mobile No</th>
                            <th className="p-2 border-r border-black">Location</th>
                            <th className="p-2 text-center">Status</th>
                        </tr>
                    </thead>
                     <tbody>
                        {newSelections.length > 0 ? newSelections.map((item, index) => (
                            <tr key={item.id} className="border-b border-gray-300 last:border-b-0 hover:bg-gray-50">
                                <td className="p-2 border-r border-gray-300 text-center">{index + 1}</td>
                                <td className="p-2 border-r border-gray-300">{item.recruiter}</td>
                                <td className="p-2 border-r border-gray-300">{item.client}</td>
                                <td className="p-2 border-r border-gray-300">{item.position}</td>
                                <td className="p-2 border-r border-gray-300">{item.candidate}</td>
                                <td className="p-2 border-r border-gray-300">{item.mobile}</td>
                                <td className="p-2 border-r border-gray-300">{item.location}</td>
                                <td className="p-2 text-center font-medium text-green-600">{item.status}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={8} className="p-4 text-center text-gray-500">No selections found for your team today</td></tr>
                        )}
                         {[...Array(Math.max(0, 2 - newSelections.length))].map((_, i) => (
                             <tr key={`empty-sel-${i}`} className="border-b border-gray-200 h-10">
                                <td className="border-r border-gray-300"></td><td className="border-r border-gray-300"></td><td className="border-r border-gray-300"></td><td className="border-r border-gray-300"></td><td className="border-r border-gray-300"></td><td className="border-r border-gray-300"></td><td className="border-r border-gray-300"></td><td></td>
                             </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

const BreakdownTable: React.FC<{ title: string; data: { name: string; total: number; pending: number; approved: number }[] }> = ({ title, data }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <h3 className="px-6 py-4 text-lg font-semibold text-gray-800 border-b">{title}</h3>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{title.split(' ')[0]}</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Openings</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pending</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Approved</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map(item => (
                        <tr key={item.name}>
                            <td className="px-6 py-4 font-semibold text-gray-900">{item.name}</td>
                            <td className="px-6 py-4 text-right text-sm font-medium text-gray-800">{item.total}</td>
                            <td className="px-6 py-4 text-right text-sm text-yellow-700">{item.pending}</td>
                            <td className="px-6 py-4 text-right text-sm text-green-700">{item.approved}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const PartnerRequirementsDetailView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    // Expanded mock data for demonstration. In a real app, this would be fetched.
    const requirements = [
        { id: 'R001', client: 'Flipkart', role: 'Picker', total: 50, pending: 20, approved: 30, location: 'Delhi', store: 'Okhla Warehouse', team: 'Team A' },
        { id: 'R002', client: 'Blinkit', role: 'Delivery Associate', total: 100, pending: 80, approved: 20, location: 'Gurgaon', store: 'Sector 55 Hub', team: 'Team B' },
        { id: 'R003', client: 'Zomato', role: 'Delivery Associate', total: 75, pending: 15, approved: 60, location: 'Gurgaon', store: 'Cyber Hub Kitchen', team: 'Team B' },
        { id: 'R004', client: 'Myntra', role: 'Packer', total: 40, pending: 40, approved: 0, location: 'Delhi', store: 'Manesar Logistics', team: 'Team A' },
        { id: 'R005', client: 'Blinkit', role: 'Picker', total: 60, pending: 10, approved: 50, location: 'Noida', store: 'Sector 18 Hub', team: 'Team C' },
        { id: 'R006', client: 'Flipkart', role: 'Packer', total: 30, pending: 5, approved: 25, location: 'Delhi', store: 'Okhla Warehouse', team: 'Team A' },
    ];

    const totalStats = requirements.reduce((acc, curr) => {
        acc.total += curr.total;
        acc.pending += curr.pending;
        acc.approved += curr.approved;
        return acc;
    }, { total: 0, pending: 0, approved: 0 });
    
    // Create breakdowns
    type RequirementKey = keyof typeof requirements[0];
    const createBreakdown = (data: typeof requirements, key: RequirementKey) => {
        const breakdown = data.reduce((acc, item) => {
            const group = item[key] as string;
            if (!acc[group]) {
                acc[group] = { total: 0, pending: 0, approved: 0 };
            }
            acc[group].total += item.total;
            acc[group].pending += item.pending;
            acc[group].approved += item.approved;
            return acc;
        }, {} as Record<string, { total: number, pending: number, approved: number }>);
        return Object.entries(breakdown).map(([name, stats]) => ({ name, ...stats }));
    };

    const storeWise = createBreakdown(requirements, 'store');
    const locationWise = createBreakdown(requirements, 'location');
    const teamWise = createBreakdown(requirements, 'team');
    const roleWise = createBreakdown(requirements, 'role');


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Partner Requirements Breakdown</h2>
                <Button variant="secondary" onClick={onBack}>Back to Dashboard</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-500">Total Requirements</h4>
                    <p className="text-3xl font-bold text-blue-600">{totalStats.total}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-500">Pending Approval</h4>
                    <p className="text-3xl font-bold text-yellow-600">{totalStats.pending}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-500">Approved</h4>
                    <p className="text-3xl font-bold text-green-600">{totalStats.approved}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                 <h3 className="px-6 py-4 text-lg font-semibold text-gray-800 border-b">Breakdown by Client & Role</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Openings</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pending</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Approved</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {requirements.map(req => (
                                <tr key={req.id}>
                                    <td className="px-6 py-4 font-semibold text-gray-900">{req.client}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{req.role}</td>
                                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-800">{req.total}</td>
                                    <td className="px-6 py-4 text-right text-sm text-yellow-700">{req.pending}</td>
                                    <td className="px-6 py-4 text-right text-sm text-green-700">{req.approved}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BreakdownTable title="Store Wise" data={storeWise} />
                <BreakdownTable title="Location Wise" data={locationWise} />
                <BreakdownTable title="Team Wise" data={teamWise} />
                <BreakdownTable title="Role Wise" data={roleWise} />
            </div>
        </div>
    );
};

const ReportsView: React.FC<{ userType: UserType, currentUser?: AppUser | null }> = ({ userType, currentUser }) => {
    // ... existing ReportsView code ...
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDailyReportView, setShowDailyReportView] = useState(false);

  const reportTypes = [
    { id: 'daily_report', title: 'Daily Report', description: 'View and export daily submissions and selections.', icon: 'clipboard-list' },
    { id: 'lineup', title: 'Daily Lineup Report', description: 'Daily candidate submission and call status logs.', icon: 'clipboard' },
    { id: 'selection', title: 'Selection Pipeline', description: 'Candidates stage-wise status from Sourced to Selected.', icon: 'users' },
    { id: 'attendance', title: 'Attendance & Commission', description: 'Monthly attendance records and commission calculations.', icon: 'calendar' },
    { id: 'complaints', title: 'Complaints Log', description: 'Register of candidate grievances and resolutions.', icon: 'exclamation' },
    { id: 'warning', title: 'Warning Letters', description: 'History of disciplinary actions and warning letters.', icon: 'mail' },
    { id: 'performance', title: 'Recruiter Performance', description: 'Efficiency metrics for individual team members.', icon: 'chart' },
  ];

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      alert(`Report "${reportTypes.find(r => r.id === selectedReport)?.title}" generated successfully!`);
    }, 1500);
  };

  const handleReportSelect = (id: string) => {
    setSelectedReport(id);
    // Optionally reset view mode if another report is selected, 
    // but here we let the user click "View Report" in the side panel for the daily report
  };

  if (showDailyReportView) {
      return <DailyReportTemplate onBack={() => setShowDailyReportView(false)} userType={userType} currentUser={currentUser} />;
  }

  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-3xl font-bold text-gray-800">Reports Center</h2>
        <p className="text-gray-600 mt-1">Generate and download system-wide reports.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Report Selection */}
        <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportTypes.map((report) => (
                    <div 
                        key={report.id}
                        onClick={() => handleReportSelect(report.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            selectedReport === report.id 
                            ? 'border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-500' 
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                        }`}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${selectedReport === report.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                {/* Icons based on type */}
                                {report.icon === 'clipboard-list' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                                {report.icon === 'clipboard' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                                {report.icon === 'users' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                                {report.icon === 'calendar' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                                {report.icon === 'exclamation' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                                {report.icon === 'mail' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-9 13V3" /></svg>}
                                {report.icon === 'chart' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                            </div>
                            <div>
                                <h4 className={`font-semibold ${selectedReport === report.id ? 'text-blue-900' : 'text-gray-800'}`}>{report.title}</h4>
                                <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Recent Reports Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">Recently Generated</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Generated By</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                             <tr>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">Attendance_Oct2023.csv</td>
                                <td className="px-6 py-4 text-sm text-gray-500">Oct 26, 2023</td>
                                <td className="px-6 py-4 text-sm text-gray-500">Admin</td>
                                <td className="px-6 py-4 text-right text-sm text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => alert('Downloading Attendance_Oct2023.csv')}>Download</td>
                             </tr>
                             <tr>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">Daily_Lineup_W4_Oct.xlsx</td>
                                <td className="px-6 py-4 text-sm text-gray-500">Oct 25, 2023</td>
                                <td className="px-6 py-4 text-sm text-gray-500">Rahul</td>
                                <td className="px-6 py-4 text-right text-sm text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => alert('Downloading Daily_Lineup_W4_Oct.xlsx')}>Download</td>
                             </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* Right Col: Configuration */}
        <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Report Configuration</h3>
                {!selectedReport ? (
                    <div className="text-center py-8 text-gray-500">
                        <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <p>Select a report type from the list to configure details.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mb-4">
                            <span className="text-xs font-bold text-blue-500 uppercase tracking-wide">Selected Report</span>
                            <p className="font-semibold text-blue-900">{reportTypes.find(r => r.id === selectedReport)?.title}</p>
                        </div>
                        
                        {selectedReport === 'daily_report' ? (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    View the daily new submissions and selections in a standardized printable format.
                                </p>
                                <button
                                    onClick={() => setShowDailyReportView(true)}
                                    className="w-full py-2.5 px-4 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700 shadow-md transition-all flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    View On Screen
                                </button>
                            </div>
                        ) : (
                            <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="date" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    <input type="date" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Vendor (Optional)</label>
                                <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                    <option>All Vendors</option>
                                    <option>Vendor A</option>
                                    <option>Vendor B</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                                <div className="flex gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="format" className="text-blue-600 focus:ring-blue-500" defaultChecked />
                                        <span className="text-sm text-gray-700">Excel (.xlsx)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="format" className="text-blue-600 focus:ring-blue-500" />
                                        <span className="text-sm text-gray-700">PDF</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <button 
                                    onClick={handleDownload}
                                    disabled={isDownloading}
                                    className={`w-full py-2.5 px-4 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all ${isDownloading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}`}
                                >
                                    {isDownloading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            Download Report
                                        </>
                                    )}
                                </button>
                            </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

const AddVendorForm: React.FC<{
    onSave: (data: any) => void;
    onClose: () => void;
    isSubmitting: boolean;
    initialData: any | null;
    panelConfig: PanelConfig | null;
}> = ({ onSave, onClose, isSubmitting, initialData, panelConfig }) => {
    const [formData, setFormData] = useState({
        brandName: '',
        partnerName: '',
        fullAddress: '',
        email: '',
        phone: '',
        locations: [] as string[],
        roles: [] as string[],
        commissionType: 'percentage',
        commissionValue: '',
        terms: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                brandName: initialData.brandName || '',
                partnerName: initialData.partnerName || '',
                fullAddress: initialData.fullAddress || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                locations: initialData.locations || [],
                roles: initialData.roles || [],
                commissionType: initialData.commissionType || 'percentage',
                commissionValue: initialData.commissionValue || '',
                terms: initialData.terms || '',
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, options } = e.target;
        const value: string[] = [];
        for (let i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) {
                value.push(options[i].value);
            }
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const selectStyles = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <Input id="brandName" name="brandName" label="Brand Name" placeholder="e.g., Blinkit" value={formData.brandName} onChange={handleChange} required wrapperClassName="mb-0"/>
                <Input id="partnerName" name="partnerName" label="Partner Name" placeholder="e.g., John Doe" value={formData.partnerName} onChange={handleChange} required wrapperClassName="mb-0"/>
                <div className="md:col-span-2">
                    <Input id="fullAddress" name="fullAddress" label="Full Address" placeholder="Enter full address" value={formData.fullAddress} onChange={handleChange} required wrapperClassName="mb-0"/>
                </div>
                <Input id="email" name="email" label="Email Address" type="email" placeholder="contact@vendor.com" value={formData.email} onChange={handleChange} disabled={!!initialData} required wrapperClassName="mb-0"/>
                <Input id="phone" name="phone" label="Phone Number" type="tel" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} required wrapperClassName="mb-0"/>

                <div>
                    <label htmlFor="locations" className="block text-sm font-medium text-gray-700 mb-1">Operational Locations</label>
                    <select id="locations" name="locations" multiple value={formData.locations} onChange={handleMultiSelectChange} className={`${selectStyles} h-28`}>
                        {(panelConfig?.locations || []).map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Hold Ctrl (or Cmd on Mac) to select multiple.</p>
                </div>
                <div>
                    <label htmlFor="roles" className="block text-sm font-medium text-gray-700 mb-1">Job Roles</label>
                    <select id="roles" name="roles" multiple value={formData.roles} onChange={handleMultiSelectChange} className={`${selectStyles} h-28`}>
                        {(panelConfig?.jobRoles || []).map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Hold Ctrl (or Cmd on Mac) to select multiple.</p>
                </div>
                
                <div className="md:col-span-2">
                    <fieldset className="border rounded-md p-4">
                        <legend className="text-sm font-medium text-gray-700 px-1">Commission Structure</legend>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-6">
                                <label className="text-sm font-medium text-gray-700">Structure Type</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="commissionType" value="percentage" checked={formData.commissionType === 'percentage'} onChange={handleChange} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"/> Percentage Based</label>
                                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="commissionType" value="slab" checked={formData.commissionType === 'slab'} onChange={handleChange} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"/> Slab Based</label>
                                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="commissionType" value="attendance" checked={formData.commissionType === 'attendance'} onChange={handleChange} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"/> Attendance Based</label>
                                </div>
                            </div>
                            {formData.commissionType === 'percentage' && (
                                <Input id="commissionValue" name="commissionValue" label="Percentage (%)" type="number" placeholder="e.g., 10" value={formData.commissionValue} onChange={handleChange} wrapperClassName="mb-0"/>
                            )}
                        </div>
                    </fieldset>
                </div>

                <div className="md:col-span-2">
                    <label htmlFor="terms" className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                    <textarea id="terms" name="terms" rows={3} value={formData.terms} onChange={handleChange} className={selectStyles} placeholder="Enter any terms and conditions for this vendor..."></textarea>
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" variant="primary" loading={isSubmitting}>{initialData ? 'Update Vendor' : 'Add Vendor'}</Button>
            </div>
        </form>
    );
};

const VendorDirectoryView: React.FC<{
    vendors: any[];
    setVendors: React.Dispatch<React.SetStateAction<any[]>>;
    isLoading: boolean;
    panelConfig: PanelConfig | null;
}> = ({ vendors, setVendors, isLoading, panelConfig }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleOpenModal = (vendor: any | null) => {
    setEditingVendor(vendor);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVendor(null);
  };

  const handleSaveVendor = async (vendorData: any) => {
    setIsSubmitting(true);
    try {
      if (editingVendor) { // Update
        // await updateVendor(editingVendor.id, vendorData);
        // setVendors(prev => prev.map(v => v.id === editingVendor.id ? { ...v, ...vendorData } : v));
        alert('Vendor update functionality is not yet implemented.');
      } else { // Create
        const newVendor = await createVendor(vendorData);
        const finalNewVendor = {
            ...newVendor,
            domain: `${newVendor.brandName.toLowerCase().replace(/\s+/g, '')}.com`
        };
        setVendors(prev => [finalNewVendor, ...prev]);
        alert('Vendor added successfully!');
      }
      handleCloseModal();
    } catch (error) {
      console.error(error);
      alert(`Failed to save vendor: ${error instanceof Error ? error.message : 'An unknown error occurred.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteVendor = (vendorId: string) => {
    if (window.confirm("Are you sure you want to delete this vendor? This action cannot be undone.")) {
        // TODO: Add Firebase deletion logic here
        setVendors(prev => prev.filter(v => v.id !== vendorId));
    }
  };

  if (isLoading) {
    return <div className="text-center p-12">Loading vendors...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Vendor Directory</h2>
        <button onClick={() => handleOpenModal(null)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110 2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Vendor
        </button>
      </div>

      {vendors.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">No vendors found</h3>
              <p className="mt-1 text-gray-500">Get started by adding a new vendor to the directory.</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-4 mb-4">
                     <div className="w-12 h-12 shrink-0 rounded-lg bg-white border border-gray-100 flex items-center justify-center p-1 shadow-sm">
                        <img 
                            src={`https://logo.clearbit.com/${vendor.domain}`} 
                            alt={vendor.brandName} 
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                                const parent = (e.currentTarget as HTMLImageElement).parentElement;
                                if (parent) {
                                  parent.classList.add('bg-gray-100');
                                  parent.innerHTML = `<span class="text-sm font-bold text-gray-500">${vendor.brandName.substring(0, 2).toUpperCase()}</span>`;
                                }
                            }}
                        />
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">{vendor.brandName}</h3>
                        {vendor.partnerName && <p className="text-sm text-gray-600">{vendor.partnerName}</p>}
                     </div>
                  </div>

                  <div className="space-y-3">
                     <div className="flex items-center gap-3 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-9 13V3" /></svg>
                        <span className="truncate">{vendor.email}</span>
                     </div>
                     <div className="flex items-center gap-3 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        <span>{vendor.phone}</span>
                     </div>
                     <div className="flex items-start gap-3 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span className="leading-snug"><span className="font-medium text-gray-500">Locations:</span> {Array.isArray(vendor.locations) ? vendor.locations.join(', ') : ''}</span>
                     </div>
                     <div className="flex items-start gap-3 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.55 23.55 0 0112 15c-3.791 0-7.141-.676-9-1.745M19 19v1a2 2 0 01-2 2H7a2 2 0 01-2-2v-1m14-10a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V9a2 2 0 012-2h2zM9 9a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2h2z" /></svg>
                        <span className="leading-snug"><span className="font-medium text-gray-500">Roles:</span> {Array.isArray(vendor.roles) ? vendor.roles.join(', ') : ''}</span>
                     </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-4 text-sm font-semibold">
                    <button onClick={() => handleOpenModal(vendor)} className="text-blue-600 hover:text-blue-800 transition-colors">Edit</button>
                    <button onClick={() => handleDeleteVendor(vendor.id)} className="text-red-600 hover:text-red-800 transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
      )}
      
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingVendor ? 'Edit Vendor' : 'Add New Vendor'} maxWidth="max-w-4xl">
            <AddVendorForm 
                onSave={handleSaveVendor}
                onClose={handleCloseModal}
                isSubmitting={isSubmitting}
                initialData={editingVendor}
                panelConfig={panelConfig}
            />
        </Modal>
      )}
    </div>
  );
};

// New Component Definitions to fix build errors
const Placeholder: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-200">
    <div className="p-4 rounded-full bg-gray-50 mb-3">
        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
    </div>
    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
    <p className="text-gray-500 mt-2">This feature is under development.</p>
    <button onClick={() => alert(`${title} - Action clicked!`)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Try Action
    </button>
  </div>
);

const JobBoardView: React.FC<{ 
    jobs: Job[]; 
    onAddJob: (job: any) => void;
    onUpdateJob: (job: Job) => void;
    onDeleteJob: (id: string) => void;
    vendors: any[];
    panelConfig: PanelConfig | null;
}> = ({ jobs, onAddJob, onUpdateJob, onDeleteJob, vendors, panelConfig }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const handleAddNewClick = () => {
    setEditingJob(null);
    setIsFormVisible(true);
  };

  const handleEditClick = (job: Job) => {
    setEditingJob(job);
    setIsFormVisible(true);
  };

  const handleFormClose = () => {
    setIsFormVisible(false);
    setEditingJob(null);
  };

  const handleJobSave = (job: Omit<Job, 'id' | 'postedDate' | 'adminId'>) => {
    onAddJob(job);
    handleFormClose();
  };
  
  const handleJobUpdate = (job: Job) => {
    onUpdateJob(job);
    handleFormClose();
  };

  if (isFormVisible) {
    return (
      <div className="space-y-6 animate-fade-in">
        <JobPostingForm 
            onAddJob={handleJobSave}
            onUpdateJob={handleJobUpdate}
            initialData={editingJob}
            isModalMode={false}
            onClose={handleFormClose}
            vendors={vendors}
            panelConfig={panelConfig}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold text-gray-800">Job Board</h2>
        </div>
        <button 
            onClick={handleAddNewClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2 transition-colors shadow-sm"
        >
            + Post New Job
        </button>
      </div>
      <JobList 
        jobs={jobs} 
        currentUserType={UserType.ADMIN} 
        onDeleteJob={onDeleteJob}
        onEditJob={handleEditClick}
      />
    </div>
  );
};

const DemoRequestsView: React.FC = () => {
  // Mock data - currently empty as per screenshot
  const requests: any[] = [];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Demo Requests</h2>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Team Head</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Team Size</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No demo requests yet.
                  </td>
                </tr>
              ) : (
                requests.map((req, index) => (
                  <tr key={index}>
                    {/* Data cells would go here */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
const RevenueView: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    setSelectedMonth(`${year}-${month}`);
  }, []);

  useEffect(() => {
    if (!selectedMonth) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setRevenueData(null);
      try {
        const data = await getRevenueData(selectedMonth);
        setRevenueData(data);
      } catch (err) {
        setError('Failed to fetch revenue data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth]);

  const netProfit = revenueData ? revenueData.totalRevenue - revenueData.totalCost : 0;
  const profitMargin = revenueData && revenueData.totalRevenue > 0 ? (netProfit / revenueData.totalRevenue) * 100 : 0;
  const formatCurrency = (amount: number) => `₹ ${amount.toLocaleString('en-IN')}`;


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Revenue & Profitability</h2>
          <p className="text-gray-600 mt-1">Monthly financials based on pro-rata candidate attendance.</p>
        </div>
        <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Select Month</label>
            <input 
                type="month" 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
           <p className="text-sm font-medium text-gray-500 mb-2">Total Revenue</p>
           <p className="text-3xl font-bold text-green-600">{formatCurrency(revenueData?.totalRevenue ?? 0)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
           <p className="text-sm font-medium text-gray-500 mb-2">Total Operational Cost</p>
           <p className="text-3xl font-bold text-red-600">{formatCurrency(revenueData?.totalCost ?? 0)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
           <p className="text-sm font-medium text-gray-500 mb-2">Net Profit</p>
           <p className="text-3xl font-bold text-blue-600">{formatCurrency(netProfit)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
           <p className="text-sm font-medium text-gray-500 mb-2">Profit Margin</p>
           <p className="text-3xl font-bold text-purple-600">{profitMargin.toFixed(1)}%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
         <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">Team Wise Profitability</h3>
         </div>
         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-white">
                  <tr>
                     <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">TEAM MEMBER</th>
                     <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">ROLE</th>
                     <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">REVENUE GENERATED</th>
                     <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">SALARY COST</th>
                     <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">NET PROFIT</th>
                  </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading data...</td></tr>
                    ) : error ? (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-red-500">{error}</td></tr>
                    ) : !revenueData || revenueData.teamProfitability.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No data available for {selectedMonth}.</td></tr>
                    ) : (
                        revenueData.teamProfitability.map(item => {
                            const net = item.revenue - item.cost;
                            return (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{item.member}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{item.role}</td>
                                    <td className="px-6 py-4 text-right text-sm text-green-600">{formatCurrency(item.revenue)}</td>
                                    <td className="px-6 py-4 text-right text-sm text-red-600">{formatCurrency(item.cost)}</td>
                                    <td className={`px-6 py-4 text-right text-sm font-bold ${net > 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(net)}</td>
                                </tr>
                            );
                        })
                    )}
               </tbody>
            </table>
         </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
         <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">Vendor / Client Profitability</h3>
         </div>
         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-white">
                  <tr>
                     <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">VENDOR / CLIENT</th>
                     <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">TYPE</th>
                     <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">REVENUE (IN)</th>
                     <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">COST (OUT)</th>
                     <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">PROFIT / LOSS</th>
                  </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                   {loading ? (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading data...</td></tr>
                   ) : error ? (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-red-500">{error}</td></tr>
                   ) : !revenueData || revenueData.clientProfitability.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No data available for {selectedMonth}.</td></tr>
                   ) : (
                        revenueData.clientProfitability.map(item => {
                            const profit = item.revenueIn - item.costOut;
                            return (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{item.type}</td>
                                    <td className="px-6 py-4 text-right text-sm text-green-600">{formatCurrency(item.revenueIn)}</td>
                                    <td className="px-6 py-4 text-right text-sm text-red-600">{formatCurrency(item.costOut)}</td>
                                    <td className={`px-6 py-4 text-right text-sm font-bold ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(profit)}</td>
                                </tr>
                            );
                        })
                   )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

const MyProfileView: React.FC<{ user?: AppUser | null, profile: any, setProfile: (p: any) => void }> = ({ user, profile, setProfile }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSaveChanges = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Profile saved successfully!');
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("New passwords don't match!");
            return;
        }
        if (!currentPassword || !newPassword) {
            alert('Please fill all password fields.');
            return;
        }
        alert('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="animate-fade-in">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3">
                    {/* Left Panel: Profile Card */}
                    <div className="md:col-span-1 p-8 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col items-center text-center">
                        <div className="w-28 h-28 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-5xl font-bold mb-4">
                            {profile.fullName?.[0].toUpperCase() || 'U'}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{profile.fullName}</h3>
                        <p className="text-gray-500 mb-6 capitalize">{user?.userType?.toLowerCase() || 'User'}</p>
                        <Button variant="secondary" size="sm" onClick={() => alert('Change photo functionality goes here.')}>
                            Change Photo
                        </Button>
                    </div>

                    {/* Right Panel: Forms */}
                    <div className="md:col-span-2 p-8 space-y-8">
                        {/* Personal Information Form */}
                        <form onSubmit={handleSaveChanges}>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                            <div className="space-y-4">
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    label="Full Name"
                                    type="text"
                                    value={profile.fullName}
                                    onChange={handleChange}
                                />
                                <Input
                                    id="email"
                                    label="Email Address"
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    className="bg-gray-100 cursor-not-allowed"
                                />
                                <Input
                                    id="phone"
                                    name="phone"
                                    label="Phone Number"
                                    type="tel"
                                    value={profile.phone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mt-6 text-right">
                                <Button type="submit" variant="primary" className="bg-indigo-600 hover:bg-indigo-700">
                                    Save Changes
                                </Button>
                            </div>
                        </form>

                        <div className="border-t border-gray-200"></div>

                        {/* Change Password Form */}
                        <form onSubmit={handleChangePassword}>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
                            <div className="space-y-4">
                                <Input
                                    id="currentPassword"
                                    label="Current Password"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    autoComplete="current-password"
                                />
                                <Input
                                    id="newPassword"
                                    label="New Password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    autoComplete="new-password"
                                />
                                <Input
                                    id="confirmPassword"
                                    label="Confirm New Password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                />
                            </div>
                            <div className="mt-6 text-right">
                                <Button type="submit" variant="primary" className="bg-indigo-600 hover:bg-indigo-700">
                                    Change Password
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RoleSettingsView: React.FC = () => {
  const [roles, setRoles] = useState<{ id: string; name: string; panel: string; }[]>([]);
  const [roleName, setRoleName] = useState('');
  const [assignedPanel, setAssignedPanel] = useState<UserType>(UserType.HR);

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      alert('Please enter a role name.');
      return;
    }

    const newRole = {
      id: new Date().toISOString(),
      name: roleName,
      panel: assignedPanel,
    };

    setRoles([newRole, ...roles]);
    setRoleName('');
    setAssignedPanel(UserType.HR);
  };

  const handleDeleteRole = (id: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
        setRoles(roles.filter(role => role.id !== id));
    }
  };

  const panelOptions: UserType[] = [
    UserType.ADMIN,
    UserType.HR,
    UserType.TEAMLEAD,
    UserType.TEAM,
    UserType.PARTNER,
    UserType.CANDIDATE,
  ];

  const panelDisplayNames: Record<string, string> = {
    [UserType.ADMIN]: 'Admin',
    [UserType.HR]: 'HR',
    [UserType.TEAMLEAD]: 'Team Lead',
    [UserType.TEAM]: 'Team Member',
    [UserType.PARTNER]: 'Partner',
    [UserType.CANDIDATE]: 'Candidate',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Panel: Add New Role Form */}
      <div className="lg:col-span-1">
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 h-full">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Add New Role</h3>
          <form onSubmit={handleAddRole} className="space-y-5">
            <div>
              <label htmlFor="roleName" className="block text-sm font-medium text-gray-700 mb-1">
                Role Name
              </label>
              <Input
                id="roleName"
                type="text"
                placeholder="e.g., Senior HR"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="assignPanel" className="block text-sm font-medium text-gray-700 mb-1">
                Assign Panel
              </label>
              <select
                id="assignPanel"
                value={assignedPanel}
                onChange={(e) => setAssignedPanel(e.target.value as UserType)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {panelOptions.map(panel => (
                    <option key={panel} value={panel}>{panelDisplayNames[panel]} Panel</option>
                ))}
              </select>
            </div>
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center bg-indigo-600 hover:bg-indigo-700"
              >
                Add Role
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Panel: Existing Roles */}
      <div className="lg:col-span-2">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 h-full">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Existing Roles</h3>
          {roles.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 py-16">
              <p>No roles added yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Panel</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {roles.map(role => (
                            <tr key={role.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{panelDisplayNames[role.panel]} Panel</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                    <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                    <button onClick={() => handleDeleteRole(role.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ToggleSwitch: React.FC<{
  label: string;
  description: string;
  initialChecked?: boolean;
}> = ({ label, description, initialChecked = false }) => {
  const [isChecked, setIsChecked] = React.useState(initialChecked);
  const uniqueId = React.useId();

  return (
    <div className="flex justify-between items-center py-4 border-b border-gray-100 last:border-b-0">
      <div>
        <label htmlFor={uniqueId} className="font-semibold text-gray-800 cursor-pointer">{label}</label>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        id={uniqueId}
        onClick={() => setIsChecked(!isChecked)}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          isChecked ? 'bg-indigo-600' : 'bg-gray-200'
        }`}
        role="switch"
        aria-checked={isChecked}
      >
        <span
          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${
            isChecked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

const ManagementCard: React.FC<{
    title: string;
    items: string[];
    onAddItem: () => void;
    onDeleteItem: (item: string) => void;
}> = ({ title, items, onAddItem, onDeleteItem }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[200px]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                <button
                    onClick={onAddItem}
                    className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors"
                >
                    + Add New
                </button>
            </div>
            <div className="space-y-2 flex-grow">
                {items.length > 0 ? (
                    items.map(item => (
                        <div key={item} className="flex justify-between items-center bg-gray-50 p-2 rounded-md text-sm group">
                            <span className="text-gray-800 truncate pr-2">{item}</span>
                            <button onClick={() => onDeleteItem(item)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-sm text-center pt-8">No items added yet.</p>
                )}
            </div>
        </div>
    );
};

const PanelConfigurationView: React.FC<{
    config: PanelConfig;
    onConfigChange: (newConfig: PanelConfig) => void;
}> = ({ config, onConfigChange }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState<{ title: string; onSave: (value1: string, value2?: string) => void; type?: 'store' | 'generic' } | null>(null);
    const [newItemValue, setNewItemValue] = useState('');
    const [newStoreLocation, setNewStoreLocation] = useState('');

    useEffect(() => {
        const locations = config.locations || [];
        if (locations.length > 0) {
            setNewStoreLocation(locations[0]);
        }
    }, [config.locations]);

    const handleOpenModal = (title: string, onSave: (value1: string, value2?: string) => void, type: 'store' | 'generic' = 'generic') => {
      setModalConfig({ title, onSave, type });
      setNewItemValue('');
      const locations = config.locations || [];
      if (type === 'store' && locations.length > 0) {
          setNewStoreLocation(locations[0]);
      }
      setIsModalOpen(true);
    };
  
    const handleCloseModal = () => {
      setIsModalOpen(false);
      setModalConfig(null);
    };
    
    const handleSaveItem = () => {
        if (modalConfig && newItemValue.trim()) {
            if (modalConfig.type === 'store' && !newStoreLocation) {
                alert('Please select a location.');
                return;
            }
            modalConfig.onSave(newItemValue.trim(), newStoreLocation);
            handleCloseModal();
        }
    };
  
    const handleAddItem = (key: 'jobRoles' | 'locations') => (value: string) => {
        onConfigChange({ ...config, [key]: [...(config[key] || []), value] });
    };
    
    const handleDeleteItem = (key: 'jobRoles' | 'locations') => (value: string) => {
        if (window.confirm(`Are you sure you want to delete "${value}"?`)) {
            onConfigChange({ ...config, [key]: (config[key] || []).filter(item => item !== value) });
        }
    };

    const handleAddStore = (name: string, location?: string) => {
        if (!location) return;
        const newStore: Store = { id: Date.now().toString(), name, location };
        onConfigChange({ ...config, stores: [...(config.stores || []), newStore] });
    };

    const handleDeleteStore = (itemString: string) => {
        if (window.confirm(`Are you sure you want to delete "${itemString}"?`)) {
            const storeToDelete = (config.stores || []).find(s => `${s.name} (${s.location})` === itemString);
            if (storeToDelete) {
                onConfigChange({ ...config, stores: (config.stores || []).filter(s => s.id !== storeToDelete.id) });
            }
        }
    };
    
    const locations = config.locations || [];

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6">
          <ToggleSwitch 
            label="Email Notifications" 
            description="Receive emails for new applications."
            initialChecked={true}
          />
          <ToggleSwitch 
            label="Maintenance Mode" 
            description="Prevent users from accessing the portal."
            initialChecked={false}
          />
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ManagementCard 
                title="Job Roles" 
                items={config.jobRoles || []} 
                onAddItem={() => handleOpenModal('Add New Job Role', handleAddItem('jobRoles'))}
                onDeleteItem={handleDeleteItem('jobRoles')}
            />
            <ManagementCard 
                title="Locations" 
                items={locations} 
                onAddItem={() => handleOpenModal('Add New Location', handleAddItem('locations'))}
                onDeleteItem={handleDeleteItem('locations')}
            />
            <ManagementCard 
                title="Store Names" 
                items={(config.stores || []).map(s => `${s.name} (${s.location})`)} 
                onAddItem={() => handleOpenModal('Add New Store Name', handleAddStore, 'store')}
                onDeleteItem={handleDeleteStore}
            />
        </div>

        {isModalOpen && modalConfig && (
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={modalConfig.title}>
                <form onSubmit={(e) => { e.preventDefault(); handleSaveItem(); }}>
                    <div className="space-y-4">
                        {modalConfig.type === 'store' && (
                            <div>
                                <label htmlFor="newStoreLocation" className="block text-sm font-medium text-gray-700 mb-1">
                                    Location
                                </label>
                                <select
                                    id="newStoreLocation"
                                    value={newStoreLocation}
                                    onChange={(e) => setNewStoreLocation(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                >
                                    {locations.length > 0 ? (
                                        locations.map(loc => <option key={loc} value={loc}>{loc}</option>)
                                    ) : (
                                        <option disabled>No locations available</option>
                                    )}
                                </select>
                            </div>
                        )}
                        <Input
                            id="newItem"
                            label={modalConfig.type === 'store' ? "Store Name" : "Name"}
                            value={newItemValue}
                            onChange={(e) => setNewItemValue(e.target.value)}
                            autoFocus
                            required
                            disabled={modalConfig.type === 'store' && locations.length === 0}
                            placeholder={modalConfig.type === 'store' && locations.length === 0 ? "Please add a location first" : ""}
                        />
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                            <Button type="submit" variant="primary">Save</Button>
                        </div>
                    </div>
                </form>
            </Modal>
        )}
      </div>
    );
};

const FileInput: React.FC<{
  label: string;
  onFileSelect: (base64: string) => void;
}> = ({ label, onFileSelect }) => {
  const [fileName, setFileName] = useState('No file chosen');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        onFileSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFileName('No file chosen');
      onFileSelect('');
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Choose file
        </button>
        <span className="ml-4 text-sm text-gray-500 truncate">{fileName}</span>
      </div>
    </div>
  );
};

const PortalBrandingView: React.FC<{
  branding: BrandingConfig;
  onBrandingChange: (b: BrandingConfig) => void;
  onSave: (b: BrandingConfig, newLogo?: string) => void;
}> = ({ branding, onBrandingChange, onSave }) => {
  const [newLogoBase64, setNewLogoBase64] = useState<string>('');
  const [newHireBgBase64, setNewHireBgBase64] = useState<string>('');
  const [newRegisterBgBase64, setNewRegisterBgBase64] = useState<string>('');

  const handleInputChange = (section: 'hireTalent' | 'becomePartner', field: 'title' | 'description' | 'link', value: string) => {
    onBrandingChange({
      ...branding,
      [section]: {
        ...branding[section],
        [field]: value,
      }
    });
  };

  const handleSave = () => {
    let updatedBranding = { ...branding };

    if (newHireBgBase64) {
      updatedBranding.hireTalent.backgroundImage = newHireBgBase64;
    }
    if (newRegisterBgBase64) {
      updatedBranding.becomePartner.backgroundImage = newRegisterBgBase64;
    }
    
    onSave(updatedBranding, newLogoBase64 || undefined);
  };

  return (
    <div className="space-y-10">
      <section>
        <h3 className="text-lg font-semibold text-gray-800 pb-3 border-b border-gray-200 mb-6">Portal Logo & Name</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <FileInput label="Portal Logo" onFileSelect={setNewLogoBase64} />
          <Input
            id="portalName"
            label="Portal Name"
            type="text"
            placeholder="e.g., R.K.M ENTERPRISE"
            value={branding.portalName}
            onChange={(e) => onBrandingChange({...branding, portalName: e.target.value})}
            wrapperClassName="w-full"
          />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-800 pb-3 border-b border-gray-200 mb-6">Hire Top Talent Banner</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input
              id="hireTitle"
              label="Title"
              type="text"
              placeholder="e.g., Hire Top Talent"
              value={branding.hireTalent.title}
              onChange={(e) => handleInputChange('hireTalent', 'title', e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Input
              id="hireDescription"
              label="Description"
              type="text"
              placeholder="e.g., Post your job openings..."
              value={branding.hireTalent.description}
              onChange={(e) => handleInputChange('hireTalent', 'description', e.target.value)}
            />
          </div>
          <FileInput label="Background Image" onFileSelect={setNewHireBgBase64} />
          <Input
            id="hireLink"
            label="Page Link"
            type="text"
            placeholder="https://example.com/hire"
            value={branding.hireTalent.link}
            onChange={(e) => handleInputChange('hireTalent', 'link', e.target.value)}
            wrapperClassName="w-full"
          />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-800 pb-3 border-b border-gray-200 mb-6">Become a Partner Banner</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input
              id="partnerTitle"
              label="Title"
              type="text"
              placeholder="e.g., Become a Partner"
              value={branding.becomePartner.title}
              onChange={(e) => handleInputChange('becomePartner', 'title', e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Input
              id="partnerDescription"
              label="Description"
              type="text"
              placeholder="e.g., Expand your business by collaborating with us..."
              value={branding.becomePartner.description}
              onChange={(e) => handleInputChange('becomePartner', 'description', e.target.value)}
            />
          </div>
           <FileInput label="Background Image" onFileSelect={setNewRegisterBgBase64} />
           <Input
            id="registerLink"
            label="Page Link"
            type="text"
            placeholder="https://example.com/register"
            value={branding.becomePartner.link}
            onChange={(e) => handleInputChange('becomePartner', 'link', e.target.value)}
            wrapperClassName="w-full"
          />
        </div>
      </section>

      <div className="mt-12 flex justify-end">
        <Button onClick={handleSave} variant="primary" className="bg-indigo-600 hover:bg-indigo-700">
          Save Branding
        </Button>
      </div>
    </div>
  );
};

type Role = 'HR' | 'TeamLead' | 'TeamMember' | 'Partner';
type Page = 'Manage Job Board' | 'Vendor Directory' | 'Demo Requests' | 'Revenue';

const PermissionsView: React.FC<{
    permissions: Record<Page, Record<Role, boolean>>;
    setPermissions: React.Dispatch<React.SetStateAction<Record<Page, Record<Role, boolean>>>>;
}> = ({ permissions, setPermissions }) => {
  const pages: Page[] = ['Manage Job Board', 'Vendor Directory', 'Demo Requests', 'Revenue'];
  const roles: Role[] = ['HR', 'TeamLead', 'TeamMember', 'Partner'];
  
  const handlePermissionChange = (page: Page, role: Role) => {
    setPermissions(prev => ({
      ...prev,
      [page]: {
        ...prev[page],
        [role]: !prev[page][role],
      },
    }));
  };
  
  const roleDisplayNames: Record<Role, string> = {
      HR: 'HR',
      TeamLead: 'Team Lead',
      TeamMember: 'Team Member',
      Partner: 'Partner',
  };

  return (
    <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Page Access Permissions</h2>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page / Feature</th>
                        {roles.map(role => (
                            <th key={role} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{roleDisplayNames[role as Role]}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {pages.map(page => (
                        <tr key={page}>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{page}</td>
                            {roles.map(role => (
                                <td key={`${page}-${role}`} className="px-6 py-4 whitespace-nowrap text-center">
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        checked={permissions[page][role]}
                                        onChange={() => handlePermissionChange(page, role)}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="mt-6 flex justify-end">
            <Button variant="primary" onClick={() => alert('Permissions saved!')}>Save Permissions</Button>
        </div>
    </div>
  );
};

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: string;
    designation: string;
    manager: string;
    salary: number;
}
const TeamRolesView: React.FC<{
    onAddTeamMember: () => void;
}> = ({ onAddTeamMember }) => {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
        // Mock data to show table functionality
        { id: 'tm1', name: 'Rahul Sharma', email: 'rahul@example.com', role: 'TeamLead', designation: 'Senior Recruiter', manager: 'Admin', salary: 75000 },
        { id: 'tm2', name: 'Sneha Gupta', email: 'sneha@example.com', role: 'TeamMember', designation: 'Recruiter', manager: 'Rahul Sharma', salary: 45000 },
    ]);

    const handleDelete = (id: string) => {
        if(window.confirm("Are you sure you want to delete this team member?")) {
            setTeamMembers(prev => prev.filter(m => m.id !== id));
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Manage Team & Roles</h3>
                    <Button variant="primary" onClick={onAddTeamMember} className="bg-indigo-600 hover:bg-indigo-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110 2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                        Add Team Member
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {teamMembers.map(member => (
                                <tr key={member.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                        <div className="text-sm text-gray-500">{member.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.designation}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.manager}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{member.salary.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                        <button onClick={() => handleDelete(member.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const SettingsView: React.FC<{
    branding: BrandingConfig,
    onUpdateBranding: (b: BrandingConfig) => void,
    onLogoUpload: (logo: string) => void,
    currentUser?: AppUser | null,
    panelConfig: PanelConfig | null,
    onUpdatePanelConfig: (config: PanelConfig) => void,
    userProfile: any,
    setUserProfile: (p: any) => void,
    onAddTeamMember: () => void;
}> = ({ branding, onUpdateBranding, onLogoUpload, currentUser, panelConfig, onUpdatePanelConfig, userProfile, setUserProfile, onAddTeamMember }) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('Team & Roles');
    
    const [tempBranding, setTempBranding] = useState(branding);
    useEffect(() => {
        setTempBranding(branding);
    }, [branding]);

    const handleBrandingSave = (updatedBranding: BrandingConfig, newLogo?: string) => {
        onUpdateBranding(updatedBranding);
        if (newLogo) {
            onLogoUpload(newLogo);
        }
        alert('Branding settings saved successfully!');
    };

    const handlePanelConfigSave = (newConfig: PanelConfig) => {
        onUpdatePanelConfig(newConfig);
    };

    const [permissions, setPermissions] = useState<Record<Page, Record<Role, boolean>>>(() => {
        const initial: Record<Page, Record<Role, boolean>> = {
            'Manage Job Board': { HR: true, TeamLead: true, TeamMember: false, Partner: false },
            'Vendor Directory': { HR: true, TeamLead: false, TeamMember: false, Partner: false },
            'Demo Requests': { HR: true, TeamLead: true, TeamMember: false, Partner: false },
            'Revenue': { HR: true, TeamLead: false, TeamMember: false, Partner: false },
        };
        return initial;
    });

    const tabs: SettingsTab[] = ['Team & Roles', 'Permissions', 'Role', 'Panel Options', 'My Account', 'Branding'];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Settings</h2>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === tab
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            
            {activeTab === 'Team & Roles' && <TeamRolesView onAddTeamMember={onAddTeamMember} />}
            {activeTab === 'Permissions' && <PermissionsView permissions={permissions} setPermissions={setPermissions} />}
            {activeTab === 'Role' && <RoleSettingsView />}
            {activeTab === 'Panel Options' && panelConfig && <PanelConfigurationView config={panelConfig} onConfigChange={handlePanelConfigSave} />}
            {activeTab === 'My Account' && <MyProfileView user={currentUser} profile={userProfile} setProfile={setUserProfile} />}
            {activeTab === 'Branding' && (
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                    <PortalBrandingView branding={tempBranding} onBrandingChange={setTempBranding} onSave={handleBrandingSave} />
                </div>
            )}
        </div>
    );
};


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
  currentLogoSrc, 
  onLogoUpload, 
  activeAdminMenuItem,
  onAdminMenuItemClick,
  userType,
  branding,
  onUpdateBranding,
  currentUser,
}) => {
  const [isTeamMemberModalOpen, setIsTeamMemberModalOpen] = useState(false);
  const [panelConfig, setPanelConfig] = useState<PanelConfig | null>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({ fullName: currentUser?.email || 'User', email: currentUser?.email || '', phone: '' });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [config, vendorData] = await Promise.all([getPanelConfig(), getVendors()]);
        setPanelConfig(config);
        setVendors(vendorData);
      } catch (error) {
        console.error("Failed to fetch initial admin data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdatePanelConfig = async (newConfig: PanelConfig) => {
    try {
      await updatePanelConfig(newConfig);
      setPanelConfig(newConfig);
      alert('Panel options saved!');
    } catch (error) {
      alert('Failed to save panel options.');
    }
  };

  const handleAddTeamMember = (memberData: any) => {
    console.log('New team member:', memberData);
    alert('Team member added (demo).');
    setIsTeamMemberModalOpen(false);
  };
  
  const AdminStatCards = useMemo(() => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Candidate Pipeline"
        metrics={[
          { label: "Active", value: pipelineStats.active, color: 'text-blue-600' },
          { label: "Interview", value: pipelineStats.interview, color: 'text-yellow-600' },
          { label: "Rejected", value: pipelineStats.rejected, color: 'text-red-600' },
          { label: "Quit", value: pipelineStats.quit, color: 'text-gray-600' },
        ]}
      />
      <StatCard title="Total Vendors" value={vendorStats.total} />
      <StatCard
        title="Partner Requirements"
        value={partnerRequirementStats.total}
        metrics={[
          { label: "Pending", value: partnerRequirementStats.pending, color: 'text-yellow-600' },
          { label: "Approved", value: partnerRequirementStats.approved, color: 'text-green-600' },
        ]}
        isSplitMetrics
      />
       <StatCard
        title="Complaints"
        value={complaintStats.active + complaintStats.closed}
        metrics={[
          { label: "Active", value: complaintStats.active, color: 'text-red-600' },
          { label: "Closed", value: complaintStats.closed, color: 'text-green-600' },
        ]}
        isSplitMetrics
      />
    </div>
  ), [pipelineStats, vendorStats, complaintStats, partnerRequirementStats]);

  const renderContent = () => {
    switch (activeAdminMenuItem) {
      case AdminMenuItem.Dashboard:
        if (userType === UserType.HR) {
          return <HRDashboardView onNavigate={onAdminMenuItemClick} />;
        }
        if (userType === UserType.PARTNER) {
            return (
                <PartnerDashboardView 
                    onNavigate={onAdminMenuItemClick}
                    partnerRequirementStats={partnerRequirementStats}
                    activeCandidatesCount={50} // Mock data
                    pendingInvoicesCount={2} // Mock data
                    supervisorsCount={5} // Mock data
                />
            );
        }
        // Default Admin / Team Lead Dashboard
        return (
          <div className="space-y-6">
             <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
                <Button variant="primary" onClick={() => onAdminMenuItemClick(AdminMenuItem.ManageJobBoard)}>+ Post New Job</Button>
            </div>
            {AdminStatCards}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProgressBarCard title="Candidates by Process" data={candidatesByProcess} />
              <ProgressBarCard title="Candidates by Role" data={candidatesByRole} />
            </div>
            { (userType === UserType.ADMIN || userType === UserType.TEAMLEAD) && 
                <div className="flex justify-end">
                    <Button variant='secondary' onClick={() => onAdminMenuItemClick(AdminMenuItem.PartnerRequirementsDetail)}>
                        View Requirements Breakdown
                    </Button>
                </div>
            }
            <TeamWiseTable />
            <TeamPerformanceTable data={teamPerformance} />
             {userType === UserType.ADMIN && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Team Members</h3>
                        <Button variant="primary" size="sm" onClick={() => setIsTeamMemberModalOpen(true)}>
                            + Add Team Member
                        </Button>
                    </div>
                </div>
            )}
            
            <AddTeamMemberModal 
                isOpen={isTeamMemberModalOpen} 
                onClose={() => setIsTeamMemberModalOpen(false)} 
                onSave={handleAddTeamMember}
                availableLocations={panelConfig?.locations || []}
                availableVendors={vendors.map(v => v.brandName)}
            />

          </div>
        );
      case AdminMenuItem.DailyLineups:
        return <DailyLineupsView userType={userType} />;
      case AdminMenuItem.SelectionDashboard:
        return <SelectionDashboardView teamData={teamPerformance} userType={userType} />;
      case AdminMenuItem.AllCandidates:
        return <AllCandidatesView userType={userType} jobs={jobs} />;
      case AdminMenuItem.Attendance:
        return <AttendanceView />;
      case AdminMenuItem.Complaints:
        return <ComplaintsView />;
      case AdminMenuItem.WarningLetters:
        return <WarningLettersView />;
      case AdminMenuItem.Reports:
        return <ReportsView userType={userType} currentUser={currentUser} />;
      case AdminMenuItem.ManageJobBoard:
        return <JobBoardView jobs={jobs} onAddJob={onAddJob} onUpdateJob={onUpdateJob} onDeleteJob={onDeleteJob} vendors={vendors} panelConfig={panelConfig} />;
      case AdminMenuItem.VendorDirectory:
        return <VendorDirectoryView vendors={vendors} setVendors={setVendors} isLoading={isLoading} panelConfig={panelConfig} />;
      case AdminMenuItem.DemoRequests:
        return <DemoRequestsView />;
      case AdminMenuItem.Revenue:
        return <RevenueView />;
      case AdminMenuItem.Settings:
        return (
          <SettingsView
            branding={branding}
            onUpdateBranding={onUpdateBranding}
            onLogoUpload={onLogoUpload}
            currentUser={currentUser}
            panelConfig={panelConfig}
            onUpdatePanelConfig={handleUpdatePanelConfig}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            onAddTeamMember={() => setIsTeamMemberModalOpen(true)}
          />
        );
      // New HR Items
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
      case AdminMenuItem.MyProfile:
        return <MyProfileView user={currentUser} profile={userProfile} setProfile={setUserProfile} />;
      // New Partner Items
      case AdminMenuItem.PartnerUpdateStatus:
        return <PartnerUpdateStatusView />;
      case AdminMenuItem.PartnerActiveCandidates:
        return <PartnerActiveCandidatesView />;
      case AdminMenuItem.ManageSupervisors:
        return <PartnerManageSupervisorsView />;
      case AdminMenuItem.PartnerRequirements:
        return <PartnerRequirementsView />;
      case AdminMenuItem.PartnerInvoices:
        return <PartnerInvoicesView />;
      case AdminMenuItem.PartnerSalaryUpdates:
        return <PartnerSalaryUpdatesView />;
      case AdminMenuItem.PartnerHelpCenter:
        return <HelpCenterView />;
      case AdminMenuItem.PartnerRequirementsDetail:
        return <PartnerRequirementsDetailView onBack={() => onAdminMenuItemClick(AdminMenuItem.Dashboard)} />;
      // New Supervisor Items
      case AdminMenuItem.SupervisorDashboard:
        return <SupervisorDashboardView />;
      case AdminMenuItem.StoreAttendance:
        return <StoreAttendanceView />;
      case AdminMenuItem.StoreEmployees:
        return <StoreEmployeesView />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-800">Content Not Available</h2>
            <p className="mt-2 text-gray-500">The view for "{activeAdminMenuItem}" is not yet implemented.</p>
          </div>
        );
    }
  };

  return <div className="animate-fade-in">{renderContent()}</div>;
};

export default AdminDashboardContent;
