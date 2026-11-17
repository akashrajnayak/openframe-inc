import React, { useState } from 'react';
import { Megaphone, Send, Info } from 'lucide-react';
import {
  SchoolInstitution,
  SchoolTenantAnnouncement,
  SchoolStaffMember,
  SchoolTenantStudent,
} from '../../types';
import { SchoolAuditActor, schoolPartnerService } from '../../services/schoolPartnerService';

interface SchoolCommunicationsPanelProps {
  institution: SchoolInstitution;
  staff: SchoolStaffMember[];
  students: SchoolTenantStudent[];
  announcements: SchoolTenantAnnouncement[];
  actor: SchoolAuditActor;
  isApproved: boolean;
  onRefresh: () => Promise<void>;
}

export const SchoolCommunicationsPanel: React.FC<SchoolCommunicationsPanelProps> = ({
  institution,
  staff,
  students,
  announcements,
  actor,
  isApproved,
  onRefresh,
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] =
    useState<SchoolTenantAnnouncement['audience']>('All School');
  const [priority, setPriority] =
    useState<SchoolTenantAnnouncement['priority']>('Standard');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lastResult, setLastResult] = useState<SchoolTenantAnnouncement | null>(null);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setErrorMsg('Please enter an announcement headline and message.');
      return;
    }

    const emails = new Set<string>();
    if (audience === 'All School' || audience === 'Teachers & Staff') {
      staff.filter((s) => s.status === 'Active').forEach((s) => s.email && emails.add(s.email));
    }
    if (audience === 'All School' || audience === 'Students & Parents') {
      students.forEach((stu) => stu.guardianEmail && emails.add(stu.guardianEmail));
    }

    setBusy(true);
    setErrorMsg('');
    try {
      const created = await schoolPartnerService.publishSchoolAnnouncement({
        institution,
        title: title.trim(),
        message: message.trim(),
        audience,
        priority,
        recipientEmails: Array.from(emails),
        actor,
      });
      setLastResult(created);
      setTitle('');
      setMessage('');
      await onRefresh();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to publish announcement.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h1 className="text-lg font-heading font-bold text-[#14213D]">
          School Announcements & Alerts
        </h1>
        <p className="text-xs text-[#64748B]">
          Publish circular notices to faculty or guardians. Delivery status accurately reflects SMTP availability versus in-app portal feed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form
          onSubmit={handlePublish}
          className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4"
        >
          <h2 className="text-sm font-heading font-bold text-[#14213D]">Compose Announcement</h2>
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {errorMsg}
            </div>
          )}
          {lastResult && (
            <div className="p-3 rounded-xl bg-[#EFF6FF] border border-blue-200 text-xs text-[#14213D] flex items-start gap-2">
              <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Published: {lastResult.deliveryStatus}</div>
                <div className="text-[11px] text-slate-600">{lastResult.channelSummary}</div>
              </div>
            </div>
          )}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Audience</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            >
              <option value="All School">All School (Teachers + Guardians)</option>
              <option value="Teachers & Staff">Teachers & Staff Only</option>
              <option value="Students & Parents">Students & Parents</option>
              <option value="Program Cohort">Program Cohort</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            >
              <option value="Standard">Standard Notice</option>
              <option value="Important">Important Circular</option>
              <option value="Urgent">Urgent Alert</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Headline *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Term-1 OpenFrame IQ/EQ Assessment Schedule"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Message *</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              required
            />
          </div>
          <button
            type="submit"
            disabled={busy || !isApproved}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{busy ? 'Publishing...' : 'Publish Announcement'}</span>
          </button>
        </form>

        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#2563EB]" />
            <h2 className="text-sm font-heading font-bold text-[#14213D]">
              Published Notices ({announcements.length})
            </h2>
          </div>

          {announcements.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl text-xs text-[#64748B]">
              No announcements broadcast yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {announcements.map((ann) => (
                <div key={ann.id} className="py-3.5 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-[#14213D]">{ann.title}</span>
                    <span className="text-[11px] font-mono text-[#2563EB] font-semibold">
                      {ann.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">{ann.message}</p>
                  <div className="text-[11px] text-[#64748B] flex flex-wrap gap-2 pt-1">
                    <span>Audience: {ann.audience}</span>
                    <span>·</span>
                    <span>{ann.channelSummary}</span>
                    <span>·</span>
                    <span>{new Date(ann.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
