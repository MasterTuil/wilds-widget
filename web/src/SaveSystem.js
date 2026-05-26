const SAVE_KEY = 'wilds_save_v1';

export class SaveSystem {
  save(state) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Save failed:', e);
    }
  }

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  clear() {
    localStorage.removeItem(SAVE_KEY);
  }

  // URL-based save sharing
  exportToURL(state) {
    const compressed = btoa(JSON.stringify(state));
    const url = `${window.location.origin}${window.location.pathname}?save=${compressed}`;
    navigator.clipboard?.writeText(url);
    return url;
  }

  importFromURL() {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('save');
    if (!raw) return null;
    try {
      return JSON.parse(atob(raw));
    } catch (e) {
      return null;
    }
  }
}
