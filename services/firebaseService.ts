
import { initializeApp, deleteApp } from "firebase/app";
import { getDatabase, ref, get, child, push, remove, set, update, onValue, Unsubscribe, query, orderByChild, equalTo } from "firebase/database";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut,
    onAuthStateChanged,
    User as FirebaseUser,
    reauthenticateWithCredential,
    EmailAuthProvider,
    updatePassword,
    AuthError
} from "firebase/auth";
import { Job, PanelConfig, Store, UserType, UserProfile, DailyLineup, Candidate, Complaint, WarningLetter, DemoRequest, StoreSupervisor, PartnerRequirement, PartnerInvoice, PartnerSalaryUpdate, CommissionAttendanceRecord, StoreAttendanceRecord, AttendanceStatus, Role, TeamMember, Ticket, Vendor as VendorType, BrandingConfig } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyDjT48npeCVMoaX-d4qAiJlGl5P7x-aph0",
  authDomain: "team-tracker-316ac.firebaseapp.com",
  databaseURL: "https://team-tracker-316ac-default-rtdb.firebaseio.com",
  projectId: "team-tracker-316ac",
  storageBucket: "team-tracker-316ac.firebasestorage.app",
  messagingSenderId: "544539621042",
  appId: "1:544539621042:web:75559c376a3aecdbbc3bab",
  measurementId: "G-N0XZS5Y2SV"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const dbRef = ref(getDatabase());

export interface RevenueData {
    total: number;
    monthly: { month: string; amount: number }[];
}

export const signInUser = (email: string, password: string): Promise<FirebaseUser> => {
    return signInWithEmailAndPassword(auth, email, password).then(userCredential => userCredential.user);
};

// Helper to infer UserType from role string
const inferUserTypeFromRole = async (role: string): Promise<UserType> => {
    const allRoles = await fetchRoles();
    const matchingRole = allRoles.find(r => r.name.trim().toLowerCase() === role.trim().toLowerCase());

    if (matchingRole) {
        switch (matchingRole.panel) {
            case 'HR': return UserType.HR;
            case 'TeamLead': return UserType.TEAMLEAD;
            case 'Admin': return UserType.ADMIN;
            case 'Partner': return UserType.PARTNER;
            default: return UserType.TEAM;
        }
    } else {
        // Fallback for hardcoded roles or roles not configured in custom_roles
        if (role.toLowerCase().includes('hr')) return UserType.HR;
        else if (role.toLowerCase().includes('lead')) return UserType.TEAMLEAD;
        else if (role.toLowerCase().includes('admin')) return UserType.ADMIN;
    }
    return UserType.TEAM; // Default for team members if no specific role matches
};

export const signUpUser = async (email: string, password: string, fullName: string, phoneNumber: string, inferredUserType: UserType = UserType.CANDIDATE): Promise<FirebaseUser> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const db = getDatabase();
    const newUserProfileRef = ref(db, `users/${user.uid}`);
    const existingProfileSnapshot = await get(query(ref(db, 'users'), orderByChild('email'), equalTo(email)));

    let finalProfileData: UserProfile = {
        uid: user.uid,
        email: user.email,
        userType: inferredUserType,
        name: fullName,
        phone: phoneNumber,
        isCvComplete: inferredUserType !== UserType.CANDIDATE,
    };

    if (existingProfileSnapshot.exists()) {
        const existingProfileData = existingProfileSnapshot.val();
        const existingProfileUid = Object.keys(existingProfileData)[0];
        const skeletalProfile = existingProfileData[existingProfileUid];
        
        // Merge data, but prioritize new auth data (uid, email) and passed-in data (name, phone)
        finalProfileData = {
            ...skeletalProfile, // Carry over things like 'role'
            ...finalProfileData, // Overwrite with correct data
        };
        
        // Remove the old skeletal profile if its UID was a pseudo one
        if (existingProfileUid.startsWith('pseudo_auth_')) {
            await remove(ref(db, `users/${existingProfileUid}`));
        }
    }
    
    // Create the new, correct profile at the correct path
    await set(newUserProfileRef, finalProfileData);
    
    return user;
};

export const signOutUser = (): Promise<void> => {
    return signOut(auth);
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

export const reauthenticateUser = (currentPassword: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user || !user.email) {
        return Promise.reject(new Error("No user is currently signed in."));
    }
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    return reauthenticateWithCredential(user, credential);
};

export const changeUserPassword = (newPassword: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user) {
        return Promise.reject(new Error("No user is currently signed in."));
    }
    return updatePassword(user, newPassword);
};

