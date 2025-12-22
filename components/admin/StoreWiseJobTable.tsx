
import React from 'react';
import { StoreWiseData } from '../../types';

interface StoreWiseJobTableProps {
  data: StoreWiseData[];
}

const StoreWiseJobTable: React.FC<StoreWiseJobTableProps> = ({ data }) => {
  const thClass = "px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider";
  const tdClass = "px-4 py-4 whitespace-nowrap text-sm text-gray-700";

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-100">
            <tr>
              <th className={thClass}>Store Name</th>
              <th className={thClass}>Location</th>
              <th className={thClass}>Role</th>
              <th className={thClass}>Brand</th>
              <th className={thClass}>Partner</th>
              <th className={thClass}>Total Openings</th>
              <th className={thClass}>Pending</th>
              <th className={thClass}>Approved</th>
            </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
            {data.length > 0 ? data.map((item, index) => (
              <tr key={index}>
                <td className={`${tdClass} font-bold text-gray-900`}>{item.storeName}</td>
                <td className={tdClass}>{item.location}</td>
                <td className={tdClass}>{item.role}</td>
                <td className={tdClass}>{item.brand}</td>
                <td className={tdClass}>{item.partner}</td>
                <td className={tdClass}>{item.totalOpenings}</td>
                <td className={tdClass}>{item.pending}</td>
                <td className={tdClass}>{item.approved}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                  No store-wise job data available.
                </td>
              </tr>
            )}
        </tbody>
      </table>
    </div>
  );
};

export default StoreWiseJobTable;
