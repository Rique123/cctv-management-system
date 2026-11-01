import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EquipmentItem, CameraType, EquipmentCategory, EquipmentStatus } from '../../types';
import { StorageService } from '../../services/storage';
import { Modal } from '../common/Modal';
import { 
  Cctv, 
  PlusCircle, 
  Search, 
  Filter, 
  Tag, 
  DollarSign, 
  Layers, 
  Edit3, 
  Trash2, 
  Boxes, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  Plus, 
  Minus,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

const CAMERA_TYPES: CameraType[] = ['Dome', 'Bullet', 'PTZ', 'Solar', 'Wi-Fi', 'IP Camera'];
const CATEGORIES: EquipmentCategory[] = [
  'Cameras', 
  'DVR/NVR', 
  'Hard Drives', 
  'Memory Cards', 
  'Solar & Power', 
  'Cables', 
  'Connectors & Accessories'
];

export const EquipmentManagementView: React.FC = () => {
  const { equipment, refreshData, showToast, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCameraType, setSelectedCameraType] = useState<string>('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EquipmentItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Quick Stock Adjust
  const [stockDelta, setStockDelta] = useState<number>(1);
  const [stockReason, setStockReason] = useState<string>('Supplier Stock Delivery');

  // Form State
  const [formData, setFormData] = useState<Partial<EquipmentItem>>({
    name: '',
    model: '',
    category: 'Cameras',
    cameraType: 'Dome',
    brand: 'Hikvision',
    serialNumber: '',
    quantity: 10,
    minStockThreshold: 3,
    purchasePrice: 4500,
    sellingPrice: 6500,
    status: 'In Stock',
    specifications: '',
    locationInStore: 'Aisle 1 - Shelf A',
    warrantyPeriodMonths: 24
  });

  const filteredItems = equipment.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesCameraType = 
      selectedCameraType === 'All' || 
      (item.category === 'Cameras' && item.cameraType === selectedCameraType);

    return matchesSearch && matchesCategory && matchesCameraType;
  });

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      name: '',
      model: '',
      category: 'Cameras',
      cameraType: 'Dome',
      brand: 'Hikvision',
      serialNumber: `SN-${Date.now().toString().slice(-6)}`,
      quantity: 10,
      minStockThreshold: 3,
      purchasePrice: 4500,
      sellingPrice: 6800,
      status: 'In Stock',
      specifications: '4MP High Resolution, Smart IR 30m, IP67 Weatherproof, PoE Enabled',
      locationInStore: 'Aisle 1 - Shelf B',
      warrantyPeriodMonths: 24
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: EquipmentItem) => {
    setIsEditing(true);
    setSelectedItem(item);
    setFormData({
      ...item
    });
    setIsModalOpen(true);
  };

  const openStockModal = (item: EquipmentItem) => {
    setSelectedItem(item);
    setStockDelta(5);
    setStockReason('Supplier Shipment Inbound');
    setIsStockModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.model?.trim()) {
      showToast('Please enter item name and model', 'error');
      return;
    }

    const qty = Number(formData.quantity) || 0;
    const threshold = Number(formData.minStockThreshold) || 3;
    let status: EquipmentStatus = 'In Stock';
    if (qty <= 0) status = 'Out of Stock';
    else if (qty <= threshold) status = 'Low Stock';

    if (isEditing && selectedItem) {
      const updated: EquipmentItem = {
        ...selectedItem,
        ...formData as EquipmentItem,
        id: selectedItem.id,
        quantity: qty,
        minStockThreshold: threshold,
        purchasePrice: Number(formData.purchasePrice) || 0,
        sellingPrice: Number(formData.sellingPrice) || 0,
        status
      };
      StorageService.saveEquipment(updated, false);
      showToast(`Updated equipment ${updated.name}`, 'success');
    } else {
      const newItem: EquipmentItem = {
        id: 'eq-' + Date.now(),
        name: formData.name.trim(),
        model: formData.model.trim(),
        category: (formData.category as EquipmentCategory) || 'Cameras',
        cameraType: formData.category === 'Cameras' ? formData.cameraType : undefined,
        brand: formData.brand || 'Hikvision',
        serialNumber: formData.serialNumber || `SN-${Date.now()}`,
        quantity: qty,
        minStockThreshold: threshold,
        purchasePrice: Number(formData.purchasePrice) || 0,
        sellingPrice: Number(formData.sellingPrice) || 0,
        status,
        specifications: formData.specifications || '',
        locationInStore: formData.locationInStore || 'Store Room A',
        warrantyPeriodMonths: Number(formData.warrantyPeriodMonths) || 24
      };
      StorageService.saveEquipment(newItem, true);
      showToast(`Added equipment: ${newItem.name}`, 'success');
    }

    refreshData();
    setIsModalOpen(false);
  };

  const handleDelete = (item: EquipmentItem) => {
    if (window.confirm(`Are you sure you want to delete ${item.name} (${item.model})?`)) {
      StorageService.deleteEquipment(item.id);
      refreshData();
      showToast(`Item deleted from inventory`, 'info');
    }
  };

  const handleStockAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    StorageService.adjustStock(selectedItem.id, stockDelta, stockReason);
    refreshData();
    showToast(`Stock updated for ${selectedItem.name}`, 'success');
    setIsStockModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cctv className="h-6 w-6 text-blue-600" />
            Camera & Equipment Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Catalog all CCTV camera models (Dome, Bullet, PTZ, Solar, Wi-Fi, IP), serial numbers, purchase & selling prices in KSh
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-blue-500 transition-all hover:scale-[1.02]"
        >
          <PlusCircle className="h-4 w-4" />
          Add Equipment Item
        </button>
      </div>

      {/* Filter and Category Pills */}
      <div className="space-y-3">
        {/* Search and Category Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search camera name, model, serial # or brand..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                if (e.target.value !== 'Cameras') setSelectedCameraType('All');
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="All">All Categories ({equipment.length} items)</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedCameraType}
              onChange={e => setSelectedCameraType(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="All">All Camera Types</option>
              {CAMERA_TYPES.map(type => (
                <option key={type} value={type}>{type} Cameras</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Camera Type Selector Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            Camera Types:
          </span>
          <button
            onClick={() => setSelectedCameraType('All')}
            className={`px-3 py-1 rounded-lg font-semibold shrink-0 transition-colors ${
              selectedCameraType === 'All'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Types
          </button>
          {CAMERA_TYPES.map(t => (
            <button
              key={t}
              onClick={() => {
                setSelectedCategory('Cameras');
                setSelectedCameraType(t);
              }}
              className={`px-3 py-1 rounded-lg font-semibold shrink-0 transition-colors ${
                selectedCameraType === t
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment Table / Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Equipment & Model</th>
                <th className="py-3 px-4">Category & Type</th>
                <th className="py-3 px-4">Serial #</th>
                <th className="py-3 px-4">Stock Available</th>
                <th className="py-3 px-4">Purchase Price</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No equipment found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const profitMargin = item.sellingPrice - item.purchasePrice;

                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold">
                            <Cctv className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono">
                              Model: {item.model} • {item.brand}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-medium">{item.category}</span>
                        {item.cameraType && (
                          <span className="block text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                            {item.cameraType}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {item.serialNumber}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <span className="text-[10px] text-slate-400">units</span>
                          <button
                            onClick={() => openStockModal(item)}
                            className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
                            title="Adjust Stock"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        {item.quantity <= item.minStockThreshold && (
                          <span className="text-[10px] text-amber-600 font-semibold block">
                            Min Alert: {item.minStockThreshold}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-600 dark:text-slate-400">
                        KSh {item.purchasePrice.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          KSh {item.sellingPrice.toLocaleString()}
                        </span>
                        <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          +KSh {profitMargin.toLocaleString()} margin
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'In Stock'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400'
                            : item.status === 'Low Stock'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400'
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit Equipment"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() => handleDelete(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              title="Delete Item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Equipment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Equipment & Pricing' : 'Add New Camera / CCTV Equipment'}
        subtitle="Catalog specifications, serial numbers, stock threshold, and purchase vs selling prices in KSh."
        maxWidth="3xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Equipment / Camera Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Hikvision 4MP AcuSense Dome Camera"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Model Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. DS-2CD2143G2-I or IPC-HFW2431S"
                value={formData.model}
                onChange={e => setFormData({ ...formData, model: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as EquipmentCategory })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Camera Type (If Camera)
              </label>
              <select
                disabled={formData.category !== 'Cameras'}
                value={formData.cameraType}
                onChange={e => setFormData({ ...formData, cameraType: e.target.value as CameraType })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
              >
                {CAMERA_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                placeholder="Hikvision, Dahua, Uniview, Reolink, WD"
                value={formData.brand}
                onChange={e => setFormData({ ...formData, brand: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Serial Number *
              </label>
              <input
                type="text"
                required
                placeholder="HK-DM-4MP-98210"
                value={formData.serialNumber}
                onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Purchase Price (KSh) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.purchasePrice}
                onChange={e => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Selling Price (KSh) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.sellingPrice}
                onChange={e => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-bold text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Technical Specifications
              </label>
              <textarea
                rows={2}
                placeholder="4MP (2560×1440), 2.8mm Lens, 30m IR, IP67 waterproof, PoE..."
                value={formData.specifications}
                onChange={e => setFormData({ ...formData, specifications: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Store Location & Warranty
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="e.g. Aisle 2 - Shelf B"
                  value={formData.locationInStore}
                  onChange={e => setFormData({ ...formData, locationInStore: e.target.value })}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Warranty (Months)"
                  value={formData.warrantyPeriodMonths}
                  onChange={e => setFormData({ ...formData, warrantyPeriodMonths: parseInt(e.target.value) || 24 })}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
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
              {isEditing ? 'Save Equipment Changes' : 'Add Item to Catalog'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock Adjustment Modal */}
      {selectedItem && (
        <Modal
          isOpen={isStockModalOpen}
          onClose={() => setIsStockModalOpen(false)}
          title={`Adjust Stock: ${selectedItem.name}`}
          subtitle={`Current In-Stock: ${selectedItem.quantity} units (${selectedItem.status})`}
          maxWidth="sm"
        >
          <form onSubmit={handleStockAdjustSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Stock Change Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStockDelta(prev => prev - 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  value={stockDelta}
                  onChange={e => setStockDelta(parseInt(e.target.value) || 0)}
                  className="w-full text-center font-bold text-lg rounded-xl border border-slate-300 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setStockDelta(prev => prev + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500 text-center mt-1">
                Positive = Stock In (Restock) • Negative = Stock Out
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Reason / Reference Note
              </label>
              <input
                type="text"
                required
                value={stockReason}
                onChange={e => setStockReason(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsStockModalOpen(false)}
                className="rounded-lg border px-3 py-2 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500"
              >
                Apply Stock Update
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
