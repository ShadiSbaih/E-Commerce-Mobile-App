import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useCart } from '@/Context/CartContext';
import { Address } from '@/constants/types';
import { COLORS } from '@/constants';
import Header from '@/components/Header';
import api from '@/constants/api';
import { colors, radius, spacing, typography } from '@/theme';

export default function Checkout() {
  const { clearCart } = useCart();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash'>('cash');
  const [breakdown, setBreakdown] = useState({
    subtotal: 0,
    shippingCost: 5,
    tax: 0,
    totalAmount: 0,
  });

  const fetchAddresses = async () => {
    try {
      const { data } = await api.get('/addresses');
      const addresses: Address[] = data.data;
      if (addresses.length) {
        setSelectedAddress(addresses.find((address) => address.isDefault) || addresses[0]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load addresses',
        text2: 'Please try again later.',
      });
    } finally {
      setPageLoading(false);
    }
  };

  const fetchPreview = async () => {
    try {
      const { data } = await api.get('/orders/preview');
      if (data.success) setBreakdown(data.data);
    } catch {
      // Keep the summary available while the cart preview is unavailable.
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Toast.show({
        type: 'info',
        text1: 'No address selected',
        text2: 'Please select a shipping address before placing your order.',
      });
      return;
    }

    if (paymentMethod === 'stripe') {
      Toast.show({
        type: 'info',
        text1: 'Coming soon',
        text2: 'Card payment is not yet available. Please use Cash on Delivery.',
      });
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        shippingAddress: {
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
          country: selectedAddress.country,
        },
        notes: 'Placed via App',
        paymentMethod: 'cash',
      });

      if (data.success) {
        await clearCart();
        Toast.show({
          type: 'success',
          text1: 'Order placed',
          text2: 'Your order has been placed successfully.',
        });
        router.replace('/orders');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to place order',
        text2: 'Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
    fetchPreview();
  }, []);

  if (pageLoading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Checkout" showBack />

      <View style={styles.page}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Shipping Address</Text>

          {selectedAddress ? (
            <View style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <Text style={styles.addressType}>{selectedAddress.type}</Text>
                <TouchableOpacity onPress={() => router.push('/addresses')}>
                  <Text style={styles.changeText}>Change</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.addressText}>
                {selectedAddress.street}{'\n'}
                {selectedAddress.city}{'\n'}
                {selectedAddress.state} - {selectedAddress.zipCode}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => router.push('/addresses')}
              style={styles.addAddress}
            >
              <Text style={styles.addressType}>Add Shipping Address</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.sectionTitle}>Payment Method</Text>

          <PaymentOption
            selected={paymentMethod === 'cash'}
            title="Cash on Delivery"
            subtitle="Pay when you receive the order"
            icon="cash-outline"
            onPress={() => setPaymentMethod('cash')}
          />
          <PaymentOption
            selected={paymentMethod === 'stripe'}
            title="Pay with Card"
            subtitle="Credit or Debit Card"
            icon="card-outline"
            onPress={() => setPaymentMethod('stripe')}
          />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: spacing.md + insets.bottom }]}>
          <View style={styles.footerTotalRow}>
            <Text style={styles.footerLabel}>Total</Text>
            <Text style={styles.footerTotal}>$ {breakdown.totalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.footerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View order breakdown"
              onPress={() => setSummaryOpen(true)}
              style={styles.breakdownButton}
            >
              <Text style={styles.breakdownButtonText}>View breakdown</Text>
            </Pressable>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Place order"
              onPress={handlePlaceOrder}
              style={styles.placeOrderButton}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.placeOrderText}>Place Order</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal
        visible={summaryOpen}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setSummaryOpen(false)}
      >
        <View style={styles.modal}>
          <Pressable style={styles.modalBackdrop} onPress={() => setSummaryOpen(false)} />
          <View style={[styles.summarySheet, { paddingBottom: spacing.lg + insets.bottom }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.summaryHeader}>
              <View>
                <Text style={styles.summaryTitle}>Order Summary</Text>
                <Text style={styles.summarySubtitle}>A clear view of your final total.</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close order summary"
                hitSlop={10}
                onPress={() => setSummaryOpen(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>

            <SummaryRow label="Subtotal" value={breakdown.subtotal} />
            <SummaryRow label="Shipping" value={breakdown.shippingCost} />
            <SummaryRow label="Tax (10%)" value={breakdown.tax} />
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>$ {breakdown.totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function PaymentOption({
  selected,
  title,
  subtitle,
  icon,
  onPress,
}: {
  selected: boolean;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.paymentCard, selected && styles.paymentCardSelected]}
    >
      <View style={styles.paymentCopy}>
        <View style={styles.paymentIcon}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <View style={styles.paymentText}>
          <Text style={styles.paymentTitle}>{title}</Text>
          <Text style={styles.paymentSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </TouchableOpacity>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryRowLabel}>{label}</Text>
      <Text style={styles.summaryRowValue}>$ {value.toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  page: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.lg },
  sectionTitle: { color: colors.textPrimary, ...typography.h3, marginBottom: spacing.md },
  addressCard: { padding: spacing.lg, marginBottom: spacing.xl, backgroundColor: colors.surface, borderRadius: radius.lg },
  addressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  addressType: { color: colors.textPrimary, ...typography.bodySmall, fontWeight: '700' },
  changeText: { color: colors.nimbus500, ...typography.caption, fontWeight: '700' },
  addressText: { color: colors.textSecondary, ...typography.bodySmall, lineHeight: 20 },
  addAddress: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl, marginBottom: spacing.xl, backgroundColor: colors.surface, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.borderStrong, borderRadius: radius.lg },
  paymentCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, marginBottom: spacing.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg },
  paymentCardSelected: { borderColor: colors.primary, backgroundColor: colors.nimbus100 },
  paymentCopy: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  paymentIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceMuted },
  paymentText: { flex: 1, minWidth: 0 },
  paymentTitle: { color: colors.textPrimary, ...typography.bodySmall, fontWeight: '700' },
  paymentSubtitle: { color: colors.textSecondary, ...typography.caption, marginTop: spacing.xs },
  radio: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.full },
  radioSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  radioDot: { width: 8, height: 8, borderRadius: radius.full, backgroundColor: colors.white },
  footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, backgroundColor: colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  footerTotalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  footerLabel: { color: colors.textSecondary, ...typography.bodySmall },
  footerTotal: { color: colors.textPrimary, ...typography.h3 },
  footerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  breakdownButton: { minHeight: 48, paddingHorizontal: spacing.md, alignItems: 'center', justifyContent: 'center' },
  breakdownButtonText: { color: colors.textSecondary, ...typography.caption, fontWeight: '700' },
  placeOrderButton: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.primary },
  placeOrderText: { color: colors.white, ...typography.bodySmall, fontWeight: '700' },
  modal: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.42)' },
  summarySheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  sheetHandle: { alignSelf: 'center', width: 44, height: 4, marginBottom: spacing.lg, borderRadius: radius.full, backgroundColor: colors.borderStrong },
  summaryHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.xl },
  summaryTitle: { color: colors.textPrimary, ...typography.h3 },
  summarySubtitle: { color: colors.textMuted, ...typography.caption, marginTop: spacing.xs },
  closeButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, backgroundColor: colors.surfaceSoft },
  closeText: { color: colors.textPrimary, fontSize: 24, lineHeight: 26, fontWeight: '300' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  summaryRowLabel: { color: colors.textSecondary, ...typography.bodySmall },
  summaryRowValue: { color: colors.textPrimary, ...typography.bodySmall, fontWeight: '700' },
  summaryDivider: { height: StyleSheet.hairlineWidth, marginVertical: spacing.sm, backgroundColor: colors.border },
  summaryTotalLabel: { color: colors.textPrimary, ...typography.h3 },
  summaryTotalValue: { color: colors.textPrimary, ...typography.h3 },
});
