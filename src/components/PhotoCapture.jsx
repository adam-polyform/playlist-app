import { useRef, useState } from 'react';
import './PhotoCapture.css';

function PhotoCapture({ onPhotoCapture, disabled }) {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);

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

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setShowCamera(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    stopCamera();
    onPhotoCapture(imageData);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  return (
    <div className="photo-capture">
      {!showCamera ? (
        <div className="capture-options">
          <div className="upload-area" onClick={() => !disabled && fileInputRef.current.click()}>
            <div className="upload-icon">📷</div>
            <p>Click to upload a photo</p>
            <span className="upload-hint">or drag and drop</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled}
            style={{ display: 'none' }}
          />
          <button
            className="camera-button"
            onClick={startCamera}
            disabled={disabled}
          >
            📸 Take a Photo
          </button>
        </div>
      ) : (
        <div className="camera-view">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
          />
          <div className="camera-controls">
            <button onClick={stopCamera} className="cancel-button">
              Cancel
            </button>
            <button onClick={capturePhoto} className="capture-button">
              📷 Capture
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PhotoCapture;
