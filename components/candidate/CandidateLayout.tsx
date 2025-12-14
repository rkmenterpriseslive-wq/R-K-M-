

import React from 'react';
import CandidateSidebar from './CandidateSidebar';
import { CandidateLayoutProps } from '../../types';

const CandidateLayout: React.FC<CandidateLayoutProps> = ({ children, onLogout, activeCandidateMenuItem, onCandidateMenuItemClick, userType, isCvComplete }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <CandidateSidebar 
        activeItem={activeCandidateMenuItem} 
        onItemClick={onCandidateMenuItemClick}
        isCvComplete={isCvComplete}
      />
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-2xl font-semibold text-gray-800">
            Employee Dashboard
          </h2>
        </header>
        <main className="flex-1 p-4 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default CandidateLayout;