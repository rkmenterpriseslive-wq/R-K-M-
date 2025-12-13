
import React from 'react';

export enum UserType {
  CANDIDATE = 'CANDIDATE',
  PARTNER = 'PARTNER',
  TEAM = 'TEAM',
  ADMIN = 'ADMIN',
  HR = 'HR',
  TEAMLEAD = 'TEAMLEAD', // New UserType
  STORE_SUPERVISOR = 'STORE_SUPERVISOR',
  NONE = 'NONE', // For unauthenticated state
}

export interface Job {
  id: string;
  title: string;
  company: string;
  storeName?: string;
  description: string;
  postedDate: string;
  adminId: string;
  experienceLevel: string;
  salaryRange: string;
  numberOfOpenings: number;
  companyLogoSrc?: string;

  // New detailed fields
  jobCategory: string;
  jobCity: string;
  locality: string;
  minQualification: string;
  genderPreference: string;
  jobType: string;
  workLocationType: string;
  workingDays: string;
  jobShift: string;
  interviewAddress: string;
  salaryType: string; // 'Fixed' or 'Fixed + Incentive'
  incentive?: string;
}

// Updated User interface to reflect App User properties
export interface AppUser {
  uid: string;
  email: string | null;
  userType: UserType; // Determined by app logic
}

// New Employee Interface
export interface Employee {
  id: string; // Unique ID, can be from auth or generated
  name: string;
  email: string;
  phone: string;
  role: string; // Job Title/Designation
  vendor: string;
  status: 'Active' | 'Inactive' | 'Onboarding';
  
  // Personal Details
  dateOfJoining: string;
  address: string;

  // Bank Details
  bankName: string;
  accountNumber: string;
  ifscCode: string;

  // Statutory Details
  panNumber: string;
  aadhaarNumber: string;

  // Salary
  grossSalary: number;

  // Onboarding fields
  onboardingStatus?: 'Pending Submission' | 'Pending Verification' | 'Onboarding Complete';
  esiCardFileName?: string | null;
}


export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface HeaderProps {
  userType: UserType;
  onLoginSelect: (type: UserType) => void;
  onLogout: () => void;
  onHireUsClick: () => void; // Re-added prop for "Hire us" button
  logoSrc: string | null; // New prop for logo source
}

// New interfaces for Admin Dashboard data
export interface CandidatePipelineStats {
  active: number;
  interview: number;
  rejected: number;
  quit: number;
}

export interface VendorStats {
  total: number;
}

export interface ComplaintStats {
  active: number;
  closed: number;
}

// New interface for Partner Requirement stats
export interface PartnerRequirementStats {
  total: number;
  pending: number;
  approved: number;
}


export interface ProcessMetric {
  name: string;
  count: number;
  color: string;
}

export interface RoleMetric {
  name: string;
  count: number;
  color: string;
}

export interface TeamMemberPerformance {
  teamMember: string;
  total: number;
  selected: number;
  pending: number;
  rejected: number;
  quit: number;
  successRate: number; // Stored as a percentage (e.g., 75 for 75%)
}

// Admin menu items for navigation
export enum AdminMenuItem {
  Dashboard = 'Dashboard',
  DailyLineups = 'Daily Lineups',
  SelectionDashboard = 'Selection Dashboard',
  AllCandidates = 'All Candidates',
  Attendance = 'Attendance',
  Complaints = 'Complaints',
  WarningLetters = 'Warning Letters',
  Reports = 'Reports',
  ManageJobBoard = 'Manage Job Board',
  VendorDirectory = 'Vendor Directory',
  DemoRequests = 'Demo Requests',
  Revenue = 'Revenue',
  Settings = 'Settings',
  // New HR items
  ManagePayroll = 'Manage Payroll',
  GenerateOfferLetter = 'Generate Offer Letter',
  CTCGenerate = 'CTC Generate',
  Payslips = 'Payslips',
  EmployeeManagement = 'Employee Management',
  MyProfile = 'My Profile',
  // New Partner items
  PartnerUpdateStatus = 'Partner Update Status',
  PartnerActiveCandidates = 'Partner Active Candidates',
  ManageSupervisors = 'Manage Supervisors',
  PartnerRequirements = 'Partner Requirements',
  PartnerInvoices = 'Partner Invoices',
  PartnerHelpCenter = 'Partner Help Center',
  PartnerSalaryUpdates = 'Salary Updates',
  PartnerRequirementsDetail = 'Partner Requirements Breakdown',
  // New Supervisor Items
  SupervisorDashboard = 'Supervisor Dashboard',
  StoreAttendance = 'Store Attendance',
  StoreEmployees = 'Store Employees',
}

