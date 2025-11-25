import { Receipt, Database, FileSpreadsheet, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/react-app/hooks/useAuth';
import argentinaFlag from '@/react-app/assets/argentina.svg';

export default function Sidebar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role || 'usuario';

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#10121a] border-r border-gray-800 p-4 space-y-4 text-white">
      <div className="flex items-center gap-3 px-3 py-2">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
          <Receipt className="w-5 h-5 text-white" />
        </div>
          <div>
          <div className="text-lg font-bold flex items-center gap-2">
            <span>ExpenseFlow</span>
            <img src={argentinaFlag} alt="Bandera Argentina" className="w-6 h-4 object-cover rounded-sm" />
          </div>
          <div className="text-xs text-slate-400">Control total</div>
        </div>
      </div>
      
      <nav className="flex-1 px-2">
        <ul className="space-y-1">
          {/* Dashboard is visible for all roles */}
          <li>
            <button onClick={() => navigate('/expenses')} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 w-full text-left">
              <Receipt className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          </li>

          {/* Reports visible for admin & supervisor */}
          {(role === 'admin' || role === 'supervisor') && (
            <li>
              <button onClick={() => navigate('/reports')} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 w-full text-left">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Reportes</span>
              </button>
            </li>
          )}

          {/* Users removed from left sidebar per UX request. */}

          {/* Settings visible for ALL roles so every user can change their own password */}
          <li>
            <button onClick={() => navigate('/settings')} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 w-full text-left">
              <SettingsIcon className="w-4 h-4" />
              <span>Configuración</span>
            </button>
          </li>

          {/* CIERRE DE VIAJE visible to admin & supervisor at top-level (same level as Configuración) */}
          {(role === 'admin' || role === 'supervisor') && (
            <li>
              <button onClick={() => navigate('/cierre-viajes')} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 w-full text-left">
                <span className="w-4 h-4">🧳</span>
                <span>CIERRE DE VIAJE</span>
              </button>
            </li>
          )}

          {/* DBA only visible to admin */}
          {role === 'admin' && (
            <li>
              <div className="flex flex-col gap-1">
                <button onClick={() => { navigate('/expenses'); setTimeout(()=> { window.location.hash = '#dba'; }, 50); }} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 w-full text-left">
                  <Database className="w-4 h-4" />
                  <span>DBA</span>
                </button>
                {/* kept inside DBA for admins if needed, but the top-level link covers supervisor & admin */}
              </div>
            </li>
          )}

          {/* Docs visible for admin & supervisor & usuario (everyone) */}
          <li>
            <button onClick={() => navigate('/documentation')} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 w-full text-left">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Docs</span>
            </button>
          </li>

        </ul>
      </nav>
    </aside>
  );
}
