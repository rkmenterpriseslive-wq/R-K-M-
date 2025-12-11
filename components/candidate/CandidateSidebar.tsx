import React from 'react';
import { CandidateMenuItem, CandidateSidebarProps } from '../../types';

const Icons: Record<string, React.ReactNode> = {
  [CandidateMenuItem.ApplyJobs]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  [CandidateMenuItem.MyDocuments]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  [CandidateMenuItem.MyProfile]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  [CandidateMenuItem.CVGenerator]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586-6.586a2 2 0 10-2.828 2.828L7.172 10H6a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2v-4a2 2 0 00-2-2h-1.172l-2.586-2.586z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 5l7 7" /></svg>,
  [CandidateMenuItem.MyPayslips]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  [CandidateMenuItem.MyAttendance]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  [CandidateMenuItem.MyInterviews]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 14l2 2 4-4" /></svg>,
  [CandidateMenuItem.CompanyDocuments]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  [CandidateMenuItem.Resign]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  [CandidateMenuItem.HelpCenter]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

const CandidateSidebar: React.FC<CandidateSidebarProps> = ({ activeItem, onItemClick }) => {
  const menuItems = Object.values(CandidateMenuItem);

  return (
    <aside className="w-56 bg-white border-r border-gray-200 text-gray-800 flex flex-col shadow-lg h-full z-20">
      <div className="flex items-center mb-4 px-6 pt-6 pb-2">
        <span className="text-2xl font-extrabold text-[#1e293b] tracking-tight">R K M Career</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-2 flex flex-col">
        {menuItems.map(item => (
          <button
            key={item}
            onClick={() => onItemClick(item)}
            className={`flex items-center w-full px-3 py-2.5 mb-1 text-sm font-medium transition-all duration-200 rounded-lg group ${
              activeItem === item
                ? 'bg-[#1e293b] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span className={`mr-2 transition-colors duration-200 ${
              activeItem === item ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
            }`}>
              {Icons[item]}
            </span>
            <span className="whitespace-nowrap">{item}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default CandidateSidebar;