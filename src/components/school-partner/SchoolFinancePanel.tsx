import React, { useEffect, useState } from 'react';
import { CreditCard, Plus, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  SchoolInstitution,
  SchoolTenantPayment,
  SchoolTenantStudent,
} from '../../types';
import { SchoolAuditActor, schoolPartnerService } from '../../services/schoolPartnerService';
import { standaloneMockService } from '../../services/standaloneMockService';
import { launchLiveRazorpayPayment } from '../../services/razorpayCheckoutService';

interface SchoolFinancePanelProps {
  institution: SchoolInstitution;
  students: SchoolTenantStudent[];
  payments: SchoolTenantPayment[];
  actor: SchoolAuditActor;
  isSchoolAdmin: boolean;
  isApproved: boolean;
  onRefresh: () => Promise<void>;
}

export const SchoolFinancePanel: React.FC<SchoolFinancePanelProps> = ({
  institution,
  students,
  payments,
  actor,
  isSchoolAdmin,
  isApproved,
  onRefresh,
}) => {
  const [gatewayStatus, setGatewayStatus] = useState<{
    configured: boolean;
    keyId: string | null;
    note: string;
  } | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [category, setCategory] =
    useState<SchoolTenantPayment['category']>('Program Fee');
  const [description, setDescription] = useState('');
  const [amountInr, setAmountInr] = useState('1500');
  const [gateway, setGateway] = useState<SchoolTenantPayment['gateway']>('Bank / NEFT');
  const [statusChoice, setStatusChoice] = useState<'Paid' | 'Pending'>('Paid');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    schoolPartnerService
      .getRazorpayConfig()
      .then((cfg) => {
        setGatewayStatus(cfg);
        if (cfg.configured) setGateway('Razorpay');
      })
      .catch(() =>
        setGatewayStatus({
          configured: false,
          keyId: null,
          note: 'Unable to query Razorpay configuration from backend.',
        })
      );
  }, []);

  if (!isSchoolAdmin) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-[#64748B]">
        Finance, fee invoices, and Razorpay transactions are restricted to the School Administrator.
      </div>
    );
  }

  const totalCollected = payments
    .filter((p) => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amountInr, 0);

  const totalPending = payments
    .filter((p) => p.status === 'Pending')
    .reduce((sum, p) => sum + (p.outstandingBalanceInr || p.amountInr), 0);

  const handleCreateOrPay = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmt = Number(amountInr);
    if (!Number.isFinite(numericAmt) || numericAmt <= 0) {
      setErrorMsg('Please enter a valid positive INR amount.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please enter a fee / invoice description.');
      return;
    }

    const stu = students.find((s) => s.id === studentId);
    setBusy(true);
    setErrorMsg('');

    try {
      if (gateway === 'Razorpay') {
        if (!gatewayStatus?.configured) {
          throw new Error(
            'Razorpay payment gateway is not configured yet. Ask the Super Admin to save Razorpay Key ID and Key Secret in Admin → Payment Gateway.'
          );
        }
        const verified = await launchLiveRazorpayPayment({
          amountInr: numericAmt,
          userId: actor.uid,
          customerName: stu?.fullName || institution.principalName || actor.email,
          customerEmail: actor.email,
          institutionId: institution.id,
          purpose: `${category}: ${description.trim()}`,
          description: `${institution.name || 'OpenFrame School'} — ${description.trim()}`,
        });

        await schoolPartnerService.recordSchoolPayment(
          {
            institutionId: institution.id,
            institutionAdminUid: institution.adminUid,
            userId: actor.uid,
            studentId: stu?.id,
            studentName: stu?.fullName,
            payerName: institution.principalName || actor.email,
            payerEmail: actor.email,
            category,
            description: description.trim(),
            amountInr: numericAmt,
            outstandingBalanceInr: 0,
            gateway: 'Razorpay',
            status: 'Paid',
            razorpayOrderId: verified.orderId,
            razorpayPaymentId: verified.paymentId,
            verifiedServerSide: true,
          },
          actor
        );
        setToastMsg(`Razorpay payment of ₹${numericAmt.toLocaleString('en-IN')} verified (${verified.paymentId}) and recorded.`);
      } else {
        await schoolPartnerService.recordSchoolPayment(
          {
            institutionId: institution.id,
            institutionAdminUid: institution.adminUid,
            userId: actor.uid,
            studentId: stu?.id,
            studentName: stu?.fullName,
            payerName: stu?.guardianName || institution.principalName || actor.email,
            payerEmail: stu?.guardianEmail || actor.email,
            category,
            description: description.trim(),
            amountInr: numericAmt,
            outstandingBalanceInr: statusChoice === 'Paid' ? 0 : numericAmt,
            gateway,
            status: statusChoice,
            verifiedServerSide: false,
          },
          actor
        );
        setToastMsg(`Institutional ledger entry (${gateway}) recorded.`);
      }

      setModalOpen(false);
      setDescription('');
      await onRefresh();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Payment action failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleStatusUpdate = async (
    pay: SchoolTenantPayment,
    nextStatus: SchoolTenantPayment['status']
  ) => {
    setBusy(true);
    try {
      await schoolPartnerService.updateSchoolPaymentStatus(
        pay,
        nextStatus,
        `Updated to ${nextStatus} by ${actor.email}`,
        actor
      );
      await onRefresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-heading font-bold text-[#14213D]">
            Payments, Razorpay Checkout & Invoices
          </h1>
          <p className="text-xs text-[#64748B]">
            Track institutional & student fees, initiate live Razorpay orders, and generate GST/tax invoice PDFs.
          </p>
        </div>
        {isApproved && (
          <button
            type="button"
            onClick={() => {
              setErrorMsg('');
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Initiate / Record Payment</span>
          </button>
        )}
      </div>

      {/* Honest Razorpay Gateway Status Notice */}
      {gatewayStatus && (
        <div
          className={`rounded-2xl border p-4 flex items-start gap-3 text-xs ${
            gatewayStatus.configured
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          {gatewayStatus.configured ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-bold">
              {gatewayStatus.configured
                ? `Razorpay Live Gateway Connected (${gatewayStatus.keyId})`
                : 'Razorpay Keys Not Configured'}
            </div>
            <p className="mt-0.5">{gatewayStatus.note}</p>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="bg-[#EFF6FF] border border-blue-200 rounded-xl px-4 py-2.5 text-xs text-[#14213D] flex justify-between">
          <span>{toastMsg}</span>
          <button type="button" onClick={() => setToastMsg('')} className="text-[#2563EB] font-semibold">
            Close
          </button>
        </div>
      )}

      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="text-xs text-[#64748B]">Total Collected (INR)</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#14213D] mt-1">
            ₹{totalCollected.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="text-xs text-[#64748B]">Pending / Outstanding (INR)</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-700 mt-1">
            ₹{totalPending.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="text-xs text-[#64748B]">Total Ledger Entries</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#14213D] mt-1">
            {payments.length}
          </div>
        </div>
      </div>

      {/* Ledger */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <h2 className="text-base font-heading font-bold text-[#14213D]">Transaction Ledger</h2>
        {payments.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-slate-200 rounded-xl text-xs text-[#64748B]">
            <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No fee or subscription payments recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 pr-3">Receipt / Date</th>
                  <th className="py-2.5 px-3">Student & Description</th>
                  <th className="py-2.5 px-3">Gateway</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 pl-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {payments.map((pay) => (
                  <tr key={pay.id}>
                    <td className="py-3 pr-3">
                      <div className="font-mono font-bold text-[#14213D]">{pay.receiptNumber}</div>
                      <div className="text-[11px] text-slate-500">
                        {new Date(pay.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{pay.description}</div>
                      <div className="text-[11px] text-[#64748B]">
                        {pay.category} · {pay.studentName || 'Institutional Account'}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700">{pay.gateway}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#14213D]">
                      ₹{pay.amountInr.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            pay.status === 'Paid'
                              ? 'bg-emerald-500'
                              : pay.status === 'Pending'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        <span>{pay.status}</span>
                      </span>
                    </td>
                    <td className="py-3 pl-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            schoolPartnerService.downloadPaymentReceiptPdf(institution, pay)
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-[#14213D]"
                        >
                          <Download className="w-3 h-3" />
                          <span>Receipt PDF</span>
                        </button>
                        {pay.status === 'Pending' && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void handleStatusUpdate(pay, 'Paid')}
                            className="px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-[11px] font-semibold"
                          >
                            Mark Paid
                          </button>
                        )}
                        {pay.status === 'Paid' && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void handleStatusUpdate(pay, 'Refund Requested')}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 text-[11px]"
                          >
                            Refund Req
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateOrPay}
            className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl"
          >
            <h2 className="text-base font-heading font-bold text-[#14213D]">
              Initiate Razorpay / Record Fee Payment
            </h2>
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {errorMsg}
              </div>
            )}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Payment Mode
              </label>
              <select
                value={gateway}
                onChange={(e) => setGateway(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              >
                <option value="Razorpay">
                  Razorpay Online Checkout ({gatewayStatus?.configured ? 'Configured' : 'Keys Required'})
                </option>
                <option value="Bank / NEFT">Bank Transfer / NEFT / RTGS</option>
                <option value="Challan / Cash">Institutional Challan / Cash</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              >
                <option value="Program Fee">OpenFrame Program Fee</option>
                <option value="Assessment Fee">IQ / EQ / SQ Assessment Fee</option>
                <option value="Tuition / School Fee">Tuition / School Fee</option>
                <option value="Subscription">Annual Partner Subscription</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Student (Optional)
              </label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              >
                <option value="">-- Institutional Billing --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.studentCode})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Description *
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Term-1 STEM & Coding Cohort"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Amount (INR) *
                </label>
                <input
                  type="number"
                  min={1}
                  value={amountInr}
                  onChange={(e) => setAmountInr(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                  required
                />
              </div>
              {gateway !== 'Razorpay' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Ledger Status
                  </label>
                  <select
                    value={statusChoice}
                    onChange={(e) => setStatusChoice(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending / Invoice Due</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50"
              >
                {busy
                  ? 'Processing...'
                  : gateway === 'Razorpay'
                  ? 'Launch Razorpay Checkout'
                  : 'Save Ledger Entry'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
