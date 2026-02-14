"""
Script pour creer le compte Zara dans Firebase + PostgreSQL
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

# 1. Initialiser Firebase Admin
cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "./firebase-admin-key.json")
if not os.path.exists(cred_path):
    print(f"ERREUR: Fichier Firebase introuvable: {cred_path}")
    sys.exit(1)

cred = credentials.Certificate(cred_path)
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

# 2. Creer l'utilisateur Zara dans Firebase Auth
ZARA_EMAIL = "zara@mediscan.app"
ZARA_PASSWORD = "Zara2024!"
ZARA_NAME = "Zara"

try:
    # Verifier si elle existe deja
    try:
        existing = firebase_auth.get_user_by_email(ZARA_EMAIL)
        print(f"Zara existe deja dans Firebase! UID: {existing.uid}")
        zara_uid = existing.uid
    except firebase_auth.UserNotFoundError:
        # Creer le compte
        user_record = firebase_auth.create_user(
            email=ZARA_EMAIL,
            password=ZARA_PASSWORD,
            display_name=ZARA_NAME,
            email_verified=True,
        )
        zara_uid = user_record.uid
        print(f"Compte Zara cree avec succes! UID: {zara_uid}")
    
    print(f"\n--- Identifiants de Zara ---")
    print(f"Email: {ZARA_EMAIL}")
    print(f"Mot de passe: {ZARA_PASSWORD}")
    print(f"Nom: {ZARA_NAME}")
    print(f"UID Firebase: {zara_uid}")
    
    # 3. Creer ses credits dans SQLite (dev) / PostgreSQL (prod)
    from app.models.database import SessionLocal, init_db
    from app.models.medication import UserCredits
    from datetime import datetime, date
    
    init_db()
    
    db = SessionLocal()
    try:
        existing_credits = db.query(UserCredits).filter(UserCredits.user_id == zara_uid).first()
        if existing_credits:
            print(f"\nCredits existants: {existing_credits.credits} gemmes")
        else:
            quota = 30  # Quota journalier pour compte inscrit
            new_credits = UserCredits(
                user_id=zara_uid,
                credits=quota,
                quota_reset_date=date.today(),
                updated_at=datetime.utcnow()
            )
            db.add(new_credits)
            db.commit()
            print(f"\nQuota journalier ({quota} gemmes) configure pour Zara!")
    finally:
        db.close()
    
    print(f"\nCompte Zara pret! Elle peut se connecter avec:")
    print(f"  Email: {ZARA_EMAIL}")
    print(f"  Mot de passe: {ZARA_PASSWORD}")

except Exception as e:
    print(f"ERREUR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
