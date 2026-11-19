import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  AppWindow,
  ExternalLink,
  FileText,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Settings,
  X,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { AdminApplicationsTab } from '../components/admin/AdminApplicationsTab';
import { AdminPoliciesTab } from '../components/admin/AdminPoliciesTab';
import { AdminContentSettingsTab } from '../components/admin/AdminContentSettingsTab';
import { AdminMediaMessagesTab } from '../components/admin/AdminMediaMessagesTab';

type TabKey =
  | 'overview'
  | 'applications'
  | 'policies'
  | 'homepage'
  | 'media'
  | 'settings'
  | 'messages';

export const AdminDashboardPage: React.FC = () => {
  const {
    isAdminAuthenticated,
    authLoading,
    adminEmail,
    logoutAdmin,
    applications,
    policies,
    messages,
    activity,
    settings,
  } = useCms();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; message: string } | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050b18] text-slate-300 flex items-center justify-center text-sm">
        Verifying administrator session...
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const notify = (ok: boolean, message: string) => {
    setToast({ ok, message });
    window.setTimeout(() => setToast(null), 4000);
  };

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/admin/login', { replace: true });
  };

  const publishedAppsCount = applications.filter((a) => a.status === 'published').length;
  const draftAppsCount = applications.filter((a) => a.status === 'draft').length;

  const navItems: Array<{ key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'applications', label: 'Applications', icon: AppWindow },
    { key: 'policies', label: 'Privacy Policies', icon: FileText },
    { key: 'homepage', label: 'Homepage & Brand', icon: Home },
    { key: 'media', label: 'Media Library', icon: ImageIcon },
    { key: 'settings', label: 'Website Settings', icon: Settings },
    { key: 'messages', label: 'Contact Messages', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-[#050b18] text-slate-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 border-r border-slate-800 bg-[#070f21] shrink-0">
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
          <span className="font-display font-bold text-white tracking-tight">
            {settings.brand_name}
          </span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.key
                  ? 'bg-blue-600/15 text-white'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="text-xs text-slate-400 truncate" title={adminEmail || ''}>
            {adminEmail}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 border border-slate-700 hover:border-slate-500 rounded-lg"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-[#070f21] border-r border-slate-800 flex flex-col z-10">
            <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
              <span className="font-display font-bold text-white">{settings.brand_name}</span>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
                className="p-2 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.key);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium ${
                    activeTab === item.key
                      ? 'bg-blue-600/15 text-white'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium text-slate-300 border border-slate-700 rounded-lg"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 px-4 sm:px-6 border-b border-slate-800 bg-[#050b18]/90 backdrop-blur-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-800 text-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm text-slate-400 truncate">
              Admin <span className="mx-1.5">/</span>
              <span className="text-white font-medium capitalize">{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 border border-slate-700 hover:border-slate-500 rounded-lg whitespace-nowrap"
            >
              View Public Site
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
          {toast && (
            <div
              role="status"
              className={`rounded-lg px-4 py-3 text-sm ${
                toast.ok
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200'
                  : 'bg-red-500/10 border border-red-500/30 text-red-200'
              }`}
            >
              {toast.message}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h1 className="font-display text-2xl font-bold text-white">Dashboard Overview</h1>
                <p className="text-sm text-slate-400 mt-1">
                  Manage applications, privacy policies, media, and website content without writing
                  code.
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl border border-slate-800 bg-[#091225] p-5 space-y-1">
                  <p className="text-xs text-slate-400">Total Applications</p>
                  <p className="font-display text-2xl font-bold text-white tabular-nums">
                    {applications.length}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-[#091225] p-5 space-y-1">
                  <p className="text-xs text-slate-400">Published</p>
                  <p className="font-display text-2xl font-bold text-emerald-400 tabular-nums">
                    {publishedAppsCount}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-[#091225] p-5 space-y-1">
                  <p className="text-xs text-slate-400">Drafts</p>
                  <p className="font-display text-2xl font-bold text-amber-300 tabular-nums">
                    {draftAppsCount}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-[#091225] p-5 space-y-1">
                  <p className="text-xs text-slate-400">Privacy Policies</p>
                  <p className="font-display text-2xl font-bold text-blue-400 tabular-nums">
                    {policies.length}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-xl border border-slate-800 bg-[#091225] p-6 space-y-4">
                  <h2 className="font-display text-base font-semibold text-white">Quick Actions</h2>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('applications')}
                      className="px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg"
                    >
                      Manage Applications
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('policies')}
                      className="px-4 py-2.5 text-sm font-medium text-slate-200 border border-slate-700 hover:border-slate-500 rounded-lg"
                    >
                      Edit Privacy Policies
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('messages')}
                      className="px-4 py-2.5 text-sm font-medium text-slate-200 border border-slate-700 hover:border-slate-500 rounded-lg"
                    >
                      Inbox ({messages.length})
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#091225] p-6 space-y-4">
                  <h2 className="font-display text-base font-semibold text-white">
                    Recent Activity
                  </h2>
                  <ul className="space-y-3 text-sm">
                    {activity.slice(0, 5).map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-4 text-slate-300"
                      >
                        <span className="truncate">
                          {item.action}: <strong className="text-white">{item.target}</strong>
                        </span>
                        <span className="text-xs text-slate-500 font-mono tabular-nums shrink-0">
                          {new Date(item.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applications' && <AdminApplicationsTab onNotify={notify} />}
          {activeTab === 'policies' && <AdminPoliciesTab onNotify={notify} />}
          {activeTab === 'homepage' && (
            <AdminContentSettingsTab mode="homepage" onNotify={notify} />
          )}
          {activeTab === 'settings' && (
            <AdminContentSettingsTab mode="settings" onNotify={notify} />
          )}
          {activeTab === 'media' && <AdminMediaMessagesTab mode="media" onNotify={notify} />}
          {activeTab === 'messages' && <AdminMediaMessagesTab mode="messages" onNotify={notify} />}
        </main>
      </div>
    </div>
  );
};
