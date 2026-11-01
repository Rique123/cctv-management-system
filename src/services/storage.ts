import { 
  Customer, 
  EquipmentItem, 
  Installation, 
  ServiceRequest, 
  Technician, 
  Quotation, 
  ActivityLog, 
  User,
  EquipmentStatus
} from '../types';
import { 
  INITIAL_CUSTOMERS, 
  INITIAL_EQUIPMENT, 
  INITIAL_INSTALLATIONS, 
  INITIAL_SERVICE_REQUESTS, 
  INITIAL_TECHNICIANS, 
  INITIAL_QUOTATIONS, 
  INITIAL_ACTIVITIES, 
  INITIAL_USERS 
} from './mockData';

const STORAGE_KEYS = {
  CUSTOMERS: 'rique_cctv_customers_v1',
  EQUIPMENT: 'rique_cctv_equipment_v1',
  INSTALLATIONS: 'rique_cctv_installations_v1',
  SERVICE_REQUESTS: 'rique_cctv_services_v1',
  TECHNICIANS: 'rique_cctv_technicians_v1',
  QUOTATIONS: 'rique_cctv_quotations_v1',
  ACTIVITIES: 'rique_cctv_activities_v1',
  USERS: 'rique_cctv_users_v1',
  CURRENT_USER: 'rique_cctv_current_user_v1',
  THEME: 'rique_cctv_theme_v1'
};

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

