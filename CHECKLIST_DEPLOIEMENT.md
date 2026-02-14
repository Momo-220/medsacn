# Checklist Post-Déploiement MediScan

**Frontend :** Vercel | **Backend :** Google Cloud (Cloud Run) | **Domaine :** À configurer

## État de préparation : PRÊT

- Backend : Dockerfile, .dockerignore, PyJWT, healthcheck OK
- Frontend : next.config, .env.example complet
- cloudbuild.yaml à la racine pour déployer sur Cloud Run

---

## 1. Achat du domaine

- [ ] Acheter le domaine (ex: `mediscan.app` ou `mediscan.com`)
- [ ] Noter le registrar et l’accès au panneau DNS

---

## 2. Déploiement Backend (Google Cloud Run)

- [ ] Créer un Dockerfile dans `backend/` si absent
- [ ] Pousser l’image sur Google Container Registry (GCR) ou Artifact Registry
- [ ] Créer un service Cloud Run
- [ ] Configurer le domaine personnalisé pour l’API (ex: `api.mediscan.app`)
- [ ] Vérifier que Cloud SQL Proxy / connexion DB fonctionne depuis Cloud Run

### Variables d’environnement backend (Cloud Run)

| Variable | Valeur prod | Note |
|----------|-------------|------|
| `ENVIRONMENT` | `production` | Obligatoire |
| `DEBUG` | `false` | Désactiver en prod |
| `CORS_ORIGINS` | `https://mediscan.app,https://www.mediscan.app` | Ton domaine frontend |
| `GOOGLE_APPLICATION_CREDENTIALS` | (via Secret Manager ou compte de service) | Pas de fichier local |
| `GCS_BUCKET_NAME` | Ton bucket GCS | Idem dev ou prod |
| `GEMINI_API_KEY` | Clé API | Idem dev |
| `FIREBASE_PROJECT_ID` | `medscan-915d3` | Idem dev |
| `DB_HOST` | IP Cloud SQL | Idem ou interne |
| `DB_PASSWORD` | Mot de passe DB | Secret Manager recommandé |
| `JWT_SECRET_KEY` | **Nouvelle clé forte** | Ne pas réutiliser la dev |
| `ADMIN_EMAIL` | `seinimomo1@gmail.com` | Idem |
| `ADMIN_PASSWORD` | Mot de passe sécurisé | Changer si besoin |

---

## 3. Déploiement Frontend (Vercel)

- [ ] Connecter le repo GitHub à Vercel
- [ ] Choisir le projet `frontend`
- [ ] Configurer le domaine personnalisé (ex: `mediscan.app` et `www.mediscan.app`)

### Variables d’environnement frontend (Vercel)

| Variable | Valeur prod | Note |
|----------|-------------|------|
| `NEXT_PUBLIC_API_URL` | `https://api.mediscan.app` | URL du backend Cloud Run |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Clé Firebase | Console Firebase |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `medscan-915d3.firebaseapp.com` | Ou domaine custom |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `medscan-915d3` | Idem |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `medscan-915d3.appspot.com` | Idem |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ID Firebase | Console Firebase |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App ID Firebase | Console Firebase |

---

## 4. Configuration DNS

- [ ] **API (backend)** : Créer un enregistrement CNAME ou A vers l’URL Cloud Run
  - Ex: `api.mediscan.app` → URL fournie par Cloud Run
- [ ] **Frontend** : Vercel gère le DNS si tu pointes les nameservers, ou ajouter les enregistrements fournis par Vercel
  - Ex: CNAME `mediscan.app` → `cname.vercel-dns.com`
  - Ex: CNAME `www.mediscan.app` → `cname.vercel-dns.com`
- [ ] Attendre la propagation DNS (jusqu’à 48 h, souvent 15–30 min)

---

## 5. Firebase (Console)

- [ ] **Authentication > Settings > Authorized domains** : ajouter
  - `mediscan.app`
  - `www.mediscan.app`
  - `api.mediscan.app` (si auth côté API)
- [ ] **Google Sign-In** : vérifier que l’URL de redirection autorisée inclut ton domaine
- [ ] **Storage / Firestore** : règles de sécurité adaptées à la prod

---

## 6. Sécurité

- [ ] Générer une nouvelle `JWT_SECRET_KEY` pour la prod (pas celle du dev)
- [ ] S’assurer que `ADMIN_PASSWORD` du dashboard est fort
- [ ] Vérifier que les secrets (DB, API keys) sont dans Secret Manager / variables d’env, pas en dur dans le code
- [ ] Activer HTTPS partout (Vercel et Cloud Run le font par défaut avec un domaine custom)

---

## 7. Vérifications finales

- [ ] Ouvrir `https://mediscan.app` → le frontend s’affiche
- [ ] Connexion Firebase (email/Google) fonctionne
- [ ] Scan de médicament → appel à l’API backend
- [ ] Chat IA → réponse correcte
- [ ] PWA : "Ajouter à l’écran d’accueil" sur mobile
- [ ] Dashboard : `https://mediscan.app/dashboard` → login admin OK
- [ ] Test depuis une autre connexion (4G) pour valider la géoloc des pays

---

## 8. Récapitulatif des URLs

| Rôle | URL |
|------|-----|
| App (frontend) | `https://mediscan.app` |
| API (backend) | `https://api.mediscan.app` |
| Dashboard admin | `https://mediscan.app/dashboard` |

---

*Remplacer `mediscan.app` par ton domaine réel.*
