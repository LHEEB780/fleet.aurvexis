/**
 * Calendar Reminder Integration Service
 * Generates Google Calendar, Outlook Web, and Apple/Outlook iCal (.ics) events
 * with automated 24h alarm reminders for fleet periodic maintenance.
 */

export interface CalendarEventDetails {
  id?: string;
  title: string;
  serviceTitle?: string;
  vehicleName: string;
  plateNumber?: string;
  dueDate: string; // Format: YYYY-MM-DD
  dueTime?: string; // Format: HH:MM (default: 09:00)
  durationMinutes?: number; // Default: 120 (2 hours)
  location?: string;
  category?: string;
  notes?: string;
}

/**
 * Format a date and time into iCal / Google date string
 * Returns YYYYMMDDTHHmmSS
 */
function formatDateTimeStrings(dueDate: string, dueTime: string = '09:00', durationMinutes: number = 120) {
  const [year, month, day] = dueDate.split('-').map(Number);
  const [hours, minutes] = dueTime.split(':').map(Number);

  const startDate = new Date(year, (month || 1) - 1, day || 1, hours || 9, minutes || 0);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  const startFormatted = `${startDate.getFullYear()}${pad(startDate.getMonth() + 1)}${pad(startDate.getDate())}T${pad(startDate.getHours())}${pad(startDate.getMinutes())}00`;
  const endFormatted = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;

  const startIso = startDate.toISOString();
  const endIso = endDate.toISOString();

  return { startFormatted, endFormatted, startIso, endIso, startDate, endDate };
}

/**
 * Build rich event title & description for periodic maintenance
 */
export function buildEventDetails(event: CalendarEventDetails): {
  eventTitle: string;
  eventDescription: string;
  eventLocation: string;
} {
  const vehName = event.vehicleName || 'مركبة الأسطول';
  const plate = event.plateNumber ? ` (${event.plateNumber})` : '';
  const task = event.serviceTitle || event.title || 'صيانة دورية مجدولة';

  const eventTitle = `🔧 صيانة دورية: ${vehName}${plate} - ${task}`;

  const eventLocation = event.location || 'مركز الصيانة والورشة الفنية - Fleet Aurvexis Workshop';

  const categoryLabel = event.category ? `• تصنيف الخدمة: ${event.category}\n` : '';
  const notesText = event.notes ? `• ملاحظات الورشة: ${event.notes}\n` : '';

  const eventDescription = [
    `📅 تذكير رسمي بموعد الصيانة الدورية لأسطول المركبات`,
    `--------------------------------------------------`,
    `• المركبة: ${vehName}${plate}`,
    `• نوع العملية: ${task}`,
    categoryLabel,
    `• تاريخ الاستحقاق: ${event.dueDate}`,
    `• الموقع: ${eventLocation}`,
    notesText,
    `--------------------------------------------------`,
    `تم التوليد تلقائياً من منصة إدارة وصيانة الأسطول الذكية (Fleet Aurvexis System).`
  ].filter(Boolean).join('\n');

  return { eventTitle, eventDescription, eventLocation };
}

/**
 * Generate Google Calendar direct web link
 */
export function generateGoogleCalendarUrl(event: CalendarEventDetails): string {
  const { startFormatted, endFormatted } = formatDateTimeStrings(
    event.dueDate,
    event.dueTime || '09:00',
    event.durationMinutes || 120
  );
  const { eventTitle, eventDescription, eventLocation } = buildEventDetails(event);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: eventTitle,
    dates: `${startFormatted}/${endFormatted}`,
    details: eventDescription,
    location: eventLocation,
    trp: 'true'
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Microsoft Outlook Web direct link
 */
export function generateOutlookCalendarUrl(event: CalendarEventDetails): string {
  const { startIso, endIso } = formatDateTimeStrings(
    event.dueDate,
    event.dueTime || '09:00',
    event.durationMinutes || 120
  );
  const { eventTitle, eventDescription, eventLocation } = buildEventDetails(event);

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: eventTitle,
    body: eventDescription,
    startdt: startIso,
    enddt: endIso,
    location: eventLocation
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate standard RFC 5545 iCalendar (.ics) content
 * Supports Apple Calendar, Outlook Desktop, Android Calendar, and Google Calendar
 */
export function generateIcsContent(event: CalendarEventDetails): string {
  const { startFormatted, endFormatted } = formatDateTimeStrings(
    event.dueDate,
    event.dueTime || '09:00',
    event.durationMinutes || 120
  );
  const { eventTitle, eventDescription, eventLocation } = buildEventDetails(event);

  const now = new Date();
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const nowStamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const uid = `fleet-pm-${event.id || Date.now()}-${Math.random().toString(36).substring(2, 9)}@fleetaurvexis.com`;

  // Escape special chars in ICS values
  const escapeIcs = (str: string) =>
    str
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Fleet Aurvexis//Fleet Periodic Maintenance Calendar//AR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:صيانة أسطول المركبات',
    'X-WR-TIMEZONE:Asia/Riyadh',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowStamp}`,
    `DTSTART:${startFormatted}`,
    `DTEND:${endFormatted}`,
    `SUMMARY:${escapeIcs(eventTitle)}`,
    `DESCRIPTION:${escapeIcs(eventDescription)}`,
    `LOCATION:${escapeIcs(eventLocation)}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    // 24 Hour Alarm Reminder
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:تذكير: اقتراب موعد صيانة ${escapeIcs(event.vehicleName)}`,
    'END:VALARM',
    // 2 Hour Alarm Reminder
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    `DESCRIPTION:موعد صيانة ${escapeIcs(event.vehicleName)} خلال ساعتين!`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

/**
 * Trigger download of .ics calendar file for Apple Calendar, Outlook, and local devices
 */
export function downloadIcsCalendarFile(event: CalendarEventDetails): void {
  try {
    const icsContent = generateIcsContent(event);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const safeVehName = (event.vehicleName || 'vehicle').replace(/[^a-zA-Z0-9\u0621-\u064A_-]/g, '_');
    const fileName = `maintenance-${safeVehName}-${event.dueDate || 'date'}.ics`;

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download calendar file:', error);
  }
}

/**
 * Open Google Calendar in a new tab
 */
export function openGoogleCalendar(event: CalendarEventDetails): void {
  const url = generateGoogleCalendarUrl(event);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Open Outlook Web Calendar in a new tab
 */
export function openOutlookCalendar(event: CalendarEventDetails): void {
  const url = generateOutlookCalendarUrl(event);
  window.open(url, '_blank', 'noopener,noreferrer');
}
