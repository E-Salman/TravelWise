import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, ActivityIndicator, Alert, StyleSheet, Image, View as RNView } from 'react-native';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Text, View } from '@/components/Themed';
import { UsuarioClass } from '../../types/usuario';

export default function SolicitudesAmistadScreen() {
  type Solicitud = { id: string; fromUid: string; status?: string };
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [usuarios, setUsuarios] = useState<Record<string, UsuarioClass>>({});
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const miUid = auth.currentUser?.uid;

  useEffect(() => {
    const fetchSolicitudes = async () => {
      if (!miUid) return;
      setLoading(true);
      try {
        const ref = collection(db, 'users', miUid, 'friendRequests');
        const snap = await getDocs(ref);
        const lista: Solicitud[] = snap.docs.map(docSnap => ({ id: docSnap.id, ...(docSnap.data() as any) }));
        setSolicitudes(lista.filter(s => s.status === 'pending'));
      } catch (err) {
        Alert.alert('Error', 'No se pudieron cargar las solicitudes.');
      } finally {
        setLoading(false);
      }
    };
    fetchSolicitudes();
  }, [miUid]);

  // Cargar datos de usuario para cada solicitud
  useEffect(() => {
    const cargarUsuarios = async () => {
      const nuevos: Record<string, UsuarioClass> = {};
      await Promise.all(
        solicitudes.map(async sol => {
          if (!usuarios[sol.fromUid]) {
            const snap = await getDoc(doc(db, 'users', sol.fromUid));
            if (snap.exists()) {
              nuevos[sol.fromUid] = new UsuarioClass(snap.data());
            }
          }
        })
      );
      setUsuarios(prev => ({ ...prev, ...nuevos }));
    };
    if (solicitudes.length > 0) cargarUsuarios();
  }, [solicitudes]);

  const aceptarSolicitud = async (solicitud: Solicitud) => {
    if (!miUid) return;
    await updateDoc(doc(db, 'users', miUid), { amigos: arrayUnion(solicitud.fromUid) });
    await updateDoc(doc(db, 'users', solicitud.fromUid), { amigos: arrayUnion(miUid) });
    await updateDoc(doc(db, 'users', miUid, 'friendRequests', solicitud.id), { status: 'accepted' });
    setSolicitudes(solicitudes.filter(s => s.id !== solicitud.id));
    Alert.alert('¡Ahora son amigos!');
  };

  const rechazarSolicitud = async (solicitud: Solicitud) => {
    if (!miUid) return;
    await updateDoc(doc(db, 'users', miUid, 'friendRequests', solicitud.id), { status: 'rejected' });
    setSolicitudes(solicitudes.filter(s => s.id !== solicitud.id));
    Alert.alert('Solicitud rechazada');
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#093659" style={{ marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Solicitudes de amistad</Text>
      <FlatList
        data={solicitudes}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No tienes solicitudes pendientes.</Text>}
        renderItem={({ item }) => {
          const user = usuarios[item.fromUid];
          return (
            <View style={styles.card}>
              {user ? (
                <RNView style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {user.avatarUrl ? (
                    <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]} />
                  )}
                  <RNView style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.nombre}>{user.nombre}</Text>
                    <Text style={styles.mail}>{user.mail}</Text>
                    <Text style={styles.ciudad}>{user.ciudad}</Text>
                  </RNView>
                </RNView>
              ) : (
                <Text>Cargando usuario...</Text>
              )}
              <View style={styles.actions}>
                <Pressable style={styles.accept} onPress={() => aceptarSolicitud(item)}>
                  <Text style={{ color: '#fff' }}>Aceptar</Text>
                </Pressable>
                <Pressable style={styles.reject} onPress={() => rechazarSolicitud(item)}>
                  <Text style={{ color: '#fff' }}>Rechazar</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f6faff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#093659' },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, elevation: 1 },
  from: { fontWeight: 'bold', color: '#093659', marginBottom: 8 },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
  accept: { backgroundColor: '#093659', padding: 10, borderRadius: 6, marginRight: 8 },
  reject: { backgroundColor: 'red', padding: 10, borderRadius: 6 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 0 },
  avatarPlaceholder: {
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nombre: { fontSize: 16, fontWeight: 'bold', color: '#093659' },
  mail: { fontSize: 14, color: '#555', marginBottom: 4 },
  ciudad: { fontSize: 14, color: '#555', marginBottom: 8 },
});
