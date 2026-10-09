'use client';

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { aiApi } from '../../lib/api';
import AISidebar from '../components/AISidebar';

type AnalyzeResponse = {
  username: string;
  profile: {
    engagement_rate: number;
    niche: string;
    location: string | null;
  };
  niche_prediction: {
    niche: string;
    confidence: number;
  };
  fake_detection: {
    is_fake: boolean;
    authentic_probability: number;
  };
  price_prediction: {
    post: number;
    range: string;
  };
};

export default function CreatorSearch() {
  const [form, setForm] = useState({
    username: '',
    followers: '',
    avg_likes: '',
    avg_comments: '',
    captions: '',
    hashtags: '',
    post_frequency: '',
    location: '',
  });
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [key]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = {
        ...form,
        followers: parseInt(form.followers, 10) || 0,
        avg_likes: parseFloat(form.avg_likes) || 0,
        avg_comments: parseFloat(form.avg_comments) || 0,
        captions: form.captions.split('\n').filter(Boolean),
        hashtags: form.hashtags.split(',').map((tag) => tag.trim()).filter(Boolean),
        post_frequency: parseFloat(form.post_frequency) || 0,
      };
      const res = await aiApi.analyze<AnalyzeResponse>(data);
      setResult(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <AISidebar />
      <div style={{ padding: '20px', flex: 1 }}>
        <h1>Creator Analysis</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username: <input type="text" value={form.username} onChange={updateField('username')} required /></label>
          </div>
          <div>
            <label>Followers: <input type="number" value={form.followers} onChange={updateField('followers')} /></label>
          </div>
          <div>
            <label>Avg Likes: <input type="number" step="0.01" value={form.avg_likes} onChange={updateField('avg_likes')} /></label>
          </div>
          <div>
            <label>Avg Comments: <input type="number" step="0.01" value={form.avg_comments} onChange={updateField('avg_comments')} /></label>
          </div>
          <div>
            <label>Captions (one per line): <textarea value={form.captions} onChange={updateField('captions')} /></label>
          </div>
          <div>
            <label>Hashtags (comma separated): <textarea value={form.hashtags} onChange={updateField('hashtags')} /></label>
          </div>
          <div>
            <label>Post Frequency: <input type="number" step="0.01" value={form.post_frequency} onChange={updateField('post_frequency')} /></label>
          </div>
          <div>
            <label>Location: <input type="text" value={form.location} onChange={updateField('location')} /></label>
          </div>
          <button type="submit" disabled={loading}>{loading ? 'Analyzing...' : 'Analyze'}</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {result && (
          <div style={{ border: '1px solid #ccc', padding: '10px', marginTop: '20px' }}>
            <h2>Analysis Result</h2>
            <p>Username: {result.username}</p>
            <p>Engagement Rate: {result.profile.engagement_rate}</p>
            <p>Niche: <span style={{ backgroundColor: '#f0f0f0', padding: '2px 5px' }}>{result.niche_prediction.niche}</span> ({(result.niche_prediction.confidence * 100).toFixed(1)}% confidence)</p>
            {result.fake_detection.is_fake && <p style={{ color: 'red' }}>Manual review recommended</p>}
            <p>Predicted Price: INR {result.price_prediction.post} (Range: {result.price_prediction.range})</p>
            <p>Location: {result.profile.location || 'n/a'}</p>
            <p>Authentic Probability: {(result.fake_detection.authentic_probability * 100).toFixed(1)}%</p>
          </div>
        )}
      </div>
    </div>
  );
}
