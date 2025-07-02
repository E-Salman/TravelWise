import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';
import { collection, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

const logos = {
  credito: require('../../../assets/images/tarjetaCredito.png'),
  debito: require('../../../assets/images/tarjetaDebito.png'),
  billetera: require('../../../assets/images/billeteraVirtual.png'),
};
const equis = require('../../../assets/images/equis.png');

type MedioPago = {
  id: string;
  tipo: 'credito' | 'debito' | 'billetera';
  nombre: string;
  numero: string;
  mes: string;
  anio: string;
  codigo: string;
  creado?: any;
};

export default function PagosPage() {
  const navigation = useNavigation();
  const [medios, setMedios] = useState<MedioPago[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState<null | string>(null);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'mediosPago'));
    const unsub = onSnapshot(q, (snap) => {
      const arr: MedioPago[] = snap.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          tipo: data.tipo || 'credito',
          nombre: data.nombre || '',
          numero: data.numero || '',
          mes: data.mes || '',
          anio: data.anio || '',
          codigo: data.codigo || '',
          creado: data.creado,
        };
      });
      setMedios(arr);
      setLoading(false);
    });
    return unsub;
  }, []);

  const eliminarMedio = (id: string) => {
    setShowDeleteModal(id);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pagos</Text>
      </View>

      {/* Medios de Pago */}
      <Text style={styles.sectionTitle}>Medios de Pago</Text>
      <TouchableOpacity style={styles.newButton} onPress={() => navigation.navigate('NuevoMedioPago')}>
        <Text style={styles.plusIcon}>＋</Text>
        <Text style={styles.newButtonText}>Nuevo Medio de Pago</Text>
      </TouchableOpacity>
      {loading ? (
        <Text>Cargando...</Text>
      ) : medios.length === 0 ? (
        <Text style={{ color: '#888', marginTop: 8 }}>No tienes medios de pago guardados.</Text>
      ) : (
        medios.map((medio) => (
          <View key={medio.id} style={styles.paymentMethod}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Image source={logos[medio.tipo] || logos['credito']} style={styles.icon} />
              <Text style={{ fontWeight: 'bold' }}>{medio.nombre}</Text>
              <Text style={{ color: '#555', marginLeft: 8 }}>{medio.numero.slice(-4).padStart(medio.numero.length, '•')}</Text>
            </View>
            <TouchableOpacity onPress={() => eliminarMedio(medio.id)}>
              <Image source={equis} style={{ width: 22, height: 22, tintColor: '#c00' }} />
            </TouchableOpacity>
          </View>
        ))
      )}

      {/* Historial de Pagos */}
      <Text style={styles.sectionTitle}>Historial de Pagos</Text>
      {/* Aquí puedes agregar el historial real, por ahora sin barras grises */}

      {showDeleteModal && (
        <Modal
          visible={!!showDeleteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(null)}
        >
          <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.3)' }}>
            <View style={{ backgroundColor:'#fff', padding:24, borderRadius:12, alignItems:'center', minWidth:300 }}>
              <Text style={{ fontWeight:'bold', fontSize:18, marginBottom:12 }}>Eliminar medio de pago</Text>
              <Text style={{ marginBottom:20 }}>¿Estás seguro que deseas eliminar este medio de pago?</Text>
              <View style={{ flexDirection:'row', gap:12 }}>
                <TouchableOpacity onPress={() => setShowDeleteModal(null)} style={{ padding:10, borderRadius:6, backgroundColor:'#eee', marginRight:8 }}>
                  <Text>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={async () => {
                  setShowDeleteModal(null);
                  try {
                    const auth = getAuth();
                    const user = auth.currentUser;
                    if (!user) throw new Error('Usuario no autenticado');
                    await deleteDoc(doc(db, 'users', user.uid, 'mediosPago', showDeleteModal));
                  } catch (e) {
                    Alert.alert('Error', 'No se pudo eliminar el medio de pago.');
                  }
                }} style={{ padding:10, borderRadius:6, backgroundColor:'red' }}>
                  <Text style={{ color:'#fff' }}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

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
  pickerBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
});
