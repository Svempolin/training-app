import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ExerciseItem from '../components/ExerciseItem';
import UndoButton from '../components/UndoButton';


export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});
  const [completeStatus, setCompleteStatus] = useState<{ [key: string]: boolean }>({});

  const todaysWorkout = [
    "Fatman Pullup + Rak Skivstång",
    "Knästående Chins + Hammarcurl",
    "Chins x 3 + Monkey Style",
    "Viktskiva (Rygg) + Höga Cablecross Curls",
  ];

  const checkIfDayIsComplete = async (dateToCheck: string) => {
    const keys = await AsyncStorage.getAllKeys();
    const todaysKeys = keys.filter(k => k.startsWith(dateToCheck));
    let allLocked = true;

    for (const key of todaysKeys) {
      const val = await AsyncStorage.getItem(key);
      const parsed = val ? JSON.parse(val) : null;
      if (!parsed?.isLocked) {
        allLocked = false;
        break;
      }
    }

    const isComplete = allLocked && todaysKeys.length === todaysWorkout.length;

    setCompleteStatus(prev => ({
      ...prev,
      [dateToCheck]: isComplete,
    }));

    setMarkedDates(prev => ({
      ...prev,
      [dateToCheck]: {
        selected: true,
        selectedColor: isComplete ? '#32cd32' : '#1e90ff',
      },
    }));
  };

  useEffect(() => {
    if (selectedDate) {
      checkIfDayIsComplete(selectedDate);
    }
  }, [selectedDate]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.inner}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>Välj träningsdag 📆</Text>

      <Calendar
        onDayPress={(day: { dateString: string }) => {
          setSelectedDate(day.dateString);
        }}
        markedDates={markedDates}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#1e90ff',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#ff6347',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          arrowColor: '#1e90ff',
          monthTextColor: '#1e90ff',
          textDayFontWeight: '500',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
        }}
      />
      {selectedDate && (
  <UndoButton
    selectedDate={selectedDate}
    onReset={() => {
      setSelectedDate('');
      setMarkedDates(prev => {
        const updated = { ...prev };
        delete updated[selectedDate];
        return updated;
      });
      setCompleteStatus(prev => {
        const updated = { ...prev };
        delete updated[selectedDate];
        return updated;
      });
    }}
  />
)}


      {selectedDate && !completeStatus[selectedDate] && (
        <>
          <Text style={styles.subheader}>Dagens pass: {selectedDate}</Text>
          {todaysWorkout.map((exercise, index) => (
            <ExerciseItem
              key={index}
              text={`${index + 1}. ${exercise}`}
              date={selectedDate}
              onStatusChange={() => checkIfDayIsComplete(selectedDate)}
            />
          ))}
        </>
      )}

      {selectedDate && completeStatus[selectedDate] && (
        <Text style={styles.doneText}>✅ Alla övningar för {selectedDate} är klara!</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inner: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
  },
  subheader: {
    fontSize: 18,
    fontWeight: '500',
    marginVertical: 20,
    color: '#1e90ff',
  },
  doneText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    color: 'green',
    textAlign: 'center',
  },
});
