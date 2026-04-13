import React, { useState, useRef } from 'react';
import { X, Upload, Loader2, Sparkles } from 'lucide-react';
import { useUserContext } from '../../context/UserContext';

// ImgBB API Key - Get yours from https://imgbb.com/
const IMGBB_API_KEY = 'cc72605864dc3c08aad6c31d464d5b11'; // Replace with your actual API key

const PostStoryModal = ({ isOpen, onClose, onSubmit, domain }) => {
  const { userContext } = useUserContext();
  const [formData, setFormData] = useState({
    domain: domain || 'agriculture',
    title: '',
    content: '',
    language: 'Hindi',
    mediaType: 'none',
    mediaFile: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaPreview, setMediaPreview] = useState(null);
  const fileInputRef = useRef(null);

  const domains = [
    { id: 'agriculture', name: 'Agriculture', icon: '🌾' },
    { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
    { id: 'education', name: 'Education', icon: '📚' },
    { id: 'schemes', name: 'Government Schemes', icon: '📋' }
  ];

  const languages = ['Hindi', 'English', 'Marathi', 'Telugu', 'Tamil', 'Bengali'];

  const uploadToImgBB = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error(data.error?.message || 'Upload failed');
    }
  };

  const handleMediaSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File too large! Max 10MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    setFormData(prev => ({ ...prev, mediaType: 'image', mediaFile: file }));
    
    const reader = new FileReader();
    reader.onload = (e) => setMediaPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const uploadMedia = async () => {
    if (!formData.mediaFile) return null;
    
    try {
      setUploadProgress(50);
      const imageUrl = await uploadToImgBB(formData.mediaFile);
      setUploadProgress(100);
      return imageUrl;
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again or post without image.');
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in title and story');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      let mediaUrl = null;
      if (formData.mediaFile) {
        mediaUrl = await uploadMedia();
      }

      const storyData = {
        domain: formData.domain,
        title: formData.title,
        content: formData.content,
        language: formData.language,
        mediaType: mediaUrl ? 'image' : 'none',
        mediaUrl: mediaUrl,
        mediaThumbnail: mediaPreview || null
      };

      await onSubmit(storyData);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error posting story:', error);
      alert('Failed to post story. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setFormData({
      domain: domain || 'agriculture',
      title: '',
      content: '',
      language: 'Hindi',
      mediaType: 'none',
      mediaFile: null
    });
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4 shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-green-600" />
            <h2 className="text-xl font-bold text-gray-800">Share Your Success Story</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Domain Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Which domain does your story belong to?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {domains.map(d => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, domain: d.id }))}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    formData.domain === d.id
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <span className="text-xl mr-2">{d.icon}</span>
                  <span className="text-sm font-medium">{d.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Language / भाषा
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-green-500"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title / शीर्षक
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., How PM-KISAN helped my family"
              className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-green-500"
              required
            />
          </div>

          {/* Story Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Story / आपकी कहानी
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Share your experience in detail..."
              rows="6"
              className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-green-500 resize-none"
              required
            />
          </div>

          {/* Image Upload with ImgBB */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Add Photo (Optional) - Free image hosting
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-green-300 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleMediaSelect}
                className="hidden"
                id="media-upload"
              />
              {!mediaPreview ? (
                <label htmlFor="media-upload" className="cursor-pointer block">
                  <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to upload image</p>
                  <p className="text-xs text-gray-400 mt-1">Max 10MB · JPG, PNG, GIF</p>
                  <p className="text-xs text-green-600 mt-2">✓ Free hosting via ImgBB</p>
                </label>
              ) : (
                <div className="relative">
                  <img src={mediaPreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, mediaFile: null, mediaType: 'none' }));
                      setMediaPreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Posting your story...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Share Story</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostStoryModal;