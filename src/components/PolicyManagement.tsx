import React, { useState } from 'react';
import { useExpense } from '../store/ExpenseContext';
import { ExpensePolicy, UserRole, Grade, ExpenseRule, ExpenseCategory } from '../types/expense';

const PolicyManagement: React.FC = () => {
    const { policies, addPolicy, updatePolicy, expenseTypes } = useExpense();
    const [editingPolicy, setEditingPolicy] = useState<ExpensePolicy | null>(null);
    const [newPolicy, setNewPolicy] = useState<Partial<ExpensePolicy>>({
        name: '',
        description: '',
        rules: []
    });
    const [showRuleForm, setShowRuleForm] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState<ExpensePolicy | null>(null);
    const [newRule, setNewRule] = useState<Partial<ExpenseRule>>({
        expenseTypeId: '',
        amount: 0
    });
    const [isAddingRuleToNew, setIsAddingRuleToNew] = useState(false);
    const [ruleCreationType, setRuleCreationType] = useState<'type' | 'category'>('type');
    const [selectedCategories, setSelectedCategories] = useState<ExpenseCategory[]>([]);
    const [categoryAmounts, setCategoryAmounts] = useState<Record<string, number>>({});

    const availableRoles: UserRole[] = ['EMPLOYEE', 'MANAGER'];
    const availableGrades: Grade[] = ['MS1', 'MS2', 'MS3', 'MS4', 'MS5'];
    const availableCategories: ExpenseCategory[] = ['TRAVEL', 'MEALS', 'LODGING', 'OTHER'];

    const handleRoleChange = (role: UserRole) => {
        if (editingPolicy) {
            setEditingPolicy({ ...editingPolicy, applicableRole: role });
        } else {
            setNewPolicy({ ...newPolicy, applicableRole: role });
        }
    };

    const handleGradeChange = (grade: Grade) => {
        if (editingPolicy) {
            setEditingPolicy({ ...editingPolicy, applicableGrade: grade });
        } else {
            setNewPolicy({ ...newPolicy, applicableGrade: grade });
        }
    };

    const handleAddRule = (policy: ExpensePolicy | null = null) => {
        if (policy) {
            setSelectedPolicy(policy);
            setIsAddingRuleToNew(false);
        } else {
            setIsAddingRuleToNew(true);
        }
        setShowRuleForm(true);
        setNewRule({ expenseTypeId: '', amount: 0 });
    };

    const handleCategoryChange = (category: ExpenseCategory) => {
        setSelectedCategories(prev => {
            const newCategories = prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category];
            
            // Clear amounts for expense types that are no longer selected
            const relevantExpenseTypes = getExpenseTypesByCategories(newCategories);
            const relevantExpenseTypeIds = new Set(relevantExpenseTypes.map(type => type.id));
            
            setCategoryAmounts(prev => {
                const newAmounts = { ...prev };
                Object.keys(newAmounts).forEach(typeId => {
                    if (!relevantExpenseTypeIds.has(typeId)) {
                        delete newAmounts[typeId];
                    }
                });
                return newAmounts;
            });
            
            return newCategories;
        });
    };

    const handleSaveRule = () => {
        if (ruleCreationType === 'type') {
            if (!newRule.expenseTypeId || !newRule.amount) return;

            const rule: ExpenseRule = {
                id: Date.now().toString(),
                expenseTypeId: newRule.expenseTypeId,
                amount: newRule.amount
            };

            if (isAddingRuleToNew) {
                setNewPolicy(prev => ({
                    ...prev,
                    rules: [...(prev.rules || []), rule]
                }));
            } else if (selectedPolicy) {
                const updatedPolicy = {
                    ...selectedPolicy,
                    rules: [...selectedPolicy.rules, rule]
                };
                updatePolicy(updatedPolicy);
            }
        } else {
            // Category type rule creation
            if (selectedCategories.length === 0) return;

            const categoryExpenseTypes = getExpenseTypesByCategories(selectedCategories);
            const newRules: ExpenseRule[] = categoryExpenseTypes
                .filter(type => categoryAmounts[type.id] !== undefined && categoryAmounts[type.id] > 0)
                .map(type => ({
                    id: Date.now().toString() + '-' + type.id,
                    expenseTypeId: type.id,
                    amount: categoryAmounts[type.id]
                }));

            if (newRules.length === 0) return;

            if (isAddingRuleToNew) {
                setNewPolicy(prev => ({
                    ...prev,
                    rules: [...(prev.rules || []), ...newRules]
                }));
            } else if (selectedPolicy) {
                const updatedPolicy = {
                    ...selectedPolicy,
                    rules: [...selectedPolicy.rules, ...newRules]
                };
                updatePolicy(updatedPolicy);
            }
        }

        setShowRuleForm(false);
        setSelectedPolicy(null);
        setNewRule({ expenseTypeId: '', amount: 0 });
        setIsAddingRuleToNew(false);
        setRuleCreationType('type');
        setSelectedCategories([]);
        setCategoryAmounts({});
    };

    const handleSave = () => {
        if (editingPolicy) {
            updatePolicy(editingPolicy);
        } else if (newPolicy.name && newPolicy.applicableRole && newPolicy.applicableGrade && newPolicy.description) {
            addPolicy({
                name: newPolicy.name,
                applicableRole: newPolicy.applicableRole,
                applicableGrade: newPolicy.applicableGrade,
                description: newPolicy.description,
                rules: newPolicy.rules || []
            });
        }

        // Reset form
        setEditingPolicy(null);
        setNewPolicy({
            name: '',
            description: '',
            rules: []
        });
    };

    const isFormValid = () => {
        const policy = editingPolicy || newPolicy;
        return (
            policy.name &&
            policy.applicableRole &&
            policy.applicableGrade &&
            policy.description
        );
    };

    const getExpenseTypeName = (typeId: string) => {
        return expenseTypes.find(type => type.id === typeId)?.name || 'Unknown';
    };

    // Filter expense types by categories
    const getExpenseTypesByCategories = (categories: ExpenseCategory[]) => {
        return expenseTypes.filter(type => categories.includes(type.category));
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Expense Policies</h2>

            {/* Policy List */}
            <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Current Policies</h3>
                <div className="space-y-4">
                    {policies.map(policy => (
                        <div
                            key={policy.id}
                            className="border rounded-lg p-4 hover:bg-gray-50"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-medium">{policy.name}</h4>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Role: {policy.applicableRole}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Grade: {policy.applicableGrade}
                                    </p>
                                    <p className="text-sm mt-1">{policy.description}</p>
                                    
                                    {/* Expense Rules */}
                                    {policy.rules.length > 0 && (
                                        <div className="mt-4">
                                            <h5 className="text-sm font-medium text-gray-700">Expense Rules:</h5>
                                            <div className="mt-2 space-y-2">
                                                {policy.rules.map(rule => (
                                                    <div key={rule.id} className="text-sm text-gray-600">
                                                        {getExpenseTypeName(rule.expenseTypeId)}: ${rule.amount}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setEditingPolicy(policy)}
                                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleAddRule(policy)}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Add Expense Rule
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Rule Form Modal */}
            {showRuleForm && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center overflow-y-auto p-4">
                    <div className="bg-white rounded-lg w-full max-w-md" style={{ maxHeight: '90vh' }}>
                        {/* Modal Header - Fixed */}
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Add Expense Rule</h3>
                        </div>

                        {/* Modal Content - Scrollable */}
                        <div className="p-6 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
                            {/* Rule Creation Type Selection */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Select Rule Type
                                </label>
                                <div className="flex space-x-4">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            value="type"
                                            checked={ruleCreationType === 'type'}
                                            onChange={(e) => {
                                                setRuleCreationType('type');
                                                setSelectedCategories([]);
                                                setNewRule({ ...newRule, expenseTypeId: '' });
                                                setCategoryAmounts({});
                                            }}
                                            className="form-radio h-4 w-4 text-indigo-600"
                                        />
                                        <span className="ml-2">By Expense Type</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            value="category"
                                            checked={ruleCreationType === 'category'}
                                            onChange={(e) => {
                                                setRuleCreationType('category');
                                                setNewRule({ ...newRule, expenseTypeId: '' });
                                                setCategoryAmounts({});
                                            }}
                                            className="form-radio h-4 w-4 text-indigo-600"
                                        />
                                        <span className="ml-2">By Category</span>
                                    </label>
                                </div>
                            </div>

                            {/* Category Selection (shown when category is selected) */}
                            {ruleCreationType === 'category' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Expense Categories
                                    </label>
                                    <div className="space-y-2 bg-gray-50 p-4 rounded-md">
                                        {availableCategories.map(category => (
                                            <label key={category} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategories.includes(category)}
                                                    onChange={() => handleCategoryChange(category)}
                                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-sm text-gray-700">{category}</span>
                                            </label>
                                        ))}
                                    </div>

                                    {/* Individual amount inputs for each expense type */}
                                    {selectedCategories.length > 0 && (
                                        <div className="mt-6 space-y-6">
                                            {selectedCategories.map(category => (
                                                <div key={category} className="space-y-3">
                                                    <h4 className="font-medium text-gray-900 sticky top-0 bg-white py-2">
                                                        {category}
                                                    </h4>
                                                    <div className="bg-gray-50 p-4 rounded-md space-y-3">
                                                        {getExpenseTypesByCategories([category]).map(type => (
                                                            <div key={type.id} className="flex items-center space-x-4">
                                                                <label className="text-sm text-gray-600 flex-grow">
                                                                    {type.name}
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={categoryAmounts[type.id] || ''}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value ? parseFloat(e.target.value) : 0;
                                                                        setCategoryAmounts(prev => ({
                                                                            ...prev,
                                                                            [type.id]: value
                                                                        }));
                                                                    }}
                                                                    className="w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                                    placeholder="Enter amount"
                                                                    required
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Expense Type Selection - Only show when type is selected */}
                            {ruleCreationType === 'type' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Expense Type
                                    </label>
                                    <select
                                        value={newRule.expenseTypeId}
                                        onChange={(e) => setNewRule({ ...newRule, expenseTypeId: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        required
                                    >
                                        <option value="">Select an expense type</option>
                                        {expenseTypes.map(type => (
                                            <option key={type.id} value={type.id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Amount input - Only show when type is selected */}
                            {ruleCreationType === 'type' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Amount Limit
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={newRule.amount}
                                        onChange={(e) => setNewRule({ ...newRule, amount: parseFloat(e.target.value) })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        {/* Modal Footer - Fixed */}
                        <div className="p-6 border-t border-gray-200 bg-gray-50">
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleSaveRule}
                                    disabled={
                                        (ruleCreationType === 'type' && (!newRule.expenseTypeId || !newRule.amount)) ||
                                        (ruleCreationType === 'category' && 
                                            (selectedCategories.length === 0 || 
                                            !Object.values(categoryAmounts).some(amount => amount > 0)))
                                    }
                                    className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {ruleCreationType === 'category' ? 'Save Category Rules' : 'Save Rule'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowRuleForm(false);
                                        setSelectedPolicy(null);
                                        setIsAddingRuleToNew(false);
                                        setRuleCreationType('type');
                                        setSelectedCategories([]);
                                        setCategoryAmounts({});
                                    }}
                                    className="flex-1 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit/Create Form */}
            <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">
                    {editingPolicy ? 'Edit Policy' : 'Create New Policy'}
                </h3>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Policy Name
                        </label>
                        <input
                            type="text"
                            value={editingPolicy?.name || newPolicy.name}
                            onChange={(e) => {
                                if (editingPolicy) {
                                    setEditingPolicy({
                                        ...editingPolicy,
                                        name: e.target.value
                                    });
                                } else {
                                    setNewPolicy({
                                        ...newPolicy,
                                        name: e.target.value
                                    });
                                }
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Enter policy name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Applicable Role
                        </label>
                        <div className="space-x-4">
                            <select
                                value={editingPolicy?.applicableRole || newPolicy.applicableRole || ''}
                                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                required
                            >
                                <option value="">Select a role</option>
                                {availableRoles.map(role => (
                                    <option key={role} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Applicable Grade
                        </label>
                        <div className="space-x-4">
                            <select
                                value={editingPolicy?.applicableGrade || newPolicy.applicableGrade || ''}
                                onChange={(e) => handleGradeChange(e.target.value as Grade)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                required
                            >
                                <option value="">Select a grade</option>
                                {availableGrades.map(grade => (
                                    <option key={grade} value={grade}>
                                        {grade}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            value={editingPolicy?.description || newPolicy.description}
                            onChange={(e) => {
                                if (editingPolicy) {
                                    setEditingPolicy({
                                        ...editingPolicy,
                                        description: e.target.value
                                    });
                                } else {
                                    setNewPolicy({
                                        ...newPolicy,
                                        description: e.target.value
                                    });
                                }
                            }}
                            rows={3}
                            required
                            placeholder="Enter policy description"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    {/* Display Rules for New Policy */}
                    {!editingPolicy && newPolicy.rules && newPolicy.rules.length > 0 && (
                        <div className="mt-4">
                            <h5 className="text-sm font-medium text-gray-700">Expense Rules:</h5>
                            <div className="mt-2 space-y-2">
                                {newPolicy.rules.map(rule => (
                                    <div key={rule.id} className="text-sm text-gray-600">
                                        {getExpenseTypeName(rule.expenseTypeId)}: ${rule.amount}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add Rule Button for New Policy */}
                    {!editingPolicy && (
                        <div>
                            <button
                                type="button"
                                onClick={() => handleAddRule()}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Add Expense Rule
                            </button>
                        </div>
                    )}

                    <div className="flex space-x-3">
                        <button
                            type="submit"
                            disabled={!isFormValid()}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {editingPolicy ? 'Save Changes' : 'Create Policy'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setEditingPolicy(null);
                                setNewPolicy({
                                    name: '',
                                    description: '',
                                    rules: []
                                });
                            }}
                            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PolicyManagement; 