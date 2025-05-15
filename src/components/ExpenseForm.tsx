import React, { useState } from 'react';
import { useExpense } from '../store/ExpenseContext';
import { ExpensePolicy, User, PolicyCondition } from '../types/expense';

const ExpenseForm: React.FC = () => {
    const { currentUser, policies, expenseTypes, addExpense } = useExpense();
    const [formData, setFormData] = useState({
        date: '',
        policyId: '',
        expenseTypeId: '',
        amount: '',
        description: '',
        receiptUrl: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        addExpense({
            employeeId: currentUser.id,
            date: formData.date,
            policyId: formData.policyId,
            expenseTypeId: formData.expenseTypeId,
            amount: parseFloat(formData.amount),
            description: formData.description,
            receiptUrl: formData.receiptUrl
        });

        // Reset form
        setFormData({
            date: '',
            policyId: '',
            expenseTypeId: '',
            amount: '',
            description: '',
            receiptUrl: ''
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Get active expense types
    const activeExpenseTypes = expenseTypes.filter(type => type.isActive);

    const isUserEligibleForPolicy = (policy: ExpensePolicy, user: User) => {
        return policy.conditions.every(condition => {
            if (condition.propertyType === 'ROLE') {
                return condition.value === user.role;
            }
            if (condition.propertyType === 'GRADE') {
                return condition.value === user.grade;
            }
            return true; // For any other condition types
        });
    };

    // Get applicable policies for the current user
    const applicablePolicies = policies.filter(policy => 
        currentUser ? isUserEligibleForPolicy(policy, currentUser) : false
    );

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Submit New Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Date
                    </label>
                    <input
                        type="date"
                        name="date"
                        required
                        value={formData.date}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Policy
                    </label>
                    <select
                        name="policyId"
                        required
                        value={formData.policyId}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                        <option value="">Select a policy</option>
                        {applicablePolicies.map(policy => (
                            <option key={policy.id} value={policy.id}>
                                {policy.name}
                            </option>
                        ))}
                    </select>
                    {formData.policyId && (
                        <p className="mt-1 text-sm text-gray-500">
                            {applicablePolicies.find(p => p.id === formData.policyId)?.description}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Expense Type
                    </label>
                    <select
                        name="expenseTypeId"
                        required
                        value={formData.expenseTypeId}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                        <option value="">Select an expense type</option>
                        {activeExpenseTypes.map(type => (
                            <option key={type.id} value={type.id}>
                                {type.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Amount
                    </label>
                    <input
                        type="number"
                        name="amount"
                        required
                        min="0"
                        step="0.01"
                        value={formData.amount}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <textarea
                        name="description"
                        required
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Receipt URL
                    </label>
                    <input
                        type="text"
                        name="receiptUrl"
                        required
                        value={formData.receiptUrl}
                        onChange={handleChange}
                        placeholder="URL to the receipt image/document"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Submit Expense
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ExpenseForm; 