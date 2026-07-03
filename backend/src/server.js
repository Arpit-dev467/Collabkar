import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { handleWaitlistSubmission } from './waitlist.js';
import { suggestPricing } from './pricing.js';
import influencerRoutes from './routes/influencerRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import authRoutes from './routes/authRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import { securityHeaders } from './middleware/securityHeaders.js';
import aiRouter from './routes/ai/index.js';

const app = express();
app.disable('x-powered-by');

const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
  mongoose
    .connect(mongoUri)
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('MongoDB connected.');
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('MongoDB connection failed:', error?.message || error);
    });
} else {
  // eslint-disable-next-line no-console
  console.warn('MONGODB_URI not set. Influencer endpoints will return 503.');
}

const corsOriginRaw = process.env.CORS_ORIGIN;
const corsOrigin = corsOriginRaw
  ? corsOriginRaw.split(',').map((value) => value.trim()).filter(Boolean)
  : (origin, callback) => {
      if (!origin) return callback(null, true);
      if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return callback(null, true);
      return callback(null, false);
    };

app.use(securityHeaders());
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: false }));

app.use(cors({ origin: corsOrigin, credentials: true }));
app.options('*', cors({ origin: corsOrigin, credentials: true }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/influencer', influencerRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);

// AI INTEGRATION LAYER - appended below existing routes, do not modify above
app.use('/api/ai', aiRouter);

app.post('/api/waitlist', async (req, res) => {
  try {
    const result = await handleWaitlistSubmission(req.body);
    res.status(result.status).json(result.json);
  } catch {
    res.status(500).json({ error: 'Unexpected error while saving email.' });
  }
});

app.post('/api/pricing-suggestion', (req, res) => {
  try {
    const { followers, engagement, niche } = req.body ?? {};
    const suggestion = suggestPricing({ followers, engagement, niche });
    res.json({ ok: true, suggestion });
  } catch {
    res.status(500).json({ error: 'Unexpected error while generating suggestion.' });
  }
});

const port = Number(process.env.PORT || 4001);
const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${port}`);
});

server.on('error', (error) => {
  if (error?.code === 'EADDRINUSE') {
    // eslint-disable-next-line no-console
    console.error(
      `Port ${port} is already in use. Stop the other process or set PORT to a different value (e.g. PORT=${port + 1}).`
    );
    process.exit(1);
  }

  if (error?.code === 'EACCES') {
    // eslint-disable-next-line no-console
    console.error(`Permission denied listening on port ${port}. Try a higher port (e.g. PORT=5000).`);
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.error('Server failed to start:', error?.message || error);
  process.exit(1);
});
