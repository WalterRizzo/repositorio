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
  // Removed balance min/max filters — kept only simple type filter for 'carga' export
  const [typeFilter, setTypeFilter] = useState<string>('carga');

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
      // Also fetch transactions movements summary and re-run when typeFilter changes
      fetchMovementSummary(typeFilter);
    }
  }, [userProfile]);

  useEffect(() => {
    if (userProfile) {
      fetchMovementSummary(typeFilter);
    }
  }, [typeFilter, userProfile]);

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

  const fetchMovementSummary = async (type?: string) => {
    try {
      const params = new URLSearchParams();
      if (type) params.set('type', type);
      
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

  const exportMovementsToExcel = async (filters: any = {}) => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.set('type', String(filters.type));
      // Fetch up to 5000 transactions for export (pagination fallback)
      const limit = 5000;
      let offset = 0;
      const allTransactions: any[] = [];
      while (true) {
        params.set('limit', String(limit));
        params.set('offset', String(offset));
        if (filters.type) params.set('type', filters.type);
        const res = await fetch(`/api/transacciones-saldo?${params.toString()}`);
        if (!res.ok) {
          const err = await res.json();
          console.error('Error fetching movements for export', err);
          break;
        }
        const data = await res.json();
        const txs = data.transacciones || data.movements || [];
        allTransactions.push(...txs);
        offset += limit;
        if (txs.length < limit || allTransactions.length >= 20000) break; // safety cap
      }

      // Create workbook
      const wb = XLSX.utils.book_new();
      const excelData = (allTransactions || []).map((tx: any) => ({
        'Fecha': new Date(tx.fecha_transaccion).toLocaleString('es-ES'),
        'Usuario': tx.user_name || tx.user_email || tx.user_id,
        'Tipo': tx.tipo,
        'Monto': tx.monto,
        'Moneda': tx.currency,
        'Saldo anterior': tx.saldo_anterior,
        'Saldo nuevo': tx.saldo_nuevo,
        'Descripción': tx.descripcion,
        'Realizado por': tx.realizado_por,
      }));
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, 'Movimientos');

      // Also fetch a summary and attach
      const summaryRes = await fetch(`/api/transacciones-saldo/reports/summary?${params.toString()}`);
      if (summaryRes.ok) {
        const summary = await summaryRes.json();
        if (summary.byType) {
          const wsType = XLSX.utils.json_to_sheet(summary.byType.map((t:any) => ({ Tipo: t.type, Total: t.total, Cantidad: t.count })));
          XLSX.utils.book_append_sheet(wb, wsType, 'Por Tipo');
        }
        if (summary.byCurrency) {
          const wsCurrency = XLSX.utils.json_to_sheet(summary.byCurrency.map((c:any) => ({ Moneda: c.currency, Total: c.total, Cantidad: c.count })));
          XLSX.utils.book_append_sheet(wb, wsCurrency, 'Por Moneda');
        }
        if (summary.byMonth) {
          const wsMonth = XLSX.utils.json_to_sheet(summary.byMonth.map((m:any) => ({ Mes: m.month, Total: m.total, Cantidad: m.count })));
          XLSX.utils.book_append_sheet(wb, wsMonth, 'Por Mes');
        }
      }

      const now = new Date();
      const filename = `ExpenseFlow_Movimientos_${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')}.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error('Error exportando movimientos:', error);
      alert('Error al exportar movimientos');
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
          {/* Export Cargas only - replace generic Movements export with a 'Exportar Cargas' action */}
          <button
            onClick={async () => await exportMovementsToExcel({ type: typeFilter })}
            disabled={isExporting}
            className="ml-3 flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span className="font-medium">{isExporting ? 'Exportando cargas...' : 'Exportar Cargas'}</span>
          </button>
        </div>
        <div className="mb-4 flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <label className="text-xs text-gray-600 dark:text-gray-300">Tipo</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-2 py-1 rounded bg-white/5 text-sm">
              <option value="all">Todos</option>
              <option value="carga">Carga</option>
              <option value="descuento">Gasto</option>
              <option value="ajuste">Ajuste</option>
            </select>
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
