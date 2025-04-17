import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
  selectedDate: string;
  onReset: () => void;
};

export default function UndoButton({ selectedDate, onReset }: Props) {
  const handleUndo = async () => {
    if (!selectedDate) return;

    const keys = await AsyncStorage.getAllKeys();
    const keysToClear = keys.filter(k => k.startsWith(selectedDate));
    for (const key of keysToClear) {
      await AsyncStorage.removeItem(key);
    }

    onReset();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleUndo} style={styles.button}>
        <Text style={styles.buttonText}>↩️ Ångra och välj ett annat datum</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#ffecec',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  buttonText: {
    color: '#d63031',
    fontSize: 15,
    fontWeight: '500',
  },
});
