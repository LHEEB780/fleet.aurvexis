export type VehicleStatus = 'active' | 'maintenance' | 'stopped';

export interface Vehicle {
  id: string;
  name: string;
  type: string;
  classification?: string; // e.g. 'truck' | 'heavy_equipment' | 'service_car' | 'light_vehicle' | 'public_transport'
  plateNumber: string;
  department: string;
  subDepartment: string;
  status: VehicleStatus;
  lastMaintenance: string;
  image?: string;
  iconName?: string;
  chassisNumber?: string;
  modelYear?: string;
  fuelType?: 'diesel' | 'gasoline' | 'electric' | 'hybrid';
  loadingCapacity?: string;
  engineNumber?: string;
  insuranceExpiry?: string;
  // Tire details
  tireCount?: number;
  tireSize?: string;
  tirePressure?: string;
  tireStatus?: string;
  tireBrand?: string;
  assignedDriverId?: string;
  lat?: number;
  lng?: number;
}

export interface Driver {
  id: string;
  name: string;
  identityNumber: string; // National ID or Iqama
  licenseNumber: string;
  licenseType: string; // 'خفيف' | 'ثقيل' | 'عمومي' | 'إنشائي'
  licenseExpiry: string;
  phone: string;
  department: string;
  status: 'active' | 'suspended' | 'vacation';
  avatar: string;
  assignedVehicleId?: string;
  joinDate?: string;
}

export interface MaintenanceOrder {
  id: string;
  vehicleId: string;
  orderNumber: string;
  date: string;
  description: string;
  category: 'mechanical' | 'electrical' | 'cooling' | 'hydraulic' | 'bodywork' | 'tires' | 'brakes';
  status: 'pending' | 'in-progress' | 'completed';
  technicianId?: string;
  priority: 'low' | 'medium' | 'high';
  cost?: number;
  partsUsed?: string[];
  isArchived?: boolean;
  workshopId?: string;
  progress?: number;
  milestones?: { title: string; checked: boolean }[];
  lastUpdate?: string;
  techNotes?: string;
  photoUrl?: string;
  estimatedDuration?: string;
  signature?: string;
  obdCode?: string;
  symptom?: string;
  externalInvoiceNo?: string;
  externalInvoiceStatus?: 'pending_invoice' | 'received_unpaid' | 'paid';
  externalInvoiceImage?: string;
  externalInvoiceImages?: string[];
  photoBeforeUrl?: string;
  photoAfterUrl?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  minQuantity: number;
  category: string;
  price?: number;
  shelfLocation?: string;
  compatibleVehicles?: string[];
  supplier?: string;
  image?: string;
  brand?: string;
  sku?: string;
  condition?: 'new' | 'used' | 'refurbished';
  boxQuantity?: number;
  weight?: string;
  lastOrderedDate?: string;
  managerNotes?: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  reliability: number; // 1 - 5 stars
  categories: string[];
  status: 'active' | 'suspended';
  type?: 'supplier' | 'external_workshop' | 'both';
}

export interface SupplyOrder {
  id: string;
  vendorId: string;
  vendorName: string;
  partId: string;
  partName: string;
  partNumber: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  status: 'pending' | 'delivered' | 'cancelled' | 'delayed';
  deliveryNote?: string;
}

export interface Technician {
  id: string;
  name: string;
  role: string;
  specialization: 'mechanical' | 'electrical' | 'cooling' | 'hydraulic' | 'bodywork';
  activeTasks: number;
  status: 'available' | 'busy' | 'away';
  avatar: string;
  joinDate: string;
  phone: string;
  workLogs?: { date: string; hours: number }[];
  skills?: string[];
}

export type UserRole = 'admin' | 'technician' | 'viewer' | 'driver';

export interface User {
  id: string;
  name: string;
  title: string;
  role: UserRole;
  avatar: string;
}

export type SafetyCheckStatus = 'pass' | 'warning' | 'fail' | 'na';

export interface SafetyCheckItem {
  id: string;
  nameAr: string;
  nameEn: string;
  status: SafetyCheckStatus;
  notes?: string;
  category: 'brakes' | 'fluids' | 'engine' | 'tires' | 'lights' | 'body' | 'safety' | 'electronics' | 'cabin' | 'other';
}

export interface SafetyInspection {
  id: string;
  orderId: string;
  orderNumber: string;
  vehicleId: string;
  vehicleName: string;
  checkedBy: string;
  timestamp: string;
  type: 'before' | 'after'; // before or after maintenance
  items: SafetyCheckItem[];
  overallStatus: 'safe' | 'warning' | 'unsafe';
  notes?: string;
  signature?: string;
}

export function hasGranularPermission(permissionId: string, userRole: string): boolean {
  try {
    // If Read-only mode is active, prevent all administrative and modifying actions
    if (localStorage.getItem('saas_read_only_mode') === 'true') {
      return false;
    }

    const saved = localStorage.getItem('saas_granular_permissions');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const perm = parsed.find((p: any) => p.id === permissionId);
        if (perm && perm.roles) {
          return !!perm.roles[userRole];
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
  
  // Default fallbacks
  const defaults: Record<string, Record<string, boolean>> = {
    'delete-maintenance-record': { admin: true, fleet_manager: false, technician: false, viewer: false },
    'edit-vehicle-data': { admin: true, fleet_manager: true, technician: false, viewer: false },
    'issue-financial-report': { admin: true, fleet_manager: true, technician: false, viewer: false },
    'bypass-safety-checklist': { admin: true, fleet_manager: false, technician: false, viewer: false },
    'approve-parts-issuance': { admin: true, fleet_manager: true, technician: false, viewer: false },
    'edit-completed-orders': { admin: true, fleet_manager: false, technician: false, viewer: false },
    'force-reset-password': { admin: true, fleet_manager: false, technician: false, viewer: false }
  };
  
  const permDefault = defaults[permissionId];
  if (permDefault) {
    return !!permDefault[userRole];
  }
  return false;
}


