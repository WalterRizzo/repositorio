import React from 'react';

interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  user: string;
  amount: string;
  currency: string;
  payment: string;
  status: string;
  attachments?: string[];
}

interface Props {
  expenses: Expense[];
}

export const ModernExpensesGrid: React.FC<Props> = ({ expenses }) => (
  <div className="app-table-container">
    <table className="app-table">
      <thead>
        <tr className="bg-gray-900">
          <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">Fecha</th>
          <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">Categoría</th>
          <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">Descripción</th>
          <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">Cargado por</th>
          <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">Monto</th>
          <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">Moneda</th>
          <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">Forma Pago</th>
          <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">Estado</th>
          <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">Archivos</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-700">
        {expenses.map(exp => (
          <tr key={exp.id} className="hover:bg-gray-800 transition-all text-xs font-bold text-white">
            <td className="px-4 py-3 whitespace-nowrap">{exp.date}</td>
            <td className="px-4 py-3 whitespace-nowrap">{exp.category}</td>
            <td className="px-4 py-3 max-w-[220px] truncate" title={exp.description}>{exp.description && exp.description.length > 60 ? exp.description.slice(0, 57) + '...' : exp.description}</td>
            <td className="px-4 py-3 whitespace-nowrap">{exp.user}</td>
            <td className="px-4 py-3 whitespace-nowrap">{exp.amount}</td>
            <td className="px-4 py-3 whitespace-nowrap">{exp.currency}</td>
            <td className="px-4 py-3 whitespace-nowrap">{exp.payment}</td>
            <td className="px-4 py-3 whitespace-nowrap"><span className={`status-badge status-${exp.status}`}>{exp.status}</span></td>
            <td className="px-4 py-3 whitespace-nowrap">{exp.attachments?.length ? `${exp.attachments.length} archivo(s)` : '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="flex items-center justify-between bg-black text-white rounded-b-xl px-4 py-3 mt-2">
      <span className="text-xs sm:text-sm font-semibold">Mostrando 1 - {expenses.length} de {expenses.length} gastos</span>
      <div className="flex items-center gap-x-2">
        <button className="px-3 py-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded text-sm font-bold shadow-lg">« Primera</button>
        <button className="px-3 py-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded text-sm font-bold shadow-lg">‹ Anterior</button>
        <span className="px-3 py-1 bg-white/10 text-white rounded text-sm">Página 1 de 1</span>
        <button className="px-3 py-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded text-sm font-bold shadow-lg">Siguiente ›</button>
        <button className="px-3 py-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded text-sm font-bold shadow-lg">Última »</button>
      </div>
    </div>
  </div>
);
