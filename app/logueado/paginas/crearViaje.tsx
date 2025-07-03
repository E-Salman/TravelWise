import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  ScrollView,
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
import { getFirestore, collection, addDoc, serverTimestamp, arrayRemove, updateDoc, doc, setDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { getFirestore, collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { firebaseApp } from '@/app/firebase';

let GooglePlacesAutocomplete: any = null;
if (Platform.OS !== 'web') {
  GooglePlacesAutocomplete = require('react-native-google-places-autocomplete').GooglePlacesAutocomplete;
}

export default function crearViajeScreen() {
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
  const [autosUsuario, setAutosUsuario] = useState<any[]>([]);
  const [viajesPendientes, setViajesPendientes] = useState<any[]>([]);
  const [solicitudesCreadas, setSolicitudesCreadas] = useState<Viaje[]>([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);
  const [precioAsiento, setPrecioAsiento] = useState('');
  
  // Google Maps API Key (replace with your actual key)
  const GOOGLE_MAPS_APIKEY = 'AIzaSyA_sve6Kikr_ABPr_RrnmR8hU4i-ixJBdA';

  const origenInputRef = useRef(null);
  const destinoInputRef = useRef(null);

  // Definir el tipo de viaje para tipado correcto
  // No usar 'export' aquí, solo 'type'
  type Viaje = {
    id: string;
    auto: any;
    origen: string;
    destino: string;
    pasajeros: string;
    pago: string;
    fecha: string; // ISO string
    createdAt?: any;
  };

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

  useEffect(() => {
    const fetchAutos = async () => {
      try {
        const auth = getAuth(firebaseApp);
        const user = auth.currentUser;
        if (!user) return;
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const data = userSnap.data();
        setAutosUsuario(data?.autos || []);
      } catch (e) {
        // Opcional: mostrar error
      }
    };
    fetchAutos();

    // Fetch viajes pendientes
    const fetchViajesPendientes = async () => {
      try {
        const auth = getAuth(firebaseApp);
        const user = auth.currentUser;
        if (!user) return;
        const db = getFirestore(firebaseApp);
        const viajesRef = collection(db, 'users', user.uid, 'viajes');
        const snapshot = await getDocs(viajesRef);
        const now = new Date();
        const pendientes: Viaje[] = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((v: any): v is Viaje => typeof v.fecha === 'string' && new Date(v.fecha) > now)
          .sort((a: Viaje, b: Viaje) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
        setViajesPendientes(pendientes);
      } catch (e) {
        // Opcional: mostrar error
      }
    };
    fetchViajesPendientes();

    const fetchSolicitudesCreadas = async () => {
      setLoadingSolicitudes(true);
      try {
        const auth = getAuth(firebaseApp);
        const user = auth.currentUser;
        if (!user) return;
        const db = getFirestore(firebaseApp);
        const viajesRef = collection(db, 'users', user.uid, 'viajes');
        const snapshot = await getDocs(viajesRef);
        const now = new Date();
        const viajes: Viaje[] = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((v: any): v is Viaje => typeof v.fecha === 'string' && new Date(v.fecha) > now)
          .sort((a: Viaje, b: Viaje) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
        setSolicitudesCreadas(viajes);
      } catch (e) {
        // Opcional: mostrar error
      } finally {
        setLoadingSolicitudes(false);
      }
    };
    fetchSolicitudesCreadas();
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
  // Helper para obtener coordenadas de una dirección
  async function getCoordsFromAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_APIKEY}`
      );
      const data = await response.json();
      if (data.results && data.results[0] && data.results[0].geometry && data.results[0].geometry.location) {
        return data.results[0].geometry.location;
      }
      return null;
    } catch {
      return null;
    }
  }

  async function handleConfirmar() {
    console.log('auto:', auto, 'origen:', origen, 'destino:', destino, 'pasajeros:', pasajeros, 'pago:', pago, 'fecha:', fecha, 'precioAsiento:', precioAsiento);
    // Validate all fields
    if (!auto || !origen || !destino || !pasajeros || !pago || !fecha || !precioAsiento) {
      alert('Por favor, completa todos los campos antes de confirmar.');
      return;
    }
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('Debes iniciar sesión para guardar el viaje.');
        return;
      }
      const autoObj = typeof auto === 'string' ? JSON.parse(auto) : auto;
      // Obtener coordenadas de origen y destino
      let origenCoords = null;
      let destinoCoords = null;
      if (Platform.OS === 'web') {
        origenCoords = await getCoordsFromAddress(origen);
        destinoCoords = await getCoordsFromAddress(destino);
      } else {
        // Si usaste GooglePlacesAutocomplete, deberías guardar coords en el estado
        // pero por compatibilidad, también hacemos fetch si no hay coords
        origenCoords = await getCoordsFromAddress(origen);
        destinoCoords = await getCoordsFromAddress(destino);
      }
      if (!origenCoords || !destinoCoords) {
        alert('No se pudieron obtener las coordenadas de origen o destino.');
        return;
      }
      // Formatear fecha local YYYY-MM-DD
      const pad = (n: number) => n < 10 ? '0' + n : n;
      const fechaLocal = `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`;
      const viaje = {
        auto: autoObj,
        origen,
        destino,
        pasajeros,
        pago,
        fecha: fechaLocal, // Guardar fecha local real
        precioAsiento,
        createdAt: serverTimestamp(),
        origenCoords,
        destinoCoords,
      };
      await addDoc(collection(db, 'users', user.uid, 'viajes'), viaje);
      await setDoc(doc(db, 'users', user.uid), { lastViaje: viaje }, { merge: true });
      alert('¡Viaje guardado exitosamente!');
      volverAHome();
    } catch (error) {
      alert('Error al guardar el viaje: ' + (error as Error).message);
    }
  }

  // Obtener el máximo de pasajeros del auto seleccionado
  let maxPasajeros = 4;
  if (auto) {
    try {
      const autoObj = typeof auto === 'string' ? JSON.parse(auto) : auto;
      if (autoObj && autoObj.maxPasajeros) {
        maxPasajeros = parseInt(autoObj.maxPasajeros, 10) || 4;
      }
    } catch {}
  }

  const handlePrecioAsientoChange = (text: string) => {
    // Solo permitir números y punto
    const sanitized = text.replace(/[^0-9.]/g, '');
    setPrecioAsiento(sanitized);
  };

  return (
    <View style={styles.container}>
      {/* Eliminar secciones superiores: Repetir Viajes y Solicitudes creadas */}

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={true}>
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
            onValueChange={(itemValue) => {
              setAuto(itemValue);
              setPasajeros(""); // Limpiar pasajeros al cambiar auto
            }}
            style={styles.picker}
          >
            <Picker.Item label="Seleccionar auto" value="" />
            {autosUsuario.length === 0 ? (
              <Picker.Item label="No tienes autos registrados" value="" />
            ) : (
              autosUsuario.map((a, i) => (
                <Picker.Item
                  key={i}
                  label={`${a.marca} ${a.modelo}`}
                  value={JSON.stringify(a)}
                />
              ))
            )
            }
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
        {auto ? (
          <View style={styles.inputBox}>
            <Image source={require('@/assets/images/grupo.png')} style={styles.icon} />
            <Picker
              selectedValue={pasajeros}
              onValueChange={(itemValue) => setPasajeros(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Pasajeros" value="" />
              {Array.from({ length: maxPasajeros }, (_, i) => (
                <Picker.Item key={i+1} label={`${i+1}`} value={`${i+1}`} />
              ))}
            </Picker>
          </View>
        ) : null}

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

        {/* Precio por asiento */}
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

        {/* Fecha */}
        {Platform.OS === 'web' ? (
          <View style={styles.inputBox}>
            <Image
              source={require('@/assets/images/calendario.png')}
              style={styles.icon}
            />
            <input
              id="fecha"
              value={fecha.toISOString().split('T')[0]}
              onChange={(e) => setFecha(new Date(e.target.value))}
              style={{
                flex: 1,
                fontSize: 16,
                padding: 6,
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                color: '#093659',
                cursor: 'pointer',
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
                  if (event.type === 'set' && selectedDate) {
                    setFecha(selectedDate);
                  } else if (Platform.OS === 'ios' && selectedDate) {
                    setFecha(selectedDate);
                  }
                  // En Android, si se cancela, no se actualiza la fecha
                }}
              />
            )}
          </>
        )}

        {/* Confirmar */}
        <TouchableOpacity style={styles.button} onPress={handleConfirmar}>
          <Text style={styles.buttonText}>Confirmar</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Mapa al final, fuera del ScrollView */}
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
  seccionesRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
    gap: 24,
    marginBottom: 24,
  },
  seccionBox: {
    flex: 1,
    backgroundColor: '#F6F8FA',
    borderRadius: 10,
    padding: 14,
    marginRight: Platform.OS === 'web' ? 12 : 0,
    marginBottom: Platform.OS === 'web' ? 0 : 12,
    minWidth: 220,
    minHeight: 120,
    boxShadow: Platform.OS === 'web' ? '0 2px 8px #0001' : undefined,
  },
  seccionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#093659',
    marginBottom: 8,
  },
  seccionEmpty: {
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
  },
  solicitudItem: {
    marginBottom: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  solicitudMain: {
    fontSize: 15,
    color: '#093659',
    fontWeight: '500',
  },
  solicitudFecha: {
    fontSize: 13,
    color: '#555',
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
});
