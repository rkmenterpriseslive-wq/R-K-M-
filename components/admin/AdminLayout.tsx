
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { AdminLayoutProps, UserType } from '../../types';
import Button from '../Button';

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
    children, 
    activeAdminMenuItem, 
    onAdminMenuItemClick, 
    userType,
    onHomeClick 
}) => {
  // Fix: Declare isMobileMenuOpen state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getDashboardTitle = () => {
    switch (userType) {
      case UserType.ADMIN: return ''; // Removed "Admin Dashboard" text for Admin users
      case UserType.HR: return 'HR Dashboard';
      case UserType.PARTNER: return 'Partner Dashboard';
      case UserType.TEAMLEAD: return ''; // Removed "Team Lead Dashboard" title
      case UserType.TEAM: return 'Team Member Dashboard';
      case UserType.STORE_SUPERVISOR: return 'Store Supervisor Dashboard';
      default: return 'Dashboard';
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar with mobile state */}
      <Sidebar 
        activeItem={activeAdminMenuItem} 
        onItemClick={(item) => {
            onAdminMenuItemClick(item);
            setIsMobileMenuOpen(false); // Close on selection on mobile
        }}
        userType={userType}
        isOpen={isMobileMenuOpen}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Top Bar */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center">
              {/* Hamburger Menu - Only Visible on Mobile */}
              <button 
                onClick={toggleMobileMenu}
                className="mr-3 p-2 rounded-lg text-gray-500 hover:bg-gray-100 md:hidden focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Home icon button removed as per user request */}
              {getDashboardTitle() && ( // Only render if title is not empty
                <h2 className="text-lg md:text-2xl font-semibold text-gray-800 truncate">
                  {getDashboardTitle()}
                </h2>
              )}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
