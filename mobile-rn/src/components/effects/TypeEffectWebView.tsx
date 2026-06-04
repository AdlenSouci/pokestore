import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import type { EffectType } from '../../lib/cardTypeToEffect';
import { buildCanvasEffectHtml } from './canvasEffectHtml';

type Props = {
  type: EffectType;
  /**
   * Taille du canvas. À utiliser pour caler l’effet sur la zone « halo » autour de la carte
   * (comme sur le web : la carte est au centre, l’animation remplit l’espace autour).
   * Sans ces props : plein écran (équivalent `fixed inset-0` + `TestEffect`).
   */
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Même moteur que le site (`TestEffect.tsx` / canvas) — version condensée dans `canvasEffectHtml`.
 */
export function TypeEffectWebView({ type, width: wProp, height: hProp, style }: Props) {
  const win = useWindowDimensions();
  const width = wProp ?? win.width;
  const height = hProp ?? win.height;
  const html = useMemo(
    () => buildCanvasEffectHtml(type, width, height),
    [type, width, height],
  );

  const isFullscreen = wProp == null && hProp == null;

  return (
    <WebView
      source={{ html }}
      style={[styles.wv, isFullscreen ? StyleSheet.absoluteFillObject : { width, height }, style]}
      pointerEvents="none"
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      originWhitelist={['*']}
      // Sur Android, `hardware` peut empêcher la transparence du canvas ; `software` compose mieux avec le fond.
      androidLayerType="software"
      setBuiltInZoomControls={false}
      javaScriptEnabled
      domStorageEnabled
      // Même rendu que le site (canvas plein écran) — opacité 1 pour ne pas tuer l’effet.
      opacity={1}
    />
  );
}

const styles = StyleSheet.create({
  wv: {
    backgroundColor: 'transparent',
  },
});
