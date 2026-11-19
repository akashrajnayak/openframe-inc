export interface SolutionItem {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  capabilities: string[];
  deliverables: string[];
  technologies: string[];
}

export interface EducationProgram {
  id: string;
  title: string;
  level: string;
  duration: string;
  format: string;
  summary: string;
  curriculum: string[];
  targetAudience: string;
  highlights: string[];
}

export interface DigitalProduct {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  status: 'Available' | 'In Development' | 'Coming Soon';
  shortDesc: string;
  description: string;
  problemSolved: string;
  keyFeatures: string[];
  benefits: string[];
  howItWorks: { step: number; title: string; description: string }[];
  targetUsers: string[];
  intendedUsers: string;
  faqs: { question: string; answer: string }[];
  iconName?: string;
  accentColor?: string;
  imagePlaceholderText?: string;
  modules?: string[];
  idealFor?: string;
}

export interface ProductEnquiry {
  id: string;
  productId: string;
  productName: string;
  fullName: string;
  mobileNumber: string;
  emailAddress: string;
  organizationName?: string;
  message: string;
  consentAccepted: boolean;
  submittedAt: string;
  status: 'New' | 'Contacted' | 'In Progress' | 'Converted' | 'Closed';
}

export type BlogCategory =
  | 'Technology'
  | 'Software Development'
  | 'Artificial Intelligence'
  | 'Digital Transformation'
  | 'Education'
  | 'Skill Development'
  | 'Career Guidance'
  | 'Entrepreneurship'
  | 'Company News'
  | 'HopeNest Foundation Updates';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: BlogCategory | string;
  publishedDate: string;
  createdDate?: string;
  updatedDate?: string;
  scheduledDate?: string;
  readTime: string;
  author: string;
  authorRole: string;
  excerpt: string;
  shortDescription?: string;
  content: string[];
  tags: string[];
  featuredImageUrl?: string;
  seoTitle?: string;
  seoMetaDescription?: string;
  status: 'Draft' | 'Published' | 'Scheduled';
  isFeatured?: boolean;
  isPopular?: boolean;
}

export interface CareerOpening {
  id: string;
  title: string;
  department: 'Engineering' | 'Education & Training' | 'Product' | 'Operations';
  location: string;
  type: 'Full-Time' | 'Hybrid' | 'Remote';
  experience: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  isActive: boolean;
}

export interface OfficeLocation {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  pincode: string;
  phone: string;
  email: string;
  hours: string;
  isHeadquarters: boolean;
  coordinates?: { lat: number; lng: number };
}

export interface InquirySubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization?: string;
  subject: string;
  division: 'IT Solutions' | 'Education' | 'Products' | 'Partnerships' | 'General';
  message: string;
  createdAt: string;
  status: 'New' | 'Under Review' | 'Responded';
}

export interface SoftwareQuotationEnquiry {
  id: string;
  fullName: string;
  mobileNumber: string;
  emailAddress: string;
  companyName?: string;
  industry: string;
  requiredService: string;
  projectDescription: string;
  estimatedBudget: string;
  expectedTimeline: string;
  city: string;
  state: string;
  preferredContactMethod: 'Email' | 'Mobile Call' | 'WhatsApp';
  consentAccepted: boolean;
  submittedAt: string;
  status: 'New' | 'Under Review' | 'Quotation Prepared' | 'Responded';
}

export type ApplicationStatus =
  | 'New'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview Scheduled'
  | 'Selected'
  | 'Onboarded'
  | 'Closed';

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  fullName: string;
  email: string;
  phone: string;
  currentLocation: string;
  qualification: string;
  experience: string;
  skills: string;
  resumeName?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  coverNote?: string;
  consentAccepted: boolean;
  submittedAt: string;
  status: ApplicationStatus;
  internalNotes?: string;
}

export interface InternshipApplication {
  id: string;
  fullName: string;
  mobileNumber: string;
  emailAddress: string;
  collegeOrUniversity: string;
  courseAndYear: string;
  preferredDomain: string;
  keySkills: string;
  internshipDuration: '2 Months' | '3 Months' | '6 Months';
  currentLocation: string;
  resumeName?: string;
  resumeUrl?: string;
  portfolioOrGithub?: string;
  statementOfInterest?: string;
  consentAccepted: boolean;
  submittedAt: string;
  status: 'New' | 'Under Review' | 'Shortlisted' | 'Selected' | 'Completed' | 'Closed';
  internalNotes?: string;
}

export interface ProfessionalRegistration {
  id: string;
  fullName: string;
  mobileNumber: string;
  emailAddress: string;
  primaryDomain: string;
  qualification: string;
  experienceYears: string;
  keySkills: string;
  portfolioOrLinkedIn: string;
  areaOfInterest: 'Full-Time Employment' | 'Consulting / Advisory' | 'Guest Lecturing / Mentorship' | 'Contract / Project Basis';
  currentLocation: string;
  resumeName?: string;
  resumeUrl?: string;
  message?: string;
  consentAccepted: boolean;
  submittedAt: string;
  status: 'New' | 'Profile Evaluated' | 'Meeting Scheduled' | 'Engaged' | 'Archived';
  internalNotes?: string;
}

export interface SchoolPartnerEnquiry {
  id: string;
  organizationName: string;
  contactPerson: string;
  designation: string;
  mobileNumber: string;
  emailAddress: string;
  city: string;
  state: string;
  institutionType: 'K-12 School' | 'Junior College / PUC' | 'Degree College / University' | 'Coaching / Academy' | 'Other Institution';
  partnershipInterest: string;
  studentStrength?: string;
  message?: string;
  consentAccepted: boolean;
  submittedAt: string;
  status: 'New' | 'Proposal Sent' | 'Meeting Held' | 'Partnered' | 'Closed';
  internalNotes?: string;
}

export interface NgoPartnerEnquiry {
  id: string;
  organizationName: string;
  registrationNumber?: string;
  contactPerson: string;
  designation: string;
  mobileNumber: string;
  emailAddress: string;
  city: string;
  state: string;
  focusArea: string;
  partnershipInterest: string;
  targetBeneficiaryCount?: string;
  message: string;
  consentAccepted: boolean;
  submittedAt: string;
  status: 'New' | 'In Discussion' | 'MoU Drafted' | 'Active Alliance' | 'Closed';
  internalNotes?: string;
}

export interface GeneralWorkEnquiry {
  id: string;
  fullName: string;
  mobileNumber: string;
  emailAddress: string;
  collaborationType: string;
  currentLocation: string;
  experienceYears: string;
  keyCompetencies: string;
  proposalSummary: string;
  portfolioOrWebsite?: string;
  resumeName?: string;
  consentAccepted: boolean;
  submittedAt: string;
  status: 'New' | 'Under Review' | 'Contacted' | 'Archived';
  internalNotes?: string;
}


export interface SiteSettings {
  announcementText: string;
  showAnnouncement: boolean;
  contactEmail: string;
  supportPhone: string;
  headquartersCity: string;
}

export interface EducationCourse {
  id: string;
  name: string;
  category: 'Academic' | 'Technology' | 'Professional' | 'Creative' | 'Intelligence' | 'Business' | 'STEM';
  shortDesc: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  fee: string;
  isFeatured?: boolean;
  isPopular?: boolean;
  highlights: string[];
  curriculumOutline: string[];
  learningMode: string;
  certificationNote: string;
}

export type Course = EducationCourse;

export interface StudentRegistration {
  id: string;
  fullName: string;
  mobileNumber: string;
  whatsappNumber?: string;
  emailAddress: string;
  dob: string;
  gender?: string;
  profilePhotoUrl?: string;
  country?: string;
  state: string;
  district: string;
  city: string;
  houseNumber?: string;
  streetAddress?: string;
  pincode?: string;
  schoolCollegeName: string;
  currentClassQualification: string;
  interestedCourse: string;
  preferredLanguage?: string;
  preferredCategories?: string[];
  parentName?: string;
  parentMobile?: string;
  parentWhatsapp?: string;
  parentEmail?: string;
  isMinor?: boolean;
  guardianConsentAccepted?: boolean;
  gpsCoordinates?: { lat: number; lng: number; accuracy?: number };
  gpsConsentAccepted?: boolean;
  preferredLearningMode: 'Online Live Classes' | 'Recorded Lessons' | 'Hybrid / Practical Labs';
  consentAccepted: boolean;
  registeredAt: string;
  status: 'Registered' | 'Counseling Scheduled' | 'Enrolled' | 'Closed';
  internalNotes?: string;
}

export interface TeacherRegistration {
  id: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  qualification: string;
  teachingExperience: string;
  subjectSpecialization: string;
  preferredTeachingMode: 'Online Live' | 'In-Person / Campus' | 'Weekend Guest Faculty';
  location: string;
  resumeUrlOrProfile: string;
  consentAccepted: boolean;
  submittedAt: string;
  status: 'Under Review' | 'Interview Scheduled' | 'Onboarded' | 'Closed';
  internalNotes?: string;
}

// HopeNest Global Foundation Types
export type HopeNestCategory =
  | 'All'
  | 'Women & Livelihood'
  | 'Education & Literacy'
  | 'Skill Development'
  | 'Health & Wellbeing'
  | 'Environment & Relief'
  | 'Community Welfare';

export interface HopeNestProgram {
  id: string;
  slug: string;
  title: string;
  category: HopeNestCategory;
  shortDesc: string;
  description: string;
  objectives: string[];
  keyActivities: string[];
  beneficiaries: string;
  status: 'Active' | 'Upcoming' | 'Ongoing';
  iconName?: string;
  isFlagship?: boolean;
}