// New enum for Candidate panel
export enum CandidateMenuItem {
  ApplyJobs = 'Apply Jobs',
  MyDocuments = 'My Documents',
  MyProfile = 'My Profile',
  CVGenerator = 'CV Generator',
  MyPayslips = 'My Payslips',
  MyAttendance = 'My Attendance',
  MyInterviews = 'My Interviews',
  CompanyDocuments = 'Company Documents',
  Resign = 'Resign',
  HelpCenter = 'Help Center',
}

// New PartnerCandidate interface
export interface PartnerCandidate {
  id: string;
  name: string;
  client: string;
  role: string;
  submittedDate: string;
  status: 'Sourced' | 'Screening' | 'Interview' | 'Offer Sent' | 'Selected' | 'Rejected';
}

// New types for Partner Update Status page
export type PartnerUpdateStatus =
  | 'Pending'
  | 'Contacted - Interested'
  | 'Contacted - Not Interested'
  | 'Interview Scheduled'
  | 'Interview Attended'
  | 'Offer Accepted'
  | 'Offer Rejected'
  | 'Joined'
  | 'Absconded';

export interface PartnerUpdatableCandidate {
  id: string;
  name: string;
  client: string;
  role: string;
  phone: string;
  status: PartnerUpdateStatus;
  lastUpdated: string; // ISO string date
  remarks?: string;
  vendor?: string;
}

// New PartnerRequirement interface
export interface PartnerRequirement {
  id: string;
  title: string;
  client: string;
  location: string;
  openings: number;
  salary: string;
  experience: string;
  postedDate: string;
  description: string;
  jobType: string;
  workingDays: string;
  jobShift: string;
  isNew?: boolean;
  submissionStatus?: 'Pending Review' | 'Approved' | 'Rejected';
}

// New PartnerInvoice interface
export interface PartnerInvoice {
  id: string;
  clientName: string;
  billedDate: string;
  dueDate: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subTotal: number;
  tax: number;
  total: number;
}

// New PartnerSalaryUpdate interface
export interface PartnerSalaryUpdate {
  id: string;
  candidateName: string;
  client: string;
  role: string;
  joiningDate: string;
  annualCTC: number;
  monthlyNetSalary: number;
  status: 'Pending' | 'Confirmed' | 'Discrepancy Reported';
}

// New StoreSupervisor interface
export interface StoreSupervisor {
  id: string;
  name: string;
  email: string;
  phone: string;
  storeLocation: string;
  status: 'Active' | 'Inactive';
}

// New Complaint Interface
export interface Complaint {
  ticketNo: string;
  candidate: string;
  vendor: string;
  role: string;
  issue: string;
  description?: string;
  status: 'Active' | 'Closed';
  date: string;
  manager: string;
}

// New WarningLetter Interface
export interface WarningLetter {
  ticketNo: string;
  employeeName: string;
  reason: string;
  description: string;
  issueDate: string;
  issuedBy: string;
  status: 'Active' | 'Resolved';
}

// New FamilyMember interface for My Documents page
export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  dob: string; // YYYY-MM-DD
  // New fields for document uploads
  aadharFileName: string | null;
  photoFileName: string | null;
}

// New Interview Interface
export interface Interview {
  id: string;
  jobTitle: string;
  company: string;
  round: string;
  date: string; // ISO string for date
  time: string; // e.g., "11:00 AM"
  type: 'Online' | 'In-Person';
  locationOrLink: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
}

// New interface for company-issued documents
export interface CompanyDocument {
  id: string;
  name: string;
  type: 'Offer Letter' | 'Warning Letter' | 'Relieving Letter' | 'Experience Letter' | 'Other';
  issueDate: string; // ISO string
  description?: string;
}


// Branding Configuration Interfaces
export interface BannerConfig {
  title: string;
  description: string;
  link: string;
  backgroundImage?: string | null;
}

export interface BrandingConfig {
  portalName: string;
  hireTalent: BannerConfig;
  becomePartner: BannerConfig;
}

// NEW PANEL CONFIG TYPES
export interface Store {
  id: string;
  name: string;
  location: string;
}

export interface PanelConfig {
  jobRoles: string[];
  locations: string[];
  stores: Store[];
}


export interface HomePageProps {
  jobs: Job[];
  onApplyNow: (job: Job) => void;
  currentUserType: UserType; // Added for banner logic
  onLoginSelect: (type: UserType) => void; // Added for banner login prompt
  onNavigateToAdminJobBoard: () => void; // Added for banner navigation
  branding: BrandingConfig; // Added branding config
}

