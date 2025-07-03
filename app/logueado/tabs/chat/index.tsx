// app/logueado/tabs/chat/index.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image, Modal } from 'react-native';
import { collection, onSnapshot, query, where, orderBy, addDoc, serverTimestamp, getDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../../firebase';

export default function ChatListScreen({ navigation }: any) {
  const [chats, setChats] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [amigos, setAmigos] = useState<any[]>([]);
  const [fabVisible, setFab] = useState(false);
  const [modalChat, setModalChat] = useState(false);
  const [modalGroup, setModalGroup] = useState(false);

  const auth = getAuth();
  const me = auth.currentUser;
  const myUid = me?.uid;
  const router = useRouter();

  // 1) cargar lista de chats
  useEffect(() => {
    if (!myUid) return;
    const q = query(
      collection(db, 'users', myUid, 'chats'),
      orderBy('lastMessage.timestamp', 'desc')
    );
    return onSnapshot(q, snap => {
      setChats(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    });
  }, [myUid]);

  // 2) cargar amigos de mi perfil
  useEffect(() => {
    if (!myUid) return;
    (async () => {
      const meSnap = await getDoc(doc(db, 'users', myUid));
      const data = meSnap.data() as any;
      const lista: string[] = Array.isArray(data.amigos) ? data.amigos : [];
      const snaps = await Promise.all(lista.map(id => getDoc(doc(db, 'users', id))));
      setAmigos(snaps.filter(s => s.exists()).map(s => ({ id: s.id, ...(s.data() as any) })));
    })();
  }, [myUid]);

  // 3) buscar chats
  const filtered = search.trim()
    ? chats.filter(c =>
        c.participants?.some((n: string) =>
          n.toLowerCase().includes(search.toLowerCase())
        )
      )
    : chats;

  // 4) abrir o crear chat 1-a-1
  const openChat = async (friend: any) => {
    if (!myUid) return;
    // intenta encontrar uno existente en subcolección del usuario
    const ids = [myUid, friend.id].sort();
    const q2 = query(collection(db, 'users', myUid, 'chats'));
    const snap2 = await getDocs(q2);
    let chatId = '';
    snap2.forEach(d => {
      const uids = (d.data() as any).userIds;
      if (uids.length === 2 && [uids[0], uids[1]].sort().join() === ids.join()) {
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
        participants: [myName, friend.nombre],
        lastMessage: { text: '', timestamp: serverTimestamp() },
      };
      // Create a new chatId
      const ref = doc(collection(db, 'users', myUid, 'chats'));
      chatId = ref.id;
      await Promise.all([
        setDoc(doc(db, 'users', myUid, 'chats', chatId), chatData),
        setDoc(doc(db, 'users', friend.id, 'chats', chatId), chatData),
      ]);
    }
    setModalChat(false);
    setFab(false);
    // Navegar al detalle del chat usando React Navigation stack
    navigation.navigate('ChatDetail', { chatId });
  };

  return (
    <View style={styles.container}>
      {/* 🖊 search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#555" style={{ marginRight: 6 }} />
        <TextInput
          placeholder="Buscar chat..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* 📋 listado de chats */}
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        ListEmptyComponent={<Text style={styles.empty}>No tenés chats.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() =>
              navigation.navigate('ChatDetail', { chatId: item.id })
            }
          >
            <View style={{ flexDirection:'row', alignItems:'center' }}>
              <Ionicons name="chatbubble-ellipses" size={24} color="#093659" style={{ marginRight:12 }} />
              <Text style={styles.chatText}>{item.participants.join(', ')}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* ➕ FAB */}
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

      {/* 📱 Modal elegir amigo */}
      <Modal visible={modalChat} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalChat(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Elegí un amigo</Text>
            </View>
            <FlatList data={amigos} keyExtractor={u => u.id} renderItem={({ item }) => (
              <TouchableOpacity style={styles.userItem} onPress={() => openChat(item)}>
                <Image source={{ uri: item.avatarUrl }} style={styles.userAvatar} />
                <Text style={styles.userName}>{item.nombre}</Text>
              </TouchableOpacity>
            )} />
          </View>
        </View>
      </Modal>

      {/* 📱 Modal crear grupo (igual) */}
      <Modal visible={modalGroup} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalGroup(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Añadir miembros</Text>
            </View>
            <FlatList data={amigos} keyExtractor={u => u.id} renderItem={({ item }) => (
              <TouchableOpacity style={styles.userItem} onPress={() => openChat(item)}>
                <Image source={{ uri: item.avatarUrl }} style={styles.userAvatar} />
                <Text style={styles.userName}>{item.nombre}</Text>
              </TouchableOpacity>
            )} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex:1, backgroundColor:'#fff' },
  searchBar:    { flexDirection:'row', alignItems:'center', backgroundColor:'#f0f0f0', borderRadius:8, margin:12, paddingHorizontal:10 },
  searchInput:  { flex:1, paddingVertical:8, color:'#000' },
  empty:        { textAlign:'center', color:'#888', marginTop:40 },
  chatItem:     { padding:16, borderBottomWidth:1, borderColor:'#eee' },
  chatText:     { fontSize:16, color:'#093659' },
  fab:          { position:'absolute', right:20, bottom:30, width:60, height:60, borderRadius:30, backgroundColor:'#093659', alignItems:'center', justifyContent:'center', elevation:5 },
  fabOpts:      { position:'absolute', right:20, bottom:100, alignItems:'flex-end' },
  fabOpt:       { backgroundColor:'#093659', borderRadius:12, padding:10, marginBottom:10 },
  fabOptText:   { color:'#fff', fontWeight:'600' },
  modalOverlay: { flex:1, backgroundColor:'rgba(0,0,0,0.3)', justifyContent:'center', alignItems:'center' },
  modalBox:     { width:'85%', backgroundColor:'#fff', borderRadius:16, padding:16, maxHeight:'80%' },
  modalHeader:  { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
  cancelText:   { color:'#093659', fontWeight:'600' },
  modalTitle:   { fontSize:16, fontWeight:'bold' },
  userItem:     { flexDirection:'row', alignItems:'center', paddingVertical:10, borderBottomWidth:1, borderColor:'#eee' },
  userAvatar:   { width:40, height:40, borderRadius:20, marginRight:12 },
  userName:     { fontSize:16, color:'#000' },
});
