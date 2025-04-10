// ResetPassword.tsx
import { useState } from "react";
import { buildPath } from "../components/Path";
import { useNavigate } from "react-router-dom";
import backgroundImage from "./images/background.jpg";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
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
          "Content-Type": "application/json",
          "Accept": "application/json"
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
    <div style={styles.container}>
      <div style={styles.authContainer}>
        <div style={styles.authBox}>
          <h1 style={styles.authHeading}>Reset Password</h1>
          <div style={styles.formBox}>
            <input
              style={styles.input}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              style={styles.input}
              type="text"
              placeholder="Reset Code"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
            />
            <div style={styles.passwordContainer}>
              <input
                style={styles.input}
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                style={styles.requirementsButton}
                onMouseEnter={() => setShowPasswordRequirements(true)}
                onMouseLeave={() => setShowPasswordRequirements(false)}
              >
                ?
              </button>
              {showPasswordRequirements && (
                <div style={styles.requirementsTooltip}>
                  <p style={styles.requirementsTitle}>Password must contain:</p>
                  <ul style={styles.requirementsList}>
                    <li style={styles.requirementsItem}>At least 6 characters</li>
                    <li style={styles.requirementsItem}>One uppercase letter</li>
                    <li style={styles.requirementsItem}>One lowercase letter</li>
                    <li style={styles.requirementsItem}>One number</li>
                    <li style={styles.requirementsItem}>One special character</li>
                  </ul>
                </div>
              )}
            </div>
            <input
              style={styles.input}
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button style={styles.button} onClick={handleResetPassword}>
              Reset Password
            </button>
            <p style={styles.message}>{message}</p>
            <button
              style={styles.toggleButton}
              onClick={() => navigate('/')}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    width: "100vw",
  },
  authContainer: {
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100vw",
    height: "100vh",
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  },
  authBox: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: "40px",
    borderRadius: "20px",
    width: "400px",
  },
  authHeading: {
    fontSize: "32px",
    color: "white",
    textAlign: "center" as "center",
    marginBottom: "30px",
    fontWeight: "bold",
  },
  formBox: {
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    gap: "15px",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "2px solid #4dabf7",
    fontSize: "16px",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    boxSizing: "border-box" as "border-box",
    color: "black",
  },
  passwordContainer: {
    position: "relative" as "relative",
    width: "100%",
    display: "flex",
    alignItems: "center",
  },
  requirementsButton: {
    position: "absolute" as "absolute",
    right: "10px",
    backgroundColor: "#ff4444",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 1,
  },
  requirementsTooltip: {
    position: "absolute" as "absolute",
    right: "40px",
    top: "0",
    backgroundColor: "white",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    zIndex: 1000,
    width: "250px",
  },
  requirementsTitle: {
    color: "black",
    margin: "0 0 10px 0",
    fontWeight: "bold",
  },
  requirementsList: {
    margin: "0",
    paddingLeft: "20px",
  },
  requirementsItem: {
    color: "black",
    margin: "5px 0",
  },
  button: {
    backgroundColor: "#4dabf7",
    color: "white",
    padding: "12px 30px",
    borderRadius: "8px",
    border: "none",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
    marginTop: "10px",
  },
  toggleButton: {
    backgroundColor: "transparent",
    color: "white",
    border: "none",
    fontSize: "14px",
    cursor: "pointer",
    marginTop: "10px",
    textDecoration: "underline",
  },
  message: {
    color: "#ff4444",
    fontSize: "14px",
    marginTop: "10px",
    textAlign: "center" as "center",
  },
};