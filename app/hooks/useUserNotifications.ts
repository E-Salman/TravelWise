import { useEffect, useState } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

export type Notificacion = {
  texto: string;
  tipo?: string;
  leida?: boolean;
  fecha?: string;
};

export function useUserNotifications() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    const ref = doc(db, 'users', user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data();
      setNotificaciones(data?.notificaciones || []);
    });
    return () => unsub();
  }, []);

  return notificaciones;
}
