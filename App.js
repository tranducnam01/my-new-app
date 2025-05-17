import { registerRootComponent } from 'expo';  // Thêm dòng này
import React from 'react';
import { NavigationContainer, StackActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Splash from './src/Screens/Splash';
import Login from './src/Screens/Login';
import Signup from './src/Screens/Signup';
import Home from './src/Screens/Home';
import Details from './src/Screens/Details';
import Cart from './src/Screens/Cart';
import { Provider } from 'react-redux';
import { Store } from "./Redux/Store";
import Orderplace from "./src/Screens/Orderplaced";
import ControlBar from './src/Screens/controlBar';
import User from './src/Screens/User';
import History from './src/Screens/History';
import ShippingAddress from './src/Screens/ShippingAddress';

const Stack = createNativeStackNavigator();

export const navigateAndReplace = (navigation, screen, params = {}) => {
  navigation.dispatch(StackActions.replace(screen, params));
};

const App = () => {
  return (
    <Provider store={Store}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="Splash" component={Splash} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Details" component={Details} />
          <Stack.Screen name="Cart" component={Cart} />
          <Stack.Screen name="Orderplace" component={Orderplace} />
          <Stack.Screen name="ControlBar" component={ControlBar} />
          <Stack.Screen name="User" component={User} />
          <Stack.Screen name="History" component={History} />
          <Stack.Screen name="ShippingAddress" component={ShippingAddress} />

        </Stack.Navigator>
      </NavigationContainer>
    </Provider>

  );
}

registerRootComponent(App);