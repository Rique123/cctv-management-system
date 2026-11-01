import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceRequest, ServiceIssueType, ServicePriority, ServiceStatus } from '../../types';
import { StorageService } from '../../services/storage';
import { PdfService } from '../../services/pdfGenerator';
import { Modal } from '../common/Modal';
import { 
  Wrench, 
  AlertTriangle, 
  PlusCircle, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  FileText, 
  User, 
  DollarSign, 
  MessageSquare, 
  Download, 
  Trash2, 
  Check, 
  ArrowRight,
  ShieldAlert,
  Send
} from 'lucide-react';

const ISSUE_TYPES: ServiceIssueType[] = [
  'Camera offline',
  'DVR/NVR problems',
  'No video display',
  'Storage problems',
  'Network connection problems',
  'Camera turning on and off',
  'Power supply failure',
  'Other'
];

const PRIORITIES: ServicePriority[] = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES: ServiceStatus[] = [
  'Reported', 
  'Assigned', 
  'In Progress', 
  'Waiting for Parts', 
  'Completed', 
  'Cancelled'
];

export const MaintenanceServiceView: React.FC = () => {
  const { serviceRequests, customers, technicians, refreshData, showToast, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [issueFilter, setIssueFilter] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'tickets' | 'quick-report'>('tickets');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ServiceRequest | null>(null);

  // New Note state in details modal
  const [newNoteText, setNewNoteText] = useState('');

  // Ticket Form state
  const [formData, setFormData] = useState<Partial<ServiceRequest>>({
    customerId: '',
    customerName: '',
    customerPhone: '',
    location: '',
    issueType: 'Camera offline',
    description: '',
    priority: 'High',
    technicianId: '',
    technicianName: '',
    status: 'Reported',
    partsCost: 0,
    laborCost: 0,
    totalCost: 0
  });

  const filteredTickets = serviceRequests.filter(ticket => {
    const matchesSearch = 
      ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customerPhone.includes(searchQuery) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter;
    const matchesIssue = issueFilter === 'All' || ticket.issueType === issueFilter;

    return matchesSearch && matchesStatus && matchesIssue;
  });

  const openAddModal = () => {
    const defaultCust = customers[0];
    const defaultTech = technicians[0];
    setFormData({
      customerId: defaultCust?.id || '',
      customerName: defaultCust?.name || '',
      customerPhone: defaultCust?.phone || '0792093927',
      location: defaultCust?.location || 'Nairobi',
      issueType: 'Camera offline',
      description: '',
      priority: 'High',
      technicianId: defaultTech?.id || '',
      technicianName: defaultTech?.name || 'Unassigned',
      status: 'Reported',
      partsCost: 0,
      laborCost: 0,
      totalCost: 0
    });
    setIsFormModalOpen(true);
  };

  const handleCustomerSelect = (custId: string) => {
    const cust = customers.find(c => c.id === custId);
    if (cust) {
      setFormData(prev => ({
        ...prev,
        customerId: cust.id,
        customerName: cust.name,
        customerPhone: cust.phone,
        location: cust.location
      }));
    }
  };

  const handleTechnicianSelect = (techId: string) => {
    const tech = technicians.find(t => t.id === techId);
    if (tech) {
      setFormData(prev => ({
        ...prev,
        technicianId: tech.id,
        technicianName: tech.name,
        status: prev.status === 'Reported' ? 'Assigned' : prev.status
      }));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.description) {
      showToast('Please provide customer name and problem description', 'error');
      return;
    }

    const ticketNumber = `SR-2024-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const parts = Number(formData.partsCost) || 0;
    const labor = Number(formData.laborCost) || 0;

    const newTicket: ServiceRequest = {
      id: 'srv-' + Date.now(),
      ticketNumber,
      customerId: formData.customerId || 'cust-generic',
      customerName: formData.customerName.trim(),
      customerPhone: formData.customerPhone || '0792093927',
      location: formData.location || 'Nairobi',
      issueType: (formData.issueType as ServiceIssueType) || 'Camera offline',
      description: formData.description.trim(),
      priority: (formData.priority as ServicePriority) || 'High',
      technicianId: formData.technicianId || undefined,
      technicianName: formData.technicianName || 'Unassigned',
      status: (formData.status as ServiceStatus) || 'Reported',
      serviceNotes: [
        {
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          author: currentUser.name,
          text: `Ticket logged: ${formData.description}`
        }
      ],
      partsCost: parts,
      laborCost: labor,
      totalCost: parts + labor,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    StorageService.saveServiceRequest(newTicket, true);
    refreshData();
    showToast(`Service ticket ${ticketNumber} created successfully!`, 'success');
    setIsFormModalOpen(false);
  };

  const handleAddNote = () => {
    if (!newNoteText.trim() || !selectedTicket) return;

    const updatedNotes = [
      ...selectedTicket.serviceNotes,
      {
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        author: currentUser.name,
        text: newNoteText.trim()
      }
    ];

    const updated: ServiceRequest = {
      ...selectedTicket,
      serviceNotes: updatedNotes
    };

    StorageService.saveServiceRequest(updated, false);
    setSelectedTicket(updated);
    setNewNoteText('');
    refreshData();
    showToast('Diagnostic note added', 'success');
  };

  const handleUpdateStatus = (newStatus: ServiceStatus) => {
    if (!selectedTicket) return;
    const isCompleted = newStatus === 'Completed';

    const updated: ServiceRequest = {
      ...selectedTicket,
      status: newStatus,
      resolvedAt: isCompleted ? new Date().toISOString().replace('T', ' ').substring(0, 16) : selectedTicket.resolvedAt,
      resolutionSummary: isCompleted ? 'Service verified by technician. Camera system operational.' : selectedTicket.resolutionSummary
    };

    StorageService.saveServiceRequest(updated, false);
    setSelectedTicket(updated);
    refreshData();
    showToast(`Ticket status updated to ${newStatus}`, 'info');
  };

  const handleCostUpdate = (parts: number, labor: number) => {
    if (!selectedTicket) return;
    const updated: ServiceRequest = {
      ...selectedTicket,
      partsCost: parts,
      laborCost: labor,
      totalCost: parts + labor
    };

    StorageService.saveServiceRequest(updated, false);
    setSelectedTicket(updated);
    refreshData();
    showToast('Repair costs updated in KSh', 'success');
  };

  const handleDelete = (ticket: ServiceRequest, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ticket ${ticket.ticketNumber}?`)) {
      StorageService.deleteServiceRequest(ticket.id);
      refreshData();
      showToast(`Deleted ticket ${ticket.ticketNumber}`, 'info');
      if (selectedTicket?.id === ticket.id) {
        setIsDetailModalOpen(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="h-6 w-6 text-amber-600" />
            Maintenance & Service Requests
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Handle CCTV outages, assign technicians, track repair costs in KSh, and generate job cards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'tickets'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              All Tickets ({serviceRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('quick-report')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'quick-report'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Client Quick Portal
            </button>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-amber-500 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="h-4 w-4" />
            Log Service Ticket
          </button>
        </div>
      </div>

      {activeTab === 'quick-report' ? (
        /* Client Quick Issue Submission Portal */
        <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Rique CCTV Client Service Portal
              </h3>
              <p className="text-xs text-slate-500">
                Are you experiencing CCTV offline, storage errors, or video display failure? Report below or call 0792093927.
              </p>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Your Full Name / Business *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Logistics, John Mwangi"
                  value={formData.customerName}
                  onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="0792093927"
                  value={formData.customerPhone}
                  onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Premises Location / Site Address *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Westlands, Chiromo Road Gate 2"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Issue Encountered *
                </label>
                <select
                  value={formData.issueType}
                  onChange={e => setFormData({ ...formData, issueType: e.target.value as ServiceIssueType })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-amber-500 focus:outline-none"
                >
                  {ISSUE_TYPES.map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Urgency / Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value as ServicePriority })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-amber-500 focus:outline-none"
                >
                  {PRIORITIES.map(p => (
                    <option key={p} value={p}>{p} Priority</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Detailed Problem Description *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe what happened: e.g. Camera #3 in warehouse has black screen since morning, power adapter green light is off..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 text-sm font-bold text-white hover:bg-amber-500 shadow-md transition-all"
            >
              <Send className="h-4 w-4" />
              Submit Service Ticket to Dispatch
            </button>
          </form>
        </div>
      ) : (
        /* Regular Service Tickets Table & Filters */
        <>
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search ticket #, customer, phone, location..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs sm:text-sm text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-700 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <option value="All">All Ticket Statuses ({serviceRequests.length})</option>
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={issueFilter}
                onChange={e => setIssueFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-700 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <option value="All">All Problem Types</option>
                {ISSUE_TYPES.map(i => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Service Tickets Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTickets.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
                <Wrench className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">No service tickets found</h3>
                <p className="mt-1 text-xs text-slate-500">All CCTV installations are operating without reported issues.</p>
                <button
                  onClick={openAddModal}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white"
                >
                  <PlusCircle className="h-4 w-4" /> Log New Service Ticket
                </button>
              </div>
            ) : (
              filteredTickets.map(ticket => {
                const isUrgent = ticket.priority === 'Critical' || ticket.priority === 'High';

                return (
                  <div
                    key={ticket.id}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setIsDetailModalOpen(true);
                    }}
                    className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-amber-500 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
                  >
                    <div>
                      {/* Header with Ticket # and Status */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white">
                          {ticket.ticketNumber}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ticket.priority === 'Critical'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400'
                              : ticket.priority === 'High'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-400'
                          }`}>
                            {ticket.priority}
                          </span>

                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ticket.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400'
                              : ticket.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400'
                          }`}>
                            {ticket.status}
                          </span>
                        </div>
                      </div>

                      {/* Customer & Issue */}
                      <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {ticket.customerName}
                      </h3>

                      <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{ticket.location}</span>
                      </div>

                      {/* Issue pill */}
                      <div className="mt-2.5">
                        <span className="inline-block rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {ticket.issueType}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {ticket.description}
                      </p>
                    </div>

                    {/* Footer with Technician and Total Cost */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Assigned Tech</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {ticket.technicianName || 'Unassigned'}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Repair Cost</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          KSh {ticket.totalCost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Log Service Ticket Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title="Log CCTV Maintenance / Service Ticket"
        subtitle="Record client reported outage, assign field technician and set repair priority."
        maxWidth="2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Select Customer Profile *
              </label>
              <select
                value={formData.customerId}
                onChange={e => handleCustomerSelect(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-amber-500 focus:outline-none mb-1.5"
              >
                <option value="">-- Choose Existing Client --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input
                type="text"
                required
                placeholder="Customer Name"
                value={formData.customerName}
                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Customer Phone Number *
              </label>
              <input
                type="text"
                required
                placeholder="0792093927"
                value={formData.customerPhone}
                onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-amber-500 focus:outline-none"
              />

              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1 mt-2">
                Premises Location / Site *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kilimani Gatundu Rd"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Reported Problem Category *
              </label>
              <select
                value={formData.issueType}
                onChange={e => setFormData({ ...formData, issueType: e.target.value as ServiceIssueType })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-amber-500 focus:outline-none"
              >
                {ISSUE_TYPES.map(i => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Priority Level *
              </label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as ServicePriority })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-amber-500 focus:outline-none"
              >
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p} Priority</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Assign Field Technician
              </label>
              <select
                value={formData.technicianId}
                onChange={e => handleTechnicianSelect(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="">-- Unassigned --</option>
                {technicians.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.status})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Service Status
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as ServiceStatus })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-amber-500 focus:outline-none"
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Detailed Problem Description *
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Camera #2 in lift shaft has lost video display. NVR indicates signal disconnected."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-amber-500 shadow-md transition-colors"
            >
              Log Ticket to Dispatch
            </button>
          </div>
        </form>
      </Modal>

      {/* Ticket Details & Technician Diagnostic Action Modal */}
      {selectedTicket && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Service Ticket: ${selectedTicket.ticketNumber}`}
          subtitle={`Customer: ${selectedTicket.customerName} • Site: ${selectedTicket.location}`}
          maxWidth="3xl"
        >
          <div className="space-y-6">
            {/* Top Status & Job Card Download */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Current Status</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                    selectedTicket.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400'
                  }`}>
                    {selectedTicket.status}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Priority: {selectedTicket.priority}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => PdfService.generateServiceJobCardPdf(selectedTicket)}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors shadow-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Job Card PDF
                </button>

                {selectedTicket.status !== 'Completed' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus('Completed')}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Mark Completed
                  </button>
                )}
              </div>
            </div>

            {/* Problem Overview & Customer Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-750 bg-white dark:bg-slate-900">
                <span className="text-[10px] uppercase font-bold text-slate-400">Issue Categorization</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {selectedTicket.issueType}
                </p>
                <p className="text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {selectedTicket.description}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-750 bg-white dark:bg-slate-900">
                <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Technician</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {selectedTicket.technicianName || 'No technician assigned yet'}
                </p>
                <div className="mt-2 space-y-1 text-slate-500">
                  <p>Customer Phone: {selectedTicket.customerPhone}</p>
                  <p>Logged: {selectedTicket.createdAt}</p>
                  {selectedTicket.resolvedAt && (
                    <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Resolved: {selectedTicket.resolvedAt}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Change Status Fast Buttons */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Update Ticket Status
              </span>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleUpdateStatus(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      selectedTicket.status === st
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Repair Cost in KSh (Parts + Labor) */}
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                Repair Cost Breakdown (Kenyan Shillings)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Spare Parts Cost (KSh)</label>
                  <input
                    type="number"
                    min="0"
                    value={selectedTicket.partsCost}
                    onChange={e => handleCostUpdate(Number(e.target.value) || 0, selectedTicket.laborCost)}
                    className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Labor / Diagnostic Cost (KSh)</label>
                  <input
                    type="number"
                    min="0"
                    value={selectedTicket.laborCost}
                    onChange={e => handleCostUpdate(selectedTicket.partsCost, Number(e.target.value) || 0)}
                    className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200 dark:bg-slate-900 dark:border-slate-750 flex flex-col justify-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Total Billed Cost</span>
                  <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                    KSh {selectedTicket.totalCost.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Technician Diagnostic Notes Log */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                Technician Notes & Diagnostic Logs ({selectedTicket.serviceNotes.length})
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto rounded-xl border border-slate-200 p-3 dark:border-slate-800 bg-white dark:bg-slate-900">
                {selectedTicket.serviceNotes.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No notes logged yet.</p>
                ) : (
                  selectedTicket.serviceNotes.map((note, idx) => (
                    <div key={idx} className="rounded-lg bg-slate-50 p-2.5 text-xs dark:bg-slate-800/60">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        <span className="text-blue-600 dark:text-blue-400">{note.author}</span>
                        <span className="font-mono text-slate-400">{note.timestamp}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">{note.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Note Input */}
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Add technician service note or repair progress update..."
                  value={newNoteText}
                  onChange={e => setNewNoteText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                  className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddNote}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500"
                >
                  Add Note
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-800"
              >
                Close View
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
