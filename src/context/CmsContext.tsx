import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  ActivityLog,
  ApplicationImage,
  ApplicationItem,
  ContactMessage,
  MediaAsset,
  PrivacyPolicy,
  WebsiteSettings,
} from '../types/cms';
import {
  DEFAULT_APPLICATIONS,
  DEFAULT_MEDIA,
  DEFAULT_POLICIES,
  DEFAULT_SETTINGS,
  resolveAssetUrl,
} from '../lib/defaultData';
import {
  AUTHORIZED_ADMIN_EMAIL,
  getSupabaseConfigDebugInfo,
  isSupabaseConfigured,
  supabase,
  supabaseConfigError,
  supabaseHost,
} from '../lib/supabase';

export type AdminVerifyReason =
  | 'authorized'
  | 'not_configured'
  | 'no_session'
  | 'email_mismatch'
  | 'rls_denied'
  | 'session_expired'
  | 'db_error'
  | 'no_admin_record';

export interface AdminVerifyResult {
  ok: boolean;
  reason: AdminVerifyReason;
  email: string | null;
  message: string;
}

interface CmsContextValue {
  settings: WebsiteSettings;
  applications: ApplicationItem[];
  policies: PrivacyPolicy[];
  messages: ContactMessage[];
  messagesLoading: boolean;
  messagesError: string | null;
  media: MediaAsset[];
  activity: ActivityLog[];
  loading: boolean;
  authLoading: boolean;
  authError: string | null;
  isSupabaseMode: boolean;
  configError: string | null;
  adminEmail: string | null;
  isAdminAuthenticated: boolean;
  // Auth
  signInAdmin: (email: string, password: string) => Promise<{ ok: boolean; message: string }>;
  logoutAdmin: () => Promise<void>;
  clearAuthError: () => void;
  // Settings
  updateSettings: (next: Partial<WebsiteSettings>) => Promise<{ ok: boolean; message: string }>;
  // Applications
  saveApplication: (
    app: Omit<ApplicationItem, 'id' | 'created_at' | 'updated_at'> & { id?: string }
  ) => Promise<{ ok: boolean; message: string; id?: string }>;
  deleteApplication: (id: string) => Promise<{ ok: boolean; message: string }>;
  // Policies
  savePolicy: (
    policy: Omit<PrivacyPolicy, 'id' | 'created_at' | 'updated_at'> & { id?: string }
  ) => Promise<{ ok: boolean; message: string; id?: string }>;
  deletePolicy: (id: string) => Promise<{ ok: boolean; message: string }>;
  // Contact
  refreshMessages: () => Promise<void>;
  submitContactMessage: (
    payload: Omit<ContactMessage, 'id' | 'created_at' | 'is_read'>
  ) => Promise<{ ok: boolean; message: string }>;
  toggleMessageRead: (id: string, isRead: boolean) => Promise<{ ok: boolean; message: string }>;
  deleteContactMessage: (id: string) => Promise<{ ok: boolean; message: string }>;
  // Media
  uploadMediaFile: (file: File) => Promise<{ ok: boolean; url?: string; message: string }>;
  deleteMediaAsset: (id: string) => Promise<{ ok: boolean; message: string }>;
}

const CmsContext = createContext<CmsContextValue | null>(null);

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function normalizeSlug(input: string): string {
  return slugify(input).replace(/^-+|-+$/g, '');
}

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface PgLikeError {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
}

