import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Installation, InstallationStatus, CameraType, InstalledCameraPoint } from '../../types';
import { StorageService } from '../../services/storage';
import { Modal } from '../common/Modal';
import { 
  ShieldCheck, 
  PlusCircle, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Cctv, 
  HardDrive, 
  Cpu, 
  UserCheck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Phone, 
  Edit3, 
  Trash2, 
  Radio, 
  Eye, 
  Smartphone,
  Check,
  ChevronRight
} from 'lucide-react';

const CAMERA_TYPES: CameraType[] = ['Dome', 'Bullet', 'PTZ', 'Solar', 'Wi-Fi', 'IP Camera'];
const INSTALLATION_STATUSES: InstallationStatus[] = [
  'Scheduled', 
  'In Progress', 
  'Testing & Commissioning', 
  'Completed', 
  'On Hold'
];

export const InstallationManagementView: React.FC = () => {
  const { installations, customers, technicians, refreshData, showToast, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [techFilter, setTechFilter] = useState<string>('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedInstallation, setSelectedInstallation] = useState<Installation | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Installation>>({
    customerId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    installationLocation: '',
    installationDate: new Date().toISOString().substring(0, 10),
    completionDate: '',
    numberOfCameras: 4,
    cameraTypes: ['Dome', 'Bullet'],
    dvrNvrDetails: 'Hikvision 8-Channel 4K PoE NVR',
    hardDiskDetails: 'Western Digital Purple 2TB Surveillance Hard Drive',
    technicianId: '',
    technicianName: '',
    status: 'Scheduled',
    notes: '',
    remoteViewingApp: 'Hik-Connect (Cloud P2P)',
    warrantyEndDate: new Date(Date.now() + 365 * 24 * 3600 * 1000 * 2).toISOString().substring(0, 10),
    contractValue: 50000,
    camerasList: []
  });

  const filteredInstallations = installations.filter(i => {
    const matchesSearch = 
      i.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.installationLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.dvrNvrDetails.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.technicianName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || i.status === statusFilter;
    const matchesTech = techFilter === 'All' || i.technicianId === techFilter;

    return matchesSearch && matchesStatus && matchesTech;
  });

  const openAddModal = () => {
    setIsEditing(false);
    const defaultTech = technicians[0];
    setFormData({
      customerId: customers[0]?.id || '',
      customerName: customers[0]?.name || '',
      customerPhone: customers[0]?.phone || '',
      customerEmail: customers[0]?.email || '',
      installationLocation: customers[0]?.location || '',
      installationDate: new Date().toISOString().substring(0, 10),
      completionDate: '',
      numberOfCameras: 4,
      cameraTypes: ['Dome', 'Bullet'],
      dvrNvrDetails: 'Hikvision 8-Channel 4K PoE NVR (DS-7608NI-K2/8P)',
      hardDiskDetails: 'Western Digital Purple 2TB Surveillance Hard Drive',
      technicianId: defaultTech?.id || '',
      technicianName: defaultTech?.name || 'Unassigned',
      status: 'Scheduled',
      notes: 'Initial cabling and camera mounting scheduled.',
      remoteViewingApp: 'Hik-Connect (Android/iOS)',
      warrantyEndDate: new Date(Date.now() + 365 * 24 * 3600 * 1000 * 2).toISOString().substring(0, 10),
      contractValue: 48000,
      camerasList: [
        { id: 'c1', cameraName: 'Main Entrance Door', cameraType: 'Dome', channelNumber: 1, locationName: 'Reception', status: 'Active' },
        { id: 'c2', cameraName: 'Rear Access Gate', cameraType: 'Bullet', channelNumber: 2, locationName: 'Backyard', status: 'Active' },
        { id: 'c3', cameraName: 'Parking Driveway', cameraType: 'Bullet', channelNumber: 3, locationName: 'Driveway', status: 'Active' },
        { id: 'c4', cameraName: 'Cashier / Till Point', cameraType: 'Dome', channelNumber: 4, locationName: 'Point of Sale', status: 'Active' }
      ]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (inst: Installation, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsEditing(true);
    setSelectedInstallation(inst);
    setFormData({
      ...inst
    });
    setIsModalOpen(true);
  };

  const handleCustomerSelect = (custId: string) => {
    const cust = customers.find(c => c.id === custId);
    if (cust) {
      setFormData(prev => ({
        ...prev,
        customerId: cust.id,
        customerName: cust.name,
        customerPhone: cust.phone,
        customerEmail: cust.email || '',
        installationLocation: cust.location
      }));
    }
  };

  const handleTechnicianSelect = (techId: string) => {
    const tech = technicians.find(t => t.id === techId);
    if (tech) {
      setFormData(prev => ({
        ...prev,
        technicianId: tech.id,
        technicianName: tech.name
      }));
    }
  };

  const toggleCameraType = (type: CameraType) => {
    const current = formData.cameraTypes || [];
    if (current.includes(type)) {
      if (current.length > 1) {
        setFormData({ ...formData, cameraTypes: current.filter(t => t !== type) });
      }
    } else {
      setFormData({ ...formData, cameraTypes: [...current, type] });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.installationLocation) {
      showToast('Please specify customer and location', 'error');
      return;
    }

    if (isEditing && selectedInstallation) {
      const updated: Installation = {
        ...selectedInstallation,
        ...formData as Installation,
        id: selectedInstallation.id
      };
      StorageService.saveInstallation(updated, false);
      showToast(`Updated installation for ${updated.customerName}`, 'success');
    } else {
      // Auto-generate camera points based on numberOfCameras if none created
      const cameraCount = Number(formData.numberOfCameras) || 4;
      const cameraList: InstalledCameraPoint[] = formData.camerasList && formData.camerasList.length > 0
        ? formData.camerasList
        : Array.from({ length: cameraCount }, (_, idx) => ({
            id: 'cam-' + Date.now() + '-' + idx,
            cameraName: `Camera Channel ${idx + 1}`,
            cameraType: formData.cameraTypes?.[idx % (formData.cameraTypes.length || 1)] || 'Dome',
            channelNumber: idx + 1,
            locationName: `Zone ${idx + 1}`,
            status: 'Active'
          }));

      const newInst: Installation = {
        id: 'inst-' + Date.now(),
        customerId: formData.customerId || 'cust-generic',
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone || '',
        customerEmail: formData.customerEmail || '',
        installationLocation: formData.installationLocation.trim(),
        installationDate: formData.installationDate || new Date().toISOString().substring(0, 10),
        completionDate: formData.completionDate || undefined,
        numberOfCameras: cameraCount,
        cameraTypes: formData.cameraTypes || ['Dome', 'Bullet'],
        dvrNvrDetails: formData.dvrNvrDetails || 'Hikvision 8-Ch NVR',
        hardDiskDetails: formData.hardDiskDetails || 'WD Purple 2TB HDD',
        technicianId: formData.technicianId || technicians[0]?.id || '',
        technicianName: formData.technicianName || technicians[0]?.name || 'Kennedy Omondi',
        status: (formData.status as InstallationStatus) || 'Scheduled',
        notes: formData.notes || '',
        remoteViewingApp: formData.remoteViewingApp || 'Hik-Connect',
        warrantyEndDate: formData.warrantyEndDate,
        camerasList: cameraList,
        contractValue: Number(formData.contractValue) || 45000
      };

      StorageService.saveInstallation(newInst, true);
      showToast(`Installation record added for ${newInst.customerName}`, 'success');
    }

    refreshData();
    setIsModalOpen(false);
  };

  const handleDelete = (inst: Installation, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete installation record for "${inst.customerName}"?`)) {
      StorageService.deleteInstallation(inst.id);
      refreshData();
      showToast(`Installation record deleted`, 'info');
      if (selectedInstallation?.id === inst.id) {
        setIsDetailOpen(false);
      }
    }
  };

  const toggleSingleCameraStatus = (instId: string, camId: string, currentStatus: InstalledCameraPoint['status']) => {
    const nextStatus = currentStatus === 'Active' ? 'Under Maintenance' : currentStatus === 'Under Maintenance' ? 'Offline' : 'Active';
    StorageService.updateCameraStatus(instId, camId, nextStatus);
    refreshData();
    showToast(`Camera status updated to ${nextStatus}`, 'info');

    // Update selected installation local state if modal open
    if (selectedInstallation && selectedInstallation.id === instId) {
      setSelectedInstallation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          camerasList: prev.camerasList.map(c => c.id === camId ? { ...c, status: nextStatus } : c)
        };
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
            CCTV Installation Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Track site locations, installed camera types, DVR/NVR specifications, storage, assigned technicians, and status
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-blue-500 transition-all hover:scale-[1.02]"
        >
          <PlusCircle className="h-4 w-4" />
          Record New Installation
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client, location, technician, or DVR/NVR model..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="All">All Statuses ({installations.length})</option>
            {INSTALLATION_STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={techFilter}
            onChange={e => setTechFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="All">All Technicians</option>
            {technicians.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Installations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredInstallations.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
            <ShieldCheck className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">No installations found</h3>
            <p className="mt-1 text-xs text-slate-500">No records match your search or filter.</p>
            <button
              onClick={openAddModal}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
            >
              <PlusCircle className="h-4 w-4" /> Record New Project
            </button>
          </div>
        ) : (
          filteredInstallations.map(inst => {
            const activeCamCount = inst.camerasList.filter(c => c.status === 'Active').length;
            const issueCamCount = inst.camerasList.filter(c => c.status !== 'Active').length;

            return (
              <div
                key={inst.id}
                onClick={() => {
                  setSelectedInstallation(inst);
                  setIsDetailOpen(true);
                }}
                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-500 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
              >
                <div>
                  {/* Status & Action */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      inst.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400'
                        : inst.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-400'
                        : inst.status === 'Testing & Commissioning'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400'
                    }`}>
                      {inst.status}
                    </span>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={(e) => openEditModal(inst, e)}
                        className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit Installation"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={(e) => handleDelete(inst, e)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete Installation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Customer and Location */}
                  <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {inst.customerName}
                  </h3>

                  <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{inst.installationLocation}</span>
                  </div>

                  {/* Key Hardware Specs */}
                  <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Cctv className="h-3.5 w-3.5 text-blue-600" /> Total Cameras:
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {inst.numberOfCameras} Units
                      </span>
                    </div>

                    <div className="flex items-start justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5 shrink-0">
                        <Cpu className="h-3.5 w-3.5 text-indigo-600" /> DVR/NVR:
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 text-right truncate max-w-[170px]">
                        {inst.dvrNvrDetails}
                      </span>
                    </div>

                    <div className="flex items-start justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5 shrink-0">
                        <HardDrive className="h-3.5 w-3.5 text-purple-600" /> Hard Disk:
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 text-right truncate max-w-[170px]">
                        {inst.hardDiskDetails}
                      </span>
                    </div>
                  </div>

                  {/* Camera types tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {inst.cameraTypes.map(ct => (
                      <span key={ct} className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                        {ct}
                      </span>
                    ))}
                    {inst.remoteViewingApp && (
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                        <Smartphone className="h-2.5 w-2.5" /> App Configured
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Technician & Date */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Assigned Tech</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{inst.technicianName}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Date</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">{inst.installationDate}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Installation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit CCTV Installation Details' : 'Record New CCTV Installation'}
        subtitle="Manage hardware configuration, technician dispatch, and camera allocations."
        maxWidth="3xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Select Existing Customer or Enter Name *
              </label>
              <select
                value={formData.customerId}
                onChange={e => handleCustomerSelect(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none mb-1.5"
              >
                <option value="">-- Choose Customer Profile --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.location})</option>
                ))}
              </select>
              <input
                type="text"
                required
                placeholder="Or type customer name"
                value={formData.customerName}
                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              />

              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1 mt-2">
                Contract Value (KSh)
              </label>
              <input
                type="number"
                placeholder="e.g. 85000"
                value={formData.contractValue}
                onChange={e => setFormData({ ...formData, contractValue: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Installation Site Location & Premises *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Industrial Area Enterprise Rd Block 4, Nairobi"
              value={formData.installationLocation}
              onChange={e => setFormData({ ...formData, installationLocation: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Installation Date *
              </label>
              <input
                type="date"
                required
                value={formData.installationDate}
                onChange={e => setFormData({ ...formData, installationDate: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Number of Cameras *
              </label>
              <input
                type="number"
                min="1"
                max="64"
                required
                value={formData.numberOfCameras}
                onChange={e => setFormData({ ...formData, numberOfCameras: parseInt(e.target.value) || 1 })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Project Status *
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as InstallationStatus })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              >
                {INSTALLATION_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Camera Types Multi-selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Camera Types Installed (Select all that apply) *
            </label>
            <div className="flex flex-wrap gap-2">
              {CAMERA_TYPES.map(type => {
                const isSelected = formData.cameraTypes?.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleCameraType(type)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DVR/NVR Details and Hard Disk Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                DVR / NVR Model & Channel Details *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dahua 16-Channel 4K PoE NVR (DH-NVR4216)"
                value={formData.dvrNvrDetails}
                onChange={e => setFormData({ ...formData, dvrNvrDetails: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Hard Disk Drive Details (Storage) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 2x Western Digital Purple 4TB (8TB Total RAID)"
                value={formData.hardDiskDetails}
                onChange={e => setFormData({ ...formData, hardDiskDetails: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Assigned Technician and Remote App */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Lead Technician Assigned *
              </label>
              <select
                value={formData.technicianId}
                onChange={e => handleTechnicianSelect(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              >
                {technicians.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.specialization[0]})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Remote Mobile App Configured
              </label>
              <input
                type="text"
                placeholder="e.g. Hik-Connect / DMSS / SuperLive Plus"
                value={formData.remoteViewingApp}
                onChange={e => setFormData({ ...formData, remoteViewingApp: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Installation Notes / Port Forwarding / Cloud Serial
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Router IP 192.168.1.1, NVR Static 192.168.1.200, Cloud Serial: HK982103."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-500 shadow-md transition-colors"
            >
              {isEditing ? 'Save Installation Updates' : 'Confirm & Save Installation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detailed Installation View Modal with Live Camera Point Toggle */}
      {selectedInstallation && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`CCTV Installation: ${selectedInstallation.customerName}`}
          subtitle={`Site: ${selectedInstallation.installationLocation}`}
          maxWidth="3xl"
        >
          <div className="space-y-6">
            {/* Overview info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750">
                <span className="text-[10px] uppercase font-bold text-slate-400">Status & Dates</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedInstallation.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-400'
                  }`}>
                    {selectedInstallation.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-mono">
                  Installed: {selectedInstallation.installationDate}
                </p>
                {selectedInstallation.warrantyEndDate && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    Warranty until: {selectedInstallation.warrantyEndDate}
                  </p>
                )}
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750">
                <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Technician</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {selectedInstallation.technicianName}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <Phone className="h-3 w-3 text-slate-400" />
                  <a
                    href="tel:0792093927"
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    0792093927 (Rique Dispatch)
                  </a>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750">
                <span className="text-[10px] uppercase font-bold text-slate-400">Remote Cloud Viewing</span>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {selectedInstallation.remoteViewingApp || 'Hik-Connect Cloud'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Mobile streaming enabled on Android & iOS
                </p>
              </div>
            </div>

            {/* Hardware Specification Box */}
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-750 bg-white dark:bg-slate-900 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Central Surveillance Hardware
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-start gap-2.5">
                  <Cpu className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">DVR / NVR Hub</span>
                    <span className="text-slate-500">{selectedInstallation.dvrNvrDetails}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <HardDrive className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">Surveillance Storage</span>
                    <span className="text-slate-500">{selectedInstallation.hardDiskDetails}</span>
                  </div>
                </div>
              </div>

              {selectedInstallation.notes && (
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold">Technical Notes: </span>
                  {selectedInstallation.notes}
                </div>
              )}
            </div>

            {/* Individual Installed Camera Points & Live Health Controller */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Cctv className="h-4 w-4 text-blue-600" />
                  Installed Cameras List ({selectedInstallation.camerasList.length} Channels)
                </h4>
                <span className="text-[11px] text-slate-400">Click camera badge to toggle status</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedInstallation.camerasList.map(cam => (
                  <div
                    key={cam.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800 bg-white dark:bg-slate-900"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                          Ch {cam.channelNumber}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          {cam.locationName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{cam.cameraName}</p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Type: {cam.cameraType} {cam.resolution && `• ${cam.resolution}`}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSingleCameraStatus(selectedInstallation.id, cam.id, cam.status)}
                      className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                        cam.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900'
                          : cam.status === 'Under Maintenance'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900'
                          : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-900'
                      }`}
                      title="Click to toggle status"
                    >
                      <span className={`h-2 w-2 rounded-full ${
                        cam.status === 'Active' ? 'bg-emerald-500 animate-pulse' : cam.status === 'Under Maintenance' ? 'bg-amber-500' : 'bg-rose-500'
                      }`} />
                      {cam.status}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsDetailOpen(false);
                  openEditModal(selectedInstallation);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit Hardware Details
              </button>

              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
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
