import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SoporteScreen from './paginas/soporte';
import crearViaje from './paginas/crearViaje';
import pagos from './paginas/pagos';
import BuscarUsuariosScreen from './paginas/buscarUsuario';
import NotificacionesScreen from './paginas/notificaciones';
import TabOneScreen from './tabs/home';
import PerfilScreen from './tabs/perfil';
import PerfilUserScreen from './paginas/perfilUser';
import SolicitudesAmistadScreen from './paginas/SolicitudesAmistad';
import ListaAmigosScreen from './paginas/ListaAmigos';
import ConfiguracionScreen from './paginas/configuracion';


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
      <Stack.Screen name="soporte" component={SoporteScreen} />
      <Stack.Screen name="buscarUsuario" component={BuscarUsuariosScreen} />
      <Stack.Screen name="notificaciones" component={NotificacionesScreen} />
      <Stack.Screen name="perfilUser" component={PerfilUserScreen} />
      <Stack.Screen name="SolicitudesAmistad" component={SolicitudesAmistadScreen} />
      <Stack.Screen name="ListaAmigos" component={ListaAmigosScreen} />
      <Stack.Screen name="configuracion" component={ConfiguracionScreen} />
    </Stack.Navigator>
  );
}