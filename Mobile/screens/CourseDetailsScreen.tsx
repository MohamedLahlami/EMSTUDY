import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { toast } from 'sonner-native';
import { getAuthData } from '../utils/tokenStorage';

export default function CourseDetailsScreen() {
  const [course, setCourse] = useState(null);
  const [items, setItems] = useState([]);
  const [completedItems, setCompletedItems] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const { courseId } = route.params;

  useEffect(() => {
    fetchCourseDetails();
    fetchCourseItems();
    fetchCompletedItems();
    checkUserRole();
  }, [courseId]);

  const checkUserRole = async () => {
    const authData = await getAuthData();
    setUserRole(authData?.role);
  };

  const fetchCourseDetails = async () => {
    try {
      const authData = await getAuthData();
      const response = await fetch(`http://localhost:8080/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${authData?.token}`,
        },
      });
      const data = await response.json();
      setCourse(data);
    } catch (error) {
      toast.error('Failed to fetch course details');
    }
  };

  const fetchCourseItems = async () => {
    try {
      const authData = await getAuthData();
      const response = await fetch(`http://localhost:8080/items/course/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${authData?.token}`,
        },
      });
      const data = await response.json();
      setItems(data);
    } catch (error) {
      toast.error('Failed to fetch course items');
    }
  };

  const fetchCompletedItems = async () => {
    if (userRole !== 'Student') return;
    
    try {
      const authData = await getAuthData();
      const response = await fetch(`http://localhost:8080/completed-items/course/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${authData?.token}`,
        },
      });
      const data = await response.json();
      setCompletedItems(data.map(item => item.courseItem.itemId));
    } catch (error) {
      toast.error('Failed to fetch completed items');
    }
  };

  const toggleItemCompletion = async (itemId) => {
    try {
      const authData = await getAuthData();
      if (completedItems.includes(itemId)) {
        // Remove completion
        const completedItem = completedItems.find(item => item.courseItem.itemId === itemId);
        await fetch(`http://localhost:8080/completed-items/${completedItem.completedCourseItemId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authData?.token}`,
          },
        });
        setCompletedItems(prev => prev.filter(id => id !== itemId));
      } else {
        // Mark as completed
        await fetch(`http://localhost:8080/completed-items/?itemId=${itemId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authData?.token}`,
          },
        });
        setCompletedItems(prev => [...prev, itemId]);
      }
      toast.success('Progress updated');
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const renderItem = (item) => {
    const isCompleted = completedItems.includes(item.itemId);
    
    return (
      <TouchableOpacity 
        key={item.itemId}
        style={[styles.itemCard, isCompleted && styles.completedItem]}
        onPress={() => {
          if (item.itemType === 'Quiz') {
            navigation.navigate('TakeQuiz', { quizId: item.itemId });
          } else {
            // Handle material viewing based on type
            if (item.courseMaterialType === 'IMAGE') {
              navigation.navigate('ViewImage', { materialId: item.itemId });
            } else if (item.courseMaterialType === 'PDF') {
              // Handle PDF download
            } else {
              // Handle other material types
            }
          }
        }}
      >
        <View style={styles.itemContent}>
          <MaterialIcons 
            name={item.itemType === 'Quiz' ? 'quiz' : 'description'} 
            size={24} 
            color="#008d36" 
          />
          <View style={styles.itemDetails}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            {item.itemType === 'Quiz' && (
              <Text style={styles.quizInfo}>
                Duration: {item.durationInMinutes} minutes
              </Text>
            )}
          </View>
        </View>
        
        {userRole === 'Student' && (
          <TouchableOpacity 
            style={styles.checkButton}
            onPress={() => toggleItemCompletion(item.itemId)}
          >
            <MaterialIcons 
              name={isCompleted ? 'check-box' : 'check-box-outline-blank'} 
              size={24} 
              color="#008d36" 
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Course Details</Text>
      </View>

      <ScrollView style={styles.content}>
        {course && (
          <View style={styles.courseInfo}>
            <Text style={styles.courseName}>{course.name}</Text>
            <Text style={styles.courseDescription}>{course.description}</Text>
            {userRole === 'Teacher' && (
              <Text style={styles.joinCode}>Join Code: {course.joinCode}</Text>
            )}
          </View>
        )}

        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Course Content</Text>
          {userRole === 'Teacher' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => navigation.navigate('CreateMaterial', { courseId })}
              >
                <MaterialIcons name="note-add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Add Material</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => navigation.navigate('CreateQuiz', { courseId })}
              >
                <MaterialIcons name="add-task" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Add Quiz</Text>
              </TouchableOpacity>
            </View>
          )}
          {items.map(renderItem)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  courseInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  courseName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  courseDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  joinCode: {
    fontSize: 16,
    color: '#008d36',
    fontWeight: '600',
  },
  itemsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#008d36',
    padding: 10,
    borderRadius: 8,
    gap: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  completedItem: {
    backgroundColor: '#e8f5e9',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemDetails: {
    marginLeft: 10,
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  quizInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  checkButton: {
    padding: 5,
  },
});