
import React from 'react';
import CandidateSidebar from './CandidateSidebar';
import Button from '../Button';
import { CandidateLayoutProps } from '../../types';

const CandidateLayout: React.FC<CandidateLayoutProps> = ({ children, onLogout, activeCandidateMenuItem, onCandidateMenuItemClick, userType }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <CandidateSidebar 
        activeItem={activeCandidateMenuItem} 
        onItemClick={onCandidateMenuItemClick}
      />
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-2xl font-semibold text-gray-800">
            Employee Dashboard
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

export default CandidateLayout;