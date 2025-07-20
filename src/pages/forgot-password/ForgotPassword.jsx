import React, { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("pending");
    setMessage("");
    try {
      const res = await fetch("http://localhost:8080/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setMessage("If your email is registered, a reset link has been sent.");
      } else {
        const data = await res.json();
        setStatus("error");
        setMessage(data.error || "Failed to send reset email.");
      }
    } catch {
      setStatus("error");
      setMessage("Failed to send reset email. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="border p-2 rounded"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="bg-blue-600 text-white py-2 rounded" disabled={status === "pending"}>
            {status === "pending" ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        {message && <p className={status === "success" ? "text-green-600" : "text-red-600"}>{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword; 