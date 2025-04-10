import { useState } from "react";
import { buildPath } from "../components/Path";

export default function ResendVerification() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleResendVerification = async () => {
    try {
      // First find the user ID by email
      const response = await fetch(buildPath('api/findUserByEmail'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok && data.userId) {
        // Then request verification email
        const verifyResponse = await fetch(buildPath('email/sendverification'), {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ userId: data.userId })
        });
        
        const verifyData = await verifyResponse.json();
        
        if (verifyResponse.ok) {
          setMessage("Verification email sent! Please check your inbox.");
        } else {
          setMessage(`Error: ${verifyData.error || 'Failed to send verification email'}`);
        }
      } else {
        setMessage(`Error: ${data.error || 'User not found'}`);
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setMessage("Failed to connect to the server. Please check your connection and try again.");
    }
  };

  return (
    <div>
      <h1>Resend Verification Email</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleResendVerification}>Resend Verification</button>
      <p>{message}</p>
    </div>
  );
}