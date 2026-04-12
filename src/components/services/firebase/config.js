import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  addDoc,
  deleteDoc,
  increment
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6-3fVUKemrBCC0SvM73XAvke8dpYj_Mw",
  authDomain: "sahaayak-ai-84c2c.firebaseapp.com",
  projectId: "sahaayak-ai-84c2c",
  storageBucket: "sahaayak-ai-84c2c.firebasestorage.app",
  messagingSenderId: "332447676892",
  appId: "1:332447676892:web:c9c1df63bbb9d9d9303719"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services - THESE ARE THE EXPORTS YOU NEED
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Collections
const USERS_COLLECTION = 'users';
const CHATS_COLLECTION = 'chats';
const SCHEMES_COLLECTION = 'schemes';
const FEEDBACK_COLLECTION = 'feedback';
const NOTIFICATIONS_COLLECTION = 'notifications';

// ============ AUTH FUNCTIONS ============
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Google sign in error:', error);
    return { success: false, error: error.message };
  }
};

const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
};

// ============ USER FUNCTIONS ============
const createUserProfile = async (user, additionalData = {}) => {
  if (!user) return { success: false, error: 'No user provided' };

  const userRef = doc(db, USERS_COLLECTION, user.uid);
  
  try {
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const { email, displayName, photoURL, phoneNumber } = user;
      const createdAt = new Date();

      const userData = {
        uid: user.uid,
        email: email || '',
        displayName: displayName || additionalData.name || '',
        photoURL: photoURL || '',
        phoneNumber: phoneNumber || additionalData.phone || '',
        location: additionalData.location || '',
        occupation: additionalData.occupation || 'farmer',
        incomeLevel: additionalData.income_level || 'below_poverty_line',
        language: additionalData.language || 'Hindi',
        voicePreferred: additionalData.voice_preferred !== false,
        notificationsEnabled: additionalData.notifications_enabled !== false,
        createdAt,
        lastLogin: createdAt,
        stats: {
          totalQueries: 0,
          savedSchemes: 0,
          daysActive: 1
        }
      };
      
      await setDoc(userRef, userData);
      return { success: true, userData };
    } else {
      await updateDoc(userRef, {
        lastLogin: new Date()
      });
      return { success: true, userData: userSnap.data() };
    }
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    return { success: false, error: error.message };
  }
};

const getUserProfile = async (uid) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return { success: true, data: userSnap.data() };
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { success: false, error: error.message };
  }
};

const updateUserProfile = async (uid, updates) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: error.message };
  }
};

