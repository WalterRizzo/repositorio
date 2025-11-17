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
      const response = await fetch("/api/expenses/reports/summary");
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error("Error cargando reportes:", error);
    } finally {
      setIsLoading(false);
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
      console.warn("Error al exportar el reporte");
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
