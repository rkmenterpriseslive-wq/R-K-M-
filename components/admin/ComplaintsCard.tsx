
import React from 'react';
import { ComplaintStats } from '../../types';

interface ComplaintsCardProps {
    complaintStats: ComplaintStats;
}

const ComplaintsCard: React.FC<ComplaintsCardProps> = ({ complaintStats }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col justify-between h-full border border-gray-100">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Complaints</h3>
            <div className="flex flex-col flex-grow justify-around">
                <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-b-0">
                    <span className="text-sm font-medium text-gray-700">Active</span>
                    <span className="text-xl font-bold text-red-600">{complaintStats.active}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-b-0">
                    <span className="text-sm font-medium text-gray-700">Closed</span>
                    <span className="text-xl font-bold text-green-600">{complaintStats.closed}</span>
                </div>
            </div>
        </div>
    );
};

export default ComplaintsCard;
