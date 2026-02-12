import { useNavigation } from '@react-navigation/native';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSensorData } from '../hooks/useSensorData';

const DeviceCard = ({ device }) => {
  const { data } = useSensorData(device.id);
  const navigation = useNavigation();
  const latest = data && data.length > 0 ? data[data.length - 1] : null;

  const getValue = (val, suffix = '') => (val !== undefined && val !== null ? `${val}${suffix}` : '--');

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Records', {
        deviceId: device.id,
        deviceName: device.device_name
      })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="water-pump" size={24} color="#007AFF" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.deviceName}>{device.device_name || "Unknown Device"}</Text>
          <Text style={styles.deviceId}>ID: {device.id}</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: latest ? '#10B981' : '#CBD5E1' }]} />
        <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E1" />
      </View>

      <View style={styles.readingsRow}>
        <ReadingItem label="pH Level" value={getValue(latest?.ph)} icon="flask" color="#4D96FF" />
        <ReadingItem label="Turbidity" value={getValue(latest?.turbidity, ' NTU')} icon="water" color="#00C49A" />
      </View>

      <Text style={styles.timestamp}>
         {latest ? `Last updated: ${latest.timestamp.toLocaleTimeString()}` : 'Waiting for data...'}
      </Text>
    </TouchableOpacity>
  );
};

const ReadingItem = ({ label, value, icon, color }) => (
  <View style={styles.readingItem}>
    <MaterialCommunityIcons name={icon} size={20} color={color} style={{ marginBottom: 4 }} />
    <Text style={styles.readingLabel}>{label}</Text>
    <Text style={[styles.readingValue, { color }]}>{value}</Text>
  </View>
);

const DeviceList = ({ devices }) => {
  if (!devices || devices.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No devices found.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={devices}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <DeviceCard device={item} />}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94A3B8',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  deviceId: {
    fontSize: 12,
    color: '#94A3B8',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  readingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },
  readingItem: {
    alignItems: 'center',
    flex: 1,
  },
  readingLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  readingValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'right',
  },
});

export default DeviceList;
