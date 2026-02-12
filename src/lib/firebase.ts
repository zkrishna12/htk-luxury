import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAQsawOhcJDC75x9ymugIPxXy0mGRFs4m4",
    authDomain: "htk-shop-2025.firebaseapp.com",
    projectId: "htk-shop-2025",
    storageBucket: "htk-shop-2025.firebasestorage.app",
    messagingSenderId: "467709815110",
    appId: "1:467709815110:web:5bcdf45f3129cd9a421d"
};

import { getFirestore } from "firebase/firestore";

// Initialize Firebase (Singleton pattern for Next.js)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { auth, db, provider, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword };
