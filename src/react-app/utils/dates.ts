// Parse a DB timestamp string reliably and return a Date instance.
// SQLite CURRENT_TIMESTAMP often returns 'YYYY-MM-DD HH:MM:SS' (UTC) which
// the browser may misinterpret when parsed directly. This helper normalizes
// common formats into an ISO-like string the Date constructor will interpret
// as UTC, so displayed local time is correct.
export function parseDbTimestampToDate(value: string | number | null | undefined): Date | null {
  if (value === null || value === undefined) return null;

  // Already a Date-ish number
  if (typeof value === 'number') return new Date(value);

  if (typeof value !== 'string') {
    try { return new Date(value as any); } catch { return null; }
  }

  const s = value.trim();
  if (!s) return null;

  // If string contains a timezone indicator or 'T' ISO marker, trust the constructor
  if (/[Tt].*Z$/.test(s) || /[Tt].*[+-]\d{2}:?\d{2}$/.test(s) || s.includes('T')) {
    return new Date(s);
  }

  // If the format is like 'YYYY-MM-DD HH:MM:SS' (common from SQLite CURRENT_TIMESTAMP),
  // convert to 'YYYY-MM-DDTHH:MM:SSZ' and treat as UTC.
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(s)) {
    const asIsoUtc = s.replace(' ', 'T') + 'Z';
    return new Date(asIsoUtc);
  }

  // Last resort: try Date constructor and return whatever it provides (may be local)
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export default { parseDbTimestampToDate };
