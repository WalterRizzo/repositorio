import { useEffect, useState } from 'react';
import type { UserProfile } from '@/shared/types';
import * as XLSX from 'xlsx';
import { useAuth } from '@/react-app/hooks/useAuth';
import Header from '@/react-app/components/Header';
import Sidebar from '@/react-app/components/Sidebar';
import TripHistoryModal from '@/react-app/components/TripHistoryModal';
import { Loader2 } from 'lucide-react';

import { formatBalance, isSpuriousPendingReembolso } from '@/react-app/utils/format';

type PreviewExpense = { id:number; amount?: number; expense_date?: string; description?: string; currency?: string; status?: string; sigla?: string; tipo_comprobante_id?: number };
type PreviewMovement = { id:number; monto?: number; tipo?: string; fecha_transaccion?: string; saldo_anterior?: number; saldo_nuevo?: number; descripcion?: string; currency?: string };

export default function CierreViajes() {
  const { user, isLoading: authLoading } = useAuth();

  // --- local UI state ---
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [previewing, setPreviewing] = useState(false);
  const [previewResult, setPreviewResult] = useState<{ expenses: PreviewExpense[]; movements: PreviewMovement[] } | null>(null);

  const [selectedExpenseIds, setSelectedExpenseIds] = useState<Set<number>>(new Set());
  const [selectedMovementIds, setSelectedMovementIds] = useState<Set<number>>(new Set());
  const [closing, setClosing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [totals, setTotals] = useState<{
    expensesByCurrency: Record<string, number>;
    movementsByCurrency: Record<string, number>;
    deltasByCurrency: Record<string, number>;
  }>({ expensesByCurrency: {}, movementsByCurrency: {}, deltasByCurrency: {} });

  // Pagination for movements preview (make it work like the Expenses pagination)
  const [movementPage, setMovementPage] = useState<number>(1);
  const movementRecordsPerPage = 5; // mirror expenses table behaviour

  useEffect(() => {
    // Fetch available users for the form select — small safe initial API call
    const loadUsers = async () => {
      try {
        const resp = await fetch('/api/users');
        if (!resp.ok) return setUsers([]);
        const data = await resp.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading users for cierre:', err);
        setUsers([]);
      }
    };
    loadUsers();
  }, [setUsers]);

  // Basic preview handler (keeps it safe & simple) — sets result and default selection sets
  const computeTotals = (expensesList: PreviewExpense[], movementsList: PreviewMovement[], expenseSet: Set<number>, movementSet: Set<number>) => {
    const selectedExpensesArr = expensesList.filter(e => expenseSet.size === 0 || expenseSet.has(e.id));
    const selectedMovementsArr = movementsList.filter(m => movementSet.size === 0 || movementSet.has(m.id));

    const expensesByCurrency: Record<string, number> = {};
    const movementsByCurrency: Record<string, number> = {};

    for (const e of selectedExpensesArr) {
      const cur = String(e.currency || 'ARS').toUpperCase();
      expensesByCurrency[cur] = (expensesByCurrency[cur] || 0) + Number(e.amount || 0);
    }

    for (const m of selectedMovementsArr) {
      const cur = String((m as any).currency || 'ARS').toUpperCase();
      const signed = (m.tipo === 'carga' ? 1 : -1) * Number(m.monto || 0);
      movementsByCurrency[cur] = (movementsByCurrency[cur] || 0) + signed;
    }

    const allCurrencies = new Set([...Object.keys(expensesByCurrency), ...Object.keys(movementsByCurrency)]);
    const deltasByCurrency: Record<string, number> = {};
    for (const c of Array.from(allCurrencies)) {
      deltasByCurrency[c] = (movementsByCurrency[c] || 0) - (expensesByCurrency[c] || 0);
    }

    return { expensesByCurrency, movementsByCurrency, deltasByCurrency };
  };

  const handlePreview = async () => {
    if (!selectedUserId || !dateFrom || !dateTo) return alert('Selecciona usuario, fecha desde y fecha hasta.');
    setPreviewing(true);
    try {
      const resp = await fetch(`/api/trips/preview?userId=${encodeURIComponent(selectedUserId)}&from=${encodeURIComponent(dateFrom)}&to=${encodeURIComponent(dateTo)}`, { credentials: 'include' });
      const data = await resp.json();
      if (!resp.ok) return alert(data?.error || 'Error previsualizando');
      // Filter out spurious pending 'Reembolso (pendiente) por eliminación' from preview
      const rawExpenses = Array.isArray(data.expenses) ? data.expenses : [];
      const rawMovements = Array.isArray(data.movements) ? data.movements : [];
      const filteredMovements = rawMovements.filter((m: any) => !isSpuriousPendingReembolso(m.descripcion || m.description));

      setPreviewResult({ expenses: rawExpenses, movements: filteredMovements });
      // default select all in preview (exclude removed movements)
      setSelectedExpenseIds(new Set(rawExpenses.map((e:PreviewExpense) => e.id)));
      setSelectedMovementIds(new Set(filteredMovements.map((m:PreviewMovement) => m.id)));

      // compute totals and delta (grouped by currency)
      const totals = computeTotals(rawExpenses, filteredMovements, new Set(rawExpenses.map((e:PreviewExpense) => e.id)), new Set(filteredMovements.map((m:PreviewMovement) => m.id)));
      setTotals(totals);
    } catch (err: unknown) {
      console.error('Preview failed', err);
      const msg = err instanceof Error ? err.message : (typeof err === 'object' && err && 'message' in err ? String((err as Record<string, unknown>).message) : String(err));
      alert('Error al previsualizar: ' + msg);
    } finally {
      setPreviewing(false);
    }
  };

  const toggleExpense = (id:number) => {
    const next = new Set(selectedExpenseIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedExpenseIds(next);
  };

  const toggleMovement = (id:number) => {
    const next = new Set(selectedMovementIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedMovementIds(next);
  };

  const handleClose = async (force = false) => {
    if (!previewResult) return alert('Primero realiza una previsualización');
    if (!selectedUserId) return alert('Selecciona un usuario válido');

    // require delta to be zero for each currency for normal close
    if (!force) {
      const deltas = totals.deltasByCurrency || {};
      const bad = Object.values(deltas).some(v => Math.abs(v || 0) > 0.0001);
      if (bad) {
        return alert('El delta entre movimientos y gastos NO es cero por moneda. Usá "Forzar cierre" si estás seguro de validarlo de todos modos.');
      }
    }

    const confirmed = confirm(force ? 'FORZAR cierre: esto moverá/archivará registros aunque las sumas no cuadren. Continuar?' : '¿Confirmas cerrar (validar) el período seleccionado?');
    if (!confirmed) return;

    setClosing(true);
    try {
      const payload = {
        userId: selectedUserId,
        from: dateFrom,
        to: dateTo,
        expenseIds: Array.from(selectedExpenseIds),
        movementIds: Array.from(selectedMovementIds),
        force
      };

      const resp = await fetch('/api/trips/close', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await resp.json();
      if (!resp.ok) return alert(data?.error || 'Error al cerrar el viaje');

      alert(`Cierre realizado correctamente — tripId: ${data.tripId} (movedExpenses: ${data.movedExpenses}, movedMovements: ${data.movedMovements})`);

      // reset preview + selections
      setPreviewResult(null);
      setSelectedExpenseIds(new Set());
      setSelectedMovementIds(new Set());
      setTotals({ expensesByCurrency: {}, movementsByCurrency: {}, deltasByCurrency: {} });
    } catch (err: unknown) {
      console.error('Error closing trip:', err);
      const msg = err instanceof Error ? err.message : (typeof err === 'object' && err && 'message' in err ? String((err as Record<string, unknown>).message) : String(err));
      alert('Error al cerrar el viaje: ' + msg);
    } finally {
      setClosing(false);
    }
  };

  // (totals updated via effect below)

  // update totals when selection changes
  useEffect(() => {
    if (!previewResult) return;
    const t = computeTotals(previewResult.expenses || [], previewResult.movements || [], selectedExpenseIds, selectedMovementIds);
    setTotals(t);
    // reset movement pagination whenever preview results or selection change
    setMovementPage(1);
  }, [selectedExpenseIds, selectedMovementIds, previewResult]);

  // Derived movement pagination variables (used by UI below)
  const _filteredAllMovements: PreviewMovement[] = (previewResult?.movements || []).filter((m:PreviewMovement) => !isSpuriousPendingReembolso((m as any).descripcion || (m as any).description));
  const movementTotalMovements = _filteredAllMovements.length;
  const movementTotalPages = Math.max(1, Math.ceil(movementTotalMovements / movementRecordsPerPage));
  const movementStartIndex = (movementPage - 1) * movementRecordsPerPage;
  const movementDisplay = _filteredAllMovements.slice(movementStartIndex, movementStartIndex + movementRecordsPerPage);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin"><Loader2 className="w-10 h-10 text-indigo-600"/></div>
      </div>
    );
  }

  if (user.role !== 'admin' && user.role !== 'supervisor') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Sidebar />
        <div className="flex-1 p-12">
          <Header userProfile={user} />
          <div className="max-w-3xl mx-auto text-center py-20 border rounded-xl bg-gradient-to-br from-white/5 to-white/2 border-white/5">
            <h2 className="text-2xl font-bold text-white">Acceso denegado</h2>
            <p className="text-sm text-gray-300 mt-3">Esta sección está únicamente disponible para administradores y supervisores.</p>
          </div>
        </div>
      </div>
    );
  }

  // Admin / Supervisor view (placeholder)
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      <Sidebar />
      <div className="flex-1 w-full">
        <Header userProfile={user} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-bold text-white mb-4">Cierre de viajes</h1>
          <p className="text-gray-300 mb-6">Área de cierre de viajes y conciliación. Aquí se gestionarán cierres cerrados en tablas separadas (expenses_cierre, saldo_transacciones_cierre).</p>

          <div className="bg-gradient-to-br from-gray-900/50 to-slate-900/40 p-6 rounded-2xl border border-violet-700/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="text-xs text-gray-400">Usuario</label>
                <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-xl bg-black text-white border border-white/10">
                  <option value="">-- Seleccionar usuario --</option>
                  {users.map(u => (<option key={u.user_id} value={u.user_id}>{u.name}</option>))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400">Desde</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-xl bg-black text-white border border-white/10" />
              </div>

              <div>
                <label className="text-xs text-gray-400">Hasta</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-xl bg-black text-white border border-white/10" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-4">
              <button onClick={() => setShowHistory(true)} disabled={!selectedUserId} title={!selectedUserId ? 'Selecciona un usuario primero' : 'Ver histórico'} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold disabled:opacity-50">Ver Histórico</button>
              <button onClick={handlePreview} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold">Previsualizar</button>
              <button onClick={() => { setSelectedUserId(''); setDateFrom(''); setDateTo(''); }} className="px-4 py-2 bg-black border border-white/10 text-white rounded-xl">Limpiar</button>
            </div>

            {previewing && <div className="mt-4 text-sm text-gray-300">Cargando resultados...</div>}

            {showHistory && selectedUserId && (
              <TripHistoryModal userId={selectedUserId} onClose={() => setShowHistory(false)} />
            )}

            {/* Always render the two preview cards (will show placeholders when there's no preview) */}
            <div className="mt-6 space-y-6">
                {/* Expenses card (full width) */}
                <div className="w-full rounded-3xl p-1 bg-gradient-to-r from-indigo-900 via-violet-900 to-purple-700 shadow-lg grid-glow-container app-table-container">
                  <div className="bg-black/60 rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">Gastos</h3>
                      <div className="text-sm text-gray-300">{(previewResult?.expenses?.length ?? 0)} items — {selectedExpenseIds.size} seleccionados</div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full rounded-2xl border-2 border-purple-500 text-xs sm:text-sm shadow-lg bg-white dark:bg-gray-900 table-auto table-gradient-stripe table-condensed app-table">
                        <thead className="bg-gray-50 dark:bg-gray-700 table-header-neon">
                          <tr className="text-xs text-gray-400 uppercase tracking-wide">
                              <th className="pl-3 pr-2 py-1"></th>
                              <th className="py-1">Fecha</th>
                              <th className="py-1">Descripción</th>
                              <th className="py-1">Monto</th>
                              <th className="py-1">Moneda</th>
                              <th className="py-1">Estado</th>
                              <th className="py-1">Forma de Pago</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewResult ? previewResult.expenses.map((ex:PreviewExpense, idx) => (
                            <tr key={ex.id} className="border-t border-white/5 hover:bg-white/5 transition-colors table-row-glow row-neon-left row-fade-in" style={{ animationDelay: `${idx * 40}ms` }}>
                              <td className="px-2 py-1"><input type="checkbox" checked={selectedExpenseIds.has(ex.id)} onChange={() => toggleExpense(ex.id)} className="w-4 h-4"/></td>
                              <td className="px-2 py-1 text-gray-200">{ex.expense_date}</td>
                              <td className="px-2 py-1 text-white font-medium">{ex.description}</td>
                              <td className="px-2 py-1 text-white font-semibold">{Number(ex.amount).toLocaleString()}</td>
                              <td className="px-2 py-1 text-violet-200">{ex.currency}</td>
                              <td className="px-2 py-1 text-sm font-semibold text-gray-300">{ex.status || '-'}</td>
                              <td className="px-2 py-1 text-sm text-gray-200">{ex.sigla || '-'}</td>
                            </tr>
                          )) : (
                            <tr className="border-t border-white/5 hover:bg-white/5 transition-colors">
                              <td colSpan={7} className="px-4 py-3 text-center text-sm text-gray-400">
                                <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
                                  <div>No hay gastos en la previsualización — usa <strong>Previsualizar</strong> para cargar datos</div>
                                  <div>
                                    <button onClick={handlePreview} disabled={!selectedUserId || !dateFrom || !dateTo || previewing} title={!selectedUserId || !dateFrom || !dateTo ? 'Selecciona usuario y rango de fechas' : 'Previsualizar'} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold disabled:opacity-50">Previsualizar</button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Movements card */}
                <div className="w-full rounded-3xl p-1 bg-gradient-to-r from-cyan-900 via-teal-800 to-emerald-700 shadow-lg grid-glow-container app-table-container">
                  <div className="bg-black/60 rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">Movimientos de saldo</h3>
                      <div className="text-sm text-gray-300">{(previewResult?.movements?.length ?? 0)} items — {selectedMovementIds.size} seleccionados</div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full rounded-2xl border-2 border-purple-500 text-xs sm:text-sm shadow-lg bg-white dark:bg-gray-900 table-auto table-gradient-stripe table-condensed app-table">
                        <thead className="bg-gray-50 dark:bg-gray-700 table-header-neon">
                          <tr className="text-xs text-gray-400 uppercase tracking-wide">
                            <th className="pl-3 pr-2 py-1"></th>
                            <th className="py-1">Fecha</th>
                            <th className="py-1">Tipo</th>
                            <th className="py-1">Monto</th>
                            <th className="py-1">Moneda</th>
                            <th className="py-1">Saldo Antes</th>
                            <th className="py-1">Saldo Nuevo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewResult ? (
                            movementDisplay.map((m:PreviewMovement, idx) => (
                              <tr key={m.id} className="border-t border-white/5 hover:bg-white/5 transition-colors table-row-glow row-neon-left row-fade-in" style={{ animationDelay: `${idx * 40}ms` }}>
                                <td className="px-2 py-1"><input type="checkbox" checked={selectedMovementIds.has(m.id)} onChange={() => toggleMovement(m.id)} className="w-4 h-4"/></td>
                                <td className="px-2 py-1 text-gray-200">{m.fecha_transaccion ? new Date(m.fecha_transaccion).toLocaleString() : '-'}</td>
                                <td className="px-2 py-1 text-gray-200">{m.tipo}</td>
                                <td className={`px-2 py-1 ${m.tipo === 'carga' ? 'text-emerald-300' : 'text-rose-300'} font-semibold`}>{(m.tipo === 'carga' ? '+' : '-')}{formatBalance(m.monto, (m as any).currency)}</td>
                                <td className="px-2 py-1 text-violet-200">{(m as any).currency || 'ARS'}</td>
                                <td className="px-2 py-1 text-gray-200">{formatBalance(m.saldo_anterior, (m as any).currency)}</td>
                                <td className="px-2 py-1 text-gray-200">{formatBalance(m.saldo_nuevo, (m as any).currency)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr className="border-t border-white/5 hover:bg-white/5 transition-colors">
                              <td colSpan={7} className="px-4 py-3 text-center text-sm text-gray-400">
                                <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
                                  <div>No hay movimientos de saldo en la previsualización — usa <strong>Previsualizar</strong> para cargar datos</div>
                                  <div>
                                    <button onClick={handlePreview} disabled={!selectedUserId || !dateFrom || !dateTo || previewing} title={!selectedUserId || !dateFrom || !dateTo ? 'Selecciona usuario y rango de fechas' : 'Previsualizar'} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold disabled:opacity-50">Previsualizar</button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>

                      {/* Pagination for movements preview (rendered outside the table) */}
                      {movementTotalPages > 1 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-2 sm:px-6 py-2 sm:py-4 bg-black text-white border-t gap-y-2 rounded-xl shadow-lg mb-2 pager-shimmer">
                          <div className="text-xs sm:text-sm text-white font-semibold">
                            Mostrando {movementStartIndex + 1} - {Math.min(movementStartIndex + movementRecordsPerPage, movementTotalMovements)} de {movementTotalMovements} movimientos
                          </div>
                          <div className="flex items-center gap-x-2">
                            <button
                              onClick={() => setMovementPage(1)}
                              disabled={movementPage === 1}
                              className="px-3 py-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded text-sm font-bold shadow-lg"
                            >
                              « Primera
                            </button>
                            <button
                              onClick={() => setMovementPage(Math.max(1, movementPage - 1))}
                              disabled={movementPage === 1}
                              className="px-3 py-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded text-sm font-bold shadow-lg"
                            >
                              ‹ Anterior
                            </button>
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm font-bold">
                              Página {movementPage} de {movementTotalPages}
                            </span>
                            <button
                              onClick={() => setMovementPage(Math.min(movementTotalPages, movementPage + 1))}
                              disabled={movementPage === movementTotalPages}
                              className="px-3 py-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded text-sm font-bold shadow-lg"
                            >
                              Siguiente ›
                            </button>
                            <button
                              onClick={() => setMovementPage(movementTotalPages)}
                              disabled={movementPage === movementTotalPages}
                              className="px-3 py-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded text-sm font-bold shadow-lg"
                            >
                              Última »
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="text-sm text-gray-300 mb-3 md:mb-0">
                    {Object.keys(totals.deltasByCurrency).length === 0 ? (
                      <div className="text-xs text-gray-500">Sin totales</div>
                    ) : (
                      <div className="space-y-1">
                        {Object.keys(totals.deltasByCurrency).map((cur) => (
                          <div key={cur} className="flex items-center space-x-3">
                            <div className="w-24 text-xs text-gray-400">{cur}</div>
                            <div className="text-sm">Gastos: <strong className="text-white">{(totals.expensesByCurrency[cur] || 0).toLocaleString()}</strong></div>
                            <div className="text-sm">Mov.: <strong className="text-white">{(totals.movementsByCurrency[cur] || 0).toLocaleString()}</strong></div>
                            <div className="text-sm">Delta: <strong className={`${Math.abs(totals.deltasByCurrency[cur] || 0) === 0 ? 'text-emerald-300' : 'text-rose-400'}`}>{(totals.deltasByCurrency[cur] || 0).toLocaleString()}</strong></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                        <div className="flex items-center space-x-3">
                          <button onClick={async () => await handleClose(false)} disabled={closing} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-xl text-white font-semibold disabled:opacity-50">Cerrar (validar)</button>
                          <button onClick={async () => await handleClose(true)} disabled={closing} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white font-semibold disabled:opacity-50">Forzar cierre</button>
                        </div>

                    <div>
                    <button onClick={() => {
                        // Export selected (or all if none selected)
                        if (!previewResult) return alert('No hay datos para exportar');
                        const expenses = (previewResult.expenses || []).filter((e:PreviewExpense) => selectedExpenseIds.size === 0 || selectedExpenseIds.has(e.id)).map((e:PreviewExpense) => ({ Fecha: e.expense_date, Descripcion: e.description, Monto: Number(e.amount), Moneda: e.currency, Estado: e.status || '-', 'Forma de Pago': e.sigla || '-', 'ID Original': e.id }));
                        const movements = (previewResult.movements || []).filter((m:PreviewMovement) => selectedMovementIds.size === 0 || selectedMovementIds.has(m.id)).map((m:PreviewMovement) => ({ Fecha: new Date(String(m.fecha_transaccion)).toLocaleString(), Tipo: m.tipo, Monto: Number(m.monto), Moneda: (m as any).currency || 'ARS', 'Saldo Antes': Number(m.saldo_anterior || 0), 'Saldo Nuevo': Number(m.saldo_nuevo || 0), Descripcion: m.descripcion || '', 'ID Original': m.id }));

                        const wb = XLSX.utils.book_new();
                        const ws1 = XLSX.utils.json_to_sheet(expenses);
                        XLSX.utils.book_append_sheet(wb, ws1, 'Gastos');
                        const ws2 = XLSX.utils.json_to_sheet(movements);
                        XLSX.utils.book_append_sheet(wb, ws2, 'Movimientos');

                        const suffix = `${selectedUserId || 'all'}-${dateFrom || 'from'}-${dateTo || 'to'}`.replace(/\//g, '-');
                        XLSX.writeFile(wb, `cierre_${suffix}.xlsx`);
                      }} className="px-4 py-2 bg-slate-800 border border-white/5 text-white rounded-xl hover:bg-slate-700">Exportar a Excel</button>
                  </div>
                </div>
              </div>
          </div>

        </div>
      </div>
    </div>
  );
}
