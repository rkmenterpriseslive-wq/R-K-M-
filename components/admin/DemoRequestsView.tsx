import React, { useState, useEffect, useMemo } from 'react';
import { DemoRequest } from '../../types';
import { onDemoRequestsChange } from '../../services/firebaseService';
import Button from '../Button';
import Input from '../Input';
import StatCard from './StatCard';

const DemoRequestsView: React.FC = () => {
    const [requests, setRequests] = useState<DemoRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setIsLoading(true);
        const unsubscribe = onDemoRequestsChange((data) => {
            setRequests(data);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredRequests = useMemo(() => {
        return requests.filter(req =>
            req.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.teamHead.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [requests, searchTerm]);

    const stats = useMemo(() => ({
        total: requests.length,
        recent: requests.filter(r => {
            const reqDate = new Date(r.requestDate);
            const today = new Date();
            const diffTime = Math.abs(today.getTime() - reqDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 7;
        }).length,
    }), [requests]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Demo Requests</h2>
                    <p className="text-gray-500 text-sm mt-1">Track and manage potential clients interested in the platform.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard 
                    title="Total Requests" 
                    value={stats.total} 
                    icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} 
                />
                <StatCard 
                    title="New (Last 7 Days)" 
                    value={stats.recent} 
                    valueColor="text-blue-600"
                    icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} 
                />
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <Input 
                    id="demoSearch" 
                    placeholder="Search by Company, Email or Team Head..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)}
                    wrapperClassName="mb-0"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
                />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Company / Head</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Contact Details</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Team Size</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Requested Date</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr><td colSpan={5} className="text-center py-20 text-gray-400 italic">Loading requests...</td></tr>
                            ) : filteredRequests.length > 0 ? filteredRequests.map(req => (
                                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900">{req.companyName}</div>
                                        <div className="text-xs text-blue-600 font-semibold">{req.teamHead}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{req.email}</div>
                                        <div className="text-[10px] text-gray-500 uppercase truncate max-w-[200px]">{req.address}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium">
                                            {req.teamSize} Members
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(req.requestDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="sm" onClick={() => alert(`Contacting ${req.email}...`)}>
                                            Contact
                                        </Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5} className="text-center py-20 text-gray-500">No demo requests found matching your search.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DemoRequestsView;