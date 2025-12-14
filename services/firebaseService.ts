// Import the functions you need from the SDKs you need
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
// FIX: Import PartnerRequirement, PartnerInvoice, and PartnerSalaryUpdate types.
// @ts-ignore
// FIX: Import specific attendance record types and remove the generic, non-existent 'AttendanceRecord'.
import { Job, PanelConfig, Store, UserType, UserProfile, DailyLineup, Candidate, Complaint, WarningLetter, DemoRequest, StoreSupervisor, PartnerRequirement, PartnerInvoice, PartnerSalaryUpdate, CommissionAttendanceRecord, StoreAttendanceRecord, AttendanceStatus } from '../types';

// Your web app's Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const dbRef = ref(getDatabase());

// --- NEW REVENUE TYPES ---
export interface TeamProfitability {
  id: string;
  member: string;
  role: string;
  revenue: number;
  cost: number; // salary
}

export interface ClientProfitability {
  id: string;
  name: string;
  type: 'Client' | 'Vendor';
  revenueIn: number;
  costOut: number;
}

export interface RevenueData {
  totalRevenue: number;
  totalCost: number;
  teamProfitability: TeamProfitability[];
  clientProfitability: ClientProfitability[];
}


// --- Authentication Functions ---

export const signInUser = (email: string, password: string): Promise<FirebaseUser> => {
    return signInWithEmailAndPassword(auth, email, password).then(userCredential => userCredential.user);
};

export const signUpUser = async (email: string, password: string, fullName: string, phoneNumber: string): Promise<FirebaseUser> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Now, create the user profile in the database
    const userProfile = {
        uid: user.uid,
        email: user.email,
        userType: UserType.CANDIDATE, // Default for signup
        name: fullName,
        phone: phoneNumber,
        isCvComplete: false, // Initialize CV status
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
        case 'auth/invalid-email':
            return 'Invalid email address format.';
        case 'auth/user-disabled':
            return 'This user account has been disabled.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Invalid email or password.';
        case 'auth/email-already-in-use':
            return 'An account with this email address already exists.';
        case 'auth/weak-password':
            return 'Password is too weak. It should be at least 6 characters.';
        default:
            return 'An unexpected error occurred. Please try again.';
    }
}


// --- Database Functions ---

