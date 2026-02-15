import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {
  getIncomingRequests,
  respondToRequest,
} from "../src/services/DeviceService";

export default function NotificationsScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async () => {
    try {
      const data = await getIncomingRequests();
      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleResponse = async (requestId, status, deviceId, requesterUid) => {
    try {
      await respondToRequest(requestId, status, deviceId, requesterUid);
      Alert.alert("Success", `Request ${status}.`);
      fetchRequests();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="account-clock"
            size={24}
            color="#007AFF"
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Access Request</Text>
          <Text style={styles.subtitle}>
            <Text style={{ fontWeight: "bold" }}>{item.requesterEmail}</Text>{" "}
            wants to monitor device{" "}
            <Text style={{ fontWeight: "bold" }}>{item.deviceId}</Text>
          </Text>
          <Text style={styles.timestamp}>
            {item.timestamp?.toDate
              ? item.timestamp.toDate().toLocaleDateString()
              : "Just now"}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, styles.btnReject]}
          onPress={() =>
            handleResponse(
              item.id,
              "rejected",
              item.deviceId,
              item.requesterUid,
            )
          }
        >
          <Text style={[styles.btnText, { color: "#EF4444" }]}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnAccept]}
          onPress={() =>
            handleResponse(
              item.id,
              "accepted",
              item.deviceId,
              item.requesterUid,
            )
          }
        >
          <Text style={[styles.btnText, { color: "#10B981" }]}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchRequests();
              }}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons
                name="bell-off-outline"
                size={48}
                color="#CBD5E1"
              />
              <Text style={styles.emptyText}>No pending requests</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  list: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    marginTop: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 12,
    color: "#94A3B8",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardContent: {
    flexDirection: "row",
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnReject: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  btnAccept: {
    borderColor: "#6EE7B7",
    backgroundColor: "#ECFDF5",
  },
  btnText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
