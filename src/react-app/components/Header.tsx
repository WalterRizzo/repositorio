import { useEffect, useState } from 'react';
import { useAuth } from "@/react-app/hooks/useAuth";
import { Link } from "react-router";
import argentinaFlag from '@/react-app/assets/argentina.svg';
import { Receipt, LogOut, Moon, Sun, CloudMoon } from "lucide-react";
import { useTheme } from "@/react-app/hooks/useTheme";

interface HeaderProps {
  userProfile?: any;
}

export default function Header({ userProfile }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
  };

  // kept for possible future usage, but not currently used

  const [localBalances, setLocalBalances] = useState<Array<{currency:string; balance:number}> | null>(Array.isArray(userProfile?.balances) ? userProfile.balances : null);

  useEffect(() => {
    let mounted = true;
    // If the prop doesn't contain balances, try to fetch them for this user (handles pages passing `user` instead of full profile)
    if (userProfile && !Array.isArray(userProfile.balances)) {
      (async () => {
        try {
          const resp = await fetch('/api/users/me/balances');
          if (!resp.ok) return;
          const json = await resp.json();
          if (mounted && Array.isArray(json.balances)) setLocalBalances(json.balances);
        } catch (e) {
          // ignore
        }
      })();
    }
    return () => { mounted = false; };
  }, [userProfile]);

  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b-2 border-indigo-500/30 shadow-xl backdrop-blur-sm w-full sticky top-0 z-50">
  <div className="w-full lg:max-w-8xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-16 gap-y-2 sm:gap-0 w-full">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-8 w-full">
            <Link to="/expenses" className="group flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur-md group-hover:blur-lg transition-all duration-300 opacity-75 group-hover:opacity-100"></div>
                <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-300">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:from-indigo-300 group-hover:via-purple-300 group-hover:to-pink-300 transition-all duration-300">
                    ExpenseFlow
                  </span>
                  <img src={argentinaFlag} className="w-5 h-3 object-cover rounded-sm" alt="Argentina" />
                </div>
                <div className="text-xs text-slate-400 font-medium -mt-1">Control Total</div>
              </div>
            </Link>

              <nav className="flex space-x-2 bg-slate-800/50 rounded-lg p-1 backdrop-blur-sm border border-slate-700/50 overflow-x-auto w-full">
              {/* Removed top nav 'Gastos' and 'Configuración' to keep them in the Sidebar per UX change request */}

              {/* Documentación - visible para todos */}
              {/* Docs moved to sidebar per UX request */}

            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {userProfile && (
              <div className="flex items-center space-x-3 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700/50 backdrop-blur-sm">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md ${
                  userProfile.role === 'admin' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' :
                  userProfile.role === 'supervisor' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' :
                  'bg-gradient-to-r from-slate-600 to-slate-500 text-white'
                }`}>
                  {userProfile.role}
                </span>
                <div className="flex items-center space-x-3">
                  {/* show multi-currency balances when available */}
                  {Array.isArray(localBalances) && localBalances.length > 0 ? (
                    localBalances.map((b: { currency: string; balance: number }) => (
                      <span key={b.currency} className="text-sm font-bold px-2 py-1 rounded-md bg-emerald-900/30 text-emerald-300 border border-emerald-700/30">
                        {b.currency} {Number(b.balance).toFixed(2)}
                      </span>
                    ))
                    ) : (
                    <span className="text-lg font-bold text-emerald-400">
                      ${userProfile.balance?.toFixed(2) || '0.00'}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <button
              onClick={toggleTheme}
              className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200 hover:scale-110"
              title={`Tema actual: ${theme === 'light' ? 'Claro' : theme === 'twilight' ? 'Crepúsculo' : 'Oscuro'} - Click para cambiar`}
            >
              {theme === 'light' ? <Sun className="w-5 h-5 text-amber-400" /> : 
               theme === 'twilight' ? <CloudMoon className="w-5 h-5 text-indigo-400" /> : 
               <Moon className="w-5 h-5 text-violet-400" />}
            </button>
            
            <div className="flex items-center space-x-3 bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700/50 backdrop-blur-sm">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur opacity-75"></div>
                <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                  {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="text-sm max-w-[160px]">
                <div className="font-bold text-white truncate whitespace-nowrap">
                  {user?.name || user?.email}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/30 hover:border-red-500 rounded-lg transition-all duration-200 font-semibold hover:shadow-lg hover:shadow-red-500/50"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
