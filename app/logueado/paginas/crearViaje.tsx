import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { View, Text } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenProps } from '@/app/types/navigation';
import { useResponsiveDimensions } from '@/app/hooks/useResponsiveDimensions';
import type { RouteProp } from '@react-navigation/native';
import type { PaginasStackParamList } from '@/app/types/navigation';

// Firebase imports
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, arrayRemove, updateDoc, doc, setDoc } from 'firebase/firestore';
import { firebaseApp } from '@/app/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

let GooglePlacesAutocomplete: any = null;
if (Platform.OS !== 'web') {
  GooglePlacesAutocomplete = require('react-native-google-places-autocomplete').GooglePlacesAutocomplete;
}

export default function crearViajeScreen() {
  const router = useRouter();
  const navigation = useNavigation<HomeScreenProps['navigation']>();
  const route = useRoute<RouteProp<PaginasStackParamList, 'crearViaje'>>();
  const prefill = route.params || {};

  const { height: mapH } = useResponsiveDimensions({
    widthRatio: 1,
    heightRatio: 0.4,
    maintainAspectRatio: true,
  });

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

  const [origen, setOrigen] = useState(prefill.origen || '');
  const [destino, setDestino] = useState(prefill.destino || '');
  const [auto, setAuto] = useState(prefill.auto || '');
  const [pasajeros, setPasajeros] = useState(prefill.pasajeros || '');
  const [pago, setPago] = useState(prefill.pago || '');
  const [fecha, setFecha] = useState(prefill.fecha ? new Date(prefill.fecha) : new Date());
  const [showFecha, setShowFecha] = useState(false);
  
  // Google Maps API Key (replace with your actual key)
  const GOOGLE_MAPS_APIKEY = 'AIzaSyA_sve6Kikr_ABPr_RrnmR8hU4i-ixJBdA';

  const origenInputRef = useRef(null);
  const destinoInputRef = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Prevent loading the script multiple times
      if (!document.getElementById('google-maps-script')) {
        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_APIKEY}&libraries=places&language=es`;
        script.async = true;
        script.onload = () => {
          if (window.google && window.google.maps && window.google.maps.places) {
            attachAutocomplete();
          }
        };
        script.onerror = () => {
          console.error('Google Maps script failed to load');
        };
        document.body.appendChild(script);
      } else if (window.google && window.google.maps && window.google.maps.places) {
        attachAutocomplete();
      }
    }

    function attachAutocomplete() {
      if (window.google && window.google.maps && window.google.maps.places) {
        if (origenInputRef.current && !(origenInputRef.current as any)._autocompleteAttached) {
          const autocompleteOrigen = new window.google.maps.places.Autocomplete(origenInputRef.current, { types: ['geocode'] });
          autocompleteOrigen.addListener('place_changed', () => {
            const place = autocompleteOrigen.getPlace();
            setOrigen(place.formatted_address || place.name || '');
          });
          (origenInputRef.current as any)._autocompleteAttached = true;
        }

        if (destinoInputRef.current && !(destinoInputRef.current as any)._autocompleteAttached) {
          const autocompleteDestino = new window.google.maps.places.Autocomplete(destinoInputRef.current, { types: ['geocode'] });
          autocompleteDestino.addListener('place_changed', () => {
            const place = autocompleteDestino.getPlace();
            setDestino(place.formatted_address || place.name || '');
          });
          (destinoInputRef.current as any)._autocompleteAttached = true;
        }
      }
    }
  }, []);

  // Helper to encode addresses for URL
  function encodeAddress(addr: string) {
    return encodeURIComponent(addr.trim());
  }

  // Compute the map src for the iframe
  let mapSrc = '';
  if (origen && destino) {
    mapSrc = `https://www.google.com/maps/embed/v1/directions?key=${GOOGLE_MAPS_APIKEY}&origin=${encodeAddress(origen)}&destination=${encodeAddress(destino)}&mode=driving`;
  } else {
    mapSrc = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_APIKEY}&q=-34.6037,-58.3816&zoom=14&maptype=roadmap`;
  }

  // Firestore and Auth instances
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  // Debug: log prefill and state values before validation
  async function handleConfirmar() {
    console.log('auto:', auto, 'origen:', origen, 'destino:', destino, 'pasajeros:', pasajeros, 'pago:', pago, 'fecha:', fecha);
    // Validate all fields
    if (!auto || !origen || !destino || !pasajeros || !pago || !fecha) {
      alert('Por favor, completa todos los campos antes de confirmar.');
      return;
    }
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('Debes iniciar sesión para guardar el viaje.');
        return;
      }
      const viaje = {
        auto,
        origen,
        destino,
        pasajeros,
        pago,
        fecha: fecha.toISOString(),
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'users', user.uid, 'viajes'), viaje);
      // Store last trip as a field directly in the user document
      await setDoc(doc(db, 'users', user.uid), { lastViaje: viaje }, { merge: true });
      alert('¡Viaje guardado exitosamente!');
      volverAHome();
    } catch (error) {
      alert('Error al guardar el viaje: ' + (error as Error).message);
    }
  }

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
        {Platform.OS === 'web' ? (
          <input
            id="origen-autocomplete"
            ref={origenInputRef}
            placeholder="Origen"
            value={origen}
            onChange={e => setOrigen(e.target.value)}
            style={{
              flex: 1,
              fontSize: 16,
              padding: 6,
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              color: '#333',
            }}
            type="text"
            autoComplete="off"
          />
        ) : (
          GooglePlacesAutocomplete && (
            <GooglePlacesAutocomplete
              placeholder="Origen"
              onPress={(data: any, details: any = null) => {
                setOrigen(data.description);
              }}
              query={{
                key: GOOGLE_MAPS_APIKEY,
                language: 'es',
              }}
              fetchDetails={true}
              styles={{
                textInput: styles.input,
                container: { flex: 1 },
                listView: { zIndex: 10 },
              }}
              textInputProps={{
                value: origen,
                onChangeText: setOrigen,
              }}
              enablePoweredByContainer={false}
            />
          )
        )}
      </View>

      {/* Destino */}
      <View style={styles.inputBox}>
        <Image source={require('@/assets/images/destino.png')} style={styles.icon} />
        {Platform.OS === 'web' ? (
          <input
            id="destino-autocomplete"
            ref={destinoInputRef}
            placeholder="Destino"
            value={destino}
            onChange={e => setDestino(e.target.value)}
            style={{
              flex: 1,
              fontSize: 16,
              padding: 6,
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              color: '#333',
            }}
            type="text"
            autoComplete="off"
          />
        ) : (
          GooglePlacesAutocomplete && (
            <GooglePlacesAutocomplete
              placeholder="Destino"
              onPress={(data: any, details: any = null) => {
                setDestino(data.description);
              }}
              query={{
                key: GOOGLE_MAPS_APIKEY,
                language: 'es',
              }}
              fetchDetails={true}
              styles={{
                textInput: styles.input,
                container: { flex: 1 },
                listView: { zIndex: 10 },
              }}
              textInputProps={{
                value: destino,
                onChangeText: setDestino,
              }}
              enablePoweredByContainer={false}
            />
          )
        )}
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

      <View style={[styles.mapContainer, { height: mapH, width: '100%' }]}>
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          src={mapSrc}
          allowFullScreen
        />
      </View>

      {/* Confirmar */}
      <TouchableOpacity style={styles.button} onPress={handleConfirmar}>
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
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
