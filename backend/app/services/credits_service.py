import structlog
from typing import Optional
from datetime import datetime, date

from sqlalchemy.orm import Session

from app.models.database import SessionLocal
from app.models.medication import UserCredits


logger = structlog.get_logger()


class CreditsService:
    """
    Service de gestion des crédits (gemmes) pour l'utilisation de Gemini.

    Principe:
    - Quota journalier : chaque utilisateur a X gemmes par jour.
    - Le quota se réinitialise automatiquement chaque jour (à minuit UTC).
    - Les crédits sont calculés en fonction de la consommation réelle de tokens Gemini.
    """

    # Quota journalier (nombre de gemmes par jour)
    DAILY_QUOTA_FULL = 30   # Compte inscrit
    DAILY_QUOTA_TRIAL = 10  # Mode essai (anonyme)

    # Taux de conversion tokens -> gemmes
    TOKENS_PER_GEM = 1000
    
    # Coûts fixes par défaut
    SCAN_COST = 5
    CHAT_COST = 1
    
    @staticmethod
    def calculate_cost_from_tokens(total_tokens: int) -> int:
        """
        Calcule le coût en gemmes à partir du nombre de tokens.
        Arrondi au supérieur pour garantir au moins 1 gemme.
        """
        if total_tokens <= 0:
            return 1  # Minimum 1 gemme
        cost = (total_tokens + CreditsService.TOKENS_PER_GEM - 1) // CreditsService.TOKENS_PER_GEM  # Arrondi au supérieur
        return max(1, cost)  # Minimum 1 gemme

    def __init__(self):
        # Pour l'instant, on utilise SessionLocal directement.
        # Si un système de DI est ajouté plus tard, on pourra l'injecter.
        self._session_factory = SessionLocal

    def _get_db(self) -> Session:
        return self._session_factory()

    def _get_daily_quota(self, is_anonymous: bool) -> int:
        return self.DAILY_QUOTA_TRIAL if is_anonymous else self.DAILY_QUOTA_FULL

    def _should_reset_quota(self, credits: UserCredits) -> bool:
        """True si le quota doit être réinitialisé (nouveau jour)."""
        today = date.today()
        if credits.quota_reset_date is None:
            return True
        return credits.quota_reset_date < today

    def get_or_create(self, user_id: str, is_anonymous: bool = False) -> UserCredits:
        db = self._get_db()
        try:
            credits = db.query(UserCredits).filter(UserCredits.user_id == user_id).first()
            if not credits:
                quota = self._get_daily_quota(is_anonymous)
                today = date.today()
                credits = UserCredits(
                    user_id=user_id,
                    credits=quota,
                    quota_reset_date=today,
                    updated_at=datetime.utcnow(),
                )
                db.add(credits)
                db.commit()
                db.refresh(credits)
                logger.info(
                    "New user created with daily quota",
                    user_id=user_id,
                    credits=quota,
                    is_trial=is_anonymous,
                )
            elif self._should_reset_quota(credits):
                quota = self._get_daily_quota(is_anonymous)
                credits.credits = quota
                credits.quota_reset_date = date.today()
                credits.updated_at = datetime.utcnow()
                db.commit()
                db.refresh(credits)
                logger.info(
                    "Daily quota reset",
                    user_id=user_id,
                    credits=quota,
                    is_trial=is_anonymous,
                )
            return credits
        finally:
            db.close()

    def get_credits(self, user_id: str, is_anonymous: bool = False) -> int:
        """
        Récupère les crédits de l'utilisateur (quota journalier).
        Crée le compte avec le quota du jour si nouveau. Reset automatique si nouveau jour.
        """
        credits = self.get_or_create(user_id, is_anonymous)
        return credits.credits

    def add_credits(self, user_id: str, amount: int, is_anonymous: bool = False) -> int:
        """Ajoute des gemmes bonus au solde actuel. Bloqué si quota journalier épuisé (attendre demain)."""
        from fastapi import HTTPException, status
        self.get_or_create(user_id, is_anonymous)
        db = self._get_db()
        try:
            credits = db.query(UserCredits).filter(UserCredits.user_id == user_id).first()
            # Bloquer si quota journalier épuisé : l'utilisateur doit attendre le reset du lendemain
            if credits and credits.credits == 0 and credits.quota_reset_date == date.today():
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Votre quota journalier est épuisé. Revenez demain pour obtenir votre nouveau quota de gemmes.",
                )
            if not credits:
                quota = self._get_daily_quota(is_anonymous)
                credits = UserCredits(user_id=user_id, credits=quota + amount, quota_reset_date=date.today())
                db.add(credits)
            else:
                if self._should_reset_quota(credits):
                    credits.credits = self._get_daily_quota(is_anonymous)
                    credits.quota_reset_date = date.today()
                credits.credits += amount
            credits.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(credits)
            logger.info("Credits added", user_id=user_id, amount=amount, total=credits.credits)
            return credits.credits
        finally:
            db.close()

    def ensure_credits(self, user_id: str, cost: int, estimated_tokens: Optional[int] = None, is_anonymous: bool = False) -> None:
        """
        Vérifie que l'utilisateur a assez de crédits, sans les consommer.
        
        Args:
            user_id: ID de l'utilisateur
            cost: Coût fixe en gemmes (utilisé si estimated_tokens est None)
            estimated_tokens: Nombre estimé de tokens (si fourni, recalcule le coût)
        """
        # Si on a une estimation de tokens, utiliser le calcul dynamique
        if estimated_tokens is not None and estimated_tokens > 0:
            cost = CreditsService.calculate_cost_from_tokens(estimated_tokens)
        
        credits = self.get_or_create(user_id, is_anonymous=is_anonymous)
        if credits.credits < cost:
            logger.warning(
                "Insufficient credits",
                user_id=user_id,
                credits=credits.credits,
                required=cost,
                estimated_tokens=estimated_tokens,
            )
            from fastapi import HTTPException, status  # import local pour éviter les cycles

            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Crédits insuffisants. Solde: {credits.credits}, requis: {cost}",
            )

    def consume(self, user_id: str, cost: int, actual_tokens: Optional[int] = None, is_anonymous: bool = False) -> int:
        """
        Consomme des crédits après un appel réussi.
        Applique le reset journalier si nécessaire avant de consommer.
        Retourne le nouveau solde.
        """
        if actual_tokens is not None and actual_tokens > 0:
            cost = CreditsService.calculate_cost_from_tokens(actual_tokens)
            logger.info("Calculating cost from actual tokens",
                       tokens=actual_tokens, cost=cost, tokens_per_gem=CreditsService.TOKENS_PER_GEM)

        # Applique le reset journalier si nécessaire
        self.get_or_create(user_id, is_anonymous)

        db = self._get_db()
        try:
            credits = db.query(UserCredits).filter(UserCredits.user_id == user_id).first()
            if not credits:
                quota = self._get_daily_quota(is_anonymous)
                credits = UserCredits(user_id=user_id, credits=quota, quota_reset_date=date.today())
                db.add(credits)
                db.commit()
                db.refresh(credits)

            # Vérifier si un reset est nécessaire (race condition entre get_or_create et cette requête)
            if self._should_reset_quota(credits):
                credits.credits = self._get_daily_quota(is_anonymous)
                credits.quota_reset_date = date.today()

            if credits.credits < cost:
                logger.warning(
                    "Attempt to consume with insufficient credits",
                    user_id=user_id,
                    credits=credits.credits,
                    required=cost,
                    actual_tokens=actual_tokens,
                )
                from fastapi import HTTPException, status

                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail=f"Crédits insuffisants. Solde: {credits.credits}, requis: {cost}",
                )

            credits.credits -= cost
            credits.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(credits)

            logger.info(
                "Credits consumed",
                user_id=user_id,
                cost=cost,
                remaining=credits.credits,
                actual_tokens=actual_tokens,
            )
            return credits.credits
        finally:
            db.close()


# Singleton simple pour utilisation dans les endpoints
credits_service = CreditsService()

