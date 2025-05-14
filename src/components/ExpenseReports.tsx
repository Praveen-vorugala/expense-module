import React, { useState, useMemo } from 'react';
import { useExpense } from '../store/ExpenseContext';
import { ExpenseReport, ExpenseStatus, mockUsers, mockPolicies, mockExpenseTypes } from '../types/expense';

const ExpenseReports: React.FC = () => {
    const { expenses } = useExpense();
    const [statusFilter, setStatusFilter] = useState<ExpenseStatus | 'ALL'>('ALL');
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });

    const filteredExpenses = useMemo(() => {
        return expenses.filter(expense => {
            const matchesStatus = statusFilter === 'ALL' || expense.status === statusFilter;
            const matchesDate = (!dateRange.start || expense.date >= dateRange.start) &&
                (!dateRange.end || expense.date <= dateRange.end);
            return matchesStatus && matchesDate;
        });
    }, [expenses, statusFilter, dateRange]);

    const statistics = useMemo(() => {
        const stats = {
            totalAmount: 0,
            byPolicy: {} as Record<string, number>,
            byStatus: {} as Record<string, number>,
            byEmployee: {} as Record<string, number>,
            byExpenseType: {} as Record<string, number>
        };

        filteredExpenses.forEach(expense => {
            stats.totalAmount += expense.amount;
            
            // By policy
            const policy = mockPolicies.find(p => p.id === expense.policyId);
            const policyName = policy ? policy.name : 'Unknown Policy';
            stats.byPolicy[policyName] = (stats.byPolicy[policyName] || 0) + expense.amount;
            
            // By status
            stats.byStatus[expense.status] = (stats.byStatus[expense.status] || 0) + expense.amount;
            
            // By employee
            stats.byEmployee[expense.employeeId] = (stats.byEmployee[expense.employeeId] || 0) + expense.amount;

            // By expense type
            const expenseType = mockExpenseTypes.find(et => et.id === expense.expenseTypeId);
            const expenseTypeName = expenseType ? expenseType.name : 'Unknown Type';
            stats.byExpenseType[expenseTypeName] = (stats.byExpenseType[expenseTypeName] || 0) + expense.amount;
        });

        return stats;
    }, [filteredExpenses]);

    const getEmployeeName = (employeeId: string) => {
        return mockUsers.find(user => user.id === employeeId)?.name || 'Unknown Employee';
    };

    const getPolicyName = (policyId: string) => {
        return mockPolicies.find(policy => policy.id === policyId)?.name || 'Unknown Policy';
    };

    const getExpenseTypeName = (expenseTypeId: string) => {
        return mockExpenseTypes.find(type => type.id === expenseTypeId)?.name || 'Unknown Type';
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as ExpenseStatus | 'ALL')}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="REIMBURSED">Reimbursed</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500">Total Amount</h4>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">
                            ${statistics.totalAmount.toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500">By Policy</h4>
                        <div className="mt-2 space-y-1">
                            {Object.entries(statistics.byPolicy).map(([policy, amount]) => (
                                <div key={policy} className="flex justify-between">
                                    <span className="text-sm text-gray-600">{policy}</span>
                                    <span className="text-sm font-medium">${amount.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500">By Expense Type</h4>
                        <div className="mt-2 space-y-1">
                            {Object.entries(statistics.byExpenseType).map(([type, amount]) => (
                                <div key={type} className="flex justify-between">
                                    <span className="text-sm text-gray-600">{type}</span>
                                    <span className="text-sm font-medium">${amount.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500">By Status</h4>
                        <div className="mt-2 space-y-1">
                            {Object.entries(statistics.byStatus).map(([status, amount]) => (
                                <div key={status} className="flex justify-between">
                                    <span className="text-sm text-gray-600">{status}</span>
                                    <span className="text-sm font-medium">${amount.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500">By Employee</h4>
                        <div className="mt-2 space-y-1">
                            {Object.entries(statistics.byEmployee).map(([employeeId, amount]) => (
                                <div key={employeeId} className="flex justify-between">
                                    <span className="text-sm text-gray-600">
                                        {getEmployeeName(employeeId)}
                                    </span>
                                    <span className="text-sm font-medium">${amount.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Expense List */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Expense List</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Employee
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Policy
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Expense Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredExpenses.map((expense: ExpenseReport) => (
                                <tr key={expense.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {getEmployeeName(expense.employeeId)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(expense.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {getPolicyName(expense.policyId)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {getExpenseTypeName(expense.expenseTypeId)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ${expense.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                            ${expense.status === 'APPROVED' ? 'bg-green-100 text-green-800' : ''}
                                            ${expense.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                                            ${expense.status === 'REJECTED' ? 'bg-red-100 text-red-800' : ''}
                                            ${expense.status === 'REIMBURSED' ? 'bg-blue-100 text-blue-800' : ''}
                                        `}>
                                            {expense.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ExpenseReports; 