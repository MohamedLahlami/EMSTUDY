import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FileText, Clock, ArrowLeft, Users, CheckCircle } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CourseContext';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import SubmissionForm from '../../components/assignment/SubmissionForm';
import GradingForm from '../../components/assignment/GradingForm';

const AssignmentViewPage = () => {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    getCourseById, 
    getAssignmentById, 
    getAssignmentSubmissions,
    getStudentSubmission,
    createSubmission,
    createGrade
  } = useCourses();

  const [quizStarted, setQuizStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [submissionToGrade, setSubmissionToGrade] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);

  // Ensure courseId and assignmentId are valid
  if (!courseId || !assignmentId) {
    return <Navigate to="/courses" />;
  }

  // Get data
  const course = getCourseById(courseId);
  const assignment = getAssignmentById(assignmentId);
  
  // Handle missing course or assignment
  if (!course) {
    return <Navigate to="/courses" />;
  }
  
  if (!assignment) {
    return <Navigate to={`/courses/${courseId}`} />;
  }

  // Derived state
  const isTeacher = currentUser?.id === course.teacherId;
  const isQuiz = assignment.type === 'quiz';
  const isPastDue = new Date(assignment.dueDate) < new Date();
  const submissions = isTeacher ? getAssignmentSubmissions(assignmentId) : [];
  const studentSubmission = !isTeacher ? getStudentSubmission(assignmentId, currentUser?.id) : null;
  const hasSubmitted = !!studentSubmission;

  // Start quiz timer when quiz is started
  useEffect(() => {
    if (quizStarted && isQuiz && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            clearInterval(interval);
            handleSubmit({ answers: [] }); // Auto-submit when time runs out
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      setTimerInterval(interval);
      
      return () => clearInterval(interval);
    }
  }, [quizStarted, isQuiz, timeRemaining]);

  // Handle submit function for useEffect dependency
  const handleSubmit = async (submissionData) => {
    try {
      setIsSubmitting(true);
      await createSubmission({
        assignmentId,
        studentId: currentUser?.id,
        submissionDate: new Date().toISOString(),
        status: 'submitted',
        ...submissionData
      });
      setIsSubmitting(false);
      setQuizStarted(false);
      if (timerInterval) {
        clearInterval(timerInterval);
      }
      navigate(`/courses/${courseId}`);
    } catch (error) {
      console.error('Failed to submit assignment:', error);
      setIsSubmitting(false);
    }
  };

  // Clear timer interval on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setShowSubmissionForm(true);
  };

  const handleGradeSubmission = (submissionId) => {
    const submission = submissions.find(s => s.id === submissionId);
    if (submission) {
      setSubmissionToGrade(submission);
    }
  };

  const handleSubmitGrade = async (gradeData) => {
    try {
      setIsSubmitting(true);
      await createGrade({
        ...gradeData,
        gradedDate: new Date().toISOString()
      });
      setIsSubmitting(false);
      setSubmissionToGrade(null);
    } catch (error) {
      console.error('Failed to submit grade:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className="mb-4">
        <Button
          variant="outline"
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate(`/courses/${courseId}`)}
        >
          Back to Course
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {assignment.title}
              </h1>
              <p className="text-gray-700 mb-4">{assignment.description}</p>
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Due: {format(new Date(assignment.dueDate), 'MMM d, yyyy h:mm a')}</span>
                </div>
                <div>Points: {assignment.totalPoints}</div>
                <div>Type: {assignment.type === 'quiz' ? 'Quiz' : 'Homework'}</div>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isPastDue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              {isPastDue ? 'Past due' : 'Active'}
            </div>
          </div>
        </div>
      </div>

      {isTeacher ? (
        // Teacher View
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Assignment Details</h2>
              <div className="space-y-4">
                {isQuiz && assignment.questions && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Quiz Questions</h3>
                    {assignment.questions.map((question, index) => (
                      <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-medium text-gray-900">
                          {index + 1}. {question.text}
                        </p>
                        <div className="mt-2 space-y-1">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className={`flex items-center space-x-2 text-sm ${
                              question.correctAnswers.includes(optIndex.toString())
                                ? 'text-green-600'
                                : 'text-gray-600'
                            }`}>
                              <span>
                                {question.correctAnswers.includes(optIndex.toString()) ? '✓' : '○'}
                              </span>
                              <span>{option}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          Points: {question.points}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Student Submissions</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{submissions.length} submissions</span>
                </div>
              </div>
              
              {submissions.length > 0 ? (
                <div className="space-y-4">
                  {submissions.map(submission => {
                    const student = course.students?.find(s => s.id === submission.studentId);
                    const isGraded = submission.status === 'graded';
                    
                    return (
                      <div key={submission.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            {student?.name || 'Unknown Student'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Submitted: {format(new Date(submission.submissionDate), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isGraded ? (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              <span>Graded</span>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGradeSubmission(submission.id)}
                            >
                              Grade
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No submissions yet
                </div>
              )}
            </CardContent>
          </Card>

          {submissionToGrade && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Grade Submission</h2>
                <GradingForm
                  submission={submissionToGrade}
                  assignment={assignment}
                  onSubmit={handleSubmitGrade}
                  isLoading={isSubmitting}
                />
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSubmissionToGrade(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        // Student View
        <div className="space-y-6">
          {isQuiz ? (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Quiz</h2>
                
                {hasSubmitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Quiz Submitted</h3>
                    <p className="text-gray-500">
                      You've already submitted this quiz on{' '}
                      {format(new Date(studentSubmission.submissionDate), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                ) : isPastDue ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Quiz Unavailable</h3>
                    <p className="text-gray-500">
                      This quiz is past due and no longer available.
                    </p>
                  </div>
                ) : quizStarted ? (
                  <div>
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                      <span className="font-medium text-blue-700">Time Remaining</span>
                      <span className="font-mono text-blue-700">{formatTime(timeRemaining)}</span>
                    </div>
                    <SubmissionForm
                      assignment={assignment}
                      onSubmit={handleSubmit}
                      isLoading={isSubmitting}
                    />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to start?</h3>
                    <p className="text-gray-500 mb-4">
                      This quiz contains {assignment.questions?.length || 0} questions and must be completed within 30 minutes.
                    </p>
                    <Button
                      variant="primary"
                      onClick={handleStartQuiz}
                    >
                      Start Quiz
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Assignment Submission</h2>
                
                {hasSubmitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Assignment Submitted</h3>
                    <p className="text-gray-500">
                      You've already submitted this assignment on{' '}
                      {format(new Date(studentSubmission.submissionDate), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                ) : (
                  <SubmissionForm
                    assignment={assignment}
                    onSubmit={handleSubmit}
                    isLoading={isSubmitting}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </PageLayout>
  );
};

export default AssignmentViewPage; 