export const seedDatabaseWithInitialData = async () => {
  const jobsRef = child(dbRef, 'jobs');
  const snapshot = await get(jobsRef);

  // Only seed if the 'jobs' node doesn't exist or is empty
  if (!snapshot.exists()) {
    try {
      console.log("No data found in Firebase. Seeding from data.json...");
      const response = await fetch('/data.json');
      const jobsArray: any[] = await response.json();
      
      const updates: { [key: string]: any } = {};
      jobsArray.forEach(job => {
        // Use the ID from the JSON file as the key in the database
        // Also remove the id property from the object being saved.
        const { id, ...jobData } = job;
        updates[`/jobs/${id}`] = jobData;
      });

      await update(dbRef, updates);
      
      console.log("Database seeded successfully with initial data.");
    } catch (error) {
      console.error("Failed to seed database:", error);
    }
  }

  // Seed revenue data if it doesn't exist
  const revenueRef = child(dbRef, 'revenue');
  const revenueSnapshot = await get(revenueRef);
  if (!revenueSnapshot.exists()) {
    console.log("Seeding initial revenue data...");
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const currentMonthKey = `${year}-${month}`;

    const revenueData = {
      [currentMonthKey]: {
        totalRevenue: 450000,
        totalCost: 280000,
        teamProfitability: [
          { id: "t1", member: "Rahul", role: "Team Lead", revenue: 200000, cost: 70000 },
          { id: "t2", member: "Sneha", role: "Recruiter", revenue: 150000, cost: 50000 },
          { id: "t3", member: "Amit", role: "Recruiter", revenue: 100000, cost: 45000 }
        ],
        clientProfitability: [
          { id: "c1", name: "Blinkit", type: "Client", revenueIn: 250000, costOut: 120000 },
          { id: "c2", name: "Flipkart", type: "Client", revenueIn: 200000, costOut: 90000 },
          { id: "c3", name: "Vendor A", type: "Vendor", revenueIn: 0, costOut: 40000 },
          { id: "c4", name: "Vendor B", type: "Vendor", revenueIn: 0, costOut: 30000 }
        ]
      }
    };
    await set(revenueRef, revenueData);
  }
  
  // Seed panel config data if it doesn't exist
  const panelConfigRef = child(dbRef, 'panel_config');
  const panelConfigSnapshot = await get(panelConfigRef);
  if (!panelConfigSnapshot.exists()) {
    console.log("Seeding initial panel config data...");
    const initialConfig: PanelConfig = {
      jobRoles: ['Picker', 'Packer', 'Sales Executive', 'Team Leader', 'Store Manager'],
      locations: ['Delhi', 'Noida', 'Gurgaon', 'Faridabad'],
      stores: [
        { id: 's1', name: 'Okhla Warehouse', location: 'Delhi' },
        { id: 's2', name: 'Cyber Hub', location: 'Gurgaon' },
      ]
    };
    await set(panelConfigRef, initialConfig);
  }

  const candidatesRef = child(dbRef, 'candidates');
  const candidatesSnapshot = await get(candidatesRef);
  if (!candidatesSnapshot.exists()) {
    console.log("Seeding initial candidates data for Selection Dashboard...");
    const initialCandidates = {
      "C001": { name: 'Amit Verma', role: 'Picker', storeName: 'Select Citywalk', phone: '9876543210', recruiter: 'Rahul', status: 'Sourced', date: '2023-10-27' },
      "C002": { name: 'Priya Sharma', role: 'Sales Executive', storeName: 'GIP Mall', phone: '9876543211', recruiter: 'Sneha', status: 'Interview', date: '2023-10-26' },
      "C003": { name: 'Rohan Gupta', role: 'Team Leader', storeName: 'DLF Mall', phone: '9876543212', recruiter: 'Rahul', status: 'Selected', date: '2023-10-25' },
      "C004": { name: 'Anjali Singh', role: 'Packer', storeName: 'Ambience Mall', phone: '9876543213', recruiter: 'Sneha', status: 'On the way', date: '2023-10-27' },
      "C005": { name: 'Vikram Singh', role: 'Driver', storeName: 'Okhla Warehouse', phone: '9876543214', recruiter: 'Rahul', status: 'Sourced', date: '2023-10-27' },
      "C006": { name: 'Neha Gupta', role: 'Store Manager', storeName: 'Logix City Center', phone: '9876543215', recruiter: 'Sneha', status: 'Interview', date: '2023-10-24' },
      "C007": { name: 'Suresh Raina', role: 'Helper', storeName: 'Sector 18 Store', phone: '9876543216', recruiter: 'Amit', status: 'Sourced', date: '2023-10-27' },
      "C008": { name: 'Kavita Mishra', role: 'Sales Associate', storeName: 'Pacific Mall', phone: '9876543217', recruiter: 'Rahul', status: 'On the way', date: '2023-10-26' },
    };
    await set(candidatesRef, initialCandidates);
  }
    
  const complaintsRef = child(dbRef, 'complaints');
  const complaintsSnapshot = await get(complaintsRef);
  if (!complaintsSnapshot.exists()) {
    console.log("Seeding initial complaints data...");
    const initialComplaints = {
        "COMP001": { ticketNo: "#TKT-001", candidate: "Amit Verma", vendor: "Direct", role: "Picker", issue: "Salary Discrepancy", description: "My salary for last month was short by 2000.", status: 'Active', date: '2023-10-25T10:00:00Z', assignedManager: 'Rahul' },
        "COMP002": { ticketNo: "#TKT-002", candidate: "Priya Sharma", vendor: "Vendor A", role: "Sales Executive", issue: "Harassment by store manager", description: "The store manager is using abusive language.", status: 'Active', date: '2023-10-26T14:30:00Z', assignedManager: 'Admin' },
        "COMP003": { ticketNo: "#TKT-003", candidate: "Rohan Gupta", vendor: "Direct", role: "Team Leader", issue: "Workload", description: "Working over 12 hours daily for the past week.", status: 'Closed', date: '2023-10-20T09:00:00Z', assignedManager: 'Rahul', resolution: 'Spoke to the store supervisor and adjusted the shifts. Issue resolved.' }
    };
    await set(complaintsRef, initialComplaints);
  }
  
  const warningLettersRef = child(dbRef, 'warning_letters');
  const warningLettersSnapshot = await get(warningLettersRef);
  if (!warningLettersSnapshot.exists()) {
    console.log("Seeding initial warning letters data...");
    const initialLetters = {
        "WL001": { ticketNo: "#WL-001", employeeName: "Amit Verma", reason: "Absenteeism", description: "Unauthorized absence for 3 consecutive days.", issueDate: '2023-10-20', issuedBy: 'Admin', status: 'Active' },
        "WL002": { ticketNo: "#WL-002", employeeName: "Priya Sharma", reason: "Performance Issue", description: "Failed to meet sales targets for two consecutive months.", issueDate: '2023-09-15', issuedBy: 'Rahul', status: 'Resolved' },
    };
    await set(warningLettersRef, initialLetters);
  }
};


