import React from 'react';
import { getStatusBadgeClasses } from '../utils/status';

interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  user: string;
  amount: string;
  currency: string;
  payment: string;
  sigla: string;
  status: string;
  attachments?: string[];
}

interface Props {
  expenses: Expense[];
}

export const ModernExpensesGrid: React.FC<Props> = ({ expenses }) => (
  <div className="app-table-container rounded-2xl p-4 bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-gray-900/50 border border-violet-500/20 shadow-xl backdrop-blur-sm">
    <table className="app-table">
      <thead>
        <tr className="bg-gradient-to-r from-gray-800 to-gray-900/80 border-b border-gray-700/30">
          <th className="px-5 py-3 text-left text-[13px] sm:text-[15px] font-extrabold text-white uppercase tracking-wider">FECHA</th>
          <th className="px-4 py-3 text-left text-[13px] sm:text-[15px] font-extrabold text-white uppercase tracking-wider">CATEGORÍA</th>
          <th className="px-4 py-3 text-left text-[13px] sm:text-[15px] font-extrabold text-white uppercase tracking-wider">DESCRIPCIÓN</th>
          <th className="px-4 py-3 text-left text-[13px] sm:text-[15px] font-extrabold text-white uppercase tracking-wider">CARGADO POR</th>
          <th className="px-4 py-3 text-left text-[13px] sm:text-[15px] font-extrabold text-white uppercase tracking-wider">MONTO</th>
          <th className="px-4 py-3 text-left text-[13px] sm:text-[15px] font-extrabold text-white uppercase tracking-wider">MONEDA</th>
          <th className="px-4 py-3 text-left text-[13px] sm:text-[15px] font-extrabold text-white uppercase tracking-wider">FORMA</th>
          <th className="px-4 py-3 text-left text-[13px] sm:text-[15px] font-extrabold text-white uppercase tracking-wider">ESTADO</th>
          <th className="px-4 py-3 text-left text-[13px] sm:text-[15px] font-extrabold text-white uppercase tracking-wider">ARCHIVOS</th>
          <th className="px-4 py-3 text-left text-[13px] sm:text-[15px] font-extrabold text-white uppercase tracking-wider">ACCIONES</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-800/50">
          {expenses.map(exp => (
            <tr key={exp.id} className="hover:bg-white/5 transition-all text-[15px] sm:text-[16px] font-semibold text-gray-100 dark:text-white">
              <td className="px-5 py-3 whitespace-nowrap text-sm sm:text-base">{exp.date}</td>
              <td className="px-4 py-3 whitespace-nowrap">{exp.category}</td>
              <td className="px-4 py-3 max-w-[260px] truncate text-sm sm:text-base" title={exp.description}>{exp.description && exp.description.length > 60 ? exp.description.slice(0, 57) + '...' : exp.description}</td>
              <td className="px-4 py-3 whitespace-nowrap">{exp.user}</td>
              <td className="px-4 py-3 whitespace-nowrap">{exp.amount}</td>
              <td className="px-4 py-3 whitespace-nowrap">{exp.currency}</td>
              <td className="px-4 py-3 whitespace-nowrap">{exp.sigla}</td>
              <td className="px-4 py-3 whitespace-nowrap"><span className={`px-3 py-1 rounded-full text-sm font-semibold border border-gray-700/40 ${getStatusBadgeClasses(exp.status as any)}`}>{exp.status}</span></td>
              <td className="px-4 py-3 whitespace-nowrap">{exp.attachments?.length ? `${exp.attachments.length} archivo(s)` : '-'}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex gap-2">
                  {/* Solo mostrar editar si está aprobado, y ocultar eliminar */}
                    {exp.status === 'aprobado' ? (
                    <button className="px-2 py-1 border border-gray-600 text-gray-200 rounded opacity-80 cursor-default bg-transparent" title="Ver gasto aprobado" disabled>
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M4 20h4l10.5-10.5a2.121 2.121 0 0 0-3-3L5 17v3z"/></svg>
                    </button>
                  ) : (
                    <>
                      <button className="px-2 py-1 border border-gray-600 hover:bg-gray-700/40 text-gray-200 rounded transition-colors" title="Editar">
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M4 20h4l10.5-10.5a2.121 2.121 0 0 0-3-3L5 17v3z"/></svg>
                      </button>
                      <button className="px-2 py-1 border border-gray-600 hover:bg-gray-700/40 text-gray-200 rounded transition-colors" title="Eliminar">
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zm3-9h2v6h-2V10zm4 0h2v6h-2V10z"/></svg>
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
    <div className="flex items-center justify-between bg-gradient-to-r from-gray-900/70 to-gray-800/70 text-gray-100 rounded-b-xl px-4 py-3 mt-2 border border-gray-700/30">
      <span className="text-[14px] sm:text-[15px] font-semibold">Mostrando 1 - {expenses.length} de {expenses.length} movimientos</span>
      <div className="flex items-center gap-x-2">
        <button className="px-3 py-1 bg-transparent hover:bg-gray-700/40 text-gray-200 rounded text-[14px] sm:text-[15px] font-semibold border border-gray-700/40">« Primera</button>
        <button className="px-3 py-1 bg-transparent hover:bg-gray-700/40 text-gray-200 rounded text-[14px] sm:text-[15px] font-semibold border border-gray-700/40">‹ Anterior</button>
        <span className="px-3 py-1 bg-transparent text-gray-200 rounded text-[14px] sm:text-[15px]">Página 1 de 1</span>
        <button className="px-3 py-1 bg-transparent hover:bg-gray-700/40 text-gray-200 rounded text-[14px] sm:text-[15px] font-semibold border border-gray-700/40">Siguiente ›</button>
        <button className="px-3 py-1 bg-transparent hover:bg-gray-700/40 text-gray-200 rounded text-[14px] sm:text-[15px] font-semibold border border-gray-700/40">Última »</button>
      </div>
    </div>
  </div>
);
