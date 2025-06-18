// types/navigation.d.ts
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  TabsLayout: NavigatorScreenParams<TabsParamList>;
  logueado: NavigatorScreenParams<LogueadoStackParamList>; 
  Paginas: {
    screen: keyof PaginasStackParamList;
  };
};

export type PaginasStackParamList = {
  crearViaje: undefined;
  pagos: undefined;
  soporte: undefined;
};

export type TabsParamList = {
  Home: undefined;
  Perfil: undefined;
  Chat: undefined;
  Menu: undefined;
  Paginas: NavigatorScreenParams<PaginasStackParamList>;
};

export type HomeScreenProps = BottomTabScreenProps<TabsParamList, 'Home'>;