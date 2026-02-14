# RAPPORT D'AUDIT COMPLET
## MediScan – Qualité, Sécurité, Performance

**Date** : 7 février 2026  
**Version** : 1.0.0  
**Scope** : Frontend (Next.js) + Backend (FastAPI)

---

# 1. QUALITÉ DU CODE

| Critère | Note | Détails |
|---------|------|---------|
| **Architecture** | 8.5/10 | Séparation claire API/Services/Models, Contexts React bien utilisés |
| **Maintenabilité** | 8/10 | Code lisible, conventions cohérentes, quelques doublons |
| **Tests** | 4/10 | pytest configuré côté backend, peu de tests frontend |
| **Documentation** | 7/10 | README, docstrings, API docs (ReDoc/Swagger en debug) |
| **Gestion d’erreurs** | 8/10 | Exceptions personnalisées, ErrorToast, traduction des erreurs |

### Points forts
- Architecture en couches claire
- Pydantic pour la validation
- i18n FR/EN/AR/TR
- Types TypeScript stricts

### Points faibles
- ~50 `console.log/error` en dev
- Pas de tests E2E
- Pas de tests unitaires frontend

---

# 2. SÉCURITÉ

| Critère | Note | Détails |
|---------|------|---------|
| **Authentification** | 8.5/10 | Firebase JWT, vérification backend |
| **Autorisation** | 8/10 | `require_full_account`, `require_verified_email` |
| **Validation des entrées** | 8/10 | Pydantic, limites (2000 chars, 10MB) |
| **Protection CORS** | 8/10 | Restreint en prod, `*` en dev |
| **Headers de sécurité** | 7.5/10 | X-Frame-Options, X-Content-Type-Options, Referrer-Policy |
| **Rate limiting** | 3/10 | Middleware présent mais NON activé |

## 2.1 Vulnérabilités identifiées

### CRITIQUE – Rate limiting inactif
- **Fichier** : `backend/app/main.py`
- **Constat** : Le `RateLimitMiddleware` existe dans `middleware/rate_limiter.py` mais n’est pas monté dans l’app.
- **Impact** : Risque de DoS, abus API, consommation excessive (Gemini, quotas).
- **Action** : Activer le rate limiter ou utiliser SlowAPI/Redis.

### MOYEN – Token en sessionStorage
- **Fichier** : `frontend/src/lib/api/client.ts`
- **Constat** : JWT stocké dans `sessionStorage`.
- **Impact** : Vulnérable au XSS (script malveillant peut lire le token).
- **Mitigation** : React Markdown sanitise par défaut ; éviter d’injecter du HTML non contrôlé.

### FAIBLE – CORS ouvert en dev
- **Constat** : `allow_origins=["*"]` en développement.
- **Impact** : Acceptable en dev, à vérifier qu’en prod `CORS_ORIGINS` soit bien restreint.

### FAIBLE – Pas de Content-Security-Policy
- **Constat** : Pas de CSP dans `next.config.js` ou le backend.
- **Impact** : Limite la protection contre XSS.
- **Action** : Ajouter une CSP stricte en production.

## 2.2 Points positifs
- Validation Pydantic (ChatRequest max 2000 chars)
- Validation des images (magic numbers, extensions, type MIME)
- Limite fichier 10 MB
- Firebase Admin SDK côté backend
- Pas de `dangerouslySetInnerHTML` ou `eval`
- ReactMarkdown (sanitization par défaut)

---

# 3. PERFORMANCE

| Critère | Note | Détails |
|---------|------|---------|
| **Frontend** | 7.5/10 | Next.js 14, lazy load partiel |
| **Backend** | 7/10 | GZip, async, requêtes optimisées |
| **API** | 6.5/10 | Timeout 60s, pas de cache HTTP explicite |
| **Images** | 7/10 | AVIF/WebP, domaines configurés |

### Points forts
- GZip activé (min 1000 bytes)
- Images Next.js (formats modernes)
- Appel API asynchrone
- Streaming SSE pour le chat

### Points faibles
- Timeout API 60s (peut être long pour l’utilisateur)
- Pas de Redis/cache pour les crédits en prod
- Pas de mise en cache HTTP (Cache-Control) sur les endpoints publics

---

# 4. NOTES GLOBALES

| Dimension | Note /10 | Synthèse |
|-----------|----------|----------|
| **QUALITÉ** | 7.5 | Bonne base, manque de tests |
| **SÉCURITÉ** | 6.5 | Auth solide, rate limiting manquant |
| **PERFORMANCE** | 7 | Correct, quelques optimisations possibles |

---

# 5. ACTIONS RECOMMANDÉES

## Priorité haute
1. Activer le rate limiting dans `main.py` ou équivalent.
2. Créer un `.env.example` pour documenter les variables d’environnement.

## Priorité moyenne
3. Réduire le timeout API à 30s pour une meilleure UX.
4. Supprimer ou encapsuler les `console.log` en production.
5. Ajouter une Content-Security-Policy.

## Priorité basse
6. Mettre en place des tests unitaires frontend.
7. Envisager Redis pour le rate limiting en production.
8. Ajouter des headers Cache-Control sur les endpoints statiques.

---

# 6. CONCLUSION

L’application MediScan a une base saine (auth Firebase, validation Pydantic, architecture claire).  
Le point le plus critique reste l’absence de rate limiting actif, à corriger avant une mise en production.  
Une fois le rate limiting activé et les actions prioritaires réalisées, le projet peut être considéré comme prêt pour un déploiement maîtrisé.
