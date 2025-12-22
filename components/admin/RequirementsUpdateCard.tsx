
import React from 'react';
import { PartnerRequirementStats } from '../../types';

interface RequirementsUpdateCardProps {
    partnerRequirementStats: PartnerRequirementStats;
}

const RequirementsUpdateCard: React.FC<RequirementsUpdateCardProps> = ({ partnerRequirementStats }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col justify-between h-full border border-gray-100">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Requirements Update</h3>
            <div className="flex flex-col flex-grow justify-around">
                <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-b-0">
                    <span className="text-sm font-medium text-gray-700">Total</span>
                    <span className="text-xl font-bold text-blue-600">{partnerRequirementStats.total}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-b-0">
                    <span className="text-sm font-medium text-gray-700">Pending</span>
                    <span className="text-xl font-bold text-yellow-600">{partnerRequirementStats.pending}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-b-0">
                    <span className="text-sm font-medium text-gray-700">Approved</span>
                    <span className="text-xl font-bold text-green-600">{partnerRequirementStats.approved}</span>
                </div>
            </div>
        </div>
    );
};

export default RequirementsUpdateCard;
