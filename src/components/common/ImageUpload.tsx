'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  onUpload: (url: string, fileId: string) => void;
  currentImage?: string;
  className?: string;
  accept?: string;
  uploadType?: string;
}

export default function ImageUpload({ 
  onUpload, 
  currentImage, 
  className,
  accept = "image/*",
  uploadType = "transaction"
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || '');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('📸 File selected:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Reset error
    setError('');

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File terlalu besar. Maksimal 5MB.');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Tipe file tidak didukung. Gunakan JPG, PNG, atau GIF.');
      return;
    }

    // Show preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }

    // Start upload process
    setUploading(true);
    setUploadProgress(0);

    try {
      console.log('🚀 Starting upload to local server...');
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', uploadType);

      // Upload to local API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      console.log('✅ Upload completed:', result);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Call onUpload with the file URL and ID
      onUpload(result.url, result.id || result.filename);

    } catch (error) {
      console.error('❌ Upload error:', error);
      setError(`Upload gagal: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setPreview(currentImage || '');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!currentImage) return;
    
    try {
      // Extract file ID from URL if needed
      const urlParts = currentImage.split('/');
      const fileId = urlParts[urlParts.length - 1];
      
      if (fileId) {
        const response = await fetch(`/api/files/${fileId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete file');
        }
      }

      setPreview('');
      onUpload('', ''); // Clear the upload
    } catch (error) {
      console.error('Delete error:', error);
      setError('Gagal menghapus file');
    }
  };

  return (
    <div className={className}>
      <div className="flex flex-col space-y-4">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Preview Image */}
        {preview && (
          <div className="relative w-32 h-32 group">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover rounded-lg border"
              onError={() => setPreview('')}
            />
            <button
              type="button"
              onClick={handleDelete}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              title="Hapus gambar"
            >
              ×
            </button>
          </div>
        )}
        
        {/* File Input */}
        <div>
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
          
          {/* Upload Progress */}
          {uploading && (
            <div className="mt-2">
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Mengunggah...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-1">
            Max 5MB. Format: JPG, PNG, GIF
          </p>
        </div>
      </div>
    </div>
  );
}
