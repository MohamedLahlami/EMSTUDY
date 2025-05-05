import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import AssignmentCalendar from './AssignmentCalendar';
import { useNavigate } from 'react-router-dom';
import { useCourses } from '../../context/CourseContext';
import { users, grades } from '../../data/mockData';

const TeacherDashboard = ({ courses, submissions, assignments }) => {
  const navigate = useNavigate();
  const { materials } = useCourses();
  
  const pendingGrading = submissions
    .filter(s => s.status === 'submitted')
    .map(submission => ({
      submission,
      assignment: assignments.find(a => a.id === submission.assignmentId),
      student: users.find(u => u.id === submission.studentId),
      course: courses.find(c => 
        assignments.some(a => a.id === submission.assignmentId && a.courseId === c.id)
      )
    }))
    .filter(item => item.assignment && item.student && item.course)
    .sort((a, b) => new Date(a.submission.submissionDate) - new Date(b.submission.submissionDate));

  const recentGrades = submissions
    .filter(s => s.status === 'graded')
    .map(submission => ({
      submission,
      assignment: assignments.find(a => a.id === submission.assignmentId),
      student: users.find(u => u.id === submission.studentId),
      grade: grades.find(g => g.submissionId === submission.id)
    }))
    .filter(item => item.assignment && item.student && item.grade)
    .sort((a, b) => new Date(b.grade.gradedDate) - new Date(a.grade.gradedDate))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Pending Submissions</h3>
            {pendingGrading.length > 0 ? (
              <div className="space-y-4">
                {pendingGrading.map(({ submission, assignment, student, course }) => (
                  <div key={submission.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">
                        {student.name} - {assignment.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        Course: {course.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Submitted: {format(new Date(submission.submissionDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/courses/${course.id}/assignments/${assignment.id}/submissions/${submission.id}`)}
                    >
                      Grade
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">No pending submissions</p>
            )}
          </CardContent>
        </Card>

        <AssignmentCalendar 
          assignments={assignments.filter(a => 
            courses.some(c => c.id === a.courseId)
          )} 
          materials={materials.filter(m => 
            courses.some(c => c.id === m.courseId)
          )} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Grades</h3>
            {recentGrades.length > 0 ? (
              <div className="space-y-4">
                {recentGrades.map(({ submission, assignment, student, grade }) => (
                  <div key={submission.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">
                        {student.name} - {assignment.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        Score: {grade.score} points
                      </p>
                      <p className="text-xs text-gray-500">
                        Graded: {format(new Date(grade.gradedDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">No recent grades</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Course Statistics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courses.map(course => {
                const courseSubmissions = submissions.filter(s => 
                  assignments.some(a => a.courseId === course.id && a.id === s.assignmentId)
                );
                
                const totalStudents = course.studentIds.length;
                const courseAssignments = assignments.filter(a => a.courseId === course.id);
                const completionRate = courseAssignments.length && totalStudents ? 
                  (courseSubmissions.filter(s => s.status === 'graded').length / 
                  (courseAssignments.length * totalStudents)) * 100 : 0;

                return (
                  <div key={course.id} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">{course.name}</h4>
                    <div className="mt-2 space-y-1 text-sm">
                      <p className="text-gray-600">Students: {totalStudents}</p>
                      <p className="text-gray-600">
                        Completion Rate: {Math.round(completionRate)}%
                      </p>
                      <p className="text-gray-600">
                        Pending Grades: {courseSubmissions.filter(s => s.status === 'submitted').length}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;