/* eslint-disable no-console */
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { handleWaitlistSubmission } from './waitlist.js';
import { suggestPricing } from './pricing.js';
import influencerRoutes from './routes/influencerRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import authRoutes from './routes/authRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import { securityHeaders } from './middleware/securityHeaders.js';
import aiRouter from './routes/ai/index.js';

const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

/* ------------------------------------------------------------------ */
/* Environment checks                                                  */
/* ------------------------------------------------------------------ */

const REQUIRED_IN_PRODUCTION = [
  'MONGODB_URI',
  'AUTH_JWT_SECRET',
  'APP_BASE_URL',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
];

if (isProd) {
  const missing = REQUIRED_IN_PRODUCTION.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
  if (process.env.AUTH_JWT_SECRET.length < 32) {
    console.error('AUTH_JWT_SECRET must contain at least 32 characters in production.');
    process.exit(1);
  }
  try {
    const appUrl = new URL(process.env.APP_BASE_URL);
    if (appUrl.protocol !== 'https:' || appUrl.hostname === 'localhost') throw new Error('invalid_app_url');
  } catch {
    console.error('APP_BASE_URL must be a valid HTTPS URL in production.');
    process.exit(1);
  }
}

/* ------------------------------------------------------------------ */
/* App setup                                                           */
/* ------------------------------------------------------------------ */

const app = express();
app.disable('x-powered-by');

// Needed so rate limiting sees the real client IP behind Vercel, Render, Nginx, etc.
const trustProxy = process.env.TRUST_PROXY ?? (isProd ? '1' : '0');
app.set('trust proxy', Number.isNaN(Number(trustProxy)) ? trustProxy : Number(trustProxy));

/* ------------------------------------------------------------------ */
/* CORS                                                                */
/* ------------------------------------------------------------------ */

const corsOriginRaw = process.env.CORS_ORIGIN;
const corsOrigin = corsOriginRaw
  ? corsOriginRaw.split(',').map((value) => value.trim()).filter(Boolean)
  : (origin, callback) => {
      if (!origin) return callback(null, true);
      if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return callback(null, true);
      return callback(null, false);
    };

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

// Removes Mongo operator keys ($ne, $gt, ...) and prototype-pollution keys
// from user input so it cannot change the meaning of a database query.
const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function stripOperators(value) {
  if (Array.isArray(value)) return value.map(stripOperators);
  if (value && typeof value === 'object') {
    const clean = {};
    for (const [key, inner] of Object.entries(value)) {
      if (key.startsWith('$') || key.includes('.') || BLOCKED_KEYS.has(key)) continue;
      clean[key] = stripOperators(inner);
    }
    return clean;
  }
  return value;
}

function sanitizeInput(req, _res, next) {
  if (req.body) req.body = stripOperators(req.body);
  if (req.params) req.params = stripOperators(req.params);
  try {
    Object.defineProperty(req, 'query', {
      value: stripOperators(req.query),
      writable: true,
      configurable: true,
      enumerable: true,
    });
  } catch {
    // If query cannot be replaced in this Express version, continue without it.
  }
  next();
}

function requireDatabase(_req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database is not available. Please try again shortly.' });
  }
  return next();
}

function makeLimiter({ windowMs, max, message, skipSuccessfulRequests = false }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    message: { error: message },
  });
}

const MINUTE = 60 * 1000;

const apiLimiter = makeLimiter({
  windowMs: 15 * MINUTE,
  max: 300,
  message: 'Too many requests. Please slow down.',
});

// Only failed attempts count, which targets password guessing without
// blocking normal logged-in traffic.
const authLimiter = makeLimiter({
  windowMs: 15 * MINUTE,
  max: 20,
  skipSuccessfulRequests: true,
  message: 'Too many failed attempts. Please try again later.',
});

const aiLimiter = makeLimiter({
  windowMs: 10 * MINUTE,
  max: 30,
  message: 'AI request limit reached. Please try again in a few minutes.',
});

const waitlistLimiter = makeLimiter({
  windowMs: 60 * MINUTE,
  max: 5,
  message: 'Too many submissions. Please try again later.',
});

/* ------------------------------------------------------------------ */
/* Middleware                                                          */
/* ------------------------------------------------------------------ */

app.use(securityHeaders());
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: false, limit: '200kb' }));
app.use(sanitizeInput);
app.use('/api', apiLimiter);

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */

