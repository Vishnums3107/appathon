/**
 * @format
 */

// Must be loaded before React Navigation so the native gesture module is
// registered before any navigator renders.
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
