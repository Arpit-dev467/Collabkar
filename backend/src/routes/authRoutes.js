import express from 'express';
import { createRateLimiter } from '../middleware/rateLimit.js';
import {
  getUserById,
  login,
  requireAuth,
  resendVerificationEmail,
  signup,
  updateUserProfile,
  verifyEmail,
} from '../auth.js';
import { oauthCallback, oauthStart, oauthComplete } from '../oauth/handlers.js';
import { oauthExchange } from '../oauth/handlers.js';

const router = express.Router();

const authLimiter = createRateLimiter({ windowMs: 60_000, max: 20 });
const loginLimiter = createRateLimiter({ windowMs: 60_000, max: 10 });

router.post('/signup', authLimiter, async (req, res) => {
  try {
    const { email, password, role, profile } = req.body ?? {};
    const result = await signup({ email, password, role, profile });
    if (!result.ok) return res.status(result.status).json({ ok: false, error: result.error });
    return res.status(result.status).json({
      ok: true,
      token: result.token,
      user: result.user,
      requiresEmailVerification: Boolean(result.requiresEmailVerification),
    });
  } catch {
    return res.status(500).json({ ok: false, error: 'Unexpected error during signup.' });
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { identifier, password } = req.body ?? {};
    const result = await login({ identifier, password });
    if (!result.ok) {
      return res.status(result.status).json({
        ok: false,
        error: result.error,
        requiresEmailVerification: Boolean(result.requiresEmailVerification),
      });
    }
    return res.status(200).json({ ok: true, token: result.token, user: result.user });
  } catch {
    return res.status(500).json({ ok: false, error: 'Unexpected error during login.' });
  }
});

router.get('/me', (req, res) => {
  Promise.resolve()
    .then(async () => {
      const auth = requireAuth(req);
      if (!auth.ok) return res.status(auth.status).json({ ok: false, error: auth.error });
      const user = await getUserById(auth.auth.sub);
      return res.json({
        ok: true,
        user: user || { id: auth.auth.sub, email: auth.auth.email, role: auth.auth.role },
      });
    })
    .catch(() => res.status(500).json({ ok: false, error: 'Unexpected error while loading current user.' }));
});

router.patch('/profile', async (req, res) => {
  try {
    const auth = requireAuth(req);
    if (!auth.ok) return res.status(auth.status).json({ ok: false, error: auth.error });

    const result = await updateUserProfile({
      userId: auth.auth.sub,
      role: auth.auth.role,
      profile: req.body ?? {},
    });

    if (!result.ok) return res.status(result.status).json({ ok: false, error: result.error });
    return res.json({ ok: true, user: result.user });
  } catch {
    return res.status(500).json({ ok: false, error: 'Unexpected error while updating profile.' });
  }
});

router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body ?? {};
    const result = await verifyEmail({ token });
    if (!result.ok) return res.status(result.status).json({ ok: false, error: result.error });
    return res.json({ ok: true, token: result.token, user: result.user });
  } catch {
    return res.status(500).json({ ok: false, error: 'Unexpected error while verifying email.' });
  }
});

router.post('/resend-verification', authLimiter, async (req, res) => {
  try {
    const { email } = req.body ?? {};
    const result = await resendVerificationEmail({ email });
    if (!result.ok) return res.status(result.status).json({ ok: false, error: result.error });
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false, error: 'Unexpected error while resending verification.' });
  }
});

// OAuth routes added in a later step.
router.get('/oauth/:provider/start', oauthStart);
router.all('/oauth/:provider/callback', oauthCallback);
router.post('/oauth/exchange', async (req, res) => oauthExchange(req, res));
router.post('/oauth/complete', async (req, res) => oauthComplete(req, res));

export default router;
