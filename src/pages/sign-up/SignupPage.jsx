import React, { useState } from "react";
import { Link } from "react-router-dom";
import Container from "../../components/shared/container/Container";
import InputText from "../../components/shared/input-fields/input-text-field/InputTextField";
import InputPasswordField from "../../components/shared/input-fields/input-password-field/InputPasswordField";

const SignupPage = () => {
  const [role, setRole] = useState("student");
  const [formData, setFormData] = useState({
    cms_id: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    faculty: "",
    department: "",
    batch: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          role,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Signup failed");
        setLoading(false);
        return;
      }
      
      setLoading(false);
      alert("Account created successfully! Please login.");
      window.location.href = "/login";
    } catch (err) {
      setError("Signup failed. Please try again.");
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
            className="h-24 mb-14"
          />
          
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sign Up As</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="student">Student</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Name */}
          <InputText
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />

          {/* CMS ID (Student only) */}
          {role === "student" && (
            <InputText
              label="CMS ID"
              placeholder="Enter your CMS ID"
              value={formData.cms_id}
              onChange={(e) => handleInputChange("cms_id", e.target.value)}
            />
          )}

          {/* Email */}
          <InputText
            label="Email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />

          {/* Faculty */}
          <InputText
            label="Faculty"
            placeholder="Enter your faculty"
            value={formData.faculty}
            onChange={(e) => handleInputChange("faculty", e.target.value)}
          />

          {/* Department */}
          <InputText
            label="Department"
            placeholder="Enter your department"
            value={formData.department}
            onChange={(e) => handleInputChange("department", e.target.value)}
          />

          {/* Batch (Student only) */}
          {role === "student" && (
            <InputText
              label="Batch"
              placeholder="Enter your batch"
              value={formData.batch}
              onChange={(e) => handleInputChange("batch", e.target.value)}
            />
          )}

          {/* Password */}
          <InputPasswordField
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
          />

          {/* Confirm Password */}
          <InputPasswordField
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
          />

          {error && <div className="text-red-500 text-center text-sm">{error}</div>}

          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md w-full font-medium transition-colors mt-2"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="flex justify-center gap-2 mt-4">
          <p className="text-sm text-gray-600">Already have an account?</p>
          <Link
            to="/login"
            className="text-blue-600 hover:underline text-sm"
          >
            Login
          </Link>
        </div>
      </Container>
    </div>
  );
};

export default SignupPage;