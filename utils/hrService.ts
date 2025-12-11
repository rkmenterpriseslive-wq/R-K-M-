// utils/hrService.ts

import { getEmployees, getOnboardingCandidates } from './employeeService';

export interface HRDashboardStats {
    totalEmployees: number;
    newHires: number;
    pendingOnboarding: number;
    pendingPayroll: number;
}

export const getHRDashboardStats = (): HRDashboardStats => {
    const employees = getEmployees();
    const onboarding = getOnboardingCandidates();

    // Mock calculation for new hires this month
    const currentMonth = new Date().getMonth();
    const newHires = employees.filter(e => new Date(e.dateOfJoining).getMonth() === currentMonth).length;

    // Mock calculation for payroll
    const pendingPayroll = employees.reduce((sum, emp) => sum + emp.grossSalary, 0);

    return {
        totalEmployees: employees.length,
        newHires: newHires,
        pendingOnboarding: onboarding.length,
        pendingPayroll: pendingPayroll,
    };
};

export const getRecentActivities = (): string[] => {
    // In a real app, this would fetch from a database.
    return [];
};