import React, { useState, useEffect, useRef } from "react";
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

export default function TakeQuizScreen() {
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submission, setSubmission] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const { quizId } = route.params;
  const timerRef = useRef(null);

  useEffect(() => {
    fetchQuizDetails();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const fetchQuizDetails = async () => {
    try {
      const authData = await getAuthData();
      const response = await fetch(
        `http://192.168.11.170:8080/items/${quizId}`,
        {
          headers: {
            Authorization: `Bearer ${authData?.token}`,
          },
        }
      );
      const quizData = await response.json();
      setQuiz(quizData);

      // Start quiz
      const submissionResponse = await fetch(
        `http://192.168.11.170:8080/submissions/start/?quizId=${quizId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authData?.token}`,
          },
        }
      );
      const submissionData = await submissionResponse.json();
      setSubmission(submissionData);

      // Set timer
      const endTime = new Date(submissionData.startTime);
      endTime.setMinutes(endTime.getMinutes() + quizData.durationInMinutes);
      startTimer(endTime);

      // Fetch questions
      const questionsResponse = await fetch(
        `http://192.168.11.170:8080/questions/quiz/${quizId}`,
        {
          headers: {
            Authorization: `Bearer ${authData?.token}`,
          },
        }
      );
      const questionsData = await questionsResponse.json();
      setQuestions(questionsData);
    } catch (error) {
      toast.error("Failed to load quiz");
      navigation.goBack();
    }
  };

  const startTimer = (endTime) => {
    timerRef.current = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance < 0) {
        clearInterval(timerRef.current);
        submitQuiz();
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    }, 1000);
  };

  const handleAnswerSelection = (questionId, answerId, isMultiSelect) => {
    setSelectedAnswers((prev) => {
      if (isMultiSelect) {
        const current = prev[questionId] || [];
        if (current.includes(answerId)) {
          return {
            ...prev,
            [questionId]: current.filter((id) => id !== answerId),
          };
        } else {
          return {
            ...prev,
            [questionId]: [...current, answerId],
          };
        }
      } else {
        return {
          ...prev,
          [questionId]: [answerId],
        };
      }
    });
  };

  const submitQuiz = async () => {
    try {
      const authData = await getAuthData();
      const answers = Object.values(selectedAnswers).flat();

      await fetch(
        `http://192.168.11.170:8080/submissions/${submission.submissionId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authData?.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(answers),
        }
      );

      navigation.replace("QuizResults", {
        submissionId: submission.submissionId,
      });
    } catch (error) {
      toast.error("Failed to submit quiz");
    }
  };

  const renderQuestion = (question) => {
    const isMultiSelect = question.questionType === "MULTI_SELECT";

    return (
      <View key={question.questionId} style={styles.questionCard}>
        <Text style={styles.questionText}>{question.questionText}</Text>
        <Text style={styles.pointsText}>Points: {question.points}</Text>

        {question.answers.map((answer) => {
          const isSelected = selectedAnswers[question.questionId]?.includes(
            answer.answerId
          );

          return (
            <TouchableOpacity
              key={answer.answerId}
              style={[styles.answerOption, isSelected && styles.selectedAnswer]}
              onPress={() =>
                handleAnswerSelection(
                  question.questionId,
                  answer.answerId,
                  isMultiSelect
                )
              }
            >
              <MaterialIcons
                name={
                  isMultiSelect
                    ? isSelected
                      ? "check-box"
                      : "check-box-outline-blank"
                    : isSelected
                    ? "radio-button-checked"
                    : "radio-button-unchecked"
                }
                size={24}
                color={isSelected ? "#008d36" : "#666"}
              />
              <Text
                style={[
                  styles.answerText,
                  isSelected && styles.selectedAnswerText,
                ]}
              >
                {answer.answerText}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{quiz?.title}</Text>
        {timeLeft && <Text style={styles.timer}>Time Left: {timeLeft}</Text>}
      </View>

      <ScrollView style={styles.content}>
        {questions.map(renderQuestion)}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={submitQuiz}>
          <Text style={styles.submitButtonText}>Submit Quiz</Text>
        </TouchableOpacity>
      </View>
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
  },
  timer: {
    fontSize: 18,
    color: "#008d36",
    fontWeight: "600",
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  pointsText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  answerOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedAnswer: {
    backgroundColor: "#e8f5e9",
    borderColor: "#008d36",
  },
  answerText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  selectedAnswerText: {
    color: "#008d36",
    fontWeight: "500",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  submitButton: {
    backgroundColor: "#008d36",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
