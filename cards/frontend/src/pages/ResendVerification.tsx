import { useState } from "react";
import { buildPath } from "../components/Path";
import { useNavigate } from "react-router-dom";
import backgroundImage from "./images/background.jpg";

export default function ResendVerification() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleResendVerification = async () => {
    try {
      // First find the user ID by email
      const response = await fetch(buildPath('api/findUserByEmail'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok && data.userId) {
        // Then request verification email
        const verifyResponse = await fetch(buildPath('email/sendverification'), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
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
    <div style={styles.container}>
      <div style={styles.authContainer}>
        <div style={styles.authBox}>
          <h1 style={styles.authHeading}>Resend Verification Email</h1>
          <div style={styles.formBox}>
            <input
              style={styles.input}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button style={styles.button} onClick={handleResendVerification}>
              Resend Verification
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