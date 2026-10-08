import { sql } from "drizzle-orm";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "./db/db.js";
import { users as usersTable } from "./db/schema.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HANDLE_REGEX = /^[a-zA-Z0-9._-]{1,50}$/;
const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

const DUMMY_PASSWORD_HASH = bcrypt.hashSync("not-a-valid-user-password", 10);

function getUsersFilePath() {
  return (
    process.env.AUTH_USERS_FILE_PATH ||
    path.join(process.cwd(), "data", "users.json")
  );
}

function getJwtSecret() {
  const secret = process.env.AUTH_JWT_SECRET;

  if (
    process.env.NODE_ENV === "production" &&
    (!secret || secret.length < 32)
  ) {
    throw new Error(
      "AUTH_JWT_SECRET must contain at least 32 characters in production.",
    );
  }

  return secret || "dev-secret-change-me";
}

function getJwtExpiresIn() {
  return process.env.AUTH_JWT_EXPIRES_IN || "7d";
}

function getPasswordPepper() {
  return process.env.AUTH_PASSWORD_PEPPER || "";
}

function isDevAdminLoginEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    String(process.env.AUTH_ALLOW_DEV_ADMIN_LOGIN || "").toLowerCase() ===
      "true"
  );
}

function getDevAdminPassword() {
  return process.env.AUTH_DEV_ADMIN_PASSWORD || "";
}

function getAppBaseUrl() {
  return process.env.APP_BASE_URL || "http://localhost:3000";
}

function getEmailVerifyTokenTtlMin() {
  const raw = process.env.AUTH_EMAIL_VERIFY_TOKEN_TTL_MIN;

  if (!raw) return 60;

  const parsed = Number(raw);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 60;
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    isEmailVerified: Boolean(user.isEmailVerified),
    createdAt: user.createdAt,
    profile: user.profile,
    onboarding: user.onboarding,
  };
}

function normalizeText(value, maxLen = 120) {
  if (typeof value !== "string") return "";

  return value.trim().slice(0, maxLen);
}

function normalizeOptionalUrl(value) {
  const url = normalizeText(value, 240);

  if (!url) return "";

  return URL_REGEX.test(url) ? url : "";
}

function normalizeHandle(value) {
  const raw = normalizeText(value, 50).replace(/^@+/, "");

  if (!raw) return "";

  return HANDLE_REGEX.test(raw) ? raw : "";
}

function normalizeRole(role, fallback = "creator") {
  const normalized = typeof role === "string" ? role.trim().toLowerCase() : "";

  if (normalized === "creator" || normalized === "brand") {
    return normalized;
  }

  return fallback;
}

function inferProfileCompletion(profile, role) {
  let total = 6;
  let score = 0;

  if (profile.displayName) score += 1;
  if (profile.location) score += 1;
  if (profile.website) score += 1;
  if (profile.bio) score += 1;

  if (Object.values(profile.socialHandles || {}).some(Boolean)) {
    score += 1;
  }

  if (role === "brand" ? profile.companyName : profile.creatorCategory) {
    score += 1;
  }

  return Math.round((score / total) * 100);
}

function buildDefaultProfile(role = "creator") {
  return {
    displayName: "",
    companyName: "",
    creatorCategory: "",
    website: "",
    location: "",
    bio: "",
    phone: "",
    primaryPlatform: role === "creator" ? "instagram" : "",
    teamSize: "",
    socialHandles: {
      instagram: "",
      tiktok: "",
      youtube: "",
      linkedin: "",
      x: "",
      website: "",
    },
  };
}

function buildDefaultOnboarding(role = "creator") {
  return {
    completedSteps: ["account_created"],
    profileCompletion: 0,
    signupSource: "email",
    interestedFeatures:
      role === "creator"
        ? ["pricing", "profile_analytics"]
        : ["brand_matching", "campaign_discovery"],
  };
}