export const mapAuthError = (error: AuthError): string => {
    switch (error.code) {
        case 'auth/invalid-email': return 'Invalid email address format.';
        case 'auth/user-disabled': return 'This user account has been disabled.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential': return 'Invalid email or password.';
        case 'auth/email-already-in-use': return 'An account with this email address already exists.';
        case 'auth/weak-password': return 'Password is too weak. It should be at least 6 characters.';
        default: return error.message || 'An unexpected error occurred. Please try again.';
    }
};

// --- Branding & Logo Management ---
const BRANDING_PATH = 'branding_config';
const LOGO_PATH = 'branding_config/logoSrc';

export const updateBrandingConfig = async (config: BrandingConfig): Promise<void> => {
    await set(ref(database, BRANDING_PATH), config);
};

export const updateLogoSrc = async (logoSrc: string | null): Promise<void> => {
    await set(ref(database, LOGO_PATH), logoSrc);
};

export const onBrandingConfigChange = (callback: (config: BrandingConfig | null) => void): Unsubscribe => {
    const brandingRef = ref(database, BRANDING_PATH);
    return onValue(brandingRef, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.val() as BrandingConfig);
        } else {
            callback(null);
        }
    });
};


export const seedDatabaseWithInitialData = async () => {
  const jobsRef = child(dbRef, 'jobs');
  const jobsSnapshot = await get(jobsRef);
  if (!jobsSnapshot.exists()) {
    try {
      const response = await fetch('/data.json');
      const jobsArray: any[] = await response.json();
      const updates: { [key: string]: any } = {};
      jobsArray.forEach(job => {
        const { id, ...jobData } = job;
        updates[`/jobs/${id}`] = jobData;
      });
      await update(dbRef, updates);
    } catch (error) {
      console.error("Failed to seed jobs data:", error);
    }
  }

  // Seed default branding and logo if they don't exist
  const brandingRef = child(dbRef, BRANDING_PATH);
  const brandingSnapshot = await get(brandingRef);
  if (!brandingSnapshot.exists()) {
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
      await set(brandingRef, defaultBranding);
  }

  const logoRef = child(dbRef, LOGO_PATH);
  const logoSnapshot = await get(logoRef);
  if (!logoSnapshot.exists()) {
      const defaultLogo = 'https://rkm-pro-502a5.web.app/images/rkm.png';
      await set(logoRef, defaultLogo);
  }
};

export const onJobsChange = (callback: (jobs: Job[]) => void): Unsubscribe => {
  const jobsRef = child(dbRef, 'jobs');
  return onValue(jobsRef, (snapshot) => {
    if (snapshot.exists()) {
      const jobsData = snapshot.val();
      const jobsArray = Object.keys(jobsData).map(key => ({
        id: key,
        title: jobsData[key].title,
        company: jobsData[key].company,
        storeName: jobsData[key].store_name,
        description: jobsData[key].description,
        postedDate: jobsData[key].posted_date,
        adminId: jobsData[key].admin_id,
        experienceLevel: jobsData[key].experience_level,
        salaryRange: jobsData[key].salary_range,
        numberOfOpenings: jobsData[key].number_of_openings,
        companyLogoSrc: jobsData[key].company_logo_src,
        jobCategory: jobsData[key].job_category,
        jobCity: jobsData[key].job_city,
        locality: jobsData[key].locality,
        minQualification: jobsData[key].min_qualification,
        genderPreference: jobsData[key].gender_preference,
        jobType: jobsData[key].job_type,
        workLocationType: jobsData[key].work_location_type,
        workingDays: jobsData[key].working_days,
        jobShift: jobsData[key].job_shift,
        interviewAddress: jobsData[key].interview_address,
        salaryType: jobsData[key].salary_type,
        incentive: jobsData[key].incentive,
      }));
      callback(jobsArray.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()));
    } else {
      callback([]);
    }
  });
};

export const createJob = async (job: Omit<Job, 'id' | 'postedDate'>): Promise<Job | null> => {
    try {
        const jobsRef = child(dbRef, 'jobs');
        const newJobRef = push(jobsRef);
        const data = {
            ...job,
            posted_date: new Date().toISOString()
        };
        await set(newJobRef, data);
        return { id: newJobRef.key!, ...job, postedDate: data.posted_date };
    } catch (error) {
        return null;
    }
};

export const deleteJob = async (id: string): Promise<void> => {
    await remove(ref(database, 'jobs/' + id));
};

