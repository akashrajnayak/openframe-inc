import {
  collection,
  doc,
  writeBatch,
  getDoc,
  getDocs,
  query,
  limit,
  getCountFromServer,
  FirestoreError
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { synthesizeCourse, ALL_90_CATEGORIES, DOMAIN_GROUPS_BY_CATEGORY } from './marketplaceService';
import { MarketplaceCourse, MarketplaceCourseStatus } from '../types';

export interface CourseFirestoreRecord {
  id: string;
  aliasId?: string;
  title: string;
  category: string;
  categoryGroup: string;
  subcategory: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  duration: string;
  estimatedHours: number;
  pricingTier: string;
  price: number;
  status: MarketplaceCourseStatus;
  rating: number;
  enrolledCount: number;
  imageUrl: string;
  tags: string[];
  shortDesc: string;
  description: string;
  overview: {
    whySubjectMatters: string;
    topicsCovered: string;
    practicalSkillsDeveloped: string;
    whoShouldEnrol: string;
    achieveAfterCompletion: string;
  };
  learningObjectives: string[];
  modulesCount: number;
  modulesSummary: Array<{
    moduleNumber: number;
    title: string;
    duration: string;
  }>;
  practicalProjects: string[];
  assessmentMethod: string;
  certificateEligibility: boolean;
  certificateNote: string;
  source: 'openframe_education_seed_v1';
  metadata: {
    batchNumber: number;
    seededAt: string;
    catalogTotalTarget: number;
    schemaVersion: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MigrationConfig {
  startIndex: number;
  endIndex: number;
  batchSize: number; // 1 to 500, default 200
  throttleDelayMs: number; // Delay between batches to respect Firestore write limits
  dryRun?: boolean;
}

export interface MigrationProgress {
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  startIndex: number;
  endIndex: number;
  currentIndex: number;
  totalToSeed: number;
  seededCount: number;
  failedCount: number;
  currentBatch: number;
  totalBatches: number;
  percent: number;
  speedPerSecond: number;
  estimatedTimeRemainingSec: number;
  lastSeededId: string;
  lastBatchTimestamp: string;
}

export interface MigrationLogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warn' | 'error';
  message: string;
  details?: string;
}

const CHECKPOINT_STORAGE_KEY = 'openframe_course_migration_checkpoint_v1';
export const TOTAL_TARGET_COURSES = 15000;

class CourseMigrationService {
  private activeAbortController: AbortController | null = null;
  private isPausedState = false;
  private currentProgress: MigrationProgress = {
    isRunning: false,
    isPaused: false,
    isCompleted: false,
    startIndex: 1,
    endIndex: TOTAL_TARGET_COURSES,
    currentIndex: 0,
    totalToSeed: TOTAL_TARGET_COURSES,
    seededCount: 0,
    failedCount: 0,
    currentBatch: 0,
    totalBatches: 0,
    percent: 0,
    speedPerSecond: 0,
    estimatedTimeRemainingSec: 0,
    lastSeededId: '',
    lastBatchTimestamp: ''
  };

  private progressListeners: Array<(progress: MigrationProgress) => void> = [];
  private logListeners: Array<(log: MigrationLogEntry) => void> = [];

  // Subscribe to progress events
  subscribeProgress(callback: (progress: MigrationProgress) => void): () => void {
    this.progressListeners.push(callback);
    callback({ ...this.currentProgress });
    return () => {
      this.progressListeners = this.progressListeners.filter((cb) => cb !== callback);
    };
  }

  // Subscribe to logs
  subscribeLogs(callback: (log: MigrationLogEntry) => void): () => void {
    this.logListeners.push(callback);
    return () => {
      this.logListeners = this.logListeners.filter((cb) => cb !== callback);
    };
  }

  private notifyProgress() {
    const copy = { ...this.currentProgress };
    for (const listener of this.progressListeners) {
      try {
        listener(copy);
      } catch (e) {
        console.error('Progress listener error:', e);
      }
    }
  }

  private emitLog(type: MigrationLogEntry['type'], message: string, details?: string) {
    const entry: MigrationLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      details
    };
    for (const listener of this.logListeners) {
      try {
        listener(entry);
      } catch (e) {
        console.error('Log listener error:', e);
      }
    }
  }

  /**
   * Convert an index (1 to 15,000) into a normalized Firestore document
   */
  generateCourseDocument(index: number, batchNumber = 1): CourseFirestoreRecord {
    const base = synthesizeCourse(index);
    const nowIso = new Date().toISOString();

    // Map the first 100 courses with OF-AI-XXX alias if applicable
    let aliasId: string | undefined;
    if (index <= 100) {
      aliasId = `OF-AI-${String(index).padStart(3, '0')}`;
    }

    const docId = base.id; // "OF-CRS-00001" format
    const breakdown = (base as any).descriptionBreakdown || (base as any).overview || {
      whySubjectMatters: `${base.category} is an essential competency in modern technology initiatives.`,
      topicsCovered: `${base.category} architecture, tooling, and practical lab exercises.`,
      practicalSkillsDeveloped: 'Architecture design, debugging, testing, and system integration.',
      whoShouldEnrol: 'Students, developers, engineering candidates, and IT professionals.',
      achieveAfterCompletion: 'Certified OpenFrame portfolio capstones and verified credentials.'
    };

    return {
      id: docId,
      aliasId,
      title: base.title.slice(0, 200),
      category: base.category.slice(0, 100),
      categoryGroup: base.categoryGroup.slice(0, 80),
      subcategory: base.subcategory.slice(0, 100),
      level: base.level,
      duration: base.duration.slice(0, 80),
      estimatedHours: base.estimatedHours ?? 24,
      pricingTier: base.pricingTier,
      price: base.price,
      status: base.status,
      rating: base.rating,
      enrolledCount: base.enrolledCount,
      imageUrl: base.imageUrl,
      tags: (base as any).tags || [base.category, 'Certification', '2026-27'],
      shortDesc: base.shortDesc.slice(0, 2000),
      description: base.description.slice(0, 8000),
      overview: {
        whySubjectMatters: String(breakdown.whySubjectMatters || '').slice(0, 500),
        topicsCovered: String(breakdown.topicsCovered || '').slice(0, 500),
        practicalSkillsDeveloped: String(breakdown.practicalSkillsDeveloped || '').slice(0, 500),
        whoShouldEnrol: String(breakdown.whoShouldEnrol || '').slice(0, 500),
        achieveAfterCompletion: String(breakdown.achieveAfterCompletion || '').slice(0, 500)
      },
      learningObjectives: base.learningObjectives.slice(0, 6),
      modulesCount: base.modules.length,
      modulesSummary: base.modules.map((m) => ({
        moduleNumber: m.moduleNumber,
        title: m.title.slice(0, 120),
        duration: m.duration
      })),
      practicalProjects: base.practicalProjects,
      assessmentMethod: base.assessmentMethod.slice(0, 200),
      certificateEligibility: base.certificateEligibility,
      certificateNote: base.certificateNote.slice(0, 250),
      source: 'openframe_education_seed_v1',
      metadata: {
        batchNumber,
        seededAt: nowIso,
        catalogTotalTarget: TOTAL_TARGET_COURSES,
        schemaVersion: '1.0.0'
      },
      createdAt: nowIso,
      updatedAt: nowIso
    };
  }

  /**
   * Check how many documents exist in the Firestore `/courses` collection
   */
  async getFirestoreCourseCount(): Promise<number> {
    try {
      const coursesColl = collection(db, 'courses');
      const countSnapshot = await getCountFromServer(coursesColl);
      return countSnapshot.data().count;
    } catch (error) {
      console.warn('getCountFromServer failed, falling back to limit query check:', error);
      try {
        const q = query(collection(db, 'courses'), limit(100));
        const snap = await getDocs(q);
        return snap.size;
      } catch (innerError) {
        handleFirestoreError(innerError, OperationType.GET, 'courses');
        return 0;
      }
    }
  }

  /**
   * Get a sample course directly from Firestore to verify schema persistence
   */
  async fetchSampleFromFirestore(courseId = 'OF-CRS-00001'): Promise<any | null> {
    try {
      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      if (courseDoc.exists()) {
        return courseDoc.data();
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `courses/${courseId}`);
      return null;
    }
  }

  /**
   * Save migration checkpoint to local storage
   */
  saveCheckpoint(index: number) {
    try {
      localStorage.setItem(
        CHECKPOINT_STORAGE_KEY,
        JSON.stringify({
          lastIndex: index,
          timestamp: new Date().toISOString()
        })
      );
    } catch (e) {
      console.warn('Failed to save checkpoint in localStorage:', e);
    }
  }

  /**
   * Retrieve saved checkpoint
   */
  getSavedCheckpoint(): { lastIndex: number; timestamp: string } | null {
    try {
      const raw = localStorage.getItem(CHECKPOINT_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse checkpoint:', e);
    }
    return null;
  }

  /**
   * Clear migration checkpoint
   */
  clearCheckpoint() {
    try {
      localStorage.removeItem(CHECKPOINT_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear checkpoint:', e);
    }
  }

  /**
   * Pause ongoing migration
   */
  pause() {
    if (this.currentProgress.isRunning && !this.isPausedState) {
      this.isPausedState = true;
      this.currentProgress.isPaused = true;
      this.emitLog('warn', 'Migration paused by user.');
      this.notifyProgress();
    }
  }

  /**
   * Resume paused migration
   */
  resume() {
    if (this.currentProgress.isRunning && this.isPausedState) {
      this.isPausedState = false;
      this.currentProgress.isPaused = false;
      this.emitLog('info', 'Migration resumed.');
      this.notifyProgress();
    }
  }

  /**
   * Cancel and abort ongoing migration
   */
  cancel() {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }
    this.isPausedState = false;
    this.currentProgress.isRunning = false;
    this.currentProgress.isPaused = false;
    this.emitLog('warn', 'Migration process cancelled.');
    this.notifyProgress();
  }

  /**
   * Execute systematic seeding of course records into Firestore
   */
  async runMigration(config: Partial<MigrationConfig> = {}): Promise<MigrationProgress> {
    if (this.currentProgress.isRunning) {
      throw new Error('A migration task is already in progress.');
    }

    const startIndex = Math.max(1, config.startIndex || 1);
    const endIndex = Math.min(TOTAL_TARGET_COURSES, config.endIndex || TOTAL_TARGET_COURSES);
    const batchSize = Math.max(1, Math.min(500, config.batchSize || 200)); // Firestore limit is 500
    const throttleDelayMs = config.throttleDelayMs ?? 150;
    const isDryRun = Boolean(config.dryRun);

    const totalToSeed = Math.max(0, endIndex - startIndex + 1);
    const totalBatches = Math.ceil(totalToSeed / batchSize);

    this.activeAbortController = new AbortController();
    const { signal } = this.activeAbortController;
    this.isPausedState = false;

    this.currentProgress = {
      isRunning: true,
      isPaused: false,
      isCompleted: false,
      startIndex,
      endIndex,
      currentIndex: startIndex - 1,
      totalToSeed,
      seededCount: 0,
      failedCount: 0,
      currentBatch: 0,
      totalBatches,
      percent: 0,
      speedPerSecond: 0,
      estimatedTimeRemainingSec: 0,
      lastSeededId: '',
      lastBatchTimestamp: ''
    };

    this.notifyProgress();
    this.emitLog(
      'info',
      `Starting ${isDryRun ? 'DRY-RUN simulation' : 'Firestore migration'}: Seeding courses #${startIndex} to #${endIndex} (${totalToSeed} records across ${totalBatches} batches of ${batchSize}).`
    );

    const startTime = Date.now();
    let seededTotal = 0;
    let failedTotal = 0;

    try {
      for (let b = 0; b < totalBatches; b++) {
        // Handle abort
        if (signal.aborted) {
          this.emitLog('warn', 'Migration aborted gracefully.');
          break;
        }

        // Handle pause
        while (this.isPausedState && !signal.aborted) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }

        if (signal.aborted) break;

        const batchStartIndex = startIndex + b * batchSize;
        const batchEndIndex = Math.min(endIndex, batchStartIndex + batchSize - 1);
        const currentBatchNumber = b + 1;

        // Generate documents for this batch
        const batchDocuments: CourseFirestoreRecord[] = [];
        for (let idx = batchStartIndex; idx <= batchEndIndex; idx++) {
          batchDocuments.push(this.generateCourseDocument(idx, currentBatchNumber));
        }

        this.emitLog(
          'info',
          `Batch ${currentBatchNumber}/${totalBatches}: Preparing ${batchDocuments.length} courses (${batchDocuments[0].id} → ${batchDocuments[batchDocuments.length - 1].id})...`
        );

        if (!isDryRun) {
          // Commit batch to Firestore
          const writeBatchInstance = writeBatch(db);
          for (const courseDoc of batchDocuments) {
            const docRef = doc(db, 'courses', courseDoc.id);
            writeBatchInstance.set(docRef, courseDoc, { merge: true });
          }

          try {
            await writeBatchInstance.commit();
            seededTotal += batchDocuments.length;
            this.emitLog(
              'success',
              `Batch ${currentBatchNumber}/${totalBatches} committed successfully (${batchDocuments.length} docs written).`
            );
          } catch (writeErr: any) {
            failedTotal += batchDocuments.length;
            this.emitLog(
              'error',
              `Batch ${currentBatchNumber}/${totalBatches} write failed: ${writeErr?.message || String(writeErr)}`
            );
            // Don't throw immediately, allow continuing to attempt subsequent batches or inspect
          }
        } else {
          // Dry run simulation
          await new Promise((resolve) => setTimeout(resolve, 30));
          seededTotal += batchDocuments.length;
          this.emitLog(
            'success',
            `[DRY-RUN] Batch ${currentBatchNumber}/${totalBatches} simulated successfully (${batchDocuments.length} validated docs).`
          );
        }

        // Calculate metrics
        const elapsedSec = (Date.now() - startTime) / 1000;
        const speed = elapsedSec > 0 ? Math.round(seededTotal / elapsedSec) : 0;
        const remainingDocs = totalToSeed - seededTotal;
        const etaSec = speed > 0 ? Math.round(remainingDocs / speed) : 0;
        const percent = Math.min(100, Math.round((seededTotal / totalToSeed) * 100));

        this.currentProgress = {
          ...this.currentProgress,
          currentIndex: batchEndIndex,
          seededCount: seededTotal,
          failedCount: failedTotal,
          currentBatch: currentBatchNumber,
          percent,
          speedPerSecond: speed,
          estimatedTimeRemainingSec: etaSec,
          lastSeededId: batchDocuments[batchDocuments.length - 1].id,
          lastBatchTimestamp: new Date().toLocaleTimeString()
        };

        this.saveCheckpoint(batchEndIndex);
        this.notifyProgress();

        // Throttle pause between batches
        if (throttleDelayMs > 0 && b < totalBatches - 1) {
          await new Promise((resolve) => setTimeout(resolve, throttleDelayMs));
        }
      }

      const totalElapsedSec = Math.round((Date.now() - startTime) / 1000);
      this.currentProgress.isCompleted = true;
      this.currentProgress.isRunning = false;
      this.emitLog(
        'success',
        `Migration finished! Successfully processed ${seededTotal} of ${totalToSeed} courses in ${totalElapsedSec}s (Errors: ${failedTotal}).`
      );
    } catch (err: any) {
      this.emitLog('error', `Migration encountered unexpected failure: ${err?.message || String(err)}`);
      this.currentProgress.isRunning = false;
      throw err;
    } finally {
      this.activeAbortController = null;
      this.notifyProgress();
    }

    return { ...this.currentProgress };
  }

  /**
   * Produce a dry-run preview sample of records
   */
  getSampleRecords(count = 5): CourseFirestoreRecord[] {
    const list: CourseFirestoreRecord[] = [];
    for (let i = 1; i <= Math.min(count, TOTAL_TARGET_COURSES); i++) {
      list.push(this.generateCourseDocument(i));
    }
    return list;
  }
}

export const courseMigrationService = new CourseMigrationService();
