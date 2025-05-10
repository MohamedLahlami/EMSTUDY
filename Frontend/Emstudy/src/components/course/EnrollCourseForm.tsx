import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useCourses } from "../../context/CourseContext";
import Button from "../ui/Button";
import Input from "../ui/Input";

const EnrollCourseForm: React.FC = () => {
  const [joinCode, setJoinCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { enrollInCourse } = useCourses();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      await enrollInCourse(joinCode);
      setSuccess(`Successfully enrolled in course with join code: ${joinCode}`);
      setJoinCode("");

      // Navigate to courses after a short delay
      setTimeout(() => {
        navigate("/courses");
      }, 2000);
    } catch (err) {
      console.error("Failed to enroll in course:", err);
      setError(
        "Failed to enroll in course. Please check the join code and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold mb-6">Enroll in a Course</h2>

      {error && (
        <div
          className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {success && (
        <div
          className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Input
            label="Join Code"
            id="joinCode"
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            required
            fullWidth
            placeholder="Enter the join code provided by your teacher"
            helperText="Ask your teacher for the code to join their course"
          />
        </div>

        <div>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            icon={<LogIn size={18} />}
          >
            Enroll
          </Button>
        </div>
      </form>

      <div className="mt-8 border-t pt-4">
        <h3 className="text-sm font-medium text-gray-500 mb-2">
          How to join a course:
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
          <li>Ask your teacher for the course join code</li>
          <li>Enter the join code in the field above</li>
          <li>Click "Enroll" to join the course</li>
          <li>Access course materials and quizzes from your dashboard</li>
        </ol>
      </div>
    </div>
  );
};

export default EnrollCourseForm;
