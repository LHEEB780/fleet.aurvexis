/**
 * Safe local storage utility with automatic quota management,
 * image compression, and graceful error handling.
 */

// Keys that are expendable or can be aggressively trimmed when quota is tight
const TRIMMED_KEYS_CONFIG: { key: string; maxEntries: number }[] = [
  { key: 'fleet_barcode_queue', maxEntries: 10 },
  { key: 'fleet_inventory_tx_v2', maxEntries: 50 },
  { key: 'fleet_audits_history_v2', maxEntries: 10 },
  { key: 'fleet_system_notifications_v1', maxEntries: 15 },
  { key: 'saas_critical_audit_logs', maxEntries: 20 },
  { key: 'fleet_notified_schedules_48h', maxEntries: 10 },
  { key: 'fleet_offline_sync_queue', maxEntries: 10 },
  { key: 'fleet_offline_maintenance_queue', maxEntries: 10 }
];

/**
 * Prunes expendable arrays stored in localStorage to free up space.
 */
export function freeStorageSpace(): number {
  let freedCount = 0;
  try {
    for (const config of TRIMMED_KEYS_CONFIG) {
      const raw = localStorage.getItem(config.key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > config.maxEntries) {
            const trimmed = parsed.slice(-config.maxEntries);
            localStorage.setItem(config.key, JSON.stringify(trimmed));
            freedCount++;
          }
        } catch (e) {
          // If corrupted, remove
          localStorage.removeItem(config.key);
          freedCount++;
        }
      }
    }

    // Also remove temporary non-vital caches if still needed
    const expendableKeys = [
      'fleet_barcode_queue',
      'last_synced_schedules',
      'scanned_plate_from_qr',
      'scanned_vehicle_id_from_qr'
    ];
    for (const k of expendableKeys) {
      if (localStorage.getItem(k)) {
        localStorage.removeItem(k);
        freedCount++;
      }
    }
  } catch (e) {
    console.warn('[Storage] Error during freeStorageSpace:', e);
  }
  return freedCount;
}

/**
 * Strips or downsamples heavy base64 images from an inventory JSON string.
 */
export function sanitizeInventoryJson(rawJson: string): string {
  try {
    const items = JSON.parse(rawJson);
    if (!Array.isArray(items)) return rawJson;

    const sanitized = items.map((item: any) => {
      if (item && typeof item === 'object') {
        // If image is a huge data URL (> 20KB), remove or reduce
        if (typeof item.image === 'string' && item.image.startsWith('data:image/') && item.image.length > 25000) {
          return {
            ...item,
            image: '' // Clear heavy base64 to restore storage quota
          };
        }
      }
      return item;
    });

    return JSON.stringify(sanitized);
  } catch (e) {
    return rawJson;
  }
}

/**
 * Safely sets an item in localStorage, handling QuotaExceededError automatically.
 * NEVER throws an exception that crashes React components.
 */
export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    console.warn(`[Storage] localStorage.setItem failed for key "${key}". Attempting quota recovery...`, err);

    try {
      // 1. Free up space from secondary caches
      freeStorageSpace();

      // 2. If it's inventory data, strip oversized images
      let cleanValue = value;
      if (key === 'fleet_inventory_v2') {
        cleanValue = sanitizeInventoryJson(value);
      } else if (key === 'fleet_inventory_tx_v2') {
        // Keep only latest 60 transactions
        try {
          const txs = JSON.parse(value);
          if (Array.isArray(txs) && txs.length > 60) {
            cleanValue = JSON.stringify(txs.slice(-60));
          }
        } catch (e) {}
      }

      // 3. Retry setting with cleaned value
      localStorage.setItem(key, cleanValue);
      return true;
    } catch (retryErr) {
      console.error(`[Storage] Recovery failed for key "${key}". Quota remains exceeded.`, retryErr);

      // 4. Last ditch effort: if it's inventory, try stripping ALL images
      if (key === 'fleet_inventory_v2') {
        try {
          const items = JSON.parse(value);
          if (Array.isArray(items)) {
            const stripped = items.map((it: any) => ({ ...it, image: '' }));
            localStorage.setItem(key, JSON.stringify(stripped));
            return true;
          }
        } catch (finalErr) {
          console.error('[Storage] Final recovery failed', finalErr);
        }
      }

      // Return false safely without crashing caller
      return false;
    }
  }
}

/**
 * Safely gets an item from localStorage without throwing.
 */
export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.warn(`[Storage] localStorage.getItem failed for key "${key}":`, err);
    return null;
  }
}

/**
 * Safely removes an item from localStorage without throwing.
 */
export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[Storage] localStorage.removeItem failed for key "${key}":`, err);
  }
}

/**
 * Compresses an image (File, Blob, or base64 data URL) into a lightweight
 * thumbnail data URL (typically 10-30 KB instead of megabytes).
 */
export async function compressImage(
  input: File | Blob | string,
  maxWidth = 320,
  maxHeight = 320,
  quality = 0.65
): Promise<string> {
  return new Promise((resolve) => {
    // If input is an empty string, resolve immediately
    if (typeof input === 'string' && !input) {
      resolve('');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let { width, height } = img;

        // Calculate aspect ratio scaling
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(typeof input === 'string' ? input : '');
          return;
        }

        // Draw image smoothly
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert to JPEG with balanced compression
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      } catch (err) {
        console.warn('[Storage] Canvas compression error, fallback to original:', err);
        resolve(typeof input === 'string' ? input : '');
      }
    };

    img.onerror = () => {
      console.warn('[Storage] Failed to load image for compression');
      resolve(typeof input === 'string' ? input : '');
    };

    if (typeof input === 'string') {
      img.src = input;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = (e.target?.result as string) || '';
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(input);
    }
  });
}

/**
 * Self-healing routine to fix existing bloated localStorage on application boot.
 */
export function sanitizeEntireLocalStorage(): void {
  try {
    const rawInv = localStorage.getItem('fleet_inventory_v2');
    if (rawInv && rawInv.length > 800000) { // If > 800KB
      const cleaned = sanitizeInventoryJson(rawInv);
      if (cleaned.length < rawInv.length) {
        localStorage.setItem('fleet_inventory_v2', cleaned);
        console.info(`[Storage] Auto-sanitized fleet_inventory_v2: reduced from ${(rawInv.length/1024).toFixed(1)}KB to ${(cleaned.length/1024).toFixed(1)}KB`);
      }
    }
  } catch (e) {
    console.warn('[Storage] sanitizeEntireLocalStorage error:', e);
  }
}
