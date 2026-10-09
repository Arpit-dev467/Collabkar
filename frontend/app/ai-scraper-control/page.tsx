'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { aiApi, apiUrl } from '../../lib/api';
import AISidebar from '../components/AISidebar';

type QueueResult = {
  queued?: number;
  message?: string;
  detail?: string;
};

export default function ScraperControl() {
  const [usernames, setUsernames] = useState('');
  const [queueResult, setQueueResult] = useState<QueueResult | null>(null);
  const [status, setStatus] = useState<Record<string, unknown> | null>(null);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQueue = async () => {
    const list = usernames.split('\n').map((value) => value.trim()).filter(Boolean);
    if (!list.length) return;
    setLoadingQueue(true);
    setError(null);
    try {
      const res = await aiApi.queueScrape(list);
      setQueueResult(res.data);
    } catch (err: any) {
      setError(err?.message || 'Queue failed');
    } finally {
      setLoadingQueue(false);
    }
  };

  const handleStatus = async () => {
    setLoadingStatus(true);
    setError(null);
    try {
      const res = await fetch(apiUrl('/api/ai/scraper/status'));
      const data = await res.json();
      setStatus(data);
    } catch {
      setError('Status fetch failed');
    } finally {
      setLoadingStatus(false);
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <AISidebar />
      <div style={{ padding: '20px', flex: 1 }}>
        <h1>Scraper Control</h1>
        <div>
          <label>Instagram Usernames (one per line):</label>
          <textarea value={usernames} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setUsernames(e.target.value)} rows={10} style={{ width: '100%' }} />
        </div>
        <button onClick={handleQueue} disabled={loadingQueue}>{loadingQueue ? 'Queuing...' : 'Queue Scrape'}</button>
        {queueResult && <p>Queued: {queueResult.queued ?? 0}, Message: {queueResult.message || queueResult.detail || 'Submitted'}</p>}
        <hr />
        <button onClick={handleStatus} disabled={loadingStatus}>{loadingStatus ? 'Fetching...' : 'Get Status'}</button>
        {status && <pre>{JSON.stringify(status, null, 2)}</pre>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
}
