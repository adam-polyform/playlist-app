import { useRef } from 'react';
import './PhotoCapture.css';

function PhotoCapture({ onPhotoCapture, disabled }) {
  const fileInputRef = useRef(null);

  // Supported formats by Claude API
  const supportedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  // Convert image to JPEG if it's not a supported format
  const convertToSupportedFormat = (dataUrl, file) => {
    return new Promise((resolve) => {
      const fileType = file.type;

      // If already a supported format, use as-is
      if (supportedFormats.includes(fileType)) {
        resolve(dataUrl);
        return;
      }

      // Convert unsupported formats (like AVIF) to JPEG
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve(jpegDataUrl);
      };
      img.onerror = () => {
        // If conversion fails, try to use original
        resolve(dataUrl);
      };
      img.src = dataUrl;
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const convertedData = await convertToSupportedFormat(event.target.result, file);
        onPhotoCapture(convertedData);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="photo-capture">
      <div className="capture-options">
        <div className="upload-wrapper">
          <div className="gradient-blob gradient-blob-upload"></div>
          <div className="upload-area" onClick={() => !disabled && fileInputRef.current.click()}>
            <p>Click to upload a photo</p>
            <span className="upload-hint">or drag and drop</span>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}

export default PhotoCapture;
