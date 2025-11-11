import { useEffect, useState } from "react";
import ExpensesTable from "./ExpensesTable";

interface NegativeBalanceExpensesProps {
  currency: string;
  show: boolean;
  onClose: () => void;
}

export default function NegativeBalanceExpenses({ currency, show, onClose }: NegativeBalanceExpensesProps) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show) return;
    setLoading(true);
    fetch(`/api/expenses?currency=${currency}`)
      .then((res) => res.json())
      .then((data) => {
        // Filtrar solo gastos que contribuyen al saldo negativo
        const negativeExpenses = Array.isArray(data.expenses)
          ? data.expenses.filter((e: any) => e.amount > 0)
          : [];
        setExpenses(negativeExpenses);
      })
      .finally(() => setLoading(false));
  }, [currency, show]);

  if (!show) return null;

  return (
    <div className="mt-6">
      <div className="mb-2 text-rose-400 font-bold text-lg">Gastos que generaron el saldo negativo:</div>
      <ExpensesTable expenses={expenses} isLoading={loading} onEdit={() => {}} onDelete={() => {}} />
      <button onClick={onClose} className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-xl">Cerrar</button>
    </div>
  );
}
