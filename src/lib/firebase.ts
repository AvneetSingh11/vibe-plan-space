import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase with auto-provisioned client credentials
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

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
