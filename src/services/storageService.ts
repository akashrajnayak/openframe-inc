import {
  BlogPost,
  CareerOpening,
  InquirySubmission,
  JobApplication,
  InternshipApplication,
  ProfessionalRegistration,
  SchoolPartnerEnquiry,
  NgoPartnerEnquiry,
  GeneralWorkEnquiry,
  SiteSettings,
  SoftwareQuotationEnquiry,
  EducationCourse,
  StudentRegistration,
  TeacherRegistration,
  DigitalProduct,
  ProductEnquiry,
  HopeNestProgram,
  HopeNestUpdate,
  HopeNestVolunteer,
  HopeNestDonationEnquiry,
  HopeNestParticipant,
  ContactMessage,
  GeneralEnquiry,
  SoftwareEnquiryItem,
  BusinessEnquiry,
  BranchLocation,
  NewsletterSubscriber,
  CorporateDocument,
} from '../types';
import {
  initialBlogPosts,
  initialCareerOpenings,
  initialSiteSettings,
  initialEducationCourses,
  initialProducts,
  initialHopeNestPrograms,
  initialHopeNestUpdates,
} from '../data/initialData';

const STORAGE_KEYS = {
  INQUIRIES: 'openframe_inquiries_v1',
  SOFTWARE_ENQUIRIES: 'openframe_software_enquiries_v1',
  BLOG_POSTS: 'blog_posts',
  CAREERS: 'openframe_careers_v1',
  APPLICATIONS: 'openframe_applications_v2',
  INTERNSHIPS: 'openframe_internships_v1',
  PROFESSIONALS: 'openframe_professionals_v1',
  SCHOOL_PARTNERS: 'openframe_school_partners_v1',
  NGO_PARTNERS: 'openframe_ngo_partners_v1',
  GENERAL_WORK: 'openframe_general_work_v1',
  SITE_SETTINGS: 'openframe_settings_v1',
  ADMIN_SESSION: 'openframe_admin_auth_v1',
  EDUCATION_COURSES: 'openframe_courses_v1',
  STUDENT_REGISTRATIONS: 'openframe_students_v1',
  TEACHER_REGISTRATIONS: 'openframe_teachers_v1',
  PRODUCTS: 'openframe_products_v1',
  PRODUCT_ENQUIRIES: 'openframe_product_enquiries_v1',
  HOPENEST_PROGRAMS: 'hopenest_programs_v1',
  HOPENEST_UPDATES: 'hopenest_updates_v1',
  HOPENEST_VOLUNTEERS: 'hopenest_volunteers',
  HOPENEST_DONATION_ENQUIRIES: 'hopenest_donation_enquiries',
  HOPENEST_PARTICIPANTS: 'hopenest_participants',
  CONTACT_MESSAGES: 'openframe_contact_messages_v1',
  GENERAL_ENQUIRIES: 'openframe_general_enquiries_v1',
  DEDICATED_SOFTWARE_ENQUIRIES: 'openframe_dedicated_software_enquiries_v1',
  BUSINESS_ENQUIRIES: 'openframe_business_enquiries_v1',
  BRANCHES: 'openframe_branches_v1',
  NEWSLETTER_SUBSCRIBERS: 'openframe_newsletter_subscribers_v1',
  CORPORATE_DOCUMENTS: 'openframe_corporate_documents_v1',
};

// Seed initial job applications
const initialJobApplications: JobApplication[] = [
  {
    id: 'app-201',
    jobId: 'job-1',
    jobTitle: 'Senior Full-Stack Engineer (TypeScript / Node.js / React)',
    fullName: 'Siddharth Menon',
    email: 'siddharth.menon@outlook.in',
    phone: '+91 98450 67123',
    currentLocation: 'Bengaluru, Karnataka',
    qualification: 'B.Tech in Computer Science & Engineering',
    experience: '5 Years',
    skills: 'TypeScript, React 18, Node.js, PostgreSQL, Docker, Redis',
    resumeName: 'Siddharth_Menon_CV_2026.pdf',
    resumeUrl: 'https://openframe.in/resumes/siddharth_menon.pdf',
    portfolioUrl: 'https://github.com/siddharth-menon-dev',
    coverNote: 'Experienced in scaling multi-tenant SaaS dashboards and building high-performance RESTful APIs. Excited about OpenFrame core software systems.',
    consentAccepted: true,
    submittedAt: '2026-11-04T09:30:00.000Z',
    status: 'Shortlisted',
    internalNotes: 'Cleared technical screening test. Deep familiarity with TypeScript architecture and relational query optimization.'
  },
  {
    id: 'app-202',
    jobId: 'job-2',
    jobTitle: 'Cloud Infrastructure & DevOps Engineer',
    fullName: 'Deepa R. Nair',
    email: 'deepa.nair.devops@gmail.com',
    phone: '+91 97410 44892',
    currentLocation: 'Hyderabad, Telangana',
    qualification: 'M.Tech in Cloud & Distributed Systems',
    experience: '4 Years',
    skills: 'Kubernetes, Terraform, AWS, Docker, Prometheus, CI/CD',
    resumeName: 'Deepa_Nair_DevOps_Resume.pdf',
    resumeUrl: 'https://openframe.in/resumes/deepa_nair.pdf',
    portfolioUrl: 'https://linkedin.com/in/deepa-nair-devops',
    coverNote: 'Author of automated Terraform templates for VPC, EKS clusters, and zero-trust IAM governance. Seeking challenging cloud engineering role.',
    consentAccepted: true,
    submittedAt: '2026-11-03T14:15:00.000Z',
    status: 'Under Review',
    internalNotes: 'Profile matches multi-tenant infrastructure automation requirements.'
  }
];

// Seed initial internship applications
const initialInternshipApplications: InternshipApplication[] = [
  {
    id: 'intern-301',
    fullName: 'Rohan Deshmukh',
    mobileNumber: '+91 98801 23490',
    emailAddress: 'rohan.deshmukh2024@rvce.edu.in',
    collegeOrUniversity: 'RV College of Engineering',
    courseAndYear: 'B.E. Computer Science, 6th Semester (3rd Year)',
    preferredDomain: 'Web & Mobile Application Development',
    keySkills: 'React, TypeScript, Tailwind CSS, Next.js, Git',
    internshipDuration: '3 Months',
    currentLocation: 'Bengaluru, Karnataka',
    resumeName: 'Rohan_Deshmukh_Intern_CV.pdf',
    resumeUrl: 'https://openframe.in/resumes/rohan_deshmukh.pdf',
    portfolioOrGithub: 'https://github.com/rohandesh-code',
    statementOfInterest: 'Eager to contribute to production web components and learn enterprise code architecture alongside senior engineers.',
    consentAccepted: true,
    submittedAt: '2026-11-04T11:00:00.000Z',
    status: 'Shortlisted',
    internalNotes: 'High academic CGPA (9.1/10). Clean GitHub repository with modular component structure.'
  },
  {
    id: 'intern-302',
    fullName: 'Sneha Patil',
    mobileNumber: '+91 94812 66780',
    emailAddress: 'sneha.patil@pes.edu',
    collegeOrUniversity: 'PES University, Ring Road Campus',
    courseAndYear: 'BCA Final Year',
    preferredDomain: 'Python, AI & Machine Learning Fundamentals',
    keySkills: 'Python 3, Pandas, FastAPI, Scikit-learn, SQL',
    internshipDuration: '6 Months',
    currentLocation: 'Bengaluru, Karnataka',
    resumeName: 'Sneha_Patil_Resume.pdf',
    resumeUrl: 'https://openframe.in/resumes/sneha_patil.pdf',
    portfolioOrGithub: 'https://github.com/sneha-patil-ai',
    statementOfInterest: 'Passionate about educational technology tools and natural language processing pipelines like StudyNotePro.',
    consentAccepted: true,
    submittedAt: '2026-11-02T16:20:00.000Z',
    status: 'New',
    internalNotes: 'Candidate interested in education product algorithms.'
  }
];

