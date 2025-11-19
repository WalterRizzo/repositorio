import { PieChart, Pie, ResponsiveContainer, Tooltip } from "recharts";

interface CategoryChartProps {
  data: Array<{ category: string; total: number; count: number }>;
  title?: string;
  subtitle?: string;
  itemLabel?: string; // singular label for items (e.g., 'gasto' or 'transacción')
}

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
];

export default function CategoryChart({ data, title = 'Gastos por Categoría', subtitle = 'Distribución de gastos', itemLabel = 'gasto' }: CategoryChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const chartData = data.map((item) => ({
    name: item.category,
    value: item.total,
    count: item.count,
  }));

  // Layout: chart on the left (small), legend on the right (flex)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{subtitle}</p>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">No hay datos disponibles</div>
      ) : (
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="w-full md:w-1/2 h-56 md:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1">
            <div className="mt-2 grid grid-cols-1 gap-2">
              {data.map((item, index) => (
                <div key={item.category} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{item.category}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">({item.count} {item.count === 1 ? itemLabel : `${itemLabel}s`})</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 
