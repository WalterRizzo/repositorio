// React import removed; using JSX transform

interface ExportModalProps {
  open: boolean;
  filename: string;
  onClose: () => void;
  onChangeFilename: (name: string) => void;
  onConfirm: () => void;
  exportOnlyVisible: boolean;
  setExportOnlyVisible: (v: boolean) => void;
}

export default function ExportModal({ open, filename, onClose, onChangeFilename, onConfirm, exportOnlyVisible, setExportOnlyVisible }: ExportModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-2">Exportar a Excel</h3>
        <p className="text-sm text-gray-500 mb-4">Configura el nombre del archivo y opciones de exportación.</p>
        <div className="mb-3">
          <label className="text-xs text-gray-600 block mb-1">Nombre de archivo</label>
          <input className="w-full px-3 py-2 rounded bg-gray-100 dark:bg-gray-700" value={filename} onChange={(e) => onChangeFilename(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="flex items-center space-x-2">
            <input type="checkbox" checked={exportOnlyVisible} onChange={(e) => setExportOnlyVisible(e.target.checked)} />
            <span className="text-sm">Exportar solo visible</span>
          </label>
        </div>
        <div className="flex items-center justify-end space-x-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-200">Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-500">Exportar</button>
        </div>
      </div>
    </div>
  );
}