export const StorageService = {
  // Initialize storage if empty
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      setItem(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EQUIPMENT)) {
      setItem(STORAGE_KEYS.EQUIPMENT, INITIAL_EQUIPMENT);
    }
    if (!localStorage.getItem(STORAGE_KEYS.INSTALLATIONS)) {
      setItem(STORAGE_KEYS.INSTALLATIONS, INITIAL_INSTALLATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SERVICE_REQUESTS)) {
      setItem(STORAGE_KEYS.SERVICE_REQUESTS, INITIAL_SERVICE_REQUESTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TECHNICIANS)) {
      setItem(STORAGE_KEYS.TECHNICIANS, INITIAL_TECHNICIANS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.QUOTATIONS)) {
      setItem(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
      setItem(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      setItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      setItem(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
    }
  },

  // Reset to sample data
  resetAll() {
    setItem(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    setItem(STORAGE_KEYS.EQUIPMENT, INITIAL_EQUIPMENT);
    setItem(STORAGE_KEYS.INSTALLATIONS, INITIAL_INSTALLATIONS);
    setItem(STORAGE_KEYS.SERVICE_REQUESTS, INITIAL_SERVICE_REQUESTS);
    setItem(STORAGE_KEYS.TECHNICIANS, INITIAL_TECHNICIANS);
    setItem(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS);
    setItem(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
    setItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    setItem(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  },

  // Users & Auth
  getUsers(): User[] {
    return getItem(STORAGE_KEYS.USERS, INITIAL_USERS);
  },
  getCurrentUser(): User {
    return getItem(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  },
  setCurrentUser(user: User): void {
    setItem(STORAGE_KEYS.CURRENT_USER, user);
    this.logActivity(user.name, 'User Login', 'Auth', `Logged in as ${user.role} (${user.email})`);
  },

  // Activity Logs
  getActivities(): ActivityLog[] {
    return getItem(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  },
  logActivity(user: string, action: string, category: ActivityLog['category'], details: string) {
    const list = this.getActivities();
    const newEntry: ActivityLog = {
      id: 'act-' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user,
      action,
      category,
      details
    };
    const updated = [newEntry, ...list.slice(0, 49)];
    setItem(STORAGE_KEYS.ACTIVITIES, updated);
    return newEntry;
  },

  // Customers
  getCustomers(): Customer[] {
    return getItem(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  },
  saveCustomer(customer: Customer, isNew = false): void {
    const list = this.getCustomers();
    let updated: Customer[];
    if (isNew) {
      updated = [customer, ...list];
      this.logActivity('Admin', 'Created Customer', 'Customer', `Added new customer: ${customer.name}`);
    } else {
      updated = list.map(c => c.id === customer.id ? customer : c);
      this.logActivity('Admin', 'Updated Customer', 'Customer', `Updated details for: ${customer.name}`);
    }
    setItem(STORAGE_KEYS.CUSTOMERS, updated);
  },
  deleteCustomer(customerId: string): void {
    const list = this.getCustomers();
    const target = list.find(c => c.id === customerId);
    const updated = list.filter(c => c.id !== customerId);
    setItem(STORAGE_KEYS.CUSTOMERS, updated);
    if (target) {
      this.logActivity('Admin', 'Deleted Customer', 'Customer', `Removed customer: ${target.name}`);
    }
  },

  // Equipment & Inventory
  getEquipment(): EquipmentItem[] {
    return getItem(STORAGE_KEYS.EQUIPMENT, INITIAL_EQUIPMENT);
  },
  saveEquipment(item: EquipmentItem, isNew = false): void {
    const list = this.getEquipment();
    // determine status based on quantity
    let status: EquipmentStatus = item.status;
    if (item.quantity <= 0) {
      status = 'Out of Stock';
    } else if (item.quantity <= item.minStockThreshold) {
      status = 'Low Stock';
    } else if (status === 'Low Stock' || status === 'Out of Stock') {
      status = 'In Stock';
    }
    const finalItem = { ...item, status };

    let updated: EquipmentItem[];
    if (isNew) {
      updated = [finalItem, ...list];
      this.logActivity('Admin', 'Added Equipment', 'Equipment', `Added ${finalItem.name} (${finalItem.quantity} units)`);
    } else {
      updated = list.map(e => e.id === finalItem.id ? finalItem : e);
      this.logActivity('Admin', 'Updated Equipment', 'Equipment', `Updated equipment: ${finalItem.name}`);
    }
    setItem(STORAGE_KEYS.EQUIPMENT, updated);
  },
  deleteEquipment(id: string): void {
    const list = this.getEquipment();
    const target = list.find(e => e.id === id);
    const updated = list.filter(e => e.id !== id);
    setItem(STORAGE_KEYS.EQUIPMENT, updated);
    if (target) {
      this.logActivity('Admin', 'Removed Equipment', 'Equipment', `Deleted item ${target.name}`);
    }
  },
  adjustStock(id: string, delta: number, reason: string): EquipmentItem | null {
    const list = this.getEquipment();
    const item = list.find(e => e.id === id);
    if (!item) return null;

    const newQty = Math.max(0, item.quantity + delta);
    let status: EquipmentStatus = item.status;
    if (newQty <= 0) status = 'Out of Stock';
    else if (newQty <= item.minStockThreshold) status = 'Low Stock';
    else status = 'In Stock';

    const updatedItem = { ...item, quantity: newQty, status };
    const updated = list.map(e => e.id === id ? updatedItem : e);
    setItem(STORAGE_KEYS.EQUIPMENT, updated);

    this.logActivity(
      'Admin', 
      delta > 0 ? 'Stock In' : 'Stock Out', 
      'Equipment', 
      `${delta > 0 ? '+' : ''}${delta} ${item.name} (${reason}). New stock: ${newQty}`
    );
    return updatedItem;
  },

  // Installations
  getInstallations(): Installation[] {
    return getItem(STORAGE_KEYS.INSTALLATIONS, INITIAL_INSTALLATIONS);
  },
  saveInstallation(installation: Installation, isNew = false): void {
    const list = this.getInstallations();
    let updated: Installation[];
    if (isNew) {
      updated = [installation, ...list];
      this.logActivity('Admin', 'Created Installation', 'Installation', `Created installation for ${installation.customerName} (${installation.numberOfCameras} cameras)`);
    } else {
      updated = list.map(i => i.id === installation.id ? installation : i);
      this.logActivity('Admin', 'Updated Installation', 'Installation', `Updated installation ${installation.id} for ${installation.customerName}`);
    }
    setItem(STORAGE_KEYS.INSTALLATIONS, updated);
  },
  deleteInstallation(id: string): void {
    const list = this.getInstallations();
    const updated = list.filter(i => i.id !== id);
    setItem(STORAGE_KEYS.INSTALLATIONS, updated);
    this.logActivity('Admin', 'Deleted Installation', 'Installation', `Deleted installation ${id}`);
  },
  updateCameraStatus(installationId: string, cameraId: string, newStatus: 'Active' | 'Under Maintenance' | 'Offline') {
    const list = this.getInstallations();
    const inst = list.find(i => i.id === installationId);
    if (!inst) return;
    const updatedCameras = inst.camerasList.map(c => c.id === cameraId ? { ...c, status: newStatus } : c);
    const updatedInst = { ...inst, camerasList: updatedCameras };
    const updated = list.map(i => i.id === installationId ? updatedInst : i);
    setItem(STORAGE_KEYS.INSTALLATIONS, updated);
    this.logActivity('Technician', 'Camera Status Changed', 'Installation', `Camera ${cameraId} status changed to ${newStatus}`);
  },

  // Service Requests
  getServiceRequests(): ServiceRequest[] {
    return getItem(STORAGE_KEYS.SERVICE_REQUESTS, INITIAL_SERVICE_REQUESTS);
  },
  saveServiceRequest(request: ServiceRequest, isNew = false): void {
    const list = this.getServiceRequests();
    let updated: ServiceRequest[];
    if (isNew) {
      updated = [request, ...list];
      this.logActivity('Support', 'Logged Service Request', 'Service', `Ticket ${request.ticketNumber} logged for ${request.customerName}: ${request.issueType}`);
    } else {
      updated = list.map(s => s.id === request.id ? request : s);
      this.logActivity('Technician', 'Updated Service Request', 'Service', `Updated ticket ${request.ticketNumber} status: ${request.status}`);
    }
    setItem(STORAGE_KEYS.SERVICE_REQUESTS, updated);
  },
  deleteServiceRequest(id: string): void {
    const list = this.getServiceRequests();
    const target = list.find(s => s.id === id);
    const updated = list.filter(s => s.id !== id);
    setItem(STORAGE_KEYS.SERVICE_REQUESTS, updated);
    if (target) {
      this.logActivity('Admin', 'Deleted Service Request', 'Service', `Removed ticket ${target.ticketNumber}`);
    }
  },

  // Technicians
  getTechnicians(): Technician[] {
    return getItem(STORAGE_KEYS.TECHNICIANS, INITIAL_TECHNICIANS);
  },
  saveTechnician(technician: Technician, isNew = false): void {
    const list = this.getTechnicians();
    let updated: Technician[];
    if (isNew) {
      updated = [technician, ...list];
      this.logActivity('Admin', 'Added Technician', 'Technician', `Added technician: ${technician.name}`);
    } else {
      updated = list.map(t => t.id === technician.id ? technician : t);
      this.logActivity('Admin', 'Updated Technician', 'Technician', `Updated technician profile: ${technician.name}`);
    }
    setItem(STORAGE_KEYS.TECHNICIANS, updated);
  },

  // Quotations & Sales
  getQuotations(): Quotation[] {
    return getItem(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS);
  },
  saveQuotation(quotation: Quotation, isNew = false): void {
    const list = this.getQuotations();
    let updated: Quotation[];
    if (isNew) {
      updated = [quotation, ...list];
      this.logActivity('Admin', 'Created Quotation', 'Quotation', `Created quotation ${quotation.quoteNumber} for ${quotation.customerName} (KSh ${quotation.totalAmount.toLocaleString()})`);
    } else {
      updated = list.map(q => q.id === quotation.id ? quotation : q);
      this.logActivity('Admin', 'Updated Quotation', 'Quotation', `Updated quote ${quotation.quoteNumber} status: ${quotation.status}`);
    }
    setItem(STORAGE_KEYS.QUOTATIONS, updated);
  },
  recordPayment(quoteId: string, amount: number, method: Quotation['paymentMethod']) {
    const list = this.getQuotations();
    const quote = list.find(q => q.id === quoteId);
    if (!quote) return;

    const newPaid = Math.min(quote.totalAmount, quote.amountPaid + amount);
    const newBalance = Math.max(0, quote.totalAmount - newPaid);
    const paymentStatus: Quotation['paymentStatus'] = newBalance === 0 ? 'Paid' : newPaid > 0 ? 'Partially Paid' : 'Pending';

    const updatedQuote: Quotation = {
      ...quote,
      amountPaid: newPaid,
      balance: newBalance,
      paymentMethod: method,
      paymentStatus
    };

    const updated = list.map(q => q.id === quoteId ? updatedQuote : q);
    setItem(STORAGE_KEYS.QUOTATIONS, updated);
    this.logActivity('Admin', 'Payment Recorded', 'Quotation', `Received KSh ${amount.toLocaleString()} for ${quote.quoteNumber} via ${method}. Balance: KSh ${newBalance.toLocaleString()}`);
    return updatedQuote;
  },
  convertQuotationToInstallation(quoteId: string, technicianId: string, technicianName: string, installationDate: string) {
    const quotes = this.getQuotations();
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return null;

    // Deduct stock for all equipment in quote
    const equipmentList = this.getEquipment();
    quote.items.forEach(item => {
      if (item.type === 'equipment' && item.equipmentId) {
        this.adjustStock(item.equipmentId, -item.quantity, `Installation deployment for ${quote.customerName}`);
      }
    });

    // Count camera items
    let cameraCount = 0;
    const cameraTypesFound: Installation['cameraTypes'] = [];
    const camerasList: Installation['camerasList'] = [];

    quote.items.forEach((item, idx) => {
      if (item.type === 'equipment' && item.equipmentId) {
        const eq = equipmentList.find(e => e.id === item.equipmentId);
        if (eq && eq.category === 'Cameras') {
          cameraCount += item.quantity;
          if (eq.cameraType && !cameraTypesFound.includes(eq.cameraType)) {
            cameraTypesFound.push(eq.cameraType);
          }
          for (let i = 1; i <= item.quantity; i++) {
            camerasList.push({
              id: `cam-${Date.now()}-${idx}-${i}`,
              cameraName: `${eq.name} #${i}`,
              cameraType: eq.cameraType || 'Dome',
              channelNumber: camerasList.length + 1,
              locationName: `Position ${camerasList.length + 1}`,
              status: 'Active',
              resolution: eq.specifications.includes('4MP') ? '4MP' : eq.specifications.includes('8MP') ? '8MP' : '1080p'
            });
          }
        }
      }
    });

    // Create installation
    const newInst: Installation = {
      id: 'inst-' + Date.now(),
      customerId: quote.customerId,
      customerName: quote.customerName,
      customerPhone: quote.customerPhone,
      customerEmail: quote.customerEmail,
      installationLocation: quote.customerLocation,
      installationDate: installationDate || new Date().toISOString().substring(0, 10),
      numberOfCameras: cameraCount || 4,
      cameraTypes: cameraTypesFound.length > 0 ? cameraTypesFound : ['Dome', 'Bullet'],
      dvrNvrDetails: quote.items.find(i => i.description.toLowerCase().includes('nvr') || i.description.toLowerCase().includes('dvr'))?.description || 'NVR Standard Unit',
      hardDiskDetails: quote.items.find(i => i.description.toLowerCase().includes('purple') || i.description.toLowerCase().includes('hard drive') || i.description.toLowerCase().includes('tb'))?.description || 'Surveillance Grade Storage',
      technicianId,
      technicianName,
      status: 'Scheduled',
      notes: `Converted from Quotation ${quote.quoteNumber}. Contract total: KSh ${quote.totalAmount.toLocaleString()}`,
      remoteViewingApp: 'Hik-Connect / DMSS Cloud',
      warrantyEndDate: new Date(Date.now() + 365 * 24 * 3600 * 1000 * 2).toISOString().substring(0, 10),
      camerasList,
      contractValue: quote.totalAmount
    };

    this.saveInstallation(newInst, true);

    // Update quotation status
    const updatedQuote: Quotation = {
      ...quote,
      status: 'Converted to Installation'
    };
    this.saveQuotation(updatedQuote, false);

    this.logActivity('Admin', 'Converted Quote to Installation', 'Installation', `Quotation ${quote.quoteNumber} converted to active project ${newInst.id} for ${quote.customerName}`);
    return newInst;
  },

  // Aggregate Metrics & Dashboard Data
  getDashboardStats() {
    const customers = this.getCustomers();
    const installations = this.getInstallations();
    const serviceRequests = this.getServiceRequests();
    const quotations = this.getQuotations();
    const equipment = this.getEquipment();

    // Total cameras across installations
    let activeCameras = 0;
    let camerasUnderMaintenance = 0;
    let offlineCameras = 0;

    installations.forEach(inst => {
      if (inst.camerasList && inst.camerasList.length > 0) {
        inst.camerasList.forEach(cam => {
          if (cam.status === 'Active') activeCameras++;
          else if (cam.status === 'Under Maintenance') camerasUnderMaintenance++;
          else if (cam.status === 'Offline') offlineCameras++;
        });
      } else {
        // Fallback calculation based on number of cameras
        activeCameras += inst.numberOfCameras;
      }
    });

    // Pending service requests
    const pendingServices = serviceRequests.filter(s => s.status !== 'Completed' && s.status !== 'Cancelled').length;

    // Financial totals (Total Sales / Revenue from quotations that are paid or partially paid)
    const totalSales = quotations.reduce((acc, q) => acc + q.totalAmount, 0);
    const totalRevenueCollected = quotations.reduce((acc, q) => acc + q.amountPaid, 0);
    const totalOutstandingBalance = quotations.reduce((acc, q) => acc + q.balance, 0);

    // Low stock count
    const lowStockCount = equipment.filter(e => e.status === 'Low Stock' || e.status === 'Out of Stock').length;

    return {
      totalCustomers: customers.length,
      totalInstallations: installations.length,
      activeCameras,
      camerasUnderMaintenance,
      offlineCameras,
      totalCamerasTracked: activeCameras + camerasUnderMaintenance + offlineCameras,
      pendingServices,
      totalSales,
      totalRevenueCollected,
      totalOutstandingBalance,
      lowStockCount,
      recentActivities: this.getActivities().slice(0, 10)
    };
  }
};
