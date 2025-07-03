import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseApp } from '../../firebase';

let GooglePlacesAutocomplete: any = null;
if (Platform.OS !== 'web') {
  GooglePlacesAutocomplete = require('react-native-google-places-autocomplete').GooglePlacesAutocomplete;
}

const GOOGLE_MAPS_APIKEY = 'AIzaSyA_sve6Kikr_ABPr_RrnmR8hU4i-ixJBdA';

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function BuscarViajeScreen() {
  const navigation = useNavigation();
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [origenCoords, setOrigenCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destinoCoords, setDestinoCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [resultados, setResultados] = useState<any[]>([]);
  const [buscando, setBuscando] = useState(false);
  const origenInputRef = useRef<any>(null);
  const destinoInputRef = useRef<any>(null);

  // Google Places Autocomplete para web
  useEffect(() => {
    if (Platform.OS === 'web') {
      if (!document.getElementById('google-maps-script')) {
        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_APIKEY}&libraries=places&language=es`;
        script.async = true;
        script.onload = () => attachAutocomplete();
        script.onerror = () => console.error('Google Maps script failed to load');
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
            if (place.geometry && place.geometry.location) {
              setOrigenCoords({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
            }
          });
          (origenInputRef.current as any)._autocompleteAttached = true;
        }
        if (destinoInputRef.current && !(destinoInputRef.current as any)._autocompleteAttached) {
          const autocompleteDestino = new window.google.maps.places.Autocomplete(destinoInputRef.current, { types: ['geocode'] });
          autocompleteDestino.addListener('place_changed', () => {
            const place = autocompleteDestino.getPlace();
            setDestino(place.formatted_address || place.name || '');
            if (place.geometry && place.geometry.location) {
              setDestinoCoords({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
            }
          });
          (destinoInputRef.current as any)._autocompleteAttached = true;
        }
      }
    }
  }, []);

  const getCoordsFromAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
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
  };

  const buscarViajes = async () => {
    let origenC = origenCoords;
    let destinoC = destinoCoords;
    // En web, si el usuario no seleccionó del autocomplete, buscar coords por texto
    if (Platform.OS === 'web') {
      if (!origenC && origen) origenC = await getCoordsFromAddress(origen);
      if (!destinoC && destino) destinoC = await getCoordsFromAddress(destino);
      setOrigenCoords(origenC);
      setDestinoCoords(destinoC);
    }
    if (!origenC || !destinoC) {
      alert('Selecciona ubicaciones válidas para origen y destino.');
      return;
    }
    setBuscando(true);
    const db = getFirestore(firebaseApp);
    // CORREGIDO: Recorrer todos los usuarios y sus subcolecciones de viajes en 'users'
    const usuariosRef = collection(db, 'users');
    const usuariosSnap = await getDocs(usuariosRef);
    let viajes: any[] = [];
    for (const usuarioDoc of usuariosSnap.docs) {
      const viajesRef = collection(db, `users/${usuarioDoc.id}/viajes`);
      const viajesSnap = await getDocs(viajesRef);
      viajes = viajes.concat(
        viajesSnap.docs.map(doc => ({ id: `${usuarioDoc.id}_${doc.id}`, ...doc.data() }))
      );
    }
    const data = viajes.filter((v: any) => {
      if (!v.origenCoords || !v.destinoCoords) return false;
      const dOrigen = haversineDistance(
        origenC.lat,
        origenC.lng,
        v.origenCoords.lat,
        v.origenCoords.lng
      );
      const dDestino = haversineDistance(
        destinoC.lat,
        destinoC.lng,
        v.destinoCoords.lat,
        v.destinoCoords.lng
      );
      return dOrigen <= 50 && dDestino <= 50;
    });
    setResultados(data);
    setBuscando(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
          <Feather name="arrow-left" size={26} color="#093659" />
        </TouchableOpacity>
        <Text style={styles.title}>Buscar viaje</Text>
      </View>
      <View style={styles.inputBox}>
        <Text style={styles.label}>Origen exacto:</Text>
        {Platform.OS === 'web' ? (
          <input
            ref={origenInputRef}
            placeholder="Ej: Av. Corrientes 1234, CABA"
            value={origen}
            onChange={e => setOrigen(e.target.value)}
            style={{ flex: 1, fontSize: 16, padding: 6, border: 'none', outline: 'none', backgroundColor: 'transparent', color: '#333' }}
            type="text"
            autoComplete="off"
            id="origen-buscar"
          />
        ) : (
          GooglePlacesAutocomplete && (
            <GooglePlacesAutocomplete
              placeholder="Origen"
              onPress={(data: any, details: any = null) => {
                setOrigen(data.description);
                if (details && details.geometry && details.geometry.location) {
                  setOrigenCoords(details.geometry.location);
                }
              }}
              query={{ key: GOOGLE_MAPS_APIKEY, language: 'es' }}
              fetchDetails={true}
              styles={{ textInput: styles.input, container: { flex: 1 }, listView: { zIndex: 10 } }}
              textInputProps={{ value: origen, onChangeText: setOrigen }}
              enablePoweredByContainer={false}
            />
          )
        )}
      </View>
      <View style={styles.inputBox}>
        <Text style={styles.label}>Destino exacto:</Text>
        {Platform.OS === 'web' ? (
          <input
            ref={destinoInputRef}
            placeholder="Ej: Calle 50 123, La Plata"
            value={destino}
            onChange={e => setDestino(e.target.value)}
            style={{ flex: 1, fontSize: 16, padding: 6, border: 'none', outline: 'none', backgroundColor: 'transparent', color: '#333' }}
            type="text"
            autoComplete="off"
            id="destino-buscar"
          />
        ) : (
          GooglePlacesAutocomplete && (
            <GooglePlacesAutocomplete
              placeholder="Destino"
              onPress={(data: any, details: any = null) => {
                setDestino(data.description);
                if (details && details.geometry && details.geometry.location) {
                  setDestinoCoords(details.geometry.location);
                }
              }}
              query={{ key: GOOGLE_MAPS_APIKEY, language: 'es' }}
              fetchDetails={true}
              styles={{ textInput: styles.input, container: { flex: 1 }, listView: { zIndex: 10 } }}
              textInputProps={{ value: destino, onChangeText: setDestino }}
              enablePoweredByContainer={false}
            />
          )
        )}
      </View>
      <TouchableOpacity style={styles.button} onPress={buscarViajes} disabled={buscando}>
        <Text style={styles.buttonText}>{buscando ? 'Buscando...' : 'Buscar'}</Text>
      </TouchableOpacity>
      <FlatList
        data={resultados}
        keyExtractor={item => item.id}
        ListEmptyComponent={buscando ? null : <Text style={{ color: '#888', marginTop: 20 }}>No se encontraron viajes.</Text>}
        renderItem={({ item }) => (
          <View style={styles.resultCard}>
            <Text style={styles.resultMain}>{item.origen} → {item.destino}</Text>
            <Text style={styles.resultSub}>Fecha: {item.fecha ? new Date(item.fecha).toLocaleDateString() : '-'} | Pasajeros: {item.pasajeros ?? '-'} | Pago: {item.pago ?? '-'}</Text>
          </View>
        )}
        style={{ marginTop: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f6faff' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#093659' },
  inputBox: { marginBottom: 12 },
  label: { color: '#093659', fontWeight: 'bold', marginBottom: 4 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 10, fontSize: 16, borderWidth: 1, borderColor: '#eee' },
  button: { backgroundColor: '#093659', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  resultCard: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, elevation: 1 },
  resultMain: { fontSize: 16, fontWeight: 'bold', color: '#093659' },
  resultSub: { fontSize: 14, color: '#555', marginTop: 4 },
});
