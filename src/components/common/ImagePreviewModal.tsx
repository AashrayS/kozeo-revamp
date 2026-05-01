import React, { useEffect, useState } from "react";
import { X, ZoomIn, Download, ExternalLink } from "lucide-react";

interface ImagePreviewModalProps {
  imgUrl: string | null;
  onClose: () => void;
  altText?: string;
  title?: string;
  showActions?: boolean;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ 
  imgUrl, 
  onClose, 
  altText = "Preview Image",
  title,
  showActions = true
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset loading state when imgUrl changes
  useEffect(() => {
    if (imgUrl) {
      setImageLoaded(false);
      setImageError(false);
    }
  }, [imgUrl]);
  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (imgUrl) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [imgUrl, onClose]);

  if (!imgUrl) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleOpenInNewTab = () => {
    window.open(imgUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur effect */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-10 flex flex-col max-w-7xl max-h-[95vh] w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-md rounded-t-2xl border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <ZoomIn className="w-5 h-5 text-white" />
            </div>
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-white">{title}</h3>
              )}
              <p className="text-sm text-white/70">Image Preview</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {showActions && (
              <>
                <button
                  onClick={handleDownload}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200 group"
                  title="Download Image"
                >
                  <Download className="w-4 h-4 text-white group-hover:text-blue-300" />
                </button>
                <button
                  onClick={handleOpenInNewTab}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200 group"
                  title="Open in New Tab"
                >
                  <ExternalLink className="w-4 h-4 text-white group-hover:text-blue-300" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors duration-200 group"
              title="Close (Esc)"
            >
              <X className="w-4 h-4 text-white group-hover:text-red-300" />
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div 
          className="flex-1 flex items-center justify-center p-6 bg-white/5 backdrop-blur-md rounded-b-2xl border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative max-w-full max-h-full">
            {/* Loading State - Only show when image is not loaded */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/20 rounded-xl z-10">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <p className="text-white/70 text-sm">Loading image...</p>
                </div>
              </div>
            )}
            
            {/* Error State */}
            {imageError && (
              <div className="flex flex-col items-center justify-center p-8 text-white/70">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                  <X className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-lg font-medium mb-2">Failed to load image</p>
                <p className="text-sm text-white/50">The image could not be displayed</p>
              </div>
            )}
            
            {/* Image */}
            <img
              src={imgUrl}
              alt={altText}
              className={`max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl ring-1 ring-white/20 transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ 
                maxWidth: "90vw",
                filter: "drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5))"
              }}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              loading="lazy"
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-2 text-center">
          <p className="text-xs text-white/50">
            Press <kbd className="px-2 py-1 bg-white/10 rounded text-white/70">Esc</kbd> to close • 
            Click outside to close
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;