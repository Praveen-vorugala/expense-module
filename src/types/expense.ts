export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export type ExpenseCategory = 'TRAVEL' | 'MEALS' | 'LODGING' | 'OTHER';

export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REIMBURSED';

export type Grade = 'MS1' | 'MS2' | 'MS3' | 'MS4' | 'MS5';

export interface ExpenseType {
    id: string;
    name: string;
    description: string;
    category: ExpenseCategory;
    isActive: boolean;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    grade: Grade;
}

export interface ExpenseTypeLimit {
    expenseTypeId: string;
    amount: number;
}

export interface ExpenseRule {
    id: string;
    expenseTypeId: string;
    amount: number;
}

export interface ExpensePolicy {
    id: string;
    name: string;
    applicableRole: UserRole;
    applicableGrade: Grade;
    description: string;
    rules: ExpenseRule[];
}

export interface ExpenseReport {
    id: string;
    employeeId: string;
    date: string;
    policyId: string;
    expenseTypeId: string;
    amount: number;
    description: string;
    receiptUrl: string;
    status: ExpenseStatus;
    submittedAt: string;
    approvedBy?: string;
    approvedAt?: string;
    rejectionReason?: string;
    reimbursedAt?: string;
}

// Mock data for static usage
export const mockUsers: User[] = [
    {
        id: '1',
        name: 'John Admin',
        email: 'admin@example.com',
        role: 'ADMIN',
        grade: 'MS5'
    },
    {
        id: '2',
        name: 'Mike Manager',
        email: 'manager@example.com',
        role: 'MANAGER',
        grade: 'MS4'
    },
    {
        id: '3',
        name: 'Emily Employee',
        email: 'employee@example.com',
        role: 'EMPLOYEE',
        grade: 'MS2'
    }
];

export const mockExpenseTypes: ExpenseType[] = [
    {
        id: '1',
        name: 'HQ',
        description: 'Expenses related to headquarters operations',
        category: 'TRAVEL',
        isActive: true
    },
    {
        id: '2',
        name: 'Ex-HQ',
        description: 'Expenses outside headquarters',
        category: 'LODGING',
        isActive: true
    },
    {
        id: '3',
        name: 'Hill-station',
        description: 'Expenses related to hill station visits',
        category: 'TRAVEL',
        isActive: true
    }
];

export const mockPolicies: ExpensePolicy[] = [
    {
        id: '1',
        name: 'Standard Travel Policy',
        applicableRole: 'EMPLOYEE',
        applicableGrade: 'MS1',
        description: 'Standard policy for all travel related expenses',
        rules: []
    },
    {
        id: '2',
        name: 'Food & Dining Policy',
        applicableRole: 'MANAGER',
        applicableGrade: 'MS3',
        description: 'Policy covering all food and dining expenses',
        rules: []
    },
    {
        id: '3',
        name: 'Accommodation Policy',
        applicableRole: 'MANAGER',
        applicableGrade: 'MS4',
        description: 'Policy for hotel and accommodation expenses',
        rules: []
    }
];

export const mockExpenses: ExpenseReport[] = [
    {
        id: '1',
        employeeId: '3',
        date: '2024-03-15',
        policyId: '1',
        expenseTypeId: '1',
        amount: 850,
        description: 'Flight to New York',
        receiptUrl: '/mock-receipt-1.pdf',
        status: 'PENDING',
        submittedAt: '2024-03-16T10:00:00Z'
    },
    {
        id: '2',
        employeeId: '3',
        date: '2024-03-16',
        policyId: '2',
        expenseTypeId: '2',
        amount: 75,
        description: 'Client dinner',
        receiptUrl: '/mock-receipt-2.pdf',
        status: 'APPROVED',
        submittedAt: '2024-03-17T09:00:00Z',
        approvedBy: '2',
        approvedAt: '2024-03-17T14:00:00Z'
    }
]; 