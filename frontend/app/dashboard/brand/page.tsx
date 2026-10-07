'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import DashboardShell from '../_components/DashboardShell';
import ProfilePanel from '../_components/ProfilePanel';
import { clearToken, fetchMe, type AuthUser } from '../../../lib/authClient';
import { createCampaign, fetchMyCampaigns, updateCampaign, type CampaignRecord } from '../../../lib/campaignClient';

export default function BrandDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [campaignLoading, setCampaignLoading] = useState(true);
  const [campaignError, setCampaignError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    targetNiche: '',
    targetLocation: '',
    budgetMin: '',
    budgetMax: '',
    deliverables: '',
  });
  const [savingCampaign, setSavingCampaign] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const me = await fetchMe();
        if (me.role !== 'brand' && me.role !== 'admin') {
          return router.replace('/dashboard/creator');
        }
        setUser(me);
      } catch {
        clearToken();
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    loadCampaigns();
  }, [user]);

  async function loadCampaigns() {
    setCampaignLoading(true);
    setCampaignError(null);
    try {
      const data = await fetchMyCampaigns();
      setCampaigns(data);
    } catch (error) {
      setCampaignError(error instanceof Error ? error.message : 'Failed to load campaigns');
    } finally {
      setCampaignLoading(false);
    }
  }

  async function onCreateCampaign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingCampaign(true);
    setCampaignError(null);
    try {
      const created = await createCampaign({
        title: form.title,
        description: form.description,
        targetNiche: form.targetNiche,
        targetLocation: form.targetLocation,
        budgetMin: Number(form.budgetMin) || 0,
        budgetMax: Number(form.budgetMax) || 0,
        deliverables: form.deliverables.split(',').map((value) => value.trim()).filter(Boolean),
        status: 'draft',
      });
      setCampaigns((current) => [created, ...current]);
      setForm({
        title: '',
        description: '',
        targetNiche: '',
        targetLocation: '',
        budgetMin: '',
        budgetMax: '',
        deliverables: '',
      });
    } catch (error) {
      setCampaignError(error instanceof Error ? error.message : 'Failed to create campaign');
    } finally {
      setSavingCampaign(false);
    }
  }

  async function changeStatus(campaign: CampaignRecord, status: CampaignRecord['status']) {
    try {
      const updated = await updateCampaign(campaign._id, { status });
      setCampaigns((current) => current.map((item) => (item._id === updated._id ? updated : item)));
    } catch (error) {
      setCampaignError(error instanceof Error ? error.message : 'Failed to update campaign');
    }
  }

  const totalBudget = useMemo(
    () => campaigns.reduce((sum, campaign) => sum + (campaign.budgetMax || 0), 0),
    [campaigns]
  );

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-6 text-gray-700">Loading...</div>;
  }

  if (!user) return null;

  return (
    <DashboardShell title="Brand Dashboard" user={user}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard
              label="Profile completion"
              value={`${user.onboarding?.profileCompletion ?? 0}%`}
              meta="Complete your company profile to build creator trust"
            />
            <MetricCard
              label="Live campaigns"
              value={String(campaigns.filter((campaign) => campaign.status === 'active').length)}
              meta={`${campaigns.length} total campaigns in this MVP`}
            />
            <MetricCard
              label="Planned budget"
              value={`INR ${totalBudget}`}
              meta="Based on max campaign budgets"
            />
          </div>

          <ProfilePanel user={user} onUserChange={setUser} />

          <div className="rounded-2xl border border-black/10 bg-white/70 p-6 shadow-[0_18px_45px_rgba(30,45,122,0.08)] backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-lg font-semibold">Create campaign</div>
                <div className="text-sm text-gray-600">Save your first campaign brief directly in the app.</div>
              </div>
            </div>

            <form onSubmit={onCreateCampaign} className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Title" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} required />
              <Field label="Target niche" value={form.targetNiche} onChange={(value) => setForm((current) => ({ ...current, targetNiche: value }))} />
              <Field label="Target location" value={form.targetLocation} onChange={(value) => setForm((current) => ({ ...current, targetLocation: value }))} />
              <Field label="Budget min" type="number" value={form.budgetMin} onChange={(value) => setForm((current) => ({ ...current, budgetMin: value }))} />
              <Field label="Budget max" type="number" value={form.budgetMax} onChange={(value) => setForm((current) => ({ ...current, budgetMax: value }))} />
              <Field label="Deliverables" value={form.deliverables} onChange={(value) => setForm((current) => ({ ...current, deliverables: value }))} placeholder="1 reel, 2 stories" />
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/20"
                  required
                />
              </div>
              <div className="md:col-span-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={savingCampaign}
                  className="rounded-xl bg-[#3F5AE0] px-4 py-2 text-sm text-white shadow-[0_14px_30px_rgba(63,90,224,0.28)]"
                >
                  {savingCampaign ? 'Saving...' : 'Save campaign'}
                </button>
                {campaignError && <div className="text-sm text-red-600">{campaignError}</div>}
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white/70 p-6 shadow-[0_18px_45px_rgba(30,45,122,0.08)] backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-lg font-semibold">Saved campaigns</div>
                <div className="text-sm text-gray-600">Your brand’s live and draft briefs stored in MongoDB.</div>
              </div>
              <button
                onClick={loadCampaigns}
                className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-gray-700"
              >
                Refresh
              </button>
            </div>

            {campaignLoading ? (
              <div className="mt-4 text-sm text-gray-600">Loading campaigns...</div>
            ) : campaigns.length ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {campaigns.map((campaign) => (
                  <div key={campaign._id} className="rounded-2xl border border-black/10 bg-white p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold">{campaign.title}</div>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        campaign.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : campaign.status === 'draft'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}>
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
                        <div className="text-xs text-gray-500">Target niche</div>
                        <div className="font-medium">{campaign.targetNiche || 'Any'}</div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {campaign.status !== 'active' && (
                        <button onClick={() => changeStatus(campaign, 'active')} className="flex-1 rounded-lg bg-[#0B0B0F] px-3 py-2 text-xs text-white">
                          Activate
                        </button>
                      )}
                      {campaign.status !== 'paused' && (
                        <button onClick={() => changeStatus(campaign, 'paused')} className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs text-gray-700">
                          Pause
                        </button>
                      )}
                      {campaign.status !== 'closed' && (
                        <button onClick={() => changeStatus(campaign, 'closed')} className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs text-gray-700">
                          Close
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 text-sm text-gray-600">No campaigns yet. Create your first one above.</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-black/10 bg-white/70 p-6 shadow-[0_18px_45px_rgba(30,45,122,0.08)] backdrop-blur">
            <div className="text-lg font-semibold">Next actions</div>
            <div className="mt-2 text-sm text-gray-600">Quick moves to make this brand account operational.</div>
            <div className="mt-4 space-y-3">
              {[
                { title: 'Complete company profile', meta: 'Brands with strong profiles convert better with creators.' },
                { title: 'Create one active campaign', meta: 'Then use AI brand match to test creator discovery.' },
                { title: 'Set clear deliverables', meta: 'Creators reply faster when the ask is concrete.' },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-black/10 bg-white p-4">
                  <div className="font-medium">{item.title}</div>
                  <div className="mt-1 text-xs text-gray-500">{item.meta}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#3F5AE0]/20 bg-[#3F5AE0]/10 p-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#2E43B7]">AI brief helper</div>
            <div className="mt-2 text-sm text-gray-700">
              Use your saved campaign data as the base input for AI matching and pricing.
            </div>
            <button className="mt-4 w-full rounded-xl bg-[#0B0B0F] px-4 py-2.5 text-sm text-white">
              Open brand match
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function MetricCard({ label, value, meta }: { label: string; value: string; meta: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-5 shadow-[0_18px_45px_rgba(30,45,122,0.08)] backdrop-blur">
      <div className="text-xs uppercase tracking-wider text-gray-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
      <div className="mt-2 text-sm text-gray-600">{meta}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/20"
      />
    </div>
  );
}
