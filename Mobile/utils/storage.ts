import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// In-memory storage fallback for when localStorage isn't available
class MemoryStorage {
  private storage: Record<string, string> = {};

  async getItem(key: string): Promise<string | null> {
    return this.storage[key] || null;
  }

  async setItem(key: string, value: string): Promise<boolean> {
    this.storage[key] = value;
    return true;
  }

  async removeItem(key: string): Promise<boolean> {
    delete this.storage[key];
    return true;
  }
}

// Create a singleton memory storage instance
const memoryStorage = new MemoryStorage();

// Wrapper for AsyncStorage with fallbacks for web
class SafeStorage {
  private _storage: any;
  private _memoryFallback: MemoryStorage;
  private _usingFallback: boolean = false;

  constructor() {
    this._storage = AsyncStorage;
    this._memoryFallback = memoryStorage;
    
    // Initialize storage based on platform
    this._initStorage();
  }

  private async _initStorage(): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        // Test if localStorage is available
        if (typeof window !== 'undefined' && window.localStorage) {
          // Try to use localStorage directly
          window.localStorage.setItem('storage_test', 'test');
          window.localStorage.removeItem('storage_test');
        } else {
          // If localStorage is undefined, use memory fallback
          this._usingFallback = true;
          console.log('localStorage not available, using memory fallback');
        }
      } catch (e) {
        // If any error occurs (like in private browsing), use memory fallback
        this._usingFallback = true;
        console.log('localStorage access denied, using memory fallback');
      }
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (this._usingFallback) {
          return await this._memoryFallback.getItem(key);
        }
        
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage.getItem(key);
          }
          return await this._memoryFallback.getItem(key);
        } catch (e) {
          console.warn('Local storage access denied:', e);
          this._usingFallback = true;
          return await this._memoryFallback.getItem(key);
        }
      }
      return await this._storage.getItem(key);
    } catch (e) {
      console.warn('Error accessing storage:', e);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        if (this._usingFallback) {
          return await this._memoryFallback.setItem(key, value);
        }
        
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(key, value);
            return true;
          }
          return await this._memoryFallback.setItem(key, value);
        } catch (e) {
          console.warn('Local storage access denied:', e);
          this._usingFallback = true;
          return await this._memoryFallback.setItem(key, value);
        }
      }
      await this._storage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn('Error setting storage:', e);
      return false;
    }
  }

  async removeItem(key: string): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        if (this._usingFallback) {
          return await this._memoryFallback.removeItem(key);
        }
        
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(key);
            return true;
          }
          return await this._memoryFallback.removeItem(key);
        } catch (e) {
          console.warn('Local storage access denied:', e);
          this._usingFallback = true;
          return await this._memoryFallback.removeItem(key);
        }
      }
      await this._storage.removeItem(key);
      return true;
    } catch (e) {
      console.warn('Error removing from storage:', e);
      return false;
    }
  }

  isUsingFallback(): boolean {
    return this._usingFallback;
  }
}

export const storage = new SafeStorage(); 