// Map App camelCase to database snake_case
const mapToSnakeCase = (job: Omit<Job, 'id' | 'postedDate'>): any => ({
  title: job.title,
  company: job.company,
  store_name: job.storeName,
  description: job.description,
  admin_id: job.adminId,
  experience_level: job.experienceLevel,
  salary_range: job.salaryRange,
  number_of_openings: job.numberOfOpenings,
  company_logo_src: job.companyLogoSrc || null,
  job_category: job.jobCategory,
  job_city: job.jobCity,
  locality: job.locality,
  min_qualification: job.minQualification,
  gender_preference: job.genderPreference,
  job_type: job.jobType,
  work_location_type: job.workLocationType,
  working_days: job.workingDays,
  job_shift: job.jobShift,
  interview_address: job.interviewAddress,
  salary_type: job.salaryType,
  incentive: job.incentive,
  posted_date: new Date().toISOString(), // Add posted_date on creation
});


// Map database snake_case to App camelCase
const mapToJob = (key: string, data: any): Job => ({
  id: key,
  title: data.title,
  company: data.company,
  storeName: data.store_name,
  description: data.description,
  postedDate: data.posted_date,
  adminId: data.admin_id,
  experienceLevel: data.experience_level,
  salaryRange: data.salary_range,
  numberOfOpenings: data.number_of_openings,
  companyLogoSrc: data.company_logo_src,
  jobCategory: data.job_category,
  jobCity: data.job_city,
  locality: data.locality,
  minQualification: data.min_qualification,
  genderPreference: data.gender_preference,
  jobType: data.job_type,
  workLocationType: data.work_location_type,
  workingDays: data.working_days,
  jobShift: data.job_shift,
  interviewAddress: data.interview_address,
  salaryType: data.salary_type,
  incentive: data.incentive,
});

export const getJobs = async (): Promise<Job[]> => {
  try {
    const snapshot = await get(child(dbRef, 'jobs'));
    if (snapshot.exists()) {
      const jobsData = snapshot.val();
      // Firebase returns an object, convert it to an array
      const jobsArray = Object.keys(jobsData).map(key => mapToJob(key, jobsData[key]));
      // Sort by posted date, newest first
      return jobsArray.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
    } else {
      return [];
    }
  } catch (error) {
    console.error("Firebase: Error fetching jobs:", error);
    return [];
  }
};

