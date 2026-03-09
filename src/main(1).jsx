import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Polyfill window.storage to use localStorage (replaces Claude artifact storage)
if (!window.storage) {
  window.storage = {
    async get(key) {
      try {
        const val = localStorage.getItem(key);
        return val !== null ? { key, value: val } : null;
      } catch (e) { return null; }
    },
    async set(key, value) {
      try {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        return { key, value };
      } catch (e) { return null; }
    },
    async delete(key) {
      try {
        localStorage.removeItem(key);
        return { key, deleted: true };
      } catch (e) { return null; }
    },
    async list(prefix) {
      try {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (!prefix || k.startsWith(prefix)) keys.push(k);
        }
        return { keys };
      } catch (e) { return { keys: [] }; }
    }
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
