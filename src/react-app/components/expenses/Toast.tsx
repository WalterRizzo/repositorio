// React import removed; using JSX transform

interface ToastProps {
  message: string;
  open: boolean;
  onClose: () => void;
}

export default function Toast({ message, open, onClose }: ToastProps) {
  if (!open) return null;
  return (
    <div className="fixed bottom-8 right-8 z-50">
      <div className="bg-indigo-600 text-white px-4 py-3 rounded shadow" role="status">
        <div className="flex items-center space-x-2">
          <span>{message}</span>
          <button className="ml-4 text-white/80" onClick={onClose}>✕</button>
        </div>
      </div>
    </div>
  );
}
