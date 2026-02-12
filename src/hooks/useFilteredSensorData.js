import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { useEffect, useRef, useState } from "react";

/**
 *
 * Firestore path: devices/{deviceId}/readings
 *
 * Security rules require:
 *  - User must be authenticated (request.auth != null)
 *  - User must be the device owner (device doc's owner_uid == auth.uid)
 *
 * This hook guards against unauthenticated state and waits for
 * Firebase Auth to be ready before subscribing to the query.
 *
 * @param {string} deviceId  - Firestore document ID for the device
 * @param {Date}   startDate - Start of filter range (inclusive)
 * @param {Date}   endDate   - End of filter range (inclusive)
 * @param {number} limit     - Max documents to fetch (default: 200)
 * @returns {{ data: Array, loading: boolean, error: string|null }}
 */
export const useFilteredSensorData = (
  deviceId,
  startDate,
  endDate,
  limit = 200,
) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(auth().currentUser);

  const unsubscribeRef = useRef(null);
  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    // Guard: no deviceId provided
    if (!deviceId) {
      setLoading(false);
      setData([]);
      return;
    }

    // Guard: user is not authenticated — Firestore rules will reject the query
    if (!currentUser) {
      setLoading(false);
      setData([]);
      setError("Authentication required to view sensor data.");
      return;
    }

    setLoading(true);
    setError(null);

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    const normalizedStart = new Date(startDate);
    normalizedStart.setHours(0, 0, 0, 0);

    const normalizedEnd = new Date(endDate);
    normalizedEnd.setHours(23, 59, 59, 999);

    const query = firestore()
      .collection("devices")
      .doc(deviceId)
      .collection("readings")
      .where("timestamp", ">=", firestore.Timestamp.fromDate(normalizedStart))
      .where("timestamp", "<=", firestore.Timestamp.fromDate(normalizedEnd))
      .orderBy("timestamp", "asc")
      .limit(limit);

    const unsubscribe = query.onSnapshot(
      (snapshot) => {
        const readings = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            ...d,
            timestamp: d.timestamp ? d.timestamp.toDate() : new Date(),
          };
        });
        setData(readings);
        setLoading(false);
      },
      (err) => {
        console.error("useFilteredSensorData error:", err);

        if (err.code === "firestore/permission-denied") {
          setError(
            "Access denied. You may not be the owner of this device.",
          );
        } else {
          setError(err.message || "Failed to fetch readings");
        }

        setLoading(false);
      },
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId, startDate?.getTime(), endDate?.getTime(), limit, currentUser]);

  return { data, loading, error };
};
