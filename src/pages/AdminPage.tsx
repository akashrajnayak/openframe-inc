import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import {
  Shield,
  ShieldAlert,
  ClipboardList,
  Search,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Clock,
  Sparkles,
  Database,
  Building,
  Mail,
  Phone,
  MapPin,
  Package,
  Layers,
  BookOpen,
  FileText,
  BellRing,
  Send,
  Eye,
  Heart,
  Download,
  Upload,
  Tag,
  Filter,
  Globe,
  Check,
  X,
  Users,
  ShieldCheck,
  Settings,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AdminSidebar, AdminModuleKey } from '../components/admin/AdminSidebar';
import { AdminTopNav } from '../components/admin/AdminTopNav';
import { PaymentSettings } from '../components/admin/PaymentSettings';
import { AdminLoginPage } from './AdminLoginPage';
import {
  getAllAdminUsers,
  updateAdminUserRole,
  toggleAdminUserActive,
  getActivityLogs,
  logActivity,
  updateDocumentInFirestore,
  deleteDocumentInFirestore
} from '../services/firebase';
import { storageService } from '../services/storageService';
import { marketplaceService } from '../services/marketplaceService';
import { lmsService } from '../services/lmsService';
import { AdminSchoolPartnerGovernance } from '../components/school-partner/AdminSchoolPartnerGovernance';
import {
  InquirySubmission,
  BlogPost,
  CareerOpening,
  SiteSettings,
  JobApplication,
  InternshipApplication,
  ProfessionalRegistration,
  SchoolPartnerEnquiry,
  NgoPartnerEnquiry,
  GeneralWorkEnquiry,
  StudentRegistration,
  TeacherRegistration,
  DigitalProduct,
  ProductEnquiry,
  HopeNestUpdate,
  HopeNestVolunteer,
  HopeNestDonationEnquiry,
  HopeNestParticipant,
  HopeNestProgram,
  ContactMessage,
  GeneralEnquiry,
  SoftwareEnquiryItem,
  BusinessEnquiry,
  BranchLocation,
  NewsletterSubscriber,
  AdminUser,
  AdminRole,
  ActivityLog,
  Course,
  CorporateDocument,
  MarketplaceCourse,
  MarketplaceCourseStatus,
  MarketplacePricingTier
} from '../types';
import { OFFICIAL_PRICING_PLANS, OFFICIAL_BROCHURES } from '../data/educationData';
import {
  AdminDashboardOverview,
  DashboardMetricCounts,
  RecentSubmissionItem,
  MonthlyTrendData,
  StatusDistribution,
  AdminLmsTelemetry
} from '../components/admin/AdminDashboardOverview';
import { RecordDetailModal } from '../components/admin/RecordDetailModal';
import { AdminDataTable, ColumnDef } from '../components/admin/AdminDataTable';
import { CourseMigrationModal } from '../components/admin/CourseMigrationModal';
import { AdminLmsControlPanel } from '../components/admin/AdminLmsControlPanel';
import { AdminCourseMarketplaceManager } from '../components/admin/AdminCourseMarketplaceManager';
import { AdminCorporateTrainingLibrary } from '../components/admin/AdminCorporateTrainingLibrary';
import { AdminSchoolManagement } from '../components/admin/AdminSchoolManagement';
import { AdminCourseApprovalPanel } from '../components/admin/AdminCourseApprovalPanel';

