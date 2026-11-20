import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  Building2,
  Download,
  ExternalLink,
  Eye,
  FileText,
  MapPin,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useCms } from '../context/CmsContext';
import {
  DEFAULT_FOUNDER_WORK_STATUS,
  getFounderPhotoList,
  resolveAssetUrl,
} from '../lib/defaultData';
import { BrandLogoMark } from '../components/BrandLogoMark';
import { FounderPhotoShowcase } from '../components/FounderPhotoShowcase';

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

function isImageUrl(url: string): boolean {
  return /\.(png|jpe?g|webp|gif)(\?|#|$)/i.test(url);
}

export const AboutPage: React.FC = () => {
  const { settings } = useCms();
  const [resumePreviewOpen, setResumePreviewOpen] = useState(false);

  const workStatus = {
    ...DEFAULT_FOUNDER_WORK_STATUS,
    ...(settings.founder_work_status || {}),
  };

  const resumeUrl = resolveAssetUrl(settings.founder_resume_url);
  const resumeTitle = settings.founder_resume_title?.trim() || `${settings.founder_name} – Resume`;

  useEffect(() => {
    if (!resumePreviewOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setResumePreviewOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [resumePreviewOpen]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 lg:py-20 space-y-16">
      {/* Intro */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
        className="space-y-4 border-b border-white/10 pb-12"
      >
        <div className="flex items-center gap-3">
          <BrandLogoMark size="sm" />
          <p className="font-mono text-xs text-[#FF4D4D] tracking-wide">
            About {settings.brand_name}
          </p>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F8FAFC] tracking-tight max-w-3xl">
          {settings.tagline}
        </h1>
        <p className="font-mono text-xs sm:text-sm text-[#FFD700]">
          AI • TECH • TIPS &amp; TRICKS · Explore AI. Master Technology.
        </p>
        <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed max-w-3xl">
          {settings.hero_description}
        </p>
      </motion.section>

      {/* Founder Profile + Rotating Portrait + Working Status + Resume */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
        className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start border-b border-white/10 pb-12"
      >
        <div className="md:col-span-4 space-y-4">
          <div className="relative rounded-2xl border border-white/15 bg-[#050505] overflow-hidden">
            <FounderPhotoShowcase
              photos={getFounderPhotoList(settings)}
              intervalSeconds={settings.founder_photo_interval}
              founderName={settings.founder_name}
              founderTitle={settings.founder_title}
            />
          </div>
        </div>

        <div className="md:col-span-8 space-y-6">
          <div>
            <p className="font-mono text-xs text-[#22D3EE]">Founder Profile</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F8FAFC] mt-1">
              {settings.founder_name}
            </h2>
            <p className="text-sm text-[#94A3B8] mt-1">{settings.founder_title}</p>
          </div>

          <p className="text-[#CBD5E1] leading-relaxed">{settings.founder_intro}</p>
          <p className="text-[#94A3B8] leading-relaxed">
            Through {settings.brand_name}, {settings.founder_name} focuses on software applications,
            digital utilities, and technical education built around practical utility and clear
            documentation.
          </p>

          {/* Current Working Status */}
          {workStatus.enabled && (
            <div className="rounded-xl border border-white/10 bg-[#0B1220] p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/10 pb-3">
                <h3 className="font-display text-base font-semibold text-[#F8FAFC]">
                  Current Working Status
                </h3>
                {workStatus.availability && (
                  <span className="text-xs font-mono text-[#22D3EE]">
                    {workStatus.availability}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                {workStatus.role && (
                  <div className="space-y-1">
                    <p className="text-xs text-[#64748B] flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#94A3B8]" />
                      Current Role
                    </p>
                    <p className="text-[#F8FAFC] font-medium">{workStatus.role}</p>
                  </div>
                )}

                {workStatus.organization && (
                  <div className="space-y-1">
                    <p className="text-xs text-[#64748B] flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                      Organization
                    </p>
                    <p className="text-[#F8FAFC] font-medium">{workStatus.organization}</p>
                  </div>
                )}

                {workStatus.location && (
                  <div className="space-y-1">
                    <p className="text-xs text-[#64748B] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
                      Location &amp; Mode
                    </p>
                    <p className="text-[#F8FAFC] font-medium">{workStatus.location}</p>
                  </div>
                )}
              </div>

              {workStatus.summary && (
                <p className="text-sm text-[#94A3B8] leading-relaxed pt-1 border-t border-white/8">
                  {workStatus.summary}
                </p>
              )}
            </div>
          )}

          {/* Resume / CV Attachment */}
          {resumeUrl ? (
            <div className="rounded-xl border border-white/10 bg-[#050816] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-[#FF3030]/15 border border-[#FF3030]/35 flex items-center justify-center text-[#FF4D4D] shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-xs font-mono text-[#94A3B8]">Resume Attachment</p>
                  <h3 className="font-display text-base font-semibold text-[#F8FAFC] truncate">
                    {resumeTitle}
                  </h3>
                  {settings.founder_resume_updated_at && (
                    <p className="text-xs text-[#64748B] font-mono tabular-nums">
                      {settings.founder_resume_updated_at}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setResumePreviewOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-[#F8FAFC] border border-white/15 hover:border-white/35 bg-[#0B1220] rounded-lg transition-colors whitespace-nowrap"
                >
                  <Eye className="w-4 h-4 text-[#22D3EE]" />
                  Preview Resume
                </button>
                <a
                  href={resumeUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#FF3030] hover:bg-[#FF4D4D] rounded-lg transition-colors whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-[#050816] px-5 py-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-3 text-[#94A3B8]">
                <FileText className="w-4 h-4 text-[#64748B] shrink-0" />
                <span>Resume &amp; professional profile available upon direct enquiry.</span>
              </div>
              <Link
                to="/contact"
                className="text-xs font-medium text-[#22D3EE] hover:text-white transition-colors whitespace-nowrap"
              >
                Request Resume →
              </Link>
            </div>
          )}
        </div>
      </motion.section>

      {/* Vision & Mission */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-white/10 pb-12">
        <div className="rounded-xl border border-white/10 bg-[#0B1220] p-7 space-y-3">
          <h2 className="font-display text-xl font-semibold text-[#F8FAFC]">Company Vision</h2>
          <p className="text-[#94A3B8] leading-relaxed">{settings.company_vision}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#0B1220] p-7 space-y-3">
          <h2 className="font-display text-xl font-semibold text-[#F8FAFC]">Company Mission</h2>
          <p className="text-[#94A3B8] leading-relaxed">{settings.company_mission}</p>
        </div>
      </section>

      {/* Technology & Innovation Focus */}
      <section className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-[#F8FAFC]">
          Technology &amp; Innovation Focus
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-xl border border-white/10 bg-[#050816] p-6 space-y-2">
            <h3 className="font-display text-base font-semibold text-[#F8FAFC]">
              Software Applications
            </h3>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Focused, maintainable applications designed for reliability and everyday utility.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#050816] p-6 space-y-2">
            <h3 className="font-display text-base font-semibold text-[#F8FAFC]">
              Digital Solutions
            </h3>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Streamlined workflows and practical tools that reduce friction for technical users.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#050816] p-6 space-y-2">
            <h3 className="font-display text-base font-semibold text-[#F8FAFC]">
              Technical Education
            </h3>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Clear, accessible resources that support continuous learning in modern computing.
            </p>
          </div>
        </div>

        <div className="pt-4">
          <Link
            to="/applications"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#FF3030] hover:bg-[#FF4D4D] rounded-lg transition-colors"
          >
            Explore Applications
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Resume Preview Modal */}
      {resumePreviewOpen && resumeUrl && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={resumeTitle}
        >
          <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3.5 border-b border-white/10 bg-[#050816] shrink-0">
            <div className="min-w-0">
              <p className="font-display text-sm sm:text-base font-semibold text-white truncate">
                {resumeTitle}
              </p>
              {settings.founder_resume_updated_at && (
                <p className="text-xs text-[#94A3B8] font-mono tabular-nums">
                  {settings.founder_resume_updated_at}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#CBD5E1] hover:text-white border border-white/15 rounded-lg transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Tab
              </a>
              <a
                href={resumeUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#FF3030] hover:bg-[#FF4D4D] rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </a>
              <button
                type="button"
                onClick={() => setResumePreviewOpen(false)}
                aria-label="Close resume preview"
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/15 bg-[#0B1220] text-[#F8FAFC] hover:border-white/35"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 sm:p-6 flex items-center justify-center overflow-auto">
            {isImageUrl(resumeUrl) ? (
              <img
                src={resumeUrl}
                alt={resumeTitle}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-full w-auto h-auto object-contain rounded-xl border border-white/10"
              />
            ) : (
              <iframe
                src={resumeUrl}
                title={resumeTitle}
                className="w-full max-w-5xl h-full min-h-[75vh] rounded-xl border border-white/10 bg-white"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
