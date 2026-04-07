import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";

// These are safe to commit — Firebase web config is public-facing.
// Security is enforced by Firestore rules, not by keeping these secret.
const firebaseConfig = {
  apiKey: "AIzaSyAUX5n0aTCEkkbN5Z_YEdyMo2ubuyPdwS0",
  authDomain: "aie-conf.firebaseapp.com",
  projectId: "aie-conf",
  storageBucket: "aie-conf.firebasestorage.app",
  messagingSenderId: "545266899055",
  appId: "1:545266899055:web:0ecccfc793ac2772d7d59a",
};

export const app = initializeApp(firebaseConfig);

// persistentLocalCache enables offline support — favorites still work
// without internet and sync automatically when reconnected
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});