export const updateJob = async (job: Job): Promise<void> => {
    await set(ref(database, 'jobs/' + job.id), job);
};

export const findCandidateInLineupsByMobile = async (mobile: string): Promise<DailyLineup | null> => {
    const lineupsRef = ref(database, 'daily_lineups');
    try {
        const mobileQuery = query(lineupsRef, orderByChild('contact'), equalTo(mobile));
        const snapshot = await get(mobileQuery);
        if (snapshot.exists()) {
            const data = snapshot.val();
            const lineupKey = Object.keys(data)[0];
            return { id: lineupKey, ...data[lineupKey] } as DailyLineup;
        }
    } catch (e: any) {
        console.warn("findCandidateInLineupsByMobile indexed query failed, falling back to client-side filtering:", e.message);
        const allSnapshot = await get(lineupsRef);
        if (allSnapshot.exists()) {
            const allData = allSnapshot.val();
            const foundKey = Object.keys(allData).find(key => allData[key].contact === mobile);
            if (foundKey) return { id: foundKey, ...allData[foundKey] } as DailyLineup;
        }
    }
    return null;
};

export const onUserApplicationsChange = (mobile: string, callback: (applications: DailyLineup[]) => void): Unsubscribe => {
    const lineupsRef = ref(database, 'daily_lineups');
    const userQuery = query(lineupsRef, orderByChild('contact'), equalTo(mobile));
    return onValue(userQuery, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const apps: DailyLineup[] = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
            callback(apps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } else {
            callback([]);
        }
    });
};

export const addDailyLineup = async (lineupData: Omit<DailyLineup, 'id' | 'createdAt'>): Promise<void> => {
    const lineupsRef = ref(database, 'daily_lineups');
    const newRef = push(lineupsRef);
    const createdAt = new Date().toISOString();

    // First, save to the daily_lineups collection as before
    await set(newRef, {
        ...lineupData,
        createdAt: createdAt
    });

    // Now, create the full lineup object to pass to the selection pipeline function
    const fullLineupData: DailyLineup = {
        ...lineupData,
        id: newRef.key!,
        createdAt: createdAt,
    };
    
    // Also add to the main 'candidates' collection for the Selection Dashboard
    await addCandidateToSelection(fullLineupData);
};


export const onDailyLineupsChange = (callback: (lineups: DailyLineup[]) => void): Unsubscribe => {
    const lineupsRef = ref(database, 'daily_lineups');
    return onValue(lineupsRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const lineupsArray: DailyLineup[] = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
            callback(lineupsArray.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } else {
            callback([]);
        }
    });
};

export const updateDailyLineup = async (id: string, data: Partial<DailyLineup>): Promise<void> => {
    await update(ref(database, 'daily_lineups/' + id), data);
};

export const getDailyLineups = async (): Promise<DailyLineup[]> => {
    const snapshot = await get(child(dbRef, 'daily_lineups'));
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    }
    return [];
};

export const getUserProfile = async (uid: string): Promise<any | null> => {
  const snapshot = await get(child(dbRef, `users/${uid}`));
  return snapshot.exists() ? snapshot.val() : null;
};

export const getUserProfileByMobile = async (mobile: string): Promise<UserProfile | null> => {
    const usersRef = ref(database, 'users');
    try {
        const mobileQuery = query(usersRef, orderByChild('phone'), equalTo(mobile));
        const snapshot = await get(mobileQuery);
        if (snapshot.exists()) {
            const data = snapshot.val();
            const userKey = Object.keys(data)[0];
            return { uid: userKey, ...data[userKey] } as UserProfile;
        }
    } catch (e: any) {
        // Fix: Corrected error message from "findSupervisorByEmail indexed query failed..."
        console.warn("getUserProfileByMobile indexed query failed, falling back to client-side filtering:", e.message);
        const allSnapshot = await get(usersRef);
        if (allSnapshot.exists()) {
            const allData = allSnapshot.val();
            const foundKey = Object.keys(allData).find(key => allData[key].phone === mobile);
            if (foundKey) return { uid: foundKey, ...allData[foundKey] } as UserProfile;
        }
    }
    return null;
};

export const updateUserProfile = async (uid: string, profileData: Partial<UserProfile>): Promise<void> => {
    const userProfileRef = ref(database, `users/${uid}`);
    await update(userProfileRef, profileData);
};

export const getUsers = async (): Promise<UserProfile[]> => {
    const snapshot = await get(child(dbRef, 'users'));
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({ uid: key, ...data[key] }));
    }
    return [];
};

