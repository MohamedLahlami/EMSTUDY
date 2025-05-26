import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { toast } from "sonner-native";
import { getAuthData } from "../utils/tokenStorage";

export default function QuizResultsScreen() {
  const [submission, setSubmission] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const { submissionId } = route.params;

  useEffect(() => {
    fetchSubmissionDetails();
  }, []);

  const fetchSubmissionDetails = async () => {
    try {
      const authData = await getAuthData();
      const response = await fetch(
        `http://192.168.11.170:8080/submissions/${submissionId}`,
        {
          headers: {
            Authorization: `Bearer ${authData?.token}`,
          },
        }
      );
      const data = await response.json();
      setSubmission(data);
    } catch (error) {
      toast.error("Failed to fetch results");
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("StudentDashboard")}
        >
          <MaterialIcons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Quiz Results</Text>
      </View>

      <ScrollView style={styles.content}>
        {submission && (
          <View style={styles.resultsContainer}>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreTitle}>Your Score</Text>
              <Text style={styles.scoreValue}>
                {Math.round(submission.score)}%
              </Text>
            </View>

            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Start Time:</Text>
                <Text style={styles.detailValue}>
                  {new Date(submission.startTime).toLocaleString()}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>End Time:</Text>
                <Text style={styles.detailValue}>
                  {new Date(submission.endTime).toLocaleString()}
                </Text>
              </View>
            </View>

            {submission.quiz.showCorrectAnswers && (
              <View style={styles.answersSection}>
                <Text style={styles.sectionTitle}>Question Review</Text>
                {submission.quiz.questions.map((question, index) => (
                  <View key={question.questionId} style={styles.questionCard}>
                    <Text style={styles.questionNumber}>
                      Question {index + 1}
                    </Text>
                    <Text style={styles.questionText}>
                      {question.questionText}
                    </Text>

                    {question.answers.map((answer) => {
                      const isSelected = submission.answers.some(
                        (a) => a.answerId === answer.answerId
                      );
                      const isCorrect = answer.correct;

                      return (
                        <View
                          key={answer.answerId}
                          style={[
                            styles.answerRow,
                            isSelected && isCorrect && styles.correctAnswer,
                            isSelected && !isCorrect && styles.incorrectAnswer,
                          ]}
                        >
                          <MaterialIcons
                            name={
                              isSelected
                                ? isCorrect
                                  ? "check-circle"
                                  : "cancel"
                                : "radio-button-unchecked"
                            }
                            size={24}
                            color={
                              isSelected
                                ? isCorrect
                                  ? "#4caf50"
                                  : "#f44336"
                                : "#666"
                            }
                          />
                          <Text style={styles.answerText}>
                            {answer.answerText}
                          </Text>
                        </View>
                      );
                    })}

                    {question.explanation && (
                      <Text style={styles.explanation}>
                        Explanation: {question.explanation}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  resultsContainer: {
    padding: 20,
  },
  scoreCard: {
    backgroundColor: "#008d36",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  scoreTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  scoreValue: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "bold",
  },
  detailsCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
  },
  answersSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  questionCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#008d36",
    marginBottom: 5,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 15,
  },
  answerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
  },
  correctAnswer: {
    backgroundColor: "#e8f5e9",
  },
  incorrectAnswer: {
    backgroundColor: "#ffebee",
  },
  answerText: {
    marginLeft: 10,
    fontSize: 16,
  },
  explanation: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
});
