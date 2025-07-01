import React, { useState } from 'react';
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { View, Text } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenProps } from '@/app/types/navigation';

export default function crearViajeScreen() {
  const router = useRouter();
  const navigation = useNavigation<HomeScreenProps['navigation']>();

  const volverAHome = () => {
    const parent = navigation.getParent?.();
    if (parent) {
      parent.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } else {
      navigation.navigate('Home');
    }
  };

  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [auto, setAuto] = useState('');
  const [pasajeros, setPasajeros] = useState('');
  const [pago, setPago] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [showFecha, setShowFecha] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={volverAHome}>
          <Image
            source={require('@/assets/images/flechapng.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Crear viaje</Text>
      </View>

      {/* Auto */}
      <View style={styles.inputBox}>
        <Image source={require('@/assets/images/coche.png')} style={styles.icon} />
        <Picker
          selectedValue={auto}
          onValueChange={(itemValue) => setAuto(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Seleccionar auto" value="" />
          <Picker.Item label="Toyota Corolla" value="corolla" />
          <Picker.Item label="Renault Sandero" value="sandero" />
        </Picker>
      </View>

      {/* Origen */}
      <View style={styles.inputBox}>
        <Image source={require('@/assets/images/origen.png')} style={styles.icon} />
        <TextInput
          placeholder="Origen"
          value={origen}
          onChangeText={setOrigen}
          style={styles.input}
        />
      </View>

      {/* Destino */}
      <View style={styles.inputBox}>
        <Image source={require('@/assets/images/destino.png')} style={styles.icon} />
        <TextInput
          placeholder="Destino"
          value={destino}
          onChangeText={setDestino}
          style={styles.input}
        />
      </View>

      {/* Pasajeros */}
      <View style={styles.inputBox}>
        <Image source={require('@/assets/images/grupo.png')} style={styles.icon} />
        <Picker
          selectedValue={pasajeros}
          onValueChange={(itemValue) => setPasajeros(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Pasajeros" value="" />
          <Picker.Item label="1" value="1" />
          <Picker.Item label="2" value="2" />
          <Picker.Item label="3" value="3" />
          <Picker.Item label="4" value="4" />
        </Picker>
      </View>

      {/* Pago */}
      <View style={styles.inputBox}>
        <Image source={require('@/assets/images/pagar.png')} style={styles.icon} />
        <Picker
          selectedValue={pago}
          onValueChange={(itemValue) => setPago(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Pago" value="" />
          <Picker.Item label="Efectivo" value="efectivo" />
          <Picker.Item label="Mercado Pago" value="mp" />
          <Picker.Item label="Tarjeta" value="tarjeta" />
        </Picker>
      </View>

      {/* Fecha */}
      {Platform.OS === 'web' ? (
        <View style={styles.inputBox}>
          <TouchableOpacity
            onPress={() => {
              const input = document.getElementById('fecha') as HTMLInputElement;
              if (input) {
                input.type = 'date';
                input.showPicker?.();
                input.focus();
              }
            }}
          >
            <Image
              source={require('@/assets/images/calendario.png')}
              style={styles.icon}
            />
          </TouchableOpacity>

<input
  id="fecha"
  defaultValue={fecha.toISOString().split('T')[0]}
  onChange={(e) => setFecha(new Date(e.target.value))}
  style={{
    flex: 1,
    fontSize: 16,
    padding: 6,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    color: '#ededed',
    filter: 'invert(100%) sepia(100%) saturate(0%) hue-rotate(180deg) brightness(100%) contrast(100%)',
  }}
  type="date"
/>

        </View>
      ) : (
        <>
          <TouchableOpacity
            style={styles.inputBox}
            onPress={() => setShowFecha(true)}
          >
            <Image
              source={require('@/assets/images/calendario.png')}
              style={styles.icon}
            />
            <Text style={styles.inputText}>
              {fecha.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          {showFecha && (
            <DateTimePicker
              value={fecha}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowFecha(false);
                if (selectedDate) setFecha(selectedDate);
              }}
            />
          )}
        </>
      )}

      {/* Confirmar */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Confirmar</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#093659',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDEDED',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  picker: {
    flex: 1,
    color: '#333',
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#093659',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