function normalizeProfile(input, role) {
  const base = buildDefaultProfile(role);

  const socialInput =
    typeof input?.socialHandles === "object" && input?.socialHandles
      ? input.socialHandles
      : {};

  const profile = {
    ...base,

    displayName: normalizeText(input?.displayName, 80),

    companyName: normalizeText(input?.companyName, 120),

    creatorCategory: normalizeText(input?.creatorCategory, 80),

    website: normalizeOptionalUrl(input?.website),

    location: normalizeText(input?.location, 120),

    bio: normalizeText(input?.bio, 500),

    phone: normalizeText(input?.phone, 40),

    primaryPlatform: normalizeText(input?.primaryPlatform, 40).toLowerCase(),

    teamSize: normalizeText(input?.teamSize, 40),

    socialHandles: {
      instagram: normalizeHandle(
        socialInput.instagram || input?.instagramHandle,
      ),

      tiktok: normalizeHandle(socialInput.tiktok || input?.tiktokHandle),

      youtube: normalizeHandle(socialInput.youtube || input?.youtubeHandle),

      linkedin: normalizeHandle(socialInput.linkedin || input?.linkedinHandle),

      x: normalizeHandle(socialInput.x || input?.xHandle),

      website: normalizeOptionalUrl(socialInput.website || ""),
    },
  };

  if (!profile.socialHandles.website && profile.website) {
    profile.socialHandles.website = profile.website;
  }

  return profile;
}

function validateProfile(profile, role) {
  if (!profile.displayName) {
    return "Name is required.";
  }

  if (role === "brand" && !profile.companyName) {
    return "Company name is required for brand accounts.";
  }

  if (role === "creator" && !profile.creatorCategory) {
    return "Creator category is required for creator accounts.";
  }

  if (profile.website && !URL_REGEX.test(profile.website)) {
    return "Website must be a valid URL.";
  }

  return null;
}
async function readUsers() {
  const rows = await db.select().from(usersTable);

  return rows.map((user) => {
    const role = normalizeRole(user.role, "creator");
    const defaultProfile = buildDefaultProfile(role);

    return {
      ...user,
      role,
      isEmailVerified:
        typeof user.isEmailVerified === "boolean" ? user.isEmailVerified : true,
      oauth: typeof user.oauth === "object" && user.oauth ? user.oauth : {},
      emailVerificationTokenHash: user.emailVerificationTokenHash || "",
      emailVerificationExpiresAt: user.emailVerificationExpiresAt
        ? new Date(user.emailVerificationExpiresAt).toISOString()
        : "",
      createdAt: user.createdAt
        ? new Date(user.createdAt).toISOString()
        : new Date().toISOString(),
      profile:
        typeof user.profile === "object" && user.profile
          ? {
              ...defaultProfile,
              ...user.profile,
              socialHandles: {
                ...defaultProfile.socialHandles,
                ...(typeof user.profile?.socialHandles === "object" &&
                user.profile.socialHandles
                  ? user.profile.socialHandles
                  : {}),
              },
            }
          : defaultProfile,
      onboarding:
        typeof user.onboarding === "object" && user.onboarding
          ? { ...buildDefaultOnboarding(role), ...user.onboarding }
          : buildDefaultOnboarding(role),
    };
  });
}

function toDbRow(user) {
  const expires = user.emailVerificationExpiresAt;

  return {
    id: user.id,
    email: String(user.email).toLowerCase(),
    role: user.role,
    passwordHash: user.passwordHash || "",
    isEmailVerified: Boolean(user.isEmailVerified),
    oauth: user.oauth || {},
    emailVerificationTokenHash: user.emailVerificationTokenHash || "",
    emailVerificationExpiresAt: expires ? new Date(expires) : null,
    profile: user.profile || {},
    onboarding: user.onboarding || {},
    createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
  };
}

