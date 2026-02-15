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
    <div className="fixed inset-0 z-50 flex flex-col bg-black min-h-[100dvh] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="relative flex-1 flex flex-col min-h-0">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white"
          aria-label={language === 'fr' ? 'Fermer' : 'Close'}
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
              className="absolute inset-0 w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Cadre viewfinder - zone de cadrage */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[85%] max-w-[320px] aspect-[3/4] rounded-2xl border-4 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]" />
            </div>

            {/* Bouton centré au-dessus de la barre de navigation */}
            <div className="absolute left-0 right-0 flex justify-center bottom-[calc(6rem+env(safe-area-inset-bottom))]">
              <button
                onClick={takePhoto}
                disabled={!cameraReady}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border-4 border-primary flex items-center justify-center shadow-lg disabled:opacity-50 active:scale-95 transition-transform"
                aria-label={language === 'fr' ? 'Prendre la photo' : 'Take photo'}
              >
                <Camera className="w-10 h-10 sm:w-12 sm:h-12 text-primary" strokeWidth={2.5} />
              </button>
            </div>

            <p className="absolute left-0 right-0 text-center text-white/90 text-sm bottom-[calc(8rem+env(safe-area-inset-bottom))]">
              {language === 'fr' ? 'Cadrez le médicament puis prenez la photo' : 'Frame the medication then take the photo'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
