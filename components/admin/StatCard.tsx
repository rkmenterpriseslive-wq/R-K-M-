import React from 'react';

interface StatCardProps {
  title: string;
  value?: string | number;
  icon?: React.ReactNode;
  metrics?: { label: string; value: number; color?: string }[];
  isSplitMetrics?: boolean;
  valueColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, metrics, isSplitMetrics, valueColor = 'text-gray-900' }) => {
    return (
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between min-h-[10rem] h-full border border-gray-200">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
                    {icon && <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">{icon}</div>}
                </div>
                {value !== undefined && <p className={`text-4xl font-bold ${valueColor}`}>{value}</p>}
            </div>
            {metrics && (
                <div className={`flex w-full ${isSplitMetrics ? 'items-center justify-between' : 'flex-col space-y-2'} ${value !== undefined ? 'mt-2' : ''}`}>
                    {metrics.map((m, i) => (
                        <div key={i} className={isSplitMetrics ? "flex-1 flex flex-col items-center text-center" : "flex justify-between items-end w-full"}>
                            <span className="text-xs text-gray-500 font-medium">{m.label}</span>
                            <p className={`${isSplitMetrics ? 'text-2xl' : 'text-xl'} font-bold ${m.color || 'text-gray-900'}`}>{m.value}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default StatCard;
