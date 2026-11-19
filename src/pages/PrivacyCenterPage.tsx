import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useCms } from '../context/CmsContext';

export const PrivacyCenterPage: React.FC = () => {
  const { policies, settings } = useCms();
  const publishedPolicies = policies.filter((p) => p.status === 'published');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 lg:py-20 space-y-12">
      <div className="max-w-2xl space-y-3">
        <p className="font-mono text-xs text-[#22D3EE] tracking-wide">
          Privacy &amp; Transparency
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F8FAFC] tracking-tight">
          Privacy Center
        </h1>
        <p className="text-[#94A3B8] leading-relaxed">
          Each software application published by {settings.brand_name} maintains its own dedicated
          privacy policy. Select an application below to review its policy.
        </p>
      </div>

      {publishedPolicies.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0B1220] p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#FF3030]/15 border border-[#FF3030]/30 flex items-center justify-center mx-auto text-[#FF4D4D]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="font-display text-lg font-semibold text-[#F8FAFC]">
            No Published Privacy Policies Yet
          </h2>
          <p className="text-sm text-[#94A3B8] max-w-md mx-auto leading-relaxed">
            Application privacy policies are reviewed and approved by the administrator prior to
            publication.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-white/10 border-y border-white/10">
          {publishedPolicies.map((policy) => (
            <Link
              key={policy.id}
              to={`/privacy/${policy.slug}`}
              className="group py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#0B1220]/70 px-4 -mx-4 rounded-lg transition-colors"
            >
              <div className="space-y-1">
                <h2 className="font-display text-lg font-semibold text-[#F8FAFC] group-hover:text-[#FF4D4D] transition-colors">
                  {policy.application_name} — Privacy Policy
                </h2>
                <p className="text-xs text-[#94A3B8] font-mono tabular-nums">
                  /privacy/{policy.slug} · Effective {policy.effective_date}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#22D3EE] group-hover:text-white whitespace-nowrap shrink-0 transition-colors">
                Read Policy
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-[#0B1220] p-6 space-y-2">
        <h2 className="font-display text-base font-semibold text-[#F8FAFC]">Privacy Enquiries</h2>
        <p className="text-sm text-[#94A3B8]">
          For general privacy questions regarding {settings.brand_name}, contact{' '}
          <a
            href={`mailto:${settings.privacy_email}`}
            className="text-[#F8FAFC] underline decoration-white/30 hover:decoration-[#FF3030]"
          >
            {settings.privacy_email}
          </a>
          .
        </p>
      </div>
    </div>
  );
};
