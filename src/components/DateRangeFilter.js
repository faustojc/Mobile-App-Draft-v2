import DateTimePicker from "@react-native-community/datetimepicker";
import { useCallback, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

/**
 * A date range filter bar with "From" and "To" date pickers.
 *
 * @param {Object}   props
 * @param {Date}     props.startDate   - Current start date
 * @param {Date}     props.endDate     - Current end date
 * @param {function} props.onStartChange - Callback when start date changes
 * @param {function} props.onEndChange   - Callback when end date changes
 */
const DateRangeFilter = ({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
}) => {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const formatDate = useCallback((date) => {
    if (!date) return "--";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const handleStartChange = useCallback(
    (event, selectedDate) => {
      // On Android, the picker auto-dismisses; on iOS we need explicit control
      if (Platform.OS === "android") {
        setShowStartPicker(false);
      }
      if (event.type === "dismissed") {
        setShowStartPicker(false);
        return;
      }
      if (selectedDate) {
        onStartChange(selectedDate);
      }
      setShowStartPicker(false);
    },
    [onStartChange],
  );

  const handleEndChange = useCallback(
    (event, selectedDate) => {
      if (Platform.OS === "android") {
        setShowEndPicker(false);
      }
      if (event.type === "dismissed") {
        setShowEndPicker(false);
        return;
      }
      if (selectedDate) {
        onEndChange(selectedDate);
      }
      setShowEndPicker(false);
    },
    [onEndChange],
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Start Date */}
        <TouchableOpacity
          style={styles.datePill}
          onPress={() => setShowStartPicker(true)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="calendar-start"
            size={18}
            color="#007AFF"
          />
          <View style={styles.dateTextContainer}>
            <Text style={styles.dateLabel}>From</Text>
            <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
          </View>
        </TouchableOpacity>

        <MaterialCommunityIcons
          name="arrow-right"
          size={20}
          color="#94A3B8"
          style={styles.arrowIcon}
        />

        {/* End Date */}
        <TouchableOpacity
          style={styles.datePill}
          onPress={() => setShowEndPicker(true)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="calendar-end"
            size={18}
            color="#007AFF"
          />
          <View style={styles.dateTextContainer}>
            <Text style={styles.dateLabel}>To</Text>
            <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {showStartPicker && (
        <DateTimePicker
          testID="startDatePicker"
          value={startDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={endDate}
          onChange={handleStartChange}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          testID="endDatePicker"
          value={endDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          minimumDate={startDate}
          maximumDate={new Date()}
          onChange={handleEndChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  datePill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F7FF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  dateTextContainer: {
    marginLeft: 10,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 2,
  },
  arrowIcon: {
    marginHorizontal: 10,
  },
});

export default DateRangeFilter;
