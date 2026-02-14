# 🏥 AI MediScan

> **A calm, intelligent, and trustworthy pharmaceutical companion**

AI MediScan n'est pas qu'une simple application - c'est une **expérience émotionnelle** qui apporte sérénité, confiance et intelligence à la gestion de vos médicaments. Conçue avec une philosophie de **Premium Medical Minimalism**, chaque détail inspire la tranquillité et la sécurité.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)

## ✨ Vision

**Créer des émotions, pas seulement des applications.**

MediScan transforme l'anxiété liée aux médicaments en confiance sereine grâce à :
- 🎨 Un design **vaporeux** et **organique** qui apaise
- 🤖 Une IA **empathique** qui comprend et rassure
- 💎 Une expérience **premium** qui inspire confiance
- 🌊 Des animations **fluides** qui créent des sensations

## 🎯 Fonctionnalités Principales

### 📸 Scan Intelligent
- **Vision IA Google Gemini** pour analyse instantanée
- Identification précise des médicaments
- Détection du dosage, de la forme et du fabricant
- Interface de scan avec indicateur de respiration organique

### 💬 Assistant IA Pharmaceutique
- Conversations naturelles et empathiques
- Réponses en streaming temps réel
- Guidance pharmaceutique personnalisée
- Respect strict des limites médicales

### 📚 Historique & Mémoire
- Timeline élégante de tous vos scans
- Accès offline aux scans précédents
- Recherche et filtres avancés
- Synchronisation cloud sécurisée

### 🔐 Sécurité & Confidentialité
- Authentification Firebase robuste
- Chiffrement des données sensibles
- Isolation des données par utilisateur
- Disclaimer médical systématique

## 🏗️ Architecture

### Backend (Python/FastAPI)
```
backend/
├── app/
│   ├── api/endpoints/     # Routes REST API
│   ├── core/              # Config, exceptions, logging
│   ├── middleware/        # Rate limiting, sécurité
│   ├── models/            # SQLAlchemy + Pydantic
│   ├── services/          # Firebase, Gemini, Auth
│   └── main.py            # Application FastAPI
├── Dockerfile             # Container production
├── cloudbuild.yaml        # CI/CD Google Cloud
└── requirements.txt       # Dépendances Python
```

**Stack Backend:**
- FastAPI (Python 3.11+)
- Google Gemini AI (Vision + Chat)
- Firebase Auth + Firestore
- Cloud SQL (PostgreSQL)
- Google Cloud Storage
- Cloud Run (déploiement)

### Frontend (Next.js/React)
```
frontend/
├── src/
│   ├── app/               # App Router Next.js 14
│   ├── components/
│   │   ├── ui/            # Design system
│   │   ├── features/      # Composants métier
│   │   └── screens/       # Écrans principaux
│   ├── lib/
│   │   ├── api/           # Client API
│   │   ├── auth/          # Firebase Auth
│   │   └── utils/         # Utilitaires
│   └── types/             # TypeScript types
├── public/
│   ├── manifest.json      # PWA manifest
│   └── sw.js              # Service Worker
└── tailwind.config.ts     # Design system
```

**Stack Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Firebase Authentication
- PWA (Progressive Web App)

## 🎨 Design System

### Philosophie: Premium Medical Minimalism

**Mots-clés:** Vaporeux • Glassmorphism • Organique • Haute Précision

### Palette de Couleurs
```css
/* Backgrounds */
--background: #FBFBF9;
--gradient: radial-gradient(#FFFFFF → #F4F7F9);

/* Brand */
--primary-blue: #4A90E2;
--deep-blue: #1A3B5D;
--ice-blue: #F0F7FF;
--ai-accent: #C7E65A;

/* Text */
--text-primary: #1A3B5D;
--text-secondary: rgba(26, 59, 93, 0.5);
```

### Effets Signature
- **Glassmorphism**: `blur(15px)` + `opacity(0.7)` + bordure semi-transparente
- **Ombres Vaporeuses**: Diffusion douce avec teinte bleue
- **AI Glow**: Halo vert subtil pour éléments IA
- **Animations Organiques**: Respiration, flottement, vagues

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- Python 3.11+
- Compte Google Cloud
- Projet Firebase
- Clé API Gemini

