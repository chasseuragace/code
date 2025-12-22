/**
 * Timezone utilities for Nepal (UTC+5:45)
 * Handles consistent timezone conversions across the application
 */

// Nepal timezone offset is UTC+5:45 (5 hours 45 minutes)
const NEPAL_OFFSET_MS = (5 * 60 + 45) * 60 * 1000;

/**
 * Get current time in Nepal timezone
 * @param dbNow Optional database NOW() result. If not provided, uses system time.
 * @returns Current time in Nepal timezone
 */
export function getNepalNow(dbNow?: Date): Date {
  const now = dbNow || new Date();
  return new Date(now.getTime() + NEPAL_OFFSET_MS);
}

/**
 * Create a date boundary (start of day) in Nepal timezone
 * @param nepalNow Current time in Nepal timezone
 * @returns Date object representing start of today in Nepal timezone
 */
export function getNepalToday(nepalNow: Date): Date {
  return new Date(nepalNow.getFullYear(), nepalNow.getMonth(), nepalNow.getDate());
}

/**
 * Create tomorrow's date boundary in Nepal timezone
 * @param today Today's date boundary
 * @returns Date object representing start of tomorrow in Nepal timezone
 */
export function getNepalTomorrow(today: Date): Date {
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

/**
 * Create day after tomorrow's date boundary in Nepal timezone
 * @param tomorrow Tomorrow's date boundary
 * @returns Date object representing start of day after tomorrow in Nepal timezone
 */
export function getNepalDayAfterTomorrow(tomorrow: Date): Date {
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
  return dayAfterTomorrow;
}

/**
 * Parse interview date and time into a single DateTime in Nepal timezone
 * @param interviewDateAd Interview date (YYYY-MM-DD format or Date object)
 * @param interviewTime Interview time (HH:MM:SS or HH:MM format)
 * @returns DateTime object in Nepal timezone
 */
export function parseInterviewDateTime(
  interviewDateAd: Date | string,
  interviewTime?: string | null
): Date {
  const interviewDate = new Date(interviewDateAd);
  const interviewDateTime = new Date(interviewDate);

  if (interviewTime) {
    const timeParts = interviewTime.toString().split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    interviewDateTime.setHours(hours, minutes, 0, 0);
  }

  return interviewDateTime;
}

/**
 * Calculate interview end time including grace period
 * @param interviewDateTime Interview start date/time
 * @param durationMinutes Interview duration in minutes (default: 60)
 * @param gracePeriodMinutes Grace period in minutes (default: 30)
 * @returns End time including grace period
 */
export function getInterviewEndTime(
  interviewDateTime: Date,
  durationMinutes: number = 60,
  gracePeriodMinutes: number = 30
): Date {
  const endTime = new Date(interviewDateTime);
  endTime.setMinutes(endTime.getMinutes() + durationMinutes + gracePeriodMinutes);
  return endTime;
}

/**
 * Check if interview is unattended (no-show)
 * @param interviewDateTime Interview start date/time
 * @param nepalNow Current time in Nepal timezone
 * @param durationMinutes Interview duration in minutes (default: 60)
 * @param gracePeriodMinutes Grace period in minutes (default: 30)
 * @returns True if interview has passed grace period
 */
export function isInterviewUnattended(
  interviewDateTime: Date,
  nepalNow: Date,
  durationMinutes: number = 60,
  gracePeriodMinutes: number = 30
): boolean {
  const endTime = getInterviewEndTime(interviewDateTime, durationMinutes, gracePeriodMinutes);
  return nepalNow > endTime;
}

/**
 * Check if interview is scheduled for today
 * @param interviewDate Interview date
 * @param today Today's date boundary
 * @param tomorrow Tomorrow's date boundary
 * @returns True if interview is scheduled for today
 */
export function isInterviewToday(
  interviewDate: Date,
  today: Date,
  tomorrow: Date
): boolean {
  return interviewDate >= today && interviewDate < tomorrow;
}

/**
 * Check if interview is scheduled for tomorrow
 * @param interviewDate Interview date
 * @param tomorrow Tomorrow's date boundary
 * @param dayAfterTomorrow Day after tomorrow's date boundary
 * @returns True if interview is scheduled for tomorrow
 */
export function isInterviewTomorrow(
  interviewDate: Date,
  tomorrow: Date,
  dayAfterTomorrow: Date
): boolean {
  return interviewDate >= tomorrow && interviewDate < dayAfterTomorrow;
}
