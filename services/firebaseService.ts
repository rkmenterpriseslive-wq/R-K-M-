// Import the functions you need from the SDKs you need
import { initializeApp, deleteApp } from "firebase/app";
import { getDatabase, ref, get, child, push, remove, set, update, onValue, Unsubscribe } from "firebase/database";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut,
    onAuthStateChanged,
    User as FirebaseUser,
    AuthError
} from "firebase/auth";
import { Job, PanelConfig, Store, UserType } from '../types';

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

export const signUpUser = (email: string, password: string): Promise<FirebaseUser> => {
    return createUserWithEmailAndPassword(auth, email, password).then(userCredential => userCredential.user);
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