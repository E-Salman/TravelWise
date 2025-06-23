// app/logueado/tabs/_layout.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import home from './home';
import perfil from './perfil';
import chat from './chat';
import paginasStack from '../paginasStack';
import OpenDrawerTab from './OpenDrawerTab'; // dispara el drawer
import { DrawerActions } from '@react-navigation/native';


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
            <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
              <Ionicons name={iconName} size={30} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home"   component={home} />
      <Tab.Screen name="Perfil" component={perfil} />
      <Tab.Screen name="Chat"   component={chat} />

      {/* Al tocar “Menu” monta el OpenDrawerTab que abre el drawer */}
<Tab.Screen
  name="Menu"
  component={() => null}             // no necesitamos pantalla, sólo listener
  options={{
    title: 'Menú',
    tabBarIcon: ({ color, focused }) => (
      <Ionicons
        name={focused ? 'menu' : 'menu-outline'}
        size={30}
        color={color}
      />
    ),
  }}
  listeners={({ navigation }) => ({
    tabPress: (e) => {
      e.preventDefault();               // no navegar a “/Menu”
      navigation.dispatch(
        DrawerActions.toggleDrawer()   // abre o cierra el drawer
      );
    },
  })}
/>

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