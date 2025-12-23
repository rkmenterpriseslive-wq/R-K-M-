
import React from 'react';
import Button from './Button';
import { UserType, HeaderProps } from '../types';

const Header: React.FC<HeaderProps> = ({ 
    userType, 
    onLoginSelect, 
    onLogout, 
    onHireUsClick, 
    logoSrc,
    isShowingDashboard,
    onHomeClick,
    onDashboardClick
}) => {
  const isLoggedIn = userType !== UserType.NONE;

  const loginButtons = [
    { label: 'Employee Login', type: UserType.CANDIDATE },
    { label: 'Partner Login', type: UserType.PARTNER },
    { label: 'Team Login', type: UserType.TEAM },
  ];
  
  const dashboardTitle = isShowingDashboard && userType === UserType.TEAMLEAD ? 'Team Lead Dashboard' : null;

  return (
    <header className="bg-[#191e44] shadow-md py-3 px-4 md:px-8 sticky top-0 z-50">
      <div className="container mx-auto flex flex-nowrap items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {/* Brand Section - Always Inline */}
        <div className="flex items-center flex-shrink-0">
          <button 
              onClick={onHomeClick}
              className="flex items-center hover:opacity-80 transition-opacity focus:outline-none"
          >
            {logoSrc && (
              <img src={logoSrc} alt="Company Logo" className="h-8 md:h-12 w-auto mr-2 md:mr-4" />
            )}
            <h1 className="text-sm md:text-2xl font-bold text-white whitespace-nowrap">R K M Career</h1>
          </button>
          {dashboardTitle && (
            <div className="flex items-center">
                <span className="text-xl font-light text-gray-400 mx-2 md:mx-3 hidden sm:block">/</span>
                <h2 className="text-xs md:text-xl font-semibold text-white whitespace-nowrap">{dashboardTitle}</h2>
            </div>
          )}
        </div>

        {/* Navigation Section - Always Inline */}
        <nav className="flex flex-nowrap gap-1.5 md:gap-4 items-center flex-shrink-0">
          {!isLoggedIn ? (
            <>
              <Button
                size="sm"
                onClick={onHireUsClick}
                className="bg-teal-500 text-white hover:bg-teal-600 transform hover:-translate-y-0.5 hover:shadow-md text-[10px] md:text-sm px-2 py-1 whitespace-nowrap"
              >
                Hire us
              </Button>
              {loginButtons.map(btn => (
                <Button
                  key={btn.label}
                  variant="ghost"
                  size="sm"
                  onClick={() => onLoginSelect(btn.type)}
                  className="border border-white text-white hover:bg-white/10 transform hover:-translate-y-0.5 text-[10px] md:text-sm px-2 py-1 whitespace-nowrap"
                >
                  {btn.label.split(' ')[0]} Login
                </Button>
              ))}
            </>
          ) : (
            <>
              {!isShowingDashboard && (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={onDashboardClick}
                    className="bg-indigo-500 hover:bg-indigo-600 text-[10px] md:text-sm px-2 py-1 whitespace-nowrap"
                  >
                    Dashboard
                  </Button>
              )}
              
              <div className="flex items-center text-gray-300 font-medium px-2 py-1 rounded-md bg-white/10 text-[10px] md:text-sm whitespace-nowrap">
                <span className="hidden xs:inline">User:</span>
                <span className="capitalize ml-1 text-white font-semibold">{userType.toLowerCase() === 'candidate' ? 'employee' : userType.toLowerCase()}</span>
              </div>
              
              <Button variant="ghost" size="sm" onClick={onLogout} className="text-white border border-gray-400 hover:bg-white/10 text-[10px] md:text-sm px-2 py-1 whitespace-nowrap">
                Logout
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
