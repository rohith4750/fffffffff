import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  TextInput,
  Modal,
  Alert,
  Image,
} from 'react-native';

const INITIAL_CUSTOMERS = [
  {
    id: 'CUST-1001',
    name: 'Ramesh Patel',
    mobile: '+91 98201 44521',
    address: 'Shop 14, Main Market, Sector 14, Navi Mumbai',
    distance: '0.4 km',
    loanCode: 'LN-2024-88',
    dueAmount: 1200,
    status: 'DUE_TODAY',
    outstanding: 9600,
    tenure: '20 Weeks (Week 12 of 20)',
    repaid: '₹14,400 of ₹24,000 (60% Paid)',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
    lat: 19.033,
    lng: 73.0297,
  },
  {
    id: 'CUST-1002',
    name: 'Priya Sharma',
    mobile: '+91 98491 23456',
    address: 'Block C, Green Park, Sector 8',
    distance: '1.2 km',
    loanCode: 'LN-2024-89',
    dueAmount: 4500,
    status: 'OVERDUE',
    outstanding: 35000,
    tenure: '6 Months',
    repaid: '₹12,000 of ₹54,000',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
    lat: 19.038,
    lng: 73.032,
  },
  {
    id: 'CUST-1003',
    name: 'Ankit Verma',
    mobile: '+91 97012 34567',
    address: 'Plot 45, General Bazaar',
    distance: '1.8 km',
    loanCode: 'LN-2024-90',
    dueAmount: 850,
    status: 'PAID',
    paidTime: '09:42 AM',
    receiptNo: '#7019',
    outstanding: 10000,
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200',
    lat: 19.041,
    lng: 73.035,
  },
  {
    id: 'CUST-1004',
    name: 'Sunita Devi',
    mobile: '+91 96180 23456',
    address: 'Subhash Nagar Lane 3',
    distance: '2.8 km',
    loanCode: 'LN-2024-91',
    dueAmount: 1500,
    status: 'DUE_TODAY',
    outstanding: 20000,
    tenure: '12 Weeks',
    repaid: '₹6,500 of ₹30,000',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
    lat: 19.045,
    lng: 73.04,
  },
];

