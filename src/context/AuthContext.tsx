import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  ensureAdminRecord,
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
  StudentProfile,
  TeacherProfile,
} from '../types';

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

interface AuthContextType {
  currentUser: User | null;
  adminProfile: AdminUser | null;
  lmsUser: LmsUserProfile | null;
  studentProfile: StudentProfile | null;
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
  switchPortalRole: (newRole: LmsUserRole) => void;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminUser | null>(null);
  const [lmsUser, setLmsUser] = useState<LmsUserProfile | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [portalRole, setPortalRole] = useState<LmsUserRole>('student');
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = () => setAuthError(null);

  const hydrateUserState = async (
    user: User,
    expectedRole?: LmsUserRole
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

    const synced = await syncLmsUserProfile(user, expectedRole);

    setAdminProfile(adminRec);
    setLmsUser(synced.userProfile);
    setStudentProfile(synced.studentProfile);
    setTeacherProfile(synced.teacherProfile);
    setPortalRole(synced.userProfile.role);
    setAuthError(null);
    return synced.userProfile;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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
          setTeacherProfile(null);
        }
      } else {
        setAdminProfile(null);
        setLmsUser(null);
        setStudentProfile(null);
        setTeacherProfile(null);
        setPortalRole('student');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginGoogle = async (rememberMe = true) => {
    setAuthError(null);
    const user = await loginWithGoogle(rememberMe);
    try {
      const profile = await ensureAdminRecord(user);
      setAdminProfile(profile);
      await hydrateUserState(user, 'admin');
    } catch (err: any) {
      await logoutAdmin().catch(() => {});
      setCurrentUser(null);
      setAdminProfile(null);
      setLmsUser(null);
      setAuthError(err?.message || 'Administrator authentication denied.');
      throw err;
    }
  };

  const loginEmail = async (email: string, pass: string, rememberMe = true) => {
    setAuthError(null);
    const user = await loginWithEmail(email, pass, rememberMe);
    try {
      const profile = await ensureAdminRecord(user);
      setAdminProfile(profile);
      await hydrateUserState(user, 'admin');
    } catch (err: any) {
      await logoutAdmin().catch(() => {});
      setCurrentUser(null);
      setAdminProfile(null);
      setLmsUser(null);
      setAuthError(err?.message || 'Administrator authentication denied.');
      throw err;
    }
  };

  const loginPortalGoogle = async (expectedRole?: LmsUserRole, rememberMe = true): Promise<LmsUserProfile> => {
    setAuthError(null);
    const user = await loginWithGoogle(rememberMe);
    try {
      return await hydrateUserState(user, expectedRole);
    } catch (err: any) {
      await logoutAdmin().catch(() => {});
      setCurrentUser(null);
      setAdminProfile(null);
      setLmsUser(null);
      setStudentProfile(null);
      setTeacherProfile(null);
      setAuthError(err?.message || 'Access denied for this portal.');
      throw err;
    }
  };

  const loginPortalEmail = async (
    email: string,
    pass: string,
    expectedRole?: LmsUserRole,
    rememberMe = true
  ): Promise<LmsUserProfile> => {
    setAuthError(null);
    const user = await loginWithEmail(email, pass, rememberMe);
    try {
      return await hydrateUserState(user, expectedRole);
    } catch (err: any) {
      await logoutAdmin().catch(() => {});
      setCurrentUser(null);
      setAdminProfile(null);
      setLmsUser(null);
      setStudentProfile(null);
      setTeacherProfile(null);
      setAuthError(err?.message || 'Access denied for this portal.');
      throw err;
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
    const user = await registerPortalAccountWithEmail(name, email, pass);
    try {
      const synced = await syncLmsUserProfile(user, selectedRole, {
        displayName: name,
        specialization: extra?.specialization,
        parentStudentEmail: extra?.parentStudentEmail,
      });
      setLmsUser(synced.userProfile);
      setStudentProfile(synced.studentProfile);
      setTeacherProfile(synced.teacherProfile);
      setPortalRole(synced.userProfile.role);
      return synced.userProfile;
    } catch (err: any) {
      await logoutAdmin().catch(() => {});
      setAuthError(err?.message || 'Account registration blocked.');
      throw err;
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

  const switchPortalRole = (newRole: LmsUserRole) => {
    if (lmsUser && (lmsUser.role === newRole || lmsUser.roles?.includes(newRole))) {
      setPortalRole(newRole);
    }
  };

  const logout = async () => {
    setAuthError(null);
    await logoutAdmin();
    setCurrentUser(null);
    setAdminProfile(null);
    setLmsUser(null);
    setStudentProfile(null);
    setTeacherProfile(null);
    setPortalRole('student');
  };

  const sendPasswordReset = async (email: string) => {
    await resetAdminPassword(email);
  };

  const isSuperAdmin = Boolean(
    adminProfile?.role === 'Super Admin' ||
      lmsUser?.role === 'admin' ||
      currentUser?.email?.toLowerCase() === 'akashrajnayak@gmail.com' ||
      currentUser?.email?.toLowerCase() === 'admin@openframeitsolutions.com'
  );

  const hasRoleAccess = (requiredRole: AdminRole): boolean => {
    if (isSuperAdmin) return true;
    if (!adminProfile || !adminProfile.isActive) return false;
    return adminProfile.role === requiredRole;
  };

  const authorizedDashboardPath = getAuthorizedDashboardPath(lmsUser?.role || portalRole);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        adminProfile,
        lmsUser,
        studentProfile,
        teacherProfile,
        portalRole,
        authorizedDashboardPath,
        loading,
        authError,
        clearAuthError,
        role: adminProfile?.role || null,
        isSuperAdmin,
        hasRoleAccess,
        loginGoogle,
        loginEmail,
        loginPortalGoogle,
        loginPortalEmail,
        registerPortalEmail,
        refreshUserProfile,
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
