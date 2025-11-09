import { useAuth } from "@/react-app/hooks/useAuth";
import { Link, useLocation } from "react-router";
import { Receipt, LogOut, Moon, Sun, Settings, CloudMoon, FileText } from "lucide-react";
import { useTheme } from "@/react-app/hooks/useTheme";

interface HeaderProps {
  userProfile?: any;
}

export default function Header({ userProfile }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b-2 border-indigo-500/30 shadow-xl backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/expenses" className="group flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur-md group-hover:blur-lg transition-all duration-300 opacity-75 group-hover:opacity-100"></div>
                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-300">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:from-indigo-300 group-hover:via-purple-300 group-hover:to-pink-300 transition-all duration-300">
                  ExpenseFlow
                </span>
                <div className="text-xs text-slate-400 font-medium -mt-1">Control Total</div>
              </div>
            </Link>

            <nav className="flex space-x-2 bg-slate-800/50 rounded-lg p-1 backdrop-blur-sm border border-slate-700/50">
              <Link
                to="/expenses"
                className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 ${
                  isActive("/expenses")
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/50"
                    : "text-slate-300 hover:text-white hover:bg-slate-700"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Receipt className="w-4 h-4" />
                  <span>Gastos</span>
                </div>
              </Link>
              
              {/* Mostrar Configuración solo para admin/supervisor */}
              {(userProfile?.role === 'admin' || userProfile?.role === 'supervisor') && (
                <Link
                  to="/settings"
                  className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 ${
                    isActive("/settings") || isActive("/categories")
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/50"
                      : "text-slate-300 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Configuración</span>
                  </div>
                </Link>
              )}

              {/* Documentación - visible para todos */}
              <Link
                to="/documentation"
                className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 ${
                  isActive("/documentation")
                    ? "bg-pink-600 text-white shadow-lg shadow-pink-500/50"
                    : "text-slate-300 hover:text-white hover:bg-slate-700"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Docs</span>
                </div>
              </Link>

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
                <span className="text-lg font-bold text-emerald-400">
                  ${userProfile.balance?.toFixed(2) || '0.00'}
                </span>
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
              <div className="text-sm">
                <div className="font-bold text-white">
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
