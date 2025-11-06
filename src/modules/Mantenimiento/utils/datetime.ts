export function combineDateTimeToISO(date?: string, time?: string, useCurrentTimeIfEmpty: boolean = true) {
  if (!date) return undefined;

  // If no time provided, decide based on useCurrentTimeIfEmpty flag
  let hhmm: string;
  if (time && /^\d{2}:\d{2}$/.test(time)) {
    hhmm = time;
  } else if (useCurrentTimeIfEmpty) {
    // Use current time (for new assignments)
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    hhmm = `${hours}:${minutes}`;
  } else {
    // Don't modify if time is not provided (for updates/reassignments)
    return undefined;
  }

  // Parse the date and time components
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = hhmm.split(':').map(Number);

  // Create Date object using local timezone (browser/user timezone)
  // This ensures the time selected by the user is preserved
  const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0);

  // Return ISO string (will be in UTC, but database should handle this correctly)
  return localDate.toISOString();
}