function formatDatabaseError(
  tableLabel: string,
  error: PgLikeError,
  context?: { slug?: string }
): string {
  const code = error.code || '';
  const message = error.message || 'Unknown database error.';
  const msgLower = message.toLowerCase();

  console.error(`[RDS DB] ${tableLabel} operation failed:`, {
    code,
    message,
    details: error.details,
    hint: error.hint,
    host: supabaseHost,
  });

  if (code === '42501' || msgLower.includes('permission denied for table')) {
    if (msgLower.includes('row-level security')) {
      return `Row-Level Security policy rejected this ${tableLabel} change (42501): ${message}. Verify you are signed in as ${AUTHORIZED_ADMIN_EMAIL} and RLS policies use public.is_authorized_admin().`;
    }
    return `Database table permission denied (42501): ${message}. Run supabase/migrations/003_fix_applications_permissions.sql in your Supabase SQL Editor to grant required table privileges.`;
  }

  if (code === '23505' || msgLower.includes('duplicate key')) {
    return context?.slug
      ? `An entry with URL slug "${context.slug}" already exists. Please choose a unique slug.`
      : `Duplicate record conflict (23505): ${message}`;
  }

  if (code === '23514' || msgLower.includes('check constraint')) {
    return `Validation constraint failed (${code || '23514'}): ${message}. Ensure the URL slug uses lowercase letters, numbers, and hyphens only.`;
  }

  if (code === 'PGRST204' || code === '42703' || msgLower.includes('column')) {
    return `Database schema mismatch (${code || 'COLUMN_ERROR'}): ${message}. Ensure migrations 002 and 003 have been executed in Supabase SQL Editor.`;
  }

  return code ? `Database error (${code}): ${message}` : message;
}

