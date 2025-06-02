import React, { useState } from 'react';
import { StyleSheet, Image, TextInput, Pressable } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { useResponsiveDimensions } from './hooks/useResponsiveDimensions';
import { useResponsiveImageDimensions } from './hooks/useResponsiveImageDimensions';


export default function TabTwoScreen() {
  const [email, setEmail] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  const { width: viewWidth, height: viewHeight } = useResponsiveDimensions({
    heightRatio: 0.2,
    widthRatio: 1
  });

  const {width: logoWidth, height: logoHeight } = useResponsiveImageDimensions({
    source: require('../assets/images/TWlogo.png'),
    heightRatio: 0.4,
    widthRatio: 0.4,
    maintainAspectRatio: true
  });
  
  
  //falta cambiar los estilos para que todas las alturas y anchos sean en base a un % del contenedor en el que estan, asi los hooks las ajustan automaticamente.
  //tambien mover inicio de sesion fuera de tabs, no deberia tener un layout (el menu de abajito), pero eso es mi opinion

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, width: viewWidth, height: viewHeight }}>
      <View style={styles.header}>{/* Header: logo + título */}
        <Image
          source={require('../assets/images/TWlogo.png')}
          style={{
            width: logoWidth,
            height: logoHeight,
            resizeMode: 'contain',
            marginTop: '5%',
            marginBottom: '1%',
        }}
      />
        <Text style={styles.title}>Inicio de sesion</Text>

      </View>
      {/* Ingreso texto */}
      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, width: viewWidth, height: viewHeight }}>
      <View style={styles.form}>
        {/* Email */}
        <Text style={styles.email}>Email</Text>
        <TextInput
          style={styles.emailInput}
          value={email}
          onChangeText={setEmail}
          placeholder="Insertar su Email"
          placeholderTextColor={'#ABA5A4'}
          keyboardType='email-address'
        />
        {/* Contraseña */}
        <Text style={styles.contrasenia}>Contraseña</Text>
        <TextInput
          secureTextEntry={true}
          style={styles.contraseniaInput}
          value={contrasenia}
          onChangeText={setContrasenia}
          placeholder="*******"
          placeholderTextColor={'#ABA5A4'}
          keyboardType='default'
        />
        {/* Boton Ingresar */}
        <Link href="/paginaInicio" asChild>
          <Pressable style={styles.botonIngresa}>
            <Text style={styles.ingresar}>Ingresar</Text>
          </Pressable>
        </Link>
        {/* Recordar usuario */}
        <Pressable
          style={styles.enFila}
          onPress={() => setChecked(c => !c)}>
          <View style={[styles.cajita, checked && styles.cajitaClickeada]}>
            {checked && (
              <MaterialIcons name="check" size={18} color="#fff" />
            )}
          </View>
          <Text style={styles.recordarme}>Recordarme</Text>
        </Pressable>

        {/* Olvidaste tu contraseña texto clickeable */}
        <Pressable onPress={() => router.push('/olvideContra')}>
          <Text style={styles.olvidasteContra}>Olvidaste tu contraseña?</Text>
        </Pressable>
      </View>

      <Text style={styles.regiTexto}>¿No tenes cuenta?</Text>
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
    paddingTop: '1%',
  },
  header: {
    alignItems: 'center',
    marginBottom: '5%'
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#093659',
    marginBottom: '2%',
  },
  form: {
    marginBottom: '10%',
    alignItems: 'flex-start',
  },
  email: {
    fontSize: 15,
    color: '#1E1E1E',
    marginBottom: '1%',

  },
  emailInput: {
    width: '100%',
    height: '40%',
    borderColor: '#1E1E1E',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: '8%',
    marginBottom: '5%',
  },

  contrasenia: {
    fontSize: 15,
    color: '#1E1E1E',
    marginBottom: '5%',
  },

  contraseniaInput: {
    width: '20%',
    height: '40%',
    borderColor: '#1E1E1E',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: '8%',
    marginBottom: '5%',
  },

  botonIngresa: {
    width: '20%', 
    backgroundColor: '#093659',
    padding: '12%',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingresar: { color: '#fff', fontSize: 16 },

  olvidasteContra: {
    color: '#1E1E1E',
    fontSize: 16,
    textDecorationLine: 'underline',
    marginBottom: '1%'
  },

  enFila: {
    flexDirection: 'row',      // elemento al lado del otro
    alignItems: 'center',      // centra verticalmente
  },
  cajita: {
    width: '5%',
    height: '5%',
    borderWidth: 2,
    borderColor: '#093659',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  cajitaClickeada: {
    backgroundColor: '#093659', // relleno cuando esté seleccionado
    borderColor: '#093659',
  },
  recordarme: {
    marginLeft: '8%',
    fontSize: 14,
    color: '#1E1E1E',
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