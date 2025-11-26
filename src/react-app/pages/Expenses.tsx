// ...existing code...

  // ...existing code...

  // ...existing code...

  // ...existing code...

  // ...existing code...

  // ...existing code...

  // Resetear página de movimientos al cambiar filtros
  // Eliminado: paginación de movimientos
import { useEffect, useState } from "react";
import { useNotifications } from "@/react-app/hooks/useNotifications";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "@/react-app/hooks/useAuth";
  import { Loader2, Receipt, Users, Trash2, Database, Edit3, Sparkles, X, FileSpreadsheet, Wallet, Key } from "lucide-react";
import type { Expense, UserProfile } from "@/shared/types";
import ExpensesTable from "@/react-app/components/ExpensesTable";
import ExpenseForm from "@/react-app/components/ExpenseForm";
import Header from "@/react-app/components/Header";
import Sidebar from "@/react-app/components/Sidebar";
import { getRandomEmoji, getRandomEmojis } from '../../../epic-effects-library/effects/EmojiVariations';
import * as XLSX from 'xlsx';
import { formatBalance, isSpuriousPendingReembolso } from '@/react-app/utils/format';
import { parseDbTimestampToDate } from '@/react-app/utils/dates';
import { playRandomSound } from '../../../epic-effects-library/sounds/SoundVariations';
import { getColorSet } from '../../../epic-effects-library/effects/ColorVariations';

