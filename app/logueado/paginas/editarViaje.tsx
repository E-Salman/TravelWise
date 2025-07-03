import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Platform, Image } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { firebaseApp } from '../../firebase';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EditarViajeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as { id: string };
  const [loading, setLoading] = useState(true);
  const [viaje, setViaje] = useState<any>(null);
  const [auto, setAuto] = useState('');
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [pasajeros, setPasajeros] = useState('');
  const [pago, setPago] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [showFecha, setShowFecha] = useState(false);
  const [precioAsiento, setPrecioAsiento] = useState('');
  const [autosUsuario, setAutosUsuario] = useState<any[]>([]);

  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  useEffect(() => {
    async function fetchViaje() {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;
      const docRef = doc(db, 'users', user.uid, 'viajes', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const v = docSnap.data();
        setViaje(v);
        setAuto(JSON.stringify(v.auto));
        setOrigen(v.origen);
        setDestino(v.destino);
        setPasajeros(v.pasajeros);
        setPago(v.pago);
        setFecha(new Date(v.fecha));
        setPrecioAsiento(v.precioAsiento || '');
      }
      // Autos del usuario
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      setAutosUsuario(userSnap.data()?.autos || []);
      setLoading(false);
    }
    fetchViaje();
  }, [id]);

  const handlePrecioAsientoChange = (text: string) => {
    const sanitized = text.replace(/[^0-9.]/g, '');
    setPrecioAsiento(sanitized);
  };

  async function handleGuardar() {
    if (!auto || !origen || !destino || !pasajeros || !pago || !fecha || !precioAsiento) {
      alert('Por favor, completa todos los campos antes de guardar.');
      return;
    }
    try {
      const user = auth.currentUser;
      if (!user) return;
      const autoObj = typeof auto === 'string' ? JSON.parse(auto) : auto;
      await updateDoc(doc(db, 'users', user.uid, 'viajes', id), {
        auto: autoObj,
        origen,
        destino,
        pasajeros,
        pago,
        fecha: fecha.toISOString(),
        precioAsiento,
      });
      alert('¡Viaje actualizado!');
      navigation.goBack();
    } catch (e) {
      alert('Error al guardar: ' + (e as Error).message);
    }
  }

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  let maxPasajeros = 4;
  try {
    const autoObj = typeof auto === 'string' ? JSON.parse(auto) : auto;
    if (autoObj && autoObj.maxPasajeros) {
      maxPasajeros = parseInt(autoObj.maxPasajeros, 10) || 4;
    }
  } catch {}

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <TouchableOpacity onPress={() => navigation.navigate('misSolicitudes')} style={{ marginRight: 12 }}>
          <Image source={require('@/assets/images/flechapng.png')} style={{ width: 26, height: 26, resizeMode: 'contain' }} />
        </TouchableOpacity>
        <Text style={styles.title}>Editar viaje</Text>
      </View>
      <View style={styles.inputBox}>
        <Image source={require('@/assets/images/coche.png')} style={styles.icon} />
        <Picker
          selectedValue={auto}
          onValueChange={v => {
            setAuto(v);
            setPasajeros('');
          }}
          style={styles.picker}
        >
          <Picker.Item label="Seleccionar auto" value="" />
          {autosUsuario.map((a, i) => (
            <Picker.Item key={i} label={`${a.marca} ${a.modelo}`} value={JSON.stringify(a)} />
          ))}
        </Picker>
      </View>
      <View style={styles.inputBox}>
        <Image source={require('@/assets/images/origen.png')} style={styles.icon} />
        <TextInput style={styles.input} placeholder="Origen" value={origen} onChangeText={setOrigen} />
      </View>
      <View style={styles.inputBox}>
        <Image source={require('@/assets/images/destino.png')} style={styles.icon} />
        <TextInput style={styles.input} placeholder="Destino" value={destino} onChangeText={setDestino} />
      </View>
      {auto ? (
        <View style={styles.inputBox}>
          <Image source={require('@/assets/images/grupo.png')} style={styles.icon} />
          <Picker
            selectedValue={pasajeros}
            onValueChange={setPasajeros}
            style={styles.picker}
          >
            <Picker.Item label="Pasajeros" value="" />
            {Array.from({ length: maxPasajeros }, (_, i) => (
              <Picker.Item key={i + 1} label={`${i + 1}`} value={`${i + 1}`} />
            ))}
          </Picker>
        </View>
      ) : null}
      <View style={styles.inputBox}>
        <Image source={require('@/assets/images/pagar.png')} style={styles.icon} />
        <Picker selectedValue={pago} onValueChange={setPago} style={styles.picker}>
          <Picker.Item label="Pago" value="" />
          <Picker.Item label="Efectivo" value="efectivo" />
          <Picker.Item label="Mercado Pago" value="mp" />
          <Picker.Item label="Tarjeta" value="tarjeta" />
        </Picker>
      </View>
      <View style={styles.inputBox}>
        <Image source={require('@/assets/images/Tarjetas.png')} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Precio por asiento ($)"
          keyboardType="numeric"
          value={precioAsiento}
          onChangeText={handlePrecioAsientoChange}
        />
      </View>
      {Platform.OS === 'web' ? (
        <View style={styles.inputBox}>
          <Image source={require('@/assets/images/calendario.png')} style={styles.icon} />
          <input
            id="fecha"
            value={fecha.toISOString().split('T')[0]}
            onChange={e => setFecha(new Date(e.target.value))}
            style={{ flex: 1, fontSize: 16, padding: 6, border: 'none', outline: 'none', backgroundColor: 'transparent', color: '#093659', cursor: 'pointer' }}
            type="date"
          />
        </View>
      ) : (
        <>
          <TouchableOpacity style={styles.inputBox} onPress={() => setShowFecha(true)}>
            <Image source={require('@/assets/images/calendario.png')} style={styles.icon} />
            <Text style={styles.inputText}>{fecha.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showFecha && (
            <DateTimePicker
              value={fecha}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowFecha(false);
                if (event.type === 'set' && selectedDate) setFecha(selectedDate);
                else if (Platform.OS === 'ios' && selectedDate) setFecha(selectedDate);
              }}
            />
          )}
        </>
      )}
      <TouchableOpacity style={styles.button} onPress={handleGuardar}>
        <Text style={styles.buttonText}>Guardar cambios</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#093659', marginBottom: 16 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EDEDED', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 6, marginBottom: 12 },
  icon: { width: 24, height: 24, resizeMode: 'contain', marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#333' },
  picker: { flex: 1, color: '#333' },
  inputText: { fontSize: 16, color: '#333' },
  button: { backgroundColor: '#093659', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 30 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