export const onUsersChange = (callback: (users: UserProfile[]) => void): Unsubscribe => {
    const usersRef = ref(database, 'users');
    return onValue(usersRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            callback(Object.keys(data).map(key => ({ uid: key, ...data[key] })));
        } else {
            callback([]);
        }
    });
};

export const getVendors = async (): Promise<VendorType[]> => {
  const snapshot = await get(child(dbRef, 'vendors'));
  if (snapshot.exists()) {
    const vendorsData = snapshot.val();
    // Fix: Explicitly cast `vendor` to `VendorType` to ensure all properties are considered.
    return Object.entries(vendorsData).map(([id, vendor]) => ({ id, ...vendor as VendorType }));
  }
  return [];
};

export const createVendor = async (vendor: Omit<VendorType, 'id'>): Promise<void> => {
    await push(child(dbRef, 'vendors'), vendor);
};

export const updateVendor = async (id: string, vendor: Omit<VendorType, 'id'>): Promise<void> => {
    await update(ref(database, 'vendors/' + id), vendor);
};

export const getPanelConfig = async (): Promise<PanelConfig | null> => {
  const snapshot = await get(child(dbRef, 'panel_config'));
  return snapshot.exists() ? snapshot.val() as PanelConfig : null;
};

export const updatePanelConfig = async (config: PanelConfig): Promise<void> => {
    await set(ref(database, 'panel_config'), config);
};

export const onCandidatesChange = (callback: (candidates: Candidate[]) => void): Unsubscribe => {
  const candidatesRef = ref(database, 'candidates');
  return onValue(candidatesRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      callback(Object.keys(data).map(key => ({ id: key, ...data[key] })));
    } else {
      callback([]);
    }
  });
};

export const getCandidates = async (): Promise<Candidate[]> => {
    const snapshot = await get(child(dbRef, 'candidates'));
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    }
    return [];
};

export const updateCandidateStatus = async (id: string, status: string): Promise<void> => {
    await update(ref(database, 'candidates/' + id), { status });
};

export const updateCandidate = async (id: string, data: any): Promise<void> => {
    await update(ref(database, 'candidates/' + id), data);
};

export const addCandidateToSelection = async (lineup: DailyLineup): Promise<void> => {
    const candidateId = lineup.id; // Use existing lineup ID

    let pipelineStartDate = lineup.createdAt; // Default to creation date ISO string

    if (lineup.callStatus === 'Interested' && lineup.interviewDate) {
        // lineup.interviewDate is 'YYYY-MM-DD'
        const today = new Date();
        const todayDateStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
        
        // If interview date is in the future
        if (lineup.interviewDate > todayDateStr) {
            // Create a date object from YYYY-MM-DD as UTC to get a reliable ISO string
            pipelineStartDate = new Date(lineup.interviewDate + 'T00:00:00Z').toISOString();
        }
    }

    const candidate: Candidate = {
        id: candidateId,
        name: lineup.candidateName,
        phone: lineup.contact,
        role: lineup.role,
        status: 'Sourced',
        date: lineup.createdAt, // Sourced/application date
        pipelineStartDate: pipelineStartDate, // Date to appear in pipeline
        recruiter: lineup.recruiterUid || 'Admin',
        vendor: lineup.vendor,
        storeName: lineup.storeName,
        interviewDate: lineup.interviewDate || null,
        interviewTime: lineup.interviewTime || null,
        interviewPlace: lineup.interviewPlace || null,
    };
    await set(ref(database, 'candidates/' + candidateId), candidate);
};


export const onStoreEmployeesChange = (storeName: string, callback: (employees: Candidate[]) => void): Unsubscribe => {
    const candidatesRef = ref(database, 'candidates');
    const storeQuery = query(candidatesRef, orderByChild('storeName'), equalTo(storeName));
    return onValue(storeQuery, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            callback(Object.keys(data).map(key => ({ id: key, ...data[key] })).filter(c => c.status === 'Hired'));
        } else {
            callback([]);
        }
    });
};

export const onStoreAttendanceChange = (storeLocation: string, date: string, callback: (records: Record<string, AttendanceStatus> | null) => void): Unsubscribe => {
    const attendanceRef = ref(database, `store_attendance/${storeLocation}/${date}`);
    return onValue(attendanceRef, (snapshot) => callback(snapshot.val()));
};

export const saveStoreAttendance = async (storeLocation: string, date: string, records: Record<string, AttendanceStatus>): Promise<void> => {
    await set(ref(database, `store_attendance/${storeLocation}/${date}`), records);
};