export interface HopeNestUpdate {
  id: string;
  title: string;
  date: string;
  category: string;
  description: string;
  location?: string;
  reportUrl?: string;
  status?: 'Published' | 'Draft';
}

export interface HopeNestVolunteer {
  id: string;
  fullName: string;
  mobileNumber: string;
  emailAddress: string;
  location: string;
  professionOrOccupation: string;
  areaOfInterest: string;
  availability: 'Weekends' | 'Weekdays' | 'Flexible / Project-Based';
  message: string;
  consentAccepted: boolean;
  submittedAt: string;
  status: 'New' | 'Contacted' | 'Onboarded' | 'Closed';
}

export interface HopeNestDonationEnquiry {
  id: string;
  fullName: string;
  mobileNumber: string;
  emailAddress: string;
  organizationName?: string;
  supportType: 'Equipment & Hardware' | 'Training Sponsorship' | 'Infrastructure Aid' | 'General Foundation Support';
  city: string;
  state: string;
  message: string;
  consentAccepted: boolean;
  submittedAt: string;
  status: 'New' | 'Under Review' | 'Responded';
}

export interface HopeNestParticipant {
  id: string;
  fullName: string;
  mobileNumber: string;
  emailAddress?: string;
  city: string;
  district?: string;
  state: string;
  programmeInterested: string;
  participantType: 'Individual Learner' | 'Parent / Guardian' | 'Community Representative' | 'Self-Help Group (SHG) Member';
  message: string;
  consentAccepted: boolean;
  submittedAt: string;
  status: 'Registered' | 'Contacted' | 'Enrolled';
}

export interface ContactMessage {
  id: string;
  fullName: string;
  emailAddress: string;
  phone?: string;
  organization?: string;
  subject?: string;
  message: string;
  division?: string;
  submittedAt: string;
  status?: 'New' | 'Under Review' | 'Responded';
}

export interface GeneralEnquiry {
  id: string;
  fullName: string;
  mobileNumber: string;
  emailAddress: string;
  city: string;
  state: string;
  enquiryCategory: string;
  subject: string;
  message: string;
  consentAccepted: boolean;
  submittedAt: string;
  status?: 'New' | 'Under Review' | 'Responded' | 'Closed';
  internalNotes?: string;
}

export interface SoftwareEnquiryItem {
  id: string;
  name: string;
  companyName?: string;
  emailAddress: string;
  mobileNumber: string;
  requiredService: string;
  projectDescription: string;
  estimatedBudget?: string;
  timeline?: string;
  preferredContactMethod?: string;
  consentAccepted?: boolean;
  submittedAt: string;
  status?: 'New' | 'Quotation Prepared' | 'Responded' | 'Closed';
  internalNotes?: string;
}

export interface BusinessEnquiry {
  id: string;
  name: string;
  organisation: string;
  emailAddress: string;
  mobileNumber: string;
  businessRequirement: string;
  message: string;
  submittedAt: string;
  status?: 'New' | 'Under Review' | 'Responded' | 'Closed';
  internalNotes?: string;
}

export interface BranchLocation {
  id: string;
  name: string;
  city: string;
  state: string;
  fullAddress: string;
  contactNumber: string;
  email: string;
  officeHours: string;
  googleMapsUrl?: string;
  isHeadquarters?: boolean;
  isPlaceholder?: boolean;
  isActive: boolean;
}

export interface NewsletterSubscriber {
  id: string;
  fullName?: string;
  emailAddress: string;
  consentAccepted: boolean;
  subscribedAt: string;
  source?: string;
}

export type AdminRole =
  | 'Super Admin'
  | 'HR Admin'
  | 'Sales Admin'
  | 'Education Admin'
  | 'HopeNest Admin'
  | 'Content Admin';

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: AdminRole;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

export interface ActivityLog {
  id: string;
  adminEmail: string;
  adminRole: AdminRole;
  action: string;
  collection: string;
  recordId?: string;
  details?: string;
  timestamp: string;
}

export type DocumentCategory =
  | 'Corporate Profile'
  | 'Incorporation Certificate'
  | 'DPIIT Recognition'
  | 'Startup India Recognition'
  | 'Corporate Brochure'
  | 'Product Catalogue'
  | 'Statutory Policy';

export interface CorporateDocument {
  id: string;
  title: string;
  category: DocumentCategory;
  fileFormat: string;
  fileSize: string;
  version: string;
  approvedDate: string;
  status: 'Approved for Public Access' | 'Pending Legal Verification' | 'Internal Archival';
  isPublic: boolean;
  documentNumberPlaceholder?: string;
  description: string;
  downloadUrl?: string;
  isPlaceholder?: boolean;
}

export type {
  EducationCategoryItem,
  PricingPlanItem,
  OfficialBrochureItem,
  ProgrammeHighlightItem
} from '../data/educationData';

export type MarketplaceCourseStatus =
  | 'Draft'
  | 'Planned'
  | 'Content Development'
  | 'Instructor Assigned'
  | 'Ready to Publish'
  | 'Published'
  | 'Unavailable'
  | 'Archived';

export type MarketplaceCourseType = 'standard' | 'youtube_video' | 'youtube_playlist';

export type CourseContentType =
  | 'Individual video'
  | 'Full course'
  | 'Playlist'
  | 'Tutorial'
  | 'Workshop'
  | 'Webinar';

export type MarketplacePricingTier =
  | 'Academic Access'
  | 'Corporate Track'
  | 'Starter'
  | 'Basic'
  | 'Professional'
  | 'Advanced'
  | 'Specialised';

export interface MarketplaceModule {
  moduleNumber: number;
  title: string;
  duration: string;
  lessons: string[] | any[];
  id?: string;
  description?: string;
  partLabel?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  videoIds?: string[];
  recommendedVideos?: YouTubeVideoRecommendation[];
}

export interface MarketplaceCourse {
  id: string;
  aliasId?: string;
  title: string;
  category: string;
  categories?: string[]; // Multi-category support
  categoryGroup: string;
  subcategory: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  duration: string;
  estimatedHours?: number;
  pricingTier: MarketplacePricingTier;
  price: number;
  marketBenchmarkPrice?: number;
  discountPercent?: number;
  isFree?: boolean;
  status: MarketplaceCourseStatus;
  courseType?: MarketplaceCourseType;
  contentType?: CourseContentType;
  topic?: string;
  libraryCollection?: 'standard' | 'corporate_training';
  youtubeUrl?: string;
  youtubeVideoId?: string;
  youtubePlaylistUrl?: string;
  youtubePlaylistId?: string;
  youtubeChannelId?: string;
  youtubeChannelName?: string;
  youtubeChannelUrl?: string;
  channelThumbnail?: string;
  publishedDate?: string;
  durationMinutes?: number;
  viewCount?: number;
  sourceVerificationStatus?: string;
  instructorName?: string;
  language?: string;
  keywords?: string[];
  searchTokens?: string[];
  thumbnailUrl?: string;
  isPopular?: boolean;
  isTrending?: boolean;
  isNew?: boolean;
  isRecommended?: boolean;
  isCareerTrack?: boolean;
  isCustomAdded?: boolean;
  isBaseOverride?: boolean;
  baseIndex?: number;
  rating: number;
  enrolledCount: number;
  imageUrl: string;
  shortDesc: string;
  description: string;
  descriptionBreakdown?: {
    whatStudentWillLearn: string;
    whySubjectMatters: string;
    topicsCovered: string;
    practicalSkillsDeveloped: string;
    whoShouldEnrol: string;
    achieveAfterCompletion: string;
  };
  learningObjectives: string[];
  modules: MarketplaceModule[];
  targetAudience: string;
  skillsAcquired: string[];
  skills?: string[];
  practicalProjects: string[];
  assessmentMethod: string;
  certificateEligibility: boolean;
  certificateNote: string;
  instructor?: {
    name: string;
    role: string;
    organization: string;
    bio?: string;
  };
  educationLevels?: string[]; // Level 1–10 / Categories A–J codes or labels
  degreeProgrammes?: string[]; // Targeted degrees/classes (e.g., LKG, Class 10, BCA, BCom, MBA, PhD)
  board?: string;
  boards?: string[];
  gradeLevel?: string;
  supportedLanguages?: string[];
  subject?: string;
  specialization?: string;
  deliveryMethod?: 'Self-paced online' | 'Live online' | 'Classroom' | 'Hybrid' | 'Workshop' | 'Professional training';
  accreditationVerified?: boolean;
  accreditationNote?: string;
  isEnrollable?: boolean;
  prerequisites?: string;
  reviewCount?: number;
  hasVerifiedReviews?: boolean;
  recommendedVideos?: YouTubeVideoRecommendation[];
  createdAt?: string;
  updatedAt: string;
}

// ====================================================
// AI-POWERED LEARNING MANAGEMENT SYSTEM (LMS) TYPES
// ====================================================

export type LmsUserRole =
  | 'student'
  | 'teacher'
  | 'parent'
  | 'institution_admin'
  | 'ngo_partner'
  | 'field_executive'
  | 'professional'
  | 'admin';

