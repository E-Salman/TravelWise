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
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../../firebase';

export default function ChatListScreen({ navigation }: any) {
  const [chats, setChats]     = useState<any[]>([]);
  const [search, setSearch]   = useState('');
  const [amigos, setAmigos]   = useState<any[]>([]);
  const [fabVisible, setFab]  = useState(false);
  const [modalChat, setModalChat]   = useState(false);
  const [modalGroup, setModalGroup] = useState(false);

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

  // 2) Cargar lista de amigos
  useEffect(() => {
    if (!myUid) return;
    (async () => {
      const meSnap = await getDoc(doc(db, 'users', myUid));
      if (!meSnap.exists()) return setAmigos([]);
      const data = meSnap.data() as any;
      const lista: string[] = Array.isArray(data.amigos) ? data.amigos : [];
      const snaps = await Promise.all(
        lista.map(id => getDoc(doc(db, 'users', id)))
      );
      setAmigos(
        snaps
          .filter(s => s.exists())
          .map(s => ({ id: s.id, ...(s.data() as any) }))
      );
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

  // Render de cada chat: avatar + nombre + preview + badge
  const renderChatItem = ({ item }: { item: any }) => {
    const otherUid = item.userIds.find((u: string) => u !== myUid);
    const friend   = amigos.find(a => a.id === otherUid);
    const name     = friend?.nombre    || 'Desconocido';
    const avatar   = friend?.avatarUrl;
    const preview  = item.lastMessage?.text ?? '';
    const unread   = Number(item.unreadCount) || 0;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => openChat(item.id)}
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
      </TouchableOpacity>
    );
  };

  return (
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
              <Text style={styles.modalTitle}>Elegí un amigo</Text>
            </View>
            <FlatList
              data={amigos}
              keyExtractor={u => u.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.userItem} onPress={() => {/* openChatAmigo(item) */}}>
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
              <TouchableOpacity onPress={() => setModalGroup(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Añadir miembros</Text>
            </View>
            <FlatList
              data={amigos}
              keyExtractor={u => u.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.userItem} onPress={() => {/* openGroupChat(item) */}}>
                  <Image source={{ uri: item.avatarUrl }} style={styles.userAvatar} />
                  <Text style={styles.userName}>{item.nombre}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex:1, backgroundColor:'#fff' },
  searchBar:     {
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'#f0f0f0',
    borderRadius:8,
    margin:12,
    paddingHorizontal:10,
    paddingVertical:6,
  },
  searchIcon:    { marginRight:6 },
  searchInput:   { flex:1, color:'#000', fontSize:16 },
  empty:         { textAlign:'center', color:'#888', marginTop:40 },

  chatItem:      {
    flexDirection:'row',
    alignItems:'center',
    padding:16,
    borderBottomWidth:1,
    borderColor:'#eee',
  },
  avatar:        { width:40, height:40, borderRadius:20, marginRight:12 },

  textContainer: { flex:1, justifyContent:'center' },
  name:          { fontSize:16, color:'#093659', fontWeight:'600' },
  preview:       { fontSize:13, color:'#666', marginTop:2 },

  badge:         {
    marginLeft:'auto',
    backgroundColor:'red',
    borderRadius:10,
    minWidth:20,
    paddingHorizontal:6,
    paddingVertical:2,
    alignItems:'center',
    justifyContent:'center',
  },
  badgeText:     { color:'#fff', fontSize:12, fontWeight:'600' },

  fab:           {
    position:'absolute',
    right:20,
    bottom:30,
    width:60,
    height:60,
    borderRadius:30,
    backgroundColor:'#093659',
    alignItems:'center',
    justifyContent:'center',
    elevation:5,
  },
  fabOpts:       { position:'absolute', right:20, bottom:100, alignItems:'flex-end' },
  fabOpt:        { backgroundColor:'#093659', borderRadius:12, padding:10, marginBottom:10 },
  fabOptText:    { color:'#fff', fontWeight:'600' },

  modalOverlay:  { flex:1, backgroundColor:'rgba(0,0,0,0.3)', justifyContent:'center', alignItems:'center' },
  modalBox:      { width:'85%', backgroundColor:'#fff', borderRadius:16, padding:16, maxHeight:'80%' },
  modalHeader:   { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
  cancelText:    { color:'#093659', fontWeight:'600' },
  modalTitle:    { fontSize:16, fontWeight:'bold' },

  userItem:      { flexDirection:'row', alignItems:'center', paddingVertical:10, borderBottomWidth:1, borderColor:'#eee' },
  userAvatar:    { width:40, height:40, borderRadius:20, marginRight:12 },
  userName:      { fontSize:16, color:'#000' },
});
