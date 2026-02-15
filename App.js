import notifee, { AndroidImportance, EventType } from "@notifee/react-native";
import messaging from "@react-native-firebase/messaging";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";

import ContactScreen from "./screens/ContactScreen";
import HelpScreen from "./screens/HelpScreen";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import RecordsScreen from "./screens/RecordsScreen";
import { onAuthChanged } from "./src/services/AuthService";
import { createNotificationChannel } from "./src/services/NotificationService";

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: "#FFF" },
      headerTitleStyle: { fontWeight: "bold" },
      headerShadowVisible: false,
    }}
  >
    <Stack.Screen
      name="Dashboard"
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Records"
      component={RecordsScreen}
      options={{ title: "Device History" }}
    />
  </Stack.Navigator>
);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let unsubscribe;

    try {
      unsubscribe = onAuthChanged((user) => {
        setIsLoggedIn(!!user);
        if (initializing) setInitializing(false);
        console.log(
          "👤 Auth state changed:",
          user ? "Logged in" : "Logged out",
        );
      });
    } catch (error) {
      console.error("❌ Auth listener error:", error);
      setInitializing(false);
    }

    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    async function setupNotifications() {
      try {
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
          Alert.alert(
            "⚠️ Notifications Disabled",
            "Please enable notifications in settings.",
          );
        }

        await createNotificationChannel();
        await notifee.createChannel({
          id: "default",
          name: "Default Channel",
          importance: AndroidImportance.HIGH,
          sound: "default",
          vibration: true,
        });

        const unsubscribeForeground = messaging().onMessage(
          async (remoteMessage) => {
            console.log("📩 Foreground message received:", remoteMessage);

            await notifee.displayNotification({
              title: remoteMessage.notification?.title || "New Sensor Data",
              body: remoteMessage.notification?.body || "New reading received.",
              android: {
                channelId: "default",
                importance: AndroidImportance.HIGH,
                pressAction: {
                  id: "default",
                },
                sound: "default",
                smallIcon: "ic_launcher",
              },
            });
          },
        );

        notifee.onForegroundEvent(({ type, detail }) => {
          if (type === EventType.PRESS) {
            console.log("🔔 Notification pressed:", detail.notification);
          }
        });

        messaging()
          .getInitialNotification()
          .then((remoteMessage) => {
            if (remoteMessage) {
              console.log("📬 App opened from notification:", remoteMessage);
            }
          });

        messaging().onNotificationOpenedApp((remoteMessage) => {
          console.log("📬 Notification opened app:", remoteMessage);
        });

        return unsubscribeForeground;
      } catch (error) {
        console.error("❌ Notification setup error:", error);
      }
    }

    setupNotifications();
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const DrawerNavigator = () => (
    <Drawer.Navigator
      initialRouteName="HomeStack"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Drawer.Screen
        name="HomeStack"
        component={HomeStack}
        options={{
          title: "Home",
          headerShown: false,
        }}
      />

      <Drawer.Screen
        name="Help"
        component={HelpScreen}
        options={{ headerShown: true }}
      />
      <Drawer.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerShown: true, title: "Device Requests" }}
      />
      <Drawer.Screen
        name="Contact"
        component={ContactScreen}
        options={{ headerShown: true }}
      />
      <Drawer.Screen name="Profile" options={{ headerShown: true }}>
        {(props) => <ProfileScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <DrawerNavigator />
      ) : (
        <LoginScreen setIsLoggedIn={setIsLoggedIn} />
      )}
    </NavigationContainer>
  );
}
