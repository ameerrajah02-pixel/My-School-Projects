import React, { useState, useEffect } from 'react';
import { RegistrationLog } from '../types';
import { getRegistrationLogs } from '../services/storage';
import { Search, Clock, User, Shield, Calendar } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<RegistrationLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLogs(getRegistrationLogs());
  }, []);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const filteredLogs = logs.filter(log => 
    log.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.actorUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.studentAdmissionNo.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
        <p className="text-gray-500">Audit trail of student registrations and removals.</p>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by student, event, or user..." 
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Time</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Performed By</th>
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Event</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-500 text-sm font-mono whitespace-nowrap">
                   <div className="flex items-center">
                        <Clock size={14} className="mr-2 text-gray-400"/>
                        {formatDate(log.timestamp)}
                   </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold 
                    ${log.action === 'REGISTERED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900 text-sm flex items-center">
                            <Shield size={12} className="mr-1 text-gray-400"/> {log.actorUsername}
                        </span>
                        <span className="text-xs text-gray-400">{log.actorRole}</span>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900 text-sm">{log.studentName}</span>
                        <span className="text-xs text-gray-400">{log.studentAdmissionNo} ({log.house})</span>
                    </div>
                </td>
                <td className="px-6 py-4 text-gray-700 text-sm">
                   {log.eventName}
                </td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No logs found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};