// Seed initial professional registrations
const initialProfessionalRegistrations: ProfessionalRegistration[] = [
  {
    id: 'prof-401',
    fullName: 'Vikramaditya Rao',
    mobileNumber: '+91 98451 90901',
    emailAddress: 'vikram.rao.architect@gmail.com',
    primaryDomain: 'Enterprise Systems Architecture & Cloud Engineering',
    qualification: 'M.S. in Software Systems (BITS Pilani)',
    experienceYears: '11 Years',
    keySkills: 'Distributed Systems, Microservices Architecture, Event Sourcing, Node.js, Go, PostgreSQL',
    portfolioOrLinkedIn: 'https://linkedin.com/in/vikramaditya-rao-arch',
    areaOfInterest: 'Consulting / Advisory',
    currentLocation: 'Bengaluru, Karnataka',
    resumeName: 'Vikram_Rao_Principal_Profile.pdf',
    resumeUrl: 'https://openframe.in/resumes/vikram_rao.pdf',
    message: 'Available 8-10 hours per week for architectural design reviews, tech diligence, and engineering leadership mentorship.',
    consentAccepted: true,
    submittedAt: '2026-11-04T08:00:00.000Z',
    status: 'Profile Evaluated',
    internalNotes: 'Consultant discussion scheduled for advisory engagement on CoreERP modules.'
  },
  {
    id: 'prof-402',
    fullName: 'Dr. Kavitha Balakrishnan',
    mobileNumber: '+91 94432 11990',
    emailAddress: 'kavitha.b@uniresearch.ac.in',
    primaryDomain: 'EdTech Curriculum Design & Pedagogical Engineering',
    qualification: 'Ph.D. in Computer Science & Pedagogical Systems',
    experienceYears: '9 Years',
    keySkills: 'STEM Pedagogy, AI Curriculum Frameworks, Python, NEP 2020 Guidelines',
    portfolioOrLinkedIn: 'https://linkedin.com/in/dr-kavitha-balakrishnan',
    areaOfInterest: 'Guest Lecturing / Mentorship',
    currentLocation: 'Mysuru, Karnataka',
    resumeName: 'Dr_Kavitha_Curriculum_Profile.pdf',
    resumeUrl: 'https://openframe.in/resumes/dr_kavitha.pdf',
    message: 'Interested in mentoring students and reviewing OpenFrame Education course syllabi for university accreditation.',
    consentAccepted: true,
    submittedAt: '2026-11-01T15:30:00.000Z',
    status: 'Meeting Scheduled',
    internalNotes: 'Meeting arranged with Academic Dean for course alignment.'
  }
];

// Seed initial school & institutional partnerships
const initialSchoolPartnerships: SchoolPartnerEnquiry[] = [
  {
    id: 'school-501',
    organizationName: 'St. Xavier Modern Academy',
    contactPerson: 'Sister Maria D’Souza',
    designation: 'Principal & Managing Director',
    mobileNumber: '+91 94480 33211',
    emailAddress: 'principal@stxaviermodern.edu.in',
    city: 'Bengaluru',
    state: 'Karnataka',
    institutionType: 'K-12 School',
    partnershipInterest: 'Computer Science & AI Curriculum + StudyNotePro Labs',
    studentStrength: '1,450 Students',
    message: 'We are planning to modernize our computer education from Class 5 upwards with practical coding, digital literacy, and classroom software.',
    consentAccepted: true,
    submittedAt: '2026-11-03T11:45:00.000Z',
    status: 'Proposal Sent',
    internalNotes: 'Detailed institutional proposal and live demo scheduled on Monday.'
  },
  {
    id: 'school-502',
    organizationName: 'Vidya Niketan Pre-University College',
    contactPerson: 'Prof. Ramesh Hegde',
    designation: 'Academic Director',
    mobileNumber: '+91 98441 55220',
    emailAddress: 'director@vidyaniketan-puc.ac.in',
    city: 'Hubballi',
    state: 'Karnataka',
    institutionType: 'Junior College / PUC',
    partnershipInterest: 'STEM & Robotics Lab Setup + Career Tech Guidance',
    studentStrength: '820 Students',
    message: 'Looking to set up an experiential STEM innovation lab for Class 11 and 12 science stream students.',
    consentAccepted: true,
    submittedAt: '2026-11-02T13:10:00.000Z',
    status: 'New',
    internalNotes: 'Brochure and lab hardware specifications sent via official email.'
  }
];

// Seed initial NGO partnerships
const initialNgoPartnerships: NgoPartnerEnquiry[] = [
  {
    id: 'ngo-601',
    organizationName: 'Pragati Rural Education & Welfare Trust',
    registrationNumber: 'KAR/TRUST/2018/8891',
    contactPerson: 'Anand Joshi',
    designation: 'Executive Trustee',
    mobileNumber: '+91 98802 77112',
    emailAddress: 'anand@pragatitrust.org',
    city: 'Raichur',
    state: 'Karnataka',
    focusArea: 'Rural Education & Digital Literacy',
    partnershipInterest: 'Joint Skill Training Workshops & Digital Kit Distribution',
    targetBeneficiaryCount: '1,200 rural youth annually',
    message: 'We run community learning centers across 12 villages. Seeking OpenFrame digital literacy curriculum and mentor support for school dropouts.',
    consentAccepted: true,
    submittedAt: '2026-11-04T14:30:00.000Z',
    status: 'In Discussion',
    internalNotes: 'Connecting with HopeNest coordinator to explore field synergy.'
  },
  {
    id: 'ngo-602',
    organizationName: 'Navajyoti Youth Empowerment Society',
    registrationNumber: 'NGO/BEL/2021/4502',
    contactPerson: 'Shobha Patil',
    designation: 'Program Director',
    mobileNumber: '+91 97400 88344',
    emailAddress: 'shobha.patil@navajyotiyouth.org',
    city: 'Belagavi',
    state: 'Karnataka',
    focusArea: 'Youth Skill Development & Livelihood',
    partnershipInterest: 'Community Training Collaboration & Computer Fundamentals Certification',
    targetBeneficiaryCount: '500 young adults',
    message: 'Seeking institutional technical training alliance for 8-week computer fundamentals and office automation courses for underprivileged youth.',
    consentAccepted: true,
    submittedAt: '2026-11-01T10:15:00.000Z',
    status: 'New',
    internalNotes: 'Concept note under evaluation by community alliances committee.'
  }
];

// Seed initial general work enquiries
const initialGeneralWorkEnquiries: GeneralWorkEnquiry[] = [
  {
    id: 'work-701',
    fullName: 'Harish V.',
    mobileNumber: '+91 98455 12098',
    emailAddress: 'harish.v.freelance@gmail.com',
    collaborationType: 'Freelance & Contract Tech Development',
    currentLocation: 'Hubballi, Karnataka',
    experienceYears: '4 Years',
    keyCompetencies: 'Next.js, Node.js, REST APIs, Tailwind CSS, PostgreSQL',
    proposalSummary: 'Experienced full-stack developer available for sprint-based contract development, client website builds, and automated testing tasks.',
    portfolioOrWebsite: 'https://github.com/harishv-dev',
    resumeName: 'Harish_V_Developer_Profile.pdf',
    consentAccepted: true,
    submittedAt: '2026-11-04T12:00:00.000Z',
    status: 'Under Review',
    internalNotes: 'Assigned trial component assessment.'
  }
];


// Seed initial inquiries for demonstration so the admin panel has realistic entries
const initialInquiries: InquirySubmission[] = [
  {
    id: 'inq-101',
    name: 'Rajesh K. Sharma',
    email: 'r.sharma@apexindustrial.in',
    phone: '+91 98450 12345',
    organization: 'Apex Industrial Systems Pvt Ltd',
    subject: 'Enterprise Inventory and Workflow Modernization',
    division: 'IT Solutions',
    message: 'We are evaluating the modernization of our legacy supply chain tracking and warehouse dispatch software. Would like to schedule an initial technical advisory session.',
    createdAt: '2026-11-03T10:15:00.000Z',
    status: 'New',
  },
  {
    id: 'inq-102',
    name: 'Dr. Meenakshi Sundaram',
    email: 'dean.computing@metrotech.edu.in',
    phone: '+91 94440 88210',
    organization: 'Metro Institute of Technology',
    subject: 'Institutional Tech Lab & Cloud DevOps Training Alignment',
    division: 'Education',
    message: 'Requesting syllabus alignment and laboratory practicum details for our upcoming academic semester for 3rd and 4th year undergraduate engineering batches.',
    createdAt: '2026-11-01T14:40:00.000Z',
    status: 'Under Review',
  },
  {
    id: 'inq-103',
    name: 'Ananya Verma',
    email: 'ananya.verma@finflow.co',
    phone: '+91 97110 33490',
    organization: 'FinFlow Technologies',
    subject: 'OpenFrame CoreERP Module Demonstration',
    division: 'Products',
    message: 'Interested in exploring the modular procurement and financial accounting modules of OpenFrame CoreERP for our multi-branch operations.',
    createdAt: '2026-10-28T09:20:00.000Z',
    status: 'Responded',
  }
];

