import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Heart, MessageCircle, Share2, User, MapPin, Calendar, 
  ThumbsUp, ArrowLeft, Trash2, Send, Loader2, Sparkles,
  X, Check, AlertTriangle, BookOpen, Users, Star
} from 'lucide-react';
import { db, doc, getDoc, collection, addDoc, query, where, getDocs, deleteDoc, updateDoc, increment } from '../services/firebase/config';
import { useUserContext } from '../../context/UserContext';

/* ─── Global styles matching StoriesPage ─────────────────────────── */
const StoryDetailStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Noto+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');

    :root {
      --green-50:  #f0fdf4;
      --green-100: #dcfce7;
      --green-200: #bbf7d0;
      --green-500: #22c55e;
      --green-600: #16a34a;
      --green-700: #15803d;
      --green-800: #166534;
      --green-900: #14532d;
      --emerald-500: #10b981;
      --font-display: 'Baloo 2', 'Noto Sans Devanagari', sans-serif;
      --font-body: 'Noto Sans', sans-serif;
      --radius-sm: 8px;
      --radius-md: 14px;
      --radius-lg: 20px;
      --radius-xl: 28px;
      --radius-full: 9999px;
    }

    .sd-wrap { font-family: var(--font-body); }

    @keyframes sdFadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .sd-fade-in { animation: sdFadeIn 0.5s ease-out forwards; }

    @keyframes sdPulse {
      0%,100% { opacity:1; } 50% { opacity:0.5; }
    }
    .sd-pulse { animation: sdPulse 2s ease-in-out infinite; }

    @keyframes sdLikePop {
      0% { transform: scale(1); }
      50% { transform: scale(1.3); }
      100% { transform: scale(1); }
    }
    .sd-like-pop { animation: sdLikePop 0.3s ease-out; }

    @keyframes sdHeartFloat {
      0% { transform: translateY(0) scale(1); opacity: 1; }
      100% { transform: translateY(-50px) scale(1.5); opacity: 0; }
    }
    .sd-heart-float {
      position: absolute;
      pointer-events: none;
      animation: sdHeartFloat 0.8s ease-out forwards;
    }

    /* comment fade in */
    @keyframes sdCommentIn {
      from { opacity: 0; transform: translateX(-10px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .sd-comment-in { animation: sdCommentIn 0.3s ease-out forwards; }
  `}</style>
);

const StoryDetailPage = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const { userContext } = useUserContext();
  const [story, setStory] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [likeAnimation, setLikeAnimation] = useState(false);
  const [userLiked, setUserLiked] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState([]);

  const domainColors = {
    agriculture: { 
      bg: 'bg-green-50', border: 'border-green-200', icon: '🌾', text: 'text-green-700', 
      gradient: 'from-green-600 to-emerald-600', lightBg: '#dcfce7', primary: '#15803d'
    },
    healthcare: { 
      bg: 'bg-red-50', border: 'border-red-200', icon: '🏥', text: 'text-red-700', 
      gradient: 'from-red-600 to-rose-600', lightBg: '#fee2e2', primary: '#dc2626'
    },
    education: { 
      bg: 'bg-blue-50', border: 'border-blue-200', icon: '📚', text: 'text-blue-700', 
      gradient: 'from-blue-600 to-cyan-600', lightBg: '#dbeafe', primary: '#1d4ed8'
    },
    schemes: { 
      bg: 'bg-yellow-50', border: 'border-yellow-200', icon: '📋', text: 'text-yellow-700', 
      gradient: 'from-yellow-600 to-orange-600', lightBg: '#fef3c7', primary: '#b45309'
    }
  };

  const colors = story ? domainColors[story.domain] || domainColors.agriculture : domainColors.agriculture;

  useEffect(() => {
    loadStory();
    loadComments();
  }, [storyId]);

  const loadStory = async () => {
    try {
      const storyRef = doc(db, 'success_stories', storyId);
      const storySnap = await getDoc(storyRef);
      if (storySnap.exists()) {
        setStory({ id: storySnap.id, ...storySnap.data() });
        if (userContext.isAuthenticated) {
          const helpfulRef = collection(db, 'story_helpful');
          const q = query(helpfulRef, where('storyId', '==', storyId), where('userId', '==', userContext.uid));
          const snap = await getDocs(q);
          setUserLiked(!snap.empty);
        }
      } else {
        navigate('/stories');
      }
    } catch (error) {
      console.error('Error loading story:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const commentsRef = collection(db, 'story_comments');
      const q = query(commentsRef, where('storyId', '==', storyId));
      const querySnapshot = await getDocs(q);
      const loadedComments = [];
      querySnapshot.forEach(doc => {
        loadedComments.push({ id: doc.id, ...doc.data() });
      });
      setComments(loadedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleLike = async () => {
    if (!userContext.isAuthenticated) {
      alert('Please login to like stories');
      return;
    }

    setIsLiking(true);
    setLikeAnimation(true);
    
    // Create floating heart effect
    const heartId = Date.now();
    setFloatingHearts(prev => [...prev, heartId]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(id => id !== heartId));
    }, 800);
    
    setTimeout(() => setLikeAnimation(false), 300);

    try {
      const helpfulRef = collection(db, 'story_helpful');
      const q = query(helpfulRef, where('storyId', '==', storyId), where('userId', '==', userContext.uid));
      const existing = await getDocs(q);
      
      const storyRef = doc(db, 'success_stories', storyId);
      
      if (!existing.empty) {
        await deleteDoc(existing.docs[0].ref);
        await updateDoc(storyRef, {
          helpfulCount: increment(-1)
        });
        setUserLiked(false);
        setStory(prev => ({ ...prev, helpfulCount: (prev.helpfulCount || 0) - 1 }));
      } else {
        await addDoc(helpfulRef, {
          storyId,
          userId: userContext.uid,
          createdAt: new Date()
        });
        await updateDoc(storyRef, {
          helpfulCount: increment(1)
        });
        setUserLiked(true);
        setStory(prev => ({ ...prev, helpfulCount: (prev.helpfulCount || 0) + 1 }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async () => {
    if (!userContext.isAuthenticated) {
      alert('Please login to comment');
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const commentData = {
        storyId,
        userId: userContext.uid,
        userName: userContext.name || 'Anonymous',
        comment: newComment,
        language: userContext.language || 'Hindi',
        createdAt: new Date()
      };
      
      const commentsRef = collection(db, 'story_comments');
      const docRef = await addDoc(commentsRef, commentData);
      
      const storyRef = doc(db, 'success_stories', storyId);
      await updateDoc(storyRef, {
        commentCount: increment(1)
      });
      
      setComments(prev => [{ id: docRef.id, ...commentData }, ...prev]);
      setStory(prev => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteStory = async () => {
    setIsDeleting(true);
    try {
      const commentsRef = collection(db, 'story_comments');
      const q = query(commentsRef, where('storyId', '==', storyId));
      const commentsSnapshot = await getDocs(q);
      await Promise.all(commentsSnapshot.docs.map(doc => deleteDoc(doc.ref)));
      
      const helpfulRef = collection(db, 'story_helpful');
      const helpfulQ = query(helpfulRef, where('storyId', '==', storyId));
      const helpfulSnapshot = await getDocs(helpfulQ);
      await Promise.all(helpfulSnapshot.docs.map(doc => deleteDoc(doc.ref)));
      
      await deleteDoc(doc(db, 'success_stories', storyId));
      navigate('/stories');
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('Failed to delete story. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg,#22c55e,#10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 0 8px rgba(34,197,94,0.15)',
          }}>
            <Loader2 size={30} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
          <p style={{ fontFamily: 'var(--font-display)', color: '#16a34a', fontWeight: 600, fontSize: 16 }}>
            Loading story...
          </p>
        </div>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!story) return null;

  const isOwner = userContext.isAuthenticated && userContext.uid === story.userId;

  return (
    <div className="sd-wrap" style={{ background: '#fff', minHeight: '100vh' }}>
      <StoryDetailStyles />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>

      {/* Header with gradient matching StoriesPage */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.primary} 0%, #166534 40%, ${colors.primary} 100%)`,
        padding: '48px 24px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        
        <div className="sd-fade-in" style={{ maxWidth: 860, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Back button */}
          <button
            onClick={() => navigate('/stories')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '8px 20px', borderRadius: 'var(--radius-full)',
              color: '#fff', fontSize: 14, fontWeight: 500,
              cursor: 'pointer', marginBottom: 24,
              transition: 'background 0.2s',
              fontFamily: 'var(--font-display)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <ArrowLeft size={18} /> Back to Stories
          </button>

          {/* Domain badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '6px 16px', borderRadius: 'var(--radius-full)',
            marginBottom: 20,
          }}>
            <span style={{ fontSize: 16 }}>{colors.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#86efac', letterSpacing: '0.08em', fontFamily: 'var(--font-display)' }}>
              {story.domain?.toUpperCase()} STORY
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
            fontWeight: 800,
            color: '#fff',
            marginBottom: 16,
            lineHeight: 1.2,
          }}>
            {story.title}
          </h1>

          {/* Author info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg,#22c55e,#10b981)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 'bold', color: '#fff',
              }}>
                {story.userName?.charAt(0) || 'U'}
              </div>
              <div>
                <p style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>{story.userName}</p>
                <p style={{ fontSize: 12, color: '#86efac' }}>{story.userVillage || 'Rural India'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
              <Calendar size={14} />
              <span>{formatDate(story.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Story Content Card */}
        <div className="sd-fade-in" style={{
          background: '#fff',
          borderRadius: 'var(--radius-xl)',
          border: '1.5px solid #f0fdf4',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          marginBottom: 32,
        }}>
          <div style={{
            padding: '32px',
            borderBottom: '1.5px solid #f0fdf4',
          }}>
            <p style={{
              color: '#374151',
              fontSize: '1.05rem',
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
              fontFamily: 'var(--font-body)',
            }}>
              {story.content}
            </p>

            {/* Media */}
            {story.mediaType === 'image' && story.mediaUrl && (
              <div style={{ marginTop: 24, borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: '#f9fafb' }}>
                <img 
                  src={story.mediaUrl} 
                  alt={story.title}
                  style={{ width: '100%', maxHeight: 400, objectFit: 'contain' }}
                />
              </div>
            )}

            {story.mediaType === 'video' && story.mediaUrl && (
              <div style={{ marginTop: 24, borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <video 
                  src={story.mediaUrl} 
                  style={{ width: '100%', maxHeight: 400 }}
                  controls
                  poster={story.mediaThumbnail}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{
            padding: '16px 32px',
            background: '#f9fafb',
            display: 'flex',
            alignItems: 'center',
            gap: 32,
            flexWrap: 'wrap',
          }}>
            {/* Like Button with Animation */}
            <button
              onClick={handleLike}
              disabled={isLiking}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: userLiked ? colors.lightBg : 'transparent',
                padding: '8px 20px',
                borderRadius: 'var(--radius-full)',
                border: `1.5px solid ${userLiked ? colors.primary : '#e5e7eb'}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ position: 'relative' }}>
                <ThumbsUp 
                  size={18} 
                  color={userLiked ? colors.primary : '#6b7280'}
                  style={{ transform: likeAnimation ? 'scale(1.2)' : 'scale(1)', transition: 'transform 0.2s' }}
                />
                {floatingHearts.map(id => (
                  <div key={id} className="sd-heart-float" style={{ left: '50%', top: '-10px' }}>
                    ❤️
                  </div>
                ))}
              </div>
              <span style={{ fontWeight: 600, color: userLiked ? colors.primary : '#374151' }}>
                {story.helpfulCount || 0} {story.helpfulCount === 1 ? 'person found this helpful' : 'people found this helpful'}
              </span>
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280' }}>
              <MessageCircle size={18} />
              <span style={{ fontSize: 14 }}>{story.commentCount || 0} comments</span>
            </div>
            
            <button
              onClick={() => {
                navigator.share?.({
                  title: story.title,
                  text: story.content,
                  url: window.location.href
                }).catch(() => {});
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280',
                fontSize: 14,
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#22c55e'}
              onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
            >
              <Share2 size={18} />
              Share
            </button>

            {isOwner && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#ef4444',
                  fontSize: 14,
                  marginLeft: 'auto',
                }}
              >
                <Trash2 size={18} />
                Delete Story
              </button>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="sd-fade-in" style={{
          background: '#fff',
          borderRadius: 'var(--radius-xl)',
          border: '1.5px solid #f0fdf4',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        }}>
          <div style={{
            padding: '20px 28px',
            borderBottom: '1.5px solid #f0fdf4',
            background: colors.lightBg,
          }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 18,
              color: colors.primary,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <MessageCircle size={18} />
              Comments ({story.commentCount || 0})
            </h3>
          </div>

          {/* Add Comment */}
          <div style={{ padding: '24px 28px', borderBottom: '1px solid #f0fdf4' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg,#22c55e,#10b981)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 'bold', color: '#fff',
                flexShrink: 0,
              }}>
                {userContext.name?.charAt(0) || 'U'}
              </div>
              <div style={{ flex: 1 }}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows="2"
                  style={{
                    width: '100%',
                    border: '1.5px solid #e5e7eb',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    fontSize: 14,
                    fontFamily: 'var(--font-body)',
                    resize: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = colors.primary}
                  onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isSubmittingComment}
                  style={{
                    marginTop: 12,
                    background: `linear-gradient(135deg, ${colors.primary}, #10b981)`,
                    color: '#fff',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    fontFamily: 'var(--font-display)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    opacity: (!newComment.trim() || isSubmittingComment) ? 0.6 : 1,
                  }}
                >
                  {isSubmittingComment ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
                  Post Comment
                </button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div style={{ padding: '24px 28px' }}>
            {comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
                <p style={{ color: '#9ca3af', fontSize: 14 }}>No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {comments.map((comment, idx) => (
                  <div 
                    key={comment.id} 
                    className="sd-comment-in"
                    style={{ 
                      animationDelay: `${idx * 50}ms`,
                      display: 'flex', 
                      gap: 12,
                      paddingBottom: 16,
                      borderBottom: idx !== comments.length - 1 ? '1px solid #f0fdf4' : 'none',
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: '#f3f4f6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 'bold', color: '#6b7280',
                      flexShrink: 0,
                    }}>
                      {comment.userName?.charAt(0) || 'U'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, color: '#374151', fontSize: 14 }}>{comment.userName}</span>
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>{formatDate(comment.createdAt)}</span>
                      </div>
                      <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6 }}>{comment.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 'var(--radius-xl)',
            maxWidth: 400,
            width: '90%',
            padding: 28,
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <AlertTriangle size={28} color="#dc2626" />
            </div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 20,
              color: '#1f2937',
              marginBottom: 8,
            }}>Delete Story?</h3>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>
              This action cannot be undone. All likes and comments will be permanently removed.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1, padding: '10px', borderRadius: 'var(--radius-full)',
                  border: '1.5px solid #e5e7eb', background: '#fff',
                  color: '#6b7280', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'var(--font-display)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStory}
                disabled={isDeleting}
                style={{
                  flex: 1, padding: '10px', borderRadius: 'var(--radius-full)',
                  background: '#dc2626', color: '#fff', fontWeight: 600,
                  cursor: 'pointer', border: 'none', fontFamily: 'var(--font-display)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: isDeleting ? 0.6 : 1,
                }}
              >
                {isDeleting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={16} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryDetailPage;