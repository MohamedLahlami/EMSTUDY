import React from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import LoginForm from "../../components/auth/LoginForm";

const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // If already authenticated, redirect to dashboard
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8"
      >
        <img
          src={import.meta.env.BASE_URL + "src/static/emsi.svg"}
          alt="EMSI Logo"
          className="mx-auto h-12 w-12"
        />
        <h1 className="mt-3 text-3xl font-extrabold text-[#008d36]">EMSTUDY</h1>
        <p className="mt-2 text-sm text-gray-600">
          Your virtual classroom platform
        </p>
      </motion.div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
