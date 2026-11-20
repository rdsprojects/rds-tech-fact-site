import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ApplicationImage } from '../types/cms';
import { resolveAssetUrl } from '../lib/defaultData';
import { CoverFlowCarousel } from './CoverFlowCarousel';

interface LightboxModalProps {
  screenshots: ApplicationImage[];
  appName: string;
  activeIndex: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}

export const ScreenshotLightboxModal: React.FC<LightboxModalProps> = ({
  screenshots,
  appName,
  activeIndex,
  onSelect,
  onClose,
}) => {
  const safeIndex = Math.max(0, Math.min(activeIndex, screenshots.length - 1));
  const current = screenshots[safeIndex];
  const total = screenshots.length;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && total > 1) {
        onSelect((safeIndex - 1 + total) % total);
      } else if (e.key === 'ArrowRight' && total > 1) {
        onSelect((safeIndex + 1) % total);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, onSelect, safeIndex, total]);

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/92 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={`${appName} screenshot full view`}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3.5 border-b border-white/10 bg-[#05080f]/95 shrink-0">
        <div className="min-w-0">
          <p className="font-display text-sm sm:text-base font-semibold text-white truncate">
            {current.caption || `${appName} Screenshot ${safeIndex + 1}`}
          </p>
          <p className="text-xs text-[#94A3B8] font-mono tabular-nums">
            {appName} · {safeIndex + 1} / {total}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close full-size screenshot"
          className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-white/15 bg-[#0b101b] text-[#F8FAFC] hover:border-[#ef4444] hover:text-white transition-colors shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Uncropped Viewport */}
      <div
        className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden"
        onClick={onClose}
      >
        <img
          src={resolveAssetUrl(current.image_url)}
          alt={current.caption || `${appName} screenshot ${safeIndex + 1}`}
          referrerPolicy="no-referrer"
          onClick={(e) => e.stopPropagation()}
          className="max-w-full max-h-full w-auto h-auto object-contain rounded-xl border border-white/10 bg-[#030303] shadow-2xl"
        />

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect((safeIndex - 1 + total) % total);
              }}
              aria-label="Previous screenshot"
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-white/15 bg-[#05080f]/90 text-white hover:border-[#ef4444] flex items-center justify-center transition-colors backdrop-blur-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect((safeIndex + 1) % total);
              }}
              aria-label="Next screenshot"
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-white/15 bg-[#05080f]/90 text-white hover:border-[#ef4444] flex items-center justify-center transition-colors backdrop-blur-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {total > 1 && (
        <div className="px-4 sm:px-6 py-3 border-t border-white/10 bg-[#05080f]/95 flex items-center justify-center gap-2.5 overflow-x-auto shrink-0">
          {screenshots.map((shot, idx) => (
            <button
              key={shot.id}
              type="button"
              onClick={() => onSelect(idx)}
              aria-label={`View screenshot ${idx + 1}`}
              className={`relative h-14 w-20 rounded-lg overflow-hidden border bg-[#030303] p-1 transition-all shrink-0 ${
                idx === safeIndex
                  ? 'border-[#ef4444] ring-1 ring-[#ef4444]/60'
                  : 'border-white/10 opacity-65 hover:opacity-100'
              }`}
            >
              <img
                src={resolveAssetUrl(shot.image_url)}
                alt={shot.caption || `Thumbnail ${idx + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface GalleryProps {
  screenshots: ApplicationImage[];
  appName: string;
}

export const ApplicationScreenshotsGallery: React.FC<GalleryProps> = ({
  screenshots,
  appName,
}) => {
  const total = screenshots?.length || 0;
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
    setDirection(1);
  }, [appName, total]);

  const safeIndex = total > 0 ? activeIndex % total : 0;

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

  if (total === 0) return null;

  const activeShot = screenshots[safeIndex];

  return (
    <>
      <section className="space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-xl font-semibold text-[#F8FAFC]">Screenshots</h2>
          <p className="text-xs font-mono text-[#94A3B8] tabular-nums">
            {total} {total === 1 ? 'capture' : 'captures'}
            {activeShot?.caption ? ` · ${activeShot.caption}` : ''}
          </p>
        </div>

        {/* Cover Flow Stage Container */}
        <div className="rounded-2xl border border-white/10 bg-[#05080f] p-3 sm:p-5 lg:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <CoverFlowCarousel
            screenshots={screenshots}
            appName={appName}
            activeIndex={safeIndex}
            direction={direction}
            onNavigate={handleNavigate}
            onExpand={() => setLightboxOpen(true)}
            peekScale={0.85}
            peekOpacity={0.5}
            stageHeightClass="h-[380px] sm:h-[460px] lg:h-[510px]"
            imageMaxHeightClass="max-h-[300px] sm:max-h-[380px] lg:max-h-[420px]"
            expandLabel="Full size"
            showCardCaption
            isDetailVariant
          />
        </div>

        {/* Pagination Dots & Synchronized Thumbnail Preview Strip */}
        {total > 1 && (
          <div className="space-y-3.5 pt-1">
            {/* Pagination Dots */}
            <div
              className="flex items-center justify-center gap-2"
              role="tablist"
              aria-label={`${appName} screenshot pagination`}
            >
              {screenshots.map((shot, idx) => {
                const isActive = idx === safeIndex;
                return (
                  <button
                    key={shot.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Select ${shot.caption || `screenshot ${idx + 1}`}`}
                    onClick={() => handleNavigate(idx)}
                    className="p-1 focus-visible:outline-none"
                  >
                    <span
                      className={`block h-1.5 rounded-full transition-all duration-300 ${
                        isActive
                          ? 'w-7 bg-[#ef4444]'
                          : 'w-2 bg-white/25 hover:bg-white/55'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Horizontal Thumbnail Preview Strip */}
            <div className="flex items-center justify-start sm:justify-center gap-3 overflow-x-auto pb-1">
              {screenshots.map((shot, idx) => {
                const isActive = idx === safeIndex;
                const label = shot.caption?.trim() || `Screen ${idx + 1}`;
                return (
                  <button
                    key={shot.id}
                    type="button"
                    onClick={() => handleNavigate(idx)}
                    aria-label={`Jump to ${label}`}
                    aria-pressed={isActive}
                    className={`group flex flex-col items-center gap-1.5 rounded-xl border bg-[#05080f] p-2 transition-all shrink-0 w-24 sm:w-28 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef4444] ${
                      isActive
                        ? 'border-[#ef4444] ring-1 ring-[#ef4444]/60 shadow-[0_0_20px_rgba(239,68,68,0.22)]'
                        : 'border-white/10 opacity-65 hover:opacity-100 hover:border-white/25'
                    }`}
                  >
                    <div className="h-16 w-full rounded-lg overflow-hidden bg-[#03050a] flex items-center justify-center">
                      <img
                        src={resolveAssetUrl(shot.image_url)}
                        alt={label}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="max-w-full max-h-full w-auto h-auto object-contain"
                      />
                    </div>
                    <span
                      className={`w-full text-[11px] truncate text-center ${
                        isActive ? 'text-white font-medium' : 'text-[#94A3B8] group-hover:text-white'
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {lightboxOpen && (
        <ScreenshotLightboxModal
          screenshots={screenshots}
          appName={appName}
          activeIndex={safeIndex}
          onSelect={(idx) => handleNavigate(idx)}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
};
