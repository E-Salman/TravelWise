import { Image, Button} from 'react-native';
import { View } from '@/components/Themed';
import { useResponsiveDimensions } from '../../hooks/useResponsiveDimensions';
import { useResponsiveImageDimensions } from '../../hooks/useResponsiveImageDimensions';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenProps } from '@/app/types/navigation';

export default function TabOneScreen() {
  const navigation = useNavigation<HomeScreenProps['navigation']>();
  
  const { width: viewWidth, height: viewHeight } = useResponsiveDimensions({
      widthRatio: 1,
      heightRatio: 0.8,
      maintainAspectRatio: true,      
    });
    
  const { width: imageWidth1, height: imageHeight1 } = useResponsiveImageDimensions({
      source: require('../../../assets/images/TWlogo.png'),
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
        source={require('../../../assets/images/TWlogo.png')}
        style={{
          width: imageWidth1,
          height: imageHeight1
        }} />
        
      <Button
        title="Go to Crear Viaje"
        onPress={() => (navigation as any).navigate('Paginas', { screen: 'crearviaje' })}
      />
    </View>
  );
};
