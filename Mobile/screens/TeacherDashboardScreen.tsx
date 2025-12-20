import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { toast } from "sonner-native";
import { getAuthData } from "../utils/tokenStorage";
import { serverConfig } from "../utils/serverConfig";

export default function TeacherDashboardScreen() {
  const [courses, setCourses] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const authData = await getAuthData();
      if (!authData?.token) {
        toast.error("Please login again");
        navigation.navigate("Login");
        return;
      }

      const baseUrl = serverConfig.getBaseUrl();
      const response = await fetch(`${baseUrl}/courses`, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      toast.error("Failed to fetch courses");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Courses</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate("CreateCourse")}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
          <Text style={styles.createButtonText}>Create Course</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={courses}
        keyExtractor={(item) => item.courseId.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.courseCard}
            onPress={() =>
              navigation.navigate("CourseDetails", { courseId: item.courseId })
            }
          >
            <View>
              <Text style={styles.courseName}>{item.name}</Text>
              <Text style={styles.courseCode}>Code: {item.joinCode}</Text>
              <Text style={styles.courseStats}>
                {item.enrollments.length} students enrolled
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.coursesList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#008d36",
    padding: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
    gap: 8,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  coursesList: {
    padding: 20,
    gap: 15,
  },
  courseCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  courseName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  courseCode: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  courseStats: {
    fontSize: 14,
    color: "#008d36",
  },
});
