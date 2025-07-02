import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { UsuarioClass } from '../types/usuario';

export function useCurrentUserData() {
  const [usuario, setUsuario] = useState<UsuarioClass | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    const ref = doc(db, 'users', user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setUsuario(new UsuarioClass(snap.data()));
      } else {
        setUsuario(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { usuario, loading };
}
