import React from 'react';
import { TeamMemberPerformance } from '../../types';

interface TeamPerformanceTableProps {
  data: TeamMemberPerformance[];
}

const TeamPerformanceTable: React.FC<TeamPerformanceTableProps> = ({ data }) => {
  // This logic is specific to the provided image to create the hierarchy visual.
  // A more robust solution would involve a 'reportsTo' field in the data.
  const hierarchyMap = new Map<string, string>();
  if (data.length >= 2 && data[0].teamMember === 'Vikrant Singh' && data[1].teamMember === 'Rohit Kumar') {
      hierarchyMap.set('Vikrant Singh', 'manager-start');
      hierarchyMap.set('Rohit Kumar', 'subordinate-end');
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 overflow-hidden border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Team Performance</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              {['TEAM MEMBER', 'ROLE', 'TOTAL', 'SELECTED', 'PENDING', 'REJECTED', 'QUIT', 'SUCCESS %'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-b">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {data.length > 0 ? data.map((member) => {
                const hierarchyRole = hierarchyMap.get(member.teamMember);
                return (
                    <tr key={member.teamMember} className="border-b last:border-b-0">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 relative">
                            {hierarchyRole && (
                                <div className="absolute left-2 top-0 h-full w-4">
                                    {/* This creates the L-shaped bracket */}
                                    {hierarchyRole === 'manager-start' && (
                                        <div className="absolute top-1/2 left-0 h-1/2 w-full border-l-2 border-b-2 border-black" />
                                    )}
                                    {/* This continues the vertical line from the bracket above */}
                                    {hierarchyRole === 'subordinate-end' && (
                                        <div className="absolute top-0 left-0 h-1/2 w-full border-l-2 border-black" />
                                    )}
                                </div>
                            )}
                            <span className={hierarchyRole ? 'pl-8' : ''}>
                                {member.teamMember}
                            </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                            {member.role === 'Sr. Recruiter Manager' ? (
                                <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-1 rounded-md">
                                {member.role}
                                </span>
                            ) : (
                                <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-md">
                                    {member.role}
                                </span>
                            )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{member.total}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{member.selected}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{member.pending}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{member.rejected}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{member.quit}</td>
                        <td className="px-4 py-4 text-sm font-bold text-green-600">{member.successRate.toFixed(2)}%</td>
                    </tr>
                );
            }) : (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-400">
                  No team performance data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamPerformanceTable;