### 1. Backend

```bash
cd backend

# Environnement virtuel
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Installation
pip install -r requirements.txt

# Configuration
cp .env.example .env
# Éditer .env avec vos credentials

# Lancement
uvicorn app.main:app --reload --port 8080
```

**API Documentation:** http://localhost:8080/api/v1/docs

### 2. Frontend

```bash
cd frontend

# Installation
npm install

# Configuration
cp .env.example .env.local
# Éditer .env.local avec vos credentials Firebase

# Lancement
npm run dev
```

**Application:** http://localhost:3000

## 📡 API Endpoints

### Scan
```
POST   /api/v1/scan              # Upload et analyse d'image
GET    /api/v1/scan/{scan_id}   # Récupérer un scan
```

### Assistant IA
```
POST   /api/v1/assistant/chat           # Chat avec l'IA
POST   /api/v1/assistant/chat/stream    # Chat streaming
GET    /api/v1/assistant/history        # Historique chat
```

### Historique
```
GET    /api/v1/history           # Historique des scans
```

### Feedback
```
POST   /api/v1/feedback          # Soumettre un retour
```

## ☁️ Déploiement

### Backend sur Google Cloud Run

```bash
cd backend

# Build et push
gcloud builds submit --config cloudbuild.yaml

# Ou déploiement direct
gcloud run deploy mediscan-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

### Frontend sur Vercel

```bash
cd frontend

# Avec Vercel CLI
npm i -g vercel
vercel

# Ou via GitHub integration (recommandé)
# Push to GitHub → Auto-deploy on Vercel
```

## 🔒 Sécurité

### Backend
- ✅ Validation JWT Firebase
- ✅ Rate limiting (20 req/min par utilisateur)
- ✅ Validation stricte des entrées (Pydantic)
- ✅ Headers de sécurité (CORS, CSP, HSTS)
- ✅ Disclaimer médical obligatoire
- ✅ Isolation des données utilisateur

### Frontend
- ✅ Authentication Firebase
- ✅ Tokens stockés en SessionStorage
- ✅ Refresh automatique des tokens
- ✅ Protection CSRF
- ✅ Content Security Policy

## 📱 PWA (Progressive Web App)

### Capacités
- ✅ Installable sur Android & iOS
- ✅ Mode offline (lecture seule)
- ✅ Notifications push (Android)
- ✅ Icônes adaptatives
- ✅ Splash screens
- ✅ Service Worker

### Installation
1. Ouvrir l'app dans le navigateur
2. Cliquer sur "Installer" (bannière ou menu)
3. L'app apparaît sur l'écran d'accueil

## 📊 Performance

### Objectifs
- **Lighthouse Score:** 95+
- **First Contentful Paint:** < 1s
- **Time to Interactive:** < 3s
- **Core Web Vitals:** Tous au vert

### Optimisations
- Images optimisées (AVIF/WebP)
- Code splitting automatique
- Lazy loading des composants
- Caching stratégique
- Compression Gzip/Brotli

## 🧪 Tests

```bash
# Backend
cd backend
pytest
pytest --cov=app tests/

# Frontend
cd frontend
npm run test
npm run test:e2e
```

## 🤝 Contributing

### Standards
- **Code Style:** PEP 8 (Python), ESLint (TypeScript)
- **Commits:** Conventional Commits
- **Branches:** feature/, bugfix/, hotfix/
- **Reviews:** Pull requests obligatoires

### Design
- Respecter le design system
- Animations émotionnelles
- Accessibilité WCAG 2.1 AA
- Tests multi-devices

## 📄 License

Proprietary - Tous droits réservés

## 💙 Support

Pour toute question ou problème :
- 📧 Email: support@mediscan.app
- 📖 Documentation: [docs.mediscan.app](https://docs.mediscan.app)
- 🐛 Issues: GitHub Issues

---

<div align="center">

**✨ Built with ❤️ to create emotions, not just apps ✨**

*MediScan - Votre compagnon pharmaceutique de confiance*

</div>


