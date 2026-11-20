import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Clock,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Trash2,
  Upload,
} from 'lucide-react';
import { useCms } from '../../context/CmsContext';
import { DEFAULT_FOUNDER_WORK_STATUS, resolveAssetUrl } from '../../lib/defaultData';
import { WebsiteSettings } from '../../types/cms';

interface Props {
  mode: 'homepage' | 'settings';
  onNotify: (ok: boolean, message: string) => void;
}

function buildPhotoSlots(settings: WebsiteSettings): [string, string, string] {
  const list: string[] = [];
  if (settings.founder_photo_url?.trim()) {
    list.push(settings.founder_photo_url.trim());
  }
  for (const item of settings.founder_photos || []) {
    if (typeof item === 'string' && item.trim() && !list.includes(item.trim())) {
      list.push(item.trim());
    }
  }
  return [list[0] || '', list[1] || '', list[2] || ''];
}

export const AdminContentSettingsTab: React.FC<Props> = ({ mode, onNotify }) => {
  const { settings, media, updateSettings, uploadMediaFile, uploadResumeFile } = useCms();
  const [form, setForm] = useState<WebsiteSettings>(settings);
  const [photoSlots, setPhotoSlots] = useState<[string, string, string]>(() =>
    buildPhotoSlots(settings)
  );
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(settings);
    setPhotoSlots(buildPhotoSlots(settings));
  }, [settings]);

  const workStatus = {
    ...DEFAULT_FOUNDER_WORK_STATUS,
    ...(form.founder_work_status || {}),
  };

  const imageAssets = media.filter((m) => !m.mime_type || m.mime_type.startsWith('image/'));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const cleanedPhotos = photoSlots.map((s) => s.trim()).filter(Boolean).slice(0, 3);
    const primaryPhoto = cleanedPhotos[0] || form.founder_photo_url;
    const rawInterval = Number(form.founder_photo_interval);
    const safeInterval = Number.isFinite(rawInterval)
      ? Math.min(120, Math.max(3, Math.round(rawInterval)))
      : 10;

    const res = await updateSettings({
      ...form,
      founder_photo_url: primaryPhoto,
      founder_photos: cleanedPhotos,
      founder_photo_interval: safeInterval,
      founder_work_status: workStatus,
    });

    setSaving(false);
    onNotify(res.ok, res.message);
  };

  const handleSlotUpload = async (slotIndex: 0 | 1 | 2, file: File) => {
    setUploadingSlot(slotIndex);
    try {
      const res = await uploadMediaFile(file);
      onNotify(res.ok, res.message);
      if (res.ok && res.url) {
        setPhotoSlots((prev) => {
          const next: [string, string, string] = [...prev] as [string, string, string];
          next[slotIndex] = res.url!;
          return next;
        });
        if (slotIndex === 0) {
          setForm((prev) => ({ ...prev, founder_photo_url: res.url! }));
        }
      }
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResume(true);
    try {
      const res = await uploadResumeFile(file);
      onNotify(res.ok, res.message);
      if (res.ok && res.url) {
        const cleanTitle = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
        setForm((prev) => ({
          ...prev,
          founder_resume_url: res.url!,
          founder_resume_title: prev.founder_resume_title?.trim() || cleanTitle,
          founder_resume_updated_at:
            prev.founder_resume_updated_at?.trim() ||
            `Updated ${new Date().toLocaleDateString(undefined, {
              month: 'short',
              year: 'numeric',
            })}`,
        }));
      }
    } finally {
      setUploadingResume(false);
      e.target.value = '';
    }
  };

  if (mode === 'homepage') {
    return (
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <h2 className="font-display text-xl font-bold text-white">Homepage, Founder &amp; About Content</h2>
          <p className="text-sm text-slate-400">
            Manage hero copy, rotating founder portraits, current working status, and resume
            attachments across the Home and About pages.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#091225] p-5 sm:p-6 space-y-6">
          {/* Brand & Hero Section */}
          <div className="space-y-4">
            <h3 className="font-display text-base font-semibold text-white">Brand &amp; Hero</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-200">Brand Name</label>
                <input
                  type="text"
                  value={form.brand_name}
                  onChange={(e) => setForm((p) => ({ ...p, brand_name: e.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-200">Tagline</label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-200">Main Hero Heading</label>
              <input
                type="text"
                value={form.hero_heading}
                onChange={(e) => setForm((p) => ({ ...p, hero_heading: e.target.value }))}
                className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-200">Hero Description</label>
              <textarea
                rows={3}
                value={form.hero_description}
                onChange={(e) => setForm((p) => ({ ...p, hero_description: e.target.value }))}
                className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Founder Portrait Gallery (Up to 3 Images + Transition Interval) */}
          <div className="pt-5 border-t border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-base font-semibold text-white">
                  Founder Portrait Gallery (Up to 3 Images)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Active portraits smoothly crossfade on the Home hero and About page.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  Transition (sec):
                </label>
                <input
                  type="number"
                  min={3}
                  max={120}
                  value={form.founder_photo_interval ?? 10}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      founder_photo_interval: Number(e.target.value) || 10,
                    }))
                  }
                  className="w-20 rounded-lg border border-slate-700 bg-[#050b18] px-2.5 py-1.5 text-xs font-mono text-white tabular-nums focus:border-blue-500 focus:outline-none"
                />
                <div className="flex items-center gap-1">
                  {[5, 10, 15].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, founder_photo_interval: sec }))}
                      className={`px-2 py-1 text-xs font-mono rounded-md border transition-colors ${
                        (form.founder_photo_interval ?? 10) === sec
                          ? 'border-blue-500 bg-blue-600/20 text-white'
                          : 'border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {([0, 1, 2] as const).map((slotIdx) => {
                const slotUrl = photoSlots[slotIdx];
                const isUploading = uploadingSlot === slotIdx;
                return (
                  <div
                    key={slotIdx}
                    className="rounded-xl border border-slate-800 bg-[#050b18] p-4 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-200">
                          Portrait {slotIdx + 1} {slotIdx === 0 ? '(Primary)' : '(Optional)'}
                        </span>
                        {slotUrl && slotIdx > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setPhotoSlots((prev) => {
                                const next: [string, string, string] = [...prev] as [
                                  string,
                                  string,
                                  string,
                                ];
                                next[slotIdx] = '';
                                return next;
                              })
                            }
                            aria-label={`Remove portrait ${slotIdx + 1}`}
                            className="text-xs text-slate-400 hover:text-red-400 inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Clear
                          </button>
                        )}
                      </div>

                      <div className="aspect-[3/4] rounded-lg overflow-hidden border border-slate-800 bg-[#091225] flex items-center justify-center">
                        {slotUrl ? (
                          <img
                            src={resolveAssetUrl(slotUrl)}
                            alt={`${form.founder_name} portrait ${slotIdx + 1}`}
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-slate-500 p-4 text-center">
                            <ImageIcon className="w-6 h-6" />
                            <span className="text-xs">No image assigned</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <label className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        {isUploading ? 'Uploading...' : slotUrl ? 'Replace Photo' : 'Upload Photo'}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void handleSlotUpload(slotIdx, file);
                            e.target.value = '';
                          }}
                          className="hidden"
                        />
                      </label>

                      <input
                        type="text"
                        value={slotUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPhotoSlots((prev) => {
                            const next: [string, string, string] = [...prev] as [
                              string,
                              string,
                              string,
                            ];
                            next[slotIdx] = val;
                            return next;
                          });
                          if (slotIdx === 0) {
                            setForm((p) => ({ ...p, founder_photo_url: val }));
                          }
                        }}
                        placeholder="Or paste image URL..."
                        className="w-full rounded-lg border border-slate-800 bg-[#091225] px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                      />

                      {imageAssets.length > 0 && (
                        <select
                          value=""
                          onChange={(e) => {
                            const chosen = e.target.value;
                            if (!chosen) return;
                            setPhotoSlots((prev) => {
                              const next: [string, string, string] = [...prev] as [
                                string,
                                string,
                                string,
                              ];
                              next[slotIdx] = chosen;
                              return next;
                            });
                            if (slotIdx === 0) {
                              setForm((p) => ({ ...p, founder_photo_url: chosen }));
                            }
                          }}
                          className="w-full rounded-lg border border-slate-800 bg-[#091225] px-2.5 py-1.5 text-xs text-slate-300 focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">Choose from Media Library...</option>
                          {imageAssets.map((asset) => (
                            <option key={asset.id} value={asset.url}>
                              {asset.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Founder Profile Details */}
          <div className="pt-5 border-t border-slate-800 space-y-4">
            <h3 className="font-display text-base font-semibold text-white">Founder Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-200">Founder Name</label>
                <input
                  type="text"
                  value={form.founder_name}
                  onChange={(e) => setForm((p) => ({ ...p, founder_name: e.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-200">Founder Title</label>
                <input
                  type="text"
                  value={form.founder_title}
                  onChange={(e) => setForm((p) => ({ ...p, founder_title: e.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-200">
                Founder Introduction
              </label>
              <textarea
                rows={3}
                value={form.founder_intro}
                onChange={(e) => setForm((p) => ({ ...p, founder_intro: e.target.value }))}
                className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-200">Company Vision</label>
                <textarea
                  rows={3}
                  value={form.company_vision}
                  onChange={(e) => setForm((p) => ({ ...p, company_vision: e.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-200">Company Mission</label>
                <textarea
                  rows={3}
                  value={form.company_mission}
                  onChange={(e) => setForm((p) => ({ ...p, company_mission: e.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Current Working Status (About Page) */}
          <div className="pt-5 border-t border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-400" />
                <h3 className="font-display text-base font-semibold text-white">
                  Founder Current Working Status (About Page)
                </h3>
              </div>

              <label className="inline-flex items-center gap-2.5 cursor-pointer text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={workStatus.enabled}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      founder_work_status: { ...workStatus, enabled: e.target.checked },
                    }))
                  }
                  className="w-4 h-4 rounded border-slate-700 bg-[#050b18] text-blue-600 focus:ring-blue-500"
                />
                <span>Display on About Page</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-200">
                  Current Role / Designation
                </label>
                <input
                  type="text"
                  value={workStatus.role}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      founder_work_status: { ...workStatus, role: e.target.value },
                    }))
                  }
                  placeholder="e.g. Founder & Software Developer"
                  className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-200">
                  Organization / Company
                </label>
                <input
                  type="text"
                  value={workStatus.organization}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      founder_work_status: { ...workStatus, organization: e.target.value },
                    }))
                  }
                  placeholder="e.g. RDS TECH FACT"
                  className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-200">
                  Availability / Status Label
                </label>
                <input
                  type="text"
                  value={workStatus.availability}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      founder_work_status: { ...workStatus, availability: e.target.value },
                    }))
                  }
                  placeholder="e.g. Open to Technical Collaborations & Roles"
                  className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-200">
                  Location &amp; Work Mode
                </label>
                <input
                  type="text"
                  value={workStatus.location}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      founder_work_status: { ...workStatus, location: e.target.value },
                    }))
                  }
                  placeholder="e.g. India · Remote / Hybrid"
                  className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-200">
                Current Focus / Work Summary
              </label>
              <textarea
                rows={2}
                value={workStatus.summary}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    founder_work_status: { ...workStatus, summary: e.target.value },
                  }))
                }
                placeholder="Describe current engineering focus, active projects, or work status..."
                className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Resume Attachment (About Page) */}
          <div className="pt-5 border-t border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <div>
                  <h3 className="font-display text-base font-semibold text-white">
                    Founder Resume / CV Attachment (About Page)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Upload a PDF/DOCX resume or paste a public Google Drive / PDF link.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  {uploadingResume ? 'Uploading Resume...' : 'Upload PDF / DOCX'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    disabled={uploadingResume}
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                </label>

                {form.founder_resume_url && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        founder_resume_url: '',
                      }))
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-300 border border-red-500/40 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-200">
                  Resume Document Title
                </label>
                <input
                  type="text"
                  value={form.founder_resume_title || ''}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, founder_resume_title: e.target.value }))
                  }
                  placeholder="e.g. Dhanasekar R – Resume (PDF)"
                  className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-200">
                  Updated Note / Version
                </label>
                <input
                  type="text"
                  value={form.founder_resume_updated_at || ''}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, founder_resume_updated_at: e.target.value }))
                  }
                  placeholder="e.g. Updated Nov 2026"
                  className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label className="block text-sm font-medium text-slate-200">Resume File URL</label>
                {form.founder_resume_url && (
                  <a
                    href={resolveAssetUrl(form.founder_resume_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                  >
                    Open Attachment
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="url"
                value={form.founder_resume_url || ''}
                onChange={(e) => setForm((p) => ({ ...p, founder_resume_url: e.target.value }))}
                placeholder="https://... (uploaded file URL or Google Drive / PDF link)"
                className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Homepage & Founder Settings'}
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-white">Website &amp; SEO Settings</h2>
        <p className="text-sm text-slate-400">
          Manage search metadata, public contact emails, social links, and footer copyright.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#091225] p-5 sm:p-6 space-y-5">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-200">SEO Page Title</label>
          <input
            type="text"
            value={form.seo_title}
            onChange={(e) => setForm((p) => ({ ...p, seo_title: e.target.value }))}
            className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-200">SEO Meta Description</label>
          <textarea
            rows={2}
            value={form.seo_description}
            onChange={(e) => setForm((p) => ({ ...p, seo_description: e.target.value }))}
            className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-200">Contact Email</label>
            <input
              type="email"
              value={form.contact_email}
              onChange={(e) => setForm((p) => ({ ...p, contact_email: e.target.value }))}
              className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-200">Support Email</label>
            <input
              type="email"
              value={form.support_email}
              onChange={(e) => setForm((p) => ({ ...p, support_email: e.target.value }))}
              className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-200">Privacy Email</label>
            <input
              type="email"
              value={form.privacy_email}
              onChange={(e) => setForm((p) => ({ ...p, privacy_email: e.target.value }))}
              className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-200">GitHub URL</label>
            <input
              type="url"
              value={form.social_github || ''}
              onChange={(e) => setForm((p) => ({ ...p, social_github: e.target.value }))}
              placeholder="https://github.com/..."
              className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-200">LinkedIn URL</label>
            <input
              type="url"
              value={form.social_linkedin || ''}
              onChange={(e) => setForm((p) => ({ ...p, social_linkedin: e.target.value }))}
              placeholder="https://linkedin.com/..."
              className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-200">YouTube URL</label>
            <input
              type="url"
              value={form.social_youtube || ''}
              onChange={(e) => setForm((p) => ({ ...p, social_youtube: e.target.value }))}
              placeholder="https://youtube.com/..."
              className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-200">Footer Copyright</label>
          <input
            type="text"
            value={form.footer_copyright}
            onChange={(e) => setForm((p) => ({ ...p, footer_copyright: e.target.value }))}
            className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Website Settings'}
          </button>
        </div>
      </div>
    </form>
  );
};
