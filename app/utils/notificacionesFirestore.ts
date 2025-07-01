import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export async function marcarNotificacionesComoLeidas(uid: string) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    notificaciones: [], // Se reemplazará luego por la lógica de marcar como leídas
  });
}

export async function marcarTodasComoLeidas(uid: string, notificaciones: any[]) {
  const userRef = doc(db, 'users', uid);
  const nuevas = notificaciones.map(n => ({ ...n, leida: true }));
  await updateDoc(userRef, { notificaciones: nuevas });
}

export async function eliminarNotificacion(uid: string, notificacion: any) {
  const userRef = doc(db, 'users', uid);
  // Elimina la notificación exacta
  await updateDoc(userRef, {
    notificaciones: (prev: any[] = []) => prev.filter(n => JSON.stringify(n) !== JSON.stringify(notificacion)),
  });
}
