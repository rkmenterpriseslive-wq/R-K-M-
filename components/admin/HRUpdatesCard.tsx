
import React from 'react';

// Props to make the HR Updates Card dynamic
interface HRUpdatesCardProps {
    totalSelected: number;
    totalOfferReleased: number;
    onboardingPending: number;
    newJoiningToday: number;
    newJoiningWeek: number;
    newJoiningMonth: number;
}

const HRUpdatesCard: React.FC<HRUpdatesCardProps> = ({
    totalSelected,
    totalOfferReleased,
    onboardingPending,
    newJoiningToday,
    newJoiningWeek,
    newJoiningMonth
}) => {
    return (
        <div className="my-6">
            <h3 className="text-lg font-black text-[#1e293b] tracking-tight mb-4">HR Updates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Selected */}
                <div className="p-6 rounded-2xl shadow-sm bg-blue-50/70 border border-blue-100">
                    <p className="text-center text-sm text-gray-600 font-medium">Total Selected</p>
                    <p className="text-center text-5xl font-black mt-2 text-blue-500">{totalSelected}</p>
                </div>

                {/* Total Offer Released */}
                <div className="p-6 rounded-2xl shadow-sm bg-indigo-50/70 border border-indigo-100">
                    <p className="text-center text-sm text-gray-600 font-medium">Total Offer Released</p>
                    <p className="text-center text-5xl font-black mt-2 text-indigo-500">{totalOfferReleased}</p>
                </div>

                {/* Onboarding Pending */}
                <div className="p-6 rounded-2xl shadow-sm bg-yellow-50/70 border border-yellow-100">
                    <p className="text-center text-sm text-gray-600 font-medium">Onboarding Pending</p>
                    <p className="text-center text-5xl font-black mt-2 text-yellow-600">{onboardingPending}</p>
                </div>
                
                {/* New Joining */}
                <div className="p-6 rounded-2xl shadow-sm bg-gray-50/70 border border-gray-100">
                    <p className="text-sm text-gray-600 font-medium">New Joining</p>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex justify-between items-start mt-1 text-center">
                            <div className="w-1/3">
                                <p className="text-xs text-gray-500 font-medium">DAY</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{newJoiningToday}</p>
                            </div>
                            <div className="w-1/3 border-l border-r border-gray-200">
                                <p className="text-xs text-gray-500 font-medium">WEEK</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{newJoiningWeek}</p>
                            </div>
                            <div className="w-1/3">
                                <p className="text-xs text-gray-500 font-medium">MONTH</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{newJoiningMonth}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HRUpdatesCard;
