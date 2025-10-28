/**
 * Barcode Scanner Component
 * Uses device camera to scan barcodes for check-out/check-in
 * Supports both mobile and desktop with camera access
 */

import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
  isOpen: boolean;
  mode?: 'user' | 'item';
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScan,
  onClose,
  isOpen,
  mode = 'item',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError('');

      // Check if browser supports mediaDevices
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser');
      }

      // Request camera permission
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setIsScanning(true);
      }

      toast.success('Camera ready - Point at barcode');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to access camera';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsScanning(false);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleManualEntry = () => {
    const barcode = prompt(`Enter ${mode} barcode manually:`);
    if (barcode) {
      onScan(barcode);
      onClose();
    }
  };

  const handleCapture = () => {
    // In a real implementation, this would use a barcode detection library
    // like @zxing/library or quagga2 to decode the barcode from the video frame
    toast.info('Barcode detection not yet implemented. Use manual entry for now.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Scan {mode === 'user' ? 'User' : 'Item'} Barcode
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200"
            aria-label="Close scanner"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Camera View */}
        <div className="relative bg-gray-900">
          {error ? (
            <div className="p-8 text-center">
              <div className="text-red-500 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-white mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-96 object-cover"
                playsInline
                muted
              />

              {/* Scanning overlay */}
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-4 border-green-500 w-64 h-48 rounded-lg opacity-75">
                    <div className="h-1 bg-green-500 animate-pulse"></div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 text-center">
                <p className="text-sm">
                  Position the barcode within the frame
                </p>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 bg-gray-50 flex gap-2 justify-between">
          <button
            onClick={handleManualEntry}
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Manual Entry
          </button>
          <button
            onClick={handleCapture}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={!isScanning}
          >
            Capture Barcode
          </button>
        </div>

        {/* Info */}
        <div className="p-4 bg-blue-50 border-t border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> For full barcode detection, install a barcode
            scanning library like @zxing/library or quagga2.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
