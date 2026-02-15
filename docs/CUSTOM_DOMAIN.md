# Configuration d'un domaine personnalisé - MediScan

Guide pour connecter un nom de domaine acheté (ex: mediscan.fr) à votre application MediScan.

---

## 1. Prérequis

- Domaine acheté (OVH, Gandi, Namecheap, Google Domains, etc.)
- Accès à la console DNS de votre registrar
- Accès à Vercel et Google Cloud Console

---

## 2. Frontend (Vercel)

### 2.1 Ajouter le domaine dans Vercel

1. Allez sur [vercel.com](https://vercel.com) → votre projet MediScan
2. **Settings** → **Domains**
3. Cliquez **Add** et entrez votre domaine : `mediscan.fr` (ou `www.mediscan.fr`)
4. Vercel affiche les enregistrements DNS à configurer

### 2.2 Enregistrements DNS pour le domaine racine

| Type | Nom | Valeur |
|------|-----|--------|
| A | @ | 76.76.21.21 |

### 2.3 Enregistrements DNS pour www

| Type | Nom | Valeur |
|------|-----|--------|
| CNAME | www | cname.vercel-dns.com |

### 2.4 Configuration DNS chez votre registrar

Connectez-vous à l’interface de gestion DNS de votre hébergeur de domaine et ajoutez ces enregistrements.

**Remarque :** La propagation DNS peut prendre de 5 minutes à 48 heures.

### 2.5 Variables d’environnement Vercel

Dans **Settings** → **Environment Variables**, vérifiez que `NEXT_PUBLIC_API_URL` pointe vers l’URL de votre backend (Cloud Run ou domaine personnalisé du backend).

---

## 3. Backend (Cloud Run)

### 3.1 Domaine personnalisé Cloud Run

1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. **Cloud Run** → sélectionnez votre service
3. **Manage custom domains** (ou "Gérer les domaines personnalisés")
4. Cliquez **Add mapping**
5. Choisissez le service et entrez le domaine : `api.mediscan.fr`
6. Cloud Run affiche un enregistrement DNS à créer

### 3.2 Enregistrement DNS pour l’API

| Type | Nom | Valeur |
|------|-----|--------|
| CNAME | api | ghs.googlehosted.com *(ou la valeur indiquée par Cloud Run)* |

La valeur exacte est affichée dans la console Cloud Run.

### 3.3 Vérification SSL

Cloud Run fournit le certificat SSL automatiquement. Attendez la fin de la vérification (quelques minutes).

---

## 4. Firebase Authentication

### 4.1 Domaines autorisés

1. [Firebase Console](https://console.firebase.google.com) → votre projet
2. **Authentication** → **Settings** → **Authorized domains**
3. Ajoutez :
   - `mediscan.fr`
   - `www.mediscan.fr`
   - `api.mediscan.fr` (si nécessaire pour les redirections)

---

## 5. Mettre à jour les variables d’environnement

### 5.1 Vercel (frontend)

```env
NEXT_PUBLIC_API_URL=https://api.mediscan.fr
```

### 5.2 Cloud Run (backend)

- `CORS_ORIGINS` : ajoutez vos domaines
  ```
  https://mediscan.fr,https://www.mediscan.fr,https://medscan-eight.vercel.app
  ```

---

## 6. Récapitulatif des domaines

| Service      | Domaine exemple   | Exemple d’URL              |
|-------------|-------------------|----------------------------|
| Frontend    | mediscan.fr       | https://mediscan.fr        |
| Frontend    | www.mediscan.fr   | https://www.mediscan.fr    |
| Backend API | api.mediscan.fr   | https://api.mediscan.fr    |

---

## 7. Résolution de problèmes

- **DNS :** Utilisez `nslookup votre-domaine.fr` ou [dnschecker.org](https://dnschecker.org)
- **SSL :** Vercel et Cloud Run gèrent les certificats automatiquement
- **CORS :** Vérifiez que le domaine frontend est bien dans `CORS_ORIGINS`
- **Firebase :** Tous les domaines utilisés doivent être dans **Authorized domains**
