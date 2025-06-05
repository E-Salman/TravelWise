import React, { useState } from 'react';
import { StyleSheet, Image, TextInput, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';

// Simulación de base de datos de emails ya registrados
const emailsRegistrados = ['usuario1@email.com', 'ejemplo@dominio.com'];

export default function RegistroScreen() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [repetirContra, setRepetirContra] = useState('');
  const router = useRouter();

  const handleRegistro = () => {
    if (!nombre || !email || !telefono || !contrasenia || !repetirContra) {
      Alert.alert('Error', 'Por favor, completá todos los campos.');
      return;
    }

    if (contrasenia !== repetirContra) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    if (emailsRegistrados.includes(email.toLowerCase())) {
      Alert.alert('Error', 'Este email ya está registrado.');
      return;
    }

    // Registro exitoso (en un caso real, se llamaría a una API)
    Alert.alert('Éxito', '¡Registro exitoso!');
    router.replace('/inicioSesion');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/TWlogo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Registro</Text>
      </View>

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

      <Pressable style={styles.boton} onPress={handleRegistro}>
        <Text style={styles.botonTexto}>Registrarse</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginRight: 12,
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
  volverLogin: {
    marginTop: 16,
    fontSize: 16,
    color: '#093659',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
