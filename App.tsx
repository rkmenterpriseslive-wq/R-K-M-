


import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import LoginPanel from './components/LoginPanel';
import Dashboard from './components/Dashboard';
import HomePage from './components/HomePage';
import Modal from './components/Modal';
import RequestDemoModal from './components/RequestDemoModal';
import ApplyJobModal from './components/ApplyJobModal'; // Import the new modal
import { UserType, Job, AdminMenuItem, CandidateMenuItem, AppUser, BrandingConfig, CandidatePipelineStats, VendorStats, ComplaintStats, PartnerRequirementStats, ProcessMetric, RoleMetric, TeamMemberPerformance } from './types';
import { supabase } from './services/supabaseClient';
import { getJobs, createJob, deleteJob } from './services/supabaseService';

interface DashboardStats {
  pipeline: CandidatePipelineStats;
  vendor: VendorStats;
  complaint: ComplaintStats;
  partnerRequirement: PartnerRequirementStats;
  process: ProcessMetric[];
  role: RoleMetric[];
  team: TeamMemberPerformance[];
}

const initialStats: DashboardStats = {
  pipeline: { active: 0, interview: 0, rejected: 0, quit: 0 },
  vendor: { total: 0 },
  complaint: { active: 0, closed: 0 },
  partnerRequirement: { total: 0, pending: 0, approved: 0 },
  process: [],
  role: [],
  team: []
};

const BRANDING_STORAGE_KEY = 'rkm_branding_config';
const LOGO_STORAGE_KEY = 'rkm_portal_logo';
// FIX: The original base64 string was corrupted and causing a syntax error, leading to incorrect type inference.
// It has been replaced with a valid 1x1 transparent PNG.
const defaultLogo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const defaultBranding: BrandingConfig = {
  portalName: 'R.K.M ENTERPRISE',
  hireTalent: {
      title: 'Hire Top Talent',
      description: 'Post your job openings and find the perfect candidates for your business.',
      link: 'https://example.com/hire',
      backgroundImage: null,
  },
  becomePartner: {
      title: 'Become a Partner',
      description: 'Expand your business by collaborating with us and accessing our network.',
      link: 'https://example.com/register',
      backgroundImage: null,
  }
};

