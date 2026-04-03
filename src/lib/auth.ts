import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Industrial Edge Fallback: Absolutely hardcoded to the root workspace
// to bypass any $HOME environment variable issues under systemd, and completely
// bypass path.join to prevent Windows build-time backslash injection.
const DATA_DIR = '/root/.nanobot';
const AUTH_FILE = '/root/.nanobot/auth.json';
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

export async function getAuthConfig(): Promise<AuthConfig | null> {
  try {
    // FORCE BYPASS of any Next.js OS-level stat caching
    const stat = fs.statSync(AUTH_FILE, { throwIfNoEntry: false });
    if (!stat) return null;
    
    const data = await fs.promises.readFile(AUTH_FILE, 'utf-8');
    return JSON.parse(data) as AuthConfig;
  } catch (error: any) {
    console.error('FAILED TO READ AUTH CONFIG:', error);
    throw new Error('FATAL SECURITY ERROR: auth.json exists but is unreadable: ' + error.message);
  }
}

async function saveAuthConfig(config: AuthConfig) {
  try {
    await fs.promises.writeFile(AUTH_FILE, JSON.stringify(config, null, 2), 'utf-8');
    // We optionally read it back to guarantee it hit the disk
    await fs.promises.access(AUTH_FILE);
  } catch (e) {
    console.error("FATAL ERROR WRITING AUTH FILE TO DISK:", e);
    throw new Error("Unable to save credentials to disk. Permission denied or storage full.");
  }
}

// -----------------------------------------------------------------------------
// CRYPTO UTILITIES (Node.js Safe)
// -----------------------------------------------------------------------------

function hashPassword(password: string, salt: string): string {
  return crypto.createHash('sha512').update(password + salt).digest('hex');
}

function createSessionSignature(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

// -----------------------------------------------------------------------------
// ACTIONS & GUARDS
// -----------------------------------------------------------------------------

export async function requireAuth() {
  const config = await getAuthConfig();
  if (!config) return true;

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(COOKIE_NAME)?.value;

  if (!sessionToken) {
    throw new Error('NEXT_REDIRECT');
  }

  const [tokenData, signature] = sessionToken.split('.');
  if (!tokenData || !signature) {
    throw new Error('NEXT_REDIRECT');
  }

  const expectedSignature = createSessionSignature(tokenData, config.sessionSecret);
  const sigBuffer = Buffer.from(signature);
  const expBuffer = Buffer.from(expectedSignature);
  
  if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
    throw new Error('NEXT_REDIRECT');
  }

  const expiresAt = parseInt(tokenData, 10);
  if (Date.now() > expiresAt) {
    throw new Error('NEXT_REDIRECT');
  }

  return true;
}

export async function setupSystemAuth(password: string, recoveryEmail: string) {
  const config = await getAuthConfig();
  if (config) {
    throw new Error('SYSTEM ALREADY SECURED. MODIFICATION REQUIRES CURRENT CREDENTIALS.');
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);
  const sessionSecret = crypto.randomBytes(32).toString('hex');

  await saveAuthConfig({
    passwordHash,
    salt,
    recoveryEmail,
    sessionSecret
  });

  return await loginAction(password);
}

export async function loginAction(password: string) {
  const config = await getAuthConfig();
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
    secure: false, // Edge devices often use raw HTTP. Forcing true causes browsers to drop the cookie.
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
  // Throwing special error rather than Next.js redirect
  throw new Error('NEXT_REDIRECT_LOGIN');
}
