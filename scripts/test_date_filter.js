// quick test of parseMovementDate and filtering logic
function parseMovementDate(input) {
  if (!input) return null;
  const s = String(input).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const d = new Date(s.replace(' ', 'T'));
    return isNaN(d.getTime()) ? null : d;
  }
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}:\d{2})(?:\s*(a\.m\.|p\.m\.|am|pm))?)?/i);
  if (m) {
    const dd = m[1].padStart(2, '0');
    const mm = m[2].padStart(2, '0');
    const yyyy = m[3];
    const time = m[4] || '00:00';
    let [hhStr, minStr] = time.split(':');
    let hh = parseInt(hhStr || '0', 10);
    const min = parseInt(minStr || '0', 10);
    let ampm = (m[5] || '').toLowerCase().replace(/\./g, '');
    if (ampm) {
      if (ampm.includes('p') && hh !== 12) hh += 12;
      if (ampm.includes('a') && hh === 12) hh = 0;
    }
    const iso = `${yyyy}-${mm}-${dd}T${String(hh).padStart(2,'0')}:${String(min).padStart(2,'0')}:00`;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

const movements = [
  { id:1, created_at: '23/11/2025 03:02 p.m.' },
  { id:2, created_at: '23/11/2025 02:33 p.m.' },
  { id:3, created_at: '02/11/2025 10:00:00' },
  { id:4, created_at: '2025-11-02 09:00:00' },
  { id:5, created_at: '2025-10-27 10:00:00' },
  { id:6, created_at: '26/10/2025 09:00' }
];

const dateFilter = { from: '2025-11-02', to: '2025-11-18' };
const fromDate = dateFilter.from ? new Date(dateFilter.from + 'T00:00:00') : null;
const toDate = dateFilter.to ? new Date(dateFilter.to + 'T23:59:59') : null;

const filtered = movements.filter(m => {
  const movementDate = parseMovementDate(m.created_at);
  console.log('raw:', m.created_at, 'parsed:', movementDate ? movementDate.toISOString() : null);
  if (!movementDate) return false;
  if (fromDate && movementDate.getTime() < fromDate.getTime()) return false;
  if (toDate && movementDate.getTime() > toDate.getTime()) return false;
  return true;
});

console.log('\nfilter from', dateFilter.from, 'to', dateFilter.to, '=>', filtered.map(f=>f.id));
