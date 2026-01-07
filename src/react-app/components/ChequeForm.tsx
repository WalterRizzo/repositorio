import { useForm } from 'react-hook-form';
import { Check } from '../types/check';

type ChequeFormProps = {
  onSubmit: (data: Omit<Check, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
};

export default function ChequeForm({ onSubmit, onCancel }: ChequeFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<Omit<Check, 'id' | 'created_at' | 'updated_at'>>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="tipo" className="block text-sm font-medium text-gray-300">Tipo</label>
        <select {...register('tipo', { required: true })} className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white">
          <option value="propio">Propio</option>
          <option value="tercero">Tercero</option>
        </select>
      </div>

      <div>
        <label htmlFor="numero_cheque" className="block text-sm font-medium text-gray-300">Número de Cheque</label>
        <input {...register('numero_cheque', { required: true })} type="text" className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white" />
        {errors.numero_cheque && <span className="text-red-500 text-xs">Este campo es requerido</span>}
      </div>

      <div>
        <label htmlFor="banco" className="block text-sm font-medium text-gray-300">Banco</label>
        <input {...register('banco', { required: true })} type="text" className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white" />
        {errors.banco && <span className="text-red-500 text-xs">Este campo es requerido</span>}
      </div>

      <div>
        <label htmlFor="emisor_beneficiario" className="block text-sm font-medium text-gray-300">Emisor / Beneficiario</label>
        <input {...register('emisor_beneficiario', { required: true })} type="text" className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white" />
        {errors.emisor_beneficiario && <span className="text-red-500 text-xs">Este campo es requerido</span>}
      </div>

      <div>
        <label htmlFor="fecha_emision" className="block text-sm font-medium text-gray-300">Fecha de Emisión</label>
        <input {...register('fecha_emision', { required: true })} type="date" className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white" />
        {errors.fecha_emision && <span className="text-red-500 text-xs">Este campo es requerido</span>}
      </div>

      <div>
        <label htmlFor="fecha_vencimiento" className="block text-sm font-medium text-gray-300">Fecha de Vencimiento</label>
        <input {...register('fecha_vencimiento', { required: true })} type="date" className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white" />
        {errors.fecha_vencimiento && <span className="text-red-500 text-xs">Este campo es requerido</span>}
      </div>

      <div>
        <label htmlFor="importe" className="block text-sm font-medium text-gray-300">Importe</label>
        <input {...register('importe', { required: true, valueAsNumber: true })} type="number" step="0.01" className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white" />
        {errors.importe && <span className="text-red-500 text-xs">Este campo es requerido</span>}
      </div>

      <div>
        <label htmlFor="moneda" className="block text-sm font-medium text-gray-300">Moneda</label>
        <input {...register('moneda', { required: true })} type="text" defaultValue="ARS" className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white" />
        {errors.moneda && <span className="text-red-500 text-xs">Este campo es requerido</span>}
      </div>

      <div>
        <label htmlFor="estado" className="block text-sm font-medium text-gray-300">Estado</label>
        <select {...register('estado', { required: true })} className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white">
          <option value="en cartera">En Cartera</option>
          <option value="depositado">Depositado</option>
          <option value="endosado">Endosado</option>
          <option value="pagado">Pagado</option>
          <option value="rechazado">Rechazado</option>
          <option value="anulado">Anulado</option>
        </select>
      </div>

      <div>
        <label htmlFor="observaciones" className="block text-sm font-medium text-gray-300">Observaciones</label>
        <textarea {...register('observaciones')} className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"></textarea>
      </div>

      <div className="flex justify-end space-x-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-white bg-gray-600 hover:bg-gray-500">Cancelar</button>
        <button type="submit" className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-500">Guardar</button>
      </div>
    </form>
  );
}
