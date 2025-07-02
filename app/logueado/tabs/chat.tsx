// app/logueado/tabs/chat.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  getDoc,
  doc,
  getDocs,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ChatScreen() {
  const [chats, setChats] = useState<DocumentData[]>([]);
  const [filteredChats, setFilteredChats] = useState<DocumentData[]>([]);
  const [search, setSearch] = useState('');
  const [amigos, setAmigos] = useState<DocumentData[]>([]);
  const [fabMenuVisible, setFabMenuVisible] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [groupModalVisible, setGroupModalVisible] = useState(false);

  const auth = getAuth();
  const currentUser = auth.currentUser;
  const myUid = currentUser?.uid;
  const router = useRouter();

  // 1) Escucha tus chats
  useEffect(() => {
    if (!myUid) return;
    const q = query(
      collection(db, 'chats'),
      where('userIds', 'array-contains', myUid),
      orderBy('lastMessage.timestamp', 'desc')
    );
    return onSnapshot(q, snap => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setChats(arr);
      setFilteredChats(arr);
    });
  }, [myUid]);

  // 2) Carga SOLO a tus amigos
  useEffect(() => {
    if (!myUid) return;
    (async () => {
      const meSnap = await getDoc(doc(db, 'users', myUid));
      if (!meSnap.exists()) return setAmigos([]);
      const data = meSnap.data() as any;
      const lista: string[] = Array.isArray(data.amigos) ? data.amigos : [];
      const snaps = await Promise.all(lista.map(id => getDoc(doc(db, 'users', id))));
      const arr = snaps
        .filter(s => s.exists())
        .map(s => ({ id: s.id, ...(s.data() as any) }));
      setAmigos(arr);
    })();
  }, [myUid]);

  // 3) Filtrar chats al tipear
  useEffect(() => {
    if (!search.trim()) {
      setFilteredChats(chats);
    } else {
      const term = search.toLowerCase();
      setFilteredChats(
        chats.filter(c =>
          c.participants?.some((n: string) => n.toLowerCase().includes(term))
        )
      );
    }
  }, [search, chats]);

  // 4) Crear / Abrir chat 1-a-1
  const startChat = async (friend: any) => {
    if (!myUid) {
      setChatModalVisible(false);
      setFabMenuVisible(false);
      alert('No estás autenticado.');
      return;
    }
    try {
      // buscar chat existente
      const ids = [myUid, friend.id].sort();
      const q2 = query(collection(db, 'chats'), where('userIds', 'array-contains', myUid));
      const snap2 = await getDocs(q2);
      let chatId = '';
      snap2.forEach(d => {
        const uids = (d.data() as any).userIds;
        if (
          Array.isArray(uids) &&
          uids.length === 2 &&
          [...uids].sort().join() === ids.join()
        ) {
          chatId = d.id;
        }
      });
      if (!chatId) {
        // crear nuevo
        let myName = 'Yo';
        const meSnap = await getDoc(doc(db, 'users', myUid));
        if (meSnap.exists()) {
          myName = (meSnap.data() as any).nombre || myName;
        }
        const ref = await addDoc(collection(db, 'chats'), {
          userIds: ids,
          participants: [myName, friend.nombre],
          lastMessage: { text: '', timestamp: serverTimestamp() },
        });
        chatId = ref.id;
      }
      setChatModalVisible(false);
      setFabMenuVisible(false);
      // navegacion CORRECTA a la ruta dinámica
      router.push(`/logueado/tabs/chat/${chatId}`);
    } catch (e) {
      alert('Error: ' + (e as any).message);
      setChatModalVisible(false);
      setFabMenuVisible(false);
    }
  };

  const renderChatItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => {
        if (!item.id) return alert('Chat sin ID');
        router.push(`/logueado/tabs/chat/${item.id}`);
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons
          name="chatbubble-ellipses"
          size={28}
          color="#093659"
          style={{ marginRight: 12 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.chatTitle}>
            {item.participants?.join(', ') || 'Chat sin participantes'}
          </Text>
          <Text style={styles.chatLast}>
            {item.lastMessage?.text || 'Sin mensajes aún'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAmigo = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => startChat(item)}>
      <Image source={{ uri: item.avatarUrl }} style={styles.userAvatar} />
      <Text style={styles.userName}>{item.nombre}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
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

      {/* Lista de Chats */}
      <FlatList
        data={filteredChats}
        keyExtractor={i => i.id}
        ListEmptyComponent={<Text style={styles.empty}>No tenés chats todavía.</Text>}
        renderItem={renderChatItem}
      />

      {/* FAB Menu */}
      {fabMenuVisible && (
        <View style={styles.fabOpts}>
          <TouchableOpacity
            style={styles.fabOpt}
            onPress={() => {
              setChatModalVisible(true);
              setFabMenuVisible(false);
            }}
          >
            <Text style={styles.fabOptText}>Crear chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.fabOpt}
            onPress={() => {
              setGroupModalVisible(true);
              setFabMenuVisible(false);
            }}
          >
            <Text style={styles.fabOptText}>Crear grupo</Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity style={styles.fab} onPress={() => setFabMenuVisible(v => !v)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal: Elegir Amigo */}
      <Modal visible={chatModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setChatModalVisible(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Elegí un amigo</Text>
            </View>
            <FlatList data={amigos} keyExtractor={u => u.id} renderItem={renderAmigo} />
          </View>
        </View>
      </Modal>

      {/* Modal: Crear Grupo */}
      <Modal visible={groupModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setGroupModalVisible(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Añadir miembros</Text>
            </View>
            <FlatList data={amigos} keyExtractor={u => u.id} renderItem={renderAmigo} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    margin: 12,
    paddingHorizontal: 10,
  },
  searchIcon: { marginRight: 6 },
  searchInput: { flex: 1, paddingVertical: 8, color: '#000' },
  empty: { marginTop: 40, textAlign: 'center', color: '#888' },
  chatItem: { padding: 16, borderBottomWidth: 1, borderColor: '#eee' },
  chatTitle: { fontWeight: 'bold', color: '#093659', fontSize: 16 },
  chatLast: { color: '#888', fontSize: 13 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#093659',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  fabOpts: { position: 'absolute', right: 20, bottom: 100, alignItems: 'flex-end' },
  fabOpt: { backgroundColor: '#093659', borderRadius: 12, padding: 10, marginBottom: 10 },
  fabOptText: { color: '#fff', fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: { width: '85%', backgroundColor: '#fff', borderRadius: 16, padding: 16, maxHeight: '80%' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelText: { color: '#093659', fontWeight: '600' },
  modalTitle: { fontSize: 16, fontWeight: 'bold' },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  userAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  userName: { fontSize: 16, color: '#000' },
});
