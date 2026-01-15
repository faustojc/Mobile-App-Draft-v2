import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const RecordsScreen = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Order by created_at instead of __name__ to avoid index requirement
    const unsubscribe = firestore()
      .collection("params")
      .orderBy("created_at", "desc")
      .limit(50) // Get last 50 records
      .onSnapshot(
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setRecords(data);
          setLoading(false);
        },
        (error) => {
          console.error("❌ Firestore error:", error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  // ✅ Format timestamp helper function
  const formatTimestamp = (timestamp) => {
    if (!timestamp || !timestamp._seconds) return "N/A";
    const date = new Date(timestamp._seconds * 1000);
    return date.toLocaleString();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons name="clipboard-text" size={24} color="#007AFF" />
        <Text style={styles.cardTitle}>
          {formatTimestamp(item.created_at)}
        </Text>
      </View>

      <View style={styles.dataRow}>
        <View style={styles.dataItem}>
          <MaterialCommunityIcons name="thermometer" size={20} color="#FF6B6B" />
          <Text style={styles.dataLabel}>Temp:</Text>
          <Text style={styles.dataValue}>{item.temp}°C</Text>
        </View>

        <View style={styles.dataItem}>
          <MaterialCommunityIcons name="cup-water" size={20} color="#4D96FF" />
          <Text style={styles.dataLabel}>pH:</Text>
          <Text style={styles.dataValue}>{item.pH}</Text>
        </View>
      </View>

      <View style={styles.dataRow}>
        <View style={styles.dataItem}>
          <MaterialCommunityIcons name="flash" size={20} color="#FFD93D" />
          <Text style={styles.dataLabel}>EC:</Text>
          <Text style={styles.dataValue}>{item.millisiemenspermeter} mS/m</Text>
        </View>

        <View style={styles.dataItem}>
          <MaterialCommunityIcons name="water" size={20} color="#00C49A" />
          <Text style={styles.dataLabel}>PPM:</Text>
          <Text style={styles.dataValue}>{item.ppm}</Text>
        </View>
      </View>
    </View>
  );

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
          No records available
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Historical Records</Text>
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#1E293B",
    textAlign: "center",
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
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
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginLeft: 8,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dataItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dataLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 6,
    marginRight: 4,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFD",
  },
});

export default RecordsScreen;