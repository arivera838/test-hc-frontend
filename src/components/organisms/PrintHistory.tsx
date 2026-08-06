import { useEffect, useState } from 'react';
import { fetchPrintHistory, PrintHistoryEntry } from '../../services/printApi';
import { Badge } from '../atoms/Badge';

export function PrintHistory({ refreshKey }: { refreshKey: number }) {
  const [entries, setEntries] = useState<PrintHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<PrintHistoryEntry | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'IMPRESION' | 'REIMPRESION'>('ALL');
  const itemsPerPage = 5;

  useEffect(() => {
    setLoading(true);
    fetchPrintHistory()
      .then((data) => {
        setEntries(data);
        setCurrentPage(1);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType]);

  const filteredEntries = entries.filter((entry) => {
    if (filterType === 'ALL') return true;
    return entry.eventType === filterType;
  });

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-slate-100 pb-4">
        <h3 className="text-lg font-bold text-slate-800">Historial de Impresiones</h3>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>Filtrar por Tipo:</span>
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
            {(['ALL', 'IMPRESION', 'REIMPRESION'] as const).map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded-md transition duration-150 cursor-pointer ${
                  filterType === type
                    ? 'bg-white text-slate-850 shadow-sm shadow-slate-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {type === 'ALL' ? 'Todos' : type === 'IMPRESION' ? 'Impresión' : 'Reimpresión'}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <svg className="animate-spin h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : filteredEntries.length === 0 ? (
        <p className="text-sm font-medium text-slate-400 py-6 text-center">Sin registros aún.</p>
      ) : (
        <div>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="py-3.5 px-3">ID Etiqueta</th>
                  <th className="py-3.5 px-3">LPN</th>
                  <th className="py-3.5 px-3">Fecha y Hora</th>
                  <th className="py-3.5 px-3 text-center">Tipo</th>
                  <th className="py-3.5 px-3 text-center">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                {paginatedEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className="hover:bg-slate-50/70 cursor-pointer transition duration-150"
                  >
                    <td className="py-3 px-3 font-mono text-xs">{entry.etqId ?? '—'}</td>
                    <td className="py-3 px-3 font-mono text-xs">{entry.lpn}</td>
                    <td className="py-3 px-3 text-xs text-slate-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge status={entry.eventType} />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge status={entry.outcome} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="lg:hidden flex flex-col gap-4">
            {paginatedEntries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className="p-4 border border-slate-100 rounded-2xl bg-slate-50/30 hover:bg-slate-50/60 cursor-pointer transition flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 font-mono">
                    {entry.etqId ?? 'SIN ETQ'}
                  </span>
                  <div className="flex gap-1.5">
                    <Badge status={entry.eventType} />
                    <Badge status={entry.outcome} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <div>
                    <span className="text-slate-400 block font-normal text-[10px] uppercase">LPN</span>
                    <span className="text-slate-855 font-mono">{entry.lpn}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-normal text-[10px] uppercase">Zona</span>
                    <span className="text-slate-800">{entry.zone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-normal text-[10px] uppercase">Usuario</span>
                    <span className="text-slate-800">{entry.requestedBy}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-normal text-[10px] uppercase">Fecha</span>
                    <span className="text-slate-500 font-normal">
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-4 mt-5">
              <span className="text-xs font-semibold text-slate-500">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredEntries.length)} de {filteredEntries.length} registros
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50 disabled:hover:bg-slate-50 disabled:hover:text-slate-600 rounded-lg border border-slate-200/50 cursor-pointer disabled:cursor-not-allowed transition duration-150"
                >
                  Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    type="button"
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition duration-150 cursor-pointer ${currentPage === page
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-100'
                        : 'bg-white border-slate-200/50 text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50 disabled:hover:bg-slate-50 disabled:hover:text-slate-600 rounded-lg border border-slate-200/50 cursor-pointer disabled:cursor-not-allowed transition duration-150"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedEntry && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Detalle de Solicitud</h3>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-slate-400 hover:text-slate-650 font-bold text-lg focus:outline-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="flex flex-col gap-3 text-sm">
              <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-50">
                <span className="text-slate-450 font-medium">ID Solicitud:</span>
                <span className="text-slate-800 font-mono text-xs text-right break-all">{selectedEntry.requestId}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-50">
                <span className="text-slate-450 font-medium">ID Etiqueta:</span>
                <span className="text-slate-800 font-mono text-xs text-right">{selectedEntry.etqId ?? '—'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-50">
                <span className="text-slate-450 font-medium">LPN:</span>
                <span className="text-slate-800 font-mono text-xs text-right">{selectedEntry.lpn}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-50">
                <span className="text-slate-450 font-medium">Zona:</span>
                <span className="text-slate-800 text-right">{selectedEntry.zone}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-50">
                <span className="text-slate-450 font-medium">Operador:</span>
                <span className="text-slate-800 text-right">{selectedEntry.requestedBy}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-50">
                <span className="text-slate-450 font-medium">Fecha y Hora:</span>
                <span className="text-slate-800 text-xs text-right">
                  {new Date(selectedEntry.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-50 items-center">
                <span className="text-slate-450 font-medium">Tipo:</span>
                <div className="flex justify-end">
                  <Badge status={selectedEntry.eventType} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-50 items-center">
                <span className="text-slate-450 font-medium">Resultado:</span>
                <div className="flex justify-end">
                  <Badge status={selectedEntry.outcome} />
                </div>
              </div>

              {/* Motivo de Rechazo */}
              {selectedEntry.outcome === 'RECHAZADO' && selectedEntry.rejectionReason && (
                <div className="mt-2 p-3.5 bg-rose-50/50 border border-rose-100 rounded-2xl">
                  <span className="block text-xs font-bold text-rose-700 uppercase tracking-wide mb-1">
                    Motivo del Rechazo
                  </span>
                  <p className="text-xs font-semibold text-rose-650 leading-relaxed font-mono">
                    {selectedEntry.rejectionReason}
                  </p>
                </div>
              )}

              {/* Motivo de Reimpresión */}
              {selectedEntry.eventType === 'REIMPRESION' && selectedEntry.reprintReason && (
                <div className="mt-2 p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                  <span className="block text-xs font-bold text-indigo-700 uppercase tracking-wide mb-1">
                    Motivo de Reimpresión
                  </span>
                  <p className="text-xs font-semibold text-indigo-650 leading-relaxed">
                    {selectedEntry.reprintReason}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-2">
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl cursor-pointer transition duration-150"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
