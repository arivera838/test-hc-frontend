import { useEffect, useState } from 'react';
import { Button } from '../atoms/Button';
import { ready } from 'zpl-renderer-js';

interface LabelPreviewProps {
  zpl: string;
  onPrint?: () => void;
}

export function LabelPreview({ zpl, onPrint }: LabelPreviewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    ready
      .then(({ api }) => {
        return api.zplToBase64Async(zpl);
      })
      .then((base64) => {
        setImageUrl(`data:image/png;base64,${base64}`);
      })
      .catch((err) => {
        console.error('Local ZPL Render Error:', err);
        setImageUrl(null);
      })
      .finally(() => setLoading(false));
  }, [zpl]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(zpl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  return (
    <div className="mt-6 p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <h4 className="text-sm font-bold text-slate-800">Previsualización de Etiqueta</h4>
        <div className="flex gap-2">
          <Button variant="secondary" className="!py-1.5 !px-3 !text-xs" onClick={handleCopy}>
            {copied ? '✅ Copiado' : '📋 Copiar ZPL'}
          </Button>
          {onPrint && (
            <Button variant="secondary" className="!py-1.5 !px-3 !text-xs flex items-center gap-1" onClick={onPrint}>
              🖨️ Abrir Impresora
            </Button>
          )}
        </div>
      </div>

      <div className="flex justify-center items-center min-h-[150px] p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <svg className="animate-spin h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-xs text-slate-500 font-medium">Generando previsualización...</p>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="Etiqueta de Código de Barras"
            className="max-w-full h-auto rounded-lg shadow-sm border border-slate-100"
          />
        ) : (
          <p className="text-xs text-rose-500 font-medium">No se pudo cargar la previsualización de la etiqueta</p>
        )}
      </div>
    </div>
  );
}
