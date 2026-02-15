'use client';

import React, { useRef, useState, useEffect } from 'react';
import { X, Camera } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CameraPhotoCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export function CameraPhotoCapture({ onCapture, onClose }: CameraPhotoCaptureProps) {
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(language === 'fr' ? 'Caméra non supportée.' : 'Camera not supported.');
        return;
      }

      const configs = [
        { video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
        { video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
        { video: true, audio: false },
      ];

      let stream: MediaStream | null = null;
      for (const config of configs) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(config);
          break;
        } catch (e: any) {
          if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') throw e;
        }
      }

      if (!stream) {
        throw new Error('No camera');
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError(language === 'fr' ? 'Autorisez l\'accès à la caméra.' : 'Allow camera access.');
      } else {
        setError(language === 'fr' ? 'Impossible d\'ouvrir la caméra.' : 'Cannot open camera.');
      }
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !cameraReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx || video.readyState < 2 || video.videoWidth === 0) return;

    const maxSize = 1024;
    let w = video.videoWidth;
    let h = video.videoHeight;
    if (w > maxSize || h > maxSize) {
      const ratio = Math.min(maxSize / w, maxSize / h);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
    }

    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(video, 0, 0, w, h);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], 'photo-scan.jpg', { type: 'image/jpeg' });
          onCapture(file);
        }
      },
      'image/jpeg',
      0.85
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="relative flex-1 flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white"
        >
          <X className="w-6 h-6" />
        </button>

        {error ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <p className="text-white text-center">{error}</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            <div className="absolute bottom-8 left-0 right-0 flex justify-center">
              <button
                onClick={takePhoto}
                disabled={!cameraReady}
                className="w-20 h-20 rounded-full bg-white border-4 border-primary flex items-center justify-center shadow-lg disabled:opacity-50"
              >
                <Camera className="w-10 h-10 text-primary" strokeWidth={2.5} />
              </button>
            </div>

            <p className="absolute bottom-24 left-0 right-0 text-center text-white/90 text-sm">
              {language === 'fr' ? 'Prenez la photo du médicament' : 'Take a photo of the medication'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
