import React, { useState } from "react";
import Container from "../../components/shared/container/Container";
import InputText from "../../components/shared/input-fields/input-text-field/InputTextField";
import InputPasswordField from "../../components/shared/input-fields/input-password-field/InputPasswordField";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [cmsId, setCmsId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: cmsId, password }),
      });
      if (!res.ok) throw new Error("Invalid credentials");
      const data = await res.json();
      localStorage.setItem("token", data.token);
      // Fetch user profile to get role
      const profileRes = await fetch("http://localhost:8080/api/profile", {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      if (!profileRes.ok) throw new Error("Failed to fetch profile");
      const profile = await profileRes.json();
      console.log("Profile from backend:", profile);
      localStorage.setItem("role", profile.role);
      localStorage.setItem("user", JSON.stringify(profile));
      // Redirect based on role
      if (profile.role === "admin") navigate("/dashboard");
      else if (profile.role === "staff") navigate("/staff-dashboard");
      else if (profile.role === "student") navigate("/student-dashboard");
      else navigate("/unauthorized");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center items-center min-h-screen bg-gray-300">
      <Container className="py-8 px-8 max-w-md">
        <div className="flex flex-col items-center mb-0">
          <img 
            src="/public/assets/esp-logo.png" 
            alt="Exam Seat Plan Logo" 
            className="h-24 mb-16" 
          />
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CMS ID</label>
            <InputText
              placeholder="Enter your CMS ID"
              value={cmsId}
              onChange={(e) => setCmsId(e.target.value)}
              error={error}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <InputPasswordField
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error}
              className="w-full"
            />
          </div>
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md w-full font-medium transition-colors" 
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
          {error && <div className="text-red-500 text-center text-sm">{error}</div>}
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have any account?{" "}
            <Link
              to="/sign-up"
              className="text-blue-600 hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </Container>
    </div>
  );
};

export default LoginPage;