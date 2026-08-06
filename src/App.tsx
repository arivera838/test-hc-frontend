import { useState } from 'react';
import { PrintForm } from './components/organisms/PrintForm';
import { PrintHistory } from './components/organisms/PrintHistory';
import { MetricsDashboard } from './components/organisms/MetricsDashboard';
import { TabButton } from './components/molecules/TabButton';
import './styles.css';

export default function App() {
  const [activeTab, setActiveTab] = useState<'print' | 'metrics'>('print');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-indigo-100">
      {/* Header Banner */}
      <header className="bg-white border-b border-slate-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Sistema de Impresión de Etiquetas
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Arquitectura Hexagonal & SQLite — Módulo Operativo de Bodega
            </p>
          </div>
          
          {/* Tab Navigation Controls */}
          <nav className="flex items-center gap-3">
            <TabButton
              active={activeTab === 'print'}
              onClick={() => setActiveTab('print')}
              label="Impresión"
              icon="🖨️"
            />
            <TabButton
              active={activeTab === 'metrics'}
              onClick={() => setActiveTab('metrics')}
              label="Métricas"
              icon="📊"
            />
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'print' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left side: Solicitud de Impresión */}
            <div className="lg:col-span-5 lg:sticky lg:top-8">
              <PrintForm onPrinted={() => setRefreshKey((k) => k + 1)} />
            </div>

            {/* Right side: Historial y trazabilidad */}
            <div className="lg:col-span-7">
              <PrintHistory refreshKey={refreshKey} />
            </div>
          </div>
        ) : (
          <div>
            <MetricsDashboard />
          </div>
        )}
      </div>
    </main>
  );
}
