'use client';

import React, { useState, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { OrganicWaveLoader } from '@/components/ui/Loading';
import { Camera, Upload, X } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ScanResult } from '@/types';
import { ScanResultView } from './ScanResultView';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScanModal({ isOpen, onClose }: ScanModalProps) {
  const { getIdToken } = useAuth();
  const { t, language } = useLanguage();
  const [step, setStep] = useState<'upload' | 'analyzing' | 'result'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(t('pleaseSelectImage'));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(t('imageTooLarge'));
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleScan = async () => {
    if (!selectedFile) return;

    try {
      setStep('analyzing');
      setError(null);

      // Get auth token
      const token = await getIdToken();
      if (token) {
        apiClient.setAuthToken(token);
      }

      // Upload and scan
      const result = await apiClient.scanMedication(selectedFile, language);
      setScanResult(result);
      setStep('result');
    } catch (err: any) {
      setError(
        err.response?.data?.error || 
        t('scanError')
      );
      setStep('upload');
    }
  };

  const handleClose = () => {
    setStep('upload');
    setSelectedFile(null);
    setPreviewUrl(null);
    setScanResult(null);
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'result' ? t('scanResult') : t('scanMedication')}
      className="max-w-2xl"
    >
      {step === 'upload' && (
        <div className="space-y-6">
          {/* Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-background-secondary dark:border-gray-700 rounded-xl p-8 text-center hover:border-primary dark:hover:border-blue-500 transition-all cursor-pointer bg-background dark:bg-gray-800"
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-xl"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 dark:bg-red-600 text-white rounded-full hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-light dark:bg-blue-900/30 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary dark:text-blue-400" />
                </div>
                <p className="text-text-primary dark:text-gray-100 font-semibold mb-2">
                  {t('dragOrClickToUpload')}
                </p>
                <p className="text-text-secondary dark:text-gray-400 text-sm">
                  {t('jpegOrPngMax10MB')}
                </p>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
          />

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="card dark:bg-gray-800 dark:border-gray-700 p-4 transition-colors">
            <h4 className="font-semibold text-text-primary dark:text-gray-100 mb-2">
              {t('scanTips')}
            </h4>
            <ul className="space-y-2 text-sm text-text-secondary dark:text-gray-300">
              <li>• {t('scanTip1')}</li>
              <li>• {t('scanTip2')}</li>
              <li>• {t('scanTip3')}</li>
              <li>• {t('scanTip4')}</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handleClose}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleScan}
              disabled={!selectedFile}
              icon={<Camera className="w-5 h-5" />}
            >
              {t('analyze')}
            </Button>
          </div>
        </div>
      )}

      {step === 'analyzing' && (
        <OrganicWaveLoader text={t('analyzing')} />
      )}

      {step === 'result' && scanResult && (
        <ScanResultView result={scanResult} onClose={handleClose} />
      )}
    </Modal>
  );
}