async function writeUsers(users) {
  if (!users.length) return;

  await db
    .insert(usersTable)
    .values(users.map(toDbRow))
    .onConflictDoUpdate({
      target: usersTable.id,
      set: {
        email: sql`excluded.email`,
        role: sql`excluded.role`,
        passwordHash: sql`excluded.password_hash`,
        isEmailVerified: sql`excluded.is_email_verified`,
        oauth: sql`excluded.oauth`,
        emailVerificationTokenHash: sql`excluded.email_verification_token_hash`,
        emailVerificationExpiresAt: sql`excluded.email_verification_expires_at`,
        profile: sql`excluded.profile`,
        onboarding: sql`excluded.onboarding`,
      },
    });
}
function issueToken({ sub, role, email }) {
  return jwt.sign(
    {
      role,
      email,
    },
    getJwtSecret(),
    {
      subject: sub,
      expiresIn: getJwtExpiresIn(),
    },
  );
}

export function parseBearerToken(req) {
  const header = req.headers?.authorization;

  if (!header || typeof header !== "string") {
    return null;
  }

  const match = header.match(/^Bearer\s+(.+)$/i);

  return match?.[1] || null;
}

export function requireAuth(req) {
  const token = parseBearerToken(req);

  if (!token) {
    return {
      ok: false,
      status: 401,
      error: "Missing token.",
    };
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());

    const payload = typeof decoded === "object" && decoded ? decoded : null;

    if (!payload) {
      return {
        ok: false,
        status: 401,
        error: "Invalid token.",
      };
    }

    return {
      ok: true,

      auth: {
        sub: payload.sub || null,
        email: payload.email || null,
        role: payload.role || null,
      },
    };
  } catch {
    return {
      ok: false,
      status: 401,
      error: "Invalid token.",
    };
  }
}

export async function signup({ email, password, role, profile: rawProfile }) {
  const normalizedEmail =
    typeof email === "string" ? email.trim().toLowerCase() : "";

  const rawPassword = typeof password === "string" ? password : "";

  const normalizedRole = normalizeRole(role, "");

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return {
      ok: false,
      status: 400,
      error: "Invalid email address.",
    };
  }

  if (Array.from(rawPassword).length < 12) {
    return {
      ok: false,
      status: 400,
      error: "Password must be at least 12 characters.",
    };
  }

  const pepperedPassword = `${rawPassword}${getPasswordPepper()}`;

  if (Buffer.byteLength(pepperedPassword, "utf8") > 72) {
    return {
      ok: false,
      status: 400,
      error: "Password is too long.",
    };
  }

  if (normalizedRole !== "creator" && normalizedRole !== "brand") {
    return {
      ok: false,
      status: 400,
      error: "Role must be creator or brand.",
    };
  }

  const profile = normalizeProfile(rawProfile, normalizedRole);

  const profileError = validateProfile(profile, normalizedRole);

  if (profileError) {
    return {
      ok: false,
      status: 400,
      error: profileError,
    };
  }

  const users = await readUsers();

  const exists = users.some((u) => u.email === normalizedEmail);

  if (exists) {
    return {
      ok: false,
      status: 409,
      error: "User already exists.",
    };
  }

  const passwordHash = await bcrypt.hash(pepperedPassword, 10);

  const user = {
    id: crypto.randomUUID(),

    email: normalizedEmail,

    role: normalizedRole,

    passwordHash,

    isEmailVerified: false,

    oauth: {},

    emailVerificationTokenHash: "",

    emailVerificationExpiresAt: "",

    profile,

    onboarding: {
      ...buildDefaultOnboarding(normalizedRole),

      profileCompletion: inferProfileCompletion(profile, normalizedRole),

      completedSteps: ["account_created", "profile_started"],
    },

    createdAt: new Date().toISOString(),
  };

  const { token, tokenHash, expiresAt } = createEmailVerificationToken();

  user.emailVerificationTokenHash = tokenHash;

  user.emailVerificationExpiresAt = expiresAt;

  await writeUsers([...users, user]);

  const verificationEmailSent = await sendEmailVerification({
    email: user.email,
    verificationToken: token,
  });

  return {
    ok: true,
    status: 201,
    token: null,
    user: publicUser(user),
    requiresEmailVerification: true,
    verificationEmailSent,
  };
}

