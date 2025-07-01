import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, ActivityIndicator, useWindowDimensions, Alert, Pressable, Platform, Modal } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, addDoc, collection, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../firebase';
import { UsuarioClass } from '../../types/usuario';
import { Text, View } from '@/components/Themed';
import { Feather } from '@expo/vector-icons';
import type { PaginasStackParamList } from '@/app/types/navigation';
import { enviarNotificacion } from '../../utils/notificaciones';

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
  const [showWebModal, setShowWebModal] = useState(false);
  const [showWebUnblockModal, setShowWebUnblockModal] = useState(false);
  const [showWebDeleteFriendModal, setShowWebDeleteFriendModal] = useState(false);
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);

  // Función para bloquear usuario
  const bloquearUsuario = async () => {
    if (Platform.OS === 'web') {
      setShowWebModal(true);
    } else {
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
    }
  };

  // Función para enviar solicitud de amistad
  const enviarSolicitudAmistad = async () => {
    const auth = getAuth();
    const miUid = auth.currentUser?.uid;
    if (!miUid) return;
    try {
      // Verificar si ya existe una solicitud pendiente
      const friendRequestsRef = collection(db, 'users', uid, 'friendRequests');
      const snapshot = await getDoc(doc(friendRequestsRef, miUid));
      if (snapshot.exists() && snapshot.data().status === 'pending') {
        if (Platform.OS === 'web') {
          window.alert('Ya enviaste una solicitud a este usuario.');
        } else {
          Alert.alert('Ya enviaste una solicitud a este usuario.');
        }
        setSolicitudEnviada(true);
        return;
      }
      // Si no existe, crear la solicitud
      await addDoc(friendRequestsRef, {
        fromUid: miUid,
        timestamp: serverTimestamp(),
        status: 'pending',
      });
      // Enviar notificación al usuario receptor
      await enviarNotificacion(uid, 'Tienes una nueva solicitud de amistad', 'solicitud_amistad');
      setSolicitudEnviada(true);
      if (Platform.OS === 'web') {
        window.alert('Solicitud enviada');
      } else {
        Alert.alert('Solicitud enviada');
      }
    } catch (err) {
      if (Platform.OS === 'web') {
        window.alert('Error: No se pudo enviar la solicitud');
      } else {
        Alert.alert('Error', 'No se pudo enviar la solicitud');
      }
    }
  };

  // Función para eliminar amigo
  const eliminarAmigo = async () => {
    if (Platform.OS === 'web') {
      setShowWebDeleteFriendModal(true);
    } else {
      Alert.alert(
        'Eliminar amigo',
        '¿Estás seguro que deseas eliminar a este amigo?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar', style: 'destructive', onPress: async () => {
              const auth = getAuth();
              const miUid = auth.currentUser?.uid;
              if (!miUid) return;
              await updateDoc(doc(db, 'users', miUid), { amigos: arrayRemove(uid) });
              await updateDoc(doc(db, 'users', uid), { amigos: arrayRemove(miUid) });
              setEsAmigo(false);
              Alert.alert('Amigo eliminado');
            }
          }
        ]
      );
    }
  };

  // Función para desbloquear usuario
  const desbloquearUsuario = async () => {
    if (Platform.OS === 'web') {
      setShowWebUnblockModal(true);
    } else {
      Alert.alert(
        'Desbloquear usuario',
        '¿Estás seguro que deseas desbloquear a este usuario?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Desbloquear', style: 'default', onPress: async () => {
              const auth = getAuth();
              const miUid = auth.currentUser?.uid;
              if (!miUid) return;
              const userRef = doc(db, 'users', miUid);
              await updateDoc(userRef, {
                bloqueados: arrayRemove(uid),
              });
              setEstaBloqueadoPorMi(false);
              Alert.alert('Usuario desbloqueado');
            }
          }
        ]
      );
    }
  };

  useEffect(() => {
    let unsubscribeUsuario: (() => void) | null = null;
    const fetchUser = async () => {
      if (!uid) return;
      try {
        // Suscribirse en vivo a los datos del usuario
        const userRef = doc(db, 'users', uid);
        unsubscribeUsuario = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUsuario(new UsuarioClass(docSnap.data()));
            const amigosArr = docSnap.data().amigos || [];
            setCantidadAmigos(amigosArr.length);
          } else {
            setUsuario(null);
            setCantidadAmigos(0);
          }
        });
        // ...resto de la lógica...
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          // Verificar si el usuario actual está bloqueado
          const auth = getAuth();
          const miUid = auth.currentUser?.uid;
          const bloqueados = snap.data().bloqueados || [];
          if (miUid && bloqueados.includes(miUid)) {
            setBloqueado(true);
          } else {
            setBloqueado(false);
          }
          if (miUid) {
            const miSnap = await getDoc(doc(db, 'users', miUid));
            if (miSnap.exists()) {
              const misBloqueados = miSnap.data().bloqueados || [];
              setEstaBloqueadoPorMi(misBloqueados.includes(uid));
              const misAmigos = miSnap.data().amigos || [];
              setEsAmigo(misAmigos.includes(uid));
            }
            const friendRequestsRef = collection(db, 'users', uid, 'friendRequests');
            const friendRequestsSnap = await getDoc(doc(friendRequestsRef, miUid));
            if (friendRequestsSnap.exists() && friendRequestsSnap.data().status === 'pending') {
              setSolicitudEnviada(true);
            } else {
              setSolicitudEnviada(false);
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
    return () => {
      if (unsubscribeUsuario) unsubscribeUsuario();
    };
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
          {/* Flecha de volver eliminada */}
          <Text style={[styles.headerTitle, { backgroundColor: 'transparent' }]}>Perfil</Text>
          {/* Botón de configuración eliminado */}
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
            ) : solicitudEnviada ? (
              <View style={[styles.actionBox, { backgroundColor: '#e6f7e6', borderColor: '#4caf50', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}> 
                <Feather name="check" size={20} color="#4caf50" style={{ marginRight: 6 }} />
                <Text style={[styles.addFriendText, { color: '#4caf50' }]}>Solicitud enviada</Text>
              </View>
            ) : (
              <Pressable style={styles.actionBox} onPress={enviarSolicitudAmistad}>
                <Text style={styles.addFriendText}>Agregar como amigo</Text>
              </Pressable>
            )}
          </>
        )}
      </View>

      {/* Modal de confirmación para web */}
      <Modal
        visible={showWebModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWebModal(false)}
      >
        <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor:'#fff', padding:24, borderRadius:12, alignItems:'center', minWidth:300 }}>
            <Text style={{ fontWeight:'bold', fontSize:18, marginBottom:12 }}>Bloquear usuario</Text>
            <Text style={{ marginBottom:20 }}>¿Estás seguro que deseas bloquear a este usuario? También se eliminará de tu lista de amigos.</Text>
            <View style={{ flexDirection:'row', gap:12 }}>
              <Pressable onPress={() => setShowWebModal(false)} style={{ padding:10, borderRadius:6, backgroundColor:'#eee', marginRight:8 }}>
                <Text>Cancelar</Text>
              </Pressable>
              <Pressable onPress={async () => {
                setShowWebModal(false);
                const auth = getAuth();
                const miUid = auth.currentUser?.uid;
                if (!miUid) return;
                const userRef = doc(db, 'users', miUid);
                await updateDoc(userRef, {
                  bloqueados: arrayUnion(uid),
                  amigos: arrayRemove(uid),
                });
                await updateDoc(doc(db, 'users', uid), {
                  amigos: arrayRemove(miUid),
                });
                setEstaBloqueadoPorMi(true);
                if (Platform.OS === 'web') alert('Usuario bloqueado y eliminado de tus amigos');
              }} style={{ padding:10, borderRadius:6, backgroundColor:'red' }}>
                <Text style={{ color:'#fff' }}>Bloquear</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación para web: desbloquear */}
      <Modal
        visible={showWebUnblockModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWebUnblockModal(false)}
      >
        <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor:'#fff', padding:24, borderRadius:12, alignItems:'center', minWidth:300 }}>
            <Text style={{ fontWeight:'bold', fontSize:18, marginBottom:12 }}>Desbloquear usuario</Text>
            <Text style={{ marginBottom:20 }}>¿Estás seguro que deseas desbloquear a este usuario?</Text>
            <View style={{ flexDirection:'row', gap:12 }}>
              <Pressable onPress={() => setShowWebUnblockModal(false)} style={{ padding:10, borderRadius:6, backgroundColor:'#eee', marginRight:8 }}>
                <Text>Cancelar</Text>
              </Pressable>
              <Pressable onPress={async () => {
                setShowWebUnblockModal(false);
                const auth = getAuth();
                const miUid = auth.currentUser?.uid;
                if (!miUid) return;
                const userRef = doc(db, 'users', miUid);
                await updateDoc(userRef, {
                  bloqueados: arrayRemove(uid),
                });
                setEstaBloqueadoPorMi(false);
                if (Platform.OS === 'web') alert('Usuario desbloqueado');
              }} style={{ padding:10, borderRadius:6, backgroundColor:'#093659' }}>
                <Text style={{ color:'#fff' }}>Desbloquear</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación para web: eliminar amigo */}
      <Modal
        visible={showWebDeleteFriendModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWebDeleteFriendModal(false)}
      >
        <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor:'#fff', padding:24, borderRadius:12, alignItems:'center', minWidth:300 }}>
            <Text style={{ fontWeight:'bold', fontSize:18, marginBottom:12 }}>Eliminar amigo</Text>
            <Text style={{ marginBottom:20 }}>¿Estás seguro que deseas eliminar a este amigo?</Text>
            <View style={{ flexDirection:'row', gap:12 }}>
              <Pressable onPress={() => setShowWebDeleteFriendModal(false)} style={{ padding:10, borderRadius:6, backgroundColor:'#eee', marginRight:8 }}>
                <Text>Cancelar</Text>
              </Pressable>
              <Pressable onPress={async () => {
                setShowWebDeleteFriendModal(false);
                const auth = getAuth();
                const miUid = auth.currentUser?.uid;
                if (!miUid) return;
                await updateDoc(doc(db, 'users', miUid), { amigos: arrayRemove(uid) });
                await updateDoc(doc(db, 'users', uid), { amigos: arrayRemove(miUid) });
                setEsAmigo(false);
                if (Platform.OS === 'web') alert('Amigo eliminado');
              }} style={{ padding:10, borderRadius:6, backgroundColor:'red' }}>
                <Text style={{ color:'#fff' }}>Eliminar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
