import { StyleSheet, ScrollView, Pressable, Image, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import React, { useEffect, useState } from 'react';
import { useNavigation, CompositeNavigationProp  } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TabsParamList, PaginasStackParamList } from '@/app/types/navigation';
import { useUserNotifications } from '../../hooks/useUserNotifications';
import { getAuth } from 'firebase/auth';
import { marcarTodasComoLeidas, eliminarNotificacion } from '../../utils/notificacionesFirestore';
import { arrayRemove, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

type PaginasNavProp = NativeStackNavigationProp<PaginasStackParamList>;
type TabNavProp     = BottomTabNavigationProp<TabsParamList>;

type NavigationProp = CompositeNavigationProp<PaginasNavProp, TabNavProp>;

export default function NotificacionesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const notificacionesFirestore = useUserNotifications();
  const [notificaciones, setNotificaciones] = useState(notificacionesFirestore);
  const auth = getAuth();
  const user = auth.currentUser;

  // Sincroniza el estado local con Firestore en tiempo real
  useEffect(() => {
    setNotificaciones(notificacionesFirestore);
  }, [notificacionesFirestore]);

  // Marcar como leídas al abrir la pantalla (optimista)
  useEffect(() => {
    if (user && notificaciones.some(n => !n.leida)) {
      const nuevas = notificaciones.map(n => n.leida ? n : { ...n, leida: true });
      setNotificaciones(nuevas); // Optimista: actualiza UI instantáneamente
      updateDoc(doc(db, 'users', user.uid), { notificaciones: nuevas });
    }
    // eslint-disable-next-line
  }, []);

  const volverAHome = () => {
    // Limpia el stack de Páginas y navega a Home en el navigator padre (Tabs)
    const parent = navigation.getParent();
    if (parent) {
      parent.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } else {
      navigation.navigate('Home');
    }
  };

  const handleEliminar = async (notificacion: any) => {
    if (!user) return;
    // Elimina la notificación del array en Firestore y local
    setNotificaciones(prev => prev.filter(n => JSON.stringify(n) !== JSON.stringify(notificacion)));
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      notificaciones: arrayRemove(notificacion),
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header con flecha */}
      <View style={styles.header}>
        <TouchableOpacity onPress={volverAHome}>
        <Image source={require('../../../assets/images/flechapng.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Notificaciones</Text>
      </View>

      {notificaciones.length === 0 && (
        <Text style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>No tienes notificaciones.</Text>
      )}

      {notificaciones.map((n, idx) => (
        <View key={idx} style={styles.notification}>
          <Image
            source={
              n.tipo === 'solicitud_amistad'
                ? require('../../../assets/images/f33a6724-a3e0-4f7b-a797-6bccce5000bd.png')
                : n.tipo === 'mensaje'
                ? require('../../../assets/images/ee4e16c7-670f-4648-9cea-7999aa8b8623.png')
                : n.tipo === 'viaje'
                ? require('../../../assets/images/dff890f2-3590-4d72-8662-0e4b5336d548.png')
                : require('../../../assets/images/576f1565-8f91-4a82-b5bd-5e2c0512c997.png')
            }
            style={styles.icon}
          />
          <Text style={[styles.text, !n.leida ? { fontWeight: 'bold', color: '#093659' } : {}]}>{n.texto}</Text>
          <Pressable onPress={() => handleEliminar(n)}>
            <Image source={require('../../../assets/images/equis.png')} style={styles.closeIcon} />
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#093659',
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  icon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  text: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 14,
    color: '#1E1E1E',
  },
  closeIcon: {
    width: 16,
    height: 16,
    tintColor: 'gray',
  },
});