import { useCallback, useMemo, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CHART_WIDTH = SCREEN_WIDTH - 72;

const METRICS = [
  {
    key: "temp",
    label: "Temperature",
    unit: "°C",
    color: "#F59E0B",
    icon: "thermometer",
    field: "temp",
  },
  {
    key: "ph",
    label: "pH Level",
    unit: "",
    color: "#8B5CF6",
    icon: "flask",
    field: "ph",
  },
  {
    key: "tds",
    label: "TDS",
    unit: "ppm",
    color: "#10B981",
    icon: "blur",
    field: "ppm",
  },
  {
    key: "ec",
    label: "Conductivity",
    unit: "mS/m",
    color: "#3B82F6",
    icon: "flash",
    field: "millisiemenspermeter",
  },
];

const formatXLabel = (date, index, total) => {
  if (!date) return "";
  const hours = date.getHours().toString().padStart(2, "0");
  const mins = date.getMinutes().toString().padStart(2, "0");

  // Show only for every Nth point to avoid label clutter
  if (total > 20 && index % Math.ceil(total / 10) !== 0) return "";

  return `${hours}:${mins}`;
};

/**
 *
 * Displays one metric at a time with tabs to switch between them.
 *
 * @param {Object}  props
 * @param {Array}   props.data - Array of reading objects with timestamp, temp, ph, ppm, millisiemenspermeter
 */
const SensorChart = ({ data }) => {
  const [activeMetric, setActiveMetric] = useState(0);

  const metric = METRICS[activeMetric];

  // Transform raw data into chart-compatible format for the active metric
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((reading, index) => {
      const value = reading[metric.field];
      return {
        value: value !== undefined && value !== null ? Number(value) : 0,
        label: formatXLabel(reading.timestamp, index, data.length),
        dataPointText:
          value !== undefined && value !== null ? String(value) : "",
        labelTextStyle: { color: "#94A3B8", fontSize: 9 },
      };
    });
  }, [data, metric.field]);

  // Calculate statistics for the active metric
  const stats = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return { min: 0, max: 0, avg: 0, latest: 0 };
    }

    const values = chartData.map((d) => d.value).filter((v) => v !== 0);
    if (values.length === 0) return { min: 0, max: 0, avg: 0, latest: 0 };

    const min = Math.min(...values);
    const max = Math.max(...values);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const latest = values[values.length - 1];

    return {
      min: min.toFixed(1),
      max: max.toFixed(1),
      avg: avg.toFixed(1),
      latest: latest.toFixed(1),
    };
  }, [chartData]);

  // Dynamically calculate Y-axis range for better visualization
  const yAxisConfig = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return { maxValue: 100, noOfSections: 5, stepValue: 20 };
    }

    const values = chartData.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Add 10% padding above and below
    const range = max - min || 1;
    const padding = range * 0.1;
    const adjustedMax = Math.ceil(max + padding);
    const noOfSections = 5;
    const stepValue = Math.max(1, Math.ceil(adjustedMax / noOfSections));
    const maxValue = stepValue * noOfSections;

    return { maxValue, noOfSections, stepValue };
  }, [chartData]);

  const handleMetricPress = useCallback((index) => {
    setActiveMetric(index);
  }, []);

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="chart-line" size={48} color="#CBD5E1" />
        <Text style={styles.emptyText}>
          No data available for the selected range
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Metric Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {METRICS.map((m, index) => (
          <TouchableOpacity
            key={m.key}
            style={[
              styles.tab,
              activeMetric === index && {
                backgroundColor: m.color + "15",
                borderColor: m.color,
              },
            ]}
            onPress={() => handleMetricPress(index)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={m.icon}
              size={16}
              color={activeMetric === index ? m.color : "#94A3B8"}
            />
            <Text
              style={[
                styles.tabText,
                activeMetric === index && { color: m.color },
              ]}
            >
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatBadge
          label="Latest"
          value={stats.latest}
          unit={metric.unit}
          color={metric.color}
        />
        <StatBadge
          label="Avg"
          value={stats.avg}
          unit={metric.unit}
          color="#64748B"
        />
        <StatBadge
          label="Min"
          value={stats.min}
          unit={metric.unit}
          color="#10B981"
        />
        <StatBadge
          label="Max"
          value={stats.max}
          unit={metric.unit}
          color="#EF4444"
        />
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        <LineChart
          data={chartData}
          width={CHART_WIDTH}
          height={200}
          color={metric.color}
          thickness={2.5}
          dataPointsColor={metric.color}
          dataPointsRadius={3}
          maxValue={yAxisConfig.maxValue}
          noOfSections={yAxisConfig.noOfSections}
          stepValue={yAxisConfig.stepValue}
          yAxisTextStyle={styles.yAxisText}
          xAxisLabelTextStyle={styles.xAxisText}
          xAxisColor="#E2E8F0"
          yAxisColor="#E2E8F0"
          yAxisTextNumberOfLines={1}
          rulesColor="#F1F5F9"
          rulesType="solid"
          curved
          animateOnDataChange
          animationDuration={300}
          startFillColor={metric.color + "20"}
          endFillColor={metric.color + "05"}
          areaChart
          startOpacity={0.3}
          endOpacity={0.05}
          isAnimated
          hideDataPoints={chartData.length > 30}
          spacing={
            chartData.length > 1
              ? Math.max(30, CHART_WIDTH / chartData.length)
              : 60
          }
          scrollToEnd
          showScrollIndicator={false}
          pointerConfig={{
            pointerStripHeight: 200,
            pointerStripColor: metric.color + "30",
            pointerStripWidth: 2,
            pointerColor: metric.color,
            radius: 6,
            pointerLabelWidth: 120,
            pointerLabelHeight: 50,
            activatePointersOnLongPress: false,
            autoAdjustPointerLabelPosition: true,
            pointerLabelComponent: (items) => {
              const item = items[0];
              return (
                <View style={[styles.tooltip, { borderColor: metric.color }]}>
                  <Text style={[styles.tooltipValue, { color: metric.color }]}>
                    {item.value} {metric.unit}
                  </Text>
                </View>
              );
            },
          }}
        />
      </View>

      {/* Data point count */}
      <Text style={styles.dataPointCount}>
        {chartData.length} reading{chartData.length !== 1 ? "s" : ""}
      </Text>
    </View>
  );
};

/**
 * Small stat badge used in the stats row above the chart.
 */
const StatBadge = ({ label, value, unit, color }) => (
  <View style={styles.statBadge}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color }]}>
      {value}
      <Text style={styles.statUnit}> {unit}</Text>
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  emptyContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  emptyText: {
    marginTop: 12,
    color: "#94A3B8",
    fontSize: 14,
    textAlign: "center",
  },

  // Tabs
  tabsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94A3B8",
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },
  statBadge: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },
  statUnit: {
    fontSize: 10,
    fontWeight: "500",
    color: "#94A3B8",
  },

  // Chart
  chartWrapper: {
    marginLeft: -8,
    overflow: "hidden",
  },
  yAxisText: {
    color: "#94A3B8",
    fontSize: 10,
  },
  xAxisText: {
    color: "#94A3B8",
    fontSize: 9,
  },

  // Tooltip
  tooltip: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tooltipValue: {
    fontSize: 13,
    fontWeight: "700",
  },

  // Footer
  dataPointCount: {
    textAlign: "center",
    color: "#CBD5E1",
    fontSize: 12,
    marginTop: 8,
  },
});

export default SensorChart;
