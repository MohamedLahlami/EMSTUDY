import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from "sonner-native";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import StudentDashboardScreen from "./screens/StudentDashboardScreen";
import TeacherDashboardScreen from "./screens/TeacherDashboardScreen";
import CourseDetailsScreen from "./screens/CourseDetailsScreen";
import CreateCourseScreen from "./screens/CreateCourseScreen";
import TakeQuizScreen from "./screens/TakeQuizScreen";
import QuizResultsScreen from "./screens/QuizResultsScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Stack = createNativeStackNavigator();

function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen
        name="StudentDashboard"
        component={StudentDashboardScreen}
      />
      <Stack.Screen
        name="TeacherDashboard"
        component={TeacherDashboardScreen}
      />
      <Stack.Screen name="CourseDetails" component={CourseDetailsScreen} />
      <Stack.Screen name="CreateCourse" component={CreateCourseScreen} />
      <Stack.Screen name="TakeQuiz" component={TakeQuizScreen} />
      <Stack.Screen name="QuizResults" component={QuizResultsScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Toaster />
        <NavigationContainer>
          <RootStack />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    userSelect: "none",
  },
});
