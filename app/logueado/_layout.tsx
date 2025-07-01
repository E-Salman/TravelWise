// app/logueado/_layout.tsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import TabsLayout from './tabs/_layout';
import CustomDrawerContent from './tabs/drawer/CustomDrawerContent';

// 1) Importá acá tus pantallas de Soporte, Términos y Privacidad
import SoporteScreen from './paginas/soporte';
import TerminosScreen from './paginas/terminos';
import PrivacidadScreen from './paginas/privacidad';

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

      {/* 4) Registrá Políticas de privacidad */}
      <Drawer.Screen
        name="Privacidad"
        component={PrivacidadScreen}
      />
    </Drawer.Navigator>
  );
}