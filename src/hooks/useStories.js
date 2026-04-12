import { useState, useEffect, useCallback } from 'react';
import { 
  db,
  STORIES_COLLECTION,
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  increment
} from '../components/services/firebase/config';
import { useUserContext } from '../context/UserContext';

export const useStories = (initialFilters = {}) => {
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const { userContext } = useUserContext();

  const loadStories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let q = query(
        collection(db, STORIES_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      let storiesList = [];
      querySnapshot.forEach(doc => {
        storiesList.push({ id: doc.id, ...doc.data() });
      });
      
      // Apply filters client-side
      if (filters.domain && filters.domain !== 'all') {
        storiesList = storiesList.filter(s => s.domain === filters.domain);
      }
      if (filters.language && filters.language !== 'all') {
        storiesList = storiesList.filter(s => s.language === filters.language);
      }
      
      // Check user helpful status
      if (userContext.isAuthenticated && userContext.uid) {
        const helpfulRef = collection(db, 'story_helpful');
        for (let story of storiesList) {
          const q = query(helpfulRef, where('storyId', '==', story.id), where('userId', '==', userContext.uid));
          const snap = await getDocs(q);
          story.isHelpful = !snap.empty;
        }
      }
      
      setStories(storiesList);
    } catch (error) {
      console.error('Error loading stories:', error);
      setError(error.message);
      setStories([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters.domain, filters.language, userContext.uid, userContext.isAuthenticated]);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  const postStory = async (storyData) => {
    try {
      const storyRef = collection(db, STORIES_COLLECTION);
      const newStory = {
        ...storyData,
        userId: userContext.uid || 'anonymous',
        userName: userContext.name || 'Anonymous User',
        userVillage: userContext.location || 'Rural India',
        helpfulCount: 0,
        commentCount: 0,
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const docRef = await addDoc(storyRef, newStory);
      await loadStories();
      return { success: true, storyId: docRef.id };
    } catch (error) {
      console.error('Error posting story:', error);
      return { success: false, error: error.message };
    }
  };

  const updateStory = async (storyId, updates) => {
    try {
      const storyRef = doc(db, STORIES_COLLECTION, storyId);
      await updateDoc(storyRef, {
        ...updates,
        updatedAt: new Date()
      });
      await loadStories();
      return { success: true };
    } catch (error) {
      console.error('Error updating story:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteStory = async (storyId) => {
    try {
      // Delete comments
      const commentsRef = collection(db, 'story_comments');
      const commentsQ = query(commentsRef, where('storyId', '==', storyId));
      const commentsSnap = await getDocs(commentsQ);
      await Promise.all(commentsSnap.docs.map(doc => deleteDoc(doc.ref)));
      
      // Delete helpful reactions
      const helpfulRef = collection(db, 'story_helpful');
      const helpfulQ = query(helpfulRef, where('storyId', '==', storyId));
      const helpfulSnap = await getDocs(helpfulQ);
      await Promise.all(helpfulSnap.docs.map(doc => deleteDoc(doc.ref)));
      
      // Delete story
      await deleteDoc(doc(db, STORIES_COLLECTION, storyId));
      await loadStories();
      return { success: true };
    } catch (error) {
      console.error('Error deleting story:', error);
      return { success: false, error: error.message };
    }
  };

  const handleHelpful = async (storyId) => {
    try {
      const helpfulRef = collection(db, 'story_helpful');
      const q = query(helpfulRef, where('storyId', '==', storyId), where('userId', '==', userContext.uid));
      const existing = await getDocs(q);
      
      const storyRef = doc(db, STORIES_COLLECTION, storyId);
      
      if (!existing.empty) {
        await deleteDoc(existing.docs[0].ref);
        await updateDoc(storyRef, {
          helpfulCount: increment(-1)
        });
        setStories(prev => prev.map(story => 
          story.id === storyId 
            ? { ...story, helpfulCount: (story.helpfulCount || 0) - 1, isHelpful: false }
            : story
        ));
      } else {
        await addDoc(helpfulRef, {
          storyId,
          userId: userContext.uid,
          createdAt: new Date()
        });
        await updateDoc(storyRef, {
          helpfulCount: increment(1)
        });
        setStories(prev => prev.map(story => 
          story.id === storyId 
            ? { ...story, helpfulCount: (story.helpfulCount || 0) + 1, isHelpful: true }
            : story
        ));
      }
      return { success: true };
    } catch (error) {
      console.error('Error toggling helpful:', error);
      return { success: false };
    }
  };

  const addComment = async (storyId, comment) => {
    return { success: true };
  };

  return {
    stories,
    isLoading,
    error,
    filters,
    setFilters,
    postStory,
    updateStory,
    deleteStory,
    handleHelpful,
    addComment,
    refreshStories: loadStories
  };
};