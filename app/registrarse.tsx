import { StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useNavigation } from '@react-navigation/native';
import { useResponsiveImageDimensions } from './hooks/useResponsiveImageDimensions';
import { TextInput } from 'react-native';


export default function TabOneScreen() {
  const navigation = useNavigation();

  const { width: imageWidth1, height: imageHeight1 } = useResponsiveImageDimensions({
    source: require('../assets/images/flechapng.png'),
    widthRatio: 0.1,
    heightRatio: 0.1,
    maintainAspectRatio: true,
  });

  return (
    <View style={styles.container}>
      {/* Flechita interactiva */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backArrow}>
        <Image
          source={require('../assets/images/flechapng.png')}
          style={{ width: imageWidth1, height: imageHeight1 }}
        />
      </TouchableOpacity>

      <View style={styles.header}>
        <Image
          source={require('../assets/images/TWlogo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Registro</Text>
        <Text style={styles.predeterminado}>Nombre</Text>
        <TextInput
  style={styles.input}
  placeholder="Escribí tu nombre"
/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  backArrow: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  header: {
    alignItems: 'center',
  },
  logo: {
    width: 400,
    height: 400,
    resizeMode: 'contain',
    marginTop: 40,
    marginBottom: 16,
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#093659',
    marginBottom: 40,
  },
    predeterminado: {
    fontSize: 20,
    color: '#000000',
    marginBottom: 40,
  },
  input: {
  height: 45,
  borderColor: '#ccc',
  borderWidth: 1,
  borderRadius: 6,
  paddingHorizontal: 10,
  marginBottom: 15,
  backgroundColor: 'white',
},

});
