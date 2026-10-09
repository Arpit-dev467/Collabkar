import express from 'express';
import crypto from 'node:crypto';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../db/db.js';
import { campaigns } from '../db/schema.js';
import { requireAuth, getUserById } from '../auth.js';

const router = express.Router();
const CAMPAIGN_STATUSES = new Set(['draft', 'active', 'paused', 'closed']);

function normalizeText(value, max = 240) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function normalizeNumber(value) {
  const parsed = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDeliverables(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => normalizeText(item, 80)).filter(Boolean).slice(0, 10);
}

router.get('/mine', async (req, res) => {
  try {
    const auth = requireAuth(req);
    if (!auth.ok) return res.status(auth.status).json({ ok: false, error: auth.error });
    const results = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.ownerId, auth.auth.sub))
      .orderBy(desc(campaigns.updatedAt));
    return res.json({ ok: true, campaigns: results });
  } catch (error) {
    console.error('Failed to load campaigns:', error?.message || error);
    return res.status(500).json({ ok: false, error: 'Unexpected error while loading campaigns.' });
  }
});

router.get('/active', async (_req, res) => {
  try {
    const results = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.status, 'active'))
      .orderBy(desc(campaigns.updatedAt))
      .limit(20);
    return res.json({ ok: true, campaigns: results });
  } catch (error) {
    console.error('Failed to load active campaigns:', error?.message || error);
    return res.status(500).json({ ok: false, error: 'Unexpected error while loading campaigns.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const auth = requireAuth(req);
    if (!auth.ok) return res.status(auth.status).json({ ok: false, error: auth.error });
    if (auth.auth.role !== 'brand' && auth.auth.role !== 'admin') {
      return res.status(403).json({ ok: false, error: 'Only brand accounts can create campaigns.' });
    }
    const title = normalizeText(req.body?.title, 120);
    const description = normalizeText(req.body?.description, 1000);
    const status = normalizeText(req.body?.status, 20) || 'draft';
    if (!title || !description) {
      return res.status(400).json({ ok: false, error: 'title and description are required.' });
    }
    if (!CAMPAIGN_STATUSES.has(status)) {
      return res.status(400).json({ ok: false, error: 'Invalid campaign status.' });
    }

    const user = await getUserById(auth.auth.sub);
    const now = new Date().toISOString();
    const [campaign] = await db.insert(campaigns).values({
      id: crypto.randomUUID(),
      ownerId: auth.auth.sub,
      ownerEmail: user?.email || '',
      ownerName: user?.profile?.companyName || user?.profile?.displayName || user?.email || 'Brand',
      title,
      description,
      targetNiche: normalizeText(req.body?.targetNiche, 80),
      targetLocation: normalizeText(req.body?.targetLocation, 120),
      budgetMin: Math.max(0, normalizeNumber(req.body?.budgetMin)),
      budgetMax: Math.max(0, normalizeNumber(req.body?.budgetMax)),
      deliverables: normalizeDeliverables(req.body?.deliverables),
      status,
      createdAt: now,
      updatedAt: now,
    }).returning();

    return res.status(201).json({ ok: true, campaign });
  } catch (error) {
    console.error('Failed to create campaign:', error?.message || error);
    return res.status(500).json({ ok: false, error: 'Unexpected error while creating campaign.' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const auth = requireAuth(req);
    if (!auth.ok) return res.status(auth.status).json({ ok: false, error: auth.error });
    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, req.params.id))
      .limit(1);
    if (!campaign) return res.status(404).json({ ok: false, error: 'Campaign not found.' });
    if (campaign.ownerId !== auth.auth.sub && auth.auth.role !== 'admin') {
      return res.status(403).json({ ok: false, error: 'Not allowed to update this campaign.' });
    }

    const updates = {};
    if (req.body?.title !== undefined) updates.title = normalizeText(req.body.title, 120);
    if (req.body?.description !== undefined) updates.description = normalizeText(req.body.description, 1000);
    if (req.body?.targetNiche !== undefined) updates.targetNiche = normalizeText(req.body.targetNiche, 80);
    if (req.body?.targetLocation !== undefined) updates.targetLocation = normalizeText(req.body.targetLocation, 120);
    if (req.body?.budgetMin !== undefined) updates.budgetMin = Math.max(0, normalizeNumber(req.body.budgetMin));
    if (req.body?.budgetMax !== undefined) updates.budgetMax = Math.max(0, normalizeNumber(req.body.budgetMax));
    if (req.body?.deliverables !== undefined) updates.deliverables = normalizeDeliverables(req.body.deliverables);
    if (req.body?.status !== undefined) {
      const status = normalizeText(req.body.status, 20) || campaign.status;
      if (!CAMPAIGN_STATUSES.has(status)) {
        return res.status(400).json({ ok: false, error: 'Invalid campaign status.' });
      }
      updates.status = status;
    }
    updates.updatedAt = new Date().toISOString();

    const [updatedCampaign] = await db
      .update(campaigns)
      .set(updates)
      .where(and(eq(campaigns.id, req.params.id), eq(campaigns.ownerId, campaign.ownerId)))
      .returning();
    if (!updatedCampaign) return res.status(404).json({ ok: false, error: 'Campaign not found.' });
    return res.json({ ok: true, campaign: updatedCampaign });
  } catch (error) {
    console.error('Failed to update campaign:', error?.message || error);
    return res.status(500).json({ ok: false, error: 'Unexpected error while updating campaign.' });
  }
});

export default router;
