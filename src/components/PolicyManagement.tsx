import React, { useEffect, useState } from 'react';
import { useExpense } from '../store/ExpenseContext';
import { ExpensePolicy, UserRole, Grade, ExpenseRule, ExpenseCategory } from '../types/expense';

const PolicyManagement: React.FC = () => {
    const { policies, addPolicy, updatePolicy, expenseTypes, dropdownTypes } = useExpense();
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
        amount: 0,
        conditions: []
    });
    const [selectedDropdownType, setSelectedDropdownType] = useState<string>('');
    const [selectedDropdownOption, setSelectedDropdownOption] = useState<string>('');
    const [conditionAmount, setConditionAmount] = useState<number>(0);
    const [isAddingCondition, setIsAddingCondition] = useState(false);
    const [ruleCreationType, setRuleCreationType] = useState<'type' | 'category'>('type');
    const [selectedCategories, setSelectedCategories] = useState<ExpenseCategory[]>([]);
    const [categoryAmounts, setCategoryAmounts] = useState<Record<string, number>>({});

    const availableRoles: UserRole[] = ['EMPLOYEE', 'MANAGER'];
    const availableGrades: Grade[] = ['MS1', 'MS2', 'MS3', 'MS4', 'MS5'];
    const availableCategories: ExpenseCategory[] = ['FIELDWORK', 'MEALS', 'LODGING', 'OTHER','ADMIN'];

    const handleRoleChange = (role: UserRole) => {
        if (editingPolicy) {
            setEditingPolicy({ ...editingPolicy, applicableRole: role });
        } else {
            setNewPolicy({ ...newPolicy, applicableRole: role });
        }
    };

    useEffect(() => {
        console.log(selectedCategories);
        console.log(expenseTypes);
        
    },[selectedCategories]);

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
        }
        setShowRuleForm(true);
        setNewRule({ expenseTypeId: '', amount: 0, conditions: [] });
    };

    const handleAddCondition = () => {
        if (!selectedDropdownType || !selectedDropdownOption || !conditionAmount) return;

        const condition = {
            dropdownTypeId: selectedDropdownType,
            optionId: selectedDropdownOption,
            amount: conditionAmount
        };

        setNewRule(prev => ({
            ...prev,
            conditions: [...(prev.conditions || []), condition]
        }));

        // Reset condition form
        setSelectedDropdownOption('');
        setConditionAmount(0);
    };

    const handleSaveRule = () => {
        if (!newRule.expenseTypeId || !newRule.amount) return;

        const rule: ExpenseRule = {
            id: Date.now().toString(),
            expenseTypeId: newRule.expenseTypeId,
            amount: newRule.amount,
            conditions: newRule.conditions || []
        };

        if (selectedPolicy) {
            const updatedPolicy = {
                ...selectedPolicy,
                rules: [...selectedPolicy.rules, rule]
            };
            updatePolicy(updatedPolicy);
        } else {
            setNewPolicy(prev => ({
                ...prev,
                rules: [...(prev.rules || []), rule]
            }));
        }

        setShowRuleForm(false);
        setNewRule({ expenseTypeId: '', amount: 0, conditions: [] });
        setSelectedDropdownType('');
        setSelectedDropdownOption('');
        setConditionAmount(0);
        setIsAddingCondition(false);
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

    const getDropdownTypeName = (typeId: string) => {
        return dropdownTypes.find(type => type.id === typeId)?.name || 'Unknown';
    };

    const getDropdownOptionValue = (typeId: string, optionId: string) => {
        const type = dropdownTypes.find(t => t.id === typeId);
        return type?.options.find(opt => opt.id === optionId)?.value || 'Unknown';
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
                            className="border rounded-lg p-4 bg-white shadow-sm"
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-4 flex-grow">
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900">{policy.name}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
                                        <div className="mt-2 flex space-x-4 text-sm text-gray-500">
                                            <span>Role: {policy.applicableRole}</span>
                                            <span>Grade: {policy.applicableGrade}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Expense Rules */}
                                    {policy.rules.length > 0 && (
                                        <div className="mt-4">
                                            <h5 className="text-sm font-medium text-gray-900 mb-2">Expense Rules:</h5>
                                            <div className="space-y-3">
                                                {policy.rules.map(rule => (
                                                    <div key={rule.id} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {getExpenseTypeName(rule.expenseTypeId)}
                                                        </div>
                                                        <div className="text-sm text-gray-600 mt-1">
                                                            Default Amount: ${rule.amount}
                                                        </div>
                                                        {rule.conditions && rule.conditions.length > 0 && (
                                                            <div className="mt-2 border-t border-gray-200 pt-2">
                                                                <div className="text-xs font-medium text-gray-700">Special Conditions:</div>
                                                                <div className="ml-4 mt-1 space-y-1">
                                                                    {rule.conditions.map((condition, idx) => (
                                                                        <div key={idx} className="text-sm text-gray-600 flex justify-between items-center">
                                                                            <span>
                                                                                {getDropdownTypeName(condition.dropdownTypeId)}: {getDropdownOptionValue(condition.dropdownTypeId, condition.optionId)}
                                                                            </span>
                                                                            <span className="font-medium">
                                                                                ${condition.amount}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="ml-4 flex space-x-2">
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
                                        Add Rule
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Rule Form Modal */}
            {showRuleForm && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                        <h3 className="text-lg font-medium mb-4">Add Expense Rule</h3>

                        {/* Rule Type Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rule Creation Type
                            </label>
                            <div className="flex space-x-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        value="type"
                                        checked={ruleCreationType === 'type'}
                                        onChange={() => {
                                            setRuleCreationType('type');
                                            setSelectedCategories([]);
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
                                        onChange={() => {
                                            setRuleCreationType('category');
                                            setNewRule({ expenseTypeId: '', amount: 0, conditions: [] });
                                            setSelectedDropdownType('');
                                            setSelectedDropdownOption('');
                                            setConditionAmount(0);
                                        }}
                                        className="form-radio h-4 w-4 text-indigo-600"
                                    />
                                    <span className="ml-2">By Category</span>
                                </label>
                            </div>
                        </div>

                        {ruleCreationType === 'type' ? (
                            <>
                                {/* Basic Rule Fields */}
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Expense Type
                                        </label>
                                        <select
                                            value={newRule.expenseTypeId}
                                            onChange={(e) => setNewRule({ ...newRule, expenseTypeId: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        >
                                            <option value="">Select an expense type</option>
                                            {expenseTypes.map(type => (
                                                <option key={type.id} value={type.id}>
                                                    {type.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Default Amount Limit
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={newRule.amount}
                                            onChange={(e) => setNewRule({ ...newRule, amount: parseFloat(e.target.value) })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Conditions Section */}
                                <div className="border-t pt-4">
                                    <h4 className="text-md font-medium mb-4">Special Conditions</h4>
                                    
                                    {/* Existing Conditions */}
                                    {newRule.conditions && newRule.conditions.length > 0 && (
                                        <div className="mb-4 space-y-2">
                                            {newRule.conditions.map((condition, index) => (
                                                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                    <span>
                                                        {getDropdownTypeName(condition.dropdownTypeId)}: {getDropdownOptionValue(condition.dropdownTypeId, condition.optionId)} - ${condition.amount}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add Condition Button */}
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingCondition(true)}
                                        className="mb-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                    >
                                        Add Condition
                                    </button>

                                    {/* Add Condition Form */}
                                    {isAddingCondition && (
                                        <div className="space-y-4 bg-gray-50 p-4 rounded">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Select Type
                                                </label>
                                                <select
                                                    value={selectedDropdownType}
                                                    onChange={(e) => setSelectedDropdownType(e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                >
                                                    <option value="">Select a type</option>
                                                    {dropdownTypes.map(type => (
                                                        <option key={type.id} value={type.id}>
                                                            {type.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Select Option
                                                </label>
                                                <select
                                                    value={selectedDropdownOption}
                                                    onChange={(e) => setSelectedDropdownOption(e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                >
                                                    <option value="">Select an option</option>
                                                    {dropdownTypes
                                                        .find(t => t.id === selectedDropdownType)
                                                        ?.options.map(option => (
                                                            <option key={option.id} value={option.id}>
                                                                {option.value}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Amount for this condition
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={conditionAmount}
                                                    onChange={(e) => setConditionAmount(parseFloat(e.target.value))}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </div>

                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleAddCondition();
                                                        setIsAddingCondition(false);
                                                    }}
                                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                                >
                                                    Add Condition
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsAddingCondition(false)}
                                                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            /* Category Based Rules */
                            <div className="space-y-6">
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
                                                    onChange={() => {
                                                        const newCategories = selectedCategories.includes(category)
                                                            ? selectedCategories.filter(c => c !== category)
                                                            : [...selectedCategories, category];
                                                        setSelectedCategories(newCategories);
                                                        
                                                        // Clear amounts for unselected categories
                                                        if (!newCategories.includes(category)) {
                                                            const newAmounts = { ...categoryAmounts };
                                                            expenseTypes
                                                                .filter(type => type.category === category)
                                                                .forEach(type => {
                                                                    delete newAmounts[type.id];
                                                                });
                                                            setCategoryAmounts(newAmounts);
                                                        }
                                                    }}
                                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-sm text-gray-700">{category}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {selectedCategories.length > 0 && (
                                    <div className="space-y-6">
                                        {selectedCategories.map(category => (
                                            <div key={category} className="bg-white border rounded-md p-4">
                                                <h4 className="font-medium text-gray-900 mb-3">
                                                    {category}
                                                </h4>
                                                <div className="space-y-3">
                                                    {expenseTypes
                                                        .filter(type => type.category === category)
                                                        .map(type => (
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

                        {/* Modal Footer */}
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    if (ruleCreationType === 'type') {
                                        handleSaveRule();
                                    } else {
                                        // Handle category-based rules
                                        if (selectedCategories.length === 0) return;

                                        const categoryExpenseTypes = expenseTypes.filter(type => 
                                            selectedCategories.includes(type.category)
                                        );

                                        const newRules: ExpenseRule[] = categoryExpenseTypes
                                            .filter(type => categoryAmounts[type.id] !== undefined && categoryAmounts[type.id] > 0)
                                            .map(type => ({
                                                id: Date.now().toString() + '-' + type.id,
                                                expenseTypeId: type.id,
                                                amount: categoryAmounts[type.id],
                                                conditions: []
                                            }));

                                        if (newRules.length === 0) return;

                                        if (selectedPolicy) {
                                            const updatedPolicy = {
                                                ...selectedPolicy,
                                                rules: [...selectedPolicy.rules, ...newRules]
                                            };
                                            updatePolicy(updatedPolicy);
                                        } else {
                                            setNewPolicy(prev => ({
                                                ...prev,
                                                rules: [...(prev.rules || []), ...newRules]
                                            }));
                                        }

                                        setShowRuleForm(false);
                                        setSelectedCategories([]);
                                        setCategoryAmounts({});
                                        setRuleCreationType('type');
                                    }
                                }}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                disabled={
                                    (ruleCreationType === 'type' && (!newRule.expenseTypeId || !newRule.amount)) ||
                                    (ruleCreationType === 'category' && 
                                        (selectedCategories.length === 0 || 
                                        !Object.values(categoryAmounts).some(amount => amount > 0)))
                                }
                            >
                                {ruleCreationType === 'category' ? 'Save Category Rules' : 'Save Rule'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowRuleForm(false);
                                    setNewRule({ expenseTypeId: '', amount: 0, conditions: [] });
                                    setSelectedDropdownType('');
                                    setSelectedDropdownOption('');
                                    setConditionAmount(0);
                                    setSelectedCategories([]);
                                    setCategoryAmounts({});
                                    setRuleCreationType('type');
                                }}
                                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Cancel
                            </button>
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
                        <div className="mt-6 border-t pt-4">
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Expense Rules:</h5>
                            <div className="space-y-3">
                                {newPolicy.rules.map(rule => (
                                    <div key={rule.id} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                                        <div className="text-sm font-medium text-gray-900">
                                            {getExpenseTypeName(rule.expenseTypeId)}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            Default Amount: ${rule.amount}
                                        </div>
                                        {rule.conditions && rule.conditions.length > 0 && (
                                            <div className="mt-2 border-t border-gray-200 pt-2">
                                                <div className="text-xs font-medium text-gray-700">Special Conditions:</div>
                                                <div className="ml-4 mt-1 space-y-1">
                                                    {rule.conditions.map((condition, idx) => (
                                                        <div key={idx} className="text-sm text-gray-600 flex justify-between items-center">
                                                            <span>
                                                                {getDropdownTypeName(condition.dropdownTypeId)}: {getDropdownOptionValue(condition.dropdownTypeId, condition.optionId)}
                                                            </span>
                                                            <span className="font-medium">
                                                                ${condition.amount}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Display Rules for Editing Policy */}
                    {editingPolicy && editingPolicy.rules.length > 0 && (
                        <div className="mt-6 border-t pt-4">
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Expense Rules:</h5>
                            <div className="space-y-3">
                                {editingPolicy.rules.map(rule => (
                                    <div key={rule.id} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                                        <div className="text-sm font-medium text-gray-900">
                                            {getExpenseTypeName(rule.expenseTypeId)}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            Default Amount: ${rule.amount}
                                        </div>
                                        {rule.conditions && rule.conditions.length > 0 && (
                                            <div className="mt-2 border-t border-gray-200 pt-2">
                                                <div className="text-xs font-medium text-gray-700">Special Conditions:</div>
                                                <div className="ml-4 mt-1 space-y-1">
                                                    {rule.conditions.map((condition, idx) => (
                                                        <div key={idx} className="text-sm text-gray-600 flex justify-between items-center">
                                                            <span>
                                                                {getDropdownTypeName(condition.dropdownTypeId)}: {getDropdownOptionValue(condition.dropdownTypeId, condition.optionId)}
                                                            </span>
                                                            <span className="font-medium">
                                                                ${condition.amount}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add Rule Button */}
                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={() => handleAddRule()}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Add Expense Rule
                        </button>
                    </div>

                    <div className="flex space-x-3 mt-6">
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