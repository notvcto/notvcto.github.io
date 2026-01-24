'use client';

import { useState } from 'react';

export const Contact = () => {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setStatus('sending');
      // Fake send
      setTimeout(() => setStatus('success'), 1500);
  };

  return (
    <div className="h-full bg-surface-light dark:bg-surface-dark p-6 flex flex-col items-center">
      <h1 className="text-xl font-bold mb-6 text-primary">Contact Me</h1>

      {status === 'success' ? (
          <div className="flex flex-col items-center text-green-accent animate-fadeIn">
              <span className="material-icons-round text-6xl mb-2">check_circle</span>
              <span>Message sent successfully!</span>
              <button
                onClick={() => setStatus('idle')}
                className="mt-4 text-sm text-subtext-dark hover:text-white"
              >
                  Send another
              </button>
          </div>
      ) : (
          <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
            <input
                type="text"
                placeholder="Name"
                required
                className="bg-surface-dark border border-white/10 rounded px-3 py-2 text-sm focus:border-primary/50 outline-none"
            />
            <input
                type="email"
                placeholder="Email"
                required
                className="bg-surface-dark border border-white/10 rounded px-3 py-2 text-sm focus:border-primary/50 outline-none"
            />
            <textarea
                placeholder="Message"
                required
                rows={5}
                className="bg-surface-dark border border-white/10 rounded px-3 py-2 text-sm focus:border-primary/50 outline-none resize-none"
            />
            <button
                type="submit"
                disabled={status === 'sending'}
                className="bg-primary/20 text-primary py-2 rounded hover:bg-primary/30 transition-colors disabled:opacity-50"
            >
                {status === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
      )}
    </div>
  );
};
