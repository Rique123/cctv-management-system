import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Technician, Installation, ServiceRequest } from '../../types';
import { StorageService } from '../../services/storage';
import { Modal } from '../common/Modal';
import { 
  UserCog, 
  UserPlus, 
  Search, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Star, 
  ShieldCheck, 
  Wrench, 
  Edit3, 
  MessageCircle, 
  Award, 
  Briefcase,
  ChevronRight,
  Plus
} from 'lucide-react';

const COMMON_SPECIALIZATIONS = [
  'IP Camera Systems',
  'Solar CCTV Systems',
  'PTZ Auto-Tracking',
  'NVR & Storage RAID',
  'Fiber Optic Splicing',
  'Wi-Fi Bridges & 4G',
  'Structured Cabling',
  'Access Control'
];

export const TechnicianManagementView: React.FC = () => {
  const { technicians, installations, serviceRequests, refreshData, showToast, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Technician>>({
    name: '',
    phone: '',
    email: '',
    nationalId: '',
    specialization: ['IP Camera Systems', 'NVR & Storage RAID'],
    status: 'Available',
    rating: 4.8
  });

  const filteredTechnicians = technicians.filter(tech => {
    const matchesSearch = 
      tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.phone.includes(searchQuery) ||
      tech.nationalId.includes(searchQuery) ||
      tech.specialization.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || tech.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      name: '',
      phone: '',
      email: '',
      nationalId: '',
      specialization: ['IP Camera Systems', 'NVR & Storage RAID'],
      status: 'Available',
      rating: 4.8
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (tech: Technician, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsEditing(true);
    setSelectedTech(tech);
    setFormData({
      ...tech
    });
    setIsFormModalOpen(true);
  };

  const toggleSpecialization = (spec: string) => {
    const current = formData.specialization || [];
    if (current.includes(spec)) {
      if (current.length > 1) {
        setFormData({ ...formData, specialization: current.filter(s => s !== spec) });
      }
    } else {
      setFormData({ ...formData, specialization: [...current, spec] });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.phone?.trim() || !formData.nationalId?.trim()) {
      showToast('Please provide technician name, phone number, and National ID', 'error');
      return;
    }

    if (isEditing && selectedTech) {
      const updated: Technician = {
        ...selectedTech,
        ...formData as Technician,
        id: selectedTech.id
      };
      StorageService.saveTechnician(updated, false);
      showToast(`Updated technician ${updated.name}`, 'success');
    } else {
      const newTech: Technician = {
        id: 'tech-' + Date.now(),
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email?.trim() || '',
        nationalId: formData.nationalId.trim(),
        specialization: formData.specialization || ['IP Camera Systems'],
        status: (formData.status as Technician['status']) || 'Available',
        activeJobsCount: 0,
        completedJobsCount: 0,
        rating: 5.0,
        joinDate: new Date().toISOString().substring(0, 10)
      };
      StorageService.saveTechnician(newTech, true);
      showToast(`Added technician ${newTech.name}`, 'success');
    }

    refreshData();
    setIsFormModalOpen(false);
  };

  // Lookups for jobs
  const getTechInstallations = (techId: string) => {
    return installations.filter(i => i.technicianId === techId);
  };

  const getTechServiceTickets = (techId: string) => {
    return serviceRequests.filter(s => s.technicianId === techId);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCog className="h-6 w-6 text-blue-600" />
            Technician Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Dispatch engineers, track field assignments, certifications, completed projects, and customer satisfaction ratings
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-blue-500 transition-all hover:scale-[1.02]"
        >
          <UserPlus className="h-4 w-4" />
          Add Technician
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search technician name, phone, National ID or specialty..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="All">All Availability ({technicians.length})</option>
            <option value="Available">Available</option>
            <option value="On Site">On Site</option>
            <option value="Off Duty">Off Duty</option>
          </select>
        </div>
      </div>

      {/* Technicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredTechnicians.map(tech => {
          const techInstalls = getTechInstallations(tech.id);
          const techTickets = getTechServiceTickets(tech.id);
          const activeInstalls = techInstalls.filter(i => i.status !== 'Completed').length;
          const activeTickets = techTickets.filter(s => s.status !== 'Completed').length;
          const completedTotal = techInstalls.filter(i => i.status === 'Completed').length + techTickets.filter(s => s.status === 'Completed').length;

          return (
            <div
              key={tech.id}
              onClick={() => {
                setSelectedTech(tech);
                setIsDetailModalOpen(true);
              }}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-500 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
            >
              <div>
                {/* Status and Edit */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    tech.status === 'Available'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400'
                      : tech.status === 'On Site'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-400'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                      tech.status === 'Available' ? 'bg-emerald-500 animate-pulse' : tech.status === 'On Site' ? 'bg-blue-500' : 'bg-slate-400'
                    }`} />
                    {tech.status}
                  </span>

                  <button
                    onClick={(e) => openEditModal(tech, e)}
                    className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-80 group-hover:opacity-100"
                    title="Edit Technician"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>

                {/* Avatar & Name */}
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-500 text-white font-extrabold text-base shadow-md">
                    {tech.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tech.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">ID: {tech.nationalId}</p>
                  </div>
                </div>

                {/* Contact information */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {tech.phone}
                    </span>
                    <a
                      href={`https://wa.me/254${tech.phone.replace(/^0/, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-emerald-600 hover:underline text-[10px] flex items-center gap-1 font-semibold"
                    >
                      <MessageCircle className="h-3 w-3" /> WhatsApp
                    </a>
                  </div>
                </div>

                {/* Specializations tags */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {tech.specialization.slice(0, 3).map(spec => (
                    <span key={spec} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Active Tasks</span>
                  <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                    {activeInstalls + activeTickets}
                  </span>
                </div>

                <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Completed Jobs</span>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                    {tech.completedJobsCount + completedTotal}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Technician Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={isEditing ? 'Edit Technician Profile' : 'Register New CCTV Technician'}
        subtitle="Manage engineer skills, Kenyan National ID, phone, and dispatch status."
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Technician Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Kennedy Omondi, Dennis Kiprono"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Phone Number (Kenyan Format) *
              </label>
              <input
                type="text"
                required
                placeholder="0712345678"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                National ID Number *
              </label>
              <input
                type="text"
                required
                placeholder="32456789"
                value={formData.nationalId}
                onChange={e => setFormData({ ...formData, nationalId: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="tech@rique.co.ke"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Duty Availability Status
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as Technician['status'] })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="Available">Available for Dispatch</option>
                <option value="On Site">On Site on Active Project</option>
                <option value="Off Duty">Off Duty / On Leave</option>
              </select>
            </div>
          </div>

          {/* Specialization Tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Skills & Technical Specializations
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SPECIALIZATIONS.map(spec => {
                const isSelected = formData.specialization?.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleSpecialization(spec)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {spec}
                  </button>
                );
              })}
            </div>
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
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-500 shadow-md transition-colors"
            >
              {isEditing ? 'Save Technician Updates' : 'Add Technician'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Technician Detailed Assigned Jobs Modal */}
      {selectedTech && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Technician Profile: ${selectedTech.name}`}
          subtitle={`National ID: ${selectedTech.nationalId} • Joined: ${selectedTech.joinDate}`}
          maxWidth="3xl"
        >
          <div className="space-y-6">
            {/* Quick stats and contact */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750">
                <span className="text-[10px] uppercase font-bold text-slate-400">Current Status</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{selectedTech.status}</p>
                <div className="mt-2 flex items-center gap-2">
                  <a
                    href={`tel:${selectedTech.phone}`}
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Phone className="h-3 w-3" /> {selectedTech.phone}
                  </a>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750">
                <span className="text-[10px] uppercase font-bold text-slate-400">Customer Rating</span>
                <div className="mt-1 flex items-center gap-1.5 text-amber-500 font-extrabold text-base">
                  <Star className="h-4 w-4 fill-current" />
                  <span>{selectedTech.rating} / 5.0</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Excellent client feedback</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Career Jobs</span>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  {selectedTech.completedJobsCount} Projects Done
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Reliable CCTV field experience</p>
              </div>
            </div>

            {/* Assigned Installations */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                Assigned Installations ({getTechInstallations(selectedTech.id).length})
              </h4>

              {getTechInstallations(selectedTech.id).length === 0 ? (
                <p className="text-xs text-slate-400 italic">No installation projects assigned.</p>
              ) : (
                <div className="space-y-2">
                  {getTechInstallations(selectedTech.id).map(inst => (
                    <div
                      key={inst.id}
                      className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{inst.customerName}</span>
                        <p className="text-slate-500 text-[11px]">{inst.installationLocation} • {inst.numberOfCameras} Cameras</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inst.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {inst.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assigned Maintenance Jobs */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                <Wrench className="h-4 w-4 text-amber-600" />
                Assigned Service & Maintenance Jobs ({getTechServiceTickets(selectedTech.id).length})
              </h4>

              {getTechServiceTickets(selectedTech.id).length === 0 ? (
                <p className="text-xs text-slate-400 italic">No active maintenance tickets assigned.</p>
              ) : (
                <div className="space-y-2">
                  {getTechServiceTickets(selectedTech.id).map(ticket => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{ticket.ticketNumber}: {ticket.issueType}</span>
                        <p className="text-slate-500 text-[11px]">{ticket.customerName} • {ticket.location}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ticket.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
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
