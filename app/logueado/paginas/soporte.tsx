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

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#555" style={styles.searchIcon} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="¡Hola! ¿En qué podemos ayudarte?"
          placeholderTextColor="#888"
          style={styles.searchInput}
        />
      </View>

      {/* Línea separadora */}
      <View style={styles.divider} />

      {/* Lista de opciones */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => {
              // Aquí podés navegar a otra pantalla según item.key
              // p.ej. navigation.navigate('DetalleSoporte', { tipo: item.key });
            }}
          >
            <Ionicons name={item.icon as any} size={20} color="#093659" style={styles.rowIcon} />
            <Text style={styles.rowLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color="#093659" />
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#fff' },
  header:         { flexDirection: 'row', alignItems: 'center', padding: 16 },
  title:          { fontSize: 20, fontWeight: 'bold', color: '#093659', marginLeft: 12 },
  searchContainer:{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 8, marginHorizontal: 16, paddingHorizontal: 10, marginBottom: 8 },
  searchIcon:     { marginRight: 6 },
  searchInput:    { flex: 1, paddingVertical: 8, color: '#000' },
  divider:        { height: 1, backgroundColor: '#eee', marginVertical: 4 },
  row:            { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  rowIcon:        { marginRight: 12 },
  rowLabel:       { flex: 1, fontSize: 16, color: '#333' },
});