export const storageService = {
  // Inquiries
  getInquiries(): InquirySubmission[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(initialInquiries));
        return initialInquiries;
      }
      return JSON.parse(data);
    } catch {
      return initialInquiries;
    }
  },

  saveInquiry(inquiry: Omit<InquirySubmission, 'id' | 'createdAt' | 'status'>): InquirySubmission {
    const inquiries = this.getInquiries();
    const newEntry: InquirySubmission = {
      ...inquiry,
      id: `inq-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'New',
    };
    const updated = [newEntry, ...inquiries];
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(updated));
    return newEntry;
  },

  updateInquiryStatus(id: string, status: InquirySubmission['status']): void {
    const inquiries = this.getInquiries();
    const updated = inquiries.map(item => item.id === id ? { ...item, status } : item);
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(updated));
  },

  // Blog Posts (Firestore collection: blog_posts)
  getBlogPosts(): BlogPost[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BLOG_POSTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(initialBlogPosts));
        return initialBlogPosts;
      }
      const parsed = JSON.parse(data);
      // Upgrade if minimal previous dataset was cached
      if (Array.isArray(parsed) && parsed.length < 5) {
        localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(initialBlogPosts));
        return initialBlogPosts;
      }
      return parsed;
    } catch {
      return initialBlogPosts;
    }
  },

  getPublishedBlogPosts(): BlogPost[] {
    const list = this.getBlogPosts();
    const today = new Date().toISOString().split('T')[0];
    return list.filter(p => {
      if (p.status === 'Published') return true;
      if (p.status === 'Scheduled' && p.scheduledDate && p.scheduledDate <= today) return true;
      return false;
    });
  },

  getBlogPostBySlug(slug: string): BlogPost | undefined {
    const list = this.getBlogPosts();
    return list.find(p => p.slug === slug);
  },

  saveBlogPost(post: Omit<BlogPost, 'id'>): BlogPost {
    const posts = this.getBlogPosts();
    const newPost: BlogPost = {
      ...post,
      id: `post-${Date.now()}`,
      createdDate: post.createdDate || new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0],
      status: post.status || 'Published',
    };
    const updated = [newPost, ...posts];
    localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(updated));
    return newPost;
  },

  updateBlogPost(id: string, postData: Partial<BlogPost>): void {
    const posts = this.getBlogPosts();
    const updated = posts.map(p => p.id === id ? {
      ...p,
      ...postData,
      updatedDate: new Date().toISOString().split('T')[0]
    } : p);
    localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(updated));
  },

  deleteBlogPost(id: string): void {
    const posts = this.getBlogPosts();
    const updated = posts.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(updated));
  },

  // Careers / Job Openings
  getCareerOpenings(): CareerOpening[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CAREERS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CAREERS, JSON.stringify(initialCareerOpenings));
        return initialCareerOpenings;
      }
      return JSON.parse(data);
    } catch {
      return initialCareerOpenings;
    }
  },

  saveCareerOpening(job: Omit<CareerOpening, 'id'>): CareerOpening {
    const jobs = this.getCareerOpenings();
    const newJob: CareerOpening = {
      ...job,
      id: `job-${Date.now()}`,
    };
    const updated = [newJob, ...jobs];
    localStorage.setItem(STORAGE_KEYS.CAREERS, JSON.stringify(updated));
    return newJob;
  },

  toggleJobStatus(id: string): void {
    const jobs = this.getCareerOpenings();
    const updated = jobs.map(j => j.id === id ? { ...j, isActive: !j.isActive } : j);
    localStorage.setItem(STORAGE_KEYS.CAREERS, JSON.stringify(updated));
  },

  // Job Applications
  getApplications(): JobApplication[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(initialJobApplications));
        return initialJobApplications;
      }
      return JSON.parse(data);
    } catch {
      return initialJobApplications;
    }
  },

  submitJobApplication(app: Omit<JobApplication, 'id' | 'submittedAt' | 'status'>): JobApplication {
    const apps = this.getApplications();
    const newApp: JobApplication = {
      ...app,
      id: `app-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'New',
    };
    const updated = [newApp, ...apps];
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(updated));

    // Mirror to general inquiries for unified admin tracking
    this.saveInquiry({
      name: newApp.fullName,
      email: newApp.email,
      phone: newApp.phone,
      organization: 'Job Applicant',
      subject: `Job Application: ${newApp.jobTitle} (${newApp.experience} Exp)`,
      division: 'General',
      message: `[Location: ${newApp.currentLocation}] [Qualification: ${newApp.qualification}]\nSkills: ${newApp.skills}\n${newApp.coverNote || ''}`,
    });

    return newApp;
  },

  updateJobApplicationStatus(id: string, status: JobApplication['status']): void {
    const list = this.getApplications();
    const updated = list.map(item => item.id === id ? { ...item, status } : item);
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(updated));
  },

  updateJobApplicationNotes(id: string, internalNotes: string): void {
    const list = this.getApplications();
    const updated = list.map(item => item.id === id ? { ...item, internalNotes } : item);
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(updated));
  },

  // Internship Applications
  getInternships(): InternshipApplication[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INTERNSHIPS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.INTERNSHIPS, JSON.stringify(initialInternshipApplications));
        return initialInternshipApplications;
      }
      return JSON.parse(data);
    } catch {
      return initialInternshipApplications;
    }
  },

  submitInternship(app: Omit<InternshipApplication, 'id' | 'submittedAt' | 'status'>): InternshipApplication {
    const list = this.getInternships();
    const newEntry: InternshipApplication = {
      ...app,
      id: `intern-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'New',
    };
    const updated = [newEntry, ...list];
    localStorage.setItem(STORAGE_KEYS.INTERNSHIPS, JSON.stringify(updated));

    this.saveInquiry({
      name: newEntry.fullName,
      email: newEntry.emailAddress,
      phone: newEntry.mobileNumber,
      organization: newEntry.collegeOrUniversity,
      subject: `Internship Application: ${newEntry.preferredDomain} (${newEntry.internshipDuration})`,
      division: 'General',
      message: `[Course: ${newEntry.courseAndYear}] [Location: ${newEntry.currentLocation}]\nSkills: ${newEntry.keySkills}\n${newEntry.statementOfInterest || ''}`,
    });

    return newEntry;
  },

  updateInternshipStatus(id: string, status: InternshipApplication['status']): void {
    const list = this.getInternships();
    const updated = list.map(item => item.id === id ? { ...item, status } : item);
    localStorage.setItem(STORAGE_KEYS.INTERNSHIPS, JSON.stringify(updated));
  },

  updateInternshipNotes(id: string, internalNotes: string): void {
    const list = this.getInternships();
    const updated = list.map(item => item.id === id ? { ...item, internalNotes } : item);
    localStorage.setItem(STORAGE_KEYS.INTERNSHIPS, JSON.stringify(updated));
  },

  // Professional Registrations
  getProfessionals(): ProfessionalRegistration[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFESSIONALS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PROFESSIONALS, JSON.stringify(initialProfessionalRegistrations));
        return initialProfessionalRegistrations;
      }
      return JSON.parse(data);
    } catch {
      return initialProfessionalRegistrations;
    }
  },

  submitProfessional(app: Omit<ProfessionalRegistration, 'id' | 'submittedAt' | 'status'>): ProfessionalRegistration {
    const list = this.getProfessionals();
    const newEntry: ProfessionalRegistration = {
      ...app,
      id: `prof-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'New',
    };
    const updated = [newEntry, ...list];
    localStorage.setItem(STORAGE_KEYS.PROFESSIONALS, JSON.stringify(updated));

    this.saveInquiry({
      name: newEntry.fullName,
      email: newEntry.emailAddress,
      phone: newEntry.mobileNumber,
      organization: `${newEntry.primaryDomain} Professional`,
      subject: `Professional Registration: ${newEntry.areaOfInterest} (${newEntry.experienceYears})`,
      division: 'General',
      message: `[Domain: ${newEntry.primaryDomain}] [Location: ${newEntry.currentLocation}] [Qualification: ${newEntry.qualification}]\nSkills: ${newEntry.keySkills}\nPortfolio: ${newEntry.portfolioOrLinkedIn}\n${newEntry.message || ''}`,
    });

    return newEntry;
  },

  updateProfessionalStatus(id: string, status: ProfessionalRegistration['status']): void {
    const list = this.getProfessionals();
    const updated = list.map(item => item.id === id ? { ...item, status } : item);
    localStorage.setItem(STORAGE_KEYS.PROFESSIONALS, JSON.stringify(updated));
  },

  updateProfessionalNotes(id: string, internalNotes: string): void {
    const list = this.getProfessionals();
    const updated = list.map(item => item.id === id ? { ...item, internalNotes } : item);
    localStorage.setItem(STORAGE_KEYS.PROFESSIONALS, JSON.stringify(updated));
  },

  // School / Institutional Partnerships
  getSchoolPartners(): SchoolPartnerEnquiry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCHOOL_PARTNERS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.SCHOOL_PARTNERS, JSON.stringify(initialSchoolPartnerships));
        return initialSchoolPartnerships;
      }
      return JSON.parse(data);
    } catch {
      return initialSchoolPartnerships;
    }
  },

  submitSchoolPartner(app: Omit<SchoolPartnerEnquiry, 'id' | 'submittedAt' | 'status'>): SchoolPartnerEnquiry {
    const list = this.getSchoolPartners();
    const newEntry: SchoolPartnerEnquiry = {
      ...app,
      id: `school-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'New',
    };
    const updated = [newEntry, ...list];
    localStorage.setItem(STORAGE_KEYS.SCHOOL_PARTNERS, JSON.stringify(updated));

    this.saveInquiry({
      name: `${newEntry.contactPerson} (${newEntry.designation})`,
      email: newEntry.emailAddress,
      phone: newEntry.mobileNumber,
      organization: newEntry.organizationName,
      subject: `School Partnership: ${newEntry.partnershipInterest}`,
      division: 'Partnerships',
      message: `[Type: ${newEntry.institutionType}] [Location: ${newEntry.city}, ${newEntry.state}] [Strength: ${newEntry.studentStrength || 'Not specified'}]\n${newEntry.message || ''}`,
    });

    return newEntry;
  },

  updateSchoolPartnerStatus(id: string, status: SchoolPartnerEnquiry['status']): void {
    const list = this.getSchoolPartners();
    const updated = list.map(item => item.id === id ? { ...item, status } : item);
    localStorage.setItem(STORAGE_KEYS.SCHOOL_PARTNERS, JSON.stringify(updated));
  },

  updateSchoolPartnerNotes(id: string, internalNotes: string): void {
    const list = this.getSchoolPartners();
    const updated = list.map(item => item.id === id ? { ...item, internalNotes } : item);
    localStorage.setItem(STORAGE_KEYS.SCHOOL_PARTNERS, JSON.stringify(updated));
  },

  // NGO Partnerships
  getNgoPartners(): NgoPartnerEnquiry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NGO_PARTNERS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.NGO_PARTNERS, JSON.stringify(initialNgoPartnerships));
        return initialNgoPartnerships;
      }
      return JSON.parse(data);
    } catch {
      return initialNgoPartnerships;
    }
  },

  submitNgoPartner(app: Omit<NgoPartnerEnquiry, 'id' | 'submittedAt' | 'status'>): NgoPartnerEnquiry {
    const list = this.getNgoPartners();
    const newEntry: NgoPartnerEnquiry = {
      ...app,
      id: `ngo-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'New',
    };
    const updated = [newEntry, ...list];
    localStorage.setItem(STORAGE_KEYS.NGO_PARTNERS, JSON.stringify(updated));

    this.saveInquiry({
      name: `${newEntry.contactPerson} (${newEntry.designation})`,
      email: newEntry.emailAddress,
      phone: newEntry.mobileNumber,
      organization: newEntry.organizationName,
      subject: `NGO Partnership: ${newEntry.focusArea} - ${newEntry.partnershipInterest}`,
      division: 'Partnerships',
      message: `[Location: ${newEntry.city}, ${newEntry.state}] [Reg No: ${newEntry.registrationNumber || 'N/A'}] [Target Beneficiaries: ${newEntry.targetBeneficiaryCount || 'N/A'}]\n${newEntry.message}`,
    });

    return newEntry;
  },

  updateNgoPartnerStatus(id: string, status: NgoPartnerEnquiry['status']): void {
    const list = this.getNgoPartners();
    const updated = list.map(item => item.id === id ? { ...item, status } : item);
    localStorage.setItem(STORAGE_KEYS.NGO_PARTNERS, JSON.stringify(updated));
  },

  updateNgoPartnerNotes(id: string, internalNotes: string): void {
    const list = this.getNgoPartners();
    const updated = list.map(item => item.id === id ? { ...item, internalNotes } : item);
    localStorage.setItem(STORAGE_KEYS.NGO_PARTNERS, JSON.stringify(updated));
  },

  // General Work Enquiries
  getGeneralWorkEnquiries(): GeneralWorkEnquiry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GENERAL_WORK);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.GENERAL_WORK, JSON.stringify(initialGeneralWorkEnquiries));
        return initialGeneralWorkEnquiries;
      }
      return JSON.parse(data);
    } catch {
      return initialGeneralWorkEnquiries;
    }
  },

  submitGeneralWork(app: Omit<GeneralWorkEnquiry, 'id' | 'submittedAt' | 'status'>): GeneralWorkEnquiry {
    const list = this.getGeneralWorkEnquiries();
    const newEntry: GeneralWorkEnquiry = {
      ...app,
      id: `work-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'New',
    };
    const updated = [newEntry, ...list];
    localStorage.setItem(STORAGE_KEYS.GENERAL_WORK, JSON.stringify(updated));

    this.saveInquiry({
      name: newEntry.fullName,
      email: newEntry.emailAddress,
      phone: newEntry.mobileNumber,
      organization: 'Work Collaborator',
      subject: `Work With Us: ${newEntry.collaborationType} (${newEntry.experienceYears} Exp)`,
      division: 'Partnerships',
      message: `[Location: ${newEntry.currentLocation}] [Competencies: ${newEntry.keyCompetencies}]\nPortfolio: ${newEntry.portfolioOrWebsite || 'N/A'}\nProposal: ${newEntry.proposalSummary}`,
    });

    return newEntry;
  },

  updateGeneralWorkStatus(id: string, status: GeneralWorkEnquiry['status']): void {
    const list = this.getGeneralWorkEnquiries();
    const updated = list.map(item => item.id === id ? { ...item, status } : item);
    localStorage.setItem(STORAGE_KEYS.GENERAL_WORK, JSON.stringify(updated));
  },

  updateGeneralWorkNotes(id: string, internalNotes: string): void {
    const list = this.getGeneralWorkEnquiries();
    const updated = list.map(item => item.id === id ? { ...item, internalNotes } : item);
    localStorage.setItem(STORAGE_KEYS.GENERAL_WORK, JSON.stringify(updated));
  },


  // Site Settings
  getSiteSettings(): SiteSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SITE_SETTINGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.SITE_SETTINGS, JSON.stringify(initialSiteSettings));
        return initialSiteSettings;
      }
      return JSON.parse(data);
    } catch {
      return initialSiteSettings;
    }
  },

  updateSiteSettings(settings: Partial<SiteSettings>): SiteSettings {
    const current = this.getSiteSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SITE_SETTINGS, JSON.stringify(updated));
    return updated;
  },

  // Software Quotation Enquiries
  getSoftwareEnquiries(): SoftwareQuotationEnquiry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SOFTWARE_ENQUIRIES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveSoftwareEnquiry(enquiry: Omit<SoftwareQuotationEnquiry, 'id' | 'submittedAt' | 'status'>): SoftwareQuotationEnquiry {
    const list = this.getSoftwareEnquiries();
    const newEntry: SoftwareQuotationEnquiry = {
      ...enquiry,
      id: `quote-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'New',
    };
    const updated = [newEntry, ...list];
    localStorage.setItem(STORAGE_KEYS.SOFTWARE_ENQUIRIES, JSON.stringify(updated));

    // Also mirror to main inquiries registry
    this.saveInquiry({
      name: newEntry.fullName,
      email: newEntry.emailAddress,
      phone: newEntry.mobileNumber,
      organization: newEntry.companyName || `${newEntry.industry} Sector`,
      subject: `Software Quotation: ${newEntry.requiredService} (Budget: ${newEntry.estimatedBudget})`,
      division: 'IT Solutions',
      message: `[Location: ${newEntry.city}, ${newEntry.state}] [Timeline: ${newEntry.expectedTimeline}] [Preferred Contact: ${newEntry.preferredContactMethod}]\n\n${newEntry.projectDescription}`,
    });

    return newEntry;
  },

  // Education Courses
  getEducationCourses(): EducationCourse[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EDUCATION_COURSES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.EDUCATION_COURSES, JSON.stringify(initialEducationCourses));
        return initialEducationCourses;
      }
      return JSON.parse(data);
    } catch {
      return initialEducationCourses;
    }
  },

  // Student Registrations
  getStudentRegistrations(): StudentRegistration[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENT_REGISTRATIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveStudentRegistration(reg: Omit<StudentRegistration, 'id' | 'registeredAt' | 'status'>): StudentRegistration {
    const list = this.getStudentRegistrations();
    const newEntry: StudentRegistration = {
      ...reg,
      id: `std-${Date.now()}`,
      registeredAt: new Date().toISOString(),
      status: 'Registered',
    };
    const updated = [newEntry, ...list];
    localStorage.setItem(STORAGE_KEYS.STUDENT_REGISTRATIONS, JSON.stringify(updated));

    // Also mirror to main inquiries registry
    this.saveInquiry({
      name: newEntry.fullName,
      email: newEntry.emailAddress,
      phone: newEntry.mobileNumber,
      organization: newEntry.schoolCollegeName || 'Student Applicant',
      subject: `Student Registration: ${newEntry.interestedCourse} (${newEntry.currentClassQualification})`,
      division: 'Education',
      message: `[DOB: ${newEntry.dob}] [City/State: ${newEntry.city}, ${newEntry.state}] [Mode: ${newEntry.preferredLearningMode}] [Parent: ${newEntry.parentName || 'N/A'} - ${newEntry.parentMobile || 'N/A'}]`,
    });

    return newEntry;
  },

  updateStudentRegistrationStatus(id: string, status: StudentRegistration['status']): void {
    const list = this.getStudentRegistrations();
    const updated = list.map(item => item.id === id ? { ...item, status } : item);
    localStorage.setItem(STORAGE_KEYS.STUDENT_REGISTRATIONS, JSON.stringify(updated));
  },

  updateStudentRegistrationNotes(id: string, internalNotes: string): void {
    const list = this.getStudentRegistrations();
    const updated = list.map(item => item.id === id ? { ...item, internalNotes } : item);
    localStorage.setItem(STORAGE_KEYS.STUDENT_REGISTRATIONS, JSON.stringify(updated));
  },

  // Teacher Registrations
  getTeacherRegistrations(): TeacherRegistration[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEACHER_REGISTRATIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveTeacherRegistration(reg: Omit<TeacherRegistration, 'id' | 'submittedAt' | 'status'>): TeacherRegistration {
    const list = this.getTeacherRegistrations();
    const newEntry: TeacherRegistration = {
      ...reg,
      id: `teach-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'Under Review',
    };
    const updated = [newEntry, ...list];
    localStorage.setItem(STORAGE_KEYS.TEACHER_REGISTRATIONS, JSON.stringify(updated));

    // Also mirror to main inquiries registry
    this.saveInquiry({
      name: newEntry.fullName,
      email: newEntry.email,
      phone: newEntry.mobileNumber,
      organization: 'Faculty / Educator Applicant',
      subject: `Faculty Application: ${newEntry.subjectSpecialization} (${newEntry.teachingExperience} Exp)`,
      division: 'Education',
      message: `[Qualification: ${newEntry.qualification}] [Location: ${newEntry.location}] [Mode: ${newEntry.preferredTeachingMode}] [Profile/Resume: ${newEntry.resumeUrlOrProfile}]`,
    });

    return newEntry;
  },

  updateTeacherRegistrationStatus(id: string, status: TeacherRegistration['status']): void {
    const list = this.getTeacherRegistrations();
    const updated = list.map(item => item.id === id ? { ...item, status } : item);
    localStorage.setItem(STORAGE_KEYS.TEACHER_REGISTRATIONS, JSON.stringify(updated));
  },

  updateTeacherRegistrationNotes(id: string, internalNotes: string): void {
    const list = this.getTeacherRegistrations();
    const updated = list.map(item => item.id === id ? { ...item, internalNotes } : item);
    localStorage.setItem(STORAGE_KEYS.TEACHER_REGISTRATIONS, JSON.stringify(updated));
  },

  // ==========================================
  // PRODUCTS & DIGITAL PLATFORMS
  // ==========================================
  getProducts(): DigitalProduct[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
        return initialProducts;
      }
      return JSON.parse(data);
    } catch {
      return initialProducts;
    }
  },

  getProductBySlug(slug: string): DigitalProduct | undefined {
    const products = this.getProducts();
    return products.find(p => p.slug.toLowerCase() === slug.toLowerCase() || p.id.toLowerCase() === slug.toLowerCase());
  },

  saveProduct(product: Omit<DigitalProduct, 'id'>): DigitalProduct {
    const products = this.getProducts();
    const newProduct: DigitalProduct = {
      ...product,
      id: product.slug || `prod-${Date.now()}`,
    };
    const updated = [newProduct, ...products];
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    return newProduct;
  },

  updateProduct(id: string, productData: Partial<DigitalProduct>): void {
    const products = this.getProducts();
    const updated = products.map(p => p.id === id ? { ...p, ...productData } : p);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
  },

  deleteProduct(id: string): void {
    const products = this.getProducts();
    const updated = products.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
  },

  // ==========================================
  // PRODUCT ENQUIRIES (Firestore: product_enquiries)
  // ==========================================
  getProductEnquiries(): ProductEnquiry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCT_ENQUIRIES);
      if (!data) {
        const seedEnquiries: ProductEnquiry[] = [
          {
            id: 'pe-901',
            productId: 'life-smart-card',
            productName: 'Life Smart Card',
            fullName: 'Captain Ramesh Menon',
            mobileNumber: '9845012399',
            emailAddress: 'r.menon@southfleetlogistics.com',
            organizationName: 'SouthFleet Logistics Network',
            message: 'Inquiring about fleet issuance of 250 Life Smart Cards for commercial transport operators across Karnataka and Tamil Nadu.',
            consentAccepted: true,
            submittedAt: '2026-11-04T09:30:00.000Z',
            status: 'New',
          },
          {
            id: 'pe-902',
            productId: 'learnxcel',
            productName: 'LearnXcel',
            fullName: 'Dr. Sunita Kulkarni',
            mobileNumber: '9880145678',
            emailAddress: 'principal@karnatakapolytechnic.ac.in',
            organizationName: 'Karnataka State Polytechnic Consortia',
            message: 'We want to schedule a demonstration of the automated coding laboratory and grading features for our computer science department.',
            consentAccepted: true,
            submittedAt: '2026-11-02T14:15:00.000Z',
            status: 'Contacted',
          },
          {
            id: 'pe-903',
            productId: 'talenthub',
            productName: 'TalentHub',
            fullName: 'Vikramaditya Rao',
            mobileNumber: '9900234512',
            emailAddress: 'v.rao@zenithengineering.in',
            organizationName: 'Zenith Engineering Technologies',
            message: 'Requesting early beta access to recruit graduating engineering candidates through standardized benchmark evaluations.',
            consentAccepted: true,
            submittedAt: '2026-10-31T11:00:00.000Z',
            status: 'In Progress',
          }
        ];
        localStorage.setItem(STORAGE_KEYS.PRODUCT_ENQUIRIES, JSON.stringify(seedEnquiries));
        return seedEnquiries;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveProductEnquiry(enquiry: Omit<ProductEnquiry, 'id' | 'submittedAt' | 'status'>): ProductEnquiry {
    const list = this.getProductEnquiries();
    const newEntry: ProductEnquiry = {
      ...enquiry,
      id: `pe-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'New',
    };
    const updated = [newEntry, ...list];
    localStorage.setItem(STORAGE_KEYS.PRODUCT_ENQUIRIES, JSON.stringify(updated));

    // Also sync to main inquiries registry
    this.saveInquiry({
      name: newEntry.fullName,
      email: newEntry.emailAddress,
      phone: newEntry.mobileNumber,
      organization: newEntry.organizationName || 'Product Lead',
      subject: `Product Enquiry: ${newEntry.productName}`,
      division: 'Products',
      message: `[Product: ${newEntry.productName}] [Message: ${newEntry.message}]`,
    });

    return newEntry;
  },

  updateProductEnquiryStatus(id: string, status: ProductEnquiry['status']): void {
    const list = this.getProductEnquiries();
    const updated = list.map(item => item.id === id ? { ...item, status } : item);
    localStorage.setItem(STORAGE_KEYS.PRODUCT_ENQUIRIES, JSON.stringify(updated));
  },

  // HopeNest Programs
  getHopeNestPrograms(): HopeNestProgram[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HOPENEST_PROGRAMS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.HOPENEST_PROGRAMS, JSON.stringify(initialHopeNestPrograms));
        return initialHopeNestPrograms;
      }
      return JSON.parse(data);
    } catch {
      return initialHopeNestPrograms;
    }
  },

  getHopeNestProgramBySlug(slug: string): HopeNestProgram | undefined {
    const list = this.getHopeNestPrograms();
    return list.find(p => p.slug === slug);
  },

  saveHopeNestProgram(program: HopeNestProgram): void {
    const list = this.getHopeNestPrograms();
    const index = list.findIndex(p => p.id === program.id);
    let updated: HopeNestProgram[];
    if (index >= 0) {
      updated = list.map(p => p.id === program.id ? program : p);
    } else {
      updated = [...list, program];
    }
    localStorage.setItem(STORAGE_KEYS.HOPENEST_PROGRAMS, JSON.stringify(updated));
  },

  // HopeNest Updates
  getHopeNestUpdates(): HopeNestUpdate[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HOPENEST_UPDATES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.HOPENEST_UPDATES, JSON.stringify(initialHopeNestUpdates));
        return initialHopeNestUpdates;
      }
      return JSON.parse(data);
    } catch {
      return initialHopeNestUpdates;
    }
  },

  saveHopeNestUpdate(update: Omit<HopeNestUpdate, 'id'>): HopeNestUpdate {
    const list = this.getHopeNestUpdates();
    const newEntry: HopeNestUpdate = {
      ...update,
      id: `hnu-${Date.now()}`,
      status: update.status || 'Published',
    };
    const updated = [newEntry, ...list];
    localStorage.setItem(STORAGE_KEYS.HOPENEST_UPDATES, JSON.stringify(updated));
    return newEntry;
  },

  updateHopeNestUpdate(update: HopeNestUpdate): void {
    const list = this.getHopeNestUpdates();
    const updated = list.map(item => item.id === update.id ? update : item);
    localStorage.setItem(STORAGE_KEYS.HOPENEST_UPDATES, JSON.stringify(updated));
  },

  deleteHopeNestUpdate(id: string): void {
    const list = this.getHopeNestUpdates();
    const updated = list.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.HOPENEST_UPDATES, JSON.stringify(updated));
  },

  // HopeNest Volunteers (Firestore collection: hopenest_volunteers)
  getHopeNestVolunteers(): HopeNestVolunteer[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HOPENEST_VOLUNTEERS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveHopeNestVolunteer(volunteer: Omit<HopeNestVolunteer, 'id' | 'submittedAt' | 'status'>): HopeNestVolunteer {
    const list = this.getHopeNestVolunteers();
    const newEntry: HopeNestVolunteer = {
      ...volunteer,
      id: `vol-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'New',
    };
    const updated = [newEntry, ...list];
    localStorage.setItem(STORAGE_KEYS.HOPENEST_VOLUNTEERS, JSON.stringify(updated));

    // Also mirror to main inquiries registry under Partnerships division
    this.saveInquiry({
      name: newEntry.fullName,
      email: newEntry.emailAddress,
      phone: newEntry.mobileNumber,
      organization: `Volunteer Candidate (${newEntry.professionOrOccupation || 'Independent'})`,
      subject: `HopeNest Volunteer Application: ${newEntry.areaOfInterest}`,
      division: 'Partnerships',
      message: `[Location: ${newEntry.location}] [Availability: ${newEntry.availability}] [Note: ${newEntry.message}]`,
    });

    return newEntry;
  },

  updateHopeNestVolunteerStatus(id: string, status: HopeNestVolunteer['status']): void {
    const list = this.getHopeNestVolunteers();
    const updated = list.map(item => item.id === id ? { ...item, status } : item);
    localStorage.setItem(STORAGE_KEYS.HOPENEST_VOLUNTEERS, JSON.stringify(updated));
  },

  // HopeNest Donation & Support Enquiries (Firestore collection: hopenest_donation_enquiries)
  getHopeNestDonationEnquiries(): HopeNestDonationEnquiry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HOPENEST_DONATION_ENQUIRIES);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveHopeNestDonationEnquiry(enquiry: Omit<HopeNestDonationEnquiry, 'id' | 'submittedAt' | 'status'>): HopeNestDonationEnquiry {
    const list = this.getHopeNestDonationEnquiries();
    const newEntry: HopeNestDonationEnquiry = {
      ...enquiry,
      id: `don-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'New',
    };
    const updated = [newEntry, ...list];
    localStorage.setItem(STORAGE_KEYS.HOPENEST_DONATION_ENQUIRIES, JSON.stringify(updated));

    // Also mirror to main inquiries registry
    this.saveInquiry({
      name: newEntry.fullName,
      email: newEntry.emailAddress,
      phone: newEntry.mobileNumber,
      organization: newEntry.organizationName || 'Foundation Well-Wisher',
      subject: `HopeNest Support Enquiry: ${newEntry.supportType}`,
      division: 'Partnerships',
      message: `[City: ${newEntry.city}, ${newEntry.state}] [Support Type: ${newEntry.supportType}] [Details: ${newEntry.message}]`,
    });

    return newEntry;
  },

  updateHopeNestDonationEnquiryStatus(id: string, status: HopeNestDonationEnquiry['status']): void {
    const list = this.getHopeNestDonationEnquiries();
    const updated = list.map(item => item.id === id ? { ...item, status } : item);
    localStorage.setItem(STORAGE_KEYS.HOPENEST_DONATION_ENQUIRIES, JSON.stringify(updated));
  },

  // HopeNest Beneficiary & Participant Registrations (Firestore collection: hopenest_participants)
  getHopeNestParticipants(): HopeNestParticipant[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HOPENEST_PARTICIPANTS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveHopeNestParticipant(participant: Omit<HopeNestParticipant, 'id' | 'submittedAt' | 'status'>): HopeNestParticipant {
    const list = this.getHopeNestParticipants();
    const newEntry: HopeNestParticipant = {
      ...participant,
      id: `part-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'Registered',
    };
    const updated = [newEntry, ...list];
    localStorage.setItem(STORAGE_KEYS.HOPENEST_PARTICIPANTS, JSON.stringify(updated));

    // Also mirror to main inquiries registry
    this.saveInquiry({
      name: newEntry.fullName,
      email: newEntry.emailAddress || 'Not Provided',
      phone: newEntry.mobileNumber,
      organization: `${newEntry.participantType} (${newEntry.city})`,
      subject: `HopeNest Beneficiary Registration: ${newEntry.programmeInterested}`,
      division: 'Education',
      message: `[Programme: ${newEntry.programmeInterested}] [Type: ${newEntry.participantType}] [Location: ${newEntry.city}, ${newEntry.district || ''}, ${newEntry.state}] [Message: ${newEntry.message}]`,
    });

    return newEntry;
  },

  updateHopeNestParticipantStatus(id: string, status: HopeNestParticipant['status']): void {
    const list = this.getHopeNestParticipants();
    const updated = list.map(item => item.id === id ? { ...item, status } : item);
    localStorage.setItem(STORAGE_KEYS.HOPENEST_PARTICIPANTS, JSON.stringify(updated));
  },

  // Admin Auth Session
  isAdminLoggedIn(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'active_authenticated';
  },

  setAdminLoggedIn(status: boolean): void {
    if (status) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'active_authenticated');
    } else {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    }
  },

  // ==========================================
  // CONTACT MESSAGES (Firestore: contact_messages)
  // ==========================================
  getContactMessages(): ContactMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONTACT_MESSAGES);
      if (!data) {
        const seedMessages: ContactMessage[] = [
          {
            id: 'msg-seed-1',
            fullName: 'Rajesh K. Sharma',
            emailAddress: 'r.sharma@apexindustrial.in',
            phone: '+91 98450 12345',
            organization: 'Apex Industrial Systems Pvt Ltd',
            subject: 'Enterprise Inventory and Workflow Modernization',
            division: 'IT Solutions',
            message: 'We are evaluating modernizing our supply chain tracking and warehouse dispatch software. Would like to schedule an initial technical advisory session.',
            submittedAt: '2026-11-04T10:15:00.000Z',
            status: 'New',
          },
          {
            id: 'msg-seed-2',
            fullName: 'Dr. Meenakshi Sundaram',
            emailAddress: 'dean.computing@metrotech.edu.in',
            phone: '+91 94440 88210',
            organization: 'Metro Institute of Technology',
            subject: 'Institutional Tech Lab & Cloud DevOps Training Alignment',
            division: 'Education',
            message: 'Requesting syllabus alignment and laboratory practicum details for our upcoming academic semester for 3rd and 4th year undergraduate engineering batches.',
            submittedAt: '2026-11-03T14:40:00.000Z',
            status: 'Under Review',
          }
        ];
        localStorage.setItem(STORAGE_KEYS.CONTACT_MESSAGES, JSON.stringify(seedMessages));
        return seedMessages;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveContactMessage(message: Omit<ContactMessage, 'id' | 'submittedAt'>): ContactMessage {
    const list = this.getContactMessages();
    const newEntry: ContactMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'New',
    };
    const updated = [newEntry, ...list];
    localStorage.setItem(STORAGE_KEYS.CONTACT_MESSAGES, JSON.stringify(updated));

    // Also mirror to main inquiries registry for backward compatibility
    this.saveInquiry({
      name: newEntry.fullName,
      email: newEntry.emailAddress,
      phone: newEntry.phone || '',
      organization: newEntry.organization || 'General Visitor',
      subject: newEntry.subject || 'Direct Website Contact Message',
      division: (newEntry.division as any) || 'General',
      message: newEntry.message,
    });

    return newEntry;
  },

  updateContactMessageStatus(id: string, status: ContactMessage['status']): void {
    const list = this.getContactMessages();
    const updated = list.map(item => item.id === id ? { ...item, status } : item);
    localStorage.setItem(STORAGE_KEYS.CONTACT_MESSAGES, JSON.stringify(updated));
  },

  // ==========================================
  // GENERAL ENQUIRIES (Firestore: general_enquiries)
  // ==========================================
  getGeneralEnquiries(): GeneralEnquiry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GENERAL_ENQUIRIES);
      if (!data) {
        const seedEnquiries: GeneralEnquiry[] = [
          {
            id: 'gen-seed-1',
            fullName: 'Ananya Verma',
            mobileNumber: '9711033490',
            emailAddress: 'ananya.verma@finflow.co',
            city: 'Bengaluru',
            state: 'Karnataka',
            enquiryCategory: 'General Corporate Matter',
            subject: 'Corporate Engagement & Vendor Onboarding Inquiry',
            message: 'Inquiring regarding OpenFrame vendor compliance and empanelment criteria for technology advisory services.',
            consentAccepted: true,
            submittedAt: '2026-11-04T09:20:00.000Z',
            status: 'New',
          }
        ];
        localStorage.setItem(STORAGE_KEYS.GENERAL_ENQUIRIES, JSON.stringify(seedEnquiries));
        return seedEnquiries;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveGeneralEnquiry(enquiry: Omit<GeneralEnquiry, 'id' | 'submittedAt'>): GeneralEnquiry {
    const list = this.getGeneralEnquiries();
    const newEntry: GeneralEnquiry = {
      ...enquiry,
      id: `gen-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'New',
    };
    const updated = [newEntry, ...list];
    localStorage.setItem(STORAGE_KEYS.GENERAL_ENQUIRIES, JSON.stringify(updated));

    // Mirror to inquiries
    this.saveInquiry({
      name: newEntry.fullName,
      email: newEntry.emailAddress,
      phone: newEntry.mobileNumber,
      organization: `${newEntry.city}, ${newEntry.state}`,
      subject: `General Enquiry [${newEntry.enquiryCategory}]: ${newEntry.subject}`,
      division: 'General',
      message: `[Location: ${newEntry.city}, ${newEntry.state}] [Category: ${newEntry.enquiryCategory}]\n${newEntry.message}`,
    });

    return newEntry;
  },

  updateGeneralEnquiryStatus(id: string, status: GeneralEnquiry['status']): void {
    const list = this.getGeneralEnquiries();
    const updated = list.map(item => item.id === id ? { ...item, status } : item);
    localStorage.setItem(STORAGE_KEYS.GENERAL_ENQUIRIES, JSON.stringify(updated));
  },

  updateGeneralEnquiryNotes(id: string, internalNotes: string): void {
    const list = this.getGeneralEnquiries();
    const updated = list.map(item => item.id === id ? { ...item, internalNotes } : item);
    localStorage.setItem(STORAGE_KEYS.GENERAL_ENQUIRIES, JSON.stringify(updated));
  },

  // ==========================================
  // DEDICATED SOFTWARE ENQUIRIES (Firestore: software_enquiries)
  // ==========================================
  getDedicatedSoftwareEnquiries(): SoftwareEnquiryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEDICATED_SOFTWARE_ENQUIRIES);
      if (!data) {
        const seedSoftware: SoftwareEnquiryItem[] = [
          {
            id: 'soft-seed-1',
            name: 'Karthik Subramanian',
            companyName: 'NavaLogix Global Logistics',
            emailAddress: 'karthik.s@navalogix.io',
            mobileNumber: '9845099231',
            requiredService: 'Enterprise Software & Cloud Systems',
            projectDescription: 'Architecture of multi-tenant freight orchestration engine with automated telemetry ingesters and invoice reconciliation modules.',
            estimatedBudget: 'INR 10,00,000 - 25,00,000',
            timeline: '3 - 6 Months',
            preferredContactMethod: 'Email & Technical Call',
            consentAccepted: true,
            submittedAt: '2026-11-03T11:00:00.000Z',
            status: 'New',
          }
        ];
        localStorage.setItem(STORAGE_KEYS.DEDICATED_SOFTWARE_ENQUIRIES, JSON.stringify(seedSoftware));
        return seedSoftware;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveDedicatedSoftwareEnquiry(enquiry: Omit<SoftwareEnquiryItem, 'id' | 'submittedAt'>): SoftwareEnquiryItem {
    const list = this.getDedicatedSoftwareEnquiries();
    const newEntry: SoftwareEnquiryItem = {
      ...enquiry,
      id: `soft-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'New',
    };
    const updated = [newEntry, ...list];
    localStorage.setItem(STORAGE_KEYS.DEDICATED_SOFTWARE_ENQUIRIES, JSON.stringify(updated));

    // Mirror to inquiries
    this.saveInquiry({
      name: newEntry.name,
      email: newEntry.emailAddress,
      phone: newEntry.mobileNumber,
      organization: newEntry.companyName || 'Software Client',
      subject: `Software Development Enquiry: ${newEntry.requiredService}`,
      division: 'IT Solutions',
      message: `[Budget: ${newEntry.estimatedBudget || 'N/A'}] [Timeline: ${newEntry.timeline || 'N/A'}] [Contact: ${newEntry.preferredContactMethod || 'Email'}]\n${newEntry.projectDescription}`,
    });

    return newEntry;
  },

  updateDedicatedSoftwareEnquiryStatus(id: string, status: SoftwareEnquiryItem['status']): void {
    const list = this.getDedicatedSoftwareEnquiries();
    const updated = list.map(item => item.id === id ? { ...item, status } : item);
    localStorage.setItem(STORAGE_KEYS.DEDICATED_SOFTWARE_ENQUIRIES, JSON.stringify(updated));
  },

  updateDedicatedSoftwareEnquiryNotes(id: string, internalNotes: string): void {
    const list = this.getDedicatedSoftwareEnquiries();
    const updated = list.map(item => item.id === id ? { ...item, internalNotes } : item);
    localStorage.setItem(STORAGE_KEYS.DEDICATED_SOFTWARE_ENQUIRIES, JSON.stringify(updated));
  },

  // ==========================================
  // BUSINESS ENQUIRIES (Firestore: business_enquiries)
  // ==========================================
  getBusinessEnquiries(): BusinessEnquiry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUSINESS_ENQUIRIES);
      if (!data) {
        const seedBusiness: BusinessEnquiry[] = [
          {
            id: 'biz-seed-1',
            name: 'Pooja Hegde',
            organisation: 'Apex Retail Ventures Ltd',
            emailAddress: 'pooja.hegde@apexretail.in',
            mobileNumber: '9900887711',
            businessRequirement: 'Multi-Branch Technology Modernization',
            message: 'Looking to engage OpenFrame as enterprise technology and digital transformation partners across 14 commercial hub outlets in South India.',
            submittedAt: '2026-11-02T15:20:00.000Z',
            status: 'New',
          }
        ];
        localStorage.setItem(STORAGE_KEYS.BUSINESS_ENQUIRIES, JSON.stringify(seedBusiness));
        return seedBusiness;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveBusinessEnquiry(enquiry: Omit<BusinessEnquiry, 'id' | 'submittedAt'>): BusinessEnquiry {
    const list = this.getBusinessEnquiries();
    const newEntry: BusinessEnquiry = {
      ...enquiry,
      id: `biz-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'New',
    };
    const updated = [newEntry, ...list];
    localStorage.setItem(STORAGE_KEYS.BUSINESS_ENQUIRIES, JSON.stringify(updated));

    // Mirror to inquiries
    this.saveInquiry({
      name: newEntry.name,
      email: newEntry.emailAddress,
      phone: newEntry.mobileNumber,
      organization: newEntry.organisation,
      subject: `Business Enquiry: ${newEntry.businessRequirement}`,
      division: 'Partnerships',
      message: `[Organisation: ${newEntry.organisation}] [Requirement: ${newEntry.businessRequirement}]\n${newEntry.message}`,
    });

    return newEntry;
  },

  updateBusinessEnquiryStatus(id: string, status: BusinessEnquiry['status']): void {
    const list = this.getBusinessEnquiries();
    const updated = list.map(item => item.id === id ? { ...item, status } : item);
    localStorage.setItem(STORAGE_KEYS.BUSINESS_ENQUIRIES, JSON.stringify(updated));
  },

  updateBusinessEnquiryNotes(id: string, internalNotes: string): void {
    const list = this.getBusinessEnquiries();
    const updated = list.map(item => item.id === id ? { ...item, internalNotes } : item);
    localStorage.setItem(STORAGE_KEYS.BUSINESS_ENQUIRIES, JSON.stringify(updated));
  },

  // ==========================================
  // BRANCHES (Firestore: branches)
  // ==========================================
  getBranches(): BranchLocation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BRANCHES);
      if (!data) {
        const seedBranches: BranchLocation[] = [
          {
            id: 'branch-bengaluru-hq',
            name: 'Corporate Headquarters & Tech Laboratory',
            city: 'Bengaluru',
            state: 'Karnataka',
            fullAddress: 'Plot No. 42, Electronic City Phase 1, Hosur Road, Bengaluru, Karnataka, India - 560100',
            contactNumber: '+91 80 4123 4567',
            email: 'bengaluru.hq@openframeitsolutions.com',
            officeHours: 'Monday – Friday: 9:30 AM – 6:30 PM IST',
            googleMapsUrl: 'https://maps.google.com/?q=Electronic+City+Phase+1+Bengaluru',
            isHeadquarters: true,
            isPlaceholder: false,
            isActive: true,
          },
          {
            id: 'branch-hubballi',
            name: 'North Karnataka Regional Technology Hub',
            city: 'Hubballi',
            state: 'Karnataka',
            fullAddress: 'IT Park Road, Deshpande Nagar / Gokul Road Corridor, Hubballi, Karnataka - 580029 (Placeholder address pending lease finalization)',
            contactNumber: '+91 836 298 7654',
            email: 'hubballi.hub@openframeitsolutions.com',
            officeHours: 'Monday – Friday: 9:30 AM – 6:00 PM IST',
            googleMapsUrl: 'https://maps.google.com/?q=IT+Park+Hubballi',
            isHeadquarters: false,
            isPlaceholder: true,
            isActive: true,
          },
          {
            id: 'branch-hyderabad',
            name: 'Telangana Cloud Systems & Engineering Hub',
            city: 'Hyderabad',
            state: 'Telangana',
            fullAddress: 'Financial District, Gachibowli, Nanakramguda, Hyderabad, Telangana - 500032 (Placeholder address pending facility handover)',
            contactNumber: '+91 40 6789 0123',
            email: 'hyderabad.office@openframeitsolutions.com',
            officeHours: 'Monday – Friday: 9:30 AM – 6:30 PM IST',
            googleMapsUrl: 'https://maps.google.com/?q=Financial+District+Gachibowli+Hyderabad',
            isHeadquarters: false,
            isPlaceholder: true,
            isActive: true,
          },
          {
            id: 'branch-pune',
            name: 'Maharashtra Academic Practicum Center',
            city: 'Pune',
            state: 'Maharashtra',
            fullAddress: 'Hinjawadi Rajiv Gandhi Infotech Park, Phase 2, Pune, Maharashtra - 411057 (Placeholder address pending institutional MOU)',
            contactNumber: '+91 20 4567 8901',
            email: 'pune.center@openframeitsolutions.com',
            officeHours: 'Monday – Friday: 9:30 AM – 6:00 PM IST',
            googleMapsUrl: 'https://maps.google.com/?q=Hinjawadi+Pune',
            isHeadquarters: false,
            isPlaceholder: true,
            isActive: true,
          }
        ];
        localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(seedBranches));
        return seedBranches;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveBranch(branch: BranchLocation): void {
    const list = this.getBranches();
    const index = list.findIndex(b => b.id === branch.id);
    let updated: BranchLocation[];
    if (index >= 0) {
      updated = list.map(b => b.id === branch.id ? branch : b);
    } else {
      updated = [...list, branch];
    }
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(updated));
  },

  deleteBranch(id: string): void {
    const list = this.getBranches();
    const updated = list.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(updated));
  },

  toggleBranchStatus(id: string): void {
    const list = this.getBranches();
    const updated = list.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b);
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(updated));
  },

  // ==========================================
  // NEWSLETTER SUBSCRIBERS (Firestore: newsletter_subscribers)
  // ==========================================
  getNewsletterSubscribers(): NewsletterSubscriber[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NEWSLETTER_SUBSCRIBERS);
      if (!data) {
        const seedSubs: NewsletterSubscriber[] = [
          {
            id: 'sub-seed-1',
            fullName: 'Corporate Visitor',
            emailAddress: 'technology.lead@enterprise.com',
            consentAccepted: true,
            subscribedAt: '2026-11-01T10:00:00.000Z',
            source: 'Website Footer',
          }
        ];
        localStorage.setItem(STORAGE_KEYS.NEWSLETTER_SUBSCRIBERS, JSON.stringify(seedSubs));
        return seedSubs;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  subscribeNewsletter(email: string, fullName?: string, source?: string): { success: boolean; isDuplicate: boolean } {
    const normalized = email.trim().toLowerCase();
    const list = this.getNewsletterSubscribers();
    const exists = list.some(s => s.emailAddress.toLowerCase() === normalized);
    if (exists) {
      return { success: false, isDuplicate: true };
    }

    const newSub: NewsletterSubscriber = {
      id: `sub-${Date.now()}`,
      fullName: fullName?.trim() || undefined,
      emailAddress: normalized,
      consentAccepted: true,
      subscribedAt: new Date().toISOString(),
      source: source || 'Contact / Stay in Touch Section',
    };

    const updated = [newSub, ...list];
    localStorage.setItem(STORAGE_KEYS.NEWSLETTER_SUBSCRIBERS, JSON.stringify(updated));
    return { success: true, isDuplicate: false };
  },

  deleteNewsletterSubscriber(id: string): void {
    const list = this.getNewsletterSubscribers();
    const updated = list.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.NEWSLETTER_SUBSCRIBERS, JSON.stringify(updated));
  },

  saveEducationCourses(courses: EducationCourse[]): void {
    localStorage.setItem(STORAGE_KEYS.EDUCATION_COURSES, JSON.stringify(courses));
  },

  // ==========================================
  // CORPORATE DOCUMENTS (Firestore: corporate_documents)
  // ==========================================
  getCorporateDocuments(): CorporateDocument[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CORPORATE_DOCUMENTS);
      if (!data) {
        const seedDocs: CorporateDocument[] = [
          {
            id: 'doc-001',
            title: 'OpenFrame Corporate Profile 2026',
            category: 'Corporate Profile',
            fileFormat: 'PDF Document',
            fileSize: '2.4 MB',
            version: 'v2.6',
            approvedDate: '2026-11-01',
            status: 'Approved for Public Access',
            isPublic: true,
            description: 'Official corporate overview, business activities, technical capabilities, and education initiatives of OpenFrame IT Solutions Private Limited.',
            downloadUrl: '#corporate-profile'
          },
          {
            id: 'doc-002',
            title: 'Enterprise Software & IT Solutions Capabilities Catalogue',
            category: 'Product Catalogue',
            fileFormat: 'PDF Document',
            fileSize: '3.1 MB',
            version: 'v2026.1',
            approvedDate: '2026-11-01',
            status: 'Approved for Public Access',
            isPublic: true,
            description: 'Technical architecture, enterprise stack capabilities, and development methodologies for web, cloud, and multi-tenant software systems.',
            downloadUrl: '#solutions-catalogue'
          },
          {
            id: 'doc-003',
            title: 'OpenFrame Education Corporate Brochure (42 Pages)',
            category: 'Corporate Brochure',
            fileFormat: 'PDF Document',
            fileSize: '9.5 MB',
            version: 'v2024-25',
            approvedDate: '2026-11-04',
            status: 'Approved for Public Access',
            isPublic: true,
            description: 'Comprehensive 42-page corporate manifesto detailing the OpenFrame educational ecosystem, 33 categories, 100+ skills curriculum, and DPIIT recognition.',
            downloadUrl: '/assets/brochures/OpenFrame_Education_Corporate_Brochure.pdf'
          },
          {
            id: 'doc-003-pricing',
            title: 'OpenFrame Education Student Programmes & Pricing Catalogue 2026–27',
            category: 'Product Catalogue',
            fileFormat: 'PDF Document',
            fileSize: '1.1 MB',
            version: 'v2026-27',
            approvedDate: '2026-11-04',
            status: 'Approved for Public Access',
            isPublic: true,
            description: 'Official 5-page visual pricing brochure detailing academic tuition plans (₹300/₹500/₹1,000), 9 school subjects, skill course fees (₹1,200), mentoring (₹500), and IQ/EQ/SQ assessment.',
            downloadUrl: '/assets/brochures/OpenFrame_Education_Pricing_Catalogue_2026-27.pdf'
          },
          {
            id: 'doc-004',
            title: 'Certificate of Incorporation (RoC Karnataka)',
            category: 'Incorporation Certificate',
            fileFormat: 'PDF Document',
            fileSize: '640 KB',
            version: 'RoC Charter Record',
            approvedDate: '2026-11-01',
            status: 'Pending Legal Verification',
            isPublic: false,
            documentNumberPlaceholder: 'CIN: U62099KA2023PTC180260 (Statutory Sign-Off In Progress)',
            description: 'Statutory certificate issued by the Registrar of Companies, Ministry of Corporate Affairs, Karnataka. Redacted document pending public repository sign-off.',
            isPlaceholder: true
          },
          {
            id: 'doc-005',
            title: 'DPIIT Recognition Application Filing',
            category: 'DPIIT Recognition',
            fileFormat: 'PDF Document',
            fileSize: '512 KB',
            version: 'Filing Draft',
            approvedDate: '2026-11-01',
            status: 'Pending Legal Verification',
            isPublic: false,
            documentNumberPlaceholder: '[DPIIT Reference Number Under Verification]',
            description: 'Official application submitted to Department for Promotion of Industry and Internal Trade. Available to authorized board members only.',
            isPlaceholder: true
          },
          {
            id: 'doc-006',
            title: 'Startup India Portal Recognition Record',
            category: 'Startup India Recognition',
            fileFormat: 'PDF Document',
            fileSize: '480 KB',
            version: 'Pending Verification',
            approvedDate: '2026-11-01',
            status: 'Pending Legal Verification',
            isPublic: false,
            documentNumberPlaceholder: '[Startup India ID Pending Statutory Certification]',
            description: 'Statutory startup recognition filing record under administrative evaluation.',
            isPlaceholder: true
          }
        ];
        localStorage.setItem(STORAGE_KEYS.CORPORATE_DOCUMENTS, JSON.stringify(seedDocs));
        return seedDocs;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  getPublicCorporateDocuments(): CorporateDocument[] {
    return this.getCorporateDocuments().filter(doc => doc.isPublic && doc.status === 'Approved for Public Access');
  },

  saveCorporateDocument(docItem: CorporateDocument): void {
    const list = this.getCorporateDocuments();
    const existingIndex = list.findIndex(d => d.id === docItem.id);
    let updated: CorporateDocument[];
    if (existingIndex >= 0) {
      updated = list.map(d => d.id === docItem.id ? docItem : d);
    } else {
      updated = [docItem, ...list];
    }
    localStorage.setItem(STORAGE_KEYS.CORPORATE_DOCUMENTS, JSON.stringify(updated));
  },

  deleteCorporateDocument(id: string): void {
    const list = this.getCorporateDocuments();
    const updated = list.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.CORPORATE_DOCUMENTS, JSON.stringify(updated));
  },

  toggleCorporateDocumentPublic(id: string): void {
    const list = this.getCorporateDocuments();
    const updated = list.map(d => {
      if (d.id === id) {
        const nextPublic = !d.isPublic;
        return {
          ...d,
          isPublic: nextPublic,
          status: nextPublic ? 'Approved for Public Access' : 'Pending Legal Verification' as const
        };
      }
      return d;
    });
    localStorage.setItem(STORAGE_KEYS.CORPORATE_DOCUMENTS, JSON.stringify(updated));
  }
};
