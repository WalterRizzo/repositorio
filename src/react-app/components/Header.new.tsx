import { useAuth } from "@/react-app/hooks/useAuth";
import { Link, useLocation } from "react-router";
import { Receipt, BarChart3, LogOut, Moon, Sun, Tag, Users, KeyRound, Wallet, TrendingUp } from "lucide-react";
import { useTheme } from "@/react-app/hooks/useTheme";

interface HeaderProps {
  userProfile?: any;
  onSettingsClick?: () => void;
}

import { useEffect, useState } from 'react';

export default function Header({ userProfile, onSettingsClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (path: string) => location.pathname === path;

  // Formatear saldo con separadores de miles
  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const [localBalances, setLocalBalances] = useState<Array<{currency:string; balance:number}> | null>(Array.isArray(userProfile?.balances) ? userProfile.balances : null);

  useEffect(() => {
    let mounted = true;
    if (userProfile && !Array.isArray(userProfile.balances)) {
      (async () => {
        try {
          const resp = await fetch('/api/users/me/balances');
          if (!resp.ok) return;
          const json = await resp.json();
          if (mounted && Array.isArray(json.balances)) setLocalBalances(json.balances);
        } catch (e) {}
      })();
    }
    return () => { mounted = false };
  }, [userProfile]);

  return (
    <header className="sticky top-0 z-50 bg-dark-900/95 backdrop-blur-xl border-b border-dark-800/50 shadow-xl">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo y Brand */}
          <div className="flex items-center space-x-10">
            <Link to="/expenses" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-cyan rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-cyan flex items-center justify-center shadow-glow transform group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary-400 via-accent-cyan to-primary-500 bg-clip-text text-transparent">
                  ExpenseFlow
                </span>
                <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">
                  Financial Dashboard
                </span>
              </div>
            </Link>

            {/* Navegación Principal */}
            <nav className="hidden lg:flex items-center space-x-2">
              <Link
                to="/expenses"
                className={`group relative px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  isActive("/expenses")
                    ? "text-primary-400"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {isActive("/expenses") && (
                  <div className="absolute inset-0 bg-primary-500/10 rounded-xl border border-primary-500/20"></div>
                )}
                <div className="relative flex items-center space-x-2.5">
                  <Receipt className="w-4.5 h-4.5" />
                  <span>Gastos</span>
                </div>
              </Link>

              <Link
                to="/reports"
                className={`group relative px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  isActive("/reports")
                    ? "text-primary-400"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {isActive("/reports") && (
                  <div className="absolute inset-0 bg-primary-500/10 rounded-xl border border-primary-500/20"></div>
                )}
                <div className="relative flex items-center space-x-2.5">
                  <BarChart3 className="w-4.5 h-4.5" />
                  <span>Reportes</span>
                </div>
              </Link>

              {(userProfile?.role === 'admin' || userProfile?.role === 'supervisor') && (
                <>
                  <Link
                    to="/categories"
                    className={`group relative px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                      isActive("/categories")
                        ? "text-primary-400"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {isActive("/categories") && (
                      <div className="absolute inset-0 bg-primary-500/10 rounded-xl border border-primary-500/20"></div>
                    )}
                    <div className="relative flex items-center space-x-2.5">
                      <Tag className="w-4.5 h-4.5" />
                      <span>Categorías</span>
                    </div>
                  </Link>

                  <Link
                    to="/expenses#users"
                    className={`group relative px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                      location.pathname === "/expenses" && location.hash === "#users"
                        ? "text-primary-400"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {location.pathname === "/expenses" && location.hash === "#users" && (
                      <div className="absolute inset-0 bg-primary-500/10 rounded-xl border border-primary-500/20"></div>
                    )}
                    <div className="relative flex items-center space-x-2.5">
                      <Users className="w-4.5 h-4.5" />
                      <span>Usuarios</span>
                    </div>
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Saldo y Acciones del Usuario */}
          <div className="flex items-center space-x-4">
            {/* Saldo Total / Saldos por moneda */}

            {userProfile && (
              <div className="hidden md:flex items-center space-x-3 px-5 py-2.5 bg-dark-850 rounded-xl border border-dark-700">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-accent-green/20 to-accent-cyan/20">
                  <Wallet className="w-4 h-4 text-accent-green" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">
                    Saldo
                  </span>
                  <div className="flex items-center space-x-2">
                    {Array.isArray(localBalances) && localBalances.length > 0 ? (
                      localBalances.map((b: { currency: string; balance: number }) => (
                        <span key={b.currency} className={`text-sm font-semibold ${b.balance >= 0 ? 'text-accent-green' : 'text-red-400'}`}>
                          {b.currency} {Number(b.balance).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </span>
                      ))
                    ) : (
                      <span className={`text-sm font-bold ${userProfile.balance >= 0 ? 'text-accent-green' : 'text-red-400'}`}>
                        {formatBalance(userProfile.balance || 0)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Perfil de Usuario */}
            <div className="flex items-center space-x-3 px-4 py-2 bg-dark-850 rounded-xl border border-dark-700">
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-200">
                  {userProfile?.name || user?.name}
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  {userProfile?.role || 'Usuario'}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-violet flex items-center justify-center font-bold text-white shadow-glow-sm">
                {(userProfile?.name || user?.name || 'U').charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Botón de Configuración */}
            {onSettingsClick && (
              <button
                onClick={onSettingsClick}
                className="p-2.5 rounded-xl bg-dark-850 border border-dark-700 text-amber-500 hover:bg-dark-800 hover:border-amber-500/30 transition-all duration-200 group"
                title="Configuración"
              >
                <KeyRound className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </button>
            )}

            {/* Botón de Tema */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-dark-850 border border-dark-700 text-gray-400 hover:bg-dark-800 hover:text-primary-400 hover:border-primary-500/30 transition-all duration-200"
              title="Cambiar tema"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Botón de Logout */}
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-dark-850 border border-dark-700 text-gray-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all duration-200"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
