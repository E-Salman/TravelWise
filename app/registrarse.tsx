import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Image,
  TextInput,
  Pressable,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { registerUser } from '../app/auth/registerUser';

// Simulación de base de datos de emails ya registrados
const emailsRegistrados = ['usuario1@email.com', 'ejemplo@dominio.com'];

export default function RegistroScreen() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [repetirContra, setRepetirContra] = useState('');
  const router = useRouter();

  const handleRegistro = async () => {
    const showAlert = (titulo: string, msj: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}\n${msj}`);
    } else {
      Alert.alert(titulo, msj);
    }
  };
    if (!nombre || !email || !telefono || !contrasenia || !repetirContra) {
      showAlert('Error', 'Por favor, completá todos los campos.');
      return;
    }

    if (contrasenia !== repetirContra) {
      showAlert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    try {
    await registerUser({
      email: email,
      password: contrasenia,
      userData: {
        nombre: nombre,
        telefono: telefono,
      },
    });

    showAlert('Éxito', '¡Registro exitoso!');
    router.replace('/logueado/tabs/home');

  } catch (error: any) {
    console.error(error);
    showAlert('Error', error.message || 'No se pudo registrar.');
  }

    
  };

  return (
    <View style={styles.container}>
      {/* Header con flecha + logo + título */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Image
            source={require('@/assets/images/flechapng.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        <Image
          source={require('@/assets/images/TWlogo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Registro</Text>
      </View>

      {/* Campos */}
      <Text style={styles.label}>Nombre completo</Text>
      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
        placeholder="Tu nombre"
        placeholderTextColor="#ABA5A4"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="tu@email.com"
        placeholderTextColor="#ABA5A4"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Teléfono</Text>
      <TextInput
        style={styles.input}
        value={telefono}
        onChangeText={setTelefono}
        placeholder="Ej: 1123456789"
        placeholderTextColor="#ABA5A4"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={contrasenia}
        onChangeText={setContrasenia}
        placeholder="*******"
        placeholderTextColor="#ABA5A4"
      />

      <Text style={styles.label}>Repetir contraseña</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={repetirContra}
        onChangeText={setRepetirContra}
        placeholder="*******"
        placeholderTextColor="#ABA5A4"
      />
      <Link href="/inicioSesion" asChild>
        <Pressable style={styles.boton} onPress={handleRegistro}>
          <Text style={styles.botonTexto}>Registrarse</Text>
        </Pressable>
      </Link>
    </View>
    //<Alert style={styles.alerta}

  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  backIcon: {
    width: 30,
    height: 30,
    tintColor: '#093659',
    resizeMode: 'contain',
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginRight: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#093659',
  },
  label: {
    fontSize: 14,
    color: '#1E1E1E',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#1E1E1E',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    color: '#000',
  },
  boton: {
    marginTop: 24,
    backgroundColor: '#093659',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  
});
