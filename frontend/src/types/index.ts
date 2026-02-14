// Core types for MediScan

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type MedicationForm = 'tablet' | 'capsule' | 'liquid' | 'cream' | 'injection' | 'inhaler' | 'drops' | 'patch' | 'other';

export interface ScanResult {
  scan_id: string;
  medication_name: string;
  generic_name?: string;
  dosage?: string;
  form?: string;
  manufacturer?: string;
  lot_number?: string;
  expiry_date?: string;
  active_ingredient?: string;
  excipients?: string;
  // Notice complète
  indications?: string;
  posology?: string;
  contraindications?: string; // Converti en string par le backend
  precautions?: string;
  side_effects?: string; // Converti en string par le backend
  interactions?: string; // Converti en string par le backend
  overdose?: string;
  storage?: string;
  additional_info?: string;
  // Anciens champs pour compatibilité
  usage_instructions?: string;
  warnings?: string[]; // Peut être undefined
  // Nouveaux champs pour suggestions
  packaging_language?: string; // fr, en, zh, ja, hi, tr, etc.
  category?: string; // antibiotique, antidouleur, etc.
  confidence: ConfidenceLevel;
  disclaimer: string;
  image_url?: string;
  analyzed_at: string;
}

export interface MedicationSuggestion {
  id: string;
  name: string;
  generic_name?: string;
  brand_name?: string;
  category: string;
  dosage?: string;
  form?: string;
  image_url?: string;
  manufacturer?: string;
  indications?: string;
  presentation?: string;
  composition?: string;
  description?: string;
}

export interface SuggestionsResponse {
  suggestions: MedicationSuggestion[];
  count: number;
}

export interface ScanHistoryItem {
  id: string;
  medication_name: string;
  dosage?: string;
  form?: string;
  image_url?: string;
  scanned_at: string;
  confidence: ConfidenceLevel;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface ChatResponse {
  message: string;
  message_id: string;
  timestamp: string;
}

export interface FeedbackData {
  scan_id?: string;
  rating: number;
  feedback_type: 'helpful' | 'incorrect' | 'unclear' | 'other';
  comment?: string;
}

export interface ErrorResponse {
  error: string;
  code: string;
  details?: Record<string, any>;
}

