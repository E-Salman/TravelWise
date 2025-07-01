import { createNativeStackNavigator } from '@react-navigation/native-stack';
import soporte from './paginas/soporte';
import crearViaje from './paginas/crearViaje';
import pagos from './paginas/pagos';
import BuscarUsuariosScreen from './tabs/buscarUsuario';
import NotificacionesScreen from './tabs/notificaciones';
import TabOneScreen from './tabs/home';
import PerfilScreen from './tabs/perfil';

const Stack = createNativeStackNavigator();

export default function paginasStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="crearViaje" component={crearViaje} />
      <Stack.Screen name="pagos" component={pagos}/>
      <Stack.Screen name="soporte" component={soporte} />
      <Stack.Screen name="buscarUsuario" component={BuscarUsuariosScreen} />
      <Stack.Screen name="notificaciones" component={NotificacionesScreen} />
      <Stack.Screen name="perfil" component={PerfilScreen} />
      <Stack.Screen name="home" component={TabOneScreen} />
    </Stack.Navigator>
  );
}