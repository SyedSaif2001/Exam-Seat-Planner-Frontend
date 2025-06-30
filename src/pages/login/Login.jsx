import React, { useState } from "react";
import Container from "../../components/shared/container/Container";
import InputText from "../../components/shared/input-fields/input-text-field/InputTextField";
import InputPasswordField from "../../components/shared/input-fields/input-password-field/InputPasswordField";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // TODO: Integrate with backend API for login
      // Example placeholder:
      // await loginUser({ identifier, password });
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: identifier,
          password: password,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Login failed");
        return;
      }
      const data = await response.json();
      // Save user role to localStorage or state
      localStorage.setItem("role", data.role || "student");
      // Redirect based on role
      if (data.role === "student") {
        navigate("/student-dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };
  return (
    <div className="w-full flex justify-center">
      <Container className="py-[35px] px-[30px]">
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <InputText
            label="CMS ID or Email ID"
            placeholder="Enter your CMS ID or Email ID"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            error={error}
          />
          <InputPasswordField
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={error}
          />
          <button type="submit" className="bg-blue-500 text-white py-2 rounded-lg w-full">
            Sign In
          </button>
          {error && <div className="text-red-500 text-center">{error}</div>}
        </form>
        <div className="flex justify-center gap-2 mt-4">
          <p className="">Don't have an account?</p>
          <Link
            to="/sign-up"
            className="text-blue-500 underline underline-offset-2"
          >
            Sign up
          </Link>
        </div>
      </Container>
    </div>
  );
};

export default LoginPage;
