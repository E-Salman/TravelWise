import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Modal
} from 'react-native';
import { collection, onSnapshot, query, where, orderBy, DocumentData } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ChatScreen() {
  const [chats, setChats] = useState<DocumentData[]>([]);
  const [filteredChats, setFilteredChats] = useState<DocumentData[]>([]);
  const [search, setSearch] = useState('');
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [fabMenuVisible, setFabMenuVisible] = useState(false);

  const [users, setUsers] = useState([
    { id: '1', name: 'Carlos Peucelle', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: '2', name: 'Sandra Rossi', avatar: 'https://i.pravatar.cc/150?img=2' },
    { id: '3', name: 'Reinaldo Merlo', avatar: 'https://i.pravatar.cc/150?img=3' },
    { id: '4', name: 'Leonardo Astrada', avatar: 'https://i.pravatar.cc/150?img=4' },
    { id: '5', name: 'Felix Loustau', avatar: 'https://i.pravatar.cc/150?img=5' },
  ]);

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const q = query(
      collection(db, 'chats'),
      where('userIds', 'array-contains', currentUser.uid),
      orderBy('lastMessage.timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChats(data);
      setFilteredChats(data);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredChats(chats);
    } else {
      const lowerSearch = search.toLowerCase();
      const filtered = chats.filter(chat =>
        chat.participants?.some((name: string) =>
          name.toLowerCase().includes(lowerSearch)
        )
      );
      setFilteredChats(filtered);
    }
  }, [search, chats]);

  const renderUser = ({ item }: { item: any }) => (
    <View style={styles.userItem}>
      <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
      <Text style={styles.userName}>{item.name}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 🔍 Barra de búsqueda arriba del todo con lupa */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={20} color="#555" style={styles.searchIcon} />
        <TextInput
          placeholder="Buscar por nombre de usuario..."
          placeholderTextColor="#888"
          style={styles.searchInputWithIcon}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No tenés chats todavía.</Text>}
        renderItem={undefined}
      />

      {fabMenuVisible && (
        <View style={styles.fabOptionsContainer}>
          <TouchableOpacity style={styles.fabOption} onPress={() => setChatModalVisible(true)}>
            <Text style={styles.fabOptionText}>Crear nuevo chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fabOption} onPress={() => setGroupModalVisible(true)}>
            <Text style={styles.fabOptionText}>Crear grupo</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setFabMenuVisible(!fabMenuVisible)}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      <Modal
        visible={groupModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGroupModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.groupModal}>
            <View style={styles.groupHeader}>
              <TouchableOpacity onPress={() => setGroupModalVisible(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <Text style={styles.groupTitle}>Añadir miembros</Text>
            </View>
            <FlatList
              data={users}
              keyExtractor={item => item.id}
              renderItem={renderUser}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={chatModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setChatModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.groupModal}>
            <View style={styles.groupHeader}>
              <TouchableOpacity onPress={() => setChatModalVisible(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <Text style={styles.groupTitle}>Crear nuevo Chat</Text>
            </View>
            <FlatList
              data={users}
              keyExtractor={item => item.id}
              renderItem={renderUser}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    margin: 12,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInputWithIcon: {
    flex: 1,
    color: '#000',
    paddingVertical: 8,
  },
  empty: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    backgroundColor: '#093659',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  fabOptionsContainer: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    alignItems: 'flex-end',
    zIndex: 4,
  },
  fabOption: {
    backgroundColor: '#093659',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  fabOptionText: {
    color: 'white',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupModal: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    maxHeight: '80%',
    elevation: 10,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelText: {
    color: '#093659',
    fontWeight: '600',
  },
  groupTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    color: '#000',
  },
});
