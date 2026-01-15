// src/services/NotificationService.js
import notifee, { AndroidImportance } from '@notifee/react-native';

// Create notification channel
export const createNotificationChannel = async () => {
  await notifee.createChannel({
    id: 'sensor_readings',
    name: 'Sensor Readings',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });
};

// Show notification for new sensor reading
export const showSensorNotification = async (data) => {
  try {
    await notifee.displayNotification({
      title: '🌊 New Water Quality Reading',
      body: `Temp: ${data.temp}°C | pH: ${data.pH} | PPM: ${data.ppm}`,
      android: {
        channelId: 'sensor_readings',
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
        sound: 'default',
        vibrationPattern: [300, 500],
        smallIcon: 'ic_launcher', // Your custom icon
        color: '#007AFF',
        largeIcon: require('../../assets/icon.png'), // Optional: large icon
      },
    });
    console.log('✅ Notification displayed');
  } catch (error) {
    console.error('❌ Error showing notification:', error);
  }
};

// Show notification with custom message
export const showCustomNotification = async (title, body) => {
  try {
    await notifee.displayNotification({
      title: title,
      body: body,
      android: {
        channelId: 'sensor_readings',
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
        sound: 'default',
        smallIcon: 'ic_launcher',
        color: '#007AFF',
      },
    });
  } catch (error) {
    console.error('❌ Error showing notification:', error);
  }
};