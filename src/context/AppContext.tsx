import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Customer, 
  EquipmentItem, 
  Installation, 
  ServiceRequest, 
  Technician, 
  Quotation, 
  ActivityLog, 
  User, 
  Role 
} from '../types';
import { StorageService } from '../services/storage';

export type NavTab = 
  | 'dashboard' 
  | 'customers' 
  | 'installations' 
  | 'equipment' 
  | 'service' 
  | 'technicians' 
  | 'quotations' 
  | 'inventory' 
  | 'reports'
  | 'livecam';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface AppContextType {
  // Navigation & Theme
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  // Auth & Roles
  currentUser: User;
  users: User[];
  switchUser: (user: User) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Data
  customers: Customer[];
  equipment: EquipmentItem[];
  installations: Installation[];
  serviceRequests: ServiceRequest[];
  technicians: Technician[];
  quotations: Quotation[];
  activities: ActivityLog[];
  refreshData: () => void;

  // Global actions
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  toasts: Toast[];
  removeToast: (id: string) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize storage
  useEffect(() => {
    StorageService.init();
  }, []);

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('rique_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Users
  const [currentUser, setCurrentUser] = useState<User>(() => StorageService.getCurrentUser());
  const [users, setUsers] = useState<User[]>(() => StorageService.getUsers());

  // Data entities
  const [customers, setCustomers] = useState<Customer[]>(() => StorageService.getCustomers());
  const [equipment, setEquipment] = useState<EquipmentItem[]>(() => StorageService.getEquipment());
  const [installations, setInstallations] = useState<Installation[]>(() => StorageService.getInstallations());
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(() => StorageService.getServiceRequests());
  const [technicians, setTechnicians] = useState<Technician[]>(() => StorageService.getTechnicians());
  const [quotations, setQuotations] = useState<Quotation[]>(() => StorageService.getQuotations());
  const [activities, setActivities] = useState<ActivityLog[]>(() => StorageService.getActivities());

  // Apply dark mode class to HTML
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('rique_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('rique_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const refreshData = () => {
    setCustomers(StorageService.getCustomers());
    setEquipment(StorageService.getEquipment());
    setInstallations(StorageService.getInstallations());
    setServiceRequests(StorageService.getServiceRequests());
    setTechnicians(StorageService.getTechnicians());
    setQuotations(StorageService.getQuotations());
    setActivities(StorageService.getActivities());
    setUsers(StorageService.getUsers());
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = 'toast-' + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const switchUser = (user: User) => {
    StorageService.setCurrentUser(user);
    setCurrentUser(user);
    showToast(`Logged in as ${user.name} (${user.role.toUpperCase()})`, 'info');
    refreshData();
  };

  const logout = () => {
    setIsAuthModalOpen(true);
  };

  const resetAllData = () => {
    StorageService.resetAll();
    refreshData();
    setCurrentUser(StorageService.getCurrentUser());
    showToast('Database reset to sample state successfully', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        isDarkMode,
        toggleDarkMode,
        mobileMenuOpen,
        setMobileMenuOpen,
        currentUser,
        users,
        switchUser,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        customers,
        equipment,
        installations,
        serviceRequests,
        technicians,
        quotations,
        activities,
        refreshData,
        showToast,
        toasts,
        removeToast,
        resetAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
