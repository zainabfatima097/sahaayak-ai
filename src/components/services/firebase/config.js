// Add these to your existing config.js file

// Chat Sessions functions
export const createChatSession = async (userId, domain, title) => {
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

export const getUserChatSessions = async (userId, domain = null) => {
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

export const getChatMessages = async (sessionId) => {
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

export const saveChatMessageToFirebase = async (sessionId, userId, message, domain) => {
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
    
    // Update session's updatedAt and messageCount
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

export const deleteChatSession = async (sessionId) => {
  try {
    // Delete all messages in the session
    const messagesQuery = query(
      collection(db, 'chat_messages'),
      where('sessionId', '==', sessionId)
    );
    const messagesSnapshot = await getDocs(messagesQuery);
    const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // Delete the session
    await deleteDoc(doc(db, 'chat_sessions', sessionId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting chat session:', error);
    return { success: false, error: error.message };
  }
};

export const renameChatSession = async (sessionId, newTitle) => {
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