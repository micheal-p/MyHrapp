// App.js (Complete - All Routes, Native Stack)
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
import JobApplications from './screens/JobApplications';
import CandidateProfile from './screens/CandidateProfile';
import AdminDashboard from './screens/AdminDashboard';
import CreateExam from './screens/CreateExam';
import PostJob from './screens/PostJob';
import Analytics from './screens/Analytics';
import JobListings from './screens/JobListings';
import PersonalDocuments from './screens/PersonalDocuments'; // ← NEW

// Components
import CustomSplash from './components/CustomSplash';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <CustomSplash />;
  }

  let screens = [];

  if (!user) {
    screens = [
      <Stack.Screen key="Login" name="Login" component={LoginScreen} />,
      <Stack.Screen key="Signup" name="Signup" component={SignupScreen} />,
    ];
  } else if (user.role === 'employee') {
    screens = [
      <Stack.Screen key="EmployeeDashboard" name="EmployeeDashboard" component={EmployeeDashboard} />,
      <Stack.Screen key="EmployeeProfileSetup" name="EmployeeProfileSetup" component={EmployeeProfileSetup} />,
      <Stack.Screen key="AvailableExams" name="AvailableExams" component={AvailableExams} />,
      <Stack.Screen key="TakeExam" name="TakeExam" component={TakeExam} />,
      <Stack.Screen key="ExamResults" name="ExamResults" component={ExamResults} />,
      <Stack.Screen key="MyCertifications" name="MyCertifications" component={MyCertifications} />,
      <Stack.Screen key="EmployeeRankings" name="EmployeeRankings" component={EmployeeRankings} />,
      <Stack.Screen key="JobListings" name="JobListings" component={JobListings} />,
      <Stack.Screen key="PersonalDocuments" name="PersonalDocuments" component={PersonalDocuments} />, // ← NEW
    ];
  } else if (user.role === 'employer') {
    screens = [
      <Stack.Screen key="EmployerDashboard" name="EmployerDashboard" component={EmployerDashboard} />,
      <Stack.Screen key="EmployerProfileSetup" name="EmployerProfileSetup" component={EmployerProfileSetup} />,
      <Stack.Screen key="PostJob" name="PostJob" component={PostJob} />,
      <Stack.Screen key="EmployerCandidates" name="EmployerCandidates" component={EmployerCandidates} />,
      <Stack.Screen key="Analytics" name="Analytics" component={Analytics} />,
      <Stack.Screen key="JobApplications" name="JobApplications" component={JobApplications} />,
      <Stack.Screen key="CandidateProfile" name="CandidateProfile" component={CandidateProfile} />,
    ];
  } else if (user.role === 'admin') {
    screens = [
      <Stack.Screen key="AdminDashboard" name="AdminDashboard" component={AdminDashboard} />,
      <Stack.Screen key="CreateExam" name="CreateExam" component={CreateExam} />,
    ];
  } else {
    screens = [
      <Stack.Screen key="Login" name="Login" component={LoginScreen} />,
      <Stack.Screen key="Signup" name="Signup" component={SignupScreen} />,
    ];
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {screens}
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