export interface DashboardProps { // Updated DashboardProps to match App.tsx and AdminLayout
  userType: UserType;
  jobs: Job[];
  onAddJob: (job: Omit<Job, 'id' | 'postedDate' | 'adminId'>) => void;
  onUpdateJob: (job: Job) => void;
  onDeleteJob: (id: string) => void;
  currentLogoSrc: string | null;
  onLogoUpload: (base64Image: string) => void;
  // New props for admin dashboard data
  pipelineStats: CandidatePipelineStats;
  vendorStats: VendorStats;
  complaintStats: ComplaintStats;
  partnerRequirementStats: PartnerRequirementStats; // Added prop
  candidatesByProcess: ProcessMetric[];
  candidatesByRole: RoleMetric[];
  teamPerformance: TeamMemberPerformance[];
  activeAdminMenuItem: AdminMenuItem; // Pass active menu item to AdminLayout
  onAdminMenuItemClick: (item: AdminMenuItem) => void; // Pass handler to AdminLayout
  onLogout: () => void; // Added onLogout to prop interface
  branding: BrandingConfig; // Added branding config
  onUpdateBranding: (branding: BrandingConfig) => void; // Added branding update handler
  currentUser?: AppUser | null; // Added currentUser prop
  // New props for candidate
  activeCandidateMenuItem: CandidateMenuItem;
  onCandidateMenuItemClick: (item: CandidateMenuItem) => void;
  onApplyNow: (job: Job) => void;
}

export interface AdminLayoutProps {
  children: React.ReactNode;
  userType: UserType; // Added userType to determine header title
  currentLogoSrc: string | null;
  onLogoUpload: (base64Image: string) => void;
  onLogout: () => void;
  activeAdminMenuItem: AdminMenuItem; // New prop for active menu item
  onAdminMenuItemClick: (item: AdminMenuItem) => void; // New prop for menu item click handler
}

export interface SidebarProps {
  activeItem: AdminMenuItem; // Now controlled by parent
  onItemClick: (item: AdminMenuItem) => void; // New prop for click handler
  userType: UserType; // Added userType to filter menu items
}

export interface AdminDashboardContentProps {
  pipelineStats: CandidatePipelineStats;
  vendorStats: VendorStats;
  complaintStats: ComplaintStats;
  partnerRequirementStats: PartnerRequirementStats; // Added prop
  candidatesByProcess: ProcessMetric[];
  candidatesByRole: RoleMetric[];
  teamPerformance: TeamMemberPerformance[];
  jobs: Job[];
  onAddJob: (job: Omit<Job, 'id' | 'postedDate' | 'adminId'>) => void;
  onUpdateJob: (job: Job) => void;
  onDeleteJob: (id: string) => void;
  currentLogoSrc: string | null;
  onLogoUpload: (base64Image: string) => void;
  activeAdminMenuItem: AdminMenuItem; // New prop for conditional rendering
  onAdminMenuItemClick: (item: AdminMenuItem) => void; // Added handler
  userType: UserType; // Added userType for section filtering
  branding: BrandingConfig; // Added branding config
  onUpdateBranding: (branding: BrandingConfig) => void; // Added branding update handler
  currentUser?: AppUser | null; // Added currentUser prop
}

export interface LoginPanelProps {
  userType: UserType; // The requested user type for login
  onLoginSuccess: () => void; // Callback on successful login
  onLoginError: (message: string) => void; // Callback on login error
  initialIsSignUp?: boolean; // New prop to force signup mode initially
}


// --- CANDIDATE PANEL PROPS ---
export interface CandidateLayoutProps {
  children: React.ReactNode;
  userType: UserType;
  onLogout: () => void;
  activeCandidateMenuItem: CandidateMenuItem;
  onCandidateMenuItemClick: (item: CandidateMenuItem) => void;
}

export interface CandidateSidebarProps {
  activeItem: CandidateMenuItem;
  onItemClick: (item: CandidateMenuItem) => void;
}

export interface CandidateDashboardContentProps {
  activeCandidateMenuItem: CandidateMenuItem;
  jobs: Job[];
  onApplyNow: (job: Job) => void;
}

export interface ApplyJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
}

// New Resignation Interface
export interface Resignation {
  id: string;
  employeeId: string;
  reason: string;
  submittedDate: string; // ISO string
  status: 'Pending HR Approval' | 'Approved' | 'Rejected';
  noticePeriodStartDate?: string; // ISO string
  lastWorkingDay?: string; // ISO string
  hrRemarks?: string;
}

// New Ticket Interface for Help Center
export interface Ticket {
  id: string;
  submittedBy: string; // Name of the user
  userType: UserType; // Type of user (Candidate, Partner)
  subject: string;
  category: 'Payroll' | 'Attendance' | 'Documents' | 'General Inquiry' | 'Invoice Query' | 'Technical Issue' | 'Other';
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  submittedDate: string; // ISO string
  resolvedDate?: string; // ISO string
  hrRemarks?: string;
}
