import { Plus, Trash2, Receipt, Edit3, CheckCircle, XCircle, Sparkles, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
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
}: ExpensesTableProps) {
  // Estado para el modal de preview de adjuntos
  const [previewAttachments, setPreviewAttachments] = useState<Array<{url?: string, filename: string, originalName?: string}> | null>(null);
  // Estado para hover preview de adjuntos
  const [hoverPreview, setHoverPreview] = useState<{ url: string; left: number; top: number } | null>(null);
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
    };
    
    const locale = currencyMap[currency] || "es-AR";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  };

  // Función exportar Excel
  const exportToExcel = () => {
    const excelData = filteredExpenses.map(expense => ({
      'ID': expense.id,
      'Usuario': expense.user_name || 'N/A',
      'Descripción': expense.description,
      'Monto': expense.amount,
      'Moneda': expense.currency,
      'Categoría': expense.category,
      'Fecha': new Date(expense.expense_date).toLocaleDateString('es-AR'),
      'Creado': new Date(expense.created_at).toLocaleDateString('es-AR'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const colWidths = [
      { wch: 8 }, { wch: 25 }, { wch: 40 }, { wch: 15 }, { wch: 10 },
      { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 15 },
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Gastos');

    const date = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');
    XLSX.writeFile(workbook, `gastos_${date}.xlsx`);
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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        {/* Botones de filtro de estado en el lugar del título */}
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer bg-blue-600 rounded-lg px-4 py-2 shadow text-white">
            <input
              type="checkbox"
              checked={filters.pendientes}
              onChange={(e) => {
                setFilters({...filters, pendientes: e.target.checked});
                setCurrentPage(1);
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-bold">🟡 Pendientes ({expenses.filter(e => e.status === 'pendiente').length})</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer bg-green-600 rounded-lg px-4 py-2 shadow text-white">
            <input
              type="checkbox"
              checked={filters.aprobados}
              onChange={(e) => {
                setFilters({...filters, aprobados: e.target.checked});
                setCurrentPage(1);
              }}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm font-bold">🟢 Aprobados ({expenses.filter(e => e.status === 'aprobado').length})</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer bg-orange-500 rounded-lg px-4 py-2 shadow text-white">
            <input
              type="checkbox"
              checked={filters.rechazados}
              onChange={(e) => {
                setFilters({...filters, rechazados: e.target.checked});
                setCurrentPage(1);
              }}
              className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm font-bold">🔴 Rechazados ({expenses.filter(e => e.status === 'rechazado').length})</span>
          </label>
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

      {/* Filtros por fecha */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-4">
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
          {/* Botón Exportar Excel oculto por requerimiento */}
          <button
            style={{ display: 'none' }}
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setShowExportPreview(true)}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span>Exportar Excel</span>
          </button>
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
        
        {/* Balances eliminados de la grilla de gastos por requerimiento */}
        {/* Información de filtros activos */}
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
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
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Agregar Gasto</span>
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
              <thead className="bg-gray-100 dark:bg-gray-900">
                <tr>
                  <th className="px-2 py-1 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                  <th className="px-2 py-1 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Categoría</th>
                  <th className="px-2 py-1 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Descripción</th>
                  <th className="px-2 py-1 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Cargado por</th>
                  <th className="px-2 py-1 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Monto</th>
                  <th className="px-2 py-1 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Moneda</th>
                  <th className="px-2 py-1 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Forma de Pago</th>
                  <th className="px-2 py-1 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                  <th className="px-2 py-1 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Afecta Saldo</th>
                  <th className="px-2 py-1 text-center font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Archivos</th>
                  <th className="px-2 py-1 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {displayExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="px-1 py-2 whitespace-nowrap text-[11px] text-left">{new Date(expense.expense_date + 'T00:00:00').toLocaleDateString('es-AR')}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-xs">{expense.category}</td>
                    <td className="px-2 py-1 text-xs">{expense.description}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-xs"><div><div className="font-medium">{expense.user_name || 'N/A'}</div><div className="text-xs text-gray-500 dark:text-gray-400">{expense.user_email || ''}</div></div></td>
                    <td className="px-2 py-1 whitespace-nowrap text-xs">{expense.amount}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-xs">{expense.currency}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-xs">{expense.sigla || '-'}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-xs font-bold">
                      {expense.status === 'rechazado' ? (
                        <span className="relative group text-lg text-red-500 font-bold cursor-pointer">
                          ❌
                          {expense.rejection_reason && (
                            <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max bg-red-700 text-white text-xs rounded px-3 py-2 shadow-lg z-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-normal min-w-[120px] text-center">
                              {expense.rejection_reason}
                            </span>
                          )}
                        </span>
                      ) : (
                        <>
                          {expense.status === 'aprobado' && (
                            <span className="text-lg">✅</span>
                          )}
                          {String(expense.status) === 'rechazado' && (
                            <span className="text-lg text-red-500">❌</span>
                          )}
                          {expense.status === 'pendiente' && (
                            <span className="text-lg text-blue-500">⏳</span>
                          )}
                        </>
                      )}
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-xs font-bold">
                      {expense.use_balance ? <span className="px-2 py-1 rounded bg-emerald-600 text-white text-xs">Sí</span> : <span className="px-2 py-1 rounded bg-gray-400 text-white text-xs">No</span>}
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1 min-h-[40px]">
                        {/* Mostrar hasta 3 miniaturas */}
                        {expense.attachments && expense.attachments.length > 0 ? (
                          <>
                            {expense.attachments.slice(0, 3).map((attachment, index) => (
                              <span key={index} style={{ position: 'relative', display: 'inline-block' }}>
                                <button
                                  type="button"
                                  className="inline-block"
                                  onClick={() => setPreviewAttachments([attachment])}
                                  title="Zoom"
                                  onMouseEnter={e => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setHoverPreview({ url: attachment.url || `/api/files/${attachment.filename}`, left: rect.left, top: rect.bottom });
                                  }}
                                  onMouseLeave={() => setHoverPreview(null)}
                                >
                                  <img
                                    src={attachment.url || `/api/files/${attachment.filename}`}
                                    alt={attachment.originalName || "Archivo adjunto"}
                                    className="w-8 h-8 object-cover rounded border border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform cursor-pointer shadow-sm"
                                    onError={(e) => {
                                      console.error('Error loading attachment:', attachment.filename);
                                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='15' y1='9' x2='9' y2='15'/%3E%3Cline x1='9' y1='9' x2='15' y2='15'/%3E%3C/svg%3E";
                                      e.currentTarget.title = `Error cargando: ${attachment.filename}`;
                                    }}
                                  />
                                </button>
                                {/* Hover preview */}
                                {hoverPreview && hoverPreview.url === (attachment.url || `/api/files/${attachment.filename}`) && (
                                  <div style={{
                                    position: 'fixed',
                                    left: hoverPreview.left,
                                    top: hoverPreview.top + 8,
                                    zIndex: 9999,
                                    background: '#222',
                                    padding: 4,
                                    borderRadius: 8,
                                    boxShadow: '0 2px 12px #000',
                                  }}>
                                    <img
                                      src={hoverPreview.url}
                                      alt="Vista previa adjunto"
                                      style={{ width: 180, height: 180, objectFit: 'contain', borderRadius: 6, background: '#fff' }}
                                    />
                                  </div>
                                )}
                              </span>
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
                          <button
                            type="button"
                            className="inline-block"
                            onClick={() => setPreviewAttachments([{ url: `/api/files/${expense.receipt_photo_url}`, filename: expense.receipt_photo_url || '', originalName: 'Recibo' }])}
                            title="Zoom"
                          >
                            <img
                              src={`/api/files/${expense.receipt_photo_url}`}
                              alt="Recibo"
                              className="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform cursor-pointer shadow-sm"
                              onError={(e) => {
                                console.error('Error loading receipt image:', expense.receipt_photo_url);
                                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='15' y1='9' x2='9' y2='15'/%3E%3Cline x1='9' y1='9' x2='15' y2='15'/%3E%3C/svg%3E";
                                e.currentTarget.title = `Error cargando: ${expense.receipt_photo_url}`;
                              }}
                            />
                          </button>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <Receipt className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      {/* Modal de preview de adjuntos */}
                      {previewAttachments && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={() => setPreviewAttachments(null)}>
                          <button
                            className="absolute top-8 right-8 text-white bg-black bg-opacity-80 rounded-full w-10 h-10 flex items-center justify-center text-2xl z-10"
                            onClick={(e) => { e.stopPropagation(); setPreviewAttachments(null); }}
                            title="Cerrar"
                          >
                            &times;
                          </button>
                          {previewAttachments.length === 1 ? (
                            <img
                              key={0}
                              src={previewAttachments[0].url || `/api/files/${previewAttachments[0].filename}`}
                              alt={previewAttachments[0].originalName || "Archivo adjunto"}
                              className="object-contain rounded shadow-lg"
                              style={{ maxHeight: '90vh', maxWidth: '90vw', margin: '0 auto', display: 'block', background: '#fff', padding: '24px' }}
                              onClick={(e) => e.stopPropagation()}
                              onError={(e) => {
                                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='15' y1='9' x2='9' y2='15'/%3E%3Cline x1='9' y1='9' x2='15' y2='15'/%3E%3C/svg%3E";
                              }}
                            />
                          ) : (
                            previewAttachments.map((attachment, idx) => (
                              <img
                                key={idx}
                                src={attachment.url || `/api/files/${attachment.filename}`}
                                alt={attachment.originalName || "Archivo adjunto"}
                                className="object-contain rounded shadow-lg"
                                style={{ maxHeight: '400px', maxWidth: '400px', margin: '0 auto', display: 'block', background: '#fff', padding: '8px' }}
                                onClick={(e) => e.stopPropagation()}
                                onError={(e) => {
                                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='15' y1='9' x2='9' y2='15'/%3E%3Cline x1='9' y1='9' x2='15' y2='15'/%3E%3C/svg%3E";
                                }}
                              />
                            ))
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-right text-xs font-medium space-x-2">
                      <div className="flex items-center justify-end gap-2 animate-fadeIn">
                          <button
                            onClick={() => onEdit(expense)}
                            className="group relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 hover:from-blue-600 hover:to-indigo-700 border-2 border-blue-300"
                            title="Editar gasto"
                          >
                            <Edit3 className="w-4 h-4" />
                            <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                          </button>
                          <button
                            onClick={() => onDelete(expense.id)}
                            className="group relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 hover:from-red-600 hover:to-pink-700 border-2 border-red-300"
                            title="Eliminar gasto"
                          >
                            <Trash2 className="w-4 h-4" />
                            <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                          </button>
                          {/* Solo mostrar aprobar/rechazar si el rol NO es usuario y el gasto está pendiente */}
                          {userRole !== 'usuario' && expense.status === 'pendiente' && (
                            <>
                              <button
                                onClick={() => handleApproveClick(expense.id)}
                                className="group relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 hover:from-emerald-600 hover:to-green-700 border-2 border-green-300"
                                title="Aprobar gasto"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
                              </button>
                              <button
                                onClick={() => handleRejectClick(expense.id)}
                                className="group relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-red-500 text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 hover:from-yellow-500 hover:to-red-600 border-2 border-yellow-300"
                                title="Rechazar gasto"
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
          
          {/* Controles de paginación */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 px-6 py-4" style={{background: '#111', color: '#fff', borderTop: '1px solid #222', borderRadius: '0 0 1rem 1rem'}}>
              <div className="text-sm font-semibold">
                Mostrando {startIndex + 1} - {Math.min(startIndex + recordsPerPage, filteredExpenses.length)} de {filteredExpenses.length} gastos
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  style={{background: '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '0.3em 0.8em'}}
                >
                  « Primera
                </button>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={{background: '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '0.3em 0.8em'}}
                >
                  ‹ Anterior
                </button>
                <span style={{background: '#222', color: '#fff', borderRadius: 4, padding: '0.3em 0.8em'}}>
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  style={{background: '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '0.3em 0.8em'}}
                >
                  Siguiente ›
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  style={{background: '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '0.3em 0.8em'}}
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
                Mostrando los primeros 10 registros de {filteredExpenses.length}
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