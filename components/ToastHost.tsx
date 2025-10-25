import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

let _show: (msg: string) => void = () => {};

export function showToast(msg: string) {
  _show(msg);
}

export default function ToastHost() {
  const [visible, setVisible] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const anim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    _show = (msg: string) => {
      setMessage(msg);
      setVisible(true);
      Animated.timing(anim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      setTimeout(() => {
        Animated.timing(anim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => setVisible(false));
      }, 3000);
    };
    return () => {
      _show = () => {};
    };
  }, [anim]);

  if (!visible) return null;

  return (
    <Animated.View pointerEvents="none" style={[styles.wrapper, { opacity: anim }]}> 
      <View style={styles.container}>
        <Text style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  container: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  text: { color: '#fff', fontSize: 14 },
});
