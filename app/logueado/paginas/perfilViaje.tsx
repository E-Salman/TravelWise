import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '../../firebase';

export default function PerfilViajeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { viaje } = route.params as { viaje: any };
  const [creador, setCreador] = useState<any>(null);

  useEffect(() => {
    // Obtener userId del viaje
    let userId = viaje.userId;
    if (!userId && typeof viaje.id === 'string' && viaje.id.includes('_')) {
      userId = viaje.id.split('_')[0];
    }
    if (!userId) return;
    const fetchCreador = async () => {
      const db = getFirestore(firebaseApp);
      const userRef = doc(db, `users/${userId}`);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) setCreador(userSnap.data());
    };
    fetchCreador();
  }, [viaje]);

  // Calcular asientos disponibles
  const maxPasajeros = parseInt(viaje.pasajeros || '1', 10);
  const pasajeros = Array.isArray(viaje.listaPasajeros) ? viaje.listaPasajeros.length : 0;
  const asientosDisponibles = Math.max(0, maxPasajeros - pasajeros);

  const handleSolicitar = async () => {
    try {
      const auth = getAuth(firebaseApp);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Atención', 'Debes iniciar sesión para solicitar un viaje.');
        return;
      }
      // No permitir que el creador solicite su propio viaje
      if (viaje.userId && user.uid === viaje.userId) {
        Alert.alert('Atención', 'No puedes solicitar tu propio viaje.');
        return;
      }
      // Agregar el usuario a la lista de pasajeros en Firestore
      const viajeRef = doc(getFirestore(firebaseApp), `users/${viaje.userId}/viajes/${viaje.id.split('_')[1]}`);
      await updateDoc(viajeRef, {
        listaPasajeros: arrayUnion({ uid: user.uid, nombre: user.displayName || '', mail: user.email || '' })
      });
      alert('¡Viaje solicitado! Ahora eres pasajero de este viaje.');
      navigation.navigate('Home');
    } catch (e) {
      Alert.alert('Error', 'Error al solicitar el viaje.');
    }
  };

  if (!creador) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Cargando datos del usuario...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerBox}>
        <TouchableOpacity onPress={() => navigation.navigate('buscarViaje')} style={{ position: 'absolute', left: 10, top: 10 }}>
          <Feather name="arrow-left" size={26} color="#093659" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Información del viaje</Text>
        <View style={styles.userBox}>
          {creador.avatarUrl ? (
            <Image source={{ uri: creador.avatarUrl }} style={styles.avatar} />
          ) : (
            <Image source={require('@/assets/images/faceID.png')} style={styles.avatar} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{creador.nombre || 'Nombre Apellido'}</Text>
            <Text style={styles.userCity}>Ciudad: {creador.ciudad || '-'}</Text>
            <Text style={styles.userMail}>Mail: {creador.mail || '-'}</Text>
          </View>
        </View>
        <View style={styles.routeBox}>
          <Text style={styles.routeText}>{viaje.origen || 'Origen'}</Text>
          <Feather name="arrow-right" size={18} color="#093659" style={{ marginHorizontal: 8 }} />
          <Text style={styles.routeText}>{viaje.destino || 'Destino'}</Text>
        </View>
      </View>
      <View style={styles.infoBox}>
        <Image source={require('@/assets/images/coche.png')} style={[styles.infoIcon, { width: 20, height: 20 }]} />
        <Text style={styles.infoText}>{viaje.auto?.marca || '-'} {viaje.auto?.modelo || ''}</Text>
      </View>
      <View style={styles.infoBox}>
        <Feather name="users" size={20} color="#093659" style={styles.infoIcon} />
        <Text style={styles.infoText}>{maxPasajeros} Pasajeros  {asientosDisponibles} Lugar Disponible</Text>
      </View>
      <View style={styles.infoBox}>
        <Feather name="credit-card" size={20} color="#093659" style={styles.infoIcon} />
        <Text style={styles.infoText}>{viaje.pago === 'mp' ? 'MercadoPago' : viaje.pago} ${viaje.precioAsiento}</Text>
      </View>
      <View style={styles.infoBox}>
        <Feather name="calendar" size={20} color="#093659" style={styles.infoIcon} />
        <Text style={styles.infoText}>Fecha salida {viaje.fecha ? new Date(viaje.fecha).toLocaleString() : '-'}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSolicitar}>
        <Text style={styles.buttonText}>Solicitar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f6faff', alignItems: 'center' },
  headerBox: { backgroundColor: '#eaf3fb', borderRadius: 16, padding: 16, width: '100%', marginBottom: 18, alignItems: 'center', position: 'relative' },
  headerTitle: { fontWeight: 'bold', fontSize: 20, color: '#093659', marginBottom: 10 },
  userBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '100%' },
  avatar: { width: 54, height: 54, borderRadius: 27, marginRight: 12, backgroundColor: '#fff' },
  userName: { fontWeight: 'bold', fontSize: 16, color: '#093659' },
  userCity: { fontSize: 14, color: '#555' },
  userMail: { fontSize: 13, color: '#888' },
  routeBox: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  routeText: { fontWeight: 'bold', color: '#093659', fontSize: 15 },
  infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, width: '100%' },
  infoIcon: { marginRight: 12 },
  infoText: { fontSize: 15, color: '#093659', fontWeight: '500' },
  button: { backgroundColor: '#093659', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 18, width: '100%' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
