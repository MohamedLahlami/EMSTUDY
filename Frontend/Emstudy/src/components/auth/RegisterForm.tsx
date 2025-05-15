import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { UserDTO } from "../../api/authApi";
import Button from "../ui/Button";
import Input from "../ui/Input";

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<UserDTO>({
    username: "",
    email: "",
    password: "",
    role: "Student",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setIsLoading(true);

    try {
      await register(formData);
      navigate("/login");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to register. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Combined loading state
  const isSubmitting = isLoading || authLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md"
    >
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Or{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            sign in to your existing account
          </Link>
        </p>
      </div>

      {error && (
        <div
          className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md space-y-4">
          <div>
            <Input
              id="username"
              name="username"
              type="text"
              autoComplete="name"
              required
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Username"
              label="Username"
              fullWidth
            />
          </div>

          <div>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email address"
              label="Email address"
              fullWidth
            />
          </div>

          <div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              label="Password"
              fullWidth
            />
          </div>

          <div>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              label="Confirm password"
              fullWidth
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              I am a:
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="role"
                  value="Student"
                  checked={formData.role === "Student"}
                  onChange={handleInputChange}
                />
                <span className="ml-2">Student</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="role"
                  value="Teacher"
                  checked={formData.role === "Teacher"}
                  onChange={handleInputChange}
                />
                <span className="ml-2">Teacher</span>
              </label>
            </div>
          </div>

          {/* For teachers */}
          {formData.role === "Teacher" && (
            <div>
              <Input
                id="bio"
                name="bio"
                type="text"
                value={formData.bio || ""}
                onChange={handleInputChange}
                placeholder="Brief bio (for teachers)"
                label="Bio"
                fullWidth
              />
            </div>
          )}

          {/* For students */}
          {formData.role === "Student" && (
            <div>
              <Input
                id="studentGroup"
                name="studentGroup"
                type="text"
                value={formData.studentGroup || ""}
                onChange={handleInputChange}
                placeholder="Student Group (e.g. Class/Year)"
                label="Student Group"
                fullWidth
              />
            </div>
          )}
        </div>

        <div>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmitting}
            icon={<UserPlus size={18} />}
          >
            Create account
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default RegisterForm;
