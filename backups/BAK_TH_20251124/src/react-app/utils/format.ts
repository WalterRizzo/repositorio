export function normalizeNumber(value: number | string | undefined | null): number {
  if (value === undefined || value === null) return 0;
  const parsed = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9eE+\-\.]/g, ''));
  if (Number.isNaN(parsed)) return 0;
  return parsed;
}

/**
 * Format a balance for display.
 * - Clamps tiny floating-point noise values close to zero (epsilon) to 0
 * - Returns localized string with two decimal places by default
 */
export function formatBalance(val: number | string | undefined | null, _currency?: string, locale = 'es-AR', fractionDigits = 2): string {
  const n = normalizeNumber(val);
  // treat very small values as zero (floating point artifacts)
  if (Math.abs(n) < 1e-6) return (0).toLocaleString(locale, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits });
  return n.toLocaleString(locale, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits });
}

/**
 * Detects spurious pending reembolso rows created on deletion flows.
 * We'll filter these from the UI when requested by the operator.
 */
export function isSpuriousPendingReembolso(description?: string | null): boolean {
  if (!description) return false;
  const txt = String(description).toLowerCase();
  return txt.includes('reembolso (pendiente) por elimin');
}

export default { normalizeNumber, formatBalance };
