import React from 'react';
import { CompanyDocument } from '../../types';
import Button from '../Button';

const MOCK_DOCUMENTS: CompanyDocument[] = [];

const CompanyDocumentsView: React.FC = () => {
    const handleDownload = (docName: string) => {
        alert(`Downloading "${docName}"... (This is a demo action)`);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Company Documents</h2>
            <p className="text-gray-600">
                Here you can find all official documents issued to you by the company, such as your offer letter, experience letters, and other important correspondence.
            </p>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {MOCK_DOCUMENTS.length > 0 ? (
                                MOCK_DOCUMENTS.map(doc => (
                                    <tr key={doc.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                                            <div className="text-xs text-gray-500">{doc.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(doc.issueDate).toLocaleDateString('en-GB', {
                                                day: 'numeric', month: 'long', year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Button variant="primary" size="sm" onClick={() => handleDownload(doc.name)}>
                                                Download
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="text-center py-10 text-gray-500">
                                        No documents have been issued to you yet.
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

export default CompanyDocumentsView;