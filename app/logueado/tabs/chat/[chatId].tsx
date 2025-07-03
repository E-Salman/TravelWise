// app/logueado/tabs/chat/[chatId].tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, FlatList, TextInput,
  TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Image
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  doc, getDoc, collection, query,
  orderBy, onSnapshot, addDoc,
  serverTimestamp, updateDoc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../../firebase';

type Message = {
  id: string;
  text: string;
  senderId: string;
  timestamp: any;
};

export default function ChatDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const chatId = (route.params as any)?.chatId;
  const auth = getAuth();
  const me = auth.currentUser;
  const myUid = me?.uid;

  const [peerName, setPeerName] = useState('Chat');
  const [peerAvatar, setPeerAvatar] = useState<string|null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const flatListRef = useRef<FlatList<any>>(null);

  // 1) cargar datos del otro participante
  useEffect(() => {
    if (!chatId || !myUid) return;
    setLoading(true);
    setNotFound(false);
    (async () => {
      const chatSnap = await getDoc(doc(db, 'users', myUid, 'chats', chatId as string));
      if (!chatSnap.exists()) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const { userIds, participants } = chatSnap.data() as any;
      const otherUid = (userIds as string[]).find(u => u !== myUid);
      setPeerName(participants?.find((n: string) => n !== 'Yo') || 'Chat');
      if (otherUid) {
        const userSnap = await getDoc(doc(db, 'users', otherUid));
        if (userSnap.exists()) {
          const u = userSnap.data() as any;
          setPeerAvatar(u.avatarUrl);
        }
      }
      setLoading(false);
    })();
  }, [chatId, myUid]);

  // 2) escuchar mensajes en tiempo real
  useEffect(() => {
    if (!chatId || !myUid) return;
    const q = query(
      collection(db, 'users', myUid, 'chats', chatId as string, 'messages'),
      orderBy('timestamp', 'asc')
    );
    return onSnapshot(q, snap => {
      const arr = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      setMessages(arr);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });
  }, [chatId, myUid]);

  // 3) enviar mensaje
  const sendMessage = async () => {
    if (!chatId || !myUid || !newText.trim()) return;
    // Get chat to find both userIds
    const chatSnap = await getDoc(doc(db, 'users', myUid, 'chats', chatId as string));
    if (!chatSnap.exists()) return;
    const { userIds } = chatSnap.data() as any;
    const msg = { text: newText.trim(), senderId: myUid, timestamp: serverTimestamp() };
    // Write message to both users' subcollections
    await Promise.all(userIds.map((uid: string) =>
      addDoc(collection(db, 'users', uid, 'chats', chatId as string, 'messages'), msg)
    ));
    // Update lastMessage for both users
    await Promise.all(userIds.map((uid: string) =>
      updateDoc(doc(db, 'users', uid, 'chats', chatId as string), {
        lastMessage: { text: msg.text, timestamp: msg.timestamp }
      })
    ));
    setNewText('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <Text style={{textAlign:'center',marginTop:10,color:'#093659',fontWeight:'bold'}}>[chatId].tsx loaded</Text>
      <Text style={{textAlign:'center',marginTop:5,color:'#555',fontSize:13}}>
        chatId: {String(chatId)} | myUid: {String(myUid)}
      </Text>
      {(!chatId || !myUid) && (
        <Text style={{textAlign:'center',marginTop:40,color:'red'}}>
          chatId o myUid no definidos.<br/>chatId: {String(chatId)}<br/>myUid: {String(myUid)}
        </Text>
      )}
      {loading && <Text style={{textAlign:'center',marginTop:40}}>Cargando chat...</Text>}
      {notFound && <Text style={{textAlign:'center',marginTop:40,color:'red'}}>Chat no encontrado.<br/>Verifica que el chat existe en tu usuario.</Text>}
      {!loading && !notFound && chatId && myUid && (
        <>
        {/* header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#093659" />
          </TouchableOpacity>
          {peerAvatar && <Image source={{ uri: peerAvatar }} style={styles.headerAvatar} />}
          <Text style={styles.headerTitle}>{peerName}</Text>
          <Ionicons name="ellipsis-vertical" size={24} color="#093659" />
        </View>

        {/* mensajes */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.messagesList}
          renderItem={({ item }) => {
            const isMe = item.senderId === myUid;
            return (
              <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleYou]}>
                <Text style={isMe ? styles.textMe : styles.textYou}>{item.text}</Text>
                {item.timestamp?.toDate && (
                  <Text style={styles.time}>
                    {new Date(item.timestamp.toDate()).toLocaleTimeString([], {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </Text>
                )}
              </View>
            );
          }}
        />

        {/* input */}
        <View style={styles.inputRow}>
          <Ionicons name="add-circle-outline" size={28} color="#093659" />
          <TextInput
            style={styles.input}
            placeholder="Escribí un mensaje..."
            value={newText}
            onChangeText={setNewText}
          />
          <TouchableOpacity onPress={sendMessage}>
            <Ionicons name="send" size={28} color="#093659" />
          </TouchableOpacity>
        </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:            { flex:1, backgroundColor:'#e6f0fa' },
  header:          { flexDirection:'row', alignItems:'center', padding:12, backgroundColor:'#d0e8fa' },
  headerAvatar:    { width:36, height:36, borderRadius:18, marginHorizontal:8 },
  headerTitle:     { flex:1, fontSize:16, fontWeight:'bold', color:'#093659' },
  messagesList:    { padding:12, paddingBottom:80 },
  bubble:          { maxWidth:'75%', marginBottom:8, padding:8, borderRadius:12 },
  bubbleMe:        { alignSelf:'flex-end', backgroundColor:'#81A3BE', borderBottomRightRadius:0 },
  bubbleYou:       { alignSelf:'flex-start', backgroundColor:'#fff', borderBottomLeftRadius:0 },
  textMe:          { color:'#fff' },
  textYou:         { color:'#333' },
  time:            { fontSize:10, color:'#666', alignSelf:'flex-end', marginTop:4 },
  inputRow:        { position:'absolute', bottom:0, left:0, right:0, flexDirection:'row', alignItems:'center',
                     padding:6, backgroundColor:'#fff', borderTopWidth:1, borderColor:'#eee' },
  input:           { flex:1, marginHorizontal:8, paddingVertical:8, paddingHorizontal:12,
                     backgroundColor:'#f0f0f0', borderRadius:20 },
});
