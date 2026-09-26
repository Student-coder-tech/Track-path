import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { MongoClient, type Collection, type Db } from 'mongodb';
import type {
  AnalyticsData,
  ApplicationStatus,
  JobApplication,
  ReminderItem,
  TimelineEvent,
  InterviewRound,
  ApplicationNote,
} from '../src/types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.resolve(__dirname, '../data/applications.json');

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'Wishlist', 'Applied', 'Online Assessment', 'Technical Interview',
  'Behavioral Interview', 'Final Round', 'Offer', 'Rejected', 'Withdrawn',
];
export const JOB_TYPES = ['Internship', 'Full-time', 'Co-op', 'Contract', 'Part-time'] as const;
export const WORK_MODELS = ['Remote', 'Hybrid', 'Onsite'] as const;
export const DEADLINE_TYPES = ['Application Deadline', 'Online Assessment', 'Interview Round', 'Offer Expiry', 'Follow-up'] as const;
const INTERVIEW_FORMATS = ['Video Call', 'Phone Call', 'Take-home', 'In-person'] as const;
const INTERVIEW_OUTCOMES = ['Passed', 'Pending', 'Rejected'] as const;

export type ApplicationInput = Partial<JobApplication> & Record<string, unknown>;

type PersistedApplication = JobApplication & { _id?: unknown };

function asString(value: unknown, field: string, required = false): string | undefined {
  if (value === undefined || value === null || value === '') {
    if (required) throw new ValidationError(`${field} is required`);
    return undefined;
  }
  if (typeof value !== 'string') throw new ValidationError(`${field} must be a string`);
  return value.trim();
}

function validDate(value: unknown, field: string, required = false): string | undefined {
  const text = asString(value, field, required);
  if (!text) return undefined;
  if (field === 'appliedDate' || field === 'deadline') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(Date.parse(`${text}T00:00:00Z`))) {
      throw new ValidationError(`${field} must use YYYY-MM-DD format`);
    }
  } else if (Number.isNaN(Date.parse(text))) {
    throw new ValidationError(`${field} must be a valid date`);
  }
  return text;
}

function enumValue<T extends string>(value: unknown, allowed: readonly T[], field: string, fallback?: T): T {
  const candidate = value === undefined || value === null || value === '' ? fallback : value;
  if (!allowed.includes(candidate as T)) throw new ValidationError(`${field} must be one of: ${allowed.join(', ')}`);
  return candidate as T;
}

function stringArray(value: unknown, field: string): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new ValidationError(`${field} must be an array of strings`);
  }
  return value.map((item) => item.trim()).filter(Boolean);
}

function optionalUrl(value: unknown, field: string): string | undefined {
  const text = asString(value, field);
  if (!text) return undefined;
  try {
    const url = new URL(text);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('protocol');
  } catch {
    throw new ValidationError(`${field} must be a valid http(s) URL`);
  }
  return text;
}

function nestedArray<T>(value: unknown, field: string): T[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.some((item) => !item || typeof item !== 'object' || Array.isArray(item))) {
    throw new ValidationError(`${field} must be an array of objects`);
  }
  return value as T[];
}

function validateNested(app: ApplicationInput): void {
  const contacts = nestedArray<Record<string, unknown>>(app.contacts, 'contacts');
  for (const contact of contacts) {
    asString(contact.name, 'contact.name', true);
    asString(contact.role, 'contact.role', true);
    optionalUrl(contact.linkedin, 'contact.linkedin');
    if (contact.email !== undefined && typeof contact.email !== 'string') throw new ValidationError('contact.email must be a string');
  }
  const interviews = nestedArray<Record<string, unknown>>(app.interviews, 'interviews');
  for (const interview of interviews) {
    asString(interview.roundName, 'interview.roundName', true);
    validDate(interview.scheduledDate, 'interview.scheduledDate');
    if (interview.format !== undefined && interview.format !== null && interview.format !== '') enumValue(interview.format, INTERVIEW_FORMATS, 'interview.format');
    if (interview.outcome !== undefined && interview.outcome !== null && interview.outcome !== '') enumValue(interview.outcome, INTERVIEW_OUTCOMES, 'interview.outcome');
    if (interview.completed !== undefined && typeof interview.completed !== 'boolean') throw new ValidationError('interview.completed must be boolean');
    stringArray(interview.questionsAsked, 'interview.questionsAsked');
  }
  const notes = nestedArray<Record<string, unknown>>(app.notes, 'notes');
  for (const note of notes) {
    asString(note.content, 'note.content', true);
    validDate(note.date, 'note.date', true);
  }
  const timeline = nestedArray<Record<string, unknown>>(app.timeline, 'timeline');
  for (const event of timeline) {
    asString(event.title, 'timeline.title', true);
    validDate(event.timestamp, 'timeline.timestamp', true);
  }
}

