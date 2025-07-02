import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigation } from '@react-navigation/native';

export default function MisAutosScreen() {
  const [autos, setAutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchAutos = async () => {
      setLoading(true);
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('No autenticado');
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const data = userSnap.data();
        setAutos(data?.autos || []);
      } catch (e) {
        Alert.alert('Error al cargar autos');
      } finally {
        setLoading(false);
      }
    };
    fetchAutos();
  }, []);

  const handleBorrar = async (auto: any) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('No autenticado');
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        autos: arrayRemove(auto),
      });
      setAutos(prev => prev.filter(a => a !== auto));
    } catch (e) {
      Alert.alert('Error al borrar auto');
    }
  };

  const handleEditar = (auto: any) => {
    navigation.navigate('EditarAuto', { auto });
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  if (!autos.length) return <Text style={{ textAlign: 'center', marginTop: 40 }}>No tienes autos registrados.</Text>;

  return (
    <FlatList
      data={autos}
      keyExtractor={(_, i) => i.toString()}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.marca} {item.modelo} ({item.anio})</Text>
          <Text>Color: {item.color}</Text>
          <Text>Patente: {item.patente}</Text>
          <Text>Aseguradora: {item.aseguradora}</Text>
          <Text>Póliza: {item.nroPoliza}</Text>
          <Text>Pasajeros: {item.maxPasajeros}</Text>
          <Text>Aire acondicionado: {item.aireAcondicionado ? 'Sí' : 'No'}</Text>
          <Text>Puertas: {item.puertas}</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.btnEdit} onPress={() => handleEditar(item)}>
              <Text style={styles.btnText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnDelete} onPress={() => handleBorrar(item)}>
              <Text style={styles.btnText}>Borrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#e6f0fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 6,
    color: '#093659',
  },
  row: {
    flexDirection: 'row',
    marginTop: 10,
  },
  btnEdit: {
    backgroundColor: '#093659',
    padding: 8,
    borderRadius: 6,
    marginRight: 10,
  },
  btnDelete: {
    backgroundColor: '#d32f2f',
    padding: 8,
    borderRadius: 6,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
