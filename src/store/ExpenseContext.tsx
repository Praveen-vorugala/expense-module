import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
    User,
    ExpensePolicy,
    ExpenseReport,
    mockUsers,
    mockPolicies,
    mockExpenses,
    ExpenseStatus,
    ExpenseCategory,
    ExpenseType,
    mockExpenseTypes
} from '../types/expense';

interface ExpenseContextType {
    currentUser: User | null;
    policies: ExpensePolicy[];
    expenses: ExpenseReport[];
    expenseTypes: ExpenseType[];
    login: (email: string) => void;
    logout: () => void;
    addExpense: (expense: Omit<ExpenseReport, 'id' | 'status' | 'submittedAt'>) => void;
    updateExpenseStatus: (expenseId: string, status: ExpenseStatus, remarks?: string) => void;
    addPolicy: (policy: Omit<ExpensePolicy, 'id'>) => void;
    updatePolicy: (policy: ExpensePolicy) => void;
    addExpenseType: (expenseType: Omit<ExpenseType, 'id'>) => void;
    updateExpenseType: (expenseType: ExpenseType) => void;
    toggleExpenseTypeStatus: (expenseTypeId: string) => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [policies, setPolicies] = useState<ExpensePolicy[]>(mockPolicies);
    const [expenses, setExpenses] = useState<ExpenseReport[]>(mockExpenses);
    const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>(mockExpenseTypes);

    const login = (email: string) => {
        const user = mockUsers.find(u => u.email === email);
        if (user) {
            setCurrentUser(user);
        }
        // In real app: Make API call to authenticate user
        // const response = await fetch('/api/login', { method: 'POST', body: JSON.stringify({ email }) });
        // const user = await response.json();
        // setCurrentUser(user);
    };

    const logout = () => {
        setCurrentUser(null);
        // In real app: Make API call to logout
        // await fetch('/api/logout', { method: 'POST' });
    };

    const addExpense = (expense: Omit<ExpenseReport, 'id' | 'status' | 'submittedAt'>) => {
        const newExpense: ExpenseReport = {
            ...expense,
            id: (expenses.length + 1).toString(),
            status: 'PENDING',
            submittedAt: new Date().toISOString()
        };
        setExpenses([...expenses, newExpense]);
        // In real app: Make API call to create expense
        // await fetch('/api/expenses', { method: 'POST', body: JSON.stringify(newExpense) });
    };

    const updateExpenseStatus = (expenseId: string, status: ExpenseStatus, remarks?: string) => {
        setExpenses(expenses.map(expense => {
            if (expense.id === expenseId) {
                return {
                    ...expense,
                    status,
                    ...(status === 'APPROVED' && {
                        approvedBy: currentUser?.id,
                        approvedAt: new Date().toISOString()
                    }),
                    ...(status === 'REJECTED' && {
                        rejectionReason: remarks
                    }),
                    ...(status === 'REIMBURSED' && {
                        reimbursedAt: new Date().toISOString()
                    })
                };
            }
            return expense;
        }));
        // In real app: Make API call to update expense
        // await fetch(`/api/expenses/${expenseId}`, { 
        //     method: 'PUT', 
        //     body: JSON.stringify({ status, remarks }) 
        // });
    };

    const addPolicy = (policy: Omit<ExpensePolicy, 'id'>) => {
        const newPolicy: ExpensePolicy = {
            ...policy,
            id: (policies.length + 1).toString()
        };
        setPolicies([...policies, newPolicy]);
        // In real app: Make API call to create policy
        // await fetch('/api/policies', { method: 'POST', body: JSON.stringify(newPolicy) });
    };

    const updatePolicy = (policy: ExpensePolicy) => {
        setPolicies(policies.map(p => p.id === policy.id ? policy : p));
        // In real app: Make API call to update policy
        // await fetch(`/api/policies/${policy.id}`, { 
        //     method: 'PUT', 
        //     body: JSON.stringify(policy) 
        // });
    };

    const addExpenseType = (expenseType: Omit<ExpenseType, 'id'>) => {
        const newExpenseType: ExpenseType = {
            ...expenseType,
            id: (expenseTypes.length + 1).toString()
        };
        setExpenseTypes([...expenseTypes, newExpenseType]);
    };

    const updateExpenseType = (expenseType: ExpenseType) => {
        setExpenseTypes(expenseTypes.map(et => et.id === expenseType.id ? expenseType : et));
    };

    const toggleExpenseTypeStatus = (expenseTypeId: string) => {
        setExpenseTypes(expenseTypes.map(et => 
            et.id === expenseTypeId ? { ...et, isActive: !et.isActive } : et
        ));
    };

    return (
        <ExpenseContext.Provider value={{
            currentUser,
            policies,
            expenses,
            expenseTypes,
            login,
            logout,
            addExpense,
            updateExpenseStatus,
            addPolicy,
            updatePolicy,
            addExpenseType,
            updateExpenseType,
            toggleExpenseTypeStatus
        }}>
            {children}
        </ExpenseContext.Provider>
    );
};

export const useExpense = () => {
    const context = useContext(ExpenseContext);
    if (context === undefined) {
        throw new Error('useExpense must be used within an ExpenseProvider');
    }
    return context;
}; 