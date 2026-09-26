export type ApplicationStatus =
  | 'Wishlist'
  | 'Applied'
  | 'Online Assessment'
  | 'Technical Interview'
  | 'Behavioral Interview'
  | 'Final Round'
  | 'Offer'
  | 'Rejected'
  | 'Withdrawn';

export type JobType = 'Internship' | 'Full-time' | 'Co-op' | 'Contract' | 'Part-time';

export type WorkModel = 'Remote' | 'Hybrid' | 'Onsite';

export type DeadlineType =
  | 'Application Deadline'
  | 'Online Assessment'
  | 'Interview Round'
  | 'Offer Expiry'
  | 'Follow-up';

export interface TimelineEvent {
  id: string;
  type: 'status_change' | 'interview_logged' | 'deadline_set' | 'note_added' | 'offer_received';
  title: string;
  description?: string;
  timestamp: string; // ISO
  fromStatus?: ApplicationStatus;
  toStatus?: ApplicationStatus;
}

export interface InterviewRound {
  id: string;
  roundName: string;
  scheduledDate?: string; // ISO
  completed: boolean;
  interviewerName?: string;
  interviewerRole?: string;
  format?: 'Video Call' | 'Phone Call' | 'Take-home' | 'In-person';
  questionsAsked?: string[];
  prepNotes?: string;
  outcome?: 'Passed' | 'Pending' | 'Rejected';
}

export interface ApplicationNote {
  id: string;
  date: string;
  content: string;
}

export interface ApplicationContact {
  id: string;
  name: string;
  role: string;
  email?: string;
  linkedin?: string;
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  jobType: JobType;
  workModel: WorkModel;
  location: string;
  salaryRange?: string;
  jobUrl?: string;
  status: ApplicationStatus;
  appliedDate: string; // YYYY-MM-DD
  deadline?: string | null; // YYYY-MM-DD
  deadlineType?: DeadlineType;
  deadlineNotes?: string;
  deadlineCompleted?: boolean;
  rating: number; // 1 to 5
  resumeVersion?: string;
  referralName?: string;
  tags: string[];
  contacts: ApplicationContact[];
  interviews: InterviewRound[];
  timeline: TimelineEvent[];
  notes: ApplicationNote[];
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsData {
  totalApplications: number;
  activeApplications: number;
  interviewCount: number; // applications that reached OA or any interview stage or offer
  offerCount: number;
  rejectedCount: number;
  withdrawnCount: number;
  wishlistCount: number;
  
  // Conversion Ratios
  applicationToInterviewRatio: number; // e.g. 28.5%
  interviewToOfferRatio: number; // e.g. 33.3%
  overallOfferRate: number; // e.g. 6.2%
  rejectionRate: number; // e.g. 35.0%
  
  averageResponseDays: number | null;
  
  stageDistribution: Record<ApplicationStatus, number>;
  typeDistribution: Record<JobType, number>;
  workModelDistribution: Record<WorkModel, number>;
  weeklyVelocity: Array<{ weekLabel: string; count: number }>;
  
  funnel: Array<{ stage: string; count: number; percentage: number }>;
}

export interface ReminderItem {
  applicationId: string;
  company: string;
  role: string;
  deadline: string;
  deadlineType: DeadlineType;
  notes?: string;
  completed: boolean;
  daysRemaining: number;
  urgency: 'overdue' | 'today' | 'upcoming' | 'later';
  status: ApplicationStatus;
}
