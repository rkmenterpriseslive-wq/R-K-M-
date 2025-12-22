
import React from 'react';
import { ProcessMetric } from '../../types';

interface CandidatesByProcessListProps {
    data: ProcessMetric[];
}

const CandidatesByProcessList: React.FC<CandidatesByProcessListProps> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 h-full border border-gray-100">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Candidates by Process</h3>
            <div className="space-y-4">
                {data.map((item, index) => (
                    <div key={index} className="flex flex-col">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-700 font-medium">{item.name}</span>
                            <span className="text-gray-600 text-sm">{item.count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className={`${item.color} h-2.5 rounded-full`} style={{ width: `${total ? (item.count / total) * 100 : 0}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CandidatesByProcessList;
