'use client';

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { aiApi } from '../../lib/api';
import AISidebar from '../components/AISidebar';

type MatchItem = {
  username: string;
  score: number;
  estimated_price: number;
  engagement_rate: number;
  niche: string;
  location: string | null;
  followers: number;
};

type MatchResponse = {
  matches: MatchItem[];
  model?: string;
};

export default function BrandMatch() {
  const [form, setForm] = useState({
    campaign_description: '',
    target_niche: '',
    target_location: '',
    budget_min: '',
    budget_max: '',
    min_engagement_rate: '0.02',
    min_followers: '1000',
  });
  const [results, setResults] = useState<MatchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [key]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = {
        ...form,
        budget_min: parseFloat(form.budget_min) || 0,
        budget_max: parseFloat(form.budget_max) || 0,
        min_engagement_rate: parseFloat(form.min_engagement_rate) || 0.02,
        min_followers: parseInt(form.min_followers, 10) || 1000,
        creators: [],
      };
      const res = await aiApi.match<MatchResponse>(data);
      setResults(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Matching failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <AISidebar />
      <div style={{ padding: '20px', flex: 1 }}>
        <h1>Brand Creator Matching</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Campaign Description: <textarea value={form.campaign_description} onChange={updateField('campaign_description')} required /></label>
          </div>
          <div>
            <label>Target Niche: <select value={form.target_niche} onChange={updateField('target_niche')} required>
              <option value="">Select Niche</option>
              <option value="fitness">Fitness</option>
              <option value="beauty">Beauty</option>
              <option value="food">Food</option>
              <option value="travel">Travel</option>
              <option value="tech">Tech</option>
              <option value="fashion">Fashion</option>
              <option value="lifestyle">Lifestyle</option>
            </select></label>
          </div>
          <div>
            <label>Target Location: <input type="text" value={form.target_location} onChange={updateField('target_location')} /></label>
          </div>
          <div>
            <label>Budget Min: <input type="number" value={form.budget_min} onChange={updateField('budget_min')} required /></label>
          </div>
          <div>
            <label>Budget Max: <input type="number" value={form.budget_max} onChange={updateField('budget_max')} required /></label>
          </div>
          <div>
            <label>Min Engagement Rate: <input type="number" step="0.01" value={form.min_engagement_rate} onChange={updateField('min_engagement_rate')} /></label>
          </div>
          <div>
            <label>Min Followers: <input type="number" value={form.min_followers} onChange={updateField('min_followers')} /></label>
          </div>
          <button type="submit" disabled={loading}>{loading ? 'Matching...' : 'Find Matches'}</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {results && (
          <div>
            <h2>Matches ({results.matches.length})</h2>
            <p>Model: {results.model ?? 'n/a'}</p>
            {results.matches.map((creator) => (
              <div key={creator.username} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
                <p><strong>{creator.username}</strong></p>
                <p>Score: {creator.score}</p>
                <p>Engagement Rate: {creator.engagement_rate}</p>
                <p>Niche: {creator.niche}</p>
                <p>Estimated Price: INR {creator.estimated_price}</p>
                <p>Followers: {creator.followers}</p>
                <p>Location: {creator.location || 'n/a'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
