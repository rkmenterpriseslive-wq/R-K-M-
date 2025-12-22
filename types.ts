
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
  salaryRange: string; // Moved from basic fields to detailed
}

// CV-related interfaces
export interface Experience { id: number; role: string; company: string; duration: string; description: string; }
export interface Education { id: number; degree: string; university: string; duration: string; }

// New Document interface for My Documents page
export interface Document {
  id: string;
  name: string;
  status: 'Not Uploaded' | 'Uploaded' | 'Verified';
  fileName: string | null;
}

// Updated User interface to reflect App User properties
export interface AppUser {
  uid: string;
  email: string | null;
  userType: UserType; // Determined by app logic
}

export interface UserProfile {
  uid: string;
  email: string | null;
  userType: UserType;
  name?: string;
  phone?: string;
  // CV Fields
  address?: string;
  summary?: string;
  skills?: string;
  experiences?: Experience[];
  educations?: Education[];
  isCvComplete?: boolean;
  
  // New Personal Details
  fatherName?: string;
  dob?: string;
  nationality?: string;
  gender?: 'Male' | 'Female' | 'Other' | '';
  maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed' | '';
  languagesKnown?: string;
  
  // New Declaration Fields
  declarationDate?: string;
  declarationPlace?: string;

  // New fields from MyDocuments
  uan?: string;
  esi?: string;
  familyMembers?: FamilyMember[];
  onboardingStatus?: 'Pending Submission' | 'Pending Verification' | 'Onboarding Complete';
  esiCardFileName?: string | null;
  documents?: Document[];

  // Partner-specific fields
  vendorName?: string;
  partnerName?: string;
  storeLocation?: string;

