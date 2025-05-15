import React, { useState } from 'react';
import { UserProperty } from '../types/user';
import UserPropertiesManagement from '../components/UserProperties/UserPropertiesManagement';

// Mock data for user properties
const MOCK_PROPERTIES: UserProperty[] = [
  // Roles
  {
    id: '1',
    name: 'Employee Role',
    type: 'ROLE',
    value: 'EMPLOYEE',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Manager Role',
    type: 'ROLE',
    value: 'MANAGER',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Grades
  {
    id: '3',
    name: 'Grade MS1',
    type: 'GRADE',
    value: 'MS1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    name: 'Grade MS2',
    type: 'GRADE',
    value: 'MS2',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5',
    name: 'Grade MS3',
    type: 'GRADE',
    value: 'MS3',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '6',
    name: 'Grade MS4',
    type: 'GRADE',
    value: 'MS4',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Positions
  {
    id: '7',
    name: 'Full-time Position',
    type: 'POSITION',
    value: 'FULLTIME',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '8',
    name: 'Probation Position',
    type: 'POSITION',
    value: 'PROBATION',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const UserPropertiesPage: React.FC = () => {
  const [userProperties, setUserProperties] = useState<UserProperty[]>(MOCK_PROPERTIES);
  const [error, setError] = useState<string | null>(null);

  const handleAddProperty = (
    property: Omit<UserProperty, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newProperty: UserProperty = {
      ...property,
      id: String(Date.now()), // Generate a simple unique ID
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setUserProperties([...userProperties, newProperty]);
  };

  const handleDeleteProperty = (propertyId: string) => {
    setUserProperties(userProperties.filter((p) => p.id !== propertyId));
  };

  return (
    <div className="container mx-auto px-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}
      <div className="mb-4">
        <h1 className="text-2xl font-bold">User Properties</h1>
      </div>
      <UserPropertiesManagement
        userProperties={userProperties}
        onAddProperty={handleAddProperty}
        onDeleteProperty={handleDeleteProperty}
      />
    </div>
  );
};

export default UserPropertiesPage; 