export async function login({ identifier, password }) {
  const id = typeof identifier === "string" ? identifier.trim() : "";

  const rawPassword = typeof password === "string" ? password : "";

  /*
   * Development-only admin login.
   *
   * Never hardcode the password in source.
   * Configure:
   *
   * AUTH_ALLOW_DEV_ADMIN_LOGIN=true
   * AUTH_DEV_ADMIN_PASSWORD=your-password
   */
  if (isDevAdminLoginEnabled() && id.toLowerCase() === "admin") {
    const adminPassword = getDevAdminPassword();

    if (adminPassword && rawPassword === adminPassword) {
      const token = issueToken({
        sub: "admin",
        role: "admin",
        email: null,
      });

      return {
        ok: true,
        status: 200,
        token,
        user: {
          id: "admin",
          email: null,
          role: "admin",
        },
      };
    }
  }

  const email = id.toLowerCase();

  if (!EMAIL_REGEX.test(email)) {
    return {
      ok: false,
      status: 400,
      error: "Invalid email address.",
    };
  }

  const users = await readUsers();

  const user = users.find((u) => u.email === email);

  const passwordHash = user?.passwordHash || DUMMY_PASSWORD_HASH;

  const pepperedPassword = `${rawPassword}${getPasswordPepper()}`;

  const passwordTooLong = Buffer.byteLength(pepperedPassword, "utf8") > 72;

  const passwordMatches = await bcrypt.compare(
    passwordTooLong
      ? "invalid-password-exceeds-bcrypt-limit"
      : pepperedPassword,
    passwordHash,
  );

  if (!user || !user.passwordHash || passwordTooLong || !passwordMatches) {
    return {
      ok: false,
      status: 401,
      error: "Invalid credentials.",
    };
  }

  if (!user.isEmailVerified) {
    return {
      ok: false,
      status: 403,
      error: "Email not verified. Please check your inbox.",
      requiresEmailVerification: true,
    };
  }

  const token = issueToken({
    sub: user.id,
    role: user.role,
    email: user.email,
  });

  return {
    ok: true,
    status: 200,
    token,
    user: publicUser(user),
  };
}

export async function getUserById(id) {
  const userId = typeof id === "string" ? id.trim() : "";

  if (!userId) return null;

  const users = await readUsers();

  const user = users.find((entry) => entry.id === userId);

  return user ? publicUser(user) : null;
}

export async function updateUserProfile({
  userId,
  role,
  profile: incomingProfile,
}) {
  const normalizedUserId = typeof userId === "string" ? userId.trim() : "";

  if (!normalizedUserId) {
    return {
      ok: false,
      status: 400,
      error: "User id is required.",
    };
  }

  const users = await readUsers();

  const user = users.find((entry) => entry.id === normalizedUserId);

  if (!user) {
    return {
      ok: false,
      status: 404,
      error: "User not found.",
    };
  }

  const effectiveRole = normalizeRole(user.role || role, "creator");

  const mergedProfile = normalizeProfile(
    {
      ...user.profile,

      ...incomingProfile,

      socialHandles: {
        ...(user.profile?.socialHandles || {}),

        ...(incomingProfile?.socialHandles || {}),
      },
    },
    effectiveRole,
  );

  const profileError = validateProfile(mergedProfile, effectiveRole);

  if (profileError) {
    return {
      ok: false,
      status: 400,
      error: profileError,
    };
  }

  user.profile = mergedProfile;

  user.onboarding = {
    ...buildDefaultOnboarding(effectiveRole),

    ...(user.onboarding || {}),

    profileCompletion: inferProfileCompletion(mergedProfile, effectiveRole),

    completedSteps: Array.from(
      new Set([
        ...(user.onboarding?.completedSteps || ["account_created"]),

        "profile_started",
        "profile_completed",
      ]),
    ),
  };

  await writeUsers(users);

  return {
    ok: true,
    status: 200,
    user: publicUser(user),
  };
}

