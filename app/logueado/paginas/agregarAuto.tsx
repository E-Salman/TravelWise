import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigation } from '@react-navigation/native';

const MARCAS = [
  'Toyota', 'Volkswagen', 'Renault', 'Ford', 'Chevrolet', 'Peugeot', 'Fiat', 'Citroën', 'Honda', 'Hyundai', 'Kia', 'Nissan', 'Jeep', 'BMW', 'Mercedes-Benz', 'Audi', 'Chery', 'Mitsubishi', 'Suzuki', 'Ram', 'DS', 'Lifan', 'Great Wall', 'Geely', 'JAC', 'Dongfeng', 'Foton', 'Baic', 'BYD', 'Changhe', 'Haval', 'Otros'
].sort((a, b) => a.localeCompare(b));
const ASEGURADORAS = [
  'San Cristobal Seguros',
  'Mapfre',
  'Zurich Argentina',
  'Sancor Seguros',
  'Federacion Patronal Seguros',
  'Allianz',
  'Seguros Rivadavia',
];
const PUERTAS = ['2', '3', '4'];

export default function AgregarAutoScreen() {
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState('');
  const [color, setColor] = useState('');
  const [patente, setPatente] = useState('');
  const [aseguradora, setAseguradora] = useState('');
  const [nroPoliza, setNroPoliza] = useState('');
  const [maxPasajeros, setMaxPasajeros] = useState('');
  const [aireAcondicionado, setAireAcondicionado] = useState(false);
  const [puertas, setPuertas] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleGuardar = async () => {
    if (!marca || !modelo || !anio || !color || !patente || !aseguradora || !nroPoliza || !maxPasajeros || !puertas) {
      Alert.alert('Completa todos los campos');
      return;
    }
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('No autenticado');
      const auto = {
        marca,
        modelo,
        anio,
        color,
        patente,
        aseguradora,
        nroPoliza,
        maxPasajeros: Number(maxPasajeros),
        aireAcondicionado,
        puertas: Number(puertas),
      };
      const userRef = doc(db, 'users', user.uid);
      // Leer el documento actual
      const userSnap = await import('firebase/firestore').then(m => m.getDoc(userRef));
      if (!userSnap.exists()) {
        // Si no existe, crear el documento con el array de autos
        await import('firebase/firestore').then(m => m.setDoc(userRef, { autos: [auto] }, { merge: true }));
      } else {
        const data = userSnap.data();
        if (!data.autos) {
          await import('firebase/firestore').then(m => m.updateDoc(userRef, { autos: [auto] }));
        } else {
          await updateDoc(userRef, {
            autos: arrayUnion(auto),
          });
        }
      }
      if (Platform.OS === 'web') {
        window.alert('Auto agregado correctamente. Recargá la página para ver los cambios reflejados.');
      } else {
        Alert.alert('Auto agregado correctamente', 'Recargá la app para ver los cambios reflejados.');
      }
      // Limpiar campos
      setMarca(''); setModelo(''); setAnio(''); setColor(''); setPatente(''); setAseguradora(''); setNroPoliza(''); setMaxPasajeros(''); setAireAcondicionado(false); setPuertas('');
      // Redirigir a perfil
      navigation.navigate('Perfil');
    } catch (e) {
      if (Platform.OS === 'web') {
        window.alert('Error al guardar el auto');
      } else {
        Alert.alert('Error al guardar el auto');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Agregar auto</Text>
      <Text style={styles.label}>Marca</Text>
      <Picker selectedValue={marca} onValueChange={setMarca} style={styles.picker}>
        <Picker.Item label="Seleccionar marca" value="" />
        {MARCAS.map(m => <Picker.Item key={m} label={m} value={m} />)}
      </Picker>
      <Text style={styles.label}>Modelo</Text>
      <TextInput style={styles.input} value={modelo} onChangeText={setModelo} placeholder="Modelo" />
      <Text style={styles.label}>Año</Text>
      <TextInput style={styles.input} value={anio} onChangeText={setAnio} placeholder="Año" keyboardType="numeric" maxLength={4} />
      <Text style={styles.label}>Color</Text>
      <TextInput style={styles.input} value={color} onChangeText={setColor} placeholder="Color" />
      <Text style={styles.label}>Patente</Text>
      <TextInput style={styles.input} value={patente} onChangeText={setPatente} placeholder="Patente" autoCapitalize="characters" maxLength={10} />
      <Text style={styles.label}>Aseguradora</Text>
      <Picker selectedValue={aseguradora} onValueChange={setAseguradora} style={styles.picker}>
        <Picker.Item label="Seleccionar aseguradora" value="" />
        {ASEGURADORAS.map(a => <Picker.Item key={a} label={a} value={a} />)}
      </Picker>
      <Text style={styles.label}>Nro. de póliza</Text>
      <TextInput style={styles.input} value={nroPoliza} onChangeText={setNroPoliza} placeholder="Nro. de póliza" />
      <Text style={styles.label}>Máximo pasajeros (sin incluirte)</Text>
      <TextInput style={styles.input} value={maxPasajeros} onChangeText={setMaxPasajeros} placeholder="Ej: 4" keyboardType="numeric" maxLength={1} />
      <Text style={styles.label}>Aire acondicionado</Text>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => setAireAcondicionado(true)} style={[styles.boolBtn, aireAcondicionado && styles.boolBtnActive]}>
          <Text style={aireAcondicionado ? styles.boolTextActive : styles.boolText}>Sí</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setAireAcondicionado(false)} style={[styles.boolBtn, !aireAcondicionado && styles.boolBtnActive]}>
          <Text style={!aireAcondicionado ? styles.boolTextActive : styles.boolText}>No</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Número de puertas</Text>
      <Picker selectedValue={puertas} onValueChange={setPuertas} style={styles.picker}>
        <Picker.Item label="Seleccionar" value="" />
        {PUERTAS.map(p => <Picker.Item key={p} label={p} value={p} />)}
      </Picker>
      <TouchableOpacity style={styles.button} onPress={handleGuardar} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Guardando...' : 'Guardar'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#093659',
    marginBottom: 18,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
    color: '#093659',
  },
  input: {
    borderWidth: 1,
    borderColor: '#093659',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#093659',
    borderRadius: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  boolBtn: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#093659',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  boolBtnActive: {
    backgroundColor: '#093659',
  },
  boolText: {
    color: '#093659',
    fontWeight: 'bold',
  },
  boolTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#093659',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
