import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatsCard } from '../common/StatsCard';
import { StorageService } from '../../services/storage';
import { 
  Users, 
  ShieldCheck, 
  Cctv, 
  AlertTriangle, 
  Wrench, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  PlusCircle, 
  Video, 
  FileText,
  PhoneCall,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    customers, 
    installations, 
    serviceRequests, 
    quotations, 
    setCurrentTab, 
    activities,
    equipment
  } = useApp();

  const stats = StorageService.getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-400/30">
                <Sparkles className="h-3.5 w-3.5" /> CCTV Operations Hub
              </span>
              <span className="text-xs text-slate-300 font-mono">
                Currency: KSh (Kenyan Shilling)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Rique Deliveries & CCTV Solutions
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time surveillance monitoring, technician dispatch, client installations, automated inventory stock, and instant quotation generator.
            </p>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCurrentTab('installations')}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition-all hover:scale-[1.02]"
            >
              <PlusCircle className="h-4 w-4" />
              New Installation
            </button>
            <button
              onClick={() => setCurrentTab('quotations')}
              className="flex items-center gap-2 rounded-xl bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-white border border-slate-700 hover:bg-slate-700 transition-all"
            >
              <FileText className="h-4 w-4" />
              Create Quotation
            </button>
            <button
              onClick={() => setCurrentTab('service')}
              className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-amber-500 transition-all"
            >
              <Wrench className="h-4 w-4" />
              Log Service Ticket
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute right-1/3 -top-10 h-48 w-48 rounded-full bg-indigo-500/15 blur-2xl" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatsCard
          title="Total Customers"
          value={stats.totalCustomers}
          subtitle="Registered accounts"
          icon={<Users className="h-6 w-6" />}
          color="blue"
          onClick={() => setCurrentTab('customers')}
        />

        <StatsCard
          title="Installations"
          value={stats.totalInstallations}
          subtitle="Active client sites"
          icon={<ShieldCheck className="h-6 w-6" />}
          color="indigo"
          onClick={() => setCurrentTab('installations')}
        />

        <StatsCard
          title="Active Cameras"
          value={stats.activeCameras}
          subtitle={`Across ${stats.totalInstallations} sites`}
          icon={<Cctv className="h-6 w-6" />}
          color="emerald"
          onClick={() => setCurrentTab('livecam')}
        />

        <StatsCard
          title="Under Maintenance"
          value={stats.camerasUnderMaintenance}
          subtitle={stats.camerasUnderMaintenance > 0 ? "Requires technician" : "All healthy"}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="amber"
          onClick={() => setCurrentTab('service')}
        />

        <StatsCard
          title="Pending Tickets"
          value={stats.pendingServices}
          subtitle="Support requests"
          icon={<Wrench className="h-6 w-6" />}
          color="rose"
          onClick={() => setCurrentTab('service')}
        />

        <StatsCard
          title="Total Sales / Revenue"
          value={`KSh ${(stats.totalRevenueCollected / 1000).toFixed(0)}k`}
          subtitle={`Total: KSh ${stats.totalSales.toLocaleString()}`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="purple"
          onClick={() => setCurrentTab('quotations')}
        />
      </div>

      {/* Detailed Overview: Financial & Camera Network Health */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Financial & Installation Summary */}
        <div className="space-y-6 lg:col-span-2">
          {/* Revenue Breakdown Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  Financial & Sales Performance (KSh)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Quotations value, verified collections and pending balances
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('quotations')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 self-start sm:self-auto"
              >
                View Quotations <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Quoted Value
                </span>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  KSh {stats.totalSales.toLocaleString()}
                </p>
                <span className="text-[11px] text-slate-400">All saved proposals</span>
              </div>

              <div className="rounded-xl bg-emerald-50/70 p-4 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Collected Revenue
                </span>
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                  KSh {stats.totalRevenueCollected.toLocaleString()}
                </p>
                <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/70">M-Pesa, Cash & Bank</span>
              </div>

              <div className="rounded-xl bg-rose-50/70 p-4 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50">
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  Outstanding Balance
                </span>
                <p className="text-xl font-bold text-rose-700 dark:text-rose-300 mt-1">
                  KSh {stats.totalOutstandingBalance.toLocaleString()}
                </p>
                <span className="text-[11px] text-rose-600/80 dark:text-rose-400/70">Pending customer balance</span>
              </div>
            </div>

            {/* Progress Bar of Collected vs Outstanding */}
            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                <span>Payment Recovery Ratio</span>
                <span>
                  {stats.totalSales > 0 
                    ? Math.round((stats.totalRevenueCollected / stats.totalSales) * 100)
                    : 0}% Collected
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${stats.totalSales > 0 ? (stats.totalRevenueCollected / stats.totalSales) * 100 : 0}%` }}
                />
                <div 
                  className="bg-rose-400 h-full transition-all duration-500"
                  style={{ width: `${stats.totalSales > 0 ? (stats.totalOutstandingBalance / stats.totalSales) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Active Installations Summary Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                  Recent CCTV Installations
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Site status, camera counts, and technician assignments
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('installations')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
              >
                All Installations ({installations.length})
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Client & Location</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Cameras</th>
                    <th className="py-2.5 px-3">Technician</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {installations.slice(0, 4).map(inst => (
                    <tr key={inst.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900 dark:text-white">{inst.customerName}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">{inst.installationLocation}</p>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">{inst.installationDate}</td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-semibold">{inst.numberOfCameras}</span> Cameras
                        <span className="block text-[10px] text-slate-400">{inst.cameraTypes.join(', ')}</span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-medium">{inst.technicianName}</span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inst.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400'
                            : inst.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400'
                        }`}>
                          {inst.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Camera Health Status & Recent Activities */}
        <div className="space-y-6">
          {/* Camera Health Monitor Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="h-5 w-5 text-indigo-600" />
                Camera Network Status
              </h3>
              <button
                onClick={() => setCurrentTab('livecam')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Live Feeds
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Active Cameras</span>
                </div>
                <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                  {stats.activeCameras}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-3 w-3 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200">Under Maintenance</span>
                </div>
                <span className="text-sm font-extrabold text-amber-700 dark:text-amber-400">
                  {stats.camerasUnderMaintenance}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-3 w-3 rounded-full bg-rose-500" />
                  <span className="text-xs font-bold text-rose-900 dark:text-rose-200">Offline / No Signal</span>
                </div>
                <span className="text-sm font-extrabold text-rose-700 dark:text-rose-400">
                  {stats.offlineCameras}
                </span>
              </div>
            </div>

            {/* Quick Live Preview button */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setCurrentTab('livecam')}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors shadow-xs"
              >
                <Video className="h-4 w-4 text-emerald-400" />
                Launch Multi-Cam Live Matrix
              </button>
            </div>
          </div>

          {/* Recent Activities Log */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Recent System Activities
              </h3>
              <span className="text-[11px] text-slate-400">Real-time log</span>
            </div>

            <div className="mt-4 space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {activities.slice(0, 7).map(act => (
                <div key={act.id} className="flex items-start gap-3 text-xs pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-[10px]">
                    {act.category[0]}
                  </div>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {act.action}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {act.timestamp.split(' ')[1] || act.timestamp}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 line-clamp-2">
                      {act.details}
                    </p>
                    <span className="text-[10px] text-slate-400">By: {act.user}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
