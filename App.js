// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Screens
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import EmployeeDashboard from './screens/EmployeeDashboard';
import EmployerDashboard from './screens/EmployerDashboard';
import EmployeeProfileSetup from './screens/EmployeeProfileSetup';

// Components
import CustomSplash from './components/CustomSplash';

const Stack = createStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <CustomSplash />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          animationEnabled: true,
        }}
      >
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : user.role === 'employee' ? (
          <>
            <Stack.Screen name="EmployeeDashboard" component={EmployeeDashboard} />
            <Stack.Screen name="EmployeeProfileSetup" component={EmployeeProfileSetup} />
          </>
        ) : user.role === 'employer' ? (
          <>
            <Stack.Screen name="EmployerDashboard" component={EmployerDashboard} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}