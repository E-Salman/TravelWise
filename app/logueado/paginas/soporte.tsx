import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const OPTIONS = [
  { key: 'alcance',       label: 'Alcance',            icon: 'help-circle-outline' },
  { key: 'contacto',      label: 'Contacto',           icon: 'call-outline' },
  { key: 'acceso',        label: 'Gestión de Acceso',  icon: 'lock-open-outline' },
  { key: 'seguridad',     label: 'Seguridad',          icon: 'shield-checkmark-outline' },
  { key: 'servicios',     label: 'Servicios',          icon: 'construct-outline' },
  { key: 'tecnico',       label: 'Soporte Técnico',    icon: 'cog-outline' },
  { key: 'datos',         label: 'Uso de Datos',       icon: 'speedometer-outline' },
];

export default function SoporteScreen() {
  const [search, setSearch] = useState('');
  const navigation = useNavigation();

  const filtered = OPTIONS.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header con flecha y título */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#093659" />
        </TouchableOpacity>
        <Text style={styles.title}>Soporte</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Buscar..."
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filtered}
        keyExtractor={item => item.key}
        renderItem={({ item }) => (
          <View style={styles.option}>
            <Ionicons name={item.icon as any} size={22} color="#093659" style={{ marginRight: 12 }} />
            <Text style={styles.optionLabel}>{item.label}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#093659', marginLeft: 16 },
  input: { backgroundColor: '#f0f0f0', borderRadius: 8, padding: 10, marginBottom: 16 },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
  optionLabel: { fontSize: 16, color: '#093659' },
});