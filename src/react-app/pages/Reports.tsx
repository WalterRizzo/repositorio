import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/react-app/hooks/useAuth";
import { Loader2, Download, Filter, X } from "lucide-react";
// ExcelJS will be dynamically imported in export functions to reduce initial bundle size
// @ts-ignore - file-saver has no types in this project
import { saveAs } from 'file-saver';
// Note: XLSX still available in project but this file now uses ExcelJS for exports
import Header from "@/react-app/components/Header";
import Sidebar from "@/react-app/components/Sidebar";
import ReportsSummary from "@/react-app/components/ReportsSummary";
import CategoryChart from "@/react-app/components/CategoryChart";
import MonthlyChart from "@/react-app/components/MonthlyChart";
import TrendAIChart from "../components/TrendAIChart";
import ExportModal from "@/react-app/components/ExportModal";
import Toast from "@/react-app/components/Toast";

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
  const [stagedFilters, setStagedFilters] = useState({
    from: '',
    to: '',
    userId: 'all',
    category: 'all',
    currency: 'all',
    status: 'all',
    minAmount: '',
    maxAmount: '',
    hasReceipt: 'all',
    search: ''
  });
  const [appliedFilters, setAppliedFilters] = useState<typeof stagedFilters | null>(null);
  const [filteredReportDataBackend, setFilteredReportDataBackend] = useState<ReportData | null>(null);
  const [filteredExpenses, setFilteredExpenses] = useState<any[]>([]);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [exportOnlyVisible, setExportOnlyVisible] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFileName, setExportFileName] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [reportType, setReportType] = useState<'expenses' | 'transacciones'>('expenses');
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [filteredTransactionsSummary, setFilteredTransactionsSummary] = useState<any|null>(null);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionsPerPage, setTransactionsPerPage] = useState(50);
  const [totalTransactions, setTotalTransactions] = useState(0);
  // const [chartLayout] = useState<'portrait'>('portrait');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const activeFilterCount = useMemo(() => {
    if (!appliedFilters) return 0;
    return Object.keys(appliedFilters).filter(k => {
      const v = (appliedFilters as any)[k];
      return v !== '' && v !== 'all' && v !== null && v !== undefined;
    }).length;
  }, [appliedFilters]);
  // Debug removed as requested

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

  // When switching report type to 'transacciones', fetch transactions and summaries
  useEffect(() => {
    if (reportType === 'transacciones') {
      setIsLoading(true);
      (async () => {
        await fetchFilteredTransactionsFromBackend(appliedFilters || {});
        await fetchFilteredTransactionsSummaryFromBackend(appliedFilters || {});
        setIsLoading(false);
      })();
    }
  }, [reportType]);

  // Re-fetch transactions and summaries when appliedFilters changes while viewing transactions
  useEffect(() => {
    if (reportType === 'transacciones') {
      (async () => {
        await fetchFilteredTransactionsFromBackend(appliedFilters || {}, transactionsPage, transactionsPerPage);
        await fetchFilteredTransactionsSummaryFromBackend(appliedFilters || {});
      })();
    }
  }, [appliedFilters, reportType]);

  // When page changes, reload transactions
  useEffect(() => {
    if (reportType === 'transacciones') {
      (async () => {
        await fetchFilteredTransactionsFromBackend(appliedFilters || {}, transactionsPage, transactionsPerPage);
      })();
    }
  }, [transactionsPage, transactionsPerPage, reportType, appliedFilters]);

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
      // Fetch raw expenses and initial (server) summary
      const [respExpenses, respSummary] = await Promise.all([
        fetch('/api/expenses?limit=100&offset=0'),
        fetch('/api/expenses/reports/summary')
      ]);
      const expensesRes = await respExpenses.json();
      const expenses = (expensesRes && (expensesRes.data || expensesRes)) || [];
      const data = await respSummary.json();
      setAllExpenses(expenses || []);
      setReportData(data);
      // default applied filters empty
      setAppliedFilters(null);
      setFilteredReportDataBackend(data);
    } catch (error) {
      console.error("Error cargando reportes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilteredSummaryFromBackend = async (filtersToApply: any) => {
    try {
      const params = new URLSearchParams();
      if (filtersToApply.from) params.set('from', filtersToApply.from);
      if (filtersToApply.to) params.set('to', filtersToApply.to);
      if (filtersToApply.userId && filtersToApply.userId !== 'all') params.set('userId', String(filtersToApply.userId));
      if (filtersToApply.category && filtersToApply.category !== 'all') params.set('category', filtersToApply.category);
      if (filtersToApply.currency && filtersToApply.currency !== 'all') params.set('currency', filtersToApply.currency);
      if (filtersToApply.status && filtersToApply.status !== 'all') params.set('status', filtersToApply.status);
      if (filtersToApply.minAmount) params.set('minAmount', String(filtersToApply.minAmount));
      if (filtersToApply.maxAmount) params.set('maxAmount', String(filtersToApply.maxAmount));
      if (filtersToApply.hasReceipt && filtersToApply.hasReceipt !== 'all') params.set('hasReceipt', filtersToApply.hasReceipt);
      if (filtersToApply.search) params.set('search', filtersToApply.search);

      const response = await fetch(`/api/expenses/reports/summary?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) {
        console.error('Error fetching filtered summary', data);
        return null;
      }
      setFilteredReportDataBackend(data);
      // filtered summary backend set
      return data;
    } catch (e) {
      console.error('Error fetching filtered summary:', e);
      return null;
    }
  };

  const fetchFilteredExpensesFromBackend = async (filtersToApply: any) => {
    try {
      const params = new URLSearchParams();
      if (filtersToApply.from) params.set('from', filtersToApply.from);
      if (filtersToApply.to) params.set('to', filtersToApply.to);
      if (filtersToApply.userId && filtersToApply.userId !== 'all') params.set('userId', String(filtersToApply.userId));
      if (filtersToApply.category && filtersToApply.category !== 'all') params.set('category', filtersToApply.category);
      if (filtersToApply.currency && filtersToApply.currency !== 'all') params.set('currency', filtersToApply.currency);
      if (filtersToApply.status && filtersToApply.status !== 'all') params.set('status', filtersToApply.status);
      if (filtersToApply.minAmount) params.set('minAmount', String(filtersToApply.minAmount));
      if (filtersToApply.maxAmount) params.set('maxAmount', String(filtersToApply.maxAmount));
      if (filtersToApply.hasReceipt && filtersToApply.hasReceipt !== 'all') params.set('hasReceipt', filtersToApply.hasReceipt);
      if (filtersToApply.search) params.set('search', filtersToApply.search);

      const response = await fetch(`/api/expenses?${params.toString()}`);
      const dataRes = await response.json();
      const data = (dataRes && (dataRes.data || dataRes)) || [];
      if (!response.ok) {
        console.error('Error fetching filtered expenses', data);
        return [];
      }
      setFilteredExpenses(data || []);
      return data || [];
    } catch (e) {
      console.error('Error fetching filtered expenses:', e);
      return [];
    }
  };

  const fetchFilteredTransactionsFromBackend = async (filtersToApply: any, page?: number, perPage?: number) => {
    try {
      const params = new URLSearchParams();
      if (filtersToApply.from) params.set('from', filtersToApply.from);
      if (filtersToApply.to) params.set('to', filtersToApply.to);
      if (filtersToApply.userId && filtersToApply.userId !== 'all') params.set('userId', String(filtersToApply.userId));
      if (filtersToApply.currency && filtersToApply.currency !== 'all') params.set('currency', filtersToApply.currency);
      if (filtersToApply.type && filtersToApply.type !== 'all') params.set('type', filtersToApply.type);
      if (filtersToApply.minAmount) params.set('minAmount', String(filtersToApply.minAmount));
      if (filtersToApply.maxAmount) params.set('maxAmount', String(filtersToApply.maxAmount));
      if (filtersToApply.search) params.set('search', filtersToApply.search);
      if (perPage) params.set('limit', String(perPage));
      const p = page || 1;
      const offset = (p - 1) * (perPage || 0);
      if (perPage) params.set('offset', String(offset));

      const response = await fetch(`/api/transacciones-saldo?${params.toString()}`);
      const data = await response.json();
      console.debug('fetchFilteredTransactionsFromBackend:', {params: params.toString(), data});
      if (!response.ok) {
        console.error('Error fetching filtered transactions', data);
        return [];
      }
      setFilteredTransactions(data.transacciones || data.movements || data.results || []);
      setTotalTransactions(data.total || (data.transacciones || []).length || 0);
      return data.transacciones || [];
    } catch (e) {
      console.error('Error fetching filtered transactions:', e);
      return [];
    }
  };

  const fetchFilteredTransactionsSummaryFromBackend = async (filtersToApply: any) => {
    try {
      const params = new URLSearchParams();
      if (filtersToApply.from) params.set('from', filtersToApply.from);
      if (filtersToApply.to) params.set('to', filtersToApply.to);
      if (filtersToApply.userId && filtersToApply.userId !== 'all') params.set('userId', String(filtersToApply.userId));
      if (filtersToApply.type && filtersToApply.type !== 'all') params.set('type', filtersToApply.type);
      if (filtersToApply.currency && filtersToApply.currency !== 'all') params.set('currency', filtersToApply.currency);
      if (filtersToApply.minAmount) params.set('minAmount', String(filtersToApply.minAmount));
      if (filtersToApply.maxAmount) params.set('maxAmount', String(filtersToApply.maxAmount));
      if (filtersToApply.search) params.set('search', filtersToApply.search);

      const response = await fetch(`/api/transacciones-saldo/reports/summary?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) {
        console.error('Error fetching filtered transactions summary', data);
        return null;
      }
      setFilteredTransactionsSummary(data);
      return data;
    } catch (e) {
      console.error('Error fetching filtered transactions summary:', e);
      return null;
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

  const exportToExcel = async (fileName?: string) => {
    setIsExporting(true);
    try {
      if (reportType === 'expenses') {
        // Export filtered expenses rather than all
        const expenses = exportOnlyVisible ? (filteredExpenses.length ? filteredExpenses : await fetchFilteredExpensesFromBackend(appliedFilters || {})) : await (async () => { 
          const all: any[] = [];
          const limit = 500;
          let offset = 0;
          let total = -1;
          do {
            const res = await fetch(`/api/expenses?limit=${limit}&offset=${offset}`);
            const json = await res.json();
            const data = json && (json.data || json);
            if (!Array.isArray(data)) break;
            all.push(...data);
            total = json.total ?? (data.length + offset);
            offset += limit;
          } while (total === -1 || offset < total);
          return all;
        })();
        const expToExport = applyFiltersToExpenses(expenses, appliedFilters || {});
        // Prepare data for Excel
        const excelData = expToExport.map((expense: any) => ({
          'Fecha': new Date(expense.expense_date),
          'Usuario': expense.user_name || expense.user_email || expense.user_id,
          'Descripción': expense.description,
          'Categoría': expense.category,
          'Monto (ARS)': expense.amount,
          'Estado': expense.status === 'pendiente' ? 'En revisión' : 
                   expense.status === 'aprobado' ? 'Aprobado' : 'Rechazado',
          'Usa Saldo': expense.use_balance ? 'Sí' : 'No',
          'Tiene Recibo': expense.receipt_photo_url ? 'Sí' : 'No',
          // 'Fecha de Creación' removed to avoid multiple date columns — only 'Fecha' is exported
        }));

        // Build filters for export
        const filterRows: any[] = [];
        filterRows.push([`Exportado por`, (userProfile?.name || user?.email || user?.id || 'N/A')]);
        filterRows.push([`Fecha exportación`, new Date().toLocaleString()]);
        filterRows.push([`Reporte`, 'Gastos']);
        filterRows.push([]);
        filterRows.push(['Filtro', 'Valor']);
        if (appliedFilters) {
          if (appliedFilters.from) filterRows.push(['Fecha Desde', appliedFilters.from]);
          if (appliedFilters.to) filterRows.push(['Fecha Hasta', appliedFilters.to]);
          if (appliedFilters.userId && appliedFilters.userId !== 'all') {
            const u = usersList.find(u => String(u.user_id || u.id) === String(appliedFilters.userId));
            filterRows.push(['Usuario', u ? (u.name || u.email) : appliedFilters.userId]);
          }
          if (appliedFilters.category && appliedFilters.category !== 'all') filterRows.push(['Categoría', appliedFilters.category]);
          if (appliedFilters.currency && appliedFilters.currency !== 'all') filterRows.push(['Moneda', appliedFilters.currency]);
          if (appliedFilters.status && appliedFilters.status !== 'all') filterRows.push(['Estado', appliedFilters.status]);
          if (appliedFilters.minAmount) filterRows.push(['Monto Min', appliedFilters.minAmount]);
          if (appliedFilters.maxAmount) filterRows.push(['Monto Max', appliedFilters.maxAmount]);
          if (appliedFilters.hasReceipt && appliedFilters.hasReceipt !== 'all') filterRows.push(['Tiene Recibo', appliedFilters.hasReceipt]);
          if (appliedFilters.search) filterRows.push(['Busqueda', appliedFilters.search]);
        }
        // filters handled via ExcelJS

        // Add summary by category
        const summary = filteredReportData || reportData;
        if (summary?.byCategory) {
          // category summary handled via ExcelJS
        }

        // Add summary by month
        if (summary?.byMonth) {
          // month summary handled via ExcelJS
        }

        // If a fileName was provided from the modal, use it; else generate
        const now = new Date();
        const useName = fileName || `ExpenseFlow_Reporte_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
        const ExcelJSModule = (await import('exceljs'));
        const ExcelJS = ExcelJSModule.default || ExcelJSModule;
        const workbook = new ExcelJS.Workbook();
        // Convert sheets created with XLSX to ExcelJS OR rebuild headers/rows in ExcelJS
        // To keep changes minimal, rebuild the data into ExcelJS workbook for richer formatting
        const ws = workbook.addWorksheet('Gastos');
        // Build columns directly according to excelData keys
        const columns = Object.keys(excelData[0] || {}).map(k => ({ header: k, key: k, width: 20 }));
        ws.columns = columns as any;
        ws.addRows(excelData.map((r: any) => Object.values(r)));
        // Apply header styles and freeze
        ws.getRow(1).eachCell((cell: any) => {
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '6D28D9' } }; // darker indigo
          cell.alignment = { horizontal: 'center' };
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });
        ws.views = [{ state: 'frozen', ySplit: 1 }];

        // Set number formats for columns matching numeric keys
        const montoIdx = columns.findIndex(c => c.header === 'Monto (ARS)');
        if (montoIdx >= 0) {
          const col = ws.getColumn(montoIdx + 1);
          col.numFmt = '#,##0.00';
          col.alignment = { horizontal: 'right' } as any;
        }
        // Format date columns if available
        const fechaIdx = columns.findIndex(c => c.header === 'Fecha');
        if (fechaIdx >= 0) {
          const col = ws.getColumn(fechaIdx + 1);
          col.numFmt = 'dd/mm/yyyy';
          col.alignment = { horizontal: 'center' } as any;
        }

        // Add borders to all data rows and alignments
        ws.eachRow((row:any, rowNumber:number) => {
          row.eachCell((cell:any) => {
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          });
          if (rowNumber > 1 && montoIdx >= 0) {
            const cell = row.getCell(montoIdx + 1);
            try { cell.numFmt = '#,##0.00'; cell.alignment = { horizontal: 'right' }; } catch(e) {}
          }
          if (rowNumber > 1 && fechaIdx >= 0) {
            const cell = row.getCell(fechaIdx + 1);
            try { cell.numFmt = 'dd/mm/yyyy'; cell.alignment = { horizontal: 'center' }; } catch(e) {}
          }
        });

        // Add filters
        const wsFilters = workbook.addWorksheet('Filtros Aplicados');
        filterRows.forEach(r => wsFilters.addRow(r));
        wsFilters.columns = [{ header: 'Filtro', key: 'f', width: 25 }, { header: 'Valor', key: 'v', width: 45 }];
        wsFilters.getRow(1).eachCell((cell: any) => { cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '111827' } }; cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; });
        // Add borders and style to all filter rows
        wsFilters.eachRow({ includeEmpty: false }, (row:any, rowNumber:number) => {
          row.eachCell((cell: any) => {
            if (rowNumber > 1) {
              cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            }
          });
        });

        // By Category and By Month
        if (summary?.byCategory) {
          const wsCategory = workbook.addWorksheet('Por Categoría');
          wsCategory.columns = [{ header: 'Categoría', key: 'cat', width: 30 }, { header: 'Total (ARS)', key: 'total', width: 16 }, { header: 'Cantidad', key: 'count', width: 12 }];
          summary.byCategory.forEach((item: any) => wsCategory.addRow([item.category, item.total, item.count]));
          wsCategory.getRow(1).eachCell((cell: any) => { cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '6D28D9' } }; cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; });
          wsCategory.eachRow((row:any, rowNumber:number) => { row.eachCell((cell:any) => { cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; if (rowNumber > 1 && cell._column && (cell._column.name === 'total' || cell._column.name === 'Total (ARS)')) { cell.numFmt = '#,##0.00'; cell.alignment = { horizontal: 'right' }; } }); });
        }
        if (summary?.byMonth) {
          const wsMonth = workbook.addWorksheet('Por Mes');
          wsMonth.columns = [{ header: 'Mes', key: 'month', width: 18 }, { header: 'Total (ARS)', key: 'total', width: 16 }, { header: 'Cantidad', key: 'count', width: 12 }];
          summary.byMonth.forEach((item: any) => wsMonth.addRow([item.month, item.total, item.count]));
          wsMonth.getRow(1).eachCell((cell: any) => { cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '6D28D9' } }; cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; });
          wsMonth.eachRow((row:any) => { row.eachCell((cell:any) => { cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; }); });
        }

        // write workbook to buffer and save via FileSaver
        const buf = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buf], { type: 'application/octet-stream' });
        saveAs(blob, `${useName}.xlsx`);
        setShowToast(true);
        setToastMessage(`Exportado ${expToExport.length} gastos`);
        setIsExporting(false);
        return;
      } else {
        // Export transactions
        const txs = exportOnlyVisible ? (filteredTransactions.length ? filteredTransactions : await fetchFilteredTransactionsFromBackend(appliedFilters || {})) : await (async () => { const res = await fetch('/api/transacciones-saldo'); const d = await res.json(); return d; })();
          // Normalize possible response shapes: { transacciones: [] } | { movements: [] } | { success, movements } | []
          let txToExport = [] as any[];
          if (Array.isArray(txs)) txToExport = txs;
          else if (Array.isArray((txs as any).transacciones)) txToExport = (txs as any).transacciones;
          else if (Array.isArray((txs as any).movements)) txToExport = (txs as any).movements;
          else if (Array.isArray((txs as any).results)) txToExport = (txs as any).results;
        // If for some reason txToExport is empty, try fetching explicitly using appliedFilters
        if ((!txToExport || txToExport.length === 0) && exportOnlyVisible) {
            const retry = await fetchFilteredTransactionsFromBackend(appliedFilters || {}, 1000);
          txToExport = retry || txToExport;
        }
        if ((!txToExport || txToExport.length === 0) && !exportOnlyVisible) {
          // As a last resort, fetch all transactions without filters
          const res = await fetch('/api/transacciones-saldo?limit=1000');
          const d = await res.json();
          txToExport = d.transacciones || d.movements || d.results || txToExport || [];
        }
        // If still empty, try last-resort fetch and adjust message
        if ((!txToExport || txToExport.length === 0)) {
          // Final attempt: call endpoint without params
          const res2 = await fetch('/api/transacciones-saldo');
          const data2 = await res2.json();
          if (Array.isArray(data2?.transacciones)) txToExport = data2.transacciones;
          else if (Array.isArray(data2?.movements)) txToExport = data2.movements;
          else if (Array.isArray(data2?.results)) txToExport = data2.results;
        }
        if (!txToExport || txToExport.length === 0) {
          // If the summary indicates there are rows but the list is empty, call an extra retry and offer a helpful message
          if (filteredTransactionsSummary?.totals?.total_count > 0) {
            console.warn('Summary has rows but list empty. Attempt an extra fetch.', { filteredTransactionsSummary });
            const fallback = await fetchFilteredTransactionsFromBackend(appliedFilters || {}, 5000);
            txToExport = fallback || txToExport;
          }
          if (!txToExport || txToExport.length === 0) {
            setShowToast(true);
            setToastMessage('No se encontraron transacciones para exportar con los filtros actuales. Si ves un total en el resumen, intenta Limpiar filtros y volver a aplicar.');
            console.warn('Export aborted — no transactions found for export', { appliedFilters, txToExport, filteredTransactionsSummary });
            setIsExporting(false);
            return;
          }
          console.warn('Export aborted — no transactions found for export', { appliedFilters, txToExport });
          setIsExporting(false);
          return;
        }

        // excelDataTx was removed since we directly map transactions to ExcelJS rows to preserve proper types

        // Add filters sheet for transactions (will use ExcelJS)
        const filterRowsTx: any[] = [];
        filterRowsTx.push([`Exportado por`, (userProfile?.name || user?.email || user?.id || 'N/A')]);
        filterRowsTx.push([`Fecha exportación`, new Date().toLocaleString()]);
        filterRowsTx.push([`Reporte`, 'Transacciones de Saldo']);
        filterRowsTx.push([]);
        filterRowsTx.push(['Filtro', 'Valor']);
        if (appliedFilters) {
          if (appliedFilters.from) filterRowsTx.push(['Fecha Desde', appliedFilters.from]);
          if (appliedFilters.to) filterRowsTx.push(['Fecha Hasta', appliedFilters.to]);
          if (appliedFilters.userId && appliedFilters.userId !== 'all') {
            const u = usersList.find(u => String(u.user_id || u.id) === String(appliedFilters.userId));
            filterRowsTx.push(['Usuario', u ? (u.name || u.email) : appliedFilters.userId]);
          }
          if ((appliedFilters as any).type && (appliedFilters as any).type !== 'all') filterRowsTx.push(['Tipo', (appliedFilters as any).type]);
          if (appliedFilters.currency && appliedFilters.currency !== 'all') filterRowsTx.push(['Moneda', appliedFilters.currency]);
          if (appliedFilters.minAmount) filterRowsTx.push(['Monto Min', appliedFilters.minAmount]);
          if (appliedFilters.maxAmount) filterRowsTx.push(['Monto Max', appliedFilters.maxAmount]);
          if (appliedFilters.search) filterRowsTx.push(['Busqueda', appliedFilters.search]);
        }
        // filters handled via ExcelJS

        // Transactions sheet created via ExcelJS below

        const nowTx = new Date();
        const defaultNameTx = `ExpenseFlow_Transacciones_${nowTx.getFullYear()}-${(nowTx.getMonth() + 1).toString().padStart(2, '0')}-${nowTx.getDate().toString().padStart(2, '0')}`;
        const useNameTx = fileName || exportFileName || defaultNameTx;
        // Build ExcelJS workbook for transactions
        const ExcelJSModuleTx = (await import('exceljs'));
        const ExcelJSTx = ExcelJSModuleTx.default || ExcelJSModuleTx;
        const wbEx = new ExcelJSTx.Workbook();
        const wsT = wbEx.addWorksheet('Transacciones');
        const headersTx = ['ID','Usuario','Tipo','Monto','Saldo Anterior','Saldo Nuevo','Moneda','Descripción','Fecha'];
        wsT.columns = headersTx.map(h => ({ header: h, key: h, width: 20 })) as any;
        // Map original transactions to rows, ensuring a single date column uses `fecha_transaccion`
        txToExport.forEach((t: any) => {
          const row = [
            t.id,
            t.user_name || t.user_email || t.user_id,
            t.tipo,
            Number(t.monto || 0),
            Number(t.saldo_anterior || 0),
            Number(t.saldo_nuevo || 0),
            t.currency,
            t.descripcion,
            new Date(t.fecha_transaccion)
          ];
          wsT.addRow(row);
        });
        // Header style
        wsT.getRow(1).eachCell((c:any) => { c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '8B5CF6' } }; c.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }; });
        wsT.views = [{ state: 'frozen', ySplit: 1 }];
        // Format currency and date columns
        ['Monto', 'Saldo Anterior', 'Saldo Nuevo'].forEach(title => {
          const col = wsT.getColumn(headersTx.indexOf(title) + 1);
          if (col) col.numFmt = '#,##0.00';
        });
        const colDate = wsT.getColumn(headersTx.indexOf('Fecha') + 1);
        if (colDate) colDate.numFmt = 'dd/mm/yyyy hh:mm';
        // Align currency columns and center date, and apply borders to all rows
        ['Monto', 'Saldo Anterior', 'Saldo Nuevo'].forEach(title => {
          const col = wsT.getColumn(headersTx.indexOf(title) + 1);
          if (col) col.alignment = { horizontal: 'right' } as any;
        });
        if (colDate) colDate.alignment = { horizontal: 'center' } as any;
        wsT.eachRow((row:any) => { row.eachCell((cell:any) => { cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; }); });

        const wsFilters2 = wbEx.addWorksheet('Filtros Aplicados');
        filterRowsTx.forEach(r => wsFilters2.addRow(r));
        wsFilters2.columns = [{ header: 'Filtro', key: 'f', width: 25 }, { header: 'Valor', key: 'v', width: 45 }];
        wsFilters2.getRow(1).eachCell((c:any) => { c.font = { bold: true }; });
        wsFilters2.getRow(1).eachCell((c:any) => { c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '111827' } }; c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; });
        wsFilters2.eachRow((row:any, rowNumber:number) => { row.eachCell((cell:any) => { if (rowNumber > 1) cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; }); });

        // Summary: By Type and By Month
        if (filteredTransactionsSummary?.byType) {
          const wsByType = wbEx.addWorksheet('Por Tipo');
          wsByType.columns = [{ header: 'Tipo', key: 'type', width: 30 }, { header: 'Total', key: 'total', width: 16 }, { header: 'Cantidad', key: 'count', width: 12 }];
          (filteredTransactionsSummary.byType || []).forEach((t:any) => wsByType.addRow([t.type, t.total, t.count]));
          wsByType.getRow(1).eachCell((c:any) => { c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '6D28D9' } }; c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; });
          wsByType.eachRow((row:any) => { row.eachCell((cell:any) => { cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; }); });
        }
        if (filteredTransactionsSummary?.byMonth) {
          const wsByMonth = wbEx.addWorksheet('Por Mes');
          wsByMonth.columns = [{ header: 'Mes', key: 'month', width: 18 }, { header: 'Total', key: 'total', width: 16 }, { header: 'Cantidad', key: 'count', width: 12 }];
          (filteredTransactionsSummary.byMonth || []).forEach((m:any) => wsByMonth.addRow([m.month, m.total, m.count]));
          wsByMonth.getRow(1).eachCell((c:any) => { c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '6D28D9' } }; c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; });
          wsByMonth.eachRow((row:any) => { row.eachCell((cell:any) => { cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; }); });
        }
        if (filteredTransactionsSummary?.byCurrency) {
          const wsByCurrency = wbEx.addWorksheet('Por Moneda');
          wsByCurrency.columns = [{ header: 'Moneda', key: 'currency', width: 12 }, { header: 'Total', key: 'total', width: 16 }, { header: 'Cantidad', key: 'count', width: 12 }];
          (filteredTransactionsSummary.byCurrency || []).forEach((c:any) => wsByCurrency.addRow([c.currency, c.total, c.count]));
          wsByCurrency.getRow(1).eachCell((c:any) => { c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '6D28D9' } }; c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; });
          wsByCurrency.eachRow((row:any) => { row.eachCell((cell:any) => { cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; }); });
        }

        const buftx = await wbEx.xlsx.writeBuffer();
        saveAs(new Blob([buftx]), `${useNameTx}.xlsx`);
        setShowToast(true);
        setToastMessage(`Exportado ${txToExport.length} transacciones`);
        setIsExporting(false);
        return;
      }

      // Note: expense export handled in branch above.
    } catch (error) {
      console.error("Error exportando a Excel:", error);
      console.warn("Error al exportar el reporte");
    } finally {
      setIsExporting(false);
    }
  };

  const handleConfirmExport = async () => {
    setShowExportModal(false);
    setIsExporting(true);
    await exportToExcel(exportFileName);
    setIsExporting(false);
  };

  const handleCloseToast = () => {
    setShowToast(false);
    setToastMessage('');
  };

  // Apply the current filters to the raw expense list
  const applyFiltersToExpenses = (expenses: any[], filtersToApply: any = {}) => {
    const { from, to, userId, category, currency, status, search, minAmount, maxAmount, hasReceipt } = filtersToApply || {};
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
      if (minAmount !== undefined && minAmount !== null && String(minAmount).trim() !== '') {
        const minA = Number(minAmount) || 0;
        if (Number(e.amount) < minA) return false;
      }
      if (maxAmount !== undefined && maxAmount !== null && String(maxAmount).trim() !== '') {
        const maxA = Number(maxAmount) || 0;
        if (Number(e.amount) > maxA) return false;
      }
      if (hasReceipt && hasReceipt !== 'all') {
        if (hasReceipt === 'true' && !e.receipt_photo_url) return false;
        if (hasReceipt === 'false' && e.receipt_photo_url) return false;
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

  // Memoized computed summary based on allExpenses and applied filters
  const filteredReportData = useMemo(() => {
    // if no server data available, fallback to client-side computation
    if (!allExpenses || allExpenses.length === 0) return reportData;
    // If there are no applied filters, use the base server-provided summary
    if (!appliedFilters) return reportData;
    // If backend computed filtered summary exists, prefer it (better performance)
    if (filteredReportDataBackend) return filteredReportDataBackend;
    // Otherwise compute client-side
    const filteredExpenses = applyFiltersToExpenses(allExpenses, appliedFilters);
    return computeSummaryFromExpenses(filteredExpenses);
  }, [allExpenses, appliedFilters, filteredReportDataBackend, reportData]);

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
          <div className="flex flex-col">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reportes</h1>
              {activeFilterCount > 0 && (
                <div className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold shadow-sm">
                  <Filter className="w-3 h-3 mr-1 opacity-90" />
                  <span>{activeFilterCount} filtro{activeFilterCount > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-300">Análisis detallado de los gastos</p>
          </div>
          {/* Pagination controls for transacciones (outside nested ternary) */}
          {!isLoading && reportType === 'transacciones' && filteredTransactions && filteredTransactions.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-600">Mostrando {(transactionsPage - 1) * transactionsPerPage + 1} - {Math.min(transactionsPage * transactionsPerPage, totalTransactions)} de {totalTransactions} transacciones</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setTransactionsPage(1)} disabled={transactionsPage === 1} className="px-2 py-1 bg-black hover:bg-gray-800 text-white rounded">« Primera</button>
                  <button onClick={() => setTransactionsPage(Math.max(1, transactionsPage - 1))} disabled={transactionsPage === 1} className="px-2 py-1 bg-black hover:bg-gray-800 text-white rounded">‹ Anterior</button>
                  <span className="px-2 py-1 bg-black text-white rounded">Página {transactionsPage} de {Math.max(1, Math.ceil(totalTransactions / transactionsPerPage))}</span>
                  <button onClick={() => setTransactionsPage(Math.min(Math.max(1, Math.ceil(totalTransactions / transactionsPerPage)), transactionsPage + 1))} disabled={transactionsPage === Math.max(1, Math.ceil(totalTransactions / transactionsPerPage))} className="px-2 py-1 bg-black hover:bg-gray-800 text-white rounded">Siguiente ›</button>
                  <button onClick={() => setTransactionsPage(Math.max(1, Math.ceil(totalTransactions / transactionsPerPage)))} disabled={transactionsPage === Math.max(1, Math.ceil(totalTransactions / transactionsPerPage))} className="px-2 py-1 bg-black hover:bg-gray-800 text-white rounded">Última »</button>
                </div>
              </div>
            </div>
          )}
          
            <div className="flex items-center space-x-2">
              <div className="mr-3">
              <select value={reportType} onChange={(e) => setReportType(e.target.value as any)} className="px-3 py-2 rounded bg-gray-800 text-white">
                <option value="expenses">Gastos</option>
                <option value="transacciones">Transacciones de Saldo</option>
              </select>
            </div>
              {/* Chart layout is fixed to portrait per recent UX decision */}
            <button
              onClick={() => {
                // Build a default filename when opening the modal
                const nowTx = new Date();
                const defaultName = `${reportType === 'expenses' ? 'ExpenseFlow_Reporte' : 'ExpenseFlow_Transacciones'}_${nowTx.getFullYear()}-${(nowTx.getMonth() + 1).toString().padStart(2, '0')}-${nowTx.getDate().toString().padStart(2, '0')}`;
                setExportFileName(defaultName);
                setShowExportModal(true);
              }}
              disabled={isExporting || !(reportType === 'expenses' ? (filteredReportData || reportData) : ((filteredTransactionsSummary && filteredTransactionsSummary.totals) || filteredTransactions.length > 0))}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span className="font-medium">
              {isExporting ? "Exportando..." : "Exportar a Excel"}
            </span>
          </button>
            {/* Desktop filter toggle (visible on md+) */}
            <button title="Abrir filtros" aria-label="Abrir filtros" onClick={() => setShowFiltersPanel(s => !s)} className="hidden md:inline-flex relative px-3 py-2 rounded bg-indigo-700 hover:bg-indigo-600 text-white flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm">Filtros</span>
              { activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">{activeFilterCount}</span>
              )}
            </button>

            {/* Mobile filter toggle */}
            <button title="Abrir filtros" aria-label="Abrir filtros" onClick={() => setShowFiltersPanel(s => !s)} className="md:hidden relative px-3 py-2 rounded bg-indigo-700 hover:bg-indigo-600 text-white flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
              { activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">{activeFilterCount}</span>
              )}
            </button>
          </div>
          {/* Debug toggle removed */}
        </div>
        {/* Active filter badges */}
        {activeFilterCount > 0 && (
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-400 mr-2">Filtros activos:</span>
            {Object.entries(appliedFilters || {}).map(([key, value]) => {
              const v = value as any;
              if (v === '' || v === 'all' || v === null || v === undefined) return null;
              let label = '';
              if (key === 'userId') {
                const u = usersList.find(u => String(u.user_id || u.id) === String(v));
                label = `Usuario: ${u ? (u.name || u.email) : v}`;
              } else if (key === 'from') {
                label = `Desde: ${v}`;
              } else if (key === 'to') {
                label = `Hasta: ${v}`;
              } else if (key === 'category') {
                label = `Categoría: ${v}`;
              } else if (key === 'status') {
                label = `Estado: ${v}`;
              } else if (key === 'currency') {
                label = `Moneda: ${v}`;
              } else if (key === 'minAmount') {
                label = `Min: ${v}`;
              } else if (key === 'maxAmount') {
                label = `Max: ${v}`;
              } else if (key === 'hasReceipt') {
                label = `Recibo: ${v === 'true' ? 'Sí' : 'No'}`;
              } else if (key === 'search') {
                label = `Buscar: ${v}`;
              }
              return (
                <div key={key} className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-500 border border-indigo-500/20 px-3 py-1 rounded-full text-sm text-white shadow-sm">
                  <Filter className="w-3 h-3 opacity-90" />
                  <span>{label}</span>
                  <button onClick={() => {
                    if (!appliedFilters) return;
                    const newFilters = { ...appliedFilters } as any;
                    // reset to defaults
                    if (key === 'userId' || key === 'category' || key === 'currency' || key === 'status' || key === 'hasReceipt') newFilters[key] = 'all';
                    else newFilters[key] = '';
                    const anyActive = Object.values(newFilters).some(v => v !== '' && v !== 'all' && v !== null && v !== undefined);
                    if (!anyActive) {
                      setAppliedFilters(null);
                      setFilteredReportDataBackend(reportData);
                      setFilteredExpenses([]);
                      setStagedFilters({from:'', to:'', userId:'all', category:'all', currency:'all', status:'all', minAmount: '', maxAmount: '', hasReceipt: 'all', search:''});
                    } else {
                      setAppliedFilters(newFilters);
                      fetchFilteredSummaryFromBackend(newFilters);
                      fetchFilteredExpensesFromBackend(newFilters);
                      // keep staged filters synchronized
                      setStagedFilters(prev => ({...prev, [key]: newFilters[key]}));
                    }
                  }} className="text-xs px-1 py-1 rounded hover:bg-white/10">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
            <button onClick={() => { setAppliedFilters(null); setFilteredReportDataBackend(reportData); setFilteredExpenses([]); setStagedFilters({from:'', to:'', userId:'all', category:'all', currency:'all', status:'all', minAmount: '', maxAmount: '', hasReceipt: 'all', search:''}); }} className="ml-2 px-3 py-1 rounded bg-indigo-700 hover:bg-indigo-600 text-white text-sm">Limpiar todo</button>
          </div>
        )}

        {/* Debug panel removed per request */}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main content */}
          <div className="md:col-span-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin">
                  <Loader2 className="w-10 h-10 text-indigo-600" />
                </div>
              </div>
              ) : reportType === 'expenses' ? (
              filteredReportData ? (
                <div className="space-y-6">
                  <ReportsSummary totals={filteredReportData.totals} isTransaction={false} />
                  <div className={`grid md:grid-cols-1 gap-6`}> 
                    <div className={`h-96`}><CategoryChart data={filteredReportData.byCategory} /></div>
                    <div className={`h-96`}><MonthlyChart data={filteredReportData.byMonth} /></div>
                    {/* AI-powered trend chart */}
                    <div className={`h-96`}><TrendAIChart data={filteredReportData.byMonth} /></div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-600 dark:text-gray-400">No hay datos disponibles</p>
                </div>
              )
            ) : (
              filteredTransactionsSummary ? (
                <div className="space-y-6">
                  <ReportsSummary totals={filteredTransactionsSummary.totals} isTransaction={true} currencyBreakdown={(filteredTransactionsSummary.byCurrency || [])} />
                  <div className={`grid md:grid-cols-1 gap-6`}> 
                    <div className={`h-96`}><CategoryChart data={(filteredTransactionsSummary.byType || []).map((t:any) => ({ category: t.type, total: t.total, count: t.count }))} title={'Saldos por Categoría'} subtitle={'Distribución de saldos'} itemLabel={'transacción'} /></div>
                    <div className={`h-96`}><MonthlyChart data={filteredTransactionsSummary.byMonth || []} title={'Saldos por Mes'} subtitle={'Últimos 12 meses'} itemLabel={'transacción'} /></div>
                    {/* Información card removed because it didn't show dynamic content (empty) */}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-600 dark:text-gray-400">No hay datos disponibles</p>
                </div>
              )
            )}
          </div>
          {/* Aside - Filter Panel */}
          <aside className="md:col-span-4">
            <div className={`${showFiltersPanel ? 'block' : 'hidden md:block'} mb-6 bg-gray-900/60 border border-white/10 rounded-xl p-4 shadow-lg` + (showFiltersPanel ? ' fixed top-24 right-3 z-50 w-11/12 md:w-auto' : '')}>
              <div className="md:block">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-300 mb-1">Fecha Desde</label>
                  <input type="date" value={stagedFilters.from} onChange={(e) => setStagedFilters(prev => ({...prev, from: e.target.value}))} className="px-3 py-2 rounded bg-gray-800 text-white" />
                </div>
                <div className="flex flex-col mt-3">
                  <label className="text-xs text-gray-300 mb-1">Fecha Hasta</label>
                  <input type="date" value={stagedFilters.to} onChange={(e) => setStagedFilters(prev => ({...prev, to: e.target.value}))} className="px-3 py-2 rounded bg-gray-800 text-white" />
                </div>
                <div className="flex flex-col md:col-span-2 mt-3">
                  <label className="text-xs text-gray-300 mb-1">Usuario</label>
                  <select value={stagedFilters.userId} onChange={(e) => setStagedFilters(prev => ({...prev, userId: e.target.value}))} className="px-3 py-2 rounded bg-gray-800 text-white">
                    <option value="all">Todos</option>
                    {usersList.map(u => <option key={u.user_id || u.id} value={u.user_id || u.id}>{u.name || u.email || (u.user_id || u.id)}</option>)}
                  </select>
                </div>
                <div className="flex flex-col mt-3">
                  <label className="text-xs text-gray-300 mb-1">Categoría</label>
                  <select value={stagedFilters.category} onChange={(e) => setStagedFilters(prev => ({...prev, category: e.target.value}))} className="px-3 py-2 rounded bg-gray-800 text-white">
                    <option value="all">Todas</option>
                    {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col mt-3">
                  <label className="text-xs text-gray-300 mb-1">Moneda</label>
                  <select value={stagedFilters.currency} onChange={(e) => setStagedFilters(prev => ({...prev, currency: e.target.value}))} className="px-3 py-2 rounded bg-gray-800 text-white">
                    <option value="all">Todas</option>
                    <option value="ARS">ARS</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="BRL">BRL</option>
                  </select>
                </div>
                <div className="flex flex-col mt-3">
                  <label className="text-xs text-gray-300 mb-1">Estado</label>
                  <select value={stagedFilters.status} onChange={(e) => setStagedFilters(prev => ({...prev, status: e.target.value}))} className="px-3 py-2 rounded bg-gray-800 text-white">
                    <option value="all">Todos</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="aprobado">Aprobado</option>
                    <option value="rechazado">Rechazado</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2 md:col-span-3 mt-3">
                  <input type="text" placeholder="Buscar por descripción o usuario..." value={stagedFilters.search} onChange={(e) => setStagedFilters(prev => ({...prev, search: e.target.value}))} className="flex-1 px-3 py-2 rounded bg-gray-800 text-white" />
                  <button onClick={() => setStagedFilters({from:'', to:'', userId:'all', category:'all', currency:'all', status:'all', minAmount: '', maxAmount: '', hasReceipt: 'all', search:''})} className="px-4 py-2 rounded bg-gray-700 text-white">Reset</button>
                </div>
                {/* Additional filters row */}
                <div className="flex flex-col mt-3">
                  <label className="text-xs text-gray-300 mb-1">Monto Min</label>
                  <input type="number" value={stagedFilters.minAmount || ''} onChange={(e) => setStagedFilters(prev => ({...prev, minAmount: e.target.value}))} className="px-3 py-2 rounded bg-gray-800 text-white" />
                </div>
                <div className="flex flex-col mt-3">
                  <label className="text-xs text-gray-300 mb-1">Monto Max</label>
                  <input type="number" value={stagedFilters.maxAmount || ''} onChange={(e) => setStagedFilters(prev => ({...prev, maxAmount: e.target.value}))} className="px-3 py-2 rounded bg-gray-800 text-white" />
                </div>
                <div className="flex flex-col mt-3">
                  <label className="text-xs text-gray-300 mb-1">Tiene Recibo</label>
                  <select value={stagedFilters.hasReceipt} onChange={(e) => setStagedFilters(prev => ({...prev, hasReceipt: e.target.value}))} className="px-3 py-2 rounded bg-gray-800 text-white">
                    <option value="all">Todos</option>
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="flex items-center justify-end md:col-span-3 space-x-2 mt-4">
                  <button onClick={async () => {
                    setAppliedFilters({ ...stagedFilters });
                    if (reportType === 'expenses') {
                      await fetchFilteredSummaryFromBackend(stagedFilters);
                      await fetchFilteredExpensesFromBackend(stagedFilters);
                    } else {
                      // Transacciones
                      const txs = await fetchFilteredTransactionsFromBackend(stagedFilters);
                      const summary = await fetchFilteredTransactionsSummaryFromBackend(stagedFilters);
                      if (summary) {
                        setFilteredTransactionsSummary(summary);
                      } else {
                        const totals = { total_amount: (txs||[]).reduce((s:any, t:any) => s + Number(t.monto || 0), 0), total_count: (txs||[]).length };
                        setFilteredTransactionsSummary({ totals });
                      }
                    }
                    setShowFiltersPanel(false);
                  }} className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white">Aplicar</button>
                  <button onClick={() => { setStagedFilters({from:'', to:'', userId:'all', category:'all', currency:'all', status:'all', minAmount: '', maxAmount: '', hasReceipt: 'all', search:''}); setShowFiltersPanel(false); }} className="px-4 py-2 rounded bg-gray-700 text-white">Limpiar</button>
                  <label className="flex items-center space-x-2 ml-4">
                    <input type="checkbox" checked={exportOnlyVisible} onChange={(e) => setExportOnlyVisible(e.target.checked)} />
                    <span className="text-xs text-gray-300">Exportar solo visible</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <ExportModal
        open={showExportModal}
        filename={exportFileName}
        onClose={() => setShowExportModal(false)}
        onChangeFilename={(name) => setExportFileName(name)}
        onConfirm={handleConfirmExport}
        exportOnlyVisible={exportOnlyVisible}
        setExportOnlyVisible={setExportOnlyVisible}
      />
      <Toast message={toastMessage} open={showToast} onClose={handleCloseToast} />
    </div>
    </div>
  );
}
