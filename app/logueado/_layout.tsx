// app/logueado/tabs/_layout.tsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import TabsLayout from './tabs/_layout';
import CustomDrawerContent from './tabs/drawer/CustomDrawerContent';

const Tabs = createBottomTabNavigator<TabsParamList>();

export default function TabsLayout() {
  return (
<Drawer.Navigator
  drawerContent={props => <CustomDrawerContent {...props} />}
  screenOptions={{
    headerShown: false,
    drawerPosition: 'right',      // desde la derecha
    drawerType: 'front',          // ← aparece encima, no empuja
    overlayColor: 'rgba(0,0,0,0.5)',
    drawerStyle: {
      width: '75%',
      backgroundColor: 'transparent',
    },
  }}
>
  <Drawer.Screen name="Main" component={TabsLayout} />
</Drawer.Navigator>

  );
}
