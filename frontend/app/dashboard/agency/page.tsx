'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardShell from '../_components/DashboardShell';
import ProfilePanel from '../_components/ProfilePanel';
import { clearToken, fetchMe, type AuthUser } from '../../../lib/authClient';
import { fetchActiveCampaigns, type CampaignRecord } from '../../../lib/campaignClient';

interface AgencyMetric {
  label: string;
  value: string;
  meta: string;
}

export default function AgencyDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        const me = await fetchMe();
        if (me.role !== 'agency' && me.role !== 'admin') {
          return router.replace('/dashboard/brand');
        }
        setUser(me);
        const active = await fetchActiveCampaigns().catch(() => []);
        setCampaigns(active);
      } catch {
        clearToken();
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-6 text-gray-700">Loading...</div>;
  }

  if (!user) return null;

  const metrics: AgencyMetric[] = [
    {
      label: 'Profile completion',
      value: `${user.onboarding?.profileCompletion ?? 0}%`,
      meta: 'Complete your agency profile to attract more clients',
    },
    {
      label: 'Creator roster',
      value: user.profile?.rosterSize || 'n/a',
      meta: 'Number of creators you manage',
    },
    {
      label: 'Active campaigns',
      value: String(campaigns.length),
      meta: 'Campaigns currently managed by your agency',
    },
  ];

  return (
    <DashboardShell title="Agency Dashboard" user={user}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>

          <ProfilePanel user={user} onUserChange={setUser} />

          <div className="rounded-2xl border border-black/10 bg-white/70 p-6 shadow-[0_18px_45px_rgba(30,45,122,0.08)] backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-lg font-semibold">Managed campaigns</div>
                <div className="text-sm text-gray-600">Campaigns currently managed by your agency.</div>
              </div>
              <button className="rounded-xl bg-[#3F5AE0] px-4 py-2 text-sm text-white shadow-[0_14px_30px_rgba(63,90,224,0.28)]">
                Post new campaign
              </button>
            </div>

            {campaigns.length ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {campaigns.slice(0, 4).map((campaign) => (
                  <div key={campaign._id} className="rounded-2xl border border-black/10 bg-white p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold">{campaign.title}</div>
                      <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                        {campaign.status}
                      </span>
                    </div>
                    <div className="mt-3 text-sm text-gray-700">{campaign.description}</div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-700">
                      <div>
                        <div className="text-xs text-gray-500">Budget</div>
                        <div className="font-medium">INR {campaign.budgetMin} - {campaign.budgetMax}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Niche</div>
                        <div className="font-medium">{campaign.targetNiche || 'Open'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-black/10 bg-white p-5 text-sm text-gray-600">
                No active campaigns yet. Once brands create and activate campaigns, they will show here.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-black/10 bg-white/70 p-6 shadow-[0_18px_45px_rgba(30,45,122,0.08)] backdrop-blur">
            <div className="text-lg font-semibold">Today</div>
            <div className="mt-2 text-sm text-gray-600">Small next steps to make your account stronger.</div>
            <div className="mt-4 space-y-3">
              {[
                { title: 'Add at least 2 social handles', meta: 'Helps brands verify your presence faster.' },
                { title: 'Write a sharper bio', meta: 'Explain your agency expertise and services.' },
                { title: 'Use the AI pricing tool', meta: 'Generate a baseline price before pitching brands.' },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-black/10 bg-white p-4">
                  <div className="font-medium">{item.title}</div>
                  <div className="mt-1 text-xs text-gray-500">{item.meta}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#3F5AE0]/20 bg-[#3F5AE0]/10 p-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#2E43B7]">AI suggestion</div>
            <div className="mt-2 text-sm text-gray-700">
              {user.profile?.bio
                ? 'Your profile is shaping up well. Connect more socials to improve trust and matching.'
                : 'Write a short bio explaining your agency expertise and services before applying to campaigns.'}
            </div>
            <button className="mt-4 w-full rounded-xl bg-[#0B0B0F] px-4 py-2.5 text-sm text-white">
              Open agency analysis
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function MetricCard({ label, value, meta }: AgencyMetric) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-5 shadow-[0_18px_45px_rgba(30,45,122,0.08)] backdrop-blur">
      <div className="text-xs uppercase tracking-wider text-gray-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold capitalize">{value}</div>
      <div className="mt-2 text-sm text-gray-600">{meta}</div>
    </div>
  );
}