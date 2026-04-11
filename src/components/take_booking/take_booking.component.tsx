import { StyleSheet, View } from 'react-native';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { CalendarActive, Car, ClockActive, LocationFilled } from '@/assets/svg';
import { Colors } from '@/src/utils/constants/Colors';
import { HomeRoutesLink } from '@/src/utils/enum/home.routes';
import { Calendar } from '../calendar/calendar.component';
import Input from '../input/input.component';
import { Text } from '../text/text.component';
import { Badge } from '../ui/badge';
import { HStack } from '../ui/hstack';

export const TakeABooking = () => {
  const { t } = useTranslation();

  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);

  const [type, setType] = useState<'date' | 'time'>('date');
  const [showCalendar, setShowCalendar] = useState(false);

  const lastTimestampRef = useRef<string | null>(null);


  const openDatePicker = () => {
    setShowCalendar(true);
    setType('date');
  };

  const openTimePicker = () => {
    setShowCalendar(true);
    setType('time');
  };

  const handlePress = () => {
    router.push({
      pathname: HomeRoutesLink.MAP_HOME,
      params: {
        date: date,
        time: time,
      },
    } as any);
  };

  useEffect(() => {
    const now = new Date();
    setDate(now);
    setTime(now);
  }, []);

  const isSameDay = (selectedDate: Date) => {
    const today = new Date();
    return selectedDate.getDate() === today.getDate() && selectedDate.getMonth() === today.getMonth() && selectedDate.getFullYear() === today.getFullYear();
  };

  const handleDateChange = useCallback(
    (selectedDate: Date) => {
      if (type === 'date') {
        setDate((prevDate) => {
          if (!prevDate || prevDate.getTime() !== selectedDate.getTime()) {
            return selectedDate;
          }
          return prevDate;
        });

        if (!isSameDay(selectedDate) && time) {
          setTime(new Date(selectedDate.setHours(time.getHours(), time.getMinutes())));
        }
      } else if (type === 'time') {
        if (date && isSameDay(date)) {
          if (selectedDate < new Date()) {
            alert('No puedes seleccionar una hora anterior a la actual si es el mismo día.');
            return;
          }
        }
        setTime((prevTime) => {
          if (!prevTime || prevTime.getTime() !== selectedDate.getTime()) {
            return selectedDate;
          }
          return prevTime;
        });
      }

      if (isSameDay(selectedDate)) {
        setTime((prevTime) => {
          if (!prevTime || prevTime.getTime() !== selectedDate.getTime()) {
            return selectedDate;
          }
          return prevTime;
        });
      }
    },
    [date, time, type]
  );

  useEffect(() => {
    const checkDateTime = () => {
      const now = new Date();

      const timestamp = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}`;

      if (lastTimestampRef.current !== timestamp) {
        lastTimestampRef.current = timestamp;
        setDate(now);
        setTime(now);
      }
    };

    const interval = setInterval(checkDateTime, 1000);

    checkDateTime(); // Inicializa al cargar

    return () => clearInterval(interval); // Limpia al desmontar
  }, []);

  const formattedDate = date ? dayjs(date).format('DD/MM/YYYY') : '';
  const formattedTime = time ? dayjs(time).format('HH:mm') : '';

  return (
    <View style={styles.floating_content} className="p-3">
      <Badge className="gap-2 rounded-full items-center justify-center px-4" style={styles.badge}>
        <Car width={16} height={16} color={Colors.DARK_PURPLE} />
        <Text fontSize={14} fontWeight={400} textColor={Colors.DARK_PURPLE}>
          {t('home.booking.booking_hopper', { ns: 'home' })}
        </Text>
      </Badge>
      <View className="gap-4">
        <HStack style={styles.hour} className="gap-2">
          <Input
            label=""
            onBlur={() => {}}
            onChangeText={() => {}}
            placeholder="DD/MM/AAAA"
            leftIcon
            icon={CalendarActive}
            stretch
            onPress={openDatePicker}
            editable={false}
            pressable
            value={formattedDate}
          />
          <Input
            label=""
            onBlur={() => {}}
            onChangeText={() => {}}
            placeholder="HH : MM"
            leftIcon
            icon={ClockActive}
            stretch
            onPress={openTimePicker}
            editable={false}
            pressable
            value={formattedTime}
          />
        </HStack>
        <View style={styles.destinationInputContainer}>
          <Input
            label=""
            onBlur={() => {}}
            onChangeText={() => {}}
            placeholder={t('home.booking.destinity_placeholder', { ns: 'home' })}
            leftIcon
            icon={LocationFilled}
            editable={false}
            pressable={true}
            onPress={handlePress}
          />
        </View>
      </View>
      {showCalendar && (
        <Calendar
          type={type}
          isVisible={true}
          onClose={() => setShowCalendar(false)}
          onDateChange={handleDateChange}
          date={type === 'date' ? date || new Date() : time || new Date()}
          minimumDate={new Date()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  floating_content: {
    backgroundColor: Colors.LIGHT_GRADIENT_1,
    marginTop: 16,
    height: 'auto',
    borderRadius: 20,
  },
  badge: {
    backgroundColor: Colors.PRIMARY,
    alignSelf: 'flex-start',
  },
  hour: {
    marginTop: 12,
  },
  destinationInputContainer: {
    width: '100%',
  },
});
