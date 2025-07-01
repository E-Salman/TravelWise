import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Image,
  TextInput,
  Pressable,
  Dimensions,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, Feather, AntDesign } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { logoutUser } from '../../../app/auth/logoutUser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, deleteUser } from 'firebase/auth';
import { updateUser } from '../../../app/auth/updateUser';
import { UsuarioClass } from '../../../app/types/usuario';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenProps } from '@/app/types/navigation';
import { TabsParamList } from '../../types/navigation';
import { Text, View } from '@/components/Themed';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';


export default function PerfilScreen() {
  const router = useRouter();
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
  const [usuarioOriginal, setUsuarioOriginal] = useState(new UsuarioClass());
  const [cantidadAmigos, setCantidadAmigos] = useState(0);

  const [usuario, setUsuario] = useState<UsuarioClass | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  const { width, height } = useWindowDimensions();
  const isWideScreen = width > 600;
  const avatarSize = Math.min(width, height) * 0.2;
  const nombreFontSize = Math.min(width * 0.06, height * 0.04);
  const ciudadFontSize = Math.min(width * 0.045, height * 0.03);
  const mailFontSize = Math.min(width * 0.045, height * 0.03);

  const navigation = useNavigation<BottomTabNavigationProp<TabsParamList>>();

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const auth = getAuth();
        const uid = auth.currentUser?.uid;
        if (!uid) {
          console.log("No user logged in.");
          return;
        }
        await AsyncStorage.setItem('userUID', uid);
        const ref = doc(db, 'users', uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setUsuario(new UsuarioClass(snap.data()));
          const amigos = snap.data().amigos || [];
          setCantidadAmigos(amigos.length);
        } else {
          console.log("No existe documento para este UID");
        }
      } catch (error) {
        console.error("Error en obtenerDatos:", error);
      }
    };
    obtenerDatos();
  }, []);

  const cerrarSesion = async () => {
    try {
      await logoutUser();
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('userUID');
      router.replace('/');
    } catch (error) {
      console.error(error);
    }
  };

  const eliminarCuenta = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        const uid = currentUser.uid;
        await deleteDoc(doc(db, 'users', uid));
        await deleteUser(currentUser);
        await AsyncStorage.removeItem('userEmail');
        await AsyncStorage.removeItem('userUID');
        router.replace('/');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const guardarCambios = async () => {
  try {
    let uid = await AsyncStorage.getItem('userUID');
    if (!uid) {
      const auth = getAuth();
      uid = auth.currentUser?.uid || '';
    }
    if (!usuario) {
      throw new Error("Usuario no cargado");
    }

    await updateUser(uid, usuario);
    Alert.alert('Éxito', 'Datos actualizados correctamente');
    setModoEdicion(false);
  } catch (error) {
    console.error(error);
  }
};

  return (
    <View style={styles.container}>

  {/* CABECERA PERFIL */}
  <View style={styles.cabeceraPerfil}>
  {/* Título */}
  <Text style={styles.perfiltxt}>Perfil</Text>

  {/* Botones flotantes arriba a la derecha */}
  <View style={styles.botonesEdicion}>
    {modoEdicion && (
      <Pressable
        onPress={() => {
          setUsuario(new UsuarioClass(usuarioOriginal));
          setModoEdicion(false);
        }}
        style={{ marginHorizontal: 8 }}
      >
        <Feather name="x" size={24} color="darkred" />
      </Pressable>
    )}
    <Pressable
      onPress={() => {
        if (modoEdicion) {
          guardarCambios();
        } else {
          if (!usuario) return;
          setUsuarioOriginal(new UsuarioClass(usuario));
          setModoEdicion(true);
        }
      }}
      style={{ marginHorizontal: 8 }}
    >
      <Feather name={modoEdicion ? "check" : "edit"} size={24} color="#093659" />
    </Pressable>
  </View>

  {/* Imagen de perfil */}
  <Image
    source={{
      uri: usuario?.avatarUrl || 'https://avatars.dicebear.com/api/adventurer/default.svg',
    }}
    style={{
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
      marginRight: isWideScreen ? 40 : 0,
      marginBottom: !isWideScreen ? 20 : 0,
    }}
  />

    <View style={styles.infoUsuario}>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          </View>
  </View>
      {modoEdicion ? (
        <>
          <TextInput
            style={styles.input}
            value={usuario?.nombre ?? ' '}
            placeholder="Nombre"
            onChangeText={(text) => {
              if (!usuario) return;
              const u = new UsuarioClass(usuario);
              u.nombre = text;
              setUsuario(u);
            }}
          />
          <TextInput
            style={styles.input}
            value={usuario?.mail ?? ' '}
            placeholder="Email"
            onChangeText={(text) => {
              if (!usuario) return;
              const u = new UsuarioClass(usuario);
              u.mail = text;
              setUsuario(u);
            }}
          />
          <TextInput
            style={styles.input}
            value={usuario?.ciudad ?? ' '}
            placeholder="Ciudad"
            onChangeText={(text) => {
              if (!usuario) return;
              const u = new UsuarioClass(usuario);
              u.ciudad = text;
              setUsuario(u);
            }}
          />
          <TextInput
            style={styles.input}
            value={usuario?.avatarUrl ?? ' '}
            placeholder="Foto URL"
            onChangeText={(text) => {
              if (!usuario) return;
              const u = new UsuarioClass(usuario);
              u.avatarUrl = text;
              setUsuario(u);
            }}
          />
        </>
      ) : (
        <>
          <Text style={[styles.nombre, { fontSize: nombreFontSize }]}>{usuario?.nombre ?? ' '}</Text>
          <Text style={[styles.mail, { fontSize: mailFontSize }]}>Mail: {usuario?.mail ?? ' '}</Text>
          <Text style={[styles.ciudad, { fontSize: ciudadFontSize }]}>Ciudad: {usuario?.ciudad ?? ' '}</Text>
        </>
      )}
    </View>
  {!modoEdicion && (
    <>
      <View style={styles.perfilMedio}>
        <View style={styles.cajitasMellizas}>
          <Pressable style={styles.cajitasM} onPress={() => navigation.navigate('Paginas', { screen: 'buscarUsuario' })}>
            <Text style={styles.valorCajita}>28</Text>
            <Text style={styles.nombreCajita}>Viajes realizados</Text>
          </Pressable>
          <Pressable style={styles.cajitasM} onPress={() => navigation.navigate('Paginas', { screen: 'ListaAmigos' })}>
            <Text style={styles.valorCajita}>{cantidadAmigos}</Text>
            <Text style={styles.nombreCajita}>Amigos</Text>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
          <Pressable
            style={[styles.invitarAmichisCajita, { flex: 1, marginRight: 8 }]}
            onPress={() => navigation.navigate('Paginas', { screen: 'buscarUsuario' })}>
            <Text style={styles.invitarAmichis}>Buscar usuarios</Text>
            <Feather name="plus-circle" size={24} color="#093659" />
          </Pressable>
          <Pressable
            style={[styles.invitarAmichisCajita, { flex: 1, marginLeft: 8, backgroundColor: '#e6f0fa', borderColor: '#093659', borderWidth: 1 }]}
            onPress={() => navigation.navigate('Paginas', { screen: 'SolicitudesAmistad' })}>
            <Text style={[styles.invitarAmichis, { color: '#093659' }]}>Solicitudes de amistad</Text>
            <Feather name="users" size={24} color="#093659" />
          </Pressable>
        </View>
      </View>

      <View style={styles.opciones}>
        <Pressable style={styles.accion} onPress={() => navigation.navigate('Paginas', { screen: 'configuracion' })}>
          <Feather name="settings" size={20} color="#1E1E1E" />
          <Text style={styles.opcionTxt}>Configuración</Text>
        </Pressable>

        <Pressable style={styles.accion} onPress={() => setMostrarConfirmacion(true)}>
          <MaterialIcons name="logout" size={20} color="#1E1E1E" />
          <Text style={styles.opcionTxt}>Cerrar sesión</Text>
        </Pressable>

        <Pressable style={styles.eliminar} onPress={() => setMostrarConfirmacionEliminar(true)}>
          <AntDesign name="deleteuser" size={20} color="darkred" />
          <Text style={styles.eliminarTxt}>Eliminar cuenta</Text>
        </Pressable>
      </View>
    </>
  )}


  {/* ✅ SI ESTÁ EN EDICIÓN -> MOSTRAR SELECTORES DE PREFERENCIAS */}
  {modoEdicion && (
    <View style={{ marginTop: 20 }}>
      <Text>Visibilidad de datos</Text>
      <Picker
        selectedValue={usuario?.visibilidad ?? ' '}
        onValueChange={(v) => {
          if (!usuario) return;
          const u = new UsuarioClass(usuario);
          u.visibilidad = v;
          setUsuario(u);
        }}
      >
        <Picker.Item label="Cualquiera" value="Cualquiera" />
        <Picker.Item label="Amigos" value="Amigos" />
        <Picker.Item label="Solo yo" value="Solo yo" />
      </Picker>

      <Text>Sugerencias</Text>
      <Picker
        selectedValue={usuario?.sugerencia ?? ' '}
        onValueChange={(v) => {
          if (!usuario) return;
          const u = new UsuarioClass(usuario);
          u.sugerencia = v;
          setUsuario(u);
        }}
      >
        <Picker.Item label="Amigos primero" value="Amigos primero" />
        <Picker.Item label="Recomendados" value="Recomendados" />
        <Picker.Item label="Desactivadas" value="Desactivadas" />
      </Picker>

      <Text>Preferencias</Text>
      <Picker
        selectedValue={usuario?.preferencias ?? ' '}
        onValueChange={(v) => {
          if (!usuario) return;
          const u = new UsuarioClass(usuario);
          u.preferencias = v;
          setUsuario(u);
        }}
      >
        <Picker.Item label="Personalizado" value="Personalizado" />
        <Picker.Item label="Predeterminado" value="Predeterminado" />
      </Picker>

      <Text>Notificaciones</Text>
      <Picker
        selectedValue={usuario?.notificaciones ?? ' '}
        onValueChange={(v) => {
          if (!usuario) return;
          const u = new UsuarioClass(usuario);
          u.notificaciones = v;
          setUsuario(u);
        }}
      >
        <Picker.Item label="Activadas" value="Activadas" />
        <Picker.Item label="Desactivadas" value="Desactivadas" />
      </Picker>
    </View>
  )}

  {/* Confirmaciones */}
  {mostrarConfirmacion && (
    <View style={styles.confirmacionContainer}>
      <Text style={styles.confirmacionTexto}>¿Está seguro de que desea cerrar sesión?</Text>
      <View style={styles.botonesConfirmacion}>
        <Pressable style={styles.botonSi} onPress={cerrarSesion}>
          <Text style={styles.textoBoton}>Sí</Text>
        </Pressable>
        <Pressable style={styles.botonNo} onPress={() => setMostrarConfirmacion(false)}>
          <Text style={styles.textoBoton}>No</Text>
        </Pressable>
      </View>
    </View>
  )}

  {mostrarConfirmacionEliminar && (
    <View style={styles.confirmacionContainer}>
      <Text style={styles.confirmacionTexto}>¿Está seguro de que desea eliminar la cuenta?</Text>
      <View style={styles.botonesConfirmacion}>
        <Pressable style={styles.botonSiEliminar} onPress={eliminarCuenta}>
          <Text style={styles.textoBoton}>Eliminar</Text>
        </Pressable>
        <Pressable style={styles.botonNo} onPress={() => setMostrarConfirmacionEliminar(false)}>
          <Text style={styles.textoBoton}>Cancelar</Text>
        </Pressable>
      </View>
    </View>
  )}

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
  },

  cabeceraPerfil: {
    flex: 3,
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginHorizontal: 16,
  },

  infoUsuario: {
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'transparent',
  },

  nombre: {
    fontWeight: 'bold',
    color: '#093659',
  },
  mail: {
    fontWeight: 'bold',
    color: '#093659',
  },
  ciudad: {
    fontWeight: 'bold',
    color: '#093659',
  },

  input: {
    borderWidth: 1,
    borderColor: '#093659',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
    width: '80%',
  },

  perfilMedio: {
    flex: 2,
    justifyContent: 'center',
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

  confirmacionContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginVertical: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  confirmacionTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'red',
    textAlign: 'center',
  },

  botonesConfirmacion: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },

  botonSi: {
    backgroundColor: '#1E1E1E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 10,
  },

  botonNo: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 10,
  },

  botonSiEliminar: {
    backgroundColor: 'darkred',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 10,
  },

  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // ✅ Nuevo contenedor para la sección de preferencias (en edición)
  preferenciasContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },

  pickerLabel: {
    marginTop: 12,
    fontWeight: 'bold',
    color: '#093659',
  },

  picker: {
    borderWidth: 1,
    borderColor: '#093659',
    borderRadius: 5,
    marginVertical: 5,
  },
  botonesEdicion: {
  position: 'absolute',
  top: 16,
  right: 16,
  flexDirection: 'row',
  gap: 12,
  backgroundColor: 'transparent',
},
});


