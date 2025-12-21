import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Header from './components/Header';
import LoginPanel from './components/LoginPanel';
import Dashboard from './components/Dashboard';
import HomePage from './components/HomePage';
import Modal from './components/Modal';
import RequestDemoModal from './components/RequestDemoModal';
import ApplyJobModal from './components/ApplyJobModal';
// Added missing Complaint import from types.ts
import { UserType, Job, AdminMenuItem, CandidateMenuItem, AppUser, BrandingConfig, CandidatePipelineStats, VendorStats, Complaint, ComplaintStats, PartnerRequirementStats, ProcessMetric, RoleMetric, TeamMemberPerformance, UserProfile, DailyLineup, Candidate } from './types';
import { onJobsChange, createJob, deleteJob, updateJob, onAuthChange, signOutUser, seedDatabaseWithInitialData, getUserProfile, updateUserProfile, onDailyLineupsChange, onCandidatesChange, getUsers, onComplaintsChange, onAllPartnerRequirementsChange } from './services/firebaseService';
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
  const [isCvComplete, setIsCvComplete] = useState(false);
  const [applyingForJob, setApplyingForJob] = useState<Job | null>(null);
  const [isViewDashboard, setIsViewDashboard] = useState(false);

  // Raw data for stats calculation
  const [lineups, setLineups] = useState<DailyLineup[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [partnerReqs, setPartnerReqs] = useState<any[]>([]);
  
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

  // Calculate Team Performance Metrics Dynamically
  const teamPerformance: TeamMemberPerformance[] = useMemo(() => {
    const teamUsers = allUsers.filter(u => 
        [UserType.ADMIN, UserType.HR, UserType.TEAM, UserType.TEAMLEAD].includes(u.userType as UserType)
    );

    return teamUsers.map(user => {
        const userName = user.name || 'Unknown';
        const userLineups = lineups.filter(l => l.submittedBy === userName);
        const userCandidates = candidates.filter(c => c.recruiter === userName);

        const total = userLineups.length;
        const selected = userCandidates.filter(c => c.status === 'Selected' || c.status === 'Hired').length;
        const rejected = userCandidates.filter(c => c.status === 'Rejected').length;
        const quit = userCandidates.filter(c => c.status === 'Quit').length;
        const pending = Math.max(0, total - (selected + rejected + quit));
        const successRate = total > 0 ? (selected / total) * 100 : 0;

        return {
            teamMember: userName,
            role: user.userType === UserType.ADMIN ? 'Administrator' : user.userType,
            total,
            selected,
            pending,
            rejected,
            quit,
            successRate
        };
    }).sort((a, b) => b.total - a.total);
  }, [allUsers, lineups, candidates]);

  // Combined stats object
  const dashboardStats: DashboardStats = useMemo(() => {
    const activeCount = candidates.filter(c => c.status === 'Sourced' || c.status === 'Screening').length;
    const interviewCount = candidates.filter(c => c.status === 'Interview').length;
    const rejectedCount = candidates.filter(c => c.status === 'Rejected').length;
    const quitCount = candidates.filter(c => c.status === 'Quit').length;

    const activeComplaints = complaints.filter(c => c.status === 'Active').length;
    const closedComplaints = complaints.filter(c => c.status === 'Closed').length;

    const pendingReqs = partnerReqs.filter(r => r.submissionStatus === 'Pending Review').reduce((acc, r) => acc + (r.openings || 0), 0);
    const approvedReqs = partnerReqs.filter(r => r.submissionStatus === 'Approved').reduce((acc, r) => acc + (r.openings || 0), 0);

    return {
        pipeline: { active: activeCount, interview: interviewCount, rejected: rejectedCount, quit: quitCount },
        vendor: { total: [...new Set(lineups.map(l => l.vendor).filter(v => v !== 'Direct'))].length },
        complaint: { active: activeComplaints, closed: closedComplaints },
        partnerRequirement: { total: pendingReqs + approvedReqs, pending: pendingReqs, approved: approvedReqs },
        process: [
            { name: 'Sourced', count: candidates.filter(c => c.status === 'Sourced').length, color: 'bg-blue-400' },
            { name: 'Screening', count: candidates.filter(c => c.status === 'Screening').length, color: 'bg-blue-500' },
            { name: 'Interview', count: interviewCount, color: 'bg-indigo-500' },
            { name: 'Offer Sent', count: candidates.filter(c => c.status === 'Offer Sent').length, color: 'bg-indigo-600' },
            { name: 'Selected', count: candidates.filter(c => c.status === 'Selected').length, color: 'bg-purple-500' },
            { name: 'Hired', count: candidates.filter(c => c.status === 'Hired').length, color: 'bg-green-500' },
        ],
        role: [
            { name: 'Picker', count: candidates.filter(c => c.role?.toLowerCase().includes('picker')).length, color: 'bg-cyan-500' },
            { name: 'Packer', count: candidates.filter(c => c.role?.toLowerCase().includes('packer')).length, color: 'bg-teal-500' },
            { name: 'Rider', count: candidates.filter(c => c.role?.toLowerCase().includes('rider')).length, color: 'bg-emerald-500' },
        ],
        team: teamPerformance
    };
  }, [lineups, candidates, complaints, partnerReqs, teamPerformance]);

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

    const unsubJobs = onJobsChange(setJobs);
    const unsubLineups = onDailyLineupsChange(setLineups);
    const unsubCandidates = onCandidatesChange(setCandidates);
    const unsubComplaints = onComplaintsChange(setComplaints);
    const unsubReqs = onAllPartnerRequirementsChange(setPartnerReqs);
    getUsers().then(setAllUsers);

    return () => {
      unsubJobs();
      unsubLineups();
      unsubCandidates();
      unsubComplaints();
      unsubReqs();
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
            setActiveCandidateMenuItem(CandidateMenuItem.JobBoard);
            alert('CV details saved! You can now apply for jobs.');
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
            
            // Set initial dashboard states based on user type
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
                  setActiveCandidateMenuItem(CandidateMenuItem.JobBoard);
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
        setIsViewDashboard(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProfile();
    };
  }, []);
  
  const handleLoginSuccess = () => {
    const attemptedType = showLoginPanelForType;
    setShowLoginPanelForType(UserType.NONE);
    if (attemptedType === UserType.CANDIDATE) {
        setIsViewDashboard(false); 
    } else {
        setIsViewDashboard(true);
    }
  };

  const handleLoginSelect = useCallback((type: UserType) => { setShowLoginPanelForType(type); setIsRegistering(false); }, []);
  
  const handleLogout = useCallback(async () => { 
    try {
      await signOutUser();
      setActiveAdminMenuItem(AdminMenuItem.Dashboard);
      setIsViewDashboard(false);
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
        if (!isCvComplete) {
            alert('Please complete your CV before applying for jobs.');
            setIsViewDashboard(true);
            setActiveCandidateMenuItem(CandidateMenuItem.CVGenerator);
            return;
        }
        setApplyingForJob(job);
    } else if (currentUserType === UserType.NONE) {
        alert('Please log in or create an account as an employee to apply for jobs.');
        handleLoginSelect(UserType.CANDIDATE);
    } else {
        alert(`You are logged in as a ${currentUserType.toLowerCase()}. Please log in as an employee to apply for jobs.`);
    }
  }, [currentUserType, isCvComplete, handleLoginSelect]);

  const getLoginTitle = (userType: UserType, isRegistering: boolean): string => {
    if (isRegistering) {
      return `Register - ${userType === UserType.CANDIDATE ? 'Employee' : userType}`;
    }

    switch (userType) {
      case UserType.TEAM:
        return 'Team Login';
      case UserType.PARTNER:
        return 'Partner Login';
      case UserType.CANDIDATE:
        return 'Employee Login';
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
        isShowingDashboard={isViewDashboard}
        onHomeClick={() => setIsViewDashboard(false)}
        onDashboardClick={() => setIsViewDashboard(true)}
      />
      <main>
        {!isViewDashboard ? (
          <HomePage
            jobs={jobs}
            onApplyNow={handleApplyNow}
            currentUserType={currentUserType}
            onLoginSelect={handleLoginSelect}
            onNavigateToAdminJobBoard={() => {
                setIsViewDashboard(true);
                setActiveAdminMenuItem(AdminMenuItem.ManageJobBoard);
            }}
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
          description={showLoginPanelForType === UserType.TEAM ? 'Welcome Team Member. Please log in to access your dashboard.' : `Please log in as an ${showLoginPanelForType === UserType.CANDIDATE ? 'employee' : showLoginPanelForType.toLowerCase()} to continue.`}
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