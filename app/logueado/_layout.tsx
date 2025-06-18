import React from 'react';
import { useColorScheme } from '@/components/useColorScheme';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // or 'react-native-vector-icons/Ionicons'
import home from './tabs/home';
import perfil from './tabs/perfil';
import chat from './tabs/chat';
import menu from './tabs/menu';
import { View } from 'react-native';
import paginasStack from './paginasStack';
import { TabsParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<TabsParamList>();

export default function TabsLayout() {
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#1a3d63',   // Active icon color
        tabBarInactiveTintColor: '#131726', // Inactive icon color
        tabBarShowLabel: false,
        headerStyle: {
          elevation: 0, // ✅ Android: remove shadow
          shadowOpacity: 0, // ✅ iOS: remove shadow
          borderBottomWidth: 0, // ✅ fallback for some platforms
        },
        tabBarStyle: {
          height: 60,
          backgroundColor: '#81A3BE',
          paddingBottom: 0,
          display: 'flex',
          justifyContent: 'center',
        },
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarIconStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },

        tabBarIcon: ({ focused, color, size }) => {

          let iconName: keyof typeof Ionicons.glyphMap = 'alert';
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'Menu') {
            iconName = focused ? 'menu' : 'menu-outline';
          }
          return (
            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
              <Ionicons name={iconName} size={30} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={home} />
      <Tab.Screen name="Perfil" component={perfil} />
      <Tab.Screen name="Chat" component={chat} />
      <Tab.Screen name="Menu" component={menu} />

      <Tab.Screen
        name="Paginas"
        component={paginasStack}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: {
            display: 'none', // Completely remove from layout
          },
        }}
      />

    </Tab.Navigator>
  );
}