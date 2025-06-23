import { signInWithEmailAndPassword, User } from "firebase/auth";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const loginUser = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    // 1) Autenticar
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // 2) Guardar UID localmente
    await AsyncStorage.setItem("userUID", userCredential.user.uid);

    // 3) Actualizar lastLogin en /users/{uid}
    await updateDoc(doc(db, "users", userCredential.user.uid), {
      lastLogin: serverTimestamp(),
    });

    return userCredential.user;
  } catch (error) {
    console.error("Error en loginUser:", error);
    // Aquí puedes envolver el error en uno propio, 
    // mostrar un mensaje más amigable, etc.
    throw error; 
  }
};
