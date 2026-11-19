import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import { useCms } from '../context/CmsContext';

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const ApplicationsPage: React.FC = () => {
  const { applications, settings, loading } = useCms();
  const publishedApps = applications.filter((app) => app.status === 'published');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-20 space-y-12">
      <div className="max-w-2xl space-y-3">
        <p className="font-mono text-xs text-[#FF4D4D] tracking-wide">
          {settings.brand_name} Directory
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F8FAFC] tracking-tight">
          Applications
        </h1>
        <p className="text-[#94A3B8] leading-relaxed">
          Official software applications and utilities published by {settings.brand_name}.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-52 rounded-xl border border-white/10 bg-[#0B1220] animate-pulse"
            />
          ))}
        </div>
      ) : publishedApps.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0B1220] p-10 sm:p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#FF3030]/15 border border-[#FF3030]/30 flex items-center justify-center mx-auto text-[#FF4D4D]">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="font-display text-xl font-semibold text-[#F8FAFC]">
            No Published Applications Yet
          </h2>
          <p className="text-sm text-[#94A3B8] max-w-md mx-auto leading-relaxed">
            Applications are currently in preparation. Once an application is published by the
            administrator, it will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedApps.map((app, idx) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04, ease: EASE_OUT }}
            >
              <Link
                to={`/applications/${app.slug}`}
                className="group h-full rounded-xl border border-white/10 bg-[#0B1220] hover:border-[#FF3030]/50 p-6 flex flex-col justify-between gap-6 transition-colors"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    {app.logo_url ? (
                      <img
                        src={app.logo_url}
                        alt={`${app.name} logo`}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#FF3030]/15 border border-[#FF3030]/35 flex items-center justify-center font-display text-base font-bold text-[#FF4D4D] shrink-0">
                        {app.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h2 className="font-display text-lg font-semibold text-[#F8FAFC] group-hover:text-[#FF4D4D] transition-colors truncate">
                        {app.name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#94A3B8]">
                        {app.category && <span>{app.category}</span>}
                        {app.category && app.platform && <span aria-hidden="true">·</span>}
                        {app.platform && <span>{app.platform}</span>}
                        {(app.platform || app.category) && app.version && (
                          <span aria-hidden="true">·</span>
                        )}
                        {app.version && (
                          <span className="font-mono tabular-nums">v{app.version}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-[#CBD5E1] leading-relaxed">{app.short_description}</p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-sm font-medium text-[#F8FAFC] group-hover:text-[#FF4D4D] transition-colors">
                  <span>View application</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
