import React from 'react';
import Sidebar from './Sidebar';
import { AdminLayoutProps, UserType } from '../../types';
// Fix: Import missing Button component
import Button from '../Button';

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
    children, 
    onLogout, 
    activeAdminMenuItem, 
    onAdminMenuItemClick, 
    userType,
    onHomeClick 
}) => {
  const getDashboardTitle = () => {
    switch (userType) {
      case UserType.ADMIN:
        return 'Admin Dashboard';
      case UserType.HR:
        return 'HR Dashboard';
      case UserType.PARTNER:
        return 'Partner Dashboard';
      case UserType.TEAMLEAD:
        return 'Team Lead Dashboard';
      case UserType.TEAM:
        return 'Team Member Dashboard';
      case UserType.STORE_SUPERVISOR:
        return 'Store Supervisor Dashboard';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar 
        activeItem={activeAdminMenuItem} 
        onItemClick={onAdminMenuItemClick}
        userType={userType}
      />
      <div className="flex-1 flex flex-col">
        {/* Admin Top Bar */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center">
              <button 
                onClick={onHomeClick}
                className="mr-4 text-blue-600 hover:text-blue-800 focus:outline-none flex items-center"
                title="Go to main site"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
              <h2 className="text-2xl font-semibold text-gray-800">
                {getDashboardTitle()}
              </h2>
          </div>
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="sm" onClick={onLogout}>Logout</Button>
          </div>
        </header>
        <main className="flex-1 p-4 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;