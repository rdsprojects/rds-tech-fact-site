import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DESIGNATED_ADMIN_EMAIL = 'rdsprojectsmyself@gmail.com';

function sanitizeEnv(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.trim().replace(/^["']|["']$/g, '').trim();
}

const rawEnvAdminEmail = sanitizeEnv(
  import.meta.env.VITE_ADMIN_EMAIL as string | undefined
)?.toLowerCase();

export const AUTHORIZED_ADMIN_EMAIL = DESIGNATED_ADMIN_EMAIL;
export const ADMIN_EMAIL_ENV_MISMATCH =
  Boolean(rawEnvAdminEmail) && rawEnvAdminEmail !== DESIGNATED_ADMIN_EMAIL;

const rawUrl = sanitizeEnv(import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(
  /\/+$/,
  ''
);
const rawKey = sanitizeEnv(import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);

function isJwtServiceRole(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64)) as { role?: string };
    return payload.role === 'service_role';
  } catch {
    return false;
  }
}

function validateConfig(): { valid: boolean; error: string | null; host: string | null } {
  if (!rawUrl || rawUrl.includes('your-project-id')) {
    return {
      valid: false,
      host: null,
      error:
        'Missing VITE_SUPABASE_URL environment variable. Configure your Supabase Project URL to enable authentication and database access.',
    };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return {
      valid: false,
      host: null,
      error: 'Invalid VITE_SUPABASE_URL format. Expected a valid https://<project-ref>.supabase.co URL.',
    };
  }

  if (parsedUrl.protocol !== 'https:' && parsedUrl.hostname !== 'localhost' && parsedUrl.hostname !== '127.0.0.1') {
    return {
      valid: false,
      host: parsedUrl.host,
      error: 'VITE_SUPABASE_URL must use HTTPS.',
    };
  }

  if (!rawKey || rawKey.includes('your-supabase-anon-key')) {
    return {
      valid: false,
      host: parsedUrl.host,
      error:
        'Missing VITE_SUPABASE_ANON_KEY environment variable. Configure your Supabase Publishable API Key (sb_publishable_...) to enable authentication and database access.',
    };
  }

  if (rawKey.startsWith('sb_secret_') || rawKey.includes('service_role') || isJwtServiceRole(rawKey)) {
    return {
      valid: false,
      host: parsedUrl.host,
      error:
        'Security error: A secret or service_role key was detected in VITE_SUPABASE_ANON_KEY. Replace it immediately with a public publishable key (sb_publishable_...).',
    };
  }

  return { valid: true, host: parsedUrl.host, error: null };
}

const validation = validateConfig();

export const isSupabaseConfigured = validation.valid;
export const supabaseConfigError = validation.error;
export const supabaseHost = validation.host;

if (ADMIN_EMAIL_ENV_MISMATCH) {
  console.warn(
    `[RDS Config] VITE_ADMIN_EMAIL ("${rawEnvAdminEmail}") does not match designated administrator "${DESIGNATED_ADMIN_EMAIL}". Enforcing "${DESIGNATED_ADMIN_EMAIL}".`
  );
}

export function getSupabaseConfigDebugInfo() {
  return {
    configured: isSupabaseConfigured,
    host: supabaseHost,
    keyFormat: !rawKey
      ? 'missing'
      : rawKey.startsWith('sb_publishable_')
      ? 'sb_publishable'
      : rawKey.startsWith('eyJ')
      ? 'anon_jwt'
      : 'other',
    adminEmailConfigured: AUTHORIZED_ADMIN_EMAIL,
    adminEmailEnvMismatch: ADMIN_EMAIL_ENV_MISMATCH,
  };
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(rawUrl!, rawKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
