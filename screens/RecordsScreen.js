import firestore from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const RecordsScreen = ({ route, navigation }) => {
  const { deviceId, deviceName } = route.params || {};
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Set header title dynamically
  useEffect(() => {
    if (deviceName) {
      navigation.setOptions({ title: `${deviceName} History` });
    }
  }, [deviceName, navigation]);

  useEffect(() => {
    if (!deviceId) {
        setLoading(false);
        return;
    }

    const unsubscribe = firestore()
      .collection("devices")
      .doc(deviceId)
      .collection("readings")
      .orderBy("timestamp", "desc")
      .limit(50)
      .onSnapshot(
        (snapshot) => {
          const data = snapshot.docs.map((doc) => {
             const d = doc.data();
             return {
                id: doc.id,
                ...d,
                timestamp: d.timestamp ? d.timestamp.toDate() : new Date()
             };
          });
          setRecords(data);
          setLoading(false);
        },
        (error) => {
          console.error("Firestore error:", error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [deviceId]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons name="clock-time-four-outline" size={20} color="#64748B" />
        <Text style={styles.cardTitle}>
          {item.timestamp ? item.timestamp.toLocaleString() : "N/A"}
        </Text>
      </View>

      <View style={styles.dataRow}>
        <View style={styles.dataItem}>
          <MaterialCommunityIcons name="thermometer" size={20} color="#FF6B6B" />
          <Text style={styles.dataLabel}>Temp:</Text>
          <Text style={styles.dataValue}>{item.temp !== undefined ? `${item.temp}°C` : '--'}</Text>
        </View>

        <View style={styles.dataItem}>
          <MaterialCommunityIcons name="flask" size={20} color="#4D96FF" />
          <Text style={styles.dataLabel}>pH:</Text>
          <Text style={styles.dataValue}>{item.ph !== undefined ? item.ph : '--'}</Text>
        </View>
      </View>

      <View style={styles.dataRow}>
        <View style={styles.dataItem}>
          <MaterialCommunityIcons name="water" size={20} color="#00C49A" />
          <Text style={styles.dataLabel}>Turbidity:</Text>
          <Text style={styles.dataValue}>{item.turbidity !== undefined ? `${item.turbidity} NTU` : '--'}</Text>
        </View>

         <View style={styles.dataItem}>
          <MaterialCommunityIcons name="blur" size={20} color="#FFD93D" />
          <Text style={styles.dataLabel}>PPM:</Text>
          <Text style={styles.dataValue}>{item.ppm !== undefined ? item.ppm : '--'}</Text>
        </View>
      </View>
    </View>
  );

  if (!deviceId) {
      return (
        <View style={styles.center}>
            <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#EF4444" />
            <Text style={styles.errorText}>No Device Selected</Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
        </View>
      );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: "#555" }}>Loading records...</Text>
      </View>
    );
  }

  if (records.length === 0) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons name="file-document-outline" size={64} color="#CBD5E1" />
        <Text style={{ marginTop: 15, color: "#6B7280", fontSize: 16 }}>
          No records found for this device.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={records}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFD",
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginLeft: 8,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dataItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dataLabel: {
    fontSize: 14,
    color: "#94A3B8",
    marginLeft: 6,
    marginRight: 4,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFD",
    padding: 20,
  },
  errorText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#1E293B',
      marginTop: 16,
      marginBottom: 24
  },
  button: {
      backgroundColor: '#007AFF',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12
  },
  buttonText: {
      color: '#FFF',
      fontWeight: 'bold'
  }
});

export default RecordsScreen;