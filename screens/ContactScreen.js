import React from "react";
import { View, Text, StyleSheet, Linking, TouchableOpacity, ScrollView } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default function ContactScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.header}>📬 Contact Us</Text>
      <Text style={styles.subtitle}>
        We're here to help! If you have any questions, feedback, or technical concerns, please reach out through the options below.
      </Text>

      {/* Email Section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="email-outline" size={26} color="#007AFF" />
          <Text style={styles.cardTitle}>Email Support</Text>
        </View>
        <Text style={styles.cardText}>
          For inquiries, technical assistance, or feature suggestions, contact us at:
        </Text>
        <TouchableOpacity onPress={() => Linking.openURL("mailto:support@qualiaqua.com")}>
          <Text style={styles.link}>support@qualiaqua.com</Text>
        </TouchableOpacity>
      </View>

      {/* Phone Section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="phone" size={26} color="#34C759" />
          <Text style={styles.cardTitle}>Phone Support</Text>
        </View>
        <Text style={styles.cardText}>
          You can also reach our support team directly by phone:
        </Text>
        <TouchableOpacity onPress={() => Linking.openURL("tel:+639123456789")}>
          <Text style={styles.link}>+63 912 345 6789</Text>
        </TouchableOpacity>
        <Text style={styles.note}>Available Monday to Friday, 9:00 AM – 5:00 PM (PHT)</Text>
      </View>

      {/* Footer Message */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Thank you for using <Text style={{ fontWeight: "600" }}>QualiAqua</Text>!  
          Your feedback helps us improve our mission to make water quality monitoring smarter and more accessible.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFD",
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
    color: "#1E293B",
  },
  cardText: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
    marginBottom: 6,
  },
  link: {
    fontSize: 15,
    color: "#007AFF",
    fontWeight: "500",
    marginTop: 4,
  },
  note: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 3,
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  footerText: {
    textAlign: "center",
    color: "#4B5563",
    fontSize: 14,
    lineHeight: 22,
  },
});
