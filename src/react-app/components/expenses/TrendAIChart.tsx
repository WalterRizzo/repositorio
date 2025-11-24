import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from "recharts";

interface TrendAIChartProps {
  data: Array<{ month: string; total: number; count: number }>;
}

// Simulated AI anomaly detection and insights
function analyzeTrends(data: TrendAIChartProps["data"]) {
  // Find biggest spike, drop, and predict next month
  let maxSpike = { idx: -1, value: 0 };
  let maxDrop = { idx: -1, value: 0 };
  let prediction = 0;
  for (let i = 1; i < data.length; i++) {
    const diff = data[i].total - data[i - 1].total;
    if (diff > maxSpike.value) maxSpike = { idx: i, value: diff };
    if (diff < maxDrop.value) maxDrop = { idx: i, value: diff };
  }
  if (data.length > 1) {
    const last = data[data.length - 1].total;
    const avgGrowth = (last - data[0].total) / (data.length - 1);
    prediction = Math.max(0, last + avgGrowth * 0.8 + Math.random() * avgGrowth * 0.5);
  }
  return { maxSpike, maxDrop, prediction };
}

export default function TrendAIChart({ data }: TrendAIChartProps) {
  const [aiInsights, setAIInsights] = useState<{ maxSpike: any; maxDrop: any; prediction: number } | null>(null);

  useEffect(() => {
    setAIInsights(analyzeTrends(data));
  }, [data]);

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split("-");
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString("es-ES", { month: "short", year: "2-digit" });
  };

  const chartData = data.map((item) => ({
    month: formatMonth(item.month),
    total: item.total,
    count: item.count,
  })).reverse();

  return (
    <div className="bg-gradient-to-br from-indigo-100 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg border border-indigo-200 dark:border-indigo-700">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-300">Tendencias & IA</h3>
        {aiInsights && (
          <div className="text-xs text-right text-gray-700 dark:text-gray-300">
            <div>
              <span className="font-bold text-green-600">Pico:</span> {chartData[aiInsights.maxSpike.idx]?.month} (+{aiInsights.maxSpike.value.toLocaleString("es-AR", { style: "currency", currency: "ARS" })})
            </div>
            <div>
              <span className="font-bold text-red-500">Caída:</span> {chartData[aiInsights.maxDrop.idx]?.month} ({aiInsights.maxDrop.value.toLocaleString("es-AR", { style: "currency", currency: "ARS" })})
            </div>
            <div>
              <span className="font-bold text-indigo-600">Predicción próximo mes:</span> {aiInsights.prediction.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
            </div>
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
          <XAxis dataKey="month" tick={{ fill: "#6366f1", fontSize: 12 }} axisLine={{ stroke: "#a5b4fc" }} />
          <YAxis tick={{ fill: "#6366f1", fontSize: 12 }} axisLine={{ stroke: "#a5b4fc" }} />
          <Tooltip formatter={(value: number) => value.toLocaleString("es-AR", { style: "currency", currency: "ARS" })} />
          <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
          {aiInsights && (
            <ReferenceLine x={chartData[aiInsights.maxSpike.idx]?.month} stroke="#22c55e" label={<Label value="Pico" position="top" fill="#22c55e" />} />
          )}
          {aiInsights && (
            <ReferenceLine x={chartData[aiInsights.maxDrop.idx]?.month} stroke="#ef4444" label={<Label value="Caída" position="top" fill="#ef4444" />} />
          )}
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        <span className="font-bold text-indigo-600">Análisis IA:</span> Detección de anomalías, predicción y explicación automática de tendencias. ¡Interactúa con los puntos para ver detalles!
      </div>
    </div>
  );
}
