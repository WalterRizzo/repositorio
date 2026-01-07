import { AlertCircle, AlertTriangle } from 'lucide-react';

export interface ChequesAlertBannerProps {
  overdueCount: number;
  upcoming7Count: number;
  overdueTotal?: number;
  upcoming7Total?: number;
}

export default function ChequesAlertBanner({ 
  overdueCount, 
  upcoming7Count, 
  overdueTotal = 0,
  upcoming7Total = 0 
}: ChequesAlertBannerProps) {
  // No mostrar nada si no hay alertas
  if (overdueCount === 0 && upcoming7Count === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-4">
      {/* Banner de cheques VENCIDOS */}
      {overdueCount > 0 && (
        <div className="bg-red-900 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-red-200 flex items-center gap-2">
              🚨 ¡CHEQUES VENCIDOS!
            </h3>
            <p className="text-red-100 text-sm mt-1">
              {overdueCount} cheque{overdueCount !== 1 ? 's' : ''} vencido{overdueCount !== 1 ? 's' : ''} por acción inmediata
              {overdueTotal > 0 && ` · Total: $${overdueTotal.toLocaleString('es-AR')}`}
            </p>
          </div>
        </div>
      )}

      {/* Banner de cheques PRÓXIMOS A VENCER (7 días) */}
      {upcoming7Count > 0 && (
        <div className="bg-yellow-900 border-l-4 border-yellow-500 p-4 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-yellow-200 flex items-center gap-2">
              ⚠️ Próximos a vencer
            </h3>
            <p className="text-yellow-100 text-sm mt-1">
              {upcoming7Count} cheque{upcoming7Count !== 1 ? 's' : ''} vencerá{upcoming7Count !== 1 ? 'n' : ''} en los próximos 7 días
              {upcoming7Total > 0 && ` · Total: $${upcoming7Total.toLocaleString('es-AR')}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
