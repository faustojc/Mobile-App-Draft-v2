// index.js
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';

// ✅ CRITICAL: Background message handler (when app is closed/background)
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('📩 Background message received:', remoteMessage);

  // Create notification channel if it doesn't exist
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });

  // Display notification
  await notifee.displayNotification({
    title: remoteMessage.notification?.title || 'New Sensor Data',
    body: remoteMessage.notification?.body || 'New reading received.',
    android: {
      channelId,
      importance: AndroidImportance.HIGH,
      pressAction: {
        id: 'default',
      },
      sound: 'default',
      smallIcon: 'ic_launcher',
    },
  });
});

// ✅ Handle notification press when app is in background/killed
notifee.onBackgroundEvent(async ({ type, detail }) => {
  console.log('🔔 Background event:', type);
  
  if (type === EventType.PRESS) {
    console.log('User pressed notification:', detail.notification);
    // You can add navigation logic here if needed
  }
});

AppRegistry.registerComponent(appName, () => App);