import type { JobApplication, ReminderItem } from '../types';

export function downloadIcsCalendar(reminders: ReminderItem[], applications: JobApplication[]) {
  const events: string[] = [];

  for (const rem of reminders) {
    if (!rem.deadline) continue;
    const dateStr = rem.deadline.replace(/-/g, '');
    const uid = `${rem.applicationId}-${rem.deadlineType.replace(/\s+/g, '')}-${dateStr}@trackpath.app`;
    const summary = `${rem.company}: ${rem.deadlineType} - ${rem.role}`;
    const description = `Deadline Type: ${rem.deadlineType}\\nCompany: ${rem.company}\\nRole: ${rem.role}\\nNotes: ${rem.notes || 'None'}`;

    events.push([
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART;VALUE=DATE:${dateStr}`,
      `DTEND;VALUE=DATE:${dateStr}`,
      `SUMMARY:${summary.replace(/,/g, '\\,')}`,
      `DESCRIPTION:${description.replace(/,/g, '\\,')}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    ].join('\r\n'));
  }

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TrackPath//Job Application Tracker//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:TrackPath Job & Internship Deadlines',
    'X-WR-TIMEZONE:UTC',
    ...events,
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'job-application-deadlines.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
