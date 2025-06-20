import { signInWithEmailAndPassword, User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // ✅ Crea si no existe, actualiza si existe (MERGE)
    await setDoc(
      doc(db, "usuarios", userCredential.user.uid),
      {
        lastLogin: new Date()
      },
      { merge: true }  // <--- importante!
    );

    return userCredential.user;
  } catch (error) {
    throw error;
  }
};