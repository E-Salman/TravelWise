
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';

const paymentMethods = [
  { id: 1, img: require('../../assets/images/Tarjetas.png'), alt: 'Tarjetas' },
  { id: 2, img: require('../../assets/images/ModoMedioDePago.png'), alt: 'Modo Medio de Pago' },
  { id: 3, img: require('../../assets/images/MercadoPago.png'), alt: 'Mercado Pago' },
];


const PagosPage: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.backArrow}>←</Text>
        <Text style={styles.title}>Pagos</Text>
      </View>

      {/* Medios de Pago */}
      <Text style={styles.sectionTitle}>Medios de Pago</Text>
      <TouchableOpacity style={styles.newButton}>
        <Text style={styles.plusIcon}>＋</Text>
        <Text style={styles.newButtonText}>Nuevo Medio de Pago</Text>
      </TouchableOpacity>

      {paymentMethods.map((method) => (
        <View key={method.id} style={styles.paymentMethod}>
          <Image source={method.img} style={styles.icon} />
          <TouchableOpacity>
            <Text style={styles.closeIcon}>×</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Historial de Pagos */}
      <Text style={styles.sectionTitle}>Historial de Pagos</Text>
      {[...Array(6)].map((_, i) => (
        <View key={i} style={styles.historyItem} />
      ))}
    </ScrollView>
  );
};

export default PagosPage;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backArrow: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionTitle: {
    backgroundColor: '#002F5F',
    color: 'white',
    textAlign: 'center',
    paddingVertical: 8,
    fontSize: 16,
    borderRadius: 8,
    fontWeight: '600',
    marginTop: 12,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F0FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  plusIcon: {
    fontSize: 16,
    color: '#002F5F',
    marginRight: 4,
  },
  newButtonText: {
    color: '#002F5F',
    fontSize: 14,
  },
  paymentMethod: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  icon: {
    width: 40,
    height: 24,
    resizeMode: 'contain',
  },
  closeIcon: {
    fontSize: 18,
    color: '#777',
  },
  historyItem: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 6,
  },
});
