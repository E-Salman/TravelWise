import React from 'react';
import { Image, Pressable, Button, StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import { useResponsiveDimensions } from '../../hooks/useResponsiveDimensions';
import { useResponsiveImageDimensions } from '../../hooks/useResponsiveImageDimensions';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { HomeScreenProps } from '@/app/types/navigation';

export default function TabOneScreen() {
  const navigation = useNavigation<HomeScreenProps['navigation']>();

  // Dimensiones responsivas
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
    <View style={styles.root}>
      {/* Icono de notificaciones */}
      <Pressable
        style={styles.bell}
        onPress={() => (navigation as any).navigate('Paginas', { screen: 'notificaciones' })}
      >
        <Feather name="bell" size={24} color="#093659" />
      </Pressable>

      <View style={[styles.container, { width: viewWidth, height: viewHeight }]}>        
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bell: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});
