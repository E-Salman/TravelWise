// app/logueado/tabs/chat/index.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
} from 'react-native';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  getDoc,
  doc,
  getDocs,
  where,
  setDoc,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../../firebase';
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';

export default function ChatListScreen({ navigation }: any) {
  const [chats, setChats]     = useState<any[]>([]);
  const [search, setSearch]   = useState('');
  const [amigos, setAmigos]   = useState<any[]>([]);
  const [companieros, setCompanieros] = useState<any[]>([]); // compañeros de viaje
  const [usuariosGrupo, setUsuariosGrupo] = useState<any[]>([]); // amigos + compañeros únicos
  const [fabVisible, setFab]  = useState(false);
  const [modalChat, setModalChat]   = useState(false);
  const [modalGroup, setModalGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string[]>([]);
  // Estado para menú de opciones de chat
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  const auth  = getAuth();
  const me    = auth.currentUser;
  const myUid = me?.uid;

  // 1) Escuchar chats del usuario y calcular unreadCount excluyendo tus propios mensajes
  useEffect(() => {
    if (!myUid) return;
    const q = query(
      collection(db, 'users', myUid, 'chats'),
      orderBy('lastMessage.timestamp', 'desc')
    );
    return onSnapshot(q, async snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      const withCounts = await Promise.all(
        docs.map(async c => {
          // fijarse desde cuándo contamos
          const cutoff = c.lastRead ? c.lastRead.toDate() : new Date(0);
          // todos los mensajes posteriores
          const msgsQ = query(
            collection(db, 'users', myUid, 'chats', c.id, 'messages'),
            where('timestamp', '>', cutoff)
          );
          const msgsSnap = await getDocs(msgsQ);
          // contamos solo los que no son míos
          const unread = msgsSnap.docs.filter(doc =>
            (doc.data() as any).senderId !== myUid
          ).length;
          return { ...c, unreadCount: unread };
        })
      );
      setChats(withCounts);
    });
  }, [myUid]);

  // 2) Cargar lista de amigos y compañeros de viaje
  useEffect(() => {
    if (!myUid) return;
    (async () => {
      // Amigos
      const meSnap = await getDoc(doc(db, 'users', myUid));
      let amigosArr: any[] = [];
      if (meSnap.exists()) {
        const data = meSnap.data() as any;
        const lista: string[] = Array.isArray(data.amigos) ? data.amigos : [];
        const snaps = await Promise.all(
          lista.map(id => getDoc(doc(db, 'users', id)))
        );
        amigosArr = snaps.filter(s => s.exists()).map(s => ({ id: s.id, ...(s.data() as any) }));
        setAmigos(amigosArr);
      } else {
        setAmigos([]);
      }
      // Compañeros de viaje
      // Buscar en todos los viajes donde el usuario es creador o pasajero
      const usuariosSnap = await getDocs(collection(db, 'users'));
      let companierosSet = new Set<string>();
      let companierosArr: any[] = [];
      for (const usuarioDoc of usuariosSnap.docs) {
        const viajesSnap = await getDocs(collection(db, `users/${usuarioDoc.id}/viajes`));
        for (const viajeDoc of viajesSnap.docs) {
          const viaje = viajeDoc.data();
          // Si soy creador
          if (usuarioDoc.id === myUid) {
            if (Array.isArray(viaje.listaPasajeros)) {
              viaje.listaPasajeros.forEach((p: any) => {
                if (p.uid && p.uid !== myUid) companierosSet.add(p.uid);
              });
            }
          }
          // Si soy pasajero
          if (Array.isArray(viaje.listaPasajeros) && viaje.listaPasajeros.some((p: any) => p.uid === myUid)) {
            // El creador
            if (usuarioDoc.id !== myUid) companierosSet.add(usuarioDoc.id);
            // Otros pasajeros
            viaje.listaPasajeros.forEach((p: any) => {
              if (p.uid && p.uid !== myUid) companierosSet.add(p.uid);
            });
          }
        }
      }
      // Obtener datos de los compañeros
      const companierosSnaps = await Promise.all(
        Array.from(companierosSet).map(uid => getDoc(doc(db, 'users', uid)))
      );
      companierosArr = companierosSnaps.filter(s => s.exists()).map(s => ({ id: s.id, ...(s.data() as any) }));
      setCompanieros(companierosArr);
      // Unificar amigos y compañeros (sin duplicados)
      const todos: { [id: string]: any } = {};
      [...amigosArr, ...companierosArr].forEach(u => { todos[u.id] = u; });
      setUsuariosGrupo(Object.values(todos));
    })();
  }, [myUid]);

  // 3) Filtrar chats
  const filtered = search.trim()
    ? chats.filter(c =>
        c.participants?.some((n: string) =>
          n.toLowerCase().includes(search.toLowerCase())
        )
      )
    : chats;

  // 4) Abrir chat y marcar leído
  const openChat = async (chatId: string) => {
    if (!myUid) return;
    await setDoc(
      doc(db, 'users', myUid, 'chats', chatId),
      { lastRead: serverTimestamp() },
      { merge: true }
    );
    navigation.navigate('ChatDetail', { chatId });
  };

  // Abrir o crear chat con amigo
  const openChatAmigo = async (amigo: any) => {
    if (!myUid) return;
    // Buscar chat existente
    const ids = [myUid, amigo.id].sort();
    const q2 = query(collection(db, 'users', myUid, 'chats'));
    const snap2 = await getDocs(q2);
    let chatId = '';
    snap2.forEach(d => {
      const uids = (d.data() as any).userIds;
      if (uids && uids.length === 2 && [uids[0], uids[1]].sort().join() === ids.join()) {
        chatId = d.id;
      }
    });
    if (!chatId) {
      // crear nuevo chat en ambos usuarios
      let myName = 'Yo';
      const meSnap = await getDoc(doc(db, 'users', myUid));
      if (meSnap.exists()) {
        myName = (meSnap.data() as any).nombre || myName;
      }
      const chatData = {
        userIds: ids,
        participants: [myName, amigo.nombre],
        lastMessage: { text: '', timestamp: serverTimestamp() },
      };
      const ref = doc(collection(db, 'users', myUid, 'chats'));
      chatId = ref.id;
      await Promise.all([
        setDoc(doc(db, 'users', myUid, 'chats', chatId), chatData),
        setDoc(doc(db, 'users', amigo.id, 'chats', chatId), chatData),
      ]);
    }
    setModalChat(false);
    setFab(false);
    await openChat(chatId);
  };

  // Crear grupo de chat (placeholder)
  const crearGrupo = async () => {
    setModalGroup(false);
    setFab(false);
    setSelectedGroup([]);
    alert('Funcionalidad de grupos próximamente');
  };

  // Función para eliminar chat solo para el usuario actual
  const eliminarChat = async (chatId: string) => {
    if (!myUid) return;
    await deleteDoc(doc(db, 'users', myUid, 'chats', chatId));
    setChats(chats.filter(c => c.id !== chatId));
  };

  // Navegar al perfil del otro usuario
  const verPerfil = (chat: any) => {
    if (!myUid) return;
    const otherUid = chat.userIds.find((u: string) => u !== myUid);
    if (otherUid) {
      navigation.navigate('Paginas', { screen: 'perfilUser', params: { uid: otherUid } });
    }
  };

  // Render de cada chat: avatar + nombre + preview + badge + menú
  const renderChatItem = ({ item }: { item: any }) => {
    const otherUid = item.userIds.find((u: string) => u !== myUid);
    const friend   = amigos.find(a => a.id === otherUid) || companieros.find(a => a.id === otherUid);
    const name     = friend?.nombre    || 'Desconocido';
    const avatar   = friend?.avatarUrl;
    const preview  = item.lastMessage?.text ?? '';
    const unread   = Number(item.unreadCount) || 0;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => openChat(item.id)}
        activeOpacity={0.8}
      >
        {avatar && <Image source={{ uri: avatar }} style={styles.avatar} />}
        <View style={styles.textContainer}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.preview} numberOfLines={1}>
            {preview}
          </Text>
        </View>
        {unread > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unread}</Text>
          </View>
        )}
        {/* 3 puntitos menú */}
        <Menu opened={menuVisible === item.id} onBackdropPress={() => setMenuVisible(null)}>
          <MenuTrigger onPress={() => setMenuVisible(item.id)}>
            <Ionicons name="ellipsis-vertical" size={22} color="#888" style={{ marginLeft: 8 }} />
          </MenuTrigger>
          <MenuOptions>
            <MenuOption onSelect={() => { setMenuVisible(null); verPerfil(item); }}>
              <Text style={{ padding: 10 }}>Ver perfil</Text>
            </MenuOption>
            <MenuOption onSelect={() => { setMenuVisible(null); eliminarChat(item.id); }}>
              <Text style={{ padding: 10, color: 'red' }}>Eliminar chat</Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </TouchableOpacity>
    );
  };

  return (
    <MenuProvider>
      <View style={styles.container}>
        {/* Barra de búsqueda */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#555" style={styles.searchIcon} />
          <TextInput
            placeholder="Buscar chat..."
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

        {/* Lista de chats */}
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          ListEmptyComponent={<Text style={styles.empty}>No tenés chats.</Text>}
          renderItem={renderChatItem}
        />

        {/* FAB “+” */}
        {fabVisible && (
          <View style={styles.fabOpts}>
            <TouchableOpacity style={styles.fabOpt} onPress={() => { setModalChat(true); setFab(false); }}>
              <Text style={styles.fabOptText}>Crear chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fabOpt} onPress={() => { setModalGroup(true); setFab(false); }}>
              <Text style={styles.fabOptText}>Crear grupo</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity style={styles.fab} onPress={() => setFab(v => !v)}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Modal elegir amigo */}
        <Modal visible={modalChat} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setModalChat(false)}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Elegí un usuario</Text>
              </View>
              <FlatList
                data={usuariosGrupo}
                keyExtractor={u => u.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.userItem} onPress={() => openChatAmigo(item)}>
                    <Image source={{ uri: item.avatarUrl }} style={styles.userAvatar} />
                    <Text style={styles.userName}>{item.nombre}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* Modal crear grupo */}
        <Modal visible={modalGroup} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => { setModalGroup(false); setSelectedGroup([]); }}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Añadir miembros</Text>
                <TouchableOpacity onPress={crearGrupo} disabled={selectedGroup.length === 0}>
                  <Text style={[styles.cancelText, { opacity: selectedGroup.length === 0 ? 0.5 : 1 }]}>Crear</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={usuariosGrupo}
                keyExtractor={u => u.id}
                renderItem={({ item }) => {
                  const selected = selectedGroup.includes(item.id);
                  return (
                    <TouchableOpacity
                      style={[styles.userItem, selected ? { backgroundColor: '#e6f0fa' } : null]}
                      onPress={() => {
                        setSelectedGroup(g =>
                          selected ? g.filter(id => id !== item.id) : [...g, item.id]
                        );
                      }}
                    >
                      <Image source={{ uri: item.avatarUrl }} style={styles.userAvatar} />
                      <Text style={styles.userName}>{item.nombre}</Text>
                      {selected && <Ionicons name="checkmark-circle" size={20} color="#007aff" style={{ marginLeft: 8 }} />}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </View>
        </Modal>
      </View>
    </MenuProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    padding: 20,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  preview: {
    fontSize: 14,
    color: '#666',
  },
  badge: {
    backgroundColor: '#007aff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 10,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '500',
  },
  fabOpts: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  fabOpt: {
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  fabOptText: {
    fontSize: 16,
    color: '#007aff',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007aff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cancelText: {
    fontSize: 16,
    color: '#007aff',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userName: {
    fontSize: 16,
    color: '#333',
  },
});
