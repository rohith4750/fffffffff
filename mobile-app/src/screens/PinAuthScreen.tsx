import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';

export const PinAuthScreen = ({ navigation }: { navigation: any }) => {
  const [pin, setPin] = useState('');

  const handlePress = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);

      if (nextPin.length === 4) {
        // Fast PIN verification
        if (nextPin === '1234' || nextPin === '5678') {
          navigation.replace('DailyRouteScreen', { agentPin: nextPin });
        } else {
          Alert.alert('Authentication Failed', 'Invalid 4-digit PIN code.');
          setPin('');
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>🔐</Text>
        </View>
        <Text style={styles.title}>FinFlow Field Agent</Text>
        <Text style={styles.subtitle}>Enter 4-Digit Quick PIN to Unlock Route</Text>

        <View style={styles.pinDotsRow}>
          {[0, 1, 2, 3].map((idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                pin.length > idx ? styles.dotFilled : styles.dotEmpty,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Keypad */}
      <View style={styles.keypad}>
        {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['', '0', '⌫']].map(
          (row, rIdx) => (
            <View key={rIdx} style={styles.row}>
              {row.map((btn, bIdx) => {
                if (!btn) return <View key={bIdx} style={styles.keyEmpty} />;
                return (
                  <TouchableOpacity
                    key={bIdx}
                    style={styles.key}
                    activeOpacity={0.7}
                    onPress={() => (btn === '⌫' ? handleBackspace() : handlePress(btn))}
                  >
                    <Text style={styles.keyText}>{btn}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'space-between',
    paddingVertical: 30,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#10b98120',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  pinDotsRow: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 16,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  dotEmpty: {
    borderWidth: 2,
    borderColor: '#334155',
  },
  dotFilled: {
    backgroundColor: '#10b981',
  },
  keypad: {
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyEmpty: {
    width: 72,
    height: 72,
  },
  keyText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
});
