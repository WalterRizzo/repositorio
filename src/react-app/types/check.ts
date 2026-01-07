export type Check = {
  id: number;
  tipo: 'propio' | 'tercero';
  numero_cheque: string;
  banco: string;
  emisor_beneficiario: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  importe: number;
  moneda: string;
  estado: 'en cartera' | 'depositado' | 'endosado' | 'pagado' | 'rechazado' | 'anulado';
  observaciones?: string;
  created_at: string;
  updated_at: string;
};
