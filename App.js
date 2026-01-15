import React, { useState, useEffect } from "react";
import { Alert, ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import messaging from "@react-native-firebase/messaging";
import notifee, { AndroidImportance, EventType } from "@notifee/react-native";

import HomeScreen from "./screens/HomeScreen";
import RecordsScreen from "./screens/RecordsScreen";
import HelpScreen from "./screens/HelpScreen";
import ContactScreen from "./screens/ContactScreen";
import ProfileScreen from "./screens/ProfileScreen";
import LoginScreen from "./screens/LoginScreen";
import { onAuthChanged } from "./src/services/AuthService";
import { createNotificationChannel } from "./src/services/NotificationService";

const Drawer = createDrawerNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // ✅ Auth state listener
  useEffect(() => {
    let unsubscribe;
    
    try {
      unsubscribe = onAuthChanged((user) => {
        setIsLoggedIn(!!user);
        if (initializing) setInitializing(false);
        console.log("👤 Auth state changed:", user ? "Logged in" : "Logged out");
      });
    } catch (error) {
      console.error("❌ Auth listener error:", error);
      setInitializing(false);
    }

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // ✅ Setup notifications
  useEffect(() => {
    async function setupNotifications() {
      try {
        // Request permission
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log("✅ Notification permission granted");
          
          // Get FCM token
          const token = await messaging().getToken();
          console.log("📱 FCM Token:", token);
        } else {
          Alert.alert("⚠️ Notifications Disabled", "Please enable notifications in settings.");
        }

        // ✅ Create notification channels
        await createNotificationChannel(); // Custom channel for sensor readings
        await notifee.createChannel({
          id: 'default',
          name: 'Default Channel',
          importance: AndroidImportance.HIGH,
          sound: 'default',
        });

        // ✅ Foreground message handler
        const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
          console.log("📩 Foreground message received:", remoteMessage);

          await notifee.displayNotification({
            title: remoteMessage.notification?.title || "New Sensor Data",
            body: remoteMessage.notification?.body || "New reading received.",
            android: {
              channelId: 'default',
              importance: AndroidImportance.HIGH,
              pressAction: {
                id: 'default',
              },
              sound: 'default',
              smallIcon: 'ic_launcher',
            },
          });
        });

        // ✅ Handle notification press events
        notifee.onForegroundEvent(({ type, detail }) => {
          if (type === EventType.PRESS) {
            console.log('🔔 Notification pressed:', detail.notification);
          }
        });

        // ✅ Check if app was opened from notification
        messaging().getInitialNotification().then((remoteMessage) => {
          if (remoteMessage) {
            console.log('📬 App opened from notification:', remoteMessage);
          }
        });

        messaging().onNotificationOpenedApp((remoteMessage) => {
          console.log('📬 Notification opened app:', remoteMessage);
        });

        return unsubscribeForeground;
      } catch (error) {
        console.error("❌ Notification setup error:", error);
      }
    }

    setupNotifications();
  }, []);

  // ✅ Loading screen
  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const DrawerNavigator = () => (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Records" component={RecordsScreen} />
      <Drawer.Screen name="Help" component={HelpScreen} />
      <Drawer.Screen name="Contact" component={ContactScreen} />
      <Drawer.Screen
        name="Profile"
        children={(props) => (
          <ProfileScreen {...props} setIsLoggedIn={setIsLoggedIn} />
        )}
      />
    </Drawer.Navigator>
  );

  return (
    <NavigationContainer>
      {isLoggedIn ? <DrawerNavigator /> : <LoginScreen setIsLoggedIn={setIsLoggedIn} />}
    </NavigationContainer>
  );
}