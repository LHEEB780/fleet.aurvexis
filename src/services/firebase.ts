import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore,
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  collection, 
  getDocFromServer,
  setLogLevel
} from 'firebase/firestore';
import firebaseConfig from './firebaseConfig';
import { safeLocalStorage, getStorageJson, setStorageJson } from './safeStorage';

// Silence Firestore internal network warnings (e.g., connection failures in offline/emulation mode)
try {
  setLogLevel('silent');
} catch (e) {
  console.warn("Could not set Firestore log level:", e);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let dbInstance: any = null;
try {
  const dbId = firebaseConfig.firestoreDatabaseId;
  const settings = {
    experimentalForceLongPolling: true,
    ignoreUndefinedProperties: true
  };
  dbInstance = (dbId && dbId !== "" && dbId !== "(default)")
    ? initializeFirestore(app, settings, dbId)
    : initializeFirestore(app, settings);
} catch (error) {
  console.warn("Could not initialize Firestore with custom settings/firestoreDatabaseId, trying fallback:", error);
  try {
    const dbId = firebaseConfig.firestoreDatabaseId;
    if (dbId && dbId !== "" && dbId !== "(default)") {
      dbInstance = getFirestore(app, dbId);
    } else {
      dbInstance = getFirestore(app);
    }
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
    // Attempt a lightweight server lookup with a fast timeout (2.5s) to avoid blocking
    const fetchPromise = getDocFromServer(doc(db, 'settings', 'live-test'));
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Timeout after 2500ms")), 2500)
    );
    await Promise.race([fetchPromise, timeoutPromise]);
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

// Centralized configurations for data synchronization to avoid duplicated block handlers
interface SyncConfig {
  collectionName: string;
  storageKeys: string[];
  getLabel: (item: any) => string;
}

const SYNC_CONFIGS: SyncConfig[] = [
  {
    collectionName: 'vehicles',
    storageKeys: ['fleet_vehicles_v3', 'fleet_vehicles_v2'],
    getLabel: (item: any) => item.plateNumber || item.name || item.model || item.id
  },
  {
    collectionName: 'maintenance_orders',
    storageKeys: ['fleet_maintenance_orders_v2'],
    getLabel: (item: any) => item.type ? `${item.type} (${item.id})` : item.id
  },
  {
    collectionName: 'technicians',
    storageKeys: ['fleet_technicians_v2'],
    getLabel: (item: any) => item.name || item.id
  },
  {
    collectionName: 'inventory',
    storageKeys: ['fleet_inventory_v2'],
    getLabel: (item: any) => item.name ? `${item.name} (${item.id})` : item.id
  },
  {
    collectionName: 'safety_inspections',
    storageKeys: ['fleet_safety_inspections'],
    getLabel: (item: any) => item.inspectorName ? `${item.inspectorName} (${item.id})` : item.id
  }
];

// Bulk Upload (Local Storage -> Cloud Firestore)
export async function pushLocalDataToCloud(): Promise<{ success: boolean; count: number }> {
  if (!db) {
    console.warn("Firestore is deactivated or not provisioned yet. Skipping push synthesis.");
    return { success: false, count: 0 };
  }
  let count = 0;
  try {
    // Process regular fleet collections
    for (const config of SYNC_CONFIGS) {
      let items: any[] = [];
      for (const key of config.storageKeys) {
        items = getStorageJson<any[]>(key, []);
        if (items.length > 0) break;
      }
      
      for (const item of items) {
        if (item.id) {
          await saveDocument(config.collectionName, item.id, item);
          count++;
        }
      }
    }

    // Process app-wide branding settings
    const brandName = safeLocalStorage.getItem('saas_brand_name') || '';
    const brandDesc = safeLocalStorage.getItem('saas_brand_desc') || '';
    const brandLogo = safeLocalStorage.getItem('saas_brand_logo') || '';
    const brandColor = safeLocalStorage.getItem('saas_brand_color') || 'blue';
    const brandPrimaryColor = safeLocalStorage.getItem('saas_brand_primary_color') || '#6d28d9';
    
    await saveDocument('settings', 'branding', {
      name: brandName,
      description: brandDesc,
      logo: brandLogo,
      color: brandColor,
      primaryColor: brandPrimaryColor,
      updatedAt: new Date().toISOString()
    });
    count++;

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
    // Process regular fleet collections
    for (const config of SYNC_CONFIGS) {
      try {
        const snap = await getDocs(collection(db, config.collectionName));
        const list: any[] = [];
        snap.forEach((doc) => {
          list.push(doc.data());
          count++;
        });
        
        if (list.length > 0) {
          for (const key of config.storageKeys) {
            setStorageJson(key, list);
          }
        }
      } catch (e) {
        console.warn(`Could not download collection "${config.collectionName}", fallback to local storage`, e);
      }
    }

    // Download custom branding settings
    const brandingDoc = await getDoc(doc(db, 'settings', 'branding'));
    if (brandingDoc.exists()) {
      const bData = brandingDoc.data();
      if (bData.name) safeLocalStorage.setItem('saas_brand_name', bData.name);
      if (bData.description) safeLocalStorage.setItem('saas_brand_desc', bData.description);
      if (bData.logo) safeLocalStorage.setItem('saas_brand_logo', bData.logo);
      if (bData.color) safeLocalStorage.setItem('saas_brand_color', bData.color);
      if (bData.primaryColor) safeLocalStorage.setItem('saas_brand_primary_color', bData.primaryColor);
      count++;
    }

    // Trigger window storage event to refresh React state
    window.dispatchEvent(new Event('storage'));
    return { success: true, count };
  } catch (error) {
    console.error("Bulk restore error", error);
    return { success: false, count };
  }
}

export interface ConflictItem {
  id: string;
  collection: string;
  localData: any;
  cloudData: any;
  label: string;
}

export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  
  const keysA = Object.keys(a).filter(k => k !== 'syncedAt' && k !== 'lastUpdated' && k !== 'updatedAt');
  const keysB = Object.keys(b).filter(k => k !== 'syncedAt' && k !== 'lastUpdated' && k !== 'updatedAt');
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  
  return true;
}

export async function getSyncConflicts(): Promise<ConflictItem[]> {
  const conflicts: ConflictItem[] = [];
  if (!db) return conflicts;

  try {
    for (const config of SYNC_CONFIGS) {
      try {
        let localItems: any[] = [];
        for (const key of config.storageKeys) {
          localItems = getStorageJson<any[]>(key, []);
          if (localItems.length > 0) break;
        }

        const snap = await getDocs(collection(db, config.collectionName));
        const cloudMap: Record<string, any> = {};
        snap.forEach(d => { cloudMap[d.id] = d.data(); });

        localItems.forEach((item: any) => {
          if (item.id && cloudMap[item.id]) {
            const cloudItem = cloudMap[item.id];
            if (!deepEqual(item, cloudItem)) {
              conflicts.push({
                id: item.id,
                collection: config.collectionName,
                localData: item,
                cloudData: cloudItem,
                label: config.getLabel(item)
              });
            }
          }
        });
      } catch (err) {
        console.warn(`Error scanning conflicts for collection "${config.collectionName}":`, err);
      }
    }
  } catch (error) {
    console.error("Error detecting conflicts", error);
  }

  return conflicts;
}

export async function resolveConflictKeepLocal(conflict: ConflictItem): Promise<void> {
  await saveDocument(conflict.collection, conflict.id, conflict.localData);
}

export function resolveConflictKeepCloud(conflict: ConflictItem) {
  const config = SYNC_CONFIGS.find(c => c.collectionName === conflict.collection);
  if (config) {
    for (const key of config.storageKeys) {
      const list = getStorageJson<any[]>(key, []);
      const idx = list.findIndex((item: any) => item.id === conflict.id);
      if (idx > -1) {
        list[idx] = conflict.cloudData;
        setStorageJson(key, list);
      }
    }
  }
  window.dispatchEvent(new Event('storage'));
}
