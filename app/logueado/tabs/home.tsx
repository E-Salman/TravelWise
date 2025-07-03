// app/logueado/tabs/home.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Button,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useResponsiveDimensions } from '../../hooks/useResponsiveDimensions';
import { useResponsiveImageDimensions } from '../../hooks/useResponsiveImageDimensions';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { HomeScreenProps } from '@/app/types/navigation';
import { useUserNotifications } from '../../hooks/useUserNotifications';
import { firebaseApp } from '@/app/firebase';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, updateDoc, arrayRemove, deleteDoc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';

type Viaje = {
  id: string;
  auto: string;
  origen: string;
  destino: string;
  pasajeros: string;
  pago: string;
  fecha: string;
  [key: string]: any;
};

export default function TabOneScreen() {
  const navigation = useNavigation<HomeScreenProps['navigation']>();
  const [search, setSearch] = useState('');
  const notificaciones = useUserNotifications();
  const hayNoLeidas = Array.isArray(notificaciones) && notificaciones.some(n => !n.leida);

  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  // Dimensiones responsivas para el mapa
  const { height: mapH } = useResponsiveDimensions({
    widthRatio: 1,
    heightRatio: 0.4,
    maintainAspectRatio: true,
  });

  const [viajes, setViajes] = useState<Viaje[]>([]);
  
  useEffect(() => {
    async function fetchViajes() {
      const user = auth.currentUser;
      if (!user) return;
      const viajesRef = collection(db, 'users', user.uid, 'viajes');
      const snapshot = await getDocs(viajesRef);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Viaje[];
      setViajes(data.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '')));
    }
    fetchViajes();
  }, [auth.currentUser]);

  // Handler for 'Repetir viaje'
  const handleRepetirViaje = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert('Debes iniciar sesión para repetir un viaje.');
      return;
    }
    try {
      const userDocRef = collection(db, 'users');
      const userDocSnap = await getDocs(userDocRef);
      // Find the current user's document
      const userDoc = userDocSnap.docs.find(doc => doc.id === user.uid);
      if (!userDoc || !userDoc.data().lastViaje) {
        alert('No tienes viajes previos para repetir.');
        return;
      }
      const lastViaje = userDoc.data().lastViaje;
      navigation.navigate('Paginas', {
        screen: 'crearViaje',
        params: {
          auto: lastViaje.auto,
          origen: lastViaje.origen,
          destino: lastViaje.destino,
          pasajeros: lastViaje.pasajeros,
          pago: lastViaje.pago,
          fecha: lastViaje.fecha,
        },
      });
    } catch (error) {
      alert('Error al obtener el último viaje: ' + (error as Error).message);
    }
  };

  // URL del embed de Google Maps (tu API Key ya está incluida)
  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=AIzaSyA_sve6Kikr_ABPr_RrnmR8hU4i-ixJBdA&q=-34.6037,-58.3816&zoom=14&maptype=roadmap`;

  // Nuevo: Mis Solicitudes (viajes creados por el usuario y pendientes)
  const [misSolicitudes, setMisSolicitudes] = useState<Viaje[]>([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);
  const [viajesPasajero, setViajesPasajero] = useState<Viaje[]>([]);
  const [activeTab, setActiveTab] = useState<'misSolicitudes' | 'pasajero'>('misSolicitudes');

  useEffect(() => {
    async function fetchMisSolicitudes() {
      setLoadingSolicitudes(true);
      const user = auth.currentUser;
      if (!user) return;
      const viajesRef = collection(db, 'users', user.uid, 'viajes');
      const snapshot = await getDocs(viajesRef);
      const now = new Date();
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((v: any): v is Viaje => typeof v.fecha === 'string' && new Date(v.fecha) > now)
        .sort((a: Viaje, b: Viaje) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
      setMisSolicitudes(data);
      setLoadingSolicitudes(false);
    }
    fetchMisSolicitudes();
  }, [auth.currentUser]);

  useEffect(() => {
    async function fetchViajesPasajero() {
      const user = auth.currentUser;
      if (!user) return;
      const usuariosRef = collection(db, 'users');
      const usuariosSnap = await getDocs(usuariosRef);
      let viajes: Viaje[] = [];
      for (const usuarioDoc of usuariosSnap.docs) {
        const viajesRef = collection(db, `users/${usuarioDoc.id}/viajes`);
        const viajesSnap = await getDocs(viajesRef);
        viajes = viajes.concat(
          viajesSnap.docs
            .map(docu => {
              const data = docu.data();
              return {
                id: `${usuarioDoc.id}_${docu.id}`,
                auto: data.auto,
                origen: data.origen,
                destino: data.destino,
                pasajeros: data.pasajeros,
                pago: data.pago,
                fecha: data.fecha,
                userId: usuarioDoc.id,
                ...data
              };
            })
            .filter((v: any) => Array.isArray(v.listaPasajeros) && v.listaPasajeros.some((p: any) => p.uid === user.uid))
        );
      }
      // Solo viajes futuros
      const now = new Date();
      setViajesPasajero(
        viajes.filter((v: any) => typeof v.fecha === 'string' && new Date(v.fecha) > now)
          .sort((a: any, b: any) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      );
    }
    fetchViajesPasajero();
  }, [auth.currentUser]);

  // Función para cancelar viaje (como pasajero o creador)
  const handleCancelarViaje = async (viaje: any) => {
    const user = auth.currentUser;
    if (!user) return;
    const fechaViaje = new Date(viaje.fecha);
    const ahora = new Date();
    const diffDias = (fechaViaje.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDias < 7) {
      alert('Solo puedes cancelar el viaje hasta 7 días antes de la fecha de salida.');
      return;
    }
    // Si es creador, elimina el viaje
    if (viaje.userId === user.uid) {
      await deleteDoc(doc(db, 'users', user.uid, 'viajes', viaje.id.split('_')[1]));
      setViajes(viajes.filter(v => v.id !== viaje.id.split('_')[1]));
      alert('Viaje cancelado correctamente.');
    } else {
      // Si es pasajero, se elimina de la lista de pasajeros
      const viajeRef = doc(db, `users/${viaje.userId}/viajes/${viaje.id.split('_')[1]}`);
      await updateDoc(viajeRef, {
        listaPasajeros: arrayRemove({ uid: user.uid, nombre: user.displayName || '', mail: user.email || '' })
      });
      setViajesPasajero(viajesPasajero.filter(v => v.id !== viaje.id));
      alert('Te has dado de baja del viaje.');
    }
  };

  // Filtrar viajes confirmados (menos de 7 días)
  const now = new Date();
  const viajesConfirmadosCreador = misSolicitudes.filter(v => {
    const diffDias = (new Date(v.fecha).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDias < 7 && diffDias >= 0;
  });
  const viajesConfirmadosPasajero = viajesPasajero.filter(v => {
    const diffDias = (new Date(v.fecha).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDias < 7 && diffDias >= 0;
  });
  const viajesConfirmados = [...viajesConfirmadosCreador, ...viajesConfirmadosPasajero]
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  const [showViajeModal, setShowViajeModal] = useState(false);
  const [miembrosViaje, setMiembrosViaje] = useState<{ creador: any, pasajeros: any[] } | null>(null);
  const [loadingMiembros, setLoadingMiembros] = useState(false);
  const [viajeSeleccionado, setViajeSeleccionado] = useState<any | null>(null);

  // Función para abrir modal y cargar miembros
  const handleVerMiembros = async (viaje: any) => {
    setShowViajeModal(true);
    setLoadingMiembros(true);
    setViajeSeleccionado(viaje);
    try {
      // Obtener datos del creador SIEMPRE desde la colección users
      let creador = null;
      let pasajeros: any[] = [];
      const usuariosSnap = await getDocs(collection(db, 'users'));
      let creadorId = viaje.userId;
      if (!creadorId && auth.currentUser) {
        creadorId = auth.currentUser.uid;
      }
      if (creadorId) {
        const creadorDoc = usuariosSnap.docs.find(docu => docu.id === creadorId);
        if (creadorDoc) {
          const data = creadorDoc.data();
          creador = {
            nombre: data.nombre || data.displayName || data.mail || 'Sin nombre',
            mail: data.mail || (data.email ?? ''),
            avatarUrl: data.avatarUrl || '',
          };
        } else {
          creador = { nombre: 'Sin nombre', mail: '', avatarUrl: '' };
        }
      } else {
        creador = { nombre: 'Sin nombre', mail: '', avatarUrl: '' };
      }
      // Pasajeros: buscar avatarUrl actualizado por uid
      if (Array.isArray(viaje.listaPasajeros)) {
        pasajeros = await Promise.all(
          viaje.listaPasajeros.map(async (p: any) => {
            let avatarUrl = '';
            if (p.uid) {
              const userDoc = usuariosSnap.docs.find(docu => docu.id === p.uid);
              if (userDoc) {
                avatarUrl = userDoc.data().avatarUrl || '';
              }
            }
            return {
              nombre: p.nombre || p.mail || 'Sin nombre',
              mail: p.mail || '',
              avatarUrl,
            };
          })
        );
      }
      setMiembrosViaje({ creador, pasajeros });
    } catch (e) {
      setMiembrosViaje(null);
    }
    setLoadingMiembros(false);
  };

  const DEFAULT_AVATAR_URL = 'https://ui-avatars.com/api/?name=User&background=eee&color=888&size=128';

  // Funciones auxiliares para renderizar miembros del viaje con foto de perfil (avatarUrl)
  const renderCreador = (creador: any) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, width: '100%' }}>
      <Image
        source={{ uri: creador?.avatarUrl && creador.avatarUrl.length > 0 ? creador.avatarUrl : DEFAULT_AVATAR_URL }}
        style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10, backgroundColor: '#eee' }}
        resizeMode="cover"
      />
      <View>
        <Text style={{ fontWeight: 'bold', color: '#093659' }}>Creador</Text>
        <Text>{creador?.nombre}</Text>
      </View>
    </View>
  );

  const renderPasajeros = (pasajeros: any[] | undefined) => (
    <View style={{ width: '100%' }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 6, color: '#093659' }}>Pasajeros</Text>
      {Array.isArray(pasajeros) && pasajeros.length === 0 ? (
        <Text style={{ color: '#888', marginBottom: 8 }}>No hay pasajeros.</Text>
      ) : Array.isArray(pasajeros) ? (
        pasajeros.map((p, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Image
              source={{ uri: p.avatarUrl && p.avatarUrl.length > 0 ? p.avatarUrl : DEFAULT_AVATAR_URL }}
              style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8, backgroundColor: '#eee' }}
              resizeMode="cover"
            />
            <Text>{p.nombre}</Text>
          </View>
        ))
      ) : (
        <Text style={{ color: '#888', marginBottom: 8 }}>No hay pasajeros.</Text>
      )}
    </View>
  );

  // Utilidad para formatear fecha local
  function formatFechaLocal(fechaStr: string) {
    if (!fechaStr) return '';
    // Si ya es YYYY-MM-DD, devolver tal cual
    if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) return fechaStr.split('-').reverse().join('/');
    // Si es ISO, parsear y formatear
    const d = new Date(fechaStr);
    if (isNaN(d.getTime())) return fechaStr;
    const pad = (n: number) => n < 10 ? '0' + n : n;
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ flexGrow: 1 }}>
      {/* Logo superior centrado */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginTop: 5}}>
        <Text style={{ fontWeight: '800', color: '#093659', fontSize: 32, textAlign: 'center' }}>TRAVELWISE</Text>
      </View>
      {/* Campana de notificaciones */}
      <Pressable
        style={styles.bell}
        onPress={() => navigation.navigate('Paginas', { screen: 'notificaciones' })}
      >
        <Feather name="bell" size={24} color="#093659" />
        {hayNoLeidas && (
          <View style={{
            position: 'absolute',
            top: 2,
            right: 2,
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: '#007aff',
            borderWidth: 1,
            borderColor: '#fff',
            zIndex: 20,
          }} />
        )}
      </Pressable>

      {/* Barra de búsqueda */}
      <View style={styles.searchRow}>
        <Pressable style={styles.searchBox} onPress={() => navigation.navigate('Paginas', { screen: 'buscarViaje' })}>
          <Feather name="search" size={16} color="#555" style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar viaje..."
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
            editable={false}
            pointerEvents="none"
          />
        </Pressable>
      </View>

      {/* Botones de acción y Tabs */}
      <View style={[styles.actionsRow, { marginBottom: 12 }]}> 
        <Pressable
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Paginas', { screen: 'crearViaje' })}
        >
          <Text style={styles.actionText}>+ Crear viaje</Text>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={handleRepetirViaje}
        >
          <Text style={styles.actionText}>+ Repetir viaje</Text>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Paginas', { screen: 'misSolicitudes' })}
        >
          <Text style={styles.actionText}>Mis Solicitudes</Text>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Paginas', { screen: 'pasajero' })}
        >
          <Text style={styles.actionText}>Pasajero</Text>
        </Pressable>
      </View>

      {/* Sección "En proceso" */}
      <Text style={styles.sectionTitle}>En proceso</Text>
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

      {/* Sección "Viajes próximos" */}
      <Text style={styles.sectionTitle}>Viajes próximos</Text>
      {viajesConfirmados.length === 0 ? (
        <Text style={{ color: '#888', marginTop: 8, marginBottom: 8 }}>No tienes viajes confirmados en los próximos 7 días.</Text>
      ) : (
        viajesConfirmados.map((viaje, idx) => {
          let autoLabel = '';
          if (
            viaje.auto &&
            typeof viaje.auto === 'object' &&
            viaje.auto !== null &&
            typeof (viaje.auto as any).marca === 'string' &&
            typeof (viaje.auto as any).modelo === 'string'
          ) {
            autoLabel = `${(viaje.auto as any).marca} ${(viaje.auto as any).modelo}`;
          } else if (typeof viaje.auto === 'string') {
            autoLabel = viaje.auto;
          }
          return (
            <Pressable key={viaje.id + idx} style={styles.card} onPress={() => handleVerMiembros(viaje)}>
              <Feather name="clock" size={20} color="#093659" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{viaje.origen} → {viaje.destino}</Text>
                <Text style={styles.cardSubtitle}>
                  Fecha: {formatFechaLocal(viaje.fecha)} | Pasajeros: {viaje.pasajeros} | Pago: {viaje.pago} {autoLabel ? `| ${autoLabel}` : ''}
                </Text>
              </View>
            </Pressable>
          );
        })
      )}

      {/* Modal de miembros del viaje */}
      <Modal
        visible={showViajeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowViajeModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 12, alignItems: 'center', minWidth: 320, maxWidth: 400 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Miembros del viaje</Text>
            {loadingMiembros ? (
              <ActivityIndicator size="large" color="#093659" />
            ) : miembrosViaje ? (
              <>
                {renderCreador(miembrosViaje.creador)}
                {renderPasajeros(miembrosViaje.pasajeros)}
              </>
            ) : (
              <Text style={{ color: 'red' }}>No se pudo cargar la información.</Text>
            )}
            <Pressable onPress={() => setShowViajeModal(false)} style={{ marginTop: 18, padding: 10, borderRadius: 6, backgroundColor: '#eee' }}>
              <Text>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  bell: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
  },
  searchInput: {
    flex: 1,
    color: '#000',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f0fa',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  actionText: {
    color: '#093659',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#093659',
    marginTop: 16,
  },
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  cardTitle: {
    fontSize: 16,
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 12,
  },
});
