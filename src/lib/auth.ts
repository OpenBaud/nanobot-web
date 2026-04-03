import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const DATA_DIR = path.join(process.cwd(), 'data');
const AUTH_FILE = path.join(DATA_DIR, 'auth.json');
const COOKIE_NAME = 'nanobot_sys_auth';

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface AuthConfig {
  passwordHash: string;
  salt: string;
  recoveryEmail: string;
  sessionSecret: string;
}

// -----------------------------------------------------------------------------
// CORE STORAGE LOGIC
// -----------------------------------------------------------------------------

export function getAuthConfig(): AuthConfig | null {
  try {
    if (!fs.existsSync(AUTH_FILE)) return null;
    const data = fs.readFileSync(AUTH_FILE, 'utf-8');
    return JSON.parse(data) as AuthConfig;
  } catch (error) {
    console.error('FAILED TO READ AUTH CONFIG:', error);
    return null;
  }
}

function saveAuthConfig(config: AuthConfig) {
  fs.writeFileSync(AUTH_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

// -----------------------------------------------------------------------------
// CRYPTO UTILITIES
// -----------------------------------------------------------------------------

function hashPassword(password: string, salt: string): string {
  // Using pbkdf2Sync for secure hashing without external dependencies
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function createSessionSignature(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

// -----------------------------------------------------------------------------
// ACTIONS & GUARDS
// -----------------------------------------------------------------------------

/**
 * Server Component Guard. Place at top of protected pages.
 * Throws redirect if unauthorized.
 */
export async function requireAuth() {
  const config = getAuthConfig();
  // IF NO CONFIG EXISTS, SYSTEM IS IN OPEN MODE
  if (!config) return true;

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(COOKIE_NAME)?.value;

  if (!sessionToken) {
    redirect('/login');
  }

  // Verify token signature
  const [tokenData, signature] = sessionToken.split('.');
  if (!tokenData || !signature) {
    redirect('/login');
  }

  const expectedSignature = createSessionSignature(tokenData, config.sessionSecret);
  const sigBuffer = Buffer.from(signature);
  const expBuffer = Buffer.from(expectedSignature);
  
  if (sigBuffer.length !== expBuffer.length) {
    redirect('/login');
  }

  const isValid = crypto.timingSafeEqual(sigBuffer, expBuffer);

  if (!isValid) {
    redirect('/login');
  }

  // Check expiration (timestamp is embedded in tokenData)
  const expiresAt = parseInt(tokenData, 10);
  if (Date.now() > expiresAt) {
    redirect('/login');
  }

  return true;
}

/**
 * Setup Action (To lock the system)
 */
export async function setupSystemAuth(password: string, recoveryEmail: string) {
  const config = getAuthConfig();
  if (config) {
    throw new Error('SYSTEM ALREADY SECURED. MODIFICATION REQUIRES CURRENT CREDENTIALS.');
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);
  const sessionSecret = crypto.randomBytes(32).toString('hex');

  saveAuthConfig({
    passwordHash,
    salt,
    recoveryEmail,
    sessionSecret
  });

  // Automatically log the user in so they don't get locked out immediately
  return await loginAction(password);
}

/**
 * Login Action
 */
export async function loginAction(password: string) {
  const config = getAuthConfig();
  if (!config) throw new Error('SYSTEM IS NOT CONFIGURED WITH AUTHENTICATION.');

  const inputHash = hashPassword(password, config.salt);
  
  if (inputHash !== config.passwordHash) {
    return { success: false, message: 'ACCESS DENIED: INVALID CREDENTIALS' };
  }

  // Create valid session for 24 hours
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  const tokenData = expiresAt.toString();
  const signature = createSessionSignature(tokenData, config.sessionSecret);
  const sessionCookie = `${tokenData}.${signature}`;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 // 24 hours
  });

  return { success: true };
}

/**
 * Logout Action
 */
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect('/login');
}
