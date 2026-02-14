'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, X, Zap, CheckCircle, AlertCircle, Lock, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { ScanResult } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface LiveCameraScannerProps {
  onScanComplete: (result: ScanResult) => void;
  onClose: () => void;
}

export function LiveCameraScanner({ onScanComplete, onClose }: LiveCameraScannerProps) {
  const { t, language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'analyzing' | 'success' | 'error' | 'permission-needed'>('idle');
  const [statusMessage, setStatusMessage] = useState(t('positionMedication'));
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  // Démarrer la caméra au montage
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Vérifier si on est en contexte sécurisé (HTTPS ou localhost)
  const isSecureContext = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.isSecureContext || 
           window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.protocol === 'https:';
  };

  const startCamera = async () => {
    try {
      // Vérifier le contexte sécurisé
      if (!isSecureContext()) {
        const msg = language === 'fr'
          ? 'La caméra ne fonctionne pas sur ce lien. Essayez depuis un autre navigateur ou vérifiez votre connexion.'
          : 'Camera doesn\'t work on this link. Try from another browser or check your connection.';
        setError(msg);
        setScanStatus('error');
        return;
      }

      // Vérifier si getUserMedia est supporté
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const msg = language === 'fr'
          ? 'Votre navigateur ne supporte pas la caméra. Essayez Chrome ou Safari.'
          : 'Your browser doesn\'t support camera. Try Chrome or Safari.';
        setError(msg);
        setScanStatus('error');
        return;
      }

      setScanStatus('idle');
      setStatusMessage(language === 'fr' ? 'Ouverture de la caméra...' : 'Opening camera...');

      let stream: MediaStream;
      
      // Essayer plusieurs configurations pour maximiser la compatibilité mobile
      const configs = [
        // Config optimisee pour mobile (camera arriere)
        { 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
          }, 
          audio: false 
        },
        // Fallback avec contrainte exacte
        { 
          video: { 
            facingMode: { exact: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }, 
          audio: false 
        },
        // Fallback camera avant (si pas de camera arriere)
        { 
          video: { 
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }, 
          audio: false 
        },
        // Dernier recours: n'importe quelle camera
        { video: true, audio: false },
      ];

      let lastError: any = null;
      for (const config of configs) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(config);
          break;
        } catch (e: any) {
          lastError = e;
          if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
            throw e;
          }
        }
      }

      if (!stream!) {
        throw lastError || new Error('No camera available');
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        await new Promise<void>((resolve, reject) => {
          const video = videoRef.current!;
          
          video.onloadedmetadata = () => {
            video.play()
              .then(() => {
                setCameraReady(true);
                setStatusMessage(language === 'fr' ? 'Caméra prête ! Cliquez pour scanner.' : 'Camera ready! Click to scan.');
                resolve();
              })
              .catch(reject);
          };
          
          video.onerror = () => reject(new Error('Video error'));
          setTimeout(() => reject(new Error('Video load timeout')), 10000);
        });

        // Attendre que la video soit vraiment prete avant de demarrer le scan
        const waitForReady = () => {
          if (videoRef.current?.readyState === 4) {
            startLiveScanning();
          } else {
            setTimeout(waitForReady, 500);
          }
        };
        setTimeout(waitForReady, 1000);
      }
    } catch (err: any) {
      console.error('Camera error:', err.name, err.message);
      
      let errorMsg: string;
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = language === 'fr'
          ? 'Vous avez refusé l\'accès à la caméra. Autorisez-la dans les paramètres de votre navigateur.'
          : 'You denied camera access. Allow it in your browser settings.';
        setScanStatus('permission-needed');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = language === 'fr'
          ? 'Aucune caméra trouvée sur votre appareil.'
          : 'No camera found on your device.';
        setScanStatus('error');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMsg = language === 'fr'
          ? 'La caméra est utilisée par une autre app. Fermez-la et réessayez.'
          : 'Camera is used by another app. Close it and try again.';
        setScanStatus('error');
      } else if (err.name === 'OverconstrainedError') {
        errorMsg = language === 'fr'
          ? 'Problème avec la caméra. Fermez et rouvrez l\'application.'
          : 'Camera issue. Close and reopen the app.';
        setScanStatus('error');
      } else {
        errorMsg = language === 'fr'
          ? 'Impossible d\'ouvrir la caméra. Réessayez ou utilisez l\'upload de photo.'
          : 'Can\'t open camera. Try again or use photo upload.';
        setScanStatus('error');
      }
      
      setError(errorMsg);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  // Capturer une frame de la vidéo
  const captureFrame = useCallback(async (): Promise<Blob | null> => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return null;

    // Vérifier que la vidéo est prête
    if (video.readyState < 2 || video.videoWidth === 0) {
      console.warn('Video not ready yet');
      return null;
    }

    // Définir la taille du canvas (limiter pour mobile)
    const maxSize = 1024;
    let width = video.videoWidth;
    let height = video.videoHeight;
    
    if (width > maxSize || height > maxSize) {
      const ratio = Math.min(maxSize / width, maxSize / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    
    canvas.width = width;
    canvas.height = height;

    // Dessiner la frame vidéo sur le canvas
    context.drawImage(video, 0, 0, width, height);

    // Convertir en Blob avec Promise
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.8); // Qualité réduite pour mobile
    });
  }, []);

  // Scanner en continu
  const startLiveScanning = useCallback(async () => {
    if (isScanning) return;

    setIsScanning(true);
    setScanStatus('analyzing');
    setStatusMessage(t('analyzing'));
    setConfidence(0);

    let scanAttempts = 0;
    const maxAttempts = 10; // Maximum 10 tentatives (30 secondes)
    const scanInterval = 3000; // Scanner toutes les 3 secondes

    scanIntervalRef.current = setInterval(async () => {
      scanAttempts++;

      try {
        // Capturer une frame
        const frameBlob = await captureFrame();
        if (!frameBlob) {
          console.warn('Impossible de capturer la frame');
          return;
        }

        // Convertir Blob en File
        const file = new File([frameBlob], 'live-scan.jpg', { type: 'image/jpeg' });

        // Envoyer au backend pour analyse
        console.log(`Tentative ${scanAttempts}/${maxAttempts} - Envoi au backend...`);
        const result = await apiClient.scanMedication(file, language);

        // Vérifier la confiance du résultat
        const resultConfidence = result.confidence === 'high' ? 100 : 
                                 result.confidence === 'medium' ? 70 : 40;
        
        setConfidence(resultConfidence);
        
        // Activer le focus si confiance moyenne ou haute
        if (result.confidence === 'high' || result.confidence === 'medium') {
          setIsFocused(true);
        }

        // Si confiance élevée, on arrête et on retourne le résultat
        if (result.confidence === 'high' || result.confidence === 'medium') {
          console.log('✅ Scan réussi avec confiance:', result.confidence);
          setScanStatus('success');
          setStatusMessage(t('medicationIdentified'));
          setConfidence(100);
          
          // Arrêter le scan
          if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
          }
          
          // Attendre 1 seconde pour montrer le succès
          setTimeout(() => {
            stopCamera();
            onScanComplete(result);
          }, 1000);
          
          return;
        }

        // Si confiance faible, continuer à scanner
        console.log('⚠️ Confiance faible, nouvelle tentative...');
        setStatusMessage(`${t('analyzing')} (${scanAttempts}/${maxAttempts})`);

      } catch (err: any) {
        console.error('Erreur lors du scan:', err);
        
        // Gérer les erreurs de quota Gemini
        if (err.response?.status === 429) {
          setScanStatus('error');
          setError('Quota Gemini dépassé. Veuillez réessayer plus tard.');
          setStatusMessage(t('quotaExceeded'));
          
          if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
          }
          return;
        }
        
        // Continuer à essayer pour les autres erreurs
        setStatusMessage(`${t('retrying')} (${scanAttempts}/${maxAttempts})`);
      }

      // Si on atteint le maximum de tentatives
      if (scanAttempts >= maxAttempts) {
        console.log('❌ Maximum de tentatives atteint');
        setScanStatus('error');
        setError(language === 'fr' 
          ? 'Médicament non reconnu. Essayez avec plus de lumière ou rapprochez-vous.'
          : 'Medication not recognized. Try with more light or get closer.');
        setStatusMessage(t('identificationFailed'));
        
        if (scanIntervalRef.current) {
          clearInterval(scanIntervalRef.current);
          scanIntervalRef.current = null;
        }
      }
    }, scanInterval);
  }, [isScanning, captureFrame, onScanComplete]);

  // Arrêter le scan
  const stopScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
    setScanStatus('idle');
    setStatusMessage(t('positionMedication'));
    setConfidence(0);
  };

  // Afficher l'écran de permission refusée
  if (scanStatus === 'permission-needed') {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-6">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        
        <div className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center mb-6">
          <Camera className="w-10 h-10 text-orange-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          {language === 'fr' ? 'Autoriser la caméra' : 'Allow Camera'}
        </h2>
        
        <p className="text-white/70 text-center mb-6 max-w-sm">
          {language === 'fr' 
            ? 'Pour scanner vos médicaments, autorisez l\'accès à la caméra.'
            : 'To scan your medications, allow camera access.'}
        </p>
        
        <div className="bg-white/10 rounded-2xl p-4 mb-6 max-w-sm">
          <p className="text-white/80 text-sm leading-relaxed">
            {language === 'fr' ? (
              <>
                <strong>Pour activer :</strong><br/>
                1. Cliquez sur 🔒 en haut de l'écran<br/>
                2. Activez la caméra<br/>
                3. Actualisez la page
              </>
            ) : (
              <>
                <strong>To enable:</strong><br/>
                1. Tap 🔒 at the top of the screen<br/>
                2. Enable camera<br/>
                3. Refresh the page
              </>
            )}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => {
              setScanStatus('idle');
              setError(null);
              startCamera();
            }}
            className="px-6 py-3 bg-primary rounded-xl text-white font-semibold flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            {language === 'fr' ? 'Réessayer' : 'Try Again'}
          </button>
          
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white/10 rounded-xl text-white font-semibold"
          >
            {language === 'fr' ? 'Annuler' : 'Cancel'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-white text-xl font-bold">
            {language === 'fr' ? 'Scan en direct' : 'Live Scan'}
          </h2>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Vidéo en plein écran */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ WebkitTransform: 'scaleX(-1)', transform: 'scaleX(1)' }}
        />
        
        {/* Canvas caché pour capturer les frames */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Overlay de guidage - Cadre de scan */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Zone de scan avec coins arrondis */}
          <div className={`relative transition-all duration-500 ${
            isFocused ? 'w-[320px] h-[320px] scale-105' : 'w-[280px] h-[280px]'
          }`}>
            {/* Coins du cadre - Changent de couleur quand focus */}
            <div className={`absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 rounded-tl-3xl transition-all duration-300 ${
              isFocused ? 'border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.6)]' : 'border-white'
            }`} />
            <div className={`absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 rounded-tr-3xl transition-all duration-300 ${
              isFocused ? 'border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.6)]' : 'border-white'
            }`} />
            <div className={`absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 rounded-bl-3xl transition-all duration-300 ${
              isFocused ? 'border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.6)]' : 'border-white'
            }`} />
            <div className={`absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 rounded-br-3xl transition-all duration-300 ${
              isFocused ? 'border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.6)]' : 'border-white'
            }`} />
            
            {/* Ligne de scan animée - Change de couleur quand focus */}
            {isScanning && scanStatus === 'analyzing' && !isFocused && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line" />
              </div>
            )}
            
            {/* Effet de pulse quand focus détecté */}
            {isFocused && (
              <div className="absolute inset-0 rounded-3xl border-4 border-green-400 animate-pulse-focus" />
            )}

            {/* Icône de statut au centre */}
            <div className="absolute inset-0 flex items-center justify-center">
              {scanStatus === 'analyzing' && !isFocused && (
                <div className="w-16 h-16 rounded-full bg-primary/30 backdrop-blur-sm flex items-center justify-center animate-pulse">
                  <Zap className="w-8 h-8 text-white" />
                </div>
              )}
              {isFocused && scanStatus === 'analyzing' && (
                <div className="w-20 h-20 rounded-full bg-green-500/40 backdrop-blur-sm flex items-center justify-center animate-pulse-focus">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
              )}
              {scanStatus === 'success' && (
                <div className="w-20 h-20 rounded-full bg-green-500/40 backdrop-blur-sm flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
              )}
              {scanStatus === 'error' && (
                <div className="w-16 h-16 rounded-full bg-red-500/30 backdrop-blur-sm flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Barre de progression de confiance */}
        {isScanning && confidence > 0 && (
          <div className="absolute top-24 left-6 right-6">
            <div className="bg-black/50 backdrop-blur-sm rounded-full p-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-green-500 transition-all duration-500"
                    style={{ width: `${confidence}%` }}
                  />
                </div>
                <span className="text-white text-sm font-bold min-w-[45px]">
                  {confidence}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer avec statut et bouton */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-6 pb-8">
        {/* Message de statut */}
        <div className="text-center mb-6">
          <p className="text-white text-lg font-semibold mb-1">
            {statusMessage}
          </p>
          {error && (
            <p className="text-red-400 text-sm">
              {error}
            </p>
          )}
        </div>

        {/* Bouton de contrôle - Seulement Arrêter ou Réessayer */}
        <div className="flex justify-center">
          {scanStatus === 'analyzing' ? (
            <button
              onClick={stopScanning}
              className="px-8 py-4 bg-red-500/90 backdrop-blur-sm rounded-full text-white font-bold text-lg shadow-[0_4px_20px_rgba(239,68,68,0.5)] hover:shadow-[0_6px_30px_rgba(239,68,68,0.7)] transition-all"
            >
              {t('stop')}
            </button>
          ) : scanStatus === 'error' ? (
            <button
              onClick={() => {
                setError(null);
                setScanStatus('idle');
                setStatusMessage(t('positionMedication'));
                startLiveScanning();
              }}
              className="px-8 py-4 bg-gradient-to-r from-primary to-primary-dark rounded-full text-white font-bold text-lg shadow-[0_4px_20px_rgba(91,159,237,0.5)] hover:shadow-[0_6px_30px_rgba(91,159,237,0.7)] transition-all"
            >
              {t('retry')}
            </button>
          ) : null}
        </div>

        {/* Instructions */}
        {scanStatus === 'analyzing' && (
          <div className="mt-6 text-center">
            <p className="text-white/70 text-sm">
              💡 {t('scanTip')}
            </p>
          </div>
        )}
      </div>

      {/* Style pour les animations */}
      <style jsx>{`
        @keyframes scan-line {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(280px);
          }
        }
        .animate-scan-line {
          animation: scan-line 2s linear infinite;
        }
        
        @keyframes pulse-focus {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }
        .animate-pulse-focus {
          animation: pulse-focus 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