function sha256Hex(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function createEmailVerificationToken() {
  const token = crypto.randomBytes(32).toString("base64url");

  const tokenHash = sha256Hex(`${token}.${getJwtSecret()}`);

  const expiresAt = new Date(
    Date.now() + getEmailVerifyTokenTtlMin() * 60_000,
  ).toISOString();

  return {
    token,
    tokenHash,
    expiresAt,
  };
}

function buildEmailVerificationHtml(verificationLink) {
  return `<!doctype html>
  <html>
    <body style="font-family:Arial,Helvetica,sans-serif;color:#111;margin:0;padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center" style="padding:32px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 0 20px rgba(0,0,0,.08);">
              <tr>
                <td style="padding:32px;">
                  <h1 style="margin:0 0 16px;font-size:24px;color:#111;">
                    Verify your CollabKar account
                  </h1>

                  <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#333;">
                    Click the button below to confirm your email address and finish setting up your account.
                  </p>

                  <p style="margin:0 0 32px;">
                    <a
                      href="${verificationLink}"
                      style="display:inline-block;padding:14px 24px;background:#0e74ff;color:#ffffff;text-decoration:none;border-radius:8px;font-size:16px;"
                    >
                      Verify email
                    </a>
                  </p>

                  <p style="margin:0;font-size:14px;line-height:1.6;color:#666;">
                    If the button does not work, paste this link into your browser:
                  </p>

                  <p style="word-break:break-all;font-size:14px;color:#0e74ff;margin:8px 0 0;">
                    ${verificationLink}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

async function sendEmailVerification({ email, verificationToken }) {
  const link = `${getAppBaseUrl()}/verify-email?token=${encodeURIComponent(
    verificationToken,
  )}`;

  const resendApiKey = process.env.RESEND_API_KEY;

  const resendFromEmail = process.env.RESEND_FROM_EMAIL;

  if (resendApiKey && resendFromEmail) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${resendApiKey}`,
        },

        body: JSON.stringify({
          from: resendFromEmail,
          to: email,
          subject: "Verify your CollabKar account",
          html: buildEmailVerificationHtml(link),
        }),

        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) {
        console.error(`[auth] Resend returned HTTP ${response.status}.`);

        return false;
      }

      return true;
    } catch (error) {
      console.error("[auth] Resend email failed:", error?.message || error);

      return false;
    }
  }

  if (process.env.NODE_ENV === "production") {
    console.error("[auth] Email verification delivery is not configured.");

    return false;
  }

  console.log(`[auth] Email verification for ${email}: ${link}`);

  return true;
}

function isExpired(iso) {
  if (!iso) return true;

  const time = Date.parse(iso);

  if (!Number.isFinite(time)) {
    return true;
  }

  return time <= Date.now();
}

export async function resendVerificationEmail({ email }) {
  const normalizedEmail =
    typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return {
      ok: false,
      status: 400,
      error: "Invalid email address.",
    };
  }

  const users = await readUsers();

  const user = users.find((u) => u.email === normalizedEmail);

  // Do not leak whether an account exists.
  if (!user) {
    return {
      ok: true,
      status: 200,
      sent: true,
    };
  }

  if (user.isEmailVerified) {
    return {
      ok: true,
      status: 200,
      sent: true,
    };
  }

  const { token, tokenHash, expiresAt } = createEmailVerificationToken();

  user.emailVerificationTokenHash = tokenHash;

  user.emailVerificationExpiresAt = expiresAt;

  await writeUsers(users);

  await sendEmailVerification({
    email: user.email,
    verificationToken: token,
  });

  return {
    ok: true,
    status: 200,
    sent: true,
  };
}

export async function verifyEmail({ token }) {
  const rawToken = typeof token === "string" ? token.trim() : "";

  if (!rawToken) {
    return {
      ok: false,
      status: 400,
      error: "token is required.",
    };
  }

  const tokenHash = sha256Hex(`${rawToken}.${getJwtSecret()}`);

  const users = await readUsers();

  const user = users.find((u) => u.emailVerificationTokenHash === tokenHash);

  if (!user) {
    return {
      ok: false,
      status: 400,
      error: "Invalid or expired token.",
    };
  }

  if (isExpired(user.emailVerificationExpiresAt)) {
    return {
      ok: false,
      status: 400,
      error: "Invalid or expired token.",
    };
  }

  user.isEmailVerified = true;

  user.emailVerificationTokenHash = "";

  user.emailVerificationExpiresAt = "";

  await writeUsers(users);

  const jwtToken = issueToken({
    sub: user.id,
    role: user.role,
    email: user.email,
  });

  return {
    ok: true,
    status: 200,
    token: jwtToken,
    user: publicUser(user),
  };
}

