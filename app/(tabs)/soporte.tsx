import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { View, Text } from '@/components/Themed';
import { useRouter } from 'expo-router';

const CATEGORIAS = [
  'Alcance',
  'Contacto',
  'Gestion de Acceso',
  'Seguridad',
  'Servicios',
  'Soporte Tecnico',
  'Uso de Datos',
];

export default function SoporteScreen() {
  const [busqueda, setBusqueda] = useState('');
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require('@/assets/images/flechapng.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Soporte</Text>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchBox}>
        <Image
          source={require('@/assets/images/lupa.png')}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="¡Hola! ¿En qué podemos ayudarte?"
          value={busqueda}
          onChangeText={setBusqueda}
          style={styles.searchInput}
          placeholderTextColor="#777"
        />
      </View>

      {/* Lista de categorías */}
      <ScrollView style={{ marginTop: 10 }}>
        {CATEGORIAS.map((categoria, index) => (
          <TouchableOpacity key={index} style={styles.itemBox}>
            <Image
              source={require('@/assets/images/informacion.png')}
              style={styles.itemIcon}
            />
            <Text style={styles.itemText}>{categoria}</Text>
            <Image
              source={require('@/assets/images/flecha-correcta.png')}
              style={styles.arrowIcon}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: '#093659',
    resizeMode: 'contain',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#093659',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#777',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  itemBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemIcon: {
    width: 24,
    height: 24,
    tintColor: '#093659',
    marginRight: 12,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: '#093659',
  },
  arrowIcon: {
    width: 14,
    height: 14,
    tintColor: '#093659',
  },
});
