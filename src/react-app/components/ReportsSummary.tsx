import { Wallet, Receipt, TrendingUp } from "lucide-react";

interface ReportsSummaryProps {
  totals: {
    total_amount: number;
    total_count: number;
  };
  isTransaction?: boolean;
  currencyBreakdown?: Array<{ currency: string; total: number; count: number }>;
}

export default function ReportsSummary({ totals, isTransaction = false, currencyBreakdown = [] }: ReportsSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount || 0);
  };

  const averageExpense = totals.total_count > 0 
    ? totals.total_amount / totals.total_count 
    : 0;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            <Wallet className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          {formatCurrency(totals.total_amount)}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300">{isTransaction ? 'Total de Saldos' : 'Total de Gastos'}</div>
      </div>
      {isTransaction && currencyBreakdown && currencyBreakdown.length > 0 && (
        <div className="mt-4 p-4 rounded bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Resumen por Moneda</h4>
          <div className="flex gap-3 flex-wrap">
            {currencyBreakdown.map(c => (
              <div key={c.currency} className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium">{c.currency}</div>
                <div className="text-sm">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: c.currency }).format(c.total || 0)}</div>
                <div className="text-xs text-gray-500">{c.count} transacción{c.count !== 1 ? 'es' : ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
            <Receipt className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          {totals.total_count}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300">{isTransaction ? 'Número de Transacciones' : 'Número de Gastos'}</div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-md">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          {formatCurrency(averageExpense)}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300">{isTransaction ? 'Promedio por Transacción' : 'Gasto Promedio'}</div>
      </div>
    </div>
  );
}
