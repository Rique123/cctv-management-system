export type Role = 'admin' | 'technician';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
  technicianId?: string;
  avatar?: string;
}

export type CameraType = 'Dome' | 'Bullet' | 'PTZ' | 'Solar' | 'Wi-Fi' | 'IP Camera';

export type EquipmentCategory = 
  | 'Cameras' 
  | 'DVR/NVR' 
  | 'Hard Drives' 
  | 'Memory Cards' 
  | 'Solar & Power' 
  | 'Cables' 
  | 'Connectors & Accessories';

export type EquipmentStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Under Maintenance';

export interface EquipmentItem {
  id: string;
  name: string;
  model: string;
  category: EquipmentCategory;
  cameraType?: CameraType;
  brand: string;
  serialNumber: string;
  quantity: number;
  minStockThreshold: number;
  purchasePrice: number; // in KSh
  sellingPrice: number; // in KSh
  status: EquipmentStatus;
  specifications: string;
  locationInStore?: string;
  warrantyPeriodMonths?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  address?: string;
  customerType: 'Residential' | 'Commercial' | 'Industrial' | 'Institution';
  notes?: string;
  createdAt: string;
}

export type InstallationStatus = 
  | 'Scheduled' 
  | 'In Progress' 
  | 'Testing & Commissioning' 
  | 'Completed' 
  | 'On Hold';

export interface InstalledCameraPoint {
  id: string;
  cameraName: string;
  cameraType: CameraType;
  channelNumber: number;
  locationName: string; // e.g. "Main Gate", "Reception", "Back Alley", "Server Room"
  status: 'Active' | 'Under Maintenance' | 'Offline';
  ipAddress?: string;
  resolution?: string;
}

export interface Installation {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  installationLocation: string;
  installationDate: string;
  completionDate?: string;
  numberOfCameras: number;
  cameraTypes: CameraType[];
  dvrNvrDetails: string;
  hardDiskDetails: string;
  technicianId: string;
  technicianName: string;
  status: InstallationStatus;
  notes?: string;
  remoteViewingApp?: string; // e.g. Hik-Connect, DMSS, SuperLive Plus
  warrantyEndDate?: string;
  camerasList: InstalledCameraPoint[];
  contractValue?: number; // in KSh
}

export type ServiceIssueType = 
  | 'Camera offline'
  | 'DVR/NVR problems'
  | 'No video display'
  | 'Storage problems'
  | 'Network connection problems'
  | 'Camera turning on and off'
  | 'Power supply failure'
  | 'Other';

export type ServicePriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type ServiceStatus = 
  | 'Reported' 
  | 'Assigned' 
  | 'In Progress' 
  | 'Waiting for Parts' 
  | 'Completed' 
  | 'Cancelled';

export interface ServiceRequest {
  id: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  installationId?: string;
  location: string;
  issueType: ServiceIssueType;
  description: string;
  priority: ServicePriority;
  technicianId?: string;
  technicianName?: string;
  status: ServiceStatus;
  serviceNotes: {
    timestamp: string;
    author: string;
    text: string;
  }[];
  partsCost: number; // in KSh
  laborCost: number; // in KSh
  totalCost: number; // in KSh
  createdAt: string;
  resolvedAt?: string;
  resolutionSummary?: string;
}

export interface Technician {
  id: string;
  name: string;
  phone: string;
  email: string;
  nationalId: string;
  specialization: string[]; // e.g. ['IP Cameras', 'Fiber Optic', 'Solar CCTV', 'NVR/Storage', 'Access Control']
  status: 'Available' | 'On Site' | 'Off Duty';
  activeJobsCount: number;
  completedJobsCount: number;
  rating: number; // out of 5
  joinDate: string;
}

export interface QuotationItem {
  id: string;
  equipmentId?: string;
  description: string;
  quantity: number;
  unitPrice: number; // in KSh
  total: number; // in KSh
  type: 'equipment' | 'service';
}

export type PaymentMethod = 'M-Pesa' | 'Cash' | 'Bank Transfer' | 'Cheque';
export type PaymentStatus = 'Pending' | 'Partially Paid' | 'Paid';
export type QuotationStatus = 'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Converted to Installation';

export interface Quotation {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerLocation: string;
  date: string;
  validUntil: string;
  items: QuotationItem[];
  subtotal: number;
  taxRate: number; // percentage, e.g. 16 or 0
  taxAmount: number;
  discount: number;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: QuotationStatus;
  notes?: string;
  terms?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  category: 'Customer' | 'Installation' | 'Service' | 'Equipment' | 'Quotation' | 'Technician' | 'Auth';
  details: string;
}
