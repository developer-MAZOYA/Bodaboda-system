const memoryStore = new Map();

const notify = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-storage-change'));
  }
};

const browserStorage = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch (error) {
    return null;
  }
  return null;
};

const storage = {
  getItem(key) {
    const store = browserStorage();
    return store ? store.getItem(key) : memoryStore.get(key) || null;
  },
  setItem(key, value) {
    const store = browserStorage();
    if (store) {
      store.setItem(key, value);
      notify();
      return;
    }
    memoryStore.set(key, String(value));
    notify();
  },
  clear() {
    const store = browserStorage();
    if (store) {
      store.clear();
      notify();
      return;
    }
    memoryStore.clear();
    notify();
  }
};

export default storage;
