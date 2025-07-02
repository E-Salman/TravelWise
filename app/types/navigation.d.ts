// types/navigation.d.ts
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  TabsLayout: NavigatorScreenParams<TabsParamList>;
  logueado: NavigatorScreenParams<LogueadoStackParamList>; 
  Paginas: NavigatorScreenParams<PaginasStackParamList>;
};

export type PaginasStackParamList = {
  crearViaje: undefined;
  pagos: undefined;
  soporte: undefined;
  buscarUsuario: undefined;
  notificaciones: undefined;
  terminos: undefined;
  perfilUser: { uid: string };
  SolicitudesAmistad: undefined;
  ListaAmigos: undefined;
  configuracion: undefined; 
};

export type TabsParamList = {
  Home: undefined;
  Perfil: undefined;
  Chat: undefined;
  Menu: undefined;
  Paginas: NavigatorScreenParams<PaginasStackParamList>;
};

export type HomeScreenProps = BottomTabScreenProps<TabsParamList, 'Home'>;

export type PaginasStackNavigationProp = NativeStackNavigationProp<PaginasStackParamList>;