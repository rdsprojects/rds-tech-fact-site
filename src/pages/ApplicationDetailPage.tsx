import React, { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Download, ExternalLink, Mail, Shield } from 'lucide-react';
import { useCms } from '../context/CmsContext';

export const ApplicationDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === '1';
  const { applications, policies, isAdminAuthenticated, settings } = useCms();

  const app = applications.find(
    (item) =>
      item.slug === slug &&
      (item.status === 'published' || (isPreview && isAdminAuthenticated))
  );

  const linkedPolicy = policies.find(
    (p) =>
      (p.application_id === app?.id || p.slug === app?.slug) &&
      (p.status === 'published' || (isPreview && isAdminAuthenticated))
  );

  useEffect(() => {
    if (app) {
      document.title = `${app.name} – ${settings.brand_name}`;
    }
  }, [app, settings.brand_name]);

  if (!app) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-[#F8FAFC]">Application Not Found</h1>
        <p className="text-[#94A3B8] text-sm">
          This application is either unavailable or has not been published yet.
        </p>
        <Link
          to="/applications"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#FF4D4D] hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Applications
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 lg:py-16 space-y-12">
      {isPreview && isAdminAuthenticated && app.status !== 'published' && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 flex items-center justify-between gap-4">
          <span>Admin Preview Mode — This application is currently in "{app.status}" status.</span>
          <Link to="/admin/dashboard" className="underline font-medium whitespace-nowrap">
            Return to Dashboard
          </Link>
        </div>
      )}

      <Link
        to="/applications"
        className="inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All Applications
      </Link>

      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-start justify-between gap-8 border-b border-white/10 pb-10">
        <div className="flex items-start gap-5">
          {app.logo_url ? (
            <img
              src={app.logo_url}
              alt={`${app.name} logo`}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-2xl object-cover border border-white/10 shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-[#FF3030]/15 border border-[#FF3030]/35 flex items-center justify-center font-display text-2xl font-bold text-[#FF4D4D] shrink-0">
              {app.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="space-y-2">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F8FAFC] tracking-tight">
              {app.name}
            </h1>
            <p className="text-base text-[#CBD5E1] max-w-xl">{app.short_description}</p>
            {(app.category || app.platform || app.version) && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#94A3B8] pt-1">
                {app.category && <span>{app.category}</span>}
                {app.category && (app.platform || app.version) && <span aria-hidden="true">·</span>}
                {app.platform && <span>Platform: {app.platform}</span>}
                {app.platform && app.version && <span aria-hidden="true">·</span>}
                {app.version && (
                  <span className="font-mono tabular-nums">Version {app.version}</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {app.download_url && (
            <a
              href={app.download_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#FF3030] hover:bg-[#FF4D4D] rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          )}
          {app.google_play_url && (
            <a
              href={app.google_play_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#F8FAFC] border border-white/15 hover:border-white/30 rounded-lg transition-colors whitespace-nowrap"
            >
              Google Play
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {app.website_url && (
            <a
              href={app.website_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#CBD5E1] hover:text-white border border-white/10 rounded-lg transition-colors whitespace-nowrap"
            >
              Website
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </section>

      {/* Overview & Features */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          {app.full_description && (
            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-[#F8FAFC]">Overview</h2>
              <p className="text-[#CBD5E1] leading-relaxed whitespace-pre-line">
                {app.full_description}
              </p>
            </section>
          )}

          {app.features && app.features.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-display text-xl font-semibold text-[#F8FAFC]">Key Features</h2>
              <ul className="space-y-3">
                {app.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-[#CBD5E1] text-sm">
                    <Check className="w-4 h-4 text-[#FF4D4D] mt-0.5 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {app.screenshots && app.screenshots.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-display text-xl font-semibold text-[#F8FAFC]">Screenshots</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {app.screenshots.map((shot) => (
                  <figure
                    key={shot.id}
                    className="rounded-xl overflow-hidden border border-white/10 bg-[#0B1220]"
                  >
                    <img
                      src={shot.image_url}
                      alt={shot.caption || `${app.name} screenshot`}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-56 object-cover"
                    />
                    {shot.caption && (
                      <figcaption className="px-4 py-2.5 text-xs text-[#94A3B8] border-t border-white/10">
                        {shot.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Info */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-white/10 bg-[#0B1220] p-6 space-y-4">
            <h2 className="font-display text-base font-semibold text-[#F8FAFC]">
              Support &amp; Privacy
            </h2>

            {linkedPolicy && (
              <Link
                to={`/privacy/${linkedPolicy.slug}${isPreview ? '?preview=1' : ''}`}
                className="flex items-center gap-2.5 text-sm text-[#22D3EE] hover:text-white transition-colors"
              >
                <Shield className="w-4 h-4 shrink-0" />
                <span>Privacy Policy for {app.name}</span>
              </Link>
            )}

            {app.support_email && (
              <a
                href={`mailto:${app.support_email}`}
                className="flex items-center gap-2.5 text-sm text-[#CBD5E1] hover:text-white transition-colors break-all"
              >
                <Mail className="w-4 h-4 shrink-0 text-[#94A3B8]" />
                <span>{app.support_email}</span>
              </a>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
