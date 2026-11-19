import React, { useState } from 'react';
import { CheckCircle2, LifeBuoy, Mail, Shield } from 'lucide-react';
import { useCms } from '../context/CmsContext';

export const ContactPage: React.FC = () => {
  const { settings, submitContactMessage } = useCms();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<'general' | 'support' | 'privacy'>('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Honeypot spam protection
    if (honeypot.trim().length > 0) {
      setFeedback({ ok: true, text: 'Thank you for your message.' });
      return;
    }

    if (name.trim().length < 2) {
      setFeedback({ ok: false, text: 'Please enter your name (at least 2 characters).' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setFeedback({ ok: false, text: 'Please enter a valid email address.' });
      return;
    }
    if (subject.trim().length < 2) {
      setFeedback({ ok: false, text: 'Please enter a subject.' });
      return;
    }
    if (message.trim().length < 10) {
      setFeedback({ ok: false, text: 'Please enter a message of at least 10 characters.' });
      return;
    }

    setSubmitting(true);
    const res = await submitContactMessage({ name, email, category, subject, message });
    setSubmitting(false);

    if (res.ok) {
      setFeedback({ ok: true, text: res.message });
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } else {
      setFeedback({ ok: false, text: res.message });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 lg:py-20 space-y-12">
      <div className="max-w-2xl space-y-3">
        <p className="font-mono text-xs text-[#FF4D4D] tracking-wide">Get in Touch</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F8FAFC] tracking-tight">
          Contact {settings.brand_name}
        </h1>
        <p className="text-[#94A3B8] leading-relaxed">
          Reach out for application support, privacy enquiries, or general questions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-white/10 bg-[#0B1220] p-6 space-y-2">
            <div className="flex items-center gap-2.5 text-[#F8FAFC] font-display font-semibold">
              <Mail className="w-4 h-4 text-[#FF4D4D]" />
              General Contact
            </div>
            <p className="text-sm text-[#94A3B8]">
              For general enquiries about {settings.brand_name}.
            </p>
            <a
              href={`mailto:${settings.contact_email}`}
              className="block text-sm text-[#22D3EE] hover:text-white break-all transition-colors"
            >
              {settings.contact_email}
            </a>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0B1220] p-6 space-y-2">
            <div className="flex items-center gap-2.5 text-[#F8FAFC] font-display font-semibold">
              <LifeBuoy className="w-4 h-4 text-[#FF4D4D]" />
              Support Enquiries
            </div>
            <p className="text-sm text-[#94A3B8]">
              Technical assistance for published applications.
            </p>
            <a
              href={`mailto:${settings.support_email}`}
              className="block text-sm text-[#22D3EE] hover:text-white break-all transition-colors"
            >
              {settings.support_email}
            </a>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0B1220] p-6 space-y-2">
            <div className="flex items-center gap-2.5 text-[#F8FAFC] font-display font-semibold">
              <Shield className="w-4 h-4 text-[#FF4D4D]" />
              Privacy Enquiries
            </div>
            <p className="text-sm text-[#94A3B8]">
              Questions regarding data handling and policies.
            </p>
            <a
              href={`mailto:${settings.privacy_email}`}
              className="block text-sm text-[#22D3EE] hover:text-white break-all transition-colors"
            >
              {settings.privacy_email}
            </a>
          </div>
        </div>

        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="rounded-2xl border border-white/10 bg-[#0B1220] p-6 sm:p-8 space-y-5"
          >
            {/* Hidden honeypot field for spam bots */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="company_website">Website</label>
              <input
                id="company_website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="contact-name" className="block text-sm font-medium text-[#F8FAFC]">
                  Full Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-lg border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#FF3030] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-email" className="block text-sm font-medium text-[#F8FAFC]">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#FF3030] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="contact-category"
                  className="block text-sm font-medium text-[#F8FAFC]"
                >
                  Enquiry Type
                </label>
                <select
                  id="contact-category"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as 'general' | 'support' | 'privacy')
                  }
                  className="w-full rounded-lg border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white focus:border-[#FF3030] focus:outline-none"
                >
                  <option value="general">General Enquiry</option>
                  <option value="support">Application Support</option>
                  <option value="privacy">Privacy Enquiry</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="contact-subject"
                  className="block text-sm font-medium text-[#F8FAFC]"
                >
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief subject"
                  className="w-full rounded-lg border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#FF3030] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="contact-message" className="block text-sm font-medium text-[#F8FAFC]">
                Message
              </label>
              <textarea
                id="contact-message"
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help?"
                className="w-full rounded-lg border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#FF3030] focus:outline-none"
              />
            </div>

            {feedback && (
              <div
                className={`rounded-lg px-4 py-3 text-sm flex items-start gap-2.5 ${
                  feedback.ok
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200'
                    : 'bg-red-500/10 border border-red-500/30 text-red-200'
                }`}
              >
                {feedback.ok && <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />}
                <span>{feedback.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-[#FF3030] hover:bg-[#FF4D4D] disabled:opacity-60 rounded-xl transition-colors"
            >
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
