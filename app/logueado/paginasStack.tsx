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
import AgregarAutoScreen from './paginas/agregarAuto';
import MisAutosScreen from './paginas/misAutos';
import EditarAutoScreen from './paginas/editarAuto';
import PagosPage from './paginas/pagos';
import NuevoMedioPago from './paginas/nuevoMedioPago';
import MisSolicitudesScreen from './paginas/misSolicitudes';
import EditarViajeScreen from './paginas/editarViaje';
import BuscarViajeScreen from './paginas/buscarViaje';

const Stack = createNativeStackNavigator();

export default function paginasStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="crearViaje" component={crearViaje} />
      <Stack.Screen name="pagos" component={PagosPage}/>
      <Stack.Screen name="soporte" component={SoporteScreen} />
      <Stack.Screen name="buscarUsuario" component={BuscarUsuariosScreen} />
      <Stack.Screen name="notificaciones" component={NotificacionesScreen} />
      <Stack.Screen name="perfilUser" component={PerfilUserScreen} />
      <Stack.Screen name="SolicitudesAmistad" component={SolicitudesAmistadScreen} />
      <Stack.Screen name="ListaAmigos" component={ListaAmigosScreen} />
      <Stack.Screen name="configuracion" component={ConfiguracionScreen} />
      <Stack.Screen name="agregarAuto" component={AgregarAutoScreen} />
      <Stack.Screen name="misAutos" component={MisAutosScreen} />
      <Stack.Screen name="EditarAuto" component={EditarAutoScreen} />
      <Stack.Screen name="nuevoMedioPago" component={NuevoMedioPago} />
      <Stack.Screen name="misSolicitudes" component={MisSolicitudesScreen} />
      <Stack.Screen name="editarViaje" component={EditarViajeScreen} />
      <Stack.Screen name="buscarViaje" component={BuscarViajeScreen} />
    </Stack.Navigator>
  );
}