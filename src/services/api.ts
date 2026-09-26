import type { JobApplication, AnalyticsData, ReminderItem, ApplicationStatus } from '../types';

export const api = {
  async getApplications(params?: {
    search?: string;
    status?: string;
    jobType?: string;
    workModel?: string;
    sort?: string;
  }): Promise<JobApplication[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.jobType) query.append('jobType', params.jobType);
    if (params?.workModel) query.append('workModel', params.workModel);
    if (params?.sort) query.append('sort', params.sort);

    const res = await fetch(`/api/applications?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch applications');
    return res.json();
  },

  async getApplicationById(id: string): Promise<JobApplication> {
    const res = await fetch(`/api/applications/${id}`);
    if (!res.ok) throw new Error('Failed to fetch application');
    return res.json();
  },

  async createApplication(data: Partial<JobApplication>): Promise<JobApplication> {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create application');
    }
    return res.json();
  },

  async updateApplication(id: string, updates: Partial<JobApplication>): Promise<JobApplication> {
    const res = await fetch(`/api/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update application');
    return res.json();
  },

  async updateStatus(id: string, status: ApplicationStatus, comment?: string): Promise<JobApplication> {
    const res = await fetch(`/api/applications/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, comment }),
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  },

  async addInterview(id: string, interview: any): Promise<JobApplication> {
    const res = await fetch(`/api/applications/${id}/interviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(interview),
    });
    if (!res.ok) throw new Error('Failed to add interview round');
    return res.json();
  },

  async addNote(id: string, content: string): Promise<JobApplication> {
    const res = await fetch(`/api/applications/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error('Failed to add note');
    return res.json();
  },

  async toggleDeadline(id: string): Promise<JobApplication> {
    const res = await fetch(`/api/applications/${id}/deadline-toggle`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to toggle deadline');
    return res.json();
  },

  async deleteApplication(id: string): Promise<void> {
    const res = await fetch(`/api/applications/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete application');
  },

  async getAnalytics(): Promise<AnalyticsData> {
    const res = await fetch('/api/analytics');
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  async getReminders(): Promise<ReminderItem[]> {
    const res = await fetch('/api/reminders');
    if (!res.ok) throw new Error('Failed to fetch reminders');
    return res.json();
  },

  async resetSampleData(): Promise<JobApplication[]> {
    const res = await fetch('/api/reset-sample', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset sample data');
    const data = await res.json();
    return data.applications;
  },

  async importData(applications: JobApplication[]): Promise<void> {
    const res = await fetch('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applications }),
    });
    if (!res.ok) throw new Error('Failed to import applications');
  },
};
