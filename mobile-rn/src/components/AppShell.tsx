import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

interface AppShellProps {
  children: ReactNode;
  hideFooter?: boolean;
}

export function AppShell({ children, hideFooter = false }: AppShellProps) {
  return (
    <View style={styles.root}>
      <Navbar />
      <View style={styles.main}>{children}</View>
      {!hideFooter && <Footer />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  main: {
    flex: 1,
    width: '100%',
  },
});