app.get('/health', (_req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected || !process.env.MONGODB_URI ? 200 : 503).json({
    ok: dbConnected || !process.env.MONGODB_URI,
    db: process.env.MONGODB_URI ? (dbConnected ? 'connected' : 'disconnected') : 'not configured',
    uptime: Math.round(process.uptime()),
  });
});

// Both AI routers live under one mount so rate limiting applies once.
// Requests go to aiRoutes first, then fall through to aiRouter.
// Tip: merge these two files into one router when you get time.
const combinedAiRouter = express.Router();
combinedAiRouter.use(aiRoutes);
combinedAiRouter.use(aiRouter);

app.use('/api/influencer', requireDatabase, influencerRoutes);
app.use('/api/auth', authLimiter, requireDatabase, authRoutes);
app.use('/api/campaigns', requireDatabase, campaignRoutes);
app.use('/api/ai', aiLimiter, combinedAiRouter);

app.post('/api/waitlist', waitlistLimiter, async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Invalid request body.' });
    }
    const result = await handleWaitlistSubmission(req.body);
    return res.status(result.status).json(result.json);
  } catch (error) {
    console.error('Waitlist error:', error?.message || error);
    return res.status(500).json({ error: 'Unexpected error while saving email.' });
  }
});

app.post('/api/pricing-suggestion', (req, res) => {
  try {
    const { followers, engagement, niche } = req.body ?? {};

    const followersNum = Number(followers);
    const engagementNum = Number(engagement);

    if (!Number.isFinite(followersNum) || followersNum < 0) {
      return res.status(400).json({ error: 'followers must be a non-negative number.' });
    }
    if (!Number.isFinite(engagementNum) || engagementNum < 0) {
      return res.status(400).json({ error: 'engagement must be a non-negative number.' });
    }
    if (niche !== undefined && (typeof niche !== 'string' || niche.length > 60)) {
      return res.status(400).json({ error: 'niche must be a string of at most 60 characters.' });
    }

    const suggestion = suggestPricing({
      followers: followersNum,
      engagement: engagementNum,
      niche,
    });
    return res.json({ ok: true, suggestion });
  } catch (error) {
    console.error('Pricing error:', error?.message || error);
    return res.status(500).json({ error: 'Unexpected error while generating suggestion.' });
  }
});

/* ------------------------------------------------------------------ */
/* 404 and error handling                                              */
/* ------------------------------------------------------------------ */

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON in request body.' });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large.' });
  }

  const status = Number.isInteger(err?.status) && err.status >= 400 && err.status < 600 ? err.status : 500;
  if (status >= 500) console.error('Unhandled error:', err?.stack || err);

  return res.status(status).json({
    error: status >= 500 ? 'Internal server error.' : err?.message || 'Request failed.',
  });
});

/* ------------------------------------------------------------------ */
/* Startup and shutdown                                                */
/* ------------------------------------------------------------------ */

async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn('MONGODB_URI not set. Database-backed endpoints will return 503.');
    return;
  }

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log('MongoDB connected.');
  } catch (error) {
    console.error('MongoDB connection failed:', error?.message || error);
    if (isProd) process.exit(1);
    console.warn('Continuing without a database (non-production mode).');
  }
}

let server;

async function shutdown(signal, exitCode = 0) {
  console.log(`${signal} received. Shutting down...`);
  const forceTimer = setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
  forceTimer.unref();

  try {
    if (server) await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error during shutdown:', error?.message || error);
  }
  process.exit(exitCode);
}

async function start() {
  await connectDatabase();

  const port = Number(process.env.PORT || 4001);
  server = app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });

  server.on('error', (error) => {
    if (error?.code === 'EADDRINUSE') {
      console.error(
        `Port ${port} is already in use. Stop the other process or set PORT to a different value (e.g. PORT=${port + 1}).`
      );
      process.exit(1);
    }

    if (error?.code === 'EACCES') {
      console.error(`Permission denied listening on port ${port}. Try a higher port (e.g. PORT=5000).`);
      process.exit(1);
    }

    console.error('Server failed to start:', error?.message || error);
    process.exit(1);
  });

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled promise rejection:', reason);
  });
  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    shutdown('uncaughtException', 1);
  });
}

// Tests can import the app without starting a server.
if (!isTest) {
  start();
}

export default app;