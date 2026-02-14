'use client';

import React from 'react';
import { ScanResult } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AlertTriangle, Info, Pill, ThumbsUp, Share2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ScanResultViewProps {
  result: ScanResult;
  onClose: () => void;
}

export function ScanResultView({ result, onClose }: ScanResultViewProps) {
  const { t } = useLanguage();
  const confidenceColor = {
    high: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
    medium: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
    low: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
  };

  // Helper function pour convertir string ou array en array
  const toArray = (value: string | string[] | undefined): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value.split('\n').filter(line => line.trim().length > 0);
    }
    return [];
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
      {/* Medication Header */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-h1 font-semibold text-text-primary dark:text-gray-100">
              {result.medication_name}
            </h2>
            {result.generic_name && (
              <p className="text-text-secondary dark:text-gray-300 text-sm mt-1">
                {result.generic_name}
              </p>
            )}
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              confidenceColor[result.confidence]
            }`}
          >
            {result.confidence === 'high' && t('highConfidence')}
            {result.confidence === 'medium' && t('mediumConfidence')}
            {result.confidence === 'low' && t('lowConfidence')}
          </span>
        </div>

        {/* Basic Info */}
        <div className="flex flex-wrap gap-4 text-sm text-text-secondary dark:text-gray-400">
          {result.dosage && (
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4" />
              <span>{result.dosage}</span>
            </div>
          )}
          {result.form && (
            <div className="capitalize">
              {result.form}
            </div>
          )}
          {result.manufacturer && (
            <div>
              {result.manufacturer}
            </div>
          )}
        </div>
      </div>

      {/* Usage Instructions */}
      {result.usage_instructions && (
        <div>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary dark:text-blue-400" />
                <CardTitle className="text-base text-text-primary dark:text-gray-100">{t('posology')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary dark:text-gray-300 text-sm">
                {result.usage_instructions}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Warnings */}
      {toArray(result.warnings).length > 0 && (
        <div>
          <Card className="border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <CardTitle className="text-base text-text-primary dark:text-gray-100">{t('warnings')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {toArray(result.warnings).map((warning, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-text-secondary dark:text-gray-300"
                  >
                    <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">⚠️</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contraindications */}
      {toArray(result.contraindications).length > 0 && (
        <div>
          <Card className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <CardTitle className="text-base text-text-primary dark:text-gray-100">{t('contraindications')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {toArray(result.contraindications).map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-text-secondary dark:text-gray-300"
                  >
                    <span className="text-red-600 dark:text-red-400 mt-0.5">🚫</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Interactions */}
      {toArray(result.interactions).length > 0 && (
        <div>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary dark:text-blue-400" />
                <CardTitle className="text-base text-text-primary dark:text-gray-100">{t('interactions')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {toArray(result.interactions).map((interaction, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-text-secondary dark:text-gray-300"
                  >
                    <span className="text-primary dark:text-blue-400 mt-0.5">•</span>
                    <span>{interaction}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Medical Disclaimer */}
      <div className="p-4 bg-primary-light dark:bg-blue-900/20 rounded-xl">
        <p className="text-sm text-text-primary dark:text-gray-100">
          {result.disclaimer || t('disclaimerMedical')}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 sticky bottom-0 bg-background dark:bg-gray-900 pt-4">
        <Button
          variant="ghost"
          className="flex-1"
          icon={<ThumbsUp className="w-5 h-5" />}
        >
          {t('useful')}
        </Button>
        <Button
          variant="ghost"
          className="flex-1"
          icon={<Share2 className="w-5 h-5" />}
        >
          {t('share')}
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          onClick={onClose}
        >
          {t('finish')}
        </Button>
      </div>
    </div>
  );
}
