import notifee, { AndroidImportance } from '@notifee/react-native';

export const createNotificationChannel = async () => {
  await notifee.createChannel({
    id: 'sensor_readings',
    name: 'Sensor Readings',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });
};

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
        smallIcon: 'ic_launcher',
        color: '#007AFF',
        largeIcon: require('../../assets/icon.png'),
      },
    });
    console.log('✅ Notification displayed');
  } catch (error) {
    console.error('❌ Error showing notification:', error);
  }
};

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