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
    const docSnap = await deviceRef.get();

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
    if (!ownerUid)
      throw new Error("Device has no owner to request access from.");

    // Check if already requested
    const existingReq = await requestsRef
      .where("deviceId", "==", deviceId)
      .where("requesterUid", "==", user.uid)
      .where("status", "==", "pending")
      .get();

    if (!existingReq.empty) {
      throw new Error("Request already pending.");
    }

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
    const q = firestore()
      .collection("requests")
      .where("ownerUid", "==", user.uid)
      .where("status", "==", "pending")
      .orderBy("timestamp", "desc");

    const snapshot = await q.get();
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

  // Update request status
  batch.update(requestRef, { status: status });

  // If accepted, add to device members
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

    if (!deviceSnap.exists) throw new Error("Device not found");
    const deviceData = deviceSnap.data();

    // Only members can view members? Or only owner? Let's allow members.
    if (!deviceData.members?.includes(user.uid)) {
      throw new Error("Access denied");
    }

    // Get accepted requests to find emails
    const requestsSnap = await firestore()
      .collection("requests")
      .where("deviceId", "==", deviceId)
      .where("status", "==", "accepted")
      .get();

    const emailMap = {};
    requestsSnap.forEach((doc) => {
      const data = doc.data();
      emailMap[data.requesterUid] = data.requesterEmail;
    });

    // Map members to objects
    const members = deviceData.members.map((uid) => {
      let email = emailMap[uid] || "Unknown";
      let role = "member";

      if (uid === deviceData.owner_uid) {
        role = "owner";
        email = "Owner"; // We might not know owner email easily unless stored
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

    // Optional: Update the request status to 'revoked' or similar if we want to track it
    // But for now, just removing from members is enough.

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
    // Query devices where I am a member (includes owner)
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
