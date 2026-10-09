'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { apiUrl } from '../lib/api';

interface PricingSuggestion {
  reel: number;
  story: number;
  post: number;
  range: string;
}

export default function AIPricingTool() {
  const [followers, setFollowers] = useState('');
  const [niche, setNiche] = useState('');
  const [engagement, setEngagement] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<PricingSuggestion | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(apiUrl('/api/pricing-suggestion'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followers, niche, engagement }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data = await response.json();
      setSuggestion(data?.suggestion ?? null);
    } catch {
      const followerCount = parseInt(followers) || 0;
      const engagementRate = parseFloat(engagement) || 0;

      const baseMultiplier = Math.min(followerCount / 10000, 5);
      const engagementMultiplier = engagementRate / 2;
      const nicheMultiplier = niche === 'tech' ? 1.2 : niche === 'lifestyle' ? 1.1 : 1;

      const reelPrice = Math.round((500 + (baseMultiplier * 200) + (engagementMultiplier * 100)) * nicheMultiplier);
      const storyPrice = Math.round(reelPrice * 0.7);
      const postPrice = Math.round(reelPrice * 1.2);

      setSuggestion({
        reel: reelPrice,
        story: storyPrice,
        post: postPrice,
        range: `${Math.round(reelPrice * 0.8)} - ${Math.round(reelPrice * 1.2)}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-center mb-4">AI Pricing Suggestion</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Follower Count</label>
          <input
            type="number"
            value={followers}
            onChange={(e) => setFollowers(e.target.value)}
            placeholder="e.g. 25000"
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Niche</label>
          <select
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="">Select niche</option>
            <option value="tech">Tech</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="food">Food</option>
            <option value="fashion">Fashion</option>
            <option value="travel">Travel</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Engagement Rate (%)</label>
          <input
            type="number"
            step="0.1"
            value={engagement}
            onChange={(e) => setEngagement(e.target.value)}
            placeholder="e.g. 2.5"
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Get AI Suggestion'}
        </button>
      </form>

      {suggestion && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-green-50 rounded-md"
        >
          <h4 className="font-semibold mb-2">Suggested Pricing:</h4>
          <div className="space-y-1 text-sm">
            <p>Reel: ₹{suggestion.reel}</p>
            <p>Story: ₹{suggestion.story}</p>
            <p>Post: ₹{suggestion.post}</p>
            <p className="text-gray-600">Market Range: ₹{suggestion.range}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
