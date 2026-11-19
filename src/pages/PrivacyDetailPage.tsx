import React, { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCms } from '../context/CmsContext';

export const PrivacyDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === '1';
  const { policies, isAdminAuthenticated, settings } = useCms();

  const policy = policies.find(
    (p) =>
      p.slug === slug && (p.status === 'published' || (isPreview && isAdminAuthenticated))
  );

  useEffect(() => {
    if (policy) {
      document.title = `${policy.application_name} Privacy Policy – ${settings.brand_name}`;
    }
  }, [policy, settings.brand_name]);

  if (!policy) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-[#F8FAFC]">
          Privacy Policy Not Found
        </h1>
        <p className="text-sm text-[#94A3B8]">
          The requested privacy policy has not been published yet.
        </p>
        <Link
          to="/privacy"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#FF4D4D] hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Privacy Center
        </Link>
      </div>
    );
  }

  const sections = [
    { title: '1. Information Collected', body: policy.information_collected },
    { title: '2. Information Usage', body: policy.information_usage },
    { title: '3. Data Storage', body: policy.data_storage },
    { title: '4. Data Sharing', body: policy.data_sharing },
    { title: '5. Data Security', body: policy.data_security },
    { title: '6. User Rights', body: policy.user_rights },
    { title: '7. Children’s Privacy', body: policy.childrens_privacy },
    { title: '8. Policy Changes', body: policy.policy_changes },
    { title: '9. Contact Information', body: policy.contact_information },
  ].filter((s) => s.body && s.body.trim().length > 0);

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-16 space-y-10">
      {isPreview && isAdminAuthenticated && policy.status !== 'published' && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 flex items-center justify-between gap-4">
          <span>Admin Preview Mode — This privacy policy is currently a draft.</span>
          <Link to="/admin/dashboard" className="underline font-medium whitespace-nowrap">
            Return to Dashboard
          </Link>
        </div>
      )}

      <Link
        to="/privacy"
        className="inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Privacy Center
      </Link>

      <header className="space-y-3 border-b border-white/10 pb-8">
        <p className="font-mono text-xs text-[#FF4D4D]">{settings.brand_name}</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F8FAFC] tracking-tight">
          {policy.application_name} — Privacy Policy
        </h1>
        <p className="text-sm text-[#94A3B8] font-mono tabular-nums">
          Effective Date: {policy.effective_date}
        </p>
      </header>

      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.title} className="space-y-2.5">
            <h2 className="font-display text-lg font-semibold text-[#F8FAFC]">{section.title}</h2>
            <p className="text-[#CBD5E1] leading-relaxed whitespace-pre-line">{section.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
};
