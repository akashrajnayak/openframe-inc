import type { EducationCategoryCode, MarketplacePricingTier } from '../types';

export const MIN_COURSE_FEE_INR = 300;
export const MAX_COURSE_FEE_INR = 2500;
export const GRANT_DISCOUNT_PERCENT = 90;

export const ALL_INDIAN_STATES_AND_UTS: string[] = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCT)',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export interface PricingComputationInput {
  id?: string;
  title?: string;
  category?: string;
  categoryGroup?: string;
  level?: string;
  educationLevels?: EducationCategoryCode[] | string[];
  educationLevel?: EducationCategoryCode | string;
  educationCategory?: EducationCategoryCode | string;
  degreeProgrammes?: string[];
  degreeOrClass?: string;
  estimatedHours?: number;
  rawPrice?: number;
  existingPrice?: number;
  pricingTier?: MarketplacePricingTier | string;
  libraryCollection?: string;
  board?: string;
}

export interface ComputedCoursePricing {
  finalPriceInr: number;
  marketBenchmarkPrice: number;
  marketBenchmarkPriceInr: number;
  discountPercent: number;
  savingsInr: number;
  isFree: false;
  pricingTier: MarketplacePricingTier;
  tierLabel: string;
  bandLabel: string;
}

function stableHash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function detectEducationBand(input: PricingComputationInput): 'early_primary' | 'middle_secondary' | 'puc_diploma' | 'undergraduate' | 'postgraduate' | 'professional' {
  const levels = [
    ...(input.educationLevels || []),
    ...(input.educationLevel ? [input.educationLevel] : []),
    ...(input.educationCategory ? [input.educationCategory] : []),
  ].map((c) => String(c).toUpperCase());
  if (levels.includes('A') || levels.includes('B')) return 'early_primary';
  if (levels.includes('C') || levels.includes('D')) return 'middle_secondary';
  if (levels.includes('E') || levels.includes('F')) return 'puc_diploma';
  if (levels.includes('H') || levels.includes('I')) return 'postgraduate';
  if (levels.includes('G')) return 'undergraduate';
  if (levels.includes('J')) return 'professional';

  const text = `${input.title || ''} ${input.category || ''} ${(input.degreeProgrammes || []).join(' ')} ${input.degreeOrClass || ''} ${input.board || ''}`.toLowerCase();
  if (/\b(lkg|ukg|kindergarten|nursery|phonics|class\s*[1-5]|grade\s*[1-5]|evs|early childhood)\b/.test(text)) {
    return 'early_primary';
  }
  if (/\b(class\s*[6-9]|class\s*10|grade\s*[6-9]|grade\s*10|sslc|matric|icse|middle school|secondary)\b/.test(text)) {
    return 'middle_secondary';
  }
  if (/\b(puc|class\s*11|class\s*12|1st puc|2nd puc|dpue|isc|higher secondary|polytechnic|diploma|iti)\b/.test(text)) {
    return 'puc_diploma';
  }
  if (/\b(mba|mca|mcom|m\.com|msc|m\.sc|ma\b|m\.a\.|mtech|m\.tech|phd|doctoral|research methodology|postgraduate|executive)\b/.test(text)) {
    return 'postgraduate';
  }
  if (/\b(bca|bcom|b\.com|bba|bsc|b\.sc|ba\b|b\.a\.|btech|b\.tech|be\b|llb|bpharm|nursing|undergraduate|semester)\b/.test(text)) {
    return 'undergraduate';
  }
  if (input.libraryCollection === 'corporate_training' || /ai|deep learning|cloud|aws|cyber|full stack|devops|architecture/i.test(text)) {
    return 'postgraduate';
  }
  return 'professional';
}

/**
 * Computes market-researched 90% OpenFrame Grant pricing strictly within [₹300, ₹2500].
 * No course is ever priced at ₹0 / Free; lower-priced & free courses are reconsidered at ≥ ₹300.
 */
