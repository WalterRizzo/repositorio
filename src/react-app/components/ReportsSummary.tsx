import { Wallet, Receipt, TrendingUp } from "lucide-react";

interface ReportsSummaryProps {
  totals: {
    total_amount: number;
    total_count: number;
  };
}

export default function ReportsSummary({ totals }: ReportsSummaryProps) {
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
        <div className="text-sm text-gray-600 dark:text-gray-300">Total de Gastos</div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
            <Receipt className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          {totals.total_count}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300">Número de Gastos</div>
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
        <div className="text-sm text-gray-600 dark:text-gray-300">Gasto Promedio</div>
      </div>
    </div>
  );
}
