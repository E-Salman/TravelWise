import { StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function NotificacionesScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header con flecha */}
      <View style={styles.header}>
        <Image source={require('../../assets/images/flechapng.png')} style={styles.backIcon} />
        <Text style={styles.title}>Notificaciones</Text>
      </View>

      {/* Notificación 1 */}
      <View style={styles.notification}>
        <Image source={require('../../assets/images/576f1565-8f91-4a82-b5bd-5e2c0512c997.png')} style={styles.icon} />
        <Text style={styles.text}>Tu contraseña fue actualizada con éxito</Text>
        <Pressable>
          <Image source={require('../../assets/images/equis.png')} style={styles.closeIcon} />
        </Pressable>
      </View>

      {/* Notificación 2 */}
      <View style={styles.notification}>
        <Image source={require('../../assets/images/dff890f2-3590-4d72-8662-0e4b5336d548.png')} style={styles.icon} />
        <Text style={styles.text}>Tu viaje comienza en 2 días!</Text>
        <Pressable>
          <Image source={require('../../assets/images/equis.png')} style={styles.closeIcon} />
        </Pressable>
      </View>

      {/* Notificación 3 */}
      <View style={styles.notification}>
        <Image source={require('../../assets/images/ee4e16c7-670f-4648-9cea-7999aa8b8623.png')} style={styles.icon} />
        <Text style={styles.text}>Tienes 1 solicitud de mensaje</Text>
        <Pressable>
          <Image source={require('../../assets/images/equis.png')} style={styles.closeIcon} />
        </Pressable>
      </View>

      {/* Notificación 4 */}
      <View style={styles.notification}>
        <Image source={require('../../assets/images/f33a6724-a3e0-4f7b-a797-6bccce5000bd.png')} style={styles.icon} />
        <Text style={styles.text}>Tienes 1 nueva solicitud de amistad</Text>
        <Pressable>
          <Image source={require('../../assets/images/equis.png')} style={styles.closeIcon} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#093659',
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  icon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  text: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 14,
    color: '#1E1E1E',
  },
  closeIcon: {
    width: 16,
    height: 16,
    tintColor: 'gray',
  },
});
