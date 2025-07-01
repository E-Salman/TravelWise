import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Envía una notificación a un usuario agregando un objeto a su array de notificaciones en Firestore.
 * @param uidDestino UID del usuario que recibirá la notificación
 * @param texto Texto de la notificación
 * @param tipo Tipo de notificación (opcional)
 */
export async function enviarNotificacion(uidDestino: string, texto: string, tipo: string = 'info') {
  const userRef = doc(db, 'users', uidDestino);
  await updateDoc(userRef, {
    notificaciones: arrayUnion({
      texto,
      tipo,
      leida: false,
      fecha: new Date().toISOString(),
    })
  });
}
