import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCms } from '../context/CmsContext';
import { BrandLogoMark } from './BrandLogoMark';

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/applications', label: 'Applications' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/contact', label: 'Contact' },
];

export const PublicLayout: React.FC = () => {
  const { settings } = useCms();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[#030303] text-[#F8FAFC]">
      {/* Floating Dark Glass Header (strict 3-zone contract) */}
      <header className="sticky top-0 z-40 px-3 sm:px-6 pt-3">
        <div
          className={`max-w-6xl mx-auto px-4 sm:px-6 h-16 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-8 ${
            scrolled
              ? 'bg-[#050505]/92 border-white/15 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.65)]'
              : 'bg-[#050505]/70 border-white/10 backdrop-blur-md'
          }`}
        >
          {/* Zone 1: [MY PORTRAIT] RDS TECH FACT */}
          <Link
            to="/"
            className="inline-flex items-center gap-3 whitespace-nowrap shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3030] rounded-lg"
          >
            <BrandLogoMark size="md" />
            <span className="font-display text-base sm:text-lg font-bold tracking-tight text-[#F8FAFC] group-hover:text-white transition-colors">
              {settings.brand_name}
            </span>
          </Link>

          {/* Zone 2: 5 clean single-line navigation links */}
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#94A3B8]"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `relative whitespace-nowrap shrink-0 py-1.5 transition-colors focus-visible:outline-none focus-visible:text-white ${
                    isActive ? 'text-[#F8FAFC]' : 'hover:text-[#F8FAFC]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.span
                        layoutId="rds-nav-underline"
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-[#FF3030]"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: 1 primary CTA + Mobile Drawer Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/applications"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-[#FF3030] hover:bg-[#FF4D4D] rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D4D]"
            >
              Explore Apps
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl border border-white/10 bg-[#0B1220]/70 text-[#F8FAFC] hover:border-white/20 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile navigation drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              aria-label="Mobile"
              className="md:hidden max-w-6xl mx-auto mt-2 rounded-2xl border border-white/12 bg-[#050816]/95 backdrop-blur-xl px-4 py-4 space-y-1 shadow-2xl"
            >
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#FF3030]/15 text-white border border-[#FF3030]/35'
                        : 'text-[#94A3B8] hover:bg-[#0B1220] hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="pt-2">
                <Link
                  to="/applications"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center px-4 py-3 text-sm font-semibold text-white bg-[#FF3030] hover:bg-[#FF4D4D] rounded-xl transition-colors"
                >
                  Explore Applications
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#050505]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-white/10">
            <div className="space-y-3">
              <Link to="/" className="inline-flex items-center gap-3">
                <BrandLogoMark size="md" />
                <span className="font-display text-lg font-bold tracking-tight text-white">
                  {settings.brand_name}
                </span>
              </Link>
              <p className="text-xs font-mono text-[#FFD700] tracking-wide">
                AI • TECH • TIPS &amp; TRICKS
              </p>
              <p className="text-sm text-[#94A3B8] leading-relaxed max-w-xs">
                {settings.tagline} Founded by {settings.founder_name}.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-white">Navigation</h2>
              <ul className="space-y-2 text-sm text-[#94A3B8]">
                {NAV_ITEMS.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-white">Contact &amp; Governance</h2>
              <ul className="space-y-2 text-sm text-[#94A3B8]">
                <li>
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="hover:text-white transition-colors break-all"
                  >
                    {settings.contact_email}
                  </a>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-white transition-colors">
                    Privacy Center
                  </Link>
                </li>
                <li>
                  <Link to="/admin/login" className="hover:text-white transition-colors">
                    Admin Portal
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
            <p>{settings.footer_copyright}</p>
            <div className="flex items-center gap-5">
              {settings.social_youtube && (
                <a
                  href={settings.social_youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#94A3B8] hover:text-[#FF4D4D] transition-colors"
                >
                  YouTube
                </a>
              )}
              {settings.social_github && (
                <a
                  href={settings.social_github}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#94A3B8] hover:text-white transition-colors"
                >
                  GitHub
                </a>
              )}
              {settings.social_linkedin && (
                <a
                  href={settings.social_linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#94A3B8] hover:text-[#22D3EE] transition-colors"
                >
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