export const AdminPage: React.FC = () => {
  const { navigate } = useRouter();
  const {
    currentUser,
    adminProfile,
    isSuperAdmin,
    logout,
    loading: authLoading,
  } = useAuth();

  // Navigation & UI States
  const [activeModule, setActiveModule] = useState<AdminModuleKey>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (
        p.includes('/course-approvals') ||
        params.get('module') === 'course_approvals'
      ) {
        return 'course_approvals';
      }
      if (
        p.includes('/payment-settings') ||
        p.includes('/razorpay') ||
        params.get('module') === 'payment_settings'
      ) {
        return 'payment_settings';
      }
    }
    return 'dashboard';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Inspected Record Modal State
  const [inspectedRecord, setInspectedRecord] = useState<{
    data: any;
    moduleKey: AdminModuleKey;
  } | null>(null);

  // HopeNest Sub-tab State
  const [hopeNestSubTab, setHopeNestSubTab] = useState<'volunteers' | 'donations' | 'participants' | 'updates'>('volunteers');

  // Dedicated Collection Data States
  const [inquiries, setInquiries] = useState<InquirySubmission[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [generalEnquiries, setGeneralEnquiries] = useState<GeneralEnquiry[]>([]);
  const [softwareEnquiries, setSoftwareEnquiries] = useState<SoftwareEnquiryItem[]>([]);
  const [businessEnquiries, setBusinessEnquiries] = useState<BusinessEnquiry[]>([]);
  const [studentRegistrations, setStudentRegistrations] = useState<StudentRegistration[]>([]);
  const [teacherRegistrations, setTeacherRegistrations] = useState<TeacherRegistration[]>([]);
  const [internships, setInternships] = useState<InternshipApplication[]>([]);
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalRegistration[]>([]);
  const [schoolPartners, setSchoolPartners] = useState<SchoolPartnerEnquiry[]>([]);
  const [ngoPartners, setNgoPartners] = useState<NgoPartnerEnquiry[]>([]);
  const [generalWork, setGeneralWork] = useState<GeneralWorkEnquiry[]>([]);
  const [hopenestVolunteers, setHopenestVolunteers] = useState<HopeNestVolunteer[]>([]);
  const [hopenestDonations, setHopenestDonations] = useState<HopeNestDonationEnquiry[]>([]);
  const [hopenestParticipants, setHopenestParticipants] = useState<HopeNestParticipant[]>([]);
  const [hopenestUpdates, setHopenestUpdates] = useState<HopeNestUpdate[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [productEnquiries, setProductEnquiries] = useState<ProductEnquiry[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [branches, setBranches] = useState<BranchLocation[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [corporateDocuments, setCorporateDocuments] = useState<CorporateDocument[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(storageService.getSiteSettings());

  // Editing Modals States
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<DigitalProduct> | null>(null);
  const [editingBranch, setEditingBranch] = useState<Partial<BranchLocation> | null>(null);
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);

  // Scalable Course Marketplace States
  const [coursesActiveTab, setCoursesActiveTab] = useState<'marketplace' | 'foundation' | 'brochures'>('marketplace');
  const [mpTotalAvailable, setMpTotalAvailable] = useState<number | null>(null);
  const [lmsTelemetry, setLmsTelemetry] = useState<AdminLmsTelemetry | undefined>(undefined);
  const [pendingCourseApprovalsCount, setPendingCourseApprovalsCount] = useState<number>(0);
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);

  // Search state for users and logs
  const [adminSearch, setAdminSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const effectiveRole: AdminRole =
    adminProfile?.role || (isSuperAdmin ? 'Super Admin' : 'Sales Admin');

  // Load all data
  const loadData = () => {
    setInquiries(storageService.getInquiries());
    setContactMessages(storageService.getContactMessages());
    setGeneralEnquiries(storageService.getGeneralEnquiries());
    setSoftwareEnquiries(storageService.getDedicatedSoftwareEnquiries());
    setBusinessEnquiries(storageService.getBusinessEnquiries());
    setStudentRegistrations(storageService.getStudentRegistrations());
    setTeacherRegistrations(storageService.getTeacherRegistrations());
    setInternships(storageService.getInternships());
    setJobs(storageService.getApplications());
    setProfessionals(storageService.getProfessionals());
    setSchoolPartners(storageService.getSchoolPartners());
    setNgoPartners(storageService.getNgoPartners());
    setGeneralWork(storageService.getGeneralWorkEnquiries());
    setHopenestVolunteers(storageService.getHopeNestVolunteers());
    setHopenestDonations(storageService.getHopeNestDonationEnquiries());
    setHopenestParticipants(storageService.getHopeNestParticipants());
    setHopenestUpdates(storageService.getHopeNestUpdates());
    setCourses(storageService.getEducationCourses());
    setProducts(storageService.getProducts());
    setProductEnquiries(storageService.getProductEnquiries());
    setBlogPosts(storageService.getBlogPosts());
    setBranches(storageService.getBranches());
    setSubscribers(storageService.getNewsletterSubscribers());
    setCorporateDocuments(storageService.getCorporateDocuments());
    setSiteSettings(storageService.getSiteSettings());

    getAllAdminUsers().then((users) => {
      if (users && users.length > 0) {
        setAdminUsers(users);
      } else {
        setAdminUsers([
          {
            uid: 'admin-primary-01',
            email: 'admin@openframeitsolutions.com',
            displayName: 'OpenFrame Executive Admin',
            role: 'Super Admin',
            createdAt: '2026-01-01T00:00:00.000Z',
            isActive: true
          },
          {
            uid: 'admin-hr-02',
            email: 'hr@openframeitsolutions.com',
            displayName: 'Talent & HR Lead',
            role: 'HR Admin',
            createdAt: '2026-02-15T00:00:00.000Z',
            isActive: true
          },
          {
            uid: 'admin-sales-03',
            email: 'sales@openframeitsolutions.com',
            displayName: 'Solutions & Sales Lead',
            role: 'Sales Admin',
            createdAt: '2026-02-20T00:00:00.000Z',
            isActive: true
          },
          {
            uid: 'admin-edu-04',
            email: 'education@openframeitsolutions.com',
            displayName: 'Academic Registrar',
            role: 'Education Admin',
            createdAt: '2026-03-01T00:00:00.000Z',
            isActive: true
          },
          {
            uid: 'admin-hopenest-05',
            email: 'foundation@hopenest.org',
            displayName: 'HopeNest Secretariat',
            role: 'HopeNest Admin',
            createdAt: '2026-03-05T00:00:00.000Z',
            isActive: true
          }
        ]);
      }
    }).catch(() => {});

    getActivityLogs().then((logs) => {
      if (logs && logs.length > 0) setActivityLogs(logs);
      else {
        setActivityLogs([
          {
            id: 'log-bootstrap-1',
            adminEmail: 'admin@openframeitsolutions.com',
            adminRole: 'Super Admin',
            action: 'System Initialization',
            collection: 'system',
            details: 'Initial Firebase infrastructure provisioned and synchronized',
            timestamp: new Date().toISOString()
          }
        ]);
      }
    }).catch(() => {});
  };

  const refreshMarketplaceCount = async () => {
    try {
      const [c, an, tel, approvalQueue] = await Promise.all([
        marketplaceService.getLiveMarketplaceCounters(true),
        lmsService.getLmsAnalytics().catch(() => null),
        lmsService.getSystemTelemetry().catch(() => null),
        lmsService.getCourseApprovalQueue().catch(() => null),
      ]);
      if (approvalQueue) {
        setPendingCourseApprovalsCount(
          approvalQueue.counts.pending + approvalQueue.counts.readyToApprove
        );
      }
      setMpTotalAvailable(c.totalCoursesAvailable);
      setLmsTelemetry({
        totalCatalogCourses: c.totalCoursesAvailable,
        categoriesCount: c.categoriesCount,
        activeStudents: an?.activeStudents ?? 0,
        activeTeachers: an?.activeTeachers ?? 0,
        totalEnrollments: an?.totalEnrollments ?? 0,
        certificatesIssued: an?.certificatesIssued ?? 0,
        youtubeQuotaUsed: tel?.youtubeQuota?.unitsUsedToday ?? 0,
        youtubeQuotaLimit: tel?.youtubeQuota?.dailyLimit ?? 10000,
        geminiCallsToday: tel?.geminiUsage?.totalCallsToday ?? 0,
      });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadData();
    refreshMarketplaceCount();
  }, []);

  useEffect(() => {
    if (activeModule === 'courses') {
      refreshMarketplaceCount();
    }
  }, [activeModule]);

  // Auth & RBAC gating are enforced uniformly by DashboardShell

  // Role Based Access Control
  const canAccess = (moduleKey: AdminModuleKey): boolean => {
    if (isSuperAdmin || effectiveRole === 'Super Admin') return true;

    switch (moduleKey) {
      case 'dashboard':
        return true;
      case 'general_enquiries':
      case 'software_enquiries':
      case 'business_enquiries':
      case 'product_enquiries':
        return effectiveRole === 'Sales Admin';
      case 'course_approvals':
      case 'students':
      case 'teachers':
      case 'courses':
      case 'lms_management':
      case 'school_management':
        return effectiveRole === 'Education Admin';
      case 'corporate_training':
        return (
          effectiveRole === 'Education Admin' ||
          effectiveRole === 'Content Admin' ||
          effectiveRole === 'HR Admin' ||
          effectiveRole === 'Sales Admin'
        );
      case 'school_partners':
        return effectiveRole === 'HR Admin' || effectiveRole === 'Education Admin';
      case 'internships':
      case 'jobs':
      case 'professionals':
      case 'ngo_partners':
        return effectiveRole === 'HR Admin';
      case 'hopenest_management':
        return effectiveRole === 'HopeNest Admin';
      case 'products':
      case 'blog':
      case 'announcements':
      case 'branches':
      case 'subscribers':
      case 'corporate_documents':
        return effectiveRole === 'Content Admin';
      case 'admin_users':
      case 'activity_logs':
      case 'settings':
      case 'payment_settings':
        return isSuperAdmin || (effectiveRole as string) === 'Super Admin';
      default:
        return false;
    }
  };

  // Combined metrics calculation
  const totalEnquiriesCount =
    generalEnquiries.length +
    contactMessages.length +
    softwareEnquiries.length +
    businessEnquiries.length +
    productEnquiries.length;

  const newEnquiriesCount =
    generalEnquiries.filter((e) => (e.status || 'New') === 'New').length +
    contactMessages.filter((m) => (m.status || 'New') === 'New').length +
    softwareEnquiries.filter((s) => (s.status || 'New') === 'New').length +
    businessEnquiries.filter((b) => (b.status || 'New') === 'New').length +
    productEnquiries.filter((p) => (p.status || 'New') === 'New').length;

  const totalPartnershipsCount =
    schoolPartners.length + ngoPartners.length + generalWork.length;

  const totalHopeNestCount =
    hopenestVolunteers.length +
    hopenestDonations.length +
    hopenestParticipants.length;

  const dashboardMetrics: DashboardMetricCounts = {
    totalEnquiries: totalEnquiriesCount,
    newEnquiries: newEnquiriesCount,
    totalStudents: studentRegistrations.length,
    totalTeachers: teacherRegistrations.length,
    totalInternships: internships.length,
    totalJobs: jobs.length,
    totalSoftware: softwareEnquiries.length,
    totalProducts: productEnquiries.length,
    totalPartnerships: totalPartnershipsCount,
    totalHopeNest: totalHopeNestCount
  };

  // Module Counts for Sidebar badges
  const sidebarCounts: Record<string, number> = {
    general_enquiries: generalEnquiries.length + contactMessages.length,
    software_enquiries: softwareEnquiries.length,
    business_enquiries: businessEnquiries.length,
    product_enquiries: productEnquiries.length,
    pending_course_approvals: pendingCourseApprovalsCount,
    students: studentRegistrations.length,
    teachers: teacherRegistrations.length,
    courses: courses.length,
    internships: internships.length,
    jobs: jobs.length,
    professionals: professionals.length,
    school_partners: schoolPartners.length,
    ngo_partners: ngoPartners.length,
    hopenest: totalHopeNestCount,
    products: products.length,
    blog: blogPosts.length,
    branches: branches.length,
    corporate_documents: corporateDocuments.length,
    subscribers: subscribers.length,
    admin_users: adminUsers.length,
    activity_logs: activityLogs.length
  };

  // Generate monthly trend numbers from real records
  const monthlyTrends: MonthlyTrendData[] = useMemo(() => {
    const allRecords = [
      ...generalEnquiries,
      ...contactMessages,
      ...softwareEnquiries,
      ...businessEnquiries,
      ...studentRegistrations,
      ...teacherRegistrations,
      ...internships,
      ...jobs,
      ...professionals,
      ...schoolPartners,
      ...ngoPartners,
      ...hopenestVolunteers,
      ...hopenestDonations,
      ...hopenestParticipants
    ];

    const monthsMap: Record<string, number> = {};
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short' });
      monthsMap[label] = 0;
    }

    allRecords.forEach((item: any) => {
      const dateStr = item.submittedAt || item.registeredAt || item.createdAt;
      if (dateStr) {
        const itemDate = new Date(dateStr);
        if (!isNaN(itemDate.getTime())) {
          const mLabel = itemDate.toLocaleString('default', { month: 'short' });
          if (monthsMap[mLabel] !== undefined) {
            monthsMap[mLabel]++;
          }
        }
      }
    });

    return Object.entries(monthsMap).map(([month, count]) => ({ month, count }));
  }, [
    generalEnquiries,
    contactMessages,
    softwareEnquiries,
    businessEnquiries,
    studentRegistrations,
    teacherRegistrations,
    internships,
    jobs,
    professionals,
    schoolPartners,
    ngoPartners,
    hopenestVolunteers,
    hopenestDonations,
    hopenestParticipants
  ]);

  // Aggregate Status Distribution
  const statusDistribution: StatusDistribution[] = useMemo(() => {
    const allRecords = [
      ...generalEnquiries,
      ...contactMessages,
      ...softwareEnquiries,
      ...businessEnquiries,
      ...productEnquiries,
      ...studentRegistrations,
      ...teacherRegistrations,
      ...internships,
      ...jobs,
      ...schoolPartners,
      ...ngoPartners
    ];

    const counts: Record<string, number> = {
      New: 0,
      Contacted: 0,
      'In Progress': 0,
      Approved: 0,
      Closed: 0
    };

    allRecords.forEach((r: any) => {
      const st = r.status || 'New';
      if (counts[st] !== undefined) {
        counts[st]++;
      } else if (st === 'Converted') {
        counts.Approved++;
      } else {
        counts.Closed++;
      }
    });

    return [
      { status: 'New', count: counts.New, color: '#f43f5e' },
      { status: 'Contacted', count: counts.Contacted, color: '#3b82f6' },
      { status: 'In Progress', count: counts['In Progress'], color: '#f59e0b' },
      { status: 'Approved / Converted', count: counts.Approved, color: '#10b981' },
      { status: 'Closed / Archived', count: counts.Closed, color: '#64748b' }
    ];
  }, [
    generalEnquiries,
    contactMessages,
    softwareEnquiries,
    businessEnquiries,
    productEnquiries,
    studentRegistrations,
    teacherRegistrations,
    internships,
    jobs,
    schoolPartners,
    ngoPartners
  ]);

  // Unified Recent Inbound Submissions
  const recentSubmissions: RecentSubmissionItem[] = useMemo(() => {
    const list: RecentSubmissionItem[] = [];

    softwareEnquiries.forEach((s) => {
      list.push({
        id: s.id,
        moduleKey: 'software_enquiries',
        moduleTitle: 'Software Quote',
        name: s.name,
        contact: s.emailAddress || s.mobileNumber || '—',
        date: s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : 'Recent',
        status: s.status || 'New',
        details: `${s.requiredService} • Budget: ${s.estimatedBudget || 'Flexible'}`,
        rawRecord: s
      });
    });

    generalEnquiries.forEach((g) => {
      list.push({
        id: g.id,
        moduleKey: 'general_enquiries',
        moduleTitle: 'General Enquiry',
        name: g.fullName,
        contact: g.emailAddress || g.mobileNumber || '—',
        date: g.submittedAt ? new Date(g.submittedAt).toLocaleDateString() : 'Recent',
        status: g.status || 'New',
        details: g.subject || g.enquiryCategory,
        rawRecord: g
      });
    });

    studentRegistrations.forEach((st) => {
      list.push({
        id: st.id,
        moduleKey: 'students',
        moduleTitle: 'Student Reg.',
        name: st.fullName,
        contact: st.emailAddress || st.mobileNumber || '—',
        date: st.registeredAt ? new Date(st.registeredAt).toLocaleDateString() : 'Recent',
        status: st.status || 'New',
        details: `Course: ${st.interestedCourse} • ${st.preferredLearningMode}`,
        rawRecord: st
      });
    });

    internships.forEach((i) => {
      list.push({
        id: i.id,
        moduleKey: 'internships',
        moduleTitle: 'Internship Apply',
        name: i.fullName,
        contact: i.emailAddress || i.mobileNumber || '—',
        date: i.submittedAt ? new Date(i.submittedAt).toLocaleDateString() : 'Recent',
        status: i.status || 'New',
        details: `Domain: ${i.preferredDomain} • ${i.courseAndYear}`,
        rawRecord: i
      });
    });

    jobs.forEach((j) => {
      list.push({
        id: j.id,
        moduleKey: 'jobs',
        moduleTitle: 'Job Application',
        name: j.fullName,
        contact: j.email || j.phone || '—',
        date: j.submittedAt ? new Date(j.submittedAt).toLocaleDateString() : 'Recent',
        status: j.status || 'New',
        details: `Role: ${j.jobTitle} • Exp: ${j.experience || '0'}`,
        rawRecord: j
      });
    });

    hopenestVolunteers.forEach((v) => {
      list.push({
        id: v.id,
        moduleKey: 'hopenest_management',
        moduleTitle: 'HopeNest Volunteer',
        name: v.fullName,
        contact: v.emailAddress || v.mobileNumber || '—',
        date: v.submittedAt ? new Date(v.submittedAt).toLocaleDateString() : 'Recent',
        status: v.status || 'New',
        details: `Area: ${v.areaOfInterest} • Location: ${v.location}`,
        rawRecord: v
      });
    });

    return list.slice(0, 10);
  }, [
    softwareEnquiries,
    generalEnquiries,
    studentRegistrations,
    internships,
    jobs,
    hopenestVolunteers
  ]);

  // Notifications feed for top nav
  const recentNotifications = useMemo(() => {
    return recentSubmissions.slice(0, 5).map((s) => ({
      id: s.id,
      type: s.moduleTitle,
      title: s.details || 'New submission logged',
      sender: s.name,
      time: s.date,
      moduleKey: s.moduleKey
    }));
  }, [recentSubmissions]);

  // Update record status & notes across collections
  const handleUpdateRecordStatus = async (
    recordId: string,
    newStatus: string,
    notes: string
  ) => {
    if (!inspectedRecord) return;
    const { moduleKey } = inspectedRecord;

    const collectionMap: Record<string, string> = {
      general_enquiries: 'general_enquiries',
      software_enquiries: 'software_enquiries',
      business_enquiries: 'business_enquiries',
      product_enquiries: 'product_enquiries',
      students: 'student_registrations',
      teachers: 'teacher_registrations',
      internships: 'internship_applications',
      jobs: 'job_applications',
      professionals: 'professional_registrations',
      school_partners: 'school_partnership_enquiries',
      ngo_partners: 'ngo_partnership_enquiries',
      hopenest_management: 'hopenest_volunteers'
    };

    const targetCollection = collectionMap[moduleKey];

    // Local Storage update
    storageService.updateInquiryStatus(recordId, newStatus as any);
    if (targetCollection) {
      updateDocumentInFirestore(targetCollection, recordId, {
        status: newStatus,
        adminNotes: notes,
        updatedAt: new Date().toISOString()
      }).catch(() => {});
    }

    // Log administrative action
    await logActivity(
      `Updated ${moduleKey} Record`,
      targetCollection || moduleKey,
      recordId,
      `Status changed to "${newStatus}". Notes updated.`
    );

    loadData();
    showToast(`Status updated to "${newStatus}" and logged.`);
  };

  // Delete record handler
  const handleDeleteRecord = async (recordId: string) => {
    if (!inspectedRecord) return;
    const { moduleKey } = inspectedRecord;

    const collectionMap: Record<string, string> = {
      general_enquiries: 'general_enquiries',
      software_enquiries: 'software_enquiries',
      business_enquiries: 'business_enquiries',
      product_enquiries: 'product_enquiries',
      students: 'student_registrations',
      teachers: 'teacher_registrations',
      internships: 'internship_applications',
      jobs: 'job_applications',
      professionals: 'professional_registrations',
      school_partners: 'school_partnership_enquiries',
      ngo_partners: 'ngo_partnership_enquiries',
      hopenest_management: 'hopenest_volunteers'
    };

    const targetCollection = collectionMap[moduleKey];
    if (targetCollection) {
      deleteDocumentInFirestore(targetCollection, recordId).catch(() => {});
    }

    await logActivity(
      `Deleted ${moduleKey} Record`,
      targetCollection || moduleKey,
      recordId,
      `Permanent removal of record ${recordId}`
    );

    loadData();
    showToast(`Record ${recordId} deleted from database.`);
  };

  // Admin User Role Modification
  const handleRoleChange = async (targetUid: string, newRole: AdminRole) => {
    try {
      await updateAdminUserRole(targetUid, newRole);
      setAdminUsers((prev) =>
        prev.map((u) => (u.uid === targetUid ? { ...u, role: newRole } : u))
      );
      await logActivity(
        'Updated Admin Role',
        'admin_users',
        targetUid,
        `Role updated to ${newRole}`
      );
      showToast(`Role updated to ${newRole}`);
    } catch {
      setAdminUsers((prev) =>
        prev.map((u) => (u.uid === targetUid ? { ...u, role: newRole } : u))
      );
      showToast(`Role updated to ${newRole}`);
    }
  };

  // Toggle Admin Status
  const handleToggleAdminStatus = async (targetUid: string, currentActive: boolean) => {
    try {
      await toggleAdminUserActive(targetUid, !currentActive);
      setAdminUsers((prev) =>
        prev.map((u) => (u.uid === targetUid ? { ...u, isActive: !currentActive } : u))
      );
      await logActivity(
        'Toggled Admin Active Status',
        'admin_users',
        targetUid,
        `Active set to ${!currentActive}`
      );
      showToast(`Admin account ${!currentActive ? 'Activated' : 'Suspended'}`);
    } catch {
      setAdminUsers((prev) =>
        prev.map((u) => (u.uid === targetUid ? { ...u, isActive: !currentActive } : u))
      );
      showToast(`Admin account ${!currentActive ? 'Activated' : 'Suspended'}`);
    }
  };

  // Save Site Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.updateSiteSettings(siteSettings);
    logActivity('Updated Site Settings', 'system_settings', 'settings', 'Global config updated');
    showToast('Corporate site settings saved and published.');
  };

  // Save Blog Post
  const handleSaveBlogPost = (status: 'Draft' | 'Published') => {
    if (!editingPost || !editingPost.title) {
      showToast('Article title is mandatory.');
      return;
    }

    const payload: BlogPost = {
      id: editingPost.id || `post-${Date.now()}`,
      title: editingPost.title,
      slug:
        editingPost.slug ||
        editingPost.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, ''),
      excerpt: editingPost.excerpt || '',
      shortDescription: editingPost.shortDescription || editingPost.excerpt || '',
      author: editingPost.author || 'OpenFrame Technical Advisory',
      authorRole: editingPost.authorRole || 'Engineering Team',
      category: editingPost.category || 'Technology',
      publishedDate: editingPost.publishedDate || new Date().toISOString(),
      readTime: editingPost.readTime || '5 min read',
      tags: editingPost.tags || ['Technology'],
      content: editingPost.content || ['Content placeholder'],
      featuredImageUrl:
        editingPost.featuredImageUrl ||
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      status: status,
      isFeatured: editingPost.isFeatured || false,
      isPopular: editingPost.isPopular || false
    };

    if (editingPost.id) {
      storageService.updateBlogPost(editingPost.id, payload);
    } else {
      storageService.saveBlogPost(payload);
    }

    setEditingPost(null);
    setBlogPosts(storageService.getBlogPosts());
    showToast(`Article "${payload.title}" saved as ${status}.`);
  };

  // Delete Blog Post
  const handleDeleteBlogPost = (id: string) => {
    setConfirmAction({
      title: 'Delete Article',
      message: 'Are you sure you want to permanently delete this article?',
      confirmLabel: 'Delete Article',
      onConfirm: () => {
        storageService.deleteBlogPost(id);
        setBlogPosts(storageService.getBlogPosts());
        showToast('Article deleted.');
      },
    });
  };

  // Save Digital Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) return;

    const payload: DigitalProduct = {
      id: editingProduct.id || `prod-${Date.now()}`,
      slug:
        editingProduct.slug ||
        editingProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: editingProduct.name,
      tagline: editingProduct.tagline || '',
      shortDesc: editingProduct.shortDesc || editingProduct.tagline || '',
      description: editingProduct.description || '',
      problemSolved: editingProduct.problemSolved || 'Enterprise automation',
      keyFeatures: editingProduct.keyFeatures || ['Multi-tenant Architecture', 'Real-time Analytics'],
      benefits: editingProduct.benefits || ['Increased Efficiency', 'Reduced Operational Cost'],
      howItWorks: editingProduct.howItWorks || [{ step: 1, title: 'Deploy', description: 'Immediate cloud setup' }],
      targetUsers: editingProduct.targetUsers || ['Enterprises'],
      intendedUsers: editingProduct.intendedUsers || 'Business Teams',
      faqs: editingProduct.faqs || [],
      category: editingProduct.category || 'Enterprise Software',
      status: editingProduct.status || 'Available',
      iconName: editingProduct.iconName || 'Package'
    };

    if (editingProduct.id) {
      storageService.updateProduct(editingProduct.id, payload);
    } else {
      storageService.saveProduct(payload);
    }

    setEditingProduct(null);
    setProducts(storageService.getProducts());
    showToast(`Product "${payload.name}" saved.`);
  };

  // Save Education Course
  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse || !editingCourse.name) return;

    const payload: Course = {
      id: editingCourse.id || `course-${Date.now()}`,
      name: editingCourse.name,
      category: editingCourse.category || 'Technology',
      shortDesc: editingCourse.shortDesc || '',
      duration: editingCourse.duration || '8 Weeks',
      level: editingCourse.level || 'Beginner',
      fee: editingCourse.fee || '₹1,200',
      highlights: editingCourse.highlights || ['Structured Curriculum', 'Live Classes'],
      curriculumOutline: editingCourse.curriculumOutline || ['Concept Foundations', 'Hands-on Lab'],
      learningMode: editingCourse.learningMode || 'Live Online Classes',
      certificationNote: editingCourse.certificationNote || 'OpenFrame Certificate of Course Completion',
      isPopular: editingCourse.isPopular || false,
      isFeatured: editingCourse.isFeatured || false
    };

    const existing = courses.filter((c) => c.id !== payload.id);
    const updated = [payload, ...existing];
    storageService.saveEducationCourses(updated);
    setCourses(updated);
    setEditingCourse(null);
    showToast(`Course "${payload.name}" saved.`);
  };

  // Save Branch Location
  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch || !editingBranch.name) return;

    const payload: BranchLocation = {
      id: editingBranch.id || `branch-${Date.now()}`,
      name: editingBranch.name,
      fullAddress: editingBranch.fullAddress || '',
      city: editingBranch.city || '',
      state: editingBranch.state || '',
      contactNumber: editingBranch.contactNumber || '',
      email: editingBranch.email || '',
      officeHours: editingBranch.officeHours || 'Monday - Saturday: 9:30 AM - 6:30 PM',
      isHeadquarters: editingBranch.isHeadquarters || false,
      isActive: editingBranch.isActive ?? true
    };

    if (editingBranch.id) {
      storageService.saveBranch(payload);
    } else {
      storageService.saveBranch(payload);
    }

    setEditingBranch(null);
    setBranches(storageService.getBranches());
    showToast(`Branch "${payload.name}" saved.`);
  };

  if (!authLoading && (!currentUser || !(adminProfile?.isActive || isSuperAdmin))) {
    return <AdminLoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        counts={sidebarCounts}
        role={effectiveRole}
        isSuperAdmin={isSuperAdmin}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        canAccess={canAccess}
        onLogout={() => logout().then(() => navigate('/admin/login'))}
      />

      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        <AdminTopNav
          activeModule={activeModule}
          onSelectModule={setActiveModule}
          onToggleMobileSidebar={() => setSidebarOpen((p) => !p)}
          userEmail={currentUser?.email || null}
          role={effectiveRole}
          isSuperAdmin={isSuperAdmin}
          onLogout={() => logout().then(() => navigate('/admin/login'))}
          recentNotifications={recentNotifications}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-[#071326] border border-blue-500 text-white px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <div className="space-y-6">
          {/* MODULE 1: DASHBOARD OVERVIEW */}
          {activeModule === 'dashboard' && (
            <AdminDashboardOverview
              metrics={dashboardMetrics}
              recentSubmissions={recentSubmissions}
              monthlyTrends={monthlyTrends}
              statusDistribution={statusDistribution}
              lmsTelemetry={lmsTelemetry}
              onSelectModule={(key) => setActiveModule(key)}
              onViewRecord={(record, key) => setInspectedRecord({ data: record, moduleKey: key })}
            />
          )}

          {/* MODULE 2: GENERAL ENQUIRIES */}
          {activeModule === 'general_enquiries' && (
            <AdminDataTable<GeneralEnquiry>
              title="General Corporate Enquiries"
              description="Inbound requests received from website visitors, clients, and partners."
              data={generalEnquiries}
              exportFileName="general_enquiries.csv"
              columns={[
                {
                  header: 'Applicant / Sender',
                  accessor: (row) => (
                    <div>
                      <div className="font-bold text-slate-900">{row.fullName}</div>
                      <div className="text-[11px] text-slate-500">{row.city}, {row.state}</div>
                    </div>
                  )
                },
                {
                  header: 'Contact',
                  accessor: (row) => (
                    <div className="font-mono text-[11px]">
                      <div>{row.emailAddress}</div>
                      <div className="text-slate-400">{row.mobileNumber || '—'}</div>
                    </div>
                  )
                },
                {
                  header: 'Category & Subject',
                  accessor: (row) => (
                    <div className="max-w-xs truncate font-medium text-slate-700">
                      <span className="text-blue-600 font-semibold">{row.enquiryCategory}:</span> {row.subject}
                    </div>
                  )
                }
              ]}
              onInspect={(row) => setInspectedRecord({ data: row, moduleKey: 'general_enquiries' })}
              onStatusChange={(id, status) => handleUpdateRecordStatus(id, status, '')}
              canDelete={isSuperAdmin}
              onDelete={handleDeleteRecord}
            />
          )}

          {/* MODULE 3: SOFTWARE ENQUIRIES */}
          {activeModule === 'software_enquiries' && (
            <AdminDataTable<SoftwareEnquiryItem>
              title="Software & Web Development Enquiries"
              description="Project quotation requests for custom software, web platforms, and cloud infrastructure."
              data={softwareEnquiries}
              exportFileName="software_enquiries.csv"
              columns={[
                {
                  header: 'Client / Company',
                  accessor: (row) => (
                    <div>
                      <div className="font-bold text-slate-900">{row.name}</div>
                      <div className="text-[11px] text-slate-500">{row.companyName || 'Private Client'}</div>
                    </div>
                  )
                },
                {
                  header: 'Contact',
                  accessor: (row) => (
                    <div className="font-mono text-[11px]">
                      <div>{row.emailAddress}</div>
                      <div className="text-slate-400">{row.mobileNumber || '—'}</div>
                    </div>
                  )
                },
                {
                  header: 'Project Scope',
                  accessor: (row) => (
                    <div>
                      <span className="font-semibold text-slate-800">{row.requiredService}</span>
                      <div className="text-[10px] text-blue-600 font-mono">Budget: {row.estimatedBudget || 'Flexible'}</div>
                    </div>
                  )
                },
                {
                  header: 'Timeline',
                  accessor: (row) => (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-700">
                      {row.timeline || 'Flexible'}
                    </span>
                  )
                }
              ]}
              onInspect={(row) => setInspectedRecord({ data: row, moduleKey: 'software_enquiries' })}
              onStatusChange={(id, status) => handleUpdateRecordStatus(id, status, '')}
              canDelete={isSuperAdmin}
              onDelete={handleDeleteRecord}
            />
          )}

          {/* MODULE 4: BUSINESS ENQUIRIES */}
          {activeModule === 'business_enquiries' && (
            <AdminDataTable<BusinessEnquiry>
              title="Enterprise Business Enquiries"
              description="B2B partnerships, institutional consulting, and enterprise collaboration proposals."
              data={businessEnquiries}
              exportFileName="business_enquiries.csv"
              columns={[
                {
                  header: 'Executive / Org',
                  accessor: (row) => (
                    <div>
                      <div className="font-bold text-slate-900">{row.name}</div>
                      <div className="text-[11px] text-slate-500">{row.organisation}</div>
                    </div>
                  )
                },
                {
                  header: 'Contact',
                  accessor: (row) => (
                    <div className="font-mono text-[11px]">
                      <div>{row.emailAddress}</div>
                      <div className="text-slate-400">{row.mobileNumber || '—'}</div>
                    </div>
                  )
                },
                {
                  header: 'Requirement',
                  accessor: (row) => (
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium text-[11px]">
                      {row.businessRequirement || 'Enterprise Project'}
                    </span>
                  )
                }
              ]}
              onInspect={(row) => setInspectedRecord({ data: row, moduleKey: 'business_enquiries' })}
              onStatusChange={(id, status) => handleUpdateRecordStatus(id, status, '')}
              canDelete={isSuperAdmin}
              onDelete={handleDeleteRecord}
            />
          )}

          {/* MODULE 5: PRODUCT ENQUIRIES */}
          {activeModule === 'product_enquiries' && (
            <AdminDataTable<ProductEnquiry>
              title="Digital Product Enquiries"
              description="License, demo, and deployment enquiries for OpenFrame digital software products."
              data={productEnquiries}
              exportFileName="product_enquiries.csv"
              columns={[
                {
                  header: 'Inquirer',
                  accessor: (row) => (
                    <div>
                      <div className="font-bold text-slate-900">{row.fullName}</div>
                      <div className="text-[11px] text-slate-500">{row.organizationName || 'Individual'}</div>
                    </div>
                  )
                },
                {
                  header: 'Product Requested',
                  accessor: (row) => (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200">
                      {row.productName}
                    </span>
                  )
                },
                {
                  header: 'Contact',
                  accessor: (row) => (
                    <div className="font-mono text-[11px]">
                      <div>{row.emailAddress}</div>
                      <div className="text-slate-400">{row.mobileNumber || '—'}</div>
                    </div>
                  )
                }
              ]}
              onInspect={(row) => setInspectedRecord({ data: row, moduleKey: 'product_enquiries' })}
              onStatusChange={(id, status) => handleUpdateRecordStatus(id, status, '')}
              canDelete={isSuperAdmin}
              onDelete={handleDeleteRecord}
            />
          )}

          {/* MODULE 6: STUDENT MANAGEMENT */}
          {activeModule === 'students' && (
            <AdminDataTable<StudentRegistration>
              title="Student Registrations & Training Batches"
              description="Student enrollments across academic courses, skill workshops, and certifications."
              data={studentRegistrations}
              exportFileName="student_registrations.csv"
              columns={[
                {
                  header: 'Student Name',
                  accessor: (row) => (
                    <div>
                      <div className="font-bold text-slate-900">{row.fullName}</div>
                      <div className="text-[11px] text-slate-500">{row.schoolCollegeName || row.city || 'Student'}</div>
                    </div>
                  )
                },
                {
                  header: 'Course Enrolled',
                  accessor: (row) => (
                    <div>
                      <span className="font-semibold text-blue-700">{row.interestedCourse}</span>
                      <div className="text-[10px] text-slate-400">{row.preferredLearningMode || 'Online'}</div>
                    </div>
                  )
                },
                {
                  header: 'Contact',
                  accessor: (row) => (
                    <div className="font-mono text-[11px]">
                      <div>{row.emailAddress}</div>
                      <div className="text-slate-400">{row.mobileNumber || '—'}</div>
                    </div>
                  )
                }
              ]}
              onInspect={(row) => setInspectedRecord({ data: row, moduleKey: 'students' })}
              onStatusChange={(id, status) => handleUpdateRecordStatus(id, status, '')}
              canDelete={isSuperAdmin}
              onDelete={handleDeleteRecord}
            />
          )}

          {/* MODULE 7: TEACHER MANAGEMENT */}
          {activeModule === 'teachers' && (
            <AdminDataTable<TeacherRegistration>
              title="Teacher & Faculty Network"
              description="Instructors, academic mentors, and guest lecturers registered with OpenFrame."
              data={teacherRegistrations}
              exportFileName="teacher_registrations.csv"
              columns={[
                {
                  header: 'Faculty Member',
                  accessor: (row) => (
                    <div>
                      <div className="font-bold text-slate-900">{row.fullName}</div>
                      <div className="text-[11px] text-slate-500">{row.location || 'Educator'}</div>
                    </div>
                  )
                },
                {
                  header: 'Subject & Expertise',
                  accessor: (row) => (
                    <div>
                      <span className="font-semibold text-emerald-700">{row.subjectSpecialization}</span>
                      <div className="text-[10px] text-slate-400">{row.teachingExperience} Exp.</div>
                    </div>
                  )
                },
                {
                  header: 'Contact',
                  accessor: (row) => (
                    <div className="font-mono text-[11px]">
                      <div>{row.email}</div>
                      <div className="text-slate-400">{row.mobileNumber || '—'}</div>
                    </div>
                  )
                }
              ]}
              onInspect={(row) => setInspectedRecord({ data: row, moduleKey: 'teachers' })}
              onStatusChange={(id, status) => handleUpdateRecordStatus(id, status, '')}
              canDelete={isSuperAdmin}
              onDelete={handleDeleteRecord}
            />
          )}

          {/* MODULE 8: INTERNSHIP MANAGEMENT */}
          {activeModule === 'internships' && (
            <AdminDataTable<InternshipApplication>
              title="Internship Applications"
              description="Applications for student internships, project trainees, and summer placements."
              data={internships}
              exportFileName="internship_applications.csv"
              columns={[
                {
                  header: 'Applicant',
                  accessor: (row) => (
                    <div>
                      <div className="font-bold text-slate-900">{row.fullName}</div>
                      <div className="text-[11px] text-slate-500">{row.collegeOrUniversity || 'Student'}</div>
                    </div>
                  )
                },
                {
                  header: 'Domain of Interest',
                  accessor: (row) => (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-[11px]">
                      {row.preferredDomain}
                    </span>
                  )
                },
                {
                  header: 'Degree & Year',
                  accessor: (row) => (
                    <span className="text-slate-600 text-[11px]">
                      {row.courseAndYear}
                    </span>
                  )
                },
                {
                  header: 'Contact',
                  accessor: (row) => (
                    <div className="font-mono text-[11px]">
                      <div>{row.emailAddress}</div>
                      <div className="text-slate-400">{row.mobileNumber || '—'}</div>
                    </div>
                  )
                }
              ]}
              onInspect={(row) => setInspectedRecord({ data: row, moduleKey: 'internships' })}
              onStatusChange={(id, status) => handleUpdateRecordStatus(id, status, '')}
              canDelete={isSuperAdmin}
              onDelete={handleDeleteRecord}
            />
          )}

          {/* MODULE 9: JOB APPLICATIONS */}
          {activeModule === 'jobs' && (
            <AdminDataTable<JobApplication>
              title="Corporate Job Openings & Candidate Applications"
              description="Candidate resumes submitted for full-time, part-time, and remote positions."
              data={jobs}
              exportFileName="job_applications.csv"
              columns={[
                {
                  header: 'Candidate',
                  accessor: (row) => (
                    <div>
                      <div className="font-bold text-slate-900">{row.fullName}</div>
                      <div className="text-[11px] text-slate-500">{row.currentLocation || 'India'}</div>
                    </div>
                  )
                },
                {
                  header: 'Position Applied',
                  accessor: (row) => (
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                      {row.jobTitle}
                    </span>
                  )
                },
                {
                  header: 'Experience',
                  accessor: (row) => (
                    <span className="text-slate-700 font-medium">
                      {row.experience || 'Fresher'}
                    </span>
                  )
                },
                {
                  header: 'Contact',
                  accessor: (row) => (
                    <div className="font-mono text-[11px]">
                      <div>{row.email}</div>
                      <div className="text-slate-400">{row.phone || '—'}</div>
                    </div>
                  )
                }
              ]}
              onInspect={(row) => setInspectedRecord({ data: row, moduleKey: 'jobs' })}
              onStatusChange={(id, status) => handleUpdateRecordStatus(id, status, '')}
              canDelete={isSuperAdmin}
              onDelete={handleDeleteRecord}
            />
          )}

          {/* MODULE 10: PROFESSIONAL REGISTRATIONS */}
          {activeModule === 'professionals' && (
            <AdminDataTable<ProfessionalRegistration>
              title="Professional Network Registrations"
              description="Industry consultants, domain advisors, and experienced technology specialists."
              data={professionals}
              exportFileName="professional_registrations.csv"
              columns={[
                {
                  header: 'Professional',
                  accessor: (row) => (
                    <div>
                      <div className="font-bold text-slate-900">{row.fullName}</div>
                      <div className="text-[11px] text-slate-500">{row.qualification || 'Specialist'}</div>
                    </div>
                  )
                },
                {
                  header: 'Domain & Expertise',
                  accessor: (row) => (
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold text-[11px]">
                      {row.primaryDomain}
                    </span>
                  )
                },
                {
                  header: 'Experience',
                  accessor: (row) => (
                    <span className="text-slate-700 font-medium">
                      {row.experienceYears} Years
                    </span>
                  )
                },
                {
                  header: 'Contact',
                  accessor: (row) => (
                    <div className="font-mono text-[11px]">
                      <div>{row.emailAddress}</div>
                      <div className="text-slate-400">{row.mobileNumber || '—'}</div>
                    </div>
                  )
                }
              ]}
              onInspect={(row) => setInspectedRecord({ data: row, moduleKey: 'professionals' })}
              onStatusChange={(id, status) => handleUpdateRecordStatus(id, status, '')}
              canDelete={isSuperAdmin}
              onDelete={handleDeleteRecord}
            />
          )}

          {/* MODULE 11: SCHOOL PARTNERSHIPS */}
          {activeModule === 'school_partners' && (
            <AdminSchoolPartnerGovernance
              enquiries={schoolPartners}
              actor={{
                uid: currentUser?.uid || 'admin',
                email: currentUser?.email || 'admin@openframeitsolutions.com',
                role: effectiveRole,
              }}
              isSuperAdmin={isSuperAdmin}
              onInspectEnquiry={(row) => setInspectedRecord({ data: row, moduleKey: 'school_partners' })}
              onEnquiryStatusChange={(id, status) => handleUpdateRecordStatus(id, status, '')}
              onDeleteEnquiry={handleDeleteRecord}
            />
          )}

          {/* MODULE 12: NGO PARTNERSHIPS */}
          {activeModule === 'ngo_partners' && (
            <AdminDataTable<NgoPartnerEnquiry>
              title="NGO & Community Partnerships"
              description="Non-profit organizations seeking joint skill development and social enablement initiatives."
              data={ngoPartners}
              exportFileName="ngo_partnerships.csv"
              columns={[
                {
                  header: 'NGO Name',
                  accessor: (row) => (
                    <div>
                      <div className="font-bold text-slate-900">{row.organizationName}</div>
                      <div className="text-[11px] text-slate-500">{row.registrationNumber || 'Registered NGO'}</div>
                    </div>
                  )
                },
                {
                  header: 'Key Representative',
                  accessor: (row) => (
                    <div>
                      <div className="font-medium text-slate-800">{row.contactPerson}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{row.emailAddress}</div>
                    </div>
                  )
                },
                {
                  header: 'Focus Area',
                  accessor: (row) => (
                    <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 font-semibold text-[11px]">
                      {row.focusArea || 'Skill Development'}
                    </span>
                  )
                }
              ]}
              onInspect={(row) => setInspectedRecord({ data: row, moduleKey: 'ngo_partners' })}
              onStatusChange={(id, status) => handleUpdateRecordStatus(id, status, '')}
              canDelete={isSuperAdmin}
              onDelete={handleDeleteRecord}
            />
          )}

          {/* MODULE 13: HOPENEST FOUNDATION (SEC 8) */}
          {activeModule === 'hopenest_management' && (
            <div className="space-y-6">
              {/* HopeNest Header Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg border border-teal-800/40">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-5 h-5 text-teal-400" />
                    <h2 className="text-lg font-heading font-bold text-white">
                      HopeNest Global Foundation Console
                    </h2>
                  </div>
                  <p className="text-xs text-teal-200/80 max-w-xl">
                    Dedicated administration for HopeNest Global Foundation (Section 8 Company). Completely distinct legal entity and records management.
                  </p>
                </div>

                {/* Sub-tab Switcher */}
                <div className="flex items-center gap-1 bg-teal-950/80 p-1 rounded-xl border border-teal-800 text-xs self-start sm:self-auto">
                  <button
                    onClick={() => setHopeNestSubTab('volunteers')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                      hopeNestSubTab === 'volunteers'
                        ? 'bg-teal-500 text-white shadow-xs'
                        : 'text-teal-200 hover:text-white'
                    }`}
                  >
                    Volunteers ({hopenestVolunteers.length})
                  </button>
                  <button
                    onClick={() => setHopeNestSubTab('donations')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                      hopeNestSubTab === 'donations'
                        ? 'bg-teal-500 text-white shadow-xs'
                        : 'text-teal-200 hover:text-white'
                    }`}
                  >
                    Donations ({hopenestDonations.length})
                  </button>
                  <button
                    onClick={() => setHopeNestSubTab('participants')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                      hopeNestSubTab === 'participants'
                        ? 'bg-teal-500 text-white shadow-xs'
                        : 'text-teal-200 hover:text-white'
                    }`}
                  >
                    Participants ({hopenestParticipants.length})
                  </button>
                  <button
                    onClick={() => setHopeNestSubTab('updates')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                      hopeNestSubTab === 'updates'
                        ? 'bg-teal-500 text-white shadow-xs'
                        : 'text-teal-200 hover:text-white'
                    }`}
                  >
                    News ({hopenestUpdates.length})
                  </button>
                </div>
              </div>

              {/* Sub-view: Volunteers */}
              {hopeNestSubTab === 'volunteers' && (
                <AdminDataTable<HopeNestVolunteer>
                  title="HopeNest Registered Volunteers"
                  description="Community members and professionals registered for social service initiatives."
                  data={hopenestVolunteers}
                  exportFileName="hopenest_volunteers.csv"
                  columns={[
                    {
                      header: 'Volunteer',
                      accessor: (row) => (
                        <div>
                          <div className="font-bold text-slate-900">{row.fullName}</div>
                          <div className="text-[11px] text-slate-500">{row.location || 'India'}</div>
                        </div>
                      )
                    },
                    {
                      header: 'Preferred Domain',
                      accessor: (row) => (
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 font-semibold text-[11px]">
                          {row.areaOfInterest || 'Community Education'}
                        </span>
                      )
                    },
                    {
                      header: 'Contact',
                      accessor: (row) => (
                        <div className="font-mono text-[11px]">
                          <div>{row.emailAddress}</div>
                          <div className="text-slate-400">{row.mobileNumber || '—'}</div>
                        </div>
                      )
                    }
                  ]}
                  onInspect={(row) => setInspectedRecord({ data: row, moduleKey: 'hopenest_management' })}
                  onStatusChange={(id, status) => handleUpdateRecordStatus(id, status, '')}
                  canDelete={isSuperAdmin}
                  onDelete={handleDeleteRecord}
                />
              )}

              {/* Sub-view: Donations */}
              {hopeNestSubTab === 'donations' && (
                <AdminDataTable<HopeNestDonationEnquiry>
                  title="Philanthropic &amp; Foundation Support Enquiries"
                  description="Philanthropic contributions and institutional foundation support queries."
                  data={hopenestDonations}
                  exportFileName="hopenest_donations.csv"
                  columns={[
                    {
                      header: 'Donor / Org',
                      accessor: (row) => (
                        <div>
                          <div className="font-bold text-slate-900">{row.fullName}</div>
                          <div className="text-[11px] text-slate-500">{row.organizationName || 'Individual'}</div>
                        </div>
                      )
                    },
                    {
                      header: 'Purpose / Support',
                      accessor: (row) => (
                        <span className="font-semibold text-slate-800">{row.supportType}</span>
                      )
                    },
                    {
                      header: 'Contact',
                      accessor: (row) => (
                        <div className="font-mono text-[11px]">
                          <div>{row.emailAddress}</div>
                          <div className="text-slate-400">{row.mobileNumber || '—'}</div>
                        </div>
                      )
                    }
                  ]}
                  onInspect={(row) => setInspectedRecord({ data: row, moduleKey: 'hopenest_management' })}
                  onStatusChange={(id, status) => handleUpdateRecordStatus(id, status, '')}
                  canDelete={isSuperAdmin}
                  onDelete={handleDeleteRecord}
                />
              )}

              {/* Sub-view: Participants */}
              {hopeNestSubTab === 'participants' && (
                <AdminDataTable<HopeNestParticipant>
                  title="Programme Participants"
                  description="Students and community members enrolled in HopeNest charitable initiatives."
                  data={hopenestParticipants}
                  exportFileName="hopenest_participants.csv"
                  columns={[
                    {
                      header: 'Participant',
                      accessor: (row) => (
                        <div>
                          <div className="font-bold text-slate-900">{row.fullName}</div>
                          <div className="text-[11px] text-slate-500">{row.city}</div>
                        </div>
                      )
                    },
                    {
                      header: 'Programme',
                      accessor: (row) => (
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 font-semibold text-[11px]">
                          {row.programmeInterested}
                        </span>
                      )
                    },
                    {
                      header: 'Contact',
                      accessor: (row) => (
                        <div className="font-mono text-[11px]">
                          <div>{row.emailAddress || row.mobileNumber || '—'}</div>
                        </div>
                      )
                    }
                  ]}
                  onInspect={(row) => setInspectedRecord({ data: row, moduleKey: 'hopenest_management' })}
                  onStatusChange={(id, status) => handleUpdateRecordStatus(id, status, '')}
                  canDelete={isSuperAdmin}
                  onDelete={handleDeleteRecord}
                />
              )}

              {/* Sub-view: Updates */}
              {hopeNestSubTab === 'updates' && (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="font-heading font-bold text-slate-900 text-base">
                        HopeNest Activities & Field Reports
                      </h3>
                      <p className="text-xs text-slate-500">
                        Official community reports displayed on the public HopeNest portal
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hopenestUpdates.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px]">
                            {item.category}
                          </span>
                          <span className="text-slate-400 text-[11px]">{item.date}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                        <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODULE 14: COURSE MANAGEMENT */}
          {activeModule === 'courses' && (
            <div className="space-y-6">
              {/* Header & Sub-Navigation Tabs */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-heading font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span>Education Catalog & Marketplace Management</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Central curriculum administration for 15,500+ marketplace courses, corporate training videos, foundation tuition, and official brochures.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                  <button
                    onClick={() => setCoursesActiveTab('marketplace')}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                      coursesActiveTab === 'marketplace'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Course Marketplace</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] tabular-nums ${
                      coursesActiveTab === 'marketplace' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {mpTotalAvailable !== null ? mpTotalAvailable.toLocaleString() : '...'}
                    </span>
                  </button>

                  <button
                    onClick={() => setCoursesActiveTab('foundation')}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                      coursesActiveTab === 'foundation'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Foundation Tuition</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      coursesActiveTab === 'foundation' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {courses.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setCoursesActiveTab('brochures')}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                      coursesActiveTab === 'brochures'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Official Brochures & Plans</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      coursesActiveTab === 'brochures' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {OFFICIAL_BROCHURES.length}
                    </span>
                  </button>
                </div>
              </div>

              {/* SUBTAB 1: SCALABLE COURSE MARKETPLACE MANAGER */}
              {coursesActiveTab === 'marketplace' && (
                <AdminCourseMarketplaceManager
                  adminEmail={currentUser?.email || 'admin@openframeitsolutions.com'}
                  adminUid={currentUser?.uid || 'admin'}
                  onOpenMigrationModal={() => setIsMigrationModalOpen(true)}
                  onNotify={(msg) => showToast(msg)}
                  onLogActivity={async (action, coll, recId, details) => {
                    await logActivity(action, coll, recId, details);
                    refreshMarketplaceCount();
                  }}
                />
              )}

              {/* SUBTAB 2: FOUNDATION & TUITION PROGRAMMES */}
              {coursesActiveTab === 'foundation' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        Foundation Academic & Skill Development Courses
                      </h3>
                      <p className="text-xs text-slate-500">
                        Structured hybrid coaching and foundational training programmes ({courses.length} courses).
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingCourse({
                          id: `course-${Date.now()}`,
                          name: '',
                          duration: '3 Months',
                          category: 'Technology',
                          level: 'Intermediate',
                          shortDesc: '',
                          fee: 'Contact for Fee Structure',
                          highlights: ['Industry Curriculum', 'Practical Lab Access'],
                          curriculumOutline: ['Module 1', 'Module 2'],
                          learningMode: 'Hybrid',
                          certificationNote: 'Certificate upon course completion'
                        });
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Foundation Course</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                            {course.category}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">{course.duration}</span>
                        </div>

                        <h3 className="font-bold text-slate-900 text-base">{course.name}</h3>
                        <p className="text-xs text-slate-600 line-clamp-3">{course.shortDesc}</p>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-400">Mode: {course.learningMode}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingCourse(course)}
                              className="text-blue-600 hover:text-blue-700 font-semibold"
                            >
                              Edit
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              onClick={() => {
                                setConfirmAction({
                                  title: 'Delete Foundation Course',
                                  message: `Delete "${course.name}" from the foundation curriculum list?`,
                                  confirmLabel: 'Delete Course',
                                  onConfirm: () => {
                                    const updated = courses.filter((c) => c.id !== course.id);
                                    storageService.saveEducationCourses(updated);
                                    setCourses(updated);
                                    showToast('Course removed');
                                  },
                                });
                              }}
                              className="text-rose-600 hover:text-rose-700 font-semibold"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBTAB 3: OFFICIAL BROCHURES & PRICING PLANS */}
              {coursesActiveTab === 'brochures' && (
                <div className="space-y-6">
                  {/* Official Brochures Overview */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        Official Education Brochures & Publication Documents
                      </h3>
                      <p className="text-xs text-slate-500">
                        Publicly accessible brochure documents linked to the Education section.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {OFFICIAL_BROCHURES.map((b) => (
                        <div key={b.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                          <FileText className="w-8 h-8 text-blue-600 shrink-0 mt-1" />
                          <div className="space-y-1 text-left flex-1">
                            <div className="font-bold text-slate-900 text-xs">{b.title}</div>
                            <div className="text-[11px] text-slate-500">{b.pageCount} Pages • {b.fileSize} • {b.publicationYear}</div>
                            <div className="pt-2 flex items-center gap-3 text-xs">
                              <a
                                href={b.pdfUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Preview</span>
                              </a>
                              <a
                                href={b.pdfUrl}
                                download
                                className="text-slate-600 hover:underline font-medium"
                              >
                                Download
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Official Pricing Plans Overview */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        Official Course & Tuition Pricing Schedule (Active)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Sourced directly from the 2026–27 Pricing Catalogue and Corporate Brochure.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {OFFICIAL_PRICING_PLANS.slice(0, 6).map((plan) => (
                        <div key={plan.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {plan.badge || plan.category}
                            </span>
                            <span className="font-bold text-slate-900 text-xs">{plan.price}</span>
                          </div>
                          <div className="font-semibold text-slate-800 text-xs">{plan.title}</div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">{plan.sourceDocument}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* COURSE APPROVAL & CERTIFICATION WORKFLOW MODULE */}
          {activeModule === 'course_approvals' && (
            <AdminCourseApprovalPanel
              adminEmail={currentUser?.email || 'admin@openframeitsolutions.com'}
              onNotify={showToast}
              onLogActivity={async (action, coll, recId, details) => {
                await logActivity(action, coll, recId, details);
                await refreshMarketplaceCount();
              }}
              onQueueUpdated={(pendingTotal) => setPendingCourseApprovalsCount(pendingTotal)}
            />
          )}

          {/* QUINN AI & LMS MANAGEMENT MODULE */}
          {activeModule === 'lms_management' && (
            <AdminLmsControlPanel onNotify={showToast} />
          )}

          {/* SCHOOL EDUCATION LKG-12 MANAGEMENT MODULE */}
          {activeModule === 'school_management' && (
            <AdminSchoolManagement />
          )}

          {/* CORPORATE MANAGEMENT & EMPLOYEE SKILL DEVELOPMENT LIBRARY */}
          {activeModule === 'corporate_training' && (
            <AdminCorporateTrainingLibrary
              adminEmail={currentUser?.email || 'admin@openframeitsolutions.com'}
              adminUid={currentUser?.uid || 'admin'}
              onCoursesMutated={async () => {
                await refreshMarketplaceCount();
              }}
              onNotify={(msg) => showToast(msg)}
              onLogActivity={async (action, coll, recId, details) => {
                await logActivity(action, coll, recId, details);
                await refreshMarketplaceCount();
              }}
            />
          )}

          {/* MODULE 15: PRODUCT MANAGEMENT */}
          {activeModule === 'products' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-heading font-bold text-slate-900">
                    Digital Software Products Portfolio
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage proprietary OpenFrame software solutions displayed on the public product catalogue.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingProduct({
                      id: `prod-${Date.now()}`,
                      slug: '',
                      name: '',
                      tagline: '',
                      shortDesc: '',
                      description: '',
                      problemSolved: 'Enterprise workflow management',
                      keyFeatures: ['Multi-tenant Architecture', 'Real-time Analytics'],
                      benefits: ['High scalability', 'Zero deployment friction'],
                      howItWorks: [{ step: 1, title: 'Setup', description: 'Configure workspace' }],
                      targetUsers: ['Corporate Teams'],
                      intendedUsers: 'Enterprises',
                      faqs: [],
                      category: 'Enterprise Software',
                      status: 'Available',
                      iconName: 'Package'
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                        {product.category}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {product.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{product.name}</h3>
                      <p className="text-xs text-blue-600 font-medium">{product.tagline}</p>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">{product.description}</p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{product.slug}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="text-blue-600 hover:underline font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setConfirmAction({
                              title: 'Delete Digital Product',
                              message: `Delete "${product.name}" from the digital software products catalog?`,
                              confirmLabel: 'Delete Product',
                              onConfirm: () => {
                                storageService.deleteProduct(product.id);
                                setProducts(storageService.getProducts());
                                showToast('Product removed');
                              },
                            });
                          }}
                          className="text-rose-600 hover:underline font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 16: BLOG MANAGEMENT */}
          {activeModule === 'blog' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-heading font-bold text-slate-900">
                    Blog, News &amp; Knowledge Centre Articles
                  </h2>
                  <p className="text-xs text-slate-500">
                    Create, edit, publish, and schedule articles for the corporate knowledge base.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingPost({
                      id: `post-${Date.now()}`,
                      title: '',
                      slug: '',
                      category: 'Technology',
                      excerpt: '',
                      author: 'OpenFrame Technical Advisory',
                      authorRole: 'Engineering Team',
                      readTime: '5 min read',
                      tags: ['Technology', 'Software Development'],
                      content: [''],
                      status: 'Published',
                      featuredImageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
                      isFeatured: false,
                      isPopular: false
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Article</span>
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <th className="py-3.5 px-4">Article</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Author</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {blogPosts.map((post) => (
                        <tr key={post.id} className="hover:bg-slate-50/50">
                          <td className="py-3.5 px-4 font-bold text-slate-900 max-w-sm">
                            <div className="truncate">{post.title}</div>
                            <div className="text-[10px] font-normal text-slate-400 font-mono">
                              /blog/{post.slug}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[10px]">
                              {post.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">{post.author}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                post.status === 'Published'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {post.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => setEditingPost(post)}
                                className="text-blue-600 hover:underline font-semibold"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteBlogPost(post.id)}
                                className="text-rose-600 hover:underline font-semibold"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 17: WEBSITE ANNOUNCEMENTS */}
          {activeModule === 'announcements' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-3xl space-y-6">
              <div>
                <h2 className="text-lg font-heading font-bold text-slate-900">
                  Website Announcements &amp; Alert Banners
                </h2>
                <p className="text-xs text-slate-500">
                  Control the persistent top notification ticker broadcast across all public website pages.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <input
                    type="checkbox"
                    id="showAnnouncementBanner"
                    checked={siteSettings.showAnnouncement}
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, showAnnouncement: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500"
                  />
                  <label htmlFor="showAnnouncementBanner" className="text-xs font-bold text-slate-800">
                    Enable Top Header Announcement Strip
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Broadcast Announcement Text
                  </label>
                  <input
                    type="text"
                    value={siteSettings.announcementText}
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, announcementText: e.target.value })
                    }
                    placeholder="e.g. HopeNest Foundation Rural Tech Drive 2026 is now live..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-blue-500/20"
                >
                  Save Announcement Settings
                </button>
              </form>
            </div>
          )}

          {/* MODULE 18: BRANCH MANAGEMENT */}
          {activeModule === 'branches' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-heading font-bold text-slate-900">
                    Branch Locations &amp; Regional Offices
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage corporate headquarters, regional offices, and training centres shown at /branches.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingBranch({
                      id: `branch-${Date.now()}`,
                      name: '',
                      fullAddress: '',
                      city: '',
                      state: '',
                      contactNumber: '',
                      email: '',
                      officeHours: 'Monday - Saturday: 9:30 AM - 6:30 PM',
                      isHeadquarters: false,
                      isActive: true
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Branch</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {branches.map((branch) => (
                  <div
                    key={branch.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                        {branch.city}, {branch.state}
                      </span>
                      {branch.isHeadquarters && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">
                          Headquarters
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">{branch.name}</h3>
                    <p className="text-xs text-slate-600">{branch.fullAddress}</p>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{branch.email}</span>
                      <span className="text-slate-300">&bull;</span>
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{branch.contactNumber}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400">{branch.officeHours}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingBranch(branch)}
                          className="text-blue-600 hover:underline font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setConfirmAction({
                              title: 'Delete Branch Location',
                              message: `Delete "${branch.name}" from branch locations?`,
                              confirmLabel: 'Delete Branch',
                              onConfirm: () => {
                                storageService.deleteBranch(branch.id);
                                setBranches(storageService.getBranches());
                                showToast('Branch removed');
                              },
                            });
                          }}
                          className="text-rose-600 hover:underline font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 19: NEWSLETTER SUBSCRIBERS */}
          {activeModule === 'subscribers' && (
            <AdminDataTable<NewsletterSubscriber>
              title="Newsletter &amp; Knowledge Centre Subscribers"
              description="Subscribers enrolled in OpenFrame technical bulletins and company updates."
              data={subscribers}
              exportFileName="newsletter_subscribers.csv"
              columns={[
                {
                  header: 'Subscriber Email',
                  accessor: (row) => (
                    <div className="font-mono font-semibold text-slate-900">{row.emailAddress}</div>
                  )
                },
                {
                  header: 'Full Name',
                  accessor: (row) => (
                    <span className="text-slate-700 font-medium">{row.fullName || 'Subscriber'}</span>
                  )
                },
                {
                  header: 'Source / Location',
                  accessor: (row) => (
                    <span className="text-slate-600">{row.source || 'Website Footer'}</span>
                  )
                }
              ]}
              onInspect={(row) => setInspectedRecord({ data: row, moduleKey: 'subscribers' })}
              canDelete={isSuperAdmin}
              onDelete={(id) => {
                storageService.deleteNewsletterSubscriber(id);
                setSubscribers(storageService.getNewsletterSubscribers());
                showToast('Subscriber removed');
              }}
            />
          )}

          {activeModule === 'corporate_documents' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-heading font-bold text-slate-900">
                    Official Corporate Documents Repository
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage approved corporate profiles, capability catalogues, and statutory compliance status.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to="/documents"
                    target="_blank"
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Public Repository</span>
                  </Link>
                </div>
              </div>

              <AdminDataTable<CorporateDocument>
                title="Corporate Documents &amp; Statutory Dossiers"
                description="Public documents must meet corporate disclosure standards with zero confidential data exposed."
                data={corporateDocuments}
                exportFileName="corporate_documents.csv"
                columns={[
                  {
                    header: 'Document Name & Category',
                    accessor: (row) => (
                      <div>
                        <div className="font-heading font-bold text-slate-900">{row.title}</div>
                        <div className="text-[11px] text-blue-600 font-medium">{row.category}</div>
                      </div>
                    )
                  },
                  {
                    header: 'Version & Format',
                    accessor: (row) => (
                      <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {row.version} ({row.fileFormat})
                      </span>
                    )
                  },
                  {
                    header: 'Document Status',
                    accessor: (row) => (
                      <span className="text-xs text-slate-600 font-medium">{row.status}</span>
                    )
                  },
                  {
                    header: 'Public Status',
                    accessor: (row) => (
                      <button
                        type="button"
                        onClick={() => {
                          storageService.toggleCorporateDocumentPublic(row.id);
                          setCorporateDocuments(storageService.getCorporateDocuments());
                          showToast(`Document visibility updated`);
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          row.isPublic
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        {row.isPublic ? '✓ Approved for Public' : '⏳ Verification Pending'}
                      </button>
                    )
                  },
                  {
                    header: 'Approved Date',
                    accessor: (row) => (
                      <span className="text-xs text-slate-500">{row.approvedDate}</span>
                    )
                  }
                ]}
                onInspect={(row) => setInspectedRecord({ data: row, moduleKey: 'corporate_documents' })}
                canDelete={isSuperAdmin}
                onDelete={(id) => {
                  storageService.deleteCorporateDocument(id);
                  setCorporateDocuments(storageService.getCorporateDocuments());
                  showToast('Document removed from repository');
                }}
              />
            </div>
          )}

          {/* MODULE 20: ADMIN USER MANAGEMENT (RBAC) */}
          {activeModule === 'admin_users' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-heading font-bold text-slate-900">
                      Authorised Administrative Accounts &amp; RBAC Roles
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold uppercase">
                      Super Admin Authority
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Assign and regulate departmental security clearance. Role updates take immediate effect across Cloud Firestore rules.
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search admins..."
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    className="w-56 pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Security Advisory Notice */}
              <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 text-xs text-purple-900 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Enterprise Role Enforcement:</span> Super Admins have unrestricted system access. HR Admins are confined to the Applicant Tracking System. Sales Admins manage corporate proposals. Education Admins manage course cohorts. HopeNest Admins manage foundation operations. Content Admins curate articles and products.
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Administrator</th>
                      <th className="py-3 px-4">Clearance Role</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4">Enrolled At</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminUsers
                      .filter((u) => {
                        const q = adminSearch.toLowerCase();
                        return (
                          u.email.toLowerCase().includes(q) ||
                          u.displayName.toLowerCase().includes(q) ||
                          u.role.toLowerCase().includes(q)
                        );
                      })
                      .map((u) => (
                        <tr key={u.uid} className="hover:bg-slate-50/50">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{u.displayName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={u.role}
                              disabled={!isSuperAdmin && effectiveRole !== 'Super Admin'}
                              onChange={(e) => handleRoleChange(u.uid, e.target.value as AdminRole)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-purple-500 disabled:opacity-75 disabled:cursor-not-allowed"
                            >
                              <option value="Super Admin">Super Admin</option>
                              <option value="HR Admin">HR Admin</option>
                              <option value="Sales Admin">Sales Admin</option>
                              <option value="Education Admin">Education Admin</option>
                              <option value="HopeNest Admin">HopeNest Admin</option>
                              <option value="Content Admin">Content Admin</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                u.isActive
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  u.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}
                              />
                              <span>{u.isActive ? 'Active' : 'Suspended'}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleToggleAdminStatus(u.uid, u.isActive)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                                u.isActive
                                  ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                                  : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              {u.isActive ? 'Suspend Access' : 'Reactivate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MODULE 21: ACTIVITY LOGS */}
          {activeModule === 'activity_logs' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-heading font-bold text-slate-900">
                    Administrative Action &amp; Audit Trail
                  </h2>
                  <p className="text-xs text-slate-500">
                    Immutable security log documenting administrative modifications and intake activity.
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="w-56 pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">Action</th>
                      <th className="py-3.5 px-4">Admin Email</th>
                      <th className="py-3.5 px-4">Collection</th>
                      <th className="py-3.5 px-4">Details</th>
                      <th className="py-3.5 px-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activityLogs
                      .filter((l) => {
                        const q = logSearch.toLowerCase();
                        return (
                          l.action.toLowerCase().includes(q) ||
                          l.adminEmail.toLowerCase().includes(q) ||
                          (l.details || '').toLowerCase().includes(q)
                        );
                      })
                      .map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50">
                          <td className="py-3.5 px-4 font-bold text-slate-900">{log.action}</td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">{log.adminEmail}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono text-[10px] text-slate-700">
                              {log.collection}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 max-w-sm truncate">{log.details || '—'}</td>
                          <td className="py-3.5 px-4 text-right text-slate-400 whitespace-nowrap text-[11px]">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MODULE 22: WEBSITE SETTINGS */}
          {activeModule === 'settings' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-3xl space-y-6">
              <div>
                <h2 className="text-lg font-heading font-bold text-slate-900">
                  Global Website Settings &amp; Metadata
                </h2>
                <p className="text-xs text-slate-500">
                  Configure primary corporate contact emails, emergency phone lines, and console options.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Corporate Business Email
                    </label>
                    <input
                      type="email"
                      value={siteSettings.contactEmail}
                      onChange={(e) =>
                        setSiteSettings({ ...siteSettings, contactEmail: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Support Contact Phone
                    </label>
                    <input
                      type="text"
                      value={siteSettings.supportPhone}
                      onChange={(e) =>
                        setSiteSettings({ ...siteSettings, supportPhone: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-blue-500/20"
                  >
                    Save Global Settings
                  </button>
                </div>
              </form>

              {(isSuperAdmin || effectiveRole === 'Super Admin' || effectiveRole === 'Education Admin') && (
                <div className="pt-6 border-t border-slate-100">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#123D32] text-white flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Course Approval &amp; Certification Queue
                        </h3>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Review completed student courses and manually approve them to issue official QR-verified OpenFrame certificates.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveModule('course_approvals')}
                      className="px-4 py-2.5 rounded-xl bg-[#123D32] hover:bg-[#0D2E25] text-white font-bold text-xs whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                    >
                      Open Course Approvals &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODULE 23: SUPER ADMIN PAYMENT GATEWAY (RAZORPAY) */}
          {activeModule === 'payment_settings' && (
            <PaymentSettings
              isSuperAdmin={isSuperAdmin || effectiveRole === 'Super Admin'}
              showToast={showToast}
            />
          )}
      </div>

      {/* Record Detail Modal */}
      {inspectedRecord && (
        <RecordDetailModal
          isOpen={Boolean(inspectedRecord)}
          onClose={() => setInspectedRecord(null)}
          record={inspectedRecord.data}
          moduleKey={inspectedRecord.moduleKey}
          onUpdateStatus={handleUpdateRecordStatus}
          onDeleteRecord={handleDeleteRecord}
          role={effectiveRole}
          isSuperAdmin={isSuperAdmin || effectiveRole === 'Super Admin'}
        />
      )}

      {/* Blog Article Editor Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingPost.id ? 'Edit Article' : 'Create Article'}
              </h3>
              <button
                onClick={() => setEditingPost(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                &times;
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Article Title
                </label>
                <input
                  type="text"
                  value={editingPost.title || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  placeholder="e.g. Navigating Enterprise Digital Transformation in 2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editingPost.category || 'Technology'}
                    onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {[
                      'Technology',
                      'Software Development',
                      'Artificial Intelligence',
                      'Digital Transformation',
                      'Education',
                      'Skill Development',
                      'Career Guidance',
                      'Entrepreneurship',
                      'Company News',
                      'HopeNest Foundation Updates'
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    value={editingPost.author || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, author: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Excerpt / Short Summary
                </label>
                <textarea
                  rows={2}
                  value={editingPost.excerpt || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Featured Image URL
                </label>
                <input
                  type="text"
                  value={editingPost.featuredImageUrl || ''}
                  onChange={(e) =>
                    setEditingPost({ ...editingPost, featuredImageUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Main Content (Paragraphs)
                </label>
                <textarea
                  rows={6}
                  value={(editingPost.content || []).join('\n\n')}
                  onChange={(e) =>
                    setEditingPost({ ...editingPost, content: e.target.value.split('\n\n') })
                  }
                  placeholder="Enter full article content..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setEditingPost(null)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveBlogPost('Draft')}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 font-semibold"
              >
                Save Draft
              </button>
              <button
                onClick={() => handleSaveBlogPost('Published')}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20"
              >
                Publish Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Editor Modal */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-base">
              {editingCourse.name ? 'Edit Course / Programme' : 'Add New Course'}
            </h3>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Course Name *</label>
              <input
                type="text"
                required
                value={editingCourse.name || ''}
                onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                placeholder="e.g. Full-Stack Web Development"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Domain</label>
                <select
                  value={editingCourse.category || 'Technology'}
                  onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="Academic">Academic</option>
                  <option value="Technology">Technology</option>
                  <option value="Professional">Professional</option>
                  <option value="Creative">Creative</option>
                  <option value="Intelligence">Intelligence</option>
                  <option value="Business">Business</option>
                  <option value="STEM">STEM</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Duration</label>
                <input
                  type="text"
                  value={editingCourse.duration || '8 Weeks'}
                  onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Fee</label>
                <input
                  type="text"
                  value={editingCourse.fee || '₹1,200'}
                  onChange={(e) => setEditingCourse({ ...editingCourse, fee: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Learning Mode</label>
                <input
                  type="text"
                  value={editingCourse.learningMode || 'Live Online Classes'}
                  onChange={(e) => setEditingCourse({ ...editingCourse, learningMode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Short Description</label>
              <textarea
                rows={2}
                value={editingCourse.shortDesc || ''}
                onChange={(e) => setEditingCourse({ ...editingCourse, shortDesc: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                placeholder="Brief summary of syllabus..."
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingCourse(null)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCourse}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20"
              >
                Save Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Editor Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-base">
              {editingProduct.id ? 'Edit Digital Product' : 'Add New Product'}
            </h3>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Product Name</label>
              <input
                type="text"
                value={editingProduct.name || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tagline</label>
              <input
                type="text"
                value={editingProduct.tagline || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={editingProduct.description || ''}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, description: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProduct}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20"
              >
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Branch Editor Modal */}
      {editingBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-base">
              {editingBranch.id ? 'Edit Branch' : 'Add New Branch'}
            </h3>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Branch Name</label>
              <input
                type="text"
                value={editingBranch.name || ''}
                onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Address</label>
              <textarea
                rows={2}
                value={editingBranch.fullAddress || ''}
                onChange={(e) => setEditingBranch({ ...editingBranch, fullAddress: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={editingBranch.contactNumber || ''}
                  onChange={(e) => setEditingBranch({ ...editingBranch, contactNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingBranch.email || ''}
                  onChange={(e) => setEditingBranch({ ...editingBranch, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingBranch(null)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBranch}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20"
              >
                Save Branch
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 15,000-Course Firestore Data Migration Modal */}
      <CourseMigrationModal
        isOpen={isMigrationModalOpen}
        onClose={() => setIsMigrationModalOpen(false)}
        onMigrationComplete={() => refreshMarketplaceCount()}
      />

      {/* Admin Delete Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-base">{confirmAction.title}</h3>
            <p className="text-slate-600 leading-relaxed">{confirmAction.message}</p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const fn = confirmAction.onConfirm;
                  setConfirmAction(null);
                  fn();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer"
              >
                {confirmAction.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
        </main>
      </div>
    </div>
  );
};