export function validateApplication(input: ApplicationInput, partial = false): void {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new ValidationError('Application must be an object');
  if (!partial || input.company !== undefined) {
    const company = asString(input.company, 'company', true);
    if (company && company.length > 200) throw new ValidationError('company is too long');
  }
  if (!partial || input.role !== undefined) {
    const role = asString(input.role, 'role', true);
    if (role && role.length > 200) throw new ValidationError('role is too long');
  }
  if (input.jobType !== undefined) enumValue(input.jobType, JOB_TYPES, 'jobType');
  if (input.workModel !== undefined) enumValue(input.workModel, WORK_MODELS, 'workModel');
  if (input.status !== undefined) enumValue(input.status, APPLICATION_STATUSES, 'status');
  if (!partial || input.appliedDate !== undefined) validDate(input.appliedDate, 'appliedDate', true);
  if (input.deadline !== undefined && input.deadline !== null && input.deadline !== '') validDate(input.deadline, 'deadline');
  if (input.deadlineType !== undefined && input.deadlineType !== null && String(input.deadlineType) !== '') enumValue(input.deadlineType, DEADLINE_TYPES, 'deadlineType');
  if (input.rating !== undefined) {
    const rating = Number(input.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new ValidationError('rating must be an integer between 1 and 5');
  }
  if (input.jobUrl !== undefined && input.jobUrl !== '') optionalUrl(input.jobUrl, 'jobUrl');
  if (input.tags !== undefined) stringArray(input.tags, 'tags');
  validateNested(input);
}

function apiDocument(doc: PersistedApplication): JobApplication {
  const { _id, ...application } = doc;
  return application;
}

function newId(prefix: string): string {
  return `${prefix}-${randomUUID()}`;
}

export class ValidationError extends Error {
  statusCode = 400;
}

export class StorageService {
  private static client: MongoClient | null = null;
  private static db: Db | null = null;
  private static collection: Collection<PersistedApplication> | null = null;

  static async connect(): Promise<void> {
    if (this.collection) return;
    const uri = process.env.MONGODB_URI?.trim();
    if (!uri) throw new Error('MONGODB_URI is not configured. Copy .env.example to .env and add your MongoDB connection string.');
    this.client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
    await this.client.connect();
    this.db = this.client.db(process.env.MONGODB_DB?.trim() || undefined);
    this.collection = this.db.collection<PersistedApplication>('applications');
    await this.collection.createIndexes([
      { key: { id: 1 }, unique: true, name: 'application_id_unique' },
      { key: { company: 1 }, name: 'application_company' },
      { key: { status: 1 }, name: 'application_status' },
      { key: { jobType: 1 }, name: 'application_job_type' },
      { key: { workModel: 1 }, name: 'application_work_model' },
      { key: { appliedDate: -1 }, name: 'application_applied_date' },
      { key: { deadline: 1 }, name: 'application_deadline' },
    ]);
  }

  static async close(): Promise<void> {
    await this.client?.close();
    this.client = null; this.db = null; this.collection = null;
  }

  private static getCollection(): Collection<PersistedApplication> {
    if (!this.collection) throw new Error('MongoDB is not connected');
    return this.collection;
  }

  static async getAll(filters: { search?: string; status?: string; jobType?: string; workModel?: string; sort?: string } = {}): Promise<JobApplication[]> {
    const query: Record<string, unknown> = {};
    if (filters.search?.trim()) {
      const escaped = filters.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { company: { $regex: escaped, $options: 'i' } },
        { role: { $regex: escaped, $options: 'i' } },
        { location: { $regex: escaped, $options: 'i' } },
        { tags: { $regex: escaped, $options: 'i' } },
      ];
    }
    if (filters.status && filters.status !== 'All') query.status = enumValue(filters.status, APPLICATION_STATUSES, 'status');
    if (filters.jobType && filters.jobType !== 'All') query.jobType = enumValue(filters.jobType, JOB_TYPES, 'jobType');
    if (filters.workModel && filters.workModel !== 'All') query.workModel = enumValue(filters.workModel, WORK_MODELS, 'workModel');
    const sort: Record<string, 1 | -1> = filters.sort === 'deadline' ? { deadline: 1 } : filters.sort === 'rating' ? { rating: -1 } : filters.sort === 'company' ? { company: 1 } : { appliedDate: -1 };
    const docs = await this.getCollection().find(query).sort(sort).toArray();
    return docs.map(apiDocument);
  }

  static async getById(id: string): Promise<JobApplication | null> {
    const doc = await this.getCollection().findOne({ id });
    return doc ? apiDocument(doc) : null;
  }

  static async create(data: ApplicationInput): Promise<JobApplication> {
    validateApplication({ ...data, appliedDate: data.appliedDate ?? new Date().toISOString().slice(0, 10) });
    const now = new Date().toISOString();
    const status = enumValue(data.status, APPLICATION_STATUSES, 'status', 'Applied');
    const app: JobApplication = {
      id: newId('app'), company: String(data.company).trim(), role: String(data.role).trim(),
      jobType: enumValue(data.jobType, JOB_TYPES, 'jobType', 'Internship'),
      workModel: enumValue(data.workModel, WORK_MODELS, 'workModel', 'Hybrid'),
      location: String(data.location ?? '').trim(), salaryRange: String(data.salaryRange ?? '').trim(),
      jobUrl: data.jobUrl ? String(data.jobUrl).trim() : undefined, status,
      appliedDate: String(data.appliedDate ?? now.slice(0, 10)), deadline: data.deadline ? String(data.deadline) : null,
      deadlineType: enumValue(data.deadlineType, DEADLINE_TYPES, 'deadlineType', 'Application Deadline'),
      deadlineNotes: String(data.deadlineNotes ?? '').trim(), deadlineCompleted: Boolean(data.deadlineCompleted),
      rating: Number(data.rating ?? 3), resumeVersion: String(data.resumeVersion ?? '').trim(),
      referralName: String(data.referralName ?? '').trim(), tags: stringArray(data.tags, 'tags'),
      contacts: nestedArray(data.contacts, 'contacts') as JobApplication['contacts'],
      interviews: nestedArray(data.interviews, 'interviews') as JobApplication['interviews'],
      notes: nestedArray(data.notes, 'notes') as JobApplication['notes'],
      source: String(data.source ?? '').trim(), createdAt: now, updatedAt: now,
      timeline: [{ id: newId('tl'), type: 'status_change', title: status === 'Wishlist' ? 'Added to Wishlist' : 'Application Created', description: `Logged with initial status: ${status}`, timestamp: now, toStatus: status }],
    };
    await this.getCollection().insertOne(app);
    return app;
  }

  static async update(id: string, updates: ApplicationInput): Promise<JobApplication | null> {
    validateApplication(updates, true);
    const existing = await this.getById(id);
    if (!existing) return null;
    const allowed = ['company', 'role', 'jobType', 'workModel', 'location', 'salaryRange', 'jobUrl', 'status', 'appliedDate', 'deadline', 'deadlineType', 'deadlineNotes', 'deadlineCompleted', 'rating', 'resumeVersion', 'referralName', 'tags', 'contacts', 'interviews', 'notes', 'source'];
    const patch: Record<string, unknown> = {};
    for (const key of allowed) if (key in updates) patch[key] = updates[key];
    const now = new Date().toISOString();
    let timeline = existing.timeline || [];
    if (patch.status && patch.status !== existing.status) timeline = [...timeline, this.statusEvent(existing.status, patch.status as ApplicationStatus, now)];
    patch.timeline = timeline; patch.updatedAt = now;
    const result = await this.getCollection().findOneAndUpdate({ id }, { $set: patch }, { returnDocument: 'after' });
    return result ? apiDocument(result) : null;
  }

  private static statusEvent(fromStatus: ApplicationStatus, toStatus: ApplicationStatus, timestamp: string, description?: string): TimelineEvent {
    return { id: newId('tl'), type: toStatus === 'Offer' ? 'offer_received' : 'status_change', title: `Status changed to ${toStatus}`, description, timestamp, fromStatus, toStatus };
  }

  static async updateStatus(id: string, status: ApplicationStatus, comment?: string): Promise<JobApplication | null> {
    enumValue(status, APPLICATION_STATUSES, 'status');
    const existing = await this.getById(id);
    if (!existing) return null;
    const now = new Date().toISOString();
    const event = this.statusEvent(existing.status, status, now, comment?.trim() || undefined);
    const result = await this.getCollection().findOneAndUpdate({ id }, { $set: { status, updatedAt: now }, $push: { timeline: event } }, { returnDocument: 'after' });
    return result ? apiDocument(result) : null;
  }

  static async addInterview(id: string, interview: Record<string, unknown>): Promise<JobApplication | null> {
    validateNested({ interviews: [interview] as unknown as InterviewRound[] });
    const roundName = asString(interview.roundName, 'roundName', true)!;
    const now = new Date().toISOString();
    const round = { ...interview, id: newId('int'), roundName, completed: Boolean(interview.completed), questionsAsked: stringArray(interview.questionsAsked, 'questionsAsked') } as unknown as InterviewRound;
    const event: TimelineEvent = { id: newId('tl'), type: 'interview_logged', title: `Interview Round Scheduled: ${roundName}`, description: interview.scheduledDate ? `Scheduled for ${new Date(String(interview.scheduledDate)).toLocaleDateString()}` : undefined, timestamp: now };
    const result = await this.getCollection().findOneAndUpdate({ id }, { $push: { interviews: round, timeline: event }, $set: { updatedAt: now } }, { returnDocument: 'after' });
    return result ? apiDocument(result) : null;
  }

  static async addNote(id: string, content: string): Promise<JobApplication | null> {
    if (typeof content !== 'string' || !content.trim()) throw new ValidationError('Note content cannot be empty');
    if (content.trim().length > 10000) throw new ValidationError('Note content is too long');
    const now = new Date().toISOString();
    const note: ApplicationNote = { id: newId('note'), date: now.slice(0, 10), content: content.trim() };
    const event: TimelineEvent = { id: newId('tl'), type: 'note_added', title: 'Note added', description: content.trim().slice(0, 200), timestamp: now };
    const result = await this.getCollection().findOneAndUpdate({ id }, { $push: { notes: { $each: [note], $position: 0 }, timeline: event }, $set: { updatedAt: now } }, { returnDocument: 'after' });
    return result ? apiDocument(result) : null;
  }

  static async toggleDeadline(id: string): Promise<JobApplication | null> {
    const existing = await this.getById(id);
    if (!existing) return null;
    const result = await this.getCollection().findOneAndUpdate({ id }, { $set: { deadlineCompleted: !existing.deadlineCompleted, updatedAt: new Date().toISOString() } }, { returnDocument: 'after' });
    return result ? apiDocument(result) : null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await this.getCollection().deleteOne({ id });
    return result.deletedCount === 1;
  }

  static async getReminders(): Promise<ReminderItem[]> {
    const list = await this.getAll();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const reminders: ReminderItem[] = [];
    const add = (app: JobApplication, deadline: string, type: ReminderItem['deadlineType'], notes: string | undefined, completed: boolean, role = app.role) => {
      const date = new Date(deadline); date.setHours(0, 0, 0, 0);
      const daysRemaining = Math.round((date.getTime() - today.getTime()) / 86400000);
      const urgency: ReminderItem['urgency'] = daysRemaining < 0 ? 'overdue' : daysRemaining === 0 ? 'today' : daysRemaining <= 7 ? 'upcoming' : 'later';
      reminders.push({ applicationId: app.id, company: app.company, role, deadline: deadline.slice(0, 10), deadlineType: type, notes, completed, daysRemaining, urgency, status: app.status });
    };
    for (const app of list) {
      if (app.deadline && app.status !== 'Rejected' && app.status !== 'Withdrawn') add(app, app.deadline, app.deadlineType || 'Application Deadline', app.deadlineNotes, Boolean(app.deadlineCompleted));
      for (const interview of app.interviews || []) if (interview.scheduledDate && !interview.completed) add(app, interview.scheduledDate, 'Interview Round', interview.prepNotes || `Interviewer: ${interview.interviewerName || 'TBD'}`, false, `${app.role} (${interview.roundName})`);
    }
    return reminders.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }

  static async getAnalytics(): Promise<AnalyticsData> {
    const list = await this.getAll();
    const nonWishlist = list.filter((a) => a.status !== 'Wishlist');
    const totalApplications = nonWishlist.length;
    const offerCount = list.filter((a) => a.status === 'Offer').length;
    const rejectedCount = list.filter((a) => a.status === 'Rejected').length;
    const withdrawnCount = list.filter((a) => a.status === 'Withdrawn').length;
    const wishlistCount = list.filter((a) => a.status === 'Wishlist').length;
    const interviewStages: ApplicationStatus[] = ['Online Assessment', 'Technical Interview', 'Behavioral Interview', 'Final Round', 'Offer'];
    const interviewCount = nonWishlist.filter((a) => interviewStages.includes(a.status) || (a.timeline || []).some((t) => t.toStatus && interviewStages.includes(t.toStatus)) || (a.interviews || []).length > 0).length;
    const activeApplications = list.filter((a) => !['Rejected', 'Withdrawn', 'Offer'].includes(a.status)).length;
    const pct = (n: number, d: number) => d ? Number(((n / d) * 100).toFixed(1)) : 0;
    const stageDistribution = Object.fromEntries(APPLICATION_STATUSES.map((status) => [status, list.filter((a) => a.status === status).length])) as AnalyticsData['stageDistribution'];
    const typeDistribution = Object.fromEntries(JOB_TYPES.map((type) => [type, list.filter((a) => a.jobType === type).length])) as AnalyticsData['typeDistribution'];
    const workModelDistribution = Object.fromEntries(WORK_MODELS.map((model) => [model, list.filter((a) => a.workModel === model).length])) as AnalyticsData['workModelDistribution'];
    let responseTotal = 0; let responseCount = 0;
    for (const app of list) {
      const firstResponse = (app.timeline || []).find((event) => event.fromStatus === 'Applied');
      if (firstResponse) { responseTotal += Math.max(0, Math.round((Date.parse(firstResponse.timestamp) - Date.parse(`${app.appliedDate}T00:00:00Z`)) / 86400000)); responseCount++; }
    }
    const weeklyVelocity = Array.from({ length: 6 }, (_, index) => {
      const end = new Date(); end.setHours(23, 59, 59, 999); end.setDate(end.getDate() - ((5 - index) * 7));
      const start = new Date(end); start.setDate(start.getDate() - 6); start.setHours(0, 0, 0, 0);
      const count = list.filter((app) => { const date = new Date(`${app.appliedDate}T00:00:00Z`); return date >= start && date <= end; }).length;
      return { weekLabel: index === 5 ? 'Current Week' : `Week ${index + 1}`, count };
    });
    const reached = (statuses: ApplicationStatus[]) => nonWishlist.filter((a) => statuses.includes(a.status) || (a.timeline || []).some((t) => t.toStatus && statuses.includes(t.toStatus))).length;
    const funnelCounts = [totalApplications, reached(['Online Assessment', 'Technical Interview', 'Behavioral Interview', 'Final Round', 'Offer']), reached(['Technical Interview', 'Behavioral Interview', 'Final Round', 'Offer']), reached(['Final Round', 'Offer']), offerCount];
    const funnelLabels = ['Applications Sent', 'Online Assessments', 'Interviews (Tech/Behavioral)', 'Final Rounds', 'Offers Extended'];
    return {
      totalApplications, activeApplications, interviewCount, offerCount, rejectedCount, withdrawnCount, wishlistCount,
      applicationToInterviewRatio: pct(interviewCount, totalApplications), interviewToOfferRatio: pct(offerCount, interviewCount), overallOfferRate: pct(offerCount, totalApplications), rejectionRate: pct(rejectedCount, totalApplications),
      averageResponseDays: responseCount ? Math.round(responseTotal / responseCount) : null, stageDistribution, typeDistribution, workModelDistribution, weeklyVelocity,
      funnel: funnelLabels.map((stage, index) => ({ stage, count: funnelCounts[index], percentage: totalApplications ? Math.round((funnelCounts[index] / totalApplications) * 100) : 0 })),
    };
  }

  static async replaceAll(items: unknown[]): Promise<JobApplication[]> {
    if (items.length > 1000) throw new ValidationError('Import cannot contain more than 1000 applications');
    const validated = items.map((item, index) => {
      try { validateApplication(item as ApplicationInput); } catch (error) { throw new ValidationError(`Invalid application at index ${index}: ${(error as Error).message}`); }
      const app = item as JobApplication;
      if (!app.id || typeof app.id !== 'string') throw new ValidationError(`Invalid application at index ${index}: id is required`);
      return { ...app, updatedAt: app.updatedAt || new Date().toISOString(), createdAt: app.createdAt || new Date().toISOString(), timeline: app.timeline || [], contacts: app.contacts || [], interviews: app.interviews || [], notes: app.notes || [], tags: app.tags || [] };
    });
    const ids = new Set(validated.map((item) => item.id));
    if (ids.size !== validated.length) throw new ValidationError('Import contains duplicate application IDs');
    const collection = this.getCollection();
    if (validated.length) await collection.bulkWrite(validated.map((item) => ({ replaceOne: { filter: { id: item.id }, replacement: item, upsert: true } })));
    await collection.deleteMany(validated.length ? { id: { $nin: [...ids] } } : {});
    return validated;
  }

  static async resetToSeed(): Promise<JobApplication[]> {
    const raw = await fs.readFile(seedPath, 'utf8');
    const items = JSON.parse(raw) as unknown[];
    return this.replaceAll(items);
  }

  static async seedIfEmpty(): Promise<number> {
    if (await this.getCollection().countDocuments() > 0) return 0;
    const raw = await fs.readFile(seedPath, 'utf8');
    const seeded = await this.replaceAll(JSON.parse(raw) as unknown[]);
    return seeded.length;
  }
}
