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

  return (
    <header className="bg-[#191e44] shadow-md py-4 px-6 md:px-8 sticky top-0 z-50">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <button 
            onClick={onHomeClick}
            className="flex items-center mb-4 md:mb-0 hover:opacity-80 transition-opacity focus:outline-none"
        >
          {logoSrc && (
            <img src={logoSrc} alt="Company Logo" className="h-12 w-auto mr-4" />
          )}
          <h1 className="text-2xl font-bold text-white">R K M Career</h1>
        </button>

        <nav className="flex flex-wrap gap-2 md:gap-4 justify-center md:justify-end text-sm md:text-base items-center">
          {!isLoggedIn ? (
            <>
              <Button
                size="sm"
                onClick={onHireUsClick}
                className="bg-teal-500 text-white hover:bg-teal-600 transform hover:-translate-y-0.5 hover:shadow-md"
              >
                Hire us for Jobs
              </Button>
              {loginButtons.map(btn => (
                <Button
                  key={btn.label}
                  variant="ghost"
                  size="sm"
                  onClick={() => onLoginSelect(btn.type)}
                  className="border border-white text-white hover:bg-white/10 transform hover:-translate-y-0.5"
                >
                  {btn.label}
                </Button>
              ))}
            </>
          ) : (
            <>
              {!isShowingDashboard ? (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={onDashboardClick}
                    className="bg-indigo-500 hover:bg-indigo-600"
                  >
                    Go to Dashboard
                  </Button>
              ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onHomeClick}
                    className="border border-white text-white hover:bg-white/10"
                  >
                    View Job Site
                  </Button>
              )}
              
              <div className="hidden sm:flex items-center text-gray-300 font-medium px-3 py-2 rounded-md bg-white/10">
                Logged in: <span className="capitalize ml-1 text-white font-semibold">{userType.toLowerCase() === 'candidate' ? 'employee' : userType.toLowerCase()}</span>
              </div>
              
              <Button variant="ghost" size="sm" onClick={onLogout} className="text-white border border-gray-400 hover:bg-white/10">
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