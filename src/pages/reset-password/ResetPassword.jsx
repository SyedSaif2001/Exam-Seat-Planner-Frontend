import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing reset token.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }
    setStatus("pending");
    setMessage("");
    try {
      const res = await fetch("http://localhost:8080/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      if (res.ok) {
        setStatus("success");
        setMessage("Password reset successfully! You can now log in.");
      } else {
        const data = await res.json();
        setStatus("error");
        setMessage(data.error || "Failed to reset password.");
      }
    } catch {
      setStatus("error");
      setMessage("Failed to reset password. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="New password"
            className="border p-2 rounded"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm new password"
            className="border p-2 rounded"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" className="bg-blue-600 text-white py-2 rounded" disabled={status === "pending"}>
            {status === "pending" ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        {message && <p className={status === "success" ? "text-green-600" : "text-red-600"}>{message}</p>}
        {status === "success" && (
          <a href="/login" className="mt-4 inline-block text-blue-600 underline">Go to Login</a>
        )}
      </div>
    </div>
  );
};

export default ResetPassword; 