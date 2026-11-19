import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Inbox,
  LifeBuoy,
  Mail,
  MailOpen,
  MessageSquare,
  RefreshCw,
  Reply,
  Search,
  Shield,
  Trash2,
  Upload,
  User,
  UserCheck,
  X,
} from 'lucide-react';
import { useCms } from '../../context/CmsContext';
import { ContactMessage } from '../../types/cms';

interface Props {
  mode: 'media' | 'messages';
  onNotify: (ok: boolean, message: string) => void;
}

type StatusFilter = 'all' | 'unread' | 'read';
type CategoryFilter = 'all' | 'general' | 'support' | 'privacy';

const PAGE_SIZE = 10;

const CATEGORY_META: Record<
  ContactMessage['category'],
  { label: string; shortLabel: string; badgeClass: string }
> = {
  general: {
    label: 'General Contact',
    shortLabel: 'General',
    badgeClass: 'border-slate-700 bg-slate-800/70 text-slate-200',
  },
  support: {
    label: 'Application Support',
    shortLabel: 'Support',
    badgeClass: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
  },
  privacy: {
    label: 'Privacy Enquiry',
    shortLabel: 'Privacy',
    badgeClass: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  },
};

function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatFullDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildMailtoHref(msg: ContactMessage): string {
  const cleanEmail = msg.email.trim();
  const cleanSubject = msg.subject?.trim();
  const replySubject = cleanSubject
    ? cleanSubject.toLowerCase().startsWith('re:')
      ? cleanSubject
      : `Re: ${cleanSubject}`
    : 'Re: Your Enquiry to RDS TECH FACT';
  return `mailto:${encodeURIComponent(cleanEmail)}?subject=${encodeURIComponent(replySubject)}`;
}