// ============ CHAT SESSION FUNCTIONS ============
const createChatSession = async (userId, domain, title) => {
  try {
    const sessionRef = collection(db, 'chat_sessions');
    const newSession = {
      userId,
      domain,
      title: title || `${domain} Chat - ${new Date().toLocaleString()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0
    };
    const docRef = await addDoc(sessionRef, newSession);
    return { success: true, sessionId: docRef.id, data: { id: docRef.id, ...newSession } };
  } catch (error) {
    console.error('Error creating chat session:', error);
    return { success: false, error: error.message };
  }
};

const getUserChatSessions = async (userId, domain = null) => {
  try {
    let q;
    if (domain) {
      q = query(
        collection(db, 'chat_sessions'),
        where('userId', '==', userId),
        where('domain', '==', domain),
        orderBy('updatedAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'chat_sessions'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
    }
    const querySnapshot = await getDocs(q);
    const sessions = [];
    querySnapshot.forEach(doc => {
      sessions.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, sessions };
  } catch (error) {
    console.error('Error getting chat sessions:', error);
    return { success: false, error: error.message, sessions: [] };
  }
};

const getChatMessages = async (sessionId) => {
  try {
    const q = query(
      collection(db, 'chat_messages'),
      where('sessionId', '==', sessionId),
      orderBy('timestamp', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const messages = [];
    querySnapshot.forEach(doc => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, messages };
  } catch (error) {
    console.error('Error getting chat messages:', error);
    return { success: false, error: error.message, messages: [] };
  }
};

const saveChatMessageToFirebase = async (sessionId, userId, message, domain) => {
  try {
    const messageRef = collection(db, 'chat_messages');
    const newMessage = {
      sessionId,
      userId,
      domain,
      type: message.type,
      text: message.text,
      timestamp: new Date(),
      actionable: message.actionable || null
    };
    const docRef = await addDoc(messageRef, newMessage);
    
    const sessionRef = doc(db, 'chat_sessions', sessionId);
    await updateDoc(sessionRef, {
      updatedAt: new Date(),
      messageCount: increment(1)
    });
    
    return { success: true, messageId: docRef.id };
  } catch (error) {
    console.error('Error saving chat message:', error);
    return { success: false, error: error.message };
  }
};

const deleteChatSession = async (sessionId) => {
  try {
    const messagesQuery = query(
      collection(db, 'chat_messages'),
      where('sessionId', '==', sessionId)
    );
    const messagesSnapshot = await getDocs(messagesQuery);
    const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    await deleteDoc(doc(db, 'chat_sessions', sessionId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting chat session:', error);
    return { success: false, error: error.message };
  }
};

const renameChatSession = async (sessionId, newTitle) => {
  try {
    const sessionRef = doc(db, 'chat_sessions', sessionId);
    await updateDoc(sessionRef, {
      title: newTitle,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error renaming chat session:', error);
    return { success: false, error: error.message };
  }
};

// Fixed updateUserStats function
const updateUserStats = async (userId, statsUpdate) => {
  try {
    if (!userId) {
      console.error('No userId provided for stats update');
      return { success: false, error: 'No userId provided' };
    }
    
    const userRef = doc(db, USERS_COLLECTION, userId);
    const updateField = {};
    updateField[`stats.${statsUpdate.field}`] = increment(statsUpdate.increment);
    
    await updateDoc(userRef, updateField);
    return { success: true };
  } catch (error) {
    console.error('Error updating user stats:', error);
    // Don't fail the whole operation if stats update fails
    return { success: false, error: error.message };
  }
};

// ============ EXPORT ALL ============
export {
  // Firebase instances
  app,
  auth,
  db,
  storage,
  googleProvider,
  
  // Collection names
  USERS_COLLECTION,
  CHATS_COLLECTION,
  SCHEMES_COLLECTION,
  FEEDBACK_COLLECTION,
  NOTIFICATIONS_COLLECTION,
  
  // Auth functions
  signInWithGoogle,
  signOutUser,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  
  // User functions
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  updateUserStats,
  
  // Chat session functions
  createChatSession,
  getUserChatSessions,
  getChatMessages,
  saveChatMessageToFirebase,
  deleteChatSession,
  renameChatSession,
  
  // Firestore functions
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  addDoc,
  deleteDoc,
  increment,
  
  // Storage functions
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
};

// Add these to your existing config.js exports

// Collections
export const STORIES_COLLECTION = 'success_stories';
export const STORY_HELPFUL_COLLECTION = 'story_helpful';
export const STORY_COMMENTS_COLLECTION = 'story_comments';

// Story Functions
export const createStory = async (storyData) => {
  try {
    const storyRef = collection(db, STORIES_COLLECTION);
    const newStory = {
      ...storyData,
      helpfulCount: 0,
      commentCount: 0,
      status: 'pending', // pending, approved, rejected
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const docRef = await addDoc(storyRef, newStory);
    return { success: true, storyId: docRef.id };
  } catch (error) {
    console.error('Error creating story:', error);
    return { success: false, error: error.message };
  }
};

export const getStories = async (filters = {}) => {
  try {
    let q = query(
      collection(db, STORIES_COLLECTION),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );
    
    if (filters.domain && filters.domain !== 'all') {
      q = query(q, where('domain', '==', filters.domain));
    }
    
    if (filters.language && filters.language !== 'all') {
      q = query(q, where('language', '==', filters.language));
    }
    
    const querySnapshot = await getDocs(q);
    const stories = [];
    querySnapshot.forEach(doc => {
      stories.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, stories };
  } catch (error) {
    console.error('Error getting stories:', error);
    return { success: false, error: error.message, stories: [] };
  }
};

export const getStoryById = async (storyId) => {
  try {
    const storyRef = doc(db, STORIES_COLLECTION, storyId);
    const storySnap = await getDoc(storyRef);
    if (storySnap.exists()) {
      return { success: true, story: { id: storySnap.id, ...storySnap.data() } };
    }
    return { success: false, error: 'Story not found' };
  } catch (error) {
    console.error('Error getting story:', error);
    return { success: false, error: error.message };
  }
};

export const toggleHelpful = async (storyId, userId) => {
  try {
    const helpfulRef = collection(db, STORY_HELPFUL_COLLECTION);
    const q = query(helpfulRef, where('storyId', '==', storyId), where('userId', '==', userId));
    const existing = await getDocs(q);
    
    const storyRef = doc(db, STORIES_COLLECTION, storyId);
    
    if (!existing.empty) {
      // Remove helpful
      await deleteDoc(existing.docs[0].ref);
      await updateDoc(storyRef, {
        helpfulCount: increment(-1)
      });
      return { success: true, isHelpful: false };
    } else {
      // Add helpful
      await addDoc(helpfulRef, {
        storyId,
        userId,
        createdAt: new Date()
      });
      await updateDoc(storyRef, {
        helpfulCount: increment(1)
      });
      return { success: true, isHelpful: true };
    }
  } catch (error) {
    console.error('Error toggling helpful:', error);
    return { success: false, error: error.message };
  }
};

export const checkUserHelpful = async (storyId, userId) => {
  try {
    const helpfulRef = collection(db, STORY_HELPFUL_COLLECTION);
    const q = query(helpfulRef, where('storyId', '==', storyId), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return { success: true, isHelpful: !snapshot.empty };
  } catch (error) {
    console.error('Error checking helpful:', error);
    return { success: false, isHelpful: false };
  }
};

export const addStoryComment = async (storyId, userId, userName, comment, language) => {
  try {
    const commentRef = collection(db, STORY_COMMENTS_COLLECTION);
    await addDoc(commentRef, {
      storyId,
      userId,
      userName,
      comment,
      language,
      createdAt: new Date()
    });
    
    // Update comment count
    const storyRef = doc(db, STORIES_COLLECTION, storyId);
    await updateDoc(storyRef, {
      commentCount: increment(1)
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error adding comment:', error);
    return { success: false, error: error.message };
  }
};

export const getStoryComments = async (storyId) => {
  try {
    const q = query(
      collection(db, STORY_COMMENTS_COLLECTION),
      where('storyId', '==', storyId),
      orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const comments = [];
    querySnapshot.forEach(doc => {
      comments.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, comments };
  } catch (error) {
    console.error('Error getting comments:', error);
    return { success: false, error: error.message, comments: [] };
  }
};