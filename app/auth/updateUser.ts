import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { UsuarioClass } from "../types/usuario";

export const updateUser = async (
  uid: string,
  usuario: UsuarioClass
): Promise<void> => {
  try {
    const dataToUpdate = {
      nombre: usuario.nombre,
      ciudad: usuario.ciudad,
      avatarUrl: usuario.avatarUrl,
      visibilidad: usuario.visibilidad,
      sugerencia: usuario.sugerencia,
      notificaciones: usuario.notificaciones,
      preferencias: usuario.preferencias,
      nombreMin: usuario.nombre.toLowerCase(),
    };

    // Actualiza sólo esos campos en /users/{uid}
    await updateDoc(doc(db, "users", uid), dataToUpdate);
  } catch (error) {
    console.error("Error actualizando perfil de usuario:", error);
    throw error;
  }
};
