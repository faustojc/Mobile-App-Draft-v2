import auth from "@react-native-firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { getDeviceMembers, removeMember } from "../services/DeviceService";

const DeviceSettingsModal = ({ visible, onClose, deviceId, deviceName }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth().currentUser;

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const list = await getDeviceMembers(deviceId);
        setMembers(list);
      } catch (error) {
        Alert.alert("Error", "Failed to load members.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (visible && deviceId) {
      fetchMembers();
    }
  }, [visible, deviceId]);

  const handleKick = (memberUid, email) => {
    Alert.alert(
      "Remove User",
      `Are you sure you want to remove ${email} from this device?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeMember(deviceId, memberUid);
              setMembers((prev) => prev.filter((m) => m.uid !== memberUid));
              Alert.alert("Success", "User removed.");
            } catch (e) {
              Alert.alert("Error", e.message);
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }) => {
    const isOwner = item.role === "owner";
    const isMe = item.uid === currentUser?.uid;

    const myRole = members.find((m) => m.uid === currentUser?.uid)?.role;
    const iAmOwner = myRole === "owner";

    return (
      <View style={styles.memberItem}>
        <View style={styles.memberInfo}>
          <View
            style={[
              styles.avatar,
              isOwner ? styles.avatarOwner : styles.avatarMember,
            ]}
          >
            <MaterialCommunityIcons
              name={isOwner ? "crown" : "account"}
              size={20}
              color="#FFF"
            />
          </View>
          <View>
            <Text style={styles.memberEmail}>{item.email}</Text>
            <Text style={styles.memberRole}>{isMe ? "You" : item.role}</Text>
          </View>
        </View>

        {iAmOwner && !isOwner && !isMe && (
          <TouchableOpacity
            onPress={() => handleKick(item.uid, item.email)}
            style={styles.kickButton}
          >
            <Text style={styles.kickButtonText}>Remove</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Manage Access</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>Device: {deviceName}</Text>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#007AFF"
              style={{ marginVertical: 20 }}
            />
          ) : (
            <>
              <Text style={styles.sectionHeader}>
                Members ({members.length})
              </Text>
              <FlatList
                data={members}
                keyExtractor={(item) => item.uid}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No members found.</Text>
                }
              />
            </>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 20,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarOwner: {
    backgroundColor: "#F59E0B",
  },
  avatarMember: {
    backgroundColor: "#3B82F6",
  },
  memberEmail: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1E293B",
  },
  memberRole: {
    fontSize: 12,
    color: "#94A3B8",
    textTransform: "capitalize",
  },
  kickButton: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  kickButtonText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "600",
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#F1F5F9",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#94A3B8",
    marginVertical: 20,
  },
});

export default DeviceSettingsModal;
