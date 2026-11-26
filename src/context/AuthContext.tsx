import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  ensureAdminRecord,
  formatFirebaseAuthError,
  getCurrentAdminUser,
  loginWithGoogle,
  loginWithEmail,
  registerPortalAccountWithEmail,
  logoutAdmin,
  resetAdminPassword,
  syncLmsUserProfile,
  SUPER_ADMIN_EMAILS,
} from '../services/firebase';
import {
  AdminUser,
  AdminRole,
  LmsUserProfile,
  LmsUserRole,
  SchoolStudentEnrollment,
  StudentProfile,
  TeacherProfile,
} from '../types';
import { getSchoolEnrollment, isSchoolQualificationLabel } from '../services/schoolService';

export function getAuthorizedDashboardPath(role: LmsUserRole): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'institution_admin':
      return '/partner/school/dashboard';
    case 'ngo_partner':
      return '/ngo/dashboard';
    case 'field_executive':
      return '/field/dashboard';
    case 'professional':
      return '/professional/dashboard';
    case 'teacher':
      return '/teacher/dashboard';
    case 'parent':
      return '/parent/dashboard';
    case 'student':
    default:
      return '/student/dashboard';
  }
}

export interface AdminCredentialSession {
  username: string;
  displayName: string;
  email: string;
  role: AdminRole;
  expiresAt?: string;
}

interface AuthContextType {
  currentUser: User | null;
  adminProfile: AdminUser | null;
  adminCredentialSession: AdminCredentialSession | null;
  adminBearerToken: string | null;
  isAdminSession: boolean;
  lmsUser: LmsUserProfile | null;
  studentProfile: StudentProfile | null;
  schoolEnrollment: SchoolStudentEnrollment | null;
  isSchoolStudent: boolean;
  teacherProfile: TeacherProfile | null;
  portalRole: LmsUserRole;
  authorizedDashboardPath: string;
  loading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  role: AdminRole | null;
  isSuperAdmin: boolean;
  hasRoleAccess: (requiredRole: AdminRole) => boolean;
  loginGoogle: (rememberMe?: boolean) => Promise<void>;
  loginEmail: (email: string, pass: string, rememberMe?: boolean) => Promise<void>;
  loginAdminCredentials: (username: string, password: string) => Promise<AdminCredentialSession>;
  bootstrapAdminCredentials: (username: string, password: string) => Promise<AdminCredentialSession>;
  loginPortalGoogle: (expectedRole?: LmsUserRole, rememberMe?: boolean) => Promise<LmsUserProfile>;
  loginPortalEmail: (email: string, pass: string, expectedRole?: LmsUserRole, rememberMe?: boolean) => Promise<LmsUserProfile>;
  registerPortalEmail: (
    name: string,
    email: string,
    pass: string,
    selectedRole: LmsUserRole,
    extra?: {
      specialization?: string;
      parentStudentEmail?: string;
    }
  ) => Promise<LmsUserProfile>;
  refreshUserProfile: (expectedRole?: LmsUserRole) => Promise<LmsUserProfile | null>;
  refreshSchoolEnrollment: () => Promise<SchoolStudentEnrollment | null>;
  switchPortalRole: (newRole: LmsUserRole) => void;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminUser | null>(null);
  const [adminCredentialSession, setAdminCredentialSession] = useState<AdminCredentialSession | null>(null);
  const [adminBearerToken, setAdminBearerToken] = useState<string | null>(null);
  const [lmsUser, setLmsUser] = useState<LmsUserProfile | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [schoolEnrollment, setSchoolEnrollment] = useState<SchoolStudentEnrollment | null>(null);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [portalRole, setPortalRole] = useState<LmsUserRole>('student');
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Prevents onAuthStateChanged from running a redundant/raced hydration pass while
  // loginPortalGoogle / loginPortalEmail / registerPortalEmail is explicitly hydrating with expectedRole.
  const manualAuthDepthRef = useRef<number>(0);

