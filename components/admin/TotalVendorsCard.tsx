
import React from 'react';
import { VendorStats } from '../../types';

interface TotalVendorsCardProps {
    vendorStats: VendorStats;
}

const TotalVendorsCard: React.FC<TotalVendorsCardProps> = ({ vendorStats }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col justify-between h-full border border-gray-100">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Total Vendors</h3>
            <div className="flex justify-center items-center flex-grow">
                <p className="text-6xl font-black text-[#1e293b]">{vendorStats.total}</p>
            </div>
        </div>
    );
};

export default TotalVendorsCard;
