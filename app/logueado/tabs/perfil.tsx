import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, TextInput, Pressable } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { MaterialIcons, Feather, AntDesign } from '@expo/vector-icons';

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';


import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { useResponsiveDimensions } from '../../hooks/useResponsiveDimensions';
import { useResponsiveImageDimensions } from '../../hooks/useResponsiveImageDimensions';

export default function PerfilScreen() {

const router = useRouter();
  
const [usuario, setUsuario] = useState({ //todos esos datos son placeholders, 
                                        //dejarlos como ''
  nombre: 'Felix Loustau',
  ciudad: 'Buenos Aires',
  mail: 'FL429@hotmail.com',
  avatarUrl: 'https://avatars.dicebear.com/api/adventurer/usuario123.svg',
});

useEffect(() => {
  const obtenerDatos = async () => {
    const ref = doc(db, 'usuarios', 'usuarioID'); // reemplazá 'usuarioID' si lo traes dinámicamente
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      if (
        data &&
        data.nombre &&
        data.ciudad &&
        data.mail &&
        data.avatarUrl
      ) {
        setUsuario({
          nombre: data.nombre,
          ciudad: data.ciudad,
          mail: data.mail,
          avatarUrl: data.avatarUrl,
        });
      }
    }
  };

  obtenerDatos();
}, []);

const cerrarSesion = () => {
    console.log('Sesión cerrada')
    router.replace('/');
  };

  const eliminarCuenta = () => {
    console.log('Cuenta eliminada de la base de datos')
    router.replace('/');
  };

return (
    <View style={styles.container}>
      <View style={styles.cabeceraPerfil}>
        <Text style={styles.perfiltxt}>Perfil</Text>
        <Image source={{ uri: usuario.avatarUrl }} style={styles.fotoPerfil} />
        <View style={styles.infoUsuario}>
          <Text style={styles.nombre}>{usuario.nombre}</Text>
          <Text style={styles.ciudad}>Ciudad: {usuario.ciudad}</Text>
          <Text style={styles.mail}>Mail: {usuario.mail}</Text>
        </View>
      </View>
      {/* Opciones y acciones del perfil */}
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
      backgroundColor: '#dbeafe',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 84,
      minHeight: 150,
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
    },

    fotoPerfil:{
      width: 200,
      height: 200,
      borderRadius: 100,
      marginRight: 16,
      backgroundColor: '#DCE9F9',
      marginLeft: 125
    },

    infoUsuario:{
      flex: 1,
      justifyContent: 'center',
      backgroundColor: '#DCE9F9',
    },

    nombre:{
      fontSize: 25,
      fontWeight: 'bold',
      color: '#093659',
    },

    ciudad:{
      fontSize: 22,
      fontWeight: 'bold',
      color: '#093659',
    },

    mail:{
      fontSize: 22,
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
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 12,
    paddingHorizontal: 16,
    marginTop: 90
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
