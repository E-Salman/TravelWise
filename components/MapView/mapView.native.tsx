import React, { useState, useEffect } from 'react';
import { View } from 'react-native';

export default function MapViewWrapper(props: any) {
  const [MapView, setMapView] = useState<any>(null);

  useEffect(() => {
    import('react-native-maps').then((maps) => {
      setMapView(() => maps.default);
    });
  }, []);

  if (!MapView) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>Loading Map...</View>;
  }

  return <MapView {...props}>{props.children}</MapView>;
}

export function MarkerWrapper(props: any) {
  const [Marker, setMarker] = useState<any>(null);

  useEffect(() => {
    import('react-native-maps').then((maps) => {
      setMarker(() => maps.Marker);
    });
  }, []);

  if (!Marker) return null;
  return <Marker {...props} />;
}
