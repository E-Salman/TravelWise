import { StyleSheet, Image} from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { useResponsiveDimensions } from '../hooks/useResponsiveDimensions';
import { useResponsiveImageDimensions } from '../hooks/useResponsiveImageDimensions';

export default function TabOneScreen() {
  const { width: viewWidth, height: viewHeight } = useResponsiveDimensions({
      widthRatio: 1,
      heightRatio: 0.8,
      maintainAspectRatio: true,      
    });
    
  const { width: imageWidth1, height: imageHeight1 } = useResponsiveImageDimensions({
      source: require('../../assets/images/TWlogo.png'),
      widthRatio: 1,
      heightRatio: 0.6,
      maintainAspectRatio: true,
    });

  return (
    <View style={{ 
        alignItems: 'center', 
        justifyContent: 'center', 
        flex: 1,
        width: viewWidth,
        height: viewHeight
      }}>
      <Image
        source={require('../../assets/images/TWlogo.png')}
        style={{
          width: imageWidth1,
          height: imageHeight1          
        }}/>
      <Text style={styles.title}>PERFIL</Text> 
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
