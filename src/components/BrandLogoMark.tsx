import React from 'react';

export const BRAND_LOGO_PATH = `${import.meta.env.BASE_URL}assets/aistudio/photo_2026-11-19_13-01-36_eb5ebdde.jpg`;

interface BrandLogoMarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  sm: 'w-8 h-8',
  md: 'w-9 h-9',
  lg: 'w-12 h-12',
};

/**
 * Official RDS TECH FACT circular portrait logo mark.
 * Preserves Dhanasekar R's original face and red circular background,
 * cleanly cropping the outer black square corners with zero double circles.
 */
export const BrandLogoMark: React.FC<BrandLogoMarkProps> = ({
  size = 'md',
  className = '',
}) => {
  return (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden rounded-full ring-1 ring-white/15 bg-[#050505] ${SIZE_MAP[size]} ${className}`}
    >
      <img
        src={BRAND_LOGO_PATH}
        alt="RDS TECH FACT Logo – Dhanasekar R"
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover object-center scale-[1.09]"
      />
    </span>
  );
};
