import { Plus, Trash2, Receipt, Filter, Edit3, CheckCircle, XCircle, Sparkles, FileSpreadsheet, Clock } from "lucide-react";
import { useState, useRef } from "react";
import BubbleTooltipPortal from "./BubbleTooltipPortal";
import { getStatusBadgeClasses, getStatusLabel } from '@/react-app/utils/status';
import type { Expense } from "@/shared/types";
import * as XLSX from 'xlsx';
import { getRandomEmoji, getRandomEmojis } from '../../../epic-effects-library/effects/EmojiVariations';
import { playRandomSound } from '../../../epic-effects-library/sounds/SoundVariations';
import { getColorSet } from '../../../epic-effects-library/effects/ColorVariations';

interface ExpensesTableProps {
  expenses: Expense[];
  isLoading: boolean;
  onAdd?: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  userRole?: string;
  users?: any[];
  currentUserId?: string;
  forceMobileView?: boolean;
}

export default function ExpensesTable({
  expenses,
  isLoading,
  onAdd,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  userRole,
  users = [],
  currentUserId,
  forceMobileView = false,
}: ExpensesTableProps) {
  // Dynamic lists for filters (pull from server so grid uses DB values)
  const [currenciesList, setCurrenciesList] = useState<Array<{code: string; name?: string; symbol?: string}>>([]);

  // Selected filters
  // (category filter removed as per request)
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');

  // Fetch currencies & categories for dropdowns used in the grid
  useState(() => {
    fetch('/api/currencies')
      .then(r => r.ok ? r.json() : [])
      .then((data) => {
        if (Array.isArray(data)) setCurrenciesList(data.map((c:any) => ({ code: String(c.code).toUpperCase(), name: c.name, symbol: c.symbol })));
      })
      .catch(() => setCurrenciesList([]));

    // categories not required here (grid has no category filter)
  });
  // Estado para el modal de preview de adjuntos
  const [previewAttachments, setPreviewAttachments] = useState<Array<{url?: string, filename: string, originalName?: string}> | null>(null);
  // Hover preview (zoom) state for thumbnails
  const [hoverPreview, setHoverPreview] = useState<{ url: string; left: number; top: number } | null>(null);
  // Estado para burbuja de rechazo
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubbleData, setBubbleData] = useState<{x: number, y: number, rejectionReason: string, rejectedBy?: string, rejectedAt?: string} | null>(null);
  const bubbleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Estado para filtros
  const [filters, setFilters] = useState({
    pendientes: true,
    aprobados: true,
    rechazados: true,
  });

  // Estado para paginación y filtros de fecha
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilters, setDateFilters] = useState({
    desde: '',
    hasta: ''
  });
  // Si es usuario, filtrar solo sus gastos. Si es admin/supervisor, ver todos
  const [userFilter, setUserFilter] = useState<string>(
    userRole === 'usuario' ? (currentUserId || 'all') : 'all'
  );
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingExpenseId, setRejectingExpenseId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'approve' | 'reject' | 'save'>('approve');
  const [currentEmoji, setCurrentEmoji] = useState('✅');
  const [particleEmojis, setParticleEmojis] = useState<string[]>([]);
  const [particleColors, setParticleColors] = useState<string[]>([]);
  const recordsPerPage = 5;

  const formatCurrency = (amount: number, currency: string = "ARS") => {
    const currencyMap: Record<string, string> = {
      ARS: "es-AR",
      USD: "en-US", 
      EUR: "de-DE",
      BRL: "pt-BR",
      UYU: "es-UY",
    };
    
    const locale = currencyMap[currency] || "es-AR";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  };

  // Función exportar Excel
  const exportToExcel = () => {
    // Group expenses by currency and create a sheet per currency
    const grouped: Record<string, any[]> = {};
    for (const exp of filteredExpenses) {
      const key = (exp.currency || 'ARS').toUpperCase();
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(exp);
    }

    const workbook = XLSX.utils.book_new();
    const currencyFormatMap: Record<string, string> = {
      ARS: '[$ARS] #,##0.00',
      USD: '[$USD] #,##0.00',
      EUR: '[$EUR] #,##0.00',
      BRL: '[$BRL] #,##0.00',
      UYU: '[$UYU] #,##0.00'
    };

    const summary: Array<{Moneda: string; Total: number; Count: number}> = [];

    for (const currency of Object.keys(grouped)) {
      const rows = grouped[currency].map(exp => ({
        'ID': exp.id,
        'Usuario': exp.user_name || 'N/A',
        'Descripción': exp.description,
        'Monto': Number(exp.amount),
        'Moneda': exp.currency,
        'Forma de Pago': exp.sigla || '-',
        'Categoría': exp.category,
        'Fecha': new Date(exp.expense_date).toLocaleDateString('es-AR'),
        'Estado': exp.status,
        'Creado': new Date(exp.created_at).toLocaleDateString('es-AR'),
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      ws['!cols'] = [
        { wch: 8 }, { wch: 25 }, { wch: 40 }, { wch: 15 }, { wch: 10 },
        { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 15 },
      ];

      // Apply currency formatting to 'Monto' column
      const header = Object.keys(rows[0] || {});
      const mIdx = header.indexOf('Monto');
      if (mIdx >= 0) {
        const toCol = (n: number) => {
          let s = '';
          while (n >= 0) {
            s = String.fromCharCode((n % 26) + 65) + s;
            n = Math.floor(n / 26) - 1;
          }
          return s;
        };
        const col = toCol(mIdx);
        for (let i = 0; i < rows.length; i++) {
          const addr = `${col}${i+2}`;
          const cell = ws[addr];
          if (cell && typeof cell.v === 'number') {
            cell.z = currencyFormatMap[currency] || currencyFormatMap['ARS'];
          }
        }
      }

      XLSX.utils.book_append_sheet(workbook, ws, currency);

      const total = grouped[currency].reduce((s, e) => s + Number(e.amount || 0), 0);
      summary.push({Moneda: currency, Total: total, Count: grouped[currency].length});
    }

    // Add summary sheet
    if (summary.length > 0) {
      const wsSum = XLSX.utils.json_to_sheet(summary);
      XLSX.utils.book_append_sheet(workbook, wsSum, 'Resumen por Moneda');
    }

    // Ask for filename
    const date = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');
    let filename = window.prompt('Nombre de archivo para exportar (sin extensión):', `gastos_${date}`) || `gastos_${date}`;
    if (!filename.toLowerCase().endsWith('.xlsx')) filename = `${filename}.xlsx`;

    // Currency formatting has been applied per-currency when creating their respective sheets.

    XLSX.writeFile(workbook, filename);
    setShowExportPreview(false);
  };

  // Funciones para manejar el rechazo
  const handleRejectClick = (expenseId: number) => {
    setRejectingExpenseId(expenseId);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert('⚠️ Debes proporcionar una razón para el rechazo');
      return;
    }
    
    if (rejectingExpenseId && onReject) {
      try {
        await fetch(`/api/expenses/${rejectingExpenseId}/reject`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rejectionReason: rejectionReason.trim() })
        });
        
        onReject(rejectingExpenseId);
        setShowRejectModal(false);
        setRejectionReason('');
        setRejectingExpenseId(null);
        
        // Reproducir sonido de error y mostrar notificación animada con emojis y colores aleatorios
        playRandomSound('reject', 0.25);
        setCurrentEmoji(getRandomEmoji('reject'));
        setParticleEmojis(getRandomEmojis('reject', 'particles', 6));
        setParticleColors(getColorSet(6));
        setNotificationType('reject');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3500); // 3.5 segundos
      } catch (error) {
        console.error('Error al rechazar:', error);
        alert('❌ Error al rechazar el gasto');
      }
    }
  };

  const handleApproveClick = (expenseId: number) => {
    if (onApprove) {
      onApprove(expenseId);
      
      // Reproducir sonido de éxito y mostrar notificación animada con emojis y colores aleatorios
      playRandomSound('approve', 0.25);
      setCurrentEmoji(getRandomEmoji('approve'));
      setParticleEmojis(getRandomEmojis('approve', 'particles', 20));
      setParticleColors(getColorSet(5));
      setNotificationType('approve');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3500); // 3.5 segundos
    }
  };

  const handleRejectCancel = () => {
    setShowRejectModal(false);
    setRejectionReason('');
    setRejectingExpenseId(null);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  // Aplicar filtros de estado y fecha
  const filteredExpenses = expenses.filter(expense => {
    // Filtro por estado
    const statusMatch = 
      (expense.status === 'pendiente' && filters.pendientes) ||
      (expense.status === 'aprobado' && filters.aprobados) ||
      (expense.status === 'rechazado' && filters.rechazados);
    
    if (!statusMatch) return false;

    // Filtro por usuario
    if (userFilter !== 'all' && expense.user_id !== userFilter) {
      return false;
    }

    // Filtro por categoría (opcional)
      // category filter intentionally removed from grid (UI requirement)

    // Filtro por moneda (opcional)
    if (currencyFilter !== 'all' && String((expense.currency || '').toUpperCase()) !== String(currencyFilter).toUpperCase()) {
      return false;
    }

    // Filtro por fecha
    const expenseDate = new Date(expense.expense_date);
    const fromDate = dateFilters.desde ? new Date(dateFilters.desde) : null;
    const toDate = dateFilters.hasta ? new Date(dateFilters.hasta) : null;

    if (fromDate && expenseDate < fromDate) return false;
    if (toDate && expenseDate > toDate) return false;

    return true;
  });

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / recordsPerPage));
  const startIndex = (currentPage - 1) * recordsPerPage;
  const displayExpenses = filteredExpenses.slice(startIndex, startIndex + recordsPerPage);

  return (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden w-full px-4 sm:px-8 py-4 sm:py-6">
    {/* Floating zoom preview for hovered attachment thumbnails (pointer-events none so it won't block hover) */}
    {hoverPreview && (
      <div style={{ position: 'fixed', left: hoverPreview.left, top: hoverPreview.top, zIndex: 9999, pointerEvents: 'none' }}>
        <div className="bg-white rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-1" style={{ maxWidth: '360px', maxHeight: '75vh' }}>
          <img src={hoverPreview.url} alt="preview" style={{ display: 'block', width: '100%', height: 'auto', borderRadius: 8 }} />
        </div>
      </div>
    )}
  <div className="p-0 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-y-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Lista de Gastos</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total: {expenses.length} {expenses.length === 1 ? "gasto" : "gastos"}
            {expenses.length > 5 && (
              <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
                Mostrando solo los primeros 5
              </span>
            )}
          </p>
        </div>
        {onAdd && (
          <button
            onClick={onAdd}
            className="group relative flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white rounded-xl hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            <Plus className="relative w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span className="relative font-semibold text-sm">✨ Nuevo Gasto</span>
          </button>
        )}
      </div>

      {/* Filtros por estado */}
  <div className="px-3 sm:px-6 py-3 bg-gradient-to-br from-gray-900/60 to-gray-800/50 dark:from-gray-800/70 dark:to-gray-900/70 border border-white/5 rounded-2xl shadow-sm mb-4">
  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-y-3 sm:gap-y-0 sm:space-x-6">
          <div className="flex items-center gap-x-2">
            <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por estado:</span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Compact status pills */}
            <button
              aria-pressed={filters.pendientes}
              onClick={() => { setFilters({ ...filters, pendientes: !filters.pendientes }); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${filters.pendientes ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow' : 'bg-white/5 text-white/70 border border-white/5'}`}>
              <Clock className={`w-4 h-4 ${filters.pendientes ? 'text-white' : 'text-indigo-300'}`} />
              <span className="truncate">Pendientes</span>
              <span className="ml-1 text-xs font-bold px-2 py-0.5 bg-white/10 rounded-full">{expenses.filter(e => e.status === 'pendiente').length}</span>
            </button>

            <button
              aria-pressed={filters.aprobados}
              onClick={() => { setFilters({ ...filters, aprobados: !filters.aprobados }); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${filters.aprobados ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow' : 'bg-white/5 text-white/70 border border-white/5'}`}>
              <CheckCircle className={`w-4 h-4 ${filters.aprobados ? 'text-white' : 'text-emerald-300'}`} />
              <span className="truncate">Aprobados</span>
              <span className="ml-1 text-xs font-bold px-2 py-0.5 bg-white/10 rounded-full">{expenses.filter(e => e.status === 'aprobado').length}</span>
            </button>

            <button
              aria-pressed={filters.rechazados}
              onClick={() => { setFilters({ ...filters, rechazados: !filters.rechazados }); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-orange-400 ${filters.rechazados ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow' : 'bg-white/5 text-white/70 border border-white/5'}`}>
              <XCircle className={`w-4 h-4 ${filters.rechazados ? 'text-white' : 'text-orange-300'}`} />
              <span className="truncate">Rechazados</span>
              <span className="ml-1 text-xs font-bold px-2 py-0.5 bg-white/10 rounded-full">{expenses.filter(e => e.status === 'rechazado').length}</span>
            </button>
          </div>
          
          <div className="flex gap-x-2 ml-auto items-center">
            <button
              onClick={() => {
                setFilters({pendientes: true, aprobados: true, rechazados: true});
                setCurrentPage(1);
              }}
              className="px-2 sm:px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors shadow-sm"
            >
              Todos
            </button>
            {/* Category filter (from DB) */}
              {/* Category filter removed from grid per request */}

            {/* Currency filter (from DB) */}
            <select
              value={currencyFilter}
              onChange={(e) => { setCurrencyFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-1 text-xs bg-gray-800 border border-white/6 rounded-full text-white hover:bg-gray-700 font-semibold transition-all"
            >
              <option value="all">Todas las monedas</option>
              {currenciesList.map(c => (
                <option key={c.code} value={c.code}>{c.code} {c.name ? `- ${c.name}` : ''}</option>
              ))}
            </select>
            <button
              onClick={() => {
                setFilters({pendientes: false, aprobados: false, rechazados: false});
                setCurrentPage(1);
              }}
              className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors border border-white/6"
            >
              Ninguno
            </button>
          </div>
        </div>
        
        {/* Filtros por fecha */}
  <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-y-2 sm:space-x-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">📅 Filtrar por fecha:</span>
          <div className="flex items-center space-x-2">
            <label className="text-xs text-gray-600 dark:text-gray-400">Desde:</label>
            <input
              type="date"
              value={dateFilters.desde}
              onChange={(e) => {
                setDateFilters({...dateFilters, desde: e.target.value});
                setCurrentPage(1); // Reset to first page when filtering
              }}
              className="px-2 py-1 text-xs border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-xs text-gray-600 dark:text-gray-400">Hasta:</label>
            <input
              type="date"
              value={dateFilters.hasta}
              onChange={(e) => {
                setDateFilters({...dateFilters, hasta: e.target.value});
                setCurrentPage(1); // Reset to first page when filtering
              }}
              className="px-2 py-1 text-xs border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
            />
          </div>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            disabled={userRole === 'usuario'}
            className="px-4 py-2 bg-gray-800 border border-violet-500/20 rounded-xl text-white hover:bg-gray-700 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {userRole === 'usuario' ? (
              // Usuario normal: solo ve su propio nombre
              <option value={currentUserId} className="bg-gray-800">
                {users.find(u => u.user_id === currentUserId)?.name || 'Mi usuario'}
              </option>
            ) : (
              // Admin y Supervisor: ven todos los usuarios
              <>
                <option value="all" className="bg-gray-800">Todos los usuarios</option>
                {users.map(u => (
                  <option key={u.user_id} value={u.user_id} className="bg-gray-800">{u.name}</option>
                ))}
              </>
            )}
          </select>
          {/* Export button removed from Lista de Gastos (hidden per request) */}
          <button
            onClick={() => {
              setDateFilters({desde: '', hasta: ''});
              setUserFilter('all');
              setCurrentPage(1);
            }}
            className="px-2 py-1 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
        
        {/* Información de filtros activos */}
  <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 w-full">
          📊 Página {currentPage} de {totalPages} - Mostrando {displayExpenses.length} de {filteredExpenses.length} gastos filtrados
        </div>
      </div>

      {displayExpenses.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No hay gastos registrados
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {onAdd ? 'Comienza agregando tu primer gasto' : 'No hay gastos para mostrar'}
          </p>
          {onAdd && (
            <button
              onClick={onAdd}
              className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl text-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Agregar Gasto</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile stacked cards - force mobile when `forceMobileView` is true */}
          {forceMobileView ? (
            <div className="w-full space-y-3">
              {displayExpenses.map((expense) => (
              <div key={expense.id} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(expense.expense_date).toLocaleDateString()}</div>
                      <div className="text-sm font-bold">{formatCurrency(expense.amount, expense.currency)}</div>
                    </div>
                    <div className="text-base font-semibold text-gray-900 dark:text-white mb-1">{expense.category}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-2 truncate">{expense.description}</div>
                    {expense.sigla ? (
                      <div className="text-xs text-gray-400">Forma de Pago: <span className="font-semibold text-gray-200">{expense.sigla}</span></div>
                    ) : null}
                    <div className="text-xs text-gray-500 dark:text-gray-400">{expense.user_name || 'N/A'}{expense.user_email ? <span className="block">{expense.user_email}</span> : null}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      expense.status === 'aprobado' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                      expense.status === 'rechazado' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    }`}>{expense.status === 'aprobado' ? 'Aprobado' : expense.status === 'rechazado' ? 'Rechazado' : 'Pendiente'}</span>
                      {expense.attachments && expense.attachments.length > 0 ? (
                      <img
                        src={expense.attachments[0].url || `/api/files/${expense.attachments[0].filename}`}
                        alt="adj"
                        className="w-8 h-8 object-cover rounded-md border cursor-zoom-in"
                        onMouseEnter={(e) => {
                          const rect = (e.target as HTMLElement).getBoundingClientRect();
                          setHoverPreview({ url: expense.attachments[0].url || `/api/files/${expense.attachments[0].filename}`, left: rect.right + 8, top: rect.top - 6 });
                        }}
                        onMouseMove={(e) => {
                          const rect = (e.target as HTMLElement).getBoundingClientRect();
                          setHoverPreview({ url: expense.attachments[0].url || `/api/files/${expense.attachments[0].filename}`, left: rect.right + 8, top: rect.top - 6 });
                        }}
                        onMouseLeave={() => setHoverPreview(null)}
                      />
                    ) : expense.receipt_photo_url ? (
                      <img src={`/api/files/${expense.receipt_photo_url}`} alt="recibo" className="w-8 h-8 object-cover rounded-md border" />
                    ) : (
                      <div className="w-8 h-8 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center"><Receipt className="w-4 h-4 text-gray-500" /></div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button onClick={() => onEdit(expense)} className="p-2 bg-indigo-600 text-white rounded-md"> <Edit3 className="w-4 h-4" /> </button>
                    <button onClick={() => onDelete(expense.id)} className="p-2 bg-red-500 text-white rounded-md"> <Trash2 className="w-4 h-4" /> </button>
                    {userRole !== 'usuario' && (
                      <>
                        <button onClick={() => handleApproveClick(expense.id)} className="p-2 bg-green-500 text-white rounded-md"> <CheckCircle className="w-4 h-4" /> </button>
                        <button onClick={() => handleRejectClick(expense.id)} className="p-2 bg-orange-500 text-white rounded-md"> <XCircle className="w-4 h-4" /> </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            </div>
          ) : (
            <div className="block lg:hidden w-full space-y-3">
              {displayExpenses.map((expense) => (
                <div key={expense.id} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-sm">
                  {/* same mobile card content (kept above) */}
                </div>
              ))}
            </div>
          )}

          {/* Desktop table (show from lg up) - hide entirely when forcing mobile view */}
          {!forceMobileView && (
            <div className="hidden lg:block overflow-x-auto w-full">
            <table className="w-full rounded-2xl border-2 border-purple-500 text-xs sm:text-sm shadow-lg bg-white dark:bg-gray-900">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-1 py-1 text-left text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Fecha</th>
                  <th className="px-1 py-1 text-left text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Categoría</th>
                  <th className="px-1 py-1 text-left text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Descripción</th>
                  <th className="px-1 py-1 text-left text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Cargado por</th>
                  <th className="px-1 py-1 text-right text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Monto</th>
                  <th className="px-1 py-1 text-center text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Moneda</th>
                  <th className="px-1 py-1 text-center text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Forma Pago</th>
                  <th className="px-1 py-1 text-center text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Estado</th>
                  <th className="px-1 py-1 text-center text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Archivos</th>
                  <th className="px-1 py-1 text-center text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {displayExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-1 py-2 whitespace-nowrap text-[11px] text-left">{new Date(expense.expense_date).toLocaleDateString()}</td>
                    <td className="px-1 py-2 whitespace-nowrap text-[11px] text-left">{expense.category}</td>
                    <td className="px-1 py-2 text-[11px] max-w-[90px] truncate text-left" title={expense.description}>{expense.description.length > 40 ? expense.description.slice(0, 37) + '...' : expense.description}</td>
                    <td className="px-1 py-2 whitespace-nowrap text-[11px] text-left">
                      <div>
                        <span className="font-medium">{expense.user_name || 'N/A'}</span>
                        <span className="block text-[10px] text-gray-500 dark:text-gray-400">{expense.user_email || ''}</span>
                      </div>
                    </td>
                    <td className="px-1 py-2 whitespace-nowrap text-[11px] text-right font-bold" style={{ color: expense.amount < 0 ? '#FF0000' : undefined }}>{formatCurrency(expense.amount, expense.currency)}</td>
                    <td className="px-1 py-2 whitespace-nowrap text-[11px] text-center">{expense.currency}</td>
                    <td className="px-1 py-2 whitespace-nowrap text-[11px] text-center">{expense.sigla || '-'}</td>
                    <td className="px-1 py-2 whitespace-nowrap text-[11px] text-center">
                      <div className="relative group flex justify-center items-center">
                        <span className={`px-1 py-0.5 text-[10px] font-semibold rounded-full ${getStatusBadgeClasses(expense.status as any)}`}>
                          {getStatusLabel(expense.status as any)}
                        </span>
                        {/* BubbleTooltipPortal para rechazo */}
                        {expense.status === 'rechazado' && expense.rejection_reason && (
                          <button
                            type="button"
                            aria-label="Ver motivo de rechazo"
                            className="ml-1 p-1 rounded-full bg-pink-100 hover:bg-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                            onMouseEnter={e => {
                              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                              setBubbleData({
                                x: rect.left + rect.width / 2,
                                y: rect.top - 40,
                                rejectionReason: expense.rejection_reason ?? '',
                                rejectedBy: expense.rejected_by ?? undefined,
                                rejectedAt: expense.rejected_at ? new Date(expense.rejected_at).toLocaleString('es-AR') : undefined
                              });
                              setBubbleVisible(true);
                              if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
                            }}
                            onMouseLeave={() => {
                              bubbleTimeoutRef.current = setTimeout(() => setBubbleVisible(false), 200);
                            }}
                          >
                            <span role="img" aria-label="burbuja" className="text-pink-500 text-lg">🫧</span>
                          </button>
                        )}
      {/* Render BubbleTooltipPortal globally */}
      {bubbleVisible && bubbleData && (
        <BubbleTooltipPortal
          visible={bubbleVisible}
          x={bubbleData.x}
          y={bubbleData.y}
          rejectionReason={bubbleData.rejectionReason}
          rejectedBy={bubbleData.rejectedBy}
          rejectedAt={bubbleData.rejectedAt}
        />
      )}
                      </div>
                    </td>
                    <td className="px-1 py-2 whitespace-nowrap text-[11px] text-center">
                      <div className="flex items-center justify-center gap-1 min-h-[40px]">
                        {/* Mostrar hasta 3 miniaturas */}
                        {expense.attachments && expense.attachments.length > 0 ? (
                          <>
                            {expense.attachments.slice(0, 3).map((attachment, index) => (
                              <a
                                key={index}
                                href={attachment.url || `/api/files/${attachment.filename}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block"
                              >
                                <img
                                  src={attachment.url || `/api/files/${attachment.filename}`}
                                  alt={attachment.originalName || "Archivo adjunto"}
                                  className="w-8 h-8 object-cover rounded border border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform cursor-zoom-in shadow-sm"
                                  onMouseEnter={(e) => {
                                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                                    setHoverPreview({ url: attachment.url || `/api/files/${attachment.filename}`, left: rect.right + 8, top: rect.top - 6 });
                                  }}
                                  onMouseMove={(e) => {
                                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                                    setHoverPreview({ url: attachment.url || `/api/files/${attachment.filename}`, left: rect.right + 8, top: rect.top - 6 });
                                  }}
                                  onMouseLeave={() => setHoverPreview(null)}
                                  onError={(e) => {
                                    console.error('Error loading attachment:', attachment.filename);
                                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='15' y1='9' x2='9' y2='15'/%3E%3Cline x1='9' y1='9' x2='15' y2='15'/%3E%3C/svg%3E";
                                    e.currentTarget.title = `Error cargando: ${attachment.filename}`;
                                  }}
                                />
                              </a>
                            ))}
                            {/* Si hay más de 3 archivos, mostrar botón +N */}
                            {expense.attachments.length > 3 && (
                              <button
                                type="button"
                                className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded border border-blue-300 ml-1 hover:bg-blue-200 transition"
                                onClick={() => setPreviewAttachments(expense.attachments)}
                                title={`Ver todos los archivos (${expense.attachments.length})`}
                              >
                                +{expense.attachments.length - 3}
                              </button>
                            )}
                          </>
                        ) : expense.receipt_photo_url ? (
                          /* Compatibilidad hacia atrás con receipt_photo_url */
                          <a
                            href={`/api/files/${expense.receipt_photo_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block"
                          >
                            <img
                              src={`/api/files/${expense.receipt_photo_url}`}
                              alt="Recibo"
                              className="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform cursor-zoom-in shadow-sm"
                              onMouseEnter={(e) => {
                                const rect = (e.target as HTMLElement).getBoundingClientRect();
                                setHoverPreview({ url: `/api/files/${expense.receipt_photo_url}`, left: rect.right + 8, top: rect.top - 6 });
                              }}
                              onMouseMove={(e) => {
                                const rect = (e.target as HTMLElement).getBoundingClientRect();
                                setHoverPreview({ url: `/api/files/${expense.receipt_photo_url}`, left: rect.right + 8, top: rect.top - 6 });
                              }}
                              onMouseLeave={() => setHoverPreview(null)}
                              onError={(e) => {
                                console.error('Error loading receipt image:', expense.receipt_photo_url);
                                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='15' y1='9' x2='9' y2='15'/%3E%3Cline x1='9' y1='9' x2='15' y2='15'/%3E%3C/svg%3E";
                                e.currentTarget.title = `Error cargando: ${expense.receipt_photo_url}`;
                              }}
                            />
                          </a>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <Receipt className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      {/* Modal de preview de adjuntos */}
                      {previewAttachments && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 max-w-lg w-full shadow-lg relative">
                            <button
                              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                              onClick={() => setPreviewAttachments(null)}
                              title="Cerrar"
                            >
                              &times;
                            </button>
                            <h3 className="text-lg font-semibold mb-2">Archivos adjuntos</h3>
                            <div className="flex flex-wrap gap-2 justify-center">
                              {previewAttachments.map((attachment, idx) => (
                                <a
                                  key={idx}
                                  href={attachment.url || `/api/files/${attachment.filename}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block"
                                >
                                  <img
                                    src={attachment.url || `/api/files/${attachment.filename}`}
                                    alt={attachment.originalName || "Archivo adjunto"}
                                    className="w-20 h-20 object-cover rounded border border-gray-200 dark:border-gray-600 shadow-sm"
                                    onError={(e) => {
                                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='15' y1='9' x2='9' y2='15'/%3E%3Cline x1='9' y1='9' x2='15' y2='15'/%3E%3C/svg%3E";
                                    }}
                                  />
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-right text-xs sm:text-sm font-medium gap-x-2">
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fadeIn w-full">
                        <button
                            onClick={() => onEdit(expense)}
                            className="group relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 hover:from-blue-600 hover:to-indigo-700 border-2 border-blue-300"
                            title="Editar gasto"
                            disabled={expense.status === 'aprobado'}
                        >
                          <Edit3 className="w-4 h-4" />
                          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                        </button>
                        <button
                            onClick={() => onDelete(expense.id)}
                            className="group relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 hover:from-red-600 hover:to-pink-700 border-2 border-red-300"
                            title="Eliminar gasto"
                            disabled={expense.status === 'aprobado'}
                        >
                          <Trash2 className="w-4 h-4" />
                          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                        </button>
                        {userRole !== 'usuario' && (
                          <>
                            <button
                                onClick={() => handleApproveClick(expense.id)}
                                className="group relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 hover:from-emerald-600 hover:to-green-700 border-2 border-green-300"
                                title="Aprobar gasto"
                                disabled={expense.status === 'aprobado'}
                            >
                              <CheckCircle className="w-4 h-4" />
                              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
                            </button>
                            <button
                                onClick={() => handleRejectClick(expense.id)}
                                className="group relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-red-500 text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 hover:from-yellow-500 hover:to-red-600 border-2 border-yellow-300"
                                title="Rechazar gasto"
                                disabled={expense.status === 'aprobado'}
                            >
                              <XCircle className="w-4 h-4" />
                              <div className="absolute inset-0 rounded-full border-2 border-red-300 opacity-0 group-hover:opacity-50 group-hover:animate-ping"></div>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
          
          {/* Controles de paginación */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-2 sm:px-6 py-2 sm:py-4 bg-black text-white border-t gap-y-2 rounded-xl shadow-lg mb-2">
              <div className="text-xs sm:text-sm text-white font-semibold">
                Mostrando {startIndex + 1} - {Math.min(startIndex + recordsPerPage, filteredExpenses.length)} de {filteredExpenses.length} gastos
              </div>
              <div className="flex items-center gap-x-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded text-sm font-bold shadow-lg"
                >
                  « Primera
                </button>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded text-sm font-bold shadow-lg"
                >
                  ‹ Anterior
                </button>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm font-bold">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded text-sm font-bold shadow-lg"
                >
                  Siguiente ›
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded text-sm font-bold shadow-lg"
                >
                  Última »
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Preview de Excel */}
      {showExportPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileSpreadsheet className="w-7 h-7" />
                  <div>
                    <h2 className="text-2xl font-bold">Vista Previa - Exportar a Excel</h2>
                    <p className="text-sm text-green-100 mt-1">
                      {filteredExpenses.length} {filteredExpenses.length === 1 ? 'gasto seleccionado' : 'gastos seleccionados'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowExportPreview(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-auto max-h-[60vh]">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Mostrando los primeros 5 registros de {filteredExpenses.length}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300">ID</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300">Usuario</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300">Descripción</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300">Monto</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300">Categoría</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300">Fecha</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredExpenses.slice(0, 10).map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{expense.id}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{expense.user_name || 'N/A'}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{expense.description}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{formatCurrency(expense.amount, expense.currency)}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{expense.category}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{new Date(expense.expense_date).toLocaleDateString('es-AR')}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClasses(expense.status as any)}`}>
                            {getStatusLabel(expense.status as any)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowExportPreview(false)}
                className="px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-colors border border-gray-300 dark:border-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={exportToExcel}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span>Descargar Excel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Razón de Rechazo */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="p-6 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <XCircle className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">Rechazar Gasto</h2>
                  <p className="text-sm text-red-100 mt-1">
                    Debes proporcionar una razón para el rechazo
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Razón del Rechazo <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ej: Falta comprobante, monto excesivo, categoría incorrecta..."
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white resize-none"
                rows={4}
                autoFocus
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Esta razón será visible para el usuario que creó el gasto.
              </p>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 rounded-b-2xl">
              <button
                onClick={handleRejectCancel}
                className="px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-colors border border-gray-300 dark:border-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectionReason.trim()}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <XCircle className="w-5 h-5" />
                <span>Confirmar Rechazo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notificación Flotante Animada */}
      {showNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          {notificationType === 'approve' ? (
            <>
              {/* Efecto de aprobación - Estrellas variadas */}
              <div className="absolute inset-0 overflow-hidden">
                {particleEmojis.map((emoji, i) => (
                  <div
                    key={i}
                    className="absolute text-4xl animate-float-up"
                    style={{
                      left: `${Math.random() * 100}%`,
                      bottom: '-10%',
                      animationDelay: `${Math.random() * 0.5}s`,
                      animationDuration: `${2 + Math.random() * 1}s`,
                    }}
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              
              <div className="relative pointer-events-auto animate-bounce-in">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl blur-xl opacity-75 animate-pulse"></div>
                <div className="relative flex items-center space-x-4 p-6 rounded-2xl shadow-2xl backdrop-blur-lg border-2 bg-gradient-to-r from-emerald-500/90 to-green-600/90 border-emerald-300">
                  <div className="text-8xl animate-bounce transform-gpu" style={{ textShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
                    {currentEmoji}
                  </div>
                  <div className="text-white">
                    <p className="text-2xl font-bold drop-shadow-lg">
                      ¡Gasto Aprobado!
                    </p>
                    <p className="text-sm opacity-90">
                      El gasto ha sido aprobado exitosamente
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Efecto de rechazo - Rayos con colores aleatorios */}
              <div className="absolute inset-0 overflow-hidden">
                {particleColors.map((color, i) => (
                  <div
                    key={i}
                    className="absolute h-2 opacity-40 animate-lightning"
                    style={{
                      width: '150%',
                      left: '-25%',
                      top: `${10 + i * 15}%`,
                      background: `linear-gradient(to right, transparent, ${color}, transparent)`,
                      animationDelay: `${i * 0.1}s`,
                      transform: `rotate(${-5 + Math.random() * 10}deg)`,
                    }}
                  />
                ))}
              </div>

              <div className="relative pointer-events-auto animate-shake-intense">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl blur-xl opacity-75 animate-pulse"></div>
                <div className="relative flex items-center space-x-4 p-6 rounded-2xl shadow-2xl backdrop-blur-lg border-2 bg-gradient-to-r from-red-500/90 to-rose-600/90 border-red-300">
                  <div className="text-8xl animate-shake transform-gpu" style={{ textShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
                    {currentEmoji}
                  </div>
                  <div className="text-white">
                    <p className="text-2xl font-bold drop-shadow-lg">
                      Gasto Rechazado
                    </p>
                    <p className="text-sm opacity-90">
                      El gasto ha sido rechazado con razón
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}