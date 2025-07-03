import React, { useEffect, useState } from 'react';
import { FlatList, ActivityIndicator, StyleSheet, View as RNView, Pressable, Alert, Platform, Modal } from 'react-native';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, getFirestore, doc, deleteDoc } from 'firebase/firestore';
import { firebaseApp } from '../../firebase';
import { Text, View } from '@/components/Themed';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type Viaje = {
  id: string;
  auto: any;
  origen: string;
  destino: string;
  pasajeros: string;
  pago: string;
  fecha: string;
  precioAsiento?: string;
  createdAt?: any;
};

export default function MisSolicitudesScreen() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWebDeleteModal, setShowWebDeleteModal] = useState(false);
  const [selectedViajeId, setSelectedViajeId] = useState<string | null>(null);
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const navigation = useNavigation();

  // Función robusta para volver a Home (igual que en crearViaje)
  const volverAHome = () => {
    const parent = navigation.getParent?.();
    if (parent) {
      parent.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } else {
      navigation.navigate('Home');
    }
  };

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

  async function eliminarViaje(id: string) {
    const user = auth.currentUser;
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'viajes', id));
    setViajes(viajes.filter(v => v.id !== id));
  }

  function handleEliminar(id: string) {
    if (Platform.OS === 'web') {
      setSelectedViajeId(id);
      setShowWebDeleteModal(true);
    } else {
      // Usar Alert de React Native
      Alert.alert(
        'Eliminar viaje',
        '¿Estás seguro que deseas eliminar este viaje?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar', style: 'destructive', onPress: async () => {
              await eliminarViaje(id);
            }
          }
        ]
      );
    }
  }

  function handleEditar(viaje: Viaje) {
    navigation.navigate('editarViaje', { id: viaje.id });
  }

  if (loading) {
    return <ActivityIndicator size="large" color="#093659" style={{ marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <RNView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Pressable onPress={volverAHome} style={{ marginRight: 12 }}>
          <Feather name="arrow-left" size={26} color="#093659" />
        </Pressable>
        <Text style={styles.title}>Mis Solicitudes</Text>
      </RNView>
      <FlatList
        data={viajes}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No tienes solicitudes pendientes.</Text>}
        renderItem={({ item }) => (
          <RNView style={styles.card}>
            <Feather name="clock" size={20} color="#093659" style={{ marginRight: 12 }} />
            <RNView style={{ flex: 1 }}>
              <Text style={styles.origen}>{item.origen} → {item.destino}</Text>
              <Text style={styles.detalle}>
                Fecha: {new Date(item.fecha).toLocaleDateString()} | Pasajeros: {item.pasajeros} | Pago: {item.pago} | Precio: ${item.precioAsiento ?? '-'} | Auto: {item.auto?.marca ? `${item.auto.marca} ${item.auto.modelo}` : '-'}
              </Text>
            </RNView>
            <Pressable onPress={() => handleEditar(item)} style={{ marginHorizontal: 8 }}>
              <Feather name="edit" size={20} color="#007aff" />
            </Pressable>
            <Pressable onPress={() => handleEliminar(item.id)}>
              <Feather name="trash-2" size={20} color="#ff3b30" />
            </Pressable>
          </RNView>
        )}
      />
      {/* Modal de confirmación para web: eliminar viaje */}
      {Platform.OS === 'web' && (
        <Modal
          visible={showWebDeleteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowWebDeleteModal(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 12, alignItems: 'center', minWidth: 300 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Eliminar viaje</Text>
              <Text style={{ marginBottom: 20 }}>¿Estás seguro que deseas eliminar este viaje?</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Pressable onPress={() => setShowWebDeleteModal(false)} style={{ padding: 10, borderRadius: 6, backgroundColor: '#eee', marginRight: 8 }}>
                  <Text>Cancelar</Text>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    if (selectedViajeId) {
                      await eliminarViaje(selectedViajeId);
                    }
                    setShowWebDeleteModal(false);
                    setSelectedViajeId(null);
                  }}
                  style={{ padding: 10, borderRadius: 6, backgroundColor: 'red' }}
                >
                  <Text style={{ color: '#fff' }}>Eliminar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
