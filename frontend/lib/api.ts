export function getApiBase() {
  return (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001').replace(/\/+$/, '');
}

export function apiUrl(path: string) {
  const base = getApiBase();
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

type ApiResponse = Record<string, unknown>;

function isApiResponse(value: unknown): value is ApiResponse {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function request<T = unknown>(path: string, init?: RequestInit): Promise<{ data: T }> {
  const response = await fetch(apiUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  const text = await response.text();
  const parsed: unknown = text ? JSON.parse(text) : null;
  const data = isApiResponse(parsed) ? parsed : null;

  if (!response.ok) {
    const message = data?.detail ?? data?.error;
    throw new Error(typeof message === 'string' ? message : `Request failed with status ${response.status}`);
  }

  return { data: parsed as T };
}

export const aiApi = {
  analyze: <T = unknown>(data: unknown) => request<T>('/api/ai/analyze', { method: 'POST', body: JSON.stringify(data) }),
  match: <T = unknown>(data: unknown) => request<T>('/api/ai/match', { method: 'POST', body: JSON.stringify(data) }),
  price: <T = unknown>(data: unknown) => request<T>('/api/ai/price', { method: 'POST', body: JSON.stringify(data) }),
  dashboard: <T = unknown>() => request<T>('/api/ai/dashboard'),
  queueScrape: (usernames: string[]) =>
    request<{ queued?: number; message?: string; detail?: string }>('/api/ai/scraper/queue', { method: 'POST', body: JSON.stringify({ usernames }) }),
  buildDataset: () => request('/api/ai/training/build-dataset', { method: 'POST' }),
  trainModels: () => request('/api/ai/training/train', { method: 'POST' }),
  health: <T = unknown>() => request<T>('/api/ai/health'),
};
