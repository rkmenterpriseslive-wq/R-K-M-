
import React from 'react';
import Sidebar from './Sidebar';
import Button from '../Button';
import LogoUploader from '../LogoUploader';
import { AdminLayoutProps, UserType } from '../../types'; // Import UserType

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentLogoSrc, onLogoUpload, onLogout, activeAdminMenuItem, onAdminMenuItemClick, userType }) => {
  const getDashboardTitle = () => {
    switch (userType) {
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
        return 'Admin Dashboard';
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
          <Button variant="small-light" size="sm" onClick={onLogout} className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </Button>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;