
import { initializeApp, deleteApp } from "firebase/app";
import { getDatabase, ref, get, child, push, remove, set, update, onValue, Unsubscribe, query, orderByChild, equalTo } from "firebase/database";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut,
    onAuthStateChanged,
    User as FirebaseUser,
    AuthError
} from "firebase/auth";
import { Job, PanelConfig, Store, UserType, UserProfile, DailyLineup, Candidate, Complaint, WarningLetter, DemoRequest, StoreSupervisor, PartnerRequirement, PartnerInvoice, PartnerSalaryUpdate, CommissionAttendanceRecord, StoreAttendanceRecord, AttendanceStatus } from '../types';

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

export const signUpUser = async (email: string, password: string, fullName: string, phoneNumber: string): Promise<FirebaseUser> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userProfile = {
        uid: user.uid,
        email: user.email,
        userType: UserType.CANDIDATE,
        name: fullName,
        phone: phoneNumber,
        isCvComplete: false,
    };
    
    const db = getDatabase();
    await set(ref(db, `users/${user.uid}`), userProfile);
    
    return user;
};

export const signOutUser = (): Promise<void> => {
    return signOut(auth);
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
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
        default: return 'An unexpected error occurred. Please try again.';
    }
};

export const seedDatabaseWithInitialData = async () => {
  const jobsRef = child(dbRef, 'jobs');
  const snapshot = await get(jobsRef);
  if (!snapshot.exists()) {
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
      console.error("Failed to seed database:", error);
    }
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
    const jobRef = ref(database, 'jobs/' + job.id);
    await set(jobRef, job);
};

export const findCandidateInLineupsByMobile = async (mobile: string): Promise<DailyLineup | null> => {
    const lineupsRef = ref(database, 'daily_lineups');
    const mobileQuery = query(lineupsRef, orderByChild('contact'), equalTo(mobile));
    const snapshot = await get(mobileQuery);
    if (snapshot.exists()) {
        const data = snapshot.val();
        const lineupKey = Object.keys(data)[0];
        return { id: lineupKey, ...data[lineupKey] } as DailyLineup;
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
    await set(newRef, {
        ...lineupData,
        createdAt: new Date().toISOString()
    });
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

export const updateDailyLineup = async (id: string, data: any): Promise<void> => {
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
    const mobileQuery = query(usersRef, orderByChild('phone'), equalTo(mobile));
    const snapshot = await get(mobileQuery);
    if (snapshot.exists()) {
        const data = snapshot.val();
        const userKey = Object.keys(data)[0];
        return { uid: userKey, ...data[userKey] } as UserProfile;
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

export const getVendors = async (): Promise<any[]> => {
  const snapshot = await get(child(dbRef, 'vendors'));
  if (snapshot.exists()) {
    const vendorsData = snapshot.val();
    return Object.entries(vendorsData).map(([id, vendor]) => ({ id, ...vendor as object }));
  }
  return [];
};

export const createVendor = async (vendor: any): Promise<void> => {
    await push(child(dbRef, 'vendors'), vendor);
};

export const updateVendor = async (id: string, vendor: any): Promise<void> => {
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
    const candidateId = lineup.id || push(ref(database, 'candidates')).key!;
    const candidate: Candidate = {
        id: candidateId,
        name: lineup.candidateName,
        phone: lineup.contact,
        role: lineup.role,
        status: 'Interview',
        date: new Date().toISOString(),
        recruiter: lineup.submittedBy || 'Admin',
        vendor: lineup.vendor,
        storeName: lineup.storeName
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

export const onPartnerRequirementsChange = (uid: string, callback: (data: PartnerRequirement[]) => void): Unsubscribe => {
    const reqRef = ref(database, `partner_requirements/${uid}`);
    return onValue(reqRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            callback(Object.keys(data).map(key => ({ id: key, ...data[key] })));
        } else {
            callback([]);
        }
    });
};

export const addPartnerRequirement = async (uid: string, data: any): Promise<void> => {
    const reqRef = ref(database, `partner_requirements/${uid}`);
    await push(reqRef, {
        ...data,
        title: data.role,
        openings: data.count,
        postedDate: new Date().toISOString(),
        submissionStatus: 'Pending Review'
    });
};

export const onPartnerInvoicesChange = (uid: string, callback: (data: PartnerInvoice[]) => void): Unsubscribe => {
    const invRef = ref(database, `partner_invoices/${uid}`);
    return onValue(invRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            callback(Object.keys(data).map(key => ({ id: key, ...data[key] })));
        } else {
            callback([]);
        }
    });
};

export const onSalaryUpdatesChange = (uid: string, callback: (data: PartnerSalaryUpdate[]) => void): Unsubscribe => {
    const salRef = ref(database, `partner_salary_updates/${uid}`);
    return onValue(salRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            callback(Object.keys(data).map(key => ({ id: key, ...data[key] })));
        } else {
            callback([]);
        }
    });
};

export const updateSalaryUpdateStatus = async (uid: string, id: string, status: string): Promise<void> => {
    await update(ref(database, `partner_salary_updates/${uid}/${id}`), { status });
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
