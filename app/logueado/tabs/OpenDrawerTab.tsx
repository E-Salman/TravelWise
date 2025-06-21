// app/logueado/tabs/OpenDrawerTab.tsx
import { useEffect } from 'react';
import { useNavigation, DrawerActions } from '@react-navigation/native';

export default function OpenDrawerTab() {
  const navigation = useNavigation();
  useEffect(() => {
    navigation.dispatch(DrawerActions.openDrawer());
  }, []);
  return null;
}
