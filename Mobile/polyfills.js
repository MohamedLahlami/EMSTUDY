// Polyfills pour l'environnement web
if (typeof window !== 'undefined') {
  // Créer un objet de stockage alternatif pour les navigateurs qui bloquent localStorage
  window._inMemoryStorage = {};
  
  // Remplacer localStorage s'il est bloqué
  try {
    // Test d'accès à localStorage
    window.localStorage.setItem('test', 'test');
    window.localStorage.removeItem('test');
  } catch (e) {
    // Si localStorage est bloqué, créer un remplacement en mémoire
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: function(key) {
          return window._inMemoryStorage[key] || null;
        },
        setItem: function(key, value) {
          window._inMemoryStorage[key] = value;
        },
        removeItem: function(key) {
          delete window._inMemoryStorage[key];
        },
        clear: function() {
          window._inMemoryStorage = {};
        }
      },
      writable: true
    });
    console.log('Utilisation du stockage en mémoire (polyfill localStorage)');
  }
}

// Patch pour AsyncStorage dans un environnement web
if (typeof global !== 'undefined') {
  global._asyncStorageInMemory = {};
  
  // Créer un AsyncStorage fallback
  global._asyncStorageFallback = {
    getItem: (key) => {
      return Promise.resolve(global._asyncStorageInMemory[key] || null);
    },
    setItem: (key, value) => {
      global._asyncStorageInMemory[key] = value;
      return Promise.resolve(true);
    },
    removeItem: (key) => {
      delete global._asyncStorageInMemory[key];
      return Promise.resolve(true);
    },
    clear: () => {
      global._asyncStorageInMemory = {};
      return Promise.resolve(true);
    },
    getAllKeys: () => {
      return Promise.resolve(Object.keys(global._asyncStorageInMemory));
    },
    multiGet: (keys) => {
      const values = keys.map(key => [key, global._asyncStorageInMemory[key] || null]);
      return Promise.resolve(values);
    },
    multiSet: (keyValuePairs) => {
      keyValuePairs.forEach(([key, value]) => {
        global._asyncStorageInMemory[key] = value;
      });
      return Promise.resolve(true);
    },
    multiRemove: (keys) => {
      keys.forEach(key => {
        delete global._asyncStorageInMemory[key];
      });
      return Promise.resolve(true);
    }
  };
}

export default {}; 