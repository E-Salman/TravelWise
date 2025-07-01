import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, ActivityIndicator, useWindowDimensions, Alert, Pressable } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../firebase';
import { UsuarioClass } from '../../types/usuario';
import { Text, View } from '@/components/Themed';
import { Feather } from '@expo/vector-icons';
import type { PaginasStackParamList } from '@/app/types/navigation';

export default function UserProfileScreen() {
  const route = useRoute<RouteProp<PaginasStackParamList, 'perfilUser'>>();
  const navigation = useNavigation();
  const { uid } = route.params;
  const { width, height } = useWindowDimensions();
  const isWideScreen = width > 600;
  const avatarSize = Math.min(width, height) * 0.18;
  const nombreFontSize = Math.min(width * 0.06, height * 0.04);
  const ciudadFontSize = Math.min(width * 0.045, height * 0.03);
  const mailFontSize = Math.min(width * 0.045, height * 0.03);

  const [usuario, setUsuario] = useState<UsuarioClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [bloqueado, setBloqueado] = useState(false);
  const [esAmigo, setEsAmigo] = useState(false);
  const [estaBloqueadoPorMi, setEstaBloqueadoPorMi] = useState(false);
  const [cantidadAmigos, setCantidadAmigos] = useState(0);

  // Función para bloquear usuario
  const bloquearUsuario = async () => {
    Alert.alert(
      'Bloquear usuario',
      '¿Estás seguro que deseas bloquear a este usuario? También se eliminará de tu lista de amigos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Bloquear', style: 'destructive', onPress: async () => {
            const auth = getAuth();
            const miUid = auth.currentUser?.uid;
            if (!miUid) return;
            const userRef = doc(db, 'users', miUid);
            await updateDoc(userRef, {
              bloqueados: arrayUnion(uid),
              amigos: arrayRemove(uid),
            });
            // También eliminar al usuario actual de la lista de amigos del bloqueado
            await updateDoc(doc(db, 'users', uid), {
              amigos: arrayRemove(miUid),
            });
            setEstaBloqueadoPorMi(true);
            Alert.alert('Usuario bloqueado y eliminado de tus amigos');
          }
        }
      ]
    );
  };

  // Función para enviar solicitud de amistad
  const enviarSolicitudAmistad = async () => {
    const auth = getAuth();
    const miUid = auth.currentUser?.uid;
    if (!miUid) return;
    try {
      await addDoc(collection(db, 'users', uid, 'friendRequests'), {
        fromUid: miUid,
        timestamp: serverTimestamp(),
        status: 'pending',
      });
      Alert.alert('Solicitud enviada');
    } catch (err) {
      Alert.alert('Error', 'No se pudo enviar la solicitud');
    }
  };

  // Función para eliminar amigo
  const eliminarAmigo = async () => {
    const auth = getAuth();
    const miUid = auth.currentUser?.uid;
    if (!miUid) return;
    try {
      await updateDoc(doc(db, 'users', miUid), { amigos: arrayRemove(uid) });
      await updateDoc(doc(db, 'users', uid), { amigos: arrayRemove(miUid) });
      setEsAmigo(false);
      Alert.alert('Amigo eliminado');
    } catch (err) {
      Alert.alert('Error', 'No se pudo eliminar al amigo');
    }
  };

  // Función para desbloquear usuario
  const desbloquearUsuario = async () => {
    const auth = getAuth();
    const miUid = auth.currentUser?.uid;
    if (!miUid) return;
    try {
      const userRef = doc(db, 'users', miUid);
      await updateDoc(userRef, {
        bloqueados: arrayRemove(uid),
      });
      setEstaBloqueadoPorMi(false);
      Alert.alert('Usuario desbloqueado');
    } catch (err) {
      Alert.alert('Error', 'No se pudo desbloquear al usuario');
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!uid) return;
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) {
          setUsuario(new UsuarioClass(snap.data()));
          setCantidadAmigos((snap.data().amigos || []).length);
          // Verificar si el usuario actual está bloqueado
          const auth = getAuth();
          const miUid = auth.currentUser?.uid;
          const bloqueados = snap.data().bloqueados || [];
          if (miUid && bloqueados.includes(miUid)) {
            setBloqueado(true);
          } else {
            setBloqueado(false);
          }
          // Verificar si yo lo tengo bloqueado
          if (miUid) {
            const miSnap = await getDoc(doc(db, 'users', miUid));
            if (miSnap.exists()) {
              const misBloqueados = miSnap.data().bloqueados || [];
              setEstaBloqueadoPorMi(misBloqueados.includes(uid));
              const misAmigos = miSnap.data().amigos || [];
              setEsAmigo(misAmigos.includes(uid));
            }
          }
        } else {
          setUsuario(null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [uid]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#093659" />
      </View>
    );
  }

  if (bloqueado) {
    return (
      <View style={styles.container}>
        <Text>No puedes ver este perfil.</Text>
      </View>
    );
  }

  if (!usuario) {
    return (
      <View style={styles.container}>
        <Text>No se encontró este usuario.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* CABECERA PERFIL */}
      <View style={styles.cabeceraPerfil}>
        <View style={styles.headerRow}>
          <Feather
            name="arrow-left"
            size={28}
            color="#093659"
            style={{ marginRight: 8 }}
            onPress={() => navigation.goBack()}
          />
          <Text style={[styles.headerTitle, { backgroundColor: 'transparent' }]}>Perfil</Text>
          <Feather
            name="settings"
            size={24}
            color="#093659"
            style={{ marginLeft: 'auto' }}
          />
        </View>
        <View style={[styles.profileRow, { flexDirection: isWideScreen ? 'row' : 'column', alignItems: 'center', backgroundColor: 'transparent' }]}> 
          <Image
            source={{
              uri: usuario.avatarUrl || 'https://avatars.dicebear.com/api/adventurer/default.svg',
            }}
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
              marginRight: isWideScreen ? 24 : 0,
              marginBottom: !isWideScreen ? 12 : 0,
              backgroundColor: '#fff',
            }}
          />
          <View style={[
            styles.profileInfo,
            {
              alignItems: isWideScreen ? 'flex-start' : 'center',
              backgroundColor: 'transparent',
              // Forzar transparencia
              shadowColor: 'transparent',
              elevation: 0,
            },
          ]}>
            <Text style={[styles.nombre, { fontSize: nombreFontSize }]}>{usuario.nombre}</Text>
            <Text style={[styles.ciudad, { fontSize: ciudadFontSize }]}>Ciudad: {usuario.ciudad}</Text>
            <Text style={[styles.mail, { fontSize: mailFontSize }]}>Mail: {usuario.mail}</Text>
            <View style={[styles.nivelBox, { backgroundColor: '#dbeafe' }]}> 
              <Text style={styles.nivelText}>Nivel 3 - Explorador 🧭</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Estadísticas y acciones */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>54</Text>
          <Text style={styles.statLabel}>Viajes realizados</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{cantidadAmigos}</Text>
          <Text style={styles.statLabel}>Amigos</Text>
        </View>
      </View>
      <View style={styles.actionsRow}>
        {estaBloqueadoPorMi ? (
          <Pressable style={[styles.actionBox, { borderColor: 'red' }]} onPress={desbloquearUsuario}>
            <Text style={styles.blockText}>Desbloquear usuario</Text>
          </Pressable>
        ) : (
          <>
            <Pressable style={[styles.actionBox, { borderColor: 'red' }]} onPress={bloquearUsuario}>
              <Text style={styles.blockText}>Bloquear usuario</Text>
            </Pressable>
            {esAmigo ? (
              <Pressable style={styles.actionBox} onPress={eliminarAmigo}>
                <Text style={styles.addFriendText}>Eliminar amigo</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.actionBox} onPress={enviarSolicitudAmistad}>
                <Text style={styles.addFriendText}>Agregar como amigo</Text>
              </Pressable>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    backgroundColor: '#f6faff',
  },
  cabeceraPerfil: {
    backgroundColor: '#dbeafe',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#093659',
    backgroundColor: 'transparent',
  },
  profileRow: {
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  profileInfo: {
    flex: 1,
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    elevation: 0,
  },
  nombre: {
    fontWeight: 'bold',
    color: '#093659',
    marginBottom: 2,
  },
  ciudad: {
    color: '#093659',
    marginBottom: 2,
  },
  mail: {
    color: '#093659',
    marginBottom: 4,
  },
  nivelBox: {
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  nivelText: {
    fontSize: 13,
    color: '#093659',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginHorizontal: 16,
  },
  statBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    elevation: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#093659',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    color: '#093659',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginHorizontal: 16,
  },
  actionBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e6e6e6',
  },
  blockText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 15,
  },
  addFriendText: {
    color: '#093659',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
