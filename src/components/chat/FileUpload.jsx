import { useState } from 'react';
import { Upload, File, FileText, X, Loader2 } from 'lucide-react';

const FileUpload = ({ onFileAnalyze, isProcessing }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain'];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setError(null);

    if (!file) return;

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File too large. Max 5MB');
      return;
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('File type not supported. Use images, PDFs, or text files.');
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      onFileAnalyze(selectedFile);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
  };

  return (
    <div style={{ marginBottom: 12 }}>
      {!selectedFile ? (
        <label className="file-upload-label" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '12px',
          border: '2px dashed #dcfce7',
          borderRadius: 12,
          cursor: 'pointer',
          background: '#f9fafb',
          transition: 'all 0.2s'
        }}>
          <input
            type="file"
            accept="image/*,.pdf,.txt"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <Upload size={18} color="#15803d" />
          <span style={{ fontSize: 13, color: '#6b7280' }}>
            Upload image, PDF, or document (Max 5MB)
          </span>
        </label>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 12px',
          background: '#f0fdf4',
          borderRadius: 12,
          border: '1px solid #bbf7d0'
        }}>
          {preview ? (
            <img src={preview} alt="Preview" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
          ) : (
            <File size={20} color="#15803d" />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedFile.name}
            </p>
            <p style={{ fontSize: 11, color: '#9ca3af' }}>
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            onClick={clearFile}
            style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X size={16} color="#9ca3af" />
          </button>
          <button
            onClick={handleAnalyze}
            disabled={isProcessing}
            style={{
              padding: '6px 12px',
              background: 'linear-gradient(135deg,#22c55e,#10b981)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
            Analyze
          </button>
        </div>
      )}
      {error && (
        <p style={{ fontSize: 12, color: '#ef4444', marginTop: 8 }}>{error}</p>
      )}
    </div>
  );
};

export default FileUpload;