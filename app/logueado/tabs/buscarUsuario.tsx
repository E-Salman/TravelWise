// app/logueado/tabs/BuscarUsuariosScreen.tsx

import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
  View as RNView,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  startAt,
  endAt,
  doc,
  updateDoc,
  arrayUnion,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../firebase';
import { UsuarioClass } from '../../../app/types/usuario';
import { Text, View } from '@/components/Themed';
import { Feather } from '@expo/vector-icons';
import type { Notificacion } from '../../../app/types/notificacion';
import type { FriendRequest } from '../../../app/types/friendRequest';
import { useNavigation } from '@react-navigation/native';
// Para tipar cada resultado con su UID
type Resultado = {
  id: string;
  usuario: UsuarioClass;
};

export default function BuscarUsuariosScreen() {
   const navigation = useNavigation();
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [loading, setLoading] = useState(false);

  // 1) Búsqueda case-insensitive usando nombreMin
  const buscarUsuarios = async () => {
    const textoMin = busqueda.trim().toLowerCase();
    if (!textoMin) {
      setResultados([]);
      return;
    }

    setLoading(true);
    try {
      const ref = collection(db, 'users');
      const q = query(
        ref,
        orderBy('nombreMin'),
        startAt(textoMin),
        endAt(textoMin + '\uf8ff')
      );
      const snap = await getDocs(q);

      const lista = snap.docs.map(docSnap => ({
        id: docSnap.id,
        usuario: new UsuarioClass(docSnap.data() as Partial<UsuarioClass>),
      }));
      setResultados(lista);
    } catch (err) {
      console.error('Error buscando usuarios:', err);
      Alert.alert('Error', 'No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };

  const enviarSolicitud = async (targetUid: string) => {
  const auth = getAuth();
  const fromUid = auth.currentUser?.uid!;
  // 1) Crear la solicitud en la sub-colección de solicitudes
  const reqRef = await addDoc(
    collection(db, 'users', targetUid, 'friendRequests'),
    {
      fromUid,
      timestamp: serverTimestamp(),
      status: 'pending'
    }
  );
  // 2) Notificación en la carpeta de notificaciones
  await addDoc(
    collection(db, 'users', targetUid, 'notifications'),
    {
      type: 'friend_request',
      payload: { requestId: reqRef.id, fromUid },
      read: false,
      timestamp: serverTimestamp()
    }
  );
  Alert.alert('¡Solicitud enviada!');
};

  // 2) Agregar amigo usando arrayUnion
  const agregarAmigo = async (friendUid: string) => {
    const auth = getAuth();
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) {
      Alert.alert('Error', 'No estás autenticado.');
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUid);
      await updateDoc(userRef, {
        amigos: arrayUnion(friendUid),
      });
      Alert.alert('¡Listo!', 'Usuario agregado como amigo.');
    } catch (err) {
      console.error('Error agregando amigo:', err);
      Alert.alert('Error', 'No se pudo agregar el amigo.');
    }
  };

  return (
    <View style={styles.container}>
      {/* ← Volver */}
      <Pressable style={styles.backButton} onPress={() => (navigation as any).navigate('Paginas', { screen: 'perfil' })}>
        <Feather name="arrow-left" size={28} color="#093659" />
      </Pressable>

      <Text style={styles.title}>Buscar usuarios</Text>

      {/* Fila de búsqueda */}
      <RNView style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChangeText={setBusqueda}
          returnKeyType="search"
          onSubmitEditing={buscarUsuarios}
          onEndEditing={buscarUsuarios}
        />
        <Pressable onPress={buscarUsuarios} style={styles.searchButton}>
          <Feather name="search" size={20} color="#fff" />
        </Pressable>
      </RNView>

      {loading && <ActivityIndicator size="large" color="#093659" />}

      <FlatList
        data={resultados}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          !loading && busqueda
            ? <Text style={styles.noResults}>No se encontraron usuarios</Text>
            : null
        }
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            {/* Avatar con fallback */}
            {item.usuario.avatarUrl ? (
              <Image
                source={{ uri: item.usuario.avatarUrl }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]} />
            )}

            <RNView style={styles.userInfo}>
              <Text style={styles.nombre}>{item.usuario.nombre}</Text>
              <Text style={styles.mail}>{item.usuario.mail}</Text>
              <Text style={styles.ciudad}>Ciudad: {item.usuario.ciudad}</Text>

              {/* Botón Agregar amigo */}
              <Pressable
                style={styles.addButton}
                onPress={() => agregarAmigo(item.id)}
              >
                <Text style={styles.addButtonText}>Agregar</Text>
              </Pressable>
            </RNView>
          </View>
        )}
      />
    </View>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  backButton: { marginBottom: 10 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, color: '#093659' },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#093659',
    borderRadius: 8,
    padding: 12,
  },
  searchButton: {
    backgroundColor: '#093659',
    padding: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  noResults: { textAlign: 'center', marginTop: 20, color: '#999' },
  userCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  avatarPlaceholder: {
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: { flex: 1 },
  nombre: { fontSize: 16, fontWeight: 'bold', color: '#093659' },
  mail: { fontSize: 14, color: '#555', marginBottom: 4 },
  ciudad: { fontSize: 14, color: '#555', marginBottom: 8 },
  addButton: {
    backgroundColor: '#093659',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
