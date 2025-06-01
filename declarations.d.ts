declare module 'react-native/Libraries/Image/resolveAssetSource' {
  const resolveAssetSource: (source: any) => { uri: string; width?: number; height?: number };
  export default resolveAssetSource;
}