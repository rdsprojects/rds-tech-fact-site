import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Download, ExternalLink, Maximize2 } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { ApplicationItem } from '../types/cms';
import { resolveAssetUrl } from '../lib/defaultData';
import { CoverFlowCarousel } from './CoverFlowCarousel';
import { ScreenshotLightboxModal } from './ApplicationScreenshotsGallery';

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface FeaturedAppShowcaseProps {
  featuredApp: ApplicationItem;
}

export const FeaturedAppShowcase: React.FC<FeaturedAppShowcaseProps> = ({ featuredApp }) => {
  const screenshots = featuredApp.screenshots || [];
  const total = screenshots.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setActiveIndex(0);
    setDirection(1);
  }, [featuredApp.id]);

  useEffect(() => {
    if (total <= 1 || paused || lightboxOpen || prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % total);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [total, paused, lightboxOpen, prefersReducedMotion]);

  const safeIndex = total > 0 ? activeIndex % total : 0;
  const activeShot = screenshots[safeIndex];
  const hasScreenshots = total > 0;

  const handleNavigate = useCallback(
    (nextIndex: number, nextDirection?: number) => {
      if (total <= 1) return;
      const bounded = ((nextIndex % total) + total) % total;
      const computedDir =
        nextDirection !== undefined ? nextDirection : bounded >= safeIndex ? 1 : -1;
      setDirection(computedDir);
      setActiveIndex(bounded);
    },
    [safeIndex, total]
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
        className="rounded-2xl border border-white/10 bg-[#0b101b] p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center"
      >
        {/* Left Column: Application Identity, Value Prop, Features, Actions */}
        <div className={`${hasScreenshots ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-6`}>
          <div className="flex items-start gap-4">
            {featuredApp.logo_url ? (
              <img
                src={resolveAssetUrl(featuredApp.logo_url)}
                alt={`${featuredApp.name} logo`}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover border border-white/10 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#FF3030]/15 border border-[#FF3030]/35 flex items-center justify-center font-display text-xl font-bold text-[#FF4D4D] shrink-0">
                {featuredApp.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#94A3B8]">
                {featuredApp.category && <span>{featuredApp.category}</span>}
                {featuredApp.category && featuredApp.platform && <span aria-hidden="true">·</span>}
                {featuredApp.platform && <span>{featuredApp.platform}</span>}
                {(featuredApp.platform || featuredApp.category) && featuredApp.version && (
                  <span aria-hidden="true">·</span>
                )}
                {featuredApp.version && (
                  <span className="font-mono tabular-nums">v{featuredApp.version}</span>
                )}
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#F8FAFC] tracking-tight">
                {featuredApp.name}
              </h3>
            </div>
          </div>

          <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
            {featuredApp.short_description}
          </p>

          {featuredApp.features && featuredApp.features.length > 0 && (
            <ul className="space-y-2.5 pt-2 border-t border-white/10">
              {featuredApp.features.slice(0, 4).map((feat, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[#94A3B8]">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#ef4444] mt-2 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to={`/applications/${featuredApp.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#FF3030] hover:bg-[#FF4D4D] rounded-lg transition-colors whitespace-nowrap"
            >
              View Application
              <ArrowRight className="w-4 h-4" />
            </Link>
            {featuredApp.download_url && (
              <a
                href={featuredApp.download_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-[#F8FAFC] border border-white/15 hover:border-white/30 rounded-lg transition-colors whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            )}
            {featuredApp.website_url && (
              <a
                href={featuredApp.website_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-[#94A3B8] hover:text-white border border-white/10 hover:border-white/25 rounded-lg transition-colors whitespace-nowrap"
              >
                Website
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Right Column: Interactive 3-Card Cover Flow Showcase Window */}
        {hasScreenshots && activeShot && (
          <div
            className="lg:col-span-7 space-y-4 min-w-0"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            {/* Dark Showcase Window */}
            <div className="rounded-2xl border border-white/12 bg-[#05080f] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.65)]">
              {/* Minimalist Window Header Bar */}
              <div className="px-4 py-2.5 border-b border-white/10 bg-[#070b14] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
                    <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                    <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                    <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                  </div>
                  <p className="text-xs font-mono text-[#CBD5E1] truncate">
                    {activeShot.caption || featuredApp.name}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {total > 1 && (
                    <span className="text-xs font-mono text-[#94A3B8] tabular-nums">
                      {safeIndex + 1} / {total}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    aria-label={`Inspect ${featuredApp.name} screenshot full size`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-white/12 hover:border-[#ef4444]/60 bg-[#0b101b] text-xs font-medium text-[#E2E8F0] hover:text-white transition-colors"
                  >
                    <Maximize2 className="w-3 h-3 text-[#ef4444]" />
                    <span>Expand</span>
                  </button>
                </div>
              </div>

              {/* 3-Card Focus Cover Flow Carousel */}
              <div className="p-2 sm:p-3">
                <CoverFlowCarousel
                  screenshots={screenshots}
                  appName={featuredApp.name}
                  activeIndex={safeIndex}
                  direction={direction}
                  onNavigate={handleNavigate}
                  onExpand={() => setLightboxOpen(true)}
                  peekScale={0.82}
                  peekOpacity={0.45}
                  stageHeightClass="h-[320px] sm:h-[380px]"
                  imageMaxHeightClass="max-h-[280px] sm:max-h-[340px]"
                  expandLabel="Expand"
                />
              </div>
            </div>

            {/* Pagination Indicator Dots + Synchronized Thumbnail Selector Strip */}
            {total > 1 && (
              <div className="space-y-3">
                {/* Pagination Dots */}
                <div
                  className="flex items-center justify-center gap-2"
                  role="tablist"
                  aria-label={`${featuredApp.name} capture indicators`}
                >
                  {screenshots.map((shot, idx) => {
                    const isActive = idx === safeIndex;
                    return (
                      <button
                        key={shot.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-label={`Go to ${shot.caption || `screenshot ${idx + 1}`}`}
                        onClick={() => handleNavigate(idx)}
                        className="p-1 focus-visible:outline-none"
                      >
                        <span
                          className={`block h-1.5 rounded-full transition-all duration-300 ${
                            isActive
                              ? 'w-6 bg-[#ef4444]'
                              : 'w-1.5 bg-white/25 hover:bg-white/55'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Synchronized Horizontal Thumbnail Strip */}
                <div className="flex items-center justify-start sm:justify-center gap-2.5 overflow-x-auto pb-1">
                  {screenshots.map((shot, idx) => {
                    const isActive = idx === safeIndex;
                    const thumbLabel = shot.caption?.trim() || `Capture ${idx + 1}`;
                    return (
                      <button
                        key={shot.id}
                        type="button"
                        onClick={() => handleNavigate(idx)}
                        aria-label={`Preview ${thumbLabel}`}
                        aria-pressed={isActive}
                        className={`group relative flex flex-col items-center gap-1 rounded-xl border bg-[#05080f] p-1.5 transition-all shrink-0 w-20 sm:w-24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef4444] ${
                          isActive
                            ? 'border-[#ef4444] ring-1 ring-[#ef4444]/60 shadow-[0_0_18px_rgba(239,68,68,0.22)]'
                            : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/25'
                        }`}
                      >
                        <div className="h-14 w-full rounded-lg overflow-hidden bg-[#03050a] flex items-center justify-center">
                          <img
                            src={resolveAssetUrl(shot.image_url)}
                            alt={thumbLabel}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="max-w-full max-h-full w-auto h-auto object-contain"
                          />
                        </div>
                        <span
                          className={`w-full text-[10px] truncate text-center ${
                            isActive ? 'text-white font-medium' : 'text-[#94A3B8]'
                          }`}
                        >
                          {thumbLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {lightboxOpen && hasScreenshots && (
        <ScreenshotLightboxModal
          screenshots={screenshots}
          appName={featuredApp.name}
          activeIndex={safeIndex}
          onSelect={(idx) => handleNavigate(idx)}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
};