export const onJobsChange = (callback: (jobs: Job[]) => void): Unsubscribe => {
  const jobsRef = child(dbRef, 'jobs');
  const unsubscribe = onValue(jobsRef, (snapshot) => {
    if (snapshot.exists()) {
      const jobsData = snapshot.val();
      const jobsArray = Object.keys(jobsData).map(key => mapToJob(key, jobsData[key]));
      // Sort by posted date, newest first
      const sortedJobs = jobsArray.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
      callback(sortedJobs);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error("Firebase: Error listening for job changes:", error);
  });
  return unsubscribe;
};

export const createJob = async (job: Omit<Job, 'id' | 'postedDate'>): Promise<Job | null> => {
    try {
        const jobsRef = child(dbRef, 'jobs');
        const newJobRef = push(jobsRef);
        const snakeCaseJob = mapToSnakeCase(job);
        await set(newJobRef, snakeCaseJob);
        return mapToJob(newJobRef.key!, { ...snakeCaseJob });
    } catch (error) {
        console.error("Firebase: Error creating job:", error);
        return null;
    }
};

export const deleteJob = async (id: string): Promise<void> => {
    try {
        const jobRef = ref(database, 'jobs/' + id);
        await remove(jobRef);
    } catch (error) {
        console.error("Firebase: Error deleting job:", error);
        throw error; // Re-throw to be caught by the caller
    }
};

// Fix: Add missing updateJob function
export const updateJob = async (job: Job): Promise<void> => {
    try {
        const jobRef = ref(database, 'jobs/' + job.id);
        // We need to convert the job object to the snake_case format used in the DB,
        // preserving the original posted_date.
        const snakeCaseJob = {
          title: job.title,
          company: job.company,
          store_name: job.storeName,
          description: job.description,
          admin_id: job.adminId,
          experience_level: job.experienceLevel,
          salary_range: job.salaryRange,
          number_of_openings: job.numberOfOpenings,
          company_logo_src: job.companyLogoSrc || null,
          job_category: job.jobCategory,
          job_city: job.jobCity,
          locality: job.locality,
          min_qualification: job.minQualification,
          gender_preference: job.genderPreference,
          job_type: job.jobType,
          work_location_type: job.workLocationType,
          working_days: job.workingDays,
          job_shift: job.jobShift,
          interview_address: job.interviewAddress,
          salary_type: job.salaryType,
          incentive: job.incentive,
          posted_date: job.postedDate, // Keep existing date
        };
        await set(jobRef, snakeCaseJob);
    } catch (error) {
        console.error("Firebase: Error updating job:", error);
        throw error; // Re-throw to be caught by the caller
    }
};

export const getRevenueData = async (month: string): Promise<RevenueData | null> => {
  try {
      const snapshot = await get(child(dbRef, `revenue/${month}`));
      if (snapshot.exists()) {
          return snapshot.val() as RevenueData;
      } else {
          console.log(`No revenue data found for month: ${month}`);
          return null; // No data for this month
      }
  } catch (error) {
      console.error("Firebase: Error fetching revenue data:", error);
      throw error;
  }
};

// --- Daily Lineup Functions ---

export const findCandidateInLineupsByMobile = async (mobile: string): Promise<DailyLineup | null> => {
    try {
        const lineupsRef = ref(database, 'daily_lineups');
        const mobileQuery = query(lineupsRef, orderByChild('contact'), equalTo(mobile));
        const snapshot = await get(mobileQuery);
        if (snapshot.exists()) {
            const data = snapshot.val();
            // snapshot.val() will be an object with keys, e.g., { "-M...": { candidateName: ... } }
            const lineupKey = Object.keys(data)[0];
            return { id: lineupKey, ...data[lineupKey] } as DailyLineup;
        }
        return null;
    } catch (error) {
        console.error("Firebase: Error finding candidate in lineups:", error);
        return null;
    }
};

export const addDailyLineup = async (lineupData: Omit<DailyLineup, 'id' | 'createdAt'>): Promise<void> => {
    try {
        const lineupsRef = ref(database, 'daily_lineups');
        const newRef = push(lineupsRef);
        const dataWithTimestamp = {
            ...lineupData,
            createdAt: new Date().toISOString()
        };
        await set(newRef, dataWithTimestamp);
    } catch (error) {
        console.error("Firebase: Error adding daily lineup:", error);
        throw error;
    }
};

export const updateDailyLineup = async (lineupId: string, updates: Partial<Omit<DailyLineup, 'id'>>): Promise<void> => {
    try {
        const lineupRef = ref(database, `daily_lineups/${lineupId}`);
        await update(lineupRef, updates);
    } catch (error) {
        console.error("Firebase: Error updating daily lineup:", error);
        throw error;
    }
};

export const onDailyLineupsChange = (callback: (lineups: DailyLineup[]) => void): Unsubscribe => {
    const lineupsRef = ref(database, 'daily_lineups');
    const unsubscribe = onValue(lineupsRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const lineupsArray: DailyLineup[] = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
            // Sort by createdAt date, newest first
            lineupsArray.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            callback(lineupsArray);
        } else {
            callback([]);
        }
    }, (error) => {
        console.error("Firebase: Error listening for lineup changes:", error);
    });
    return unsubscribe;
};

// --- Attendance Functions ---

// FIX: Corrected type signature to use CommissionAttendanceRecord
export const onAttendanceForMonthChange = (month: string, callback: (data: Record<string, CommissionAttendanceRecord>) => void): Unsubscribe => {
    const attendanceRef = ref(database, `attendance/${month}`);
    const unsubscribe = onValue(attendanceRef, (snapshot) => {
        callback(snapshot.val());
    }, (error) => {
        console.error("Firebase: Error listening for attendance changes:", error);
    });
    return unsubscribe;
};

// FIX: Corrected type signature to use CommissionAttendanceRecord
export const saveEmployeeAttendance = async (month: string, employeeId: string, data: Partial<CommissionAttendanceRecord>): Promise<void> => {
    try {
        const attendanceRef = ref(database, `attendance/${month}/${employeeId}`);
        await update(attendanceRef, data);
    } catch (error) {
        console.error("Firebase: Error saving employee attendance:", error);
        throw error;
    }
};

// FIX: Added function for store attendance listener.
export const onStoreAttendanceChange = (storeLocation: string, date: string, callback: (records: Record<string, AttendanceStatus> | null) => void): Unsubscribe => {
    const attendanceRef = ref(database, `store_attendance/${storeLocation}/${date}`);
    const unsubscribe = onValue(attendanceRef, (snapshot) => {
        callback(snapshot.val());
    }, (error) => {
        console.error("Firebase: Error listening for store attendance changes:", error);
    });
    return unsubscribe;
};

// FIX: Added function for saving store attendance.
export const saveStoreAttendance = async (storeLocation: string, date: string, records: Record<string, AttendanceStatus>): Promise<void> => {
    try {
        const attendanceRef = ref(database, `store_attendance/${storeLocation}/${date}`);
        await set(attendanceRef, records);
    } catch (error) {
        console.error("Firebase: Error saving store attendance:", error);
        throw error;
    }
};


