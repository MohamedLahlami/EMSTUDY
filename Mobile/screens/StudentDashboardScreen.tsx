import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { toast } from 'sonner-native';
import { getAuthData } from '../utils/tokenStorage';

export default function StudentDashboardScreen() {
  const [courses, setCourses] = useState([]);
  const [joinCode, setJoinCode] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    fetchEnrollments();
  }, []);  const fetchEnrollments = async () => {
    try {
      const authData = await getAuthData();
      if (!authData?.token) {
        toast.error('Please login again');
        navigation.navigate('Login');
        return;
      }

      const response = await fetch('http://localhost:8080/enrollments', {
        headers: {
          'Authorization': `Bearer ${authData.token}`,
        },
      });
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      toast.error('Failed to fetch courses');
    }
  };

  const handleJoinCourse = async () => {
    try {      const authData = await getAuthData();
      if (!authData?.token) {
        toast.error('Please login again');
        navigation.navigate('Login');
        return;
      }

      const response = await fetch(`http://localhost:8080/enrollments/enroll?joinCode=${joinCode}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
        },
      });
      
      if (!response.ok) throw new Error('Invalid join code');
      
      toast.success('Successfully joined course!');
      fetchEnrollments();
      setJoinCode('');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Courses</Text>
      </View>

      <View style={styles.joinSection}>
        <View style={styles.joinInputContainer}>
          <TextInput
            style={styles.joinInput}
            placeholder="Enter Course Code"
            value={joinCode}
            onChangeText={setJoinCode}
            autoCapitalize="none"
          />
          <TouchableOpacity 
            style={styles.joinButton}
            onPress={handleJoinCourse}
          >
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={courses}
        keyExtractor={(item) => item.enrollmentId.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.courseCard}
            onPress={() => navigation.navigate('CourseDetails', { courseId: item.courseId })}
          >
            <View>
              <Text style={styles.courseName}>{item.course.name}</Text>
              <Text style={styles.courseTeacher}>
                {item.course.teacher.username}
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
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  joinSection: {
    padding: 20,
  },
  joinInputContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  joinInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  joinButton: {
    backgroundColor: '#008d36',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  coursesList: {
    padding: 20,
    gap: 15,
  },
  courseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  courseTeacher: {
    fontSize: 14,
    color: '#666',
  },
});