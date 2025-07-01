import { StyleSheet, ScrollView, Pressable, Image, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import React, { useState } from 'react';
import { useNavigation, CompositeNavigationProp  } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TabsParamList, PaginasStackParamList } from '@/app/types/navigation';

type PaginasNavProp = NativeStackNavigationProp<PaginasStackParamList>;
type TabNavProp     = BottomTabNavigationProp<TabsParamList>;

type NavigationProp = CompositeNavigationProp<PaginasNavProp, TabNavProp>;

type Notificacion = {
  id: number;
  texto: string;
  icono: any; // o ImageSourcePropType si quieres ser más estricto
};

export default function NotificacionesScreen() {
const navigation = useNavigation<NavigationProp>();
  const volverAHome = () => {
    // Limpia el stack de Páginas y navega a Home en el navigator padre (Tabs)
    const parent = navigation.getParent();
    if (parent) {
      parent.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } else {
      navigation.navigate('Home');
    }
  };
  const [notificaciones, setNotificaciones] = useState([
    {
      id: 1,
      texto: 'Tu contraseña fue actualizada con éxito',
      icono: require('../../../assets/images/576f1565-8f91-4a82-b5bd-5e2c0512c997.png'),
    },
    {
      id: 2,
      texto: 'Tu viaje comienza en n días!', //Cuando tengamos crear viaje con la bdd hay que arreglarlo
      icono: require('../../../assets/images/dff890f2-3590-4d72-8662-0e4b5336d548.png'),
    },
    {
      id: 3,
      texto: 'Tienes 1 solicitud de mensaje',
      icono: require('../../../assets/images/ee4e16c7-670f-4648-9cea-7999aa8b8623.png'),
    },
    {
      id: 4,
      texto: 'Tienes 1 nueva solicitud de amistad',
      icono: require('../../../assets/images/f33a6724-a3e0-4f7b-a797-6bccce5000bd.png'),
    },
  ]);

  const eliminarNotificacion = (id: number) => {
    setNotificaciones((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header con flecha */}
      <View style={styles.header}>
        <TouchableOpacity onPress={volverAHome}>
        <Image source={require('../../../assets/images/flechapng.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Notificaciones</Text>
      </View>

      {notificaciones.map((n) => (
        <View key={n.id} style={styles.notification}>
          <Image source={n.icono} style={styles.icon} />
          <Text style={styles.text}>{n.texto}</Text>
          <Pressable onPress={() => eliminarNotificacion(n.id)}>
            <Image source={require('../../../assets/images/equis.png')} style={styles.closeIcon} />
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#093659',
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  icon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  text: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 14,
    color: '#1E1E1E',
  },
  closeIcon: {
    width: 16,
    height: 16,
    tintColor: 'gray',
  },
});