  // HR/Team specific fields for filtering
  workingLocations?: string[];
  vendors?: string[]; // Used for assigned job categories/processes
  role?: string; // Specific role for team members (e.g., "Recruiter", "HR Manager")
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
  isShowingDashboard?: boolean;
  onHomeClick?: () => void;
  onDashboardClick?: () => void;
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

// New interface for HR Updates stats
export interface HRUpdatesStats {
  totalSelected: number;
  totalOfferReleased: number;
  onboardingPending: number;
  newJoiningToday: number;
  newJoiningWeek: number;
  newJoiningMonth: number;
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

// NEW INTERFACES FOR AGGREGATED JOB DATA
export interface RoleWiseData {
  role: string;
  location: string; // Combined locations
  store: string;    // Combined stores
  brand: string;    // Combined brands
  partner: string;  // Combined partners
  totalOpenings: number;
  pending: number;
  approved: number;
}

export interface StoreWiseData {
  storeName: string;
  location: string; // Combined locations
  role: string;     // Combined roles
  brand: string;    // Combined brands
  partner: string;  // Combined partners
  totalOpenings: number;
  pending: number;
  approved: number;
}

export interface PartnerWiseData {
  partnerName: string;
  brand: string;    // Combined brands
  location: string; // Combined locations
  role: string;     // Combined roles
  store: string;    // Combined stores
  totalOpenings: number;
  pending: number;
  approved: number;
}

export interface TeamWiseData {
  recruiterName: string;
  role: string;
  location: string;
  store: string;
  brand: string;
  partner: string;
  totalOpenings: number;
  pending: number;
  approved: number;
}

// NEW INTERFACE FOR TEAM PERFORMANCE
export interface TeamMemberPerformance {
  name: string;
  role: string;
  total: number;
  selected: number;
  pending: number;
  rejected: number;
  quit: number;
  successRate: number; // Percentage
  reportingManagerName?: string; // NEW: To show who they report to
  reportingManagerUserType?: UserType; // NEW: To differentiate managers
}


export interface TeamMember {
  id?: string; // Added for Firebase
  name: string;
  email: string;
  mobile: string;
  salary: string;
  role: string;
  reportingManager: string;
  workingLocations: string[];
  vendors: string[];
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
  PartnerSalaryUpdates = 'Partner Salary Updates',
  PartnerRequirementsDetail = 'Partner Requirements Breakdown',
  // New Supervisor Items
  SupervisorDashboard = 'Supervisor Dashboard',
  StoreAttendance = 'Store Attendance',
  StoreEmployees = 'Store Employees',
}

// New enum for Candidate panel
export enum CandidateMenuItem {
  JobBoard = 'Job Board',
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

export type CandidateStatus = 'Sourced' | 'On the way' | 'Interview' | 'Selected' | 'Rejected' | 'Quit' | 'Hired' | 'Screening' | 'Offer Sent';

export interface CandidateDocument {
  name: string;
  status: 'Not Uploaded' | 'Uploaded' | 'Verified';
  fileName: string | null;
}

export interface Candidate {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: string;
  status: CandidateStatus;
  date: string; // Application/Sourced date
  pipelineStartDate?: string; // The date the candidate should appear in the pipeline
  recruiter: string; // Now stores UID of recruiter
  vendor?: string;
  storeName: string;
  quitDate?: string | null;
  documents?: CandidateDocument[];
  activeStatus?: 'Active' | 'Inactive';
  interviewDate?: string | null;
  interviewTime?: string | null;
  interviewPlace?: string | null;
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
  id: string; // Firebase key
  ticketNo: string;
  candidate: string;
  vendor: string;
  role: string;
  issue: string;
  description?: string;
  status: 'Active' | 'Closed';
  date: string;
  assignedManager: string;
  resolution?: string; // Notes on resolution
}

// New WarningLetter Interface
export interface WarningLetter {
  id: string; // Firebase key
  ticketNo: string;
  employeeName: string;
  reason: string;
  description: string;
  issueDate: string;
  issuedBy: string;
  status: 'Active' | 'Resolved';
}

// New DemoRequest Interface
export interface DemoRequest {
  id: string; // Firebase key
  companyName: string;
  email: string;
  address: string;
  teamHead: string;
  teamSize: string;
  requestDate: string; // ISO string
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
  logoSrc?: string | null; // Added logoSrc to branding config
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
  emailNotifications?: boolean;
  maintenanceMode?: boolean;
  permissions?: Record<string, Record<string, boolean>>;
}

export type CallStatus = 'Applied' | 'Interested' | 'Connected' | 'No Answer' | 'Not Interested' | 'Callback' | 'Already Call';

export interface DailyLineup {
    id: string;
    candidateName: string;
    contact: string;
    vendor: string;
    role: string;
    location: string;
    storeName: string;
    submittedBy: string; // Name of the person who submitted/assigned
    recruiterUid?: string; // New: UID of the recruiter/HR for internal mapping
    callStatus: CallStatus;
    interviewDateTime?: string | null; // Old field for compatibility
    interviewDate?: string | null;
    interviewTime?: string | null;
    interviewPlace?: string | null;
    createdAt: string; // For sorting
}

// New types for Attendance
export type AttendanceStatus = 'Present' | 'Absent' | 'Leave' | 'Week Off';

export interface CommissionAttendanceRecord {
    presentDays: number;
    totalDays: number;
    commission: number;
}

export interface StoreAttendanceRecord {
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
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
  hrUpdatesStats: HRUpdatesStats; // New prop for HR updates
  candidatesByProcess: ProcessMetric[];
  candidatesByRole: RoleMetric[];
  roleWiseJobData: RoleWiseData[];
  storeWiseJobData: StoreWiseData[];
  partnerWiseJobData: PartnerWiseData[];
  teamWiseJobData: TeamWiseData[];
  teamPerformance: TeamMemberPerformance[]; // NEW
  teamMembers: TeamMember[];
  activeAdminMenuItem: AdminMenuItem; // Pass active menu item to AdminLayout
  onAdminMenuItemClick: (item: AdminMenuItem) => void; // Pass handler to AdminLayout
  onLogout: () => void; // Added onLogout to prop interface
  branding: BrandingConfig; // Added branding config
  onUpdateBranding: (branding: BrandingConfig) => void; // Added branding update handler
  currentUser?: AppUser | null; // Added currentUser prop
  currentUserProfile?: UserProfile | null;
  allUsers: UserProfile[]; // NEW: Pass allUsers
  candidates: Candidate[];
  // New props for candidate
  activeCandidateMenuItem: CandidateMenuItem;
  onCandidateMenuItemClick: (item: CandidateMenuItem) => void;
  onApplyNow: (job: Job) => void;
  onCvCompletion: (cvData: Partial<UserProfile>) => void;
  onTypeUpdate: (profileData: Partial<UserProfile>) => void;
  onProfileUpdate: (profileData: Partial<UserProfile>) => void;
}

export interface AdminLayoutProps {
  children: React.ReactNode;
  userType: UserType; // Added userType to determine header title
  currentLogoSrc: string | null;
  onLogoUpload: (base64Image: string) => void;
  activeAdminMenuItem: AdminMenuItem; // New prop for active menu item
  onAdminMenuItemClick: (item: AdminMenuItem) => void; // New prop for menu item click handler
  onHomeClick?: () => void;
}

export interface SidebarProps {
  activeItem: AdminMenuItem; // Now controlled by parent
  onItemClick: (item: AdminMenuItem) => void; // New prop for click handler
  userType: UserType; // Added userType to filter menu items
  isOpen?: boolean;
}

export interface AdminDashboardContentProps {
  pipelineStats: CandidatePipelineStats;
  vendorStats: VendorStats;
  complaintStats: ComplaintStats;
  partnerRequirementStats: PartnerRequirementStats;
  hrUpdatesStats: HRUpdatesStats;
  candidatesByProcess: ProcessMetric[];
  candidatesByRole: RoleMetric[];
  roleWiseJobData: RoleWiseData[];
  storeWiseJobData: StoreWiseData[];
  partnerWiseJobData: PartnerWiseData[];
  teamWiseJobData: TeamWiseData[];
  teamPerformance: TeamMemberPerformance[];
  teamMembers: TeamMember[];
  jobs: Job[];
  onAddJob: (job: Omit<Job, 'id' | 'postedDate' | 'adminId'>) => void;
  onUpdateJob: (job: Job) => void;
  onDeleteJob: (id: string) => void;
  currentLogoSrc: string | null;
  onLogoUpload: (base64Image: string) => void;
  activeAdminMenuItem: AdminMenuItem;
  onAdminMenuItemClick: (item: AdminMenuItem) => void;
  userType: UserType;
  branding: BrandingConfig;
  onUpdateBranding: (branding: BrandingConfig) => void;
  currentUser?: AppUser | null;
  // FIX: Add currentUserProfile to pass detailed user data for components like MyProfileView.
  currentUserProfile?: UserProfile | null;
  allUsers: UserProfile[];
  candidates: Candidate[];
}

export interface LoginPanelProps {
  userType: UserType; // The requested user type for login
  onLoginSuccess: () => void; // Callback on successful login
  onLoginError: (message: string) => void; // Callback on login error
  initialIsSignUp?: boolean; // New prop to force signup mode initially
  // FIX: Add UserProfile and FirebaseUser types for LoginPanel
  // userProfile?: UserProfile | null;
  // firebaseUser?: FirebaseUser | null;
}

// FIX: Add missing ApplyJobModalProps interface
export interface ApplyJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  currentUserProfile?: UserProfile | null;
}


// --- CANDIDATE PANEL PROPS ---
export interface CandidateLayoutProps {
  children: React.ReactNode;
  userType: UserType;
  activeCandidateMenuItem: CandidateMenuItem;
  onCandidateMenuItemClick: (item: CandidateMenuItem) => void;
  onHomeClick?: () => void;
}

export interface CandidateSidebarProps {
  activeItem: CandidateMenuItem;
  onItemClick: (item: CandidateMenuItem) => void;
  onHomeClick?: () => void;
  isOpen?: boolean;
}

export interface CandidateDashboardContentProps {
  activeCandidateMenuItem: CandidateMenuItem;
  jobs: Job[];
  onApplyNow: (job: Job) => void;
  onCvCompletion: (cvData: Partial<UserProfile>) => void;
  onProfileUpdate: (profileData: Partial<UserProfile>) => void;
  currentUserProfile?: UserProfile | null;
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
  userId: string; // UID of the user who submitted the ticket
  submittedBy: string; // Name or email of the user
  userType: UserType; // Type of user (Candidate, Partner)
  subject: string;
  category: 'Payroll' | 'Attendance' | 'Documents' | 'General Inquiry' | 'Invoice Query' | 'Technical Issue' | 'Other';
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  submittedDate: string; // ISO string
  resolvedDate?: string; // ISO string
  hrRemarks?: string;
  
