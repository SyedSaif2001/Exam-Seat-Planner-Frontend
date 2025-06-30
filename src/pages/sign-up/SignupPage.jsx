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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.password || !formData.confirmPassword) {
      setError("Please fill in all password fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (role === "student" && (!formData.cms_id || !formData.name || !formData.email || !formData.faculty || !formData.department || !formData.batch)) {
      setError("Please fill in all student fields");
      return;
    }

    if (role === "admin" && (!formData.name || !formData.email || !formData.faculty || !formData.department || !formData.batch)) {
      setError("Please fill in all admin/staff fields");
      return;
    }

    try {
      // TODO: Integrate with backend API for registration
      // Example placeholder:
      // await registerUser({ ...formData, role });
      console.log("Signup data:", {
        role,
        ...formData
      });
      
      // For now, just show success message
      alert("Account created successfully! Please login.");
      // You can redirect to login page here if needed
    } catch (err) {
      setError("Signup failed. Please try again.");
    }
  };

  return (
    <div className="w-full flex justify-center">
      <Container className="py-[35px] px-[30px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Role Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sign up as
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="student">Student</option>
              <option value="admin">Admin / Staff</option>
            </select>
          </div>

          {/* Name Input */}
          <InputText
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />

          {/* CMS ID Input (Student only) */}
          <div className={role !== "student" ? "opacity-50 pointer-events-none" : ""}>
            <InputText
              label="CMS ID"
              placeholder="Enter your CMS ID"
              value={formData.cms_id}
              onChange={(e) => handleInputChange("cms_id", e.target.value)}
              disabled={role !== "student"}
            />
          </div>

          {/* Email Input */}
          <InputText
            label="Email Address"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />

          {/* Faculty Input */}
          <InputText
            label="Faculty"
            placeholder="Enter your faculty"
            value={formData.faculty}
            onChange={(e) => handleInputChange("faculty", e.target.value)}
          />

          {/* Department Input */}
          <InputText
            label="Department"
            placeholder="Enter your department"
            value={formData.department}
            onChange={(e) => handleInputChange("department", e.target.value)}
          />

          {/* Batch Input */}
          <InputText
            label="Batch"
            placeholder="Enter your batch"
            value={formData.batch}
            onChange={(e) => handleInputChange("batch", e.target.value)}
          />

          {/* Password Fields */}
          <InputPasswordField
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
          />
          <InputPasswordField
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
          />

          {/* Error Message */}
          {error && <div className="text-red-500 text-center text-sm">{error}</div>}

          {/* Submit Button */}
          <button type="submit" className="bg-blue-500 text-white py-2 rounded-lg w-full">
            Sign Up
          </button>
        </form>

        {/* Login Redirect */}
        <div className="flex justify-center gap-2 mt-4">
          <p>Already have an account?</p>
          <Link
            to="/login"
            className="text-blue-500 underline underline-offset-2"
          >
            Login
          </Link>
        </div>
      </Container>
    </div>
  );
};

export default SignupPage;