export const onAttendanceForMonthChange = (month: string, callback: (data: any) => void): Unsubscribe => {
    const attendanceRef = ref(database, `attendance/${month}`);
    return onValue(attendanceRef, (snapshot) => callback(snapshot.val()));
};

export const saveEmployeeAttendance = async (month: string, data: any): Promise<void> => {
    await set(ref(database, `attendance/${month}`), data);
};

export const getAttendanceForMonth = async (month: string): Promise<any> => {
    const snapshot = await get(ref(database, `attendance/${month}`));
    return snapshot.exists() ? snapshot.val() : null;
};

export const onComplaintsChange = (callback: (data: Complaint[]) => void): Unsubscribe => {
    const complaintsRef = ref(database, 'complaints');
    return onValue(complaintsRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            callback(Object.keys(data).map(key => ({ id: key, ...data[key] })));
        } else {
            callback([]);
        }
    });
};

export const addComplaint = async (data: any): Promise<void> => {
    await push(ref(database, 'complaints'), data);
};

export const updateComplaint = async (id: string, data: any): Promise<void> => {
    await update(ref(database, 'complaints/' + id), data);
};

export const getComplaints = async (): Promise<Complaint[]> => {
    const snapshot = await get(child(dbRef, 'complaints'));
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    }
    return [];
};

// --- HELP CENTER TICKETS & SLA ---

export const onTicketsChange = (callback: (data: Ticket[]) => void): Unsubscribe => {
    const ticketsRef = ref(database, 'help_tickets');
    return onValue(ticketsRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const tickets = Object.keys(data).map(key => ({ id: key, ...data[key] })).sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());
            callback(tickets);
        } else {
            callback([]);
        }
    });
};

/**
 * Automates escalation based on SLA rules:
 * Level 1 (HR): 3 Days
 * Level 2 (Manager): 2 Additional Days
 * Level 3 (Admin): Final Escalation
 */
export const runEscalationPulse = async (tickets: Ticket[]) => {
    const now = new Date();
    const updates: Record<string, any> = {};
    
    // Fetch staff records to find reporting managers
    const teamSnapshot = await get(ref(database, 'team_members'));
    const teamMembers: TeamMember[] = teamSnapshot.exists() ? Object.values(teamSnapshot.val()) : [];

    tickets.forEach(ticket => {
        if (ticket.status === 'Resolved') return;

        const deadline = new Date(ticket.slaDeadline);
        if (now > deadline) {
            if (ticket.escalationLevel === 0) {
                // Level 1 -> 2: Escalate to HR's Reporting Manager
                const currentHandler = teamMembers.find(m => m.name === ticket.assignedToName);
                const managerName = currentHandler?.reportingManager || 'Admin';
                
                // Add 2 days extension for the manager
                const newDeadline = new Date();
                newDeadline.setDate(newDeadline.getDate() + 2);

                updates[`help_tickets/${ticket.id}/assignedToName`] = managerName;
                updates[`help_tickets/${ticket.id}/escalationLevel`] = 1;
                updates[`help_tickets/${ticket.id}/slaDeadline`] = newDeadline.toISOString();
                updates[`help_tickets/${ticket.id}/hrRemarks`] = (ticket.hrRemarks || '') + `\n[Auto-Escalated to Manager ${managerName} after HR SLA breach]`;
            } 
            else if (ticket.escalationLevel === 1) {
                // Level 2 -> 3: Escalate to Admin
                updates[`help_tickets/${ticket.id}/assignedToName`] = 'Admin';
                updates[`help_tickets/${ticket.id}/escalationLevel`] = 2;
                // Admin level has no specific automated deadline extension; handled manually
                updates[`help_tickets/${ticket.id}/hrRemarks`] = (ticket.hrRemarks || '') + `\n[Auto-Escalated to Admin after Manager SLA breach]`;
            }
        }
    });

    if (Object.keys(updates).length > 0) {
        await update(ref(database), updates);
        return true;
    }
    return false;
};

export const onUserTicketsChange = (userId: string, callback: (data: Ticket[]) => void): Unsubscribe => {
    const ticketsRef = ref(database, 'help_tickets');
    
    // Robust indexing check - RTDB orderByChild needs rules. Fallback to client filter if missing.
    try {
        const userQuery = query(ticketsRef, orderByChild('userId'), equalTo(userId));
        return onValue(userQuery, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                callback(Object.keys(data).map(key => ({ id: key, ...data[key] })).sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime()));
            } else {
                callback([]);
            }
        }, (error) => {
            console.warn("Tickets query failed, likely missing index. Using client-side fallback.");
        });
    } catch (e) {
        // Fallback: fetch all and filter client-side for reliable dev experience
        return onValue(ticketsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const filtered = Object.keys(data)
                    .map(key => ({ id: key, ...data[key] }))
                    .filter(t => t.userId === userId)
                    .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());
                callback(filtered);
            } else {
                callback([]);
            }
        });
    }
};