export default function Expenses() {
  const { showNotification, permission, isSupported } = useNotifications();
  const [dbaLoading, setDbaLoading] = useState(false);
  // Ejecutar consulta SQL en el panel DBA
  const executeDbaQuery = async (query?: string) => {
    const sql = (query !== undefined ? query : dbaQuery).trim();
    console.log('Ejecutando consulta SQL:', sql);
    setDbaLoading(true);
    if (!sql) {
      alert('Por favor, ingrese una consulta SQL');
      setDbaLoading(false);
      return;
    }
    setDbaResults(null);
    try {
      const response = await fetch('/api/dba/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sql }),
      });
      const result = await response.json();
      if (response.ok) {
        setDbaResults(result);
      } else {
        setDbaResults({ error: result.error || 'Error desconocido' });
      }
      setDbaLoading(false);
    } catch (error) {
      setDbaResults({ error: 'Error de conexión al servidor' });
      setDbaLoading(false);
    }
  };

  // Fetch data for cierre de viaje (closed tables)
  const fetchCierreData = async () => {
    setCierreError(null);
    setCierreLoading(true);
    setClosedExpenses(null);
    setClosedMovements(null);
    try {
      const resp1 = await fetch('/api/dba/execute', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: 'SELECT * FROM closed_expenses ORDER BY archived_at DESC LIMIT 500;' })
      });
      const data1 = await resp1.json().catch(() => ({ results: [] }));

      const resp2 = await fetch('/api/dba/execute', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: 'SELECT * FROM closed_saldo_transacciones ORDER BY archived_at DESC LIMIT 500;' })
      });
      const data2 = await resp2.json().catch(() => ({ results: [] }));

      if (!resp1.ok) throw new Error(data1.error || 'Error cargando closed_expenses');
      if (!resp2.ok) throw new Error(data2.error || 'Error cargando closed_saldo_transacciones');

      setClosedExpenses(Array.isArray(data1.results) ? data1.results : []);
      setClosedMovements(Array.isArray(data2.results) ? data2.results : []);
    } catch (err:any) {
      console.error('Error cargando datos Cierre de viaje:', err);
      setCierreError(err?.message || String(err));
    } finally {
      setCierreLoading(false);
    }
  };
  // ...existing code...
  const [auditPage, setAuditPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(10);

  // ...existing code...

  // ...existing code...

  // ...existing code...

  // ...existing code...

  // ...existing code...

  // ...existing code...

  // (MOVER ESTA LÓGICA ABAJO, justo antes del return)
  // Filtro de fecha para saldo_transacciones
  const [dateFilter, setDateFilter] = useState<{from: string, to: string}>({from: '', to: ''});
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'expenses' | 'users' | 'dba' | 'movements'>('expenses');
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'usuario' as 'usuario' | 'supervisor' | 'admin',
    balance: '',
    currency: 'ARS'
  });

  // Balance movements state
  const [balanceMovements, setBalanceMovements] = useState<any[]>([]);
  const [isLoadingMovements, setIsLoadingMovements] = useState(false);
  // Movements grid should only show 'carga' (loads). Disable other filters per UX requirement.
  const [movementsFilter] = useState<string>('carga'); // fixed to 'carga' (no UI control)
  const [movementsCurrency, setMovementsCurrency] = useState<string>('all'); // 'all' or currency codes like 'ARS', 'USD'
  const [userFilter, setUserFilter] = useState<string>('all'); // Filtro por usuario
  // footer per-users temporary states removed — using single movement filters under table

  // (no export helper here — keep export in UserManagement premium page)

  // Multi-currency balances state
  const [, setMultiBalances] = useState<Array<{ currency: string; balance: number }>>([]);
  // Balances modal state
  const [showBalancesModal, setShowBalancesModal] = useState(false);
  const [balancesLoading, setBalancesLoading] = useState(false);
  const [selectedUserBalances, setSelectedUserBalances] = useState<Array<{ currency: string; balance: number }>>([]);
  const [balancesModalUser, setBalancesModalUser] = useState<UserProfile | null>(null);
  // Load currencies from canonical server source to avoid hard-coded lists
  const [currenciesList, setCurrenciesList] = useState<Array<{ code: string; name?: string; symbol?: string }>>([]);

  // DBA state variables
  const [dbaQuery, setDbaQuery] = useState('');
  const [dbaResults, setDbaResults] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState('users');
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [dbaTables, setDbaTables] = useState<string[]>([]);

  // Cierre de viaje (closed tables) data
  const [closedExpenses, setClosedExpenses] = useState<any[] | null>(null);
  const [closedMovements, setClosedMovements] = useState<any[] | null>(null);
  const [cierreLoading, setCierreLoading] = useState(false);
  const [cierreError, setCierreError] = useState<string | null>(null);

  // Pagination state for users table
  const [usersPage, setUsersPage] = useState(1);
  // Pagination state for movements grid
  const [movementsPage, setMovementsPage] = useState(1);
  const recordsPerPage = 5;

  // derived filtered movements + pagination (fixes date filter not refreshing grid)
  const filteredMovements = balanceMovements
    .filter(m => movementsFilter === 'all' || m.type === movementsFilter)
    .filter(m => userFilter === 'all' || m.user_id === userFilter)
    .filter(m => movementsCurrency === 'all' || String(m.currency || '').toUpperCase() === String(movementsCurrency || '').toUpperCase())
    .filter(m => {
      if ((!dateFilter.from && !dateFilter.to)) return true;
      const date = (m.created_at || '').slice(0,10);
      if (dateFilter.from && date < dateFilter.from) return false;
      if (dateFilter.to && date > dateFilter.to) return false;
      return true;
    });

  // Hide spurious pending reembolso rows created by deletion flows
  // (they still exist in DB but must not be visible in admin UI)
  const filteredMovementsSanitized = filteredMovements.filter(m => !isSpuriousPendingReembolso(m.description || m.descripcion));

  const totalFiltered = filteredMovementsSanitized.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / recordsPerPage));
  const startIdx = (movementsPage - 1) * recordsPerPage;
  const pageItems = filteredMovementsSanitized.slice(startIdx, startIdx + recordsPerPage);

  // Ensure page reset when filters reduce results
  useEffect(() => {
    if (movementsPage > totalPages) setMovementsPage(1);
  }, [totalFiltered]);
  
  // Settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'my-password' | 'user-password' | 'create-user'>('my-password');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [userPasswordForm, setUserPasswordForm] = useState({
    userId: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Create user form state
  const [createUserForm, setCreateUserForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'usuario' as 'admin' | 'supervisor' | 'usuario'
  });

  // Excel export state
  // export preview removed: export will download directly

  // Balance notification state
  // ...existing code...

  // LÓGICA DE PAGINACIÓN MODERNA PARA AUDIT_LOGS (PROFESIONAL)
  // Colocar esto justo antes del return principal del componente
  let totalAuditRecords = 0;
  let totalAuditPages = 1;
  let auditStartIdx = 0;
  // Ejecutar consulta paginada cada vez que cambian página/tamaño
  useEffect(() => {
    if (selectedTable === 'audit_logs') {
      const offset = (auditPage - 1) * auditPageSize;
      const query = `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ${auditPageSize} OFFSET ${offset};`;
      executeDbaQuery(query);
    }
  }, [auditPage, auditPageSize, selectedTable]);
  const [showBalanceNotification, setShowBalanceNotification] = useState(false);
  const [currentMoneyEmoji, setCurrentMoneyEmoji] = useState('💰');
  const [moneyParticles, setMoneyParticles] = useState<string[]>([]);
  const [moneyColors, setMoneyColors] = useState<string[]>([]);
  // Estado para notificación de eliminación
  const [showDeleteNotification, setShowDeleteNotification] = useState(false);
  const [deleteEmoji, setDeleteEmoji] = useState('🗑️');

  // Función para reproducir sonido de dinero (ahora con variación aleatoria)
  const playMoneySound = () => {
    playRandomSound('money', 0.3);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Detectar hash en URL para cambiar pestaña
  useEffect(() => {
    console.log('🔥 Location hash changed:', location.hash);
    if (location.hash === '#users') {
      console.log('🔥 Setting tab to users');
      setActiveTab('users');
    } else if (location.hash === '#dba') {
      console.log('🔥 Setting tab to dba');
      setActiveTab('dba');
    } else {
      console.log('🔥 Setting tab to expenses');  
      setActiveTab('expenses');
    }
  }, [location.hash, location.pathname]);

  // Cargar tablas cuando se activa el tab DBA
  useEffect(() => {
    if (activeTab === 'dba' && dbaTables.length === 0) {
      fetchDbaTables();
    }
    // if DBA tab active and user selected cierre_viaje, preload its data
    if (activeTab === 'dba' && selectedTable === 'cierre_viaje') {
      fetchCierreData();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'dba' && selectedTable === 'cierre_viaje') {
      fetchCierreData();
    }
  }, [activeTab, selectedTable]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchExpenses();
      fetchMultiBalances();
      fetchCurrencies();
      if (userProfile?.role === 'admin' || userProfile?.role === 'supervisor') {
        fetchUsers();
      }
    }
  }, [user, userProfile?.role]);

  const fetchCurrencies = async () => {
    try {
      const resp = await fetch('/api/currencies');
      if (!resp.ok) return setCurrenciesList([]);
      const data = await resp.json();
      if (Array.isArray(data)) {
        setCurrenciesList(data.map((c:any) => ({ code: String(c.code).toUpperCase(), name: c.name, symbol: c.symbol })));
      }
    } catch (err) {
      console.error('Error loading currencies:', err);
      setCurrenciesList([]);
    }
  };

  const fetchUserProfile = async () => {
    try {
      console.log('🚀 FETCHING USER PROFILE...');
      const response = await fetch("/api/users/me");
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('� RAW API DATA:', JSON.stringify(data, null, 2));
      console.log('🎯 USER ROLE FROM API:', data.role);
      console.log('💰 USER BALANCE FROM API:', data.balance);
      
      setUserProfile(data);
    } catch (error) {
      console.error("❌ Error cargando perfil:", error);
      console.log('🔄 Using fallback user data from auth context');
      // Si hay error, usar los datos del usuario del contexto pero con rol admin forzado para testing
      const fallbackProfile = { ...user, role: 'admin', balance: 0 };
      console.log('🆘 FALLBACK PROFILE:', JSON.stringify(fallbackProfile, null, 2));
      setUserProfile(fallbackProfile);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await fetch("/api/expenses");
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error("Error cargando gastos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  const fetchMultiBalances = async () => {
    try {
      const response = await fetch("/api/users/me/balances");
      if (!response.ok) throw new Error("Error fetching balances");
      const data = await response.json();
      setMultiBalances(data.balances || []);
    } catch (error) {
      console.error("Error cargando saldos multimoneda:", error);
      setMultiBalances([]);
    }
  };

  

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDeleteExpense = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este gasto?")) return;

    try {
      const response = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      const result = await response.json();
      
      if (response.ok) {
        if (result.refunded && result.refunded > 0) {
          setDeleteEmoji('💸');
          setShowDeleteNotification(true);
          setTimeout(() => setShowDeleteNotification(false), 2500);
          await fetchUserProfile();
          await fetchMultiBalances();
        } else if (result.pending_refund && result.pending_refund > 0) {
          // Refund created as PENDING — do not assume balances were updated
          setDeleteEmoji('⏳');
          setShowDeleteNotification(true);
          setTimeout(() => setShowDeleteNotification(false), 2500);
          // notify others so they can show pending movement lists, but don't refresh balances
          try { window.dispatchEvent(new CustomEvent('data:changed', { detail: { source: 'expenses.delete.pending', id, pending_refund: result.pending_refund } })); } catch(e){}
        } else {
          setDeleteEmoji('🗑️');
          setShowDeleteNotification(true);
          setTimeout(() => setShowDeleteNotification(false), 2000);
        }
        await fetchExpenses();
        // notify other components that data changed (automatically refresh movements)
        try { window.dispatchEvent(new CustomEvent('data:changed', { detail: { source: 'expenses.delete', id } })); } catch(e){}
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error eliminando gasto:", error);
      alert("❌ Error al eliminar el gasto");
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingExpense(null);
    await fetchUserProfile();
    await fetchMultiBalances();
    await fetchExpenses();
    // Notify that data changed so movements and other lists refresh
    try { window.dispatchEvent(new CustomEvent('data:changed', { detail: { source: 'expenses.upsert' } })); } catch(e){}
  };

  const handleApprove = async (id: number) => {
    if (!confirm("¿Aprobar este gasto?")) return false;

    try {
      const resp = await fetch(`/api/expenses/${id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include'
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        const msg = err.error || `Error ${resp.status} al aprobar gasto`;
        console.error('Approve failed:', msg);
        alert(`❌ No se pudo aprobar: ${msg}`);
        return false;
      }

      await fetchExpenses();
      // Refresh user balances so the header and movements reflect the approved deduction
      await fetchUserProfile();
      await fetchMultiBalances();
      try { window.dispatchEvent(new CustomEvent('data:changed', { detail: { source: 'expenses.approve', id } })); } catch(e){}
      alert("Gasto aprobado exitosamente");
      return true;
    } catch (error) {
      console.error("Error aprobando gasto:", error);
      alert("Error al aprobar el gasto");
      return false;
    }
  };

  const handleReject = async (id: number, reason?: string) => {
    if (!confirm("¿Rechazar este gasto?")) return;
    // If caller provides a reason (e.g. child component modal), use it. Otherwise ask for one.
    const reasonProvided = (reason && reason.trim() !== '') ? reason.trim() : window.prompt('Por favor, indica la razón del rechazo (obligatorio):');
    if (!reasonProvided || reasonProvided.trim() === '') {
      alert('Debes proporcionar una razón para el rechazo.');
      return;
    }

    try {
      const resp = await fetch(`/api/expenses/${id}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason: reasonProvided.trim() })
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        const msg = err.error || `Error ${resp.status} al rechazar gasto`;
        console.error('Reject failed:', msg);
        alert(`❌ No se pudo rechazar: ${msg}`);
        return;
      }

      const data = await resp.json().catch(() => ({}));
      await fetchExpenses();
      try { window.dispatchEvent(new CustomEvent('data:changed', { detail: { source: 'expenses.reject', id, expense: data.expense } })); } catch(e){}
      alert("Gasto rechazado exitosamente");
      // Notificación push al usuario
      if (isSupported && permission === "granted") {
        showNotification(
          "🚫 Gasto Rechazado",
          {
            body: "Revisa la lista de gastos: uno o más han sido rechazados.",
            tag: "expense-rejected",
            data: { url: "/expenses" }
          }
        );
      }
      return true;
    } catch (error) {
      console.error("Error rechazando gasto:", error);
      alert("Error al rechazar el gasto");
      return false;
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  // Fetch balance movements
  const fetchBalanceMovements = async () => {
    setIsLoadingMovements(true);
    try {
      const response = await fetch('/api/balance/movements');
      if (response.ok) {
        const data = await response.json();
        setBalanceMovements(data.movements || []);
      } else {
        console.error('Error fetching movements');
      }
    } catch (error) {
      console.error('Error fetching balance movements:', error);
    } finally {
      setIsLoadingMovements(false);
    }
  };

  // Load movements when tab is active
  useEffect(() => {
    if ((activeTab === 'movements' || activeTab === 'users') && (userProfile?.role === 'admin' || userProfile?.role === 'supervisor')) {
      fetchBalanceMovements();
    }
    // listen for external changes in DB and refresh movements automatically
    const handler = () => {
      try {
        if ((activeTab === 'movements' || activeTab === 'users') && (userProfile?.role === 'admin' || userProfile?.role === 'supervisor')) {
          fetchBalanceMovements();
        }
      } catch (err) { console.error('data:changed handler error', err); }
    };
    window.addEventListener('data:changed', handler);
    return () => window.removeEventListener('data:changed', handler);
  }, [activeTab, userProfile?.role]);

  // Funciones de usuarios

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || isUpdatingUser) return;
    
    const newBalance = parseFloat(userForm.balance);
    if (isNaN(newBalance) || newBalance < 0) {
      alert("Por favor ingrese un saldo válido");
      return;
    }
    
    setIsUpdatingUser(true);
    try {
      const response = await fetch(`/api/users/${editingUser.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          balance: newBalance,
          currency: userForm.currency || 'ARS' // ENVIAR LA MONEDA SELECCIONADA
        }),
      });
      
      if (response.ok) {
        console.log('✅ User updated successfully, refreshing data...');
        
        // Actualizar datos localmente de forma más eficiente
        await Promise.all([fetchUsers(), fetchUserProfile()]);
        // notify other parts of the app (movements grid) to refresh
        try { window.dispatchEvent(new CustomEvent('data:changed', { detail: { source: 'users.update', userId: editingUser.user_id } })); } catch (e) { /* noop */ }
        
        // Reproducir sonido y mostrar notificación de dinero con emojis y colores aleatorios
        playMoneySound();
        setCurrentMoneyEmoji(getRandomEmoji('balance'));
        setMoneyParticles(getRandomEmojis('balance', 'particles', 25));
        setMoneyColors(getColorSet(8));
        setShowBalanceNotification(true);
        setTimeout(() => setShowBalanceNotification(false), 4000); // 4 segundos
        
        setShowUserModal(false);
        setEditingUser(null);
        resetUserForm();
        
        // Mensaje de éxito más amigable sin alert bloqueante
        console.log("🎉 Usuario actualizado exitosamente - Saldo actualizado!");
        
        // Si estamos editando nuestro propio usuario, mostrar mensaje especial
        if (editingUser.email === user?.email) {
          console.log('✨ Tu propio saldo ha sido actualizado exitosamente');
        }
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error actualizando usuario:", error);
      alert("Error al actualizar usuario");
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        await fetchUsers();
        alert("Usuario eliminado exitosamente");
      } else {
        alert("Error al eliminar usuario");
      }
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      alert("Error al eliminar usuario");
    }
  };

  const openUserModal = async (user: UserProfile) => {
    setEditingUser(user);
    
    // Obtener saldo ARS por defecto
    const defaultCurrency = 'ARS';
    const balanceForCurrency = await fetchUserBalanceByCurrency(user.user_id, defaultCurrency);
    
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role as 'usuario' | 'supervisor' | 'admin',
      balance: '', // ✅ Campo vacío para ingresar monto a cargar
      currency: defaultCurrency
    });
    
    // Actualizar editingUser con el saldo correcto
    setEditingUser({
      ...user,
      balance: balanceForCurrency
    });
    
    setShowUserModal(true);
  };

  // Fetch all balances for user and open balances modal
  const fetchUserBalancesAndOpen = async (user: UserProfile) => {
    try {
      setBalancesModalUser(user);
      setSelectedUserBalances([]);
      setShowBalancesModal(true);
      setBalancesLoading(true);

      const response = await fetch(`/api/users/${user.user_id}/saldos`, { credentials: 'include' });
      if (!response.ok) {
        const txt = await response.text();
        throw new Error(`Error fetching balances: ${response.status} ${txt}`);
      }
      const json = await response.json();
      if (json && json.saldos) {
        setSelectedUserBalances(Array.isArray(json.saldos) ? json.saldos : []);
      } else {
        setSelectedUserBalances([]);
      }
    } catch (err) {
      console.error('Error loading user balances:', err);
      alert('Error cargando saldos del usuario');
      setSelectedUserBalances([]);
    } finally {
      setBalancesLoading(false);
    }
  };
  
  // Nueva función para obtener saldo por moneda
  const fetchUserBalanceByCurrency = async (userId: string, currency: string): Promise<number> => {
    try {
      const response = await fetch(`/api/users/${userId}/balance/${currency}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        return data.balance || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return 0;
    }
  };

  const resetUserForm = () => {
    setUserForm({
      name: '',
      email: '',
      role: 'usuario',
      balance: '',
      currency: 'ARS'
    });
    setEditingUser(null);
  };
  
  // Funciones para cambio de contraseña
  const handleChangeMyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      
      if (response.ok) {
        alert('✅ Contraseña actualizada correctamente');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowSettingsModal(false);
      } else {
        const data = await response.json();
        alert(`❌ Error: ${data.error || 'No se pudo cambiar la contraseña'}`);
      }
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      alert('❌ Error al cambiar contraseña');
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  const handleChangeUserPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userPasswordForm.newPassword !== userPasswordForm.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    if (userPasswordForm.newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (!userPasswordForm.userId) {
      alert('Por favor, selecciona un usuario');
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      const response = await fetch(`/api/users/${userPasswordForm.userId}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          newPassword: userPasswordForm.newPassword
        })
      });
      
      if (response.ok) {
        alert('✅ Contraseña del usuario actualizada correctamente');
        setUserPasswordForm({ userId: '', newPassword: '', confirmPassword: '' });
      } else {
        const data = await response.json();
        alert(`❌ Error: ${data.error || 'No se pudo cambiar la contraseña'}`);
      }
    } catch (error) {
      console.error('Error cambiando contraseña de usuario:', error);
      alert('❌ Error al cambiar contraseña');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Función para crear nuevo usuario
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (createUserForm.password !== createUserForm.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    if (createUserForm.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (!createUserForm.email || !createUserForm.name) {
      alert('Por favor, completa todos los campos');
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: createUserForm.email,
          password: createUserForm.password,
          name: createUserForm.name,
          role: createUserForm.role
        })
      });
      
      if (response.ok) {
        alert('✅ Usuario creado exitosamente');
        setCreateUserForm({ email: '', password: '', confirmPassword: '', name: '', role: 'usuario' });
        setShowSettingsModal(false);
        await fetchUsers(); // Recargar lista de usuarios
      } else {
        const data = await response.json();
        alert(`❌ Error: ${data.error || 'No se pudo crear el usuario'}`);
      }
    } catch (error) {
      console.error('Error creando usuario:', error);
      alert('❌ Error al crear usuario');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Función para cargar todas las tablas de la BD
  const fetchDbaTables = async () => {
    try {
      const response = await fetch('/api/dba/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.results) {
        // Filtrar solo las tablas principales
  // Keep this list intentionally small to avoid clutter — but include formapago so admins can manage payment methods
  const mainTables = ['users', 'user_profiles', 'expenses', 'tipo_comprobantes', 'categories', 'currencies', 'formapago', 'balance_transactions', 'saldos', 'saldo_transacciones'];
        const tableNames = result.results
          .map((row: any) => row.name)
          .filter((name: string) => mainTables.includes(name));
        setDbaTables(tableNames);
        console.log('✅ Tablas principales cargadas:', tableNames);
      }
    } catch (error) {
      console.error('Error cargando tablas:', error);
      // Si falla, usar tablas por defecto
      setDbaTables(['users', 'expenses', 'tipo_comprobantes', 'categories']);
    }
  };


  // Función para exportar movimientos a Excel
  const exportToExcel = () => {
    const filteredMovements = balanceMovements
      .filter(m => movementsFilter === 'all' || m.type === movementsFilter)
      .filter(m => movementsCurrency === 'all' || String(m.currency || '').toUpperCase() === String(movementsCurrency || '').toUpperCase())
      .filter(m => userFilter === 'all' || m.user_id === userFilter)
      .filter(m => movementsCurrency === 'all' || String(m.currency || '').toUpperCase() === String(movementsCurrency || '').toUpperCase());

    // Remove spurious pending reembolso rows from exports as well
    const exportMovements = filteredMovements.filter(m => !isSpuriousPendingReembolso(m.description || m.descripcion));

    const excelData = exportMovements.map(movement => ({
      'Fecha': (() => {
        const d = parseDbTimestampToDate(movement.created_at);
        return d ? d.toLocaleString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
        }).replace(',', '') : movement.created_at;
      })(),
      'Usuario': movement.user_name,
      'Tipo': movement.type === 'carga' ? 'Carga' : movement.type === 'descuento' ? 'Gasto' : 'Ajuste',
      'Monto': `${movement.type === 'carga' ? '+' : ''}${movement.amount} ${movement.currency}`,
      'Saldo Anterior': `$${Number(movement.balance_before).toFixed(2)}`,
      'Saldo Nuevo': `$${Number(movement.balance_after).toFixed(2)}`,
      'Descripción': movement.description
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Movimientos');

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 20 }, // Fecha
      { wch: 20 }, // Usuario
      { wch: 10 }, // Tipo
      { wch: 15 }, // Monto
      { wch: 15 }, // Saldo Anterior
      { wch: 15 }, // Saldo Nuevo
      { wch: 40 }  // Descripción
    ];
    worksheet['!cols'] = colWidths;

    const fileName = `movimientos_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    // preview flow removed; keep this no-op for compatibility
  };

  // getFilteredMovementsCount is no longer used (preview removed)

  if (authLoading || !user || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin">
          <Loader2 className="w-10 h-10 text-indigo-600" />
        </div>
      </div>
    );
  }

  // pendingExpenses removed — counts computed inline where necessary

  return (
    <div className="expenses-page flex min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <Sidebar />
      {/* Notificación de eliminación de gasto */}
      {showDeleteNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="relative pointer-events-auto animate-bounce-in">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl blur-xl opacity-75 animate-pulse"></div>
            <div className="relative flex items-center space-x-4 p-6 rounded-2xl shadow-2xl backdrop-blur-lg border-2 bg-gradient-to-r from-red-500/90 to-pink-600/90 border-red-300">
              <div className="text-8xl animate-bounce transform-gpu" style={{ textShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
                {deleteEmoji}
              </div>
              <div className="text-white">
                <p className="text-2xl font-bold drop-shadow-lg">
                  ¡Gasto eliminado!
                </p>
                <p className="text-sm opacity-90">
                  El gasto pendiente fue eliminado exitosamente
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 w-full">
        <Header userProfile={userProfile} />
      
      <div className="max-w-8xl mx-auto px-4 sm:px-6 py-8">
        {/* HEADER PROFESIONAL */}
        <div className="mb-8 relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 p-6 shadow-lg border border-slate-600 sticky top-20 z-40 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white mb-2">
              {activeTab === 'expenses' ? 'Mis Gastos' : 
               activeTab === 'dba' ? 'Administración DBA' : 
               activeTab === 'movements' ? 'Historial de Movimientos' :
               'Gestión de Usuarios'}
            </h1>
            <p className="text-slate-300 font-medium">
              {activeTab === 'expenses' ? 'Gestiona y controla tus gastos empresariales' : 
               activeTab === 'dba' ? 'Herramientas de administración de base de datos' : 
               activeTab === 'movements' ? 'Registro completo de todas las operaciones de saldo' :
               'Administra usuarios del sistema'}
            </p>
          </div>
        </div>

        {/* TABS PROFESIONALES */}
        <div className="mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-1.5 shadow-md border border-slate-200 dark:border-slate-700">
            <style>{`
              .magic-tab-active {
                box-shadow: 0 0 12px 2px #6366f1, 0 0 24px 4px #818cf8;
                animation: magicGlow 2s infinite alternate;
              }
              @keyframes magicGlow {
                0% { box-shadow: 0 0 12px 2px #6366f1, 0 0 24px 4px #818cf8; }
                100% { box-shadow: 0 0 24px 6px #818cf8, 0 0 32px 8px #6366f1; }
              }
            `}</style>
            <nav className="flex space-x-1">
              <button
                data-tab="expenses"
                onClick={() => {
                  console.log('🔥 Gastos button clicked');
                  setActiveTab('expenses');
                  window.location.hash = '';
                }}
                className={`flex-1 py-3 px-4 rounded-md font-semibold text-sm transition-all duration-200 ${
                  activeTab === 'expenses'
                    ? 'bg-indigo-600 text-white shadow-md magic-tab-active'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Receipt className="w-4 h-4" />
                  <span>Gastos</span>
                </div>
              </button>
              
              {/* Pestaña Usuarios - Solo para admin/supervisor */}
              {(userProfile?.role === 'admin' || userProfile?.role === 'supervisor') && (
                <button
                  data-tab="users"
                  onClick={() => {
                    console.log('🔥 Users button clicked');
                    setActiveTab('users');
                    window.location.hash = '#users';
                  }}
                  className={`flex-1 py-3 px-4 rounded-md font-semibold text-sm transition-all duration-200 ${
                      activeTab === 'users'
                        ? 'bg-blue-600 text-white shadow-md magic-tab-active'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Usuarios</span>
                  </div>
                </button>
              )}

              {/* (Removed) Top KPI quick-action for 'Gestión de Usuarios' — using per-row actions in the Users table instead to avoid duplication */}

              {/* Pestaña Historial - Solo para admin/supervisor - OCULTO POR AHORA */}
              {false && (userProfile?.role === 'admin' || userProfile?.role === 'supervisor') && (
                <button
                  data-tab="movements"
                  onClick={() => {
                    console.log('🔥 Movements button clicked');
                    setActiveTab('movements');
                    window.location.hash = '#movements';
                  }}
                  className={`flex-1 py-3 px-4 rounded-md font-semibold text-sm transition-all duration-200 ${
                    activeTab === 'movements'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Movimientos</span>
                  </div>
                </button>
              )}

              {/* Pestaña DBA - Solo para admin */}
              {(userProfile?.role === 'admin' || user?.role === 'admin' || user?.email === 'WRIZZO6802@GMAIL.COM') && (
                <button
                  data-tab="dba"
                  onClick={() => {
                    console.log('🔥 DBA button clicked');
                    setActiveTab('dba');
                    window.location.hash = '#dba';
                  }}
                  className={`flex-1 py-3 px-4 rounded-md font-semibold text-sm transition-all duration-200 ${
                    activeTab === 'dba'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Database className="w-4 h-4" />
                    <span>DBA</span>
                  </div>
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Barras de estadísticas - Solo mostrar en tab de expenses */}
        {/* top KPIs removed per UX request — bottom filters/pills remain in the table area */}

        {/* Modal: Ver Saldos de Usuario */}
        {showBalancesModal && balancesModalUser && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
              <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-indigo-600 p-4 rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">💼</div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Saldos — {balancesModalUser.name}</h3>
                    <div className="text-xs text-teal-100/90">Listado de saldos por moneda</div>
                  </div>
                </div>
                <button onClick={() => { setShowBalancesModal(false); setSelectedUserBalances([]); setBalancesModalUser(null); }} className="text-white p-2 rounded-lg hover:bg-white/10"><X className="w-4 h-4" /></button>
              </div>

              <div className="p-4">
                {balancesLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedUserBalances.length === 0 ? (
                      <div className="text-sm text-gray-500 p-6 text-center">No hay saldos registrados para este usuario.</div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2">
                        {selectedUserBalances.map((s) => (
                          <div key={s.currency} className="flex justify-between items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-3">
                              <div className="w-9 h-9 rounded-md bg-gradient-to-r from-gray-700 to-gray-600 text-white flex items-center justify-center font-bold">{s.currency}</div>
                              <div>
                                <div className="text-sm font-semibold">{s.currency}</div>
                                <div className="text-xs text-gray-500">Saldo</div>
                              </div>
                            </div>
                            <div className={`text-sm font-semibold ${s.balance < 0 ? 'text-red-400' : 'text-emerald-400'}`}>{formatBalance(s.balance, s.currency)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          showForm ? (
            <ExpenseForm
              expense={editingExpense}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          ) : (
            <ExpensesTable
              expenses={expenses}
              isLoading={isLoading}
              onAdd={() => setShowForm(true)}
              onEdit={handleEditExpense}
              onDelete={handleDeleteExpense}
              onApprove={handleApprove}
              onReject={handleReject}
              userRole={userProfile.role}
              users={users}
              currentUserId={userProfile.user_id}
            />
          )
        )}

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Información de paginación - Usuarios */}
            <div className="mb-4 flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                📊 Mostrando {Math.min((usersPage - 1) * recordsPerPage + 1, users.length)} - {Math.min(usersPage * recordsPerPage, users.length)} de {users.length} usuarios
              </div>
              <div className="flex space-x-2 bg-black text-white rounded-xl px-3 py-2">
                <button
                  onClick={() => setUsersPage(Math.max(1, usersPage - 1))}
                  disabled={usersPage === 1}
                  className="px-3 py-1 bg-black hover:bg-gray-800 disabled:opacity-50 text-white rounded text-sm"
                >
                  ← Anterior
                </button>
                <span className="px-3 py-1 bg-white/10 text-white rounded text-sm">
                  Página {usersPage} de {Math.ceil(users.length / recordsPerPage)}
                </span>
                <button
                  onClick={() => setUsersPage(Math.min(Math.ceil(users.length / recordsPerPage), usersPage + 1))}
                  disabled={usersPage >= Math.ceil(users.length / recordsPerPage)}
                  className="px-3 py-1 bg-black hover:bg-gray-800 disabled:opacity-50 text-white rounded text-sm"
                >
                  Siguiente →
                </button>
              </div>
            </div>

            {/* Tabla de usuarios */}
            <div className="overflow-x-auto">
              <table className="w-full rounded-xl border-2 border-purple-500 shadow-lg">
                <thead className="bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 dark:from-gray-700 dark:via-gray-700 dark:to-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      👤 Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      🎯 Rol
                    </th>
                      {/* Balance column hidden per UX — open 'Ver Saldos' to view all balances */}
                    <th className="px-6 py-3 text-left text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      ⚙️ Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {users
                    .slice((usersPage - 1) * recordsPerPage, usersPage * recordsPerPage)
                    .map((user) => (
                    <tr key={user.user_id} className="group transition-all duration-200">
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-pink-500 flex items-center justify-center text-white font-extrabold text-sm shadow-2xl">
                            {String(user.user_id || user.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[260px]">{user.name || user.user_id}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[260px]">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <span className={`inline-flex px-3 py-1 text-[11px] font-semibold rounded-full text-white uppercase tracking-wide ${user.role === 'admin' ? 'bg-gradient-to-r from-red-600 to-pink-600' : user.role === 'supervisor' ? 'bg-gradient-to-r from-yellow-600 to-orange-600' : 'bg-gradient-to-r from-green-600 to-emerald-600'}`}>{user.role === 'admin' ? 'ADMIN' : user.role === 'supervisor' ? 'SUPERVISOR' : 'USUARIO'}</span>
                      </td>
                      {/* Balance cell removed here to keep table compact — use View Balances action */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          { (userProfile?.role === 'admin' || userProfile?.role === 'supervisor' || user.user_id === userProfile?.user_id) && (
                            <button onClick={() => openUserModal(user)} className="w-9 h-9 flex items-center justify-center rounded-full bg-violet-800/50 hover:bg-violet-700/60 text-white shadow hover:shadow-lg transition-transform transform hover:-translate-y-0.5" title="Editar saldo">
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          { (userProfile?.role === 'admin' || userProfile?.role === 'supervisor' || user.user_id === userProfile?.user_id) && (
                            <button onClick={() => fetchUserBalancesAndOpen(user)} className="w-9 h-9 flex items-center justify-center rounded-full bg-teal-500/60 hover:bg-teal-500 text-white shadow hover:shadow-lg transition-transform transform hover:-translate-y-0.5" title="Ver saldos">
                              <Wallet className="w-4 h-4" />
                            </button>
                          )}
                          {/* Key action: Gestión de Usuarios — aparece junto a Eliminar solo para admin/supervisor */}
                          <button onClick={() => handleDeleteUser(user.user_id)} className="w-9 h-9 flex items-center justify-center rounded-full bg-rose-600/60 hover:bg-rose-600 text-white shadow hover:shadow-lg transition-transform transform hover:-translate-y-0.5" title="Eliminar usuario">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {/* Key action moved AFTER Delete: Gestión de Usuarios — aparece después de Eliminar solo para admin/supervisor */}
                          {(userProfile?.role === 'admin' || userProfile?.role === 'supervisor') && (
                            <button
                              onClick={() => {
                                try { navigate(`/settings?tab=users&user=${user.user_id}`); }
                                catch (e) { window.location.href = `/settings?tab=users&user=${user.user_id}`; }
                              }}
                              title="Gestión de Usuarios"
                              aria-label={`Gestión de Usuarios: ${user.name || user.user_id}`}
                              className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white shadow hover:shadow-lg transition-transform transform hover:-translate-y-0.5"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* removed duplicate footer filters — leaving only the core movements filters below */}

            {/* Historial de Movimientos dentro de Gestión de Usuarios */}
            <div className="mt-8 pt-8 border-t border-violet-500/20">
              <div className="mb-6 flex items-center space-x-2">
                {/* Update button removed - movements refresh now automatic when data changes */}
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-violet-500/20 rounded-xl text-white hover:bg-gray-700 font-semibold transition-all"
                >
                  <option value="all" className="bg-gray-800">Todos los usuarios</option>
                  {users.map(u => (
                    <option key={u.user_id} value={u.user_id} className="bg-gray-800">{u.name}</option>
                  ))}
                </select>
                <div className="flex items-center space-x-2">
                  <div className="px-4 py-2 bg-gray-800 border border-violet-500/20 rounded-xl text-white font-semibold transition-all flex items-center justify-center">
                    <span className="text-xs uppercase tracking-wide">Cargas</span>
                  </div>
                  <select
                    value={movementsCurrency}
                    onChange={(e) => { setMovementsCurrency(e.target.value); setMovementsPage(1); }}
                    className="px-3 py-2 bg-gray-800 border border-violet-500/20 rounded-xl text-white hover:bg-gray-700 font-semibold transition-all text-sm"
                  >
                    <option value="all">Todas las monedas</option>
                    {Array.from(new Set(balanceMovements.map(b => String(b.currency || '').toUpperCase()).filter(Boolean))).sort().map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <label className="text-xs text-gray-400">Fecha desde:</label>
                  <input
                    type="date"
                    value={dateFilter.from}
                    onChange={e => { setDateFilter(df => ({...df, from: e.target.value})); setMovementsPage(1); }}
                    className="px-2 py-1 rounded bg-gray-900 text-white border border-gray-700 text-xs"
                    style={{ minWidth: 120 }}
                  />
                  <label className="text-xs text-gray-400 ml-2">Fecha hasta:</label>
                  <input
                    type="date"
                    value={dateFilter.to}
                    onChange={e => { setDateFilter(df => ({...df, to: e.target.value})); setMovementsPage(1); }}
                    className="px-2 py-1 rounded bg-gray-900 text-white border border-gray-700 text-xs"
                    style={{ minWidth: 120 }}
                  />
                </div>
                <button
                  onClick={() => exportToExcel()}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  <span>Exportar Excel</span>
                </button>
              </div>

              {isLoadingMovements ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
                </div>
              ) : (
                <div className="overflow-x-auto bg-black rounded-xl p-4 border border-gray-900 grid-glow-container" style={{background:'#000',borderColor:'#23272F'}}>
                  {/* Use the shared table classes to match Expenses table visuals and ensure stable header alignment */}
                  <table className="w-full min-w-full table-fixed table-gradient-stripe">
                    <thead className="bg-black text-white table-header-neon">
                      <tr>
                        <th style={{width:'12%'}} className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap">📅 FECHA</th>
                        <th style={{width:'18%'}} className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap">👤 USUARIO</th>
                        <th style={{width:'10%'}} className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap">🎯 TIPO</th>
                        <th style={{width:'10%'}} className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap">💰 MONTO</th>
                        <th style={{width:'8%'}} className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap">MONEDA</th>
                        <th style={{width:'12%'}} className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap">📊 SALDO ANTERIOR</th>
                        <th style={{width:'12%'}} className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap">📈 SALDO NUEVO</th>
                        <th style={{width:'18%'}} className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap">📝 DESCRIPCIÓN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {pageItems.map((movement, i) => (
                          <tr key={movement.id} className="bg-black text-white table-row-glow row-neon-left row-fade-in" style={{ animationDelay: `${i * 45}ms` }}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-white font-semibold">
                              {(() => {
                                const d = parseDbTimestampToDate(movement.created_at);
                                return d ? d.toLocaleString('es-AR', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                                }).replace(',', '') : movement.created_at;
                              })()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-white font-semibold">
                              {movement.user_name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex px-3 py-1 text-xs font-black rounded-xl ${
                                movement.type === 'carga' 
                                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                                  : movement.type === 'descuento'
                                  ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white'
                                  : 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
                              }`}>
                                {movement.type === 'carga' ? 'Carga' : movement.type === 'descuento' ? 'Gasto' : 'Ajuste'}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`text-sm font-black ${
                                movement.type === 'carga' 
                                  ? 'text-green-400' 
                                  : 'text-red-400'
                              }`}>
                                {movement.type === 'carga' ? '+' : ''}{movement.amount}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-sm font-black text-gray-300">
                                {movement.currency}
                              </span>
                            </td>
                            <td className={`px-4 py-3 whitespace-nowrap text-sm font-semibold ${Number(movement.balance_before) < 0 ? 'text-rose-500 font-bold' : 'text-gray-400'}`}>
                              ${Number(movement.balance_before).toFixed(2)}
                            </td>
                            <td className={`px-4 py-3 whitespace-nowrap text-sm font-black ${Number(movement.balance_after) < 0 ? 'text-rose-500' : 'text-green-400'}`}>
                              ${Number(movement.balance_after).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-300">
                              {movement.description}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {/* Use global shared table classes. Removed heavy inline gradient hover styles to keep visuals consistent across grids */}
                  
                  {filteredMovements.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-400 font-semibold">📭 No hay movimientos registrados</p>
                    </div>
                  )}
                  
                  {/* Always show pagination control to match Expenses table behaviour (keeps UI consistent even on a single page) */}
                  {totalFiltered > 0 && (
                    <div className="flex justify-between items-center mt-4 bg-black text-white rounded-xl px-3 py-2 pager-shimmer">
                      <div className="text-sm text-gray-300">
                        Mostrando {Math.min((movementsPage - 1) * recordsPerPage + 1, totalFiltered)} - {Math.min(movementsPage * recordsPerPage, totalFiltered)} de {totalFiltered} movimientos
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setMovementsPage(1)}
                          disabled={movementsPage === 1}
                          className="px-3 py-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded text-sm font-bold shadow-lg"
                        >
                          « Primera
                        </button>
                        <button
                          onClick={() => setMovementsPage(Math.max(1, movementsPage - 1))}
                          disabled={movementsPage === 1}
                          className="px-3 py-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded text-sm font-bold shadow-lg"
                        >
                          ‹ Anterior
                        </button>
                        <span className="px-3 py-1 bg-white/10 text-white rounded text-sm">
                          Página {movementsPage} de {totalPages}
                        </span>
                        <button
                          onClick={() => setMovementsPage(Math.min(totalPages, movementsPage + 1))}
                          disabled={movementsPage >= totalPages}
                          className="px-3 py-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded text-sm font-bold shadow-lg"
                        >
                          Siguiente ›
                        </button>
                        <button
                          onClick={() => setMovementsPage(totalPages)}
                          disabled={movementsPage >= totalPages}
                          className="px-3 py-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded text-sm font-bold shadow-lg"
                        >
                          Última »
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sección Historial de Movimientos - Solo para admin/supervisor */}
        {activeTab === 'movements' && (userProfile?.role === 'admin' || userProfile?.role === 'supervisor') && (
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-violet-500/20 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* manual refresh removed - auto refresh on data:changed */}
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-violet-500/20 rounded-xl text-white hover:bg-gray-700 font-semibold transition-all"
                >
                  <option value="all" className="bg-gray-800">Todos los usuarios</option>
                  {users.map(u => (
                    <option key={u.user_id} value={u.user_id} className="bg-gray-800">{u.name}</option>
                  ))}
                </select>
                <div className="flex items-center space-x-2">
                  <div className="px-4 py-2 bg-gray-800 border border-violet-500/20 rounded-xl text-white font-semibold transition-all flex items-center justify-center">
                    <span className="text-xs uppercase tracking-wide">Cargas</span>
                  </div>
                  <select
                    value={movementsCurrency}
                    onChange={(e) => { setMovementsCurrency(e.target.value); setMovementsPage(1); }}
                    className="px-3 py-2 bg-gray-800 border border-violet-500/20 rounded-xl text-white hover:bg-gray-700 font-semibold transition-all text-sm"
                  >
                    <option value="all">Todas las monedas</option>
                    {Array.from(new Set(balanceMovements.map(b => String(b.currency || '').toUpperCase()).filter(Boolean))).sort().map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => exportToExcel()}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  <span>Exportar Excel</span>
                </button>
              </div>
            </div>

            {isLoadingMovements ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
              </div>
            ) : (
              <div className="overflow-x-auto grid-glow-container">
                <table className="w-full table-fixed table-gradient-stripe">
                  <thead className="bg-gradient-to-r from-violet-600 to-purple-600 table-header-neon">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap">📅 FECHA</th>
                      <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap">👤 USUARIO</th>
                      <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap">🎯 TIPO</th>
                      <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap">💰 MONTO</th>
                      <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap">📊 SALDO ANTERIOR</th>
                      <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap">📈 SALDO NUEVO</th>
                      <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap">📝 DESCRIPCIÓN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {pageItems.map((movement, i) => (
                        <tr key={movement.id} className="hover:bg-violet-900/30 transition-all table-row-glow row-neon-left row-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-white font-semibold">
                            {(() => {
                              const d = parseDbTimestampToDate(movement.created_at);
                              return d ? d.toLocaleString('es-AR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                              }).replace(',', '') : movement.created_at;
                            })()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-white font-semibold">
                            {movement.user_name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex px-3 py-1 text-xs font-black rounded-xl ${
                              movement.type === 'carga' 
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                                : movement.type === 'descuento'
                                ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white'
                                : 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
                            }`}>
                              {movement.type === 'carga' ? 'Carga' : movement.type === 'descuento' ? 'Gasto' : 'Ajuste'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`text-sm font-black ${
                              movement.type === 'carga' 
                                ? 'text-green-400' 
                                : 'text-red-400'
                            }`}>
                              {movement.type === 'carga' ? '+' : ''}{movement.amount} {movement.currency}
                            </span>
                          </td>
                            <td className={`px-4 py-3 whitespace-nowrap text-sm font-semibold ${Number(movement.balance_before) < 0 ? 'text-rose-500 font-bold' : 'text-gray-400'}`}>
                              ${Number(movement.balance_before).toFixed(2)}
                            </td>
                            <td className={`px-4 py-3 whitespace-nowrap text-sm font-black ${Number(movement.balance_after) < 0 ? 'text-rose-500' : 'text-green-400'}`}>
                              ${Number(movement.balance_after).toFixed(2)}
                            </td>
                          <td className="px-4 py-3 text-sm text-gray-300">
                            {movement.description}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {/* admin movements pager (same style) */}
                {/* admin movements pager (same style as expenses) */}
                {totalFiltered > 0 && (
                  <div className="flex justify-between items-center mt-4 bg-black text-white rounded-xl px-3 py-2 pager-shimmer">
                    <div className="text-sm text-gray-300">Mostrando {Math.min((movementsPage - 1) * recordsPerPage + 1, totalFiltered)} - {Math.min(movementsPage * recordsPerPage, totalFiltered)} de {totalFiltered} movimientos</div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => setMovementsPage(Math.max(1, movementsPage - 1))} disabled={movementsPage === 1} className="px-3 py-1 bg-black hover:bg-gray-800 disabled:opacity-50 text-white rounded text-sm">← Anterior</button>
                      <span className="px-3 py-1 bg-white/10 text-white rounded text-sm">Página {movementsPage} de {totalPages}</span>
                      <button onClick={() => setMovementsPage(Math.min(totalPages, movementsPage + 1))} disabled={movementsPage >= totalPages} className="px-3 py-1 bg-black hover:bg-gray-800 disabled:opacity-50 text-white rounded text-sm">Siguiente →</button>
                    </div>
                  </div>
                )}
                  {filteredMovements.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-400 font-semibold">📭 No hay movimientos registrados</p>
                  </div>
                )}
                
              </div>
            )}
          </div>
        )}

        {/* Sección DBA - Solo para admin */}
        {activeTab === 'dba' && (userProfile?.role === 'admin' || user?.role === 'admin' || user?.email === 'WRIZZO6802@GMAIL.COM') && (
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-violet-500/20 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-black bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">🔧 ADMINISTRACIÓN DBA</h2>
              <p className="text-sm font-bold text-gray-400 mt-1">⚠️ Herramientas avanzadas - Solo administradores</p>
            </div>

            {/* Selector de tabla */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-violet-300 mb-2 uppercase tracking-wider">
                📊 Tabla:
              </label>
              <select
                value={selectedTable}
                onChange={(e) => {
                  setSelectedTable(e.target.value);
                  setDbaQuery(`SELECT * FROM ${e.target.value};`);
                }}
                className="w-full md:w-auto px-4 py-3 bg-gray-800 border border-violet-500/20 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-white hover:bg-gray-700 font-semibold transition-all"
              >
                {dbaTables.length > 0 ? (
                  [...dbaTables, 'cierre_viaje', 'audit_logs'].map(table => (
                    <option key={table} value={table} className="bg-gray-800 text-white">
                      {table === 'users' ? '👥' : table === 'expenses' ? '💰' : table === 'closed_expenses' ? '📦' : table === 'categories' ? '🏷️' : table === 'trip_closures' ? '✈️' : table === 'closed_saldo_transacciones' ? '💳' : table === 'cierre_viaje' ? '🧳' : table === 'audit_logs' ? '📝' : '📊'} {table}
                    </option>
                  ))
                ) : (
                  <>
                      <option value="users" className="bg-gray-800 text-white">👥 users</option>
                      <option value="expenses" className="bg-gray-800 text-white">💰 expenses</option>
                      <option value="closed_expenses" className="bg-gray-800 text-white">📦 closed_expenses</option>
                      <option value="categories" className="bg-gray-800 text-white">🏷️ categories</option>
                      <option value="trip_closures" className="bg-gray-800 text-white">✈️ trip_closures</option>
                      <option value="closed_saldo_transacciones" className="bg-gray-800 text-white">💳 closed_saldo_transacciones</option>
                      <option value="cierre_viaje" className="bg-gray-800 text-white">🧳 CIERRE DE VIAJE</option>
                      <option value="audit_logs" className="bg-gray-800 text-white">📝 audit_logs</option>
                  </>
                )}
              </select>
            </div>

            {/* Editor de consultas SQL */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-violet-300 mb-2 uppercase tracking-wider">
                💻 Consulta SQL:
              </label>
              <textarea
                value={dbaQuery}
                onChange={(e) => setDbaQuery(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-violet-500/20 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-green-400 font-mono text-sm hover:bg-gray-700 transition-all"
                placeholder={`SELECT * FROM ${selectedTable};`}
                rows={4}
              />
              <button
                onClick={() => executeDbaQuery()}
                disabled={!dbaQuery.trim()}
                className="mt-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg"
              >
                EJECUTAR
              </button>
              {/* Resultados de la consulta DBA solo si no es audit_logs */}
              {dbaLoading && (
                <div className="mt-4 flex items-center justify-center">
                  <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></span>
                  <span className="ml-2 text-blue-400 font-bold">Ejecutando consulta...</span>
                </div>
              )}
              {dbaResults && selectedTable !== 'audit_logs' && !dbaLoading && (
                <div className="mt-4 p-4 bg-gray-900 rounded-xl border border-violet-500/20 overflow-x-auto">
                  {dbaResults.error ? (
                    <div className="text-red-400 font-bold">❌ Error: {dbaResults.error}</div>
                  ) : Array.isArray(dbaResults.results) && dbaResults.results.length > 0 ? (
                    <table className="w-full text-xs text-left text-gray-300">
                      <thead>
                        <tr>
                          {Object.keys(dbaResults.results[0]).map((col) => (
                            <th key={col} className="px-2 py-1 border-b border-violet-700 font-bold">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dbaResults.results.map((row: any, idx: any) => (
                          <tr key={idx} className="border-b border-gray-800">
                            {Object.values(row).map((val, i) => (
                              <td key={i} className="px-2 py-1">{String(val)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-yellow-400 font-bold">No se encontraron resultados.</div>
                  )}
                </div>
              )}

              {/* Special view: Cierre de viaje — show two grids from closed_* tables */}
              {selectedTable === 'cierre_viaje' && (
                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="bg-gray-900 p-4 rounded-xl border border-violet-500/10 overflow-auto">
                    <h3 className="text-white font-bold mb-2">Closed Expenses (closed_expenses)</h3>
                    {cierreLoading ? (
                      <div className="text-gray-400">Cargando...</div>
                    ) : cierreError ? (
                      <div className="text-red-400 font-bold">Error: {cierreError}</div>
                    ) : Array.isArray(closedExpenses) && closedExpenses.length > 0 ? (
                      <table className="w-full text-sm text-left text-gray-300">
                        <thead>
                          <tr>
                            <th className="px-2 py-1">id</th>
                            <th className="px-2 py-1">original_expense_id</th>
                            <th className="px-2 py-1">user_id</th>
                            <th className="px-2 py-1">description</th>
                            <th className="px-2 py-1">amount</th>
                            <th className="px-2 py-1">currency</th>
                            <th className="px-2 py-1">expense_date</th>
                            <th className="px-2 py-1">archived_at</th>
                          </tr>
                        </thead>
                        <tbody>
                          {closedExpenses.map((r:any) => (
                            <tr key={r.id} className="border-t border-white/5">
                              <td className="px-2 py-1">{r.id}</td>
                              <td className="px-2 py-1">{r.original_expense_id}</td>
                              <td className="px-2 py-1">{r.user_id}</td>
                              <td className="px-2 py-1">{r.description}</td>
                              <td className="px-2 py-1">{r.amount}</td>
                              <td className="px-2 py-1">{r.currency}</td>
                              <td className="px-2 py-1">{r.expense_date}</td>
                              <td className="px-2 py-1">{r.archived_at}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-gray-400">No se encontraron closed_expenses.</div>
                    )}
                  </div>

                  <div className="bg-gray-900 p-4 rounded-xl border border-violet-500/10 overflow-auto">
                    <h3 className="text-white font-bold mb-2">Closed Saldo Movements (closed_saldo_transacciones)</h3>
                    {cierreLoading ? (
                      <div className="text-gray-400">Cargando...</div>
                    ) : cierreError ? (
                      <div className="text-red-400 font-bold">Error: {cierreError}</div>
                    ) : Array.isArray(closedMovements) && closedMovements.length > 0 ? (
                      <table className="w-full text-sm text-left text-gray-300">
                        <thead>
                          <tr>
                            <th className="px-2 py-1">id</th>
                            <th className="px-2 py-1">original_movement_id</th>
                            <th className="px-2 py-1">user_id</th>
                            <th className="px-2 py-1">tipo</th>
                            <th className="px-2 py-1">monto</th>
                            <th className="px-2 py-1">saldo_anterior</th>
                            <th className="px-2 py-1">saldo_nuevo</th>
                            <th className="px-2 py-1">archived_at</th>
                          </tr>
                        </thead>
                        <tbody>
                          {closedMovements.map((r:any) => (
                            <tr key={r.id} className="border-t border-white/5">
                              <td className="px-2 py-1">{r.id}</td>
                              <td className="px-2 py-1">{r.original_movement_id}</td>
                              <td className="px-2 py-1">{r.user_id}</td>
                              <td className="px-2 py-1">{r.tipo}</td>
                              <td className="px-2 py-1">{r.monto}</td>
                              <td className="px-2 py-1">{r.saldo_anterior}</td>
                              <td className="px-2 py-1">{r.saldo_nuevo}</td>
                              <td className="px-2 py-1">{r.archived_at}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-gray-400">No se encontraron closed_saldo_transacciones.</div>
                    )}
                  </div>
                </div>
              )}
              <p className="text-xs text-red-400 font-bold mt-2">
                ⚠️ ¡Cuidado! Estas consultas se ejecutan directamente en la base de datos.
              </p>
            </div>

            {/* Controles de paginación modernos para audit_logs */}
            {selectedTable === 'audit_logs' && (
              <div className="flex flex-wrap gap-3 mb-6 items-center">
                <button
                  onClick={() => setAuditPage(1)}
                  disabled={auditPage === 1}
                  className="px-3 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded font-bold"
                >« Primero</button>
                <button
                  onClick={() => setAuditPage(Math.max(1, auditPage - 1))}
                  disabled={auditPage === 1}
                  className="px-3 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded font-bold"
                >‹ Anterior</button>
                <span className="px-3 py-2 bg-purple-100 text-purple-700 rounded font-bold">
                  Página {auditPage} de {totalAuditPages}
                </span>
                <button
                  onClick={() => setAuditPage(Math.min(totalAuditPages, auditPage + 1))}
                  disabled={auditPage === totalAuditPages}
                  className="px-3 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded font-bold"
                >Siguiente ›</button>
                <button
                  onClick={() => setAuditPage(totalAuditPages)}
                  disabled={auditPage === totalAuditPages}
                  className="px-3 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded font-bold"
                >Última »</button>
                <select
                  value={auditPageSize}
                  onChange={e => setAuditPageSize(Number(e.target.value))}
                  className="ml-4 px-3 py-2 bg-gray-800 border border-violet-500/20 rounded-xl text-white font-semibold"
                >
                  {[10, 20, 50, 100].map(size => (
                    <option key={size} value={size}>{size} por página</option>
                  ))}
                </select>
                <span className="ml-4 text-sm text-gray-300 font-bold">
                  Mostrando {auditStartIdx + 1} - {Math.min(auditStartIdx + auditPageSize, totalAuditRecords)} de {totalAuditRecords} registros
                </span>
              </div>
            )}
            {/* ...otros botones para otras tablas... */}
            
            {/* Botones de operaciones DBA avanzadas */}
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded border">
              <h4 className="font-medium text-red-700 dark:text-red-300 mb-2">🔧 Operaciones DBA Avanzadas</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setDbaQuery(`INSERT INTO ${selectedTable} VALUES ();`)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                >
                  INSERT
                </button>
                <button
                  onClick={() => setDbaQuery(`UPDATE ${selectedTable} SET  WHERE ;`)}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded transition-colors"
                >
                  UPDATE
                </button>
                <button
                  onClick={() => setDbaQuery(`DELETE FROM ${selectedTable} WHERE ;`)}
                  className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white text-xs rounded transition-colors"
                >
                  DELETE
                </button>
                <button
                  onClick={() => setDbaQuery(`ALTER TABLE ${selectedTable} ADD COLUMN  ;`)}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded transition-colors"
                >
                  ALTER TABLE
                </button>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setDbaResults(null)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
              >
                Limpiar
              </button>
            </div>

            {/* Resultados con paginación moderna para audit_logs */}
            {dbaResults && selectedTable === 'audit_logs' && (
              <div className="bg-gray-800 rounded-xl p-6 border border-violet-500/20 mt-6">
                <h3 className="text-lg font-black text-white mb-4">📊 Resultados:</h3>
                {dbaResults.error ? (
                  <div className="text-red-300 bg-red-900/50 p-4 rounded-lg border border-red-500">
                    <strong>❌ Error:</strong> {dbaResults.error}
                  </div>
                ) : dbaResults.results && dbaResults.results.length > 0 ? (
                  <div>
                    <div className="mb-4 p-3 bg-blue-900/30 rounded-lg border border-blue-500/30">
                      <span className="text-blue-300 font-bold text-sm">
                        📊 Mostrando {auditStartIdx + 1} - {Math.min(auditStartIdx + auditPageSize, totalAuditRecords)} de {totalAuditRecords} registros
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-violet-600 to-purple-600">
                          <tr>
                            {Object.keys(dbaResults.results[0]).map((key) => (
                              <th key={key} className="px-4 py-3 text-left font-black text-white uppercase tracking-wider">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {dbaResults.results.slice(auditStartIdx, auditStartIdx + auditPageSize).map((row: any, index: number) => (
                            <tr key={index} className="hover:bg-violet-900/30 transition-all">
                              {Object.values(row).map((value: any, cellIndex: number) => (
                                <td key={cellIndex} className="px-4 py-3 text-white font-semibold">
                                  {value !== null ? String(value) : <span className="text-gray-500 italic">null</span>}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-yellow-300 bg-yellow-900/30 p-4 rounded-lg border border-yellow-500">
                    <strong>ℹ️ Info:</strong> {dbaResults.message || 'Consulta ejecutada exitosamente. Sin resultados para mostrar.'}
                  </div>
                )}
              </div>
            )}
            {/* ...resultados para otras tablas... */}
          </div>
        )}

        {/* Modal de usuario - CARGAR SALDO POR MONEDA */}
        {showUserModal && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all">
              {/* Header con gradiente */}
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-lg">
                      <span className="text-2xl">💰</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Cargar Saldo</h2>
                      <p className="text-indigo-100 text-sm">Gestión de balance por moneda</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserModal(false);
                      resetUserForm();
                    }}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Info del usuario con diseño mejorado */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {editingUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{editingUser.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{editingUser.email}</div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleUpdateUser} className="space-y-5">
                  {/* Selector de Moneda - Destacado */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                      <span className="text-lg">🌍</span>
                      <span>Moneda</span>
                    </label>
                    <select
                      value={userForm.currency || 'ARS'}
                      onChange={async (e) => {
                        const newCurrency = e.target.value;
                        if (editingUser) {
                          // Obtener saldo de la nueva moneda seleccionada
                          const balance = await fetchUserBalanceByCurrency(editingUser.user_id, newCurrency);
                          setUserForm({
                            ...userForm, 
                            currency: newCurrency,
                            balance: '' // ✅ Resetear campo para nueva carga
                          });
                          // Actualizar también el editingUser para que se muestre el saldo correcto
                          setEditingUser({
                            ...editingUser,
                            balance: balance
                          });
                        } else {
                          setUserForm({...userForm, currency: newCurrency});
                        }
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium text-lg transition-all shadow-sm hover:shadow-md"
                    >
                      {currenciesList.length === 0 ? (
                        // fallback while loading or if API fails
                        [
                          { code: 'ARS', label: '🇦🇷 Peso Argentino (ARS)' },
                          { code: 'USD', label: '🇺🇸 Dólar (USD)' },
                          { code: 'EUR', label: '🇪🇺 Euro (EUR)' },
                          { code: 'BRL', label: '🇧🇷 Real (BRL)' },
                          { code: 'CLP', label: '🇨🇱 Peso Chileno (CLP)' },
                          { code: 'UYU', label: '🇺🇾 Peso Uruguayo (UYU)' },
                        ].map(c => <option key={c.code} value={c.code}>{c.label}</option>)
                      ) : (
                        currenciesList.map(c => (
                          <option key={c.code} value={c.code}>{(c.symbol ? c.symbol + ' ' : '') + (c.name ? c.name + ' (' + c.code + ')' : c.code)}</option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Saldo Actual - Con badge colorido */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Saldo Actual</div>
                    <div className="flex items-baseline space-x-2">
                      <span className={`text-3xl font-bold ${
                        (editingUser.balance || 0) < 0 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        ${editingUser.balance?.toFixed(2) || '0.00'}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{userForm.currency || 'ARS'}</span>
                    </div>
                  </div>

                  {/* Input de Monto a Cargar - Destacado */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                      <span className="text-lg">✨</span>
                      <span>Monto a Cargar</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-xl font-bold">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={userForm.balance}
                        onChange={(e) => setUserForm({...userForm, balance: e.target.value})}
                        className="w-full pl-10 pr-4 py-4 border-2 border-indigo-300 dark:border-indigo-600 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-xl transition-all shadow-sm hover:shadow-md"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                      <span>💡</span>
                      <span>Este monto se sumará al saldo actual</span>
                    </p>
                  </div>

                  {/* Botones de acción - Mejorados */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserModal(false);
                        resetUserForm();
                      }}
                      className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingUser}
                      className={`flex-1 px-4 py-3 font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 ${
                        isUpdatingUser 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transform hover:scale-105'
                      } text-white`}
                    >
                      {isUpdatingUser && <Loader2 className="w-5 h-5 animate-spin" />}
                      <span>{isUpdatingUser ? 'Actualizando...' : '💾 Actualizar Saldo'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        
        {/* Modal de Configuración - Cambio de Contraseña */}
        {showSettingsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all">
              {/* Header con gradiente */}
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-lg">
                      <span className="text-2xl">⚙️</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Configuración</h2>
                      <p className="text-indigo-100 text-sm">Gestión de contraseñas</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowSettingsModal(false);
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setUserPasswordForm({ userId: '', newPassword: '', confirmPassword: '' });
                    }}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Tabs */}
                <div className="flex space-x-2 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                  <button
                    onClick={() => setSettingsTab('my-password')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      settingsTab === 'my-password'
                        ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    🔐 Mi Contraseña
                  </button>
                  {(userProfile?.role === 'admin' || userProfile?.role === 'supervisor') && (
                    <>
                      <button
                        onClick={() => setSettingsTab('user-password')}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                          settingsTab === 'user-password'
                            ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        👥 Cambiar a Usuario
                      </button>
                      <button
                        onClick={() => setSettingsTab('create-user')}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                          settingsTab === 'create-user'
                            ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        ➕ Crear Usuario
                      </button>
                    </>
                  )}
                </div>

                {/* Mi Contraseña */}
                {settingsTab === 'my-password' && (
                  <form onSubmit={handleChangeMyPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Contraseña Actual
                      </label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                        required
                        placeholder="Ingresa tu contraseña actual"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                        required
                        minLength={6}
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Confirmar Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                        required
                        minLength={6}
                        placeholder="Repite la nueva contraseña"
                      />
                    </div>
                    
                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowSettingsModal(false)}
                        className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className={`flex-1 px-4 py-3 font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 ${
                          isChangingPassword 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                        } text-white shadow-lg`}
                      >
                        {isChangingPassword && <Loader2 className="w-5 h-5 animate-spin" />}
                        <span>{isChangingPassword ? 'Cambiando...' : '🔒 Cambiar Contraseña'}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Cambiar Contraseña de Usuario */}
                {settingsTab === 'user-password' && (
                  <form onSubmit={handleChangeUserPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Seleccionar Usuario
                      </label>
                      <select
                        value={userPasswordForm.userId}
                        onChange={(e) => setUserPasswordForm({...userPasswordForm, userId: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                        required
                      >
                        <option value="">Selecciona un usuario...</option>
                        {users.map(u => (
                          <option key={u.user_id} value={u.user_id}>
                            {u.name} ({u.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        value={userPasswordForm.newPassword}
                        onChange={(e) => setUserPasswordForm({...userPasswordForm, newPassword: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                        required
                        minLength={6}
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Confirmar Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        value={userPasswordForm.confirmPassword}
                        onChange={(e) => setUserPasswordForm({...userPasswordForm, confirmPassword: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                        required
                        minLength={6}
                        placeholder="Repite la nueva contraseña"
                      />
                    </div>
                    
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        ⚠️ Estás a punto de cambiar la contraseña de otro usuario. Esta acción no se puede deshacer.
                      </p>
                    </div>
                    
                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowSettingsModal(false)}
                        className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className={`flex-1 px-4 py-3 font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 ${
                          isChangingPassword 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'
                        } text-white shadow-lg`}
                      >
                        {isChangingPassword && <Loader2 className="w-5 h-5 animate-spin" />}
                        <span>{isChangingPassword ? 'Cambiando...' : '🔑 Cambiar Contraseña'}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Crear Usuario */}
                {settingsTab === 'create-user' && (
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        value={createUserForm.name}
                        onChange={(e) => setCreateUserForm({...createUserForm, name: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                        required
                        placeholder="Juan Pérez"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={createUserForm.email}
                        onChange={(e) => setCreateUserForm({...createUserForm, email: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                        required
                        placeholder="usuario@ejemplo.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Rol
                      </label>
                      <select
                        value={createUserForm.role}
                        onChange={(e) => setCreateUserForm({...createUserForm, role: e.target.value as 'admin' | 'supervisor' | 'usuario'})}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                        required
                      >
                        <option value="usuario">👤 Usuario</option>
                        <option value="supervisor">👔 Supervisor</option>
                        <option value="admin">👑 Administrador</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Contraseña
                      </label>
                      <input
                        type="password"
                        value={createUserForm.password}
                        onChange={(e) => setCreateUserForm({...createUserForm, password: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                        required
                        minLength={6}
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Confirmar Contraseña
                      </label>
                      <input
                        type="password"
                        value={createUserForm.confirmPassword}
                        onChange={(e) => setCreateUserForm({...createUserForm, confirmPassword: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                        required
                        minLength={6}
                        placeholder="Repite la contraseña"
                      />
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        ✨ El usuario se creará con acceso inmediato al sistema.
                      </p>
                    </div>
                    
                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowSettingsModal(false)}
                        className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className={`flex-1 px-4 py-3 font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 ${
                          isChangingPassword 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                        } text-white shadow-lg`}
                      >
                        {isChangingPassword && <Loader2 className="w-5 h-5 animate-spin" />}
                        <span>{isChangingPassword ? 'Creando...' : '➕ Crear Usuario'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Preview de Exportación */}
        {/* Export preview removed - export happens directly via exportToExcel */}

        {/* Notificación de Saldo Cargado */}
        {showBalanceNotification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            {/* Lluvia de dinero con emojis aleatorios */}
            <div className="absolute inset-0 overflow-hidden">
              {moneyParticles.map((emoji, i) => (
                <div
                  key={i}
                  className="absolute text-5xl animate-money-rain"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-${Math.random() * 20}%`,
                    animationDelay: `${Math.random() * 0.8}s`,
                    animationDuration: `${2 + Math.random() * 1.5}s`,
                  }}
                >
                  {emoji}
                </div>
              ))}
            </div>

            {/* Círculos expandiéndose con colores aleatorios */}
            <div className="absolute inset-0 flex items-center justify-center">
              {moneyColors.slice(0, 3).map((color, i) => (
                <div
                  key={i}
                  className="absolute rounded-full border-4 animate-ripple"
                  style={{
                    width: '100px',
                    height: '100px',
                    borderColor: color,
                    animationDelay: `${i * 0.3}s`,
                  }}
                />
              ))}
            </div>

            <div className="relative pointer-events-auto animate-bounce-scale">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 rounded-3xl blur-2xl opacity-75 animate-pulse-glow"></div>
              <div className="relative flex items-center space-x-4 p-8 rounded-3xl shadow-2xl backdrop-blur-lg border-4 bg-gradient-to-r from-emerald-500/90 via-green-600/90 to-teal-600/90 border-emerald-300">
                <div className="relative">
                  {/* Emoji de dinero aleatorio volando y esfumándose */}
                  <div className="text-8xl animate-fly-away">
                    {moneyParticles[0] || '💸'}
                  </div>
                  <div className="absolute top-0 left-0 text-8xl animate-fly-away-delayed opacity-70">
                    {moneyParticles[1] || '💵'}
                  </div>
                  <div className="absolute top-0 left-0 text-8xl animate-fly-away-delayed-more opacity-50">
                    {currentMoneyEmoji}
                  </div>
                  {/* Brillo central */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl animate-pulse">
                    {moneyParticles[2] || '✨'}
                  </div>
                </div>
                <div className="text-white">
                  <p className="text-3xl font-black drop-shadow-lg animate-neon-pulse" style={{
                    textShadow: '0 0 10px #fff, 0 0 20px #10b981'
                  }}>
                    ¡Saldo Cargado! 💰
                  </p>
                  <p className="text-lg opacity-90 animate-bounce-slow">
                    El balance se actualizó exitosamente
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
