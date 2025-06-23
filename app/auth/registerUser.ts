import { createUserWithEmailAndPassword, User } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UsuarioClass } from "../types/usuario";

interface RegisterParams {
  email: string;
  password: string;
  userData: Partial<Omit<UsuarioClass, "lastLogin">>;
}

export const registerUser = async ({
  email,
  password,
  userData,
}: RegisterParams): Promise<User> => {
  try {
    // 1) Crear cuenta en Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const uid = userCredential.user.uid;

    // 2) Armar el objeto UsuarioClass con datos iniciales
    const nuevoUsuario = new UsuarioClass({
      nombre: userData.nombre ?? "",
      mail: email,
      ciudad: userData.ciudad ?? "",
      avatarUrl: userData.avatarUrl ?? "",
      visibilidad: userData.visibilidad ?? "Cualquiera",
      sugerencia: userData.sugerencia ?? "Amigos primero",
      notificaciones: userData.notificaciones ?? "Activadas",
      preferencias: userData.preferencias ?? "Personalizadas",
      // lastLogin lo pone el servidor
    });

    // 3) Guardar en Firestore /users/{uid}, incluyendo lastLogin
    await setDoc(
      doc(db, "users", uid),
      {
        ...nuevoUsuario.toFirestoreObject(),
        nombreMin: nuevoUsuario.nombre.toLowerCase(),
        lastLogin: serverTimestamp(),
      },
      { merge: true } // por si quieres preservar futuros campos
    );

    // 4) Guardar UID localmente
    await AsyncStorage.setItem("userUID", uid);

    return userCredential.user;
  } catch (error) {
    console.error("Error en registerUser:", error);
    throw error;
  }
};

/*interface UserData {
  [key: string]: any; // Adjust this if you know exact userData fields
}

export const registerUser = async ({
  email,
  password,
  userData
}: {
  email: string, 
  password: string, 
  userData: usuario
}): Promise<User> => {
  try {
    // 1. Create authentication entry
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // 2. Store additional user data in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      ...userData,
    mail: email,
    createdAt: new Date()
    });
    
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};*/