export interface LmsUserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: LmsUserRole;
  roles: LmsUserRole[];
  registrationNumber: string;
  institutionId?: string;
  institutionName?: string;
  linkedStudentIds?: string[];
  assignedCourseIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  id: string;
  uid: string;
  studentId: string;
  registrationNumber: string;
  fullName: string;
  email: string;
  mobileNumber?: string;
  alternativeMobileNumber?: string;
  whatsappNumber?: string;
  profilePhotoUrl?: string;
  dob?: string;
  gender?: string;
  country?: string;
  state?: string;
  district?: string;
  city?: string;
  homeAddress?: string;
  flatNumber?: string;
  houseNumber?: string;
  streetAddress?: string;
  pincode?: string;
  qualification?: string;
  institution?: string;
  preferredLanguage?: string;
  preferredCategories?: string[];
  educationLevel?: EducationCategoryCode;
  degreeOrClass?: string;
  academicYear?: string;
  subjects?: string[];
  skills?: string[];
  interests?: string[];
  careerAspirations?: string;
  learningFormatPreference?: 'Video' | 'Structured Course' | 'Interactive' | 'Mixed';
  parentEmail?: string;
  parentName?: string;
  parentMobile?: string;
  isMinor?: boolean;
  emailVerified?: boolean;
  mobileVerified?: boolean;
  enrolledCourseIds: string[];
  assignedTeacherId?: string;
  assignedTeacherName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherProfile {
  id: string;
  uid: string;
  teacherId: string;
  registrationNumber: string;
  fullName: string;
  email: string;
  qualification?: string;
  specialization?: string;
  assignedCourseIds: string[];
  assignedStudentIds: string[];
  meetingRoomUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ParentStudentLink {
  id: string;
  parentUid: string;
  parentEmail: string;
  parentName?: string;
  studentUid: string;
  studentName: string;
  registrationNumber: string;
  createdAt: string;
}

export type CourseEnrollmentStatus =
  | 'Submitted'
  | 'Pending Verification'
  | 'Verified'
  | 'Pending Payment'
  | 'Payment Completed'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled'
  | 'Active'
  | 'Completed'
  | 'Suspended';

export interface CourseEnrollmentAuditEntry {
  timestamp: string;
  actorUid: string;
  actorEmail?: string;
  action: string;
  fromStatus?: string;
  toStatus?: string;
  note?: string;
}

export interface CourseEnrollment {
  id: string;
  enrollmentId?: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  mobileNumber?: string;
  alternativeMobileNumber?: string;
  countryCode?: string;
  dob?: string;
  age?: number;
  gender?: string;
  country?: string;
  state?: string;
  district?: string;
  city?: string;
  pincode?: string;
  homeAddress?: string;
  flatNumber?: string;
  streetAddress?: string;
  address?: string;
  educationLevel?: string;
  degreeOrClass?: string;
  academicYear?: string;
  institution?: string;
  subjectStream?: string;
  previousQualification?: string;
  skills?: string[];
  learningInterests?: string[];
  careerObjective?: string;
  preferredLanguage?: string;
  learningPreference?: string;
  relevantExperience?: string;
  parentName?: string;
  parentMobile?: string;
  consentAccepted?: boolean;
  registrationNumber: string;
  courseId: string;
  courseTitle: string;
  courseCategory?: string;
  deliveryMethod?: string;
  teacherId?: string;
  teacherName?: string;
  assignedCoordinator?: string;
  internalNotes?: string;
  status: CourseEnrollmentStatus;
  paymentStatus: 'Complimentary' | 'Paid' | 'Scholarship' | 'Pending';
  feeAmount: number;
  marketBenchmarkPrice?: number;
  discountPercent?: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  verifiedServerSide?: boolean;
  auditHistory?: CourseEnrollmentAuditEntry[];
  enrolledAt: string;
  updatedAt: string;
}

export interface CourseModuleDoc {
  id: string;
  courseId: string;
  moduleNumber: number;
  title: string;
  description: string;
  duration: string;
  createdBy: string;
  updatedAt: string;
}

export interface QuizConfigDoc {
  id: string;
  courseId: string;
  lessonId: string;
  basicCount: number;
  intermediateCount: number;
  advancedCount: number;
  passingScorePercent: number;
  maxRetakes: number;
  timeLimitMinutes: number;
  updatedBy: string;
  updatedAt: string;
}

export interface YouTubeVideoRecommendation {
  id: string;
  videoId: string;
  youtubeId?: string;
  title: string;
  channelTitle: string;
  channelThumbnail?: string;
  thumbnail: string;
  thumbnailUrl?: string;
  duration: string;
  publishedAt?: string;
  viewCount?: number;
  playlistId?: string;
  playlistInfo?: string;
  embeddable?: boolean;
  detectedLanguage?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  difficultyLevel?: string;
  recommendedReason: string;
  rationale?: string;
  embedUrl: string;
  youtubeUrl?: string;
  source?: string;
}

export interface YouTubeRecommendationDoc {
  id: string;
  courseId: string;
  lessonId: string;
  videos: YouTubeVideoRecommendation[];
  source: string;
  generatedAt: string;
}

export interface LmsLesson {
  id: string;
  courseId?: string;
  moduleId?: string;
  moduleNumber?: number;
  moduleTitle?: string;
  lessonNumber?: number;
  topicName?: string;
  title?: string;
  topics?: string[];
  durationMinutes?: number;
  mandatory?: boolean;
  learningObjectives?: string[];
  recommendedVideos?: YouTubeVideoRecommendation[];
  learningMaterials?: string;
  resources?: { id?: string; title: string; url: string; type: string }[];
  quizId?: string;
  quizConfig?: {
    passingScore: number;
    questionCount: number;
    basicCount?: number;
    intermediateCount?: number;
    advancedCount?: number;
    maxRetakes?: number;
  };
  practicalAssignment?: {
    title: string;
    description: string;
    expectedOutput: string;
  };
  practicalProject: PracticalProjectDefinition;
  updatedBy?: string;
  updatedAt?: string;
}

export interface VideoLearningSession {
  id: string;
  sessionId?: string;
  studentId: string;
  courseId: string;
  lessonId: string;
  videoId: string;
  videoTitle: string;
  openedAt?: string;
  watchDurationSeconds?: number;
  totalDurationSeconds?: number;
  completed: boolean;
  completedAt?: string;
  playbackProgress?: number; // 0 to 100 percentage
}

export interface LessonCompletion {
  id: string;
  studentId: string;
  courseId: string;
  lessonId: string;
  videoCompleted: boolean;
  quizPassed: boolean;
  completedAt: string;
}

export type QuizQuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'fill_in_blank'
  | 'short_answer'
  | 'practical_application'
  | 'MCQ'
  | 'TRUE_FALSE'
  | 'FILL_IN_BLANK'
  | 'SHORT_ANSWER'
  | 'PRACTICAL_APPLICATION';

export interface QuizQuestion {
  id: string;
  questionText: string;
  type?: QuizQuestionType;
  format?: string;
  difficulty: 'basic' | 'intermediate' | 'advanced' | 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
  options?: string[];
  correctAnswer: string;
  rubricExplanation: string;
  points: number;
}

export interface QuizQuestionBankDoc {
  id: string;
  quizId: string;
  courseId: string;
  lessonId: string;
  questions: QuizQuestion[];
  generatedAt: string;
}

export interface QuizResponseItem {
  questionId: string;
  studentAnswer: string;
  isCorrect: boolean;
  scoreAwarded: number;
  maxScore: number;
  feedback: string;
}

export interface QuizAttempt {
  id?: string;
  attemptId?: string;
  studentId: string;
  studentName?: string;
  courseId: string;
  lessonId: string;
  attemptNumber?: number;
  submittedAt: string;
  score: number;
  maxScore: number;
  percentage?: number;
  percentageScore: number;
  passed: boolean;
  responses?: QuizResponseItem[];
  quinnFeedback: string;
  recommendedRevisionTopics: string[];
}

export interface QuizResponseDoc {
  id: string;
  attemptId: string;
  studentId: string;
  courseId: string;
  lessonId: string;
  responses: QuizResponseItem[];
  createdAt: string;
}

export interface PracticalProjectDefinition {
  id?: string;
  projectId?: string;
  courseId: string;
  lessonId?: string;
  studentId?: string;
  variationSeed?: string;
  title: string;
  description: string;
  problemStatement?: string;
  objectives: string[];
  instructions: string[];
  deliverables?: Array<{
    title: string;
    description: string;
    fileTypes: string[];
  }>;
  requiredDeliverables?: string[];
  expectedOutput?: string;
  submissionDeadlineDays: number;
  deadlineDate?: string;
  evaluationCriteria: {
    name: string;
    maxMarks: number;
    description: string;
  }[];
  maxMarks: number;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface ProjectSubmission {
  id?: string;
  submissionId?: string;
  studentId: string;
  studentName: string;
  registrationNumber?: string;
  courseId: string;
  courseTitle?: string;
  lessonId?: string;
  projectId: string;
  projectTitle?: string;
  submissionDate?: string;
  submittedAt?: string;
  submissionNotes?: string;
  githubOrProjectUrl?: string;
  demoVideoUrl?: string;
  attachedFiles?: Array<{ name: string; url: string; size?: string; type?: string }>;
  deliverableType?: 'pdf' | 'docx' | 'pptx' | 'image' | 'link' | 'video';
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  projectLink?: string;
  notes?: string;
  teacherId?: string;
  status:
    | 'Submitted'
    | 'Under Review'
    | 'Corrections Requested'
    | 'Approved'
    | 'Rejected'
    | 'SUBMITTED'
    | 'PENDING_REVIEW';
  evaluationId?: string;
  reviewedBy?: string;
  reviewDate?: string;
}

export interface StudentPresentation {
  id?: string;
  presentationId?: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle?: string;
  projectId?: string;
  presentationMethod?: 'SLIDES_UPLOAD' | 'RECORDED_VIDEO' | 'LIVE_SCHEDULE';
  method?: 'upload_slides' | 'upload_video' | 'live_schedule';
  slidesUrl?: string;
  slidesFileName?: string;
  videoUrl?: string;
  videoFileName?: string;
  scheduledTime?: string;
  scheduledDate?: string;
  scheduledTimeSlot?: string;
  teacherId?: string;
  teacherName?: string;
  meetingLink?: string;
  notes?: string;
  status:
    | 'Scheduled'
    | 'Submitted'
    | 'Under Review'
    | 'Evaluated'
    | 'Reassessment Scheduled'
    | 'SCHEDULED'
    | 'SUBMITTED'
    | 'PENDING_REVIEW';
  submittedAt: string;
  marksAwarded?: number;
  feedback?: string;
}

export interface TeacherEvaluationRubricScores {
  subjectKnowledge: number; // max 20
  conceptUnderstanding?: number; // max 20
  conceptsMastery?: number; // max 20
  practicalImplementation: number; // max 20
  creativityInnovation: number; // max 15
  presentationSkills?: number; // max 15
  presentationQuality?: number; // max 15
  communicationSkills: number; // max 10
}

export interface TeacherEvaluation {
  id?: string;
  evaluationId?: string;
  submissionId: string;
  presentationId?: string;
  studentId: string;
  studentName: string;
  registrationNumber?: string;
  courseId: string;
  courseName?: string;
  projectTitle?: string;
  evaluatedBy?: string;
  teacherId?: string;
  teacherName: string;
  evaluationDate?: string;
  evaluatedAt?: string;
  scores?: TeacherEvaluationRubricScores;
  rubricScores: TeacherEvaluationRubricScores;
  totalScore: number; // max 100
  writtenFeedback: string;
  actionItemsRequired?: string;
  correctionsRequested?: string;
  decision?: 'Approved' | 'Corrections Requested' | 'Rejected' | 'Reassessment Scheduled';
  status?: 'Approved' | 'Corrections Requested' | 'Rejected' | 'Reassessment Scheduled';
  finalized?: boolean;
  isApproved?: boolean;
  certificateType?: CertificateType;
  history?: Array<{
    timestamp: string;
    teacherName: string;
    totalScore: number;
    decision: string;
    feedback: string;
  }>;
}

export type LearningStage =
  | 'enrollment'
  | 'video_learning'
  | 'quiz'
  | 'project_assignment'
  | 'project_submission'
  | 'presentation'
  | 'teacher_evaluation'
  | 'certificate'
  | 'COURSE_ENROLLMENT'
  | 'VIDEO_LEARNING'
  | 'QUIZ_COMPLETION'
  | 'PROJECT_ASSIGNMENT'
  | 'PROJECT_SUBMISSION'
  | 'PRESENTATION'
  | 'TEACHER_EVALUATION'
  | 'CERTIFICATE';

export interface QuinnPerformanceAnalysis {
  progressPercentage: number;
  quizAverage: number;
  projectScore: number;
  presentationScore: number;
  skillDevelopmentScore: number;
  strengths: string[];
  weaknesses: string[];
  areasForImprovement: string[];
  personalizedRecommendation: string;
  lastAnalyzedAt: string;
}

export interface CertificateEligibilityStatus {
  allMandatoryLessonsCompleted: boolean;
  requiredAssessmentsCompleted: boolean;
  minimumQuizCriteriaMet: boolean;
  projectSubmittedAndApproved: boolean;
  presentationCompleted: boolean;
  teacherFinalApprovalGranted: boolean;
  isEligible: boolean;
}

export interface StudentProgressRecord {
  id?: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  registrationNumber?: string;
  courseId: string;
  courseTitle?: string;
  courseDuration?: string;
  assignedTeacherId?: string;
  assignedTeacherName?: string;
  enrollmentDate?: string;
  currentStage: LearningStage;
  completedStages: LearningStage[];
  failedStages?: LearningStage[];
  completedLessonIds: string[];
  totalMandatoryLessons?: number;
  activeLessonId?: string;
  overallProgressPercent: number;
  quizAveragePercent: number;
  certificateEligible: boolean;
  eligibilityChecklist?: CertificateEligibilityStatus;
  videoSessionsCount?: number;
  quizzesPassed?: number;
  projectApproved?: boolean;
  presentationCompleted?: boolean;
  teacherApproved?: boolean;
  adminCertificateApproved?: boolean;
  certificateIssued?: boolean;
  certificateId?: string;
  certificate?: IssuedCertificate;
  projectSubmission?: ProjectSubmission;
  presentation?: StudentPresentation;
  teacherEvaluation?: TeacherEvaluation;
  performanceAnalysis?: QuinnPerformanceAnalysis;
  lastActiveAt?: string;
  updatedAt?: string;
}

export type CertificateType =
  | 'Course Completion Certificate'
  | 'Skill Development Certificate'
  | 'Practical Training Certificate'
  | 'Assessment Certificate'
  | 'Professional Development Certificate';

export interface IssuedCertificate {
  id?: string;
  certificateId: string; // e.g. OF-CERT-2026-0042
  certificateType?: CertificateType;
  studentId: string;
  studentName: string;
  registrationNumber?: string;
  courseId: string;
  courseName?: string;
  courseTitle?: string;
  courseDuration?: string;
  issuedDate?: string;
  completionDate: string;
  finalScore?: number;
  score?: number;
  grade: string;
  teacherId?: string;
  teacherName?: string;
  teacherRole?: string;
  approvedByAdmin?: boolean;
  adminApproverEmail?: string;
  templateId?: string;
  verificationUrl?: string;
  qrVerificationUrl?: string;
  qrCodeUrl?: string;
  accreditationBody?: string;
  authorizedSignatory?: string;
  homeAddress?: string;
  flatNumber?: string;
  streetAddress?: string;
  pincode?: string;
  mobileNumber?: string;
  alternativeMobileNumber?: string;
  state?: string;
  addressVerifiedAt?: string;
  status: 'Issued' | 'Pending Admin Approval' | 'Revoked' | 'VERIFIED';
  issuedAt?: string;
}

export interface CertificateVerificationLog {
  id: string;
  certificateId: string;
  verifiedAt: string;
  source?: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  accreditationLine: string;
  credentialTitle: string;
  authorizedSignatoryName: string;
  authorizedSignatoryTitle: string;
  requireAdminApprovalBeforeIssue: boolean;
  defaultCertificateType?: CertificateType;
  accentColor: string;
  updatedAt: string;
}

export interface LmsGlobalSettings {
  id: string;
  quinnPersona: string;
  defaultBasicCount: number;
  defaultIntermediateCount: number;
  defaultAdvancedCount: number;
  defaultPassingScore: number;
  defaultMaxRetakes: number;
  requireVideoCompletionConfirmation: boolean;
  youtubePreferredChannels: string;
  youtubeMaxRecommendations: number;
  youtubeSafeSearch: 'strict' | 'moderate';
  requireAdminCertApproval: boolean;
  updatedAt: string;
  updatedBy?: string;
}

export interface LmsNotification {
  id: string;
  userId?: string;
  recipientId: string;
  recipientEmail?: string;
  recipientRole?: 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN';
  type:
    | 'new_lesson'
    | 'video_recommendation'
    | 'quiz_pending'
    | 'project_assigned'
    | 'project_deadline'
    | 'presentation_schedule'
    | 'teacher_feedback'
    | 'assessment_result'
    | 'certificate_ready'
    | 'VIDEO_READY'
    | 'PROJECT_ASSIGNED'
    | 'PRESENTATION_SCHEDULED'
    | 'TEACHER_FEEDBACK'
    | 'CERTIFICATE_READY';
  title: string;
  message: string;
  timestamp?: string;
  createdAt?: string;
  read: boolean;
  actionUrl?: string;
  emailDispatched?: boolean;
}

// ====================================================
// SCALABLE COURSE MARKETPLACE
// ====================================================

export interface MarketplaceCounters {
  totalCoursesAvailable: number;
  paidCourses: number;
  youtubeCourses: number;
  videoPlaylists: number;
  newlyAddedCourses: number;
  draftCourses: number;
  categoriesCount: number;
  baseCatalogTotal: number;
  updatedAt: string;
}

export interface MarketplaceCategory {
  id: string;
  name: string;
  slug: string;
  domainGroup: string;
  description: string;
  subcategories: string[];
  baseCourseCount: number;
  customCourseCount: number;
  totalCourseCount: number;
  isSystemDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseDedupKey {
  id: string;
  keyType: 'video' | 'playlist' | 'course' | 'title';
  rawValue: string;
  courseId: string;
  title: string;
  createdAt: string;
}

export type CourseImportSourceType =
  | 'csv'
  | 'json'
  | 'manual'
  | 'youtube_url'
  | 'youtube_playlist'
  | 'youtube_discovery';

export interface CourseImportLog {
  id: string;
  sourceType: CourseImportSourceType;
  sourceLabel?: string;
  totalProcessed: number;
  importedCount: number;
  duplicateCount: number;
  failedCount: number;
  duplicatesSample: Array<{ title?: string; id?: string; reason: string }>;
  errorsSample: Array<{ row?: number; title?: string; error: string }>;
  importedBy: string;
  importedByUid: string;
  status: 'Completed' | 'Completed With Warnings' | 'Failed';
  createdAt: string;
  completedAt: string;
}

export interface StudentFavoriteCourse {
  id: string;
  studentId: string;
  courseId: string;
  courseTitle: string;
  category: string;
  subcategory?: string;
  imageUrl: string;
  youtubeUrl?: string;
  youtubePlaylistUrl?: string;
  courseType?: MarketplaceCourseType;
  level: string;
  duration: string;
  isFree: boolean;
  price: number;
  savedAt: string;
}

export interface MarketplaceAutocompleteSuggestion {
  type: 'course' | 'category' | 'subcategory' | 'instructor' | 'channel' | 'language';
  id?: string;
  label: string;
  sublabel?: string;
  category?: string;
  courseType?: MarketplaceCourseType;
}

export interface MarketplaceFilterParams {
  query?: string;
  tab?: string;
  category?: string;
  subcategory?: string;
  categoryGroup?: string;
  pricingTier?: string;
  courseType?: 'all' | MarketplaceCourseType;
  contentType?: 'all' | CourseContentType;
  libraryCollection?: 'all' | 'standard' | 'corporate_training';
  language?: string;
  level?: string;
  duration?: string;
  publicationDate?: 'all' | 'week' | 'month' | 'year';
  instructor?: string;
  channel?: string;
  educationLevel?: string;
  degree?: string;
  subject?: string;
  deliveryMethod?: string;
  accessType?: 'all' | 'free' | 'paid';
  board?: string;
  priceBand?: 'all' | 'school_300_799' | 'degree_800_1499' | 'pg_1500_2500';
  skill?: string;
  certificateOnly?: boolean;
  status?: string;
  sortBy?: 'popular' | 'rating' | 'price_low' | 'price_high' | 'newest';
  page?: number;
  pageSize?: number;
}

// ====================================================
// GLOBAL YOUTUBE COURSE DISCOVERY & IMPORT ENGINE
// ====================================================

export type DiscoveredCourseReviewStatus =
  | 'Pending Review'
  | 'Approved'
  | 'Imported'
  | 'Rejected'
  | 'Duplicate'
  | 'Failed';

export interface DiscoveredCourse {
  id: string;
  jobId: string;
  title: string;
  description: string;
  category: string;
  categories: string[];
  subcategory: string;
  categoryGroup: string;
  youtubeVideoId?: string;
  youtubeUrl?: string;
  youtubePlaylistId?: string;
  youtubePlaylistUrl?: string;
  youtubeChannelId?: string;
  youtubeChannelName: string;
  youtubeChannelUrl?: string;
  channelThumbnailUrl?: string;
  thumbnailUrl: string;
  publishedAt?: string;
  viewCount?: number;
  embeddable?: boolean;
  playlistInfo?: string;
  duration?: string;
  durationMinutes?: number;
  estimatedHours?: number;
  language: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  learningObjectives: string[];
  keywords: string[];
  isFree: boolean;
  price: number;
  courseType: MarketplaceCourseType;
  contentType?: CourseContentType;
  topic?: string;
  libraryCollection?: 'standard' | 'corporate_training';
  certificateEligibility: boolean;
  sourceVerificationStatus: 'Verified YouTube Resource' | 'Unverified' | 'Unavailable';
  reviewStatus: DiscoveredCourseReviewStatus;
  duplicateReason?: string;
  existingCourseId?: string;
  importedCourseId?: string;
  emergingSubjects?: string[];
  searchQueryUsed: string;
  discoveredAt: string;
  updatedAt: string;
}

export interface DiscoveryQuotaStatus {
  apiKeyConfigured: boolean;
  dateKey: string;
  unitsUsedToday: number;
  dailyLimit: number;
  remainingUnits: number;
  searchCallsToday: number;
  detailCallsToday: number;
  cachedHitsToday: number;
  lastErrorCode?: string;
  lastErrorMessage?: string;
}

export interface DiscoveryJobState {
  id: string;
  status: 'idle' | 'running' | 'paused' | 'stopped' | 'completed' | 'error';
  mode: 'batch' | 'test_20' | 'manual_search';
  autoApproveImport: boolean;
  selectedCategories: string[];
  selectedLanguages: string[];
  selectedModifiers: string[];
  emergingKeywords: string[];
  includeVideos: boolean;
  includePlaylists: boolean;
  includeChannels: boolean;
  targetBatchLimit: number;
  currentCategoryIdx: number;
  currentModifierIdx: number;
  currentLanguageIdx: number;
  nextPageToken?: string;
  queriesExecuted: number;
  discoveredCount: number;
  verifiedCount: number;
  importedCount: number;
  duplicateCount: number;
  failedCount: number;
  rejectedCount: number;
  lastErrorCode?: string;
  lastErrorMessage?: string;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
}

// ====================================================
// SCHOOL EDUCATION MANAGEMENT SYSTEM (LKG TO 12TH STD)
// ====================================================

export type SchoolBoardId =
  | 'KAR_STATE'
  | 'CBSE'
  | 'ICSE'
  | 'OTHER_STATE'
  | 'OTHER_RECOGNIZED';

export type SchoolClassId =
  | 'LKG'
  | 'UKG'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12';

export type SchoolLanguage =
  | 'English'
  | 'Kannada'
  | 'Hindi'
  | 'Tamil'
  | 'Telugu'
  | 'Malayalam'
  | 'Marathi'
  | 'Gujarati'
  | 'Bengali'
  | 'Odia'
  | 'Punjabi'
  | 'Assamese'
  | 'Urdu'
  | 'Sanskrit';

export interface AllIndiaLanguagePack {
  id: SchoolLanguage;
  name: string;
  nativeLabel: string;
  scriptName: string;
  bcp47Code: string;
  rtl?: boolean;
  primaryRegions: string[];
  traceCharacters: string[];
  sampleSentence: string;
}

export interface MultilingualGlossaryEntry {
  id: string;
  subject: string;
  english: string;
  definition: string;
  translations: Partial<Record<SchoolLanguage, string>> & {
    Kannada: string;
    Hindi: string;
  };
}

export interface TranslatedConceptBundle {
  conceptId: string;
  language: SchoolLanguage;
  title: string;
  simpleExplanation: string;
  detailedExplanation: string;
  revisionNotes: string;
  realLifeApplications: string[];
  source: 'gemini_translated' | 'cache' | 'glossary_fallback';
  updatedAt: string;
}

export type SchoolStreamId = 'General' | 'Science' | 'Commerce' | 'Arts' | 'Vocational';

export type SchoolMasteryStatus = 'Not Started' | 'In Progress' | 'Needs Revision' | 'Mastered';

export type SchoolQuestionFormat =
  | 'multiple_choice'
  | 'fill_in_blank'
  | 'true_false'
  | 'match_following'
  | 'short_answer'
  | 'long_answer'
  | 'numerical'
  | 'diagram_based';

export type SchoolQuizMode =
  | 'Daily Quiz'
  | 'Weekly Quiz'
  | 'Chapter Test'
  | 'Subject Test'
  | 'Monthly Assessment'
  | 'Revision Test'
  | 'Mock Examination';

export type SchoolMarksCategory =
  | 'Quiz'
  | 'Chapter Test'
  | 'Assignment'
  | 'Monthly Test'
  | 'Quarterly Exam'
  | 'Half-Yearly Exam'
  | 'Annual Exam'
  | 'Practical'
  | 'Project'
  | 'Presentation';

export interface MultilingualText {
  English: string;
  Kannada: string;
  Hindi: string;
  [language: string]: string | undefined;
}

export interface SchoolBoardDefinition {
  id: SchoolBoardId;
  name: string;
  shortName: string;
  authority: string;
  description: string;
  supportedMediums: string[];
  gradingRuleSummary: string;
  gradingBands: Array<{
    grade: string;
    minPercent: number;
    maxPercent: number;
    points?: number;
    remark: string;
  }>;
}

export interface SchoolClassDefinition {
  id: SchoolClassId;
  label: string;
  shortLabel: string;
  stage: 'Pre-Primary' | 'Primary' | 'Middle' | 'Secondary' | 'Senior Secondary';
  ageRange: string;
  description: string;
  hasStreams: boolean;
  accentColor: string;
}

export interface SchoolConcept {
  id: string;
  subjectId: string;
  chapterId: string;
  topicId: string;
  subtopicTitle: string;
  order: number;
  title: MultilingualText;
  simpleExplanation: MultilingualText;
  detailedExplanation: MultilingualText;
  learningObjectives: string[];
  examples: Array<{ title: string; content: string; stepByStep?: string[] }>;
  realLifeApplications: MultilingualText[];
  illustrationUrl: string;
  diagramType:
    | 'number_line'
    | 'fraction_bars'
    | 'plant_cell'
    | 'water_cycle'
    | 'electric_circuit'
    | 'pythagoras'
    | 'supply_demand'
    | 'periodic_atom'
    | 'logic_gate'
    | 'general_concept';
  diagramCaption: string;
  technicalTermsGlossary: Array<{
    term: string;
    kannadaMeaning: string;
    hindiMeaning: string;
    definition: string;
  }>;
  importantQuestions: Array<{ question: string; answer: string; marks: number }>;
  practiceExercises: Array<{
    prompt: string;
    hint: string;
    solution: string;
  }>;
  homeworkTask: string;
  revisionNotes: MultilingualText;
  flashcards: Array<{ front: string; back: string }>;
  estimatedMinutes: number;
  difficulty: 'Basic' | 'Intermediate' | 'Advanced';
}

export interface SchoolChapter {
  id: string;
  boardId: SchoolBoardId;
  classId: SchoolClassId;
  subjectId: string;
  chapterNumber: number;
  title: MultilingualText;
  textbookReference: string;
  summary: string;
  topics: Array<{
    id: string;
    title: string;
    subtopics: string[];
  }>;
  concepts: SchoolConcept[];
}

export interface SchoolSubject {
  id: string;
  boardId: SchoolBoardId;
  classId: SchoolClassId;
  stream: SchoolStreamId;
  code: string;
  name: MultilingualText;
  category: string;
  colorTheme: string;
  textbookSource: string;
  academicYear: string;
  mediums: string[];
  chapters: SchoolChapter[];
}

export interface SchoolStudentEnrollment {
  id: string;
  studentUid: string;
  studentName: string;
  studentEmail: string;
  boardId: SchoolBoardId;
  directoryBoardId?: string;
  directoryBoardName?: string;
  classId: SchoolClassId;
  academicYear: string;
  curriculumVersionId?: string;
  medium: string;
  stream: SchoolStreamId;
  preferredLanguage: SchoolLanguage;
  parentalConsentGiven: boolean;
  parentEmail?: string;
  parentName?: string;
  xpPoints: number;
  streakDays: number;
  badges: string[];
  totalLearningMinutes: number;
  lastActiveDate: string;
  createdAt: string;
  updatedAt: string;
}

export type BoardCategory = 'National' | 'International' | 'State' | 'Union Territory';

export type BoardAffiliationMode =
  | 'National Examination Board'
  | 'National Open Schooling'
  | 'International Baccalaureate Continuum'
  | 'Cambridge Pathway'
  | 'Unified State Examination Board'
  | 'Split Secondary & Higher Secondary Boards'
  | 'CBSE / NCERT Affiliated State/UT System'
  | 'UT Board + CBSE Curriculum';

export interface AllIndiaBoardRecord {
  id: string;
  curriculumGroupId: SchoolBoardId;
  category: BoardCategory;
  stateOrUt: string;
  officialName: string;
  shortName: string;
  secondaryBoardName?: string;
  seniorSecondaryBoardName?: string;
  scertBody: string;
  affiliationMode: BoardAffiliationMode;
  hasSeparateStateBoard: boolean;
  subProgrammes: string[];
  gradeRangeSummary: string;
  officialGradeLevels: SchoolClassId[];
  supportedMediums: string[];
  gradingSummary: string;
  officialWebsite: string;
  officialSyllabusUrl?: string;
  verificationStatus: 'Verified' | 'Pending Admin Verification' | 'Needs Review';
  sourceNote: string;
  isActive: boolean;
  updatedAt: string;
}

export interface CurriculumVersionSpec {
  id: string;
  label: string;
  academicYears: string[];
  isDefault: boolean;
  description: string;
  status: 'Active' | 'Transitional' | 'Legacy';
}

export interface AcademicStageMapping {
  classId: SchoolClassId;
  classLabel: string;
  officialStageName: string;
  boardLevelTitle: string;
  availableInBoard: boolean;
  boardExamMilestone?: string;
  assessmentMode: string;
}

export interface BoardGradingBandSpec {
  grade: string;
  minPercent: number;
  maxPercent: number;
  points?: number;
  descriptor: string;
}

export interface BoardStreamSpec {
  streamId: SchoolStreamId;
  boardStreamTitle: string;
  coreSubjects: string[];
  minClassId: SchoolClassId;
}

export interface BoardGradeFramework {
  id: string;
  directoryBoardId: string;
  boardShortName: string;
  structurePattern: string;
  gradingScaleName: string;
  passingRule: string;
  gradingBands: BoardGradingBandSpec[];
  curriculumVersions: CurriculumVersionSpec[];
  stages: AcademicStageMapping[];
  streamStructure: BoardStreamSpec[];
  updatedAt: string;
}

export interface SchoolConceptProgress {
  id: string;
  studentId: string;
  boardId: SchoolBoardId;
  classId: SchoolClassId;
  subjectId: string;
  chapterId: string;
  conceptId: string;
  conceptTitle: string;
  status: SchoolMasteryStatus;
  videoReviewed: boolean;
  recapCompleted: boolean;
  practiceCompleted: boolean;
  quizPassed: boolean;
  latestQuizScore?: number;
  timeSpentSeconds: number;
  needsSupport: boolean;
  revisionScheduledAt?: string;
  updatedAt: string;
}

export interface SchoolQuizQuestion {
  id: string;
  format: SchoolQuestionFormat;
  difficulty: 'Basic' | 'Intermediate' | 'Advanced';
  questionText: string;
  options?: string[];
  matchPairs?: Array<{ left: string; right: string }>;
  diagramDescription?: string;
  correctAnswer: string;
  explanation: string;
  marks: number;
}

export interface SchoolQuizAttempt {
  id: string;
  studentId: string;
  studentName: string;
  boardId: SchoolBoardId;
  classId: SchoolClassId;
  subjectId: string;
  subjectName: string;
  chapterId?: string;
  conceptId?: string;
  quizMode: SchoolQuizMode;
  language: SchoolLanguage;
  questions: SchoolQuizQuestion[];
  studentAnswers: Record<string, string>;
  itemGrades: Array<{
    questionId: string;
    isCorrect: boolean;
    awardedMarks: number;
    maxMarks: number;
    feedback: string;
    isSubjective: boolean;
  }>;
  totalAwarded: number;
  totalMax: number;
  percentage: number;
  pendingTeacherReview: boolean;
  teacherReviewedBy?: string;
  teacherRemarks?: string;
  submittedAt: string;
  updatedAt: string;
}

export interface SchoolAssignment {
  id: string;
  boardId: SchoolBoardId;
  classId: SchoolClassId;
  subjectId: string;
  subjectName: string;
  chapterTitle?: string;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  allowedFormats: string[];
  assignedByUid: string;
  assignedByName: string;
  createdAt: string;
}

export interface SchoolSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  boardId: SchoolBoardId;
  classId: SchoolClassId;
  subjectId: string;
  submissionType: 'Written' | 'PDF' | 'Photo' | 'Audio' | 'Video' | 'Project File';
  writtenAnswer?: string;
  fileUrl?: string;
  fileName?: string;
  status: 'Submitted' | 'Evaluated' | 'Corrections Requested';
  marksAwarded?: number;
  maxMarks: number;
  teacherComment?: string;
  evaluatedBy?: string;
  submittedAt: string;
  updatedAt: string;
}

export interface SchoolPresentationItem {
  id: string;
  studentId: string;
  studentName: string;
  boardId: SchoolBoardId;
  classId: SchoolClassId;
  subjectId: string;
  subjectName: string;
  topicTitle: string;
  presentationType:
    | 'Topic Presentation'
    | 'PowerPoint Slides'
    | 'Video Presentation'
    | 'Audio Explanation'
    | 'Project Demonstration'
    | 'Science Experiment'
    | 'Group Presentation';
  groupMembers?: string;
  fileUrl?: string;
  externalUrl?: string;
  summaryNotes: string;
  status: 'Submitted' | 'AI Reviewed' | 'Evaluated';
  rubric?: {
    subjectKnowledge: number; // /15
    understanding: number; // /15
    communication: number; // /15
    creativity: number; // /15
    confidence: number; // /15
    accuracy: number; // /15
    presentationQuality: number; // /10
  };
  aiSuggestedFeedback?: string;
  totalMarks?: number;
  maxMarks: number;
  teacherFeedback?: string;
  evaluatedBy?: string;
  submittedAt: string;
  updatedAt: string;
}

export interface SchoolMarkEntry {
  id: string;
  studentId: string;
  studentName: string;
  boardId: SchoolBoardId;
  classId: SchoolClassId;
  academicYear: string;
  subjectId: string;
  subjectName: string;
  category: SchoolMarksCategory;
  examTitle: string;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  remarks?: string;
  recordedBy: string;
  recordedAt: string;
}

export interface SchoolExamination {
  id: string;
  boardId: SchoolBoardId;
  classId: SchoolClassId;
  academicYear: string;
  title: string;
  category: SchoolMarksCategory;
  subjectName: string;
  examDate: string;
  durationMinutes: number;
  maxMarks: number;
  syllabusScope: string;
  createdBy: string;
}

export interface SchoolAttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  boardId: SchoolBoardId;
  classId: SchoolClassId;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Late' | 'Online Attended';
  learningMinutesToday: number;
  markedBy: string;
}

export interface SchoolTimetableSlot {
  id: string;
  boardId: SchoolBoardId;
  classId: SchoolClassId;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  subjectId: string;
  subjectName: string;
  teacherName: string;
  mode: 'Live Class' | 'Self-Paced Concept' | 'Lab / Practice' | 'Revision';
}

export interface SchoolLiveClass {
  id: string;
  boardId: SchoolBoardId;
  classId: SchoolClassId;
  subjectName: string;
  topicTitle: string;
  teacherUid: string;
  teacherName: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingUrl: string;
  sessionType: 'Live Lecture' | 'Doubt Clearing' | 'Revision Clinic';
  recordingUrl?: string;
  announcement?: string;
  attendeeIds: string[];
  status: 'Scheduled' | 'Live' | 'Completed';
}

export interface SchoolFeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: SchoolClassId;
  academicYear: string;
  termName: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Scholarship Covered';
  receiptNumber?: string;
  updatedAt: string;
}

