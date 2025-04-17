import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

type Props = {
  text: string;
  date: string;
  onStatusChange?: () => void;
};

export default function ExerciseItem({ text, date, onStatusChange }: Props) {
  const [checked, setChecked] = useState<boolean[]>(Array(6).fill(false));
  const [isLocked, setIsLocked] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const storageKey = `${date}_${text}`;

  // 🔁 Ladda från AsyncStorage när datum eller text ändras
  useEffect(() => {
    const loadSaved = async () => {
      try {
        const saved = await AsyncStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          setChecked(parsed.checked || Array(6).fill(false));
          setIsLocked(parsed.isLocked || false);
        } else {
          setChecked(Array(6).fill(false));
          setIsLocked(false);
        }
      } catch (e) {
        console.log('❌ Kunde inte läsa sparade reps', e);
      }
    };
    loadSaved();
  }, [date, text]);

  // 💾 Spara varje gång `checked` eller `isLocked` ändras
  useEffect(() => {
    const save = async () => {
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify({ checked, isLocked }));
      } catch (e) {
        console.log('❌ Kunde inte spara reps', e);
      }
    };
    save();
  }, [checked, isLocked]);

  // ✅ När allt är klart → lås + animera + meddela parent
  useEffect(() => {
    const allDone = checked.every(c => c);
    if (allDone && !isLocked) {
      setIsLocked(true);
      onStatusChange?.();

      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [checked]);

  // 🔘 Tryck på en emoji
  const toggle = (index: number) => {
    if (isLocked) return;
    const updated = [...checked];
    updated[index] = !updated[index];
    setChecked(updated);
  };

  // 🔓 Lås upp om man ångrar sig
  const unlockAndReset = () => {
    setIsLocked(false);
    setChecked(Array(6).fill(false));
    onStatusChange?.();
  };

  return (
    <View style={styles.item}>
      <Text style={styles.text}>{text}</Text>
      <View style={styles.emojiRow}>
        {checked.map((isChecked, index) => (
          <TouchableOpacity key={index} onPress={() => toggle(index)}>
            <Text style={styles.emoji}>
              {isChecked ? '😃' : '⬜️'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {checked.every(c => c) && (
        <Animated.Text style={[styles.done, { transform: [{ scale }] }]}>
          ✔️ Klar!{' '}
          {isLocked && (
            <TouchableOpacity onPress={unlockAndReset}>
              <Text style={styles.unlock}>🔓 Lås upp och börja om</Text>
            </TouchableOpacity>
          )}
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  unlock: {
    marginTop: 8,
    fontSize: 14,
    color: '#ff6347',
    fontStyle: 'italic',
  },
  done: {
    marginTop: 8,
    color: 'green',
    fontSize: 16,
    fontWeight: '600',
  },
  item: {
    marginBottom: 24,
  },
  text: {
    fontSize: 16,
    marginBottom: 6,
  },
  emojiRow: {
    flexDirection: 'row',
    gap: 4,
  },
  emoji: {
    fontSize: 24,
    marginRight: 6,
  },
});
