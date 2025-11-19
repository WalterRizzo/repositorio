export function getNumberColorClass(value: number | string) {
  // Handle numbers and strings robustly: remove currency symbols, commas, and detect parentheses format
  let raw = typeof value === 'number' ? String(value) : String(value || '');
  raw = raw.trim();
  let isNegative = false;

  // Parentheses indicate negative numbers, e.g. (1,234.56)
  if (/^\(.+\)$/.test(raw)) {
    isNegative = true;
    raw = raw.replace(/[()]/g, '');
  }

  // Detect explicit minus sign
  if (/^-/.test(raw)) {
    isNegative = true;
  }

  // Remove any non-digit, non-dot, non-minus characters (currency symbols, spaces, commas)
  const sanitized = raw.replace(/[^0-9.-]/g, '');
  const num = Number(sanitized);

  if (isNaN(num)) return 'text-gray-300';

  // Respect explicit parentheses or minus sign first; otherwise use numeric sign
  if (isNegative || num < 0) return 'text-red-400';
  if (num > 0) return 'text-green-400';
  return 'text-gray-300';
}
