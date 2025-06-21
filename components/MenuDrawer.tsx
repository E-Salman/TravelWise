import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { DrawerContentComponentProps, DrawerItem } from '@react-navigation/drawer';

export default function MenuDrawerContent(props: DrawerContentComponentProps) {
  return (
    <ScrollView style={styles.container}>
      {/* Header de perfil */}
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/150?u=amadeo' }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.name}>Amadeo Carrizo</Text>
          <Text style={styles.level}>Nivel 2 - Explorador 🧭</Text>
        </View>
        <View style={styles.pointsBox}>
          <Text style={styles.pointsText}>⭐ 150 +</Text>
        </View>
      </View>

      {/* Tip */}
      <View style={styles.tipBox}>
        <Text style={styles.tipText}>✨ ¿Sabías que podés{'\n'}ganar puntos invitando amigos?</Text>
      </View>

      {/* Opciones */}
      <DrawerItem label="+Info sobre recompensas" onPress={() => props.navigation.navigate('perfil')} />
      <DrawerItem label="Historial de viajes" onPress={() => props.navigation.navigate('perfil')} />
      <DrawerItem label="Pagos" onPress={() => props.navigation.navigate('pagos')} />
      <DrawerItem label="Ayudanos a mejorar" onPress={() => props.navigation.navigate('soporte')} />
      <DrawerItem label="Soporte" onPress={() => props.navigation.navigate('soporte')} />
      <DrawerItem label="Términos y condiciones" onPress={() => props.navigation.navigate('terminos')} />
      <DrawerItem label="Políticas de privacidad" onPress={() => props.navigation.navigate('privacidad')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#e6f0fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#093659',
  },
  level: {
    fontSize: 13,
    color: '#5a7e9d',
  },
  pointsBox: {
    marginLeft: 'auto',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  pointsText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  tipBox: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
});
