import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Image,
  TextInput,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useResponsiveDimensions } from './hooks/useResponsiveDimensions';
import { useResponsiveImageDimensions } from './hooks/useResponsiveImageDimensions';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types/navigation';
import { loginUser } from '../app/auth/loginUser';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabTwoScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadRememberedUser = async () => {
      const savedEmail = await AsyncStorage.getItem('userEmail');
      const savedContra = await AsyncStorage.getItem('userContra');
      if (savedEmail && savedContra) {
        setEmail(savedEmail);
        setContrasenia(savedContra);
        setChecked(true);
      }
    };

    loadRememberedUser();
  }, []);

  const { width: logoWidth, height: logoHeight } = useResponsiveImageDimensions({
    source: require('../assets/images/TWlogo.png'),
    heightRatio: 0.4,
    widthRatio: 0.2,
    maintainAspectRatio: true,
  });

  const { height: buttonHeight } = useResponsiveDimensions({
    heightRatio: 0.07,
  });

  const handlePress = async () => {
    try {
      const user = await loginUser(email, contrasenia);

      if (checked) {
        await AsyncStorage.setItem('userEmail', email);
        await AsyncStorage.setItem('userContra', contrasenia);
      } else {
        await AsyncStorage.removeItem('userEmail');
        await AsyncStorage.removeItem('userContra');
      }

      await AsyncStorage.setItem('userUID', user.uid);
      navigation.navigate('logueado', { screen: 'home' });
    } catch (error: any) {
      console.error(error);
      const message = error.message || 'No se pudo iniciar sesión.';
      Platform.OS === 'web' ? window.alert(`Error: ${message}`) : Alert.alert('Error', message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../assets/images/TWlogo.png')}
          style={{
            width: logoWidth,
            height: logoHeight,
            resizeMode: 'contain',
            marginBottom: 10,
          }}
        />
        <Text style={styles.title}>Inicio de sesión</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.email}>Email</Text>
        <TextInput
          style={styles.emailInput}
          value={email}
          onChangeText={setEmail}
          placeholder="Insertar su Email"
          placeholderTextColor="#ABA5A4"
          keyboardType="email-address"
        />

        <Text style={styles.contrasenia}>Contraseña</Text>
        <TextInput
          secureTextEntry
          style={styles.contraseniaInput}
          value={contrasenia}
          onChangeText={setContrasenia}
          placeholder="*******"
          placeholderTextColor="#ABA5A4"
        />

        <Pressable style={[styles.botonIngresa, { height: buttonHeight }]} onPress={handlePress}>
          <Text style={styles.ingresar}>Ingresar</Text>
        </Pressable>

        <Pressable style={styles.enFila} onPress={() => setChecked((c) => !c)}>
          <View style={[styles.cajita, checked && styles.cajitaClickeada]}>
            {checked && <MaterialIcons name="check" size={18} color="#fff" />}
          </View>
          <Text style={styles.recordarme}>Recordarme</Text>
        </Pressable>

        <Pressable onPress={() => (navigation as any).navigate('olvideContra')}>
          <Text style={styles.olvidasteContra}>¿Olvidaste tu contraseña?</Text>
        </Pressable>
      </View>

      <View style={styles.registro}>
        <Text style={styles.regiTexto}>¿No tenés cuenta?</Text>
        <Pressable onPress={() => router.push('/registrarse')}>
          <Text style={styles.registrarse}>Registrate</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  form: {
    width: 250,
    alignItems: 'stretch',
    marginBottom: 30,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#093659',
    marginBottom: '2%',
  },
  email: {
    fontSize: 15,
    color: '#1E1E1E',
    marginBottom: '1%',
  },
  emailInput: {
    width: '100%',
    height: 30,
    borderColor: '#1E1E1E',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: '8%',
    marginBottom: '5%',
  },
  contrasenia: {
    fontSize: 15,
    color: '#1E1E1E',
    marginBottom: '1%',
  },
  contraseniaInput: {
    width: '100%',
    height: 30,
    borderColor: '#1E1E1E',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: '8%',
    marginBottom: '10%',
  },
  botonIngresa: {
    width: '100%',
    backgroundColor: '#093659',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10%',
  },
  ingresar: {
    color: '#fff',
    fontSize: 16,
  },
  enFila: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cajita: {
    width: 12,
    height: 12,
    borderWidth: 2,
    borderColor: '#093659',
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  cajitaClickeada: {
    backgroundColor: '#093659',
    borderColor: '#093659',
  },
  recordarme: {
    marginLeft: '1%',
    fontSize: 14,
    color: '#1E1E1E',
  },
  olvidasteContra: {
    color: '#1E1E1E',
    fontSize: 14,
    textDecorationLine: 'underline',
    marginTop: 12,
  },
  registro: {
    marginTop: 30,
    alignItems: 'center',
  },
  regiTexto: {
    color: '#1E1E1E',
    fontSize: 16,
  },
  registrarse: {
    color: '#093659',
    fontWeight: 'bold',
    fontSize: 20,
  },
});
