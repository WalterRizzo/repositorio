type SummaryData = {
  totalPorVencer: {
    '7dias': number;
    '15dias': number;
    '30dias': number;
  };
  totalPorBanco: Record<string, number>;
  totalPorEstado: Record<string, number>;
  chequesVencidos: number;
  chequesProximosAVencer: number;
};

type ChequesSummaryProps = {
  summary: SummaryData | null;
};

const SummaryCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="bg-gray-800 p-4 rounded-lg">
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    {children}
  </div>
);

export default function ChequesSummary({ summary }: ChequesSummaryProps) {
  if (!summary) {
    return <div>Cargando resumen...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
      <SummaryCard title="Alertas">
        <p>Vencidos: <span className="font-bold text-red-500">{summary.chequesVencidos}</span></p>
        <p>Próximos a Vencer (7 días): <span className="font-bold text-yellow-500">{summary.chequesProximosAVencer}</span></p>
      </SummaryCard>

      <SummaryCard title="Totales por Vencer">
        <p>7 días: <span className="font-bold">${summary.totalPorVencer['7dias'].toLocaleString()}</span></p>
        <p>15 días: <span className="font-bold">${summary.totalPorVencer['15dias'].toLocaleString()}</span></p>
        <p>30 días: <span className="font-bold">${summary.totalPorVencer['30dias'].toLocaleString()}</span></p>
      </SummaryCard>

      <SummaryCard title="Totales por Estado">
        {Object.entries(summary.totalPorEstado).map(([estado, total]) => (
          <p key={estado}>{estado}: <span className="font-bold">${total.toLocaleString()}</span></p>
        ))}
      </SummaryCard>

      <SummaryCard title="Totales por Banco">
        {Object.entries(summary.totalPorBanco).map(([banco, total]) => (
          <p key={banco}>{banco}: <span className="font-bold">${total.toLocaleString()}</span></p>
        ))}
      </SummaryCard>
    </div>
  );
}
