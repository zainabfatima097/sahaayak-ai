import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
   MessageCircle, Share2, MapPin, 
  ThumbsUp, Trash2, Edit2, MoreVertical, X, AlertTriangle
} from 'lucide-react';
import { useUserContext } from '../../context/UserContext';
import { db, doc, updateDoc } from '../../components/services/firebase/config';

const StoryCard = ({ story, onHelpful, onDelete, onEdit }) => {
  const navigate = useNavigate();
  const { userContext } = useUserContext();
  const [isHelping, setIsHelping] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(story.title);
  const [editContent, setEditContent] = useState(story.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Check if current user is the owner of this story
  const isOwner = userContext.isAuthenticated && userContext.uid === story.userId;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const domainColors = {
    agriculture: { bg: 'bg-green-50', border: 'border-green-200', icon: '🌾', text: 'text-green-700', gradient: 'from-green-600 to-emerald-600' },
    healthcare: { bg: 'bg-red-50', border: 'border-red-200', icon: '🏥', text: 'text-red-700', gradient: 'from-red-600 to-rose-600' },
    education: { bg: 'bg-blue-50', border: 'border-blue-200', icon: '📚', text: 'text-blue-700', gradient: 'from-blue-600 to-cyan-600' },
    schemes: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: '📋', text: 'text-yellow-700', gradient: 'from-yellow-600 to-orange-600' }
  };

  const colors = domainColors[story.domain] || domainColors.agriculture;

  const handleHelpfulClick = async () => {
    setIsHelping(true);
    await onHelpful(story.id);
    setIsHelping(false);
  };

  const handleEditSubmit = async () => {
    if (!editTitle.trim() || !editContent.trim()) return;
    
    try {
      const storyRef = doc(db, 'success_stories', story.id);
      await updateDoc(storyRef, {
        title: editTitle,
        content: editContent,
        updatedAt: new Date()
      });
      // Update local state
      story.title = editTitle;
      story.content = editContent;
      onEdit?.(story.id, { title: editTitle, content: editContent });
      setIsEditing(false);
      setShowMenu(false);
    } catch (error) {
      console.error('Error editing story:', error);
      alert('Failed to edit story. Please try again.');
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete(story.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('Failed to delete story. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Edit mode view
  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div className={`px-4 py-3 ${colors.bg} border-b ${colors.border}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{colors.icon}</span>
              <span className={`text-xs font-semibold ${colors.text} uppercase`}>{story.domain}</span>
            </div>
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="p-4">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full text-lg font-bold text-gray-800 mb-3 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
            placeholder="Title"
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows="4"
            className="w-full text-gray-600 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 resize-none"
            placeholder="Your story..."
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleEditSubmit}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal view
  return (
    <>
      <div 
        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
        onClick={() => navigate(`/story/${story.id}`)}
      >
        {/* Domain Badge */}
        <div className={`px-4 py-2 ${colors.bg} border-b ${colors.border} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{colors.icon}</span>
            <span className={`text-xs font-semibold ${colors.text} uppercase`}>{story.domain}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{formatDate(story.createdAt)}</span>
            {/* Show three-dot menu ONLY for story owner */}
            {isOwner && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <MoreVertical size={14} className="text-gray-500" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-6 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10 min-w-[100px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        setIsEditing(true);
                      }}
                      className="w-full px-3 py-1.5 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
              {story.userName?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{story.userName}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <MapPin size={12} />
                <span>{story.userVillage || 'Rural India'}</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
            {story.title}
          </h3>

          {/* Content Preview */}
          <p className={`text-gray-600 text-sm leading-relaxed line-clamp-3`}>
            {story.content}
          </p>

          {/* Media Preview */}
          {story.mediaType === 'image' && story.mediaUrl && (
            <div className="mt-3 rounded-lg overflow-hidden">
              <img 
                src={story.mediaUrl} 
                alt={story.title}
                className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-6 mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleHelpfulClick();
              }}
              disabled={isHelping}
              className={`flex items-center gap-2 text-sm transition-colors ${
                story.isHelpful ? 'text-green-600' : 'text-gray-500 hover:text-green-600'
              }`}
            >
              <ThumbsUp size={16} />
              <span>{story.helpfulCount || 0}</span>
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/story/${story.id}`);
              }}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              <MessageCircle size={16} />
              <span>{story.commentCount || 0}</span>
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigator.share?.({
                  title: story.title,
                  text: story.content,
                  url: window.location.origin + `/story/${story.id}`
                }).catch(() => {});
              }}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-600 transition-colors"
            >
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Delete Story?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. This story will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                {isDeleting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Trash2 size={16} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StoryCard;