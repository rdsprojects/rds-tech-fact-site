import React, { useState } from 'react';
import { AlertCircle, Eye, Plus, Trash2, Upload, Edit3, CheckCircle, XCircle } from 'lucide-react';
import { normalizeSlug, slugify, useCms } from '../../context/CmsContext';
import { ApplicationImage, ApplicationItem, ApplicationStatus } from '../../types/cms';

interface Props {
  onNotify: (ok: boolean, message: string) => void;
}

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidHttpUrl(value: string): boolean {
  if (!value.trim()) return true;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

const emptyForm = {
  id: undefined as string | undefined,
  name: '',
  slug: '',
  category: 'Software',
  is_featured: false,
  short_description: '',
  full_description: '',
  logo_url: '',
  featuresText: '',
  version: '',
  platform: '',
  google_play_url: '',
  website_url: '',
  download_url: '',
  support_email: 'rdsprojectsmyself@gmail.com',
  status: 'draft' as ApplicationStatus,
  screenshots: [] as ApplicationImage[],
};

export const AdminApplicationsTab: React.FC<Props> = ({ onNotify }) => {
  const { applications, saveApplication, deleteApplication, uploadMediaFile } = useCms();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingTarget, setSavingTarget] = useState<ApplicationStatus | null>(null);
  const [busyAppId, setBusyAppId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const openNew = () => {
    setForm(emptyForm);
    setFormError(null);
    setListError(null);
    setEditing(true);
  };

  const openEdit = (app: ApplicationItem) => {
    setForm({
      id: app.id,
      name: app.name,
      slug: app.slug,
      category: app.category || 'Software',
      is_featured: Boolean(app.is_featured),
      short_description: app.short_description,
      full_description: app.full_description,
      logo_url: app.logo_url || '',
      featuresText: (app.features || []).join('\n'),
      version: app.version || '',
      platform: app.platform || '',
      google_play_url: app.google_play_url || '',
      website_url: app.website_url || '',
      download_url: app.download_url || '',
      support_email: app.support_email || '',
      status: app.status,
      screenshots: app.screenshots || [],
    });
    setFormError(null);
    setListError(null);
    setEditing(true);
  };

  const handleSave = async (targetStatus: ApplicationStatus) => {
    if (saving) return;

    const cleanName = form.name.trim();
    const cleanSlug = normalizeSlug(form.slug || cleanName);
    const cleanShort = form.short_description.trim();

    if (!cleanName) {
      const msg = 'Application Name is required.';
      setFormError(msg);
      onNotify(false, msg);
      return;
    }
    if (!cleanSlug || !SLUG_REGEX.test(cleanSlug)) {
      const msg =
        'URL Slug is required and must contain only lowercase letters, numbers, and hyphens (e.g. my-app).';
      setFormError(msg);
      onNotify(false, msg);
      return;
    }
    if (!cleanShort) {
      const msg = 'Short Description is required.';
      setFormError(msg);
      onNotify(false, msg);
      return;
    }
    if (form.support_email.trim() && !EMAIL_REGEX.test(form.support_email.trim())) {
      const msg = 'Support Email must be a valid email address.';
      setFormError(msg);
      onNotify(false, msg);
      return;
    }
    if (
      !isValidHttpUrl(form.download_url) ||
      !isValidHttpUrl(form.google_play_url) ||
      !isValidHttpUrl(form.website_url)
    ) {
      const msg = 'Optional URLs (Download, Google Play, Website) must start with https:// or http://.';
      setFormError(msg);
      onNotify(false, msg);
      return;
    }

    setFormError(null);
    setSaving(true);
    setSavingTarget(targetStatus);
    try {
      const features = form.featuresText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      const res = await saveApplication({
        id: form.id,
        name: cleanName,
        slug: cleanSlug,
        category: form.category.trim() || 'Software',
        is_featured: form.is_featured,
        short_description: cleanShort,
        full_description: form.full_description.trim(),
        logo_url: form.logo_url.trim(),
        features,
        version: form.version.trim(),
        platform: form.platform.trim(),
        google_play_url: form.google_play_url.trim(),
        website_url: form.website_url.trim(),
        download_url: form.download_url.trim(),
        support_email: form.support_email.trim(),
        status: targetStatus,
        screenshots: form.screenshots,
      });

      onNotify(res.ok, res.message);
      if (res.ok) {
        setEditing(false);
      } else {
        setFormError(res.message);
      }
    } finally {
      setSaving(false);
      setSavingTarget(null);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await uploadMediaFile(file);
    onNotify(res.ok, res.message);
    if (res.ok && res.url) {
      setForm((prev) => ({ ...prev, logo_url: res.url! }));
    } else if (!res.ok) {
      setFormError(res.message);
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await uploadMediaFile(file);
    onNotify(res.ok, res.message);
    if (res.ok && res.url) {
      const nextShot: ApplicationImage = {
        id: `shot-${Date.now()}`,
        application_id: form.id || 'temp',
        image_url: res.url,
        caption: file.name.replace(/\.[^.]+$/, ''),
        sort_order: form.screenshots.length,
        created_at: new Date().toISOString(),
      };
      setForm((prev) => ({ ...prev, screenshots: [...prev.screenshots, nextShot] }));
    } else if (!res.ok) {
      setFormError(res.message);
    }
  };

  const handleQuickStatus = async (app: ApplicationItem, nextStatus: ApplicationStatus) => {
    if (busyAppId) return;
    setListError(null);
    setBusyAppId(app.id);
    try {
      const res = await saveApplication({ ...app, status: nextStatus });
      onNotify(res.ok, res.message);
      if (!res.ok) setListError(res.message);
    } finally {
      setBusyAppId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (busyAppId) return;
    setListError(null);
    setBusyAppId(id);
    try {
      const res = await deleteApplication(id);
      setConfirmDeleteId(null);
      onNotify(res.ok, res.message);
      if (!res.ok) setListError(res.message);
    } finally {
      setBusyAppId(null);
    }
  };

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-xl font-bold text-white">
            {form.id ? `Edit Application: ${form.name}` : 'Add New Application'}
          </h2>
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              setFormError(null);
              setEditing(false);
            }}
            className="px-4 py-2 text-sm text-slate-300 border border-slate-700 hover:border-slate-500 rounded-lg disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

        {formError && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex items-start gap-3"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-red-100">Unable to save application</p>
              <p className="text-red-200/90 break-words">{formError}</p>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-slate-800 bg-[#091225] p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-200">Application Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => {
                  const nextName = e.target.value;
                  setFormError(null);
                  setForm((prev) => ({
                    ...prev,
                    name: nextName,
                    slug: prev.id ? prev.slug : normalizeSlug(nextName),
                  }));
                }}
                placeholder="e.g. RDSPy"
                className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-200">URL Slug *</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                placeholder="e.g. rdspy"
                className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-200">Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="e.g. Developer Tools, Utilities"
                className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <label className="flex items-center gap-3 pt-5 cursor-pointer text-sm text-slate-200">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm((prev) => ({ ...prev, is_featured: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-700 bg-[#050b18] text-blue-600 focus:ring-blue-500"
              />
              <span>Feature this application on the Homepage</span>
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-200">Short Description *</label>
            <input
              type="text"
              value={form.short_description}
              onChange={(e) => setForm((prev) => ({ ...prev, short_description: e.target.value }))}
              placeholder="One-line summary of the application"
              className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-200">Full Description</label>
            <textarea
              rows={4}
              value={form.full_description}
              onChange={(e) => setForm((prev) => ({ ...prev, full_description: e.target.value }))}
              placeholder="Detailed overview of what the application does"
              className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-200">
              Features (one per line)
            </label>
            <textarea
              rows={4}
              value={form.featuresText}
              onChange={(e) => setForm((prev) => ({ ...prev, featuresText: e.target.value }))}
              placeholder="Python utility modules&#10;Clean command-line workflows"
              className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-200">Version</label>
              <input
                type="text"
                value={form.version}
                onChange={(e) => setForm((prev) => ({ ...prev, version: e.target.value }))}
                placeholder="e.g. 1.0.0"
                className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-200">Platform</label>
              <input
                type="text"
                value={form.platform}
                onChange={(e) => setForm((prev) => ({ ...prev, platform: e.target.value }))}
                placeholder="e.g. Android, Windows, Cross-platform"
                className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-200">Support Email</label>
              <input
                type="email"
                value={form.support_email}
                onChange={(e) => setForm((prev) => ({ ...prev, support_email: e.target.value }))}
                className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-200">Download URL</label>
              <input
                type="url"
                value={form.download_url}
                onChange={(e) => setForm((prev) => ({ ...prev, download_url: e.target.value }))}
                placeholder="https://..."
                className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-200">Google Play URL</label>
              <input
                type="url"
                value={form.google_play_url}
                onChange={(e) => setForm((prev) => ({ ...prev, google_play_url: e.target.value }))}
                placeholder="https://play.google.com/..."
                className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-200">Website URL</label>
              <input
                type="url"
                value={form.website_url}
                onChange={(e) => setForm((prev) => ({ ...prev, website_url: e.target.value }))}
                placeholder="https://..."
                className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Logo & Screenshots */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-800">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">Application Logo</label>
              <div className="flex items-center gap-4">
                {form.logo_url ? (
                  <img
                    src={form.logo_url}
                    alt="Logo preview"
                    className="w-14 h-14 rounded-xl object-cover border border-slate-700"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs text-slate-500">
                    None
                  </div>
                )}
                <label className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Upload Logo
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                Screenshots ({form.screenshots.length})
              </label>
              <label className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer">
                <Upload className="w-4 h-4" />
                Add Screenshot
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                  className="hidden"
                />
              </label>
              {form.screenshots.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {form.screenshots.map((shot) => (
                    <div key={shot.id} className="relative group">
                      <img
                        src={shot.image_url}
                        alt={shot.caption || 'Screenshot'}
                        className="w-20 h-14 rounded-lg object-cover border border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            screenshots: prev.screenshots.filter((s) => s.id !== shot.id),
                          }))
                        }
                        aria-label="Remove screenshot"
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('draft')}
              className="px-5 py-2.5 text-sm font-medium text-slate-200 border border-slate-700 hover:border-slate-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving && savingTarget === 'draft' ? 'Saving Draft...' : 'Save Draft'}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('published')}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving && savingTarget === 'published' ? 'Publishing...' : 'Publish Application'}
            </button>
            {form.status === 'published' && (
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave('unpublished')}
                className="px-5 py-2.5 text-sm font-medium text-amber-300 border border-amber-500/40 hover:bg-amber-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving && savingTarget === 'unpublished' ? 'Unpublishing...' : 'Unpublish'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-white">Applications</h2>
          <p className="text-sm text-slate-400">
            Only applications marked as Published appear on the public website.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add Application
        </button>
      </div>

      {listError && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex items-start gap-3"
        >
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="break-words">{listError}</p>
        </div>
      )}

      <div className="rounded-xl border border-slate-800 bg-[#091225] divide-y divide-slate-800">
        {applications.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No applications yet. Click "Add Application" to create your first listing.
          </div>
        ) : (
          applications.map((app) => (
            <div
              key={app.id}
              className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-base font-semibold text-white">{app.name}</h3>
                  <span className="text-xs text-slate-500">·</span>
                  <span
                    className={`text-xs font-medium ${
                      app.status === 'published'
                        ? 'text-emerald-400'
                        : app.status === 'unpublished'
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {app.status === 'published'
                      ? 'Published'
                      : app.status === 'unpublished'
                      ? 'Unpublished'
                      : 'Draft'}
                  </span>
                </div>
                <p className="text-sm text-slate-400 truncate">{app.short_description}</p>
                <p className="text-xs text-slate-500 font-mono">/applications/{app.slug}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <a
                  href={`${import.meta.env.BASE_URL}applications/${app.slug}?preview=1`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 border border-slate-700 hover:border-slate-500 rounded-lg"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </a>
                <button
                  type="button"
                  onClick={() => openEdit(app)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </button>
                {app.status !== 'published' ? (
                  <button
                    type="button"
                    disabled={busyAppId === app.id}
                    onClick={() => handleQuickStatus(app, 'published')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg disabled:opacity-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {busyAppId === app.id ? 'Updating...' : 'Publish'}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busyAppId === app.id}
                    onClick={() => handleQuickStatus(app, 'unpublished')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-300 border border-amber-500/40 hover:bg-amber-500/10 rounded-lg disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    {busyAppId === app.id ? 'Updating...' : 'Unpublish'}
                  </button>
                )}

                {confirmDeleteId === app.id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={busyAppId === app.id}
                      onClick={() => handleDelete(app.id)}
                      className="px-3 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg disabled:opacity-50"
                    >
                      {busyAppId === app.id ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                    <button
                      type="button"
                      disabled={busyAppId === app.id}
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-2.5 py-2 text-xs text-slate-400 hover:text-white disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={busyAppId === app.id}
                    onClick={() => setConfirmDeleteId(app.id)}
                    aria-label={`Delete ${app.name}`}
                    className="inline-flex items-center justify-center w-9 h-9 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/40 rounded-lg disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