export const addTicket = async (data: Omit<Ticket, 'id'>): Promise<void> => {
    await push(ref(database, 'help_tickets'), data);
};

export const updateTicket = async (id: string, data: Partial<Ticket>): Promise<void> => {
    await update(ref(database, `help_tickets/${id}`), data);
};

// --- WARNING LETTERS ---

export const onWarningLettersChange = (callback: (data: WarningLetter[]) => void): Unsubscribe => {
    const lettersRef = ref(database, 'warning_letters');
    return onValue(lettersRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            callback(Object.keys(data).map(key => ({ id: key, ...data[key] })));
        } else {
            callback([]);
        }
    });
};

export const addWarningLetter = async (data: any): Promise<void> => {
    await push(ref(database, 'warning_letters'), data);
};

export const updateWarningLetter = async (id: string, data: any): Promise<void> => {
    await update(ref(database, 'warning_letters/' + id), data);
};

export const getWarningLetters = async (): Promise<WarningLetter[]> => {
    const snapshot = await get(child(dbRef, 'warning_letters'));
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    }
    return [];
};

export const onAllPartnerRequirementsChange = (callback: (data: (PartnerRequirement & { partnerUid: string })[]) => void): Unsubscribe => {
    const reqsRef = ref(database, 'partner_requirements');
    return onValue(reqsRef, (snapshot) => {
        if (snapshot.exists()) {
            const allReqs: any[] = [];
            const data = snapshot.val();
            Object.keys(data).forEach(partnerUid => {
                const partnerReqs = data[partnerUid];
                Object.keys(partnerReqs).forEach(reqId => {
                    allReqs.push({ id: reqId, partnerUid, ...partnerReqs[reqId] });
                });
            });
            callback(allReqs);
        } else {
            callback([]);
        }
    });
};

export const onDemoRequestsChange = (callback: (data: DemoRequest[]) => void): Unsubscribe => {
    const demoRef = ref(database, 'demo_requests');
    return onValue(demoRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            callback(Object.keys(data).map(key => ({ id: key, ...data[key] })));
        } else {
            callback([]);
        }
    });
};

export const addDemoRequest = async (data: any): Promise<void> => {
    await push(ref(database, 'demo_requests'), { ...data, requestDate: new Date().toISOString() });
};

export const getRevenueData = async (): Promise<RevenueData> => {
    const snapshot = await get(child(dbRef, 'revenue'));
    return snapshot.exists() ? snapshot.val() : { total: 0, monthly: [] };
};

export const createSupervisor = async (data: { name: string; email: string; phone: string; storeLocation: string }): Promise<void> => {
    const supRef = ref(database, 'supervisors');
    await push(supRef, { ...data, status: 'Active' });
};

export const onSupervisorsChange = (callback: (data: StoreSupervisor[]) => void): Unsubscribe => {
    const supRef = ref(database, 'supervisors');
    return onValue(supRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            callback(Object.keys(data).map(key => ({ id: key, ...data[key] })));
        } else {
            callback([]);
        }
    });
};

export const updateSupervisor = async (id: string, data: any): Promise<void> => {
    await update(ref(database, 'supervisors/' + id), data);
};

export const findSupervisorByEmail = async (email: string): Promise<StoreSupervisor | null> => {
    const supRef = ref(database, 'supervisors');
    try {
        const emailQuery = query(supRef, orderByChild('email'), equalTo(email));
        const snapshot = await get(emailQuery);
        if (snapshot.exists()) {
            const data = snapshot.val();
            const key = Object.keys(data)[0];
            return { id: key, ...data[key] } as StoreSupervisor;
        }
        // If not found in supervisors, check users collection for a matching UserProfile
        const userProfile = await findUserProfileByEmail(email);
        if (userProfile && userProfile.userType === UserType.STORE_SUPERVISOR) {
            return {
                id: userProfile.uid,
                name: userProfile.name || '',
                email: userProfile.email || '',
                phone: userProfile.phone || '',
                storeLocation: userProfile.storeLocation || '',
                status: 'Active' // Default status, might need to be dynamic
            } as StoreSupervisor;
        }
    } catch (e: any) {
        console.warn("findSupervisorByEmail indexed query failed, falling back to client-side filtering:", e.message);
        const allSnapshot = await get(supRef);
        if (allSnapshot.exists()) {
            const allData = allSnapshot.val();
            const foundKey = Object.keys(allData).find(key => allData[key].email?.toLowerCase() === email.toLowerCase());
            if (foundKey) return { id: foundKey, ...allData[foundKey] } as StoreSupervisor;
        }
    }
    return null;
};

