// app/logueado/tabs/drawer/CustomDrawerContent.tsx
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { DrawerContentComponentProps, DrawerItem } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase'; // ajustá si tu ruta es distinta

type UserProfile = {
  name:   string;
  avatar: string;
  level:  number;
  points: number;
};

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // 1) Carga de datos del usuario logueado
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    // Base: displayName / photoURL de Firebase Auth
    const base: Partial<UserProfile> = {
      name:   user.displayName ?? user.email!.split('@')[0],
      avatar: user.photoURL ?? `https://i.pravatar.cc/150?u=${user.uid}`,
    };

    // Si en Firestore guardas level y points en "users/{uid}"
    getDoc(doc(db, 'users', user.uid))
      .then(snap => {
        if (snap.exists()) {
          const data = snap.data() as any;
          setProfile({
            name:   data.name      || base.name!,
            avatar: data.avatarUrl || base.avatar!,
            level:  data.level     ?? 1,
            points: data.points    ?? 0,
          });
        } else {
          // sin doc, usamos sólo Auth
          setProfile({
            name:   base.name!,
            avatar: base.avatar!,
            level:  1,
            points: 0,
          });
        }
      })
      .catch(() => {
        setProfile({
          name:   base.name!,
          avatar: base.avatar!,
          level:  1,
          points: 0,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  // 2) Muestra indicador de carga si hace falta
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#093659" />
      </View>
    );
  }

  // 3) Si por algún motivo no hay perfil
  if (!profile) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>No estás logueado</Text>
      </View>
    );
  }

  // 4) Render completo: header + tip + opciones
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={styles.container}>
      {/* — Header con foto y nombre reales — */}
      <View style={styles.header}>
        <Image source={{ uri: profile.avatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.level}>Nivel {profile.level} – Explorador 🧭</Text>
        </View>
        <View style={styles.pointsBox}>
          <Text style={styles.pointsText}>⭐ {profile.points} +</Text>
        </View>
      </View>

      {/* — Cajita de tip — */}
      <View style={styles.tipBox}>
        <Text style={styles.tipText}>
          ✨ ¿Sabías que podés{"\n"}ganar puntos invitando amigos?
        </Text>
      </View>

      {/* — Lista de opciones — */}
      <DrawerItem
        label="+Info sobre recompensas"
        onPress={() => { props.navigation.navigate('Perfil'); props.navigation.closeDrawer(); }}
        icon={() => <Ionicons name="star-outline" size={20} color="#093659" />}
      />
      <DrawerItem
        label="Historial de viajes"
        onPress={() => { props.navigation.navigate('Paginas'); props.navigation.closeDrawer(); }}
        icon={() => <Ionicons name="time-outline" size={20} color="#093659" />}
      />
      <DrawerItem
        label="Pagos"
        onPress={() => { props.navigation.navigate('Pagos'); props.navigation.closeDrawer(); }}
        icon={() => <Ionicons name="card-outline" size={20} color="#093659" />}
      />
      <DrawerItem
        label="Ayudanos a mejorar"
        onPress={() => { props.navigation.navigate('Soporte'); props.navigation.closeDrawer(); }}
        icon={() => <Ionicons name="construct-outline" size={20} color="#093659" />}
      />
      <DrawerItem
        label="Soporte"
        onPress={() => { props.navigation.navigate('Soporte'); props.navigation.closeDrawer(); }}
        icon={() => <Ionicons name="help-circle-outline" size={20} color="#093659" />}
      />
      <DrawerItem
        label="Términos y condiciones"
        onPress={() => { props.navigation.navigate('Terminos'); props.navigation.closeDrawer(); }}
        icon={() => <Ionicons name="document-text-outline" size={20} color="#093659" />}
      />
      <DrawerItem
        label="Políticas de privacidad"
        onPress={() => { props.navigation.navigate('Privacidad'); props.navigation.closeDrawer(); }}
        icon={() => <Ionicons name="lock-closed-outline" size={20} color="#093659" />}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e6f0fa' },
  header:    { flexDirection:'row', alignItems:'center', padding:16, paddingTop:40, backgroundColor:'#d0e8fa' },
  avatar:    { width:56, height:56, borderRadius:28, marginRight:12 },
  name:      { fontSize:16, fontWeight:'bold', color:'#093659' },
  level:     { fontSize:13, color:'#5a7e9d' },
  pointsBox: { marginLeft:'auto', backgroundColor:'#fff', borderRadius:20, paddingHorizontal:12, paddingVertical:4 },
  pointsText:{ fontSize:14, fontWeight:'600', color:'#000' },
  tipBox:    { backgroundColor:'#fff', margin:16, padding:12, borderRadius:8 },
  tipText:   { fontSize:13, lineHeight:18, color:'#333' },
});
