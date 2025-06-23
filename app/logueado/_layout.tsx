// app/logueado/tabs/_layout.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

import HomeScreen       from './tabs/home';
import PerfilScreen     from './tabs/perfil';
import ChatScreen       from './tabs/chat';
import MenuScreen       from './tabs/menu';
import PaginasLayout    from './paginasStack';    // tu stack interno de Paginas
import NotificacionesScreen from './tabs/notificaciones'; // ← importa aquí

import type { TabsParamList } from '@/app/types/navigation';

const Tabs = createBottomTabNavigator<TabsParamList>();

export default function TabsLayout() {
  return (
    <Tabs.Navigator screenOptions={{ headerShown: false }}>
      <Tabs.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarIcon: ({ color, size }) => <Feather name="home" color={color} size={size}/> }}
      />

      {/* …tus otras pestañas… */}

      <Tabs.Screen
        name="notificaciones"             // debe coincidir con el tipo y con el navigate()
        component={NotificacionesScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="bell" color={color} size={size}/>,
          title: 'Notificaciones',
        }}
      />
    </Tabs.Navigator>
  );
}