// --- Selection Dashboard Candidate Functions ---

export const addCandidateToSelection = async (lineup: DailyLineup): Promise<void> => {
    try {
        const candidatesRef = ref(database, 'candidates');
        const newCandidateRef = push(candidatesRef);
        
        const interviewDate = lineup.interviewDateTime 
            ? new Date(lineup.interviewDateTime).toISOString().split('T')[0] 
            : new Date().toISOString().split('T')[0];

        const newCandidateData = {
            name: lineup.candidateName,
            role: lineup.role,
            storeName: lineup.storeName,
            phone: lineup.contact,
            recruiter: lineup.submittedBy,
            vendor: lineup.vendor,
            status: 'Sourced',
            date: interviewDate,
            email: '', // Not available from lineup
            quitDate: null,
            documents: [
                { name: 'Resume / CV', status: 'Not Uploaded', fileName: null },
                { name: 'Aadhar Card', status: 'Not Uploaded', fileName: null },
                { name: 'PAN Card', status: 'Not Uploaded', fileName: null },
                { name: 'Bank Details', status: 'Not Uploaded', fileName: null },
            ]
        };

        await set(newCandidateRef, newCandidateData);
    } catch (error) {
        console.error("Firebase: Error adding candidate to selection:", error);
        throw error;
    }
};

export const onCandidatesChange = (callback: (candidates: Candidate[]) => void): Unsubscribe => {
  const candidatesRef = ref(database, 'candidates');
  const unsubscribe = onValue(candidatesRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const candidatesArray: Candidate[] = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
      callback(candidatesArray);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error("Firebase: Error listening for candidate changes:", error);
  });
  return unsubscribe;
};

// FIX: Added function to listen for employees in a specific store.
export const onStoreEmployeesChange = (storeName: string, callback: (employees: Candidate[]) => void): Unsubscribe => {
    const candidatesRef = ref(database, 'candidates');
    // Query for candidates in a specific store who are hired
    const storeQuery = query(candidatesRef, orderByChild('storeName'), equalTo(storeName));
    const unsubscribe = onValue(storeQuery, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const employeesArray: Candidate[] = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            })).filter(c => c.status === 'Hired'); // Only active employees
            callback(employeesArray);
        } else {
            callback([]);
        }
    }, (error) => {
        console.error("Firebase: Error listening for store employee changes:", error);
    });
    return unsubscribe;
};

export const updateCandidateStatus = async (candidateId: string, newStatus: string): Promise<void> => {
    try {
        const candidateRef = ref(database, `candidates/${candidateId}`);
        await update(candidateRef, { status: newStatus });
    } catch (error) {
        console.error("Firebase: Error updating candidate status:", error);
        throw error;
    }
};

export const updateCandidate = async (candidateId: string, updates: Partial<Omit<Candidate, 'id'>>): Promise<void> => {
    try {
        const candidateRef = ref(database, `candidates/${candidateId}`);
        await update(candidateRef, updates);
    } catch (error) {
        console.error("Firebase: Error updating candidate:", error);
        throw error;
    }
};

// --- Complaint Functions ---

export const onComplaintsChange = (callback: (complaints: Complaint[]) => void): Unsubscribe => {
    const complaintsRef = ref(database, 'complaints');
    const unsubscribe = onValue(complaintsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const complaintsArray: Complaint[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        complaintsArray.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        callback(complaintsArray);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error("Firebase: Error listening for complaint changes:", error);
    });
    return unsubscribe;
};

export const addComplaint = async (complaintData: Omit<Complaint, 'id' | 'ticketNo' | 'date' | 'status' | 'resolution'>): Promise<void> => {
    try {
        const complaintsRef = ref(database, 'complaints');
        const snapshot = await get(complaintsRef);
        const count = snapshot.exists() ? snapshot.size : 0;
        const ticketNo = `#TKT-${String(count + 1).padStart(3, '0')}`;
        
        const newComplaintRef = push(complaintsRef);
        const fullComplaintData = {
            ...complaintData,
            ticketNo,
            date: new Date().toISOString(),
            status: 'Active' as const,
        };
        await set(newComplaintRef, fullComplaintData);
    } catch (error) {
        console.error("Firebase: Error adding complaint:", error);
        throw error;
    }
};

export const updateComplaint = async (complaintId: string, updates: Partial<Omit<Complaint, 'id'>>): Promise<void> => {
    try {
        const complaintRef = ref(database, `complaints/${complaintId}`);
        await update(complaintRef, updates);
    } catch (error) {
        console.error("Firebase: Error updating complaint:", error);
        throw error;
    }
};

// --- Warning Letter Functions ---

