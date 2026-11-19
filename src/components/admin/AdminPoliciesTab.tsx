import React, { useState } from 'react';
import { Edit3, Eye, Plus, Trash2, CheckCircle } from 'lucide-react';
import { slugify, useCms } from '../../context/CmsContext';
import { PolicyStatus, PrivacyPolicy } from '../../types/cms';

interface Props {
  onNotify: (ok: boolean, message: string) => void;
}

const emptyPolicy = {
  id: undefined as string | undefined,
  application_id: '' as string,
  application_name: '',
  slug: '',
  effective_date: new Date().toISOString().split('T')[0],
  information_collected: '',
  information_usage: '',
  data_storage: '',
  data_sharing: '',
  data_security: '',
  user_rights: '',
  childrens_privacy: '',
  policy_changes:
    'We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date.',
  contact_information: 'For privacy enquiries, please contact rdsprojectsmyself@gmail.com.',
  status: 'draft' as PolicyStatus,
};

export const AdminPoliciesTab: React.FC<Props> = ({ onNotify }) => {
  const { policies, applications, savePolicy, deletePolicy } = useCms();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyPolicy);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setForm(emptyPolicy);
    setEditing(true);
  };

  const openEdit = (policy: PrivacyPolicy) => {
    setForm({
      id: policy.id,
      application_id: policy.application_id || '',
      application_name: policy.application_name,
      slug: policy.slug,
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
    });
    setEditing(true);
  };

  const handleSelectApp = (appId: string) => {
    const matched = applications.find((a) => a.id === appId);
    setForm((prev) => ({
      ...prev,
      application_id: appId,
      application_name: matched ? matched.name : prev.application_name,
      slug: matched ? matched.slug : prev.slug,
    }));
  };

  const handleSave = async (targetStatus: PolicyStatus) => {
    setSaving(true);
    const res = await savePolicy({
      ...form,
      application_id: form.application_id || null,
      slug: form.slug || slugify(form.application_name),
      status: targetStatus,
    });
    setSaving(false);
    onNotify(res.ok, res.message);
    if (res.ok) setEditing(false);
  };

  if (editing) {
    const fields: Array<{ key: keyof typeof form; label: string }> = [
      { key: 'information_collected', label: 'Information Collected' },
      { key: 'information_usage', label: 'Information Usage' },
      { key: 'data_storage', label: 'Data Storage' },
      { key: 'data_sharing', label: 'Data Sharing' },
      { key: 'data_security', label: 'Data Security' },
      { key: 'user_rights', label: 'User Rights' },
      { key: 'childrens_privacy', label: 'Children’s Privacy (where applicable)' },
      { key: 'policy_changes', label: 'Policy Changes' },
      { key: 'contact_information', label: 'Contact Information' },
    ];

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-xl font-bold text-white">
            {form.id ? `Edit Policy: ${form.application_name}` : 'Create Privacy Policy'}
          </h2>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="px-4 py-2 text-sm text-slate-300 border border-slate-700 hover:border-slate-500 rounded-lg"
          >
            Cancel
          </button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#091225] p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-200">
                Associate with Application
              </label>
              <select
                value={form.application_id}
                onChange={(e) => handleSelectApp(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">Standalone / Custom</option>
                {applications.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-200">Effective Date *</label>
              <input
                type="date"
                value={form.effective_date}
                onChange={(e) => setForm((prev) => ({ ...prev, effective_date: e.target.value }))}
                className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-200">Application Name *</label>
              <input
                type="text"
                value={form.application_name}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    application_name: e.target.value,
                    slug: prev.id ? prev.slug : slugify(e.target.value),
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-200">Policy URL Slug *</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {fields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-200">{field.label}</label>
              <textarea
                rows={3}
                value={String(form[field.key] || '')}
                onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                className="w-full rounded-lg border border-slate-700 bg-[#050b18] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          ))}

          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('draft')}
              className="px-5 py-2.5 text-sm font-medium text-slate-200 border border-slate-700 hover:border-slate-500 rounded-lg"
            >
              Save Draft
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('published')}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg"
            >
              Publish Policy
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-white">Privacy Policies</h2>
          <p className="text-sm text-slate-400">
            Review and approve each application’s privacy policy before publishing.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          New Privacy Policy
        </button>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#091225] divide-y divide-slate-800">
        {policies.map((policy) => (
          <div
            key={policy.id}
            className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-semibold text-white">
                  {policy.application_name}
                </h3>
                <span className="text-xs text-slate-500">·</span>
                <span
                  className={`text-xs font-medium ${
                    policy.status === 'published' ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {policy.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono tabular-nums">
                /privacy/{policy.slug} · Effective {policy.effective_date}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`${import.meta.env.BASE_URL}privacy/${policy.slug}?preview=1`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 border border-slate-700 hover:border-slate-500 rounded-lg"
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </a>
              <button
                type="button"
                onClick={() => openEdit(policy)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
              {policy.status !== 'published' ? (
                <button
                  type="button"
                  onClick={async () => {
                    const res = await savePolicy({ ...policy, status: 'published' });
                    onNotify(res.ok, res.message);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Publish
                </button>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    const res = await savePolicy({ ...policy, status: 'unpublished' });
                    onNotify(res.ok, res.message);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-300 border border-amber-500/40 hover:bg-amber-500/10 rounded-lg"
                >
                  Unpublish
                </button>
              )}
              {confirmDeleteId === policy.id ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await deletePolicy(policy.id);
                      setConfirmDeleteId(null);
                      onNotify(res.ok, res.message);
                    }}
                    className="px-3 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(null)}
                    className="px-2 py-2 text-xs text-slate-400"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(policy.id)}
                  aria-label={`Delete ${policy.application_name} policy`}
                  className="inline-flex items-center justify-center w-9 h-9 text-slate-400 hover:text-red-400 border border-slate-800 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
