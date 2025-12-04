import { useRef, useState } from 'react';
import './PhotoCapture.css';

function PhotoCapture({ onPhotoCapture, disabled }) {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onPhotoCapture(event.target.result);
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
