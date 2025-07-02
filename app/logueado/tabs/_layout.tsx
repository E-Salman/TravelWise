// app/logueado/tabs/_layout.tsx
import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';

import home from './home';
import perfil from './perfil';
import chat from './chat';
import paginasStack from '../paginasStack';

const Tab = createBottomTabNavigator();

export default function TabsLayout() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#1a3d63',
        tabBarInactiveTintColor: '#131726',
        tabBarStyle: { height: 60, backgroundColor: '#81A3BE' },
        tabBarIcon: ({ focused, color }) => {
          let iconName: any = 'alert';
          if (route.name === 'Home')   iconName = focused ? 'home' : 'home-outline';
          if (route.name === 'Perfil') iconName = focused ? 'person' : 'person-outline';
          if (route.name === 'Chat')   iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          if (route.name === 'Menu')   iconName = focused ? 'menu' : 'menu-outline';
          return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name={iconName} size={30} color={color} />
            </View>
          );
        },
      })}
    >
      {/* Pantallas normales */}
      <Tab.Screen name="Home" component={home} />
      <Tab.Screen name="Perfil" component={perfil} />
      <Tab.Screen name="Chat" component={chat} />

      {/**
        Al tocar “Menú” no navegamos a ninguna ruta nueva,
        sino que disparamos toggleDrawer() en el Drawer padre.
      */}
      <Tab.Screen
        name="Menu"
        component={() => null}
        options={{
          title: 'Menú',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'menu' : 'menu-outline'} size={30} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault(); // prevenimos la navegación normal
            navigation.dispatch(DrawerActions.toggleDrawer());
          },
        })}
      />

      {/**
        Este Stack interno lo dejamos para tus pantallas “Paginas”,
        pero lo ocultamos de la barra de tabs:
      */}
      <Tab.Screen
        name="Paginas"
        component={paginasStack}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
        }}
      />
    </Tab.Navigator>
  );
}
