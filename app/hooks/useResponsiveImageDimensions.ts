// hooks/useResponsiveImageDimensions.ts
import { useWindowDimensions, Platform } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';

type Options = {
  source: ReturnType<typeof require>; // Static image (e.g. require('../assets/logo.png'))
  widthRatio?: number;
  heightRatio?: number;
  maintainAspectRatio?: boolean;
};

export function useResponsiveImageDimensions(options: Options) {
  const {
    source,
    widthRatio = 1,
    heightRatio = 1,
    maintainAspectRatio = true,
  } = options;

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [naturalWidth, setNaturalWidth] = useState<number | null>(null);
  const [naturalHeight, setNaturalHeight] = useState<number | null>(null);

  useEffect(() => {
    const asset = resolveAssetSource(source);

    if (Platform.OS === 'web') {
      const img = new window.Image();
      img.src = asset.uri;
      img.onload = () => {
        setNaturalWidth(img.width ?? null);  // handle undefined safely
        setNaturalHeight(img.height ?? null);
      };
    } else {
      setNaturalWidth(asset.width ?? null);   // ✅ fix: coerce undefined to null
      setNaturalHeight(asset.height ?? null);
    }
  }, [source]);


  const { width, height } = useMemo(() => {
    if (!naturalWidth || !naturalHeight) {
      return { width: 0, height: 0 };
    }

    const aspectRatio = naturalWidth / naturalHeight;

    let width = screenWidth * widthRatio;
    let height = screenHeight * heightRatio;

    if (maintainAspectRatio) {
      const widthFromHeight = height * aspectRatio;
      const heightFromWidth = width / aspectRatio;

      if (widthFromHeight <= width) {
        width = widthFromHeight;
      } else {
        height = heightFromWidth;
      }
    }

    // ✅ Cap dimensions to avoid upscaling
    width = Math.min(width, naturalWidth);
    height = Math.min(height, naturalHeight);

    return { width, height };
  }, [screenWidth, screenHeight, widthRatio, heightRatio, naturalWidth, naturalHeight, maintainAspectRatio]);

  return { width, height };
}
