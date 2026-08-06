import { useEffect, useState } from 'react';
import { fetchMetrics, MetricsData } from '../../services/printApi';
import { MetricCard } from '../molecules/MetricCard';

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = () => {
    fetchMetrics()
      .then(setMetrics)
      .catch((err) => {
        console.error(err);
        setError('No se pudieron cargar las métricas en tiempo real.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMetrics();
    // Poll metrics every 5 seconds for real-time dashboard updates
    const interval = setInterval(loadMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return (
      <div className="flex justify-center items-center py-20 bg-white border border-slate-100 rounded-3xl shadow-sm">
        <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="p-6 text-center bg-rose-50 border border-rose-100 rounded-3xl text-rose-700">
        <p className="font-semibold mb-2">⚠️ {error}</p>
        <button onClick={loadMetrics} className="mt-2 text-xs bg-white text-rose-700 px-3 py-1.5 border border-rose-200 rounded-lg hover:bg-rose-50 font-bold transition">
          Reintentar Carga
        </button>
      </div>
    );
  }

  if (!metrics) return null;

  const { printRequests, http } = metrics;
  const successRate = printRequests.total > 0 
    ? ((printRequests.byOutcome.EXITOSO / printRequests.total) * 100).toFixed(1) 
    : '0';

  return (
    <div className="flex flex-col gap-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Impresiones"
          value={printRequests.total}
          description="Solicitudes procesadas totales"
        />
        <MetricCard
          title="Tasa de Éxito"
          value={`${successRate}%`}
          description={`${printRequests.byOutcome.EXITOSO} exitosas / ${printRequests.byOutcome.RECHAZADO} rechazadas`}
          variant="success"
        />
        <MetricCard
          title="Tipo de Operación"
          value={`IMP: ${printRequests.byEventType.IMPRESION}`}
          description={`Reimpresiones: ${printRequests.byEventType.REIMPRESION}`}
          variant="normal"
        />
        <MetricCard
          title="Latencia Promedio"
          value={`${http.avgLatencyMs} ms`}
          description={`Muestreo: Últimos ${http.recentSampleSize} requests`}
          variant="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rejection Reasons breakdown */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Motivos de Rechazo</h3>
          {Object.keys(printRequests.byRejectionReason).length === 0 ? (
            <p className="text-sm text-slate-400 font-medium py-10 text-center">No hay registros de rechazos aún.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {Object.entries(printRequests.byRejectionReason).map(([reason, count]) => {
                const percent = printRequests.byOutcome.RECHAZADO > 0
                  ? ((count / printRequests.byOutcome.RECHAZADO) * 100).toFixed(0)
                  : 0;
                return (
                  <div key={reason} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span className="truncate max-w-[80%]" title={reason}>
                        {reason.replace(/_/g, ' ')}
                      </span>
                      <span>{count} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* HTTP Performance metrics */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Desempeño del Servidor (HTTP)</h3>
          <div className="flex flex-col gap-5">
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-xs font-semibold text-slate-500">Muestra de Solicitudes</span>
              <span className="text-sm font-bold text-slate-800">{http.recentSampleSize} requests</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-xs font-semibold text-slate-500">Errores 5xx (Últimos 100)</span>
              <span className={`text-sm font-bold ${http.errorCountLast100 > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {http.errorCountLast100}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs font-semibold text-slate-500">Latencia Promedio</span>
              <span className="text-sm font-bold text-slate-800">{http.avgLatencyMs} ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
