import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Building,
  Mail,
  Phone,
  User,
  Layers,
  ArrowRight
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { submitProductEnquiry, triggerAdminNotification } from '../../services/firebase';
import { DigitalProduct } from '../../types';

interface ProductEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProduct?: DigitalProduct | string;
  allProducts?: DigitalProduct[];
}

export const ProductEnquiryModal: React.FC<ProductEnquiryModalProps> = ({
  isOpen,
  onClose,
  preselectedProduct,
  allProducts,
}) => {
  const productsList = allProducts || storageService.getProducts();

  const getInitialProductName = () => {
    if (typeof preselectedProduct === 'string') return preselectedProduct;
    if (preselectedProduct?.name) return preselectedProduct.name;
    return productsList[0]?.name || 'Life Smart Card';
  };

  const getInitialProductId = (prodName: string) => {
    if (typeof preselectedProduct === 'object' && preselectedProduct?.id) {
      return preselectedProduct.id;
    }
    const found = productsList.find(p => p.name === prodName);
    return found?.id || 'general';
  };

  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    emailAddress: '',
    organizationName: '',
    productName: getInitialProductName(),
    message: '',
    consentAccepted: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const pName = getInitialProductName();
      setFormData(prev => ({
        ...prev,
        productName: pName
      }));
      setSubmittedId(null);
      setErrors({});
    }
  }, [isOpen, preselectedProduct]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      errs.fullName = 'Please enter your full name (at least 3 characters).';
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.mobileNumber.trim()) {
      errs.mobileNumber = 'Please enter your contact mobile number.';
    } else if (!phoneRegex.test(formData.mobileNumber.replace(/\s+/g, ''))) {
      errs.mobileNumber = 'Enter a valid 10-digit Indian mobile number.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.emailAddress.trim()) {
      errs.emailAddress = 'Please enter an active email address.';
    } else if (!emailRegex.test(formData.emailAddress.trim())) {
      errs.emailAddress = 'Please enter a valid email address.';
    }

    if (!formData.productName.trim()) {
      errs.productName = 'Please select a product of interest.';
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errs.message = 'Please provide details about your enquiry (minimum 10 characters).';
    }

    if (!formData.consentAccepted) {
      errs.consentAccepted = 'Please acknowledge consent for OpenFrame product specialists to contact you.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const prodId = getInitialProductId(formData.productName);
      const payload = {
        productId: prodId,
        productName: formData.productName,
        fullName: formData.fullName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        emailAddress: formData.emailAddress.trim(),
        organizationName: formData.organizationName.trim() || undefined,
        message: formData.message.trim(),
        consentAccepted: formData.consentAccepted,
        submittedAt: new Date().toISOString(),
        status: 'New' as const,
      };

      const created = storageService.saveProductEnquiry(payload);

      try {
        await submitProductEnquiry(payload);
        await triggerAdminNotification({
          category: 'Product',
          title: `Product Enquiry: ${payload.productName}`,
          senderName: payload.fullName,
          senderEmail: payload.emailAddress,
          details: `Product: ${payload.productName} | Org: ${payload.organizationName || 'Individual'} | Query: ${payload.message.substring(0, 80)}`,
        });
      } catch (err) {
        console.warn('Firestore product enquiry async notice:', err);
      }

      setIsSubmitting(false);
      setSubmittedId(created.id);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {submittedId ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Enquiry Dispatched
            </span>

            <h3 className="text-2xl font-heading font-extrabold text-slate-900 mt-2">
              Thank You for Your Interest!
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Your product consultation request for <strong className="text-blue-700">{formData.productName}</strong> has been logged in our enterprise registry.
            </p>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 max-w-sm mx-auto text-left text-xs space-y-2 mt-4">
              <div className="flex justify-between items-center text-slate-500">
                <span>Reference ID</span>
                <span className="font-mono font-bold text-slate-900">{submittedId.toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Selected Product</span>
                <span className="font-semibold text-slate-800">{formData.productName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Response Time</span>
                <span className="text-blue-600 font-medium">Within 1 Business Day</span>
              </div>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                Done & Close
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="pb-4 border-b border-slate-100 pr-8">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                <span>Product Consultation & Demonstration</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900">
                Enquire About {formData.productName || 'OpenFrame Products'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Submit your query to schedule an enterprise walkthrough, institutional pilot, or technical consultation.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              
              {/* Product Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product of Interest <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {productsList.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} ({p.status} · {p.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Name and Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className={`w-full px-3 py-2 rounded-lg border text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.fullName ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                    }`}
                  />
                  {errors.fullName && <p className="text-[11px] text-red-600 mt-0.5">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-slate-400 font-medium">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value.replace(/\D/g, '') })}
                      placeholder="9876543210"
                      className={`w-full pl-11 pr-3 py-2 rounded-lg border text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.mobileNumber ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {errors.mobileNumber && <p className="text-[11px] text-red-600 mt-0.5">{errors.mobileNumber}</p>}
                </div>
              </div>

              {/* Email and Organization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.emailAddress}
                    onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                    placeholder="contact@company.com"
                    className={`w-full px-3 py-2 rounded-lg border text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.emailAddress ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                    }`}
                  />
                  {errors.emailAddress && <p className="text-[11px] text-red-600 mt-0.5">{errors.emailAddress}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Organisation / Institution Name <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    placeholder="e.g. Apex Tech / RV College / Self"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enquiry Message & Requirements <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your team size, expected deployment timeline, or specific feature queries..."
                  className={`w-full px-3 py-2 rounded-lg border text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.message ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.message && <p className="text-[11px] text-red-600 mt-0.5">{errors.message}</p>}
              </div>

              {/* Consent Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consentAccepted}
                    onChange={(e) => setFormData({ ...formData, consentAccepted: e.target.checked })}
                    className="w-4 h-4 mt-0.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I consent to OpenFrame IT Solutions contacting me via phone, email or messaging regarding this product enquiry and scheduled demonstrations. <span className="text-red-500">*</span>
                  </span>
                </label>
                {errors.consentAccepted && <p className="text-[11px] text-red-600 mt-0.5">{errors.consentAccepted}</p>}
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Product Enquiry</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