  // SLA & Escalation metadata
  assignedToName: string; // Name of current handler (HR, Manager, or Admin)
  slaDeadline: string; // ISO string for resolution deadline
  escalationLevel: 0 | 1 | 2; // 0: HR, 1: Manager, 2: Admin
}

// New Role Interface for Settings
export interface Role {
  id: string;
  name: string;
  panel: 'Admin' | 'HR' | 'Team' | 'Partner' | 'Candidate' | 'TeamLead';
}

// NEW COMMISSION STRUCTURE INTERFACES
export type CommissionStructureType = 'Percentage Based' | 'Slab Based' | 'Attendance Based';

export interface PercentageCommission {
  type: 'Percentage Based';
  percentage: number; // e.g., 10 for 10%
}

export interface Slab {
  id: string; // For React list keys
  from: number; // e.g., 1
  to: number;   // e.g., 10 (number of candidates, days, etc.)
  amount: number; // Flat amount for this slab
}

export interface SlabCommission {
  type: 'Slab Based';
  slabs: Slab[];
}

export interface AttendanceProfile {
  id: string; // For React list keys
  role: string; // e.g., "Picker", "Packer", "Sales Executive"
  experienceType: string; // NEW: "Fresher", "1-3 Years" etc.
  attendanceDays: number; // e.g., 26 for 26 days present
  amount: number; // Flat amount for achieving this profile's attendance
}

export interface AttendanceCommission {
  type: 'Attendance Based';
  profiles: AttendanceProfile[];
}

export type CommissionStructure = PercentageCommission | SlabCommission | AttendanceCommission;

// Updated Vendor interface
export interface Vendor {
    id: string;
    partnerName: string;
    brandName: string;
    contactPerson: string;
    email: string;
    phone: string;
    fullAddress: string; // New field
    operationalLocations: string[]; // Renamed from 'locations'
    jobRoles: string[]; // Renamed from 'roles'
    status: 'Active' | 'Inactive';
    commissionStructure?: CommissionStructure; // Made optional for backward compatibility
    termsAndConditions: string; // New field
}