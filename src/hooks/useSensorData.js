import firestore from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";

export const useSensorData = (deviceId) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deviceId) return;

    setLoading(true);

    // devices/MAC_ADDR/readings
    const query = firestore()
      .collection("devices")
      .doc(deviceId)
      .collection("readings")
      .orderBy("timestamp", "desc")
      .limit(20);

    const unsubscribe = query.onSnapshot(
      (snapshot) => {
        const readings = snapshot.docs.map(doc => {
            const d = doc.data();
            return {
                id: doc.id,
                ...d,
                timestamp: d.timestamp ? d.timestamp.toDate() : new Date()
            };
        });
        setData(readings.reverse());
        setLoading(false);
      },
      (error) => {
        console.error("Sensor Data Listener Error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [deviceId]);

  return { data, loading };
};
