import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Quotation, QuotationItem, QuotationStatus, PaymentMethod, EquipmentItem } from '../../types';
import { StorageService } from '../../services/storage';
import { PdfService } from '../../services/pdfGenerator';
import { Modal } from '../common/Modal';
import { 
  FileSpreadsheet, 
  PlusCircle, 
  Search, 
  Filter, 
  Calendar, 
  Phone, 
  MapPin, 
  FileText, 
  DollarSign, 
  Download, 
  Printer, 
  Trash2, 
  CheckCircle2, 
  ArrowRight, 
  Plus, 
  Minus, 
  ShieldCheck, 
  CreditCard,
  Eye,
  AlertCircle
} from 'lucide-react';

export const QuotationManagementView: React.FC = () => {
  const { quotations, customers, equipment, technicians, refreshData, showToast, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);

  // Payment Recording State
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('M-Pesa');

  // Convert to Installation State
  const [convertTechId, setConvertTechId] = useState<string>('');
  const [convertInstallDate, setConvertInstallDate] = useState<string>(new Date().toISOString().substring(0, 10));

  // Create Quote Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [custName, setCustName] = useState<string>('');
  const [custPhone, setCustPhone] = useState<string>('');
  const [custEmail, setCustEmail] = useState<string>('');
  const [custLocation, setCustLocation] = useState<string>('');
  const [quoteDate, setQuoteDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [validDays, setValidDays] = useState<number>(30);
  const [taxRate, setTaxRate] = useState<number>(16); // 16% VAT or 0%
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('Standard 2-year manufacturer warranty on cameras & DVR. 3-year warranty on Purple HDDs.');
  const [quoteItems, setQuoteItems] = useState<QuotationItem[]>([
    {
      id: 'qi-' + Date.now(),
      description: 'Hikvision 4MP AcuSense Dome Camera',
      quantity: 4,
      unitPrice: 7200,
      total: 28800,
      type: 'equipment',
      equipmentId: equipment[0]?.id
    },
    {
      id: 'qi-' + (Date.now() + 1),
      description: 'Hikvision 8-Channel 4K PoE NVR',
      quantity: 1,
      unitPrice: 23500,
      total: 23500,
      type: 'equipment',
      equipmentId: equipment[6]?.id
    },
    {
      id: 'qi-' + (Date.now() + 2),
      description: 'Western Digital Purple 2TB Surveillance Hard Drive',
      quantity: 1,
      unitPrice: 8500,
      total: 8500,
      type: 'equipment',
      equipmentId: equipment[9]?.id
    },
    {
      id: 'qi-' + (Date.now() + 3),
      description: 'Complete Cabling, Conduit Trunking, Camera Mounting & Remote App Setup Labor',
      quantity: 1,
      unitPrice: 15000,
      total: 15000,
      type: 'service'
    }
  ]);

  const filteredQuotes = quotations.filter(q => {
    const matchesSearch = 
      q.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerPhone.includes(searchQuery) ||
      q.customerLocation.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCustomerSelect = (id: string) => {
    setSelectedCustomerId(id);
    const c = customers.find(item => item.id === id);
    if (c) {
      setCustName(c.name);
      setCustPhone(c.phone);
      setCustEmail(c.email || '');
      setCustLocation(c.location);
    }
  };

  const handleAddItemFromEquipment = (eqItem: EquipmentItem) => {
    const newItem: QuotationItem = {
      id: 'qi-' + Date.now() + Math.random().toString(36).substring(2, 5),
      equipmentId: eqItem.id,
      description: `${eqItem.name} (${eqItem.model})`,
      quantity: 1,
      unitPrice: eqItem.sellingPrice,
      total: eqItem.sellingPrice,
      type: 'equipment'
    };
    setQuoteItems([...quoteItems, newItem]);
  };

  const handleAddCustomService = () => {
    const newItem: QuotationItem = {
      id: 'qi-' + Date.now() + Math.random().toString(36).substring(2, 5),
      description: 'Custom CCTV Labor / High-Mast Rigging / Network Setup',
      quantity: 1,
      unitPrice: 5000,
      total: 5000,
      type: 'service'
    };
    setQuoteItems([...quoteItems, newItem]);
  };

  const updateItemQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setQuoteItems(quoteItems.filter(i => i.id !== id));
      return;
    }
    setQuoteItems(quoteItems.map(item => {
      if (item.id === id) {
        return { ...item, quantity: qty, total: qty * item.unitPrice };
      }
      return item;
    }));
  };

  const updateItemPrice = (id: string, price: number) => {
    setQuoteItems(quoteItems.map(item => {
      if (item.id === id) {
        return { ...item, unitPrice: price, total: item.quantity * price };
      }
      return item;
    }));
  };

  const updateItemDescription = (id: string, desc: string) => {
    setQuoteItems(quoteItems.map(item => {
      if (item.id === id) {
        return { ...item, description: desc };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setQuoteItems(quoteItems.filter(i => i.id !== id));
  };

  // Calculations
  const subtotal = quoteItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = taxRate > 0 ? Math.round((subtotal * taxRate) / 100) : 0;
  const grandTotal = Math.max(0, subtotal + taxAmount - discountAmount);

  const openCreateModal = () => {
    const defaultCust = customers[0];
    if (defaultCust) {
      setSelectedCustomerId(defaultCust.id);
      setCustName(defaultCust.name);
      setCustPhone(defaultCust.phone);
      setCustEmail(defaultCust.email || '');
      setCustLocation(defaultCust.location);
    }
    setIsCreateModalOpen(true);
  };

  const handleSaveQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custPhone.trim() || quoteItems.length === 0) {
      showToast('Please fill client info and add at least one line item', 'error');
      return;
    }

    const quoteNumber = `QT-2024-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const validUntilDate = new Date(Date.now() + validDays * 24 * 3600 * 1000).toISOString().substring(0, 10);

    const newQuotation: Quotation = {
      id: 'quot-' + Date.now(),
      quoteNumber,
      customerId: selectedCustomerId || 'cust-generic',
      customerName: custName.trim(),
      customerPhone: custPhone.trim(),
      customerEmail: custEmail.trim(),
      customerLocation: custLocation.trim() || 'Nairobi, Kenya',
      date: quoteDate,
      validUntil: validUntilDate,
      items: quoteItems,
      subtotal,
      taxRate,
      taxAmount,
      discount: discountAmount,
      totalAmount: grandTotal,
      amountPaid: 0,
      balance: grandTotal,
      paymentStatus: 'Pending',
      status: 'Sent',
      notes,
      terms: '50% deposit upon confirmation, 50% upon testing & remote app handover. 2-year warranty.'
    };

    StorageService.saveQuotation(newQuotation, true);
    refreshData();
    showToast(`Quotation ${quoteNumber} generated for ${newQuotation.customerName}!`, 'success');
    setIsCreateModalOpen(false);
  };

  const handleOpenPayment = (q: Quotation, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedQuote(q);
    setPaymentAmount(q.balance);
    setPaymentMethod('M-Pesa');
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) return;
    if (paymentAmount <= 0) {
      showToast('Please enter a valid payment amount', 'error');
      return;
    }

    const updated = StorageService.recordPayment(selectedQuote.id, paymentAmount, paymentMethod);
    refreshData();
    if (updated) setSelectedQuote(updated);
    showToast(`Payment of KSh ${paymentAmount.toLocaleString()} recorded via ${paymentMethod}`, 'success');
    setIsPaymentModalOpen(false);
  };

  const handleOpenConvert = (q: Quotation, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedQuote(q);
    setConvertTechId(technicians[0]?.id || '');
    setConvertInstallDate(new Date().toISOString().substring(0, 10));
    setIsConvertModalOpen(true);
  };

  const handleConfirmConvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) return;
    const tech = technicians.find(t => t.id === convertTechId) || technicians[0];
    const newInst = StorageService.convertQuotationToInstallation(
      selectedQuote.id,
      tech?.id || 'tech-1',
      tech?.name || 'Kennedy Omondi',
      convertInstallDate
    );

    refreshData();
    showToast(`Converted quotation to active project #${newInst?.id} & updated equipment stock!`, 'success');
    setIsConvertModalOpen(false);
    if (selectedQuote) {
      setSelectedQuote({ ...selectedQuote, status: 'Converted to Installation' });
    }
  };

  const handleDownloadPdf = (q: Quotation, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    PdfService.generateQuotationPdf(q);
    showToast(`Downloaded Quotation PDF for ${q.customerName}`, 'success');
  };

  const handlePrint = (q: Quotation, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    PdfService.generateQuotationPdf(q);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-blue-600" />
            Sales & Quotation Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Generate itemized CCTV quotations in KSh, record M-Pesa payments, and download official PDF proposals
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-blue-500 transition-all hover:scale-[1.02]"
        >
          <PlusCircle className="h-4 w-4" />
          Create CCTV Quotation
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search quote number, client name, phone or site location..."
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
            <option value="All">All Statuses ({quotations.length})</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Approved">Approved</option>
            <option value="Converted to Installation">Converted to Installation</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Quotations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredQuotes.map(q => {
          const isPaid = q.paymentStatus === 'Paid';
          const isPartiallyPaid = q.paymentStatus === 'Partially Paid';

          return (
            <div
              key={q.id}
              onClick={() => {
                setSelectedQuote(q);
                setIsDetailModalOpen(true);
              }}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-500 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
            >
              <div>
                {/* Header: Ref & Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                    {q.quoteNumber}
                  </span>

                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    q.status === 'Converted to Installation'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300'
                      : q.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400'
                      : q.status === 'Sent'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-400'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {q.status}
                  </span>
                </div>

                {/* Customer */}
                <h3 className="mt-2.5 text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {q.customerName}
                </h3>

                <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{q.customerLocation}</span>
                </div>

                {/* Financial Summary Box */}
                <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Total Quoted:</span>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      KSh {q.totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Paid:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      KSh {q.amountPaid.toLocaleString()} ({q.paymentMethod || 'M-Pesa'})
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">Balance:</span>
                    <span className={`font-bold ${q.balance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'}`}>
                      KSh {q.balance.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Items Summary preview */}
                <div className="mt-3 text-[11px] text-slate-500 line-clamp-1">
                  Includes: {q.items.map(i => `${i.quantity}x ${i.description.split('(')[0].trim()}`).join(', ')}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => handleDownloadPdf(q, e)}
                  className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors"
                  title="Download PDF"
                >
                  <Download className="h-3.5 w-3.5 text-blue-600" />
                  PDF Quote
                </button>

                <div className="flex items-center gap-1.5">
                  {q.balance > 0 && (
                    <button
                      type="button"
                      onClick={(e) => handleOpenPayment(q, e)}
                      className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-xs"
                    >
                      <CreditCard className="h-3 w-3" />
                      Pay
                    </button>
                  )}

                  {q.status !== 'Converted to Installation' && (
                    <button
                      type="button"
                      onClick={(e) => handleOpenConvert(q, e)}
                      className="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors shadow-xs"
                      title="Convert to active installation project"
                    >
                      <ShieldCheck className="h-3 w-3" />
                      Deploy
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create CCTV Quotation Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New CCTV Quotation"
        subtitle="Select customer, add cameras & equipment from inventory, include cabling/labor services, and calculate totals in KSh."
        maxWidth="4xl"
      >
        <form onSubmit={handleSaveQuotation} className="space-y-5">
          {/* Client Details Section */}
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Customer Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Choose Customer or Type Name *
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={e => handleCustomerSelect(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white mb-1.5"
                >
                  <option value="">-- Choose Existing Client --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  placeholder="Client Name"
                  value={custName}
                  onChange={e => setCustName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Customer Phone Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="0792093927"
                  value={custPhone}
                  onChange={e => setCustPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />

                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1 mt-2">
                  Customer Email
                </label>
                <input
                  type="email"
                  placeholder="client@email.com"
                  value={custEmail}
                  onChange={e => setCustEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Site Premises Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Westlands, Nairobi"
                  value={custLocation}
                  onChange={e => setCustLocation(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Quote Date</label>
                    <input
                      type="date"
                      value={quoteDate}
                      onChange={e => setQuoteDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Validity (Days)</label>
                    <input
                      type="number"
                      value={validDays}
                      onChange={e => setValidDays(parseInt(e.target.value) || 30)}
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Add From Equipment Inventory */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Quick Add From Stock Inventory
              </span>
              <button
                type="button"
                onClick={handleAddCustomService}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Add Custom Labor / Service Item
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 text-xs">
              {equipment.slice(0, 7).map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleAddItemFromEquipment(item)}
                  className="shrink-0 rounded-xl border border-slate-200 bg-white p-2 text-left hover:border-blue-500 hover:shadow-xs transition-all dark:border-slate-700 dark:bg-slate-800 max-w-[190px]"
                >
                  <p className="font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      KSh {item.sellingPrice.toLocaleString()}
                    </span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 rounded">
                      +{item.quantity} in stock
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-750 font-bold uppercase text-slate-400 text-[10px]">
                  <th className="py-2.5 px-3">Description / Product</th>
                  <th className="py-2.5 px-3 w-24">Qty</th>
                  <th className="py-2.5 px-3 w-32">Unit Price (KSh)</th>
                  <th className="py-2.5 px-3 w-32">Total (KSh)</th>
                  <th className="py-2.5 px-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {quoteItems.map(item => (
                  <tr key={item.id}>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={item.description}
                        onChange={e => updateItemDescription(item.id, e.target.value)}
                        className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => updateItemQty(item.id, parseInt(e.target.value) || 1)}
                        className="w-full text-center rounded-md border border-slate-200 px-2 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={e => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                        className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      KSh {item.total.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Summary and Taxes */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-2 w-full sm:w-1/2">
              <label className="text-[10px] font-bold uppercase text-slate-400 block">
                Warranty & Scope Conditions
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="w-full sm:w-80 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  KSh {subtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">VAT Tax:</span>
                <div className="flex items-center gap-1.5">
                  <select
                    value={taxRate}
                    onChange={e => setTaxRate(parseInt(e.target.value) || 0)}
                    className="rounded border border-slate-300 px-1 py-0.5 text-[10px] dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value={16}>16% VAT</option>
                    <option value={0}>0% (Tax Exempt)</option>
                  </select>
                  <span className="font-semibold">KSh {taxAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Discount (KSh):</span>
                <input
                  type="number"
                  min="0"
                  value={discountAmount}
                  onChange={e => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  className="w-24 text-right rounded border border-slate-300 px-1.5 py-0.5 text-xs text-emerald-600 font-bold dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700 text-sm font-bold">
                <span className="text-slate-900 dark:text-white">Total Amount:</span>
                <span className="text-blue-600 dark:text-blue-400 text-base">
                  KSh {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-500 shadow-md transition-colors"
            >
              Save & Finalize CCTV Quotation
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      {selectedQuote && (
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title={`Record Payment for ${selectedQuote.quoteNumber}`}
          subtitle={`Client: ${selectedQuote.customerName} • Total: KSh ${selectedQuote.totalAmount.toLocaleString()} • Balance: KSh ${selectedQuote.balance.toLocaleString()}`}
          maxWidth="md"
        >
          <form onSubmit={handleSavePayment} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Amount Received (KSh) *
              </label>
              <input
                type="number"
                min="1"
                max={selectedQuote.balance}
                required
                value={paymentAmount}
                onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-lg font-bold text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-400 focus:border-blue-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Outstanding balance after payment: KSh {Math.max(0, selectedQuote.balance - paymentAmount).toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Payment Channel / Method *
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="M-Pesa">Safaricom M-Pesa (Buy Goods / Till)</option>
                <option value="Cash">Cash in Hand</option>
                <option value="Bank Transfer">Bank Transfer / EFT</option>
                <option value="Cheque">Corporate Cheque</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="rounded-xl border px-3 py-2 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-md"
              >
                Confirm Payment Receipt
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Convert Quotation to Installation Modal */}
      {selectedQuote && (
        <Modal
          isOpen={isConvertModalOpen}
          onClose={() => setIsConvertModalOpen(false)}
          title={`Convert Quote ${selectedQuote.quoteNumber} to Active Installation`}
          subtitle="This will automatically deduct camera/equipment quantities from inventory and create an active installation project."
          maxWidth="md"
        >
          <form onSubmit={handleConfirmConvert} className="space-y-4">
            <div className="rounded-xl bg-blue-50 p-3 text-xs text-blue-900 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
              <p className="font-bold">Automated Inventory Stock Deduction:</p>
              <p className="mt-1">
                All cameras, NVRs, HDDs, and accessories listed on this quote will be subtracted from the inventory stock upon confirmation.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Assign Lead Technician *
              </label>
              <select
                value={convertTechId}
                onChange={e => setConvertTechId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {technicians.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.status})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Scheduled Installation Date *
              </label>
              <input
                type="date"
                required
                value={convertInstallDate}
                onChange={e => setConvertInstallDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsConvertModalOpen(false)}
                className="rounded-xl border px-3 py-2 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-500 shadow-md"
              >
                Deploy Project & Deduct Stock
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Detailed Quotation View Modal */}
      {selectedQuote && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Quotation: ${selectedQuote.quoteNumber}`}
          subtitle={`Client: ${selectedQuote.customerName} • Site: ${selectedQuote.customerLocation}`}
          maxWidth="3xl"
        >
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Total Contract Value</span>
                <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                  KSh {selectedQuote.totalAmount.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">
                  Paid: KSh {selectedQuote.amountPaid.toLocaleString()} • Balance: KSh {selectedQuote.balance.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(selectedQuote)}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-500 shadow-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download PDF
                </button>
              </div>
            </div>

            {/* Line items table */}
            <div className="rounded-xl border border-slate-200 overflow-hidden dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 font-bold uppercase text-slate-400 text-[10px]">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3">Unit Price</th>
                    <th className="py-2.5 px-3">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedQuote.items.map((it, idx) => (
                    <tr key={it.id}>
                      <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                      <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">{it.description}</td>
                      <td className="py-2 px-3 text-center font-bold">{it.quantity}</td>
                      <td className="py-2 px-3">KSh {it.unitPrice.toLocaleString()}</td>
                      <td className="py-2 px-3 font-bold">KSh {it.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
