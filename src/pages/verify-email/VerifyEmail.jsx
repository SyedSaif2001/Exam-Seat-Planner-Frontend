import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing verification token.");
      return;
    }
    fetch("http://localhost:8080/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (res.ok) {
          setStatus("success");
          setMessage("Email verified successfully! You can now log in.");
        } else {
          const data = await res.json();
          setStatus("error");
          setMessage(data.error || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Verification failed. Please try again later.");
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
        {status === "pending" && <p>Verifying your email...</p>}
        {status !== "pending" && <p className={status === "success" ? "text-green-600" : "text-red-600"}>{message}</p>}
        {status === "success" && (
          <a href="/login" className="mt-4 inline-block text-blue-600 underline">Go to Login</a>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail; 