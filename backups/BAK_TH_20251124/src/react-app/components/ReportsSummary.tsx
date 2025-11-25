// KPI icons removed — no longer needed here

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

  // KPI cards removed — render a compact inline summary instead
  return (
    <div className="flex items-center gap-6">
      <div className="text-sm text-gray-500 dark:text-gray-400">Total Gastos</div>
      <div className="font-semibold text-gray-900 dark:text-white">{formatCurrency(totals.total_amount)}</div>

      <div className="text-sm text-gray-500 dark:text-gray-400">Número</div>
      <div className="font-semibold text-gray-900 dark:text-white">{totals.total_count}</div>

      <div className="text-sm text-gray-500 dark:text-gray-400">Promedio</div>
      <div className="font-semibold text-gray-900 dark:text-white">{formatCurrency(averageExpense)}</div>
    </div>
  );
}
