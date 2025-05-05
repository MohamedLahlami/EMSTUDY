import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Book, FileText, Calendar, Users, Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';
import PageLayout from '../../components/layout/PageLayout';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import MaterialViewer from '../../components/course/MaterialViewer';
import AddMaterialForm from '../../components/course/AddMaterialForm';
import CreateQuizForm from '../../components/course/CreateQuizForm';

const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  
  const { currentUser } = useAuth();
  const { 
    getCourseById, 
    getCourseMaterials, 
    getCourseAssignments, 
    getCourseStudents,
    createMaterial,
    createAssignment,
    excludeStudentFromCourse
  } = useCourses();
  
  if (!courseId) {
    return <Navigate to="/courses" />;
  }
  
  const course = getCourseById(courseId);
  
  if (!course) {
    return <Navigate to="/courses" />;
  }
  
  const materials = getCourseMaterials(courseId);
  const assignments = getCourseAssignments(courseId);
  const students = getCourseStudents(courseId);
  
  const isTeacher = currentUser?.id === course.teacherId;

  const handleAddMaterial = async (materialData) => {
    try {
      await createMaterial({
        ...materialData,
        courseId
      });
      setShowAddMaterial(false);
    } catch (error) {
      console.error('Failed to add material:', error);
    }
  };

  const handleCreateAssignment = async (assignmentData) => {
    try {
      await createAssignment({
        ...assignmentData,
        courseId
      });
      setShowCreateAssignment(false);
    } catch (error) {
      console.error('Failed to create assignment:', error);
    }
  };

  const handleViewMaterial = (material) => {
    setSelectedMaterial(material);
  };

  const handleViewAssignment = (assignment) => {
    // Navigate to assignment view page
    window.location.href = `/courses/${courseId}/assignments/${assignment.id}`;
  };

  const handleExcludeStudent = (studentId) => {
    if (window.confirm('Are you sure you want to exclude this student from the course?')) {
      const success = excludeStudentFromCourse(courseId, studentId);
      if (success) {
        alert('Student has been excluded from the course');
        // Force a re-render
        setActiveTab('overview');
        setTimeout(() => setActiveTab('students'), 100);
      } else {
        alert('Failed to exclude student');
      }
    }
  };

  return (
    <PageLayout>
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-700">
          {course.coverImage && (
            <img 
              src={course.coverImage} 
              alt={course.name} 
              className="w-full h-full object-cover opacity-70"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <h1 className="text-3xl font-bold">{course.name}</h1>
            <p className="text-white text-opacity-90 mt-1">Code: {course.code}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap border-b">
          <button 
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          
          <button 
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'materials' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('materials')}
          >
            Materials
          </button>
          
          <button 
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'assignments' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('assignments')}
          >
            Assignments
          </button>
          
          {isTeacher && (
            <button 
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'students' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('students')}
            >
              Students
            </button>
          )}
        </div>
        
        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Course Description</h2>
              <p className="text-gray-700 mb-6">{course.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                      <h3 className="text-lg font-medium">Course Duration</h3>
                    </div>
                    <p className="text-gray-600">
                      {format(new Date(course.startDate), 'MMMM d, yyyy')} - {format(new Date(course.endDate), 'MMMM d, yyyy')}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center mb-2">
                      <Users className="h-5 w-5 text-blue-500 mr-2" />
                      <h3 className="text-lg font-medium">Enrolled Students</h3>
                    </div>
                    <p className="text-gray-600">{course.studentIds.length} students</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          {activeTab === 'materials' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Course Materials</h2>
                {isTeacher && (
                  <Button
                    variant="primary"
                    icon={<Plus size={18} />}
                    onClick={() => setShowAddMaterial(true)}
                  >
                    Add Material
                  </Button>
                )}
              </div>
              
              {materials.length > 0 ? (
                <div className="space-y-4">
                  {materials.map(material => (
                    <Card key={material.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 pt-1">
                            {material.type === 'pdf' && <FileText className="h-6 w-6 text-red-500" />}
                            {material.type === 'video' && <Book className="h-6 w-6 text-blue-500" />}
                            {material.type === 'link' && <Book className="h-6 w-6 text-green-500" />}
                            {material.type === 'text' && <Book className="h-6 w-6 text-purple-500" />}
                          </div>
                          <div className="ml-4 flex-1">
                            <h3 className="text-lg font-medium text-gray-900">{material.title}</h3>
                            <p className="mt-1 text-sm text-gray-500">{material.description}</p>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>Available from: {format(new Date(material.availableFrom), 'MMM d, yyyy')}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewMaterial(material)}
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No course materials yet</h3>
                  <p className="text-gray-500">
                    {isTeacher 
                      ? 'Add your first material to help your students learn.' 
                      : 'Your teacher has not added any materials yet.'}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'assignments' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Assignments</h2>
                {isTeacher && (
                  <Button
                    variant="primary"
                    icon={<Plus size={18} />}
                    onClick={() => setShowCreateAssignment(true)}
                  >
                    Create Assignment
                  </Button>
                )}
              </div>
              
              {assignments.length > 0 ? (
                <div className="space-y-4">
                  {assignments.map(assignment => (
                    <Card key={assignment.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 pt-1">
                            <FileText className="h-6 w-6 text-blue-500" />
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-medium text-gray-900">{assignment.title}</h3>
                              <div className="ml-2 flex-shrink-0 flex">
                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  new Date(assignment.dueDate) < new Date() 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {new Date(assignment.dueDate) < new Date() ? 'Past due' : 'Active'}
                                </p>
                              </div>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">{assignment.description}</p>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>Due: {format(new Date(assignment.dueDate), 'MMM d, yyyy')}</span>
                              <span className="ml-3">Points: {assignment.totalPoints}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            {isTeacher || assignment.type !== 'quiz' || new Date(assignment.dueDate) >= new Date() ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewAssignment(assignment)}
                              >
                                {!isTeacher && assignment.type === 'quiz' && new Date(assignment.dueDate) >= new Date() 
                                  ? 'Start Quiz' 
                                  : 'View'}
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
                  <p className="text-gray-500">
                    {isTeacher 
                      ? 'Create your first assignment for students.' 
                      : 'Your teacher has not assigned any work yet.'}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'students' && isTeacher && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Enrolled Students</h2>
              </div>
              
              {students.length > 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {students.map(student => (
                      <li key={student.id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {student.profilePicture ? (
                                  <img 
                                    className="h-10 w-10 rounded-full" 
                                    src={student.profilePicture} 
                                    alt={student.name} 
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                    <span className="text-gray-600 font-medium">
                                      {student.name.charAt(0)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                <div className="text-sm text-gray-500">{student.email}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Last login: {student.lastLogin ? format(new Date(student.lastLogin), 'MMM d, yyyy h:mm a') : 'Never'}
                                </div>
                              </div>
                            </div>
                            <div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExcludeStudent(student.id)}
                              >
                                Exclude Student
                              </Button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No students enrolled yet</h3>
                  <p className="text-gray-500">
                    Share your course code with students to allow them to enroll.
                  </p>
                  <div className="mt-4 inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-md">
                    <span className="text-gray-800 font-medium">{course.code}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Material Viewer Modal */}
      {selectedMaterial && (
        <MaterialViewer
          material={selectedMaterial}
          onClose={() => setSelectedMaterial(null)}
        />
      )}

      {/* Add Material Modal */}
      {showAddMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Add Course Material</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddMaterial(false)}
                >
                  Close
                </Button>
              </div>
              <AddMaterialForm
                onSubmit={handleAddMaterial}
                onCancel={() => setShowAddMaterial(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Create Assignment</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateAssignment(false)}
                >
                  Close
                </Button>
              </div>
              <CreateQuizForm
                onSubmit={handleCreateAssignment}
                onCancel={() => setShowCreateAssignment(false)}
              />
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default CourseDetailsPage;