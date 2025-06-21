import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import MenuDrawerContent from './MenuDrawer';

import Soporte from '../app/logueado/paginas/soporte'; // Cambiá estos si querés otras pantallas
import Pagos from '../app/logueado/paginas/pagos';

const Drawer = createDrawerNavigator();

export default function MenuScreen() {
  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false }}
      drawerContent={(props) => <MenuDrawerContent {...props} />}
    >
      <Drawer.Screen name="Soporte" component={Soporte} />
      <Drawer.Screen name="Pagos" component={Pagos} />
    </Drawer.Navigator>
  );
}
