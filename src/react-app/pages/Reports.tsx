import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/react-app/hooks/useAuth";
import { Loader2, Download } from "lucide-react";
import * as XLSX from 'xlsx';
import Header from "@/react-app/components/Header";
import Sidebar from "@/react-app/components/Sidebar";
import ReportsSummary from "@/react-app/components/ReportsSummary";
import CategoryChart from "@/react-app/components/CategoryChart";
import MonthlyChart from "@/react-app/components/MonthlyChart";
import TrendAIChart from "../components/TrendAIChart";
import { parseDbTimestampToDate } from '@/react-app/utils/dates';

interface ReportData {
  byCategory: Array<{ category: string; total: number; count: number }>;
  byMonth: Array<{ month: string; total: number; count: number }>;
  totals: { total_amount: number; total_count: number };
}

export default function Reports() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<Array<{ code: string; name?: string; symbol?: string }>>([]);
  const [filterUserId, setFilterUserId] = useState<string | null>(null);
  const [filterCurrency, setFilterCurrency] = useState<string | null>(null);
  const [filterFrom, setFilterFrom] = useState<string | null>(null);
  const [filterTo, setFilterTo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    if (userProfile) {
      // Fetch reports for everyone (no auth restriction)
      fetchReports();
      fetchUsersList();
      fetchCurrencies();
    }
  }, [userProfile]);

  useEffect(() => {
    // Re-fetch reports when filters change
    if (userProfile) fetchReports();
  }, [filterUserId, filterCurrency, filterFrom, filterTo]);

  const fetchUserProfile = async () => {
    try {
      // request user profile (send credentials) and load into state
      const res = await fetch('/api/users/me', { credentials: 'include' });
      if (!res.ok) throw new Error(`Failed to load user profile: ${res.status}`);
      const data = await res.json();
      setUserProfile(data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // If fetching profile fails, redirect to login so user can re-authenticate
      try { navigate('/login'); } catch (e) { /* no-op */ }
    }
  };

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const qs = new URLSearchParams();
      if (filterUserId) qs.set('userId', filterUserId);
      if (filterCurrency) qs.set('currency', filterCurrency);
      if (filterFrom) qs.set('from', filterFrom);
      if (filterTo) qs.set('to', filterTo);
      const url = `/api/expenses/reports/summary${qs.toString() ? ('?' + qs.toString()) : ''}`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Reports endpoint returned ${res.status}: ${txt?.slice(0,200)}`);
      }
      const json = await res.json();
      setReportData(json || null);
    } catch (e) {
      console.error('Error fetching reports:', e);
      alert('Error cargando reportes: ' + (e instanceof Error ? e.message : String(e)));
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsersList = async () => {
    try {
      const res = await fetch('/api/users');
      const list = await res.json();
      setUsers(list || []);
    } catch (e) { console.error('Error loading users', e); }
  };

  const fetchCurrencies = async () => {
    try {
      // Prefer the public /api/currencies endpoint which returns { code, name, symbol }
      const res = await fetch('/api/currencies');
      if (!res.ok) {
        // fallback to the older endpoint if present
        const res2 = await fetch('/api/expenses/currencies');
        const fallback = await res2.json();
        // fallback might be an array of strings -> normalize
        const normFallback = (Array.isArray(fallback) ? fallback : []).map((c: any) => (typeof c === 'string' ? { code: String(c).toUpperCase() } : { code: String(c?.code || c?.currency || '').toUpperCase(), name: c?.name, symbol: c?.symbol }));
        setCurrencies(normFallback || []);
        return;
      }
      const list = await res.json();
      // normalize objects: support array of strings or array of objects
      const normalized = (Array.isArray(list) ? list : []).map((c: any) => (
        typeof c === 'string' ? { code: String(c).toUpperCase() } : { code: String(c.code || c.currency || '').toUpperCase(), name: c.name, symbol: c.symbol }
      ));
      setCurrencies(normalized || []);
    } catch (e) { console.error('Error loading currencies', e); }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      // Build query using filters
      const qs = new URLSearchParams();
      if (filterUserId) qs.set('userId', filterUserId);
      if (filterCurrency) qs.set('currency', filterCurrency);
      if (filterFrom) qs.set('from', filterFrom);
      if (filterTo) qs.set('to', filterTo);
      // Include all results (use max page size for export)
      // Use dedicated export endpoint (no pagination) for reliable filtering
      // Add debug=true so backend returns the applied WHERE and params for troubleshooting
      const url = `/api/expenses/export${qs.toString() ? ('?' + qs.toString() + '&debug=true') : '?debug=true'}`;
      console.info('Exporting using URL (with debug):', url, { filterUserId, filterCurrency, filterFrom, filterTo });
      console.info('Exporting using URL:', url, { filterUserId, filterCurrency, filterFrom, filterTo });
      // Add a short cache buster to avoid any CDN caching confusion
      // Ensure cookies are sent and handle non-ok responses to show helpful errors
      let response = await fetch(url + (url.includes('?') ? '&_=' : '?_=' ) + Date.now(), { credentials: 'include' });
      if (!response.ok) {
        // Try to parse JSON error body when possible
        let bodyText = '';
        try { const err = await response.json(); bodyText = err?.error || JSON.stringify(err); } catch (e) { bodyText = await response.text(); }
        throw new Error(`Export endpoint returned ${response.status}: ${bodyText}`);
      }
      // Try parse JSON, but if the response is HTML (login page or error page) detect and give clearer message
      let json: any;
      // Read body once as text, then parse JSON. This avoids reading the stream multiple times
      const responseBodyText = await response.text();

      // If the server returned an HTML document (login page or generic error), give a clearer message.
      if (responseBodyText && responseBodyText.trim().startsWith('<')) {
        const hint = response.status === 401 ? 'No autenticado (inicia sesión).' : response.status === 403 ? 'No autorizado.' : 'Probablemente no autenticado o error del servidor.';
        throw new Error(`Server returned HTML (${hint}). Response starts with: ${responseBodyText.trim().slice(0,140)}`);
      }
      try {
        json = responseBodyText ? JSON.parse(responseBodyText) : {};
      } catch (parseErr) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('text/html') || responseBodyText.trim().startsWith('<')) {
          throw new Error(`Server returned HTML (probably not authenticated or a server error). Response starts with: ${responseBodyText.trim().slice(0,140)}`);
        }
        // If not HTML, rethrow parse error with some context
        throw new Error(`Invalid JSON from export endpoint: ${parseErr instanceof Error ? parseErr.message : String(parseErr)} — response body: ${responseBodyText.slice(0,140)}`);
      }
      if (json?.debug) console.info('Export debug info from server:', json.debug);
      let expenses = json?.data || json || [];

      // Ensure client-side filtering in case backend didn't apply filters as expected
      if (filterUserId) expenses = expenses.filter((e: any) => (e.user_id === filterUserId));
      if (filterCurrency) expenses = expenses.filter((e: any) => ((e.currency || '') as string).toUpperCase() === (filterCurrency || '').toUpperCase());
      if (filterFrom) expenses = expenses.filter((e: any) => new Date(e.expense_date) >= new Date(filterFrom));
      if (filterTo) expenses = expenses.filter((e: any) => new Date(e.expense_date) <= new Date(filterTo));
      console.info('Export: fetched', expenses.length, 'rows');
      console.info('Export: filterUserId raw value:', filterUserId, 'users list sample:', users.slice(0,5));
      // Give the user quick feedback in the UI about how many rows will be exported
      if (!isExporting) { /* no-op, exportInProgress */ }

      // Group expenses by currency
      const grouped: Record<string, any[]> = {};
      for (const exp of expenses) {
        const key = (exp.currency || 'ARS').toUpperCase();
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(exp);
      }

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Create one sheet per currency
      const currencyFormatMap: Record<string, string> = {
        ARS: '[$ARS] #,##0.00',
        USD: '[$USD] #,##0.00',
        EUR: '[$EUR] #,##0.00',
        BRL: '[$BRL] #,##0.00',
        UYU: '[$UYU] #,##0.00'
      };

      const summary: Array<{ Moneda: string; Total: number; Count: number }> = [];

      for (const currency of Object.keys(grouped)) {
        const rows = grouped[currency].map((expense: any) => ({
          'Fecha': new Date(expense.expense_date).toLocaleDateString('es-ES'),
          'Usuario': expense.user_name || expense.user_email || expense.user_id,
          'Descripción': expense.description,
          'Categoría': expense.category,
          'Monto': expense.amount,
          'Estado': expense.status === 'pendiente' ? 'En revisión' : expense.status === 'aprobado' ? 'Aprobado' : 'Rechazado',
          'Usa Saldo': expense.use_balance ? 'Sí' : 'No',
          'Tiene Recibo': expense.receipt_photo_url ? 'Sí' : 'No',
          'Forma de Pago': expense.sigla || '-',
          'Fecha de Creación': (() => {
            const d = parseDbTimestampToDate(expense.created_at);
            return d ? d.toLocaleDateString('es-ES') : expense.created_at;
          })(),
        }));

        const ws = XLSX.utils.json_to_sheet(rows);

        // apply column widths
        ws['!cols'] = [{wch:20},{wch:25},{wch:40},{wch:20},{wch:15},{wch:12},{wch:8},{wch:10},{wch:14},{wch:18}];

        // set currency format for Monto column (find 'Monto' col)
        try {
          const header = Object.keys(rows[0] || {});
          const montoIdx = header.indexOf('Monto');
          if (montoIdx >= 0) {
            // convert index to column letter
            const toCol = (c:number) => {
              let s = '';
              while (c >= 0) {
                s = String.fromCharCode((c % 26) + 65) + s;
                c = Math.floor(c / 26) - 1;
              }
              return s;
            };
            const colLetter = toCol(montoIdx);

            for (let r = 0; r < rows.length; r++) {
              const addr = `${colLetter}${r+2}`;
              const cell = ws[addr];
              if (cell && typeof cell.v === 'number') {
                cell.z = currencyFormatMap[currency] || currencyFormatMap['ARS'];
              }
            }
          }
        } catch (err) {
          console.warn('Formato moneda no aplicado para', currency, err);
        }

        XLSX.utils.book_append_sheet(wb, ws, currency);

        // add summary totals
        const total = grouped[currency].reduce((s, e) => s + Number(e.amount || 0), 0);
        summary.push({ Moneda: currency, Total: total, Count: grouped[currency].length });
      }

      // Summary sheet with totals per currency
      const wsSummary = XLSX.utils.json_to_sheet(summary);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen por Moneda');

      // Add summary by category
      if (reportData?.byCategory) {
        const categoryData = reportData.byCategory.map(item => ({
          'Categoría': item.category,
          'Total (ARS)': item.total,
          'Cantidad': item.count,
        }));
        const wsCategory = XLSX.utils.json_to_sheet(categoryData);
        XLSX.utils.book_append_sheet(wb, wsCategory, 'Por Categoría');
      }

      // Add summary by month
      if (reportData?.byMonth) {
        const monthData = reportData.byMonth.map(item => ({
          'Mes': item.month,
          'Total (ARS)': item.total,
          'Cantidad': item.count,
        }));
        const wsMonth = XLSX.utils.json_to_sheet(monthData);
        XLSX.utils.book_append_sheet(wb, wsMonth, 'Por Mes');
      }

      // Ask for filename
      const suggested = `ExpenseFlow_Reporte_${new Date().toISOString().slice(0,10)}`;
      let filename = window.prompt('Nombre de archivo para exportar (sin extensión):', suggested) || suggested;
      if (!filename.toLowerCase().endsWith('.xlsx')) filename = `${filename}.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error("Error exportando a Excel:", error);
      const message = error instanceof Error ? error.message : String(error);
      alert(`Error al exportar el reporte: ${message}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (authLoading || !user || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin">
          <Loader2 className="w-10 h-10 text-indigo-600" />
        </div>
      </div>
    );
  }

  // Reportes disponibles para todos

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      {/* Sidebar - Desktop */}
      <Sidebar />
      <div className="flex-1 w-full">
        <Header userProfile={userProfile} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reportes</h1>
            <p className="text-gray-600 dark:text-gray-300">Análisis detallado de los gastos</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={filterUserId || ''}
              onChange={(e) => setFilterUserId(e.target.value || null)}
              className="px-3 py-2 rounded bg-black text-white text-sm border border-white/10"
            >
              <option value="">Todos los usuarios</option>
              {users.map(u => (
                <option key={u.user_id || u.id} value={u.user_id || u.id}>{u.name || u.email}</option>
              ))}
            </select>

            <select
              value={filterCurrency || ''}
              onChange={(e) => setFilterCurrency(e.target.value || null)}
              className="px-3 py-2 rounded bg-black text-white text-sm border border-white/10"
            >
              <option value="">Todas las monedas</option>
              {currencies.map(c => (
                <option key={c.code} value={c.code}>{(c.symbol ? `${c.symbol} ` : '') + c.code + (c.name ? ` — ${c.name}` : '')}</option>
              ))}
            </select>

            <input type="date" value={filterFrom || ''} onChange={(e) => setFilterFrom(e.target.value || null)} className="px-3 py-2 rounded bg-white/5 text-white text-sm border border-white/10" />
            <input type="date" value={filterTo || ''} onChange={(e) => setFilterTo(e.target.value || null)} className="px-3 py-2 rounded bg-white/5 text-white text-sm border border-white/10" />

            <button onClick={() => { setFilterUserId(null); setFilterCurrency(null); setFilterFrom(null); setFilterTo(null); }} className="px-3 py-2 bg-white/5 rounded text-white text-sm">Limpiar</button>
          </div>
          <button
            onClick={exportToExcel}
            disabled={isExporting || !reportData}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span className="font-medium">
              {isExporting ? "Exportando..." : "Exportar a Excel"}
            </span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin">
              <Loader2 className="w-10 h-10 text-indigo-600" />
            </div>
          </div>
        ) : reportData ? (
          <div className="space-y-6">
            <ReportsSummary totals={reportData.totals} />
            
            <div className="grid md:grid-cols-3 gap-6">
              <CategoryChart data={reportData.byCategory} />
              <MonthlyChart data={reportData.byMonth} />
              {/* AI-powered trend chart */}
              <TrendAIChart data={reportData.byMonth} />
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-600 dark:text-gray-400">No hay datos disponibles</p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
