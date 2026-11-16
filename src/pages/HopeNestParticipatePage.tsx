import React, { useState, useEffect } from 'react';
import { useRouter } from '../router/RouterContext';
import { HopeNestSubNav } from '../components/hopenest/HopeNestSubNav';
import { storageService } from '../services/storageService';
import { submitHopeNestParticipant, triggerAdminNotification } from '../services/firebase';
import {
  UserCheck,
  CheckCircle2,
  Send,
  Sparkles,
  ShieldAlert,
  Users,
  MapPin,
  HeartHandshake
} from 'lucide-react';

export const HopeNestParticipatePage: React.FC = () => {
  const { currentPath } = useRouter();

  // Extract query param if any
  const getQueryProgram = () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const prog = urlParams.get('prog');
      if (prog === 'asha') return 'ASHA Welfare Programme: Women Empowerment & Livelihood';
      if (prog) return decodeURIComponent(prog);
    } catch {
      // fallback
    }
    return 'ASHA Welfare Programme: Women Empowerment & Livelihood';
  };

  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    emailAddress: '',
    city: '',
    district: '',
    state: 'Karnataka',
    programmeInterested: getQueryProgram(),
    participantType: 'Individual Learner' as 'Individual Learner' | 'Parent / Guardian' | 'Community Representative' | 'Self-Help Group (SHG) Member',
    message: '',
    consentAccepted: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const prog = getQueryProgram();
    setFormData(prev => ({ ...prev, programmeInterested: prog }));
  }, [currentPath]);

  const programmesList = [
    'ASHA Welfare Programme: Women Empowerment & Livelihood',
    'Academic Bridging & Student Remedial Support',
    'Merit-Cum-Need Student Educational Assistance',
    'Grassroots Digital Literacy & Cyber Safety Clinics',
    'Vocational Training & Local Livelihood Skills',
    'Maternal Nutrition & Girl Child Education Support',
    'Preventive Healthcare Awareness & Free Screening Camps',
    'Community Mental Health & Emotional Wellbeing Forums',
    'Environmental Protection, Tree Drives & Cleanliness',
    'Community Animal Care & Water Bowl Placement',
    'Senior Citizen Support & Barrier-Free Accessibility'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.mobileNumber || !formData.city || !formData.consentAccepted) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        emailAddress: formData.emailAddress.trim() || undefined,
        city: formData.city.trim(),
        district: formData.district.trim() || undefined,
        state: formData.state,
        programmeInterested: formData.programmeInterested,
        participantType: formData.participantType,
        message: formData.message.trim() || 'Programme participation enrolment',
        consentAccepted: formData.consentAccepted,
        submittedAt: new Date().toISOString(),
        status: 'Registered' as const,
      };

      storageService.saveHopeNestParticipant(payload);

      try {
        await submitHopeNestParticipant(payload);
        await triggerAdminNotification({
          category: 'HopeNest',
          title: `Participant Registration: ${payload.programmeInterested}`,
          senderName: payload.fullName,
          senderEmail: payload.emailAddress || 'Not provided',
          details: `Prog: ${payload.programmeInterested} | Type: ${payload.participantType} | Location: ${payload.city}, ${payload.state}`,
        });
      } catch (err) {
        console.warn('Firestore HopeNest participant async notice:', err);
      }

      setIsSubmitting(false);
      setSubmitted(true);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <HopeNestSubNav />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#021f24] to-[#06333a] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-teal-900">
        <div className="max-w-4xl mx-auto space-y-3 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold tracking-wider uppercase">
            <UserCheck className="w-3.5 h-3.5" />
            Beneficiary & Community Enrolment
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            Register for Foundation Programmes
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 max-w-2xl mx-auto leading-relaxed">
            Free community training, tailoring cohorts, digital literacy classes, and educational bridging workshops for eligible beneficiaries and neighborhood groups.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-6">
        
        {/* Advisory */}
        <div className="bg-white rounded-xl p-5 border border-teal-200 shadow-xs space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2 text-teal-800 font-bold uppercase tracking-wider text-[11px]">
            <HeartHandshake className="w-4 h-4 text-teal-600" />
            <span>Open Community Access Notice</span>
          </div>
          <p>
            HopeNest foundation workshops are conducted in accessible community halls and partner centers. No tuition fee or admission fee is charged to eligible low-income beneficiaries. Batches are organized based on local registrations and trainer availability.
          </p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-2xl p-8 sm:p-12 border border-teal-200 shadow-md text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-heading font-bold text-slate-900">
                Beneficiary Application Recorded
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-slate-800">{formData.fullName}</strong>. Your registration for <strong className="text-teal-700">{formData.programmeInterested}</strong> has been logged. Our local community coordinator will contact your mobile number (<span className="font-semibold text-slate-800">{formData.mobileNumber}</span>) when the next cohort is scheduled in your area.
              </p>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    fullName: '',
                    mobileNumber: '',
                    emailAddress: '',
                    city: '',
                    district: '',
                    state: 'Karnataka',
                    programmeInterested: 'ASHA Welfare Programme: Women Empowerment & Livelihood',
                    participantType: 'Individual Learner',
                    message: '',
                    consentAccepted: false,
                  });
                }}
                className="px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                Register Another Participant
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
          >
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-heading font-bold text-slate-900">
                Beneficiary Registration Form
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Fill in the details below. You can apply for yourself, a family member, or on behalf of a women's self-help group.
              </p>
            </div>

            {/* Applicant Profile */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                I am registering as: <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(['Individual Learner', 'Parent / Guardian', 'Self-Help Group (SHG) Member', 'Community Representative'] as const).map((type) => (
                  <label
                    key={type}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      formData.participantType === type
                        ? 'border-teal-500 bg-teal-50/50 text-teal-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="participantType"
                      checked={formData.participantType === type}
                      onChange={() => setFormData({ ...formData, participantType: type })}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Programme Interested */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700">
                Programme Interested In <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.programmeInterested}
                onChange={(e) => setFormData({ ...formData, programmeInterested: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {programmesList.map((prog, idx) => (
                  <option key={idx} value={prog}>
                    {prog}
                  </option>
                ))}
              </select>
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Beneficiary / Applicant Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parvathamma"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Mobile Number (Calling & WhatsApp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 94801 23456"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. contact@example.com"
                  value={formData.emailAddress}
                  onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  City / Town / Village <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mandya / Nelamangala"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  District
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mandya / Bengaluru Rural"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Karnataka"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700">
                Current Learning Needs / Number of Members (if SHG)
              </label>
              <textarea
                rows={3}
                placeholder="Mention any prior experience, preferred language of instruction, or group size if representing a self-help group..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
              />
            </div>

            {/* Consent */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.consentAccepted}
                  onChange={(e) => setFormData({ ...formData, consentAccepted: e.target.checked })}
                  className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  I agree to share the above details for foundation enrolment and consent to receiving workshop batch notices and venue directions via phone call or SMS/WhatsApp.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !formData.consentAccepted}
              className="w-full py-3 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:bg-slate-300 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span>Registering Beneficiary...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Participation Registration</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