export const onWarningLettersChange = (callback: (letters: WarningLetter[]) => void): Unsubscribe => {
    const lettersRef = ref(database, 'warning_letters');
    const unsubscribe = onValue(lettersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const lettersArray: WarningLetter[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        lettersArray.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
        callback(lettersArray);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error("Firebase: Error listening for warning letter changes:", error);
    });
    return unsubscribe;
};

export const addWarningLetter = async (letterData: Omit<WarningLetter, 'id' | 'ticketNo' | 'issueDate' | 'status'>): Promise<void> => {
    try {
        const lettersRef = ref(database, 'warning_letters');
        const snapshot = await get(lettersRef);
        const count = snapshot.exists() ? snapshot.size : 0;
        const ticketNo = `#WL-${String(count + 1).padStart(3, '0')}`;
        
        const newLetterRef = push(lettersRef);
        const fullLetterData = {
            ...letterData,
            ticketNo,
            issueDate: new Date().toISOString().split('T')[0],
            status: 'Active' as const,
        };
        await set(newLetterRef, fullLetterData);
    } catch (error) {
        console.error("Firebase: Error adding warning letter:", error);
        throw error;
    }
};

export const updateWarningLetter = async (letterId: string, updates: Partial<Omit<WarningLetter, 'id'>>): Promise<void> => {
    try {
        const letterRef = ref(database, `warning_letters/${letterId}`);
        await update(letterRef, updates);
    } catch (error) {
        console.error("Firebase: Error updating warning letter:", error);
        throw error;
    }
};

// --- Demo Request Functions ---

export const onDemoRequestsChange = (callback: (requests: DemoRequest[]) => void): Unsubscribe => {
    const requestsRef = ref(database, 'demo_requests');
    const unsubscribe = onValue(requestsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const requestsArray: DemoRequest[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        // Sort by date, newest first
        requestsArray.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
        callback(requestsArray);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error("Firebase: Error listening for demo request changes:", error);
    });
    return unsubscribe;
};

export const addDemoRequest = async (requestData: Omit<DemoRequest, 'id' | 'requestDate'>): Promise<void> => {
    try {
        const requestsRef = ref(database, 'demo_requests');
        const newRequestRef = push(requestsRef);
        const fullRequestData = {
            ...requestData,
            requestDate: new Date().toISOString(),
        };
        await set(newRequestRef, fullRequestData);
    } catch (error) {
        console.error("Firebase: Error adding demo request:", error);
        throw error;
    }
};

// FIX: Implement partner-specific Firebase functions
// --- PARTNER-SPECIFIC FUNCTIONS ---

export const onPartnerRequirementsChange = (partnerUid: string, callback: (requirements: PartnerRequirement[]) => void): Unsubscribe => {
    const requirementsRef = ref(database, `partner_requirements/${partnerUid}`);
    return onValue(requirementsRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const requirementsArray: PartnerRequirement[] = Object.keys(data).map(key => ({ id: key, ...data[key] }));
            requirementsArray.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
            callback(requirementsArray);
        } else {
            callback([]);
        }
    }, (error) => {
        console.error("Firebase: Error listening for partner requirement changes:", error);
    });
};

export const addPartnerRequirement = async (partnerUid: string, requirementData: { role: string; client: string; location: string; count: number; }): Promise<void> => {
    try {
        const requirementsRef = ref(database, `partner_requirements/${partnerUid}`);
        const newRequirementRef = push(requirementsRef);
        
        const fullRequirementData: Omit<PartnerRequirement, 'id'> = {
            title: requirementData.role,
            client: requirementData.client,
            location: requirementData.location,
            openings: requirementData.count,
            postedDate: new Date().toISOString(),
            submissionStatus: 'Pending Review',
            salary: 'Competitive',
            experience: 'Any',
            description: 'Requirement submitted by partner.',
            jobType: 'Full-time',
            workingDays: '6 days',
            jobShift: 'Day Shift',
        };
        await set(newRequirementRef, fullRequirementData);
    } catch (error) {
        console.error("Firebase: Error adding partner requirement:", error);
        throw error;
    }
};

