import React from 'react';
import { AdminMenuItem, SidebarProps, UserType } from '../../types';

// Updated icons to match the design screenshot closely
const Icons: Record<string, React.ReactNode> = {
  [AdminMenuItem.Dashboard]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  [AdminMenuItem.DailyLineups]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  [AdminMenuItem.SelectionDashboard]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  [AdminMenuItem.AllCandidates]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>, // People/Cloud look
  [AdminMenuItem.Attendance]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  [AdminMenuItem.Complaints]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  [AdminMenuItem.WarningLetters]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, // Exclamation Circle
  [AdminMenuItem.Reports]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>, // Chat bubble style as per screenshot
  [AdminMenuItem.ManageJobBoard]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  [AdminMenuItem.VendorDirectory]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  [AdminMenuItem.DemoRequests]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  [AdminMenuItem.Revenue]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  [AdminMenuItem.Settings]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  
  // HR & Partner Icons
  [AdminMenuItem.ManagePayroll]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  [AdminMenuItem.GenerateOfferLetter]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  [AdminMenuItem.CTCGenerate]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  [AdminMenuItem.Payslips]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" /></svg>,
  [AdminMenuItem.EmployeeManagement]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
  [AdminMenuItem.MyProfile]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  [AdminMenuItem.PartnerUpdateStatus]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  [AdminMenuItem.PartnerActiveCandidates]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  [AdminMenuItem.ManageSupervisors]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
  [AdminMenuItem.PartnerRequirements]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  [AdminMenuItem.PartnerInvoices]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  [AdminMenuItem.PartnerHelpCenter]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  [AdminMenuItem.PartnerSalaryUpdates]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  // Supervisor Icons
  [AdminMenuItem.SupervisorDashboard]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  [AdminMenuItem.StoreAttendance]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  [AdminMenuItem.StoreEmployees]: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
};

