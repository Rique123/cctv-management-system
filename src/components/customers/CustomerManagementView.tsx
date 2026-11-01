import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { StorageService } from '../../services/storage';
import { Modal } from '../common/Modal';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  FileText, 
  Eye, 
  Wrench, 
  Calendar, 
  Building2, 
  CheckCircle2,
  ExternalLink,
  MessageCircle
} from 'lucide-react';

export const CustomerManagementView: React.FC = () => {
  const { customers, installations, serviceRequests, quotations, refreshData, showToast, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    email: '',
    location: '',
    address: '',
    customerType: 'Commercial',
    notes: ''
  });

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = typeFilter === 'All' || c.customerType === typeFilter;
    return matchesSearch && matchesType;
  });

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      name: '',
      phone: '',
      email: '',
      location: '',
      address: '',
      customerType: 'Commercial',
      notes: ''
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (customer: Customer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsEditing(true);
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      location: customer.location,
      address: customer.address || '',
      customerType: customer.customerType,
      notes: customer.notes || ''
    });
    setIsFormModalOpen(true);
  };

  const openDetailModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailModalOpen(true);
  };

  const handleDelete = (customer: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete customer "${customer.name}"? This action cannot be undone.`)) {
      StorageService.deleteCustomer(customer.id);
      refreshData();
      showToast(`Customer ${customer.name} deleted successfully`, 'info');
      if (selectedCustomer?.id === customer.id) {
        setIsDetailModalOpen(false);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.phone?.trim() || !formData.location?.trim()) {
      showToast('Please provide customer name, phone number, and location', 'error');
      return;
    }

    if (isEditing && selectedCustomer) {
      const updated: Customer = {
        ...selectedCustomer,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email?.trim() || '',
        location: formData.location.trim(),
        address: formData.address?.trim() || '',
        customerType: formData.customerType as Customer['customerType'],
        notes: formData.notes?.trim() || ''
      };
      StorageService.saveCustomer(updated, false);
      showToast(`Updated customer ${updated.name}`, 'success');
    } else {
      const newCustomer: Customer = {
        id: 'cust-' + Date.now(),
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email?.trim() || '',
        location: formData.location.trim(),
        address: formData.address?.trim() || '',
        customerType: (formData.customerType as Customer['customerType']) || 'Commercial',
        notes: formData.notes?.trim() || '',
        createdAt: new Date().toISOString().substring(0, 10)
      };
      StorageService.saveCustomer(newCustomer, true);
      showToast(`Added new customer ${newCustomer.name}`, 'success');
    }

    refreshData();
    setIsFormModalOpen(false);
  };

  // Customer History Lookups
  const getCustomerInstallations = (customerId: string) => {
    return installations.filter(i => i.customerId === customerId);
  };

  const getCustomerServiceTickets = (customerId: string) => {
    return serviceRequests.filter(s => s.customerId === customerId);
  };

  const getCustomerQuotations = (customerId: string) => {
    return quotations.filter(q => q.customerId === customerId);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Customer Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Maintain client records, locations, contact information, and CCTV installation histories
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-blue-500 transition-all hover:scale-[1.02]"
        >
          <UserPlus className="h-4 w-4" />
          Add New Customer
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, phone (+254...), email or location..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Filter Type:</span>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="All">All Categories ({customers.length})</option>
            <option value="Commercial">Commercial</option>
            <option value="Residential">Residential</option>
            <option value="Industrial">Industrial</option>
            <option value="Institution">Institution</option>
          </select>
        </div>
      </div>

      {/* Customers Cards / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
            <Users className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">No customers found</h3>
            <p className="mt-1 text-xs text-slate-500">Try adjusting your search criteria or add a new customer.</p>
            <button
              onClick={openAddModal}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
            >
              <UserPlus className="h-4 w-4" /> Add First Customer
            </button>
          </div>
        ) : (
          filteredCustomers.map(customer => {
            const customerInstalls = getCustomerInstallations(customer.id);
            const totalCameras = customerInstalls.reduce((sum, i) => sum + i.numberOfCameras, 0);
            const pendingTickets = getCustomerServiceTickets(customer.id).filter(s => s.status !== 'Completed').length;

            return (
              <div
                key={customer.id}
                onClick={() => openDetailModal(customer)}
                className="group relative cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-500 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Type and Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      customer.customerType === 'Commercial'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300'
                        : customer.customerType === 'Residential'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                        : customer.customerType === 'Industrial'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300'
                    }`}>
                      {customer.customerType}
                    </span>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={(e) => openEditModal(customer, e)}
                        className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit Customer"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={(e) => handleDelete(customer, e)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete Customer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Customer Name */}
                  <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {customer.name}
                  </h3>

                  {/* Contact details */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-slate-200">{customer.phone}</span>
                      <a
                        href={`https://wa.me/254${customer.phone.replace(/^0/, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="ml-auto text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                      >
                        <MessageCircle className="h-3 w-3" /> WhatsApp
                      </a>
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{customer.location}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    <span>{customerInstalls.length} Site{customerInstalls.length !== 1 ? 's' : ''}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">{totalCameras} Cameras</span>
                  </div>

                  {pendingTickets > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-400">
                      <Wrench className="h-3 w-3" /> {pendingTickets} Issue
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={isEditing ? 'Edit Customer Information' : 'Add New CCTV Customer'}
        subtitle="Customer details will be saved to the database and linked to installations."
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Customer / Organization Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Logistics Ltd, Dr. Mwangi Residence"
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
                placeholder="0792093927 or 0712345678"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="client@organization.co.ke"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Premises Location / Area *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kilimani, Nairobi / Nyali, Mombasa"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Customer Category
              </label>
              <select
                value={formData.customerType}
                onChange={e => setFormData({ ...formData, customerType: e.target.value as Customer['customerType'] })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="Commercial">Commercial / Business</option>
                <option value="Residential">Residential / Home</option>
                <option value="Industrial">Industrial / Warehouse</option>
                <option value="Institution">Institution / School / Church</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Exact Physical Address / Building
            </label>
            <input
              type="text"
              placeholder="e.g. Block C4, Enterprise Road, Gate 3"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Internal Technical Notes / Special Requirements
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Prefers ColorVu night vision cameras; gate distance 120m requires Cat6 outdoor..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
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
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-500 shadow-md transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Create Customer Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Customer CCTV Installation History & Detail Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={selectedCustomer.name}
          subtitle={`Customer Record • Registered: ${selectedCustomer.createdAt}`}
          maxWidth="3xl"
        >
          <div className="space-y-6">
            {/* Quick Contact & Info Card */}
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Phone Number</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedCustomer.phone}</p>
                <div className="mt-1 flex items-center gap-2">
                  <a
                    href={`tel:${selectedCustomer.phone}`}
                    className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Phone className="h-3 w-3" /> Call
                  </a>
                  <a
                    href={`https://wa.me/254${selectedCustomer.phone.replace(/^0/, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <MessageCircle className="h-3 w-3" /> WhatsApp
                  </a>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Email Address</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedCustomer.email || 'None registered'}
                </p>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mt-2">Category</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.customerType}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Premises Location</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{selectedCustomer.location}</p>
                {selectedCustomer.address && (
                  <p className="text-[11px] text-slate-500 mt-1">{selectedCustomer.address}</p>
                )}
              </div>
            </div>

            {selectedCustomer.notes && (
              <div className="rounded-xl bg-blue-50/50 p-3 text-xs text-blue-900 dark:bg-blue-950/30 dark:text-blue-200 border border-blue-100 dark:border-blue-900/40">
                <span className="font-bold uppercase tracking-wider text-[10px] block mb-1">Notes:</span>
                {selectedCustomer.notes}
              </div>
            )}

            {/* Installation History Section */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                CCTV Installation History ({getCustomerInstallations(selectedCustomer.id).length})
              </h4>

              {getCustomerInstallations(selectedCustomer.id).length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500 dark:border-slate-800">
                  No CCTV installations registered for this client yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {getCustomerInstallations(selectedCustomer.id).map(inst => (
                    <div
                      key={inst.id}
                      className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-white dark:bg-slate-900"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {inst.installationLocation}
                          </span>
                          <p className="text-xs text-slate-500">
                            Installed: {inst.installationDate} {inst.completionDate && `• Completed: ${inst.completionDate}`}
                          </p>
                        </div>
                        <span className={`inline-flex self-start sm:self-auto px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inst.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-400'
                        }`}>
                          {inst.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Cameras Deployed</span>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {inst.numberOfCameras} Units ({inst.cameraTypes.join(', ')})
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400">DVR / NVR & HDD</span>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {inst.dvrNvrDetails}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">{inst.hardDiskDetails}</p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Tech & Remote App</span>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{inst.technicianName}</p>
                          <p className="text-[10px] text-blue-600 dark:text-blue-400">{inst.remoteViewingApp || 'Hik-Connect Cloud'}</p>
                        </div>
                      </div>

                      {/* Camera points breakdown if present */}
                      {inst.camerasList && inst.camerasList.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                            Camera Channels & Health
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {inst.camerasList.map(cam => (
                              <div
                                key={cam.id}
                                className="rounded-lg bg-slate-50 p-2 text-[11px] dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                    Ch{cam.channelNumber}: {cam.locationName}
                                  </span>
                                  <span className={`h-2 w-2 rounded-full shrink-0 ${
                                    cam.status === 'Active' ? 'bg-emerald-500' : cam.status === 'Under Maintenance' ? 'bg-amber-500' : 'bg-rose-500'
                                  }`} />
                                </div>
                                <span className="text-[10px] text-slate-400">{cam.cameraType}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Service & Maintenance Tickets for this customer */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <Wrench className="h-4 w-4 text-amber-600" />
                Service & Maintenance History ({getCustomerServiceTickets(selectedCustomer.id).length})
              </h4>

              {getCustomerServiceTickets(selectedCustomer.id).length === 0 ? (
                <p className="text-xs text-slate-400 italic">No maintenance tickets logged.</p>
              ) : (
                <div className="space-y-2">
                  {getCustomerServiceTickets(selectedCustomer.id).map(ticket => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {ticket.ticketNumber}
                          </span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            • {ticket.issueType}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{ticket.description}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ticket.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400'
                        }`}>
                          {ticket.status}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Tech: {ticket.technicianName || 'Unassigned'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal actions */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  openEditModal(selectedCustomer);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit Record
              </button>

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
