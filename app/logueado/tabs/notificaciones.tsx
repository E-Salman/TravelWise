import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
  View as RNView,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { getAuth } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../../firebase';
import type { Notificacion } from '../../types/notificacion';
import type { FriendRequest } from '../../types/friendRequest';
import { Feather } from '@expo/vector-icons';

// Extiende tu interfaz para UI
interface NotifUI extends Notificacion {
  id: string;
  texto: string;
  icono: any;
}

export default function NotificacionesScreen() {
  const auth = getAuth();
  const uid = auth.currentUser?.uid;
  const [notificaciones, setNotificaciones] = useState<NotifUI[]>([]);

  useEffect(() => {
    if (!uid) return;
    const notifCol = collection(db, 'users', uid, 'notifications');
    const unsubscribe = onSnapshot(notifCol, (snapshot) => {
      const items: NotifUI[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as Notificacion;
        let texto = '';
        let icono: any;

        // Placeholder para distintos tipos de notificación
        if (data.type === 'friend_request') {
          texto = `${data.payload.fromUid} te envió una solicitud de amistad`;
          icono = require('../../../assets/images/f33a6724-a3e0-4f7b-a797-6bccce5000bd.png');
        } else if (data.type === 'friend_accepted') {
          texto = `${data.payload.byUid} aceptó tu solicitud de amistad`;
          icono = require('../../../assets/images/ee4e16c7-670f-4648-9cea-7999aa8b8623.png');
        } else if (data.type === 'password_updated') {
          texto = 'Tu contraseña fue actualizada con éxito';
          icono = require('../../../assets/images/576f1565-8f91-4a82-b5bd-5e2c0512c997.png');
        } else if (data.type === 'trip_upcoming') {
          texto = 'Tu próximo viaje comienza pronto';
          icono = require('../../../assets/images/dff890f2-3590-4d72-8662-0e4b5336d548.png');
        } else if (data.type === 'message_request') {
          texto = 'Tienes una nueva solicitud de mensaje';
          icono = require('../../../assets/images/ee4e16c7-670f-4648-9cea-7999aa8b8623.png');
        } else {
          // Otros tipos sin texto específico
          texto = '';
          icono = require('../../../assets/images/576f1565-8f91-4a82-b5bd-5e2c0512c997.png');
        }

        return {
          id: docSnap.id,
          ...data,
          texto,
          icono,
        };
      });
      setNotificaciones(items);
    });
    return () => unsubscribe();
  }, [uid]);

  const aceptarSolicitud = async (notif: NotifUI) => {
    if (!uid) return;
    const { requestId, fromUid } = notif.payload;
    if (!requestId || !fromUid) return;
    try {
      await updateDoc(
        doc(db, 'users', uid, 'friendRequests', requestId),
        { status: 'accepted' }
      );
      await updateDoc(doc(db, 'users', uid), { amigos: arrayUnion(fromUid) });
      await updateDoc(doc(db, 'users', fromUid), { amigos: arrayUnion(uid) });
      await addDoc(
        collection(db, 'users', fromUid, 'notifications'),
        {
          type: 'friend_accepted',
          payload: { byUid: uid },
          read: false,
          timestamp: serverTimestamp(),
        }
      );
      await deleteDoc(doc(db, 'users', uid, 'notifications', notif.id));
      Alert.alert('¡Solicitud aceptada!');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo aceptar la solicitud.');
    }
  };

  const rechazarSolicitud = async (notif: NotifUI) => {
    if (!uid) return;
    const { requestId } = notif.payload;
    if (!requestId) return;
    try {
      await updateDoc(
        doc(db, 'users', uid, 'friendRequests', requestId),
        { status: 'rejected' }
      );
      await deleteDoc(doc(db, 'users', uid, 'notifications', notif.id));
      Alert.alert('Solicitud rechazada');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo rechazar la solicitud.');
    }
  };

  const eliminarNotificacion = async (id: string) => {
    if (!uid) return;
    try {
      await deleteDoc(doc(db, 'users', uid, 'notifications', id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../../assets/images/flechapng.png')}
          style={styles.backIcon}
        />
        <Text style={styles.title}>Notificaciones</Text>
      </View>

      {notificaciones.map((n) => (
        <View key={n.id} style={styles.notification}>
          <Image source={n.icono} style={styles.icon} />
          <Text style={styles.text}>{n.texto}</Text>

          {n.type === 'friend_request' ? (
            <RNView style={styles.actions}>
              <Pressable onPress={() => aceptarSolicitud(n)}>
                <Feather name="check" size={20} color="green" />
              </Pressable>
              <Pressable onPress={() => rechazarSolicitud(n)}>
                <Feather name="x" size={20} color="red" />
              </Pressable>
            </RNView>
          ) : (
            <Pressable onPress={() => eliminarNotificacion(n.id)}>
              <Image
                source={require('../../../assets/images/equis.png')}
                style={styles.closeIcon}
              />
            </Pressable>
          )}
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
