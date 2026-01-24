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

  const getTempColor = (val) => {
      if (val === undefined || val === null) return "#94A3B8";
      if (val < 25) return "#10B981";
      if (val <= 35) return "#F59E0B";
      return "#EF4444";
  };

  const getPhColor = (val) => {
      if (val === undefined || val === null) return "#94A3B8";
      if (val >= 6.5 && val <= 8.5) return "#10B981";
      return "#EF4444";
  };

  const getTdsColor = (val) => {
      if (val === undefined || val === null) return "#94A3B8";
      if (val <= 600) return "#10B981";
      return "#EF4444";
  };

  const getEcColor = (val) => {
      if (val === undefined || val === null) return "#94A3B8";
      if (val <= 109) return "#10B981"; // Good
      return "#EF4444";
  };

  const MetricItem = ({ label, value, unit, icon, colorFn }) => {
      const color = colorFn(value);
      return (
          <View style={styles.metricItem}>
             <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
                <MaterialCommunityIcons name={icon} size={18} color={color} />
             </View>
             <View>
                 <Text style={styles.metricLabel}>{label}</Text>
                 <Text style={[styles.metricValue, { color: color }]}>
                    {value === undefined ? '--' : `${value} ${unit}`}
                 </Text>
             </View>
          </View>
      );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.timeContainer}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#64748B" />
            <Text style={styles.cardTitle}>
            {item.timestamp ? item.timestamp.toLocaleString() : "N/A"}
            </Text>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        <MetricItem
            label="Temp"
            value={item.temp}
            unit="°C"
            icon="thermometer"
            colorFn={getTempColor}
        />
        <MetricItem
            label="pH"
            value={item.ph}
            unit=""
            icon="flask"
            colorFn={getPhColor}
        />
        <MetricItem
            label="TDS"
            value={item.ppm}
            unit="ppm"
            icon="blur"
            colorFn={getTdsColor}
        />
        <MetricItem
            label="Cond."
            value={item.millisiemenspermeter}
            unit="mS/m"
            icon="flash"
            colorFn={getEcColor}
        />
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
        <Text style={{ marginTop: 10, color: "#64748B" }}>Loading records...</Text>
      </View>
    );
  }

  if (records.length === 0) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons name="file-search-outline" size={64} color="#CBD5E1" />
        <Text style={{ marginTop: 15, color: "#94A3B8", fontSize: 16 }}>
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
    backgroundColor: "#F1F5F9",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  timeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    marginLeft: 6,
  },
  metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -8,
  },
  metricItem: {
      width: '50%',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      marginBottom: 16,
  },
  iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
  },
  metricLabel: {
      fontSize: 12,
      color: "#94A3B8",
      fontWeight: '500',
  },
  metricValue: {
      fontSize: 15,
      fontWeight: "700",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
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
      borderRadius: 12,
      elevation: 4,
  },
  buttonText: {
      color: '#FFF',
      fontWeight: 'bold',
      fontSize: 16
  }
});

export default RecordsScreen;