import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  Firestore,
  FirestoreError,
  getDocFromServer
} from 'firebase/firestore';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  User
} from 'firebase/auth';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  ContactMessage,
  GeneralEnquiry,
  SoftwareEnquiryItem,
  BusinessEnquiry,
  BranchLocation,
  NewsletterSubscriber,
  ProductEnquiry,
  StudentRegistration,
  TeacherRegistration,
  JobApplication,
  InternshipApplication,
  ProfessionalRegistration,
  SchoolPartnerEnquiry,
  NgoPartnerEnquiry,
  GeneralWorkEnquiry,
  HopeNestVolunteer,
  HopeNestDonationEnquiry,
  HopeNestParticipant,
  HopeNestUpdate,
  BlogPost,
  AdminUser,
  ActivityLog,
  AdminRole,
  LmsUserProfile,
  LmsUserRole,
  StudentProfile,
  TeacherProfile
} from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with ignoreUndefinedProperties so optional fields never crash writes
let dbInstance: Firestore;
try {
  if (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)') {
    dbInstance = initializeFirestore(
      app,
      { ignoreUndefinedProperties: true },
      firebaseConfig.firestoreDatabaseId
    );
  } else {
    dbInstance = initializeFirestore(app, { ignoreUndefinedProperties: true });
  }
} catch {
  dbInstance = getFirestore(app);
}

export function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedDeep(item)) as unknown as T;
  }
  if (value !== null && typeof value === 'object' && Object.prototype.toString.call(value) === '[object Object]') {
    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(value as Record<string, any>)) {
      if (v !== undefined) {
        clean[k] = stripUndefinedDeep(v);
      }
    }
    return clean as T;
  }
  return value;
}

export const db = dbInstance;
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Operational context for error logging
export enum OperationType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const err = error as FirestoreError;
  const errInfo: FirestoreErrorInfo = {
    error: err?.message || String(error),
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    }
  };
  console.warn('Firestore Operation Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.warn('Firebase client is offline.');
      return false;
    }
    return true;
  }
}

// ====================================================
// AUTHENTICATION & RBAC
// ====================================================

export const SUPER_ADMIN_EMAILS = [
  'akashrajnayak@gmail.com',
  'admin@openframeitsolutions.com'
];

export async function loginWithGoogle(rememberMe = true): Promise<User> {
  await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence).catch(() => {});
  const result = await signInWithPopup(auth, googleProvider);
  if (SUPER_ADMIN_EMAILS.includes((result.user.email || '').toLowerCase())) {
    await ensureAdminRecord(result.user);
  }
  return result.user;
}

export async function loginWithEmail(email: string, pass: string, rememberMe = true): Promise<User> {
  await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence).catch(() => {});
  const result = await signInWithEmailAndPassword(auth, email, pass);
  if (SUPER_ADMIN_EMAILS.includes((result.user.email || '').toLowerCase())) {
    await ensureAdminRecord(result.user);
  }
  return result.user;
}

export async function registerPortalAccountWithEmail(
  displayName: string,
  email: string,
  pass: string
): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName.trim()) {
    await updateProfile(result.user, { displayName: displayName.trim() });
  }
  await sendEmailVerification(result.user).catch(() => {});
  return result.user;
}

export async function logoutAdmin(): Promise<void> {
  await signOut(auth);
}

export async function resetAdminPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function ensureAdminRecord(user: User): Promise<AdminUser> {
  const docRef = doc(db, 'admin_users', user.uid);
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as AdminUser;
      await updateDoc(docRef, { lastLoginAt: new Date().toISOString() });
      return data;
    }

    const isSuper = SUPER_ADMIN_EMAILS.includes((user.email || '').toLowerCase());
    if (!isSuper) {
      throw new Error('Not a provisioned administrator.');
    }
    const newAdmin: AdminUser = {
      uid: user.uid,
      email: user.email || 'unknown@openframeitsolutions.com',
      displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Administrator'),
      role: 'Super Admin',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      isActive: true,
    };
    await setDoc(docRef, newAdmin);
    return newAdmin;
  } catch {
    const isSuper = SUPER_ADMIN_EMAILS.includes((user.email || '').toLowerCase());
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Administrator',
      role: isSuper ? 'Super Admin' : 'Sales Admin',
      createdAt: new Date().toISOString(),
      isActive: isSuper,
    };
  }
}

