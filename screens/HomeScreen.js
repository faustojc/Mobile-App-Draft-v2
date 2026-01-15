import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import notifee, { AndroidImportance } from '@notifee/react-native';

const HomeScreen = () => {
  const [latestData, setLatestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const isFirstLoad = useRef(true); // Track first load to avoid notification on app open

  // Function to show notification
  const showSensorNotification = async (data) => {
    try {
      await notifee.displayNotification({
        title: '🌊 New Water Quality Reading',
        body: `Temp: ${data.temp}°C | pH: ${data.pH} | PPM: ${data.ppm}`,
        android: {
          channelId: 'sensor_readings',
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
            launchActivity: 'default',
          },
          sound: 'default',
          vibrationPattern: [300, 500],
          smallIcon: 'ic_launcher',
          color: '#007AFF',
        },
      });
      console.log('✅ Notification displayed');
    } catch (error) {
      console.error('❌ Error showing notification:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = firestore()
      .collection("params")
      .orderBy("created_at", "desc")
      .limit(1)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.empty) {
            const newData = snapshot.docs[0].data();
            
            // Only show notification if it's NOT the first load
            if (!isFirstLoad.current && latestData) {
              // Check if data actually changed
              const hasChanged = 
                newData.temp !== latestData.temp ||
                newData.pH !== latestData.pH ||
                newData.ppm !== latestData.ppm ||
                newData.millisiemenspermeter !== latestData.millisiemenspermeter;
              
              if (hasChanged) {
                console.log('🆕 New sensor reading detected!');
                showSensorNotification(newData);
              }
            }
            
            setLatestData(newData);
            
            // Mark first load as complete
            if (isFirstLoad.current) {
              isFirstLoad.current = false;
            }
          }
          setLoading(false);
        },
        (error) => {
          console.error("❌ Firestore error:", error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [latestData]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  if (!latestData) {
    return (
      <View style={styles.center}>
        <Icon name="water-off" size={64} color="#CBD5E1" />
        <Text style={styles.noDataText}>No recent sensor data available.</Text>
      </View>
    );
  }

  const SensorCard = ({ iconName, label, value, unit, color }) => (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Icon name={iconName} size={40} color={color} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueContainer}>
          <Text style={[styles.value, { color: color }]}>{value}</Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
      </View>
      <View style={[styles.cardAccent, { backgroundColor: color }]} />
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Icon name="waves" size={32} color="#007AFF" />
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Water Quality</Text>
            <Text style={styles.subtitle}>Real-time Monitoring</Text>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Live</Text>
        </View>
      </View>

      {/* Sensor Cards Grid */}
      <View style={styles.cardsGrid}>
        <SensorCard
          iconName="thermometer"
          label="Temperature"
          value={latestData.temp}
          unit="°C"
          color="#FF6B6B"
        />
        
        <SensorCard
          iconName="flask"
          label="pH Level"
          value={latestData.pH}
          unit=""
          color="#4D96FF"
        />
        
        <SensorCard
          iconName="flash"
          label="Conductivity"
          value={latestData.millisiemenspermeter}
          unit="mS/m"
          color="#FFD93D"
        />
        
        <SensorCard
          iconName="water"
          label="PPM"
          value={latestData.ppm}
          unit=""
          color="#00C49A"
        />
      </View>

      {/* Timestamp Footer */}
      <View style={styles.footer}>
        <Icon name="clock-outline" size={16} color="#94A3B8" />
        <Text style={styles.timestamp}>
          Last updated: {latestData.created_at 
            ? new Date(latestData.created_at._seconds * 1000).toLocaleString()
            : "N/A"}
        </Text>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 16,
    fontWeight: "500",
  },
  noDataText: {
    marginTop: 16,
    color: "#64748B",
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#059669",
  },
  cardsGrid: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    position: "relative",
    overflow: "hidden",
  },
  cardAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconContainer: {
    width: 68,
    height: 68,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  value: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -1,
  },
  unit: {
    fontSize: 18,
    fontWeight: "600",
    color: "#94A3B8",
    marginLeft: 6,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    paddingHorizontal: 20,
  },
  timestamp: {
    marginLeft: 8,
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "500",
  },
  bottomSpacer: {
    height: 32,
  },
});

export default HomeScreen;