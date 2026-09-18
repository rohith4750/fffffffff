import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Linking,
} from 'react-native';

const MOCK_QUEUE = [
  {
    id: 'CUST-1001',
    name: 'Ramesh Babu Goud',
    mobile: '9876501122',
    address: 'Vegetable Market, Kukatpally, Hyderabad',
    loanCode: 'LN-W-2026-001',
    dueAmount: 2400,
    lat: 17.4947,
    lng: 78.3996,
  },
  {
    id: 'CUST-1002',
    name: 'Lakshmi Devi',
    mobile: '9849123456',
    address: 'Shanti Nagar, Ameerpet, Hyderabad',
    loanCode: 'LN-M-2026-002',
    dueAmount: 10833,
    lat: 17.4375,
    lng: 78.4482,
  },
];

export const DailyRouteScreen = ({ navigation }: { navigation: any }) => {
  const openMapsNavigation = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Banner */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topTitle}>Field Collection Route</Text>
          <Text style={styles.topSub}>2 Scheduled Visits Today</Text>
        </View>
        <TouchableOpacity
          style={styles.lockBtn}
          onPress={() => navigation.replace('PinAuthScreen')}
        >
          <Text style={styles.lockBtnText}>🔒 Lock</Text>
        </TouchableOpacity>
      </View>

      {/* Target Progress */}
      <View style={styles.targetCard}>
        <Text style={styles.targetLabel}>TODAY'S TARGET: INR 25,000</Text>
        <Text style={styles.targetValue}>Collected: INR 7,200 (29%)</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: '29%' }]} />
        </View>
      </View>

      {/* Customers List */}
      <FlatList
        data={MOCK_QUEUE}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.badgeIndex}>
                <Text style={styles.badgeIndexText}>{index + 1}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.custName}>{item.name}</Text>
                <Text style={styles.custAddress}>{item.address}</Text>
              </View>
              <Text style={styles.dueAmount}>₹{item.dueAmount}</Text>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.navBtn}
                onPress={() => openMapsNavigation(item.lat, item.lng)}
              >
                <Text style={styles.navBtnText}>📍 Turn-by-Turn</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.collectBtn}
                onPress={() => navigation.navigate('CollectPaymentScreen', { customer: item })}
              >
                <Text style={styles.collectBtnText}>Collect Payment ➔</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#1e293b',
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  topSub: {
    fontSize: 12,
    color: '#10b981',
  },
  lockBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#1e293b',
  },
  lockBtnText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  targetCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#10b98140',
  },
  targetLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
  },
  targetValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981',
    marginTop: 4,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#10b981',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10b98120',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIndexText: {
    color: '#10b981',
    fontWeight: '800',
    fontSize: 12,
  },
  custName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  custAddress: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  dueAmount: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#1e293b',
    gap: 8,
  },
  navBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    alignItems: 'center',
  },
  navBtnText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
  },
  collectBtn: {
    flex: 1.4,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#10b981',
    alignItems: 'center',
  },
  collectBtnText: {
    color: '#020617',
    fontSize: 12,
    fontWeight: '800',
  },
});
