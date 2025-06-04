import { StyleSheet, Image} from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';

export default function TabOneScreen() {
  return (
    <View style={styles.header}>{/* Header: logo + título */}
          <Image 
                source={require('../assets/images/TWlogo.png')}
                style={styles.logo}/>
            <Text style={styles.title}>Placeholder de "Pagina de inicio"</Text>
            
        </View>
  );
}

const styles = StyleSheet.create({
  header: {
      alignItems: 'center',
  },

  logo: {
    width: 400,
    height: 400,
    resizeMode: 'contain',
    marginTop: 140,
    marginBottom: 16
  },

  title: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#093659',
    marginBottom: 180,
  },

});