import React from 'react';
import { useApp, NavTab } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Cctv, 
  Wrench, 
  UserCog, 
  FileSpreadsheet, 
  Boxes, 
  BarChart3, 
  Video, 
  X,
  PhoneCall,
  Sparkles,
  MapPin
} from 'lucide-react';

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeColor?: 'rose' | 'amber' | 'blue';
  adminOnly?: boolean;
}

export const Sidebar: React.FC = () => {
  const { 
    currentTab, 
    setCurrentTab, 
    mobileMenuOpen, 
    setMobileMenuOpen, 
    serviceRequests, 
    equipment,
    currentUser
  } = useApp();

  // Pending service tickets count
  const pendingServicesCount = serviceRequests.filter(
    s => s.status !== 'Completed' && s.status !== 'Cancelled'
  ).length;

  // Low stock inventory count
  const lowStockCount = equipment.filter(
    e => e.status === 'Low Stock' || e.status === 'Out of Stock'
  ).length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customer Management', icon: Users },
    { id: 'installations', label: 'CCTV Installations', icon: ShieldCheck },
    { id: 'equipment', label: 'Camera & Equipment', icon: Cctv },
    { 
      id: 'service', 
      label: 'Service & Maintenance', 
      icon: Wrench,
      badge: pendingServicesCount > 0 ? pendingServicesCount : undefined,
      badgeColor: 'rose'
    },
    { id: 'technicians', label: 'Technicians', icon: UserCog },
    { id: 'quotations', label: 'Sales & Quotations', icon: FileSpreadsheet },
    { 
      id: 'inventory', 
      label: 'Inventory Management', 
      icon: Boxes,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'amber'
    },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'livecam', label: 'Live Camera Feeds', icon: Video },
  ];

  const handleNavClick = (tab: NavTab) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out dark:border-slate-800 dark:bg-slate-900 md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header inside Sidebar for Mobile */}
        <div className="flex flex-col">
          <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5 dark:border-slate-800 md:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                R
              </div>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Rique CCTV Solutions
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Items List */}
          <div className="p-3">
            <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Operations Menu
            </p>
            <nav className="space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                          isActive
                            ? 'text-white'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                          isActive
                            ? 'bg-white text-blue-700'
                            : item.badgeColor === 'rose'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer with Company Branding & Hotline */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white shadow-md dark:from-slate-850 dark:to-slate-800 border border-slate-700/60">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-semibold text-slate-200">
                24/7 CCTV Rapid Response
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Rique Deliveries & CCTV Solutions
            </p>
            <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-700/60">
              <a
                href="tel:0792093927"
                className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                0792093927
              </a>
              <span className="text-[11px] text-slate-400">Nairobi, KE</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
