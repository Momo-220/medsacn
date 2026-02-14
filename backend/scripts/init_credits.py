"""
Script pour réinitialiser le quota journalier des utilisateurs existants.
Utile après migration vers le système de quota journalier.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.database import SessionLocal
from app.models.medication import UserCredits
from datetime import datetime, date

DAILY_QUOTA = 30

def init_credits():
    """Réinitialise le quota à la valeur journalière pour les utilisateurs sans quota_reset_date ou avec date ancienne"""
    db = SessionLocal()
    try:
        from sqlalchemy import or_
        users = db.query(UserCredits).filter(
            or_(UserCredits.quota_reset_date == None, UserCredits.quota_reset_date < date.today())
        ).all()
        
        if not users:
            print("✅ Tous les utilisateurs ont déjà un quota journalier à jour.")
            return
        
        print(f"📊 Trouvé {len(users)} utilisateur(s) à réinitialiser.")
        
        for user in users:
            user.credits = DAILY_QUOTA
            user.quota_reset_date = date.today()
            user.updated_at = datetime.utcnow()
            print(f"  ✅ {user.user_id}: quota réinitialisé à {DAILY_QUOTA} gemmes")
        
        db.commit()
        print(f"\n🎉 {len(users)} utilisateur(s) mis à jour avec le quota journalier !")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erreur: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_credits()
