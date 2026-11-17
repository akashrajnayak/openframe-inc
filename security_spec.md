# Security Specification — OpenFrame School Partner Portal & Multi-Tenant Ecosystem

## 1. Eight Pillars & Data Invariants
1. **Strict Tenant Isolation (`institutionId`)**:
   - Every school-scoped document (`classes`, `institution_staff`, `institution_students`, `attendance`, `iq_eq_sq_assessments`, `school_assessment_assignments`, `school_program_enrollments`, `school_partner_certificates`, `school_partner_announcements`, `school_partner_audit_logs`, `payments`, `subscriptions`) carries `institutionId` and `institutionAdminUid`.
   - School A's administrator or assigned teacher can NEVER read, list, create, update, or delete School B's documents.
2. **List Query Safety (Zero `get()`/`exists()` inside `allow list`)**:
   - `allow list` rules rely exclusively on token identity (`request.auth.uid`, `request.auth.token.email`) matching document fields (`resource.data.institutionAdminUid == request.auth.uid`, `request.auth.uid in resource.data.assignedTeacherUids`, etc.) or `isAdmin()` / `isEducationAdmin()`.
3. **Onboarding & Governance State Transitions (`institutions/{id}`)**:
   - Applicant creates `institutions/{id}` only with `adminUid == request.auth.uid` and `verificationStatus in ['Draft', 'Submitted']`.
   - Applicant updates `institutions/{id}` only when `existing().adminUid == request.auth.uid`, and cannot self-approve (`Approved`), self-suspend (`Suspended`), or alter `adminUid` / `schoolCode`. Applicants may transition `Draft -> Submitted` or `More Information Required -> Submitted`.
   - Only Platform Admins (`isAdmin() || isEducationAdmin()`) may set `verificationStatus` to `Under Review`, `Approved`, `Rejected`, `More Information Required`, or `Suspended`, or reassign `adminUid`.
4. **Least-Privilege Assigned Teacher Access**:
   - Teachers explicitly listed in `assignedTeacherUids` on a student/class/attendance/assessment doc can read their school's assigned records and mark attendance or inspect student assessment results, but CANNOT access `payments`, `subscriptions`, `school_partner_audit_logs` modifications, or deactivate staff.
5. **Immutable Audit Trail**:
   - `school_partner_audit_logs/{id}` and `activity_logs/{id}` disallow `update` and `delete` (`allow update, delete: if false;`).
6. **Public Credential Verification Privacy (`certificate_verification/{certId}`)**:
   - Public `get` returns only minimal verification fields (`certificateId`, `studentName`, `courseTitle`, `schoolName`, `issueDate`, `status`, `issuerName`, `revocationReason`, `correctionNote`, `valid`, `grade`, `score`) — no student email, mobile, DOB, parent contact, or residential address.
7. **Schema & Bounds Validation**:
   - All creates/updates validate string lengths, enums (`status`, `verificationStatus`, `dimension`), numeric ranges, and matching path IDs (`incoming().id == id`).
- **Payment Integrity**:
   - `payments/{id}` cannot be forged to `'Paid'` without matching gateway/verified reference or authorized admin/school admin ledger rules; Razorpay signatures and webhooks are verified server-side using HMAC-SHA256.
   - Course payment records and protected payment fields (`paymentStatus`, `feeAmount`, `razorpayOrderId`, `razorpayPaymentId`, `verifiedServerSide`) on `/course_enrollments/{id}` can ONLY be modified by `Super Admin` (`isSuperAdmin()`). Ordinary staff/coordinators/educators can review workflow statuses (`Submitted`..`Cancelled`), assign coordinators, and record internal notes without altering payment records.
9. **Unavailable Course Requests Privacy**:
   - `/course_requests/{id}` allows bounded creation of `'Requested'` items; listing/updating is restricted to `isAdmin() || isEducationAdmin()` or the requester's own `requesterUid`.

## 2. Adversarial Dirty Dozen Payloads
- **Cross-Tenant Read/Write**: School B admin attempts `get` / `list` / `update` on School A's `institution_students/{stuId}` -> Denied.
- **Self-Approval Escalation**: Applicant attempts `update` on `institutions/{id}` changing `verificationStatus` from `Submitted` to `Approved` -> Denied.
- **Admin Role Spoofing**: Regular signed-in user attempts `update` on `users/{uid}` changing `role` to `'admin'` -> Denied.
- **Public Enumeration of Certificates**: Unauthenticated client runs `list` on `certificate_verification` or `school_partner_certificates` -> Denied (`get` only on `certificate_verification/{certId}`).
- **Audit Tampering**: School admin attempts `update` or `delete` on `school_partner_audit_logs/{id}` -> Denied.
- **Oversized/Corrupt Payload**: Client writes `studentName` > 120 chars or negative payment amount -> Denied.
- **Teacher Financial Snooping**: Assigned school teacher queries `payments` for their school -> Denied unless they are `institutionAdminUid` or `userId`.
- **Coordinator Payment Tampering**: Non-Super-Admin coordinator attempts `update` on `course_enrollments/{id}` changing `paymentStatus` or `feeAmount`, or modifying a course payment record in `payments/{id}` -> Denied (`isSuperAdmin()` required).
- **Forged Paid Enrollment**: Student attempts `create` on `course_enrollments/{id}` with `paymentStatus == 'Paid'` without a valid `razorpayPaymentId` and `verifiedServerSide == true` -> Denied.
