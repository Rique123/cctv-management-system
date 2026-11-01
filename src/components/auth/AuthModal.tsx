import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { ShieldCheck, Lock, Mail, UserCheck, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, users, switchUser, showToast, currentUser } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const foundUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!foundUser) {
      setErrorMsg('No account found with this email address.');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }

    // Login success
    switchUser(foundUser);
    setIsAuthModalOpen(false);
    setEmail('');
    setPassword('');
  };

  const fillDemoAccount = (role: 'admin' | 'technician') => {
    if (role === 'admin') {
      setEmail('admin@rique.co.ke');
      setPassword('admin123');
    } else {
      setEmail('kennedy@rique.co.ke');
      setPassword('tech123');
    }
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={() => setIsAuthModalOpen(false)}
      title="Rique CCTV - Account Login"
      subtitle="Role-based security access for Administrators and Field Technicians"
      maxWidth="md"
    >
      <div className="space-y-4">
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Demo Fast Login Buttons */}
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Instant Demo Account Access:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('admin')}
              className="flex items-center justify-between p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-950/60 dark:text-blue-300 transition-colors"
            >
              <span>Admin Profile</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('technician')}
              className="flex items-center justify-between p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold dark:bg-amber-950/60 dark:text-amber-300 transition-colors"
            >
              <span>Technician Profile</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Account Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="admin@rique.co.ke"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Secure Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-500 shadow-md transition-all hover:scale-[1.01]"
          >
            <KeyRound className="h-4 w-4" />
            Authenticate & Access Dashboard
          </button>
        </form>

        <div className="text-center pt-2 text-[11px] text-slate-400">
          Rique Deliveries & CCTV Solutions Security Gate • 256-bit Encrypted Session
        </div>
      </div>
    </Modal>
  );
};
