import React from 'react';
import { TeamMemberPerformance } from '../../types';

interface TeamPerformanceTableProps {
  data: TeamMemberPerformance[];
}

const TeamPerformanceTable: React.FC<TeamPerformanceTableProps> = ({ data }) => (
  <div className="bg-white rounded-xl shadow-md p-6 h-full overflow-hidden border border-gray-200">
    <h3 className="text-xl font-semibold text-gray-800 mb-4">Team Performance</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['Team Member', 'Total', 'Selected', 'Pending', 'Rejected', 'Quit', 'Success %'].map(h => (
              <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((m, i) => (
            <tr key={i}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{m.teamMember}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{m.total}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{m.selected}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{m.pending}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{m.rejected}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{m.quit}</td>
              <td className="px-6 py-4 text-sm font-bold text-green-600">{m.successRate.toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default TeamPerformanceTable;
