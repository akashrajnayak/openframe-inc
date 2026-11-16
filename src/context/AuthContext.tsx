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
  SUPER_ADMIN_EMAILS
} from '../services/firebase';
import {
  AdminUser,
  AdminRole,
  LmsUserProfile,
  LmsUserRole,
  StudentProfile,
  TeacherProfile
} from '../types';

interface AuthContextType {
  currentUser: User | null;
  adminProfile: AdminUser | null;
  lmsUser: LmsUserProfile | null;
  studentProfile: StudentProfile | null;
  teacherProfile: TeacherProfile | null;
  portalRole: LmsUserRole;
  loading: boolean;
  role: AdminRole | null;
  isSuperAdmin: boolean;
  hasRoleAccess: (requiredRole: AdminRole) => boolean;
  loginGoogle: () => Promise<void>;
  loginEmail: (email: string, pass: string) => Promise<void>;
  loginPortalGoogle: (preferredRole?: LmsUserRole) => Promise<LmsUserProfile>;
  loginPortalEmail: (email: string, pass: string, preferredRole?: LmsUserRole) => Promise<LmsUserProfile>;
  registerPortalEmail: (
    name: string,
    email: string,
    pass: string,
    preferredRole: LmsUserRole,
    extra?: { specialization?: string; parentStudentEmail?: string }
  ) => Promise<LmsUserProfile>;
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

  const hydrateUserState = async (user: User, preferredRole?: LmsUserRole) => {
    const email = (user.email || '').toLowerCase();
    const isSuper = SUPER_ADMIN_EMAILS.includes(email);

    let adminRec = await getCurrentAdminUser(user.uid);
    if (!adminRec && isSuper) {
      adminRec = await ensureAdminRecord(user);
    }
    setAdminProfile(adminRec);

    const synced = await syncLmsUserProfile(user, preferredRole);
    setLmsUser(synced.userProfile);
    setStudentProfile(synced.studentProfile);
    setTeacherProfile(synced.teacherProfile);
    setPortalRole(preferredRole || synced.userProfile.role);
    return synced.userProfile;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          await hydrateUserState(user);
        } catch (err) {
          console.warn('Failed to hydrate user profiles:', err);
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

  const loginGoogle = async () => {
    const user = await loginWithGoogle();
    const profile = await ensureAdminRecord(user);
    setAdminProfile(profile);
    await hydrateUserState(user);
  };

  const loginEmail = async (email: string, pass: string) => {
    const user = await loginWithEmail(email, pass);
    const profile = await ensureAdminRecord(user);
    setAdminProfile(profile);
    await hydrateUserState(user);
  };

  const loginPortalGoogle = async (preferredRole?: LmsUserRole): Promise<LmsUserProfile> => {
    const user = await loginWithGoogle();
    return hydrateUserState(user, preferredRole);
  };

  const loginPortalEmail = async (
    email: string,
    pass: string,
    preferredRole?: LmsUserRole
  ): Promise<LmsUserProfile> => {
    const user = await loginWithEmail(email, pass);
    return hydrateUserState(user, preferredRole);
  };

  const registerPortalEmail = async (
    name: string,
    email: string,
    pass: string,
    preferredRole: LmsUserRole,
    extra?: { specialization?: string; parentStudentEmail?: string }
  ): Promise<LmsUserProfile> => {
    const user = await registerPortalAccountWithEmail(name, email, pass);
    const synced = await syncLmsUserProfile(user, preferredRole, {
      displayName: name,
      specialization: extra?.specialization,
      parentStudentEmail: extra?.parentStudentEmail,
    });
    setLmsUser(synced.userProfile);
    setStudentProfile(synced.studentProfile);
    setTeacherProfile(synced.teacherProfile);
    setPortalRole(synced.userProfile.role);
    return synced.userProfile;
  };

  const switchPortalRole = (newRole: LmsUserRole) => {
    setPortalRole(newRole);
  };

  const logout = async () => {
    await logoutAdmin();
    setCurrentUser(null);
    setAdminProfile(null);
    setLmsUser(null);
    setStudentProfile(null);
    setTeacherProfile(null);
  };

  const sendPasswordReset = async (email: string) => {
    await resetAdminPassword(email);
  };

  const isSuperAdmin =
    adminProfile?.role === 'Super Admin' ||
    currentUser?.email?.toLowerCase() === 'akashrajnayak@gmail.com' ||
    currentUser?.email?.toLowerCase() === 'admin@openframeitsolutions.com';

  const hasRoleAccess = (requiredRole: AdminRole): boolean => {
    if (isSuperAdmin) return true;
    if (!adminProfile || !adminProfile.isActive) return false;
    return adminProfile.role === requiredRole;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        adminProfile,
        lmsUser,
        studentProfile,
        teacherProfile,
        portalRole,
        loading,
        role: adminProfile?.role || null,
        isSuperAdmin,
        hasRoleAccess,
        loginGoogle,
        loginEmail,
        loginPortalGoogle,
        loginPortalEmail,
        registerPortalEmail,
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
