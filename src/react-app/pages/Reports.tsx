import { useEffect, useState, useMemo } from "react";
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
  const [allExpenses, setAllExpenses] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    userId: 'all',
    category: 'all',
    currency: 'all',
    status: 'all',
    search: ''
  });
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
      fetchCategories();
    }
  }, [userProfile]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/users/me");
      const data = await response.json();
      setUserProfile(data);
    } catch (error) {
      console.error("Error cargando perfil:", error);
    }
  };

  const fetchReports = async () => {
    try {
      // Fetch raw expenses and compute summaries client-side so filters can be applied
      const [respExpenses, respSummary] = await Promise.all([
        fetch('/api/expenses'),
        fetch('/api/expenses/reports/summary')
      ]);
      const expenses = await respExpenses.json();
      const data = await respSummary.json();
      setAllExpenses(expenses || []);
      setReportData(data);
    } catch (error) {
      console.error("Error cargando reportes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsersList = async () => {
    try {
      const res = await fetch('/api/users');
      const users = await res.json();
      setUsersList(users || []);
    } catch (e) {
      console.error('Error fetching users list', e);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const cats = await res.json();
      setCategoriesList((cats || []).map((c: any) => c.name || c));
    } catch (e) {
      console.error('Error fetching categories', e);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      // Export filtered expenses rather than all
      const response = await fetch("/api/expenses");
      const expenses = await response.json();
      const expToExport = applyFiltersToExpenses(expenses);

      // Prepare data for Excel
      const excelData = expToExport.map((expense: any) => ({
        'Fecha': new Date(expense.expense_date).toLocaleDateString('es-ES'),
        'Usuario': expense.user_name || expense.user_email || expense.user_id,
        'Descripción': expense.description,
        'Categoría': expense.category,
        'Monto (ARS)': expense.amount,
        'Estado': expense.status === 'pendiente' ? 'En revisión' : 
                 expense.status === 'aprobado' ? 'Aprobado' : 'Rechazado',
        'Usa Saldo': expense.use_balance ? 'Sí' : 'No',
        'Tiene Recibo': expense.receipt_photo_url ? 'Sí' : 'No',
        'Fecha de Creación': new Date(expense.created_at).toLocaleDateString('es-ES'),
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Add expenses sheet
      const wsExpenses = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, wsExpenses, 'Gastos');

      // Add summary by category
      const summary = filteredReportData || reportData;
      if (summary?.byCategory) {
        const categoryData = summary.byCategory.map(item => ({
          'Categoría': item.category,
          'Total (ARS)': item.total,
          'Cantidad': item.count,
        }));
        const wsCategory = XLSX.utils.json_to_sheet(categoryData);
        XLSX.utils.book_append_sheet(wb, wsCategory, 'Por Categoría');
      }

      // Add summary by month
      if (summary?.byMonth) {
        const monthData = summary.byMonth.map(item => ({
          'Mes': item.month,
          'Total (ARS)': item.total,
          'Cantidad': item.count,
        }));
        const wsMonth = XLSX.utils.json_to_sheet(monthData);
        XLSX.utils.book_append_sheet(wb, wsMonth, 'Por Mes');
      }

      // Generate filename with current date
      const now = new Date();
      const filename = `ExpenseFlow_Reporte_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error("Error exportando a Excel:", error);
      console.warn("Error al exportar el reporte");
    } finally {
      setIsExporting(false);
    }
  };

  // Apply the current filters to the raw expense list
  const applyFiltersToExpenses = (expenses: any[]) => {
    const { from, to, userId, category, currency, status, search } = filters;
    return expenses.filter((e: any) => {
      // date filter
      if (from) {
        const fromDate = new Date(from);
        if (new Date(e.expense_date) < fromDate) return false;
      }
      if (to) {
        const toDate = new Date(to);
        // include whole day
        toDate.setHours(23,59,59,999);
        if (new Date(e.expense_date) > toDate) return false;
      }
      if (userId && userId !== 'all') {
        if (String(e.user_id) !== String(userId)) return false;
      }
      if (category && category !== 'all') {
        if ((e.category || '').toLowerCase() !== category.toLowerCase()) return false;
      }
      if (currency && currency !== 'all') {
        if ((e.currency || '').toUpperCase() !== currency.toUpperCase()) return false;
      }
      if (status && status !== 'all') {
        if (e.status !== status) return false;
      }
      if (search && search.trim() !== '') {
        const q = search.toLowerCase();
        if (!(`${e.description || ''}`.toLowerCase().includes(q) || `${e.user_name || e.user_email || ''}`.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  };

  const computeSummaryFromExpenses = (expenses: any[]) => {
    const byCategoryMap: Record<string, { category: string; total: number; count: number }> = {};
    const byMonthMap: Record<string, { month: string; total: number; count: number }> = {};
    let total_amount = 0;
    let total_count = 0;

    expenses.forEach((e: any) => {
      const amt = Number(e.amount) || 0;
      total_amount += amt;
      total_count += 1;

      const cat = e.category || 'Sin categoría';
      if (!byCategoryMap[cat]) byCategoryMap[cat] = { category: cat, total: 0, count: 0 };
      byCategoryMap[cat].total += amt;
      byCategoryMap[cat].count += 1;

      const d = new Date(e.expense_date);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      if (!byMonthMap[monthKey]) byMonthMap[monthKey] = { month: monthKey, total: 0, count: 0 };
      byMonthMap[monthKey].total += amt;
      byMonthMap[monthKey].count += 1;
    });

    const byCategory = Object.values(byCategoryMap).sort((a,b) => b.total - a.total);
    const byMonth = Object.values(byMonthMap).sort((a,b) => a.month.localeCompare(b.month));
    return { byCategory, byMonth, totals: { total_amount, total_count } } as ReportData;
  };

  // Memoized computed summary based on allExpenses and filters
  const filteredReportData = useMemo(() => {
    if (!allExpenses || allExpenses.length === 0) return reportData;
    const filteredExpenses = applyFiltersToExpenses(allExpenses);
    return computeSummaryFromExpenses(filteredExpenses);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allExpenses, filters]);

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
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reportes</h1>
            <p className="text-gray-600 dark:text-gray-300">Análisis detallado de los gastos</p>
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
        {/* Filter Panel */}
        <div className="mb-6 bg-gray-900/60 border border-white/10 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-xs text-gray-300 mb-1">Fecha Desde</label>
            <input type="date" value={filters.from} onChange={(e) => setFilters(prev => ({...prev, from: e.target.value}))} className="px-3 py-2 rounded bg-gray-800 text-white" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-300 mb-1">Fecha Hasta</label>
            <input type="date" value={filters.to} onChange={(e) => setFilters(prev => ({...prev, to: e.target.value}))} className="px-3 py-2 rounded bg-gray-800 text-white" />
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className="text-xs text-gray-300 mb-1">Usuario</label>
            <select value={filters.userId} onChange={(e) => setFilters(prev => ({...prev, userId: e.target.value}))} className="px-3 py-2 rounded bg-gray-800 text-white">
              <option value="all">Todos</option>
              {usersList.map(u => <option key={u.user_id || u.id} value={u.user_id || u.id}>{u.name || u.email || (u.user_id || u.id)}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-300 mb-1">Categoría</label>
            <select value={filters.category} onChange={(e) => setFilters(prev => ({...prev, category: e.target.value}))} className="px-3 py-2 rounded bg-gray-800 text-white">
              <option value="all">Todas</option>
              {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-300 mb-1">Moneda</label>
            <select value={filters.currency} onChange={(e) => setFilters(prev => ({...prev, currency: e.target.value}))} className="px-3 py-2 rounded bg-gray-800 text-white">
              <option value="all">Todas</option>
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="BRL">BRL</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-300 mb-1">Estado</label>
            <select value={filters.status} onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))} className="px-3 py-2 rounded bg-gray-800 text-white">
              <option value="all">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 md:col-span-3">
            <input type="text" placeholder="Buscar por descripción o usuario..." value={filters.search} onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))} className="flex-1 px-3 py-2 rounded bg-gray-800 text-white" />
            <button onClick={() => setFilters({from:'', to:'', userId:'all', category:'all', currency:'all', status:'all', search:''})} className="px-4 py-2 rounded bg-gray-700 text-white">Reset</button>
          </div>
        </div>

          {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin">
              <Loader2 className="w-10 h-10 text-indigo-600" />
            </div>
          </div>
        ) : filteredReportData ? (
          <div className="space-y-6">
            <ReportsSummary totals={filteredReportData.totals} />
            
            <div className="grid md:grid-cols-3 gap-6">
              <CategoryChart data={filteredReportData.byCategory} />
              <MonthlyChart data={filteredReportData.byMonth} />
              {/* AI-powered trend chart */}
              <TrendAIChart data={filteredReportData.byMonth} />
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
