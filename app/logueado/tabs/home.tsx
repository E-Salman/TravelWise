import { Image, Button } from 'react-native';
import { View } from '@/components/Themed';
import { useResponsiveDimensions } from '../../hooks/useResponsiveDimensions';
import { useResponsiveImageDimensions } from '../../hooks/useResponsiveImageDimensions';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenProps } from '@/app/types/navigation';

export default function TabOneScreen() {
  const navigation = useNavigation<HomeScreenProps['navigation']>();

  const { width: viewWidth, height: viewHeight } = useResponsiveDimensions({
    widthRatio: 1,
    heightRatio: 0.4,
    maintainAspectRatio: true,
  });

  const { width: imageWidth1, height: imageHeight1 } = useResponsiveImageDimensions({
    source: require('../../../assets/images/TWlogo.png'),
    widthRatio: 0.2,
    heightRatio: 0.6,
    maintainAspectRatio: true,
  });

  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=AIzaSyA_sve6Kikr_ABPr_RrnmR8hU4i-ixJBdA&q=-34.6037,-58.3816&zoom=14`;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, width: viewWidth, height: viewHeight }}>
      <Image
        source={require('../../../assets/images/TWlogo.png')}
        style={{ width: imageWidth1, height: imageHeight1 }}
      />

      <iframe
        width="70%"
        height="70%"
        frameBorder="0"
        style={{ border: 0 }}
        src={mapSrc}
        allowFullScreen
      ></iframe>

      <Button
        title="Go to Crear Viaje"
        onPress={() => (navigation as any).navigate('Paginas', { screen: 'crearviaje' })}
      />
    </View>
  );
}
