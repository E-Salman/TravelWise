import { createStackNavigator } from '@react-navigation/stack';
import soporte from './paginas/soporte';
import crearViaje from './paginas/crearViaje';
import pagos from './paginas/pagos';

const Stack = createStackNavigator();

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
    </Stack.Navigator>
  );
}