  const clearAuthError = () => setAuthError(null);

  const hydrateUserState = async (
    user: User,
    expectedRole?: LmsUserRole,
    extra?: { displayName?: string; specialization?: string; parentStudentEmail?: string }
  ): Promise<LmsUserProfile> => {
    const email = (user.email || '').toLowerCase();
    const isSuper = SUPER_ADMIN_EMAILS.includes(email);

    let adminRec = await getCurrentAdminUser(user.uid);
    if (!adminRec && isSuper) {
      adminRec = await ensureAdminRecord(user);
    }

    if (adminRec && adminRec.isActive === false) {
      throw new Error('Your administrator account has been disabled. Contact root administration.');
    }

    const [synced, schoolEnr] = await Promise.all([
      syncLmsUserProfile(user, expectedRole, extra),
      getSchoolEnrollment(user.uid).catch(() => null),
    ]);

    setCurrentUser(user);
    setAdminProfile(adminRec);
    setLmsUser(synced.userProfile);
    setStudentProfile(synced.studentProfile);
    setSchoolEnrollment(schoolEnr);
    setTeacherProfile(synced.teacherProfile);
    setPortalRole(synced.userProfile.role);
    setAuthError(null);
    return synced.userProfile;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (manualAuthDepthRef.current > 0) {
        if (!user) {
          setCurrentUser(null);
        }
        setLoading(false);
        return;
      }

      setCurrentUser(user);
      if (user) {
        try {
          await hydrateUserState(user);
        } catch (err: any) {
          console.warn('Session restoration blocked:', err?.message || err);
          setAuthError(err?.message || 'Unable to restore session.');
          await logoutAdmin().catch(() => {});
          setCurrentUser(null);
          setAdminProfile(null);
          setLmsUser(null);
          setStudentProfile(null);
          setSchoolEnrollment(null);
          setTeacherProfile(null);
        }
      } else {
        setAdminProfile(null);
        setLmsUser(null);
        setStudentProfile(null);
        setSchoolEnrollment(null);
        setTeacherProfile(null);
        setPortalRole('student');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginGoogle = async (rememberMe = true) => {
    setAuthError(null);
    manualAuthDepthRef.current += 1;
    try {
      const user = await loginWithGoogle(rememberMe);
      const profile = await ensureAdminRecord(user);
      setAdminProfile(profile);
      await hydrateUserState(user, 'admin');
    } catch (err: any) {
      await logoutAdmin().catch(() => {});
      setCurrentUser(null);
      setAdminProfile(null);
      setLmsUser(null);
      setAuthError(formatFirebaseAuthError(err, 'google'));
      throw err;
    } finally {
      manualAuthDepthRef.current = Math.max(0, manualAuthDepthRef.current - 1);
    }
  };

  const loginEmail = async (email: string, pass: string, rememberMe = true) => {
    setAuthError(null);
    manualAuthDepthRef.current += 1;
    try {
      const user = await loginWithEmail(email, pass, rememberMe);
      const profile = await ensureAdminRecord(user);
      setAdminProfile(profile);
      await hydrateUserState(user, 'admin');
    } catch (err: any) {
      await logoutAdmin().catch(() => {});
      setCurrentUser(null);
      setAdminProfile(null);
      setLmsUser(null);
      setAuthError(formatFirebaseAuthError(err, 'email'));
      throw err;
    } finally {
      manualAuthDepthRef.current = Math.max(0, manualAuthDepthRef.current - 1);
    }
  };

  const loginAdminCredentials = async (
    username: string,
    password: string
  ): Promise<AdminCredentialSession> => {
    setAuthError(null);
    const res = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok || !data?.token || !data?.admin) {
      const msg = data?.error || 'Invalid administrator username or password.';
      setAuthError(msg);
      throw new Error(msg);
    }
    const session: AdminCredentialSession = {
      username: data.admin.username,
      displayName: data.admin.displayName || `Admin (${data.admin.username})`,
      email: data.admin.email || `${data.admin.username}@openframeitsolutions.com`,
      role: (data.admin.role as AdminRole) || 'Super Admin',
      expiresAt: data.admin.expiresAt,
    };
    setAdminBearerToken(data.token);
    setAdminCredentialSession(session);
    return session;
  };

  const bootstrapAdminCredentials = async (
    username: string,
    password: string
  ): Promise<AdminCredentialSession> => {
    setAuthError(null);
    const res = await fetch('/api/admin/auth/bootstrap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok || !data?.token || !data?.admin) {
      const msg = data?.error || 'Could not configure administrator credentials.';
      setAuthError(msg);
      throw new Error(msg);
    }
    const session: AdminCredentialSession = {
      username: data.admin.username,
      displayName: data.admin.displayName || `Admin (${data.admin.username})`,
      email: data.admin.email || `${data.admin.username}@openframeitsolutions.com`,
      role: (data.admin.role as AdminRole) || 'Super Admin',
      expiresAt: data.admin.expiresAt,
    };
    setAdminBearerToken(data.token);
    setAdminCredentialSession(session);
    return session;
  };

  const loginPortalGoogle = async (expectedRole?: LmsUserRole, rememberMe = true): Promise<LmsUserProfile> => {
    setAuthError(null);
    manualAuthDepthRef.current += 1;
    try {
      const user = await loginWithGoogle(rememberMe);
      return await hydrateUserState(user, expectedRole);
    } catch (err: any) {
      if (auth.currentUser) {
        await logoutAdmin().catch(() => {});
      }
      setCurrentUser(null);
      setAdminProfile(null);
      setLmsUser(null);
      setStudentProfile(null);
      setSchoolEnrollment(null);
      setTeacherProfile(null);
      const friendly = formatFirebaseAuthError(err, 'google');
      setAuthError(friendly);
      throw err;
    } finally {
      manualAuthDepthRef.current = Math.max(0, manualAuthDepthRef.current - 1);
    }
  };

  const loginPortalEmail = async (
    email: string,
    pass: string,
    expectedRole?: LmsUserRole,
    rememberMe = true
  ): Promise<LmsUserProfile> => {
    setAuthError(null);
    manualAuthDepthRef.current += 1;
    try {
      const user = await loginWithEmail(email, pass, rememberMe);
      return await hydrateUserState(user, expectedRole);
    } catch (err: any) {
      if (auth.currentUser) {
        await logoutAdmin().catch(() => {});
      }
      setCurrentUser(null);
      setAdminProfile(null);
      setLmsUser(null);
      setStudentProfile(null);
      setSchoolEnrollment(null);
      setTeacherProfile(null);
      const friendly = formatFirebaseAuthError(err, 'email');
      setAuthError(friendly);
      throw err;
    } finally {
      manualAuthDepthRef.current = Math.max(0, manualAuthDepthRef.current - 1);
    }
  };

  const registerPortalEmail = async (
    name: string,
    email: string,
    pass: string,
    selectedRole: LmsUserRole,
    extra?: {
      specialization?: string;
      parentStudentEmail?: string;
    }
  ): Promise<LmsUserProfile> => {
    setAuthError(null);
    if (selectedRole === 'admin') {
      throw new Error('Administrator accounts cannot be created via self-registration.');
    }
    manualAuthDepthRef.current += 1;
    try {
      const user = await registerPortalAccountWithEmail(name, email, pass);
      return await hydrateUserState(user, selectedRole, {
        displayName: name,
        specialization: extra?.specialization,
        parentStudentEmail: extra?.parentStudentEmail,
      });
    } catch (err: any) {
      if (auth.currentUser) {
        await logoutAdmin().catch(() => {});
      }
      setCurrentUser(null);
      const friendly = formatFirebaseAuthError(err, 'register');
      setAuthError(friendly);
      throw err;
    } finally {
      manualAuthDepthRef.current = Math.max(0, manualAuthDepthRef.current - 1);
    }
  };

  const refreshUserProfile = async (expectedRole?: LmsUserRole): Promise<LmsUserProfile | null> => {
    if (!auth.currentUser) return null;
    try {
      return await hydrateUserState(auth.currentUser, expectedRole);
    } catch (err: any) {
      await logoutAdmin().catch(() => {});
      setAuthError(err?.message || 'Session validation failed.');
      throw err;
    }
  };

  const refreshSchoolEnrollment = async (): Promise<SchoolStudentEnrollment | null> => {
    if (!auth.currentUser) return null;
    const enr = await getSchoolEnrollment(auth.currentUser.uid).catch(() => null);
    setSchoolEnrollment(enr);
    return enr;
  };

  const switchPortalRole = (newRole: LmsUserRole) => {
    if (lmsUser && (lmsUser.role === newRole || lmsUser.roles?.includes(newRole))) {
      setPortalRole(newRole);
    }
  };

  const logout = async () => {
    setAuthError(null);
    const activeToken = adminBearerToken;
    setAdminBearerToken(null);
    setAdminCredentialSession(null);
    if (activeToken) {
      fetch('/api/admin/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${activeToken}` },
      }).catch(() => {});
    }
    try {
      localStorage.removeItem('openframe_student_active_route');
      localStorage.removeItem('openframe_student_active_uid');
    } catch {
      // ignore storage errors
    }
    await logoutAdmin().catch(() => {});
    setCurrentUser(null);
    setAdminProfile(null);
    setLmsUser(null);
    setStudentProfile(null);
    setSchoolEnrollment(null);
    setTeacherProfile(null);
    setPortalRole('student');
  };

