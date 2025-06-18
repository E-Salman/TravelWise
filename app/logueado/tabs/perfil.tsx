import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, TextInput, Pressable, Dimensions, useWindowDimensions } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { MaterialIcons, Feather, AntDesign } from '@expo/vector-icons';

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { logoutUser } from '../../../app/auth/logoutUser'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from "firebase/auth";

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { useResponsiveDimensions } from '../../hooks/useResponsiveDimensions';
import { useResponsiveImageDimensions } from '../../hooks/useResponsiveImageDimensions';

export default function PerfilScreen() {

const router = useRouter();

  
const [usuario, setUsuario] = useState({ //todos esos datos son placeholders, 
                                        //dejarlos como ''
  nombre: '',
  ciudad: '',
  mail: '',
  avatarUrl: '',
});

const { width, height } = useWindowDimensions();
const isWideScreen = width > 600;
const avatarSize =  Math.min(width, height) * 0.2; // Por ejemplo: 30% del ancho
const nombreFontSize = Math.min(width * 0.06, height * 0.04); // 6% del ancho
const ciudadFontSize = Math.min(width * 0.045, height * 0.03);
const mailFontSize = Math.min(width * 0.045, height * 0.03);


useEffect(() => {
  const obtenerDatos = async () => {
    try {
      let uid: string | null = null;

      // 1️⃣ Siempre intentar primero de AsyncStorage
      uid = await AsyncStorage.getItem('userUID');

      // 2️⃣ Si no hay, usar Firebase Auth (por si no refrescaste)
      if (!uid) {
        const auth = getAuth();
        if (auth.currentUser) {
          uid = auth.currentUser.uid;
        }
      }

      console.log("UID final:", uid);

      if (!uid) {
        console.log("No se encontró UID en ningún lado.");
        return;
      }

      // 3️⃣ Traer datos de Firestore
      const ref = doc(db, 'users', uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        console.log("DATA Firestore:", data);
        setUsuario({
          nombre: data.nombre || '',
          ciudad: data.ciudad || '',
          mail: data.email || '',
          avatarUrl: data.avatarURL || 'https://avatars.dicebear.com/api/adventurer/usuario123.svg',
        });
      } else {
        console.log("No existe documento para UID:", uid);
      }

    } catch (error) {
      console.error("Error en obtenerDatos:", error);
    }
  };

  obtenerDatos();
}, []);


const cerrarSesion = async () => {
    try {
    // Cerrar sesión con Firebase Auth
    await logoutUser();

    // Borrar email guardado en AsyncStorage
    await AsyncStorage.removeItem('userEmail');
    await AsyncStorage.removeItem('userUID');
    
    console.log('Sesión cerrada y email recordado borrado');
    router.replace('/');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
  };

  const eliminarCuenta = () => {
    console.log('Cuenta eliminada de la base de datos')
    router.replace('/');
  };

return (
    <View style={styles.container}>
      <View style={[styles.cabeceraPerfil, {
  flexDirection: isWideScreen ? 'row' : 'column',
  justifyContent: 'center',
  alignItems: 'center',
}]}>
        <Text style={styles.perfiltxt}>Perfil</Text>
        <Image source={{ uri: usuario.avatarUrl }} 
        style={[styles.fotoPerfil, {
          width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2,
          marginRight: isWideScreen ? 40 : 0,
          marginBottom: !isWideScreen ? 20 : 0,}]} />
        <View style={styles.infoUsuario}>
          <Text style={[styles.nombre, { fontSize: nombreFontSize }]}>{usuario.nombre}</Text>
          <Text style={[styles.mail, { fontSize: mailFontSize }]}>Mail: {usuario.mail}</Text>
          <Text style={[styles.ciudad, { fontSize: ciudadFontSize }]}>Ciudad: {usuario.ciudad}</Text>
        </View>
      </View>
      {/* Opciones y acciones del perfil */}
       <View style={styles.perfilMedio}>
      <View style={styles.cajitasMellizas}>
        <Pressable style={styles.cajitasM} onPress={() => router.push('../logueado')}>
          <Text style={styles.valorCajita}>28</Text>
          <Text style={styles.nombreCajita}>Viajes realizados</Text>
        </Pressable>
        <Pressable style={styles.cajitasM} onPress={() => router.push('../logueado')}>
          <Text style={styles.valorCajita}>47</Text>
          <Text style={styles.nombreCajita}>Amigos</Text>
        </Pressable>
      </View>
      

      <Pressable style={styles.invitarAmichisCajita} onPress={() => router.push('../logueado')}>
        <Text style={styles.invitarAmichis}>Invitar amigos</Text>
        <Feather name="plus-circle" size={24} color="#093659" />
      </Pressable>
      </View>

      <View style={styles.opciones}>
        <Pressable style={styles.accion} onPress={() => router.push('../logueado')}>
          <Feather name="settings" size={20} color="#1E1E1E" />
          <Text style={styles.opcionTxt}>Configuración</Text>
        </Pressable>

        <Pressable style={styles.accion} onPress={cerrarSesion}>
          <MaterialIcons name="logout" size={20} color="#1E1E1E" />
          <Text style={styles.opcionTxt}>Cerrar sesión</Text>
        </Pressable>

        <Pressable style={styles.eliminar} onPress={eliminarCuenta}>
          <AntDesign name="deleteuser" size={20} color="darkred" />
          <Text style={styles.eliminarTxt}>Eliminar cuenta</Text>
        </Pressable>
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      padding: 16,
    },

    perfiltxt: {
      position: 'absolute',
      top: 16,
      left: 16,
      fontSize: 20,
      fontWeight: 'bold',
      color: '#093659',
      marginLeft: 20,

    },

    cabeceraPerfil: {
      flex: 3,
      backgroundColor: '#dbeafe',
      borderRadius: 12,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
    },
    perfilMedio: {
      flex: 2,
      justifyContent: 'center',
    },

    fotoPerfil:{
      marginVertical: 10,
      backgroundColor: '#DCE9F9',
      //width: 200,
      //height: 200,
      //borderRadius: 100,
      //marginRight: 16,
      //backgroundColor: '#DCE9F9',
      marginLeft: 20
    },

    infoUsuario:{
      alignItems: 'center',
      marginTop: 10,
      //justifyContent: 'center',
      backgroundColor: 'transparent',
    },

    nombre:{
      //fontSize: 25,
      fontWeight: 'bold',
      color: '#093659',
    },

    ciudad:{
      //fontSize: 22,
      fontWeight: 'bold',
      color: '#093659',
    },

    mail:{
      //fontSize: 22,
      fontWeight: 'bold',
      color: '#093659',
    },

    cajitasMellizas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  cajitasM: {
    backgroundColor: '#F0F4F8',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    alignItems: 'center',
  },
  valorCajita: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#093659',
  },
  nombreCajita: {
    fontSize: 14,
    textAlign: 'center',
    color: '#1E1E1E',
  },
  invitarAmichisCajita: {
    backgroundColor: '#F0F4F8',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  invitarAmichis: {
    fontSize: 16,
    color: '#093659',
    fontWeight: 'bold',
  },
  opciones: {
    flex: 1.5,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  accion: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  opcionTxt: {
    fontSize: 16,
    color: '#1E1E1E',
  },
  eliminar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  eliminarTxt: {
    fontSize: 16,
    color: 'darkred',
    fontWeight: 'bold',
  },

})
