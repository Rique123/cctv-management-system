import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EquipmentItem, EquipmentCategory, EquipmentStatus } from '../../types';
import { StorageService } from '../../services/storage';
import { Modal } from '../common/Modal';
import { 
  Boxes, 
  Search, 
  Filter, 
  AlertTriangle, 
  Plus, 
  Minus, 
  ArrowUpRight, 
  DollarSign, 
  Layers, 
  PackageCheck, 
  RotateCcw,
  Tag,
  CheckCircle2,
  TrendingUp,
  Warehouse
} from 'lucide-react';

const CATEGORIES: EquipmentCategory[] = [
  'Cameras', 
  'DVR/NVR', 
  'Hard Drives', 
  'Memory Cards', 
  'Solar & Power', 
  'Cables', 
  'Connectors & Accessories'
];

export const InventoryManagementView: React.FC = () => {
  const { equipment, refreshData, showToast, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [stockLevelFilter, setStockLevelFilter] = useState<'All' | 'LowStock' | 'OutOfStock'>('All');

  // Stock Adjustment Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EquipmentItem | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(5);
  const [adjustReason, setAdjustReason] = useState<string>('Supplier Delivery Restock');

  // Filtered Items
  const filteredItems = equipment.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;

    let matchesStock = true;
    if (stockLevelFilter === 'LowStock') {
      matchesStock = item.status === 'Low Stock' || item.quantity <= item.minStockThreshold;
    } else if (stockLevelFilter === 'OutOfStock') {
      matchesStock = item.status === 'Out of Stock' || item.quantity <= 0;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Inventory Valuations in KSh
  const totalCostValuation = equipment.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0);
  const totalRetailValuation = equipment.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
  const potentialProfit = totalRetailValuation - totalCostValuation;
  const totalUnits = equipment.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = equipment.filter(item => item.quantity <= item.minStockThreshold);

  const openAdjustModal = (item: EquipmentItem, type: 'in' | 'out') => {
    setSelectedItem(item);
    setAdjustQty(type === 'in' ? 5 : -1);
    setAdjustReason(type === 'in' ? 'Shipment Received / Restock' : 'Field Usage / Direct Sale');
    setIsModalOpen(true);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (adjustQty === 0) {
      showToast('Quantity cannot be zero', 'error');
      return;
    }

    StorageService.adjustStock(selectedItem.id, adjustQty, adjustReason);
    refreshData();
    showToast(`Stock updated for ${selectedItem.name}`, 'success');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="h-6 w-6 text-amber-600" />
            Inventory & Warehouse Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time stock tracking for cameras, DVR/NVR, hard drives, solar kits, cables & connectors with auto-deduct on installation
          </p>
        </div>

        {/* Low Stock Quick Warning badge */}
        {lowStockItems.length > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>{lowStockItems.length} Items Below Restock Threshold</span>
          </div>
        )}
      </div>

      {/* Financial Valuation Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Inventory Units
          </span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {totalUnits.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500">Across {equipment.length} catalog items</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Stock Asset Cost (KSh)
          </span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            KSh {(totalCostValuation / 1000).toFixed(0)}k
          </p>
          <span className="text-[11px] text-slate-500">Purchase valuation: KSh {totalCostValuation.toLocaleString()}</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Retail Market Value (KSh)
          </span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            KSh {(totalRetailValuation / 1000).toFixed(0)}k
          </p>
          <span className="text-[11px] text-emerald-600/80">Selling valuation: KSh {totalRetailValuation.toLocaleString()}</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Gross Margin Potential
          </span>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            KSh {(potentialProfit / 1000).toFixed(0)}k
          </p>
          <span className="text-[11px] text-slate-500">
            {totalCostValuation > 0 ? Math.round((potentialProfit / totalCostValuation) * 100) : 0}% Projected markup
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search inventory items, models or serial #..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs sm:text-sm text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-700 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="All">All Categories ({equipment.length})</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={stockLevelFilter}
            onChange={e => setStockLevelFilter(e.target.value as any)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-700 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="All">All Stock Levels</option>
            <option value="LowStock">Low Stock Only (Needs Reorder)</option>
            <option value="OutOfStock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Inventory Items Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-850 font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Item & Specifications</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Location in Store</th>
                <th className="py-3 px-4">Available Stock</th>
                <th className="py-3 px-4">Unit Cost (KSh)</th>
                <th className="py-3 px-4">Retail Price (KSh)</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4 text-right">Quick Stock Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredItems.map(item => {
                const isLow = item.quantity <= item.minStockThreshold;

                return (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">Model: {item.model} • SN: {item.serialNumber}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-sm">{item.specifications}</p>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-medium">
                      {item.category}
                      {item.cameraType && (
                        <span className="block text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                          {item.cameraType}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                      {item.locationInStore || 'Main Store'}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`text-base font-extrabold ${isLow ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>
                        {item.quantity}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">units</span>
                      {isLow && (
                        <span className="block text-[10px] text-amber-600 font-semibold">
                          Reorder Alert (≤{item.minStockThreshold})
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-600 dark:text-slate-400">
                      KSh {item.purchasePrice.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                      KSh {item.sellingPrice.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
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

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openAdjustModal(item, 'in')}
                          className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 transition-colors"
                          title="Stock In / Restock"
                        >
                          <Plus className="h-3 w-3" /> In
                        </button>

                        <button
                          type="button"
                          onClick={() => openAdjustModal(item, 'out')}
                          className="flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 transition-colors"
                          title="Stock Out / Usage"
                        >
                          <Minus className="h-3 w-3" /> Out
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {selectedItem && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Inventory Stock Adjustment: ${selectedItem.name}`}
          subtitle={`Current In-Stock: ${selectedItem.quantity} units (${selectedItem.locationInStore || 'Store A'})`}
          maxWidth="sm"
        >
          <form onSubmit={handleAdjustSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Quantity to Adjust (Positive = In, Negative = Out)
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustQty(prev => prev - 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  value={adjustQty}
                  onChange={e => setAdjustQty(parseInt(e.target.value) || 0)}
                  className="w-full text-center font-bold text-lg rounded-xl border border-slate-300 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setAdjustQty(prev => prev + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500 text-center mt-1">
                New Stock Total: <span className="font-bold text-slate-900 dark:text-white">{Math.max(0, selectedItem.quantity + adjustQty)} units</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Adjustment Reason / Order Ref *
              </label>
              <input
                type="text"
                required
                value={adjustReason}
                onChange={e => setAdjustReason(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border px-3 py-2 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-500"
              >
                Save Stock Adjustment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
