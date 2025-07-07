import React, { useState } from "react";
import Container from "../../components/shared/container/Container";
import InputText from "../../components/shared/input-fields/input-text-field/InputTextField";
import InputPasswordField from "../../components/shared/input-fields/input-password-field/InputPasswordField";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
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
        body: JSON.stringify({ identifier: email, password }),
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
      console.log('Profile from backend:', profile);
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
    <div className="w-full flex justify-center">
      <Container className="py-[35px] px-[30px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputText
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
          />
          <InputPasswordField
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
          />
          <button type="submit" className="bg-blue-500 text-white py-2 rounded-lg w-full" disabled={loading}>
            {loading ? "Logging In..." : "Login"}
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