export interface SchoolParentTeacherMessage {
  id: string;
  parentUid: string;
  parentName: string;
  teacherUid: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  senderRole: 'parent' | 'teacher';
  message: string;
  createdAt: string;
}

export interface SchoolAnnouncement {
  id: string;
  title: string;
  body: string;
  boardId?: SchoolBoardId | 'ALL';
  classId?: SchoolClassId | 'ALL';
  priority: 'Normal' | 'Important' | 'Exam Alert';
  authorName: string;
  createdAt: string;
}

// ====================================================
// UNIVERSAL AI COURSE PLATFORM MODULES (PDF SPEC)
// ====================================================

export interface AiLearningModule {
  moduleNumber: number;
  partLabel?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  title: string;
  objectives: string[];
  summary: string;
  practiceExercises: string[];
  videoIds: string[];
  recommendedVideos?: YouTubeVideoRecommendation[];
  miniQuizQuestion?: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  };
}

export interface AiLearningPath {
  id: string;
  topic: string;
  language: string;
  title: string;
  overview: string;
  aiDisclaimer: string;
  sourceMode: 'builtin_engine' | 'gemini' | 'structured_fallback';
  partGroups?: Array<{
    partNumber: number;
    partTitle: string;
    partSummary?: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    moduleNumbers: number[];
  }>;
  matchedCatalogCourses?: Array<{
    id: string;
    title: string;
    category: string;
    level: string;
    duration: string;
    price: number;
    marketBenchmarkPrice?: number;
    discountPercent?: number;
    thumbnailUrl?: string;
    youtubeVideoId?: string;
  }>;
  price?: number;
  marketBenchmarkPrice?: number;
  discountPercent?: number;
  board?: string;
  educationLevel?: string;
  modules: AiLearningModule[];
  approvedByAdmin?: boolean;
  createdByUid?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StudentLessonNote {
  id: string;
  studentId: string;
  courseId: string;
  lessonId: string;
  lessonTitle?: string;
  content: string;
  updatedAt: string;
  createdAt: string;
}

export interface StudentLessonBookmark {
  id: string;
  studentId: string;
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  videoId?: string;
  savedAt: string;
}

export interface SearchHistoryEntry {
  id: string;
  userId?: string;
  query: string;
  normalizedQuery?: string;
  detectedLanguage?: string;
  selectedLanguage?: string;
  resultCount?: number;
  category?: string;
  searchedAt: string;
}

export interface ConsentRecord {
  id: string;
  userId?: string;
  email: string;
  fullName: string;
  isMinor: boolean;
  guardianName?: string;
  guardianEmail?: string;
  guardianMobile?: string;
  dpdpConsentAccepted: boolean;
  gpsOptInAccepted: boolean;
  termsAccepted: boolean;
  recordedAt: string;
}

export interface ContentReport {
  id: string;
  reporterUid?: string;
  reporterEmail?: string;
  courseId: string;
  lessonId?: string;
  videoId?: string;
  reason: string;
  details: string;
  status: 'Submitted' | 'Under Review' | 'Resolved' | 'Dismissed';
  createdAt: string;
}

export interface ApiUsageTelemetry {
  youtubeQuota: {
    apiKeyConfigured: boolean;
    dateKey: string;
    unitsUsedToday: number;
    dailyLimit: number;
    remainingUnits: number;
    searchCallsToday: number;
    detailCallsToday: number;
    cachedHitsToday: number;
    lastErrorCode?: string;
    lastErrorMessage?: string;
  };
  geminiUsage: {
    apiKeyConfigured: boolean;
    model: string;
    totalCallsToday: number;
    errorsToday: number;
    lastCallAt?: string;
    lastEndpoint?: string;
  };
  searchStats: {
    totalSearchesToday: number;
    recentQueries: Array<{
      query: string;
      detectedLanguage: string;
      resultCount: number;
      searchedAt: string;
    }>;
  };
}

// ====================================================
// SCHOOL PARTNER PORTAL (MULTI-TENANT SAAS) TYPES
// ====================================================

export type SchoolApplicationStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'More Information Required'
  | 'Suspended';

export type SchoolPartnerInstitutionType =
  | 'K-12 School'
  | 'Primary School'
  | 'High School'
  | 'Pre-University / Junior College'
  | 'Degree College / University'
  | 'Coaching / Skill Academy'
  | 'Other Institution';

export interface SchoolDocumentUpload {
  id: string;
  docType: 'Registration Certificate' | 'Board Affiliation Letter' | 'UDISE Certificate' | 'Principal Authorization' | 'Other';
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  status: 'Uploaded' | 'Verified' | 'Correction Needed';
  uploadedAt: string;
}

export interface SchoolInstitution {
  id: string;
  applicationRef: string;
  institutionCode: string;
  name: string;
  udiseCode?: string;
  institutionType: SchoolPartnerInstitutionType;
  boardAffiliation: string;
  address: string;
  state: string;
  district: string;
  city: string;
  pinCode: string;
  website?: string;
  studentCountEstimate: number;
  teacherCountEstimate: number;
  principalName: string;
  principalDesignation: string;
  principalMobile: string;
  principalMobileVerified?: boolean;
  principalEmail: string;
  principalEmailVerified?: boolean;
  adminUid: string;
  adminEmail: string;
  assignedTeacherUids?: string[];
  documents: SchoolDocumentUpload[];
  consentAccepted: boolean;
  declarationAcceptedAt?: string;
  verificationStatus: SchoolApplicationStatus;
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  submittedAt?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolTenantClass {
  id: string;
  institutionId: string;
  institutionAdminUid: string;
  gradeName: string;
  section: string;
  academicYear: string;
  classTeacherUid?: string;
  classTeacherName?: string;
  capacity?: number;
  assignedTeacherUids?: string[];
  createdAt: string;
  updatedAt: string;
}

export type SchoolStaffRole =
  | 'Teacher'
  | 'Class Teacher'
  | 'Subject Coordinator'
  | 'Academic Counselor'
  | 'School Admin Staff'
  | 'Support Staff';

export interface SchoolStaffMember {
  id: string;
  institutionId: string;
  institutionAdminUid: string;
  staffUid?: string;
  staffCode: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: SchoolStaffRole;
  qualification: string;
  subjects: string[];
  assignedClassIds: string[];
  assignedClassLabels: string[];
  status: 'Active' | 'Inactive' | 'Suspended';
  joinedAt: string;
  updatedAt: string;
}

export type SchoolStudentEnrollmentStatus =
  | 'Active'
  | 'On Leave'
  | 'Transferred'
  | 'Graduated'
  | 'Withdrawn';

export interface SchoolTenantStudent {
  id: string;
  institutionId: string;
  institutionAdminUid: string;
  assignedTeacherUids?: string[];
  studentCode: string;
  studentUid?: string;
  fullName: string;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  classId: string;
  className: string;
  section: string;
  rollNumber?: string;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  guardianEmail?: string;
  addressSummary?: string;
  enrollmentStatus: SchoolStudentEnrollmentStatus;
  enrolledPrograms: string[];
  documents?: Array<{
    id: string;
    name: string;
    docType: string;
    url: string;
    uploadedAt: string;
  }>;
  admissionDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolTenantAttendanceRecord {
  id: string;
  institutionId: string;
  institutionAdminUid: string;
  assignedTeacherUids?: string[];
  personId: string;
  personName: string;
  personType: 'Student' | 'Staff';
  classId?: string;
  classLabel?: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  markedByUid: string;
  markedByName: string;
  remarks?: string;
  createdAt: string;
}

export interface SchoolProgramEnrollment {
  id: string;
  institutionId: string;
  institutionAdminUid: string;
  assignedTeacherUids?: string[];
  courseId: string;
  programTitle: string;
  category: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  classId: string;
  className: string;
  status: 'Enrolled' | 'In Progress' | 'Completed' | 'Withdrawn';
  progressPercent: number;
  feeInr: number;
  enrolledAt: string;
  updatedAt: string;
}

export type AssessmentDimension = 'IQ' | 'EQ' | 'SQ';

export interface IqEqSqQuestionItem {
  id: string;
  prompt: string;
  domain: string;
  questionType: 'mcq' | 'likert';
  options: string[];
  /** Present only for authoritative evaluation; stripped before sending active quiz sheet to students */
  correctOptionIndex?: number;
  likertWeights?: number[];
}

export interface SchoolAssessmentAssignment {
  id: string;
  institutionId: string;
  institutionAdminUid: string;
  assignedTeacherUids?: string[];
  title: string;
  dimension: AssessmentDimension;
  gradeBand: 'Primary (1-5)' | 'Middle (6-8)' | 'Secondary (9-12)';
  targetClassIds: string[];
  targetClassLabels: string[];
  instructions: string;
  durationMinutes: number;
  allowRetakes: boolean;
  scheduledStart: string;
  scheduledEnd: string;
  status: 'Scheduled' | 'Active' | 'Closed';
  createdByUid: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolIqEqSqResult {
  id: string;
  institutionId: string;
  institutionAdminUid: string;
  assignedTeacherUids?: string[];
  assignmentId: string;
  assignmentTitle: string;
  dimension: AssessmentDimension;
  studentId: string;
  studentName: string;
  studentCode: string;
  className: string;
  status: 'Assigned' | 'In Progress' | 'Submitted';
  answers: Record<string, number>;
  scorePercent: number;
  bandLabel: string;
  educationalSummary: string;
  subScores: Record<string, number>;
  nonClinicalDisclaimerAccepted: boolean;
  startedAt?: string;
  submittedAt?: string;
  updatedAt: string;
}

export interface SchoolPaymentStatusHistoryEntry {
  status: 'Pending' | 'Paid' | 'Failed' | 'Refund Requested' | 'Refunded';
  changedBy: string;
  note?: string;
  changedAt: string;
}

export interface SchoolTenantPayment {
  id: string;
  institutionId: string;
  institutionAdminUid: string;
  userId: string;
  studentId?: string;
  studentName?: string;
  payerName: string;
  payerEmail: string;
  category: 'Program Fee' | 'Assessment Fee' | 'Tuition / School Fee' | 'Subscription';
  description: string;
  amountInr: number;
  outstandingBalanceInr: number;
  gateway: 'Razorpay' | 'Bank / NEFT' | 'Challan / Cash';
  status: 'Pending' | 'Paid' | 'Failed' | 'Refund Requested' | 'Refunded';
  receiptNumber: string;
  invoiceNumber: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  verifiedServerSide: boolean;
  statusHistory: SchoolPaymentStatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface SchoolTenantCertificate {
  id: string;
  certificateId: string;
  institutionId: string;
  institutionAdminUid: string;
  schoolName: string;
  schoolCode: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  className: string;
  programId: string;
  programTitle: string;
  achievementSummary: string;
  issuerName: string;
  issueDate: string;
  status: 'Issued' | 'Revoked' | 'Corrected';
  revocationReason?: string;
  correctionNote?: string;
  verificationUrl: string;
  qrDataUrl?: string;
  issuedByUid: string;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolTenantAnnouncement {
  id: string;
  institutionId: string;
  institutionAdminUid: string;
  title: string;
  message: string;
  audience: 'All School' | 'Teachers & Staff' | 'Students & Parents' | 'Program Cohort';
  priority: 'Standard' | 'Important' | 'Urgent';
  channelSummary: string;
  deliveryStatus: 'Delivered (In-App)' | 'Email Sent' | 'Email Not Configured' | 'Partial / Failed';
  createdByUid: string;
  createdByName: string;
  createdAt: string;
}

export interface SchoolTenantAuditLog {
  id: string;
  institutionId: string;
  institutionAdminUid: string;
  actorUid: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  createdAt: string;
}

// ====================================================
// INTELLIGENT EDUCATION CLASSIFICATION, DISCOVERY, Q&A & ROADMAPS
// ====================================================

export type EducationCategoryCode = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J';

export interface EducationClassificationCategory {
  code: EducationCategoryCode;
  levelNumber: number; // 1 to 10
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  programmes: string[];
  degreeGroups?: Array<{ group: string; degrees: string[] }>;
  streams: string[];
  sampleSubjects: string[];
  sampleQueries: string[];
}

export interface EducationTaxonomyItem {
  id: string;
  categoryCode: EducationCategoryCode;
  levelNumber?: number;
  categoryTitle: string;
  itemType: 'qualification' | 'degree' | 'stream' | 'subject' | 'specialization';
  name: string;
  parentGroup?: string;
  description?: string;
  displayOrder?: number;
  isActive: boolean;
  createdByUid?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseRequestDoc {
  id: string;
  userId?: string;
  requesterName: string;
  requesterEmail: string;
  topic: string;
  educationLevel?: string;
  degreeOrClass?: string;
  preferredFormat?: string;
  notes?: string;
  status: 'Requested' | 'Under Review' | 'Planned' | 'Fulfilled';
  createdAt: string;
  updatedAt: string;
}

export interface ParsedLearningIntent {
  rawQuery: string;
  cleanedQuery: string;
  educationLevelCode?: EducationCategoryCode;
  educationLevelLabel?: string;
  currentQualification?: string;
  degreeOrClass?: string;
  primarySubject?: string;
  desiredSkill?: string;
  careerGoal?: string;
  preferredLanguage: string;
  preferredLanguageCode: string;
  preferredFormat?: 'Video' | 'Course' | 'Roadmap' | 'Q&A';
  intentPriorityTerms: string[];
  searchKeywords: string[];
  correctionHint?: string;
  usedAiParser?: boolean;
}

export type RecommendationCategoryId =
  | 'recommended_for_you'
  | 'related_to_degree'
  | 'related_to_search'
  | 'career_development'
  | 'additional_skills'
  | 'beginner_courses'
  | 'advanced_courses'
  | 'youtube_resources';

export interface RecommendedCourseCard {
  course: MarketplaceCourse;
  whyRecommended: string;
  matchScore: number;
  recommendationCategory: RecommendationCategoryId;
}

export interface RecommendationGroupBucket {
  id: RecommendationCategoryId;
  title: string;
  subtitle: string;
  courses: RecommendedCourseCard[];
}

export interface RoadmapStageItem {
  stageNumber: number;
  title: string;
  focusSummary: string;
  estimatedDuration: string;
  topics: string[];
  milestoneAssignment: string;
  recommendedCourseIds: string[];
  recommendedCourses?: MarketplaceCourse[];
  youtubeResources: YouTubeVideoRecommendation[];
}

export interface VisualLearningRoadmap {
  id: string;
  topic: string;
  targetOutcome: string;
  educationContext?: string;
  totalEstimatedDuration: string;
  stages: RoadmapStageItem[];
  nonDegreeDisclaimer: string;
  generatedBy: 'gemini' | 'structured_engine';
  createdAt: string;
}

export interface QuinnDiscoveryResponse {
  parsedIntent: ParsedLearningIntent;
  recommendationGroups: RecommendationGroupBucket[];
  youtubeResources: YouTubeVideoRecommendation[];
  relatedSkills: string[];
  roadmap: VisualLearningRoadmap;
  totalMatchedCourses: number;
  youtubeSource: string;
}

export interface QaPracticeQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QaStructuredResult {
  question: string;
  subject: string;
  topic: string;
  educationContext: string;
  language: string;
  answer: string;
  examples: string[];
  keyTakeaways: string[];
  relatedConcepts: string[];
  recommendedCourses: Array<{
    course: MarketplaceCourse;
    rationale: string;
  }>;
  youtubeVideos: YouTubeVideoRecommendation[];
  suggestedLearningPathTitle: string;
  suggestedLearningPathSteps: string[];
  practiceQuiz: QaPracticeQuestion[];
  generatedBy: 'gemini' | 'structured_engine';
  honestyNote?: string;
}

export interface QaSavedRecord {
  id: string;
  studentId: string;
  studentName?: string;
  question: string;
  subject: string;
  topic: string;
  educationContext?: string;
  answer: string;
  relatedConcepts: string[];
  recommendedCourseIds: string[];
  youtubeVideoIds: string[];
  savedAt: string;
}

export interface RecommendationAnalyticsEvent {
  id: string;
  userId?: string;
  eventType: 'search' | 'course_impression' | 'course_enroll_click' | 'youtube_watch' | 'qa_ask' | 'roadmap_save';
  query: string;
  educationLevelCode?: string;
  degreeOrClass?: string;
  subject?: string;
  courseId?: string;
  videoId?: string;
  createdAt: string;
}

// ====================================================
// STUDY ON YOUR OWN SELF — WEEKLY TOKEN WALLET & ANALYTICS
// ====================================================

export type SelfStudyTokenAction =
  | 'video_ai_analysis'
  | 'chapter_pdf'
  | 'thirty_q_exam'
  | 'iq_eq_sq_test';

export interface TokenUsageEntry {
  id: string;
  action: SelfStudyTokenAction;
  tokensDeducted: number;
  subject?: string;
  chapterTitle?: string;
  timestamp: string;
}

export interface StudentTokenWallet {
  uid: string;
  studentEmail?: string;
  balance: number;
  weeklyStarterQuota: number;
  rechargedTokens: number;
  totalTokensUsed: number;
  cycleStartedAt: string;
  cycleExpiresAt: string;
  lastRechargeAt?: string;
  usageHistory: TokenUsageEntry[];
  updatedAt: string;
}

export interface TokenRechargeRecord {
  id: string;
  uid: string;
  studentName?: string;
  studentEmail?: string;
  amountInr: number;
  tokensGranted: number;
  durationDays: number;
  paymentMethod: 'Razorpay' | 'Provisional Dev Activation';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  verifiedServerSide: boolean;
  status: 'Paid' | 'Provisional' | 'Pending';
  createdAt: string;
}

export interface SelfStudyChapterNote {
  chapterTitle: string;
  boardName: string;
  levelLabel: string;
  classOrDepartment: string;
  subject: string;
  language: string;
  overview: string;
  keyDefinitions: Array<{ term: string; definition: string }>;
  coreConcepts: Array<{ heading: string; explanation: string; bulletPoints: string[] }>;
  formulasOrKeyRules: string[];
  workedExamples: Array<{ problem: string; solution: string }>;
  quickRevisionChecklist: string[];
  officialTextbookLinks: Array<{ label: string; url: string; authority: string }>;
  generatedBy: 'gemini' | 'structured_engine';
  generatedAt: string;
}

export interface SelfStudyExamQuestion {
  id: string;
  number: number;
  questionText: string;
  subTopic: string;
  cognitiveLevel: 'Recall' | 'Understanding' | 'Application' | 'Analysis';
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SelfStudyTopicDiagnostic {
  topic: string;
  total: number;
  correct: number;
  accuracyPercent: number;
  status: 'Strong' | 'Developing' | 'Weak';
}

export interface SelfStudyProgressReport {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  boardId: string;
  boardName: string;
  educationLevelNumber: number; // 1 to 10
  educationLevelLabel: string;
  classOrDepartment: string;
  subject: string;
  chapterTitle: string;
  language: string;
  sourceType: 'youtube_video' | 'chapter_pdf';
  videoId?: string;
  videoTitle?: string;
  totalQuestions: number;
  correctAnswers: number;
  thirtyQuestionScore: number; // 0-100
  iqScore: number; // 0-100
  eqScore: number; // 0-100
  sqScore: number; // 0-100
  iqBand: string;
  eqBand: string;
  sqBand: string;
  strongTopics: string[];
  weakTopics: string[];
  topicDiagnostics: SelfStudyTopicDiagnostic[];
  remediationPlan: string[];
  tokensSpent: number;
  submittedAt: string;
}
