import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useCms } from '../context/CmsContext';
import { resolveAssetUrl } from '../lib/defaultData';
import { BrandLogoMark } from '../components/BrandLogoMark';

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const AboutPage: React.FC = () => {
  const { settings } = useCms();

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

      {/* Founder Profile */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
        className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start border-b border-white/10 pb-12"
      >
        <div className="md:col-span-4">
          <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-[#050505]">
            <img
              src={resolveAssetUrl(settings.founder_photo_url)}
              alt={`${settings.founder_name}, ${settings.founder_title}`}
              referrerPolicy="no-referrer"
              className="w-full aspect-[3/4] object-cover object-top"
            />
          </div>
        </div>
        <div className="md:col-span-8 space-y-5">
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
    </div>
  );
};
