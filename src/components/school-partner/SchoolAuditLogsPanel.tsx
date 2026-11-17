import React, { useMemo, useState } from 'react';
import { Shield, Search } from 'lucide-react';
import { SchoolInstitution, SchoolTenantAuditLog } from '../../types';

interface SchoolAuditLogsPanelProps {
  institution: SchoolInstitution;
  auditLogs: SchoolTenantAuditLog[];
}

export const SchoolAuditLogsPanel: React.FC<SchoolAuditLogsPanelProps> = ({
  institution,
  auditLogs,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return auditLogs;
    return auditLogs.filter(
      (l) =>
        l.action.toLowerCase().includes(q) ||
        l.summary.toLowerCase().includes(q) ||
        l.actorEmail.toLowerCase().includes(q) ||
        l.entityType.toLowerCase().includes(q)
    );
  }, [auditLogs, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
        <h1 className="text-lg font-heading font-bold text-[#14213D]">
          School Security, Settings & Immutable Audit Logs
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 text-xs">
          <div className="border border-slate-200 rounded-xl p-3">
            <div className="text-[#64748B]">Institution Code</div>
            <div className="font-mono font-bold text-[#14213D] mt-0.5">
              {institution.institutionCode || institution.applicationRef}
            </div>
          </div>
          <div className="border border-slate-200 rounded-xl p-3">
            <div className="text-[#64748B]">UDISE / Reg No</div>
            <div className="font-mono font-bold text-[#14213D] mt-0.5">
              {institution.udiseCode || 'N/A'}
            </div>
          </div>
          <div className="border border-slate-200 rounded-xl p-3">
            <div className="text-[#64748B]">Primary School Admin</div>
            <div className="font-mono text-[#14213D] mt-0.5 truncate">{institution.adminEmail}</div>
          </div>
          <div className="border border-slate-200 rounded-xl p-3">
            <div className="text-[#64748B]">Verification State</div>
            <div className="font-bold text-[#2563EB] mt-0.5">{institution.verificationStatus}</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#2563EB]" />
            <h2 className="text-base font-heading font-bold text-[#14213D]">
              Tenant Audit Trail ({auditLogs.length})
            </h2>
          </div>
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter logs by action, actor, summary..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-slate-200 rounded-xl text-xs text-[#64748B]">
            No immutable audit entries recorded for this school tenant yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 pr-3">Timestamp</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 pl-3">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map((log) => (
                  <tr key={log.id}>
                    <td className="py-2.5 pr-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#14213D]">{log.action}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                      {log.actorEmail}
                    </td>
                    <td className="py-2.5 pl-3 text-slate-700">{log.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
