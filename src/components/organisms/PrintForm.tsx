import { useEffect, useState } from 'react';
import { submitPrintRequest, PrintResponse, fetchProductsByLpn, ProductInfo } from '../../services/printApi';
import { FormField } from '../molecules/FormField';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Select } from '../atoms/Select';
import { LabelPreview } from './LabelPreview';
import { ready } from 'zpl-renderer-js';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface PrintFormProps {
  onPrinted: () => void;
}

const printFormSchema = z.object({
  lpn: z.string().min(3, 'El LPN debe tener al menos 3 caracteres').trim(),
  zone: z.enum(['ZONA-A', 'ZONA-B', 'ZONA-C']),
  requestedBy: z.string().min(3, 'El código de operador debe tener al menos 3 caracteres').trim(),
  reprintReason: z.string().optional(),
});

type PrintFormData = z.infer<typeof printFormSchema>;

export function PrintForm({ onPrinted }: PrintFormProps) {
  const [result, setResult] = useState<PrintResponse | null>(null);
  const [associatedProducts, setAssociatedProducts] = useState<ProductInfo[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalImgUrl, setModalImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PrintFormData>({
    resolver: zodResolver(printFormSchema),
    defaultValues: {
      lpn: '',
      zone: 'ZONA-A',
      requestedBy: '',
      reprintReason: '',
    },
  });

  const watchedLpn = watch('lpn');

  useEffect(() => {
    if (!watchedLpn || watchedLpn.trim().length < 3) {
      setAssociatedProducts([]);
      return;
    }
    const handler = setTimeout(() => {
      setLoadingProducts(true);
      fetchProductsByLpn(watchedLpn)
        .then(setAssociatedProducts)
        .catch(() => setAssociatedProducts([]))
        .finally(() => setLoadingProducts(false));
    }, 400); // 400ms debounce
    return () => clearTimeout(handler);
  }, [watchedLpn]);

  async function onFormSubmit(data: PrintFormData) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await submitPrintRequest({
        lpn: data.lpn,
        zone: data.zone,
        requestedBy: data.requestedBy,
        reprintReason: data.reprintReason || undefined,
      });
      setResult(response);
      onPrinted();

      if (response.outcome === 'EXITOSO' && response.zpl) {
        try {
          const { api } = await ready;
          const base64 = await api.zplToBase64Async(response.zpl);
          const imgUrl = `data:image/png;base64,${base64}`;
          setModalImgUrl(imgUrl);
          setShowModal(true);
        } catch (renderErr) {
          console.error('Error al generar impresión local:', renderErr);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-5">Solicitar Impresión</h3>
      <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-1.5 mt-1.5 text-[11px] font-semibold text-slate-400 items-center">
          <span>Ejemplos:</span>
          {['olpn11111', 'olpn12345', 'olpn99999', 'olpn55555', 'olpn44444'].map((exLpn) => (
            <button
              type="button"
              key={exLpn}
              onClick={() => setValue('lpn', exLpn, { shouldValidate: true })}
              className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 px-2 py-0.5 rounded-md cursor-pointer transition text-slate-600 font-mono"
            >
              {exLpn}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="LPN (License Plate Number)" error={errors.lpn?.message}>
            <Input
              {...register('lpn')}
              error={errors.lpn?.message}
              placeholder="Ej: olpn12345"
            />
          </FormField>
          <FormField label="Zona de Operación" error={errors.zone?.message}>
            <Select
              {...register('zone')}
              error={errors.zone?.message}
              options={[
                { value: 'ZONA-A', label: 'ZONA-A' },
                { value: 'ZONA-B', label: 'ZONA-B' },
                { value: 'ZONA-C', label: 'ZONA-C' },
              ]}
            />
          </FormField>
        </div>

        {/* LPN Associated Products Display */}
        {(loadingProducts || associatedProducts.length > 0) && (
          <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
            <h4 className="text-[11px] font-extrabold text-slate-400 mb-2 uppercase tracking-wider">
              Productos asociados a esta LPN
            </h4>
            {loadingProducts ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold py-1">
                <svg className="animate-spin h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Cargando productos...</span>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 text-xs text-slate-700 font-medium">
                {associatedProducts.map((prod) => (
                  <div key={prod.productCode} className="flex justify-between items-center bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-xs">
                    <span>
                      {prod.productCode} - {prod.productDescription}
                    </span>
                    <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-bold">
                      {prod.requestedQty} {prod.uom}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Código de Operador / Usuario" error={errors.requestedBy?.message}>
            <Input
              {...register('requestedBy')}
              error={errors.requestedBy?.message}
              placeholder="Ej: operador.bodega1"
            />
          </FormField>
          <FormField label="Motivo (Opcional)" error={errors.reprintReason?.message}>
            <Input
              {...register('reprintReason')}
              error={errors.reprintReason?.message}
              placeholder="Ej: Etiqueta dañada"
            />
          </FormField>
        </div>

        <Button type="submit" loading={loading} className="w-full mt-2">
          {loading ? 'Procesando Impresión...' : 'Imprimir'}
        </Button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-sm font-medium text-rose-700">
          ⚠️ {error}
        </div>
      )}

      {result && (
        <div className={`mt-5 p-5 border rounded-2xl shadow-sm ${result.outcome === 'EXITOSO' ? 'bg-emerald-50/20 border-emerald-100' : 'bg-rose-50/20 border-rose-100'
          }`}>
          <div className="flex items-center justify-between mb-3">
            <strong className="text-slate-800 text-sm font-bold">Respuesta del Sistema</strong>
            <Badge status={result.outcome} />
          </div>
          <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-line">{result.message}</p>

          <div className="flex flex-wrap gap-2 mt-3">
            <Badge status={result.eventType} />
            {result.rejectionReason && <Badge status={result.rejectionReason} />}
          </div>

          {result.zpl && (
            <LabelPreview
              zpl={result.zpl}
              onPrint={() => setShowModal(true)}
            />
          )}
        </div>
      )}
      {showModal && modalImgUrl && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Vista de Impresión</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-650 font-bold text-lg focus:outline-none cursor-pointer"
              >
                &times;
              </button>
            </div>
            
            <div className="flex justify-center p-4 bg-slate-50 rounded-2xl border border-slate-150">
              <img
                src={modalImgUrl}
                alt="Label preview"
                className="max-h-[300px] w-auto object-contain rounded-lg shadow-sm border border-slate-200/50"
              />
            </div>

            <div className="flex gap-3 mt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowModal(false)}
              >
                Cerrar
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  let iframe = document.getElementById('print-iframe') as HTMLIFrameElement;
                  if (!iframe) {
                    iframe = document.createElement('iframe');
                    iframe.id = 'print-iframe';
                    iframe.style.position = 'absolute';
                    iframe.style.width = '0px';
                    iframe.style.height = '0px';
                    iframe.style.border = 'none';
                    document.body.appendChild(iframe);
                  }
                  const doc = iframe.contentWindow?.document;
                  if (doc) {
                    doc.open();
                    doc.write(`
                      <html>
                        <head>
                          <style>
                            body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
                            img { max-width: 100%; max-height: 100%; object-fit: contain; }
                            @page { size: auto; margin: 0mm; }
                          </style>
                        </head>
                        <body>
                          <img src="${modalImgUrl}" onload="window.print();" />
                        </body>
                      </html>
                    `);
                    doc.close();
                  }
                }}
              >
                🖨️ Mandar a Imprimir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