export function compute90PercentCoursePricing(input: PricingComputationInput): ComputedCoursePricing {
  const band = detectEducationBand(input);
  const seed = stableHash(`${input.id || ''}|${input.title || ''}|${input.category || ''}`);

  let minNet = 300;
  let maxNet = 600;
  let tierLabel = 'Foundation Scholar Grant';

  switch (band) {
    case 'early_primary':
      // Market: ₹3,000 - ₹5,990 -> 90% off -> ₹300 - ₹599
      minNet = 300;
      maxNet = 599;
      tierLabel = 'Early & Primary 90% Grant';
      break;
    case 'middle_secondary':
      // Market: ₹5,000 - ₹9,990 -> 90% off -> ₹500 - ₹999
      minNet = 500;
      maxNet = 999;
      tierLabel = 'Board & Secondary 90% Grant';
      break;
    case 'puc_diploma':
      // Market: ₹7,990 - ₹13,990 -> 90% off -> ₹799 - ₹1,399
      minNet = 799;
      maxNet = 1399;
      tierLabel = 'PUC & Diploma 90% Grant';
      break;
    case 'undergraduate':
      // Market: ₹9,990 - ₹17,990 -> 90% off -> ₹999 - ₹1,799
      minNet = 999;
      maxNet = 1799;
      tierLabel = 'University UG 90% Grant';
      break;
    case 'postgraduate':
      // Market: ₹15,000 - ₹25,000 -> 90% off -> ₹1,500 - ₹2,500
      minNet = 1500;
      maxNet = 2500;
      tierLabel = 'PG & Research 90% Grant';
      break;
    case 'professional':
    default:
      // Market: ₹4,990 - ₹18,990 -> 90% off -> ₹499 - ₹1,899
      minNet = 499;
      maxNet = 1899;
      tierLabel = 'Career Certification 90% Grant';
      break;
  }

  // If course explicitly has a non-zero rawPrice in legacy catalog, map cleanly or honor clamped range
  const raw = Number(input.rawPrice ?? input.existingPrice ?? 0);
  let netFee: number;
  if (raw >= MIN_COURSE_FEE_INR && raw <= MAX_COURSE_FEE_INR) {
    netFee = Math.round(raw);
  } else if (raw > MAX_COURSE_FEE_INR) {
    // Reconsider inflated legacy tuition with 90% discount, clamped to [300, 2500]
    netFee = Math.round(raw * 0.1);
  } else {
    // Reconsider 0 / Free / <300 tracks deterministically inside band range
    const hours = Number(input.estimatedHours || 0);
    const ratio = hours > 0 ? Math.min(1, Math.max(0, hours / 40)) : (seed % 100) / 100;
    const rawStep = Math.round((minNet + (maxNet - minNet) * ratio) / 50) * 50;
    netFee = rawStep === 0 ? minNet : rawStep;
  }

  // Strict enforcement: Minimum ₹300, Maximum ₹2,500
  const finalPriceInr = Math.max(MIN_COURSE_FEE_INR, Math.min(MAX_COURSE_FEE_INR, netFee));
  const marketBenchmarkPrice = finalPriceInr * 10; // Exact 90% off market fee (₹3,000 - ₹25,000)
  const savingsInr = marketBenchmarkPrice - finalPriceInr;

  const pricingTier: MarketplacePricingTier =
    finalPriceInr >= 2000
      ? 'Specialised'
      : finalPriceInr >= 1400
      ? 'Advanced'
      : finalPriceInr >= 900
      ? 'Professional'
      : finalPriceInr >= 500
      ? 'Basic'
      : 'Starter';

  return {
    finalPriceInr,
    marketBenchmarkPrice,
    marketBenchmarkPriceInr: marketBenchmarkPrice,
    discountPercent: GRANT_DISCOUNT_PERCENT,
    savingsInr,
    isFree: false,
    pricingTier,
    tierLabel,
    bandLabel: tierLabel,
  };
}

export function formatInr(amount: number): string {
  return `₹${Math.round(Number(amount || 0)).toLocaleString('en-IN')}`;
}

export interface CertificateAddressDetails {
  homeAddress?: string;
  flatNumber?: string;
  streetAddress?: string;
  pincode?: string;
  mobileNumber?: string;
  alternativeMobileNumber?: string;
  state?: string;
}

export interface AddressValidationResult {
  valid: boolean;
  missingFields: string[];
  errorMessage?: string;
  error?: string;
  cleaned: Required<CertificateAddressDetails>;
  sanitized: Required<CertificateAddressDetails>;
}

/**
 * Validates all 7 mandatory learner address & contact fields required prior to certificate issuance.
 */
export function validateCertificateAddressDetails(
  details: CertificateAddressDetails
): AddressValidationResult {
  const homeAddress = String(details.homeAddress || '').trim();
  const flatNumber = String(details.flatNumber || '').trim();
  const streetAddress = String(details.streetAddress || '').trim();
  const pincode = String(details.pincode || '').replace(/\D/g, '').slice(0, 6);
  const mobileDigits = String(details.mobileNumber || '').replace(/\D/g, '').slice(-10);
  const altDigits = String(details.alternativeMobileNumber || '').replace(/\D/g, '').slice(-10);
  const state = String(details.state || '').trim();

  const missingFields: string[] = [];
  if (homeAddress.length < 4) missingFields.push('Home Address');
  if (flatNumber.length < 1) missingFields.push('Flat Number');
  if (streetAddress.length < 3) missingFields.push('Street Address');
  if (!/^\d{6}$/.test(pincode)) missingFields.push('6-Digit Pin Code');
  if (!/^\d{10}$/.test(mobileDigits)) missingFields.push('10-Digit Mobile Number');
  if (!/^\d{10}$/.test(altDigits)) missingFields.push('10-Digit Alternative Mobile Number');
  if (state.length < 2) missingFields.push('State');

  const msg =
    missingFields.length > 0
      ? `Complete mandatory certificate dispatch & verification fields: ${missingFields.join(', ')}.`
      : undefined;
  const cleaned: Required<CertificateAddressDetails> = {
    homeAddress,
    flatNumber,
    streetAddress,
    pincode,
    mobileNumber: mobileDigits,
    alternativeMobileNumber: altDigits,
    state,
  };

  return {
    valid: missingFields.length === 0,
    missingFields,
    errorMessage: msg,
    error: msg,
    cleaned,
    sanitized: cleaned,
  };
}
