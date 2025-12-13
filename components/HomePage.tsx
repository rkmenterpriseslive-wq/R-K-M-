
import React, { useState, useMemo } from 'react';
// Input component is no longer used for the search bar to allow custom styling
import Button from './Button';
import JobList from './JobList';
import { Job, UserType, HomePageProps } from '../types'; // Import HomePageProps

const HomePage: React.FC<HomePageProps> = ({ jobs, onApplyNow, currentUserType, onLoginSelect, onNavigateToAdminJobBoard, branding }) => {
  const [searchTitle, setSearchTitle] = useState('');
  const [searchExperience, setSearchExperience] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesTitle = job.title.toLowerCase().includes(searchTitle.toLowerCase());
      const matchesExperience = searchExperience === '' || job.experienceLevel === searchExperience;
      const matchesLocation = searchLocation === '' || 
        job.jobCity.toLowerCase().includes(searchLocation.toLowerCase()) || 
        job.locality.toLowerCase().includes(searchLocation.toLowerCase());
      return matchesTitle && matchesExperience && matchesLocation;
    });
  }, [jobs, searchTitle, searchExperience, searchLocation]);

  const handleHireBannerClick = () => {
    if (currentUserType === UserType.ADMIN) {
      onNavigateToAdminJobBoard();
    } else {
      // For non-admin users, prompt them to login as a Team/Admin
      onLoginSelect(UserType.TEAM);
    }
  };

  const handlePartnerBannerClick = () => {
    // For non-partner users, prompt them to login as a Partner
    onLoginSelect(UserType.PARTNER);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 md:py-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-10" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}></div>
        <div className="relative z-10 container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">
            Find Your Next Opportunity
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mt-2 max-w-2xl mx-auto">
            Browse our open positions and start your journey with us.
          </p>
        </div>
      </section>

      {/* Search Bar Section */}
      <section className="container mx-auto px-4 -mt-12 relative z-20">
        <div className="bg-white shadow-xl max-w-4xl mx-auto rounded-lg overflow-hidden flex flex-col md:flex-row border border-gray-300">
          {/* Search jobs by 'title' */}
          <div className="flex-1 relative flex items-center p-4 md:p-0 md:pl-4 md:py-2 border-b md:border-b-0 md:border-r border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 text-gray-400 md:relative md:left-0 md:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              id="searchTitle"
              placeholder="Search jobs by 'title'"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="w-full pl-8 md:pl-0 pr-2 py-2 text-sm focus:outline-none"
              aria-label="Search jobs by title"
            />
          </div>

          {/* Your Experience */}
          <div className="flex-1 relative flex items-center p-4 md:p-0 md:pl-4 md:py-2 border-b md:border-b-0 md:border-r border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 text-gray-400 md:relative md:left-0 md:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.55 23.55 0 0112 15c-3.791 0-7.141-.676-9-1.745M19 19v1a2 2 0 01-2 2H7a2 2 0 01-2-2v-1m14-10a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V9a2 2 0 012-2h2zM9 9a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2h2z" />
            </svg>
            <select
              id="searchExperience"
              value={searchExperience}
              onChange={(e) => setSearchExperience(e.target.value)}
              className="w-full pl-8 md:pl-0 pr-2 py-2 text-sm focus:outline-none bg-transparent appearance-none"
              aria-label="Your Experience"
            >
              <option value="">Your Experience</option>
              <option value="Fresher">Fresher</option>
              <option value="1-3 Years">1-3 Years</option>
              <option value="3-5 Years">3-5 Years</option>
              <option value="5+ Years">5+ Years</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>

          {/* Search for an area or city */}
          <div className="flex-1 relative flex items-center p-4 md:p-0 md:pl-4 md:py-2 border-b md:border-b-0 md:border-r border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 text-gray-400 md:relative md:left-0 md:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input
              type="text"
              id="searchLocation"
              placeholder="Search for an area or city"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full pl-8 md:pl-0 pr-2 py-2 text-sm focus:outline-none"
              aria-label="Search for an area or city"
            />
          </div>

          <Button
            variant="primary"
            onClick={() => {}}
            className="w-full md:w-auto flex-shrink-0 bg-teal-500 hover:bg-teal-600 rounded-none md:rounded-r-lg"
            size="md" // Ensure consistent height
          >
            Search jobs
          </Button>
        </div>
      </section>

      {/* Promo Banners Section */}
      <section className="container mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Banner 1: Hire Talent / Post a Job */}
          <div
            className="relative h-64 rounded-xl flex items-end justify-start text-white text-left cursor-pointer hover:shadow-2xl transition-all duration-300 overflow-hidden group bg-blue-700"
            onClick={handleHireBannerClick}
            role="button"
            tabIndex={0}
            aria-label="Post a job or partner with us"
          >
            {branding.hireTalent.backgroundImage && (
                <img
                  src={branding.hireTalent.backgroundImage}
                  alt="People collaborating in an office"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            <div className="relative z-10 p-8 w-full">
              <span className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-wider text-white uppercase bg-blue-600 rounded-full shadow-sm">
                Promo
              </span>
              <h3 className="text-3xl md:text-4xl font-extrabold mb-2 drop-shadow-sm">
                {branding.hireTalent.title}
              </h3>
              <p className="text-lg text-blue-100 max-w-md">
                {branding.hireTalent.description}
              </p>
            </div>
          </div>

          {/* Banner 2: Become a Partner */}
          <div
            className="relative h-64 rounded-xl flex items-end justify-start text-white text-left cursor-pointer hover:shadow-2xl transition-all duration-300 overflow-hidden group bg-green-700"
            onClick={handlePartnerBannerClick}
            role="button"
            tabIndex={0}
            aria-label="Become a partner or vendor"
          >
            {branding.becomePartner.backgroundImage && (
                <img
                  src={branding.becomePartner.backgroundImage}
                  alt="Handshake or business meeting"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            <div className="relative z-10 p-8 w-full">
              <span className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-wider text-white uppercase bg-green-600 rounded-full shadow-sm">
                Promo
              </span>
              <h3 className="text-3xl md:text-4xl font-extrabold mb-2 drop-shadow-sm">
                 {branding.becomePartner.title}
              </h3>
              <p className="text-lg text-green-100 max-w-md">
                 {branding.becomePartner.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="container mx-auto px-4 mt-12">
        <h3 className="text-3xl font-bold text-gray-800 mb-6">Latest Job Openings</h3>
        <JobList jobs={filteredJobs} currentUserType={UserType.NONE} onApplyNow={onApplyNow} />
        {filteredJobs.length === 0 && (
          <p className="text-center text-gray-600 mt-8">No jobs found matching your criteria.</p>
        )}
      </section>
    </div>
  );
};

export default HomePage;