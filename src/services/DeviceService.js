import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const claimDevice = async (rawInput, nickname) => {
  const user = auth().currentUser;

  if (!user) throw new Error("Authentication required.");

  // Input: "24:0a:c4..." -> Output: "240AC4..."
  const deviceId = rawInput.replaceAll(/[:\-\s]/g, "").toUpperCase();

  if (deviceId.length === 0) throw new Error("Invalid Device ID");

  const deviceRef = firestore().collection("devices").doc(deviceId);

  try {
    const docSnap = await deviceRef.get();

    if (docSnap.exists && docSnap.data().owner_uid && docSnap.data().owner_uid !== user.uid) {
      throw new Error("Conflict: This device is already registered to another household.");
    }

    await deviceRef.set({
      owner_uid: user.uid,
      device_name: nickname || "My Water Sensor",
      claimed_at: firestore.FieldValue.serverTimestamp(),
      type: "arduino_esp32_prototype"
    }, { merge: true });

	  return true;

  } catch (error) {
    console.error("Claim Device Error:", error);
    if (error.code === 'firestore/permission-denied') {
      throw new Error("Security Alert: Access to this device ID is restricted.");
    }
    throw error;
	}
};

export const getMyDevices = async () => {
  const user = auth().currentUser;
  if (!user) return [];

  try {
    const q = firestore().collection("devices").where("owner_uid", "==", user.uid);

    const querySnapshot = await q.get();
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching devices:", error);
    throw error;
  }
};
