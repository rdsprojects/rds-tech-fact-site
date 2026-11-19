import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { useCms } from '../../context/CmsContext';
import { resolveAssetUrl } from '../../lib/defaultData';

interface Props {
  mode: 'homepage' | 'settings';
  onNotify: (ok: boolean, message: string) => void;
}

export const AdminContentSettingsTab: React.FC<Props> = ({ mode, onNotify }) => {
  const { settings, updateSettings, uploadMediaFile } = useCms();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateSettings(form);
    setSaving(false);
    onNotify(res.ok, res.message);
  };

  const handleFounderPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await uploadMediaFile(file);
    onNotify(res.ok, res.message);
    if (res.ok && res.url) {
      setForm((prev) => ({ ...prev, founder_photo_url: res.url! }));
    }
  };

  if (mode === 'homepage') {
    return (
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <h2 className="font-display text-xl font-bold text-white">Homepage & Founder Content</h2>
          <p className="text-sm text-slate-400">
            Changes saved here update the public homepage and About page automatically.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#091225] p-5 sm:p-6 space-y-5">
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

          <div className="pt-4 border-t border-slate-800 space-y-4">
            <h3 className="font-display text-base font-semibold text-white">Founder Profile</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <img
                src={resolveAssetUrl(form.founder_photo_url)}
                alt={form.founder_name}
                className="w-20 h-24 rounded-xl object-cover object-top border border-slate-700"
              />
              <label className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer">
                <Upload className="w-4 h-4" />
                Replace Founder Photograph
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFounderPhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

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

          <div className="pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
            >
              {saving ? 'Saving...' : 'Save Homepage Changes'}
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-white">Website & SEO Settings</h2>
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
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            {saving ? 'Saving...' : 'Save Website Settings'}
          </button>
        </div>
      </div>
    </form>
  );
};