export const onPartnerInvoicesChange = (partnerUid: string, callback: (invoices: PartnerInvoice[]) => void): Unsubscribe => {
    const invoicesRef = ref(database, `partner_invoices/${partnerUid}`);
    return onValue(invoicesRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const invoicesArray: PartnerInvoice[] = Object.keys(data).map(key => ({ id: key, ...data[key] }));
            invoicesArray.sort((a, b) => new Date(b.billedDate).getTime() - new Date(a.billedDate).getTime());
            callback(invoicesArray);
        } else {
            // Seed mock data for demo if empty
            const MOCK_INVOICES: PartnerInvoice[] = [
                { id: 'INV-2023-001', clientName: 'Flipkart', billedDate: '2023-10-15', dueDate: '2023-11-14', amount: 50000, status: 'Paid', lineItems: [{ description: 'Recruitment Services - Oct', quantity: 1, unitPrice: 42372.88, total: 42372.88 }], subTotal: 42372.88, tax: 7627.12, total: 50000 },
                { id: 'INV-2023-002', clientName: 'Blinkit', billedDate: '2023-11-01', dueDate: '2023-12-01', amount: 75000, status: 'Pending', lineItems: [{ description: 'Recruitment Services - Nov', quantity: 1, unitPrice: 63559.32, total: 63559.32 }], subTotal: 63559.32, tax: 11440.68, total: 75000 },
            ];
            callback(MOCK_INVOICES);
        }
    }, (error) => {
        console.error("Firebase: Error listening for partner invoice changes:", error);
    });
};

export const onSalaryUpdatesChange = (partnerUid: string, callback: (updates: PartnerSalaryUpdate[]) => void): Unsubscribe => {
    const updatesRef = ref(database, `partner_salary_updates/${partnerUid}`);
    return onValue(updatesRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const updatesArray: PartnerSalaryUpdate[] = Object.keys(data).map(key => ({ id: key, ...data[key] }));
            updatesArray.sort((a, b) => new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime());
            callback(updatesArray);
        } else {
            // Seed mock data for demo
            const MOCK_SALARY_UPDATES: PartnerSalaryUpdate[] = [
                { id: 'SU001', candidateName: 'Aarav Sharma', client: 'Flipkart', role: 'Picker', joiningDate: '2023-11-01', annualCTC: 240000, monthlyNetSalary: 16500, status: 'Pending' },
                { id: 'SU002', candidateName: 'Diya Patel', client: 'Blinkit', role: 'Delivery Associate', joiningDate: '2023-10-25', annualCTC: 280000, monthlyNetSalary: 19200, status: 'Confirmed' },
                { id: 'SU003', candidateName: 'Rohan Mehra', client: 'Zomato', role: 'Delivery Associate', joiningDate: '2023-10-15', annualCTC: 275000, monthlyNetSalary: 18800, status: 'Discrepancy Reported' },
            ];
            callback(MOCK_SALARY_UPDATES);
        }
    }, (error) => {
        console.error("Firebase: Error listening for salary update changes:", error);
    });
};

export const updateSalaryUpdateStatus = async (partnerUid: string, updateId: string, newStatus: PartnerSalaryUpdate['status']): Promise<void> => {
    try {
        const updateRef = ref(database, `partner_salary_updates/${partnerUid}/${updateId}`);
        await update(updateRef, { status: newStatus });
    } catch (error) {
        console.error("Firebase: Error updating salary update status:", error);
        throw error;
    }
};


// --- Report Generation Getters ---
const getData = async <T>(path: string): Promise<T[]> => {
    try {
        const snapshot = await get(child(dbRef, path));
        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.keys(data).map(key => ({ id: key, ...data[key] }));
        }
        return [];
    } catch (error) {
        console.error(`Firebase: Error fetching data from ${path}:`, error);
        return [];
    }
};

