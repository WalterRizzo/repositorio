// ...existing code...

  // ...existing code...

  // ...existing code...

  // ...existing code...

  // ...existing code...

  // ...existing code...

  // Resetear página de movimientos al cambiar filtros
  // Eliminado: paginación de movimientos
import React, { useEffect, useState } from "react";
import { useNotifications } from "@/react-app/hooks/useNotifications";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "@/react-app/hooks/useAuth";
import { Loader2, Receipt, Users, Trash2, Database, Edit3, Sparkles, X, FileSpreadsheet, Eye } from "lucide-react";
import { getNumberColorClass } from '@/react-app/utils/numbers';
import type { Expense, UserProfile } from "@/shared/types";
import ExpensesTable from "@/react-app/components/ExpensesTable";
import ExpenseForm from "@/react-app/components/ExpenseForm";
import Header from "@/react-app/components/Header";
import Sidebar from "@/react-app/components/Sidebar";
import { getRandomEmoji, getRandomEmojis } from '../../../epic-effects-library/effects/EmojiVariations';
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
      console.warn('Por favor, ingrese una consulta SQL');
      setDbaLoading(false);
      return;
    }
    setDbaResults(null);
    try {
      const response = await fetch('/api/dba/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(dbaKeyValue ? { 'x-dba-key': dbaKeyValue } : {}) },
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
  const [expensesPage, _setExpensesPage] = useState(1);
  const [expensesPerPage, _setExpensesPerPage] = useState(50);
  const [_totalExpenses, setTotalExpenses] = useState(0);
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
  const [movementsTotal, setMovementsTotal] = useState(0);
  const [movementsFilter, setMovementsFilter] = useState<string>('all'); // 'all', 'carga', 'descuento', 'ajuste'
  const [userFilter, setUserFilter] = useState<string>('all'); // Filtro por usuario

  // Multi-currency balances state
  const [multiBalances, setMultiBalances] = useState<Array<{ currency: string; balance: number }>>([]);

  // DBA state variables
  const [dbaQuery, setDbaQuery] = useState('');
  const [dbaResults, setDbaResults] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState('users');
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [dbaTables, setDbaTables] = useState<string[]>([]);
  const [dbaKeyValue, setDbaKeyValue] = useState('');
  const [dbaTestResult, setDbaTestResult] = useState('');

  // Pagination state for users table
  const [usersPage, setUsersPage] = useState(1);
  // Pagination state for movements grid
  const [movementsPage, setMovementsPage] = useState(1);
  const [expandedMovements, setExpandedMovements] = useState<Record<string, boolean>>({});
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  
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
  const [showExportPreview, setShowExportPreview] = useState(false);

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
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchExpenses(expensesPage, expensesPerPage);
      fetchMultiBalances();
      if (userProfile?.role === 'admin' || userProfile?.role === 'supervisor') {
        fetchUsers();
      }
    }
  }, [user, userProfile?.role]);

  useEffect(() => {
    // Fetch expenses when page or perPage changes
    if (user) {
      fetchExpenses(expensesPage, expensesPerPage);
    }
  }, [expensesPage, expensesPerPage]);

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

  const fetchExpenses = async (page = expensesPage, perPage = expensesPerPage) => {
    try {
      const offset = (page - 1) * perPage;
      const res = await fetch(`/api/expenses?limit=${perPage}&offset=${offset}`);
      const json = await res.json();
      const data = (json && (json.data || json)) || [];
      setExpenses(data);
      setTotalExpenses(json?.total ?? data.length);
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

  // Fetch per-currency balances for the current user
  const fetchMultiBalances = async () => {
    try {
      const response = await fetch('/api/users/me/balances', { credentials: 'include' });
      if (!response.ok) return;
      const data = await response.json();
      if (data && Array.isArray(data)) setMultiBalances(data);
    } catch (err) {
      console.error('Error fetching multi balances:', err);
    }
  };

  // Format currency helper (local to this page)
  const formatCurrency = (amount: number | string | null | undefined, currency: string = 'ARS') => {
    if (amount === null || amount === undefined || amount === '') return '-';
    const value = Number(amount);
    if (Number.isNaN(value)) return '-';
    const currencyMap: Record<string, string> = { ARS: 'es-AR', USD: 'en-US', EUR: 'de-DE', BRL: 'pt-BR' };
    const locale = currencyMap[currency] || 'es-AR';
    try {
      return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
    } catch (e) {
      return `${value.toFixed(2)} ${currency}`;
    }
  };

  const fetchDbaTables = async () => {
    try {
      const url = new URL('/api/dba/tables', window.location.origin);
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(dbaKeyValue ? { 'x-dba-key': dbaKeyValue } : {})
        },
      });
      const result = await response.json();
      if (response.ok && result.results) {
        // Filter & prioritize transactional tables first
        const knownTransactional = ['saldo_transacciones', 'saldos', 'balance_transactions', 'expense_attachments', 'expenses', 'audit_logs', 'users', 'user_profiles', 'tipo_comprobantes', 'categories'];
        const tableNames = result.results
          .filter((n:any) => n && typeof n === 'string')
          .sort((a:any,b:any) => {
            const ai = knownTransactional.indexOf(a) >= 0 ? knownTransactional.indexOf(a) : knownTransactional.length;
            const bi = knownTransactional.indexOf(b) >= 0 ? knownTransactional.indexOf(b) : knownTransactional.length;
            return ai - bi || a.localeCompare(b);
          });
        setDbaTables(tableNames);
        console.log('✅ Tablas cargadas:', tableNames);
        return;
      }
      // If the call returns but empty, fallback
      throw new Error('No table names returned');
    } catch (error) {
      console.error('Error cargando tablas:', error);
      // Full default tables (include transactional tables by default)
      setDbaTables(['users', 'user_profiles', 'expenses', 'expense_attachments', 'tipo_comprobantes', 'categories', 'saldos', 'saldo_transacciones', 'audit_logs']);
    }
  };

  const handleDeleteExpense = async (id: number) => {

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
        } else {
          setDeleteEmoji('🗑️');
          setShowDeleteNotification(true);
          setTimeout(() => setShowDeleteNotification(false), 2000);
        }
        await fetchExpenses();
      } else {
        console.warn(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error eliminando gasto:", error);
      console.warn("❌ Error al eliminar el gasto");
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingExpense(null);
    await fetchUserProfile();
    await fetchMultiBalances();
    await fetchExpenses();
  };

  const handleApprove = async (id: number) => {

    try {
      await fetch(`/api/expenses/${id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      await fetchExpenses();
      console.log("Gasto aprobado exitosamente");
    } catch (error) {
      console.error("Error aprobando gasto:", error);
      console.warn("Error al aprobar el gasto");
    }
  };

  const handleReject = async (id: number) => {

    try {
      await fetch(`/api/expenses/${id}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      await fetchExpenses();
      console.log("Gasto rechazado exitosamente");
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
    } catch (error) {
      console.error("Error rechazando gasto:", error);
      console.warn("Error al rechazar el gasto");
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  // Fetch balance movements
  const fetchBalanceMovements = async (page = 1, perPage = recordsPerPage) => {
    setIsLoadingMovements(true);
    try {
      const offset = (page - 1) * perPage;
      const url = new URL('/api/transacciones-saldo', window.location.origin);
      url.searchParams.set('limit', String(perPage));
      url.searchParams.set('offset', String(offset));
      if (movementsFilter && movementsFilter !== 'all') url.searchParams.set('type', movementsFilter);
      if (userFilter && userFilter !== 'all') url.searchParams.set('userId', String(userFilter));
      if (dateFilter.from) url.searchParams.set('from', dateFilter.from);
      if (dateFilter.to) url.searchParams.set('to', dateFilter.to);

      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        // Replace the current page with the fetched page items (paginated view)
        setBalanceMovements(data.transacciones || []);
        setMovementsTotal(data.total || 0);
        setMovementsPage(page);
      } else {
        console.error('Error fetching movements: ', response.status);
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
      fetchBalanceMovements(1); // load first page
    }
  }, [activeTab, userProfile?.role]);

  useEffect(() => {
    // When filters change, reset page and reload the first page of movements
    if ((activeTab === 'movements' || activeTab === 'users') && (userProfile?.role === 'admin' || userProfile?.role === 'supervisor')) {
      setMovementsPage(1);
      fetchBalanceMovements(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movementsFilter, userFilter, dateFilter.from, dateFilter.to, recordsPerPage]);

  // Funciones de usuarios

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || isUpdatingUser) return;
    
    const newBalance = parseFloat(userForm.balance);
    if (isNaN(newBalance) || newBalance < 0) {
      console.warn("Por favor ingrese un saldo válido");
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
        console.warn(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error actualizando usuario:", error);
      console.warn("Error al actualizar usuario");
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        await fetchUsers();
        console.log("Usuario eliminado exitosamente");
      } else {
        console.warn("Error al eliminar usuario");
      }
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      console.warn("Error al eliminar usuario");
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
      console.warn('Las contraseñas no coinciden');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      console.warn('La contraseña debe tener al menos 6 caracteres');
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
        console.log('✅ Contraseña actualizada correctamente');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowSettingsModal(false);
      } else {
        const data = await response.json();
        console.warn(`❌ Error: ${data.error || 'No se pudo cambiar la contraseña'}`);
      }
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      console.warn('❌ Error al cambiar contraseña');
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  const handleChangeUserPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userPasswordForm.newPassword !== userPasswordForm.confirmPassword) {
      console.warn('Las contraseñas no coinciden');
      return;
    }
    
    if (userPasswordForm.newPassword.length < 6) {
      console.warn('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (!userPasswordForm.userId) {
      console.warn('Por favor, selecciona un usuario');
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
        console.log('✅ Contraseña del usuario actualizada correctamente');
        setUserPasswordForm({ userId: '', newPassword: '', confirmPassword: '' });
      } else {
        const data = await response.json();
        console.warn(`❌ Error: ${data.error || 'No se pudo cambiar la contraseña'}`);
      }
    } catch (error) {
      console.error('Error cambiando contraseña de usuario:', error);
      console.warn('❌ Error al cambiar contraseña');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Función para crear nuevo usuario
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (createUserForm.password !== createUserForm.confirmPassword) {
      console.warn('Las contraseñas no coinciden');
      return;
    }
    
    if (createUserForm.password.length < 6) {
      console.warn('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (!createUserForm.email || !createUserForm.name) {
      console.warn('Por favor, completa todos los campos');
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
        console.log('✅ Usuario creado exitosamente');
        setCreateUserForm({ email: '', password: '', confirmPassword: '', name: '', role: 'usuario' });
        setShowSettingsModal(false);
        await fetchUsers(); // Recargar lista de usuarios
      } else {
        const data = await response.json();
        console.warn(`❌ Error: ${data.error || 'No se pudo crear el usuario'}`);
      }
    } catch (error) {
      console.error('Error creando usuario:', error);
      console.warn('❌ Error al crear usuario');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // NOTE: Duplicated fetchDbaTables removed - refer to the top-level implementation

  const testDbaKey = async () => {
    if (!dbaKeyValue) {
      setDbaTestResult('Por favor ingrese un DBA key');
      return;
    }
    try {
      setDbaTestResult('Probando...');
      const res = await fetch('/api/dba/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-dba-key': dbaKeyValue },
        body: JSON.stringify({ query: 'SELECT 1;' }),
      });
      const json = await res.json();
      if (res.ok) setDbaTestResult('DBA key válida ✅');
      else setDbaTestResult(`Error: ${json.error || 'clave inválida'}`);
    } catch (e) {
      console.error(e);
      setDbaTestResult('Error de conexión al probar DBA key');
    }
  };


  // Función para exportar movimientos a Excel
  const exportToExcel = async () => {
    const filteredMovements = balanceMovements
      .filter(m => movementsFilter === 'all' || m.type === movementsFilter)
      .filter(m => userFilter === 'all' || m.user_id === userFilter);

    const excelData = filteredMovements.map(movement => ({
      'Fecha': new Date(movement.created_at).toLocaleString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      'Usuario': movement.user_name,
      'Tipo': movement.type === 'carga' ? 'Carga' : movement.type === 'descuento' ? 'Gasto' : 'Ajuste',
      'Monto': `${movement.type === 'carga' ? '+' : ''}${movement.amount} ${movement.currency}`,
      'Saldo Anterior': `$${Number(movement.balance_before).toFixed(2)}`,
      'Saldo Nuevo': `$${Number(movement.balance_after).toFixed(2)}`,
      'Descripción': movement.description
    }));

    const XLSXModule = (await import('xlsx'));
    const XLSX = XLSXModule.default || XLSXModule;
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
    
    setShowExportPreview(false);
  };

  const getFilteredMovementsCount = () => {
    return balanceMovements
      .filter(m => movementsFilter === 'all' || m.type === movementsFilter)
      .filter(m => userFilter === 'all' || m.user_id === userFilter)
      .length;
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

  const pendingExpenses = expenses.filter(e => e.status === 'pendiente');

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
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
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* HEADER PROFESIONAL */}
        <div className="mb-8 relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 p-6 shadow-lg border border-slate-600">
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
                box-shadow: 0 0 12px 2px rgba(0,0,0,0.6), 0 0 24px 4px rgba(0,0,0,0.4);
                animation: magicGlow 2s infinite alternate;
              }
              @keyframes magicGlow {
                0% { box-shadow: 0 0 12px 2px rgba(0,0,0,0.6), 0 0 24px 4px rgba(0,0,0,0.4); }
                100% { box-shadow: 0 0 24px 6px rgba(0,0,0,0.5), 0 0 32px 8px rgba(0,0,0,0.3); }
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
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Usuarios</span>
                  </div>
                </button>
              )}

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
        {activeTab === 'expenses' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full">
            {/* CARD PENDIENTES */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 border border-blue-700 rounded-2xl p-5 flex flex-col items-start justify-between shadow-md group transition-all duration-200 hover:shadow-lg cursor-pointer"
              onMouseEnter={() => playRandomSound('money', 0.5)}>
              <div className="flex items-center space-x-3 mb-2">
                <span className="bg-blue-900 rounded-lg p-2"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></span>
                <span className="text-3xl font-bold text-white">{pendingExpenses.length}</span>
              </div>
              <div className="uppercase text-xs font-bold text-white tracking-wider">Gastos pendientes</div>
            </div>
            {/* CARD APROBADOS */}
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 border border-emerald-700 rounded-2xl p-5 flex flex-col items-start justify-between shadow-md group transition-all duration-200 hover:shadow-lg cursor-pointer"
              onMouseEnter={() => playRandomSound('money', 0.5)}>
              <div className="flex items-center space-x-3 mb-2">
                <span className="bg-emerald-900 rounded-lg p-2"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="12" cy="12" r="10"/><path d="M16 10l-4 4-2-2"/></svg></span>
                <span className="text-3xl font-bold text-white">{expenses.filter(e => e.status === 'aprobado').length}</span>
              </div>
              <div className="uppercase text-xs font-bold text-white tracking-wider">Gastos aprobados</div>
            </div>
            {/* CARD RECHAZADOS */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-700 border border-orange-700 rounded-2xl p-5 flex flex-col items-start justify-between shadow-md group transition-all duration-200 hover:shadow-lg cursor-pointer"
              onMouseEnter={() => playRandomSound('money', 0.5)}>
              <div className="flex items-center space-x-3 mb-2">
                <span className="bg-orange-900 rounded-lg p-2"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></span>
                <span className="text-3xl font-bold text-white">{expenses.filter(e => e.status === 'rechazado').length}</span>
              </div>
              <div className="uppercase text-xs font-bold text-white tracking-wider">Gastos rechazados</div>
            </div>
            {/* SALDO MULTIMONEDA */}
            <div className="bg-[#23293a] border border-indigo-500 rounded-2xl p-4 flex flex-col items-start justify-between min-w-[220px] max-w-xs shadow-lg" style={{height:'fit-content'}}>
              <div className="flex justify-between items-center w-full mb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wide">Saldos disponibles</span>
                <button
                  onClick={() => {
                    fetchMultiBalances();
                    fetchUserProfile();
                  }}
                  className="p-1.5 bg-indigo-900 hover:bg-indigo-700 rounded-lg text-indigo-300 transition-all duration-200"
                  title="Actualizar saldos"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-col w-full gap-1 max-h-56 overflow-y-auto">
                {multiBalances.length === 0 ? (
                  <div className="text-slate-400 text-xs italic">Sin saldos registrados</div>
                ) : (
                  multiBalances.map((item) => (
                    <div key={item.currency} className="flex justify-between items-center px-2 py-1 rounded-lg">
                      <span className="text-xs font-bold text-slate-200" style={{minWidth:'48px'}}>{item.currency}</span>
                      <span className={`text-sm font-bold ${
                        item.balance < 0 
                          ? 'text-red-400' 
                          : 'text-emerald-400'
                      }`}>
                        {formatCurrency(item.balance, item.currency)}
                      </span>
                    </div>
                  ))
                )
                }
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
              <div className="flex space-x-2">
                <button
                  onClick={() => setUsersPage(1)}
                  disabled={usersPage === 1}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-700 rounded text-sm"
                >
                  « Primera
                </button>
                <button
                  onClick={() => setUsersPage(Math.max(1, usersPage - 1))}
                  disabled={usersPage === 1}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-700 rounded text-sm"
                >
                  ← Anterior
                </button>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                  Página {usersPage} de {Math.ceil(users.length / recordsPerPage)}
                </span>
                <button
                  onClick={() => setUsersPage(Math.min(Math.ceil(users.length / recordsPerPage), usersPage + 1))}
                  disabled={usersPage >= Math.ceil(users.length / recordsPerPage)}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-700 rounded text-sm"
                >
                  Siguiente →
                </button>
                <button
                  onClick={() => setUsersPage(Math.ceil(users.length / recordsPerPage))}
                  disabled={usersPage >= Math.ceil(users.length / recordsPerPage)}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-700 rounded text-sm"
                >
                  Última »
                </button>
              </div>
            </div>

            {/* Tabla de usuarios */}
            <div className="overflow-x-auto">
              <table className="w-full rounded-xl border-2 border-black/20 shadow-lg">
                <thead className="bg-black dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      👤 Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      🎯 Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      💰 Saldo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      ⚙️ Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {users
                    .slice((usersPage - 1) * recordsPerPage, usersPage * recordsPerPage)
                    .map((user) => (
                    <tr key={user.user_id} className="hover:bg-black/10 dark:hover:bg-gray-700/50 transition-all border-b border-white/5 group hover:shadow-lg">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white border-l-4 border-transparent group-hover:border-indigo-500/40 transition-all">
                        <div>
                          <div className="font-bold">{user.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-md ${
                          user.role === 'admin' 
                            ? 'bg-black text-white'
                            : user.role === 'supervisor' 
                              ? 'bg-black text-white'
                              : 'bg-black text-white'
                        }`}>
                          {user.role === 'admin' ? '🔴 ADMIN' : user.role === 'supervisor' ? '🟡 SUPERVISOR' : '🟢 USUARIO'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-black ${
                          user.balance < 0 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'
                        }`}>
                          ${user.balance.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => openUserModal(user)}
                            className="group relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all hover:from-blue-600 hover:to-indigo-700"
                            title="Editar saldo"
                          >
                            <Edit3 className="w-4 h-4" />
                            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.user_id)}
                            className="group relative inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r from-red-500 to-pink-600 text-white shadow hover:shadow-md transform transition-all hover:from-red-600 hover:to-pink-700"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-4 h-4" />
                            <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Historial de Movimientos dentro de Gestión de Usuarios */}
            <div className="mt-8 pt-8 border-t border-violet-500/20">
              <div className="mb-6 flex items-center space-x-2">
                <button
                  onClick={() => fetchBalanceMovements(1)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                  🔄 Actualizar
                </button>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-800/20 rounded-xl text-white hover:bg-gray-700 font-semibold transition-all"
                >
                  <option value="all" className="bg-gray-800">Todos los usuarios</option>
                  {users.map(u => (
                    <option key={u.user_id} value={u.user_id} className="bg-gray-800">{u.name}</option>
                  ))}
                </select>
                <select
                  value={movementsFilter}
                  onChange={(e) => setMovementsFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-800/20 rounded-xl text-white hover:bg-gray-700 font-semibold transition-all"
                >
                  <option value="all" className="bg-gray-800">Todos los movimientos</option>
                  <option value="carga" className="bg-gray-800">Cargas</option>
                  <option value="descuento" className="bg-gray-800">Gastos</option>
                </select>
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
                {userProfile?.role === 'usuario' && (
                  <button
                    onClick={() => setShowExportPreview(true)}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <FileSpreadsheet className="w-5 h-5" />
                    <span>Exportar Excel</span>
                  </button>
                )}
              </div>

              {isLoadingMovements ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
              ) : (
                <div className="overflow-x-auto table-container-card bg-black rounded-xl p-4 border border-gray-900" style={{background:'#000',borderColor:'#23272F'}}>
                  <table className="w-full min-w-max magic-movements-table table-card">
                    <thead className="bg-black text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap sm:hidden"> </th>
                        <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap">📅 FECHA</th>
                        <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap">👤 USUARIO</th>
                        <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap">🎯 TIPO</th>
                        <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap">💰 MONTO</th>
                        <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap">MONEDA</th>
                        <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">📊 SALDO ANTERIOR</th>
                        <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">📈 SALDO NUEVO</th>
                        <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">📝 DESCRIPCIÓN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {balanceMovements
                        // server returns filtered/paged results already; keep local filter as fallback
                        .filter(m => movementsFilter === 'all' || m.type === movementsFilter)
                        .filter(m => userFilter === 'all' || m.user_id === userFilter)
                        .map((movement) => (
                          <React.Fragment key={movement.id}>
                          <tr className="hover-lift text-white table-row-card" data-type={movement.type} title={movement.type}>
                            <td className="px-2 py-2 sm:hidden text-sm">
                              <button onClick={() => setExpandedMovements(prev => ({...prev, [String(movement.id)]: !prev[String(movement.id)]}))} className="px-2 py-1 rounded bg-gray-800 text-gray-300 hover:bg-gray-700">
                                {expandedMovements[String(movement.id)] ? '−' : '+'}
                              </button>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-white font-semibold">
                              {new Date(movement.created_at).toLocaleString('es-AR', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              }).replace(',', '')}
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
                                {movement.type === 'carga' ? '+' : ''}{movement.amount != null ? Number(movement.amount).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2}) : '-'}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-sm font-black text-gray-300">
                                {movement.currency}
                              </span>
                            </td>
                            <td className={`px-4 py-3 whitespace-nowrap text-sm font-semibold hidden sm:table-cell ${getNumberColorClass(movement.balance_before)}`}>
                              {movement.balance_before != null ? `$${Number(movement.balance_before).toFixed(2)}` : '-'}
                            </td>
                            <td className={`px-4 py-3 whitespace-nowrap text-sm font-black hidden sm:table-cell ${getNumberColorClass(movement.balance_after)}`}>
                              {movement.balance_after != null ? `$${Number(movement.balance_after).toFixed(2)}` : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-300 hidden sm:table-cell">
                              {movement.description}
                            </td>
                          </tr>
                          {/* Mobile-only expanded content */}
                          {expandedMovements[movement.id] && (
                            <tr className="bg-gray-900 text-white sm:hidden" key={movement.id + '-details'}>
                              <td colSpan={9} className="px-4 py-3 text-sm">
                                <div className="flex flex-col gap-y-1 text-xs">
                                  <div><span className="font-semibold">Saldo Anterior:</span> <span className={`${getNumberColorClass(movement.balance_before)} font-mono`}>${Number(movement.balance_before).toFixed(2)}</span></div>
                                  <div><span className="font-semibold">Saldo Nuevo:</span> <span className={`${getNumberColorClass(movement.balance_after)} font-mono`}>${Number(movement.balance_after).toFixed(2)}</span></div>
                                  <div><span className="font-semibold">Descripción:</span> <span className="text-gray-300">{movement.description}</span></div>
                                </div>
                              </td>
                            </tr>
                          )}
                          {expandedMovements[String(movement.id)] && (
                            <tr className="bg-gray-900 text-white sm:hidden" key={movement.id + '-details'}>
                              <td colSpan={9} className="px-4 py-3 text-sm">
                                <div className="flex flex-col gap-y-1 text-xs">
                                  <div><span className="font-semibold">Saldo Anterior:</span> <span className={`${getNumberColorClass(movement.balance_before)} font-mono`}>${Number(movement.balance_before).toFixed(2)}</span></div>
                                  <div><span className="font-semibold">Saldo Nuevo:</span> <span className={`${getNumberColorClass(movement.balance_after)} font-mono`}>${Number(movement.balance_after).toFixed(2)}</span></div>
                                  <div><span className="font-semibold">Descripción:</span> <span className="text-gray-300">{movement.description}</span></div>
                                </div>
                              </td>
                            </tr>
                          )}
                          </React.Fragment>
                        ))}
                    </tbody>
                  </table>
                  <style>{`
                    .magic-movements-table { border-radius: 0.75rem; border: 2px solid rgba(255,255,255,0.03); transition: box-shadow 0.3s ease; }
                  `}</style>
                  
                  {balanceMovements
                    .filter(m => movementsFilter === 'all' || m.type === movementsFilter)
                    .filter(m => userFilter === 'all' || m.user_id === userFilter)
                    .length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-400 font-semibold">📭 No hay movimientos registrados</p>
                    </div>
                  )}
                  
                                  {movementsTotal > 0 && (
                                    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-2 sm:px-6 py-2 sm:py-4 bg-black/40 border-t gap-y-2 rounded-xl shadow-lg mb-2">
                                      <div className="text-xs sm:text-sm text-white font-semibold">
                                        Mostrando {(movementsPage - 1) * recordsPerPage + 1} - {Math.min(movementsPage * recordsPerPage, movementsTotal)} de {movementsTotal} movimientos
                                      </div>
                                      <div className="flex items-center gap-x-2">
                                        <label className="text-xs text-white mr-2">Mostrar:</label>
                                        <select value={recordsPerPage} onChange={(e) => { setRecordsPerPage(Number(e.target.value)); setMovementsPage(1); }} className="px-2 py-1 rounded text-sm font-medium">
                                          <option value={10}>10</option>
                                          <option value={25}>25</option>
                                          <option value={50}>50</option>
                                          <option value={100}>100</option>
                                        </select>
                                        <button onClick={() => fetchBalanceMovements(1)} disabled={movementsPage === 1} className="px-3 py-1 bg-black hover:bg-gray-800 disabled:opacity-50 text-white rounded text-sm font-bold shadow-lg">« Primera</button>
                                        <button onClick={() => fetchBalanceMovements(Math.max(1, movementsPage - 1))} disabled={movementsPage === 1} className="px-3 py-1 bg-black hover:bg-gray-800 disabled:opacity-50 text-white rounded text-sm font-bold shadow-lg">‹ Anterior</button>
                                        <span className="px-3 py-1 bg-black text-white rounded text-sm font-bold">Página {movementsPage} de {Math.max(1, Math.ceil(movementsTotal / recordsPerPage))}</span>
                                        <button onClick={() => fetchBalanceMovements(Math.min(Math.max(1, Math.ceil(movementsTotal / recordsPerPage)), movementsPage + 1))} disabled={movementsPage === Math.max(1, Math.ceil(movementsTotal / recordsPerPage))} className="px-3 py-1 bg-black hover:bg-gray-800 disabled:opacity-50 text-white rounded text-sm font-bold shadow-lg">Siguiente ›</button>
                                        <button onClick={() => fetchBalanceMovements(Math.max(1, Math.ceil(movementsTotal / recordsPerPage)))} disabled={movementsPage === Math.max(1, Math.ceil(movementsTotal / recordsPerPage))} className="px-3 py-1 bg-black hover:bg-gray-800 disabled:opacity-50 text-white rounded text-sm font-bold shadow-lg">Última »</button>
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
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-800/30 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fetchBalanceMovements(1)}
                  className="px-4 py-2 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                  🔄 Actualizar
                </button>
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
                <select
                  value={movementsFilter}
                  onChange={(e) => setMovementsFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-violet-500/20 rounded-xl text-white hover:bg-gray-700 font-semibold transition-all"
                >
                  <option value="all" className="bg-gray-800">Todos los movimientos</option>
                  <option value="carga" className="bg-gray-800">Cargas</option>
                  <option value="descuento" className="bg-gray-800">Descontados</option>
                  <option value="ajuste" className="bg-gray-800">Ajustes</option>
                </select>
                <button
                  onClick={() => setShowExportPreview(true)}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  <span>Exportar Excel</span>
                </button>
              </div>
            </div>

            {isLoadingMovements ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
            ) : (
              <div className="overflow-x-auto table-container-card">
                <table className="w-full min-w-max table-card">
                  <thead className="bg-black">
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
                    {balanceMovements
                      .filter(m => movementsFilter === 'all' || m.type === movementsFilter)
                      .filter(m => userFilter === 'all' || m.user_id === userFilter)
                      .filter(m => {
                        if ((!dateFilter.from && !dateFilter.to)) return true;
                        const date = m.created_at.slice(0,10);
                        if (dateFilter.from && date < dateFilter.from) return false;
                        if (dateFilter.to && date > dateFilter.to) return false;
                        return true;
                      })
                      .slice(0, 5)
                      .map((movement) => (
                        <tr key={movement.id} className="hover:bg-black/25 transition-all">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-white font-semibold">
                            {new Date(movement.created_at).toLocaleString('es-AR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            }).replace(',', '')}
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
                          <td className={`px-4 py-3 whitespace-nowrap text-sm font-semibold ${getNumberColorClass(movement.balance_before)}`}>
                            ${Number(movement.balance_before).toFixed(2)}
                          </td>
                          <td className={`px-4 py-3 whitespace-nowrap text-sm font-black ${getNumberColorClass(movement.balance_after)}`}>
                            ${Number(movement.balance_after).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300">
                            {movement.description}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                
                {balanceMovements
                  .filter(m => movementsFilter === 'all' || m.type === movementsFilter)
                  .filter(m => userFilter === 'all' || m.user_id === userFilter)
                  .length === 0 && (
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
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-800/30 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-black bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">🔧 ADMINISTRACIÓN DBA</h2>
              <p className="text-sm font-bold text-gray-400 mt-1">⚠️ Herramientas avanzadas - Solo administradores</p>
              <div className="mt-3">
                <label className="block text-sm text-gray-400 mb-1">DBA Key (secreto)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={dbaKeyValue}
                    onChange={(e) => setDbaKeyValue(e.target.value)}
                    className="w-full p-2 border border-gray-700 rounded bg-black text-sm text-white"
                    placeholder="x-dba-key"
                  />
                  <button onClick={testDbaKey} className="px-3 py-1 bg-black text-white rounded">Probar DBA Key</button>
                </div>
                {dbaTestResult && <div className="text-sm text-gray-300 mt-1">{dbaTestResult}</div>}
              </div>
            </div>

            {/* Selector de tabla */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
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
                  [...dbaTables, 'audit_logs'].map(table => (
                    <option key={table} value={table} className="bg-gray-800 text-white">
                      {table === 'users' ? '👥' : table === 'expenses' ? '💰' : table === 'categories' ? '🏷️' : table === 'audit_logs' ? '📝' : '📊'} {table}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="users" className="bg-gray-800 text-white">👥 users</option>
                    <option value="expenses" className="bg-gray-800 text-white">💰 expenses</option>
                    <option value="categories" className="bg-gray-800 text-white">🏷️ categories</option>
                    <option value="audit_logs" className="bg-gray-800 text-white">📝 audit_logs</option>
                  </>
                )}
              </select>
            </div>

            {/* Editor de consultas SQL */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
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
                  className="px-3 py-2 bg-black hover:bg-gray-800 disabled:opacity-50 text-white rounded font-bold"
                >« Primero</button>
                <button
                  onClick={() => setAuditPage(Math.max(1, auditPage - 1))}
                  disabled={auditPage === 1}
                  className="px-3 py-2 bg-black hover:bg-gray-800 disabled:opacity-50 text-white rounded font-bold"
                >‹ Anterior</button>
                <span className="px-3 py-2 bg-gray-100 text-gray-700 rounded font-bold">
                  Página {auditPage} de {totalAuditPages}
                </span>
                <button
                  onClick={() => setAuditPage(Math.min(totalAuditPages, auditPage + 1))}
                  disabled={auditPage === totalAuditPages}
                  className="px-3 py-2 bg-black hover:bg-gray-800 disabled:opacity-50 text-white rounded font-bold"
                >Siguiente ›</button>
                <button
                  onClick={() => setAuditPage(totalAuditPages)}
                  disabled={auditPage === totalAuditPages}
                  className="px-3 py-2 bg-black hover:bg-gray-800 disabled:opacity-50 text-white rounded font-bold"
                >Última »</button>
                <select
                  value={auditPageSize}
                  onChange={e => setAuditPageSize(Number(e.target.value))}
                  className="ml-4 px-3 py-2 bg-gray-800 border border-gray-800/20 rounded-xl text-white font-semibold"
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
                        <thead className="bg-black">
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
                            <tr key={index} className="hover:bg-black/25 transition-all">
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
                      <option value="ARS">🇦🇷 Peso Argentino (ARS)</option>
                      <option value="USD">🇺🇸 Dólar (USD)</option>
                      <option value="EUR">🇪🇺 Euro (EUR)</option>
                      <option value="BRL">🇧🇷 Real (BRL)</option>
                      <option value="CLP">🇨🇱 Peso Chileno (CLP)</option>
                      <option value="UYU">🇺🇾 Peso Uruguayo (UYU)</option>
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
        {showExportPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl transform transition-all border border-violet-500/20">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-lg">
                      <FileSpreadsheet className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Vista Previa - Exportar a Excel</h2>
                      <p className="text-green-100 text-sm">{getFilteredMovementsCount()} movimientos seleccionados</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowExportPreview(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-violet-500/20">
                  <h3 className="text-white font-bold mb-2 flex items-center space-x-2">
                    <Eye className="w-5 h-5" />
                    <span>Preview de los datos:</span>
                  </h3>
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-sm">
                      <thead className="bg-black sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-black text-white">Fecha</th>
                          <th className="px-3 py-2 text-left text-xs font-black text-white">Usuario</th>
                          <th className="px-3 py-2 text-left text-xs font-black text-white">Tipo</th>
                          <th className="px-3 py-2 text-left text-xs font-black text-white">Monto</th>
                          <th className="px-3 py-2 text-left text-xs font-black text-white">Saldo Anterior</th>
                          <th className="px-3 py-2 text-left text-xs font-black text-white">Saldo Nuevo</th>
                          <th className="px-3 py-2 text-left text-xs font-black text-white">Descripción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {balanceMovements
                          .filter(m => movementsFilter === 'all' || m.type === movementsFilter)
                          .filter(m => userFilter === 'all' || m.user_id === userFilter)
                          .slice(0, 10)
                          .map((movement, idx) => (
                            <tr key={idx} className="hover:bg-black/25 transition-all">
                              <td className="px-3 py-2 whitespace-nowrap text-white">
                                {new Date(movement.created_at).toLocaleString('es-AR', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-white">{movement.user_name}</td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                  movement.type === 'carga' ? 'bg-green-600' : 
                                  movement.type === 'descuento' ? 'bg-red-600' : 'bg-yellow-600'
                                } text-white`}>
                                  {movement.type === 'carga' ? 'Carga' : movement.type === 'descuento' ? 'Gasto' : 'Ajuste'}
                                </span>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-white">
                                {movement.type === 'carga' ? '+' : ''}{movement.amount} {movement.currency}
                              </td>
                              <td className={`px-3 py-2 whitespace-nowrap ${getNumberColorClass(movement.balance_before)}`}>
                                ${Number(movement.balance_before).toFixed(2)}
                              </td>
                              <td className={`px-3 py-2 whitespace-nowrap font-bold ${getNumberColorClass(movement.balance_after)}`}>
                                ${Number(movement.balance_after).toFixed(2)}
                              </td>
                              <td className="px-3 py-2 text-gray-300 truncate max-w-xs">{movement.description}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  {getFilteredMovementsCount() > 10 && (
                    <p className="text-gray-400 text-xs mt-2 text-center">
                      Mostrando primeros 10 de {getFilteredMovementsCount()} movimientos
                    </p>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowExportPreview(false)}
                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2"
                  >
                    <FileSpreadsheet className="w-5 h-5" />
                    <span>Descargar Excel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
