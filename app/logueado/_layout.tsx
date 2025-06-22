// app/logueado/_layout.tsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import TabsLayout from './tabs/_layout';
import CustomDrawerContent from './tabs/drawer/CustomDrawerContent';

// 1) Importá acá tus pantallas de Soporte y Términos
import SoporteScreen from './paginas/soporte';
import TerminosScreen from './paginas/terminos';

const Drawer = createDrawerNavigator();

export default function LoggedInLayout() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: 'right',
        drawerType: 'front',
        overlayColor: 'rgba(0,0,0,0.5)',
        drawerStyle: { width: '75%', backgroundColor: 'transparent' },
      }}
    >
      {/* tus tabs */}
      <Drawer.Screen
        name="RootDrawer"
        component={TabsLayout}
      />

      {/* 2) Registrá Soporte */}
      <Drawer.Screen
        name="Soporte"
        component={SoporteScreen}
      />

      {/* 3) Registrá también Términos */}
      <Drawer.Screen
        name="Terminos"
        component={TerminosScreen}
      />
    </Drawer.Navigator>
  );
}
