import { Button, Platform, StyleSheet, useWindowDimensions, Image } from 'react-native';
import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useResponsiveDimensions } from './hooks/useResponsiveDimensions';
import { useResponsiveImageDimensions } from './hooks/useResponsiveImageDimensions';

export default function TabOneScreen() {

  const { width: imageWidth1, height: imageHeight1 } = useResponsiveImageDimensions({
    source: require('../assets/images/faceID.png'),
    widthRatio: 0.7,
    heightRatio: 1.5,
    maintainAspectRatio: true,
  });

  const { width: imageWidth2, height: imageHeight2 } = useResponsiveImageDimensions({
    source: require('../assets/images/TWlogo.png'),
    widthRatio: 0.7,
    heightRatio: 1.5,
    maintainAspectRatio: true,
  });
  
  const router = useRouter();
  const screenWidth = useWindowDimensions().width;
  const screenHeight = useWindowDimensions().height;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
      <Image
        source={require('../assets/images/faceID.png')}
        style={{
          width: imageWidth1,
          height: imageHeight1,
          resizeMode: 'contain',
          marginTop: 20,
        }}
      />

      <Image
        source={require('../assets/images/TWlogo.png')}
        style={{
          width: imageWidth2,
          height: imageHeight2,
          resizeMode: 'contain',
          marginTop: 20,
        }}
      />
    </View>
  );
  
  /*const [aspectRatio, setAspectRatio] = useState(1);
  const [imageWidth, setImageWidth] = useState(screenWidth * 0.738);
  const [originalWidth, setOriginalWidth] = useState(0);

  useEffect(() => {
    const asset = resolveAssetSource(require('../assets/images/TWlogo.png'));
    if (Platform.OS === 'web') {
      const img = new window.Image();
      img.src = asset.uri;
      img.onload = () => {
        setOriginalWidth(img.width);
        setAspectRatio(img.width / img.height);
      };
    }
    if (asset && asset.width && asset.height) {
      setOriginalWidth(asset.width);
      setAspectRatio(asset.width / asset.height);
    } else {
      console.warn('Could not resolve image asset');
    }
  }, []);

  useEffect(() => {
    const widthBasedOnScreenWidth = screenWidth * 0.7;
    const heightBasedOnScreenHeight = (screenHeight * 0.7) * aspectRatio; // 70% of screen height

    // Use whichever is smaller - width constraint or height constraint
    const calculatedWidth = Math.min(
      widthBasedOnScreenWidth,
      heightBasedOnScreenHeight,
      originalWidth
    );
    setImageWidth(calculatedWidth);
  }, [originalWidth, screenWidth, screenHeight, aspectRatio]);

  return (
    <View
      style={[
        styles.container,
        {
          width: screenWidth,
          height: screenHeight,
        },
      ]}
    >
      <Text style={[styles.title, { fontSize: screenWidth * 0.05 }]}>
        TravelWise
      </Text>

      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

      <Image
        source={require('../assets/images/TWlogo.png')}
        style={{
          width: imageWidth,
          height: imageWidth / aspectRatio,
          resizeMode: 'contain',
        }}
      />

      <EditScreenInfo path="app/index.tsx" />

      <Button
        onPress={() => router.push('/modal')}
        title="Learn More"
        color="#841584"
        accessibilityLabel="Learn more about this purple button"
      />
    </View>
  );*/
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
