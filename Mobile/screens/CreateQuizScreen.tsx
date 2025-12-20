import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { serverConfig } from '../utils/serverConfig';
import { getAuthData } from '../utils/tokenStorage';
import { toast } from 'sonner-native';

const QUESTION_TYPES = [
  { label: 'Multiple Choice', value: 'MULTIPLE_CHOICE' },
  { label: 'True/False', value: 'TRUE_FALSE' },
  { label: 'Multi Select', value: 'MULTI_SELECT' },
];

function emptyQuestion() {
  return {
    questionText: '',
    points: '',
    questionType: 'MULTIPLE_CHOICE',
    answers: [],
    explanation: '',
  };
}

function emptyAnswer() {
  return { answerText: '', correct: false };
}

export default function CreateQuizScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { courseId } = route.params || {};

  // Step management
  const [step, setStep] = useState(1);

  // Quiz info
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);

  // Questions
  const [questions, setQuestions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null); // null = adding new
  const [questionDraft, setQuestionDraft] = useState(emptyQuestion());
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Quiz Info
  const renderQuizInfo = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Create Quiz for Course ID: {courseId}</Text>
      <TextInput
        style={styles.input}
        placeholder="Quiz Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Duration (minutes)"
        value={duration}
        onChangeText={setDuration}
        keyboardType="numeric"
      />
      <View style={styles.switchRow}>
        <Text style={styles.label}>Show correct answers after submission?</Text>
        <Switch value={showCorrectAnswers} onValueChange={setShowCorrectAnswers} />
      </View>
      <Button
        title="Next"
        color="#008d36"
        onPress={() => {
          if (!title.trim() || !duration.trim()) {
            toast.error('Please fill in all fields');
            return;
          }
          setStep(2);
        }}
      />
      <View style={{ height: 16 }} />
      <Button title="Back" color="#008d36" onPress={() => navigation.goBack()} />
    </View>
  );

  // Step 2: Add/Edit Questions
  const renderQuestions = () => (
    <ScrollView contentContainerStyle={styles.stepContainer}>
      <Text style={styles.title}>Questions</Text>
      {questions.length > 0 && (
        <View style={styles.questionsList}>
          {questions.map((q, idx) => (
            <View key={idx} style={styles.questionCard}>
              <Text style={styles.questionText}>{q.questionText}</Text>
              <Text style={styles.questionType}>{q.questionType.replace('_', ' ')}</Text>
              <View style={styles.questionActions}>
                <Button title="Edit" color="#008d36" onPress={() => {
                  setEditingIndex(idx);
                  setQuestionDraft({ ...q });
                }} />
                <Button title="Remove" color="#f44336" onPress={() => {
                  setQuestions(questions.filter((_, i) => i !== idx));
                }} />
              </View>
            </View>
          ))}
        </View>
      )}
      <Button
        title={editingIndex !== null ? "Update Question" : "Add Question"}
        color="#008d36"
        onPress={() => {
          // Validate question
          if (!questionDraft.questionText.trim() || !questionDraft.points || questionDraft.answers.length < 2) {
            toast.error('Fill all fields and add at least 2 answers');
            return;
          }
          if (!questionDraft.answers.some(a => a.correct)) {
            toast.error('Mark at least one correct answer');
            return;
          }
          if (editingIndex !== null) {
            const updated = [...questions];
            updated[editingIndex] = { ...questionDraft };
            setQuestions(updated);
            setEditingIndex(null);
          } else {
            setQuestions([...questions, { ...questionDraft }]);
          }
          setQuestionDraft(emptyQuestion());
        }}
      />
      <View style={{ height: 16 }} />
      <Button
        title="Next"
        color="#008d36"
        onPress={() => {
          if (questions.length === 0) {
            toast.error('Add at least one question');
            return;
          }
          setStep(3);
        }}
      />
      <View style={{ height: 16 }} />
      <Button title="Back" color="#008d36" onPress={() => setStep(1)} />
      <View style={{ height: 32 }} />
      <Text style={styles.subtitle}>{editingIndex !== null ? 'Edit Question' : 'New Question'}</Text>
      {renderQuestionForm()}
    </ScrollView>
  );

  // Step 2b: Question Form
  function renderQuestionForm() {
    const q = questionDraft;
    return (
      <View style={styles.questionForm}>
        <TextInput
          style={styles.input}
          placeholder="Question Text"
          value={q.questionText}
          onChangeText={text => setQuestionDraft({ ...q, questionText: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Points"
          value={q.points}
          onChangeText={text => setQuestionDraft({ ...q, points: text })}
          keyboardType="numeric"
        />
        <View style={styles.switchRow}>
          <Text style={styles.label}>Type:</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {QUESTION_TYPES.map(type => (
              <TouchableOpacity
                key={type.value}
                style={[styles.typeButton, q.questionType === type.value && styles.typeButtonActive]}
                onPress={() => {
                  setQuestionDraft({
                    ...q,
                    questionType: type.value,
                    answers: type.value === 'TRUE_FALSE'
                      ? [
                        { answerText: 'True', correct: false },
                        { answerText: 'False', correct: false },
                      ]
                      : [emptyAnswer(), emptyAnswer()],
                  });
                }}
              >
                <Text style={{ color: q.questionType === type.value ? '#fff' : '#008d36' }}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* Answers */}
        <Text style={styles.label}>Answers:</Text>
        {q.answers.map((a, idx) => (
          <View key={idx} style={styles.answerRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder={`Answer ${idx + 1}`}
              value={a.answerText}
              onChangeText={text => {
                const updated = [...q.answers];
                updated[idx].answerText = text;
                setQuestionDraft({ ...q, answers: updated });
              }}
              editable={q.questionType !== 'TRUE_FALSE'}
            />
            <TouchableOpacity
              style={[styles.correctButton, a.correct && styles.correctButtonActive]}
              onPress={() => {
                const updated = [...q.answers];
                if (q.questionType === 'MULTI_SELECT') {
                  updated[idx].correct = !updated[idx].correct;
                } else {
                  updated.forEach((ans, i) => (ans.correct = i === idx));
                }
                setQuestionDraft({ ...q, answers: updated });
              }}
            >
              <Text style={{ color: a.correct ? '#fff' : '#008d36' }}>Correct</Text>
            </TouchableOpacity>
            {q.questionType !== 'TRUE_FALSE' && q.answers.length > 2 && (
              <TouchableOpacity
                style={styles.removeAnswerButton}
                onPress={() => {
                  const updated = q.answers.filter((_, i) => i !== idx);
                  setQuestionDraft({ ...q, answers: updated });
                }}
              >
                <Text style={{ color: '#f44336' }}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        {q.questionType !== 'TRUE_FALSE' && (
          <Button
            title="Add Answer"
            color="#008d36"
            onPress={() => setQuestionDraft({ ...q, answers: [...q.answers, emptyAnswer()] })}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Explanation (optional)"
          value={q.explanation}
          onChangeText={text => setQuestionDraft({ ...q, explanation: text })}
        />
      </View>
    );
  }

  // Step 3: Review & Submit
  const renderReview = () => (
    <ScrollView contentContainerStyle={styles.stepContainer}>
      <Text style={styles.title}>Review Quiz</Text>
      <Text style={styles.label}>Title: {title}</Text>
      <Text style={styles.label}>Duration: {duration} minutes</Text>
      <Text style={styles.label}>Show correct answers: {showCorrectAnswers ? 'Yes' : 'No'}</Text>
      <Text style={styles.label}>Questions:</Text>
      {questions.map((q, idx) => (
        <View key={idx} style={styles.questionCard}>
          <Text style={styles.questionText}>{q.questionText}</Text>
          <Text style={styles.questionType}>{q.questionType.replace('_', ' ')}</Text>
          <Text style={styles.points}>Points: {q.points}</Text>
          <Text style={styles.label}>Answers:</Text>
          {q.answers.map((a, i) => (
            <Text key={i} style={{ color: a.correct ? '#008d36' : '#333' }}>
              {a.answerText} {a.correct ? '(Correct)' : ''}
            </Text>
          ))}
          {q.explanation ? <Text style={styles.label}>Explanation: {q.explanation}</Text> : null}
        </View>
      ))}
      <Button title="Edit Quiz" color="#008d36" onPress={() => setStep(2)} />
      <View style={{ height: 16 }} />
      <Button
        title={submitting ? 'Submitting...' : 'Submit Quiz'}
        color="#008d36"
        onPress={handleSubmitQuiz}
        disabled={submitting}
      />
      <View style={{ height: 16 }} />
      <Button title="Back" color="#008d36" onPress={() => setStep(2)} />
    </ScrollView>
  );

  // Step 4: Summary
  const [quizSummary, setQuizSummary] = useState(null);
  const renderSummary = () => (
    <ScrollView contentContainerStyle={styles.stepContainer}>
      <Text style={styles.title}>Quiz Created!</Text>
      <Text style={styles.label}>Title: {quizSummary?.name}</Text>
      <Text style={styles.label}>Duration: {quizSummary?.durationInMinutes} minutes</Text>
      <Text style={styles.label}>Show correct answers: {quizSummary?.showCorrectAnswers ? 'Yes' : 'No'}</Text>
      <Text style={styles.label}>Questions:</Text>
      {quizSummary?.questions?.map((q, idx) => (
        <View key={idx} style={styles.questionCard}>
          <Text style={styles.questionText}>{q.questionText}</Text>
          <Text style={styles.questionType}>{q.questionType.replace('_', ' ')}</Text>
          <Text style={styles.points}>Points: {q.points}</Text>
          <Text style={styles.label}>Answers:</Text>
          {q.answers.map((a, i) => (
            <Text key={i} style={{ color: a.correct ? '#008d36' : '#333' }}>
              {a.answerText} {a.correct ? '(Correct)' : ''}
            </Text>
          ))}
          {q.explanation ? <Text style={styles.label}>Explanation: {q.explanation}</Text> : null}
        </View>
      ))}
      <Button title="Edit Quiz" color="#008d36" onPress={() => {
        setStep(2);
        setQuizSummary(null);
      }} />
      <View style={{ height: 16 }} />
      <Button title="Back to Course" color="#008d36" onPress={() => navigation.goBack()} />
    </ScrollView>
  );

  // Submit handler
  async function handleSubmitQuiz() {
    setSubmitting(true);
    try {
      const authData = await getAuthData();
      const baseUrl = serverConfig.getBaseUrl();
      const quizPayload = {
        title,
        durationInMinutes: parseInt(duration, 10),
        showCorrectAnswers,
        questions: questions.map(q => ({
          questionText: q.questionText,
          points: parseInt(q.points, 10),
          questionType: q.questionType,
          answers: q.answers,
          explanation: q.explanation,
        })),
      };
      const response = await fetch(`${baseUrl}/quizzes?courseId=${courseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authData?.token}`,
        },
        body: JSON.stringify(quizPayload),
      });
      if (!response.ok) throw new Error('Failed to create quiz');
      const data = await response.json();
      setQuizSummary(data);
      setStep(4);
      toast.success('Quiz created!');
    } catch (error) {
      toast.error(error.message || 'Failed to create quiz');
    } finally {
      setSubmitting(false);
    }
  }

  // Render step
  if (step === 1) return renderQuizInfo();
  if (step === 2) return renderQuestions();
  if (step === 3) return renderReview();
  if (step === 4) return renderSummary();
  return null;
}

const styles = StyleSheet.create({
  stepContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#008d36',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#008d36',
  },
  input: {
    width: '100%',
    maxWidth: 350,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  questionsList: {
    width: '100%',
    marginBottom: 16,
  },
  questionCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    width: '100%',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  questionType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  points: {
    fontSize: 14,
    color: '#008d36',
    marginBottom: 4,
  },
  questionActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  questionForm: {
    width: '100%',
    marginTop: 16,
    marginBottom: 32,
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  correctButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#008d36',
    borderRadius: 8,
    padding: 8,
  },
  correctButtonActive: {
    backgroundColor: '#008d36',
  },
  removeAnswerButton: {
    marginLeft: 8,
    padding: 8,
  },
  typeButton: {
    borderWidth: 1,
    borderColor: '#008d36',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 4,
    backgroundColor: '#fff',
  },
  typeButtonActive: {
    backgroundColor: '#008d36',
  },
}); 