const App: React.FC = () => {
  const [currentUserType, setCurrentUserType] = useState<UserType>(UserType.NONE);
  const [currentAppUser, setCurrentAppUser] = useState<AppUser | null>(null);
  const [showLoginPanelForType, setShowLoginPanelForType] = useState<UserType>(UserType.NONE);
  const [showRequestDemoModal, setShowRequestDemoModal] = useState(false);
  const [showApplyJobModal, setShowApplyJobModal] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);
  const [isRegisteringAdmin, setIsRegisteringAdmin] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeAdminMenuItem, setActiveAdminMenuItem] = useState<AdminMenuItem>(AdminMenuItem.Dashboard);
  const [activeCandidateMenuItem, setActiveCandidateMenuItem] = useState<CandidateMenuItem>(CandidateMenuItem.ApplyJobs);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(initialStats);
  
  const [branding, setBranding] = useState<BrandingConfig>(() => {
    try {
        const savedBranding = localStorage.getItem(BRANDING_STORAGE_KEY);
        return savedBranding ? JSON.parse(savedBranding) : defaultBranding;
    } catch (error) {
        console.error("Could not parse branding from localStorage", error);
        return defaultBranding;
    }
  });

  const [logoSrc, setLogoSrc] = useState<string | null>(() => {
    try {
        return localStorage.getItem(LOGO_STORAGE_KEY) || defaultLogo;
    } catch (error) {
        console.error("Could not read logo from localStorage", error);
        return defaultLogo;
    }
  });

  const handleUpdateBranding = (newBranding: BrandingConfig) => {
    try {
        localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(newBranding));
    } catch (error) {
        console.error("Could not save branding to localStorage", error);
    }
    setBranding(newBranding);
  };

  const handleLogoUpload = (newLogo: string) => {
      try {
          localStorage.setItem(LOGO_STORAGE_KEY, newLogo);
      } catch (error) {
          console.error("Could not save logo to localStorage", error);
      }
      setLogoSrc(newLogo);
  };

  const fetchJobsData = useCallback(async () => {
    try { setJobs(await getJobs()); } catch (error) { console.error("Failed to fetch jobs:", error); }
  }, []);

  useEffect(() => { fetchJobsData(); }, [fetchJobsData]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => session?.user && handleUserSession(session.user));
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) handleUserSession(session.user);
      else if (event === 'SIGNED_OUT') {
        setCurrentAppUser(null);
        setCurrentUserType(UserType.NONE);
        setActiveAdminMenuItem(AdminMenuItem.Dashboard);
        setActiveCandidateMenuItem(CandidateMenuItem.ApplyJobs);
      }
    });
    return () => { authListener.subscription.unsubscribe(); };
  }, []);

  const handleUserSession = (user: any) => {
    const email = user.email;
    const type = (user.user_metadata?.role as UserType) || UserType.CANDIDATE;
    
    setCurrentAppUser({ uid: user.id, email: email || '', userType: type });
    setCurrentUserType(type);
    if ([UserType.ADMIN, UserType.HR, UserType.PARTNER, UserType.TEAMLEAD, UserType.TEAM].includes(type)) {
      setActiveAdminMenuItem(AdminMenuItem.Dashboard);
    }
    if (type === UserType.STORE_SUPERVISOR) {
      setActiveAdminMenuItem(AdminMenuItem.SupervisorDashboard);
    }
    if (type === UserType.CANDIDATE) {
      setActiveCandidateMenuItem(CandidateMenuItem.ApplyJobs);
    }
  };
  
  const handleLoginSuccess = (user: AppUser) => {
    setCurrentAppUser(user);
    setCurrentUserType(user.userType);
    if ([UserType.ADMIN, UserType.HR, UserType.PARTNER, UserType.TEAMLEAD, UserType.TEAM].includes(user.userType)) {
      setActiveAdminMenuItem(AdminMenuItem.Dashboard);
    }
    if (user.userType === UserType.STORE_SUPERVISOR) {
      setActiveAdminMenuItem(AdminMenuItem.SupervisorDashboard);
    }
    if (user.userType === UserType.CANDIDATE) {
      setActiveCandidateMenuItem(CandidateMenuItem.ApplyJobs);
    }
    setShowLoginPanelForType(UserType.NONE);
  };

  const handleLoginSelect = useCallback((type: UserType) => { setShowLoginPanelForType(type); setIsRegisteringAdmin(false); }, []);
  
  const handleLogout = useCallback(async () => { 
    try { 
      await supabase.auth.signOut(); 
    } catch (error) { 
      console.error("Error signing out:", error); 
    } finally {
      setCurrentAppUser(null);
      setCurrentUserType(UserType.NONE);
      setActiveAdminMenuItem(AdminMenuItem.Dashboard);
    }
  }, []);

  const handleCancelLogin = useCallback(() => { setShowLoginPanelForType(UserType.NONE); setIsRegisteringAdmin(false); }, []);

  const handleAddJob = useCallback(async (newJob: Omit<Job, 'id' | 'postedDate' | 'adminId'>) => {
    if (!currentAppUser || ![UserType.ADMIN, UserType.HR].includes(currentAppUser.userType)) return alert('Only administrators or HR can post jobs.');
    try {
      const createdJob = await createJob({ ...newJob, adminId: currentAppUser.uid });
      if (createdJob) { setJobs(prev => [createdJob, ...prev]); alert('Job posted successfully!'); }
    } catch (error) { console.error("Error creating job:", error); alert('Failed to post job.'); }
  }, [currentAppUser]);

  const handleDeleteJob = useCallback(async (id: string) => {
    if (!currentAppUser || ![UserType.ADMIN, UserType.HR].includes(currentAppUser.userType)) return alert('Only administrators or HR can delete jobs.');
    if (window.confirm("Delete this job?")) {
      try { await deleteJob(id); setJobs(prev => prev.filter(job => job.id !== id)); alert('Job deleted!'); }
      catch (error) { console.error("Error deleting job:", error); alert('Failed to delete job.'); }
    }
  }, [currentAppUser]);

  const handleApplyNow = useCallback((job: Job) => {
    setSelectedJobForApply(job);
    setShowApplyJobModal(true);
  }, []);

  const handleAdminMenuItemClick = useCallback((item: AdminMenuItem) => {
    setActiveAdminMenuItem(item);
  }, []);
  
  const handleCandidateMenuItemClick = useCallback((item: CandidateMenuItem) => {
    setActiveCandidateMenuItem(item);
  }, []);

  const hasAdminPanelLayout = [UserType.ADMIN, UserType.HR, UserType.PARTNER, UserType.TEAMLEAD, UserType.TEAM, UserType.STORE_SUPERVISOR].includes(currentUserType);
  const hasCandidatePanelLayout = currentUserType === UserType.CANDIDATE;
  
  const modalInfo = {
    [UserType.ADMIN]: { title: 'Admin Registration', description: 'Create a new administrator account.' },
    [UserType.TEAM]: { title: 'Team Login', description: 'Access the team management panel.' },
    [UserType.CANDIDATE]: { title: 'Employee Login', description: 'Access your employee dashboard.' },
    [UserType.PARTNER]: { title: 'Partner Login', description: 'Access the partner dashboard.' },
    [UserType.HR]: { title: 'HR Login', description: 'Access the HR dashboard.' },
    [UserType.TEAMLEAD]: { title: 'Team Lead Login', description: 'Access the Team Lead dashboard.' },
    [UserType.STORE_SUPERVISOR]: { title: 'Store Supervisor Login', description: 'Access the store management panel.' },
    [UserType.NONE]: { title: 'Login', description: 'Sign in to your account.' }
  };
  const { title, description } = isRegisteringAdmin ? modalInfo[UserType.ADMIN] : modalInfo[showLoginPanelForType];

  return (
    <div className="min-h-screen flex flex-col">
      {!hasAdminPanelLayout && !hasCandidatePanelLayout && <Header userType={currentUserType} onLoginSelect={handleLoginSelect} onLogout={handleLogout} onHireUsClick={() => setShowRequestDemoModal(true)} logoSrc={logoSrc} />}
      <div className="flex-grow flex flex-col">
        {currentUserType !== UserType.NONE ? (
          <Dashboard
            userType={currentUserType} jobs={jobs} onAddJob={handleAddJob} onDeleteJob={handleDeleteJob}
            currentLogoSrc={logoSrc} onLogoUpload={handleLogoUpload}
            pipelineStats={dashboardStats.pipeline} vendorStats={dashboardStats.vendor} complaintStats={dashboardStats.complaint}
            partnerRequirementStats={dashboardStats.partnerRequirement}
            candidatesByProcess={dashboardStats.process} candidatesByRole={dashboardStats.role} teamPerformance={dashboardStats.team}
            activeAdminMenuItem={activeAdminMenuItem} onAdminMenuItemClick={handleAdminMenuItemClick}
            activeCandidateMenuItem={activeCandidateMenuItem} onCandidateMenuItemClick={handleCandidateMenuItemClick}
            onLogout={handleLogout}
            branding={branding} onUpdateBranding={handleUpdateBranding}
            currentUser={currentAppUser}
            onApplyNow={handleApplyNow}
          />
        ) : (
          <HomePage 
            jobs={jobs} 
            onApplyNow={handleApplyNow} 
            currentUserType={currentUserType} 
            onLoginSelect={handleLoginSelect} 
            onNavigateToAdminJobBoard={() => setActiveAdminMenuItem(AdminMenuItem.ManageJobBoard)}
            branding={branding} 
          />
        )}
      </div>
      <Modal isOpen={showLoginPanelForType !== UserType.NONE} onClose={handleCancelLogin} title={title} description={description}>
        <LoginPanel userType={showLoginPanelForType} onLoginSuccess={handleLoginSuccess} onLoginError={console.error} initialIsSignUp={isRegisteringAdmin} />
      </Modal>
      <RequestDemoModal isOpen={showRequestDemoModal} onClose={() => setShowRequestDemoModal(false)} />
      <ApplyJobModal 
        isOpen={showApplyJobModal} 
        onClose={() => setShowApplyJobModal(false)} 
        job={selectedJobForApply} 
      />
      {!hasAdminPanelLayout && !hasCandidatePanelLayout && <footer className="bg-gray-800 text-white py-4 text-center text-sm sticky bottom-0 w-full z-40"><p>&copy; {new Date().getFullYear()} R K M Career. All rights reserved.</p></footer>}
    </div>
  );
};
export default App;