import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import LoginPanel from './components/LoginPanel';
import Dashboard from './components/Dashboard';
import HomePage from './components/HomePage';
import Modal from './components/Modal';
import RequestDemoModal from './components/RequestDemoModal';
import ApplyJobModal from './components/ApplyJobModal';
import { UserType, Job, AdminMenuItem, CandidateMenuItem, AppUser, BrandingConfig, CandidatePipelineStats, VendorStats, ComplaintStats, PartnerRequirementStats, ProcessMetric, RoleMetric, TeamMemberPerformance, UserProfile } from './types';
import { onJobsChange, createJob, deleteJob, updateJob, onAuthChange, signOutUser, seedDatabaseWithInitialData, getUserProfile, updateUserProfile } from './services/firebaseService';
import { ref, set, getDatabase, onValue, Unsubscribe } from 'firebase/database';

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
  pipeline: { active: 8, interview: 0, rejected: 0, quit: 0 },
  vendor: { total: 3 },
  complaint: { active: 2, closed: 18 },
  partnerRequirement: { total: 5, pending: 2, approved: 3 },
  process: [
    { name: 'Screening', count: 50, color: 'bg-blue-500' },
    { name: 'Interview', count: 30, color: 'bg-indigo-500' },
    { name: 'Selected', count: 25, color: 'bg-purple-500' },
    { name: 'Joined', count: 20, color: 'bg-green-500' },
  ],
  role: [
      { name: 'Picker', count: 60, color: 'bg-cyan-500' },
      { name: 'Packer', count: 40, color: 'bg-teal-500' },
      { name: 'Sales', count: 25, color: 'bg-emerald-500' },
  ],
  team: [
    {
      teamMember: 'Vikrant Singh',
      role: 'Sr. Recruiter Manager',
      total: 150,
      selected: 90,
      pending: 30,
      rejected: 20,
      quit: 10,
      successRate: 60,
    },
    {
      teamMember: 'Rohit Kumar',
      role: 'Field Recruiter',
      total: 80,
      selected: 40,
      pending: 15,
      rejected: 15,
      quit: 10,
      successRate: 50,
    }
  ]
};

const BRANDING_STORAGE_KEY = 'rkm_branding_config';
const LOGO_STORAGE_KEY = 'rkm_portal_logo';
const USER_SESSION_KEY = 'rkm_user';
const defaultLogo = 'https://rkm-pro-502a5.web.app/images/rkm.png';

const defaultBranding: BrandingConfig = {
  portalName: 'R.K.M ENTERPRISE',
  hireTalent: {
      title: 'Hire Top Talent',
      description: 'Post your job openings and find the perfect candidates for your business.',
      link: '#',
      backgroundImage: 'https://rkm-pro-502a5.web.app/images/hiring.png',
  },
  becomePartner: {
      title: 'Become a Partner',
      description: 'Expand your business by collaborating with us and accessing our network.',
      link: '#',
      backgroundImage: 'https://rkm-pro-502a5.web.app/images/partner.png',
  }
};

