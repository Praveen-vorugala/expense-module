import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useExpense } from '../store/ExpenseContext';

const Navigation: React.FC = () => {
    const { currentUser } = useExpense();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const navigationItems = [
        { path: '/', label: 'Dashboard', showAlways: true },
        { path: '/submit-expense', label: 'Submit Expense', showAlways: true },
        { path: '/approve-expenses', label: 'Approve Expenses', managerOnly: true },
        { path: '/reports', label: 'Reports', adminOnly: true },
        { path: '/expense-types', label: 'Expense Types', adminOnly: true },
        { path: '/dropdown-types', label: 'Dropdown Types',showAlways: true},
        { path: '/policies', label: 'Policies', adminOnly: true },
    ];

    useEffect(() => {
        console.log(navigationItems);
    },[])

    return (
        <nav className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold text-indigo-600">ExpenseManager</span>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {navigationItems.map(item => {
                                if (item.adminOnly && currentUser?.role !== 'ADMIN') return null;
                                if (item.managerOnly && currentUser?.role !== 'MANAGER') return null;
                                if (!item.showAlways && !currentUser) return null;

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`${
                                            isActive(item.path)
                                                ? 'border-indigo-500 text-gray-900'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex items-center">
                        {currentUser && (
                            <span className="text-sm text-gray-500">
                                {currentUser.name} ({currentUser.role})
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className="sm:hidden">
                <div className="pt-2 pb-3 space-y-1">
                    {navigationItems.map(item => {
                        if (item.adminOnly && currentUser?.role !== 'ADMIN') return null;
                        if (item.managerOnly && currentUser?.role !== 'MANAGER') return null;
                        if (!item.showAlways && !currentUser) return null;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`${
                                    isActive(item.path)
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default Navigation; 