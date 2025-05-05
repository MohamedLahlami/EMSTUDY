import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { format } from 'date-fns';
import { Card, CardContent } from '../ui/Card';

const StudentProgress = ({ submissions, assignments }) => {
  const totalAssignments = assignments.length;
  const completedAssignments = submissions.filter(s => s.status === 'graded').length;
  const completionRate = totalAssignments > 0 
    ? (completedAssignments / totalAssignments) * 100 
    : 0;

  const averageScore = submissions
    .filter(s => s.status === 'graded')
    .reduce((acc, curr) => {
      const grade = grades.find(g => g.submissionId === curr.id);
      return grade ? acc + grade.score : acc;
    }, 0) / completedAssignments || 0;

  const upcomingDeadlines = assignments
    .filter(a => new Date(a.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Overall Progress</h3>
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24">
              <CircularProgressbar
                value={completionRate}
                text={`${Math.round(completionRate)}%`}
                styles={buildStyles({
                  pathColor: '#3B82F6',
                  textColor: '#1F2937',
                  trailColor: '#E5E7EB'
                })}
              />
            </div>
            <div>
              <p className="text-gray-600">
                Completed {completedAssignments} out of {totalAssignments} assignments
              </p>
              <p className="text-gray-600">
                Average Score: {averageScore.toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Deadlines</h3>
          {upcomingDeadlines.length > 0 ? (
            <div className="space-y-4">
              {upcomingDeadlines.map(assignment => {
                const daysLeft = Math.ceil(
                  (new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
                );
                
                return (
                  <div key={assignment.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{assignment.title}</p>
                      <p className="text-sm text-gray-500">
                        Due: {format(new Date(assignment.dueDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      daysLeft <= 1
                        ? 'bg-red-100 text-red-800'
                        : daysLeft <= 3
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center">No upcoming deadlines</p>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {submissions
              .sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate))
              .slice(0, 5)
              .map(submission => {
                const assignment = assignments.find(a => a.id === submission.assignmentId);
                const grade = grades.find(g => g.submissionId === submission.id);
                
                return (
                  <div key={submission.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">
                        {assignment?.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        Submitted: {format(new Date(submission.submissionDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    {grade ? (
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          Score: {grade.score}
                        </p>
                        <p className="text-sm text-gray-500">
                          Graded: {format(new Date(grade.gradedDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Pending
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProgress;