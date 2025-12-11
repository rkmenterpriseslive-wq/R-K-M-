import React from 'react';
import Button from './Button';
import { UserType, HeaderProps } from '../types'; // Import HeaderProps

const Header: React.FC<HeaderProps> = ({ userType, onLoginSelect, onLogout, onHireUsClick, logoSrc }) => {
  const isLoggedIn = userType !== UserType.NONE;

  return (
    <header className="bg-white shadow-md py-4 px-6 md:px-8 sticky top-0 z-50">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          {logoSrc && (
            <img src={logoSrc} alt="Company Logo" className="h-8 w-auto mr-3" />
          )}
          <h1 className="text-2xl font-bold text-gray-800">R K M Career</h1>
        </div>
        <nav className="flex flex-wrap gap-2 md:gap-4 justify-center md:justify-end text-sm md:text-base">
          {!isLoggedIn ? (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={onHireUsClick}
                className="transform hover:-translate-y-0.5 hover:shadow-md"
              >
                Hire us for Jobs
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLoginSelect(UserType.CANDIDATE)}
                className="transform hover:-translate-y-0.5"
              >
                Employee Login
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLoginSelect(UserType.PARTNER)}
                className="transform hover:-translate-y-0.5"
              >
                Partner Login
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLoginSelect(UserType.TEAM)}
                className="transform hover:-translate-y-0.5"
              >
                Team Login
              </Button>
            </>
          ) : (
            <>
              <span className="text-gray-700 font-medium px-3 py-2 rounded-md bg-blue-100 flex items-center">
                Logged in as: <span className="capitalize ml-1 text-blue-800">{userType.toLowerCase()}</span>
              </span>
              {userType === UserType.ADMIN && (
                <a href="#admin-jobs" className="px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200">
                  Admin Control
                </a>
              )}
              <Button variant="secondary" size="sm" onClick={onLogout}>
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