import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { UsuarioClass } from '../../../app/types/usuario';
import { Text, View } from '@/components/Themed';

export default function UserProfileScreen() {
  const router = useRouter();
  const { uid } = useLocalSearchParams<{ uid: string }>();

  const [usuario, setUsuario] = useState<UsuarioClass | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!uid) return;
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) {
          setUsuario(new UsuarioClass(snap.data()));
        } else {
          console.log('No se encontró el usuario.');
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

  if (!usuario) {
    return (
      <View style={styles.container}>
        <Text>No se encontró este usuario.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil de usuario</Text>
      <Image
        source={{
          uri:
            usuario.avatarUrl ||
            'https://avatars.dicebear.com/api/adventurer/default.svg',
        }}
        style={styles.avatar}
      />
      <Text style={styles.nombre}>{usuario.nombre}</Text>
      <Text style={styles.mail}>Mail: {usuario.mail}</Text>
      <Text style={styles.ciudad}>Ciudad: {usuario.ciudad}</Text>
      {/* Podés agregar más datos públicos aquí */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#093659',
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 20,
  },
  nombre: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#093659',
  },
  mail: {
    fontSize: 16,
    marginBottom: 4,
    color: '#093659',
  },
  ciudad: {
    fontSize: 16,
    color: '#093659',
  },
});
