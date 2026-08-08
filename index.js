/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import notifee from '@notifee/react-native';
// import notificationService from './src/lib/services/Notification';

notifee.onBackgroundEvent(async ({type, detail}) => {
  const notificationService =
    require('./src/lib/services/Notification').default;
  await notificationService.actionHandler({type, detail});
});

notifee.registerForegroundService(async () => {
  // Keep the service alive while in foreground
  return new Promise(() => {});
});

AppRegistry.registerComponent('main', () => App);
