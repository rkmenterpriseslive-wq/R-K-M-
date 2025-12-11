// utils/salaryService.ts

// --- INTERFACES ---

export interface SalaryRule {
  designation: string;
  basic: {
    percentage: number;
    of: 'gross'; // Simplified for now
  };
  hra: {
    percentage: number;
    of: 'basic'; // Simplified for now
  };
  // New fixed monthly allowances
  conveyance: number;
  medical: number;
  statutoryBonus: number;
}

export interface CTCBreakdown {
  monthly: Record<string, number>;
  annual: Record<string, number>;
}

// --- CONSTANTS ---

export const initialBreakdown: CTCBreakdown = {
  monthly: {
    basic: 0, hra: 0, conveyance: 0, medical: 0, statutoryBonus: 0, specialAllowance: 0, gross: 0,
    employeePF: 0, employeeESI: 0, totalDeductions: 0,
    netSalary: 0,
    employerPF: 0, employerESI: 0, ctc: 0
  },
  annual: {
    basic: 0, hra: 0, conveyance: 0, medical: 0, statutoryBonus: 0, specialAllowance: 0, gross: 0,
    employeePF: 0, employeeESI: 0, totalDeductions: 0,
    netSalary: 0,
    employerPF: 0, employerESI: 0, ctc: 0
  }
};

const DEFAULT_RULE: SalaryRule = {
    designation: 'Default',
    basic: { percentage: 40, of: 'gross' },
    hra: { percentage: 50, of: 'basic' },
    conveyance: 0,
    medical: 0,
    statutoryBonus: 0,
};

const STORAGE_KEY = 'rkm_salary_rules';

// --- LOCAL STORAGE HELPERS ---

export const getRules = (): SalaryRule[] => {
    try {
        const rulesJson = localStorage.getItem(STORAGE_KEY);
        return rulesJson ? JSON.parse(rulesJson) : [];
    } catch (error) {
        console.error("Failed to parse salary rules from localStorage", error);
        return [];
    }
};

export const saveRule = (newRule: SalaryRule) => {
    const rules = getRules();
    const existingIndex = rules.findIndex(r => r.designation === newRule.designation);
    if (existingIndex > -1) {
        rules[existingIndex] = newRule; // Update existing
    } else {
        rules.push(newRule); // Add new
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
};

export const deleteRule = (designation: string) => {
    let rules = getRules();
    rules = rules.filter(r => r.designation !== designation);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
};


// --- CALCULATION LOGIC ---

export const calculateBreakdownFromRule = (annualCTC: number, rule: SalaryRule | undefined | null): CTCBreakdown => {
    if (isNaN(annualCTC) || annualCTC <= 0) {
        return initialBreakdown;
    }

    const effectiveRule = rule || DEFAULT_RULE;
    const annual: Record<string, number> = { ctc: annualCTC };

    const basicPercentageOfGross = effectiveRule.basic.percentage / 100;

    // Determine ESI applicability based on an estimated gross salary.
    // CTC = Gross + Employer PF + Employer ESI
    // We can estimate Gross as roughly 94% of CTC for non-ESI, 90% for ESI.
    // A threshold of 2.8L CTC is a rough guide for ESI applicability.
    const isEsiApplicable = annualCTC <= 280000; 

    // Solve for Gross Salary: CTC = Gross + (Gross * basic% * 12%) + (Gross * 3.25% if ESI)
    const employerPFMultiplier = 0.12 * basicPercentageOfGross;
    const employerESIMultiplier = isEsiApplicable ? 0.0325 : 0;
    
    annual.gross = annualCTC / (1 + employerPFMultiplier + employerESIMultiplier);
    
    // Earnings
    annual.basic = annual.gross * basicPercentageOfGross;
    annual.hra = annual.basic * (effectiveRule.hra.percentage / 100);
    annual.conveyance = (effectiveRule.conveyance || 0) * 12;
    annual.medical = (effectiveRule.medical || 0) * 12;
    annual.statutoryBonus = (effectiveRule.statutoryBonus || 0) * 12;
    
    annual.specialAllowance = Math.max(0, annual.gross - annual.basic - annual.hra - annual.conveyance - annual.medical - annual.statutoryBonus);
    
    // Employee Deductions (No Professional Tax as per image)
    annual.employeePF = annual.basic * 0.12; // 12%
    annual.employeeESI = isEsiApplicable ? (annual.gross * 0.0075) : 0; // 0.75%
    
    annual.totalDeductions = annual.employeePF + annual.employeeESI;
    annual.netSalary = annual.gross - annual.totalDeductions;

    // Employer Contributions
    annual.employerPF = annual.basic * 0.12;
    annual.employerESI = isEsiApplicable ? (annual.gross * 0.0325) : 0;
    
    const monthly = Object.fromEntries(
        Object.entries(annual).map(([key, value]) => [key, value / 12])
    ) as Record<string, number>;

    return { annual, monthly };
};

export const calculateCTCFromNetSalary = (monthlyNet: number, rule: SalaryRule | null): CTCBreakdown => {
    if (isNaN(monthlyNet) || monthlyNet <= 0) {
        return initialBreakdown;
    }

    const effectiveRule = rule || DEFAULT_RULE;
    let monthlyGross = monthlyNet * 1.25; // Start with a rough estimate

    for (let i = 0; i < 20; i++) { // Iterate to converge on the correct gross
        const monthlyBasic = monthlyGross * (effectiveRule.basic.percentage / 100);
        
        const employeePF = monthlyBasic * 0.12;
        const employeeESI = monthlyGross <= 21000 ? monthlyGross * 0.0075 : 0;
        
        const totalDeductions = employeePF + employeeESI;
        const calculatedNet = monthlyGross - totalDeductions;

        if (Math.abs(calculatedNet - monthlyNet) < 0.5) { // If difference is less than 50 paise, break
            break;
        }

        // Adjust gross for next iteration
        monthlyGross = monthlyGross * (monthlyNet / calculatedNet);
    }
    
    // Now we have a stable monthlyGross, calculate the final breakdown
    const monthly: Record<string, number> = {};
    monthly.gross = monthlyGross;
    monthly.basic = monthly.gross * (effectiveRule.basic.percentage / 100);
    monthly.hra = monthly.basic * (effectiveRule.hra.percentage / 100);
    
    monthly.conveyance = (effectiveRule.conveyance || 0);
    monthly.medical = (effectiveRule.medical || 0);
    monthly.statutoryBonus = (effectiveRule.statutoryBonus || 0);
    
    monthly.specialAllowance = Math.max(0, monthly.gross - monthly.basic - monthly.hra - monthly.conveyance - monthly.medical - monthly.statutoryBonus);

    monthly.employeePF = monthly.basic * 0.12;
    monthly.employeeESI = monthly.gross <= 21000 ? monthly.gross * 0.0075 : 0;
    monthly.totalDeductions = monthly.employeePF + monthly.employeeESI;
    monthly.netSalary = monthly.gross - monthly.totalDeductions;
    
    monthly.employerPF = monthly.basic * 0.12;
    monthly.employerESI = monthly.gross <= 21000 ? monthly.gross * 0.0325 : 0;
    
    monthly.ctc = monthly.gross + monthly.employerPF + monthly.employerESI;

    const annual = Object.fromEntries(
        Object.entries(monthly).map(([key, value]) => [key, value * 12])
    ) as Record<string, number>;
    
    return { monthly, annual };
};
