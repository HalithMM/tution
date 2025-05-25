 
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyBjvaGBWAOGQCxDgGTLS-GiZQHTHh9b4bE",
  authDomain: "tution-13ef0.firebaseapp.com",
  projectId: "tution-13ef0",
  storageBucket: "tution-13ef0.firebasestorage.app",
  messagingSenderId: "459758719434",
  appId: "1:459758719434:web:874a6e0c14a3c9ee79bf33"
};
 
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const Auth = getAuth(app)
