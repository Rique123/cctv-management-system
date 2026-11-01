import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Phone, 
  Sun, 
  Moon, 
  Menu, 
  UserCircle, 
  ChevronDown, 
  Radio, 
  RotateCcw,
  LogOut,
  ExternalLink,
  MessageCircle
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    isDarkMode, 
    toggleDarkMode, 
    setMobileMenuOpen, 
    currentUser, 
    switchUser, 
    users, 
    logout,
    resetAllData
  } = useApp();

  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
      {/* Left Brand info & Mobile Hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 text-white shadow-md shadow-blue-500/25">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-base sm:text-lg">
                Rique Deliveries & CCTV Solutions
              </span>
              <span className="hidden xl:inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                SYSTEM ONLINE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Professional CCTV Installation • Maintenance • Solar Automation
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Contact Hotline: 0792093927 */}
        <div className="hidden lg:flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
          <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <div className="text-left leading-tight">
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block">Support Hotline</span>
            <a 
              href="tel:0792093927" 
              className="text-xs font-bold text-slate-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 transition-colors"
            >
              0792093927
            </a>
          </div>
          <a
            href="https://wa.me/254792093927"
            target="_blank"
            rel="noopener noreferrer"
            title="Chat on WhatsApp"
            className="ml-1 rounded-md bg-emerald-600 p-1 text-white hover:bg-emerald-500 transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-700" />}
        </button>

        {/* User Account Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 pr-2.5 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 transition-colors"
          >
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              className="h-7 w-7 rounded-lg object-cover"
            />
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                {currentUser.name.split(' ')[0]}
              </p>
              <span className={`inline-block text-[10px] font-bold uppercase tracking-wider ${
                currentUser.role === 'admin' 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-amber-600 dark:text-amber-400'
              }`}>
                {currentUser.role}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {userDropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-40"
              onClick={() => setUserDropdownOpen(false)}
            >
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{currentUser.email}</p>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    currentUser.role === 'admin'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {currentUser.role === 'admin' ? 'Administrator (Full Access)' : 'Field Technician'}
                  </span>
                </div>
              </div>

              <div className="py-1">
                <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Active Role:
                </p>
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => switchUser(u)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      u.id === currentUser.id 
                        ? 'bg-blue-50 text-blue-700 font-semibold dark:bg-blue-950/60 dark:text-blue-300' 
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{u.name}</span>
                    <span className="text-[10px] opacity-75 capitalize">({u.role})</span>
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
                <button
                  onClick={resetAllData}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-600 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Sample Data
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign In with Another Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