  const sendPasswordReset = async (email: string) => {
    await resetAdminPassword(email);
  };

  const isSuperAdmin = Boolean(
    adminProfile?.role === 'Super Admin' ||
      adminCredentialSession?.role === 'Super Admin' ||
      lmsUser?.role === 'admin' ||
      currentUser?.email?.toLowerCase() === 'akashrajnayak@gmail.com' ||
      currentUser?.email?.toLowerCase() === 'admin@openframeitsolutions.com'
  );

  const isAdminSession = Boolean(
    adminCredentialSession ||
      (currentUser && (adminProfile?.isActive || isSuperAdmin))
  );

  const hasRoleAccess = (requiredRole: AdminRole): boolean => {
    if (isSuperAdmin) return true;
    if (!adminProfile || !adminProfile.isActive) return false;
    return adminProfile.role === requiredRole;
  };

  const activeRole = isAdminSession ? 'admin' : (lmsUser?.role || portalRole);
  const isSchoolStudent = Boolean(
    activeRole === 'student' &&
      (schoolEnrollment || isSchoolQualificationLabel(studentProfile?.qualification))
  );

  const authorizedDashboardPath =
    activeRole === 'student' && isSchoolStudent
      ? '/school?tab=daily'
      : getAuthorizedDashboardPath(activeRole);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        adminProfile,
        adminCredentialSession,
        adminBearerToken,
        isAdminSession,
        lmsUser,
        studentProfile,
        schoolEnrollment,
        isSchoolStudent,
        teacherProfile,
        portalRole,
        authorizedDashboardPath,
        loading,
        authError,
        clearAuthError,
        role: adminProfile?.role || adminCredentialSession?.role || null,
        isSuperAdmin,
        hasRoleAccess,
        loginGoogle,
        loginEmail,
        loginAdminCredentials,
        bootstrapAdminCredentials,
        loginPortalGoogle,
        loginPortalEmail,
        registerPortalEmail,
        refreshUserProfile,
        refreshSchoolEnrollment,
        switchPortalRole,
        logout,
        sendPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
