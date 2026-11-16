import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Clock,
  User,
  Building,
  Mail,
  Phone
} from 'lucide-react';

export interface ColumnDef<T> {
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface AdminDataTableProps<T extends { id: string; status?: string; submittedAt?: string; registeredAt?: string; createdAt?: string }> {
  title: string;
  description?: string;
  data: T[];
  columns: ColumnDef<T>[];
  onInspect: (row: T) => void;
  onStatusChange?: (id: string, newStatus: string) => void;
  onDelete?: (id: string) => void;
  exportFileName?: string;
  statusOptions?: string[];
  canDelete?: boolean;
}

export function AdminDataTable<T extends { id: string; status?: string; submittedAt?: string; registeredAt?: string; createdAt?: string }>({
  title,
  description,
  data,
  columns,
  onInspect,
  onStatusChange,
  onDelete,
  exportFileName = 'export.csv',
  statusOptions = ['All', 'New', 'Contacted', 'In Progress', 'Approved', 'Rejected', 'Converted', 'Closed'],
  canDelete = false
}: AdminDataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const pageSize = 10;

  // Filter & Sort
  const filteredData = useMemo(() => {
    return data
      .filter((item) => {
        // Status filter
        if (selectedStatus !== 'All') {
          const itemStatus = item.status || 'New';
          if (itemStatus.toLowerCase() !== selectedStatus.toLowerCase()) return false;
        }

        // Search term
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return Object.values(item).some((val) => {
          if (typeof val === 'string') return val.toLowerCase().includes(q);
          if (typeof val === 'number') return String(val).includes(q);
          return false;
        });
      })
      .sort((a, b) => {
        const timeA = new Date(a.submittedAt || a.registeredAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.submittedAt || b.registeredAt || b.createdAt || 0).getTime();
        return sortDirection === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [data, search, selectedStatus, sortDirection]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage]);

  // CSV Export
  const handleExportCsv = () => {
    if (filteredData.length === 0) return;

    // Collect all keys from the objects
    const headers = Object.keys(filteredData[0]);
    const csvRows: string[] = [];

    // Header row
    csvRows.push(headers.join(','));

    // Data rows
    for (const row of filteredData) {
      const values = headers.map((header) => {
        const val = (row as any)[header];
        if (val === undefined || val === null) return '""';
        const stringVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
        return `"${stringVal.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(csvBlob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', exportFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'New':
        return 'bg-rose-100 text-rose-700';
      case 'Contacted':
        return 'bg-blue-100 text-blue-700';
      case 'In Progress':
        return 'bg-amber-100 text-amber-700';
      case 'Approved':
      case 'Converted':
        return 'bg-emerald-100 text-emerald-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      case 'Closed':
        return 'bg-slate-200 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-5 sm:p-6 border-b border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-heading font-bold text-slate-900 tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              disabled={filteredData.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors text-xs font-semibold disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV ({filteredData.length})</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search records by name, email, phone, location..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent border-none text-xs font-semibold text-slate-700 focus:outline-none"
              >
                {statusOptions.map((st) => (
                  <option key={st} value={st}>
                    {st === 'All' ? 'All Statuses' : st}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}
              className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>{sortDirection === 'desc' ? 'Newest' : 'Oldest'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Data Display */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              {columns.map((col, idx) => (
                <th key={idx} className={`py-3.5 px-4 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 3}
                  className="py-12 text-center text-slate-400 text-xs"
                >
                  No matching records found.
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => {
                const dateVal = row.submittedAt || row.registeredAt || row.createdAt;
                return (
                  <tr key={row.id} className="hover:bg-blue-50/30 transition-colors">
                    {columns.map((col, idx) => {
                      let cellContent: React.ReactNode = null;
                      if (typeof col.accessor === 'function') {
                        cellContent = col.accessor(row);
                      } else if (col.accessor) {
                        cellContent = String((row as any)[col.accessor] ?? '—');
                      }
                      return (
                        <td key={idx} className={`py-3.5 px-4 ${col.className || ''}`}>
                          {cellContent}
                        </td>
                      );
                    })}

                    {/* Status Column with Inline Selector */}
                    <td className="py-3.5 px-4">
                      {onStatusChange ? (
                        <select
                          value={row.status || 'New'}
                          onChange={(e) => onStatusChange(row.id, e.target.value)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border-none cursor-pointer focus:ring-1 focus:ring-blue-500 ${getStatusBadgeClass(
                            row.status
                          )}`}
                        >
                          {['New', 'Contacted', 'In Progress', 'Approved', 'Rejected', 'Converted', 'Closed'].map(
                            (s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            )
                          )}
                        </select>
                      ) : (
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(
                            row.status
                          )}`}
                        >
                          {row.status || 'New'}
                        </span>
                      )}
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                      {dateVal ? new Date(dateVal).toLocaleDateString() : '—'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onInspect(row)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-colors font-semibold text-xs shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>

                        {canDelete && onDelete && (
                          confirmDeleteId === row.id ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  onDelete(row.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition-colors"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-[11px] font-semibold transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(row.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Showing{' '}
          <span className="font-semibold text-slate-800">
            {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-slate-800">
            {Math.min(currentPage * pageSize, filteredData.length)}
          </span>{' '}
          of <span className="font-semibold text-slate-800">{filteredData.length}</span> records
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-slate-700 px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
