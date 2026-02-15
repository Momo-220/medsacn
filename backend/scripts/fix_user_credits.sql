-- Ajouter la colonne manquante quota_reset_date à user_credits
-- À exécuter dans Cloud SQL Studio (Console GCP)

ALTER TABLE user_credits 
ADD COLUMN IF NOT EXISTS quota_reset_date DATE NULL;
