
import React from 'react';
import { RoleMetric } from '../../types';

interface CandidatesByRoleListProps {
    data: RoleMetric[];
}

const CandidatesByRoleList: React.FC<CandidatesByRoleListProps> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    
    // Define specific colors for each role if needed, or use a default
    const roleColors: Record<string, string> = {
        'Picker': 'bg-purple-500',
        'Sales Executive': 'bg-pink-500',
        'Team Leader': 'bg-orange-500',
        'Packer': 'bg-blue-500',
        'Driver': 'bg-red-500',
        // Add more roles as needed
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 h-full border border-gray-100">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Candidates by Role</h3>
            <div className="space-y-4">
                {data.map((item, index) => (
                    <div key={index} className="flex flex-col">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-700 font-medium">{item.name}</span>
                            <span className="text-gray-600 text-sm">{item.count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className={`${roleColors[item.name] || 'bg-gray-400'} h-2.5 rounded-full`} style={{ width: `${total ? (item.count / total) * 100 : 0}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CandidatesByRoleList;
