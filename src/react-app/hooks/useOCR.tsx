import { useState, useCallback } from 'react';
// NOTE: tesseract is dynamically imported in processImage to reduce bundle size

interface OCRResult {
  text: string;
  amount?: number;
}

export function useOCR() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const processImage = useCallback(async (imageFile: File): Promise<OCRResult> => {
    setIsProcessing(true);
    setProgress(0);

    try {
      const tesseractModule = await import('tesseract.js');
      const createWorker = tesseractModule.createWorker || tesseractModule.default?.createWorker;
      const worker = await createWorker('spa', 1, {
        logger: m => setProgress(Math.round((m.progress || 0) * 100))
      });

      const result = await worker.recognize(imageFile);
      await worker.terminate();

      // Intentar extraer el monto del texto
      const text = result.data.text;
      let amount: number | undefined;

      // Patrones comunes para montos en pesos argentinos
      const patterns = [
        /TOTAL[\s:]*\$?\s*([\d.,]+)/i,
        /IMPORTE[\s:]*\$?\s*([\d.,]+)/i,
        /\$\s*([\d.,]+)/,
        /([\d.,]+)\s*ARS/i,
      ];

      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          // Limpiar el monto encontrado
          const rawAmount = match[1].replace(/[.,]/g, '');
          amount = parseInt(rawAmount, 10) / 100; // Convertir a formato decimal
          break;
        }
      }

      return {
        text,
        amount
      };
    } catch (error) {
      console.error('Error en OCR:', error);
      throw new Error('Error al procesar la imagen');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, []);

  return {
    processImage,
    isProcessing,
    progress
  };
}