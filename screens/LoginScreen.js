import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { loginUser, registerUser } from "../src/services/AuthService";

export default function LoginScreen({ setIsLoggedIn }) {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      await loginUser(email, password);
      setIsLoggedIn(true);
    } catch (error) {
      Alert.alert("Login Failed", error.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await registerUser(email, password);
      Alert.alert(
        "Success! 🎉",
        "Your account has been created successfully.",
        [
          {
            text: "OK",
            onPress: () => setIsLoggedIn(true),
          },
        ]
      );
    } catch (error) {
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Please login instead.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use a stronger password.";
      }
      
      Alert.alert("Registration Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header with Icon */}
        <View style={styles.headerContainer}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="water-check" size={48} color="#007AFF" />
          </View>
          <Text style={styles.appName}>AquaTech</Text>
          <Text style={styles.title}>
            {isLogin ? "Welcome Back! 👋" : "Create Account 🌊"}
          </Text>
          <Text style={styles.subtitle}>
            {isLogin
              ? "Log in to access your water quality dashboard"
              : "Sign up to start monitoring water quality"}
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          {/* Email Field */}
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="email-outline" size={22} color="#6B7280" />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          {/* Password Field */}
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="lock-outline" size={22} color="#6B7280" />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              autoComplete={isLogin ? "password" : "password-new"}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialCommunityIcons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password Field (Register Only) */}
          {!isLogin && (
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="lock-check-outline" size={22} color="#6B7280" />
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showConfirmPassword}
                autoComplete="password-new"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <MaterialCommunityIcons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={isLogin ? handleLogin : handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name={isLogin ? "login" : "account-plus"}
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.buttonText}>
                  {isLogin ? "Login" : "Create Account"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Toggle Between Login/Register */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </Text>
          <TouchableOpacity onPress={toggleMode}>
            <Text style={styles.toggleLink}>
              {isLogin ? "Sign Up" : "Login"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          Need help? Contact{" "}
          <Text
            style={styles.link}
            onPress={() =>
              Alert.alert(
                "Support",
                "Email: support@qualiaqua.com\n\nWe're here to help you 24/7!"
              )
            }
          >
            support@qualiaqua.com
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#007AFF",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#E2E8F0",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: "#F8FAFC",
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#1E293B",
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  toggleText: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
  },
  toggleLink: {
    fontSize: 15,
    color: "#007AFF",
    fontWeight: "700",
    marginLeft: 6,
  },
  footerText: {
    marginTop: 32,
    color: "#94A3B8",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  link: {
    color: "#007AFF",
    fontWeight: "600",
  },
});