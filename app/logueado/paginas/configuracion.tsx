import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, ScrollView } from 'react-native';
import { Feather, MaterialIcons, FontAwesome5, Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ConfiguracionScreen() {
  const navigation = useNavigation();

  // Puedes reemplazar estos datos por los del usuario logueado
  const nombre = 'Nombre';
  const telefono = 'telefono';
  const mail = 'mail';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerBox}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Configuración</Text>
        </View>
        <View style={styles.profileRow}>
          <Image
            source={{ uri: 'https://avatars.dicebear.com/api/adventurer/default.svg' }}
            style={styles.avatar}
            resizeMode="cover"
          />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.nombre}>{nombre}</Text>
            <Text style={styles.info}>{telefono}</Text>
            <Text style={styles.info}>{mail}</Text>
          </View>
        </View>
      </View>
      <View style={styles.optionsBox}>
        <Option icon={<Entypo name="location-pin" size={22} color="#093659" />} label="Accesos directos" sub="Administrar ubicaciones guardadas" />
        <Option icon={<Feather name="lock" size={22} color="#093659" />} label="Privacidad" sub="Administra la información que compartes con nosotros" />
        <Option icon={<MaterialIcons name="accessibility" size={22} color="#093659" />} label="Accesibilidad" sub="Administra tu configuración de accesibilidad" />
        <Option icon={<FontAwesome5 name="comment-dots" size={20} color="#093659" />} label="Comunicación" sub="Elige tus medios de contacto preferidos y administra tu configuración de notificaciones" />
      </View>
    </ScrollView>
  );
}

function Option({ icon, label, sub }: { icon: React.ReactNode; label: string; sub?: string }) {
  return (
    <Pressable style={styles.optionRow}>
      {icon}
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text style={styles.optionLabel}>{label}</Text>
        {sub && <Text style={styles.optionSub}>{sub}</Text>}
      </View>
      <Feather name="chevron-right" size={22} color="#093659" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  headerBox: {
    backgroundColor: '#e6f0fa',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 18,
    paddingBottom: 12,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#093659',
    marginBottom: 12,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ccc',
  },
  nombre: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#093659',
  },
  info: {
    color: '#555',
    fontSize: 14,
  },
  optionsBox: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    padding: 0,
    marginHorizontal: 0,
    marginTop: 0,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  optionLabel: {
    fontSize: 16,
    color: '#093659',
    fontWeight: '600',
  },
  optionSub: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
