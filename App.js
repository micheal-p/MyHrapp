// App.js (Fixed - No Invalid Navigator Children)
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Screens
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import EmployeeDashboard from './screens/EmployeeDashboard';
import EmployerDashboard from './screens/EmployerDashboard';
import EmployeeProfileSetup from './screens/EmployeeProfileSetup';
import EmployerProfileSetup from './screens/EmployerProfileSetup';
import AvailableExams from './screens/AvailableExams';
import TakeExam from './screens/TakeExam';
import ExamResults from './screens/ExamResults';
import MyCertifications from './screens/MyCertifications';
import EmployeeRankings from './screens/EmployeeRankings';
import EmployerCandidates from './screens/EmployerCandidates';
import CandidateProfile from './screens/CandidateProfile';
import AdminDashboard from './screens/AdminDashboard';
import CreateExam from './screens/CreateExam';
import PostJob from './screens/PostJob';
import Analytics from './screens/Analytics';

// Components
import CustomSplash from './components/CustomSplash';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();

  // Debug user state
  console.log('AppNavigator user:', user ? JSON.stringify(user) : 'No user');

  if (loading) {
    return <CustomSplash />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {/* Single Fragment for all screens */}
        <>
          {user ? (
            user.role === 'employee' ? (
              /* Employee Flow */
              <>
                <Stack.Screen name="EmployeeDashboard" component={EmployeeDashboard} />
                <Stack.Screen name="EmployeeProfileSetup" component={EmployeeProfileSetup} />
                <Stack.Screen name="AvailableExams" component={AvailableExams} />
                <Stack.Screen name="TakeExam" component={TakeExam} />
                <Stack.Screen name="ExamResults" component={ExamResults} />
                <Stack.Screen name="MyCertifications" component={MyCertifications} />
                <Stack.Screen name="EmployeeRankings" component={EmployeeRankings} />
              </>
            ) : user.role === 'employer' ? (
              /* Employer Flow */
              <>
                <Stack.Screen name="EmployerDashboard" component={EmployerDashboard} />
                <Stack.Screen name="EmployerProfileSetup" component={EmployerProfileSetup} />
                <Stack.Screen name="PostJob" component={PostJob} />
                <Stack.Screen name="EmployerCandidates" component={EmployerCandidates} />
                <Stack.Screen name="CandidateProfile" component={CandidateProfile} />
                <Stack.Screen name="Analytics" component={Analytics} />
              </>
            ) : user.role === 'admin' ? (
              /* Admin Flow */
              <>
                <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
                <Stack.Screen name="CreateExam" component={CreateExam} />
              </>
            ) : (
              /* Fallback for invalid role */
              <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Signup" component={SignupScreen} />
              </>
            )
          ) : (
            /* No user (Auth Flow) */
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
            </>
          )}
        </>
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