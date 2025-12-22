
import React from 'react';
import { CandidatePipelineStats } from '../../types';

interface CandidatePipelineCardProps {
    pipelineStats: CandidatePipelineStats;
}

const CandidatePipelineCard: React.FC<CandidatePipelineCardProps> = ({ pipelineStats }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col justify-between h-full border border-gray-100">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Candidate Pipeline</h3>
            <div className="flex w-full justify-between items-center flex-grow">
                <div className="flex flex-col items-center text-center">
                    <p className="text-sm text-gray-600 font-medium">Active</p>
                    <p className="text-4xl font-bold text-blue-600 mt-1">{pipelineStats.active}</p>
                </div>
                <div className="flex flex-col items-center text-center">
                    <p className="text-sm text-gray-600 font-medium">Interview</p>
                    <p className="text-4xl font-bold text-indigo-600 mt-1">{pipelineStats.interview}</p>
                </div>
                <div className="flex flex-col items-center text-center">
                    <p className="text-sm text-gray-600 font-medium">Rejected</p>
                    <p className="text-4xl font-bold text-red-600 mt-1">{pipelineStats.rejected}</p>
                </div>
                <div className="flex flex-col items-center text-center">
                    <p className="text-sm text-gray-600 font-medium">Quit</p>
                    <p className="text-4xl font-bold text-gray-600 mt-1">{pipelineStats.quit}</p>
                </div>
            </div>
        </div>
    );
};

export default CandidatePipelineCard;
