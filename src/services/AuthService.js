// src/services/AuthService.js
import auth from '@react-native-firebase/auth';

const ensureAuthReady = () => {
  if (!auth) {
    const error = new Error("Firebase Auth not initialized — check firebaseConfig.js");
    console.error(error);
    throw error;
  }
};

// ✅ Register new user
export const registerUser = async (email, password) => {
  ensureAuthReady();
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    console.log("✅ User account created & signed in!");
    return userCredential.user;
  } catch (error) {
    console.error("❌ Registration error:", error);
    throw error;
  }
};

// ✅ Login user
export const loginUser = async (email, password) => {
  ensureAuthReady();
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    console.log("✅ User signed in!", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("❌ Login error:", error);
    throw error;
  }
};

// ✅ Logout user
export const logoutUser = async () => {
  ensureAuthReady();
  try {
    await auth().signOut();
    console.log("👋 User signed out!");
  } catch (error) {
    console.error("❌ Logout error:", error);
    throw error;
  }
};

// ✅ Auth state listener with error handling
export const onAuthChanged = (callback) => {
  try {
    ensureAuthReady();
    return auth().onAuthStateChanged(callback);
  } catch (error) {
    console.error("❌ onAuthChanged error:", error);
    // Return a dummy unsubscribe function to prevent crashes
    return () => {};
  }
};

// ✅ Get current user
export const getCurrentUser = () => {
  try {
    ensureAuthReady();
    return auth().currentUser;
  } catch (error) {
    console.error("❌ getCurrentUser error:", error);
    return null;
  }
};