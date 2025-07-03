import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';

export default function NuevoMedioPago() {
  const navigation = useNavigation();
  const [tipo, setTipo] = useState('');
  const [nombre, setNombre] = useState('');
  const [numero, setNumero] = useState('');
  const [mes, setMes] = useState('');
  const [anio, setAnio] = useState('');
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);

  const limpiarFormulario = () => {
    setTipo('');
    setNombre('');
    setNumero('');
    setMes('');
    setAnio('');
    setCodigo('');
  };

  const validarYGuardar = async () => {
    if (loading) return; // Prevenir doble submit
    if (!tipo) return Alert.alert('Error', 'Selecciona el tipo de medio de pago');
    if (!nombre.trim() || !/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(nombre)) return Alert.alert('Error', 'El nombre solo debe contener letras y espacios');
    if (!numero.trim() || !/^[0-9]+$/.test(numero) || numero.length < 13) return Alert.alert('Error', 'Ingresa un número de tarjeta válido (solo números)');
    if (!mes.trim() || !/^[0-9]{2}$/.test(mes) || Number(mes) < 1 || Number(mes) > 12) return Alert.alert('Error', 'Ingresa un mes válido (MM, solo números)');
    if (!anio.trim() || !/^[0-9]{2}$/.test(anio)) return Alert.alert('Error', 'Ingresa un año válido (AA, solo números)');
    // Validación de año y mes respecto a la fecha actual
    const now = new Date();
    const currentYear = Number(now.getFullYear().toString().slice(-2));
    const currentMonth = now.getMonth() + 1; // getMonth() es 0-indexado
    const anioNum = Number(anio);
    const mesNum = Number(mes);
    if (anioNum < currentYear) return Alert.alert('Error', `El año debe ser mayor o igual a ${currentYear}`);
    if (anioNum === currentYear && mesNum < currentMonth) return Alert.alert('Error', `El mes debe ser mayor o igual a ${currentMonth} para este año`);
    if (!codigo.trim() || !/^[0-9]{3,4}$/.test(codigo)) return Alert.alert('Error', 'Ingresa un código de seguridad válido (solo números)');
    try {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado');
      await addDoc(collection(db, 'users', user.uid, 'mediosPago'), {
        tipo,
        nombre,
        numero,
        mes,
        anio,
        codigo,
        creado: new Date(),
      });
      setLoading(false);
      limpiarFormulario();
      Alert.alert('¡Guardado!', 'Medio de pago agregado correctamente');
    } catch (e: any) {
      setLoading(false);
      Alert.alert('Error', e?.message || 'No se pudo guardar el medio de pago.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Pagos')}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nuevo Medio de Pago</Text>
      </View>
      <Text style={styles.label}>Seleccione medio de pago</Text>
      <View style={styles.pickerBox}>
        <Picker
          selectedValue={tipo}
          onValueChange={setTipo}
          style={{ width: '100%' }}
        >
          <Picker.Item label="Seleccione medio de pago" value="" />
          <Picker.Item label="Tarjeta de crédito" value="credito" />
          <Picker.Item label="Tarjeta de débito" value="debito" />
          <Picker.Item label="Billetera Virtual" value="billetera" />
        </Picker>
      </View>
      {/* Formulario según tipo seleccionado */}
      {(tipo === 'credito' || tipo === 'debito' || tipo === 'billetera') && (
        <View style={styles.formBox}>
          <Text style={styles.inputLabel}>Nombre completo (como está en la tarjeta)</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={text => setNombre(text.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]/g, ''))}
            placeholder="Nombre completo"
            autoCapitalize="words"
          />
          <Text style={styles.inputLabel}>Número de tarjeta</Text>
          <TextInput
            style={styles.input}
            value={numero}
            onChangeText={text => setNumero(text.replace(/[^0-9]/g, ''))}
            placeholder="0000 0000 0000 0000"
            keyboardType="number-pad"
            maxLength={19}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Mes</Text>
              <TextInput
                style={styles.input}
                value={mes}
                onChangeText={text => setMes(text.replace(/[^0-9]/g, ''))}
                placeholder="MM"
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Año</Text>
              <TextInput
                style={styles.input}
                value={anio}
                onChangeText={text => setAnio(text.replace(/[^0-9]/g, ''))}
                placeholder="AA"
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
          </View>
          <Text style={styles.inputLabel}>Código de seguridad</Text>
          <TextInput
            style={styles.input}
            value={codigo}
            onChangeText={text => setCodigo(text.replace(/[^0-9]/g, ''))}
            placeholder="CVV"
            keyboardType="number-pad"
            maxLength={4}
          />
          <TouchableOpacity style={[styles.saveButton, loading && { opacity: 0.6 }]} onPress={validarYGuardar} disabled={loading}>
            {loading ? (
              <Text style={styles.saveButtonText}>Guardando...</Text>
            ) : (
              <Text style={styles.saveButtonText}>Guardar</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
      {tipo === 'billetera' && (
        <Text style={styles.billeteraInfo}>
          Ingrese datos de la tarjeta de la billetera virtual, en caso de que no la tengas no podras usar este medio
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backArrow: { fontSize: 20, marginRight: 8 },
  title: { fontSize: 20, fontWeight: 'bold' },
  label: { fontSize: 16, marginBottom: 8 },
  pickerBox: { backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 16 },
  formBox: { backgroundColor: '#f8f8f8', borderRadius: 8, padding: 12, marginBottom: 16 },
  inputLabel: { fontSize: 14, marginTop: 8, marginBottom: 2, color: '#333' },
  input: { backgroundColor: '#fff', borderRadius: 6, borderWidth: 1, borderColor: '#ddd', padding: 8, fontSize: 15 },
  billeteraInfo: { color: 'red', fontSize: 12, marginTop: 8, marginBottom: 8, textAlign: 'center' },
  saveButton: { backgroundColor: '#002F5F', borderRadius: 8, padding: 12, marginTop: 16 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
});
