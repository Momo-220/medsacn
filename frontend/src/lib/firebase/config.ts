// Firebase config - lazy loaded to avoid SSR issues with undici
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let _app: any = null;
let _auth: any = null;

export async function getFirebaseApp() {
  if (_app) return _app;
  const { initializeApp, getApps } = await import('firebase/app');
  _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  return _app;
}

export async function getFirebaseAuth() {
  if (_auth) return _auth;
  const app = await getFirebaseApp();
  const { getAuth } = await import('firebase/auth');
  _auth = getAuth(app);
  return _auth;
}

export { firebaseConfig };