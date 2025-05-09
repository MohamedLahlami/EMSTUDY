import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";
import Input from "../ui/Input";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // Combined loading state with the auth context
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
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Or{" "}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            create a new account
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
        <div className="rounded-md -space-y-px">
          <div className="mb-4">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              label="Password"
              fullWidth
            />
          </div>
        </div>

        <div>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmitting}
            icon={<LogIn size={18} />}
          >
            Sign in
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default LoginForm;