// Map long labels to shorter ones for better display
const shortLabels: Record<string, string> = {
  [AdminMenuItem.DailyLineups]: 'Daily Lineups',
  [AdminMenuItem.SelectionDashboard]: 'Selection Dashboard',
  [AdminMenuItem.AllCandidates]: 'All Candidates',
  [AdminMenuItem.WarningLetters]: 'Warning Letters',
  [AdminMenuItem.ManageJobBoard]: 'Manage Job Board',
  [AdminMenuItem.VendorDirectory]: 'Vendor Directory',
  [AdminMenuItem.ManagePayroll]: 'Manage Payroll',
  [AdminMenuItem.GenerateOfferLetter]: 'Generate Offer Letter',
  [AdminMenuItem.CTCGenerate]: 'CTC Generate',
  [AdminMenuItem.EmployeeManagement]: 'Employee Management',
  [AdminMenuItem.MyProfile]: 'My Profile',
  [AdminMenuItem.PartnerUpdateStatus]: 'Interview Status',
  [AdminMenuItem.PartnerActiveCandidates]: 'Active Candidates',
  [AdminMenuItem.ManageSupervisors]: 'Manage Supervisors',
  [AdminMenuItem.PartnerRequirements]: 'Partner Requirements',
  [AdminMenuItem.PartnerInvoices]: 'Partner Invoices',
  [AdminMenuItem.PartnerHelpCenter]: 'Partner Help Center',
};

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemClick, userType }) => {
  
  const NavItem = ({ label, isHeader }: { label?: AdminMenuItem | string, isHeader?: boolean }) => {
    if (isHeader) {
      return (
        <div className="px-6 py-2 mt-2 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {label}
        </div>
      );
    }

    const itemLabel = label as AdminMenuItem;
    const isActive = activeItem === itemLabel;
    const displayText = shortLabels[itemLabel] || itemLabel;

    return (
      <button 
        onClick={() => onItemClick(itemLabel)} 
        className={`flex items-center w-full px-3 py-2.5 mb-1 text-sm font-medium transition-all duration-200 rounded-lg group ${
          isActive 
            ? 'bg-[#1e293b] text-white shadow-sm' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <span className={`mr-2 transition-colors duration-200 ${
          isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
        }`}>
          {Icons[itemLabel]}
        </span>
        <span className="whitespace-nowrap">{displayText}</span>
      </button>
    );
  };

  const getMenuContent = () => {
    if (userType === UserType.ADMIN) {
      return (
        <>
          <NavItem label={AdminMenuItem.Dashboard} />
          <NavItem label={AdminMenuItem.DailyLineups} />
          <NavItem label={AdminMenuItem.SelectionDashboard} />
          <NavItem label={AdminMenuItem.AllCandidates} />
          <NavItem label={AdminMenuItem.Attendance} />
          <NavItem label={AdminMenuItem.Complaints} />
          <NavItem label={AdminMenuItem.WarningLetters} />
          <NavItem label={AdminMenuItem.Reports} />
          
          <div className="my-2 border-t border-gray-100 mx-4"></div>
          
          <NavItem label={AdminMenuItem.ManageJobBoard} />
          <NavItem label={AdminMenuItem.VendorDirectory} />
          <NavItem label={AdminMenuItem.DemoRequests} />
          <NavItem label={AdminMenuItem.Revenue} />
          
          <div className="mt-auto">
             <div className="my-2 border-t border-gray-100 mx-4"></div>
             <NavItem label={AdminMenuItem.Settings} />
          </div>
        </>
      );
    } else if (userType === UserType.HR) {
       return (
        <>
          <NavItem label={AdminMenuItem.Dashboard} />
          <NavItem label={AdminMenuItem.ManagePayroll} />
          <NavItem label={AdminMenuItem.GenerateOfferLetter} />
          <NavItem label={AdminMenuItem.CTCGenerate} />
          <NavItem label={AdminMenuItem.Payslips} />
          <NavItem label={AdminMenuItem.EmployeeManagement} />
          <NavItem label={AdminMenuItem.MyProfile} />
        </>
       );
    } else if (userType === UserType.PARTNER) {
        return (
          <>
            <NavItem label={AdminMenuItem.Dashboard} />
            <NavItem label={AdminMenuItem.PartnerActiveCandidates} />
            <NavItem label={AdminMenuItem.ManageSupervisors} />
            <NavItem label={AdminMenuItem.PartnerUpdateStatus} />
            <NavItem label={AdminMenuItem.PartnerRequirements} />
            <NavItem label={AdminMenuItem.PartnerInvoices} />
            <NavItem label={AdminMenuItem.PartnerSalaryUpdates} />
            <NavItem label={AdminMenuItem.Complaints} />
            <NavItem label={AdminMenuItem.WarningLetters} />
            <div className="mt-auto">
              <div className="my-2 border-t border-gray-100 mx-4"></div>
              <NavItem label={AdminMenuItem.PartnerHelpCenter} />
            </div>
          </>
        );
    } else if (userType === UserType.TEAMLEAD || userType === UserType.TEAM) {
        return (
            <>
              <NavItem label={AdminMenuItem.Dashboard} />
              <NavItem label={AdminMenuItem.DailyLineups} />
              <NavItem label={AdminMenuItem.SelectionDashboard} />
              <NavItem label={AdminMenuItem.AllCandidates} />
              <NavItem label={AdminMenuItem.Attendance} />
              <NavItem label={AdminMenuItem.Complaints} />
              <NavItem label={AdminMenuItem.WarningLetters} />
              <NavItem label={AdminMenuItem.Reports} />
              <NavItem label={AdminMenuItem.MyProfile} />
            </>
        );
    } else if (userType === UserType.STORE_SUPERVISOR) {
        return (
            <>
              <NavItem label={AdminMenuItem.SupervisorDashboard} />
              <NavItem label={AdminMenuItem.StoreAttendance} />
              <NavItem label={AdminMenuItem.StoreEmployees} />
              <NavItem label={AdminMenuItem.PartnerUpdateStatus} />
              <NavItem label={AdminMenuItem.MyProfile} />
            </>
        );
    }
    return null;
  };

  return (
    <aside className="w-56 bg-white border-r border-gray-200 text-gray-800 flex flex-col shadow-lg h-full z-20">
      <div className="flex items-center mb-4 px-6 pt-6 pb-2">
        <span className="text-2xl font-extrabold text-[#1e293b] tracking-tight">R K M Career</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-2 flex flex-col">
        {getMenuContent()}
      </nav>
    </aside>
  );
};

export default Sidebar;