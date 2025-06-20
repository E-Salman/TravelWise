import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { UsuarioClass } from "../types/usuario";

/**
 * Actualiza los datos de usuario en Firestore.
 * @param uid - ID del usuario autenticado.
 * @param nuevosDatos - Instancia de UsuarioClass o un objeto parcial con datos nuevos.
 */
export const updateUser = async (uid: string, nuevosDatos: UsuarioClass) => {
  try {
    const ref = doc(db, "users", uid);
    await updateDoc(ref, nuevosDatos.toFirestoreObject());
    console.log("Usuario actualizado correctamente en Firestore");
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw error;
  }
};