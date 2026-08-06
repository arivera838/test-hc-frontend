import axios from 'axios';

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

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function submitPrintRequest(
  payload: PrintRequestPayload,
): Promise<PrintResponse> {
  try {
    const response = await apiClient.post<PrintResponse>('/print', payload);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message ?? 'Error al procesar la solicitud';
    throw new Error(message);
  }
}

export async function fetchPrintHistory(): Promise<PrintHistoryEntry[]> {
  try {
    const response = await apiClient.get<PrintHistoryEntry[]>('/print/history');
    return response.data;
  } catch (error: any) {
    throw new Error('Error al consultar el historial');
  }
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
  try {
    const response = await apiClient.get<MetricsData>('/metrics');
    return response.data;
  } catch (error: any) {
    throw new Error('Error al consultar métricas');
  }
}

export interface ProductInfo {
  productCode: string;
  productDescription: string;
  requestedQty: number;
  uom: string;
}

export async function fetchProductsByLpn(lpn: string): Promise<ProductInfo[]> {
  try {
    const response = await apiClient.get<ProductInfo[]>(`/print/lpn/${lpn}/products`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message ?? 'No se pudieron obtener los productos de la LPN';
    throw new Error(message);
  }
}

