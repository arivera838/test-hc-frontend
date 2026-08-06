export interface PrintRequestPayload {
  lpn: string;
  zone: string;
  requestedBy: string;
  reprintReason?: string;
}

export interface PrintResponse {
  outcome: 'EXITOSO' | 'RECHAZADO';
  eventType: 'IMPRESION' | 'REIMPRESION';
  zpl: string | null;
  rejectionReason: string | null;
  message: string;
  auditEntryId: string;
}

export interface PrintHistoryEntry {
  id: string;
  requestId: string;
  etqId: string | null;
  lpn: string;
  zone: string;
  requestedBy: string;
  timestamp: string;
  eventType: 'IMPRESION' | 'REIMPRESION';
  outcome: 'EXITOSO' | 'RECHAZADO';
  rejectionReason: string | null;
  reprintReason: string | null;
}

const BASE_URL = '/api';

export async function submitPrintRequest(
  payload: PrintRequestPayload,
): Promise<PrintResponse> {
  const response = await fetch(`${BASE_URL}/print`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? 'Error al procesar la solicitud');
  }
  return response.json();
}

export async function fetchPrintHistory(): Promise<PrintHistoryEntry[]> {
  const response = await fetch(`${BASE_URL}/print/history`);
  if (!response.ok) {
    throw new Error('Error al consultar el historial');
  }
  return response.json();
}

export interface MetricsData {
  printRequests: {
    total: number;
    byOutcome: {
      EXITOSO: number;
      RECHAZADO: number;
    };
    byEventType: {
      IMPRESION: number;
      REIMPRESION: number;
    };
    byRejectionReason: Record<string, number>;
  };
  http: {
    recentSampleSize: number;
    avgLatencyMs: number;
    errorCountLast100: number;
  };
}

export async function fetchMetrics(): Promise<MetricsData> {
  const response = await fetch(`${BASE_URL}/metrics`);
  if (!response.ok) {
    throw new Error('Error al consultar métricas');
  }
  return response.json();
}

export interface ProductInfo {
  productCode: string;
  productDescription: string;
  requestedQty: number;
  uom: string;
}

export async function fetchProductsByLpn(lpn: string): Promise<ProductInfo[]> {
  const response = await fetch(`${BASE_URL}/print/lpn/${lpn}/products`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? 'No se pudieron obtener los productos de la LPN');
  }
  return response.json();
}
