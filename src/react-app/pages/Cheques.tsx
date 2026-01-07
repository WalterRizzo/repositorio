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
import ChequesAlertBanner from '../components/ChequesAlertBanner';
import * as XLSX from 'xlsx';

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
  const [alertData, setAlertData] = useState<any>(null);

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
    try {
      const res = await api.checks.summary.$get();
      const data = (await res.json()) as any;
      if (data.ok) {
        setSummary(data.data);
        // Extraer datos de alertas
        setAlertData({
          overdueCount: data.alerts?.overdueCount || 0,
          upcoming7Count: data.upcoming?.['7_days']?.count || 0,
          overdueTotal: data.alerts?.overdue?.reduce((sum: number, c: any) => sum + (c.importe || 0), 0) || 0,
          upcoming7Total: data.upcoming?.['7_days']?.total || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
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
      
      if (!res.ok) {
        // Handle HTTP error
        try {
          const errorData = await res.json() as any;
          const errorMsg = errorData.error || errorData.message || `HTTP ${res.status}`;
          alert(`Error: ${errorMsg}`);
        } catch {
          alert(`Error HTTP ${res.status}: No se pudo decodificar la respuesta`);
        }
        return;
      }
      
      // Parse success response
      const responseData = await res.json() as any;
      
      if (responseData.ok) {
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

    // Prepare data for Excel with proper formatting
    const dataForExcel = cheques.map(cheque => ({
      'ID': cheque.id,
      'Tipo': cheque.tipo,
      'Número': cheque.numero_cheque,
      'Banco': cheque.banco,
      'Emisor/Beneficiario': cheque.emisor_beneficiario,
      'Fecha Emisión': cheque.fecha_emision,
      'Fecha Vencimiento': cheque.fecha_vencimiento,
      'Importe': cheque.importe,
      'Moneda': cheque.moneda,
      'Estado': cheque.estado,
      'Observaciones': cheque.observaciones || '',
      'Fecha Creación': cheque.created_at,
      'Última Actualización': cheque.updated_at,
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cheques');

    // Set column widths for better readability
    worksheet['!cols'] = [
      { wch: 5 },   // ID
      { wch: 12 },  // Tipo
      { wch: 15 },  // Número
      { wch: 15 },  // Banco
      { wch: 20 },  // Emisor/Beneficiario
      { wch: 15 },  // Fecha Emisión
      { wch: 18 },  // Fecha Vencimiento
      { wch: 12 },  // Importe
      { wch: 10 },  // Moneda
      { wch: 15 },  // Estado
      { wch: 20 },  // Observaciones
      { wch: 20 },  // Fecha Creación
      { wch: 20 },  // Última Actualización
    ];

    // Generate filename with date
    const filename = `reporte_cheques_${new Date().toISOString().slice(0, 10)}.xlsx`;
    
    // Write Excel file
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-4">
          {/* Alert Banner for Overdue and Upcoming Cheques */}
          {alertData && (
            <ChequesAlertBanner 
              overdueCount={alertData.overdueCount}
              upcoming7Count={alertData.upcoming7Count}
              overdueTotal={alertData.overdueTotal}
              upcoming7Total={alertData.upcoming7Total}
            />
          )}
          <ChequesSummary summary={summary} />
          <ChequesFilters filters={filters} onFilterChange={setFilters} onReset={handleFilterReset} />
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Administración de Cheques</h1>
            <div>
              <button onClick={handleRegisterCheque} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">
                Registrar Cheque
              </button>
              <button onClick={handleExport} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Exportar a Excel
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
