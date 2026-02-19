# Migration Google Cloud → Render + MongoDB

## Résumé

- **Backend** : Cloud Run → **Render** (Web Service)
- **Base de données** : Cloud SQL (PostgreSQL) → **MongoDB**
- **Stockage images** : GCS → **MongoDB** (GridFS ou documents avec binaire)
- **À retirer** : tout ce qui touche à gcloud, Cloud Run, Cloud SQL, GCS

---

## Ce dont j’ai besoin de toi

### 1. MongoDB (Atlas ou autre)

- **URI de connexion**  
  Exemple : `mongodb+srv://user:password@cluster.xxxxx.mongodb.net/mediscan?retryWrites=true&w=majority`
- Tu peux créer un cluster gratuit sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) et récupérer l’URI dans “Connect” → “Drivers” → “Python”.

### 2. Render

- Un compte [Render](https://render.com) (gratuit ou payant).
- Après la création du Web Service (voir plus bas), tu me donnes :
  - **URL du backend** (ex. `https://mediscan-api.onrender.com`) pour que je mette à jour CORS et `API_PUBLIC_URL` si besoin.

### 3. Variables d’environnement à préparer

À mettre dans **Render** (Dashboard → ton service → Environment) et éventuellement dans un `.env` local pour les tests :

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `MONGODB_URI` | Oui | URI de connexion MongoDB (Atlas ou autre) |
| `ENVIRONMENT` | Oui | `production` sur Render |
| `GEMINI_API_KEY` | Oui | Clé API Google Gemini (inchangée) |
| `FIREBASE_PROJECT_ID` | Oui | ID projet Firebase (inchangé) |
| `FIREBASE_CREDENTIALS_PATH` ou contenu JSON | Oui | Credentials Firebase (fichier ou variable) |
| `JWT_SECRET_KEY` | Oui | Clé secrète JWT (génère une longue chaîne aléatoire) |
| `CORS_ORIGINS` | Oui | Ex : `https://ton-front.vercel.app,https://mediscan.app` |
| `API_PUBLIC_URL` | Recommandé | URL publique du backend Render (ex. `https://mediscan-api.onrender.com`) |
| `ADMIN_EMAIL` | Optionnel | Email admin dashboard |
| `ADMIN_PASSWORD` | Optionnel | Mot de passe admin dashboard |

**À ne plus utiliser** (on les retire du code) :  
`GOOGLE_CLOUD_PROJECT`, `GCS_BUCKET_NAME`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_INSTANCE_CONNECTION_NAME`.

---

## Ce que tu dois faire de ton côté

### 1. MongoDB

1. Créer un cluster sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (tier gratuit possible).
2. Créer un utilisateur DB (username + mot de passe).
3. Autoriser l’accès depuis partout : Network Access → “Add IP Address” → “Allow Access from Anywhere” (0.0.0.0/0) pour que Render puisse se connecter.
4. Récupérer l’URI : Connect → “Drivers” → “Python” → copier l’URI et remplacer `<password>` par ton mot de passe.
5. Me donner cette URI (sans la mettre en clair dans le repo : uniquement dans Render / .env local).

### 2. Render

1. Aller sur [Render](https://render.com) → Dashboard.
2. “New +” → “Web Service”.
3. Connecter ton repo Git (GitHub/GitLab) où se trouve le projet.
4. Configurer le service :
   - **Root Directory** : `backend` (si le backend est dans le dossier `backend`).
   - **Runtime** : `Docker` **ou** `Python` (si on utilise un `build.sh` + `uvicorn` sans Docker).
   - **Build Command** : selon le choix (Docker : pas de build command ; Python : par ex. `pip install -r requirements.txt`).
   - **Start Command** :  
     - Si Docker : défini dans le `Dockerfile`.  
     - Si Python : par ex. `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5. Dans “Environment” du service, ajouter **toutes** les variables listées ci-dessus (surtout `MONGODB_URI`, `GEMINI_API_KEY`, `FIREBASE_*`, `JWT_SECRET_KEY`, `CORS_ORIGINS`, `API_PUBLIC_URL`).
6. Déployer et noter l’URL du service (ex. `https://mediscan-api.onrender.com`).
7. Me communiquer cette URL pour CORS / `API_PUBLIC_URL`.

### 3. Firebase

- Garder Firebase Auth et Firestore comme aujourd’hui.
- Si tu utilises un fichier de credentials (service account) :
  - Soit tu le mets dans le repo (ex. `backend/firebase-credentials.json`) et tu définis `FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json` sur Render.
  - Soit tu mets le **contenu JSON** dans une variable d’environnement (ex. `FIREBASE_CREDENTIALS_JSON`) et on adaptera le code pour le charger depuis cette variable.

Dis-moi si tu préfères fichier ou variable pour Firebase.

---

## Ce que je vais faire dans le code (côté backend)

1. **Supprimer / remplacer tout ce qui est Google Cloud**
   - Supprimer ou remplacer : `deploy.ps1`, scripts Cloud SQL, références à GCS, Cloud Run, `DB_*` (PostgreSQL), `GOOGLE_CLOUD_PROJECT`, `GCS_BUCKET_NAME`.

2. **Config**
   - Remplacer la config DB par `MONGODB_URI` uniquement.
   - Retirer les options Cloud SQL et GCS de `app/config.py`.

3. **Base de données**
   - Remplacer SQLAlchemy + PostgreSQL par **Motor / PyMongo** (MongoDB).
   - Recréer les “tables” en **collections** MongoDB :
     - `scan_history`
     - `user_credits`
     - `reminders`
     - `reminder_takes`
     - `medications` (si utilisé)
     - `user_medications` (si utilisé)

4. **Stockage des images**
   - Nouveau service de stockage basé sur **MongoDB** (GridFS ou une collection avec binaire).
   - Upload : enregistrer l’image dans MongoDB, renvoyer une URL (ex. `/api/v1/images/{id}`).
   - Endpoint “proxy” actuel : le faire servir les images depuis MongoDB au lieu de GCS.

5. **Dépendances**
   - Retirer : `google-cloud-storage`, `psycopg2-binary`, et toute dépendance uniquement liée à GCP.
   - Ajouter : `pymongo` (et éventuellement `motor` si on reste en async).

6. **Déploiement**
   - Ajouter un `render.yaml` (optionnel) pour déploiement Render.
   - Adapter le démarrage pour Render (port `PORT` fourni par Render, pas de Cloud SQL proxy).

7. **Ne pas casser**
   - Les endpoints et réponses API restent les mêmes pour le frontend (mêmes routes, mêmes formats JSON).
   - Firebase Auth reste inchangé.

---

## Récap pour qu’on avance ensemble

Tu me confirmes / m’envoies :

1. **MongoDB**  
   - “J’ai créé le cluster et l’utilisateur.”  
   - Soit l’URI (en privé), soit “je la mettrai uniquement dans Render”.

2. **Render**  
   - “J’ai créé le Web Service et ajouté les env vars.”  
   - L’**URL du backend** (ex. `https://mediscan-api.onrender.com`).

3. **Firebase**  
   - Tu préfères : credentials en **fichier** dans le repo ou en **variable d’environnement** (JSON string) ?

Dès que j’ai ça, je peux :
- retirer tout ce qui concerne Cloud (Run, SQL, GCS),
- brancher MongoDB (données + images),
- adapter le backend pour Render sans casser l’app.
