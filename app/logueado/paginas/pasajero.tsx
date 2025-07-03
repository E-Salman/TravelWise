import React, { useEffect, useState } from 'react';
import { FlatList, ActivityIndicator, StyleSheet, View as RNView, Pressable, Platform, Modal, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, getFirestore, doc, updateDoc } from 'firebase/firestore';
import { firebaseApp } from '../../firebase';
import { Text, View } from '@/components/Themed';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function PasajeroScreen() {
  const [viajes, setViajes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWebModal, setShowWebModal] = useState(false);
  const [selectedViaje, setSelectedViaje] = useState<any | null>(null);
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const navigation = useNavigation();

  useEffect(() => {
    async function fetchViajesPasajero() {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return setLoading(false);
      const usuariosRef = collection(db, 'users');
      const usuariosSnap = await getDocs(usuariosRef);
      let viajes: any[] = [];
      for (const usuarioDoc of usuariosSnap.docs) {
        const viajesRef = collection(db, `users/${usuarioDoc.id}/viajes`);
        const viajesSnap = await getDocs(viajesRef);
        viajes = viajes.concat(
          viajesSnap.docs
            .map(docu => {
              const data = docu.data();
              return {
                id: `${usuarioDoc.id}_${docu.id}`,
                auto: data.auto,
                origen: data.origen,
                destino: data.destino,
                pasajeros: data.pasajeros,
                pago: data.pago,
                fecha: data.fecha,
                userId: usuarioDoc.id,
                ...data
              };
            })
            .filter((v: any) => Array.isArray(v.listaPasajeros) && v.listaPasajeros.some((p: any) => p.uid === user.uid))
        );
      }
      // Solo viajes futuros
      const now = new Date();
      setViajes(
        viajes.filter((v: any) => typeof v.fecha === 'string' && new Date(v.fecha) > now)
          .sort((a: any, b: any) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      );
      setLoading(false);
    }
    fetchViajesPasajero();
  }, [auth.currentUser]);

  // Cancelar viaje como pasajero con confirmación previa
  const confirmarCancelarViaje = (viaje: any) => {
    if (Platform.OS === 'web') {
      setSelectedViaje(viaje);
      setShowWebModal(true);
    } else {
      Alert.alert(
        'Cancelar viaje',
        '¿Estás seguro que deseas darte de baja de este viaje? Solo puedes cancelar hasta 7 días antes de la fecha de salida.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Darse de baja', style: 'destructive', onPress: async () => {
              await cancelarViaje(viaje);
            }
          }
        ]
      );
    }
  };

  // Lógica real de baja
  const cancelarViaje = async (viaje: any) => {
    const user = auth.currentUser;
    if (!user) return;
    const fechaViaje = new Date(viaje.fecha);
    const ahora = new Date();
    const diffDias = (fechaViaje.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDias < 7) {
      if (Platform.OS === 'web') {
        window.alert('Solo puedes cancelar el viaje hasta 7 días antes de la fecha de salida.');
      } else {
        Alert.alert('Solo puedes cancelar el viaje hasta 7 días antes de la fecha de salida.');
      }
      return;
    }
    const viajeRef = doc(db, `users/${viaje.userId}/viajes/${viaje.id.split('_')[1]}`);
    await updateDoc(viajeRef, {
      listaPasajeros: (viaje.listaPasajeros || []).filter((p: any) => p.uid !== user.uid)
    });
    setViajes(viajes.filter(v => v.id !== viaje.id));
    if (Platform.OS === 'web') {
      window.alert('Te has dado de baja del viaje.');
    } else {
      Alert.alert('Te has dado de baja del viaje.');
    }
  };

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

  // Utilidad para formatear fecha local
  function formatFechaLocal(fechaStr: string) {
    if (!fechaStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) return fechaStr.split('-').reverse().join('/');
    const d = new Date(fechaStr);
    if (isNaN(d.getTime())) return fechaStr;
    const pad = (n: number) => n < 10 ? '0' + n : n;
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
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
        <Text style={styles.title}>Pasajero</Text>
      </RNView>
      <FlatList
        data={viajes}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No eres pasajero en ningún viaje próximo.</Text>}
        renderItem={({ item }) => {
          const diffDias = (new Date(item.fecha).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
          return (
            <RNView style={styles.card}>
              <Feather name="users" size={20} color="#093659" style={{ marginRight: 12 }} />
              <RNView style={{ flex: 1 }}>
                <Text style={styles.origen}>{item.origen} → {item.destino}</Text>
                <Text style={styles.detalle}>
                  Fecha: {formatFechaLocal(item.fecha)} | Pasajeros: {item.pasajeros} | Pago: {item.pago} | Precio: ${item.precioAsiento ?? '-'} | Auto: {item.auto?.marca ? `${item.auto.marca} ${item.auto.modelo}` : '-'}
                </Text>
              </RNView>
              {diffDias >= 7 && (
                <Pressable onPress={() => confirmarCancelarViaje(item)}>
                  <Feather name="x-circle" size={20} color="#ff3b30" />
                </Pressable>
              )}
            </RNView>
          );
        }}
      />
      {/* Modal de confirmación para web: darse de baja del viaje */}
      {Platform.OS === 'web' && (
        <Modal
          visible={showWebModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowWebModal(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 12, alignItems: 'center', minWidth: 300 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Cancelar viaje</Text>
              <Text style={{ marginBottom: 20 }}>¿Estás seguro que deseas darte de baja de este viaje? Solo puedes cancelar hasta 7 días antes de la fecha de salida.</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Pressable onPress={() => setShowWebModal(false)} style={{ padding: 10, borderRadius: 6, backgroundColor: '#eee', marginRight: 8 }}>
                  <Text>Cancelar</Text>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    if (selectedViaje) {
                      await cancelarViaje(selectedViaje);
                    }
                    setShowWebModal(false);
                    setSelectedViaje(null);
                  }}
                  style={{ padding: 10, borderRadius: 6, backgroundColor: 'red' }}
                >
                  <Text style={{ color: '#fff' }}>Darse de baja</Text>
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
