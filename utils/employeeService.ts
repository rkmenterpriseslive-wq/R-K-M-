import { Employee } from '../types';

type PartialEmployee = Omit<Employee, 'status' | 'dateOfJoining' | 'address' | 'bankName' | 'accountNumber' | 'ifscCode' | 'panNumber' | 'aadhaarNumber' | 'grossSalary'>;

const EMPLOYEES_KEY = 'rkm_employees';

// --- SERVICE FUNCTIONS ---

/**
 * Gets the list of candidates marked as 'Selected' and ready for onboarding.
 * In a real app, this would fetch from a database.
 */
export const getOnboardingCandidates = (): PartialEmployee[] => {
    // In a real app, this would fetch from a database.
    return [];
};

/**
 * Retrieves all active employees from local storage.
 */
export const getEmployees = (): Employee[] => {
    try {
        const employeesJson = localStorage.getItem(EMPLOYEES_KEY);
        return employeesJson ? JSON.parse(employeesJson) : [];
    } catch (error) {
        console.error("Failed to parse employees from localStorage", error);
        return [];
    }
};

/**
 * Adds a new employee to the list in local storage.
 * The candidate is "promoted" to an employee.
 */
export const addEmployee = (employeeData: Employee) => {
    const employees = getEmployees();
    // Create a new employee ID
    const newIdNumber = (employees.length > 0) ? Math.max(...employees.map(e => parseInt(e.id.replace('EMP', '')))) + 1 : 1;
    const newEmployee = {
        ...employeeData,
        id: `EMP${newIdNumber.toString().padStart(3, '0')}`
    };

    const updatedEmployees = [newEmployee, ...employees];
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updatedEmployees));
};

/**
 * Updates an existing employee's details in local storage.
 */
export const updateEmployee = (updatedEmployee: Employee) => {
    let employees = getEmployees();
    const index = employees.findIndex(e => e.id === updatedEmployee.id);
    if (index > -1) {
        employees[index] = updatedEmployee;
        localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
    } else {
        console.warn(`Employee with ID ${updatedEmployee.id} not found for update.`);
    }
};