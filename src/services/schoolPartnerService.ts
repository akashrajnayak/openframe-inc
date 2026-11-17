import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
} from 'firebase/firestore';
import * as XLSX from 'xlsx';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import {
  auth,
  db,
  handleFirestoreError,
  OperationType,
  stripUndefinedDeep,
  uploadDocumentToStorage,
} from './firebase';
import {
  AssessmentDimension,
  MarketplaceCourse,
  SchoolApplicationStatus,
  SchoolAssessmentAssignment,
  SchoolDocumentUpload,
  SchoolInstitution,
  SchoolIqEqSqResult,
  SchoolTenantAnnouncement,
  SchoolProgramEnrollment,
  SchoolStaffMember,
  SchoolTenantAttendanceRecord,
  SchoolTenantAuditLog,
  SchoolTenantCertificate,
  SchoolTenantClass,
  SchoolTenantPayment,
  SchoolTenantStudent,
} from '../types';
import {
  IqEqSqGradeBand,
  NON_CLINICAL_EDUCATIONAL_DISCLAIMER,
} from '../data/iqEqSqQuestionsData';

function sanitizeId(raw: string): string {
  return String(raw || '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
}

function generateCryptoSerial(prefix: string): string {
  const bytes = new Uint8Array(6);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${hex}`;
}

async function getBearerHeaders(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (user) {
    const token = await user.getIdToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export interface BulkStudentValidationRow {
  rowNumber: number;
  fullName: string;
  className: string;
  section: string;
  classId: string;
  rollNumber: string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  dob: string;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  guardianEmail: string;
}

export interface BulkStudentFailedRow {
  rowNumber: number;
  rawName: string;
  rawPhone: string;
  reason: string;
}

export interface BulkStudentParseResult {
  totalRows: number;
  validRows: BulkStudentValidationRow[];
  failedRows: BulkStudentFailedRow[];
  errorCsvText: string;
}

export interface SchoolAuditActor {
  uid: string;
  email: string;
  role: string;
}

class SchoolPartnerService {
  // -------------------------------------------------------------
  // Audit Logging (Immutable Trail)
  // -------------------------------------------------------------
  async writeAuditLog(params: {
    institutionId: string;
    institutionAdminUid: string;
    assignedTeacherUids?: string[];
    actor: SchoolAuditActor;
    action: string;
    entityType: string;
    entityId: string;
    summary: string;
  }): Promise<void> {
    const id = sanitizeId(`sp_log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
    const entry: SchoolTenantAuditLog & { assignedTeacherUids?: string[] } = {
      id,
      institutionId: params.institutionId,
      institutionAdminUid: params.institutionAdminUid,
      ...(params.assignedTeacherUids ? { assignedTeacherUids: params.assignedTeacherUids } : {}),
      actorUid: params.actor.uid,
      actorEmail: params.actor.email.slice(0, 120),
      actorRole: params.actor.role.slice(0, 40),
      action: params.action.slice(0, 120),
      entityType: params.entityType.slice(0, 80),
      entityId: params.entityId.slice(0, 128),
      summary: params.summary.slice(0, 500),
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'school_partner_audit_logs', id), stripUndefinedDeep(entry));
    } catch (err) {
      console.warn('Non-blocking school audit log error:', err);
    }
  }

  async getSchoolAuditLogs(institutionId: string): Promise<SchoolTenantAuditLog[]> {
    try {
      const q = query(
        collection(db, 'school_partner_audit_logs'),
        where('institutionId', '==', institutionId),
        limit(200)
      );
      const snap = await getDocs(q);
      return snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) } as SchoolTenantAuditLog))
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'school_partner_audit_logs');
    }
  }

  // -------------------------------------------------------------
  // 1. Onboarding, Registration & Governance
  // -------------------------------------------------------------
  async getMySchoolInstitution(uid: string): Promise<SchoolInstitution | null> {
    try {
      const ownerQuery = query(
        collection(db, 'institutions'),
        where('adminUid', '==', uid),
        limit(5)
      );
      const ownerSnap = await getDocs(ownerQuery);
      if (!ownerSnap.empty) {
        const docs = ownerSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as SchoolInstitution));
        docs.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
        return docs[0];
      }

      const teacherQuery = query(
        collection(db, 'institutions'),
        where('assignedTeacherUids', 'array-contains', uid),
        limit(5)
      );
      const teacherSnap = await getDocs(teacherQuery);
      if (!teacherSnap.empty) {
        const docs = teacherSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as SchoolInstitution));
        return docs[0];
      }

      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'institutions');
    }
  }

  async getAllSchoolInstitutionsAdmin(): Promise<SchoolInstitution[]> {
    try {
      const snap = await getDocs(query(collection(db, 'institutions'), limit(300)));
      return snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) } as SchoolInstitution))
        .sort((a, b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'institutions');
    }
  }

  async uploadSchoolDocument(
    file: File,
    docType: SchoolDocumentUpload['docType']
  ): Promise<SchoolDocumentUpload> {
    const headers = await getBearerHeaders();
    const checkResp = await fetch('/api/school-partner/upload-check', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        purpose: 'document',
      }),
    });
    const checkData = await checkResp.json();
    if (!checkResp.ok || !checkData.ok) {
      throw new Error(checkData.error || 'Document failed server-side file validation.');
    }

    const uploaded = await uploadDocumentToStorage(file, 'documents');
    return {
      id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      docType,
      fileName: checkData.sanitizedFileName || uploaded.fileName,
      mimeType: file.type || 'application/pdf',
      sizeBytes: uploaded.size,
      url: uploaded.url,
      status: 'Uploaded',
      uploadedAt: new Date().toISOString(),
    };
  }

  async saveOrSubmitSchoolApplication(
    draft: Partial<SchoolInstitution>,
    submitNow: boolean,
    actor: SchoolAuditActor
  ): Promise<SchoolInstitution> {
    const now = new Date().toISOString();
    const docId = sanitizeId(draft.id || `inst_${actor.uid.slice(0, 12)}_${Date.now()}`);
    const nextStatus: SchoolApplicationStatus = submitNow ? 'Submitted' : draft.verificationStatus || 'Draft';

    if (submitNow) {
      const headers = await getBearerHeaders();
      const valResp = await fetch('/api/school-partner/validate-registration', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: draft.name,
          registrationNumber: draft.udiseCode || '',
          officialEmail: draft.principalEmail,
          officialPhone: draft.principalMobile,
          city: draft.city,
          state: draft.state,
          principalName: draft.principalName,
          boardAffiliation: draft.boardAffiliation,
        }),
      });
      const valData = await valResp.json();
      if (!valResp.ok || !valData.ok) {
        throw new Error(valData.error || 'Registration validation failed.');
      }
      if (!draft.consentAccepted) {
        throw new Error('Please accept the institutional declaration and verification terms before submitting.');
      }
    }

    const existingSnap = await getDoc(doc(db, 'institutions', docId));
    const existingData = existingSnap.exists() ? (existingSnap.data() as SchoolInstitution) : null;

    const appRef =
      draft.applicationRef ||
      existingData?.applicationRef ||
      `OF-APP-${new Date().getFullYear()}-${docId.slice(-5).toUpperCase()}`;

    const record: SchoolInstitution & { registrationNumber: string; schoolCode?: string } = {
      id: docId,
      applicationRef: appRef,
      institutionCode: existingData?.institutionCode || draft.institutionCode || '',
      schoolCode: (existingData as any)?.schoolCode || existingData?.institutionCode || '',
      name: (draft.name || '').trim().slice(0, 200),
      udiseCode: (draft.udiseCode || '').trim().toUpperCase().slice(0, 100),
      registrationNumber: (draft.udiseCode || appRef).trim().toUpperCase().slice(0, 100),
      institutionType: draft.institutionType || 'K-12 School',
      boardAffiliation: (draft.boardAffiliation || 'CBSE').slice(0, 160),
      address: (draft.address || '').trim().slice(0, 300),
      state: (draft.state || 'Karnataka').trim().slice(0, 80),
      district: (draft.district || '').trim().slice(0, 80),
      city: (draft.city || '').trim().slice(0, 80),
      pinCode: (draft.pinCode || '').trim().slice(0, 12),
      website: (draft.website || '').trim().slice(0, 200),
      studentCountEstimate: Math.max(0, Number(draft.studentCountEstimate) || 0),
      teacherCountEstimate: Math.max(0, Number(draft.teacherCountEstimate) || 0),
      principalName: (draft.principalName || '').trim().slice(0, 120),
      principalDesignation: (draft.principalDesignation || 'Principal').trim().slice(0, 100),
      principalMobile: (draft.principalMobile || '').trim().slice(0, 30),
      principalMobileVerified: Boolean(draft.principalMobileVerified),
      principalEmail: (draft.principalEmail || actor.email || '').trim().toLowerCase().slice(0, 120),
      principalEmailVerified: Boolean(auth.currentUser?.emailVerified || draft.principalEmailVerified),
      adminUid: existingData?.adminUid || actor.uid,
      adminEmail: existingData?.adminEmail || actor.email.toLowerCase(),
      assignedTeacherUids: existingData?.assignedTeacherUids || draft.assignedTeacherUids || [],
      documents: Array.isArray(draft.documents) ? draft.documents : [],
      consentAccepted: Boolean(draft.consentAccepted),
      declarationAcceptedAt: draft.consentAccepted ? draft.declarationAcceptedAt || now : undefined,
      verificationStatus: nextStatus,
      reviewerNotes: existingData?.reviewerNotes,
      reviewedBy: existingData?.reviewedBy,
      reviewedAt: existingData?.reviewedAt,
      submittedAt: submitNow ? now : existingData?.submittedAt,
      approvedAt: existingData?.approvedAt,
      createdAt: existingData?.createdAt || now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'institutions', docId), stripUndefinedDeep(record), { merge: true });
      // Persist draft ref on local storage for offline slow-network recovery
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`of_school_draft_${actor.uid}`);
      }
      if (submitNow) {
        await this.writeAuditLog({
          institutionId: docId,
          institutionAdminUid: record.adminUid,
          actor,
          action: existingData ? 'Resubmitted School Application' : 'Submitted School Application',
          entityType: 'institution',
          entityId: docId,
          summary: `Application ${appRef} submitted for ${record.name} (${record.city}, ${record.state}).`,
        });
      }
      return record;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `institutions/${docId}`);
    }
  }

  async adminReviewSchoolApplication(params: {
    institution: SchoolInstitution;
    nextStatus: SchoolApplicationStatus;
    reviewComment: string;
    schoolCode?: string;
    actor: SchoolAuditActor;
  }): Promise<SchoolInstitution> {
    const headers = await getBearerHeaders();
    const reviewResp = await fetch('/api/school-partner/admin/review', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        institutionId: params.institution.id,
        nextStatus: params.nextStatus,
        reviewComment: params.reviewComment,
        schoolCode: params.schoolCode,
      }),
    });
    const reviewData = await reviewResp.json();
    if (!reviewResp.ok || !reviewData.ok) {
      throw new Error(reviewData.error || 'Server rejected application review.');
    }

    const now = new Date().toISOString();
    const generatedCode =
      params.nextStatus === 'Approved'
        ? params.institution.institutionCode ||
          reviewData.schoolCode ||
          `OFS-${params.institution.id.slice(-5).toUpperCase()}`
        : params.institution.institutionCode || '';

    const updates: Record<string, any> = {
      verificationStatus: params.nextStatus,
      reviewerNotes: params.reviewComment.trim(),
      reviewedBy: params.actor.email,
      reviewedAt: now,
      updatedAt: now,
    };

    if (params.nextStatus === 'Approved') {
      updates.institutionCode = generatedCode;
      updates.schoolCode = generatedCode;
      updates.approvedAt = params.institution.approvedAt || now;
    }

    try {
      await updateDoc(doc(db, 'institutions', params.institution.id), stripUndefinedDeep(updates));

      // Sync institution link onto school admin's unified user profile
      if (params.institution.adminUid) {
        await setDoc(
          doc(db, 'users', params.institution.adminUid),
          stripUndefinedDeep({
            institutionId: params.institution.id,
            institutionName: params.institution.name,
            role: 'institution_admin',
            updatedAt: now,
          }),
          { merge: true }
        ).catch(() => {});
      }

      // Create in-app notification for school admin
      if (params.institution.adminUid) {
        const notifId = sanitizeId(`notif_${Date.now()}_${params.institution.id.slice(-6)}`);
        await setDoc(
          doc(db, 'notifications', notifId),
          stripUndefinedDeep({
            id: notifId,
            recipientId: params.institution.adminUid,
            recipientEmail: params.institution.adminEmail,
            recipientRole: 'SCHOOL_ADMIN',
            type: 'system',
            title: `School Partnership Status: ${params.nextStatus}`,
            message:
              params.nextStatus === 'Approved'
                ? `${params.institution.name} has been approved! Institution Code: ${generatedCode}. Your full School Operations workspace is now active.`
                : params.reviewComment || `Application status updated to ${params.nextStatus}.`,
            actionUrl: '/partner/school/dashboard',
            createdAt: now,
            read: false,
          })
        ).catch(() => {});
      }

      await this.writeAuditLog({
        institutionId: params.institution.id,
        institutionAdminUid: params.institution.adminUid,
        actor: params.actor,
        action: `Platform Review: ${params.nextStatus}`,
        entityType: 'institution',
        entityId: params.institution.id,
        summary: `Status set to ${params.nextStatus}. ${params.reviewComment || ''}`.trim(),
      });

      return { ...params.institution, ...updates } as SchoolInstitution;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `institutions/${params.institution.id}`);
    }
  }

  async adminReassignSchoolAdmin(params: {
    institution: SchoolInstitution;
    newAdminUid: string;
    newAdminEmail: string;
    actor: SchoolAuditActor;
  }): Promise<void> {
    const cleanUid = params.newAdminUid.trim();
    const cleanEmail = params.newAdminEmail.trim().toLowerCase();
    if (!cleanUid || !cleanEmail.includes('@')) {
      throw new Error('Valid target Firebase UID and email address are required for admin reassignment.');
    }
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'institutions', params.institution.id), {
        adminUid: cleanUid,
        adminEmail: cleanEmail,
        updatedAt: now,
      });
      await setDoc(
        doc(db, 'users', cleanUid),
        {
          institutionId: params.institution.id,
          institutionName: params.institution.name,
          role: 'institution_admin',
          updatedAt: now,
        },
        { merge: true }
      ).catch(() => {});

      await this.writeAuditLog({
        institutionId: params.institution.id,
        institutionAdminUid: cleanUid,
        actor: params.actor,
        action: 'Reassigned School Admin',
        entityType: 'institution',
        entityId: params.institution.id,
        summary: `School admin transferred from ${params.institution.adminEmail} to ${cleanEmail} (${cleanUid}).`,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `institutions/${params.institution.id}`);
    }
  }

  // -------------------------------------------------------------
  // 2. Classes & Academic Structure
  // -------------------------------------------------------------
  async getSchoolClasses(institutionId: string, teacherUid?: string): Promise<SchoolTenantClass[]> {
    try {
      const q = teacherUid
        ? query(
            collection(db, 'classes'),
            where('institutionId', '==', institutionId),
            where('assignedTeacherUids', 'array-contains', teacherUid),
            limit(200)
          )
        : query(
            collection(db, 'classes'),
            where('institutionId', '==', institutionId),
            limit(200)
          );
      const snap = await getDocs(q);
      return snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) } as SchoolTenantClass))
        .sort((a, b) => `${a.gradeName}-${a.section}`.localeCompare(`${b.gradeName}-${b.section}`));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'classes');
    }
  }

  async saveSchoolClass(
    cls: Omit<SchoolTenantClass, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
    actor: SchoolAuditActor
  ): Promise<SchoolTenantClass> {
    const now = new Date().toISOString();
    const id = sanitizeId(cls.id || `cls_${cls.institutionId.slice(-8)}_${Date.now()}`);
    const payload: SchoolTenantClass & { className: string } = {
      id,
      institutionId: cls.institutionId,
      institutionAdminUid: cls.institutionAdminUid,
      gradeName: cls.gradeName.trim().slice(0, 60),
      section: (cls.section || 'A').trim().toUpperCase().slice(0, 20),
      className: `${cls.gradeName.trim()} - ${cls.section || 'A'}`.slice(0, 80),
      academicYear: (cls.academicYear || '2026-27').trim().slice(0, 20),
      classTeacherUid: cls.classTeacherUid?.trim() || undefined,
      classTeacherName: cls.classTeacherName?.trim() || undefined,
      capacity: cls.capacity ? Math.max(1, Number(cls.capacity)) : 45,
      assignedTeacherUids: cls.assignedTeacherUids || (cls.classTeacherUid ? [cls.classTeacherUid] : []),
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'classes', id), stripUndefinedDeep(payload), { merge: true });
      await this.writeAuditLog({
        institutionId: cls.institutionId,
        institutionAdminUid: cls.institutionAdminUid,
        actor,
        action: cls.id ? 'Updated Class' : 'Created Class',
        entityType: 'class',
        entityId: id,
        summary: `Class ${payload.gradeName} Section ${payload.section} (${payload.academicYear}) saved.`,
      });
      return payload;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `classes/${id}`);
    }
  }

  async deleteSchoolClass(cls: SchoolTenantClass, actor: SchoolAuditActor): Promise<void> {
    try {
      await deleteDoc(doc(db, 'classes', cls.id));
      await this.writeAuditLog({
        institutionId: cls.institutionId,
        institutionAdminUid: cls.institutionAdminUid,
        actor,
        action: 'Deleted Class',
        entityType: 'class',
        entityId: cls.id,
        summary: `Removed class ${cls.gradeName} - ${cls.section}.`,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `classes/${cls.id}`);
    }
  }

  // -------------------------------------------------------------
  // 3. Teachers & Staff Directory
  // -------------------------------------------------------------
  async getSchoolStaff(institutionId: string): Promise<SchoolStaffMember[]> {
    try {
      const q = query(
        collection(db, 'institution_staff'),
        where('institutionId', '==', institutionId),
        limit(300)
      );
      const snap = await getDocs(q);
      return snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) } as SchoolStaffMember))
        .sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'institution_staff');
    }
  }

  async saveSchoolStaff(
    staff: Omit<SchoolStaffMember, 'id' | 'staffCode' | 'joinedAt' | 'updatedAt'> & {
      id?: string;
      staffCode?: string;
      joinedAt?: string;
    },
    institution: SchoolInstitution,
    actor: SchoolAuditActor
  ): Promise<SchoolStaffMember> {
    const now = new Date().toISOString();
    const id = sanitizeId(staff.id || `stf_${institution.id.slice(-8)}_${Date.now()}`);
    const prefix = (institution.institutionCode || 'OFS').replace(/[^A-Z0-9]/gi, '').slice(0, 6).toUpperCase();
    const staffCode = staff.staffCode || `STF-${prefix}-${Date.now().toString().slice(-4)}`;

    const payload: SchoolStaffMember = {
      id,
      institutionId: institution.id,
      institutionAdminUid: institution.adminUid,
      staffUid: staff.staffUid?.trim() || undefined,
      staffCode,
      fullName: staff.fullName.trim().slice(0, 120),
      email: staff.email.trim().toLowerCase().slice(0, 120),
      mobileNumber: staff.mobileNumber.trim().slice(0, 25),
      role: staff.role,
      qualification: (staff.qualification || 'B.Ed / Graduate').trim().slice(0, 120),
      subjects: staff.subjects || [],
      assignedClassIds: staff.assignedClassIds || [],
      assignedClassLabels: staff.assignedClassLabels || [],
      status: staff.status || 'Active',
      joinedAt: staff.joinedAt || now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'institution_staff', id), stripUndefinedDeep(payload), { merge: true });

      // Sync teacher UID onto institution and assigned classes for least-privilege access
      if (payload.staffUid && payload.status === 'Active') {
        const existingTeachers = new Set(institution.assignedTeacherUids || []);
        existingTeachers.add(payload.staffUid);
        await updateDoc(doc(db, 'institutions', institution.id), {
          assignedTeacherUids: Array.from(existingTeachers),
          updatedAt: now,
        }).catch(() => {});

        for (const classId of payload.assignedClassIds) {
          const clsRef = doc(db, 'classes', classId);
          const clsSnap = await getDoc(clsRef).catch(() => null);
          if (clsSnap?.exists()) {
            const cData = clsSnap.data() as SchoolTenantClass;
            const setUids = new Set(cData.assignedTeacherUids || []);
            setUids.add(payload.staffUid);
            await updateDoc(clsRef, { assignedTeacherUids: Array.from(setUids), updatedAt: now }).catch(() => {});
          }
        }
      }

      await this.writeAuditLog({
        institutionId: institution.id,
        institutionAdminUid: institution.adminUid,
        actor,
        action: staff.id ? 'Updated Staff Member' : 'Added Staff Member',
        entityType: 'staff',
        entityId: id,
        summary: `${payload.fullName} (${payload.role}, ${payload.staffCode}) saved with ${payload.assignedClassLabels.length} class assignments.`,
      });
      return payload;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `institution_staff/${id}`);
    }
  }

  async toggleSchoolStaffStatus(
    staff: SchoolStaffMember,
    nextStatus: SchoolStaffMember['status'],
    actor: SchoolAuditActor
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'institution_staff', staff.id), {
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      });
      await this.writeAuditLog({
        institutionId: staff.institutionId,
        institutionAdminUid: staff.institutionAdminUid,
        actor,
        action: `Staff Status -> ${nextStatus}`,
        entityType: 'staff',
        entityId: staff.id,
        summary: `Changed ${staff.fullName} (${staff.staffCode}) status to ${nextStatus} without deleting academic history.`,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `institution_staff/${staff.id}`);
    }
  }

  // -------------------------------------------------------------
  // 4. Students & Bulk Import (CSV / XLSX)
  // -------------------------------------------------------------
  async getSchoolStudents(institutionId: string, teacherUid?: string): Promise<SchoolTenantStudent[]> {
    try {
      const q = teacherUid
        ? query(
            collection(db, 'institution_students'),
            where('institutionId', '==', institutionId),
            where('assignedTeacherUids', 'array-contains', teacherUid),
            limit(500)
          )
        : query(
            collection(db, 'institution_students'),
            where('institutionId', '==', institutionId),
            limit(500)
          );
      const snap = await getDocs(q);
      return snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) } as SchoolTenantStudent))
        .sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'institution_students');
    }
  }

  async saveSchoolStudent(
    student: Omit<SchoolTenantStudent, 'id' | 'studentCode' | 'createdAt' | 'updatedAt'> & {
      id?: string;
      studentCode?: string;
      createdAt?: string;
    },
    institution: SchoolInstitution,
    sequenceHint: number,
    actor: SchoolAuditActor
  ): Promise<SchoolTenantStudent> {
    const now = new Date().toISOString();
    const id = sanitizeId(student.id || `stu_${institution.id.slice(-8)}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`);
    const codePrefix = (institution.institutionCode || 'OFS').replace(/[^A-Z0-9]/gi, '').slice(0, 6).toUpperCase();
    const seqStr = String(sequenceHint).padStart(4, '0');
    const studentCode = student.studentCode || `STU-${codePrefix}-${seqStr}`;

    const payload: SchoolTenantStudent = {
      id,
      institutionId: institution.id,
      institutionAdminUid: institution.adminUid,
      assignedTeacherUids: student.assignedTeacherUids || [],
      studentCode,
      studentUid: student.studentUid?.trim() || undefined,
      fullName: student.fullName.trim().slice(0, 120),
      dob: student.dob?.trim() || undefined,
      gender: student.gender || 'Prefer not to say',
      classId: student.classId,
      className: student.className.trim().slice(0, 60),
      section: (student.section || 'A').trim().toUpperCase().slice(0, 20),
      rollNumber: student.rollNumber?.trim() || undefined,
      guardianName: student.guardianName.trim().slice(0, 120),
      guardianRelation: (student.guardianRelation || 'Parent').trim().slice(0, 40),
      guardianPhone: student.guardianPhone.trim().slice(0, 25),
      guardianEmail: student.guardianEmail?.trim().toLowerCase().slice(0, 120) || undefined,
      addressSummary: student.addressSummary?.trim().slice(0, 250) || undefined,
      enrollmentStatus: student.enrollmentStatus || 'Active',
      enrolledPrograms: student.enrolledPrograms || [],
      documents: student.documents || [],
      admissionDate: student.admissionDate || now.slice(0, 10),
      createdAt: student.createdAt || now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'institution_students', id), stripUndefinedDeep(payload), { merge: true });
      await this.writeAuditLog({
        institutionId: institution.id,
        institutionAdminUid: institution.adminUid,
        actor,
        action: student.id ? 'Updated Student Profile' : 'Admitted Student',
        entityType: 'student',
        entityId: id,
        summary: `${payload.fullName} (${payload.studentCode}, Class ${payload.className}-${payload.section}) saved.`,
      });
      return payload;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `institution_students/${id}`);
    }
  }

  async parseBulkStudentsSpreadsheet(
    file: File,
    existingStudents: SchoolTenantStudent[],
    classes: SchoolTenantClass[]
  ): Promise<BulkStudentParseResult> {
    const headers = await getBearerHeaders();
    const checkResp = await fetch('/api/school-partner/upload-check', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        purpose: 'bulk_import',
      }),
    });
    const checkData = await checkResp.json();
    if (!checkResp.ok || !checkData.ok) {
      throw new Error(checkData.error || 'Spreadsheet failed validation.');
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet, { defval: '' });

    const existingDedupe = new Set(
      existingStudents.map(
        (s) => `${s.fullName.toLowerCase().trim()}::${s.guardianPhone.replace(/\D/g, '').slice(-10)}`
      )
    );
    const seenInFile = new Set<string>();

    const validRows: BulkStudentValidationRow[] = [];
    const failedRows: BulkStudentFailedRow[] = [];

    rawRows.forEach((raw, index) => {
      const rowNumber = index + 2;
      const getVal = (...keys: string[]) => {
        for (const k of keys) {
          const matchKey = Object.keys(raw).find(
            (rk) => rk.toLowerCase().replace(/[^a-z0-9]/g, '') === k.toLowerCase().replace(/[^a-z0-9]/g, '')
          );
          if (matchKey && String(raw[matchKey]).trim() !== '') {
            return String(raw[matchKey]).trim();
          }
        }
        return '';
      };

      const fullName = getVal('fullName', 'studentName', 'name');
      const className = getVal('className', 'class', 'grade');
      const section = (getVal('section', 'sec') || 'A').toUpperCase();
      const guardianName = getVal('guardianName', 'parentName', 'guardian');
      const guardianPhone = getVal('guardianPhone', 'parentPhone', 'phone', 'mobile');
      const guardianRelation = getVal('guardianRelation', 'relation') || 'Parent';
      const guardianEmail = getVal('guardianEmail', 'parentEmail', 'email');
      const rollNumber = getVal('rollNumber', 'rollNo', 'roll');
      const dob = getVal('dob', 'dateOfBirth');
      const rawGender = getVal('gender');
      const gender: BulkStudentValidationRow['gender'] =
        rawGender === 'Male' || rawGender === 'Female' || rawGender === 'Other'
          ? rawGender
          : 'Prefer not to say';

      const errors: string[] = [];
      if (fullName.length < 2) errors.push('Missing/short Student Full Name');
      if (!className) errors.push('Missing Class / Grade');
      if (!guardianName) errors.push('Missing Parent / Guardian Name');
      const digits = guardianPhone.replace(/\D/g, '');
      if (digits.length < 10) errors.push('Invalid 10-digit Guardian Phone');

      const dedupeKey = `${fullName.toLowerCase()}::${digits.slice(-10)}`;
      if (existingDedupe.has(dedupeKey)) {
        errors.push('Duplicate of existing student with same name & guardian phone');
      } else if (seenInFile.has(dedupeKey)) {
        errors.push('Duplicate row inside uploaded file');
      }

      if (errors.length > 0) {
        failedRows.push({
          rowNumber,
          rawName: fullName || '(Blank)',
          rawPhone: guardianPhone || '(Blank)',
          reason: errors.join('; '),
        });
        return;
      }

      seenInFile.add(dedupeKey);
      const matchedClass = classes.find(
        (c) =>
          c.gradeName.toLowerCase() === className.toLowerCase() &&
          c.section.toUpperCase() === section
      );

      validRows.push({
        rowNumber,
        fullName,
        className,
        section,
        classId: matchedClass?.id || `cls_auto_${sanitizeId(`${className}_${section}`)}`,
        rollNumber,
        gender,
        dob,
        guardianName,
        guardianRelation,
        guardianPhone,
        guardianEmail,
      });
    });

    const errorCsvLines = [
      'RowNumber,StudentName,GuardianPhone,ErrorReason',
      ...failedRows.map(
        (f) =>
          `${f.rowNumber},"${f.rawName.replace(/"/g, '""')}","${f.rawPhone.replace(/"/g, '""')}","${f.reason.replace(/"/g, '""')}"`
      ),
    ];

    return {
      totalRows: rawRows.length,
      validRows,
      failedRows,
      errorCsvText: errorCsvLines.join('\n'),
    };
  }

  async commitBulkStudentsImport(
    institution: SchoolInstitution,
    validRows: BulkStudentValidationRow[],
    existingCount: number,
    classes: SchoolTenantClass[],
    actor: SchoolAuditActor
  ): Promise<SchoolTenantStudent[]> {
    const created: SchoolTenantStudent[] = [];
    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      const matchedClass = classes.find((c) => c.id === row.classId);
      const stu = await this.saveSchoolStudent(
        {
          institutionId: institution.id,
          institutionAdminUid: institution.adminUid,
          assignedTeacherUids: matchedClass?.assignedTeacherUids || [],
          fullName: row.fullName,
          classId: row.classId,
          className: row.className,
          section: row.section,
          rollNumber: row.rollNumber,
          gender: row.gender,
          dob: row.dob,
          guardianName: row.guardianName,
          guardianRelation: row.guardianRelation,
          guardianPhone: row.guardianPhone,
          guardianEmail: row.guardianEmail,
          enrollmentStatus: 'Active',
          enrolledPrograms: [],
          admissionDate: new Date().toISOString().slice(0, 10),
        },
        institution,
        existingCount + i + 1,
        actor
      );
      created.push(stu);
    }
    return created;
  }

  downloadBulkStudentTemplateCsv(): void {
    const csv = [
      'fullName,className,section,rollNumber,gender,dob,guardianName,guardianRelation,guardianPhone,guardianEmail',
      'Aarav Sharma,Class 8,A,801,Male,2013-05-14,Rajesh Sharma,Father,+919845011223,rajesh.parent@example.com',
      'Ananya Rao,Class 8,A,802,Female,2013-09-22,Meera Rao,Mother,+919845044556,meera.parent@example.com',
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'openframe_school_students_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  downloadCsvFile(fileName: string, csvText: string): void {
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  // -------------------------------------------------------------
  // 5. Attendance
  // -------------------------------------------------------------
  async getSchoolAttendance(institutionId: string): Promise<SchoolTenantAttendanceRecord[]> {
    try {
      const q = query(
        collection(db, 'attendance'),
        where('institutionId', '==', institutionId),
        limit(500)
      );
      const snap = await getDocs(q);
      return snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) } as SchoolTenantAttendanceRecord))
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'attendance');
    }
  }

  async saveAttendanceBatch(
    records: Array<Omit<SchoolTenantAttendanceRecord, 'id' | 'createdAt'>>,
    actor: SchoolAuditActor
  ): Promise<void> {
    const now = new Date().toISOString();
    for (const rec of records) {
      const docId = sanitizeId(`att_${rec.institutionId.slice(-8)}_${rec.date}_${rec.personId}`);
      const payload: SchoolTenantAttendanceRecord = {
        ...rec,
        id: docId,
        createdAt: now,
      };
      try {
        await setDoc(doc(db, 'attendance', docId), stripUndefinedDeep(payload), { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `attendance/${docId}`);
      }
    }
    if (records.length > 0) {
      await this.writeAuditLog({
        institutionId: records[0].institutionId,
        institutionAdminUid: records[0].institutionAdminUid,
        actor,
        action: 'Recorded Attendance Batch',
        entityType: 'attendance',
        entityId: records[0].date,
        summary: `Saved ${records.length} attendance records for ${records[0].date}.`,
      });
    }
  }

  // -------------------------------------------------------------
  // 6. Programs & Course Enrollment
  // -------------------------------------------------------------
  async getSchoolProgramEnrollments(institutionId: string): Promise<SchoolProgramEnrollment[]> {
    try {
      const q = query(
        collection(db, 'school_program_enrollments'),
        where('institutionId', '==', institutionId),
        limit(500)
      );
      const snap = await getDocs(q);
      return snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) } as SchoolProgramEnrollment))
        .sort((a, b) => (b.enrolledAt || '').localeCompare(a.enrolledAt || ''));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'school_program_enrollments');
    }
  }

  async enrollStudentsInProgram(
    institution: SchoolInstitution,
    course: MarketplaceCourse,
    students: SchoolTenantStudent[],
    actor: SchoolAuditActor
  ): Promise<SchoolProgramEnrollment[]> {
    const now = new Date().toISOString();
    const results: SchoolProgramEnrollment[] = [];
    for (const student of students) {
      const id = sanitizeId(`spenr_${institution.id.slice(-8)}_${course.id.slice(-16)}_${student.id.slice(-12)}`);
      const payload: SchoolProgramEnrollment = {
        id,
        institutionId: institution.id,
        institutionAdminUid: institution.adminUid,
        assignedTeacherUids: student.assignedTeacherUids || [],
        courseId: course.id,
        programTitle: course.title.slice(0, 200),
        category: course.category || 'Academic Program',
        studentId: student.id,
        studentName: student.fullName,
        studentCode: student.studentCode,
        classId: student.classId,
        className: `${student.className} - ${student.section}`,
        status: 'Enrolled',
        progressPercent: 0,
        feeInr: Number(course.price || 0),
        enrolledAt: now,
        updatedAt: now,
      };
      try {
        await setDoc(doc(db, 'school_program_enrollments', id), stripUndefinedDeep(payload), { merge: true });
        const programs = new Set(student.enrolledPrograms || []);
        if (!programs.has(course.id)) {
          programs.add(course.id);
          await updateDoc(doc(db, 'institution_students', student.id), {
            enrolledPrograms: Array.from(programs),
            updatedAt: now,
          }).catch(() => {});
        }
        results.push(payload);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `school_program_enrollments/${id}`);
      }
    }

    await this.writeAuditLog({
      institutionId: institution.id,
      institutionAdminUid: institution.adminUid,
      actor,
      action: 'Enrolled Cohort in Program',
      entityType: 'program_enrollment',
      entityId: course.id,
      summary: `Enrolled ${students.length} student(s) into "${course.title}".`,
    });

    return results;
  }

  async updateProgramEnrollmentProgress(
    enrollment: SchoolProgramEnrollment,
    progressPercent: number,
    status: SchoolProgramEnrollment['status'],
    actor: SchoolAuditActor
  ): Promise<void> {
    const clamped = Math.max(0, Math.min(100, Math.round(progressPercent)));
    try {
      await updateDoc(doc(db, 'school_program_enrollments', enrollment.id), {
        id: enrollment.id,
        institutionId: enrollment.institutionId,
        institutionAdminUid: enrollment.institutionAdminUid,
        courseId: enrollment.courseId,
        studentId: enrollment.studentId,
        progressPercent: clamped,
        status,
        updatedAt: new Date().toISOString(),
      });
      await this.writeAuditLog({
        institutionId: enrollment.institutionId,
        institutionAdminUid: enrollment.institutionAdminUid,
        actor,
        action: 'Updated Program Progress',
        entityType: 'program_enrollment',
        entityId: enrollment.id,
        summary: `${enrollment.studentName} progress on ${enrollment.programTitle} set to ${clamped}% (${status}).`,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `school_program_enrollments/${enrollment.id}`);
    }
  }

  // -------------------------------------------------------------
  // 7. IQ / EQ / SQ Educational Assessments
  // -------------------------------------------------------------
  async getSchoolAssessmentAssignments(institutionId: string): Promise<SchoolAssessmentAssignment[]> {
    try {
      const q = query(
        collection(db, 'school_assessment_assignments'),
        where('institutionId', '==', institutionId),
        limit(200)
      );
      const snap = await getDocs(q);
      return snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) } as SchoolAssessmentAssignment))
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'school_assessment_assignments');
    }
  }

  async createAssessmentAssignment(
    payload: Omit<SchoolAssessmentAssignment, 'id' | 'createdAt' | 'updatedAt'>,
    actor: SchoolAuditActor
  ): Promise<SchoolAssessmentAssignment> {
    const now = new Date().toISOString();
    const id = sanitizeId(`asg_${payload.institutionId.slice(-8)}_${Date.now()}`);
    const record: SchoolAssessmentAssignment = {
      ...payload,
      id,
      createdAt: now,
      updatedAt: now,
    };
    try {
      await setDoc(doc(db, 'school_assessment_assignments', id), stripUndefinedDeep(record));
      await this.writeAuditLog({
        institutionId: payload.institutionId,
        institutionAdminUid: payload.institutionAdminUid,
        actor,
        action: `Scheduled ${payload.dimension} Assessment`,
        entityType: 'assessment_assignment',
        entityId: id,
        summary: `Scheduled "${payload.title}" (${payload.dimension}) for ${payload.targetClassLabels.join(', ')}.`,
      });
      return record;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `school_assessment_assignments/${id}`);
    }
  }

  async updateAssessmentAssignmentStatus(
    assignment: SchoolAssessmentAssignment,
    status: SchoolAssessmentAssignment['status'],
    actor: SchoolAuditActor
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'school_assessment_assignments', assignment.id), {
        id: assignment.id,
        dimension: assignment.dimension,
        status,
        updatedAt: new Date().toISOString(),
      });
      await this.writeAuditLog({
        institutionId: assignment.institutionId,
        institutionAdminUid: assignment.institutionAdminUid,
        actor,
        action: `Assessment Status -> ${status}`,
        entityType: 'assessment_assignment',
        entityId: assignment.id,
        summary: `"${assignment.title}" set to ${status}.`,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `school_assessment_assignments/${assignment.id}`);
    }
  }

  async getSchoolAssessmentResults(institutionId: string): Promise<SchoolIqEqSqResult[]> {
    try {
      const q = query(
        collection(db, 'iq_eq_sq_assessments'),
        where('institutionId', '==', institutionId),
        limit(400)
      );
      const snap = await getDocs(q);
      return snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) } as SchoolIqEqSqResult))
        .sort((a, b) => (b.submittedAt || b.updatedAt || '').localeCompare(a.submittedAt || a.updatedAt || ''));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'iq_eq_sq_assessments');
    }
  }

  async fetchStrippedAssessmentSheet(
    dimension: AssessmentDimension,
    gradeBand: IqEqSqGradeBand
  ): Promise<{ disclaimer: string; questions: any[] }> {
    const resp = await fetch(
      `/api/school-partner/assessment-sheet?dimension=${encodeURIComponent(dimension)}&gradeBand=${encodeURIComponent(gradeBand)}`
    );
    const data = await resp.json();
    if (!resp.ok || !data.ok) {
      throw new Error(data.error || 'Failed to load assessment sheet.');
    }
    return {
      disclaimer: data.disclaimer || NON_CLINICAL_EDUCATIONAL_DISCLAIMER,
      questions: data.questions || [],
    };
  }

  async submitAssessmentAttempt(params: {
    institution: SchoolInstitution;
    assignment: SchoolAssessmentAssignment;
    student: SchoolTenantStudent;
    answers: Record<string, number>;
    nonClinicalDisclaimerAccepted: boolean;
    existingResults: SchoolIqEqSqResult[];
    actor: SchoolAuditActor;
  }): Promise<SchoolIqEqSqResult> {
    const alreadySubmitted = params.existingResults.find(
      (r) =>
        r.assignmentId === params.assignment.id &&
        r.studentId === params.student.id &&
        r.status === 'Submitted'
    );
    if (alreadySubmitted && !params.assignment.allowRetakes) {
      throw new Error(
        `Duplicate submission blocked: ${params.student.fullName} has already submitted "${params.assignment.title}" and retakes are disabled.`
      );
    }

    const headers = await getBearerHeaders();
    const scoreResp = await fetch('/api/school-partner/score-assessment', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        dimension: params.assignment.dimension,
        gradeBand: params.assignment.gradeBand,
        answers: params.answers,
        nonClinicalDisclaimerAccepted: params.nonClinicalDisclaimerAccepted,
      }),
    });
    const scoreData = await scoreResp.json();
    if (!scoreResp.ok || !scoreData.ok) {
      throw new Error(scoreData.error || 'Server-side assessment evaluation failed.');
    }

    const now = new Date().toISOString();
    const docId = sanitizeId(
      `iqres_${params.assignment.id.slice(-10)}_${params.student.id.slice(-10)}_${Date.now()}`
    );

    const record: SchoolIqEqSqResult & { percentage: number } = {
      id: docId,
      institutionId: params.institution.id,
      institutionAdminUid: params.institution.adminUid,
      assignedTeacherUids: params.student.assignedTeacherUids || params.assignment.assignedTeacherUids || [],
      assignmentId: params.assignment.id,
      assignmentTitle: params.assignment.title,
      dimension: params.assignment.dimension,
      studentId: params.student.id,
      studentName: params.student.fullName,
      studentCode: params.student.studentCode,
      className: `${params.student.className} - ${params.student.section}`,
      status: 'Submitted',
      answers: params.answers,
      scorePercent: Number(scoreData.scorePercent || 0),
      percentage: Number(scoreData.scorePercent || 0),
      bandLabel: String(scoreData.bandLabel || 'Completed'),
      educationalSummary: String(scoreData.educationalSummary || ''),
      subScores: scoreData.subScores || {},
      nonClinicalDisclaimerAccepted: true,
      startedAt: now,
      submittedAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'iq_eq_sq_assessments', docId), stripUndefinedDeep(record));
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`of_asg_draft_${params.assignment.id}_${params.student.id}`);
      }
      await this.writeAuditLog({
        institutionId: params.institution.id,
        institutionAdminUid: params.institution.adminUid,
        actor: params.actor,
        action: `Submitted ${params.assignment.dimension} Assessment`,
        entityType: 'iq_eq_sq_assessment',
        entityId: docId,
        summary: `${params.student.fullName} scored ${record.scorePercent}% (${record.bandLabel}) on ${params.assignment.title}.`,
      });
      return record;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `iq_eq_sq_assessments/${docId}`);
    }
  }

  // -------------------------------------------------------------
  // 8. Payments & Razorpay Integration
  // -------------------------------------------------------------
  async getRazorpayConfig(): Promise<{ configured: boolean; keyId: string | null; note: string }> {
    const resp = await fetch('/api/payments/razorpay/config');
    return resp.json();
  }

  async createRazorpayOrder(params: {
    amountInr: number;
    institutionId: string;
    purpose: string;
    receipt?: string;
  }): Promise<{ keyId: string; order: any }> {
    const headers = await getBearerHeaders();
    const resp = await fetch('/api/payments/razorpay/order', {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });
    const data = await resp.json();
    if (!resp.ok || !data.ok) {
      throw new Error(data.error || 'Unable to create Razorpay order.');
    }
    return { keyId: data.keyId, order: data.order };
  }

  async verifyRazorpaySignature(params: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<boolean> {
    const headers = await getBearerHeaders();
    const resp = await fetch('/api/payments/razorpay/verify', {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });
    const data = await resp.json();
    if (!resp.ok || !data.verified) {
      throw new Error(data.error || 'Razorpay signature verification failed.');
    }
    return true;
  }

  async getSchoolPayments(institutionId: string): Promise<SchoolTenantPayment[]> {
    try {
      const q = query(
        collection(db, 'payments'),
        where('institutionId', '==', institutionId),
        limit(300)
      );
      const snap = await getDocs(q);
      return snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) } as SchoolTenantPayment))
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'payments');
    }
  }

  async recordSchoolPayment(
    payment: Omit<SchoolTenantPayment, 'id' | 'receiptNumber' | 'invoiceNumber' | 'statusHistory' | 'createdAt' | 'updatedAt'>,
    actor: SchoolAuditActor
  ): Promise<SchoolTenantPayment> {
    const now = new Date().toISOString();
    const id = sanitizeId(`pay_${payment.institutionId.slice(-8)}_${Date.now()}`);
    const receiptNumber = `OFRCP-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const invoiceNumber = `OFINV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    const payload: SchoolTenantPayment & { amount: number } = {
      ...payment,
      id,
      amount: Number(payment.amountInr),
      receiptNumber,
      invoiceNumber,
      statusHistory: [
        {
          status: payment.status,
          changedBy: actor.email,
          note: `${payment.gateway} transaction recorded`,
          changedAt: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'payments', id), stripUndefinedDeep(payload));
      await this.writeAuditLog({
        institutionId: payment.institutionId,
        institutionAdminUid: payment.institutionAdminUid,
        actor,
        action: `Payment ${payment.status}`,
        entityType: 'payment',
        entityId: id,
        summary: `INR ${payment.amountInr} (${payment.category}, ${payment.gateway}) marked ${payment.status} [${receiptNumber}].`,
      });
      return payload;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `payments/${id}`);
    }
  }

  async updateSchoolPaymentStatus(
    payment: SchoolTenantPayment,
    nextStatus: SchoolTenantPayment['status'],
    note: string,
    actor: SchoolAuditActor
  ): Promise<void> {
    const now = new Date().toISOString();
    const nextHistory = [
      ...(payment.statusHistory || []),
      { status: nextStatus, changedBy: actor.email, note, changedAt: now },
    ];
    try {
      await updateDoc(doc(db, 'payments', payment.id), {
        status: nextStatus,
        outstandingBalanceInr: nextStatus === 'Paid' ? 0 : payment.outstandingBalanceInr,
        statusHistory: nextHistory,
        updatedAt: now,
      });
      await this.writeAuditLog({
        institutionId: payment.institutionId,
        institutionAdminUid: payment.institutionAdminUid,
        actor,
        action: `Payment Status -> ${nextStatus}`,
        entityType: 'payment',
        entityId: payment.id,
        summary: `${payment.receiptNumber} updated to ${nextStatus}. ${note}`.trim(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `payments/${payment.id}`);
    }
  }

  // -------------------------------------------------------------
  // 9. Certificates & Public Minimal-PII QR Verification
  // -------------------------------------------------------------
  async getSchoolCertificates(institutionId: string): Promise<SchoolTenantCertificate[]> {
    try {
      const q = query(
        collection(db, 'school_partner_certificates'),
        where('institutionId', '==', institutionId),
        limit(300)
      );
      const snap = await getDocs(q);
      return snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) } as SchoolTenantCertificate))
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'school_partner_certificates');
    }
  }

  async issueSchoolCertificate(params: {
    institution: SchoolInstitution;
    student: SchoolTenantStudent;
    programId: string;
    programTitle: string;
    achievementSummary: string;
    issuerName: string;
    actor: SchoolAuditActor;
  }): Promise<SchoolTenantCertificate> {
    const now = new Date().toISOString();
    const certId = generateCryptoSerial('OFC');
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const verificationUrl = `${origin}/verify-certificate/${certId}`;
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, { width: 220, margin: 1 });

    const certRecord: SchoolTenantCertificate = {
      id: certId,
      certificateId: certId,
      institutionId: params.institution.id,
      institutionAdminUid: params.institution.adminUid,
      schoolName: params.institution.name,
      schoolCode: params.institution.institutionCode || params.institution.applicationRef,
      studentId: params.student.id,
      studentName: params.student.fullName,
      studentCode: params.student.studentCode,
      className: `${params.student.className} - ${params.student.section}`,
      programId: params.programId || 'school-program',
      programTitle: params.programTitle.trim().slice(0, 200),
      achievementSummary: params.achievementSummary.trim().slice(0, 300),
      issuerName: params.issuerName.trim().slice(0, 120),
      issueDate: now.slice(0, 10),
      status: 'Issued',
      verificationUrl,
      qrDataUrl,
      issuedByUid: params.actor.uid,
      createdAt: now,
      updatedAt: now,
    };

    // Strict Minimal-PII Public Verification Document
    const publicProjection = {
      id: certId,
      certificateId: certId,
      institutionId: params.institution.id,
      studentId: params.student.id,
      studentName: params.student.fullName,
      schoolName: params.institution.name,
      courseTitle: params.programTitle.trim().slice(0, 200),
      issueDate: now.slice(0, 10),
      issuerName: params.issuerName.trim().slice(0, 120),
      status: 'Issued',
      valid: true,
      grade: 'Verified',
      score: 100,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'school_partner_certificates', certId), stripUndefinedDeep(certRecord));
      await setDoc(doc(db, 'certificate_verification', certId), stripUndefinedDeep(publicProjection));
      await this.writeAuditLog({
        institutionId: params.institution.id,
        institutionAdminUid: params.institution.adminUid,
        actor: params.actor,
        action: 'Issued Certificate',
        entityType: 'certificate',
        entityId: certId,
        summary: `Issued QR-verified credential ${certId} to ${params.student.fullName} for ${params.programTitle}.`,
      });
      return certRecord;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `school_partner_certificates/${certId}`);
    }
  }

  async revokeOrCorrectCertificate(params: {
    certificate: SchoolTenantCertificate;
    nextStatus: 'Revoked' | 'Corrected' | 'Issued';
    reasonOrNote: string;
    correctedProgramTitle?: string;
    actor: SchoolAuditActor;
  }): Promise<void> {
    const now = new Date().toISOString();
    const certUpdates: Record<string, any> = {
      status: params.nextStatus,
      updatedAt: now,
    };
    const publicUpdates: Record<string, any> = {
      certificateId: params.certificate.certificateId,
      institutionId: params.certificate.institutionId,
      status: params.nextStatus,
      valid: params.nextStatus !== 'Revoked',
      updatedAt: now,
    };

    if (params.nextStatus === 'Revoked') {
      certUpdates.revocationReason = params.reasonOrNote;
      publicUpdates.revocationReason = params.reasonOrNote;
    } else {
      certUpdates.correctionNote = params.reasonOrNote;
      publicUpdates.correctionNote = params.reasonOrNote;
      if (params.correctedProgramTitle?.trim()) {
        certUpdates.programTitle = params.correctedProgramTitle.trim();
        publicUpdates.courseTitle = params.correctedProgramTitle.trim();
      }
    }

    try {
      await updateDoc(
        doc(db, 'school_partner_certificates', params.certificate.certificateId),
        stripUndefinedDeep(certUpdates)
      );
      await setDoc(
        doc(db, 'certificate_verification', params.certificate.certificateId),
        stripUndefinedDeep(publicUpdates),
        { merge: true }
      );
      await this.writeAuditLog({
        institutionId: params.certificate.institutionId,
        institutionAdminUid: params.certificate.institutionAdminUid,
        actor: params.actor,
        action: `Certificate ${params.nextStatus}`,
        entityType: 'certificate',
        entityId: params.certificate.certificateId,
        summary: `Updated ${params.certificate.certificateId} to ${params.nextStatus}: ${params.reasonOrNote}`,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `school_partner_certificates/${params.certificate.certificateId}`);
    }
  }

  // -------------------------------------------------------------
  // 10. Communications & Announcements
  // -------------------------------------------------------------
  async getSchoolAnnouncements(institutionId: string): Promise<SchoolTenantAnnouncement[]> {
    try {
      const q = query(
        collection(db, 'school_partner_announcements'),
        where('institutionId', '==', institutionId),
        limit(150)
      );
      const snap = await getDocs(q);
      return snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) } as SchoolTenantAnnouncement))
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'school_partner_announcements');
    }
  }

  async publishSchoolAnnouncement(params: {
    institution: SchoolInstitution;
    title: string;
    message: string;
    audience: SchoolTenantAnnouncement['audience'];
    priority: SchoolTenantAnnouncement['priority'];
    recipientEmails: string[];
    actor: SchoolAuditActor;
  }): Promise<SchoolTenantAnnouncement> {
    const now = new Date().toISOString();
    const id = sanitizeId(`ann_${params.institution.id.slice(-8)}_${Date.now()}`);

    let emailDispatched = 0;
    let smtpAvailable = false;
    for (const email of params.recipientEmails.slice(0, 15)) {
      try {
        const resp = await fetch('/api/notifications/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientEmail: email,
            subject: `[${params.institution.name}] ${params.title}`,
            message: params.message,
            type: 'school_announcement',
          }),
        });
        const data = await resp.json();
        if (data.dispatched) {
          emailDispatched++;
          smtpAvailable = true;
        }
      } catch {
        // non-blocking
      }
    }

    const deliveryStatus: SchoolTenantAnnouncement['deliveryStatus'] =
      emailDispatched > 0
        ? 'Email Sent'
        : params.recipientEmails.length > 0 && !smtpAvailable
        ? 'Delivered (In-App)'
        : 'Delivered (In-App)';

    const channelSummary =
      emailDispatched > 0
        ? `In-App Portal + Email (${emailDispatched} sent)`
        : 'In-App Portal Feed (SMTP email not configured)';

    const record: SchoolTenantAnnouncement = {
      id,
      institutionId: params.institution.id,
      institutionAdminUid: params.institution.adminUid,
      title: params.title.trim().slice(0, 200),
      message: params.message.trim().slice(0, 2500),
      audience: params.audience,
      priority: params.priority,
      channelSummary,
      deliveryStatus,
      createdByUid: params.actor.uid,
      createdByName: params.actor.email,
      createdAt: now,
    };

    try {
      await setDoc(doc(db, 'school_partner_announcements', id), stripUndefinedDeep(record));
      await this.writeAuditLog({
        institutionId: params.institution.id,
        institutionAdminUid: params.institution.adminUid,
        actor: params.actor,
        action: 'Published Announcement',
        entityType: 'announcement',
        entityId: id,
        summary: `"${record.title}" -> ${record.audience} (${record.channelSummary})`,
      });
      return record;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `school_partner_announcements/${id}`);
    }
  }

  // -------------------------------------------------------------
  // 11. PDF Exporters (Reports, Receipts, Certificates)
  // -------------------------------------------------------------
  downloadStudentPerformancePdf(params: {
    institution: SchoolInstitution;
    student: SchoolTenantStudent;
    attendance: SchoolTenantAttendanceRecord[];
    programs: SchoolProgramEnrollment[];
    assessments: SchoolIqEqSqResult[];
    certificates: SchoolTenantCertificate[];
  }): void {
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    pdf.setFillColor(20, 33, 61);
    pdf.rect(0, 0, 210, 34, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(15);
    pdf.text(params.institution.name, 16, 15);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9.5);
    pdf.text(
      `Student Performance Report · ${params.institution.institutionCode || params.institution.applicationRef}`,
      16,
      23
    );

    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(`${params.student.fullName} (${params.student.studentCode})`, 16, 46);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(
      `Class: ${params.student.className} - ${params.student.section} · Status: ${params.student.enrollmentStatus} · Guardian: ${params.student.guardianName} (${params.student.guardianPhone})`,
      16,
      53
    );

    const stuAtt = params.attendance.filter((a) => a.personId === params.student.id);
    const presentCount = stuAtt.filter((a) => a.status === 'Present' || a.status === 'Late').length;
    const attPct = stuAtt.length > 0 ? Math.round((presentCount / stuAtt.length) * 100) : 0;

    let y = 66;
    pdf.setFont('helvetica', 'bold');
    pdf.text('1. Attendance Summary', 16, y);
    y += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      stuAtt.length > 0
        ? `${presentCount} of ${stuAtt.length} recorded sessions attended (${attPct}%).`
        : 'No attendance sessions recorded yet.',
      16,
      y
    );

    y += 12;
    pdf.setFont('helvetica', 'bold');
    pdf.text('2. Enrolled OpenFrame Programs', 16, y);
    y += 6;
    pdf.setFont('helvetica', 'normal');
    if (params.programs.length === 0) {
      pdf.text('No program enrollments recorded yet.', 16, y);
      y += 6;
    } else {
      for (const p of params.programs.slice(0, 8)) {
        pdf.text(`• ${p.programTitle} — ${p.progressPercent}% (${p.status})`, 18, y);
        y += 6;
      }
    }

    y += 8;
    pdf.setFont('helvetica', 'bold');
    pdf.text('3. IQ / EQ / SQ Educational Assessments', 16, y);
    y += 6;
    pdf.setFont('helvetica', 'normal');
    if (params.assessments.length === 0) {
      pdf.text('No IQ/EQ/SQ assessments completed yet.', 16, y);
      y += 6;
    } else {
      for (const res of params.assessments.slice(0, 8)) {
        pdf.text(
          `• [${res.dimension}] ${res.assignmentTitle}: ${res.scorePercent}% — ${res.bandLabel}`,
          18,
          y
        );
        y += 6;
      }
    }

    y += 8;
    pdf.setFont('helvetica', 'bold');
    pdf.text('4. Certificates Issued', 16, y);
    y += 6;
    pdf.setFont('helvetica', 'normal');
    if (params.certificates.length === 0) {
      pdf.text('No certificates issued yet.', 16, y);
    } else {
      for (const cert of params.certificates.slice(0, 6)) {
        pdf.text(`• ${cert.certificateId} — ${cert.programTitle} (${cert.status})`, 18, y);
        y += 6;
      }
    }

    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(NON_CLINICAL_EDUCATIONAL_DISCLAIMER, 16, 275, { maxWidth: 178 });
    pdf.save(`${params.student.studentCode}_performance_report.pdf`);
  }

  downloadAssessmentReportPdf(
    institution: SchoolInstitution,
    result: SchoolIqEqSqResult
  ): void {
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    pdf.setFillColor(20, 33, 61);
    pdf.rect(0, 0, 210, 32, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text(`OpenFrame ${result.dimension} Educational Reflection Report`, 16, 15);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9.5);
    pdf.text(`${institution.name} · ${institution.institutionCode || institution.applicationRef}`, 16, 23);

    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${result.studentName} (${result.studentCode}) · Class ${result.className}`, 16, 44);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`Assessment: ${result.assignmentTitle}`, 16, 51);
    pdf.text(`Score Index: ${result.scorePercent}% · Reflection Band: ${result.bandLabel}`, 16, 58);

    pdf.setFont('helvetica', 'bold');
    pdf.text('Summary & Learning Guidance', 16, 72);
    pdf.setFont('helvetica', 'normal');
    pdf.text(result.educationalSummary || '', 16, 79, { maxWidth: 178 });

    let y = 102;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Domain Breakdown', 16, y);
    y += 7;
    pdf.setFont('helvetica', 'normal');
    for (const [domain, val] of Object.entries(result.subScores || {})) {
      pdf.text(`${domain}: ${val}%`, 18, y);
      y += 6;
    }

    pdf.setDrawColor(203, 213, 225);
    pdf.rect(16, 240, 178, 30);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.text('IMPORTANT EDUCATIONAL LIMITATIONS NOTICE', 20, 247);
    pdf.setFont('helvetica', 'normal');
    pdf.text(NON_CLINICAL_EDUCATIONAL_DISCLAIMER, 20, 253, { maxWidth: 170 });

    pdf.save(`${result.studentCode}_${result.dimension}_report.pdf`);
  }

  downloadPaymentReceiptPdf(
    institution: SchoolInstitution,
    payment: SchoolTenantPayment
  ): void {
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    pdf.setFillColor(20, 33, 61);
    pdf.rect(0, 0, 210, 32, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(15);
    pdf.text('OpenFrame Education — Payment Receipt & Tax Invoice', 16, 15);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9.5);
    pdf.text(`Receipt: ${payment.receiptNumber} · Invoice: ${payment.invoiceNumber}`, 16, 23);

    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(10.5);
    let y = 46;
    const rows: Array<[string, string]> = [
      ['Institution', `${institution.name} (${institution.institutionCode || institution.applicationRef})`],
      ['Payer', `${payment.payerName} (${payment.payerEmail})`],
      ['Student', payment.studentName || 'Institutional Account'],
      ['Category', payment.category],
      ['Description', payment.description],
      ['Amount (INR)', `INR ${payment.amountInr.toLocaleString('en-IN')}`],
      ['Outstanding Balance', `INR ${payment.outstandingBalanceInr.toLocaleString('en-IN')}`],
      ['Gateway / Mode', payment.gateway],
      ['Gateway Ref', payment.razorpayPaymentId || payment.razorpayOrderId || 'Institutional Ledger'],
      ['Status', payment.status],
      ['Date', new Date(payment.createdAt).toLocaleString()],
    ];
    for (const [k, v] of rows) {
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${k}:`, 16, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(String(v), 68, y, { maxWidth: 126 });
      y += 8;
    }

    pdf.save(`${payment.receiptNumber}.pdf`);
  }

  async downloadSchoolCertificatePdf(cert: SchoolTenantCertificate): Promise<void> {
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const w = pdf.internal.pageSize.getWidth();
    const h = pdf.internal.pageSize.getHeight();

    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, w, h, 'F');
    pdf.setDrawColor(20, 33, 61);
    pdf.setLineWidth(1);
    pdf.rect(10, 10, w - 20, h - 20);
    pdf.setDrawColor(37, 99, 235);
    pdf.setLineWidth(0.4);
    pdf.rect(14, 14, w - 28, h - 28);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(20, 33, 61);
    pdf.text('OPENFRAME EDUCATION · SCHOOL PARTNER CREDENTIAL', w / 2, 27, { align: 'center' });

    pdf.setFontSize(10);
    pdf.setTextColor(71, 85, 105);
    pdf.text(`${cert.schoolName} (${cert.schoolCode})`, w / 2, 34, { align: 'center' });

    pdf.setFontSize(22);
    pdf.setTextColor(20, 33, 61);
    pdf.text('CERTIFICATE OF COMPLETION', w / 2, 53, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(100, 116, 139);
    pdf.text('This certifies that', w / 2, 66, { align: 'center' });

    pdf.setFont('times', 'bold');
    pdf.setFontSize(30);
    pdf.setTextColor(37, 99, 235);
    pdf.text(cert.studentName, w / 2, 82, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(51, 65, 85);
    pdf.text(
      `Student ID ${cert.studentCode} (${cert.className}) has successfully fulfilled requirements for`,
      w / 2,
      96,
      { align: 'center' }
    );

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(17);
    pdf.setTextColor(15, 23, 42);
    pdf.text(cert.programTitle, w / 2, 110, { align: 'center', maxWidth: w - 60 });

    if (cert.achievementSummary) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(71, 85, 105);
      pdf.text(cert.achievementSummary, w / 2, 122, { align: 'center', maxWidth: w - 70 });
    }

    const qrUrl = cert.qrDataUrl || (await QRCode.toDataURL(cert.verificationUrl, { width: 200 }));
    pdf.addImage(qrUrl, 'PNG', w / 2 - 14, 138, 28, 28);

    pdf.setFontSize(9);
    pdf.setTextColor(71, 85, 105);
    pdf.text(`Issue Date: ${cert.issueDate}`, 26, 152);
    pdf.text(`Serial: ${cert.certificateId}`, 26, 158);
    pdf.text(`Status: ${cert.status}`, 26, 164);

    pdf.setFont('times', 'italic');
    pdf.setFontSize(12);
    pdf.setTextColor(15, 23, 42);
    pdf.text(cert.issuerName, w - 26, 154, { align: 'right' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    pdf.text('Authorized Institutional Signatory', w - 26, 161, { align: 'right' });

    pdf.save(`${cert.certificateId}.pdf`);
  }
}

export const schoolPartnerService = new SchoolPartnerService();
