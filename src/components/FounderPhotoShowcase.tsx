import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface FounderPhotoShowcaseProps {
  photos: string[];
  intervalSeconds?: number;
  founderName: string;
  founderTitle: string;
  showCaptionOverlay?: boolean;
}

export const FounderPhotoShowcase: React.FC<FounderPhotoShowcaseProps> = ({
  photos,
  intervalSeconds = 10,
  founderName,
  founderTitle,
  showCaptionOverlay = false,
}) => {
  const validPhotos = photos.filter(Boolean).slice(0, 3);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [failedIndices, setFailedIndices] = useState<Record<number, boolean>>({});
  const prefersReducedMotion = useReducedMotion();

  const safeIntervalMs = Math.min(120, Math.max(3, Number(intervalSeconds) || 10)) * 1000;

  useEffect(() => {
    setActiveIndex(0);
    setFailedIndices({});
  }, [validPhotos.join('|')]);

  useEffect(() => {
    if (validPhotos.length <= 1 || paused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % validPhotos.length);
    }, safeIntervalMs);
    return () => window.clearInterval(timer);
  }, [validPhotos.length, paused, safeIntervalMs]);

  const safeIndex = validPhotos.length > 0 ? activeIndex % validPhotos.length : 0;
  const activeUrl = validPhotos[safeIndex];
  const hasMultiple = validPhotos.length > 1;

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden bg-[#050505] group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative w-full aspect-[3/4] bg-[#050816] overflow-hidden">
        <AnimatePresence mode="sync" initial={false}>
          {activeUrl && !failedIndices[safeIndex] ? (
            <motion.img
              key={`${activeUrl}-${safeIndex}`}
              src={activeUrl}
              alt={`${founderName}, ${founderTitle} (${safeIndex + 1} of ${validPhotos.length})`}
              referrerPolicy="no-referrer"
              onError={() => setFailedIndices((prev) => ({ ...prev, [safeIndex]: true }))}
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.035 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.2 : 0.75, ease: EASE_OUT }}
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
          ) : (
            <motion.div
              key="founder-fallback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#0B1220] to-[#050816] text-[#94A3B8]"
            >
              <User className="w-12 h-12 text-[#64748B]" />
              <span className="text-sm font-medium text-[#CBD5E1]">{founderName}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Measured Bottom Gradient Scrim */}
        {showCaptionOverlay ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#030303] via-[#030303]/85 to-transparent pt-20 pb-5 px-5 z-10">
            <p className="font-display text-lg font-semibold text-[#F8FAFC]">{founderName}</p>
            <p className="text-sm text-[#94A3B8]">{founderTitle}</p>
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#030303]/70 to-transparent z-10"
          />
        )}

        {/* Step Controls & Progress Indicators when > 1 Photo */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() =>
                setActiveIndex((prev) => (prev - 1 + validPhotos.length) % validPhotos.length)
              }
              aria-label="Previous founder portrait"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full border border-white/15 bg-[#050816]/75 text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:border-[#FF3030] flex items-center justify-center transition-all backdrop-blur-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveIndex((prev) => (prev + 1) % validPhotos.length)}
              aria-label="Next founder portrait"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full border border-white/15 bg-[#050816]/75 text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:border-[#FF3030] flex items-center justify-center transition-all backdrop-blur-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div
              className={`absolute right-4 z-20 flex items-center gap-1.5 ${
                showCaptionOverlay ? 'bottom-6' : 'bottom-4'
              }`}
              role="tablist"
              aria-label="Founder portraits"
            >
              {validPhotos.map((_, idx) => {
                const isActive = idx === safeIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Show portrait ${idx + 1} of ${validPhotos.length}`}
                    onClick={() => setActiveIndex(idx)}
                    className="py-1.5 px-0.5 focus-visible:outline-none"
                  >
                    <span
                      className={`block h-1 rounded-full transition-all duration-300 ${
                        isActive
                          ? 'w-6 bg-[#FF3030]'
                          : 'w-2.5 bg-white/35 hover:bg-white/60'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