export const findUserProfileByEmail = async (email: string): Promise<UserProfile | null> => {
    const usersRef = ref(database, 'users');
    const emailQuery = query(usersRef, orderByChild('email'), equalTo(email));
    const snapshot = await get(emailQuery);
    if (snapshot.exists()) {
        const data = snapshot.val();
        const userUid = Object.keys(data)[0];
        return { uid: userUid, ...data[userUid] } as UserProfile;
    }
    return null;
}

// --- ROLE MANAGEMENT FUNCTIONS ---

export const fetchRoles = async (): Promise<Role[]> => {
    const rolesRef = ref(database, 'custom_roles');
    const snapshot = await get(rolesRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    }
    return [];
};

export const onRolesChange = (callback: (roles: Role[]) => void): Unsubscribe => {
    const rolesRef = ref(database, 'custom_roles');
    return onValue(rolesRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            callback(Object.keys(data).map(key => ({ id: key, ...data[key] })));
        } else {
            callback([]);
        }
    });
};

export const addRole = async (name: string, panel: Role['panel']): Promise<void> => {
    const rolesRef = ref(database, 'custom_roles');
    await push(rolesRef, { name, panel });
};

export const deleteRole = async (id: string): Promise<void> => {
    await remove(ref(database, `custom_roles/${id}`));
};

// --- TEAM MEMBER PERSISTENCE ---

export const onTeamMembersChange = (callback: (members: TeamMember[]) => void): Unsubscribe => {
    const teamRef = ref(database, 'team_members');
    return onValue(teamRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            callback(Object.keys(data).map(key => ({ id: key, ...data[key] })));
        } else {
            callback([]);
        }
    });
};

export const findTeamMemberByEmail = async (email: string): Promise<TeamMember | null> => {
    const teamRef = ref(database, 'team_members');
    try {
        const emailQuery = query(teamRef, orderByChild('email'), equalTo(email));
        const snapshot = await get(emailQuery);
        if (snapshot.exists()) {
            const data = snapshot.val();
            const key = Object.keys(data)[0];
            // @ts-ignore - id is added for frontend use
            return { id: key, ...data[key] } as TeamMember;
        }
    } catch (e: any) {
        console.warn("findTeamMemberByEmail indexed query failed, falling back to client-side filtering:", e.message);
        // Fix: Use teamRef instead of undefined usersRef in fallback query
        const allSnapshot = await get(teamRef);
        if (allSnapshot.exists()) {
            const allData = allSnapshot.val();
            const foundKey = Object.keys(allData).find(key => allData[key].email?.toLowerCase() === email.toLowerCase());
            if (foundKey) {
                return { id: foundKey, ...allData[foundKey] } as TeamMember;
            }
        }
    }
    return null;
};

export const createTeamMember = async (data: Omit<TeamMember, 'id'>): Promise<void> => {
    const teamRef = ref(database, 'team_members');
    const newTeamMemberRef = push(teamRef);
    await set(newTeamMemberRef, data);

    // --- NEW LOGIC: Ensure corresponding UserProfile exists with correct userType ---
    const email = data.email;
    const name = data.name;
    const phone = data.mobile;

    const resolvedUserType: UserType = await inferUserTypeFromRole(data.role);

    const usersRef = ref(database, 'users');
    const emailQuery = query(usersRef, orderByChild('email'), equalTo(email));
    const snapshot = await get(emailQuery);

    if (snapshot.exists()) {
        const userData = snapshot.val();
        const userUid = Object.keys(userData)[0]; // Get the UID of the existing user
        await update(ref(database, `users/${userUid}`), {
            userType: resolvedUserType,
            name: name,
            phone: phone,
            role: data.role, // Store the specific role string from TeamMember
            isCvComplete: true, // Assuming non-candidates have their profile 'complete'
        });
    } else {
        // Create new skeletal UserProfile if it doesn't exist
        // This profile uses a pseudo-UID until the user actually signs up with Firebase Auth.
        // The LoginPanel will later update this profile with the real UID.
        const pseudoUid = `pseudo_auth_${btoa(email).replace(/=/g, '')}`; // Simple base64 encode for pseudo-UID
        await set(ref(database, `users/${pseudoUid}`), {
            uid: pseudoUid, // This is a temporary UID
            email: email,
            userType: resolvedUserType,
            name: name,
            phone: phone,
            isCvComplete: true,
            role: data.role // Store the specific role string
        });
    }
    // --- END NEW LOGIC ---
};

