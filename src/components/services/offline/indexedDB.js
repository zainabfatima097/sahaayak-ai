import { openDB } from 'idb';

const DB_NAME = 'sahaayak_db';
const DB_VERSION = 1;

export async function initDB() {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store for chat history
      if (!db.objectStoreNames.contains('chat_history')) {
        const chatStore = db.createObjectStore('chat_history', { keyPath: 'id', autoIncrement: true });
        chatStore.createIndex('timestamp', 'timestamp');
      }
      
      // Store for cached AI responses
      if (!db.objectStoreNames.contains('cached_responses')) {
        const cacheStore = db.createObjectStore('cached_responses', { keyPath: 'query_hash' });
        cacheStore.createIndex('timestamp', 'timestamp');
      }
      
      // Store for offline queue
      if (!db.objectStoreNames.contains('offline_queue')) {
        db.createObjectStore('offline_queue', { keyPath: 'id', autoIncrement: true });
      }
      
      // Store for user profile
      if (!db.objectStoreNames.contains('user_profile')) {
        db.createObjectStore('user_profile', { keyPath: 'userId' });
      }
    },
  });
  return db;
}

export async function saveChatMessage(message) {
  const db = await initDB();
  return db.add('chat_history', {
    ...message,
    timestamp: Date.now()
  });
}

export async function getChatHistory(limit = 50) {
  const db = await initDB();
  const messages = await db.getAllFromIndex('chat_history', 'timestamp');
  return messages.slice(-limit);
}

export async function cacheResponse(queryHash, response) {
  const db = await initDB();
  return db.put('cached_responses', {
    query_hash: queryHash,
    response: response,
    timestamp: Date.now()
  });
}

export async function getCachedResponse(queryHash) {
  const db = await initDB();
  const cached = await db.get('cached_responses', queryHash);
  
  // Cache for 24 hours
  if (cached && (Date.now() - cached.timestamp) < 24 * 60 * 60 * 1000) {
    return cached.response;
  }
  return null;
}

export async function addToOfflineQueue(request) {
  const db = await initDB();
  return db.add('offline_queue', {
    ...request,
    timestamp: Date.now(),
    retryCount: 0
  });
}

export async function getOfflineQueue() {
  const db = await initDB();
  return db.getAll('offline_queue');
}

export async function removeFromOfflineQueue(id) {
  const db = await initDB();
  return db.delete('offline_queue', id);
}

export async function saveUserProfile(userId, profile) {
  const db = await initDB();
  return db.put('user_profile', { userId, ...profile });
}

export async function getUserProfile(userId) {
  const db = await initDB();
  return db.get('user_profile', userId);
}