export function combineDateTimeToISO(date?: string, time?: string) {
  if (!date) return undefined;
  const hhmm = (time && /^\d{2}:\d{2}$/.test(time)) ? time : "08:00";
  const iso = new Date(`${date}T${hhmm}:00`).toISOString();
  return iso;
}
