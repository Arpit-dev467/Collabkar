import { randomUUID } from 'node:crypto';
import { db } from './db/db.js';
import { waitlist } from './db/schema.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function handleWaitlistSubmission(body) {
  const brandName = typeof body?.brandName === 'string' ? body.brandName.trim() : '';
  const creatorName = typeof body?.creatorName === 'string' ? body.creatorName.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const source = typeof body?.source === 'string' ? body.source.trim() : '';

  if (!brandName || !creatorName || !source) {
    return { status: 400, json: { error: 'Please complete all required fields.' } };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { status: 400, json: { error: 'Invalid email address.' } };
  }

  const timestamp = new Date().toISOString();
  const webhookUrl = process.env.WAITLIST_WEBHOOK_URL;

  await db
    .insert(waitlist)
    .values({
      id: randomUUID(),
      email,
      brandName,
      creatorName,
      source,
    })
    .onConflictDoNothing({ target: waitlist.email });

  if (webhookUrl) {
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brandName, creatorName, email, source, timestamp }),
    });

    if (!webhookResponse.ok) {
      return { status: 502, json: { error: 'Webhook save failed.' } };
    }

    return { status: 200, json: { ok: true, mode: 'webhook' } };
  }

  return { status: 200, json: { ok: true, mode: 'database' } };
}
