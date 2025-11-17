export function getNumberColorClass(value: number | string) {
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^\d.-]/g, ''));
  if (isNaN(num)) return 'text-gray-300';
  if (num < 0) return 'text-red-400';
  if (num > 0) return 'text-green-400';
  return 'text-gray-300';
}