export const AdminMediaMessagesTab: React.FC<Props> = ({ mode, onNotify }) => {
  const {
    media,
    uploadMediaFile,
    deleteMediaAsset,
    updateSettings,
    messages,
    messagesLoading,
    messagesError,
    refreshMessages,
    toggleMessageRead,
    deleteContactMessage,
  } = useCms();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const selectedMessage = useMemo(
    () => messages.find((m) => m.id === selectedMessageId) || null,
    [messages, selectedMessageId]
  );

  // Summary metrics from actual loaded database records
  const summary = useMemo(() => {
    let unread = 0;
    let general = 0;
    let support = 0;
    let privacy = 0;

    for (const msg of messages) {
      if (!msg.is_read) unread += 1;
      if (msg.category === 'general') general += 1;
      else if (msg.category === 'support') support += 1;
      else if (msg.category === 'privacy') privacy += 1;
    }

    return {
      total: messages.length,
      unread,
      read: messages.length - unread,
      general,
      support,
      privacy,
    };
  }, [messages]);

  // Combined search + status + category filtering
  const filteredMessages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return messages.filter((msg) => {
      if (statusFilter === 'unread' && msg.is_read) return false;
      if (statusFilter === 'read' && !msg.is_read) return false;
      if (categoryFilter !== 'all' && msg.category !== categoryFilter) return false;

      if (!q) return true;
      return (
        msg.name.toLowerCase().includes(q) ||
        msg.email.toLowerCase().includes(q) ||
        (msg.subject || '').toLowerCase().includes(q) ||
        msg.message.toLowerCase().includes(q)
      );
    });
  }, [messages, searchQuery, statusFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredMessages.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedMessages = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredMessages.slice(start, start + PAGE_SIZE);
  }, [filteredMessages, safePage]);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, categoryFilter]);

  // Clamp page if items are deleted
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Keyboard Escape handler for delete dialog and detail drawer
  useEffect(() => {
    if (!selectedMessageId && !deleteTarget) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (deleteTarget && !deletingId) {
        setDeleteTarget(null);
      } else if (selectedMessageId && !deleteTarget) {
        setSelectedMessageId(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedMessageId, deleteTarget, deletingId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await uploadMediaFile(file);
    onNotify(res.ok, res.message);
  };

  if (mode === 'media') {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-white">Media Library</h2>
            <p className="text-sm text-slate-400">
              Upload PNG, JPEG, WebP, or SVG assets (up to 5 MB each).
            </p>
          </div>
          <label className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg cursor-pointer">
            <Upload className="w-4 h-4" />
            Upload Image
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {media.map((asset) => (
            <div
              key={asset.id}
              className="rounded-xl border border-slate-800 bg-[#091225] overflow-hidden flex flex-col"
            >
              <div className="h-44 bg-[#050b18] flex items-center justify-center overflow-hidden">
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-medium text-white truncate">{asset.name}</p>
                  <p className="text-xs text-slate-500 font-mono tabular-nums">
                    {(asset.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await updateSettings({ founder_photo_url: asset.url });
                      onNotify(res.ok, 'Founder photograph updated.');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Set as Founder Photo
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await deleteMediaAsset(asset.id);
                      onNotify(res.ok, res.message);
                    }}
                    aria-label={`Delete ${asset.name}`}
                    className="text-slate-400 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasActiveFilters =
    searchQuery.trim().length > 0 || statusFilter !== 'all' || categoryFilter !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  const handleToggleRead = async (
    msg: ContactMessage,
    nextRead: boolean,
    silentSuccess = false
  ) => {
    if (togglingId === msg.id) return;
    setActionError(null);
    setTogglingId(msg.id);
    try {
      const res = await toggleMessageRead(msg.id, nextRead);
      if (!res.ok) {
        setActionError(res.message);
        onNotify(false, res.message);
      } else if (!silentSuccess) {
        onNotify(true, res.message);
      }
    } finally {
      setTogglingId(null);
    }
  };

  const handleOpenEnquiry = (msg: ContactMessage) => {
    setActionError(null);
    setSelectedMessageId(msg.id);
    if (!msg.is_read) {
      void handleToggleRead(msg, true, true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || deletingId) return;
    const targetId = deleteTarget.id;
    setActionError(null);
    setDeletingId(targetId);
    try {
      const res = await deleteContactMessage(targetId);
      onNotify(res.ok, res.message);
      if (res.ok) {
        if (selectedMessageId === targetId) {
          setSelectedMessageId(null);
        }
        setDeleteTarget(null);
      } else {
        setActionError(res.message);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const startIndex = filteredMessages.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(safePage * PAGE_SIZE, filteredMessages.length);

  return (
    <div className="space-y-6 min-w-0">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
              Contact Messages
            </h2>
            {summary.unread > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF3030]/40 bg-[#FF3030]/15 px-2.5 py-0.5 text-xs font-medium text-[#FF8080] tabular-nums">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF3030]" aria-hidden="true" />
                {summary.unread} Unread
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400">
            Review, filter, and respond to enquiries submitted from the public Contact page.
          </p>
        </div>

        <button
          type="button"
          disabled={messagesLoading}
          onClick={() => void refreshMessages()}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-200 border border-slate-700 hover:border-slate-500 bg-[#091225] rounded-lg transition-colors disabled:opacity-50 min-h-[38px]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${messagesLoading ? 'animate-spin' : ''}`} />
          {messagesLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Fetch or Action Error Banner */}
      {(messagesError || actionError) && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex flex-wrap items-start justify-between gap-3"
        >
          <div className="flex items-start gap-2.5 min-w-0">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="break-words">{messagesError || actionError}</p>
          </div>
          {messagesError ? (
            <button
              type="button"
              onClick={() => void refreshMessages()}
              className="px-3 py-1.5 text-xs font-medium text-white bg-red-600/80 hover:bg-red-600 rounded-lg shrink-0"
            >
              Retry
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActionError(null)}
              aria-label="Dismiss error"
              className="text-red-300 hover:text-white p-1 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Initial Skeleton Loading */}
      {messagesLoading && messages.length === 0 ? (
        <div className="space-y-6" aria-label="Loading enquiries">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div
                key={idx}
                className="h-24 rounded-xl border border-slate-800 bg-[#091225] p-4 animate-pulse space-y-3"
              >
                <div className="h-3 w-24 rounded bg-slate-800" />
                <div className="h-6 w-12 rounded bg-slate-800" />
              </div>
            ))}
          </div>
          <div className="h-24 rounded-xl border border-slate-800 bg-[#091225] animate-pulse" />
          <div className="rounded-xl border border-slate-800 bg-[#091225] divide-y divide-slate-800">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="p-5 animate-pulse space-y-3">
                <div className="flex justify-between gap-4">
                  <div className="h-4 w-48 rounded bg-slate-800" />
                  <div className="h-4 w-24 rounded bg-slate-800" />
                </div>
                <div className="h-3 w-64 rounded bg-slate-800/80" />
                <div className="h-3 w-full rounded bg-slate-800/60" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
            <button
              type="button"
              onClick={resetFilters}
              aria-pressed={statusFilter === 'all' && categoryFilter === 'all'}
              className={`text-left rounded-xl border p-4 transition-colors ${
                statusFilter === 'all' && categoryFilter === 'all'
                  ? 'border-[#FF3030]/50 bg-[#0d172d]'
                  : 'border-slate-800 bg-[#091225] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                <span>Total Enquiries</span>
                <Inbox className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
              <p className="mt-2 font-display text-2xl font-bold text-white tabular-nums">
                {summary.total}
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setStatusFilter((prev) => (prev === 'unread' ? 'all' : 'unread'));
                setCategoryFilter('all');
              }}
              aria-pressed={statusFilter === 'unread' && categoryFilter === 'all'}
              className={`text-left rounded-xl border p-4 transition-colors ${
                statusFilter === 'unread' && categoryFilter === 'all'
                  ? 'border-[#FF3030]/60 bg-[#FF3030]/10'
                  : 'border-slate-800 bg-[#091225] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                <span>Unread Enquiries</span>
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    summary.unread > 0 ? 'bg-[#FF3030]' : 'bg-slate-600'
                  }`}
                  aria-hidden="true"
                />
              </div>
              <p
                className={`mt-2 font-display text-2xl font-bold tabular-nums ${
                  summary.unread > 0 ? 'text-[#FF6B6B]' : 'text-white'
                }`}
              >
                {summary.unread}
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setCategoryFilter((prev) => (prev === 'general' ? 'all' : 'general'));
              }}
              aria-pressed={categoryFilter === 'general'}
              className={`text-left rounded-xl border p-4 transition-colors ${
                categoryFilter === 'general'
                  ? 'border-blue-500/50 bg-blue-500/10'
                  : 'border-slate-800 bg-[#091225] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                <span>General Contact</span>
                <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
              <p className="mt-2 font-display text-2xl font-bold text-white tabular-nums">
                {summary.general}
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setCategoryFilter((prev) => (prev === 'support' ? 'all' : 'support'));
              }}
              aria-pressed={categoryFilter === 'support'}
              className={`text-left rounded-xl border p-4 transition-colors ${
                categoryFilter === 'support'
                  ? 'border-sky-500/50 bg-sky-500/10'
                  : 'border-slate-800 bg-[#091225] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                <span>Application Support</span>
                <LifeBuoy className="w-4 h-4 text-sky-400 shrink-0" />
              </div>
              <p className="mt-2 font-display text-2xl font-bold text-sky-300 tabular-nums">
                {summary.support}
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setCategoryFilter((prev) => (prev === 'privacy' ? 'all' : 'privacy'));
              }}
              aria-pressed={categoryFilter === 'privacy'}
              className={`col-span-2 sm:col-span-1 text-left rounded-xl border p-4 transition-colors ${
                categoryFilter === 'privacy'
                  ? 'border-amber-500/50 bg-amber-500/10'
                  : 'border-slate-800 bg-[#091225] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                <span>Privacy Enquiries</span>
                <Shield className="w-4 h-4 text-amber-400 shrink-0" />
              </div>
              <p className="mt-2 font-display text-2xl font-bold text-amber-300 tabular-nums">
                {summary.privacy}
              </p>
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="rounded-xl border border-slate-800 bg-[#091225] p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
              <div className="relative flex-1 min-w-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, subject, or message..."
                  aria-label="Search enquiries"
                  className="w-full rounded-lg border border-slate-700 bg-[#050b18] pl-10 pr-9 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#FF3030] focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear Filters
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
              {/* Status Filters */}
              <button
                type="button"
                onClick={resetFilters}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors min-h-[32px] ${
                  statusFilter === 'all' && categoryFilter === 'all'
                    ? 'border-[#FF3030]/60 bg-[#FF3030]/15 text-white'
                    : 'border-slate-800 bg-[#050b18] text-slate-300 hover:border-slate-600'
                }`}
              >
                All ({summary.total})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter((prev) => (prev === 'unread' ? 'all' : 'unread'))}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors min-h-[32px] ${
                  statusFilter === 'unread'
                    ? 'border-[#FF3030]/60 bg-[#FF3030]/15 text-white'
                    : 'border-slate-800 bg-[#050b18] text-slate-300 hover:border-slate-600'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF3030]" aria-hidden="true" />
                Unread ({summary.unread})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter((prev) => (prev === 'read' ? 'all' : 'read'))}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors min-h-[32px] ${
                  statusFilter === 'read'
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200'
                    : 'border-slate-800 bg-[#050b18] text-slate-300 hover:border-slate-600'
                }`}
              >
                Read ({summary.read})
              </button>

              <span className="hidden sm:inline-block h-4 w-px bg-slate-800 mx-1" aria-hidden="true" />

              {/* Category Filters (exact contact form categories) */}
              <button
                type="button"
                onClick={() =>
                  setCategoryFilter((prev) => (prev === 'general' ? 'all' : 'general'))
                }
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors min-h-[32px] ${
                  categoryFilter === 'general'
                    ? 'border-blue-500/50 bg-blue-500/15 text-blue-200'
                    : 'border-slate-800 bg-[#050b18] text-slate-300 hover:border-slate-600'
                }`}
              >
                General Contact ({summary.general})
              </button>
              <button
                type="button"
                onClick={() =>
                  setCategoryFilter((prev) => (prev === 'support' ? 'all' : 'support'))
                }
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors min-h-[32px] ${
                  categoryFilter === 'support'
                    ? 'border-sky-500/50 bg-sky-500/15 text-sky-200'
                    : 'border-slate-800 bg-[#050b18] text-slate-300 hover:border-slate-600'
                }`}
              >
                Application Support ({summary.support})
              </button>
              <button
                type="button"
                onClick={() =>
                  setCategoryFilter((prev) => (prev === 'privacy' ? 'all' : 'privacy'))
                }
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors min-h-[32px] ${
                  categoryFilter === 'privacy'
                    ? 'border-amber-500/50 bg-amber-500/15 text-amber-200'
                    : 'border-slate-800 bg-[#050b18] text-slate-300 hover:border-slate-600'
                }`}
              >
                Privacy Enquiries ({summary.privacy})
              </button>
            </div>
          </div>

          {/* Enquiry List */}
          <div className="rounded-xl border border-slate-800 bg-[#091225] overflow-hidden">
            {messages.length === 0 ? (
              <div className="px-6 py-14 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                  <Inbox className="w-6 h-6" />
                </div>
                <h3 className="font-display text-base font-semibold text-white">
                  No Contact Enquiries Yet
                </h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  When visitors submit messages via the public Contact page, they will appear here
                  for review and response.
                </p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="px-6 py-12 text-center space-y-3">
                <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="font-display text-base font-semibold text-white">
                  No Matching Enquiries
                </h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  No contact messages matched your current search or filter criteria.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#FF3030] hover:bg-[#FF4D4D] rounded-lg transition-colors"
                >
                  Clear Search &amp; Filters
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/90">
                {paginatedMessages.map((msg) => {
                  const isUnread = !msg.is_read;
                  const meta = CATEGORY_META[msg.category] || CATEGORY_META.general;
                  const isSelected = selectedMessageId === msg.id;
                  const isBusy = togglingId === msg.id || deletingId === msg.id;

                  return (
                    <div
                      key={msg.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleOpenEnquiry(msg)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleOpenEnquiry(msg);
                        }
                      }}
                      className={`group p-4 sm:p-5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF3030] ${
                        isUnread
                          ? 'border-l-2 border-l-[#FF3030] bg-[#0d172d] hover:bg-[#111e38]'
                          : 'bg-[#091225] hover:bg-[#0c162b]'
                      } ${isSelected ? 'ring-1 ring-inset ring-blue-500/40' : ''}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                        {/* Main content */}
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            {isUnread && (
                              <span
                                className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#FF6B6B]"
                                title="Unread enquiry"
                              >
                                <span
                                  className="w-2 h-2 rounded-full bg-[#FF3030]"
                                  aria-hidden="true"
                                />
                                Unread
                              </span>
                            )}
                            <span
                              className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-md border ${meta.badgeClass}`}
                            >
                              {meta.label}
                            </span>
                            <span className="text-xs text-slate-500 font-mono tabular-nums ml-auto sm:ml-0">
                              {formatShortDate(msg.created_at)}
                            </span>
                          </div>

                          <h3
                            className={`font-display text-base truncate group-hover:text-white transition-colors ${
                              isUnread ? 'font-bold text-white' : 'font-medium text-slate-200'
                            }`}
                          >
                            {msg.subject || '(No subject)'}
                          </h3>

                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400">
                            <span className={isUnread ? 'font-medium text-slate-200' : ''}>
                              {msg.name}
                            </span>
                            <span aria-hidden="true" className="text-slate-600">
                              ·
                            </span>
                            <span className="truncate max-w-full">{msg.email}</span>
                          </div>

                          <p className="text-sm text-slate-300/90 leading-relaxed line-clamp-2 break-words pt-0.5">
                            {msg.message}
                          </p>
                        </div>

                        {/* Row Actions */}
                        <div
                          className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void handleToggleRead(msg, !msg.is_read)}
                            title={msg.is_read ? 'Mark as unread' : 'Mark as read'}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 border border-slate-700 hover:border-slate-500 bg-[#050b18] rounded-lg transition-colors disabled:opacity-50 min-h-[36px]"
                          >
                            {msg.is_read ? (
                              <>
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                <span>Mark Unread</span>
                              </>
                            ) : (
                              <>
                                <MailOpen className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Mark Read</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => setDeleteTarget(msg)}
                            aria-label={`Delete enquiry from ${msg.name}`}
                            title="Delete enquiry"
                            className="inline-flex items-center justify-center w-9 h-9 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/40 bg-[#050b18] rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Footer */}
            {filteredMessages.length > 0 && (
              <div className="px-4 sm:px-5 py-3.5 border-t border-slate-800 bg-[#070f21] flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-400 tabular-nums">
                  Showing <span className="text-slate-200 font-medium">{startIndex}</span>–
                  <span className="text-slate-200 font-medium">{endIndex}</span> of{' '}
                  <span className="text-slate-200 font-medium">{filteredMessages.length}</span>{' '}
                  {filteredMessages.length === 1 ? 'enquiry' : 'enquiries'}
                </p>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 border border-slate-700 hover:border-slate-500 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed min-h-[34px]"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Prev
                    </button>

                    <div className="hidden sm:flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                        .filter(
                          (page) =>
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - safePage) <= 1
                        )
                        .map((page, idx, arr) => {
                          const prevPage = arr[idx - 1];
                          const showEllipsis = prevPage !== undefined && page - prevPage > 1;
                          return (
                            <React.Fragment key={page}>
                              {showEllipsis && (
                                <span className="px-1.5 text-xs text-slate-500">…</span>
                              )}
                              <button
                                type="button"
                                onClick={() => setCurrentPage(page)}
                                aria-current={page === safePage ? 'page' : undefined}
                                className={`min-w-[34px] h-[34px] px-2 text-xs font-mono tabular-nums rounded-lg border transition-colors ${
                                  page === safePage
                                    ? 'border-[#FF3030]/60 bg-[#FF3030]/15 text-white font-semibold'
                                    : 'border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white'
                                }`}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          );
                        })}
                    </div>

                    <span className="sm:hidden text-xs font-mono text-slate-400 px-2 tabular-nums">
                      {safePage} / {totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={safePage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 border border-slate-700 hover:border-slate-500 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed min-h-[34px]"
                    >
                      Next
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Enquiry Detail Slide-Over Drawer */}
      {selectedMessage && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="enquiry-detail-subject"
        >
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            onClick={() => setSelectedMessageId(null)}
          />
          <div className="relative z-10 w-full max-w-xl bg-[#070f21] border-l border-slate-800 h-full flex flex-col shadow-2xl">
            {/* Drawer Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border ${
                    (CATEGORY_META[selectedMessage.category] || CATEGORY_META.general).badgeClass
                  }`}
                >
                  {(CATEGORY_META[selectedMessage.category] || CATEGORY_META.general).label}
                </span>

                {selectedMessage.is_read ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Read
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF6B6B]">
                    <span className="w-2 h-2 rounded-full bg-[#FF3030]" aria-hidden="true" />
                    Unread
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedMessageId(null)}
                aria-label="Close enquiry details"
                className="p-2 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-6 space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-mono uppercase tracking-wider text-slate-500">Subject</p>
                <h3
                  id="enquiry-detail-subject"
                  className="font-display text-xl font-bold text-white break-words"
                >
                  {selectedMessage.subject || '(No subject)'}
                </h3>
              </div>

              {/* Metadata Grid */}
              <div className="rounded-xl border border-slate-800 bg-[#091225] p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1 min-w-0">
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    Full Name
                  </p>
                  <p className="text-white font-medium break-words">{selectedMessage.name}</p>
                </div>

                <div className="space-y-1 min-w-0">
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    Email Address
                  </p>
                  <p className="text-cyan-300 font-mono text-xs break-all">
                    {selectedMessage.email}
                  </p>
                </div>

                <div className="space-y-1 min-w-0">
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Submitted On
                  </p>
                  <p className="text-slate-200 font-mono text-xs tabular-nums">
                    {formatFullDateTime(selectedMessage.created_at)}
                  </p>
                </div>

                <div className="space-y-1 min-w-0">
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <MailOpen className="w-3.5 h-3.5 text-slate-500" />
                    Read Status
                  </p>
                  <p className="text-slate-200 text-xs font-medium">
                    {selectedMessage.is_read ? 'Read' : 'Unread'}
                  </p>
                </div>
              </div>

              {/* Message Body */}
              <div className="space-y-2">
                <p className="text-xs font-mono uppercase tracking-wider text-slate-500">Message</p>
                <div className="rounded-xl border border-slate-800 bg-[#050b18] p-4 sm:p-5 text-sm text-slate-200 leading-relaxed whitespace-pre-line break-words">
                  {selectedMessage.message}
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="px-5 sm:px-6 py-4 border-t border-slate-800 bg-[#091225] space-y-2.5 shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <a
                  href={buildMailtoHref(selectedMessage)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#FF3030] hover:bg-[#FF4D4D] rounded-lg transition-colors min-h-[40px]"
                >
                  <Reply className="w-4 h-4" />
                  Reply via Email
                </a>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={togglingId === selectedMessage.id}
                    onClick={() =>
                      void handleToggleRead(selectedMessage, !selectedMessage.is_read)
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-slate-200 border border-slate-700 hover:border-slate-500 rounded-lg transition-colors disabled:opacity-50 min-h-[40px]"
                  >
                    {selectedMessage.is_read ? (
                      <>
                        <Mail className="w-3.5 h-3.5" />
                        Mark as Unread
                      </>
                    ) : (
                      <>
                        <MailOpen className="w-3.5 h-3.5" />
                        Mark as Read
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(selectedMessage)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-red-300 border border-red-500/40 hover:bg-red-500/10 rounded-lg transition-colors min-h-[40px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Reply opens your default email client addressed to {selectedMessage.email}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-enquiry-title"
        >
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            onClick={() => {
              if (!deletingId) setDeleteTarget(null);
            }}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-800 bg-[#091225] p-6 space-y-5 shadow-2xl">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0 text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 id="delete-enquiry-title" className="font-display text-lg font-bold text-white">
                  Delete Enquiry?
                </h3>
                <p className="text-sm text-slate-400">
                  This permanently removes the enquiry from your inbox and cannot be undone.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#050b18] p-4 space-y-1.5 text-sm">
              <p className="font-semibold text-white break-words">
                {deleteTarget.subject || '(No subject)'}
              </p>
              <p className="text-xs text-slate-300 break-words">
                From: {deleteTarget.name} ({deleteTarget.email})
              </p>
              <p className="text-xs text-slate-400">
                {(CATEGORY_META[deleteTarget.category] || CATEGORY_META.general).label} ·{' '}
                <span className="font-mono tabular-nums">
                  {formatShortDate(deleteTarget.created_at)}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 text-sm font-medium text-slate-300 border border-slate-700 hover:border-slate-500 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() => void handleConfirmDelete()}
                className="px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-50"
              >
                {deletingId ? 'Deleting...' : 'Delete Enquiry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

