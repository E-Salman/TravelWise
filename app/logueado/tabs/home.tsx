// app/logueado/tabs/home.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Button,
  StyleSheet,
  TextInput,
  Image,
} from 'react-native';
import { useResponsiveDimensions } from '../../hooks/useResponsiveDimensions';
import { useResponsiveImageDimensions } from '../../hooks/useResponsiveImageDimensions';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { HomeScreenProps } from '@/app/types/navigation';

export default function TabOneScreen() {
  const navigation = useNavigation<HomeScreenProps['navigation']>();
  const [search, setSearch] = useState('');

  // Dimensiones responsivas para el mapa
  const { height: mapH } = useResponsiveDimensions({
    widthRatio: 1,
    heightRatio: 0.4,
    maintainAspectRatio: true,
  });

  // URL del embed de Google Maps (tu API Key ya está incluida)
  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=AIzaSyA_sve6Kikr_ABPr_RrnmR8hU4i-ixJBdA&q=-34.6037,-58.3816&zoom=14&maptype=roadmap`;

  return (
    <View style={styles.root}>
      {/* Campana de notificaciones */}
      <Pressable
        style={styles.bell}
        onPress={() => navigation.navigate('Paginas', { screen: 'notificaciones' })}
      >
        <Feather name="bell" size={24} color="#093659" />
      </Pressable>

      {/* Barra de búsqueda + "Más tarde" */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color="#555" style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar viaje..."
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <Pressable style={styles.laterBtn}>
          <Text style={styles.laterText}>Más tarde</Text>
        </Pressable>
      </View>

      {/* Botones de acción */}
      <View style={styles.actionsRow}>
        <Pressable
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Paginas', { screen: 'crearviaje' })}
        >
          <Text style={styles.actionText}>+ Crear viaje</Text>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Paginas', { screen: 'repetirviaje' })}
        >
          <Text style={styles.actionText}>+ Repetir viaje</Text>
        </Pressable>
      </View>

      {/* Sección "En proceso" */}
      <Text style={styles.sectionTitle}>En proceso</Text>
      <View style={[styles.mapContainer, { height: mapH, width: '100%' }]}>
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          src={mapSrc}
          allowFullScreen
        />
      </View>

      {/* Sección "Viajes próximos" */}
      <Text style={styles.sectionTitle}>Viajes próximos</Text>
      <View style={styles.card}>
        <Feather name="clock" size={20} color="#093659" style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Nuñez</Text>
          <Text style={styles.cardSubtitle}>La Plata</Text>
        </View>
        <Image
          source={{ uri: 'https://i.pravatar.cc/50?u=1' }}
          style={styles.avatarSmall}
        />
      </View>
      <View style={styles.placeholderCard} />

      {/* Sección "Sugerencias" */}
      <Text style={styles.sectionTitle}>Sugerencias</Text>
      <View style={styles.placeholderCard} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  bell: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 56,
    marginBottom: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
  },
  searchInput: {
    flex: 1,
    color: '#000',
  },
  laterBtn: {
    marginLeft: 8,
    backgroundColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  laterText: {
    color: '#333',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f0fa',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  actionText: {
    color: '#093659',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#093659',
    marginTop: 16,
  },
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  cardTitle: {
    fontSize: 16,
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 12,
  },
  placeholderCard: {
    height: 60,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginTop: 8,
  },
});
