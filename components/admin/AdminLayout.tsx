


import React from 'react';
import Sidebar from './Sidebar';
import { AdminLayoutProps, UserType } from '../../types'; // Import UserType

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentLogoSrc, onLogoUpload, onLogout, activeAdminMenuItem, onAdminMenuItemClick, userType }) => {
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
        userType={userType} // Pass userType to Sidebar
      />
      <div className="flex-1 flex flex-col">
        {/* Admin Top Bar */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-2xl font-semibold text-gray-800">
            {getDashboardTitle()}
          </h2>
        </header>
        <main className="flex-1 p-4 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;