export const updateTeamMember = async (id: string, data: Partial<TeamMember>): Promise<void> => {
    const teamMemberRef = ref(database, `team_members/${id}`);
    await update(teamMemberRef, data);

    // Also update the corresponding UserProfile to keep data in sync
    // Fix: Use 'mobile' from TeamMember type instead of 'phone'.
    if (data.email && (data.name || data.mobile || data.role)) {
        const userProfile = await findUserProfileByEmail(data.email);
        if (userProfile) {
            const profileUpdates: Partial<UserProfile> = {};
            if (data.name) profileUpdates.name = data.name;
            // Fix: Use 'mobile' from TeamMember and assign it to 'phone' in UserProfile.
            if (data.mobile) profileUpdates.phone = data.mobile;
            if (data.role) {
                profileUpdates.role = data.role;
                profileUpdates.userType = await inferUserTypeFromRole(data.role);
            }
            await updateUserProfile(userProfile.uid, profileUpdates);
        }
    }
};


export const deleteTeamMember = async (id: string): Promise<void> => {
    // Optionally delete associated UserProfile if it's a pseudo one
    const teamMemberRef = ref(database, `team_members/${id}`);
    const teamMemberSnapshot = await get(teamMemberRef);
    if (teamMemberSnapshot.exists()) {
        const teamMemberData = teamMemberSnapshot.val() as TeamMember;
        if (teamMemberData.email) {
            const userProfile = await findUserProfileByEmail(teamMemberData.email);
            if (userProfile?.uid.startsWith('pseudo_auth_')) {
                await remove(ref(database, `users/${userProfile.uid}`));
            }
        }
    }
    await remove(ref(database, `team_members/${id}`));
};

// --- PARTNER SCOPED DATA ---

// Fix: Add missing export onPartnerRequirementsChange
export const onPartnerRequirementsChange = (partnerUid: string, callback: (data: PartnerRequirement[]) => void): Unsubscribe => {
    const reqsRef = ref(database, `partner_requirements/${partnerUid}`);
    return onValue(reqsRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            callback(Object.keys(data).map(key => ({ id: key, ...data[key] })));
        } else {
            callback([]);
        }
    });
};

// Fix: Add missing export addPartnerRequirement
export const addPartnerRequirement = async (partnerUid: string, data: { role: string; client: string; location: string; count: number; }): Promise<void> => {
    const reqsRef = ref(database, `partner_requirements/${partnerUid}`);
    const newRef = push(reqsRef);
    await set(newRef, {
        title: data.role,
        client: data.client,
        location: data.location,
        openings: data.count,
        postedDate: new Date().toISOString(),
        submissionStatus: 'Pending Review',
        description: '',
        jobType: 'Full-time',
        workingDays: '6 days',
        jobShift: 'Day Shift',
        salary: 'TBD',
        experience: 'TBD'
    });
};

// Fix: Add missing export onPartnerInvoicesChange
export const onPartnerInvoicesChange = (partnerUid: string, callback: (data: PartnerInvoice[]) => void): Unsubscribe => {
    const invoicesRef = ref(database, `partner_invoices/${partnerUid}`);
    return onValue(invoicesRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            callback(Object.keys(data).map(key => ({ id: key, ...data[key] })));
        } else {
            callback([]);
        }
    });
};

// Fix: Add missing export onSalaryUpdatesChange
export const onSalaryUpdatesChange = (partnerUid: string, callback: (data: PartnerSalaryUpdate[]) => void): Unsubscribe => {
    const updatesRef = ref(database, `partner_salary_updates/${partnerUid}`);
    return onValue(updatesRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            callback(Object.keys(data).map(key => ({ id: key, ...data[key] })));
        } else {
            callback([]);
        }
    });
};

// Fix: Add missing export updateSalaryUpdateStatus
export const updateSalaryUpdateStatus = async (partnerUid: string, updateId: string, status: PartnerSalaryUpdate['status']): Promise<void> => {
    const updateRef = ref(database, `partner_salary_updates/${partnerUid}/${updateId}`);
    await update(updateRef, { status });
};
