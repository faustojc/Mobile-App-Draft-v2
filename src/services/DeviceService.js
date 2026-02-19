import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

export const claimDevice = async (rawInput, nickname) => {
  const user = auth().currentUser;

  if (!user) throw new Error("Authentication required.");

  // Input: "24:0a:c4..." -> Output: "240AC4..."
  const deviceId = rawInput.replaceAll(/[:\-\s]/g, "").toUpperCase();

  if (deviceId.length === 0) throw new Error("Invalid Device ID");

  const deviceRef = firestore().collection("devices").doc(deviceId);

  try {
    let docSnap;
    try {
      docSnap = await deviceRef.get();
    } catch (readError) {
      if (readError.code === "firestore/permission-denied") {
        const error = new Error("Device already owned");
        error.code = "DEVICE_ALREADY_OWNED";
        error.deviceId = deviceId;
        throw error;
      }
      throw readError;
    }

    if (docSnap.exists) {
      const data = docSnap.data();
      if (data.owner_uid && data.owner_uid !== user.uid) {
        const error = new Error("Device already owned");
        error.code = "DEVICE_ALREADY_OWNED";
        error.deviceId = deviceId;
        throw error;
      }
    }

    await deviceRef.set(
      {
        owner_uid: user.uid,
        members: firestore.FieldValue.arrayUnion(user.uid),
        device_name: nickname || "My Water Sensor",
        claimed_at: firestore.FieldValue.serverTimestamp(),
        type: "arduino_esp32_prototype",
      },
      { merge: true },
    );

    return true;
  } catch (error) {
    console.error("Claim Device Error:", error);
    if (error.code === "DEVICE_ALREADY_OWNED") {
      throw error;
    }
    if (error.code === "firestore/permission-denied") {
      throw new Error(
        "Security Alert: Access to this device ID is restricted.",
      );
    }
    throw error;
  }
};

export const requestDeviceAccess = async (deviceId) => {
  const user = auth().currentUser;
  if (!user) throw new Error("Authentication required.");

  const requestsRef = firestore().collection("requests");
  const deviceRef = firestore().collection("devices").doc(deviceId);

  try {
    const deviceSnap = await deviceRef.get();
    if (!deviceSnap.exists) throw new Error("Device not found.");

    const ownerUid = deviceSnap.data().owner_uid;
    if (!ownerUid) throw new Error("Device has no owner to request access from.");

    await requestsRef.add({
      deviceId,
      requesterUid: user.uid,
      requesterEmail: user.email || "Unknown User",
      ownerUid,
      status: "pending",
      timestamp: firestore.FieldValue.serverTimestamp(),
    });

    return "Request Sent";
  } catch (error) {
    console.error("Request Access Error:", error);
    throw error;
  }
};

export const getIncomingRequests = async () => {
  const user = auth().currentUser;
  if (!user) return [];

  try {
    const snapshot = await firestore()
      .collection("requests")
      .where("ownerUid", "==", user.uid)
      .where("status", "==", "pending")
      .orderBy("timestamp", "desc")
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching requests:", error);
    return [];
  }
};

export const respondToRequest = async (
  requestId,
  status,
  deviceId,
  requesterUid,
) => {
  const user = auth().currentUser;
  if (!user) throw new Error("Authentication required.");

  const batch = firestore().batch();
  const requestRef = firestore().collection("requests").doc(requestId);

  batch.update(requestRef, { status: status });

  if (status === "accepted") {
    const deviceRef = firestore().collection("devices").doc(deviceId);
    batch.update(deviceRef, {
      members: firestore.FieldValue.arrayUnion(requesterUid),
    });
  }

  await batch.commit();
};

export const getDeviceMembers = async (deviceId) => {
  const user = auth().currentUser;
  if (!user) throw new Error("Authentication required.");

  try {
    const deviceRef = firestore().collection("devices").doc(deviceId);
    const deviceSnap = await deviceRef.get();

    if (!deviceSnap.exists()) throw new Error("Device not found");
    const deviceData = deviceSnap.data();

    console.log("Device owner ID: ", deviceData.owner_uid);
    console.log("User ID: ", user.uid);

    if (deviceData.owner_uid !== user.uid) {
      throw new Error("Access denied");
    }

    // Get accepted requests to find emails
    const requestsSnap = await firestore()
      .collection("requests")
      .where("ownerUid", "==", user.uid)
      .where("deviceId", "==", deviceId)
      .where("status", "==", "accepted")
      .get();

    if (requestsSnap.empty) {
      return [];
    }

    const emailMap = {};
    requestsSnap.forEach((doc) => {
      const data = doc.data();
      emailMap[data.requesterUid] = data.requesterEmail;
    });

    const members = deviceData.members.map((uid) => {
      let email = emailMap[uid] || "Unknown";
      let role = "member";

      if (uid === deviceData.owner_uid) {
        role = "owner";
        email = "Owner";
      } else if (uid === user.uid) {
        email = user.email || "Me";
      }

      return { uid, email, role };
    });

    return members;
  } catch (error) {
    console.error("Error fetching members:", error);
    throw error;
  }
};

export const removeMember = async (deviceId, memberUid) => {
  const user = auth().currentUser;
  if (!user) throw new Error("Authentication required.");

  const deviceRef = firestore().collection("devices").doc(deviceId);

  try {
    const deviceSnap = await deviceRef.get();
    if (!deviceSnap.exists) throw new Error("Device not found");

    const deviceData = deviceSnap.data();
    if (deviceData.owner_uid !== user.uid) {
      throw new Error("Only the owner can remove members.");
    }

    if (memberUid === deviceData.owner_uid) {
      throw new Error("Cannot remove the owner.");
    }

    await deviceRef.update({
      members: firestore.FieldValue.arrayRemove(memberUid),
    });

    return true;
  } catch (error) {
    console.error("Error removing member:", error);
    throw error;
  }
};

export const getMyDevices = async () => {
  const user = auth().currentUser;
  if (!user) return [];

  try {
    const q = firestore()
      .collection("devices")
      .where("members", "array-contains", user.uid);

    const querySnapshot = await q.get();
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching devices:", error);
    throw error;
  }
};