const App: React.FC = () => {
  const [currentUserType, setCurrentUserType] = useState<UserType>(UserType.NONE);
  const [currentAppUser, setCurrentAppUser] = useState<AppUser | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [showLoginPanelForType, setShowLoginPanelForType] = useState<UserType>(UserType.NONE);
  const [showRequestDemoModal, setShowRequestDemoModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeAdminMenuItem, setActiveAdminMenuItem] = useState<AdminMenuItem>(AdminMenuItem.Dashboard);
  const [activeCandidateMenuItem, setActiveCandidateMenuItem] = useState<CandidateMenuItem>(CandidateMenuItem.CVGenerator);
  const [dashboardStats] = useState<DashboardStats>(initialStats);
  const [isCvComplete, setIsCvComplete] = useState(false);
  const [applyingForJob, setApplyingForJob] = useState<Job | null>(null);
  
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

    const unsubscribe = onJobsChange(setJobs);

    return () => {
      unsubscribe();
    };
  }, []);

  const handleProfileUpdate = useCallback(async (profileData: Partial<UserProfile>) => {
    if (currentAppUser) {
        try {
            await updateUserProfile(currentAppUser.uid, profileData);
            alert('Details saved successfully!');
        } catch (error) {
            console.error("Failed to save details:", error);
            alert("There was an error saving your details. Please try again.");
        }
    }
  }, [currentAppUser]);

  const handleCvCompletion = useCallback(async (cvData: Partial<UserProfile>) => {
    if (currentAppUser) {
        try {
            await updateUserProfile(currentAppUser.uid, { ...cvData, isCvComplete: true });
            setIsCvComplete(true);
            setActiveCandidateMenuItem(CandidateMenuItem.MyProfile);
            alert('CV details saved! You can now access all features.');
        } catch (error) {
            console.error("Failed to save CV:", error);
            alert("There was an error saving your CV. Please try again.");
        }
    }
  }, [currentAppUser]);


  useEffect(() => {
    let unsubscribeProfile: Unsubscribe = () => {};

    const unsubscribeAuth = onAuthChange((firebaseUser) => {
      unsubscribeProfile();

      if (firebaseUser) {
        const db = getDatabase();
        const userProfileRef = ref(db, `users/${firebaseUser.uid}`);
        
        unsubscribeProfile = onValue(userProfileRef, (snapshot) => {
          const userProfileData = snapshot.val();

          if (userProfileData) {
            setCurrentUserProfile(userProfileData);
            
            const userTypeFromDb = (userProfileData.userType || UserType.NONE).toUpperCase();
            const resolvedUserType = Object.values(UserType).includes(userTypeFromDb as UserType) 
                ? userTypeFromDb as UserType 
                : UserType.NONE;

            const appUser: AppUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              userType: resolvedUserType,
            };

            localStorage.setItem(USER_SESSION_KEY, JSON.stringify(appUser));
            setCurrentAppUser(appUser);
            setCurrentUserType(appUser.userType);

            if ([UserType.ADMIN, UserType.HR, UserType.TEAMLEAD, UserType.TEAM].includes(appUser.userType)) {
              setActiveAdminMenuItem(AdminMenuItem.Dashboard);
            }
             if (appUser.userType === UserType.PARTNER) {
              setActiveAdminMenuItem(AdminMenuItem.Dashboard);
            }
            if (appUser.userType === UserType.STORE_SUPERVISOR) {
              setActiveAdminMenuItem(AdminMenuItem.SupervisorDashboard);
            }
            if (appUser.userType === UserType.CANDIDATE) {
              const cvCompleted = userProfileData.isCvComplete || false;
              setIsCvComplete(cvCompleted);
              if (cvCompleted) {
                  setActiveCandidateMenuItem(CandidateMenuItem.MyJobs);
              } else {
                  setActiveCandidateMenuItem(CandidateMenuItem.CVGenerator);
              }
            }
          }
        });

      } else {
        localStorage.removeItem(USER_SESSION_KEY);
        setCurrentAppUser(null);
        setCurrentUserProfile(null);
        setCurrentUserType(UserType.NONE);
        setIsCvComplete(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProfile();
    };
  }, []);
  
  const handleLoginSuccess = () => {
    setShowLoginPanelForType(UserType.NONE);
  };

  const handleLoginSelect = useCallback((type: UserType) => { setShowLoginPanelForType(type); setIsRegistering(false); }, []);
  
  const handleLogout = useCallback(async () => { 
    try {
      await signOutUser();
      setActiveAdminMenuItem(AdminMenuItem.Dashboard);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, []);

  const handleCancelLogin = useCallback(() => { setShowLoginPanelForType(UserType.NONE); setIsRegistering(false); }, []);

  const handleAddJob = useCallback(async (newJob: Omit<Job, 'id' | 'postedDate' | 'adminId'>) => {
    if (!currentAppUser || ![UserType.ADMIN, UserType.HR].includes(currentAppUser.userType)) return alert('Only administrators or HR can post jobs.');
    try {
      await createJob({ ...newJob, adminId: currentAppUser.uid });
      alert('Job posted successfully!');
    } catch (error) { console.error("Error creating job:", error); alert('Failed to post job.'); }
  }, [currentAppUser]);
  
  const handleUpdateJob = useCallback(async (job: Job) => {
    if (!currentAppUser || ![UserType.ADMIN, UserType.HR].includes(currentAppUser.userType)) {
      alert('Only administrators or HR can update jobs.');
      return;
    }
    try {
      await updateJob(job);
      alert('Job updated successfully!');
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
        alert('Job deleted successfully!');
      } catch (error) {
        console.error("Error deleting job:", error);
        alert('Failed to delete job.');
      }
    }
  }, [currentAppUser]);

  const handleApplyNow = useCallback((job: Job) => {
    if (currentUserType === UserType.CANDIDATE) {
        setApplyingForJob(job);
    } else if (currentUserType === UserType.NONE) {
        alert('Please log in or create an account to apply for jobs.');
        handleLoginSelect(UserType.CANDIDATE);
    } else {
        alert(`You are logged in as a ${currentUserType.toLowerCase()}. Please log in as a candidate to apply for jobs.`);
    }
  }, [currentUserType, handleLoginSelect]);

  const getLoginTitle = (userType: UserType, isRegistering: boolean): string => {
    if (isRegistering) {
      return `Register - ${userType}`;
    }

    switch (userType) {
      case UserType.TEAM:
        return 'Team Login';
      case UserType.PARTNER:
        return 'Partner Login';
      case UserType.CANDIDATE:
        return 'Candidate Login';
      case UserType.ADMIN:
        return 'Admin Login';
      default:
        return `Login - ${userType}`;
    }
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
            currentUserProfile={currentUserProfile}
            onApplyNow={handleApplyNow}
            isCvComplete={isCvComplete}
            onCvCompletion={handleCvCompletion}
            onProfileUpdate={handleProfileUpdate}
          />
        )}
      </main>

      <ApplyJobModal
        isOpen={!!applyingForJob}
        onClose={() => setApplyingForJob(null)}
        job={applyingForJob}
        currentUserProfile={currentUserProfile}
      />

      {showLoginPanelForType !== UserType.NONE && (
        <Modal
          isOpen={true}
          onClose={handleCancelLogin}
          title={getLoginTitle(showLoginPanelForType, isRegistering)}
          description={showLoginPanelForType === UserType.TEAM ? 'Welcome Team Member. Please log in to access your dashboard.' : `Please log in as a ${showLoginPanelForType.toLowerCase()} to continue.`}
        >
          <LoginPanel
            userType={showLoginPanelForType}
            onLoginSuccess={handleLoginSuccess}
            onLoginError={(msg) => console.error("Login Error:", msg)}
            initialIsSignUp={isRegistering}
          />
        </Modal>
      )}

      <RequestDemoModal isOpen={showRequestDemoModal} onClose={() => setShowRequestDemoModal(false)} />

    </div>
  );
};

export default App;
