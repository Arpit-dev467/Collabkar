export function getApiBase() {
  return (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001').replace(/\/+$/, '');
}

export function apiUrl(path: string) {
  const base = getApiBase();
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

async function request(path: string, init?: RequestInit) {
  const response = await fetch(apiUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.detail || data?.error || `Request failed with status ${response.status}`);
  }

  return { data };
}

export const aiApi = {
  analyze: (data: any) => request('/api/ai/analyze', { method: 'POST', body: JSON.stringify(data) }),
  match: (data: any) => request('/api/ai/match', { method: 'POST', body: JSON.stringify(data) }),
  price: (data: any) => request('/api/ai/price', { method: 'POST', body: JSON.stringify(data) }),
  dashboard: () => request('/api/ai/dashboard'),
  queueScrape: (usernames: string[]) =>
    request('/api/ai/scraper/queue', { method: 'POST', body: JSON.stringify({ usernames }) }),
  buildDataset: () => request('/api/ai/training/build-dataset', { method: 'POST' }),
  trainModels: () => request('/api/ai/training/train', { method: 'POST' }),
  health: () => request('/api/ai/health'),
};
