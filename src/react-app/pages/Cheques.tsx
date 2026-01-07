import Sidebar from "@/react-app/components/Sidebar";
import Header from "@/react-app/components/Header";
import { useEffect, useState } from "react";
import { Check } from "../types/check";
import ChequesTable from "../components/ChequesTable";
import Modal from '../components/Modal';
import ChequeForm from '../components/ChequeForm';
import { hc } from 'hono/client';
import type { AppType } from '@/client';
import ChequesSummary from '../components/ChequesSummary';
import ChequesFilters, { FilterState } from '../components/ChequesFilters';

const client = hc<AppType>('/');
const api = (client as any).api;

type SummaryData = {
  totalPorVencer: { '7dias': number; '15dias': number; '30dias': number; };
  totalPorBanco: Record<string, number>;
  totalPorEstado: Record<string, number>;
  chequesVencidos: number;
  chequesProximosAVencer: number;
};

const initialFilters: FilterState = {
  banco: '',
  estado: '',
  fechaDesde: '',
  fechaHasta: '',
  importeDesde: '',
  importeHasta: '',
};

export default function ChequesPage() {
  const [cheques, setCheques] = useState<Check[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const fetchCheques = async (currentFilters: FilterState) => {
    const res = await api.checks.$get({
      query: {
        ...currentFilters
      }
    });
    const data = await res.json();
    if (data.ok) {
      setCheques(data.data);
    }
  };

  const fetchSummary = async () => {
    const res = await api.checks.summary.$get();
    const data = await res.json();
    if (data.ok) {
      setSummary(data.data);
    }
  };

  useEffect(() => {
    fetchCheques(filters);
    fetchSummary(); // Maybe this should also be filtered? For now, it's global.
  }, [filters]);

  const handleStatusChange = async (checkId: number, newStatus: string) => {
    const res = await api.checks[':id'].status.$patch({
      param: { id: checkId.toString() },
      json: { status: newStatus },
    });

    if (res.ok) {
      fetchCheques(filters);
      fetchSummary();
    } else {
      const error = await res.json();
      alert(`Error al actualizar estado: ${error.message}`);
    }
  };

  const handleRegisterCheque = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitCheque = async (data: Omit<Check, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const res = await api.checks.$post({ json: data });
      const responseData = await res.json() as any;
      
      if (res.ok && responseData.ok) {
        fetchCheques(filters);
        fetchSummary();
        handleCloseModal();
        alert('Cheque registrado correctamente');
      } else {
        const errorMsg = responseData.error || responseData.message || 'Error desconocido';
        alert(`Error: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error submitting cheque:', error);
      alert(`Error al guardar el cheque: ${String(error)}`);
    }
  };

  const handleFilterReset = () => {
    setFilters(initialFilters);
  };

  const handleExport = () => {
    if (cheques.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    const headers = Object.keys(cheques[0]);
    const csvRows = [
      headers.join(','),
      ...cheques.map(row =>
        headers.map(fieldName =>
          JSON.stringify(row[fieldName as keyof Check], (_key, value) => value === null ? '' : value)
        ).join(',')
      )
    ];
    
    const csvString = csvRows.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `reporte_cheques_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-4">
          <ChequesSummary summary={summary} />
          <ChequesFilters filters={filters} onFilterChange={setFilters} onReset={handleFilterReset} />
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Administración de Cheques</h1>
            <div>
              <button onClick={handleRegisterCheque} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">
                Registrar Cheque
              </button>
              <button onClick={handleExport} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Exportar a CSV
              </button>
            </div>
          </div>
          <ChequesTable cheques={cheques} onStatusChange={handleStatusChange} />
        </main>
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Registrar Cheque">
          <ChequeForm onSubmit={handleSubmitCheque} onCancel={handleCloseModal} />
        </Modal>
      </div>
    </div>
  );
}
