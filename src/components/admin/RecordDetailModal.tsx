import React, { useState } from 'react';
import {
  X,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  FileText,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Save,
  Download,
  ExternalLink,
  ShieldAlert,
  ClipboardCopy
} from 'lucide-react';
import { AdminModuleKey } from './AdminSidebar';
import { AdminRole } from '../../types';

interface RecordDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: any;
  moduleKey: AdminModuleKey;
  onUpdateStatus: (recordId: string, newStatus: string, adminNotes: string) => Promise<void>;
  onDeleteRecord?: (recordId: string) => Promise<void>;
  role: AdminRole;
  isSuperAdmin: boolean;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  isOpen,
  onClose,
  record,
  moduleKey,
  onUpdateStatus,
  onDeleteRecord,
  role,
  isSuperAdmin
}) => {
  if (!isOpen || !record) return null;

  const [currentStatus, setCurrentStatus] = useState<string>(record.status || 'New');
  const [adminNotes, setAdminNotes] = useState<string>(record.adminNotes || record.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const statuses = [
    'New',
    'Contacted',
    'In Progress',
    'Approved',
    'Rejected',
    'Converted',
    'Closed'
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateStatus(record.id, currentStatus, adminNotes);
      onClose();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteRecord) return;
    setIsDeleting(true);
    try {
      await onDeleteRecord(record.id);
      setShowDeleteConfirm(false);
      onClose();
    } catch (err) {
      console.error('Failed to delete record:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(record, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to nicely format unknown keys
  const formatFieldLabel = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/_/g, ' ');
  };

  // Filter out internal or rendered keys
  const excludedKeys = [
    'id',
    'status',
    'adminNotes',
    'notes',
    'createdAt',
    'submittedAt',
    'registeredAt',
    'updatedAt'
  ];

  const displayTimestamp =
    record.submittedAt ||
    record.registeredAt ||
    record.createdAt ||
    record.timestamp ||
    'Recorded in system';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Submission Details &amp; Workflow
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    currentStatus === 'New'
                      ? 'bg-rose-100 text-rose-700'
                      : currentStatus === 'Contacted'
                      ? 'bg-blue-100 text-blue-700'
                      : currentStatus === 'Approved' || currentStatus === 'Converted'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {currentStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(displayTimestamp).toLocaleString()}</span>
                <span className="text-slate-300">&bull;</span>
                <span className="font-mono text-[10px] text-slate-400">ID: {record.id}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Main Submitter Info Card */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Name / Organization
              </span>
              <div className="text-sm font-bold text-slate-900">
                {record.name || record.fullName || record.applicantName || record.orgName || record.institutionName || 'Not specified'}
              </div>
              {record.organization && (
                <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{record.organization}</span>
                </div>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Contact Coordinates
              </span>
              <div className="space-y-1">
                {record.email && (
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`mailto:${record.email}`} className="text-blue-600 hover:underline">
                      {record.email}
                    </a>
                  </div>
                )}
                {record.phone && (
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`tel:${record.phone}`} className="text-blue-600 hover:underline font-mono">
                      {record.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submission Fields Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Submission Data Fields
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(record)
                .filter(
                  ([k, v]) =>
                    !excludedKeys.includes(k) &&
                    k !== 'name' &&
                    k !== 'fullName' &&
                    k !== 'applicantName' &&
                    k !== 'email' &&
                    k !== 'phone' &&
                    v !== undefined &&
                    v !== null &&
                    v !== ''
                )
                .map(([key, value]) => {
                  const isUrl = typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'));
                  return (
                    <div
                      key={key}
                      className="p-3 rounded-xl bg-white border border-slate-200 space-y-1"
                    >
                      <span className="text-[10px] font-semibold text-slate-400 block">
                        {formatFieldLabel(key)}
                      </span>
                      {isUrl ? (
                        <a
                          href={value as string}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline font-semibold flex items-center gap-1 break-all"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span>View Attached Document / File</span>
                        </a>
                      ) : (
                        <div className="text-slate-800 font-medium whitespace-pre-wrap break-words">
                          {typeof value === 'object' ? JSON.stringify(value, null, 1) : String(value)}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Status & Workflow Administration */}
          <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-4">
            <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Administrative Workflow &amp; Notes</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Lifecycle Status
                </label>
                <select
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {statuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Internal Administrative Remarks
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record internal team notes, follow-up dates or action taken..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Delete Confirmation Warning */}
          {showDeleteConfirm && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
              <div className="flex items-center gap-2 text-rose-700 font-bold">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>Confirm Permanent Record Removal</span>
              </div>
              <p className="text-xs text-rose-600">
                Are you sure you want to permanently delete this submission from Firestore? This action will be recorded in the audit logs and cannot be undone.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete Permanently'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors text-xs font-semibold"
            >
              <ClipboardCopy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied JSON!' : 'Copy Data'}</span>
            </button>

            {isSuperAdmin && !showDeleteConfirm && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-colors text-xs font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors text-xs shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Updating...' : 'Save & Update'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
