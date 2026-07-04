// Safe Storage Wrapper to prevent synchronous SecurityErrors (CORS / iframe block)
// when browsers block third-party local storage access.

class SafeStorage implements Storage {
  private memoryStorage: Record<string, string> = {};
  private isAvailable: boolean = false;
  private backend: Storage | null = null;

  constructor(type: 'localStorage' | 'sessionStorage') {
    try {
      const storage = window[type];
      if (storage) {
        const testKey = '__storage_test__';
        storage.setItem(testKey, testKey);
        storage.removeItem(testKey);
        this.backend = storage;
        this.isAvailable = true;
      }
    } catch (e) {
      this.isAvailable = false;
      this.backend = null;
      console.warn(`[SafeStorage] ${type} is not accessible. Falling back to in-memory mock storage.`, e);
    }
  }

  get length(): number {
    if (this.isAvailable && this.backend) {
      try {
        return this.backend.length;
      } catch (e) {}
    }
    return Object.keys(this.memoryStorage).length;
  }

  clear(): void {
    if (this.isAvailable && this.backend) {
      try {
        this.backend.clear();
        return;
      } catch (e) {}
    }
    this.memoryStorage = {};
  }

  getItem(key: string): string | null {
    if (this.isAvailable && this.backend) {
      try {
        return this.backend.getItem(key);
      } catch (e) {}
    }
    return Object.prototype.hasOwnProperty.call(this.memoryStorage, key) ? this.memoryStorage[key] : null;
  }

  key(index: number): string | null {
    if (this.isAvailable && this.backend) {
      try {
        return this.backend.key(index);
      } catch (e) {}
    }
    const keys = Object.keys(this.memoryStorage);
    return index >= 0 && index < keys.length ? keys[index] : null;
  }

  removeItem(key: string): void {
    if (this.isAvailable && this.backend) {
      try {
        this.backend.removeItem(key);
        return;
      } catch (e) {}
    }
    delete this.memoryStorage[key];
  }

  setItem(key: string, value: string): void {
    if (this.isAvailable && this.backend) {
      try {
        this.backend.setItem(key, value);
        return;
      } catch (e) {}
    }
    this.memoryStorage[key] = String(value);
  }
}

export const safeLocalStorage = new SafeStorage('localStorage');
export const safeSessionStorage = new SafeStorage('sessionStorage');
