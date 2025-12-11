// utils/supervisorService.ts

export interface StoreEmployee {
  id: string;
  name: string;
  role: string;
  phone: string;
  joiningDate: string;
  status: 'Active' | 'On Leave';
}

export interface AttendanceRecord {
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Leave';
}

const MOCK_STORE_EMPLOYEES: StoreEmployee[] = [];

const ATTENDANCE_KEY = 'rkm_store_attendance';

export const getStoreEmployees = (): StoreEmployee[] => {
    // In a real app, this would fetch from a database
    return [];
};

export const getAttendanceForDate = (date: string): AttendanceRecord[] => {
    try {
        const allAttendance = JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '{}');
        return allAttendance[date] || [];
    } catch {
        return [];
    }
};

export const saveAttendanceForDate = (date: string, records: AttendanceRecord[]) => {
    const allAttendance = JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '{}');
    allAttendance[date] = records;
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(allAttendance));
};
