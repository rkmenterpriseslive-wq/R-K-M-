

import React from 'react';
import { TeamMemberPerformance, UserType } from '../../types';

interface TeamPerformanceSectionProps {
  data: TeamMemberPerformance[];
}

const TeamPerformanceSection: React.FC<TeamPerformanceSectionProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-black text-[#1e293b] tracking-tight mb-4">Team Performance</h3>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Team Member</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Reporting Manager</th> {/* NEW COLUMN */}
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Selected</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Pending</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Rejected</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Quit</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Success %</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length > 0 ? data.map((member, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {member.reportingManagerName ? (
                          <span className="font-medium text-gray-800">
                              {member.reportingManagerName} 
                              {member.reportingManagerUserType && member.reportingManagerUserType !== UserType.NONE && (
                                  <span className="ml-1 text-xs text-gray-500">
                                      ({member.reportingManagerUserType === UserType.TEAMLEAD ? 'Team Lead' : member.reportingManagerUserType.toLowerCase()})
                                  </span>
                              )}
                          </span>
                      ) : (
                          <span className="text-gray-400">- No Manager -</span>
                      )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-blue-600">{member.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600">{member.selected}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-yellow-600">{member.pending}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-red-600">{member.rejected}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-600">{member.quit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-indigo-600">{member.successRate}%</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-gray-500">
                    No team performance data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamPerformanceSection;
