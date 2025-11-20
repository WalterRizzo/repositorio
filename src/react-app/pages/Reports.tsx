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
  const [movementSummary, setMovementSummary] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  // Filters: by user and date range
  const [userFilter, setUserFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [usersList, setUsersList] = useState<any[]>([]);

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
      // Also fetch transactions movements summary and available users
      fetchMovementSummary({ userId: userFilter, from: dateFrom, to: dateTo });
      fetchUsersList();
    }
  }, [userProfile]);

  useEffect(() => {
    if (userProfile) {
      fetchMovementSummary({ userId: userFilter, from: dateFrom, to: dateTo });
    }
  }, [userFilter, dateFrom, dateTo, userProfile]);

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
      const response = await fetch("/api/expenses/reports/summary");
      const data = await response.json();
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
      if (!res.ok) throw new Error('Error fetching users');
      const data = await res.json();
      setUsersList(data || []);
    } catch (err) {
      console.error('Error fetching users for filters:', err);
      setUsersList([]);
    }
  }

  const fetchMovementSummary = async (filters: { userId?: string; from?: string; to?: string } = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.userId && filters.userId !== 'all') params.set('user_id', filters.userId);
      if (filters.from) params.set('from', filters.from);
      if (filters.to) params.set('to', filters.to);
      
      const response = await fetch(`/api/transacciones-saldo/reports/summary?${params.toString()}`);
      if (!response.ok) throw new Error('Error fetching movement summary');
      const data = await response.json();
      setMovementSummary(data);
    } catch (error) {
      console.error('Error fetching movement summary:', error);
      setMovementSummary(null);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      // Fetch all expenses for export
      const response = await fetch("/api/expenses");
      const expenses = await response.json();

      // Prepare data for Excel
      const excelData = expenses.map((expense: any) => ({
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

      // Generate filename with current date
      const now = new Date();
      const filename = `ExpenseFlow_Reporte_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error("Error exportando a Excel:", error);
      alert("Error al exportar el reporte");
    } finally {
      setIsExporting(false);
    }
  };

  // Removed 'Export Movements' helper; reports export focuses on summary & expenses

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
        <div className="mb-8 flex items-center justify-between">
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
        <div className="mb-4 flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <label className="text-xs text-gray-600 dark:text-gray-300">Usuario</label>
            <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="px-2 py-1 rounded bg-white/5 text-sm">
              <option value="all">Todos</option>
              {usersList.map(u => (
                <option key={u.user_id || u.id} value={u.user_id || u.id}>{u.name || u.email}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-xs text-gray-600 dark:text-gray-300">Fecha desde:</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-2 py-1 rounded bg-white/5 text-sm" />
            <label className="text-xs text-gray-600 dark:text-gray-300">hasta:</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-2 py-1 rounded bg-white/5 text-sm" />
          </div>
          {movementSummary && (
            <div className="ml-4 text-sm text-gray-700 dark:text-gray-300 bg-white/5 px-3 py-2 rounded-lg">
              <div className="font-semibold">Movimientos:</div>
              <div className="text-xs">Total: {movementSummary.totals?.total_count || 0}</div>
              <div className="text-xs">Monto total: {movementSummary.totals?.total_amount || 0}</div>
            </div>
          )}
          
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
