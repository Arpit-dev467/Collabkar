'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import { aiApi } from '../../lib/api';
import AISidebar from '../components/AISidebar';

type HealthResponse = {
  express: string;
  ai_service: string;
  mode?: string;
  python?: string;
  artifacts_ready?: boolean;
  timestamp: string;
};

type DashboardSnapshot = {
  ok: boolean;
  generated_at?: string;
  cards?: Array<{ label: string; value: string | number; tone?: string }>;
  progress_bars?: Array<{ label: string; value: number; max: number }>;
  artifacts?: Array<{ name: string; exists: boolean; size_kb: number; updated_at: string | null }>;
  feature_importance?: Record<string, Array<{ feature: string; importance: number }>>;
  sample_prediction?: {
    price_prediction?: number | { post?: number };
    niche_prediction?: { niche?: string; confidence?: number };
    fake_detection?: { authentic_probability?: number };
  };
};

function pct(value: number) {
  return `${Math.max(0, Math.min(100, value * 100)).toFixed(1)}%`;
}

export default function Dashboard() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([aiApi.health<HealthResponse>(), aiApi.dashboard<{ snapshot?: DashboardSnapshot } & DashboardSnapshot>()])
      .then(([healthRes, dashboardRes]) => {
        setHealth(healthRes.data);
        setSnapshot(dashboardRes.data.snapshot ?? dashboardRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const samplePrice = snapshot?.sample_prediction?.price_prediction;
  const samplePostPrice =
    typeof samplePrice === 'number' ? samplePrice : (samplePrice?.post ?? null);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #f7efe5, #eefbf7)' }}>
      <AISidebar />
      <div style={{ padding: '28px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '12px', color: '#6b7280' }}>
              AI Operations
            </p>
            <h1 style={{ margin: '8px 0 4px', fontSize: '36px' }}>Model dashboard</h1>
            <p style={{ margin: 0, color: '#4b5563' }}>
              Startup-level Python AI status, model progress, and current artifact health.
            </p>
          </div>
          <div style={{ background: '#fffaf2', border: '1px solid #e8dcc7', borderRadius: '18px', padding: '18px 20px', minWidth: '240px' }}>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280' }}>Sample price</div>
            <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '6px' }}>
              {samplePostPrice ? `INR ${samplePostPrice}` : 'Loading'}
            </div>
            <div style={{ fontSize: '14px', color: '#4b5563', marginTop: '6px' }}>
              Generated {snapshot?.generated_at ?? health?.timestamp ?? '...'}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '22px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <StatusCard title="Express" value={health?.express ?? (loading ? 'Loading' : 'Unknown')} tone="good" />
          <StatusCard title="AI Service" value={health?.ai_service ?? (loading ? 'Loading' : 'Unknown')} tone={health?.ai_service === 'ok' ? 'good' : 'warn'} />
          <StatusCard title="Mode" value={health?.mode ?? snapshot?.cards?.[0]?.value ?? 'n/a'} tone="neutral" />
          <StatusCard title="Python" value={health?.python ?? 'n/a'} tone="neutral" />
        </div>

        <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '18px' }}>
          <Panel title="Progress">
            {snapshot?.progress_bars?.length ? snapshot.progress_bars.map((bar) => (
              <div key={bar.label} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                  <span>{bar.label}</span>
                  <span>{pct(bar.value)}</span>
                </div>
                <div style={{ height: '12px', background: '#e7ded0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: pct(bar.value), height: '100%', background: 'linear-gradient(90deg, #0f766e, #22c55e)' }} />
                </div>
              </div>
            )) : <p style={{ color: '#6b7280' }}>No progress metrics yet.</p>}
          </Panel>

          <Panel title="Quick Actions">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link href="/ai-creator-search"><button style={buttonStyle}>Analyze creator</button></Link>
              <Link href="/ai-brand-match"><button style={buttonStyle}>Find matches</button></Link>
              <Link href="/ai-training-control"><button style={buttonStyle}>Train + refresh dashboard</button></Link>
            </div>
          </Panel>
        </div>

        <div style={{ marginTop: '18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
          <Panel title="Artifacts">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#6b7280' }}>
                  <th style={cellHead}>Name</th>
                  <th style={cellHead}>Ready</th>
                  <th style={cellHead}>Size KB</th>
                </tr>
              </thead>
              <tbody>
                {snapshot?.artifacts?.map((artifact) => (
                  <tr key={artifact.name}>
                    <td style={cell}>{artifact.name}</td>
                    <td style={cell}>{artifact.exists ? 'yes' : 'no'}</td>
                    <td style={cell}>{artifact.size_kb}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="Live sample">
            <p style={{ marginTop: 0, color: '#4b5563' }}>
              Niche: <strong>{snapshot?.sample_prediction?.niche_prediction?.niche ?? 'n/a'}</strong>
            </p>
            <p style={{ color: '#4b5563' }}>
              Authentic probability: <strong>{snapshot?.sample_prediction?.fake_detection?.authentic_probability ? pct(snapshot.sample_prediction.fake_detection.authentic_probability) : 'n/a'}</strong>
            </p>
            <p style={{ color: '#4b5563', marginBottom: 0 }}>
              This comes from the AI folder startup service, so it’s a direct proof that the Python side is responding.
            </p>
          </Panel>
        </div>

        <div style={{ marginTop: '18px' }}>
          <Panel title="Feature Importance">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              {Object.entries(snapshot?.feature_importance ?? {}).map(([modelName, values]) => (
                <div key={modelName} style={{ border: '1px solid #eadfce', borderRadius: '16px', padding: '14px', background: '#fffdf8' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '10px', textTransform: 'capitalize' }}>{modelName} model</h3>
                  {values.length ? values.slice(0, 6).map((item) => (
                    <div key={`${modelName}-${item.feature}`} style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                        <span>{item.feature}</span>
                        <span>{item.importance.toFixed(3)}</span>
                      </div>
                      <div style={{ height: '10px', background: '#ede3d5', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.max(4, item.importance * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #c2410c, #fb923c)' }} />
                      </div>
                    </div>
                  )) : <p style={{ color: '#6b7280' }}>No feature importance available.</p>}
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ title, value, tone }: { title: string; value: string | number; tone: 'good' | 'warn' | 'neutral' }) {
  const colors = {
    good: '#0f766e',
    warn: '#b45309',
    neutral: '#334155',
  };

  return (
    <div style={{ background: '#fffaf2', border: '1px solid #eadfce', borderRadius: '18px', padding: '18px' }}>
      <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280' }}>{title}</div>
      <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '8px', color: colors[tone] }}>{value}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ background: 'rgba(255,250,242,0.92)', border: '1px solid #eadfce', borderRadius: '22px', padding: '20px' }}>
      <h2 style={{ marginTop: 0, marginBottom: '14px' }}>{title}</h2>
      {children}
    </div>
  );
}

const buttonStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid #d8ccb7',
  background: '#fff',
  cursor: 'pointer',
  textAlign: 'left',
  fontWeight: 600,
};

const cellHead: CSSProperties = {
  paddingBottom: '10px',
  borderBottom: '1px solid #eadfce',
};

const cell: CSSProperties = {
  padding: '10px 0',
  borderBottom: '1px solid #f1e8dc',
};
