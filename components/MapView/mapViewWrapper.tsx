import React, { useState, useEffect } from 'react';
import { Platform, View } from 'react-native';

type MapViewProps = any; // you can type this better if you want

export default function MapViewWrapper(props: MapViewProps) {
  const [MapView, setMapView] = useState<any>(null);
  const [Marker, setMarker] = useState<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      import('react-native-maps').then((maps) => {
        setMapView(() => maps.default);
        setMarker(() => maps.Marker);
      });
    }
  }, []);

  if (Platform.OS === 'web') {
    // On web, render a plain view or some message
    return <View {...props} />;
  }

  if (!MapView || !Marker) {
    // Loading native maps module
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {/* Maybe a loading indicator */}
    </View>;
  }

  // On native platforms, render MapView with Marker inside children
  return (
    <MapView {...props}>
      {props.children}
    </MapView>
  );
}

export function MapMarkerWrapper(props: any) {
  const [Marker, setMarker] = useState<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      import('react-native-maps').then((maps) => {
        setMarker(() => maps.Marker);
      });
    }
  }, []);

  if (Platform.OS === 'web' || !Marker) {
    return null;
  }

  return <Marker {...props} />;
}
