import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Code2,
  Cpu,
  ExternalLink,
  Layers,
  Mail,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useCms } from '../context/CmsContext';
import { resolveAssetUrl } from '../lib/defaultData';
import { CinematicHeroBackdrop } from '../components/CinematicHeroBackdrop';
import { BrandLogoMark } from '../components/BrandLogoMark';

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const HomePage: React.FC = () => {
  const { settings, applications } = useCms();
  const publishedApps = applications.filter((a) => a.status === 'published');
  const featuredApp = publishedApps.find((a) => a.is_featured) || publishedApps[0] || null;
  const secondaryApps = publishedApps.filter((a) => a.id !== featuredApp?.id);

  const capabilities = [
    {
      index: '01.',
      category: 'Software Engineering',
      title: 'Purpose-Built Applications',
      description:
        'Focused desktop, web, and mobile software built with clean architecture, predictable performance, and practical everyday utility.',
      topics: ['Python Utilities', 'Web Applications', 'Cross-Platform Tools'],
      icon: Code2,
    },
    {
      index: '02.',
      category: 'Developer & AI Workflows',
      title: 'Practical Digital Solutions',
      description:
        'Developer tools and AI-assisted workflows designed to simplify complex technical tasks without unnecessary bloat.',
      topics: ['Automation', 'Developer Utilities', 'Structured Data'],
      icon: Terminal,
    },
    {
      index: '03.',
      category: 'Technical Education',
      title: 'AI & Technology Learning',
      description:
        'Clear, accessible technical guidance covering artificial intelligence, computing fundamentals, and real-world software tools.',
      topics: ['AI Concepts', 'Coding Practices', 'Tech Tips & Tricks'],
      icon: Cpu,
    },
    {
      index: '04.',
      category: 'User Trust',
      title: 'Privacy by Design',
      description:
        'Every published application includes its own dedicated privacy policy so users understand data handling before installation.',
      topics: ['Transparent Policies', 'Access Control', 'Minimal Data Footprint'],
      icon: ShieldCheck,
    },
  ];

  const hasSocialLinks = Boolean(
    settings.social_youtube || settings.social_github || settings.social_linkedin
  );

  return (
    <div className="bg-[#030303]">
      {/* CINEMATIC HERO SECTION */}
      <section className="relative overflow-hidden border-b border-white/10 -mt-19 pt-24">
        <CinematicHeroBackdrop />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-20 lg:pt-16 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left Column: Brand Identity, Headline, Description, CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: EASE_OUT }}
                className="space-y-1.5"
              >
                <p className="font-mono text-xs sm:text-sm font-medium tracking-wide text-[#FFD700]">
                  AI • TECH • TIPS &amp; TRICKS
                </p>
                <p className="text-xs sm:text-sm text-[#94A3B8]">
                  {settings.brand_name} · Explore AI. Master Technology.
                </p>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.06, ease: EASE_OUT }}
                className="font-display text-3xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-[#F8FAFC] leading-[1.1]"
                style={{ textWrap: 'balance' }}
              >
                {settings.hero_heading}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.12, ease: EASE_OUT }}
                className="text-base sm:text-lg text-[#94A3B8] leading-relaxed max-w-2xl"
              >
                {settings.hero_description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.18, ease: EASE_OUT }}
                className="pt-2 flex flex-wrap items-center gap-3.5"
              >
                <Link
                  to="/applications"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#FF3030] hover:bg-[#FF4D4D] rounded-xl transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D4D]"
                >
                  Explore Applications
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-[#F8FAFC] bg-[#0B1220]/80 border border-white/15 hover:border-white/30 rounded-xl transition-colors whitespace-nowrap shrink-0"
                >
                  About the Founder
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1.5 px-3 py-3 text-sm font-medium text-[#94A3B8] hover:text-white transition-colors whitespace-nowrap shrink-0"
                >
                  Contact
                </Link>
              </motion.div>
            </div>

            {/* Right Column: Founder Portrait */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.14, ease: EASE_OUT }}
              className="lg:col-span-5 flex flex-col items-center lg:items-end"
            >
              <div className="relative w-full max-w-sm">
                <div
                  aria-hidden="true"
                  className="absolute -inset-px rounded-2xl bg-gradient-to-b from-[#FF3030]/40 via-white/10 to-[#22D3EE]/25"
                />
                <div className="relative rounded-2xl overflow-hidden bg-[#050505]">
                  <img
                    src={resolveAssetUrl(settings.founder_photo_url)}
                    alt={`${settings.founder_name}, ${settings.founder_title}`}
                    referrerPolicy="no-referrer"
                    className="w-full aspect-[3/4] object-cover object-top"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#030303] via-[#030303]/85 to-transparent pt-16 pb-5 px-5">
                    <p className="font-display text-lg font-semibold text-[#F8FAFC]">
                      {settings.founder_name}
                    </p>
                    <p className="text-sm text-[#94A3B8]">{settings.founder_title}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* APPLICATION SHOWCASE */}
      <section className="border-b border-white/10 bg-[#050816]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-22">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="font-mono text-xs text-[#FF4D4D] tracking-wide mb-2">
                Software &amp; Utilities
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F8FAFC] tracking-tight">
                Featured Application Showcase
              </h2>
            </div>
            <Link
              to="/applications"
              className="text-sm font-medium text-[#F8FAFC] hover:text-[#FF4D4D] inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              All applications
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {featuredApp ? (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, ease: EASE_OUT }}
                className="rounded-2xl border border-white/10 bg-[#0B1220] p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-8 space-y-5">
                  <div className="flex items-start gap-5">
                    {featuredApp.logo_url ? (
                      <img
                        src={featuredApp.logo_url}
                        alt={`${featuredApp.name} logo`}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-[#FF3030]/15 border border-[#FF3030]/35 flex items-center justify-center font-display text-xl font-bold text-[#FF4D4D] shrink-0">
                        {featuredApp.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#94A3B8]">
                        {featuredApp.category && <span>{featuredApp.category}</span>}
                        {featuredApp.category && featuredApp.platform && (
                          <span aria-hidden="true">·</span>
                        )}
                        {featuredApp.platform && <span>{featuredApp.platform}</span>}
                        {(featuredApp.platform || featuredApp.category) && featuredApp.version && (
                          <span aria-hidden="true">·</span>
                        )}
                        {featuredApp.version && (
                          <span className="font-mono tabular-nums">v{featuredApp.version}</span>
                        )}
                      </div>
                      <h3 className="font-display text-2xl font-bold text-[#F8FAFC]">
                        {featuredApp.name}
                      </h3>
                      <p className="text-[#94A3B8] leading-relaxed">
                        {featuredApp.short_description}
                      </p>
                    </div>
                  </div>

                  {featuredApp.features && featuredApp.features.length > 0 && (
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#94A3B8] pt-1">
                      {featuredApp.features.slice(0, 4).map((feat, i) => (
                        <span key={i} className="inline-flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-[#FF3030]" aria-hidden="true" />
                          {feat}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <Link
                      to={`/applications/${featuredApp.slug}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#FF3030] hover:bg-[#FF4D4D] rounded-lg transition-colors whitespace-nowrap"
                    >
                      View Application
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    {featuredApp.website_url && (
                      <a
                        href={featuredApp.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-[#F8FAFC] border border-white/15 hover:border-white/30 rounded-lg transition-colors"
                      >
                        Visit Website
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {featuredApp.screenshots && featuredApp.screenshots.length > 0 && (
                  <div className="lg:col-span-4">
                    <div className="rounded-xl overflow-hidden border border-white/10 bg-[#050505]">
                      <img
                        src={featuredApp.screenshots[0].image_url}
                        alt={
                          featuredApp.screenshots[0].caption ||
                          `${featuredApp.name} preview`
                        }
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  </div>
                )}
              </motion.div>

              {secondaryApps.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {secondaryApps.map((app) => (
                    <Link
                      key={app.id}
                      to={`/applications/${app.slug}`}
                      className="group rounded-xl border border-white/10 bg-[#0B1220] hover:border-[#FF3030]/45 p-6 flex flex-col justify-between gap-5 transition-colors"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-3.5">
                          {app.logo_url ? (
                            <img
                              src={app.logo_url}
                              alt={`${app.name} logo`}
                              referrerPolicy="no-referrer"
                              className="w-11 h-11 rounded-xl object-cover border border-white/10 shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-[#FF3030]/15 border border-[#FF3030]/35 flex items-center justify-center font-display text-sm font-bold text-[#FF4D4D] shrink-0">
                              {app.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h3 className="font-display text-base font-semibold text-white group-hover:text-[#FF4D4D] transition-colors truncate">
                              {app.name}
                            </h3>
                            <p className="text-xs text-[#94A3B8] truncate">
                              {[app.category, app.platform, app.version ? `v${app.version}` : '']
                                .filter(Boolean)
                                .join(' · ')}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-[#94A3B8] leading-relaxed">
                          {app.short_description}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#F8FAFC] group-hover:text-[#FF4D4D]">
                        View details
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-[#0B1220] p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-mono text-[#22D3EE]">
                  <Layers className="w-4 h-4" />
                  Release Pipeline
                </div>
                <h3 className="font-display text-xl font-semibold text-[#F8FAFC]">
                  Applications In Preparation
                </h3>
                <p className="text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
                  Software applications from {settings.brand_name} are published directly through the
                  content system once reviewed and approved.
                </p>
              </div>
              <Link
                to="/applications"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#F8FAFC] border border-white/15 hover:border-white/30 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Applications Directory
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CORE CAPABILITIES & TECHNICAL FOCUS (NO FAKE RATINGS) */}
      <section className="border-b border-white/10 bg-[#030303]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-22">
          <div className="max-w-2xl mb-12 space-y-2">
            <p className="font-mono text-xs text-[#22D3EE] tracking-wide">
              Capabilities &amp; Discipline
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F8FAFC] tracking-tight">
              {settings.why_choose_heading}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capabilities.map((item, idx) => (
              <motion.div
                key={item.index}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.3, delay: idx * 0.05, ease: EASE_OUT }}
                className="rounded-xl border border-white/10 bg-[#0B1220]/70 hover:border-white/20 p-6 sm:p-7 space-y-4 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-[#FF4D4D] tabular-nums">{item.index}</span>
                    <span className="text-[#94A3B8]">{item.category}</span>
                  </div>
                  <item.icon className="w-5 h-5 text-[#94A3B8]" />
                </div>
                <h3 className="font-display text-lg font-semibold text-[#F8FAFC]">{item.title}</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">{item.description}</p>
                <div className="pt-2 border-t border-white/8 flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-slate-400">
                  {item.topics.map((t, i) => (
                    <span key={t}>
                      {i > 0 && <span className="mr-4 text-slate-600">/</span>}
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH CONTENT & EDUCATION */}
      <section className="border-b border-white/10 bg-[#050816]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-22">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0B1220] via-[#050816] to-[#0B1220] p-7 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <p className="font-mono text-xs text-[#FFD700] tracking-wide">
                AI • TECH • TIPS &amp; TRICKS
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F8FAFC] tracking-tight">
                Explore AI. Master Technology.
              </h2>
              <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed max-w-2xl">
                {settings.brand_name} shares technical education, software tips, and practical AI
                explorations alongside the tools we build. Connect across official channels for
                updates and releases.
              </p>
            </div>

            <div className="lg:col-span-5 flex flex-wrap lg:justify-end gap-3">
              {settings.social_youtube && (
                <a
                  href={settings.social_youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#FF3030] hover:bg-[#FF4D4D] rounded-lg transition-colors"
                >
                  YouTube Channel
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {settings.social_github && (
                <a
                  href={settings.social_github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#F8FAFC] border border-white/15 hover:border-white/30 rounded-lg transition-colors"
                >
                  GitHub
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {settings.social_linkedin && (
                <a
                  href={settings.social_linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#F8FAFC] border border-white/15 hover:border-white/30 rounded-lg transition-colors"
                >
                  LinkedIn
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {!hasSocialLinks && (
                <Link
                  to="/applications"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#FF3030] hover:bg-[#FF4D4D] rounded-lg transition-colors"
                >
                  Browse Software
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER INTRODUCTION + VISION & MISSION */}
      <section className="border-b border-white/10 bg-[#030303]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-22">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-3.5">
                <BrandLogoMark size="lg" />
                <div>
                  <p className="font-mono text-xs text-[#FF4D4D]">About the Founder</p>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F8FAFC] tracking-tight">
                    {settings.founder_name}
                  </h2>
                  <p className="text-sm text-[#94A3B8]">{settings.founder_title}</p>
                </div>
              </div>
              <Link
                to="/about"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#F8FAFC] hover:text-[#FF4D4D] transition-colors pt-1"
              >
                Read full profile
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <p className="text-[#CBD5E1] leading-relaxed">{settings.founder_intro}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-white/10">
                <div className="space-y-1.5">
                  <h3 className="font-display text-sm font-semibold text-[#F8FAFC]">Vision</h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    {settings.company_vision}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-display text-sm font-semibold text-[#F8FAFC]">Mission</h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    {settings.company_mission}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING CONTACT CTA */}
      <section className="relative overflow-hidden bg-[#050816]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(50% 70% at 50% 100%, rgba(255, 48, 48, 0.12), transparent 70%)',
          }}
        />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <p className="font-mono text-xs text-[#22D3EE]">Direct Contact</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F8FAFC] tracking-tight">
              Questions, Support, or Privacy Enquiries
            </h2>
            <p className="text-sm sm:text-base text-[#94A3B8]">
              Reach out directly via the contact form or write to{' '}
              <a
                href={`mailto:${settings.contact_email}`}
                className="text-[#F8FAFC] underline decoration-white/30 hover:decoration-[#FF3030]"
              >
                {settings.contact_email}
              </a>
              .
            </p>
          </div>

          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#FF3030] hover:bg-[#FF4D4D] rounded-xl transition-colors whitespace-nowrap shrink-0"
          >
            <Mail className="w-4 h-4" />
            Contact {settings.brand_name}
          </Link>
        </div>
      </section>
    </div>
  );
};
