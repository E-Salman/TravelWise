import { createUserWithEmailAndPassword, User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { usuario, UsuarioClass } from "../types/usuario";


export const registerUser = async ({ email, password, userData }: 
                                { email: string; password: string; userData: any }) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const newUser = new UsuarioClass({
  nombre: userData.nombre,
  mail: email,
  ciudad: "",
  avatarUrl: "",
  visibilidad: "Cualquiera",
  sugerencia: "Amigos primero",
  notificaciones: "Activadas",
  });
  await setDoc(doc(db, "users", cred.user.uid), newUser.toFirestoreObject());
  return newUser;
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
