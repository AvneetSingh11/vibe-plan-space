import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, logEvent } from "firebase/analytics";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase with auto-provisioned client credentials
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics (will only work if a measurementId is provided in config and running in browser)
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

// Safe tracking helper
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (analytics) {
    try {
      logEvent(analytics, eventName, params);
    } catch (e) {
      console.warn("Analytics event failed", e);
    }
  }
};

export interface UserCloudData {
  userName: string;
  userMantra: string;
  userAvatar: string;
  tasks: any[];
  habits: any[];
  emotionLogs: any[];
  lastSynced: number;
}

/**
 * Saves all user progress to Firestore under a specific unique Space ID.
 */
export async function saveUserProgress(
  spaceId: string,
  data: Omit<UserCloudData, "lastSynced">
): Promise<void> {
  const normalizedId = spaceId.trim().toLowerCase();
  if (!normalizedId) {
    throw new Error("Invalid Space ID");
  }

  const userDocRef = doc(db, "users", normalizedId);
  await setDoc(userDocRef, {
    ...data,
    lastSynced: Date.now(),
  }, { merge: true });
}

/**
 * Retrieves user progress from Firestore for a specific unique Space ID.
 */
export async function loadUserProgress(spaceId: string): Promise<UserCloudData | null> {
  const normalizedId = spaceId.trim().toLowerCase();
  if (!normalizedId) {
    throw new Error("Invalid Space ID");
  }

  const userDocRef = doc(db, "users", normalizedId);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserCloudData;
  }
  return null;
}