export const CmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<WebsiteSettings>(DEFAULT_SETTINGS);
  const [applications, setApplications] = useState<ApplicationItem[]>(DEFAULT_APPLICATIONS);
  const [policies, setPolicies] = useState<PrivacyPolicy[]>(DEFAULT_POLICIES);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [media, setMedia] = useState<MediaAsset[]>(DEFAULT_MEDIA);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);
  const [authLoading, setAuthLoading] = useState<boolean>(isSupabaseConfigured);
  const [authError, setAuthError] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  const isSigningInRef = useRef<boolean>(false);
  const isMutatingAppRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);

  const isAdminAuthenticated =
    isSupabaseConfigured &&
    Boolean(adminEmail) &&
    adminEmail!.toLowerCase() === AUTHORIZED_ADMIN_EMAIL;

  const logActivity = (action: string, target: string) => {
    const entry: ActivityLog = {
      id: `act-${Date.now()}`,
      action,
      target,
      timestamp: new Date().toISOString(),
    };
    setActivity((prev) => [entry, ...prev].slice(0, 20));
  };

  // Update document title, meta description, and favicon dynamically
  useEffect(() => {
    document.title = settings.seo_title || `${settings.brand_name} – ${settings.tagline}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && settings.seo_description) {
      metaDesc.setAttribute('content', settings.seo_description);
    }
    if (settings.favicon_url) {
      let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = resolveAssetUrl(settings.favicon_url);
    }
  }, [
    settings.seo_title,
    settings.seo_description,
    settings.brand_name,
    settings.tagline,
    settings.favicon_url,
  ]);

  const verifyAdminRecord = async (session: Session | null): Promise<AdminVerifyResult> => {
    const client = supabase;
    if (!client) {
      return {
        ok: false,
        reason: 'not_configured',
        email: null,
        message: supabaseConfigError || 'Supabase client is not configured.',
      };
    }

    if (!session || !session.access_token || !session.user) {
      return {
        ok: false,
        reason: 'no_session',
        email: null,
        message: 'No active authentication session found.',
      };
    }

    const rawUserEmail = session.user.email;
    if (!rawUserEmail) {
      console.warn('[RDS Auth] Authenticated user object has no email claim.');
      return {
        ok: false,
        reason: 'email_mismatch',
        email: null,
        message: 'Authenticated account does not contain a verified email address.',
      };
    }

    const normalized = rawUserEmail.trim().toLowerCase();
    console.info('[RDS Auth] Verifying administrator authorization', {
      userEmail: normalized,
      host: supabaseHost,
    });

    if (normalized !== AUTHORIZED_ADMIN_EMAIL) {
      console.warn('[RDS Auth] Email mismatch against designated administrator.', {
        userEmail: normalized,
        expectedEmail: AUTHORIZED_ADMIN_EMAIL,
      });
      return {
        ok: false,
        reason: 'email_mismatch',
        email: null,
        message: `Access denied. Account "${normalized}" is not the authorized RDS TECH FACT administrator.`,
      };
    }

    // Verify the session is attached before querying RLS-protected admin_users
    const { data: currentSessionCheck } = await client.auth.getSession();
    if (!currentSessionCheck.session) {
      console.warn('[RDS Auth] Session missing in Supabase client prior to admin_users query.');
      return {
        ok: false,
        reason: 'no_session',
        email: null,
        message: 'Authentication session could not be persisted. Please enable cookies/storage and retry.',
      };
    }

    // Query only id, email, role (avoids full_name vs fullname column mismatch)
    // RLS policy is_authorized_admin() already restricts rows on the database server.
    const { data, error } = await client
      .from('admin_users')
      .select('id, email, role')
      .limit(5);

    if (error) {
      console.error('[RDS Auth] public.admin_users query error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        host: supabaseHost,
      });

      const msgLower = (error.message || '').toLowerCase();
      if (error.code === 'PGRST301' || msgLower.includes('jwt') || msgLower.includes('expired')) {
        return {
          ok: false,
          reason: 'session_expired',
          email: null,
          message: 'Your authentication session is invalid or expired. Please sign in again.',
        };
      }

      if (error.code === '42501' || msgLower.includes('permission denied')) {
        return {
          ok: false,
          reason: 'rls_denied',
          email: null,
          message: `Database permission error (42501) reading public.admin_users: ${error.message}`,
        };
      }

      return {
        ok: false,
        reason: 'db_error',
        email: null,
        message: `Database verification error (${error.code || 'QUERY_ERROR'}): ${error.message}`,
      };
    }

    if (!data || data.length === 0) {
      console.warn('[RDS Auth] public.admin_users returned 0 rows.', {
        userEmail: normalized,
        host: supabaseHost,
      });
      return {
        ok: false,
        reason: 'no_admin_record',
        email: null,
        message:
          'Authorization verification returned no matching record in public.admin_users (check that the Auth user email matches public.admin_users and RLS policy is_authorized_admin()).',
      };
    }

    const matched = data.find(
      (row) => typeof row.email === 'string' && row.email.trim().toLowerCase() === normalized
    );

    if (!matched) {
      console.warn('[RDS Auth] Returned admin_users rows did not match normalized user email.', {
        userEmail: normalized,
        rowCount: data.length,
      });
      return {
        ok: false,
        reason: 'no_admin_record',
        email: null,
        message: 'No matching administrator record found in public.admin_users for this account.',
      };
    }

    console.info('[RDS Auth] Administrator authorization verified.', {
      userEmail: normalized,
      role: matched.role,
    });

    return {
      ok: true,
      reason: 'authorized',
      email: normalized,
      message: 'Authorized.',
    };
  };

  const loadPublicData = async () => {
    const client = supabase;
    if (!client) return;

    const [settingsRes, appsRes, policiesRes] = await Promise.all([
      client.from('website_settings').select('*').eq('id', 1).maybeSingle(),
      client
        .from('applications')
        .select('*, screenshots:application_images(*)')
        .order('created_at', { ascending: false }),
      client.from('privacy_policies').select('*').order('updated_at', { ascending: false }),
    ]);

    if (!isMountedRef.current) return;

    if (settingsRes.error) {
      console.warn('[RDS Data] Failed to load website_settings:', settingsRes.error.message);
    } else if (settingsRes.data) {
      setSettings(settingsRes.data as WebsiteSettings);
    }

    if (appsRes.error) {
      console.warn('[RDS Data] Failed to load applications:', appsRes.error.message);
    } else if (appsRes.data) {
      const normalizedApps = (appsRes.data as ApplicationItem[]).map((app) => ({
        ...app,
        screenshots: (app.screenshots || []).slice().sort((a, b) => a.sort_order - b.sort_order),
      }));
      setApplications(normalizedApps);
    }

    if (policiesRes.error) {
      console.warn('[RDS Data] Failed to load privacy_policies:', policiesRes.error.message);
    } else if (policiesRes.data) {
      setPolicies(policiesRes.data as PrivacyPolicy[]);
    }
  };

  const refreshMessages = async () => {
    const client = supabase;
    if (!client) return;
    if (isMountedRef.current) {
      setMessagesLoading(true);
      setMessagesError(null);
    }
    try {
      const { data, error } = await client
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (!isMountedRef.current) return;

      if (error) {
        const formatted = formatDatabaseError('contact_messages', error);
        setMessagesError(formatted);
        console.warn('[RDS Data] Failed to load contact_messages:', error.message);
      } else if (data) {
        setMessages(data as ContactMessage[]);
        setMessagesError(null);
      }
    } finally {
      if (isMountedRef.current) {
        setMessagesLoading(false);
      }
    }
  };

  const loadAdminResources = async () => {
    const client = supabase;
    if (!client) return;
    if (isMountedRef.current) {
      setMessagesLoading(true);
      setMessagesError(null);
    }

    try {
      const [msgsRes, storageRes] = await Promise.all([
        client
          .from('contact_messages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(500),
        client.storage
          .from('rds-media')
          .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } }),
      ]);

      if (!isMountedRef.current) return;

      if (msgsRes.error) {
        setMessagesError(formatDatabaseError('contact_messages', msgsRes.error));
        console.warn('[RDS Data] Failed to load contact_messages:', msgsRes.error.message);
      } else if (msgsRes.data) {
        setMessages(msgsRes.data as ContactMessage[]);
        setMessagesError(null);
      }

      if (storageRes.error) {
        console.warn('[RDS Data] Failed to list rds-media storage:', storageRes.error.message);
      } else if (storageRes.data) {
        const assets: MediaAsset[] = storageRes.data
          .filter((item) => item.name && !item.name.startsWith('.'))
          .map((item) => {
            const { data: pub } = client.storage.from('rds-media').getPublicUrl(item.name);
            return {
              id: item.name,
              name: item.name,
              url: pub.publicUrl,
              size: item.metadata?.size || 0,
              mime_type: item.metadata?.mimetype || 'image/jpeg',
              created_at: item.created_at || new Date().toISOString(),
            };
          });
        setMedia(assets.length > 0 ? assets : DEFAULT_MEDIA);
      }
    } finally {
      if (isMountedRef.current) {
        setMessagesLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    const client = supabase;

    if (!client) {
      console.warn('[RDS Config] Supabase disabled:', getSupabaseConfigDebugInfo());
      setLoading(false);
      setAuthLoading(false);
      return () => {
        isMountedRef.current = false;
      };
    }

    console.info('[RDS Config] Supabase client initialized:', getSupabaseConfigDebugInfo());

    const initialize = async () => {
      setLoading(true);
      setAuthLoading(true);
      try {
        const { data: sessionData, error: sessionErr } = await client.auth.getSession();
        if (sessionErr) {
          console.warn('[RDS Auth] getSession error on startup:', sessionErr.message);
        }

        const existingSession = sessionData.session;
        if (existingSession) {
          // Validate session against Auth server so expired/revoked tokens are caught cleanly
          const { data: userCheck, error: userErr } = await client.auth.getUser();
          if (userErr || !userCheck.user) {
            console.warn('[RDS Auth] Persisted session expired or revoked:', userErr?.message);
            await client.auth.signOut();
            if (isMountedRef.current) {
              setAdminEmail(null);
              setMessages([]);
              setAuthError('Your previous session has expired. Please sign in again.');
            }
          } else {
            const verification = await verifyAdminRecord(existingSession);
            if (isMountedRef.current) {
              if (verification.ok) {
                setAdminEmail(verification.email);
                setAuthError(null);
              } else {
                await client.auth.signOut();
                setAdminEmail(null);
                setMessages([]);
                setAuthError(verification.message);
              }
            }
          }
        } else if (isMountedRef.current) {
          setAdminEmail(null);
        }

        await loadPublicData();
        if (existingSession && isMountedRef.current) {
          const { data: latest } = await client.auth.getSession();
          if (latest.session?.user?.email?.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL) {
            await loadAdminResources();
          }
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          setAuthLoading(false);
        }
      }
    };

    initialize();

    const { data: listener } = client.auth.onAuthStateChange((event, session) => {
      // Skip INITIAL_SESSION (handled by initialize) and skip SIGNED_IN while signInAdmin is coordinating
      if (event === 'INITIAL_SESSION') return;
      if (event === 'SIGNED_IN' && isSigningInRef.current) return;

      // Defer async Supabase queries outside the auth lock callback (Supabase v2 best practice)
      window.setTimeout(async () => {
        if (!isMountedRef.current) return;

        if (event === 'SIGNED_OUT' || !session) {
          setAdminEmail(null);
          setMessages([]);
          setActivity([]);
          await loadPublicData();
          return;
        }

        if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          const verification = await verifyAdminRecord(session);
          if (!isMountedRef.current) return;
          if (verification.ok) {
            setAdminEmail(verification.email);
            setAuthError(null);
            await Promise.all([loadPublicData(), loadAdminResources()]);
          } else {
            await client.auth.signOut();
            setAdminEmail(null);
            setMessages([]);
            setAuthError(verification.message);
          }
        }
      }, 0);
    });

    return () => {
      isMountedRef.current = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signInAdmin = async (email: string, password: string) => {
    const client = supabase;
    if (!client) {
      return {
        ok: false,
        message: supabaseConfigError || 'Supabase is not configured.',
      };
    }

    if (isSigningInRef.current) {
      return {
        ok: false,
        message: 'Sign-in is already in progress. Please wait.',
      };
    }

    const normalized = email.trim().toLowerCase();
    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return { ok: false, message: 'Please enter a valid email address.' };
    }
    if (!password) {
      return { ok: false, message: 'Please enter your password.' };
    }

    isSigningInRef.current = true;
    setAuthError(null);

    try {
      console.info('[RDS Auth] Attempting signInWithPassword', {
        email: normalized,
        host: supabaseHost,
      });

      const { data, error } = await client.auth.signInWithPassword({
        email: normalized,
        password,
      });

      if (error) {
        console.warn('[RDS Auth] signInWithPassword error:', {
          status: error.status,
          code: error.code,
          message: error.message,
        });
        const msgLower = error.message.toLowerCase();
        if (msgLower.includes('invalid login credentials')) {
          return { ok: false, message: 'Invalid email or password.' };
        }
        if (msgLower.includes('email not confirmed')) {
          return {
            ok: false,
            message: 'Email address is not confirmed in Supabase Auth.',
          };
        }
        if (msgLower.includes('rate limit') || error.status === 429) {
          return {
            ok: false,
            message: 'Too many authentication attempts. Please wait a moment and try again.',
          };
        }
        if (msgLower.includes('failed to fetch') || msgLower.includes('network')) {
          return {
            ok: false,
            message: `Unable to reach Supabase Auth (${supabaseHost || 'unknown host'}). Check your network and VITE_SUPABASE_URL.`,
          };
        }
        return { ok: false, message: error.message };
      }

      if (!data.session || !data.user) {
        console.error('[RDS Auth] signInWithPassword returned no session or user.');
        return {
          ok: false,
          message: 'Authentication succeeded without an active session. Please verify email confirmation settings.',
        };
      }

      const verification = await verifyAdminRecord(data.session);
      if (!verification.ok) {
        // Always sign out unauthorized or unverified sessions
        await client.auth.signOut();
        setAdminEmail(null);
        setMessages([]);
        return {
          ok: false,
          message: verification.message,
        };
      }

      setAdminEmail(verification.email);
      setAuthError(null);
      await Promise.all([loadPublicData(), loadAdminResources()]);
      logActivity('Signed in to Admin Dashboard', verification.email || normalized);
      return { ok: true, message: 'Signed in successfully.' };
    } catch (err) {
      console.error('[RDS Auth] Unexpected network/runtime error during signInAdmin:', err);
      return {
        ok: false,
        message: 'Network error while signing in. Please check your connection and try again.',
      };
    } finally {
      isSigningInRef.current = false;
    }
  };

  const logoutAdmin = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setAdminEmail(null);
    setAuthError(null);
    setMessages([]);
    setActivity([]);
    await loadPublicData();
  };

  const clearAuthError = () => setAuthError(null);

  const updateSettings = async (next: Partial<WebsiteSettings>) => {
    if (!isAdminAuthenticated || !supabase) {
      return { ok: false, message: 'Unauthorized action. Please sign in as administrator.' };
    }

    const { data, error } = await supabase
      .from('website_settings')
      .update(next)
      .eq('id', 1)
      .select()
      .single();

    if (error) return { ok: false, message: error.message };

    setSettings(data as WebsiteSettings);
    logActivity('Updated website settings', 'Global Configuration');
    return { ok: true, message: 'Website settings saved to Supabase.' };
  };

  const saveApplication = async (
    app: Omit<ApplicationItem, 'id' | 'created_at' | 'updated_at'> & { id?: string }
  ) => {
    const client = supabase;
    if (!isAdminAuthenticated || !client) {
      return { ok: false, message: 'Unauthorized action. Please sign in as administrator.' };
    }
    if (isMutatingAppRef.current) {
      return { ok: false, message: 'An application update is already in progress. Please wait.' };
    }

    const cleanName = app.name.trim();
    const cleanSlug = normalizeSlug(app.slug || cleanName);
    const cleanShortDesc = app.short_description.trim();

    if (!cleanName) {
      return { ok: false, message: 'Application name is required.' };
    }
    if (!cleanSlug || !SLUG_REGEX.test(cleanSlug)) {
      return {
        ok: false,
        message: 'URL slug must contain only lowercase letters, numbers, and hyphens (e.g. my-app).',
      };
    }
    if (!cleanShortDesc) {
      return { ok: false, message: 'Short description is required.' };
    }

    isMutatingAppRef.current = true;
    try {
      const { data: sessionData, error: sessionErr } = await client.auth.getSession();
      if (sessionErr || !sessionData.session) {
        return {
          ok: false,
          message: 'Your administrator session has expired. Please sign in again.',
        };
      }

      const payload = {
        name: cleanName,
        slug: cleanSlug,
        category: app.category?.trim() || 'Software',
        is_featured: Boolean(app.is_featured),
        short_description: cleanShortDesc,
        full_description: app.full_description.trim(),
        logo_url: app.logo_url?.trim() || null,
        features: Array.isArray(app.features) ? app.features : [],
        version: app.version?.trim() || null,
        platform: app.platform?.trim() || null,
        google_play_url: app.google_play_url?.trim() || null,
        website_url: app.website_url?.trim() || null,
        download_url: app.download_url?.trim() || null,
        support_email: app.support_email?.trim() || null,
        status: app.status,
      };

      const isEdit = Boolean(app.id);
      let savedAppId = app.id;

      if (isEdit && app.id) {
        const { data: updatedRow, error } = await client
          .from('applications')
          .update(payload)
          .eq('id', app.id)
          .select('id')
          .single();
        if (error) {
          return {
            ok: false,
            message: formatDatabaseError('applications', error, { slug: cleanSlug }),
          };
        }
        savedAppId = updatedRow.id;
      } else {
        const { data, error } = await client
          .from('applications')
          .insert(payload)
          .select('id')
          .single();
        if (error) {
          return {
            ok: false,
            message: formatDatabaseError('applications', error, { slug: cleanSlug }),
          };
        }
        savedAppId = data.id;
      }

      // Persist screenshots to public.application_images
      if (savedAppId) {
        const { error: delErr } = await client
          .from('application_images')
          .delete()
          .eq('application_id', savedAppId);
        if (delErr) {
          return {
            ok: false,
            message: `Application saved, but screenshot sync failed: ${formatDatabaseError(
              'application_images',
              delErr
            )}`,
          };
        }

        const shots = app.screenshots || [];
        if (shots.length > 0) {
          const rows = shots.map((shot: ApplicationImage, idx: number) => ({
            application_id: savedAppId!,
            image_url: shot.image_url,
            caption: shot.caption || null,
            sort_order: idx,
          }));
          const { error: insErr } = await client.from('application_images').insert(rows);
          if (insErr) {
            return {
              ok: false,
              message: `Application saved, but screenshot insert failed: ${formatDatabaseError(
                'application_images',
                insErr
              )}`,
            };
          }
        }

        // Reload the saved application with its persisted screenshots
        const { data: refreshed, error: refreshErr } = await client
          .from('applications')
          .select('*, screenshots:application_images(*)')
          .eq('id', savedAppId)
          .single();

        if (refreshErr) {
          console.warn('[RDS DB] Saved application reload warning:', refreshErr.message);
          await loadPublicData();
        } else if (refreshed) {
          const rawItem = refreshed as ApplicationItem;
          const item: ApplicationItem = {
            ...rawItem,
            screenshots: (rawItem.screenshots || [])
              .slice()
              .sort((a, b) => a.sort_order - b.sort_order),
          };
          setApplications((prev) =>
            isEdit ? prev.map((a) => (a.id === savedAppId ? item : a)) : [item, ...prev]
          );
        }
      }

      logActivity(
        isEdit ? `Updated application (${app.status})` : `Created application (${app.status})`,
        cleanName
      );
      return {
        ok: true,
        message: isEdit
          ? `Application "${cleanName}" updated.`
          : `Application "${cleanName}" created.`,
        id: savedAppId,
      };
    } catch (err) {
      console.error('[RDS DB] Unexpected error saving application:', err);
      return {
        ok: false,
        message:
          err instanceof Error
            ? `Unexpected error saving application: ${err.message}`
            : 'Unexpected error saving application.',
      };
    } finally {
      isMutatingAppRef.current = false;
    }
  };

  const deleteApplication = async (id: string) => {
    const client = supabase;
    if (!isAdminAuthenticated || !client) {
      return { ok: false, message: 'Unauthorized action. Please sign in as administrator.' };
    }
    if (isMutatingAppRef.current) {
      return { ok: false, message: 'Another application operation is in progress. Please wait.' };
    }

    isMutatingAppRef.current = true;
    try {
      const target = applications.find((a) => a.id === id);
      const { error } = await client.from('applications').delete().eq('id', id);
      if (error) {
        return {
          ok: false,
          message: formatDatabaseError('applications', error),
        };
      }

      setApplications((prev) => prev.filter((a) => a.id !== id));
      logActivity('Deleted application', target?.name || id);
      return { ok: true, message: 'Application deleted.' };
    } finally {
      isMutatingAppRef.current = false;
    }
  };

  const savePolicy = async (
    policy: Omit<PrivacyPolicy, 'id' | 'created_at' | 'updated_at'> & { id?: string }
  ) => {
    if (!isAdminAuthenticated || !supabase) {
      return { ok: false, message: 'Unauthorized action.' };
    }
    const cleanSlug = normalizeSlug(policy.slug || policy.application_name);
    if (!policy.application_name.trim() || !cleanSlug || !SLUG_REGEX.test(cleanSlug)) {
      return {
        ok: false,
        message: 'Application name and valid slug are required for a privacy policy.',
      };
    }

    const payload = {
      application_id: policy.application_id || null,
      application_name: policy.application_name.trim(),
      slug: cleanSlug,
      effective_date: policy.effective_date,
      information_collected: policy.information_collected,
      information_usage: policy.information_usage,
      data_storage: policy.data_storage,
      data_sharing: policy.data_sharing,
      data_security: policy.data_security,
      user_rights: policy.user_rights,
      childrens_privacy: policy.childrens_privacy,
      policy_changes: policy.policy_changes,
      contact_information: policy.contact_information,
      status: policy.status,
    };

    const isEdit = Boolean(policy.id);
    if (isEdit && policy.id) {
      const { data, error } = await supabase
        .from('privacy_policies')
        .update(payload)
        .eq('id', policy.id)
        .select()
        .single();
      if (error) return { ok: false, message: error.message };
      setPolicies((prev) => prev.map((p) => (p.id === policy.id ? (data as PrivacyPolicy) : p)));
      logActivity(`Updated privacy policy (${policy.status})`, policy.application_name);
      return { ok: true, message: 'Privacy policy updated.', id: policy.id };
    } else {
      const { data, error } = await supabase
        .from('privacy_policies')
        .insert(payload)
        .select()
        .single();
      if (error) return { ok: false, message: error.message };
      const created = data as PrivacyPolicy;
      setPolicies((prev) => [created, ...prev]);
      logActivity(`Created privacy policy (${policy.status})`, policy.application_name);
      return { ok: true, message: 'Privacy policy created.', id: created.id };
    }
  };

  const deletePolicy = async (id: string) => {
    if (!isAdminAuthenticated || !supabase) {
      return { ok: false, message: 'Unauthorized action.' };
    }
    const target = policies.find((p) => p.id === id);
    const { error } = await supabase.from('privacy_policies').delete().eq('id', id);
    if (error) return { ok: false, message: error.message };
    setPolicies((prev) => prev.filter((p) => p.id !== id));
    logActivity('Deleted privacy policy', target?.application_name || id);
    return { ok: true, message: 'Privacy policy deleted.' };
  };

  const submitContactMessage = async (
    payload: Omit<ContactMessage, 'id' | 'created_at' | 'is_read'>
  ) => {
    if (!supabase) {
      return {
        ok: false,
        message: 'Contact form backend is not configured yet. Please email us directly.',
      };
    }

    const clean = {
      name: payload.name.trim(),
      email: payload.email.trim(),
      category: payload.category,
      subject: payload.subject.trim(),
      message: payload.message.trim(),
    };

    const { error } = await supabase.from('contact_messages').insert(clean);
    if (error) {
      return { ok: false, message: 'Unable to send message. Please check your inputs and try again.' };
    }

    return {
      ok: true,
      message: 'Your enquiry has been submitted. Thank you for contacting RDS TECH FACT.',
    };
  };

  const toggleMessageRead = async (id: string, isRead: boolean) => {
    const client = supabase;
    if (!isAdminAuthenticated || !client) {
      return { ok: false, message: 'Unauthorized action.' };
    }
    const { error } = await client
      .from('contact_messages')
      .update({ is_read: isRead })
      .eq('id', id)
      .select('id')
      .single();
    if (error) {
      return { ok: false, message: formatDatabaseError('contact_messages', error) };
    }
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: isRead } : m)));
    return { ok: true, message: isRead ? 'Marked as read.' : 'Marked as unread.' };
  };

  const deleteContactMessage = async (id: string) => {
    const client = supabase;
    if (!isAdminAuthenticated || !client) {
      return { ok: false, message: 'Unauthorized action.' };
    }
    const target = messages.find((m) => m.id === id);
    const { error } = await client.from('contact_messages').delete().eq('id', id);
    if (error) {
      return { ok: false, message: formatDatabaseError('contact_messages', error) };
    }
    setMessages((prev) => prev.filter((m) => m.id !== id));
    logActivity('Deleted contact enquiry', target?.subject || target?.name || id);
    return { ok: true, message: 'Enquiry deleted.' };
  };

  const uploadMediaFile = async (file: File) => {
    if (!isAdminAuthenticated || !supabase) {
      return { ok: false, message: 'Unauthorized action. Please sign in as administrator.' };
    }
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      return { ok: false, message: 'Only PNG, JPEG, WebP, and SVG images are permitted.' };
    }
    if (file.size > 5 * 1024 * 1024) {
      return { ok: false, message: 'Image must be 5 MB or smaller.' };
    }

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { error } = await supabase.storage.from('rds-media').upload(safeName, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) return { ok: false, message: error.message };

    const { data: pub } = supabase.storage.from('rds-media').getPublicUrl(safeName);
    const asset: MediaAsset = {
      id: safeName,
      name: safeName,
      url: pub.publicUrl,
      size: file.size,
      mime_type: file.type,
      created_at: new Date().toISOString(),
    };
    setMedia((prev) => [asset, ...prev]);
    logActivity('Uploaded media file', file.name);
    return { ok: true, url: pub.publicUrl, message: 'Image uploaded to Supabase Storage.' };
  };

  const deleteMediaAsset = async (id: string) => {
    if (!isAdminAuthenticated || !supabase) {
      return { ok: false, message: 'Unauthorized action.' };
    }
    const { error } = await supabase.storage.from('rds-media').remove([id]);
    if (error) return { ok: false, message: error.message };
    setMedia((prev) => prev.filter((m) => m.id !== id));
    logActivity('Deleted media file', id);
    return { ok: true, message: 'Media file deleted from Supabase Storage.' };
  };

  return (
    <CmsContext.Provider
      value={{
        settings,
        applications,
        policies,
        messages,
        messagesLoading,
        messagesError,
        media,
        activity,
        loading,
        authLoading,
        authError,
        isSupabaseMode: isSupabaseConfigured,
        configError: supabaseConfigError,
        adminEmail,
        isAdminAuthenticated,
        signInAdmin,
        logoutAdmin,
        clearAuthError,
        updateSettings,
        saveApplication,
        deleteApplication,
        savePolicy,
        deletePolicy,
        refreshMessages,
        submitContactMessage,
        toggleMessageRead,
        deleteContactMessage,
        uploadMediaFile,
        deleteMediaAsset,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export function useCms() {
  const ctx = useContext(CmsContext);
  if (!ctx) throw new Error('useCms must be used within CmsProvider');
  return ctx;
}
