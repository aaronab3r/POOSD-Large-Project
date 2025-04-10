// ResetPassword.tsx
import { useState } from "react";
import { buildPath } from "../components/Path";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const validatePassword = (pass: string) => {
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    const hasNumbers = /\d/.test(pass);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    const hasMinLength = pass.length >= 6;
    
    return {
      isValid: hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && hasMinLength,
      requirements: {
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar,
        hasMinLength
      }
    };
  };

  const handleResetPassword = async () => {
    if (!email || !resetCode || !newPassword || !confirmPassword) {
      setMessage("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setMessage("Password does not meet complexity requirements!");
      return;
    }

    try {
      const response = await fetch(buildPath('email/resetpassword'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          Email: email,
          ResetToken: resetCode,
          NewPassword: newPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage("Password reset successful! You can now login with your new password.");
        setTimeout(() => {
          navigate('/'); // Redirect to login page
        }, 3000);
      } else {
        setMessage(`Error: ${data.error || 'Password reset failed'}`);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setMessage("Failed to connect to the server. Please check your connection and try again.");
    }
  };

  return (
    <div>
      <h1>Reset Password</h1>
      <p>Password reset email sent! Please check your inbox for the code.</p>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="text"
        placeholder="Reset Code"
        value={resetCode}
        onChange={(e) => setResetCode(e.target.value)}
      />
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button onClick={handleResetPassword}>Reset Password</button>
      <p>{message}</p>
    </div>
  );
}