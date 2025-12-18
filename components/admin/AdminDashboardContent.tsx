// FIX: Import firebase/database functions used directly in this component.
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
import { getRevenueData, RevenueData, getPanelConfig, updatePanelConfig, createVendor, getVendors, onDailyLineupsChange, addDailyLineup, updateDailyLineup, onCandidatesChange, updateCandidateStatus, addCandidateToSelection, updateCandidate, onAttendanceForMonthChange, saveEmployeeAttendance, onComplaintsChange, addComplaint, updateComplaint, onWarningLettersChange, addWarningLetter, updateWarningLetter, onDemoRequestsChange, getDailyLineups, getCandidates, getComplaints, getWarningLetters, getAttendanceForMonth, onAllPartnerRequirementsChange, getUsers } from '../../services/firebaseService';
import HelpCenterView from '../candidate/HelpCenterView';
import HRUpdatesCard from './HRUpdatesCard';
import SettingsView from './SettingsView';

declare const html2pdf: any;

// --- SETTINGS TABS TYPE ---
type SettingsTab = 'Team & Roles' | 'Permissions' | 'Role' | 'Panel Options' | 'My Account' | 'Branding';


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

const AddLineupForm: React.FC<{ 
    onClose: () => void; 
    vendors: any[]; 
    panelConfig: PanelConfig | null; 
    onAddLineup: (lineupData: Omit<DailyLineup, 'id' | 'submittedBy' | 'createdAt'>) => void;
}> = ({ onClose, vendors, panelConfig, onAddLineup }) => {
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

  const selectedVendor = useMemo(() => {
    if (!formData.vendor || formData.vendor === 'Direct' || !vendors) return null;
    return vendors.find(v => v.brandName === formData.vendor);
  }, [formData.vendor, vendors]);

  const availableRoles = useMemo(() => {
    if (formData.vendor === 'Direct') {
      return panelConfig?.jobRoles || [];
    }
    return selectedVendor?.roles || [];
  }, [formData.vendor, selectedVendor, panelConfig]);

  const availableLocations = useMemo(() => {
    if (formData.vendor === 'Direct') {
      return panelConfig?.locations || [];
    }
    return selectedVendor?.locations || [];
  }, [formData.vendor, selectedVendor, panelConfig]);
  
  const availableStores = useMemo(() => {
      if (!formData.location || !panelConfig?.stores) return [];
      return panelConfig.stores.filter(s => s.location === formData.location);
  }, [formData.location, panelConfig]);

  const handleVendorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVendor = e.target.value;
    setFormData(prev => ({
        ...prev,
        vendor: newVendor,
        role: '',
        location: '',
        store: '',
    }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocation = e.target.value;
    setFormData(prev => ({
        ...prev,
        location: newLocation,
        store: '',
    }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lineupData = {
        candidateName: formData.name,
        contact: formData.mobile,
        vendor: formData.vendor,
        role: formData.role,
        location: formData.location,
        storeName: formData.store,
        callStatus: formData.status as CallStatus,
        interviewDateTime: formData.status === 'Interested' ? formData.interviewDateTime : null,
    };
    onAddLineup(lineupData);
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
            onChange={handleVendorChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select a vendor</option>
            <option value="Direct">Direct</option>
            {vendors.map(vendor => ( <option key={vendor.id} value={vendor.brandName}>{vendor.brandName}</option> ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select 
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={!formData.vendor || availableRoles.length === 0}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">{formData.vendor ? "Select a role" : "Select a vendor first"}</option>
             {availableRoles.map(role => <option key={role} value={role}>{role}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <select 
            name="location"
            value={formData.location}
            onChange={handleLocationChange}
            disabled={!formData.vendor || availableLocations.length === 0}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">{formData.vendor ? "Select a location" : "Select a vendor first"}</option>
            {availableLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
          <select 
            name="store"
            value={formData.store}
            onChange={handleChange}
            disabled={!formData.location || availableStores.length === 0}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">{formData.location ? "Select a store" : "Select a location first"}</option>
            {availableStores.map(store => <option key={store.id} value={store.name}>{store.name}</option>)}
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
    
    const callStatuses: CallStatus[] = ['Applied', 'Connected', 'Interested', 'No Answer', 'Not Interested', 'Callback', 'Already Call'];

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


const DailyLineupsView: React.FC<{ userType: UserType; vendors: any[]; panelConfig: PanelConfig | null; }> = ({ userType, vendors, panelConfig }) => {
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

  const [lineups, setLineups] = useState<DailyLineup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onDailyLineupsChange((data) => {
        setLineups(data);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);


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

  const handleAddLineup = async (newLineupData: Omit<DailyLineup, 'id' | 'submittedBy' | 'createdAt'>) => {
    try {
        const newLineup = {
            ...newLineupData,
            submittedBy: 'Admin', // In a real app, this would be the current user
        };
        await addDailyLineup(newLineup);
    } catch (error) {
        console.error("Failed to add lineup:", error);
        alert("Error: Could not add lineup. Please try again.");
    }
  };

  const handleSaveEdit = async (updatedLineupData: DailyLineup) => {
    try {
        const originalLineup = editingLineup; // The state before editing
        const { id, ...dataToUpdate } = updatedLineupData;
        await updateDailyLineup(id, dataToUpdate);

        // If status changed to 'Interested' and an interview date is set, move to Selection Dashboard
        if (
            originalLineup &&
            originalLineup.callStatus !== 'Interested' &&
            updatedLineupData.callStatus === 'Interested' &&
            updatedLineupData.interviewDateTime
        ) {
            await addCandidateToSelection(updatedLineupData);
        }

        setEditingLineup(null); // This will close the modal
    } catch (error) {
        console.error("Failed to update lineup:", error);
        alert("Error: Could not update lineup. Please try again.");
    }
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
                    {isLoading ? (
                        <tr><td colSpan={10} className="px-6 py-8 text-center text-gray-500">Loading lineups...</td></tr>
                    ) : displayLineups.length > 0 ? displayLineups.map((item) => (
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
                                    item.callStatus === 'Applied' ? 'bg-purple-100 text-purple-800' :
                                    item.callStatus === 'Interested' ? 'bg-green-100 text-green-800' :
                                    item.callStatus === 'Connected' ? 'bg-blue-100 text-blue-800' :
                                    item.callStatus === 'No Answer' ? 'bg-yellow-100 text-yellow-800' :
                                    item.callStatus === 'Already Call' ? 'bg-gray-200 text-gray-800' :
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
        <AddLineupForm 
            onClose={() => setIsAddLineupOpen(false)} 
            vendors={vendors} 
            panelConfig={panelConfig}
            onAddLineup={handleAddLineup}
        />
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

const KanbanCard: React.FC<{ candidate: Candidate; isDragging: boolean }> = ({ candidate, isDragging }) => {
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
              <div className="flex justify-between"><span className="text-gray-500">Interview Date:</span> <span className="text-gray-800 font-medium">{candidate.date}</span></div>
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
  
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const isTeamLead = userType === UserType.TEAMLEAD;
  const myTeamMembers = ['Rahul', 'Sneha'];

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onCandidatesChange((data) => {
        const relevantCandidates = isTeamLead 
            ? data.filter(c => myTeamMembers.includes(c.recruiter))
            : data;
        setCandidates(relevantCandidates);
        setIsLoading(false);
    });
    return () => unsubscribe();
  }, [isTeamLead]);

  const summaryData = useMemo(() => {
    const summary = candidates.reduce((acc, candidate) => {
        if (!acc[candidate.recruiter]) {
            acc[candidate.recruiter] = { member: candidate.recruiter, sourced: 0, onWay: 0, interview: 0, selected: 0, total: 0 };
        }
        acc[candidate.recruiter].total++;
        if (candidate.status === 'Sourced') acc[candidate.recruiter].sourced++;
        if (candidate.status === 'On the way') acc[candidate.recruiter].onWay++;
        if (candidate.status === 'Interview') acc[candidate.recruiter].interview++;
        if (candidate.status === 'Selected') acc[candidate.recruiter].selected++;
        return acc;
    }, {} as Record<string, any>);
    
    return Object.values(summary);
  }, [candidates]);

  const columns: Candidate['status'][] = ['Sourced', 'On the way', 'Interview', 'Selected'];

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

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, newStatus: Candidate['status']) => {
    e.preventDefault();
    setDragOverColumn(null);
    const candidateId = e.dataTransfer.getData('candidateId');
    if (candidateId) {
        const originalCandidates = [...candidates];
        const updatedCandidates = candidates.map(c => 
            c.id === candidateId ? { ...c, status: newStatus } : c
        );
        setCandidates(updatedCandidates); // Optimistic UI update

        try {
            await updateCandidateStatus(candidateId, newStatus);
        } catch (error) {
            console.error("Failed to update status:", error);
            setCandidates(originalCandidates); // Revert on error
            alert("Failed to update candidate status. Please try again.");
        }
    }
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
           let items = filteredCandidates.filter(c => c.status === status);
           if (status === 'Sourced') {
               items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
           }
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
                {isLoading ? (
                    <div className="text-center py-12 text-gray-400">Loading...</div>
                ) : items.length > 0 ? items.map((candidate) => (
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
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Interview Date</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                  <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">Loading candidates...</td></tr>
              ) : filteredCandidates.length > 0 ? filteredCandidates.map((candidate) => (
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
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading summary...</td></tr>
              ) : summaryData.length > 0 ? summaryData.map((row, idx) => (
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
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quittingCandidate, setQuittingCandidate] = useState<Candidate | null>(null);
  const [viewingCandidate, setViewingCandidate] = useState<Candidate | null>(null);
  const [transferCandidate, setTransferCandidate] = useState<Candidate | null>(null);
  const [quitDate, setQuitDate] = useState('');
  
  const [filters, setFilters] = useState({
    search: '', role: '', vendor: '', storeName: '', status: '', recruiter: '', appliedDate: '', quitDate: ''
  });

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onCandidatesChange((data) => {
        setAllCandidates(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);


  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({...prev, [e.target.name]: e.target.value}));
  };

  const clearFilters = () => {
    setFilters({ search: '', role: '', vendor: '', storeName: '', status: '', recruiter: '', appliedDate: '', quitDate: '' });
  };

  const uniqueRoles = useMemo(() => [...new Set(allCandidates.map(c => c.role))], [allCandidates]);
  const uniqueVendors = useMemo(() => [...new Set(allCandidates.map(c => c.vendor).filter(Boolean))] as string[], [allCandidates]);
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

  const handleMarkQuitClick = (candidate: Candidate) => {
    setQuittingCandidate(candidate);
    setQuitDate(new Date().toISOString().split('T')[0]); // Pre-fill with today's date
  };

  const handleConfirmQuit = async () => {
    if (!quittingCandidate) return;
    try {
        await updateCandidate(quittingCandidate.id, { status: 'Quit', quitDate: quitDate });
        setQuittingCandidate(null);
        setQuitDate('');
    } catch (error) {
        console.error("Failed to mark as quit:", error);
        alert("Error updating candidate status. Please try again.");
    }
  };

  const handleConfirmTransfer = async (candidateId: string, newJobId: string) => {
    if (!newJobId) {
        alert('Please select a new job.');
        return;
    }
    const job = jobs.find(j => j.id === newJobId);
    if (!job) {
        alert('Selected job not found.');
        return;
    }
    const candidate = allCandidates.find(c => c.id === candidateId);
    if (!candidate) return;

    const updateData: Partial<Candidate> = {
        role: job.title,
        vendor: job.jobCategory,
        storeName: job.storeName || candidate.storeName,
        status: 'Sourced',
        date: new Date().toISOString().split('T')[0],
        quitDate: null,
    };

    try {
        await updateCandidate(candidateId, updateData);
        setTransferCandidate(null);
        alert(`Successfully transferred ${candidate.name} to the "${job.title}" role.`);
    } catch (error) {
        console.error("Failed to transfer candidate:", error);
        alert('Failed to transfer candidate.');
    }
  };


  const isTeamLead = userType === UserType.TEAMLEAD;
  const myTeamMembers = ['Rahul', 'Sneha'];

  const filteredCandidates = useMemo(() => {
    return (isTeamLead 
        ? allCandidates.filter(c => myTeamMembers.includes(c.recruiter))
        : allCandidates
    ).filter(c => 
        (c.name.toLowerCase().includes(filters.search.toLowerCase()) || (c.email || '').toLowerCase().includes(filters.search.toLowerCase())) &&
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
              {isLoading ? (
                <tr><td colSpan={9} className="px-6 py-8 text-center text-gray-500">Loading candidates...</td></tr>
              ) : filteredCandidates.length > 0 ? filteredCandidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                        {candidate.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                        <div className="text-sm text-gray-500">{candidate.email || 'N/A'}</div>
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
                <p className="font-semibold text-gray-800">{viewingCandidate.email || 'N/A'}</p>
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
                              {viewingCandidate.documents.map((doc, index) => (
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
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  });
  
  const [hiredCandidates, setHiredCandidates] = useState<Candidate[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, Partial<CommissionAttendanceRecord>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubCandidates = onCandidatesChange((allCandidates) => {
      setHiredCandidates(allCandidates.filter(c => c.status === 'Hired'));
    });
    return () => unsubCandidates();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const unsubAttendance = onAttendanceForMonthChange(selectedMonth, (records) => {
      setAttendanceRecords(records || {});
      setIsLoading(false);
    });
    return () => unsubAttendance();
  }, [selectedMonth]);

  const totalDaysInMonth = useMemo(() => {
    if (!selectedMonth) return 30;
    const [year, month] = selectedMonth.split('-');
    return new Date(parseInt(year), parseInt(month), 0).getDate();
  }, [selectedMonth]);

  const displayData = useMemo(() => {
    return hiredCandidates.map(candidate => {
      const attendance = attendanceRecords[candidate.id];
      // MOCK COMMISSION based on role
      const commission = candidate.role?.toLowerCase().includes('manager') ? 10000 : 5000;
      
      return {
        id: candidate.id,
        name: candidate.name,
        vendor: candidate.vendor || 'Direct',
        role: candidate.role,
        commission,
        presentDays: attendance?.presentDays ?? 0,
        totalDays: totalDaysInMonth,
      };
    });
  }, [hiredCandidates, attendanceRecords, totalDaysInMonth]);

  const handlePresentDaysChange = (employeeId: string, val: string) => {
    const days = Math.max(0, Math.min(totalDaysInMonth, parseInt(val) || 0));
    setAttendanceRecords(prev => ({
        ...prev,
        [employeeId]: { ...prev[employeeId], presentDays: days }
    }));
  };
  
  const handleSave = async (employeeId: string) => {
    const empData = displayData.find(d => d.id === employeeId);
    if (!empData) return;

    setSavingId(employeeId);
    try {
        const recordToSave: Partial<CommissionAttendanceRecord> = {
            presentDays: attendanceRecords[employeeId]?.presentDays ?? empData.presentDays,
            commission: empData.commission,
            totalDays: totalDaysInMonth,
        };
        await saveEmployeeAttendance(selectedMonth, employeeId, recordToSave);
        alert(`Attendance saved for ${empData.name}`);
    } catch (e) {
        console.error("Failed to save attendance:", e);
        alert("Error: Could not save attendance.");
    } finally {
        setSavingId(null);
    }
  };

  const calculatePayable = (commission: number, present: number, total: number) => {
     if (!commission || total === 0 || present === 0) return 0;
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
               {isLoading ? (
                  <tr><td colSpan={7} className="px-6 py-24 text-center text-gray-500">Loading attendance data...</td></tr>
               ) : displayData.length > 0 ? (
                 displayData.map((item) => {
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
                                  max={totalDaysInMonth}
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
                          <Button 
                            onClick={() => handleSave(item.id)} 
                            loading={savingId === item.id}
                            size="sm"
                          >
                            Save
                          </Button>
                      </td>
                   </tr>
                 )})
               ) : (
                <tr>
                    <td colSpan={7} className="px-6 py-24 text-center text-gray-500">
                      No hired employees found to record attendance.
                    </td>
                </tr>
               )}
            </tbody>
          </table>
        </div>
         {displayData.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{displayData.length}</span> of <span className="font-medium">{displayData.length}</span> results
                </div>
            </div>
         )}
      </div>
    </div>
  );
};

const ComplaintsView: React.FC<{ userType: UserType, currentUserProfile?: UserProfile | null }> = ({ userType, currentUserProfile }) => {
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([]);
  const [hiredCandidates, setHiredCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  
  const [newStatus, setNewStatus] = useState<Complaint['status']>('Active');
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    setIsLoading(true);
    const unsubComplaints = onComplaintsChange(setAllComplaints);
    const unsubCandidates = onCandidatesChange(setHiredCandidates);
    
    Promise.all([new Promise(res => onValue(ref(getDatabase(), 'complaints'), res)), new Promise(res => onValue(ref(getDatabase(), 'candidates'), res))]).then(() => {
        setIsLoading(false);
    });

    return () => {
        unsubComplaints();
        unsubCandidates();
    };
  }, []);

  const complaints = useMemo(() => {
      if (userType === UserType.PARTNER) {
          const vendorName = currentUserProfile?.vendorName;
          if (!vendorName) return [];
          return allComplaints.filter(c => c.vendor === vendorName);
      }
      return allComplaints;
  }, [allComplaints, userType, currentUserProfile]);

  const stats = useMemo(() => {
    const active = complaints.filter(c => c.status === 'Active').length;
    const closed = complaints.filter(c => c.status === 'Closed').length;
    return { total: complaints.length, active, closed };
  }, [complaints]);
  
  const getStatusClasses = (status: Complaint['status']) => {
    switch (status) {
        case 'Closed': return 'bg-green-100 text-green-800';
        case 'Active': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openUpdateModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setResolution(complaint.resolution || '');
  };
  
  const closeModals = () => {
    setSelectedComplaint(null);
    setIsModalOpen(false);
  };
  
  const handleUpdateComplaint = async () => {
    if (!selectedComplaint) return;
    setIsSubmitting(true);
    try {
        await updateComplaint(selectedComplaint.id, { status: newStatus, resolution });
        alert('Complaint updated successfully!');
        closeModals();
    } catch (error) {
        alert('Failed to update complaint.');
        console.error(error);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleRaiseComplaint = async (data: Omit<Complaint, 'id' | 'ticketNo' | 'date' | 'status' | 'resolution'>) => {
      setIsSubmitting(true);
      try {
        await addComplaint(data);
        alert('Complaint raised successfully!');
        closeModals();
      } catch (error) {
          alert('Failed to raise complaint.');
          console.error(error);
      } finally {
          setIsSubmitting(false);
      }
  };

  const RaiseComplaintForm: React.FC = () => {
    const [candidateId, setCandidateId] = useState('');
    const [issue, setIssue] = useState('');
    const [description, setDescription] = useState('');
    const [assignedManager, setAssignedManager] = useState('');

    const selectableCandidates = useMemo(() => {
        if (userType === UserType.PARTNER) {
             const vendorName = currentUserProfile?.vendorName;
             if (!vendorName) return [];
            return hiredCandidates.filter(c => c.vendor === vendorName);
        }
        return hiredCandidates;
    }, [hiredCandidates, userType, currentUserProfile]);


    const selectedCandidate = useMemo(() => selectableCandidates.find(c => c.id === candidateId), [candidateId, selectableCandidates]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCandidate) {
            alert('Please select a valid employee.');
            return;
        }
        handleRaiseComplaint({
            candidate: selectedCandidate.name,
            vendor: selectedCandidate.vendor || 'Direct',
            role: selectedCandidate.role,
            issue,
            description,
            assignedManager,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
                <select value={candidateId} onChange={e => setCandidateId(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required>
                    <option value="">-- Choose an employee --</option>
                    {selectableCandidates.map(c => <option key={c.id} value={c.id}>{c.name} ({c.role})</option>)}
                </select>
            </div>
            {selectedCandidate && (
                <div className="text-xs bg-gray-50 p-2 rounded">
                    Auto-filled: <strong>Vendor:</strong> {selectedCandidate.vendor || 'Direct'}, <strong>Role:</strong> {selectedCandidate.role}
                </div>
            )}
            <Input id="issue" label="Issue / Subject" value={issue} onChange={e => setIssue(e.target.value)} required />
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
            </div>
             <Input id="assignedManager" label="Assign to Manager" value={assignedManager} onChange={e => setAssignedManager(e.target.value)} placeholder="e.g., Rahul" required />
             <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="secondary" onClick={closeModals}>Cancel</Button>
                <Button type="submit" variant="primary" loading={isSubmitting}>Submit Complaint</Button>
            </div>
        </form>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Complaints</h2>
        <Button onClick={() => setIsModalOpen(true)}>+ Raise New Complaint</Button>
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
            <h4 className="text-sm font-semibold text-gray-500 mb-1">Closed</h4>
            <p className="text-3xl font-bold text-green-600">{stats.closed}</p>
         </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Ticket No</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Candidate / Vendor</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Issue</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                     <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Loading complaints...</td></tr>
                ) : complaints.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No complaints found.</td></tr>
                ) : (
                    complaints.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">{item.ticketNo}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{item.candidate}</div>
                                <div className="text-xs text-gray-500">{item.vendor} - {item.role}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">{item.issue}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                 <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(item.status)}`}>
                                    {item.status}
                                 </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                               <Button variant="ghost" size="sm" onClick={() => openUpdateModal(item)}>View / Update</Button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
          </table>
        </div>
      </div>
      
      {isModalOpen && !selectedComplaint && (
          <Modal isOpen={isModalOpen} onClose={closeModals} title="Raise New Complaint" maxWidth="max-w-2xl">
              <RaiseComplaintForm />
          </Modal>
      )}

      {selectedComplaint && (
          <Modal isOpen={!!selectedComplaint} onClose={closeModals} title={`Ticket: ${selectedComplaint.ticketNo}`} maxWidth="max-w-2xl">
              <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                      <p><strong>Candidate:</strong> {selectedComplaint.candidate} ({selectedComplaint.role})</p>
                      <p><strong>Date:</strong> {new Date(selectedComplaint.date).toLocaleString()}</p>
                      <p><strong>Issue:</strong> {selectedComplaint.issue}</p>
                      <p className="mt-2"><strong>Description:</strong></p>
                      <p className="italic">{selectedComplaint.description}</p>
                  </div>
                  <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                      <select id="status" value={newStatus} onChange={e => setNewStatus(e.target.value as Complaint['status'])} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                          <option>Active</option>
                          <option>Closed</option>
                      </select>
                  </div>
                   <div>
                      <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 mb-1">Resolution Notes</label>
                      <textarea id="resolution" rows={4} value={resolution} onChange={e => setResolution(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Add resolution details..."></textarea>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button variant="secondary" onClick={closeModals}>Cancel</Button>
                      <Button variant="primary" onClick={handleUpdateComplaint} loading={isSubmitting}>Save Changes</Button>
                  </div>
              </div>
          </Modal>
      )}
    </div>
  );
};


const WarningLettersView: React.FC<{ userType: UserType, currentUserProfile?: UserProfile | null }> = ({ userType, currentUserProfile }) => {
    const [allLetters, setAllLetters] = useState<WarningLetter[]>([]);
    const [hiredCandidates, setHiredCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const [selectedLetter, setSelectedLetter] = useState<WarningLetter | null>(null);
    const letterContentRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        const unsubLetters = onWarningLettersChange(setAllLetters);
        const unsubCandidates = onCandidatesChange((allCandidates) => {
            setHiredCandidates(allCandidates.filter(c => c.status === 'Hired'));
        });
        
        Promise.all([new Promise(res => onValue(ref(getDatabase(), 'warning_letters'), res)), new Promise(res => onValue(ref(getDatabase(), 'candidates'), res))]).then(() => {
            setIsLoading(false);
        });

        return () => {
            unsubLetters();
            unsubCandidates();
        };
    }, []);

    const letters = useMemo(() => {
        if (userType === UserType.PARTNER) {
            const vendorName = currentUserProfile?.vendorName;
            if (!vendorName) return [];
            const partnerCandidateNames = new Set(hiredCandidates.filter(c => c.vendor === vendorName).map(c => c.name));
            return allLetters.filter(l => partnerCandidateNames.has(l.employeeName));
        }
        return allLetters;
    }, [allLetters, hiredCandidates, userType, currentUserProfile]);

    const stats = useMemo(() => ({
        total: letters.length,
        active: letters.filter(l => l.status === 'Active').length,
        resolved: letters.filter(l => l.status === 'Resolved').length,
    }), [letters]);

    const handleIssueLetter = async (data: Omit<WarningLetter, 'id' | 'ticketNo' | 'issueDate' | 'status'>) => {
        setIsSubmitting(true);
        try {
            await addWarningLetter(data);
            alert('Warning letter issued successfully!');
            setIsIssueModalOpen(false);
        } catch (error) {
            console.error(error);
            alert('Failed to issue warning letter.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResolveLetter = async (id: string) => {
        if (window.confirm('Are you sure you want to mark this warning as resolved?')) {
            try {
                await updateWarningLetter(id, { status: 'Resolved' });
            } catch (error) {
                console.error(error);
                alert('Failed to update status.');
            }
        }
    };
    
    const handleDownloadPdf = () => {
        if (!letterContentRef.current || !selectedLetter) return;
        setIsDownloading(true);
        const element = letterContentRef.current;
        const opt = { margin: [0.8, 0.8, 0.8, 0.8], filename: `Warning_Letter_${selectedLetter.employeeName.replace(/\s+/g, '_')}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas:  { scale: 2, useCORS: true, letterRendering: true }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } };
        html2pdf().from(element).set(opt).save().then(() => setIsDownloading(false));
    };

    const IssueLetterForm: React.FC<{ onSave: (data: any) => void; onCancel: () => void }> = ({ onSave, onCancel }) => {
        const [formData, setFormData] = useState({ employeeName: '', reason: 'Absenteeism', description: '' });
        
        const selectableCandidates = useMemo(() => {
            if (userType === UserType.PARTNER) {
                const vendorName = currentUserProfile?.vendorName;
                if (!vendorName) return [];
                return hiredCandidates.filter(c => c.vendor === vendorName);
            }
            return hiredCandidates;
        }, [hiredCandidates, userType, currentUserProfile]);

        const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
            setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
        };
        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSave({ ...formData, issuedBy: 'Admin' }); // Assume Admin is issuing
        };
        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                    <select id="employeeName" name="employeeName" value={formData.employeeName} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required>
                        <option value="">Select an employee</option>
                        {selectableCandidates.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason for Warning</label>
                  <select id="reason" name="reason" value={formData.reason} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required>
                    <option>Absenteeism</option><option>Performance Issue</option><option>Misconduct</option><option>Policy Violation</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Detailed Description of Incident</label>
                  <textarea id="description" name="description" rows={5} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={formData.description} onChange={handleChange} required></textarea>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" variant="primary" loading={isSubmitting}>Issue Letter</Button>
                </div>
            </form>
        );
    };

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Warning Letters</h2>
        <button onClick={() => setIsIssueModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110 2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
            Issue New Letter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"><h4 className="text-sm font-semibold text-gray-500 mb-1">Total Letters Issued</h4><p className="text-3xl font-bold text-gray-900">{stats.total}</p></div>
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"><h4 className="text-sm font-semibold text-gray-500 mb-1">Active Warnings</h4><p className="text-3xl font-bold text-red-600">{stats.active}</p></div>
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"><h4 className="text-sm font-semibold text-gray-500 mb-1">Resolved</h4><p className="text-3xl font-bold text-green-600">{stats.resolved}</p></div>
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
               {isLoading ? (<tr><td colSpan={6} className="px-6 py-24 text-center text-gray-500">Loading...</td></tr>) :
               letters.length === 0 ? (<tr><td colSpan={6} className="px-6 py-24 text-center text-gray-500">No warning letters issued.</td></tr>) : 
               (letters.map((item) => (
                      <tr key={item.id}>
                          <td className="px-6 py-4 text-sm font-medium text-indigo-600">{item.ticketNo}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-800">{item.employeeName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.reason}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{new Date(item.issueDate).toLocaleDateString()}</td>
                          <td className="px-6 py-4"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${item.status === 'Active' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{item.status}</span></td>
                          <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedLetter(item)}>View</Button>
                            {item.status === 'Active' && <Button variant="ghost" size="sm" onClick={() => handleResolveLetter(item.id)}>Mark as Resolved</Button>}
                          </td>
                      </tr>
                  )))}
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
                    <p className="mt-12 font-semibold">{selectedLetter.issuedBy}<br/>Management<br/>R.K.M ENTERPRISE</p>
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
    const [dailySubmissions, setDailySubmissions] = useState<DailyLineup[]>([]);
    const [newSelections, setNewSelections] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const currentDate = new Date().toLocaleDateString('en-GB');
    const isTeamLead = userType === UserType.TEAMLEAD || userType === UserType.TEAM;
    const myTeamMembers = ['Rahul', 'Sneha'];

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const today = new Date().toISOString().split('T')[0];
            const [allLineups, allCandidates] = await Promise.all([getDailyLineups(), getCandidates()]);
            
            const baseSubmissions = allLineups.filter(l => l.createdAt.startsWith(today));
            const baseSelections = allCandidates.filter(c => c.status === 'Selected' && c.date === today);

            setDailySubmissions(isTeamLead ? baseSubmissions.filter(s => myTeamMembers.includes(s.submittedBy)) : baseSubmissions);
            setNewSelections(isTeamLead ? baseSelections.filter(s => myTeamMembers.includes(s.recruiter)) : baseSelections);
            
            setIsLoading(false);
        };
        fetchData();
    }, [isTeamLead]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-[500px]">
        <div className="flex justify-between items-center mb-6">
            <div><h3 className="text-2xl font-bold text-gray-800">Daily Report View</h3>{isTeamLead && <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">My Team's Report</span>}</div>
            <button onClick={onBack} className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">Back to Reports</button>
        </div>
        {isLoading ? <div className="text-center p-12">Loading today's report...</div> : <>
            <div className="mb-8 border border-black">
                <div className="flex border-b border-black"><div className="w-48 p-2 font-bold text-lg border-r border-black bg-white flex items-center justify-center">{currentDate}</div><div className="flex-1 p-2 font-bold text-lg text-center bg-white flex items-center justify-center">Daily New Submissions</div></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-yellow-400 text-black font-bold border-b border-black"><tr><th className="p-2 border-r border-black text-center w-16">S. No.</th><th className="p-2 border-r border-black">Recruiter Name</th><th className="p-2 border-r border-black">Client Name</th><th className="p-2 border-r border-black">Position</th><th className="p-2 border-r border-black">Candidate Name</th><th className="p-2 border-r border-black">Mobile No</th><th className="p-2 border-r border-black">Location</th><th className="p-2 text-center">Status</th></tr></thead>
                        <tbody>
                            {dailySubmissions.length > 0 ? dailySubmissions.map((item, index) => (
                                <tr key={item.id}><td className="p-2 border-r border-gray-300 text-center">{index + 1}</td><td className="p-2 border-r border-gray-300">{item.submittedBy}</td><td className="p-2 border-r border-gray-300">{item.vendor}</td><td className="p-2 border-r border-gray-300">{item.role}</td><td className="p-2 border-r border-gray-300">{item.candidateName}</td><td className="p-2 border-r border-gray-300">{item.contact}</td><td className="p-2 border-r border-gray-300">{item.location}</td><td className="p-2 text-center font-medium">{item.callStatus}</td></tr>
                            )) : (<tr><td colSpan={8} className="p-4 text-center text-gray-500">No submissions found for today.</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="border border-black">
                <div className="p-2 font-bold text-lg text-center bg-white border-b border-black">New Selection Today</div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-yellow-400 text-black font-bold border-b border-black"><tr><th className="p-2 border-r border-black text-center w-16">S. No.</th><th className="p-2 border-r border-black">Recruiter Name</th><th className="p-2 border-r border-black">Client Name</th><th className="p-2 border-r border-black">Position</th><th className="p-2 border-r border-black">Candidate Name</th><th className="p-2 border-r border-black">Mobile No</th><th className="p-2 border-r border-black">Location</th><th className="p-2 text-center">Status</th></tr></thead>
                        <tbody>
                            {newSelections.length > 0 ? newSelections.map((item, index) => (
                                <tr key={item.id}><td className="p-2 border-r border-gray-300 text-center">{index + 1}</td><td className="p-2 border-r border-gray-300">{item.recruiter}</td><td className="p-2 border-r border-gray-300">{item.vendor}</td><td className="p-2 border-r border-gray-300">{item.role}</td><td className="p-2 border-r border-gray-300">{item.name}</td><td className="p-2 border-r border-gray-300">{item.phone}</td><td className="p-2 border-r border-gray-300">{item.storeName}</td><td className="p-2 text-center font-medium text-green-600">{item.status}</td></tr>
                            )) : (<tr><td colSpan={8} className="p-4 text-center text-gray-500">No new selections found for today.</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
        </>}
    </div>
  );
};

// FIX: Define UnifiedRequirement interface to resolve typing errors.
interface UnifiedRequirement {
    id: string;
    client: string;
    partner: string;
    role: string;
    total: number;
    pending: number;
    approved: number;
    location: string;
    store: string;
    team: string;
}

const BreakdownTable: React.FC<{ title: string; data: { name: string; total: number; pending: number; approved: number }[] }> = ({ title, data }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-4">
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


const PartnerRequirementsDetailView: React.FC<{ 
    onBack: () => void;
    jobs: Job[];
    allPartnerRequirements: (PartnerRequirement & { partnerUid: string })[];
    users: UserProfile[];
}> = ({ onBack, jobs, allPartnerRequirements, users }) => {
    
    const requirements = useMemo(() => {
        const userMap = new Map(users.map(u => [u.uid, u.partnerName || u.name]));

        // Static team assignment based on the partner providing the candidates.
        const teamMap: Record<string, string> = {
            'Organic Circle': 'Vikrant Singh',
            'Venus Food': 'Rohit Kumar',
        };

        // Process vendor jobs from the main job board
        const vendorJobs: UnifiedRequirement[] = jobs
            .filter(job => job.jobCategory !== 'Direct')
            .map(job => {
                const partnerName = job.company;
                return {
                    id: `job-${job.id}`,
                    client: job.jobCategory, // Brand name
                    partner: partnerName,
                    role: job.title,
                    total: job.numberOfOpenings,
                    // For jobs posted on the board, we assume they are approved and have 0 pending.
                    pending: 0, 
                    approved: job.numberOfOpenings,
                    location: job.jobCity,
                    store: job.storeName || job.locality,
                    team: teamMap[partnerName] || 'Unassigned',
                };
            });

        // Process requirements submitted by partners
        const partnerReqs: UnifiedRequirement[] = allPartnerRequirements.map(req => {
            const partnerName = userMap.get(req.partnerUid) || 'Unknown Partner';
            const isApproved = req.submissionStatus === 'Approved';
            return {
                id: `req-${req.id}`,
                client: req.client, // Brand name
                partner: partnerName,
                role: req.title,
                total: req.openings,
                pending: isApproved ? 0 : req.openings,
                approved: isApproved ? req.openings : 0,
                location: req.location,
                store: req.location, // No specific store data in partner req, so using location as a fallback
                team: teamMap[partnerName] || 'Unassigned',
            };
        });

        return [...vendorJobs, ...partnerReqs];
    }, [jobs, allPartnerRequirements, users]);


    const totalStats = requirements.reduce((acc, curr) => {
        acc.total += curr.total;
        acc.pending += curr.pending;
        acc.approved += curr.approved;
        return acc;
    }, { total: 0, pending: 0, approved: 0 });
    
    // Create breakdowns
    // FIX: Replaced the 'reduce' implementation with a more explicit for...of loop.
    // This avoids a potential complex type inference issue with 'reduce' that could lead to the "unknown index type" error.
    const createBreakdown = (data: UnifiedRequirement[], key: keyof UnifiedRequirement) => {
        const breakdown: Record<string, { total: number, pending: number, approved: number }> = {};
        for (const item of data) {
            const group = String(item[key] || 'N/A');
            if (!breakdown[group]) {
                breakdown[group] = { total: 0, pending: 0, approved: 0 };
            }
            breakdown[group].total += item.total;
            breakdown[group].pending += item.pending;
            breakdown[group].approved += item.approved;
        }
        return Object.entries(breakdown).map(([name, stats]) => ({ name, ...stats }));
    };

    const storeWise = createBreakdown(requirements, 'store');
    const locationWise = createBreakdown(requirements, 'location');
    const teamWise = createBreakdown(requirements, 'team');
    const roleWise = createBreakdown(requirements, 'role');
    const partnerWise = createBreakdown(requirements, 'partner');


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Requirements Breakdown</h2>
                <Button variant="secondary" onClick={onBack}>Back to Dashboard</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-500">Total Openings</h4>
                    <p className="text-3xl font-bold text-blue-600">{totalStats.total}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-500">Pending</h4>
                    <p className="text-3xl font-bold text-yellow-600">{totalStats.pending}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-500">Approved</h4>
                    <p className="text-3xl font-bold text-green-600">{totalStats.approved}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                 <h3 className="px-6 py-4 text-lg font-semibold text-gray-800 border-b">Detailed Breakdown by Client & Role</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client (Brand)</th>
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
                <BreakdownTable title="Team Wise" data={teamWise} />
                <BreakdownTable title="Partner Wise" data={partnerWise} />
                <BreakdownTable title="Store Wise" data={storeWise} />
                <BreakdownTable title="Location Wise" data={locationWise} />
                <BreakdownTable title="Role Wise" data={roleWise} />
            </div>
        </div>
    );
};

const ReportsView: React.FC<{ userType: UserType, currentUser?: AppUser | null }> = ({ userType, currentUser }) => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDailyReportView, setShowDailyReportView] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
  }, []);

  const reportTypes = [
    { id: 'daily_report', title: 'Daily Report', description: 'View and export daily submissions and selections.', icon: 'clipboard-list' },
    { id: 'lineup', title: 'Daily Lineup Report', description: 'Daily candidate submission and call status logs.', icon: 'clipboard' },
    { id: 'selection', title: 'Selection Pipeline', description: 'Candidates stage-wise status from Sourced to Selected.', icon: 'users' },
    { id: 'attendance', title: 'Attendance & Commission', description: 'Monthly attendance records and commission calculations.', icon: 'calendar' },
    { id: 'complaints', title: 'Complaints Log', description: 'Register of candidate grievances and resolutions.', icon: 'exclamation' },
    { id: 'warning', title: 'Warning Letters', description: 'History of disciplinary actions and warning letters.', icon: 'mail' },
    { id: 'performance', title: 'Recruiter Performance', description: 'Efficiency metrics for individual team members.', icon: 'chart' },
  ];

  const downloadCSV = (csvContent: string, fileName: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertToCSV = (data: any[], headers: string[]) => {
    const headerRow = headers.join(',');
    const rows = data.map(row => {
        return headers.map(header => {
            let value = row[header];
            if (value === null || value === undefined) {
                value = '';
            } else if (typeof value === 'object') {
                value = JSON.stringify(value);
            }
            const stringValue = String(value).replace(/"/g, '""');
            return `"${stringValue}"`;
        }).join(',');
    });
    return [headerRow, ...rows].join('\n');
  };

  const handleDownload = async () => {
    if (!selectedReport) { alert("Please select a report type."); return; }
    setIsDownloading(true);
    try {
        let csvContent = '';
        let fileName = `${selectedReport}_${new Date().toISOString().split('T')[0]}.csv`;

        const getFilteredDataByDate = async (fetchFunc: () => Promise<any[]>, dateField: string) => {
            let data = await fetchFunc();
            if (startDate) data = data.filter(item => new Date(item[dateField]) >= new Date(startDate));
            if (endDate) data = data.filter(item => new Date(item[dateField]) <= new Date(new Date(endDate).setHours(23, 59, 59, 999)));
            return data;
        };

        switch(selectedReport) {
            case 'lineup': {
                const lineups = await getFilteredDataByDate(getDailyLineups, 'createdAt');
                const headers: (keyof DailyLineup)[] = ['id', 'candidateName', 'contact', 'vendor', 'role', 'location', 'storeName', 'submittedBy', 'callStatus', 'interviewDateTime', 'createdAt'];
                csvContent = convertToCSV(lineups, headers);
                break;
            }
            case 'selection': {
                const candidates = await getFilteredDataByDate(getCandidates, 'date');
                const headers: (keyof Candidate)[] = ['id', 'name', 'phone', 'email', 'role', 'status', 'date', 'recruiter', 'vendor', 'storeName', 'quitDate'];
                csvContent = convertToCSV(candidates, headers);
                break;
            }
            case 'complaints': {
                const complaints = await getFilteredDataByDate(getComplaints, 'date');
                const headers: (keyof Complaint)[] = ['id', 'ticketNo', 'candidate', 'vendor', 'role', 'issue', 'status', 'date', 'assignedManager', 'resolution'];
                csvContent = convertToCSV(complaints, headers);
                break;
            }
            case 'warning': {
                const letters = await getFilteredDataByDate(getWarningLetters, 'issueDate');
                const headers: (keyof WarningLetter)[] = ['id', 'ticketNo', 'employeeName', 'reason', 'issueDate', 'issuedBy', 'status'];
                csvContent = convertToCSV(letters, headers);
                break;
            }
            case 'attendance': {
                const month = startDate.substring(0, 7);
                if (!month) { alert("Please select a valid date range for the attendance report."); break; }
                fileName = `attendance_${month}.csv`;
                const [attendanceData, candidates] = await Promise.all([getAttendanceForMonth(month), getCandidates()]);
                const candidateMap = new Map(candidates.map(c => [c.id, c]));
                const reportData = Object.entries(attendanceData).map(([employeeId, record]) => ({
                    employeeId, name: candidateMap.get(employeeId)?.name || 'Unknown', role: candidateMap.get(employeeId)?.role || 'Unknown', vendor: candidateMap.get(employeeId)?.vendor || 'Unknown', ...record
                }));
                const headers = ['employeeId', 'name', 'role', 'vendor', 'presentDays', 'totalDays', 'commission'];
                csvContent = convertToCSV(reportData, headers);
                break;
            }
             case 'performance': {
                const candidates = await getFilteredDataByDate(getCandidates, 'date');
                const performanceData: { [key: string]: TeamMemberPerformance } = {};
                candidates.forEach(c => {
                    if (!c.recruiter) return;
                    if (!performanceData[c.recruiter]) {
                        performanceData[c.recruiter] = { teamMember: c.recruiter, role: 'Recruiter', total: 0, selected: 0, pending: 0, rejected: 0, quit: 0, successRate: 0 };
                    }
                    const perf = performanceData[c.recruiter];
                    perf.total++;
                    if (c.status === 'Selected' || c.status === 'Hired') perf.selected++;
                    if (['Sourced', 'On the way', 'Interview', 'Offer Sent', 'Screening'].includes(c.status)) perf.pending++;
                    if (c.status === 'Rejected') perf.rejected++;
                    if (c.status === 'Quit') perf.quit++;
                });
                const reportData = Object.values(performanceData).map(perf => {
                    perf.successRate = perf.total > 0 ? (perf.selected / perf.total) * 100 : 0;
                    return perf;
                });
                const headers: (keyof TeamMemberPerformance)[] = ['teamMember', 'role', 'total', 'selected', 'pending', 'rejected', 'quit', 'successRate'];
                csvContent = convertToCSV(reportData, headers);
                break;
            }
            default: throw new Error("Invalid report type selected.");
        }
        
        if (csvContent) downloadCSV(csvContent, fileName);
        else alert("No data found for the selected criteria.");

    } catch (error) {
        console.error("Error generating report:", error);
        alert(`Failed to generate report. ${error}`);
    } finally {
        setIsDownloading(false);
    }
  };

  const handleReportSelect = (id: string) => setSelectedReport(id);

  if (showDailyReportView) return <DailyReportTemplate onBack={() => setShowDailyReportView(false)} userType={userType} currentUser={currentUser} />;

  return (
    <div className="space-y-6">
       <div><h2 className="text-3xl font-bold text-gray-800">Reports Center</h2><p className="text-gray-600 mt-1">Generate and download system-wide reports.</p></div>
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportTypes.map((report) => (
                    <div key={report.id} onClick={() => handleReportSelect(report.id)} className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedReport === report.id ? 'border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-500' : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'}`}>
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${selectedReport === report.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>{report.icon === 'clipboard-list' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}{report.icon === 'clipboard' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}{report.icon === 'users' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}{report.icon === 'calendar' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}{report.icon === 'exclamation' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}{report.icon === 'mail' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-9 13V3" /></svg>}{report.icon === 'chart' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}</div>
                            <div><h4 className={`font-semibold ${selectedReport === report.id ? 'text-blue-900' : 'text-gray-800'}`}>{report.title}</h4><p className="text-sm text-gray-500 mt-1">{report.description}</p></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Report Configuration</h3>
                {!selectedReport ? (
                    <div className="text-center py-8 text-gray-500"><svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg><p>Select a report type to configure details.</p></div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mb-4"><span className="text-xs font-bold text-blue-500 uppercase tracking-wide">Selected Report</span><p className="font-semibold text-blue-900">{reportTypes.find(r => r.id === selectedReport)?.title}</p></div>
                        {selectedReport === 'daily_report' ? (
                            <div className="space-y-4"><p className="text-sm text-gray-600">View the daily new submissions and selections in a standardized printable format.</p><button onClick={() => setShowDailyReportView(true)} className="w-full py-2.5 px-4 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700 shadow-md transition-all flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>View On Screen</button></div>
                        ) : (<>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label><div className="grid grid-cols-2 gap-2"><Input wrapperClassName="mb-0" type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} /><Input wrapperClassName="mb-0" type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} /></div></div>
                            <div className="pt-4 border-t border-gray-100"><button onClick={handleDownload} disabled={isDownloading} className={`w-full py-2.5 px-4 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all ${isDownloading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}`}>{isDownloading ? (<><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Generating...</>) : (<><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>Download Report</>)}</button></div>
                        </>)}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

// New Component for the tabbed Requirements Breakdown view
type BreakdownTab = 'Team Wise' | 'Partner Wise' | 'Store Wise' | 'Role Wise';

const RequirementsBreakdownView: React.FC<{
    jobs: Job[];
    allPartnerRequirements: (PartnerRequirement & { partnerUid: string })[];
    users: UserProfile[];
}> = ({ jobs, allPartnerRequirements, users }) => {
    const [activeTab, setActiveTab] = useState<BreakdownTab>('Partner Wise');
    
    const requirements = useMemo(() => {
        const userMap = new Map(users.map(u => [u.uid, u.partnerName || u.name]));
        const teamMap: Record<string, string> = { 'Organic Circle': 'Vikrant Singh', 'Venus Food': 'Rohit Kumar' };
        const vendorJobs: UnifiedRequirement[] = jobs
            .filter(job => job.jobCategory !== 'Direct')
            .map(job => {
                const partnerName = job.company;
                return {
                    id: `job-${job.id}`, client: job.jobCategory, partner: partnerName, role: job.title,
                    total: job.numberOfOpenings, pending: 0, approved: job.numberOfOpenings,
                    location: job.jobCity, store: job.storeName || job.locality, team: teamMap[partnerName] || 'Unassigned',
                };
            });
        const partnerReqs: UnifiedRequirement[] = allPartnerRequirements.map(req => {
            const partnerName = userMap.get(req.partnerUid) || 'Unknown Partner';
            const isApproved = req.submissionStatus === 'Approved';
            return {
                id: `req-${req.id}`, client: req.client, partner: partnerName, role: req.title,
                total: req.openings, pending: isApproved ? 0 : req.openings, approved: isApproved ? req.openings : 0,
                location: req.location, store: req.location, team: teamMap[partnerName] || 'Unassigned',
            };
        });
        return [...vendorJobs, ...partnerReqs];
    }, [jobs, allPartnerRequirements, users]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Partner Wise':
                return (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-4">
                        <h3 className="px-6 py-4 text-lg font-semibold text-gray-800 border-b">Partner Wise</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['BRAND', 'PARTNER', 'LOCATION', 'ROLE', 'STORE', 'TOTAL OPENINGS', 'PENDING', 'APPROVED'].map(h => (
                                            <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {requirements.map(req => (
                                        <tr key={req.id}>
                                            <td className="px-6 py-4 font-semibold text-gray-900">{req.client}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{req.partner}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{req.location}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{req.role}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{req.store}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800 text-center">{req.total}</td>
                                            <td className="px-6 py-4 text-sm text-yellow-700 text-center">{req.pending}</td>
                                            <td className="px-6 py-4 text-sm text-green-700 text-center">{req.approved}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'Team Wise': {
                 const sortedByTeam = [...requirements].sort((a, b) => a.team.localeCompare(b.team));
                 return (
                     <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-4">
                        <h3 className="px-6 py-4 text-lg font-semibold text-gray-800 border-b">Team Wise</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['TEAM', 'BRAND', 'PARTNER', 'LOCATION', 'ROLE', 'STORE', 'TOTAL OPENINGS', 'PENDING', 'APPROVED'].map(h => (
                                            <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sortedByTeam.map(req => (
                                        <tr key={req.id}>
                                            <td className="px-6 py-4 font-semibold text-gray-900">{req.team}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{req.client}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{req.partner}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{req.location}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{req.role}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{req.store}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800 text-center">{req.total}</td>
                                            <td className="px-6 py-4 text-sm text-yellow-700 text-center">{req.pending}</td>
                                            <td className="px-6 py-4 text-sm text-green-700 text-center">{req.approved}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )};
            case 'Store Wise': {
                const sortedByStore = [...requirements].sort((a, b) => a.store.localeCompare(b.store));
                return (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-4">
                        <h3 className="px-6 py-4 text-lg font-semibold text-gray-800 border-b">Store Wise</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['STORE', 'BRAND', 'PARTNER', 'LOCATION', 'ROLE', 'TOTAL OPENINGS', 'PENDING', 'APPROVED'].map(h => (
                                            <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sortedByStore.map(req => (
                                        <tr key={req.id}>
                                            <td className="px-6 py-4 font-semibold text-gray-900">{req.store}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{req.client}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{req.partner}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{req.location}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{req.role}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800 text-center">{req.total}</td>
                                            <td className="px-6 py-4 text-sm text-yellow-700 text-center">{req.pending}</td>
                                            <td className="px-6 py-4 text-sm text-green-700 text-center">{req.approved}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            }
            case 'Role Wise': {
                const sortedByRole = [...requirements].sort((a, b) => a.role.localeCompare(b.role));
                return (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-4">
                        <h3 className="px-6 py-4 text-lg font-semibold text-gray-800 border-b">Role Wise</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['ROLE', 'BRAND', 'PARTNER', 'LOCATION', 'STORE', 'TOTAL OPENINGS', 'PENDING', 'APPROVED'].map(h => (
                                            <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sortedByRole.map(req => (
                                        <tr key={req.id}>
                                            <td className="px-6 py-4 font-semibold text-gray-900">{req.role}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{req.client}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{req.partner}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{req.location}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{req.store}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800 text-center">{req.total}</td>
                                            <td className="px-6 py-4 text-sm text-yellow-700 text-center">{req.pending}</td>
                                            <td className="px-6 py-4 text-sm text-green-700 text-center">{req.approved}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            }
            default: return null;
        }
    };
    
    const tabs: BreakdownTab[] = ['Team Wise', 'Partner Wise', 'Store Wise', 'Role Wise'];

    return (
        <div>
            <div className="flex items-center gap-2">
                {tabs.map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                            activeTab === tab 
                                ? 'bg-yellow-400 text-black shadow-sm' 
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            {renderTabContent()}
        </div>
    );
};


// FIX: Add missing VendorDirectoryView component
const VendorDirectoryView: React.FC<{
    vendors: any[];
    setVendors: React.Dispatch<React.SetStateAction<any[]>>;
    isLoading: boolean;
    panelConfig: PanelConfig | null;
}> = ({ vendors, setVendors, isLoading, panelConfig }) => {
    const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleAddVendor = async (vendorData: any) => {
        setIsSubmitting(true);
        try {
            const newVendor = await createVendor(vendorData);
            setVendors(prev => [...prev, newVendor]);
            setIsVendorModalOpen(false);
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : "Failed to add vendor.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const filteredVendors = useMemo(() => {
        if (!searchTerm) return vendors;
        return vendors.filter(vendor => 
            (vendor.brandName && vendor.brandName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (vendor.partnerName && vendor.partnerName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [vendors, searchTerm]);


    const VendorForm: React.FC<{ onSave: (data: any) => void; onClose: () => void; panelConfig: PanelConfig | null; isSubmitting: boolean; }> = ({ onSave, onClose, panelConfig, isSubmitting }) => {
        const [formData, setFormData] = useState({
            brandName: '',
            partnerName: '',
            fullAddress: '',
            email: '',
            phoneNumber: '',
            operationalLocations: [] as string[],
            jobRoles: [] as string[],
            commissionStructure: {
                type: 'Percentage Based',
                percentage: ''
            },
            termsAndConditions: '',
        });
    
        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            if (name === 'commissionType') {
                setFormData(prev => ({ ...prev, commissionStructure: { ...prev.commissionStructure, type: value } }));
            } else if (name === 'commissionPercentage') {
                setFormData(prev => ({ ...prev, commissionStructure: { ...prev.commissionStructure, percentage: value } }));
            }
            else {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        };
    
        const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            const { name, options } = e.target;
            const value: string[] = [];
            for (let i = 0, l = options.length; i < l; i++) {
                if (options[i].selected) {
                    value.push(options[i].value);
                }
            }
            setFormData(prev => ({ ...prev, [name]: value as any[] }));
        };
    
        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            // Rename for firebase compatibility with old structure
            const dataToSave = {
                ...formData,
                roles: formData.jobRoles,
                locations: formData.operationalLocations
            };
            delete (dataToSave as any).jobRoles;
            delete (dataToSave as any).operationalLocations;
            onSave(dataToSave);
        }
    
        return (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input id="brandName" name="brandName" label="Brand Name" value={formData.brandName} onChange={handleChange} placeholder="e.g., Blinkit" required />
                    <Input id="partnerName" name="partnerName" label="Partner Name" value={formData.partnerName} onChange={handleChange} placeholder="e.g., John Doe" required />
                </div>
    
                <div>
                    <label htmlFor="fullAddress" className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                    <textarea id="fullAddress" name="fullAddress" value={formData.fullAddress} onChange={handleChange} rows={2} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Enter full address"></textarea>
                </div>
    
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input id="email" name="email" label="Email Address" type="email" value={formData.email} onChange={handleChange} placeholder="contact@vendor.com" required />
                    <Input id="phoneNumber" name="phoneNumber" label="Phone Number" type="tel" value={formData.phoneNumber} onChange={handleChange} placeholder="+91 98765 43210" required />
                </div>
    
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label htmlFor="operationalLocations" className="block text-sm font-medium text-gray-700 mb-1">Operational Locations</label>
                        <select multiple id="operationalLocations" name="operationalLocations" value={formData.operationalLocations} onChange={handleMultiSelectChange} className="block w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            {(panelConfig?.locations || []).map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
                         <p className="text-xs text-gray-500 mt-1">Hold Ctrl (or Cmd on Mac) to select multiple.</p>
                    </div>
                     <div>
                        <label htmlFor="jobRoles" className="block text-sm font-medium text-gray-700 mb-1">Job Roles</label>
                        <select multiple id="jobRoles" name="jobRoles" value={formData.jobRoles} onChange={handleMultiSelectChange} className="block w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            {(panelConfig?.jobRoles || []).map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Hold Ctrl (or Cmd on Mac) to select multiple.</p>
                    </div>
                </div>
                
                <fieldset className="border p-4 rounded-md">
                    <legend className="font-medium text-sm px-2 text-gray-800">Commission Structure</legend>
                    <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-x-6">
                             <label className="text-sm font-medium text-gray-900">Structure Type</label>
                            <div className="flex items-center gap-x-4">
                                {['Percentage Based', 'Slab Based', 'Attendance Based'].map(type => (
                                    <label key={type} className="flex items-center text-sm">
                                        <input type="radio" name="commissionType" value={type} checked={formData.commissionStructure.type === type} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                        <span className="ml-2 text-gray-700">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        {formData.commissionStructure.type === 'Percentage Based' && (
                            <div>
                                 <Input id="commissionPercentage" name="commissionPercentage" label="Percentage (%)" type="number" value={formData.commissionStructure.percentage} onChange={handleChange} placeholder="e.g., 10" wrapperClassName="max-w-xs" />
                            </div>
                        )}
                    </div>
                </fieldset>
    
                 <div>
                    <label htmlFor="termsAndConditions" className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                    <textarea id="termsAndConditions" name="termsAndConditions" value={formData.termsAndConditions} onChange={handleChange} rows={3} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Enter any terms and conditions for this vendor..."></textarea>
                </div>
    
    
                <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary" loading={isSubmitting}>Add Vendor</Button>
                </div>
            </form>
        );
    };


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-3xl font-bold text-gray-800">Vendor Directory</h2>
                <Button onClick={() => setIsVendorModalOpen(true)}>+ Add New Vendor</Button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <Input 
                    id="vendor-search" 
                    placeholder="Search by brand or partner name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    wrapperClassName="mb-0"
                />
            </div>

            {isLoading ? (
                <div className="text-center py-10 text-gray-500">Loading vendors...</div>
            ) : filteredVendors.length === 0 ? (
                <div className="bg-white text-center py-12 rounded-xl border border-gray-200 text-gray-500">
                    {searchTerm ? `No vendors found for "${searchTerm}".` : "No vendors have been added yet."}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVendors.map(vendor => (
                        <div key={vendor.id} className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col p-6 hover:shadow-lg transition-shadow duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{vendor.brandName}</h3>
                                    <p className="text-sm text-gray-500">{vendor.partnerName}</p>
                                </div>
                                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                            </div>

                            <div className="space-y-3 text-sm flex-grow">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    <span className="truncate">{vendor.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    <span>{vendor.phoneNumber || 'N/A'}</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-xs text-gray-500 uppercase mt-4 mb-2">Roles</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(vendor.roles || []).map((role: string) => (
                                            <span key={role} className="bg-blue-50 text-blue-700 px-2 py-0.5 text-xs rounded-md">{role}</span>
                                        ))}
                                         {(vendor.roles || []).length === 0 && <span className="text-xs text-gray-400">No roles specified</span>}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-xs text-gray-500 uppercase mt-3 mb-2">Locations</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(vendor.locations || []).map((loc: string) => (
                                            <span key={loc} className="bg-gray-100 text-gray-700 px-2 py-0.5 text-xs rounded-md">{loc}</span>
                                        ))}
                                        {(vendor.locations || []).length === 0 && <span className="text-xs text-gray-400">No locations specified</span>}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => alert(`Viewing details for ${vendor.brandName}`)}>View Details</Button>
                                <Button variant="secondary" size="sm" onClick={() => alert(`Editing ${vendor.brandName}`)}>Edit</Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={isVendorModalOpen} onClose={() => setIsVendorModalOpen(false)} title="Add New Vendor" maxWidth="max-w-4xl">
                <VendorForm onSave={handleAddVendor} onClose={() => setIsVendorModalOpen(false)} panelConfig={panelConfig} isSubmitting={isSubmitting} />
            </Modal>
        </div>
    );
};

// FIX: Add missing DemoRequestsView component
const DemoRequestsView: React.FC = () => {
    const [requests, setRequests] = useState<DemoRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const unsubscribe = onDemoRequestsChange((data) => {
            setRequests(data);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Demo Requests</h2>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team Head / Size</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (<tr><td colSpan={4} className="text-center py-10">Loading requests...</td></tr>) :
                            requests.length === 0 ? (<tr><td colSpan={4} className="text-center py-10">No demo requests found.</td></tr>) :
                                requests.map(req => (
                                    <tr key={req.id}>
                                        <td className="px-6 py-4 font-medium">{req.companyName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{req.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{req.teamHead} ({req.teamSize})</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(req.requestDate).toLocaleString()}</td>
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// FIX: Add missing RevenueView component
const RevenueView: React.FC = () => {
    const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    });

    useEffect(() => {
        const fetchRevenue = async () => {
            setIsLoading(true);
            const data = await getRevenueData(selectedMonth);
            setRevenueData(data);
            setIsLoading(false);
        };
        fetchRevenue();
    }, [selectedMonth]);

    const formatCurrency = (val: number) => `₹${(val / 100000).toFixed(2)}L`;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Revenue Dashboard</h2>
                <Input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} wrapperClassName="mb-0 w-48" />
            </div>
            {isLoading ? <div className="text-center py-10">Loading revenue data...</div> :
                !revenueData ? <div className="text-center py-10 bg-white rounded-lg">No data found for {selectedMonth}.</div> :
                    (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-lg shadow-sm border"><h4 className="text-sm font-medium text-gray-500">Total Revenue</h4><p className="text-3xl font-bold text-green-600 mt-1">{formatCurrency(revenueData.totalRevenue)}</p></div>
                                <div className="bg-white p-6 rounded-lg shadow-sm border"><h4 className="text-sm font-medium text-gray-500">Total Cost</h4><p className="text-3xl font-bold text-red-600 mt-1">{formatCurrency(revenueData.totalCost)}</p></div>
                                <div className="bg-white p-6 rounded-lg shadow-sm border"><h4 className="text-sm font-medium text-gray-500">Net Profit</h4><p className="text-3xl font-bold text-blue-600 mt-1">{formatCurrency(revenueData.totalRevenue - revenueData.totalCost)}</p></div>
                            </div>
                            {/* More detailed tables for team and client profitability would go here */}
                        </div>
                    )
            }
        </div>
    );
};

const AdminDashboardContent: React.FC<AdminDashboardContentProps> = ({
  userType,
  jobs,
  onAddJob,
  onUpdateJob,
  onDeleteJob,
  pipelineStats,
  vendorStats,
  complaintStats,
  partnerRequirementStats,
  candidatesByProcess,
  candidatesByRole,
  teamPerformance,
  activeAdminMenuItem,
  onAdminMenuItemClick,
  branding,
  onUpdateBranding,
  currentUser,
  currentUserProfile,
  currentLogoSrc,
  onLogoUpload,
}) => {
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [panelConfig, setPanelConfig] = useState<PanelConfig | null>(null);
  const [isFetchingConfig, setIsFetchingConfig] = useState(true);
  const [allPartnerRequirements, setAllPartnerRequirements] = useState<(PartnerRequirement & { partnerUid: string })[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const fetchData = async () => {
        setIsFetchingConfig(true);
        const [fetchedVendors, fetchedConfig, fetchedUsers] = await Promise.all([getVendors(), getPanelConfig(), getUsers()]);
        setVendors(fetchedVendors);
        setPanelConfig(fetchedConfig);
        setUsers(fetchedUsers);
        setIsFetchingConfig(false);
    };
    fetchData();

    const unsubscribeReqs = onAllPartnerRequirementsChange(setAllPartnerRequirements);

    return () => {
        unsubscribeReqs();
    };
  }, []);

  const handleUpdatePanelConfig = async (newConfig: PanelConfig) => {
    try {
        await updatePanelConfig(newConfig);
        setPanelConfig(newConfig); // Update local state
    } catch (error) {
        console.error("Failed to update panel config:", error);
        alert("There was an error saving the panel options.");
    }
  };


  const renderContent = () => {
    switch (activeAdminMenuItem) {
      case AdminMenuItem.Dashboard:
        if (userType === UserType.ADMIN) {
          return (
            <div className="space-y-6">
               {/* 1. Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Candidate Pipeline" 
                  metrics={[
                    { label: 'Active', value: pipelineStats.active, color: 'text-blue-600' },
                    { label: 'Interview', value: pipelineStats.interview, color: 'text-purple-600' },
                    { label: 'Rejected', value: pipelineStats.rejected, color: 'text-red-600' },
                    { label: 'Quit', value: pipelineStats.quit, color: 'text-gray-800' }
                  ]}
                />
                <StatCard title="Vendors" metrics={[ { label: 'Total', value: vendorStats.total }, { label: 'Active', value: vendorStats.total }, { label: 'Inactive', value: 0 } ]} isSplitMetrics />
                <StatCard title="Complaints" value={complaintStats.active + complaintStats.closed} valueColor="text-red-500" metrics={[ { label: 'Active', value: complaintStats.active, color: 'text-red-500' }, { label: 'Closed', value: complaintStats.closed, color: 'text-green-500' } ]} />
                <StatCard title="Partner Requirements" value={partnerRequirementStats.total} valueColor="text-purple-500" metrics={[ { label: 'Pending', value: partnerRequirementStats.pending, color: 'text-yellow-500' }, { label: 'Approved', value: partnerRequirementStats.approved, color: 'text-green-500' }]} />
              </div>
              
              {/* 2. Progress Bars */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProgressBarCard title="Candidates by Process" data={candidatesByProcess} />
                <ProgressBarCard title="Candidates by Role" data={candidatesByRole} />
              </div>

              {/* 3. HR Updates */}
              <HRUpdatesCard />

              {/* 4. Requirements Breakdown */}
              <RequirementsBreakdownView 
                jobs={jobs}
                allPartnerRequirements={allPartnerRequirements}
                users={users}
              />

              {/* 5. Team Performance */}
              <TeamPerformanceTable data={teamPerformance} />
            </div>
          );
        }
        if (userType === UserType.HR) {
            return <HRDashboardView onNavigate={onAdminMenuItemClick} />
        }
        if (userType === UserType.PARTNER) {
            // These would be fetched live for the partner
            const activeCandidatesCount = 12;
            const pendingInvoicesCount = 2;
            const supervisorsCount = 3;

            return <PartnerDashboardView 
                onNavigate={onAdminMenuItemClick} 
                partnerRequirementStats={partnerRequirementStats}
                activeCandidatesCount={activeCandidatesCount}
                pendingInvoicesCount={pendingInvoicesCount}
                supervisorsCount={supervisorsCount}
            />
        }
        return <div>Team Dashboard Coming Soon...</div>;
      
      case AdminMenuItem.ManageJobBoard:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Manage Job Board</h2>
                <Button onClick={() => setIsJobModalOpen(true)}>Post New Job</Button>
            </div>
            <JobList jobs={jobs} currentUserType={userType} onDeleteJob={onDeleteJob} />
            <Modal isOpen={isJobModalOpen} onClose={() => setIsJobModalOpen(false)} title="Post New Job" maxWidth="max-w-4xl">
                <JobPostingForm onAddJob={onAddJob} isModalMode={true} onClose={() => setIsJobModalOpen(false)} vendors={vendors} panelConfig={panelConfig} />
            </Modal>
          </div>
        );

      // --- NEWLY ADDED VIEWS ---
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
        return <ReportsView userType={userType} currentUser={currentUser}/>;
      case AdminMenuItem.VendorDirectory:
        return <VendorDirectoryView vendors={vendors} setVendors={setVendors} isLoading={isFetchingConfig} panelConfig={panelConfig}/>;
      case AdminMenuItem.DemoRequests:
        return <DemoRequestsView />;
      case AdminMenuItem.Revenue:
        return <RevenueView />;
      
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

      // --- HR VIEWS ---
      case AdminMenuItem.ManagePayroll: return <ManagePayrollView />;
      case AdminMenuItem.GenerateOfferLetter: return <GenerateOfferLetterView />;
      case AdminMenuItem.CTCGenerate: return <CTCGeneratorView />;
      case AdminMenuItem.Payslips: return <PayslipsView />;
      case AdminMenuItem.EmployeeManagement: return <EmployeeManagementView />;

      // --- PARTNER VIEWS ---
      case AdminMenuItem.PartnerActiveCandidates: return <PartnerActiveCandidatesView currentUserProfile={currentUserProfile} />;
      case AdminMenuItem.ManageSupervisors: return <PartnerManageSupervisorsView />;
      case AdminMenuItem.PartnerUpdateStatus: return <PartnerUpdateStatusView />;
      case AdminMenuItem.PartnerRequirements: return <PartnerRequirementsView currentUser={currentUser} currentUserProfile={currentUserProfile} jobs={jobs} />;
      case AdminMenuItem.PartnerRequirementsDetail: return <PartnerRequirementsDetailView onBack={() => onAdminMenuItemClick(AdminMenuItem.Dashboard)} jobs={jobs} allPartnerRequirements={allPartnerRequirements} users={users} />;
      case AdminMenuItem.PartnerInvoices: return <PartnerInvoicesView currentUser={currentUser} />;
      case AdminMenuItem.PartnerSalaryUpdates: return <PartnerSalaryUpdatesView currentUser={currentUser} />;
      case AdminMenuItem.PartnerHelpCenter: return <HelpCenterView />;
      
      // --- SUPERVISOR VIEWS ---
      case AdminMenuItem.SupervisorDashboard: return <SupervisorDashboardView />;
      case AdminMenuItem.StoreAttendance: return <StoreAttendanceView currentUserProfile={currentUserProfile} />;
      case AdminMenuItem.StoreEmployees: return <StoreEmployeesView />;
        
      default:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold">{activeAdminMenuItem}</h3>
            <p>This page is under construction.</p>
          </div>
        );
    }
  };

  return <div className="space-y-6 animate-fade-in">{renderContent()}</div>;
};

export default AdminDashboardContent;
