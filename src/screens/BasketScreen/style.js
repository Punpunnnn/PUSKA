import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  scrollableContent: { flex: 1, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  paymentText: { fontSize: 16, fontWeight: '500', color: 'white' },
  sectionContainer: { marginBottom: 10 },
  paymentOption: { padding: 10, borderRadius: 8, backgroundColor: '#9D9D9D', marginVertical: 4, alignItems: 'center' },
  selectedPayment: { backgroundColor: '#5DA574' },
  toggleButton: { width: 50, height: 28, borderRadius: 14, backgroundColor: '#e0e0e0', padding: 2, justifyContent: 'center'},
  toggleActive: { backgroundColor: '#5DA574' },
  toggleCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'white' },
  toggleCircleActive: { transform: [{ translateX: 22 }] },
  coinInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, fontSize: 16, textAlign: 'center' },
  notesInput: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 12, textAlignVertical: 'top', maxWidth: '100%', height: 100, marginTop: 8 },
  footer: { borderTopWidth: 1, borderTopColor: '#e0e0e0', padding: 16, borderRadius: 8, backgroundColor: '#fff' },
  totalPrice: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  buttonyes: { backgroundColor: '#5DA574', padding: 16, alignItems: 'center', marginBottom: 8, borderRadius: 4 },
  buttonno: { backgroundColor: '#8A1538', padding: 16, alignItems: 'center', borderRadius: 4 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
  