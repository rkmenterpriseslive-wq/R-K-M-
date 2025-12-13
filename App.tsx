

import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import LoginPanel from './components/LoginPanel';
import Dashboard from './components/Dashboard';
import HomePage from './components/HomePage';
import Modal from './components/Modal';
import RequestDemoModal from './components/RequestDemoModal';
import ApplyJobModal from './components/ApplyJobModal';
import { UserType, Job, AdminMenuItem, CandidateMenuItem, AppUser, BrandingConfig, CandidatePipelineStats, VendorStats, ComplaintStats, PartnerRequirementStats, ProcessMetric, RoleMetric, TeamMemberPerformance } from './types';
import { onJobsChange, createJob, deleteJob, updateJob, onAuthChange, signOutUser, seedDatabaseWithInitialData, getUserProfile } from './services/firebaseService';
import { ref, set, getDatabase } from 'firebase/database';

// --- App Component ---

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
  vendor: { total: 3 },
  complaint: { active: 0, closed: 0 },
  partnerRequirement: { total: 5, pending: 0, approved: 5 },
  process: [
    { name: 'Screening', count: 0, color: '' },
    { name: 'Interview', count: 0, color: '' },
    { name: 'Selected', count: 0, color: '' },
    { name: 'Joined', count: 0, color: '' },
  ],
  role: [],
  team: []
};

