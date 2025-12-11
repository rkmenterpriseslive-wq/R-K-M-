import React from 'react';
import { ProcessMetric, RoleMetric } from '../../types';

interface ProgressBarCardProps {
  title: string;
  data: (ProcessMetric | RoleMetric)[];
}

const ProgressBarCard: React.FC<ProgressBarCardProps> = ({ title, data }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  return (
    <div className="bg-white rounded-xl shadow-md p-6 h-full border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
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

export default ProgressBarCard;
