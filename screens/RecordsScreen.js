/* trunk-ignore-all(prettier) */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import DateRangeFilter from "../src/components/DateRangeFilter";
import DeviceSettingsModal from "../src/components/DeviceSettingsModal";
import SensorChart from "../src/components/SensorChart";
import { useFilteredSensorData } from "../src/hooks/useFilteredSensorData";

const RecordsScreen = ({ route, navigation }) => {
  const { deviceId, deviceName } = route.params || {};

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  });
  const [endDate, setEndDate] = useState(() => new Date());

  // Enum: 'chart' | 'list' | 'both'
  const [viewMode, setViewMode] = useState("both");
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const {
    data: records,
    loading,
    error,
  } = useFilteredSensorData(deviceId, startDate, endDate);

  // Records for list (newest first)
  const listRecords = useMemo(() => [...records].reverse(), [records]);

  useEffect(() => {
    if (deviceName) {
      navigation.setOptions({
        title: `${deviceName} History`,
        headerRight: () => (
          <TouchableOpacity
            onPress={() => setShowSettingsModal(true)}
            style={{ marginRight: 16 }}
          >
            <MaterialCommunityIcons name="cog" size={24} color="#007AFF" />
          </TouchableOpacity>
        ),
      });
    }
  }, [deviceName, navigation]);

  const handleStartChange = useCallback((date) => {
    setStartDate(date);
  }, []);

  const handleEndChange = useCallback((date) => {
    setEndDate(date);
  }, []);

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
    if (val <= 109) return "#10B981";
    return "#EF4444";
  };

  const MetricItem = ({ label, value, unit, icon, colorFn }) => {
    const color = colorFn(value);
    return (
      <View style={styles.metricItem}>
        <View style={[styles.iconCircle, { backgroundColor: color + "20" }]}>
          <MaterialCommunityIcons name={icon} size={18} color={color} />
        </View>
        <View>
          <Text style={styles.metricLabel}>{label}</Text>
          <Text style={[styles.metricValue, { color: color }]}>
            {value === undefined ? "--" : `${value} ${unit}`}
          </Text>
        </View>
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.timeContainer}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={16}
            color="#64748B"
          />
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

  // ─── Error / Empty States ──────────────────────────────────────────

  if (!deviceId) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={64}
          color="#EF4444"
        />
        <Text style={styles.errorText}>No Device Selected</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── View Mode Toggle ──────────────────────────────────────────────

  const ViewToggle = () => (
    <View style={styles.toggleRow}>
      {[
        { mode: "chart", icon: "chart-areaspline", label: "Chart" },
        { mode: "both", icon: "view-split-horizontal", label: "Both" },
        { mode: "list", icon: "format-list-bulleted", label: "List" },
      ].map((item) => (
        <TouchableOpacity
          key={item.mode}
          style={[
            styles.toggleButton,
            viewMode === item.mode && styles.toggleButtonActive,
          ]}
          onPress={() => setViewMode(item.mode)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={item.icon}
            size={16}
            color={viewMode === item.mode ? "#007AFF" : "#94A3B8"}
          />
          <Text
            style={[
              styles.toggleText,
              viewMode === item.mode && styles.toggleTextActive,
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // ─── Header component for FlatList ─────────────────────────────────

  const ListHeader = () => (
    <View>
      {/* Chart Section */}
      {(viewMode === "chart" || viewMode === "both") && (
        <View style={styles.chartSection}>
          {loading ? (
            <View style={styles.chartLoading}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.chartLoadingText}>Loading chart data...</Text>
            </View>
          ) : (
            <SensorChart data={records} />
          )}
        </View>
      )}

      {/* Section title for the list */}
      {(viewMode === "list" || viewMode === "both") && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Reading History</Text>
          <Text style={styles.sectionSubtitle}>
            {records.length} record{records.length !== 1 ? "s" : ""}
          </Text>
        </View>
      )}
    </View>
  );

  // ─── Main Render ───────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* Date Range Picker */}
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartChange={handleStartChange}
        onEndChange={handleEndChange}
      />

      {/* View Mode Toggle */}
      <ViewToggle />

      {/* Error banner */}
      {error && (
        <View style={styles.errorBanner}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={16}
            color="#EF4444"
          />
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      {/* Content */}
      {loading && records.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 10, color: "#64748B" }}>
            Loading records...
          </Text>
        </View>
      ) : records.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons
            name="file-search-outline"
            size={64}
            color="#CBD5E1"
          />
          <Text style={{ marginTop: 15, color: "#94A3B8", fontSize: 16 }}>
            No records found for this date range.
          </Text>
          <Text style={{ marginTop: 6, color: "#CBD5E1", fontSize: 13 }}>
            Try adjusting the date filter above.
          </Text>
        </View>
      ) : viewMode === "chart" ? (
        // Chart-only mode
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={<ListHeader />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        // List or Both mode
        <FlatList
          data={viewMode === "both" || viewMode === "list" ? listRecords : []}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={<ListHeader />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
      <DeviceSettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        deviceId={deviceId}
        deviceName={deviceName}
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
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // Toggle
  toggleRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: "#E0F2FE",
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94A3B8",
  },
  toggleTextActive: {
    color: "#007AFF",
  },

  // Chart section
  chartSection: {
    marginBottom: 8,
  },
  chartLoading: {
    backgroundColor: "#FFFFFF",
    marginTop: 12,
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  chartLoadingText: {
    marginTop: 8,
    color: "#64748B",
    fontSize: 13,
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 12,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "500",
  },

  // Card
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
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    marginLeft: 6,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  metricItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  metricLabel: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "500",
  },
  metricValue: {
    fontSize: 15,
    fontWeight: "700",
  },

  // Error / Empty
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginTop: 16,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 4,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },

  // Error banner
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
  },
  errorBannerText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
});

export default RecordsScreen;
