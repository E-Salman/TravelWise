import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  ToastAndroid,
} from 'react-native';
import { View, Text } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useResponsiveDimensions } from './hooks/useResponsiveDimensions';
import { useResponsiveImageDimensions } from './hooks/useResponsiveImageDimensions';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../app/firebase';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();

  const { height: buttonHeight } = useResponsiveDimensions({
    heightRatio: 0.07,
  });

  const { width: logoWidth, height: logoHeight } = useResponsiveImageDimensions({
    source: require('../assets/images/TWlogo.png'),
    heightRatio: 0.4,
    widthRatio: 0.5,
    maintainAspectRatio: true,
  });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleEnviarCodigo = async () => {
    if (!email) {
      const msg = 'Por favor ingresá tu email.';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
      return;
    }

    if (cooldown > 0) {
      const msg = `Esperá ${cooldown} segundos antes de volver a enviar.`;
      Platform.OS === 'android'
        ? ToastAndroid.show(msg, ToastAndroid.SHORT)
        : Alert.alert('Espera', msg);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);

      const msgToast = 'Correo enviado correctamente ✅';
      Platform.OS === 'android'
        ? ToastAndroid.show(msgToast, ToastAndroid.LONG)
        : Platform.OS === 'web'
          ? window.alert(msgToast)
          : Alert.alert('Éxito', 'Correo enviado correctamente');

      Alert.alert('Revisá tu correo 📩', 'Te enviamos un enlace para restablecer tu contraseña.');

      setCooldown(30); // 30 segundos de espera
    } catch (error: any) {
      console.error(error);
      const msg = error.message || 'No se pudo enviar el correo.';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.replace('/inicioSesion')} style={styles.backButton}>
        <Image
          source={require('@/assets/images/flechapng.png')}
          style={styles.backIcon}
        />
      </TouchableOpacity>

      <Image
        source={require('../assets/images/TWlogo.png')}
        style={{
          width: logoWidth,
          height: logoHeight,
          resizeMode: 'contain',
          marginBottom: 10,
          alignSelf: 'center',
        }}
      />

      <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
      <Text style={styles.subtitle}>
        Ingresá tu email y te enviaremos un código para restablecerla.
      </Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="ejemplo@email.com"
        placeholderTextColor="#ABA5A4"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={[styles.boton, { height: buttonHeight, opacity: cooldown > 0 ? 0.6 : 1 }]}
        onPress={handleEnviarCodigo}
        disabled={cooldown > 0}
      >
        <Text style={styles.botonTexto}>
          {cooldown > 0 ? `${cooldown}s` : 'Enviar código'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
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
    alignSelf: 'center',
    resizeMode: 'contain',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#093659',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#4a4a4a',
    textAlign: 'center',
    marginVertical: 8,
    paddingHorizontal: 12,
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
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