export const getDailyLineups = async (): Promise<DailyLineup[]> => {
    const lineups = await getData<DailyLineup>('daily_lineups');
    return lineups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getCandidates = async (): Promise<Candidate[]> => getData<Candidate>('candidates');
export const getComplaints = async (): Promise<Complaint[]> => {
    const complaints = await getData<Complaint>('complaints');
    return complaints.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
export const getWarningLetters = async (): Promise<WarningLetter[]> => {
    const letters = await getData<WarningLetter>('warning_letters');
    return letters.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
};

// FIX: Corrected return type signature
export const getAttendanceForMonth = async (month: string): Promise<Record<string, CommissionAttendanceRecord>> => {
    try {
        const snapshot = await get(child(dbRef, `attendance/${month}`));
        return snapshot.exists() ? snapshot.val() : {};
    } catch (error) {
        console.error(`Firebase: Error fetching attendance for ${month}:`, error);
        return {};
    }
};


// --- USER & VENDOR MANAGEMENT ---

export const getUserProfile = async (uid: string): Promise<any | null> => {
  try {
    const snapshot = await get(child(dbRef, `users/${uid}`));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error("Firebase: Error fetching user profile:", error);
    return null;
  }
};

export const updateUserProfile = async (uid: string, profileData: Partial<UserProfile>): Promise<void> => {
    try {
        const userProfileRef = ref(database, `users/${uid}`);
        await update(userProfileRef, profileData);
    } catch (error) {
        console.error("Firebase: Error updating user profile:", error);
        throw error;
    }
};

export const createVendor = async (vendorData: any): Promise<any> => {
    // Use a temporary, secondary Firebase App instance to create the new user.
    // This prevents the current admin user from being signed out.
    const secondaryAppName = `secondary-app-${Date.now()}`;
    const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
    try {
        const secondaryAuth = getAuth(secondaryApp);
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, vendorData.email, "password");
        const uid = userCredential.user.uid;

        // Now save vendor details to the database using the main app instance
        const userProfile = {
            email: vendorData.email,
            name: vendorData.partnerName,
            uid: uid,
            userType: UserType.PARTNER
        };
        await set(ref(database, `users/${uid}`), userProfile);
        
        // Save detailed business info to a separate 'vendors' collection
        const vendorProfile = { ...vendorData, uid };
        await set(ref(database, `vendors/${uid}`), vendorProfile);

        return { id: uid, ...vendorProfile };

    } catch (error) {
        console.error("Error creating vendor:", error);
        const authError = error as AuthError;
        // Re-throw a user-friendly message to be displayed in the UI
        throw new Error(mapAuthError(authError));
    } finally {
        // Clean up the secondary app instance
        await deleteApp(secondaryApp);
    }
};

export const getVendors = async (): Promise<any[]> => {
  try {
    const snapshot = await get(child(dbRef, 'vendors'));
    if (snapshot.exists()) {
      const vendorsData = snapshot.val();
      return Object.entries(vendorsData).map(([id, vendor]) => ({
        id,
        // Add a domain for logo fetching
        domain: (vendor as any).brandName ? `${(vendor as any).brandName.toLowerCase().replace(/\s+/g, '')}.com` : 'example.com',
        ...vendor as object,
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error getting vendors:", error);
    return [];
  }
};

// --- SUPERVISOR MANAGEMENT ---

export const createSupervisor = async (supervisorData: Omit<StoreSupervisor, 'id' | 'status'>): Promise<StoreSupervisor> => {
    const secondaryAppName = `secondary-app-supervisor-${Date.now()}`;
    const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
    try {
        const secondaryAuth = getAuth(secondaryApp);
        // Create user with email and the hardcoded password "password"
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, supervisorData.email, "password");
        const uid = userCredential.user.uid;

        // Create user profile for role management
        const userProfile = {
            email: supervisorData.email,
            name: supervisorData.name,
            uid: uid,
            userType: UserType.STORE_SUPERVISOR
        };
        await set(ref(database, `users/${uid}`), userProfile);
        
        // Create detailed supervisor profile
        const fullSupervisorData: StoreSupervisor = {
            id: uid,
            ...supervisorData,
            status: 'Active'
        };
        await set(ref(database, `supervisors/${uid}`), fullSupervisorData);

        return fullSupervisorData;

    } catch (error) {
        console.error("Error creating supervisor:", error);
        const authError = error as AuthError;
        throw new Error(mapAuthError(authError));
    } finally {
        await deleteApp(secondaryApp);
    }
};

export const onSupervisorsChange = (callback: (supervisors: StoreSupervisor[]) => void): Unsubscribe => {
    const supervisorsRef = ref(database, 'supervisors');
    const unsubscribe = onValue(supervisorsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const supervisorsArray: StoreSupervisor[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        supervisorsArray.sort((a, b) => a.name.localeCompare(b.name));
        callback(supervisorsArray);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error("Firebase: Error listening for supervisor changes:", error);
    });
    return unsubscribe;
};

export const updateSupervisor = async (supervisorId: string, updates: Partial<StoreSupervisor>): Promise<void> => {
    try {
        const supervisorRef = ref(database, `supervisors/${supervisorId}`);
        await update(supervisorRef, updates);
        
        // also update name in users table if name is changed
        if (updates.name) {
             const userRef = ref(database, `users/${supervisorId}`);
             await update(userRef, { name: updates.name });
        }
    } catch (error) {
        console.error("Firebase: Error updating supervisor:", error);
        throw error;
    }
};


// --- PANEL CONFIG FUNCTIONS ---

export const getPanelConfig = async (): Promise<PanelConfig | null> => {
  try {
    const snapshot = await get(child(dbRef, 'panel_config'));
    if (snapshot.exists()) {
      return snapshot.val() as PanelConfig;
    } else {
      console.log("No panel config found in Firebase.");
      return null;
    }
  } catch (error) {
    console.error("Firebase: Error fetching panel config:", error);
    throw error;
  }
};

export const updatePanelConfig = async (config: PanelConfig): Promise<void> => {
  try {
    const panelConfigRef = ref(database, 'panel_config');
    await set(panelConfigRef, config);
  } catch (error) {
    console.error("Firebase: Error updating panel config:", error);
    throw error;
  }
};