import React from 'react';

const HRUpdatesCard: React.FC = () => {
    return (
        <div className="my-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">HR Updates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Selected */}
                <div className="p-6 rounded-xl shadow-sm bg-blue-50/70">
                    <p className="text-center text-sm text-gray-600">Total Selected</p>
                    <p className="text-center text-5xl font-bold mt-2 text-blue-500">0</p>
                </div>

                {/* Total Offer Released */}
                <div className="p-6 rounded-xl shadow-sm bg-indigo-50/70">
                    <p className="text-center text-sm text-gray-600">Total Offer Released</p>
                    <p className="text-center text-5xl font-bold mt-2 text-indigo-500">0</p>
                </div>

                {/* Onboarding Pending */}
                <div className="p-6 rounded-xl shadow-sm bg-yellow-50/70">
                    <p className="text-center text-sm text-gray-600">Onboarding Pending</p>
                    <p className="text-center text-5xl font-bold mt-2 text-yellow-600">0</p>
                </div>
                
                {/* New Joining */}
                <div className="p-6 rounded-xl shadow-sm bg-gray-50/70">
                    <p className="text-sm text-gray-600">New Joining</p>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex justify-between items-start mt-1 text-center">
                            <div className="w-1/3">
                                <p className="text-xs text-gray-500">DAY</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">0</p>
                            </div>
                            <div className="w-1/3 border-l border-r border-gray-200">
                                <p className="text-xs text-gray-500">WEEK</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">0</p>
                            </div>
                            <div className="w-1/3">
                                <p className="text-xs text-gray-500">MONTH</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">0</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HRUpdatesCard;
