'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { aiApi } from '../../lib/api';

type AiHealth = {
  ai_service?: string;
};

export default function AISidebar() {
  const [health, setHealth] = useState<AiHealth | null>(null);

  useEffect(() => {
    aiApi.health<AiHealth>().then(res => setHealth(res.data)).catch(() => {});
  }, []);

  return (
    <div style={{ width: '200px', padding: '20px', borderRight: '1px solid #ccc' }}>
      <h3>AI Dashboard</h3>
      <ul>
        <li><Link href="/ai-dashboard">Dashboard</Link></li>
        <li><Link href="/ai-creator-search">Creator Search</Link></li>
        <li><Link href="/ai-brand-match">Brand Match</Link></li>
        <li><Link href="/ai-scraper-control">Scraper Control</Link></li>
        <li><Link href="/ai-training-control">Training Control</Link></li>
      </ul>
      <div style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: health?.ai_service === 'ok' ? 'green' : 'red', marginRight: '5px' }}></div>
          AI Service
        </div>
      </div>
    </div>
  );
}
