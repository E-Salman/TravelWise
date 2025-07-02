// hooks/useResponsiveDimensions.ts
import { useWindowDimensions } from 'react-native';
import { useMemo } from 'react';

type Options = {
  widthRatio?: number;             // % of screen width (e.g., 0.8)
  heightRatio?: number;            // % of screen height (e.g., 0.6)
  aspectRatio?: number;            // width / height
  maintainAspectRatio?: boolean;  // if true, adjusts one dim to preserve aspect ratio
  maxWidth?: number;               // e.g., originalWidth
  maxHeight?: number;              // e.g., originalHeight
};

export function useResponsiveDimensions(options: Options = {}) {
  const {
    widthRatio = 1,
    heightRatio = 1,
    aspectRatio,
    maintainAspectRatio = false,
    maxWidth,
    maxHeight,
  } = options;

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  return useMemo(() => {
    let width = screenWidth * widthRatio;
    let height = screenHeight * heightRatio;

    if (maintainAspectRatio && aspectRatio) {
      // Adjust one dimension to preserve aspect ratio
      const widthFromHeight = height * aspectRatio;
      const heightFromWidth = width / aspectRatio;
      
      if (widthFromHeight <= width) {
        width = widthFromHeight;
      } else {
        height = heightFromWidth;
      }
    }

    console.log("width: " + width);
    console.log("height: " + height);

    // ✅ Avoid upscaling by capping to max size
    if (maxWidth !== undefined) {
      width = Math.min(width, maxWidth);
    }
    else {
      width = Math.min(width, screenWidth);
    }

    if (maxHeight !== undefined) { 
      height = Math.min(height, maxHeight) 
    }
    else {
      height = Math.min(height, screenHeight);
    }

    return { width, height };

  }, [screenWidth, screenHeight, widthRatio, heightRatio, aspectRatio, maintainAspectRatio, maxWidth, maxHeight]);
}
