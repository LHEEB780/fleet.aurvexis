// Global storage polyfill for iframe / sandboxed environments
// This must be imported at the very top of main.tsx before any other imports!

(function() {
  const createSafeStorage = (type: 'localStorage' | 'sessionStorage') => {
    const memoryStore: Record<string, string> = {};
    let backend: Storage | null = null;
    let isAvailable = false;
    try {
      backend = window[type];
      if (backend) {
        backend.setItem('__sandbox_test__', '1');
        backend.removeItem('__sandbox_test__');
        isAvailable = true;
      }
    } catch (e) {
      isAvailable = false;
      backend = null;
    }

    const safeStorageObj = {
      get length() {
        if (isAvailable && backend) {
          try { return backend.length; } catch (e) {}
        }
        return Object.keys(memoryStore).length;
      },
      clear() {
        if (isAvailable && backend) {
          try { backend.clear(); return; } catch (e) {}
        }
        for (const k in memoryStore) delete memoryStore[k];
      },
      getItem(key: string) {
        if (isAvailable && backend) {
          try { return backend.getItem(key); } catch (e) {}
        }
        return Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : null;
      },
      setItem(key: string, value: string) {
        if (isAvailable && backend) {
          try { backend.setItem(key, value); return; } catch (e) {}
        }
        memoryStore[key] = String(value);
      },
      removeItem(key: string) {
        if (isAvailable && backend) {
          try { backend.removeItem(key); return; } catch (e) {}
        }
        delete memoryStore[key];
      },
      key(index: number) {
        if (isAvailable && backend) {
          try { return backend.key(index); } catch (e) {}
        }
        return Object.keys(memoryStore)[index] || null;
      }
    };

    return safeStorageObj;
  };

  const safeLocal = createSafeStorage('localStorage');
  const safeSession = createSafeStorage('sessionStorage');

  const applyPolyfill = (name: 'localStorage' | 'sessionStorage', fallback: any) => {
    let works = false;
    try {
      const test = window[name];
      if (test) {
        test.setItem('__test_access__', '1');
        test.removeItem('__test_access__');
        works = true;
      }
    } catch (e) {
      works = false;
    }

    if (!works) {
      console.warn(`[Iframe Storage Polyfill] ${name} is blocked/restricted. Injecting memory-based safe fallback...`);
      
      // Override Window.prototype
      try {
        Object.defineProperty(Window.prototype, name, {
          get() { return fallback; },
          configurable: true
        });
      } catch (e) {}

      // Override window directly
      try {
        Object.defineProperty(window, name, {
          get() { return fallback; },
          configurable: true
        });
      } catch (e) {}

      // Override globalThis
      try {
        Object.defineProperty(globalThis, name, {
          get() { return fallback; },
          configurable: true
        });
      } catch (e) {}
    }
  };

  applyPolyfill('localStorage', safeLocal);
  applyPolyfill('sessionStorage', safeSession);
})();