export const DailyRouteScreen = ({ navigation }: { navigation: any }) => {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [selectedCust, setSelectedCust] = useState<any | null>(null);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Collection modal state
  const [collectAmount, setCollectAmount] = useState('1200');
  const [payMethod, setPayMethod] = useState<'CASH' | 'UPI'>('CASH');
  const [sendWhatsApp, setSendWhatsApp] = useState(true);

  const openNavigation = (lat: number, lng: number) => {
    Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`);
  };

  const handleOpenCollect = (cust: any) => {
    setSelectedCust(cust);
    setCollectAmount(String(cust.dueAmount));
    setPayMethod('CASH');
    setShowCollectModal(true);
  };

  const handleOpenDetails = (cust: any) => {
    setSelectedCust(cust);
    setShowDetailsModal(true);
  };

  const handleConfirmCollection = () => {
    if (!selectedCust) return;
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === selectedCust.id
          ? {
              ...c,
              status: 'PAID',
              paidTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              receiptNo: `#${Math.floor(1000 + Math.random() * 9000)}`,
            }
          : c
      )
    );
    setShowCollectModal(false);
    Alert.alert(
      'Payment Recorded!',
      `Successfully collected ₹${collectAmount} from ${selectedCust.name}.${
        sendWhatsApp ? '\nWhatsApp receipt sent.' : ''
      }`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View style={styles.profileRow}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' }}
              style={styles.avatar}
            />
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.agentName}>Rajesh Kumar</Text>
                <View style={styles.greenDot} />
              </View>
              <Text style={styles.agentSub}>Field Agent • North Route</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.lockBtn}
            onPress={() => navigation.replace('PinAuthScreen')}
          >
            <Text style={styles.lockBtnText}>🔒</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Target Card */}
        <View style={styles.targetCard}>
          <View style={styles.targetHeaderRow}>
            <View>
              <Text style={styles.targetSmallLabel}>TODAY'S TARGET</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
                <Text style={styles.targetMainAmount}>₹28,500</Text>
                <Text style={styles.targetTotalAmount}>/ ₹45,000</Text>
              </View>
            </View>
            <View style={styles.targetBadge}>
              <Text style={styles.targetBadgeText}>63%</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: '63%' }]} />
          </View>

          {/* Sub stats */}
          <View style={styles.subStatsRow}>
            <View>
              <Text style={styles.subStatLabel}>Collected</Text>
              <Text style={styles.subStatValue}>12</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.subStatLabel}>Pending</Text>
              <Text style={styles.subStatValue}>6</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons: Scan QR & Route Map */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.blueActionBtn}
            onPress={() => Alert.alert('QR Scanner', 'Align borrower passbook QR to scan.')}
          >
            <Text style={styles.blueActionBtnText}>📷 Scan QR to Collect</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.whiteActionBtn}
            onPress={() => Linking.openURL('https://maps.google.com/?q=19.033,73.0297')}
          >
            <Text style={styles.whiteActionBtnText}>🧭 Route Map</Text>
          </TouchableOpacity>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Assigned Queue</Text>
          <Text style={styles.sectionSub}>Nearest first</Text>
        </View>

        {/* Queue Cards */}
        {customers.map((cust) => {
          const isOverdue = cust.status === 'OVERDUE';
          const isPaid = cust.status === 'PAID';

          if (isPaid) {
            return (
              <View key={cust.id} style={styles.paidCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={styles.greenCheckCircle}>
                    <Text style={{ color: '#16a34a', fontWeight: 'bold' }}>✓</Text>
                  </View>
                  <View>
                    <Text style={styles.paidCustName}>{cust.name}</Text>
                    <Text style={styles.paidSub}>
                      Paid {cust.paidTime || '09:42 AM'} • Receipt {cust.receiptNo || '#7019'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.paidAmount}>₹{cust.dueAmount}</Text>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={cust.id}
              activeOpacity={0.8}
              onPress={() => handleOpenDetails(cust)}
              style={[
                styles.custCard,
                isOverdue && { borderLeftColor: '#dc2626', borderLeftWidth: 4 },
              ]}
            >
              <View style={styles.custCardHeader}>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.custName}>{cust.name}</Text>
                    {isOverdue && (
                      <View style={styles.overdueBadge}>
                        <Text style={styles.overdueBadgeText}>OVERDUE</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.custAddress}>
                    {cust.address.split(',')[0]} • {cust.distance}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.dueAmountText,
                    isOverdue && { color: '#dc2626' },
                  ]}
                >
                  ₹{cust.dueAmount.toLocaleString('en-IN')}
                </Text>
              </View>

              {/* Action Buttons Row */}
              <View style={styles.cardBtnRow}>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => Linking.openURL(`tel:${cust.mobile}`)}
                >
                  <Text style={styles.iconBtnText}>📞</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => openNavigation(cust.lat, cust.lng)}
                >
                  <Text style={styles.iconBtnText}>🧭</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.collectBtn,
                    isOverdue && { backgroundColor: '#b91c1c' },
                  ]}
                  onPress={() => handleOpenCollect(cust)}
                >
                  <Text style={styles.collectBtnText}>
                    Collect ₹{cust.dueAmount.toLocaleString('en-IN')}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Cash in Hand Container */}
        <View style={styles.cashInHandCard}>
          <View style={styles.cashInHandHeader}>
            <Text style={styles.cashInHandTitle}>Cash in Hand</Text>
            <Text style={styles.cashInHandSub}>HDFC Branch #12</Text>
          </View>

          <View style={styles.cashGrid}>
            <View style={styles.cashSubBox}>
              <Text style={styles.cashSubLabel}>Physical Cash</Text>
              <Text style={styles.cashSubValue}>₹22,000</Text>
            </View>
            <View style={styles.cashSubBox}>
              <Text style={styles.cashSubLabel}>UPI Payments</Text>
              <Text style={styles.cashSubValue}>₹6,500</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* MODAL: RECORD PAYMENT */}
      <Modal visible={showCollectModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Payment</Text>
              <TouchableOpacity onPress={() => setShowCollectModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedCust && (
              <ScrollView style={{ marginTop: 10 }}>
                <Text style={styles.activeColLabel}>ACTIVE COLLECTION • ID: #{selectedCust.id.slice(-4)}</Text>
                <Text style={styles.modalCustName}>{selectedCust.name}</Text>
                <Text style={styles.modalDueToday}>₹{collectAmount} Due Today</Text>

                {/* Amount Input */}
                <View style={styles.amountInputBox}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold' }}>₹</Text>
                  <TextInput
                    value={collectAmount}
                    onChangeText={setCollectAmount}
                    keyboardType="numeric"
                    style={styles.amountInput}
                  />
                </View>

                {/* Payment Method */}
                <Text style={styles.fieldLabel}>Payment Method</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                  <TouchableOpacity
                    style={[
                      styles.methodBtn,
                      payMethod === 'CASH' && styles.methodBtnActive,
                    ]}
                    onPress={() => setPayMethod('CASH')}
                  >
                    <Text
                      style={[
                        styles.methodBtnText,
                        payMethod === 'CASH' && styles.methodBtnTextActive,
                      ]}
                    >
                      💵 Cash
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.methodBtn,
                      payMethod === 'UPI' && styles.methodBtnActive,
                    ]}
                    onPress={() => setPayMethod('UPI')}
                  >
                    <Text
                      style={[
                        styles.methodBtnText,
                        payMethod === 'UPI' && styles.methodBtnTextActive,
                      ]}
                    >
                      📱 UPI / QR
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* GPS Verified Badge */}
                <View style={styles.gpsBadge}>
                  <Text style={styles.gpsBadgeText}>
                    ✓ GPS Location verified ({selectedCust.address.split(',')[0]})
                  </Text>
                </View>

                {/* WhatsApp Checkbox */}
                <TouchableOpacity
                  style={styles.whatsappRow}
                  onPress={() => setSendWhatsApp(!sendWhatsApp)}
                >
                  <Text style={{ fontSize: 16 }}>{sendWhatsApp ? '☑️' : '⬜'}</Text>
                  <Text style={styles.whatsappText}>Send WhatsApp receipt to {selectedCust.name}</Text>
                </TouchableOpacity>

                {/* Confirm Button */}
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={handleConfirmCollection}
                >
                  <Text style={styles.confirmBtnText}>
                    Confirm ₹{collectAmount} Payment & Send Receipt
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL: CUSTOMER DETAILS */}
      <Modal visible={showDetailsModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Customer Details</Text>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedCust && (
              <ScrollView style={{ marginTop: 10 }}>
                {/* Profile row */}
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  <Image source={{ uri: selectedCust.avatar }} style={styles.detailsAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailsName}>{selectedCust.name}</Text>
                    <Text style={styles.detailsPhone}>{selectedCust.mobile}</Text>
                  </View>
                </View>

                <Text style={styles.detailsAddress}>📍 {selectedCust.address}</Text>

                {/* Financial Overview Card */}
                <View style={styles.finOverviewCard}>
                  <Text style={styles.finOverviewHeader}>Financial Overview • {selectedCust.loanCode}</Text>
                  <Text style={styles.outstandingLabel}>OUTSTANDING BALANCE</Text>
                  <Text style={styles.outstandingValue}>₹{selectedCust.outstanding.toLocaleString('en-IN')}.00</Text>
                  <Text style={styles.repaidText}>{selectedCust.repaid || '60% Repaid'}</Text>
                </View>

                <TouchableOpacity
                  style={styles.blueBigBtn}
                  onPress={() => {
                    setShowDetailsModal(false);
                    handleOpenCollect(selectedCust);
                  }}
                >
                  <Text style={styles.blueBigBtnText}>💵 Collect ₹{selectedCust.dueAmount} Payment</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
  },
  agentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  agentSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  lockBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  lockBtnText: {
    fontSize: 16,
  },
  targetCard: {
    backgroundColor: '#111827',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
  },
  targetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  targetSmallLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  targetMainAmount: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
  },
  targetTotalAmount: {
    color: '#94a3b8',
    fontSize: 14,
  },
  targetBadge: {
    backgroundColor: '#2563eb',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  targetBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#1e293b',
    borderRadius: 4,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 4,
  },
  subStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  subStatLabel: {
    color: '#94a3b8',
    fontSize: 11,
  },
  subStatValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  blueActionBtn: {
    flex: 1,
    backgroundColor: '#1d4ed8',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  blueActionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  whiteActionBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  whiteActionBtnText: {
    color: '#1e293b',
    fontSize: 13,
    fontWeight: 'bold',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748b',
  },
  custCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 10,
  },
  custCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  custName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  overdueBadge: {
    backgroundColor: '#ffe4e6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  overdueBadgeText: {
    color: '#be123c',
    fontSize: 9,
    fontWeight: 'bold',
  },
  custAddress: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 3,
  },
  dueAmountText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  cardBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  iconBtn: {
    backgroundColor: '#eff6ff',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: {
    fontSize: 14,
  },
  collectBtn: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  collectBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  paidCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  greenCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paidCustName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  paidSub: {
    fontSize: 10,
    color: '#94a3b8',
  },
  paidAmount: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#64748b',
  },
  cashInHandCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 20,
    padding: 16,
    marginTop: 10,
  },
  cashInHandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cashInHandTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  cashInHandSub: {
    fontSize: 12,
    color: '#64748b',
  },
  cashGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  cashSubBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
  },
  cashSubLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  cashSubValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  closeBtn: {
    fontSize: 18,
    color: '#64748b',
    padding: 4,
  },
  activeColLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2563eb',
    letterSpacing: 0.5,
  },
  modalCustName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 2,
  },
  modalDueToday: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dc2626',
    marginTop: 2,
  },
  amountInputBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  amountInput: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
    marginTop: 14,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
  },
  methodBtnActive: {
    backgroundColor: '#0f172a',
  },
  methodBtnText: {
    color: '#1e293b',
    fontWeight: 'bold',
    fontSize: 12,
  },
  methodBtnTextActive: {
    color: '#ffffff',
  },
  gpsBadge: {
    backgroundColor: '#eff6ff',
    padding: 10,
    borderRadius: 12,
    marginTop: 14,
  },
  gpsBadgeText: {
    color: '#1e40af',
    fontSize: 11,
    fontWeight: '600',
  },
  whatsappRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  whatsappText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  confirmBtn: {
    backgroundColor: '#0f172a',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 20,
  },
  confirmBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  detailsAvatar: {
    width: 50,
    height: 50,
    borderRadius: 16,
  },
  detailsName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  detailsPhone: {
    fontSize: 12,
    color: '#64748b',
  },
  detailsAddress: {
    fontSize: 12,
    color: '#334155',
    marginTop: 10,
  },
  finOverviewCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
  },
  finOverviewHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  outstandingLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: 'bold',
    marginTop: 8,
  },
  outstandingValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 2,
  },
  repaidText: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '600',
    marginTop: 4,
  },
  blueBigBtn: {
    backgroundColor: '#1d4ed8',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  blueBigBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
