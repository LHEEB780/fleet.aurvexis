import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  collection, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from './firebaseConfig';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let dbInstance: any = null;
try {
  const dbId = firebaseConfig.firestoreDatabaseId;
  dbInstance = (dbId && dbId !== "" && dbId !== "(default)")
    ? getFirestore(app, dbId)
    : getFirestore(app);
} catch (error) {
  console.warn("Could not initialize Firestore with custom firestoreDatabaseId, trying normal fallback:", error);
  try {
    dbInstance = getFirestore(app);
  } catch (err2) {
    console.error("Firestore is completely unavailable or not enabled on this Firebase project:", err2);
    dbInstance = null;
  }
}

export const db = dbInstance;

let authInstance: any = null;
try {
  authInstance = getAuth(app);
} catch (err) {
  console.error("Auth initialization failed:", err);
}

export const auth = authInstance;

// Error logger as specified in SKILL.md
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
    },
    operationType,
    path
  };
  console.error('Firestore Error Detailed Info: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Check database live state
export async function testFirestoreConnection(): Promise<boolean> {
  if (!db) {
    console.warn("Firestore db object is null, connection cannot be tested.");
    return false;
  }
  try {
    // Attempt a lightweight server lookup
    await getDocFromServer(doc(db, 'settings', 'live-test'));
    return true;
  } catch (error) {
    console.warn("Firestore connection check failed, using local fallback state", error);
    return false;
  }
}

// Single Document Operations
export async function saveDocument(colName: string, docId: string, data: any): Promise<void> {
  const path = `${colName}/${docId}`;
  if (!db) {
    console.warn(`Firestore is unavailable. Cannot save document to ${path}.`);
    return;
  }
  try {
    const cleanData = JSON.parse(JSON.stringify(data)); // strip undefined fields
    await setDoc(doc(db, colName, docId), cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteDocument(colName: string, docId: string): Promise<void> {
  const path = `${colName}/${docId}`;
  if (!db) {
    console.warn(`Firestore is unavailable. Cannot delete document from ${path}.`);
    return;
  }
  try {
    await deleteDoc(doc(db, colName, docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Bulk Upload (Local Storage -> Cloud Firestore)
export async function pushLocalDataToCloud(): Promise<{ success: boolean; count: number }> {
  if (!db) {
    console.warn("Firestore is deactivated or not provisioned yet. Skipping push synthesis.");
    return { success: false, count: 0 };
  }
  let count = 0;
  try {
    // 1. Vehicles
    const vehiclesStr = localStorage.getItem('fleet_vehicles_v3') || localStorage.getItem('fleet_vehicles_v2');
    if (vehiclesStr) {
      const vehicles = JSON.parse(vehiclesStr);
      if (Array.isArray(vehicles)) {
        for (const v of vehicles) {
          if (v.id) {
            await saveDocument('vehicles', v.id, v);
            count++;
          }
        }
      }
    }

    // 2. Orders
    const ordersStr = localStorage.getItem('fleet_maintenance_orders_v2');
    if (ordersStr) {
      const orders = JSON.parse(ordersStr);
      if (Array.isArray(orders)) {
        for (const o of orders) {
          if (o.id) {
            await saveDocument('maintenance_orders', o.id, o);
            count++;
          }
        }
      }
    }

    // 3. Technicians
    const techsStr = localStorage.getItem('fleet_technicians_v2');
    if (techsStr) {
      const techs = JSON.parse(techsStr);
      if (Array.isArray(techs)) {
        for (const t of techs) {
          if (t.id) {
            await saveDocument('technicians', t.id, t);
            count++;
          }
        }
      }
    }

    // 4. Inventory
    const invStr = localStorage.getItem('fleet_inventory_v2');
    if (invStr) {
      const items = JSON.parse(invStr);
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item.id) {
            await saveDocument('inventory', item.id, item);
            count++;
          }
        }
      }
    }

    // 5. App-wide generic white-label settings
    const brandName = localStorage.getItem('saas_brand_name') || '';
    const brandDesc = localStorage.getItem('saas_brand_desc') || '';
    const brandLogo = localStorage.getItem('saas_brand_logo') || '';
    const brandColor = localStorage.getItem('saas_brand_color') || 'blue';
    await saveDocument('settings', 'branding', {
      name: brandName,
      description: brandDesc,
      logo: brandLogo,
      color: brandColor,
      updatedAt: new Date().toISOString()
    });
    count++;

    // 6. Safety Inspections
    const inspectionsStr = localStorage.getItem('fleet_safety_inspections');
    if (inspectionsStr) {
      const inspections = JSON.parse(inspectionsStr);
      if (Array.isArray(inspections)) {
        for (const insp of inspections) {
          if (insp.id) {
            await saveDocument('safety_inspections', insp.id, insp);
            count++;
          }
        }
      }
    }

    return { success: true, count };
  } catch (error) {
    console.error("Bulk sync error", error);
    return { success: false, count };
  }
}

// Bulk Download (Cloud Firestore -> Local Storage)
export async function pullCloudDataToLocal(): Promise<{ success: boolean; count: number }> {
  if (!db) {
    console.warn("Firestore is deactivated or not provisioned yet. Skipping pull synthesis.");
    return { success: false, count: 0 };
  }
  let count = 0;
  try {
    // 1. Download Vehicles
    const vehiclesSnap = await getDocs(collection(db, 'vehicles'));
    const vehiclesList: any[] = [];
    vehiclesSnap.forEach((d) => {
      vehiclesList.push(d.data());
      count++;
    });
    if (vehiclesList.length > 0) {
      localStorage.setItem('fleet_vehicles_v3', JSON.stringify(vehiclesList));
      localStorage.setItem('fleet_vehicles_v2', JSON.stringify(vehiclesList));
    }

    // 2. Download Orders
    const ordersSnap = await getDocs(collection(db, 'maintenance_orders'));
    const ordersList: any[] = [];
    ordersSnap.forEach((d) => {
      ordersList.push(d.data());
      count++;
    });
    if (ordersList.length > 0) {
      localStorage.setItem('fleet_maintenance_orders_v2', JSON.stringify(ordersList));
    }

    // 3. Download Technicians
    const techsSnap = await getDocs(collection(db, 'technicians'));
    const techsList: any[] = [];
    techsSnap.forEach((d) => {
      techsList.push(d.data());
      count++;
    });
    if (techsList.length > 0) {
      localStorage.setItem('fleet_technicians_v2', JSON.stringify(techsList));
    }

    // 4. Download Inventory
    const invSnap = await getDocs(collection(db, 'inventory'));
    const invList: any[] = [];
    invSnap.forEach((d) => {
      invList.push(d.data());
      count++;
    });
    if (invList.length > 0) {
      localStorage.setItem('fleet_inventory_v2', JSON.stringify(invList));
    }

    // 5. Download Custom Branding settings
    const brandingDoc = await getDoc(doc(db, 'settings', 'branding'));
    if (brandingDoc.exists()) {
      const bData = brandingDoc.data();
      if (bData.name) localStorage.setItem('saas_brand_name', bData.name);
      if (bData.description) localStorage.setItem('saas_brand_desc', bData.description);
      if (bData.logo) localStorage.setItem('saas_brand_logo', bData.logo);
      if (bData.color) localStorage.setItem('saas_brand_color', bData.color);
      count++;
    }

    // 6. Download Safety Inspections
    try {
      const inspectionsSnap = await getDocs(collection(db, 'safety_inspections'));
      const inspectionsList: any[] = [];
      inspectionsSnap.forEach((d) => {
        inspectionsList.push(d.data());
        count++;
      });
      if (inspectionsList.length > 0) {
        localStorage.setItem('fleet_safety_inspections', JSON.stringify(inspectionsList));
      }
    } catch (e) {
      console.warn("Could not download safety inspections, fallback to local storage", e);
    }

    // Trigger window storage event to refresh React state
    window.dispatchEvent(new Event('storage'));
    return { success: true, count };
  } catch (error) {
    console.error("Bulk restore error", error);
    return { success: false, count };
  }
}
