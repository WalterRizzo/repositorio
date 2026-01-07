import React from 'react';

export type FilterState = {
  banco: string;
  estado: string;
  fechaDesde: string;
  fechaHasta: string;
  importeDesde: string;
  importeHasta: string;
};

type ChequesFiltersProps = {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
};

const statusOptions = ['en cartera', 'depositado', 'endosado', 'pagado', 'rechazado', 'anulado'];

export default function ChequesFilters({ filters, onFilterChange, onReset }: ChequesFiltersProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onFilterChange({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="col-span-1 md:col-span-3 lg:col-span-4">
          <h3 className="text-lg font-semibold text-white">Filtros</h3>
        </div>
        <input
          type="text"
          name="banco"
          value={filters.banco}
          onChange={handleChange}
          placeholder="Filtrar por banco..."
          className="rounded-md bg-gray-700 border-gray-600 text-white p-2"
        />
        <select
          name="estado"
          value={filters.estado}
          onChange={handleChange}
          className="rounded-md bg-gray-700 border-gray-600 text-white p-2"
        >
          <option value="">Todos los estados</option>
          {statusOptions.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <div>
          <label className="text-xs text-gray-400">Vencimiento Desde</label>
          <input
            type="date"
            name="fechaDesde"
            value={filters.fechaDesde}
            onChange={handleChange}
            className="w-full rounded-md bg-gray-700 border-gray-600 text-white p-2"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400">Vencimiento Hasta</label>
          <input
            type="date"
            name="fechaHasta"
            value={filters.fechaHasta}
            onChange={handleChange}
            className="w-full rounded-md bg-gray-700 border-gray-600 text-white p-2"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400">Importe Desde</label>
          <input
            type="number"
            name="importeDesde"
            value={filters.importeDesde}
            onChange={handleChange}
            placeholder="Desde..."
            className="w-full rounded-md bg-gray-700 border-gray-600 text-white p-2"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400">Importe Hasta</label>
          <input
            type="number"
            name="importeHasta"
            value={filters.importeHasta}
            onChange={handleChange}
            placeholder="Hasta..."
            className="w-full rounded-md bg-gray-700 border-gray-600 text-white p-2"
          />
        </div>
        <div className="col-start-1">
          <button
            onClick={onReset}
            className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>
  );
}
