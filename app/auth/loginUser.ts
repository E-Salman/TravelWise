import { signInWithEmailAndPassword, User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // ✅ Guarda el UID actual en AsyncStorage, sobrescribiendo el viejo
    await AsyncStorage.setItem('userUID', userCredential.user.uid);

    // ✅ Marca el último login en Firestore (opcional, buena práctica)
    await setDoc(
      doc(db, "usuarios", userCredential.user.uid),
      {
        lastLogin: new Date(),
      },
      { merge: true } // mantiene otros campos intactos
    );

    return userCredential.user;

  } catch (error) {
    throw error;
  }
};