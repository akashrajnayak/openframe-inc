import React, { useState } from 'react';
import { HopeNestSubNav } from '../components/hopenest/HopeNestSubNav';
import { storageService } from '../services/storageService';
import { submitHopeNestVolunteer, triggerAdminNotification } from '../services/firebase';
import {
  Users,
  HeartHandshake,
  CheckCircle2,
  Send,
  Sparkles,
  BookOpen,
  Laptop,
  ShieldCheck,
  Building,
  Heart
} from 'lucide-react';

export const HopeNestVolunteerPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    emailAddress: '',
    location: '',
    professionOrOccupation: '',
    areaOfInterest: 'ASHA Women Vocational Training',
    availability: 'Weekends' as 'Weekends' | 'Weekdays' | 'Flexible / Project-Based',
    message: '',
    consentAccepted: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const areas = [
    'ASHA Women Vocational Training (Stitching, Crafting, Retail)',
    'Academic Tutoring & Remedial Coaching (Maths, Science, English)',
    'Grassroots Digital Literacy & Cyber Hygiene Clinics',
    'Community Health Camp & Medical Logistical Support',
    'Animal Welfare, Summer Water Bowls & Stray Feeding',
    'Environmental Plantation & Cleanliness Shramdaan',
    'General Community Coordination & Event Support'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.mobileNumber || !formData.emailAddress || !formData.consentAccepted) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        emailAddress: formData.emailAddress.trim(),
        location: formData.location.trim() || 'Not specified',
        professionOrOccupation: formData.professionOrOccupation.trim() || 'Not specified',
        areaOfInterest: formData.areaOfInterest,
        availability: formData.availability,
        message: formData.message.trim() || 'Interested in volunteering',
        consentAccepted: formData.consentAccepted,
        submittedAt: new Date().toISOString(),
        status: 'New' as const,
      };

      storageService.saveHopeNestVolunteer(payload);

      try {
        await submitHopeNestVolunteer(payload);
        await triggerAdminNotification({
          category: 'HopeNest',
          title: `Volunteer Registration: ${payload.areaOfInterest}`,
          senderName: payload.fullName,
          senderEmail: payload.emailAddress,
          details: `Area: ${payload.areaOfInterest} | Availability: ${payload.availability} | Location: ${payload.location}`,
        });
      } catch (err) {
        console.warn('Firestore HopeNest volunteer async notice:', err);
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
            <Users className="w-3.5 h-3.5" />
            Join Our Volunteer Network
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            Volunteer With HopeNest Global Foundation
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 max-w-2xl mx-auto leading-relaxed">
            Share your skills, time, or mentorship to empower undereducated women, first-generation school learners, and community initiatives across regional localities.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        {submitted ? (
          <div className="bg-white rounded-2xl p-8 sm:p-12 border border-teal-200 shadow-md text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-heading font-bold text-slate-900">
                Volunteer Registration Received
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-slate-800">{formData.fullName}</strong>. Your volunteer profile has been recorded in the HopeNest volunteers registry. Our community coordinator will review your preferred area of involvement (<span className="text-teal-700 font-semibold">{formData.areaOfInterest}</span>) and reach out to you.
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
                    location: '',
                    professionOrOccupation: '',
                    areaOfInterest: 'ASHA Women Vocational Training',
                    availability: 'Weekends',
                    message: '',
                    consentAccepted: false,
                  });
                }}
                className="px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                Submit Another Application
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
                Volunteer Enrolment Form
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Please complete the details below. All submissions are handled confidentially by our foundation secretariat.
              </p>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Radhika Menon"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Mobile Number (WhatsApp Preferred) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. radhika@example.com"
                  value={formData.emailAddress}
                  onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  City / District & State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bengaluru, Karnataka"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Profession / Current Occupation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer / Educator / Tailor / Homemaker / Student"
                  value={formData.professionOrOccupation}
                  onChange={(e) => setFormData({ ...formData, professionOrOccupation: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Volunteer Preferences */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Primary Area of Volunteering Interest <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.areaOfInterest}
                  onChange={(e) => setFormData({ ...formData, areaOfInterest: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {areas.map((area, idx) => (
                    <option key={idx} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Time Availability <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['Weekends', 'Weekdays', 'Flexible / Project-Based'] as const).map((avail) => (
                    <label
                      key={avail}
                      className={`flex items-center gap-2 p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                        formData.availability === avail
                          ? 'border-teal-500 bg-teal-50/50 text-teal-900 font-semibold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="availability"
                        checked={formData.availability === avail}
                        onChange={() => setFormData({ ...formData, availability: avail })}
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <span>{avail}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Brief Note: Skills, Prior Experience, or Why You Want to Help
                </label>
                <textarea
                  rows={3}
                  placeholder="Share a short note on how you can contribute or what motivated you to connect..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
                />
              </div>
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
                  I agree to volunteer with HopeNest Global Foundation on a voluntary basis. I consent to having the foundation team contact me regarding upcoming community programmes and workshop schedules.
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !formData.consentAccepted}
              className="w-full py-3 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:bg-slate-300 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span>Registering Volunteer...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Volunteer Registration</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
