import { Check } from '../types/check';

type ChequesTableProps = {
  cheques: Check[];
  onStatusChange: (checkId: number, newStatus: string) => void;
};

const statusOptions = ['en cartera', 'depositado', 'endosado', 'pagado', 'rechazado', 'anulado'];

const getDaysRemaining = (dueDate: string) => {
  const today = new Date();
  const due = new Date(dueDate);
  // Set hours to 0 to compare dates only
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function ChequesTable({ cheques, onStatusChange }: ChequesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left text-gray-400">
        <thead className="text-xs text-gray-300 uppercase bg-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3">Tipo</th>
            <th scope="col" className="px-6 py-3">Número</th>
            <th scope="col" className="px-6 py-3">Banco</th>
            <th scope="col" className="px-6 py-3">Emisor/Beneficiario</th>
            <th scope="col" className="px-6 py-3">Vencimiento</th>
            <th scope="col" className="px-6 py-3">Días Rest.</th>
            <th scope="col" className="px-6 py-3">Importe</th>
            <th scope="col" className="px-6 py-3">Estado</th>
            <th scope="col" className="px-6 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cheques.map((cheque) => {
            const daysRemaining = getDaysRemaining(cheque.fecha_vencimiento);
            return (
              <tr key={cheque.id} className="bg-gray-800 border-b border-gray-700">
                <td className="px-6 py-4">{cheque.tipo}</td>
                <td className="px-6 py-4">{cheque.numero_cheque}</td>
                <td className="px-6 py-4">{cheque.banco}</td>
                <td className="px-6 py-4">{cheque.emisor_beneficiario}</td>
                <td className="px-6 py-4">{new Date(cheque.fecha_vencimiento).toLocaleDateString()}</td>
                <td className={`px-6 py-4 font-bold ${daysRemaining < 0 ? 'text-red-500' : daysRemaining <= 7 ? 'text-yellow-500' : 'text-white'}`}>
                  {daysRemaining}
                </td>
                <td className="px-6 py-4">{cheque.importe.toLocaleString('es-AR', { style: 'currency', currency: cheque.moneda })}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    cheque.estado === 'pagado' ? 'bg-green-100 text-green-800' :
                    cheque.estado === 'rechazado' || cheque.estado === 'anulado' ? 'bg-red-100 text-red-800' :
                    cheque.estado === 'en cartera' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {cheque.estado}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={cheque.estado}
                    onChange={(e) => onStatusChange(cheque.id, e.target.value)}
                    className="rounded-md bg-gray-700 border-gray-600 text-white text-xs"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
