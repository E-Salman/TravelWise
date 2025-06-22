// app/logueado/_layout.tsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import TabsLayout from './tabs/_layout';
import CustomDrawerContent from './tabs/drawer/CustomDrawerContent';
import SoporteScreen from './paginas/soporte';  // asegúrate de tener esta importación

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
      {/* Tu TabNavigator */}
      <Drawer.Screen name="RootDrawer" component={TabsLayout} />

      {/* Pantalla de Soporte */}
      <Drawer.Screen name="Soporte" component={SoporteScreen} />

      {/*
        Si luego quieres agregar más pantallas:
        <Drawer.Screen name="Pagos" component={PagosScreen} />
        <Drawer.Screen name="Terminos" component={TerminosScreen} />
      */}
    </Drawer.Navigator>
  );
}
