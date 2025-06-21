import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawerContent from './drawer/CustomDrawerContent'; // asegúrate de que esta ruta esté bien
import { View } from 'react-native';

const Drawer = createDrawerNavigator();

export default function MenuDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front', // hace que se muestre encima
        overlayColor: 'transparent',
        drawerStyle: {
          width: '80%',
          backgroundColor: '#e6f0fa',
        },
      }}
    >
      <Drawer.Screen name="DrawerHome" component={() => <View />} />
    </Drawer.Navigator>
  );
}
