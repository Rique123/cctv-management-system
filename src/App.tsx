/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthModal } from './components/auth/AuthModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { CustomerManagementView } from './components/customers/CustomerManagementView';
import { InstallationManagementView } from './components/installations/InstallationManagementView';
import { EquipmentManagementView } from './components/equipment/EquipmentManagementView';
import { MaintenanceServiceView } from './components/service/MaintenanceServiceView';
import { TechnicianManagementView } from './components/technicians/TechnicianManagementView';
import { QuotationManagementView } from './components/quotations/QuotationManagementView';
import { InventoryManagementView } from './components/inventory/InventoryManagementView';
import { ReportsView } from './components/reports/ReportsView';
import { LiveCameraMonitorView } from './components/livecam/LiveCameraMonitorView';

import { ShieldCheck, UserCheck, ArrowRight } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentTab, currentUser, users, switchUser } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <Navbar />

      <div className="flex">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-hidden">
          {/* Active Role Notice Banner if logged in as Technician */}
          {currentUser.role === 'technician' && (
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2.5">
                <UserCheck className="h-5 w-5 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold">Technician Mode Active: </span>
                  <span>
                    You are logged in as {currentUser.name}. Field technician view optimized for task resolution and job updates.
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  const adminUser = users.find(u => u.role === 'admin');
                  if (adminUser) switchUser(adminUser);
                }}
                className="self-start sm:self-auto flex items-center gap-1 font-bold text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200 hover:underline shrink-0"
              >
                Switch to Admin Mode <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Active View Router */}
          {currentTab === 'dashboard' && <DashboardView />}
          {currentTab === 'customers' && <CustomerManagementView />}
          {currentTab === 'installations' && <InstallationManagementView />}
          {currentTab === 'equipment' && <EquipmentManagementView />}
          {currentTab === 'service' && <MaintenanceServiceView />}
          {currentTab === 'technicians' && <TechnicianManagementView />}
          {currentTab === 'quotations' && <QuotationManagementView />}
          {currentTab === 'inventory' && <InventoryManagementView />}
          {currentTab === 'reports' && <ReportsView />}
          {currentTab === 'livecam' && <LiveCameraMonitorView />}
        </main>
      </div>

      {/* Auth Modal & Feedback Toasts */}
      <AuthModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