const BRANDING_STORAGE_KEY = 'rkm_branding_config';
const LOGO_STORAGE_KEY = 'rkm_portal_logo';
const USER_SESSION_KEY = 'rkm_user';
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

  useEffect(() => {
    const initializeApp = async () => {
      await seedDatabaseWithInitialData();
    };
    initializeApp();

    // Set up the real-time listener for jobs
    const unsubscribe = onJobsChange(setJobs);

    // Clean up the listener when the component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = await getUserProfile(firebaseUser.uid);
        
        let userRole = UserType.CANDIDATE; // Default role
        if (userProfile && userProfile.userType) {
            userRole = userProfile.userType;
        } else if (firebaseUser.email === 'rkrohit19kumar@gmail.com') { // Super admin fallback
            userRole = UserType.ADMIN;
        } else {
            // This is a new candidate who signed up via apply form. Create a basic profile.
            const newCandidateProfile = {
                email: firebaseUser.email,
                uid: firebaseUser.uid,
                userType: UserType.CANDIDATE,
            };
            const db = getDatabase();
            set(ref(db, `users/${firebaseUser.uid}`), newCandidateProfile);
        }
        
        const appUser: AppUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          userType: userRole,
        };
        
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(appUser));
        setCurrentAppUser(appUser);
        setCurrentUserType(appUser.userType);

        if ([UserType.ADMIN, UserType.HR, UserType.PARTNER, UserType.TEAMLEAD, UserType.TEAM].includes(appUser.userType)) {
          setActiveAdminMenuItem(AdminMenuItem.Dashboard);
        }
        if (appUser.userType === UserType.STORE_SUPERVISOR) {
          setActiveAdminMenuItem(AdminMenuItem.SupervisorDashboard);
        }
        if (appUser.userType === UserType.CANDIDATE) {
          setActiveCandidateMenuItem(CandidateMenuItem.ApplyJobs);
        }
      } else {
        localStorage.removeItem(USER_SESSION_KEY);
        setCurrentAppUser(null);
        setCurrentUserType(UserType.NONE);
      }
    });

    return () => unsubscribe();
  }, []);
  
  const handleLoginSuccess = () => {
    setShowLoginPanelForType(UserType.NONE);
  };

  const handleLoginSelect = useCallback((type: UserType) => { setShowLoginPanelForType(type); setIsRegisteringAdmin(false); }, []);
  
  const handleLogout = useCallback(async () => { 
    try {
      await signOutUser();
      // onAuthChange listener will handle clearing state
      setActiveAdminMenuItem(AdminMenuItem.Dashboard);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, []);

  const handleCancelLogin = useCallback(() => { setShowLoginPanelForType(UserType.NONE); setIsRegisteringAdmin(false); }, []);

  const handleAddJob = useCallback(async (newJob: Omit<Job, 'id' | 'postedDate' | 'adminId'>) => {
    if (!currentAppUser || ![UserType.ADMIN, UserType.HR].includes(currentAppUser.userType)) return alert('Only administrators or HR can post jobs.');
    try {
      const createdJob = await createJob({ ...newJob, adminId: currentAppUser.uid });
      if (createdJob) { alert('Job posted successfully!'); } // No longer need to manually update state
    } catch (error) { console.error("Error creating job:", error); alert('Failed to post job.'); }
  }, [currentAppUser]);
  
  const handleUpdateJob = useCallback(async (job: Job) => {
    if (!currentAppUser || ![UserType.ADMIN, UserType.HR].includes(currentAppUser.userType)) {
      alert('Only administrators or HR can update jobs.');
      return;
    }
    try {
      await updateJob(job);
      alert('Job updated successfully!'); // No longer need to manually update state
    } catch (error) {
      console.error("Error updating job:", error);
      alert('Failed to update job.');
    }
  }, [currentAppUser]);

  const handleDeleteJob = useCallback(async (id: string) => {
    if (!currentAppUser || ![UserType.ADMIN, UserType.HR].includes(currentAppUser.userType)) {
      alert('Only administrators or HR can delete jobs.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(id);
        alert('Job deleted successfully!'); // No longer need to manually update state
      } catch (error) {
        console.error("Error deleting job:", error);
        alert('Failed to delete job.');
      }
    }
  }, [currentAppUser]);

  const handleApplyNow = (job: Job) => {
    setSelectedJobForApply(job);
    setShowApplyJobModal(true);
  };

  return (
    <div className="bg-gray-50 font-sans">
      <Header
        userType={currentUserType}
        onLoginSelect={handleLoginSelect}
        onLogout={handleLogout}
        onHireUsClick={() => setShowRequestDemoModal(true)}
        logoSrc={logoSrc}
      />
      <main>
        {currentUserType === UserType.NONE ? (
          <HomePage
            jobs={jobs}
            onApplyNow={handleApplyNow}
            currentUserType={currentUserType}
            onLoginSelect={handleLoginSelect}
            onNavigateToAdminJobBoard={() => setActiveAdminMenuItem(AdminMenuItem.ManageJobBoard)}
            branding={branding}
          />
        ) : (
          <Dashboard
            userType={currentUserType}
            jobs={jobs}
            onAddJob={handleAddJob}
            onUpdateJob={handleUpdateJob}
            onDeleteJob={handleDeleteJob}
            currentLogoSrc={logoSrc}
            onLogoUpload={handleLogoUpload}
            pipelineStats={dashboardStats.pipeline}
            vendorStats={dashboardStats.vendor}
            complaintStats={dashboardStats.complaint}
            partnerRequirementStats={dashboardStats.partnerRequirement}
            candidatesByProcess={dashboardStats.process}
            candidatesByRole={dashboardStats.role}
            teamPerformance={dashboardStats.team}
            activeAdminMenuItem={activeAdminMenuItem}
            onAdminMenuItemClick={setActiveAdminMenuItem}
            activeCandidateMenuItem={activeCandidateMenuItem}
            onCandidateMenuItemClick={setActiveCandidateMenuItem}
            onLogout={handleLogout}
            branding={branding}
            onUpdateBranding={handleUpdateBranding}
            currentUser={currentAppUser}
            onApplyNow={handleApplyNow}
          />
        )}
      </main>

      {showLoginPanelForType !== UserType.NONE && (
        <Modal
          isOpen={true}
          onClose={handleCancelLogin}
          title={`${isRegisteringAdmin ? 'Register' : 'Login'} - ${showLoginPanelForType}`}
          description={showLoginPanelForType === UserType.TEAM ? 'Welcome Team Member. Please log in to access your dashboard.' : `Please log in as a ${showLoginPanelForType.toLowerCase()} to continue.`}
        >
          <LoginPanel
            userType={showLoginPanelForType}
            onLoginSuccess={handleLoginSuccess}
            onLoginError={(msg) => console.error("Login Error:", msg)}
            initialIsSignUp={isRegisteringAdmin}
          />
        </Modal>
      )}

      <RequestDemoModal isOpen={showRequestDemoModal} onClose={() => setShowRequestDemoModal(false)} />
      <ApplyJobModal isOpen={showApplyJobModal} onClose={() => { setShowApplyJobModal(false); setSelectedJobForApply(null); }} job={selectedJobForApply} />

    </div>
  );
};

export default App;