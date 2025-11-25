import { useState, useEffect, useRef } from "react";
import { X, Save, Upload, Eye, Wallet } from "lucide-react";
import type { Expense, TipoComprobante } from "@/shared/types";
import { EXPENSE_CATEGORIES } from "@/shared/types";
import { createWorker } from 'tesseract.js';
import { getRandomEmoji, getRandomEmojis } from '../../../epic-effects-library/effects/EmojiVariations';
import { playRandomSound } from '../../../epic-effects-library/sounds/SoundVariations';
import { getColorSet } from '../../../epic-effects-library/effects/ColorVariations';

interface ExpenseFormProps {
  expense: Expense | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ExpenseForm({
  expense,
  onSuccess,
  onCancel,
}: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    expense_date: "",
    use_balance: true, // Siempre marcado por defecto
    currency: "ARS",
    tipo_comprobante_id: "",
    sigla: "",
  });
  const [paymentMethods, setPaymentMethods] = useState<Array<{ sigla: string; descripcion: string; afectaSaldo?: number }>>([]);
  // Dynamic currencies list (load from server) — prevents hard-coded / inconsistent lists
  const [currenciesList, setCurrenciesList] = useState<Array<{ code: string; name?: string; symbol?: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [userBalance, setUserBalance] = useState(0);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Array<{file: File, preview: string}>>([]);
  const [existingAttachments, setExistingAttachments] = useState<Array<{id?: number, filename: string, originalName: string, url: string}>>([]);
  const [tipoComprobantes, setTipoComprobantes] = useState<TipoComprobante[]>([]);
  // Categories from DB (fallback to EXPENSE_CATEGORIES constant if the API returns none)
  const [categoriesList, setCategoriesList] = useState<Array<{ id?: number; name: string; description?: string; color?: string }>>([]);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [currentEmoji, setCurrentEmoji] = useState('🎉');
  const [particleEmojis, setParticleEmojis] = useState<string[]>([]);
  // Estado para mostrar el modal de previsualización
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [particleColors, setParticleColors] = useState<string[]>([]);
  // Background variant for preview: default / slate / warm  (keeps three clear, high-contrast choices)
  const [bgVariant, setBgVariant] = useState<'default' | 'slate' | 'warm'>('default');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isEditing = !!expense;
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  // Función para reproducir sonido de guardado (ahora con variación aleatoria)
  const playSaveSound = () => {
    playRandomSound('save', 0.25);
  };

  useEffect(() => {
    // Cargar tipos de comprobantes y formas de pago
    fetchTipoComprobantes();
    fetchFormapagos();
    fetchCategories();
    fetchCurrencies();
    
    // Cargar saldo inicial con la moneda del formulario
    if (formData.currency) {
      fetchUserBalance(formData.currency);
    }
    
    if (expense) {
      const expenseCurrency = expense.currency || "ARS";
      setFormData({
        description: expense.description,
        amount: expense.amount.toString(),
        category: expense.category,
        expense_date: expense.expense_date,
        use_balance: true, // Siempre usar el saldo
        currency: expenseCurrency,
        tipo_comprobante_id: expense.tipo_comprobante_id?.toString() || "",
        sigla: expense.sigla || "",
      });
      
      // Cargar saldo de la moneda del gasto
      fetchUserBalance(expenseCurrency);
      
      // Cargar archivos existentes
      fetchExistingAttachments(expense.id);
      
      // Mantener compatibilidad con receipt_photo_url
      if (expense.receipt_photo_url) {
        setReceiptPreview(`/api/files/${expense.receipt_photo_url}`);
      }
    } else {
      // Set today's date for new expenses
      const today = new Date().toISOString().split("T")[0];
      setFormData((prev) => ({ ...prev, expense_date: today }));
      // Cargar saldo inicial (ARS por defecto para nuevo gasto)
      fetchUserBalance('ARS');
    }
  }, [expense]);
  
  // useEffect separado para actualizar saldo cuando cambia la moneda
  useEffect(() => {
    console.log('🔥 useEffect formData.currency triggered:', formData.currency);
    if (formData.currency) {
      console.log('🔥 Calling fetchUserBalance with currency:', formData.currency);
      fetchUserBalance(formData.currency);
    }
  }, [formData.currency]);

  const fetchUserBalance = async (currency: string = 'ARS') => {
    try {
      console.log('💰 fetchUserBalance (multi) called with currency:', currency);

      // 1) Prefer the plural endpoint which returns all balances in one call
      const respAll = await fetch('/api/users/me/balances', { credentials: 'include' });
      console.log('💰 /balances Response status:', respAll.status);
      if (respAll.ok) {
        const allData = await respAll.json();
        console.log('💰 balances data received:', allData);

        // Normalize and find matching currency (exact match on currency code)
        if (Array.isArray(allData.balances)) {
          const found = allData.balances.find((b: any) => String(b.currency).toUpperCase() === String(currency).toUpperCase());
          if (found) {
            setUserBalance(Number(found.balance) || 0);
            return;
          }
        }
      }

      // 2) Fallback: ask the specific currency endpoint (legacy)
      console.log('💰 falling back to singular endpoint for currency:', currency);
      const response = await fetch(`/api/users/me/balance/${currency}`, { credentials: 'include' });
      console.log('💰 /balance/:currency Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('💰 Balance data received (fallback):', data);
        setUserBalance(Number(data.balance) || 0);
        return;
      }

      // If everything fails, set 0
      setUserBalance(0);
    } catch (error) {
      console.error('Error al cargar saldo:', error);
      setUserBalance(0);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) return setCategoriesList([]);
      const data = await res.json();
      if (Array.isArray(data)) {
        // API returns objects, map to simplified structure
        setCategoriesList(data.map((c:any) => ({ id: c.id, name: c.name || c.nombre || String(c.name), color: c.color })));
      }
    } catch (err) {
      console.error('Error loading categories', err);
      setCategoriesList([]);
    }
  };

  const fetchFormapagos = async () => {
    try {
      const res = await fetch('/api/formapagos');
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setPaymentMethods(data);
    } catch (err) {
      console.error('Error loading payment methods (formapagos)', err);
    }
  };

  const fetchCurrencies = async () => {
    try {
      const res = await fetch('/api/currencies');
      if (!res.ok) return setCurrenciesList([]);
      const data = await res.json();
      if (Array.isArray(data)) {
        // Normalize codes to uppercase
        setCurrenciesList(data.map((c:any) => ({ code: String(c.code).toUpperCase(), name: c.name, symbol: c.symbol })));
      }
    } catch (err) {
      console.error('Error loading currencies', err);
      setCurrenciesList([]);
    }
  };

  const fetchTipoComprobantes = async () => {
    try {
      const response = await fetch('/api/tipo-comprobantes', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setTipoComprobantes(data);
      }
    } catch (error) {
      console.error('Error al cargar tipos de comprobantes:', error);
    }
  };

  const fetchExistingAttachments = async (expenseId: number) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}/attachments`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.attachments) {
          setExistingAttachments(data.attachments);
        }
      }
    } catch (error) {
      console.error("Error al cargar archivos existentes:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError('El archivo es demasiado grande (máximo 5MB)');
        return;
      }
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setReceiptPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const extractAmountFromReceipt = async () => {
    if (!receiptFile) {
      setError('Primero selecciona una imagen');
      return;
    }

    try {
      setError('🔄 Analizando ticket con IA... Esto puede tardar unos segundos');
      
      // Crear worker de Tesseract
      const worker = await createWorker('spa'); // Español
      
      // Procesar imagen
      const { data: { text } } = await worker.recognize(receiptFile);
      
      console.log('📄 Texto extraído:', text);
      
      // Terminar worker
      await worker.terminate();
      
      // Buscar el importe en el texto
      const amount = extractAmountFromText(text);
      
      if (amount && amount > 0) {
        // OCR exitoso
        setFormData(prev => ({ ...prev, amount: amount.toString() }));
        setError(`💡 OCR detectó: $${amount} - Verificá que sea correcto`);
        
        // Enfocar el campo para verificación
        setTimeout(() => {
          const amountInput = document.querySelector('input[name="amount"]') as HTMLInputElement;
          if (amountInput) {
            amountInput.focus();
            amountInput.select();
          }
        }, 100);
      } else {
        setError('❌ No se pudo leer el importe del ticket - Ingresalo manualmente');
        
        // Enfocar directamente en el campo de monto
        setTimeout(() => {
          const amountInput = document.querySelector('input[name="amount"]') as HTMLInputElement;
          if (amountInput) {
            amountInput.focus();
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error OCR:', error);
      setError('❌ Error al analizar la imagen - Ingresá el monto manualmente');
    }
  };

  // Función para extraer el importe del texto
  const extractAmountFromText = (text: string): number | null => {
    console.log('� Texto completo OCR:', text);
    
    // Dividir en líneas
    const lines = text.split('\n').map(line => line.trim());
    
    // ESTRATEGIA 1: Buscar la línea que contiene "TOTAL" y extraer el número
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toUpperCase();
      
      if (line.includes('TOTAL') && !line.includes('PRECIO') && !line.includes('UND')) {
        console.log('🎯 Línea TOTAL encontrada:', lines[i]);
        
        // Buscar todos los números con formato XX,XX o XX.XX
        const matches = lines[i].match(/\d+[,.]\d{2}/g);
        
        if (matches && matches.length > 0) {
          // Tomar el ÚLTIMO número de la línea TOTAL (es el importe final)
          const lastMatch = matches[matches.length - 1];
          const amount = parseFloat(lastMatch.replace(',', '.'));
          
          console.log('✅ TOTAL detectado:', amount);
          
          if (amount > 0 && amount < 1000000) {
            return amount;
          }
        }
      }
    }
    
    // ESTRATEGIA 2: Buscar números cercanos a palabras clave
    const upperText = text.toUpperCase();
    const patterns = [
      /TOTAL[^\d]*(\d+)[,.](\d{2})/i,
      /IMPORTE[^\d]*(\d+)[,.](\d{2})/i,
      /A\s*PAGAR[^\d]*(\d+)[,.](\d{2})/i,
    ];
    
    for (const pattern of patterns) {
      const match = upperText.match(pattern);
      if (match && match[1] && match[2]) {
        const amount = parseFloat(`${match[1]}.${match[2]}`);
        console.log('✅ Encontrado con patrón:', amount);
        if (amount > 0 && amount < 1000000) {
          return amount;
        }
      }
    }
    
    // ESTRATEGIA 3: Buscar el número MÁS GRANDE (el total suele ser el más alto)
    const allNumbers = text.match(/\d+[,.]\d{2}/g);
    if (allNumbers && allNumbers.length > 0) {
      const amounts = allNumbers.map(n => parseFloat(n.replace(',', '.')));
      const maxAmount = Math.max(...amounts);
      
      console.log('📊 Números encontrados:', amounts);
      console.log('🔝 Número más grande:', maxAmount);
      
      if (maxAmount > 0 && maxAmount < 1000000) {
        return maxAmount;
      }
    }
    
    console.log('❌ No se pudo detectar importe');
    return null;
  };

  const uploadReceipt = async (expenseId: number) => {
    if (!receiptFile) return;

    const formData = new FormData();
    formData.append('receipt', receiptFile);

    try {
      const response = await fetch(`/api/expenses/${expenseId}/receipt`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir el recibo');
      }
      
      const result = await response.json();
      console.log('Recibo subido exitosamente:', result);
    } catch (error) {
      console.error('Error al subir recibo:', error);
      setError(error instanceof Error ? error.message : 'Error al subir el recibo');
    }
  };

  // Funciones para múltiples archivos
  const handleMultipleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validar archivos
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError(`${file.name} no es una imagen válida`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError(`${file.name} es muy grande (máximo 5MB)`);
        return false;
      }
      return true;
    });

    // Crear previews
    const newAttachments = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
    setError(''); // Limpiar errores previos si todo está bien
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => {
      const newAttachments = [...prev];
      URL.revokeObjectURL(newAttachments[index].preview); // Limpiar URL object
      newAttachments.splice(index, 1);
      return newAttachments;
    });
  };

  const removeExistingAttachment = async (attachmentId: number | undefined, index: number) => {
    if (!attachmentId || !expense) return;

    try {
      const response = await fetch(`/api/expenses/${expense.id}/attachments/${attachmentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setExistingAttachments(prev => {
          const newAttachments = [...prev];
          newAttachments.splice(index, 1);
          return newAttachments;
        });
      } else {
        setError('Error al eliminar archivo');
      }
    } catch (error) {
      setError('Error al eliminar archivo');
    }
  };

  const uploadMultipleAttachments = async (expenseId: number) => {
    if (attachments.length === 0) return;

    const formData = new FormData();
    attachments.forEach(({ file }) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`/api/expenses/${expenseId}/attachments`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir archivos');
      }

      const result = await response.json();
      console.log('Archivos subidos exitosamente:', result);
      
      // Limpiar archivos locales después de subirlos
      attachments.forEach(({ preview }) => URL.revokeObjectURL(preview));
      setAttachments([]);
      
    } catch (error) {
      console.error('Error al subir archivos:', error);
      throw error; // Re-lanzar para que el componente padre lo maneje
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const amount = parseFloat(formData.amount);
      
      // No validamos saldo negativo, solo informamos
      if (formData.use_balance && amount > userBalance) {
        console.log('⚠️ Warning: El gasto excederá el saldo disponible');
      }

      const body = {
        ...formData,
        amount,
        use_balance: true, // Siempre usar balance
        tipo_comprobante_id: formData.tipo_comprobante_id ? parseInt(formData.tipo_comprobante_id) : null,
      };

      const url = expense ? `/api/expenses/${expense.id}` : "/api/expenses";
      const method = expense ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let errorMessage = "Error al guardar el gasto";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If can't parse JSON, use default message
        }
        throw new Error(errorMessage);
      }

      let result: any = { id: null };
      try {
        result = await response.json();
      } catch {
        // If response is empty or invalid JSON, use default
        result = { id: Date.now() }; // Use timestamp as fallback ID
      }

      // Upload receipts (both single and multiple files)
      const expenseId = expense?.id || result.id;
      if (expenseId) {
        // Subir archivo único (compatibilidad hacia atrás)
        if (receiptFile) {
          await uploadReceipt(expenseId);
        }
        
        // Subir múltiples archivos nuevos
        if (attachments.length > 0) {
          await uploadMultipleAttachments(expenseId);
        }
      }

      // Reproducir sonido y mostrar notificación con emoji y colores aleatorios
      playSaveSound();
      setCurrentEmoji(getRandomEmoji('save'));
      setParticleEmojis(getRandomEmojis('save', 'particles', 50));
      setParticleColors(getColorSet(8));
      setShowSaveNotification(true);
      setTimeout(() => setShowSaveNotification(false), 4000); // 4 segundos!
      
      // Esperar 4 segundos para que se vea la animación antes de cerrar
      setTimeout(() => onSuccess(), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el gasto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatCurrency = (amount: number, currency?: string) => {
    const currencyCode = currency || formData.currency || 'ARS';
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  };

  // size for modal container: full-width for 'new' mode, constrained when editing
  const isNew = !expense;
  // Use a comfortable centered max width for "new" modal so it isn't stretched edge-to-edge
  // Narrower modal for a cleaner UX on large screens
  // make a bit wider so right-side card (saldo disponible) isn't cut on medium+ screens
  const modalSizeClass = isNew
    ? 'w-full max-w-4xl px-6 sm:px-8 md:px-12 py-4 sm:py-6 rounded-2xl'
    : 'w-full sm:max-w-xl md:max-w-3xl lg:max-w-6xl xl:max-w-7xl px-4 sm:px-10 md:px-12 py-4 sm:py-8 rounded-2xl';

  // For 'new' (full-width) mode we want the form to take advantage of wide screens
  // and arrange fields in multiple columns to reduce vertical length.
  const formGridClass = isNew ? 'grid grid-cols-1 md:grid-cols-12 gap-8 mb-2 items-start' : 'grid grid-cols-1 lg:grid-cols-4 gap-8 mb-2 items-start';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 animate-fadeIn"> 
  {
    /* compute classes for the modal panel so user can preview alternate backgrounds */
  }
  <div className={`${modalSizeClass} max-h-[85vh] overflow-y-auto shadow-2xl backdrop-blur-2xl animate-scaleIn flex flex-col border ${
      bgVariant === 'default'
        ? 'glass border-violet-500/20 shadow-violet-500/20'
        : bgVariant === 'slate'
        ? 'bg-gradient-to-br from-slate-900/90 via-slate-800/85 to-slate-700/75 border-slate-700 shadow-2xl text-white'
        : 'bg-gradient-to-br from-amber-900/30 via-amber-800/18 to-slate-900/10 border-amber-600/20 shadow-xl text-amber-100'
    }`}>
        {/* Header Premium con Gradient */}
  <div className="sticky top-0 z-10 px-4 py-4 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 border-b border-violet-500/20 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-purple-600/5"></div>
            <div className="relative flex items-center justify-between min-h-[40px]">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/50">
                <Save className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-violet-200 to-purple-200 bg-clip-text text-transparent">
                  {expense ? "Editar Gasto" : "Nuevo Gasto"}
                </h2>
                <p className="text-xs text-white/40 mt-0.5">
                  {expense ? "Modifica los datos necesarios" : "Completa la información del gasto"}
                </p>
              </div>
            </div>
            <div className="absolute right-4 top-2 flex items-center gap-2">
              <div className="text-xs text-white/60 mr-2 hidden sm:block">Fondo:</div>
              {/* Default - glassy violet */}
              <button
                title="Default"
                onClick={() => setBgVariant('default')}
                aria-label="Fondo predeterminado"
                className={`w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  bgVariant === 'default' ? 'ring-2 ring-violet-400 bg-gradient-to-br from-violet-500/30 to-purple-600/30' : 'bg-white/5'
                }`}
              ><span className="sr-only">Fondo predeterminado</span></button>

              {/* Slate - deep/dark for high contrast */}
              <button
                title="Oscuro (Slate)"
                onClick={() => setBgVariant('slate')}
                aria-label="Fondo oscuro"
                className={`w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  bgVariant === 'slate' ? 'ring-2 ring-slate-400 bg-gradient-to-br from-slate-800 to-slate-700' : 'bg-slate-700'
                }`}
              ><span className="sr-only">Fondo oscuro</span></button>

              {/* Warm - saturated amber/terracota for visibility */}
              <button
                title="Cálido (Warm)"
                onClick={() => setBgVariant('warm')}
                aria-label="Fondo cálido"
                className={`w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  bgVariant === 'warm' ? 'ring-2 ring-amber-300 bg-gradient-to-br from-amber-800/40 to-amber-600/30' : 'bg-amber-600/60'
                }`}
              ><span className="sr-only">Fondo cálido</span></button>
            </div>
            <button
              onClick={onCancel}
              type="button"
              className="group p-3 hover:bg-white/20 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
              aria-label="Cerrar"
            >
              <X className="w-6 h-6 text-white/80 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>

  <form onSubmit={handleSubmit} className={`p-0 sm:p-6 md:p-8 ${formGridClass}`}>
    {/* centralized hidden file inputs so uploads can be triggered from the right panel */}
    <input ref={fileInputRef} id="receipt-file-input" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
    <input ref={multiFileInputRef} id="multiple-files-input" type="file" accept="image/*" multiple onChange={handleMultipleFileChange} className="hidden" />
    <div className={isNew ? 'md:col-span-8 lg:col-span-8 px-6 md:px-0' : 'lg:col-span-3'}>
        {error && (
          <div className={`mb-6 p-4 rounded-2xl text-sm backdrop-blur-sm border animate-slideIn ${
            error.includes('💡 OCR detectó') 
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            <div className="flex items-start space-x-2">
              <span className="text-lg">{error.includes('💡') ? '💡' : '⚠️'}</span>
              <span className="flex-1">{error}</span>
            </div>
          </div>
        )}

  {/* Balance Premium Display */}
  <div className="mb-4 p-3 sm:p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-2xl shadow backdrop-blur-sm relative overflow-hidden group hover:scale-[1.01] transition-transform duration-200 lg:hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 to-green-400/5 group-hover:from-emerald-400/10 group-hover:to-green-400/10 transition-colors"></div>
          <div className="relative flex items-center justify-between" style={{minHeight:'48px'}}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/50">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xs font-semibold text-emerald-300/80 uppercase tracking-wider">
                  Saldo disponible
                </span>
                <div className={`text-2xl font-bold mt-0.5 ${userBalance < 0 ? 'text-rose-400' : 'bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent'}`}>
                  {formatCurrency(userBalance)} {formData.currency}
                </div>
              </div>
            </div>
            {userBalance < 0 && (
              <div className="px-3 py-1.5 bg-rose-500/20 border border-rose-500/30 rounded-lg">
                <span className="text-xs font-bold text-rose-300">Sobregiro</span>
              </div>
            )}
          </div>
        </div>

  <div className="space-y-4">
          {/* Descripción Premium */}
          <div className="mb-2">
            <label htmlFor="description" className="block text-sm font-bold text-violet-300 mb-2 uppercase tracking-wider">
              📝 Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={1}
              className="w-full px-4 py-3 bg-white/5 border border-violet-500/20 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-white placeholder-white/30 hover:bg-white/10"
              placeholder="Ej: Comida con cliente, Material de oficina..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
            {/* Monto */}
            <div className="mb-0.5">
              <label htmlFor="amount" className="block text-sm font-bold text-violet-300 mb-2 uppercase tracking-wider">
                💰 Monto
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                className="w-full px-4 py-3 bg-white/5 border border-violet-500/20 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-white placeholder-white/30 hover:bg-white/10 font-bold text-lg"
                placeholder="0.00"
              />
            </div>

            {/* Moneda */}
            <div className="mb-0.5">
              <label htmlFor="currency" className="block text-sm font-bold text-violet-300 mb-2 uppercase tracking-wider">
                💵 Moneda
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency || 'ARS'}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-800 border border-violet-500/20 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-white hover:bg-gray-700 font-semibold"
              >
                {currenciesList.length === 0 ? (
                  // Fallback to a small safe list while currencies load or in case of error
                  [
                    { code: 'ARS', label: '🇦🇷 ARS' },
                    { code: 'USD', label: '🇺🇸 USD' },
                    { code: 'EUR', label: '🇪🇺 EUR' },
                  ].map(c => (
                    <option key={c.code} value={c.code} className="bg-gray-800 text-white">{c.label}</option>
                  ))
                ) : (
                  currenciesList.map((c) => (
                    <option key={c.code} value={c.code} className="bg-gray-800 text-white">{(c.symbol ? c.symbol + ' ' : '') + c.code + (c.name ? ` — ${c.name}` : '')}</option>
                  ))
                )}
              </select>
            </div>

            {/* Fecha */}
            <div className="mb-0.5">
              <label htmlFor="expense_date" className="block text-sm font-bold text-violet-300 mb-2 uppercase tracking-wider">
                📅 Fecha
              </label>
              <input
                type="date"
                id="expense_date"
                name="expense_date"
                value={formData.expense_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-violet-500/20 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-white hover:bg-white/10"
              />
            </div>
          </div>

          {/* Categoría */}
          <div className="mb-2">
            <label htmlFor="category" className="block text-sm font-bold text-violet-300 mb-2 uppercase tracking-wider">
              🏷️ Categoría
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-800 border border-violet-500/20 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-white hover:bg-gray-700"
            >
              <option value="" className="bg-gray-800 text-white">Selecciona una categoría</option>
              {(() => {
                type Opt = { id?: number; value: string; label: string };
                const options: Opt[] = categoriesList.length > 0
                  ? categoriesList.map(c => ({ value: c.name, label: c.name, id: c.id }))
                  : EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }));
                return options.map((opt) => (
                  <option key={String(opt.id ?? opt.value)} value={opt.value} className="bg-gray-800 text-white">
                    {opt.label}
                  </option>
                ));
              })()}
            </select>
          </div>

          {/* Tipo de Comprobante */}
          <div className="mb-2">
            <label htmlFor="tipo_comprobante_id" className="block text-sm font-bold text-violet-300 mb-2 uppercase tracking-wider">
              📄 Tipo de Comprobante
            </label>
            <select
              id="tipo_comprobante_id"
              name="tipo_comprobante_id"
              value={formData.tipo_comprobante_id}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800 border border-violet-500/20 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-white hover:bg-gray-700"
            >
              <option value="" className="bg-gray-800 text-white">Seleccionar tipo...</option>
              {tipoComprobantes.map((tipo) => (
                <option key={tipo.id} value={tipo.id} className="bg-gray-800 text-white">
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Receipt Upload */}
          <div className="lg:hidden">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recibo / Factura (opcional)
            </label>
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Subir imagen del recibo</span>
                </div>
              </button>
              
              {receiptPreview && (
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={receiptPreview}
                      alt="Vista previa del recibo"
                      className="w-full h-32 object-contain rounded-lg border border-violet-500/30 bg-white dark:bg-gray-900"
                      style={{ maxHeight: '180px', minHeight: '80px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPreviewModal(true)}
                      className="absolute top-2 right-2 p-2 bg-gray-900/90 backdrop-blur-sm border border-violet-500/30 rounded-lg shadow-md hover:shadow-xl hover:shadow-violet-500/50 transition-all hover:scale-110"
                    >
                      <Eye className="w-4 h-4 text-violet-400" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={extractAmountFromReceipt}
                    className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Wallet className="w-5 h-5" />
                      <span>🤖 Extraer Importe con IA</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Modal para previsualización */}
          {showPreviewModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4" onClick={() => setShowPreviewModal(false)}>
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-xl relative max-w-[90vw] max-h-[85vh] overflow-auto" onClick={e => e.stopPropagation()}>
                <img src={receiptPreview || ''} alt="Vista previa recibo" className="max-w-full max-h-[80vh] rounded-lg object-contain mx-auto" />
                <button className="absolute top-2 right-2 text-gray-700 dark:text-gray-200" onClick={() => setShowPreviewModal(false)}>
                  ✕
                </button>
              </div>
            </div>
          )}
          {/* Múltiples Archivos Adjuntos */}
          <div className="lg:hidden">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Archivos Adicionales
            </label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleMultipleFileChange}
                className="hidden"
                id="multiple-files-input"
              />
              <button
                type="button"
                onClick={() => document.getElementById('multiple-files-input')?.click()}
                className="w-full px-4 py-3 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Agregar más archivos (múltiples)</span>
                </div>
              </button>

              {/* Mostrar archivos existentes */}
              {existingAttachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Archivos guardados:</h4>
                  <div className="flex gap-3 overflow-x-auto py-2">
                    {existingAttachments.map((attachment, index) => (
                      <div key={attachment.filename} className="relative group flex-shrink-0 w-28">
                        <img
                          src={attachment.url}
                          alt={attachment.originalName}
                          className="w-full h-20 object-contain rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-800"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg">
                          <button
                            type="button"
                            onClick={() => removeExistingAttachment(attachment.id, index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                          {attachment.originalName}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mostrar nuevos archivos por subir */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Nuevos archivos:</h4>
                  <div className="flex gap-3 overflow-x-auto py-2">
                    {attachments.map((attachment, index) => (
                      <div key={index} className="relative group flex-shrink-0 w-28">
                        <img
                          src={attachment.preview}
                          alt={attachment.file.name}
                          className="w-full h-20 object-contain rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-800"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg">
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                          {attachment.file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Forma de Pago (sigla) */}
          <div className="mb-2">
            <label htmlFor="sigla" className="block text-sm font-bold text-violet-300 mb-2 uppercase tracking-wider">
              💳 Forma de Pago (sigla)
            </label>
            <select
              id="sigla"
              name="sigla"
              value={formData.sigla}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800 border border-violet-500/20 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-white hover:bg-gray-700"
            >
              <option value="" className="bg-gray-800 text-white">Seleccionar forma de pago</option>
              {paymentMethods.map((m) => (
                <option key={m.sigla} value={m.sigla} className="bg-gray-800 text-white">{m.sigla} — {m.descripcion}</option>
              ))}
            </select>
            {formData.sigla && (
              <div className="text-xs text-white/50 mt-2">Seleccionada: <span className="font-semibold">{formData.sigla}</span></div>
            )}
          </div>
        </div>

      </div>
      {/* RIGHT column: balance, receipt preview and attachments (visible on lg) */}
      <aside className="hidden md:flex md:col-span-4 lg:col-span-4 flex-col gap-4">
        {/* Balance card */}
        <div className="sticky top-8 p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-2xl shadow backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 to-green-400/5" />
          <div className="relative flex items-center justify-between" style={{minHeight:'48px'}}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/50">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xs font-semibold text-emerald-300/80 uppercase tracking-wider">Saldo disponible</span>
                <div className={`text-2xl font-bold mt-0.5 ${userBalance < 0 ? 'text-rose-400' : 'bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent'}`}>
                  {formatCurrency(userBalance)} {formData.currency}
                </div>
              </div>
            </div>
            {userBalance < 0 && (
              <div className="px-3 py-1.5 bg-rose-500/20 border border-rose-500/30 rounded-lg">
                <span className="text-xs font-bold text-rose-300">Sobregiro</span>
              </div>
            )}
          </div>
        </div>

        {/* Single receipt */}
        <div className="p-3 bg-gray-900/30 border border-violet-500/10 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-white/70 font-semibold">Recibo / Factura</div>
            <div className="text-xs text-white/40">Opcional</div>
          </div>
          <div className="space-y-3">
            {receiptPreview ? (
              <img src={receiptPreview || ''} alt="Vista previa recibo" className="w-full h-36 object-contain rounded-lg border border-violet-500/30 bg-white/5" />
            ) : (
              <div className="p-3 border border-dashed rounded-lg text-sm text-white/50">Sin recibo cargado</div>
            )}

            <div className="flex gap-2">
              <button type="button" onClick={() => !isEditing && fileInputRef.current?.click()} className="px-3 py-2 rounded-lg bg-white/5 text-sm text-white/80">Subir recibo</button>
              <button type="button" onClick={() => setShowPreviewModal(true)} disabled={!receiptPreview} className="px-3 py-2 rounded-lg bg-white/5 text-sm text-white/80">Ver</button>
              <button type="button" onClick={extractAmountFromReceipt} disabled={isEditing || !receiptPreview} className="px-3 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white text-sm">Extraer Importe</button>
            </div>
          </div>
        </div>

        {/* Multiple attachments */}
        <div className="p-3 bg-gray-900/20 border border-blue-400/5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-white/80 font-semibold">Archivos adjuntos</div>
            <div className="text-xs text-white/30">múltiples</div>
          </div>
          <div className="space-y-2">
            <button type="button" onClick={() => !isEditing && multiFileInputRef.current?.click()} disabled={isEditing} className="w-full px-3 py-2 border-2 border-dashed border-blue-300 rounded-lg text-sm text-blue-200 hover:border-blue-400">Agregar archivos</button>
            {existingAttachments.length > 0 && (
              <div className="mt-2 text-xs text-white/60">
                <div className="font-medium mb-1">Guardados:</div>
                <div className="flex gap-2 overflow-x-auto py-2">{existingAttachments.map(a => (
                  <div key={a.filename} className="w-20 text-xs truncate text-white/70">{a.originalName}</div>
                ))}</div>
              </div>
            )}

            {attachments.length > 0 && (
              <div className="mt-3 text-xs text-white/60">
                <div className="font-medium mb-1">Nuevos (no guardados):</div>
                <div className="flex gap-3 overflow-x-auto py-2">
                  {attachments.map((att, idx) => (
                    <div key={idx} className="relative group flex-shrink-0 w-20">
                      <img src={att.preview} alt={att.file.name} className="w-full h-16 object-contain rounded-lg border border-gray-200 bg-gray-800" />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg">
                        <button type="button" onClick={() => !isEditing && removeAttachment(idx)} className={`absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600` }>
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
  <div className="md:col-span-12 mt-8 flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-violet-500/20 w-full">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-3 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-xl font-semibold transition-all duration-200 border border-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative flex items-center justify-center w-full sm:w-auto space-x-2 px-8 py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white rounded-xl hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/50 transform hover:-translate-y-0.5 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 rounded-xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300 -z-10"></div>
            <Save className="w-6 h-6 relative" />
            <span className="font-bold relative">
              {isSubmitting ? "Guardando..." : expense ? "Actualizar Gasto" : "Crear Gasto"}
            </span>
          </button>
        </div>
      </form>

      {/* Notificación de Guardado */}
      {showSaveNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          {/* Efecto de explosión de fondo */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-yellow-500/20 animate-pulse-fast"></div>
          
          {/* Partículas de confetti con emojis y colores aleatorios */}
          <div className="absolute inset-0 overflow-hidden">
            {particleEmojis.map((emoji, i) => (
              <div
                key={i}
                className="absolute text-2xl animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-${Math.random() * 20}%`,
                  animationDelay: `${Math.random() * 1}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              >
                {emoji}
              </div>
            ))}
          </div>

          {/* Rayos de luz con colores aleatorios */}
          <div className="absolute inset-0 overflow-hidden">
            {particleColors.map((color, i) => (
              <div
                key={i}
                className="absolute h-1 opacity-50 animate-ray"
                style={{
                  width: '200%',
                  left: '-50%',
                  top: `${i * 12.5}%`,
                  background: `linear-gradient(to right, transparent, ${color}, transparent)`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>

          {/* Tarjeta principal con efecto 3D */}
          <div className="relative pointer-events-auto animate-bounce-scale">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 rounded-3xl blur-2xl opacity-75 animate-pulse-glow"></div>
            
            {/* Tarjeta */}
            <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-yellow-500 rounded-3xl shadow-2xl p-8 border-4 border-white/30 backdrop-blur-xl transform perspective-1000">
              <div className="flex flex-col items-center space-y-4">
                {/* Emoji 3D girando - ALEATORIO */}
                <div className="relative">
                  <div className="text-9xl animate-spin-3d transform-gpu" style={{ textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                    {currentEmoji}
                  </div>
                  <div className="absolute inset-0 text-9xl animate-spin-3d-reverse opacity-50 blur-sm">
                    {particleEmojis[0] || '✨'}
                  </div>
                </div>
                
                {/* Texto con efecto neón */}
                <div className="text-center">
                  <h2 className="text-4xl font-black text-white mb-2 animate-neon-pulse" style={{
                    textShadow: '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #ff00de, 0 0 40px #ff00de'
                  }}>
                    ¡GASTO GENERADO!
                  </h2>
                  <p className="text-xl text-white/90 font-bold animate-bounce-slow">
                    ✨ Tu gasto se guardó con éxito ✨
                  </p>
                </div>

                {/* Estrellas girando */}
                <div className="flex space-x-3">
                  {['⭐', '💫', '✨', '🌟', '💥'].map((star, i) => (
                    <span
                      key={i}
                      className="text-4xl animate-star-spin"
                      style={{
                        animationDelay: `${i * 0.1}s`,
                        display: 'inline-block'
                      }}
                    >
                      {star}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
