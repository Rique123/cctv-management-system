import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { jsPDF } from 'jspdf';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  Wrench, 
  UserCheck, 
  Boxes, 
  FileSpreadsheet, 
  Users, 
  TrendingUp,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { quotations, installations, serviceRequests, technicians, equipment, customers, showToast } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<'sales' | 'installations' | 'maintenance' | 'technicians' | 'inventory'>('sales');

  // Sales totals
  const totalSalesRevenue = quotations.reduce((acc, q) => acc + q.totalAmount, 0);
  const totalCollected = quotations.reduce((acc, q) => acc + q.amountPaid, 0);
  const totalOutstanding = quotations.reduce((acc, q) => acc + q.balance, 0);

  // Maintenance statistics
  const completedServices = serviceRequests.filter(s => s.status === 'Completed').length;
  const pendingServices = serviceRequests.filter(s => s.status !== 'Completed' && s.status !== 'Cancelled').length;
  const totalRepairRevenue = serviceRequests.reduce((acc, s) => acc + s.totalCost, 0);

  // Low stock inventory
  const lowStockItems = equipment.filter(e => e.quantity <= e.minStockThreshold);

  // CSV Export functions
  const exportSalesCsv = () => {
    const headers = ['Quote Number', 'Customer', 'Phone', 'Location', 'Date', 'Total (KSh)', 'Paid (KSh)', 'Balance (KSh)', 'Status'];
    const rows = quotations.map(q => [
      q.quoteNumber,
      `"${q.customerName.replace(/"/g, '""')}"`,
      q.customerPhone,
      `"${q.customerLocation.replace(/"/g, '""')}"`,
      q.date,
      q.totalAmount,
      q.amountPaid,
      q.balance,
      q.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rique_CCTV_Sales_Report_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Sales CSV exported successfully', 'success');
  };

  const exportInstallationsCsv = () => {
    const headers = ['Client', 'Phone', 'Location', 'Date', 'Cameras Installed', 'DVR/NVR', 'Hard Disk', 'Technician', 'Status', 'Contract Value (KSh)'];
    const rows = installations.map(i => [
      `"${i.customerName.replace(/"/g, '""')}"`,
      i.customerPhone,
      `"${i.installationLocation.replace(/"/g, '""')}"`,
      i.installationDate,
      i.numberOfCameras,
      `"${i.dvrNvrDetails.replace(/"/g, '""')}"`,
      `"${i.hardDiskDetails.replace(/"/g, '""')}"`,
      `"${i.technicianName.replace(/"/g, '""')}"`,
      i.status,
      i.contractValue || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rique_CCTV_Installations_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Installations CSV exported successfully', 'success');
  };

  // PDF Executive Summary Download
  const downloadSummaryPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    // Header banner
    doc.setFillColor(15, 23, 42);
    doc.rect(14, y, pageWidth - 28, 26, 'F');
    doc.setFillColor(37, 99, 235);
    doc.rect(14, y + 24, pageWidth - 28, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('RIQUE DELIVERIES & CCTV SOLUTIONS', 20, y + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225);
    doc.text('EXECUTIVE CCTV OPERATIONS & FINANCIAL REPORT | PHONE: 0792093927', 20, y + 17);

    y += 36;

    // Report Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('CCTV BUSINESS METRICS & PERFORMANCE AUDIT', 14, y);
    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleString()} | Currency: Kenyan Shillings (KSh)`, 14, y);

    y += 10;

    // KPI Summary Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, pageWidth - 28, 38, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('KEY BUSINESS INDICATORS:', 18, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`• Total Registered Clients: ${customers.length}`, 18, y + 16);
    doc.text(`• Total CCTV Installations: ${installations.length}`, 18, y + 23);
    doc.text(`• Total Active Cameras Tracked: ${installations.reduce((sum, i) => sum + i.numberOfCameras, 0)}`, 18, y + 30);

    const rx = pageWidth / 2 + 10;
    doc.text(`• Total Quoted Sales: KSh ${totalSalesRevenue.toLocaleString('en-KE')}`, rx, y + 16);
    doc.text(`• Collected Revenue: KSh ${totalCollected.toLocaleString('en-KE')}`, rx, y + 23);
    doc.text(`• Outstanding Client Balance: KSh ${totalOutstanding.toLocaleString('en-KE')}`, rx, y + 30);

    y += 48;

    // Installation Section Table
    doc.setFillColor(30, 41, 59);
    doc.rect(14, y, pageWidth - 28, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('Client Premises', 18, y + 5);
    doc.text('Site Location', 75, y + 5);
    doc.text('Cameras', 125, y + 5);
    doc.text('Assigned Technician', 145, y + 5);
    doc.text('Status', 180, y + 5);

    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);

    installations.slice(0, 8).forEach((inst, index) => {
      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, pageWidth - 28, 7, 'F');
      }
      doc.text(inst.customerName.substring(0, 28), 18, y + 5);
      doc.text(inst.installationLocation.substring(0, 26), 75, y + 5);
      doc.text(String(inst.numberOfCameras), 130, y + 5);
      doc.text(inst.technicianName.substring(0, 18), 145, y + 5);
      doc.text(inst.status, 180, y + 5);
      y += 7;
    });

    y += 10;

    // Maintenance & Technical
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('MAINTENANCE & RESOLUTION RATES:', 14, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Total Service Tickets: ${serviceRequests.length} | Completed: ${completedServices} | Pending Action: ${pendingServices}`, 14, y);
    y += 4;
    doc.text(`Total Maintenance Billing Revenue: KSh ${totalRepairRevenue.toLocaleString('en-KE')}`, 14, y);

    y += 15;

    // Stamp & Sign
    doc.setFont('helvetica', 'bold');
    doc.text('Managing Director / Operations Lead:', 14, y);
    doc.text('Technical Director:', pageWidth / 2 + 10, y);
    y += 12;
    doc.setFont('helvetica', 'normal');
    doc.text('Sign: ____________________', 14, y);
    doc.text('Sign: ____________________', pageWidth / 2 + 10, y);

    doc.save(`Rique_CCTV_Executive_Report_${new Date().toISOString().substring(0, 10)}.pdf`);
    showToast('Executive PDF report downloaded', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Export Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Reports & Business Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Generate and export daily/monthly sales reports, installation summaries, technician scores, and stock audits
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportSalesCsv}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-xs"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            Export Sales CSV
          </button>

          <button
            onClick={exportInstallationsCsv}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-xs"
          >
            <Download className="h-4 w-4 text-blue-600" />
            Export Sites CSV
          </button>

          <button
            onClick={downloadSummaryPdf}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 shadow-md transition-all hover:scale-[1.02]"
          >
            <Printer className="h-4 w-4" />
            Print / PDF Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveReportTab('sales')}
          className={`rounded-lg px-4 py-2 shrink-0 transition-all ${
            activeReportTab === 'sales'
              ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          Daily & Monthly Sales
        </button>
        <button
          onClick={() => setActiveReportTab('installations')}
          className={`rounded-lg px-4 py-2 shrink-0 transition-all ${
            activeReportTab === 'installations'
              ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          Installation History
        </button>
        <button
          onClick={() => setActiveReportTab('maintenance')}
          className={`rounded-lg px-4 py-2 shrink-0 transition-all ${
            activeReportTab === 'maintenance'
              ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          Maintenance & Service Jobs
        </button>
        <button
          onClick={() => setActiveReportTab('technicians')}
          className={`rounded-lg px-4 py-2 shrink-0 transition-all ${
            activeReportTab === 'technicians'
              ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          Technician Performance
        </button>
        <button
          onClick={() => setActiveReportTab('inventory')}
          className={`rounded-lg px-4 py-2 shrink-0 transition-all ${
            activeReportTab === 'inventory'
              ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          Inventory & Low Stock Audit
        </button>
      </div>

      {/* Tab 1: Sales & Revenue Breakdown */}
      {activeReportTab === 'sales' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Quoted Value</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                KSh {totalSalesRevenue.toLocaleString()}
              </p>
              <span className="text-[11px] text-slate-500">{quotations.length} total proposals</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Total Collected Cash</span>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                KSh {totalCollected.toLocaleString()}
              </p>
              <span className="text-[11px] text-emerald-600/80">Received via M-Pesa & Bank</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">Outstanding Receivable</span>
              <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                KSh {totalOutstanding.toLocaleString()}
              </p>
              <span className="text-[11px] text-rose-600/80">Pending customer balance</span>
            </div>
          </div>

          {/* Quotations Sales Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">All Quotations & Financial Transactions</h3>
              <span className="text-xs text-slate-400 font-mono">Currency: KSh</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 font-bold uppercase text-slate-400 text-[10px]">
                    <th className="py-2.5 px-4">Ref #</th>
                    <th className="py-2.5 px-4">Customer & Location</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Total Amount</th>
                    <th className="py-2.5 px-4">Amount Paid</th>
                    <th className="py-2.5 px-4">Balance</th>
                    <th className="py-2.5 px-4">Payment Method</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {quotations.map(q => (
                    <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{q.quoteNumber}</td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">{q.customerName}</p>
                        <p className="text-[10px] text-slate-500">{q.customerLocation}</p>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono">{q.date}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">KSh {q.totalAmount.toLocaleString()}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400">KSh {q.amountPaid.toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold text-rose-600 dark:text-rose-400">KSh {q.balance.toLocaleString()}</td>
                      <td className="py-3 px-4">{q.paymentMethod || 'M-Pesa'}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          q.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {q.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Installation History */}
      {activeReportTab === 'installations' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Installation Completion & Site Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Total of {installations.length} project sites covering {installations.reduce((sum, i) => sum + i.numberOfCameras, 0)} installed CCTV cameras across Kenya.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 font-bold uppercase text-slate-400 text-[10px]">
                    <th className="py-2.5 px-4">Customer</th>
                    <th className="py-2.5 px-4">Site Location</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Cameras</th>
                    <th className="py-2.5 px-4">DVR / Storage</th>
                    <th className="py-2.5 px-4">Lead Technician</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {installations.map(inst => (
                    <tr key={inst.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{inst.customerName}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{inst.installationLocation}</td>
                      <td className="py-3 px-4 font-mono">{inst.installationDate}</td>
                      <td className="py-3 px-4 font-bold">{inst.numberOfCameras} Units</td>
                      <td className="py-3 px-4 truncate max-w-xs">{inst.dvrNvrDetails}</td>
                      <td className="py-3 px-4">{inst.technicianName}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
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
      )}

      {/* Tab 3: Maintenance Report */}
      {activeReportTab === 'maintenance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-semibold uppercase text-slate-400">Total Reported Issues</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{serviceRequests.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-semibold uppercase text-emerald-600">Successfully Resolved</span>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">{completedServices}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-semibold uppercase text-amber-600">Pending Resolution</span>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">{pendingServices}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 font-bold uppercase text-slate-400 text-[10px]">
                    <th className="py-2.5 px-4">Ticket</th>
                    <th className="py-2.5 px-4">Customer</th>
                    <th className="py-2.5 px-4">Issue Type</th>
                    <th className="py-2.5 px-4">Technician</th>
                    <th className="py-2.5 px-4">Parts Cost</th>
                    <th className="py-2.5 px-4">Labor Cost</th>
                    <th className="py-2.5 px-4">Total Cost</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {serviceRequests.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-mono font-bold text-amber-600">{ticket.ticketNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{ticket.customerName}</td>
                      <td className="py-3 px-4">{ticket.issueType}</td>
                      <td className="py-3 px-4">{ticket.technicianName || 'Unassigned'}</td>
                      <td className="py-3 px-4">KSh {ticket.partsCost.toLocaleString()}</td>
                      <td className="py-3 px-4">KSh {ticket.laborCost.toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold text-blue-600">KSh {ticket.totalCost.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ticket.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {ticket.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Technician Performance */}
      {activeReportTab === 'technicians' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {technicians.map(t => {
            const assignedInstalls = installations.filter(i => i.technicianId === t.id).length;
            const assignedTickets = serviceRequests.filter(s => s.technicianId === t.id).length;

            return (
              <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <h4 className="font-bold text-base text-slate-900 dark:text-white">{t.name}</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{t.phone} • ID: {t.nationalId}</p>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-bold text-emerald-600">{t.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigned Projects:</span>
                    <span className="font-bold">{assignedInstalls} installations</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service Calls:</span>
                    <span className="font-bold">{assignedTickets} tickets</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer Rating:</span>
                    <span className="font-bold text-amber-500">★ {t.rating} / 5.0</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Career Completed:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{t.completedJobsCount} jobs</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 5: Inventory & Low Stock Audit */}
      {activeReportTab === 'inventory' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
              Low-Stock Warning & Replenishment Reorder Audit
            </h3>
            <p className="text-xs text-slate-500">
              The following CCTV items have dropped to or below the minimum stock threshold and require replenishment.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 font-bold uppercase text-slate-400 text-[10px]">
                    <th className="py-2.5 px-4">Item Name</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">Model & Serial</th>
                    <th className="py-2.5 px-4">Current Stock</th>
                    <th className="py-2.5 px-4">Min Threshold</th>
                    <th className="py-2.5 px-4">Unit Purchase Price</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {equipment.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{item.name}</td>
                      <td className="py-3 px-4">{item.category}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{item.model}</td>
                      <td className="py-3 px-4 font-extrabold text-sm">{item.quantity}</td>
                      <td className="py-3 px-4 font-bold text-slate-500">{item.minStockThreshold}</td>
                      <td className="py-3 px-4">KSh {item.purchasePrice.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.quantity <= item.minStockThreshold
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
