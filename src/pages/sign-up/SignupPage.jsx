import React, { useState } from "react";
import Container from "../../components/shared/container/Container";
import InputText from "../../components/shared/input-fields/input-text-field/InputTextField";
import InputPasswordField from "../../components/shared/input-fields/input-password-field/InputPasswordField";

const SignupPage = () => {
  const [role, setRole] = useState("student");

  return (
    <div className="w-full flex justify-center">
      <Container className="py-[35px] px-[30px]">
        <div className="flex flex-col gap-4">

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

          {/* CMS ID Input */}
          <div className={role !== "student" ? "opacity-50 pointer-events-none" : ""}>
            <InputText
              label="CMS ID"
              placeholder="Enter your CMS ID"
              disabled={role !== "student"}
            />
          </div>

          {/* Email Input */}
          <div className={role !== "admin" ? "opacity-50 pointer-events-none" : ""}>
            <InputText
              label="Email Address"
              placeholder="Enter your email"
              disabled={role !== "admin"}
            />
          </div>

          {/* Password Fields */}
          <InputPasswordField
            label="Password"
            placeholder="Enter your password"
          />
          <InputPasswordField
            label="Confirm Password"
            placeholder="Confirm your password"
          />

          {/* Submit Button */}
          <button className="bg-blue-500 text-white py-2 rounded-lg w-full">
            Sign In
          </button>
        </div>

        {/* Sign Up Redirect */}
        <div className="flex justify-center gap-2 mt-4">
          <p>Don't have an account?</p>
          <a href="#" className="text-blue-500 underline underline-offset-2">
            Sign up
          </a>
        </div>
      </Container>
    </div>
  );
};

export default SignupPage;
