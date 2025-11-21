import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, PieLabelRenderProps } from "recharts";

interface CategoryChartProps {
  data: Array<{ category: string; total: number; count: number }>;
}

const COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#f97316", // orange
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
];

export default function CategoryChart({ data }: CategoryChartProps) {
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gastos por Categoría</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Distribución de gastos</p>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-400">
          No hay datos disponibles
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: PieLabelRenderProps) => {
                  const percent = Number(props.percent) || 0;
                  const name = String(props.name) || '';
                  return `${name}: ${(percent * 100).toFixed(0)}%`;
                }}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "8px 12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-6 space-y-2">
            {data.map((item, index) => (
              <div
                key={item.category}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.category}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({item.count} {item.count === 1 ? "gasto" : "gastos"})
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(item.total)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
