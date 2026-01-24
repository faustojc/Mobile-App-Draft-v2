import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';


export const configurePushNotifications = () => {
  PushNotification.configure({
    onRegister: function (token) {
      console.log('📱 Local Notification Token:', token);
    },
    onNotification: function (notification) {
      console.log('🔔 Local Notification Received:', notification);
    },
    requestPermissions: Platform.OS === 'ios',
  });


  PushNotification.createChannel(
    {
      channelId: 'sensor-updates',
      channelName: 'Sensor Updates',
      channelDescription: 'Notifies when new sensor readings arrive',
      importance: 4,
      vibrate: true,
    },
    (created) => console.log(`🛰️ Channel created: ${created}`),
  );
};


export const showLocalNotification = (title, message) => {
  PushNotification.localNotification({
    channelId: 'sensor-updates',
    title: title,
    message: message,
    playSound: true,
    soundName: 'default',
    importance: 'high',
    vibrate: true,
  });
};
