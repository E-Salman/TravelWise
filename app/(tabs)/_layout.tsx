import React from 'react';
import {FontAwesome5, MaterialIcons, Entypo}from '@expo/vector-icons';
import { Link, Tabs } from 'expo-router';
import { Pressable, Image} from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

export default function TabsLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  
  return (
    <Tabs
      initialRouteName="paginaInicio"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
      }}
    >
    <Tabs.Screen
        name="index"               // Primera pestaña
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Image
              source = {require('../../assets/images/TWlogo.png')}
              style={{
                width: size,
                height: size,
                tintColor: color,
                resizeMode: 'contain',
              }}
              />
          ),
        }}
      />
    <Tabs.Screen
      name="inicioSesion"
      options={{
        title: 'Iniciar Sesión',
        tabBarIcon: ({ color, size }) => <FontAwesome5 name="user-lock" size={size} color={color} />,
      }}
    />

    <Tabs.Screen
      name="paginaInicio"
      options={{ title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />

    <Tabs.Screen
      name="olvideContra"
      options={{ title: 'Olvide contraseña',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="password" size={size} color={color} />
          ),
        }}
      />

    <Tabs.Screen
      name="registrarse"
      options={{ title: 'Registrarse',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="app-registration" size={size} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}