export async function getCurrentAdminUser(uid: string): Promise<AdminUser | null> {
  try {
    const snap = await getDoc(doc(db, 'admin_users', uid));
    if (snap.exists()) {
      return snap.data() as AdminUser;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Syncs the authenticated Firebase user into `users/{uid}` and creates/links
 * `student_profiles` or `teacher_profiles` without duplicating existing registrations.
 */
export async function syncLmsUserProfile(
  user: User,
  preferredRole?: LmsUserRole,
  extra?: { displayName?: string; specialization?: string; parentStudentEmail?: string }
): Promise<{
  userProfile: LmsUserProfile;
  studentProfile: StudentProfile | null;
  teacherProfile: TeacherProfile | null;
}> {
  const email = (user.email || '').toLowerCase();
  const displayName =
    extra?.displayName?.trim() ||
    user.displayName ||
    (email ? email.split('@')[0] : 'OpenFrame Learner');
  const now = new Date().toISOString();

  const userRef = doc(db, 'users', user.uid);
  let existingUser: LmsUserProfile | null = null;
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      existingUser = snap.data() as LmsUserProfile;
    }
  } catch {
    // ignore read miss
  }

  // Check existing student_registrations or teacher_registrations by email to avoid duplicates
  let matchedStudentReg: StudentRegistration | null = null;
  let matchedTeacherReg: TeacherRegistration | null = null;

  if (email) {
    try {
      const sSnap = await getDocs(
        query(collection(db, 'student_registrations'), where('emailAddress', '==', email), limit(1))
      );
      if (!sSnap.empty) {
        matchedStudentReg = { id: sSnap.docs[0].id, ...(sSnap.docs[0].data() as any) };
      }
    } catch {
      // ignore if restricted
    }

    try {
      const tSnap = await getDocs(
        query(collection(db, 'teacher_registrations'), where('email', '==', email), limit(1))
      );
      if (!tSnap.empty) {
        matchedTeacherReg = { id: tSnap.docs[0].id, ...(tSnap.docs[0].data() as any) };
      }
    } catch {
      // ignore if restricted
    }
  }

  const isSuper = SUPER_ADMIN_EMAILS.includes(email);
  const resolvedRole: LmsUserRole =
    preferredRole && preferredRole !== 'admin'
      ? preferredRole
      : existingUser?.role ||
        (isSuper ? 'admin' : matchedTeacherReg ? 'teacher' : 'student');

  const rolesSet = new Set<LmsUserRole>(existingUser?.roles || [resolvedRole === 'admin' ? 'student' : resolvedRole]);
  rolesSet.add(resolvedRole);
  if (isSuper) rolesSet.add('admin');
  if (matchedTeacherReg) rolesSet.add('teacher');

  const regNumber =
    existingUser?.registrationNumber ||
    matchedStudentReg?.id ||
    matchedTeacherReg?.id ||
    (resolvedRole === 'institution_admin'
      ? `OF-SCH-${user.uid.slice(0, 6).toUpperCase()}`
      : resolvedRole === 'teacher'
      ? `OF-TCH-${user.uid.slice(0, 6).toUpperCase()}`
      : resolvedRole === 'parent'
      ? `OF-PAR-${user.uid.slice(0, 6).toUpperCase()}`
      : resolvedRole === 'ngo_partner'
      ? `OF-NGO-${user.uid.slice(0, 6).toUpperCase()}`
      : resolvedRole === 'field_executive'
      ? `OF-FLD-${user.uid.slice(0, 6).toUpperCase()}`
      : resolvedRole === 'professional'
      ? `OF-PRO-${user.uid.slice(0, 6).toUpperCase()}`
      : `OF-STU-${user.uid.slice(0, 6).toUpperCase()}`);

  const profilePayload: LmsUserProfile = stripUndefinedDeep({
    uid: user.uid,
    email,
    displayName: matchedStudentReg?.fullName || matchedTeacherReg?.fullName || displayName,
    ...(user.photoURL ? { photoURL: user.photoURL } : {}),
    role: resolvedRole === 'admin' && !isSuper ? 'student' : resolvedRole,
    roles: Array.from(rolesSet).slice(0, 2),
    registrationNumber: regNumber,
    ...(existingUser?.institutionId ? { institutionId: existingUser.institutionId } : {}),
    ...(existingUser?.institutionName ? { institutionName: existingUser.institutionName } : {}),
    linkedStudentIds: existingUser?.linkedStudentIds || [],
    assignedCourseIds: existingUser?.assignedCourseIds || [],
    createdAt: existingUser?.createdAt || now,
    updatedAt: now,
  });

  try {
    await setDoc(userRef, profilePayload, { merge: true });
  } catch (err) {
    console.warn('User profile sync warning:', err);
  }

  let studentProfile: StudentProfile | null = null;
  let teacherProfile: TeacherProfile | null = null;

  if (profilePayload.role === 'student' || profilePayload.role === 'professional' || rolesSet.has('student')) {
    const stuRef = doc(db, 'student_profiles', user.uid);
    try {
      const stuSnap = await getDoc(stuRef);
      const existingStu = stuSnap.exists() ? (stuSnap.data() as StudentProfile) : null;
      studentProfile = {
        id: user.uid,
        uid: user.uid,
        studentId: user.uid,
        registrationNumber: existingStu?.registrationNumber || regNumber,
        fullName: existingStu?.fullName || matchedStudentReg?.fullName || profilePayload.displayName,
        email,
        mobileNumber: existingStu?.mobileNumber || matchedStudentReg?.mobileNumber || '',
        parentEmail: existingStu?.parentEmail || '',
        parentName: existingStu?.parentName || matchedStudentReg?.parentName || '',
        parentMobile: existingStu?.parentMobile || matchedStudentReg?.parentMobile || '',
        enrolledCourseIds: existingStu?.enrolledCourseIds || [],
        assignedTeacherId: existingStu?.assignedTeacherId || '',
        assignedTeacherName: existingStu?.assignedTeacherName || '',
        createdAt: existingStu?.createdAt || now,
        updatedAt: now,
      };
      await setDoc(stuRef, studentProfile, { merge: true });
    } catch (err) {
      console.warn('Student profile sync warning:', err);
    }
  }

  if (profilePayload.role === 'teacher' || rolesSet.has('teacher')) {
    const tchRef = doc(db, 'teacher_profiles', user.uid);
    try {
      const tchSnap = await getDoc(tchRef);
      const existingTch = tchSnap.exists() ? (tchSnap.data() as TeacherProfile) : null;
      teacherProfile = {
        id: user.uid,
        uid: user.uid,
        teacherId: user.uid,
        registrationNumber: existingTch?.registrationNumber || matchedTeacherReg?.id || `OF-TCH-${user.uid.slice(0, 6).toUpperCase()}`,
        fullName: existingTch?.fullName || matchedTeacherReg?.fullName || profilePayload.displayName,
        email,
        qualification: existingTch?.qualification || matchedTeacherReg?.qualification || 'Faculty Evaluator',
        specialization: existingTch?.specialization || matchedTeacherReg?.subjectSpecialization || extra?.specialization || 'Technology & Applied Sciences',
        assignedCourseIds: existingTch?.assignedCourseIds || [],
        assignedStudentIds: existingTch?.assignedStudentIds || [],
        meetingRoomUrl: existingTch?.meetingRoomUrl || `https://meet.jit.si/OpenFrame-Faculty-${user.uid.slice(0, 8)}`,
        isActive: true,
        createdAt: existingTch?.createdAt || now,
        updatedAt: now,
      };
      await setDoc(tchRef, teacherProfile, { merge: true });
    } catch (err) {
      console.warn('Teacher profile sync warning:', err);
    }
  }

  if (profilePayload.role === 'ngo_partner') {
    const ngoRef = doc(db, 'ngo_partners', user.uid);
    try {
      const ngoSnap = await getDoc(ngoRef);
      if (!ngoSnap.exists()) {
        await setDoc(ngoRef, {
          uid: user.uid,
          email,
          organizationName: profilePayload.displayName,
          contactPerson: profilePayload.displayName,
          registrationNumber: regNumber,
          verificationStatus: 'Pending Review',
          createdAt: now,
          updatedAt: now,
        });
      }
    } catch {
      // non-blocking
    }
  }

  if (profilePayload.role === 'field_executive') {
    const fldRef = doc(db, 'field_executives', user.uid);
    try {
      const fldSnap = await getDoc(fldRef);
      if (!fldSnap.exists()) {
        await setDoc(fldRef, {
          uid: user.uid,
          email,
          fullName: profilePayload.displayName,
          employeeCode: regNumber,
          assignedRegion: 'Karnataka',
          status: 'Active',
          createdAt: now,
          updatedAt: now,
        });
      }
    } catch {
      // non-blocking
    }
  }

  return { userProfile: profilePayload, studentProfile, teacherProfile };
}

export async function getAllAdminUsers(): Promise<AdminUser[]> {
  try {
    const snap = await getDocs(collection(db, 'admin_users'));
    return snap.docs.map(d => d.data() as AdminUser);
  } catch {
    return [];
  }
}

export async function updateAdminUserRole(targetUid: string, newRole: AdminRole): Promise<void> {
  const docRef = doc(db, 'admin_users', targetUid);
  await updateDoc(docRef, { role: newRole });
}

export async function toggleAdminUserActive(targetUid: string, isActive: boolean): Promise<void> {
  const docRef = doc(db, 'admin_users', targetUid);
  await updateDoc(docRef, { isActive });
}

// ====================================================
// ACTIVITY LOGGING
// ====================================================
export async function logActivity(
  action: string,
  collectionName: string,
  recordId?: string,
  details?: string
): Promise<void> {
  try {
    const currentUser = auth.currentUser;
    const adminEmail = currentUser?.email || 'system@openframeitsolutions.com';
    const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const logRef = doc(db, 'activity_logs', logId);
    await setDoc(logRef, {
      id: logId,
      adminEmail,
      adminRole: 'System User',
      action,
      collection: collectionName,
      recordId: recordId || '',
      details: details || '',
      timestamp: new Date().toISOString(),
    });
  } catch {
    // Non-blocking for offline or permission errors
  }
}

export async function getActivityLogs(): Promise<ActivityLog[]> {
  return getFirestoreCollection<ActivityLog>('activity_logs', 'timestamp');
}

// ====================================================
// FILE UPLOADS (Firebase Storage)
// ====================================================
export async function uploadDocumentToStorage(
  file: File,
  folder: 'resumes' | 'images' | 'documents' | 'projects' | 'presentations' | 'student-photos' = 'resumes'
): Promise<{ url: string; fileName: string; size: number }> {
  if (file.size > 25 * 1024 * 1024) {
    throw new Error('File exceeds maximum size limit of 25MB.');
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${folder}/${Date.now()}_${cleanName}`;
  const storageRef = ref(storage, filePath);

  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);
  return {
    url: downloadUrl,
    fileName: file.name,
    size: file.size,
  };
}

// ====================================================
// NOTIFICATIONS SYSTEM
// ====================================================
export interface NotificationPayload {
  category: 'Job Application' | 'Internship' | 'Student' | 'Software Quote' | 'Product' | 'Partnership' | 'HopeNest';
  title: string;
  senderName: string;
  senderEmail: string;
  details: string;
}

export async function triggerAdminNotification(notification: NotificationPayload): Promise<void> {
  try {
    console.info(`[OpenFrame Admin Notification] New ${notification.category} received from ${notification.senderName} (${notification.senderEmail}): ${notification.title}`);
    // Log to internal activity registry
    await logActivity(
      `New Inbound Intake: ${notification.category}`,
      'notifications',
      undefined,
      `${notification.senderName} (${notification.senderEmail}) - ${notification.title}`
    );
  } catch {
    // Non-blocking
  }
}

// ====================================================
// GENERIC FIRESTORE DISPATCHER & FORM HELPERS
// ====================================================

// Generic submission function with full validation, unique ID, timestamps and initial status
export async function submitToFirestoreCollection<T extends Record<string, any>>(
  collectionName: string,
  prefix: string,
  payload: T
): Promise<string> {
  const safePrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 24);
  const docId = `${safePrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`.slice(0, 120);
  const record = stripUndefinedDeep({
    ...payload,
    id: docId,
    submittedAt: payload.submittedAt || new Date().toISOString(),
    status: payload.status || 'New',
  });

  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, record);
    return docId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionName);
  }
}

// Generic query helper
export async function getFirestoreCollection<T>(collectionName: string, orderField?: string): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    let snap;
    if (orderField) {
      try {
        const q = query(colRef, orderBy(orderField, 'desc'), limit(200));
        snap = await getDocs(q);
      } catch {
        snap = await getDocs(colRef);
      }
    } else {
      snap = await getDocs(colRef);
    }
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  } catch (err) {
    console.warn(`Query for ${collectionName} returned warning:`, err);
    return [];
  }
}

// Generic status & notes updater
export async function updateRecordInFirestore(
  collectionName: string,
  docId: string,
  updates: Record<string, any>
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, stripUndefinedDeep(updates));
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${collectionName}/${docId}`);
  }
}

// Generic delete helper
export async function deleteRecordFromFirestore(collectionName: string, docId: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${docId}`);
  }
}

export const updateDocumentInFirestore = updateRecordInFirestore;
export const deleteDocumentInFirestore = deleteRecordFromFirestore;

// ====================================================
// EXPLICIT WRAPPER METHODS FOR ALL FORM TYPES
// ====================================================

// 1. Contact Messages
export const submitContactMessage = (data: Omit<ContactMessage, 'id'>) =>
  submitToFirestoreCollection('contact_messages', 'msg', data);
export const submitContactMessageToFirestore = submitContactMessage;

// 2. General Enquiries
export const submitGeneralEnquiry = (data: Omit<GeneralEnquiry, 'id'>) =>
  submitToFirestoreCollection('general_enquiries', 'gen', data);
export const submitGeneralEnquiryToFirestore = submitGeneralEnquiry;

// 3. Software Enquiries
export const submitSoftwareEnquiry = (data: Omit<SoftwareEnquiryItem, 'id'>) =>
  submitToFirestoreCollection('software_enquiries', 'soft', data);
export const submitSoftwareEnquiryToFirestore = submitSoftwareEnquiry;

// 4. Business Enquiries
export const submitBusinessEnquiry = (data: Omit<BusinessEnquiry, 'id'>) =>
  submitToFirestoreCollection('business_enquiries', 'biz', data);
export const submitBusinessEnquiryToFirestore = submitBusinessEnquiry;

// 5. Product Enquiries
export const submitProductEnquiry = (data: Omit<ProductEnquiry, 'id'>) =>
  submitToFirestoreCollection('product_enquiries', 'pe', data);

// 6. Student Registrations
export const submitStudentRegistration = (data: Omit<StudentRegistration, 'id'>) =>
  submitToFirestoreCollection('student_registrations', 'std', data);

// 7. Teacher Registrations
export const submitTeacherRegistration = (data: Omit<TeacherRegistration, 'id'>) =>
  submitToFirestoreCollection('teacher_registrations', 'teach', data);

// 8. Job Applications
export const submitJobApplication = (data: Omit<JobApplication, 'id'>) =>
  submitToFirestoreCollection('job_applications', 'job', data);

// 9. Internship Applications
export const submitInternshipApplication = (data: Omit<InternshipApplication, 'id'>) =>
  submitToFirestoreCollection('internship_applications', 'intern', data);

// 10. Professional Registrations
export const submitProfessionalRegistration = (data: Omit<ProfessionalRegistration, 'id'>) =>
  submitToFirestoreCollection('professional_registrations', 'prof', data);

// 11. School Partnerships
export const submitSchoolPartnerEnquiry = (data: Omit<SchoolPartnerEnquiry, 'id'>) =>
  submitToFirestoreCollection('school_partnership_enquiries', 'school', data);

// 12. NGO Partnerships
export const submitNgoPartnerEnquiry = (data: Omit<NgoPartnerEnquiry, 'id'>) =>
  submitToFirestoreCollection('ngo_partnership_enquiries', 'ngo', data);

// 13. General Work Enquiries
export const submitGeneralWorkEnquiry = (data: Omit<GeneralWorkEnquiry, 'id'>) =>
  submitToFirestoreCollection('general_work_enquiries', 'work', data);

// 14. HopeNest Volunteers
export const submitHopeNestVolunteer = (data: Omit<HopeNestVolunteer, 'id'>) =>
  submitToFirestoreCollection('hopenest_volunteers', 'vol', data);

// 15. HopeNest Donations
export const submitHopeNestDonation = (data: Omit<HopeNestDonationEnquiry, 'id'>) =>
  submitToFirestoreCollection('hopenest_donation_enquiries', 'don', data);

// 16. HopeNest Participants
export const submitHopeNestParticipant = (data: Omit<HopeNestParticipant, 'id'>) =>
  submitToFirestoreCollection('hopenest_participants', 'part', data);

// 17. Newsletter Subscribers
export async function subscribeNewsletter(email: string, fullName?: string, source?: string): Promise<{ success: boolean; duplicate?: boolean }> {
  const normalized = email.trim().toLowerCase().slice(0, 120);
  if (!normalized || !normalized.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }
  const docId = `sub-${normalized.replace(/[^a-z0-9]/g, '_')}`.slice(0, 120);
  const docRef = doc(db, 'newsletter_subscribers', docId);
  const payload = stripUndefinedDeep({
    id: docId,
    ...(fullName?.trim() ? { fullName: fullName.trim().slice(0, 100) } : {}),
    emailAddress: normalized,
    consentAccepted: true,
    subscribedAt: new Date().toISOString(),
    source: source || 'Website',
  });

  try {
    await setDoc(docRef, payload);
    return { success: true };
  } catch (err: any) {
    const msg = String(err?.code || err?.message || '').toLowerCase();
    // Since non-admins cannot read/update existing newsletter_subscribers docs, an existing email returns permission-denied
    if (msg.includes('permission-denied') || msg.includes('already-exists')) {
      return { success: false, duplicate: true };
    }
    handleFirestoreError(err, OperationType.CREATE, 'newsletter_subscribers');
  }
}

// 18. Branches
export async function getBranchesFromFirestore(): Promise<BranchLocation[]> {
  return getFirestoreCollection<BranchLocation>('branches', 'name');
}

export async function saveBranchToFirestore(branch: BranchLocation): Promise<void> {
  const docRef = doc(db, 'branches', branch.id);
  await setDoc(docRef, stripUndefinedDeep(branch));
}

export async function deleteBranchFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, 'branches', id);
  await deleteDoc(docRef);
}

// 19. Course Seeding Utilities
export { generateInitial100Courses, seedCoursesToFirestore } from './courseSeedService';
export type { SeedResult } from './courseSeedService';

