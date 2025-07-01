import React, { useState } from 'react';
import { FlatList, ActivityIndicator, Image, StyleSheet, View as RNView, Pressable } from 'react-native';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { usuario } from '../../types/usuario';
import { Text, View } from '@/components/Themed';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { PaginasStackNavigationProp } from '../../types/navigation';

// Define a type that includes the UID with the UsuarioClass
interface AmigoConUid extends usuario { uid: string; }

export default function ListaAmigosScreen() {
  const navigation = useNavigation<PaginasStackNavigationProp>();
  const [amigos, setAmigos] = useState<AmigoConUid[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const miUid = auth.currentUser?.uid;

  // Refrescar la lista cuando la pantalla reciba foco
  useFocusEffect(
    React.useCallback(() => {
      const fetchAmigos = async () => {
        if (!miUid) return;
        setLoading(true);
        try {
          const snap = await getDoc(doc(db, 'users', miUid));
          if (snap.exists()) {
            const data = snap.data();
            const amigosUids: string[] = data.amigos || [];
            const amigosData: AmigoConUid[] = [];
            for (const uid of amigosUids) {
              const amigoSnap = await getDoc(doc(db, 'users', uid));
              if (amigoSnap.exists()) {
                const amigoData = amigoSnap.data() as usuario;
                amigosData.push({ ...amigoData, uid });
              }
            }
            setAmigos(amigosData);
          }
        } finally {
          setLoading(false);
        }
      };
      fetchAmigos();
    }, [miUid])
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#093659" style={{ marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis amigos</Text>
      <FlatList
        data={amigos}
        keyExtractor={item => item.mail || item.nombre}
        ListEmptyComponent={<Text style={styles.empty}>No tienes amigos aún.</Text>}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('perfilUser', { uid: item.uid })}>
            <View style={styles.card}>
              <RNView style={{ flexDirection: 'row', alignItems: 'center' }}>
                {item.avatarUrl ? (
                  <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]} />
                )}
                <RNView style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.nombre}>{item.nombre}</Text>
                  <Text style={styles.mail}>{item.mail}</Text>
                  <Text style={styles.ciudad}>{item.ciudad}</Text>
                </RNView>
              </RNView>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f6faff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#093659' },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, elevation: 1 },
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
