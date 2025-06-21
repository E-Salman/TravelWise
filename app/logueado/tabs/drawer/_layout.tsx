import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawerContent from './CustomDrawerContent'; // tu drawer personalizado
import DummyScreen from './index'; // la pantalla "base", puede ser cualquiera que ya exista

const Drawer = createDrawerNavigator();

export default function DrawerLayout() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerType: 'front',
        headerShown: false,
        overlayColor: 'transparent',
        drawerStyle: {
          width: '75%',
          backgroundColor: 'transparent',
        },
      }}
    >
      {/* Una pantalla dummy, porque Drawer necesita al menos una */}
      <Drawer.Screen name="dummy" component={DummyScreen} />
    </Drawer.Navigator>
  );
}
