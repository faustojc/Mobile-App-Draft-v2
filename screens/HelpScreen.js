import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";


export default function HelpScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.header}>📘 Help & User Guide</Text>
      <Text style={styles.subtitle}>
        Welcome! This app helps you monitor real-time water quality parameters and stay updated with notifications for new readings.
      </Text>

      {/* 🔹 Section 1: Dashboard */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="view-dashboard" size={26} color="#007AFF" />
          <Text style={styles.cardTitle}>Home Dashboard</Text>
        </View>
        <Text style={styles.cardText}>
          The **Home** screen displays your live readings. The values automatically refresh whenever a new reading is available.
        </Text>
        <Text style={styles.listItem}>• 💧 pH Level — Indicates acidity or alkalinity of water.</Text>
        <Text style={styles.listItem}>• ⚡ EC (Electrical Conductivity) — Shows how conductive the water is.</Text>
        <Text style={styles.listItem}>• 🌡 Temperature — Displays the water temperature.</Text>
        <Text style={styles.listItem}>• 🧪 PPM — Shows nutrient strength in parts per million.</Text>
      </View>

      {/* 🔹 Section 2: Records */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="database" size={26} color="#00C49A" />
          <Text style={styles.cardTitle}>Records</Text>
        </View>
        <Text style={styles.cardText}>
          The **Records** screen allows you to view previously saved readings. You can scroll through them to check how water quality changes over time.
        </Text>
        <Text style={styles.listItem}>• Readings are organized from newest to oldest.</Text>
        <Text style={styles.listItem}>• Use this section to analyze past measurements.</Text>
      </View>

      {/* 🔹 Section 3: Notifications */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="bell-ring" size={26} color="#FF6B6B" />
          <Text style={styles.cardTitle}>Notifications</Text>
        </View>
        <Text style={styles.cardText}>
          The app sends you notifications whenever a new reading is received or if an important update occurs.
        </Text>
        <Text style={styles.listItem}>• Notifications appear even when the app is closed.</Text>
        <Text style={styles.listItem}>• Make sure notification permissions are enabled in your phone’s settings.</Text>
        <Text style={styles.listItem}>• Tap the notification to open the app and view the latest readings.</Text>
      </View>

      {/* 🔹 Section 4: Troubleshooting */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="wrench" size={26} color="#FFA500" />
          <Text style={styles.cardTitle}>Troubleshooting</Text>
        </View>
        <Text style={styles.cardText}>If something doesn’t work as expected, try the following steps:</Text>
        <Text style={styles.listItem}>• 🔄 Restart the app.</Text>
        <Text style={styles.listItem}>• 📶 Ensure you have an active internet connection.</Text>
        <Text style={styles.listItem}>• 🔔 Check if notifications are enabled.</Text>
        <Text style={styles.listItem}>• ⚙️ Update the app to the latest version if available.</Text>
      </View>

      {/* 🔹 Section 5: Contact Info */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="account-group" size={26} color="#4B5563" />
          <Text style={styles.cardTitle}>Need More Help?</Text>
        </View>
        <Text style={styles.cardText}>
          For any assistance, feedback, or inquiries, please reach out to your support team or system administrator.
        </Text>
        <Text style={styles.contact}>📧 support@thesis-waterapp.com</Text>
      </View>

      <Text style={styles.footerText}>Version 1.0.0 — © 2025 Water Monitoring App</Text>
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
  listItem: {
    fontSize: 14,
    color: "#475569",
    marginLeft: 8,
    marginVertical: 2,
  },
  contact: {
    fontSize: 15,
    color: "#007AFF",
    fontWeight: "500",
    marginTop: 6,
  },
  footerText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 10,
  },
});
