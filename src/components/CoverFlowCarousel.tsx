import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Maximize2 } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ApplicationImage } from '../types/cms';
import { resolveAssetUrl } from '../lib/defaultData';

const SPRING_TRANSITION = {
  type: 'spring' as const,
  stiffness: 290,
  damping: 30,
  mass: 0.9,
};

export interface CoverFlowCarouselProps {
  screenshots: ApplicationImage[];
  appName: string;
  activeIndex: number;
  direction: number;
  onNavigate: (nextIndex: number, nextDirection: number) => void;
  onExpand: () => void;
  peekScale?: number;
  peekOpacity?: number;
  stageHeightClass?: string;
  imageMaxHeightClass?: string;
  expandLabel?: string;
  showCardCaption?: boolean;
  isDetailVariant?: boolean;
}

type SlotPosition = 'left' | 'center' | 'right';

export const CoverFlowCarousel: React.FC<CoverFlowCarouselProps> = ({
  screenshots,
  appName,
  activeIndex,
  direction,
  onNavigate,
  onExpand,
  peekScale = 0.84,
  peekOpacity = 0.48,
  stageHeightClass = 'h-[320px] sm:h-[380px]',
  imageMaxHeightClass = 'max-h-[270px] sm:max-h-[330px]',
  expandLabel = 'Full size',
  showCardCaption = false,
  isDetailVariant = false,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [stageWidth, setStageWidth] = useState<number>(isDetailVariant ? 960 : 580);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const updateWidth = () => {
      if (el.clientWidth > 0) setStageWidth(el.clientWidth);
    };
    updateWidth();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(updateWidth);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const total = screenshots.length;
  if (total === 0) return null;

  const safeIndex = ((activeIndex % total) + total) % total;

  // Responsive horizontal peek offset in pixels so left/right cards stay crisp & visible across viewports
  const peekOffsetPx = isDetailVariant
    ? Math.round(Math.min(300, Math.max(135, stageWidth * 0.29)))
    : Math.round(Math.min(225, Math.max(125, stageWidth * 0.34)));
  const offstageOffsetPx = Math.round(peekOffsetPx * 1.75);

  const stepPrev = () => {
    if (total <= 1) return;
    onNavigate((safeIndex - 1 + total) % total, -1);
  };

  const stepNext = () => {
    if (total <= 1) return;
    onNavigate((safeIndex + 1) % total, 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      stepPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      stepNext();
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current || e.changedTouches.length !== 1) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      if (dx < 0) stepNext();
      else stepPrev();
    }
  };

  // Build visible slots (up to 3 cards: left peek, active center, right peek)
  const visibleSlots: Array<{ shot: ApplicationImage; index: number; slot: SlotPosition }> = [];
  if (total === 1) {
    visibleSlots.push({ shot: screenshots[0], index: 0, slot: 'center' });
  } else if (total === 2) {
    const otherIndex = safeIndex === 0 ? 1 : 0;
    if (safeIndex === 0) {
      visibleSlots.push({ shot: screenshots[0], index: 0, slot: 'center' });
      visibleSlots.push({ shot: screenshots[1], index: 1, slot: 'right' });
    } else {
      visibleSlots.push({ shot: screenshots[otherIndex], index: otherIndex, slot: 'left' });
      visibleSlots.push({ shot: screenshots[safeIndex], index: safeIndex, slot: 'center' });
    }
  } else {
    const leftIndex = (safeIndex - 1 + total) % total;
    const rightIndex = (safeIndex + 1) % total;
    visibleSlots.push({ shot: screenshots[leftIndex], index: leftIndex, slot: 'left' });
    visibleSlots.push({ shot: screenshots[safeIndex], index: safeIndex, slot: 'center' });
    visibleSlots.push({ shot: screenshots[rightIndex], index: rightIndex, slot: 'right' });
  }

  const getSlotMotion = (slot: SlotPosition) => {
    if (slot === 'center') {
      return {
        x: 0,
        scale: 1,
        opacity: 1,
        filter: 'blur(0px)',
        zIndex: 20,
      };
    }
    const sign = slot === 'left' ? -1 : 1;
    return {
      x: sign * peekOffsetPx,
      scale: peekScale,
      opacity: peekOpacity,
      filter: prefersReducedMotion ? 'blur(0px)' : 'blur(1.5px)',
      zIndex: 10,
    };
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir >= 0 ? offstageOffsetPx : -offstageOffsetPx,
      scale: 0.72,
      opacity: 0,
      filter: prefersReducedMotion ? 'blur(0px)' : 'blur(2px)',
      zIndex: 5,
    }),
    exit: (dir: number) => ({
      x: dir >= 0 ? -offstageOffsetPx : offstageOffsetPx,
      scale: 0.72,
      opacity: 0,
      filter: prefersReducedMotion ? 'blur(0px)' : 'blur(2px)',
      zIndex: 5,
    }),
  };

  return (
    <div
      ref={stageRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label={`${appName} screenshots`}
      className={`relative w-full ${stageHeightClass} overflow-hidden select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef4444]/60 rounded-xl`}
      style={{
        background: isDetailVariant
          ? 'radial-gradient(65% 75% at 50% 50%, rgba(239, 68, 68, 0.08), rgba(5, 8, 15, 0.98) 80%)'
          : 'radial-gradient(70% 75% at 50% 48%, rgba(37, 99, 235, 0.08), rgba(5, 8, 15, 0.96) 82%)',
      }}
    >
      {/* Subtle side vignette edges to soften peeking captures cleanly */}
      {total > 1 && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-16 z-30 bg-gradient-to-r from-[#05080f] via-[#05080f]/55 to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-16 z-30 bg-gradient-to-l from-[#05080f] via-[#05080f]/55 to-transparent"
          />
        </>
      )}

      {/* Cover Flow Card Stage */}
      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction}>
          {visibleSlots.map(({ shot, index, slot }) => {
            const isCenter = slot === 'center';
            const targetMotion = getSlotMotion(slot);
            const label = shot.caption?.trim() || `${appName} Screenshot ${index + 1}`;
            const imageUrl = resolveAssetUrl(shot.image_url);
            const isFailed = Boolean(failedUrls[shot.image_url]);

            return (
              <motion.div
                key={shot.id}
                custom={direction}
                variants={slideVariants}
                initial={prefersReducedMotion ? false : 'enter'}
                animate={targetMotion}
                exit={prefersReducedMotion ? { opacity: 0 } : 'exit'}
                transition={prefersReducedMotion ? { duration: 0.15 } : SPRING_TRANSITION}
                style={{ zIndex: targetMotion.zIndex }}
                className="absolute inset-0 flex items-center justify-center px-8 sm:px-14 pointer-events-none"
              >
                <div
                  onClick={() => {
                    if (isCenter) {
                      if (!isFailed) onExpand();
                    } else {
                      onNavigate(index, slot === 'right' ? 1 : -1);
                    }
                  }}
                  role="button"
                  tabIndex={isCenter ? 0 : -1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (isCenter) {
                        if (!isFailed) onExpand();
                      } else {
                        onNavigate(index, slot === 'right' ? 1 : -1);
                      }
                    }
                  }}
                  aria-label={
                    isCenter ? `View ${label} in full size` : `Switch to ${label}`
                  }
                  className={`pointer-events-auto relative inline-flex flex-col overflow-hidden rounded-2xl border transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef4444] ${
                    isCenter
                      ? 'border-white/20 bg-[#0b101b] shadow-[0_24px_60px_rgba(0,0,0,0.85),0_0_36px_rgba(239,68,68,0.14)] hover:border-[#ef4444]/60'
                      : 'border-white/10 bg-[#070b14] hover:border-white/25'
                  }`}
                >
                  <div className="relative p-1.5 sm:p-2 bg-[#05080f] flex items-center justify-center">
                    {isFailed ? (
                      <div className="w-44 h-60 flex flex-col items-center justify-center gap-2 text-[#64748B] px-4 text-center">
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-xs">{label}</span>
                      </div>
                    ) : (
                      <img
                        src={imageUrl}
                        alt={label}
                        loading="lazy"
                        draggable={false}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedUrls((prev) => ({ ...prev, [shot.image_url]: true }))
                        }
                        className={`${imageMaxHeightClass} w-auto max-w-full h-auto object-contain block rounded-xl`}
                      />
                    )}

                    {/* Floating "Full size" button on active center card */}
                    {isCenter && isDetailVariant && !isFailed && (
                      <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#05080f]/85 border border-white/15 text-xs font-medium text-[#F8FAFC] opacity-85 group-hover:opacity-100 transition-opacity backdrop-blur-md">
                        <Maximize2 className="w-3.5 h-3.5 text-[#ef4444]" />
                        <span>{expandLabel}</span>
                      </span>
                    )}
                  </div>

                  {showCardCaption && isCenter && (
                    <div className="px-3.5 py-2 border-t border-white/10 bg-[#0b101b] flex items-center justify-between gap-3 text-xs">
                      <span className="text-[#E2E8F0] font-medium truncate">{label}</span>
                      <span className="text-[#94A3B8] font-mono tabular-nums shrink-0">
                        {index + 1} / {total}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Floating Circular Glassmorphism Navigation Buttons */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              stepPrev();
            }}
            aria-label="Previous screenshot"
            className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/15 bg-[#05080f]/75 hover:bg-[#0b101b]/95 hover:border-[#ef4444] text-white flex items-center justify-center transition-colors backdrop-blur-md shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef4444]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              stepNext();
            }}
            aria-label="Next screenshot"
            className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/15 bg-[#05080f]/75 hover:bg-[#0b101b]/95 hover:border-[#ef4444] text-white flex items-center justify-center transition-colors backdrop-blur-md shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef4444]"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
};