/**
 * OAuth user creation / login.
 *
 * IMPORTANT:
 * Existing accounts are NOT automatically linked
 * to OAuth identities just because the email matches.
 *
 * To link an OAuth provider to an existing account,
 * use an authenticated account-linking endpoint.
 */
export async function findOrCreateOAuthUser({
  provider,
  providerId,
  email,
  role = "creator",
}) {
  const normalizedEmail =
    typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return {
      ok: false,
      status: 400,
      error: "Provider did not return a valid email.",
    };
  }

  const normalizedProvider =
    typeof provider === "string" ? provider.trim().toLowerCase() : "";

  const normalizedProviderId =
    providerId != null ? String(providerId).trim() : "";

  if (!["google", "facebook", "apple"].includes(normalizedProvider)) {
    return {
      ok: false,
      status: 400,
      error: "Unsupported OAuth provider.",
    };
  }

  if (!normalizedProviderId) {
    return {
      ok: false,
      status: 400,
      error: "Provider id is required.",
    };
  }

  const users = await readUsers();

  /*
   * First look for an existing OAuth identity.
   * This is the safe way to recognize an
   * already-linked OAuth account.
   */
  const existingOAuthUser = users.find((user) => {
    if (!user.oauth) return false;

    if (normalizedProvider === "google") {
      return user.oauth.googleSub === normalizedProviderId;
    }

    if (normalizedProvider === "facebook") {
      return user.oauth.facebookId === normalizedProviderId;
    }

    if (normalizedProvider === "apple") {
      return user.oauth.appleSub === normalizedProviderId;
    }

    return false;
  });

  if (existingOAuthUser) {
    existingOAuthUser.isEmailVerified = true;

    await writeUsers(users);

    const jwtToken = issueToken({
      sub: existingOAuthUser.id,
      role: existingOAuthUser.role,
      email: existingOAuthUser.email,
    });

    return {
      ok: true,
      status: 200,
      token: jwtToken,
      user: publicUser(existingOAuthUser),
    };
  }

  /*
   * If the email already belongs to a
   * password account, do NOT silently link
   * the OAuth identity.
   *
   * The frontend can then ask the user to
   * log in normally and explicitly link OAuth.
   */
  const existingEmailUser = users.find(
    (user) => user.email === normalizedEmail,
  );

  if (existingEmailUser) {
    return {
      ok: false,
      status: 409,
      error:
        "An account with this email already exists. Please sign in with your existing account before linking this OAuth provider.",
      requiresAccountLinking: true,
    };
  }

  const effectiveRole = normalizeRole(role, "creator");

  const profile = buildDefaultProfile(effectiveRole);

  profile.displayName = normalizedEmail.split("@")[0];

  const user = {
    id: crypto.randomUUID(),

    email: normalizedEmail,

    role: effectiveRole,

    passwordHash: "",

    isEmailVerified: true,

    oauth: {},

    emailVerificationTokenHash: "",

    emailVerificationExpiresAt: "",

    profile,

    onboarding: {
      ...buildDefaultOnboarding(effectiveRole),

      signupSource: normalizedProvider,

      profileCompletion: inferProfileCompletion(profile, effectiveRole),
    },

    createdAt: new Date().toISOString(),
  };

  if (normalizedProvider === "google") {
    user.oauth.googleSub = normalizedProviderId;
  }

  if (normalizedProvider === "facebook") {
    user.oauth.facebookId = normalizedProviderId;
  }

  if (normalizedProvider === "apple") {
    user.oauth.appleSub = normalizedProviderId;
  }

  users.push(user);

  await writeUsers(users);

  const jwtToken = issueToken({
    sub: user.id,
    role: user.role,
    email: user.email,
  });

  return {
    ok: true,
    status: 200,
    token: jwtToken,
    user: publicUser(user),
  };
}
