import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AddDeviceModal from '../src/components/AddDeviceModal';
import DeviceList from '../src/components/DeviceList';
import { getMyDevices } from '../src/services/DeviceService';

export default function HomeScreen() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const refreshDashboard = async () => {
    setLoading(true);
    try {
      const myList = await getMyDevices();
      setDevices(myList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshDashboard(); }, []);

  const ButtonPrimary = ({ title, onPress }) => (
    <TouchableOpacity style={styles.primaryButton} onPress={onPress}>
      <MaterialCommunityIcons name="plus-circle-outline" size={24} color="#FFF" />
      <Text style={styles.primaryButtonText}>{title}</Text>
    </TouchableOpacity>
  );

  const FabButton = ({ onPress }) => (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      <MaterialCommunityIcons name="plus" size={28} color="#FFF" />
    </TouchableOpacity>
  );

  if (loading) {
     return (
        <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
     );
  }

  // STATE 1: NEW USER (Empty State)
  if (devices.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.iconCircle}>
             <MaterialCommunityIcons name="water-plus" size={64} color="#007AFF" />
        </View>
        <Text style={styles.title}>Welcome to AquaTech</Text>
        <Text style={styles.subtitle}>To begin, connect your first water sensor.</Text>

        <ButtonPrimary
          title="Connect Device"
          onPress={() => setShowAddModal(true)}
        />

        <AddDeviceModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            refreshDashboard();
          }}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={styles.header}>
        <View>
            <Text style={styles.headerTitle}>Water Quality</Text>
            <Text style={styles.headerSubtitle}>{devices.length} Active Sensors</Text>
        </View>
        <TouchableOpacity onPress={refreshDashboard}>
            <MaterialCommunityIcons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <DeviceList devices={devices} />
      <FabButton onPress={() => setShowAddModal(true)} />

      <AddDeviceModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          refreshDashboard();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 10,
    color: '#64748B',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});