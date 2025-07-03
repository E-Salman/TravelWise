import React, { useEffect, useState } from 'react';
import { FlatList, ActivityIndicator, StyleSheet, View as RNView } from 'react-native';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { firebaseApp } from '../../firebase';
import { Text, View } from '@/components/Themed';
import { Feather } from '@expo/vector-icons';

type Viaje = {
  id: string;
  auto: any;
  origen: string;
  destino: string;
  pasajeros: string;
  pago: string;
  fecha: string;
  createdAt?: any;
};

export default function MisSolicitudesScreen() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  useEffect(() => {
    async function fetchViajes() {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return setLoading(false);
      const viajesRef = collection(db, 'users', user.uid, 'viajes');
      const snapshot = await getDocs(viajesRef);
      const now = new Date();
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((v: any): v is Viaje => typeof v.fecha === 'string' && new Date(v.fecha) > now)
        .sort((a: Viaje, b: Viaje) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
      setViajes(data);
      setLoading(false);
    }
    fetchViajes();
  }, [auth.currentUser]);

  if (loading) {
    return <ActivityIndicator size="large" color="#093659" style={{ marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Solicitudes</Text>
      <FlatList
        data={viajes}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No tienes solicitudes pendientes.</Text>}
        renderItem={({ item }) => (
          <RNView style={styles.card}>
            <Feather name="clock" size={20} color="#093659" style={{ marginRight: 12 }} />
            <RNView style={{ flex: 1 }}>
              <Text style={styles.origen}>{item.origen} → {item.destino}</Text>
              <Text style={styles.detalle}>Fecha: {new Date(item.fecha).toLocaleDateString()} | Pasajeros: {item.pasajeros} | Pago: {item.pago}</Text>
            </RNView>
          </RNView>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f6faff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#093659' },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, elevation: 1 },
  origen: { fontSize: 16, fontWeight: 'bold', color: '#093659' },
  detalle: { fontSize: 14, color: '#555', marginTop: 4 },
});
