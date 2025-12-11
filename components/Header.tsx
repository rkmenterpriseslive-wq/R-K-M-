import React from 'react';
import Button from './Button';
import { UserType, HeaderProps } from '../types'; // Import HeaderProps

const Header: React.FC<HeaderProps> = ({ userType, onLoginSelect, onLogout, onHireUsClick, logoSrc }) => {
  const isLoggedIn = userType !== UserType.NONE;

  return (
    <header className="bg-[#191e44] shadow-md py-4 px-6 md:px-8 sticky top-0 z-50">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          {logoSrc && (
            <img src={logoSrc} alt="Company Logo" className="h-12 w-auto mr-4" />
          )}
          <h1 className="text-2xl font-bold text-white">R K M Career</h1>
        </div>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLoginSelect(UserType.CANDIDATE)}
                className="border border-white text-white hover:bg-white/10 transform hover:-translate-y-0.5"
              >
                Employee Login
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLoginSelect(UserType.PARTNER)}
                className="border border-white text-white hover:bg-white/10 transform hover:-translate-y-0.5"
              >
                Partner Login
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLoginSelect(UserType.TEAM)}
                className="border border-white text-white hover:bg-white/10 transform hover:-translate-y-0.5"
              >
                Team Login
              </Button>
            </>
          ) : (
            <>
              <span className="text-gray-300 font-medium px-3 py-2 rounded-md bg-white/10 flex items-center">
                Logged in as: <span className="capitalize ml-1 text-white font-semibold">{userType.toLowerCase()}</span>
              </span>
              {userType === UserType.ADMIN && (
                <a href="#admin-jobs" className="px-3 py-2 text-gray-300 hover:text-white transition-colors duration-200">
                  Admin Control
                </a>
              )}
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