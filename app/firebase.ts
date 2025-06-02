import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAqsrEvu0joH5MNjZVKRfMuUqRrlBS236s",
  authDomain: "travelwise-76b94.firebaseapp.com",
  projectId: "travelwise-76b94",
  storageBucket: "travelwise-76b94.firebasestorage.app",
  messagingSenderId: "627690437827",
  appId: "1:627690437827:web:09e1a8cf9ba34e0dc63676",
  measurementId: "G-BR5R7HF0M8"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

const initFirebase = (): void => {
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
};

// Ensure Firebase is initialized on import
initFirebase();

export { auth, db };