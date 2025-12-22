
import React, { useState } from 'react';
import { RoleWiseData, StoreWiseData, PartnerWiseData, TeamWiseData } from '../../types';
import RoleWiseJobTable from './RoleWiseJobTable';
import PartnerWiseJobTable from './PartnerWiseJobTable';
import StoreWiseJobTable from './StoreWiseJobTable';
import TeamWiseJobTable from './TeamWiseJobTable';

interface RequirementBreakdownSectionProps {
    teamWiseJobData: TeamWiseData[];
    roleWiseJobData: RoleWiseData[];
    storeWiseJobData: StoreWiseData[];
    partnerWiseJobData: PartnerWiseData[];
}

const RequirementBreakdownSection: React.FC<RequirementBreakdownSectionProps> = ({ teamWiseJobData, roleWiseJobData, storeWiseJobData, partnerWiseJobData }) => {
    const [activeTab, setActiveTab] = useState<'team' | 'partner' | 'store' | 'role'>('partner');

    const buttonClass = (tab: 'team' | 'partner' | 'store' | 'role') => 
        `px-6 py-2 rounded-md font-bold text-sm transition-colors duration-200 shadow-sm 
         ${activeTab === tab 
            ? 'bg-yellow-400 text-black' 
            : 'bg-blue-500 text-white hover:bg-blue-600'
         }`;
    
    const renderContent = () => {
        switch (activeTab) {
            case 'team':
                return (
                    <div className="animate-fade-in">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Team Wise</h3>
                        <TeamWiseJobTable data={teamWiseJobData} />
                    </div>
                );
            case 'partner':
                return (
                    <div className="animate-fade-in">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Partner Wise</h3>
                        <PartnerWiseJobTable data={partnerWiseJobData} />
                    </div>
                );
            case 'store':
                return (
                    <div className="animate-fade-in">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Store Wise</h3>
                        <StoreWiseJobTable data={storeWiseJobData} />
                    </div>
                );
            case 'role':
                return (
                    <div className="animate-fade-in">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Role Wise</h3>
                        <RoleWiseJobTable data={roleWiseJobData} />
                    </div>
                );
            default: return null;
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
                <div className="flex flex-wrap gap-4">
                    <button 
                        onClick={() => setActiveTab('team')} 
                        className={buttonClass('team')}
                    >
                        Team Wise
                    </button>
                    <button 
                        onClick={() => setActiveTab('partner')} 
                        className={buttonClass('partner')}
                    >
                        Partner Wise
                    </button>
                    <button 
                        onClick={() => setActiveTab('store')} 
                        className={buttonClass('store')}
                    >
                        Store Wise
                    </button>
                    <button 
                        onClick={() => setActiveTab('role')} 
                        className={buttonClass('role')}
                    >
                        Role Wise
                    </button>
                </div>
            </div>
            <div className="p-4">
                {renderContent()}
            </div>
        </div>
    );
};

export default RequirementBreakdownSection;
