import React, { useState } from "react";
import backgroundImage from "./images/background.jpg";

export default function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    if (!firstName || !lastName || !login || !password || !confirmPassword) {
      setMessage("All fields are required!");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://165.227.65.153:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, login, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Registration successful! User ID: ${data.id}`);
        setShowRegister(false); // Switch to login after successful registration
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage("Failed to connect to the server.");
    }
  };

  const handleLogin = async () => {
    if (!login || !password) {
      setMessage("Please enter username and password.");
      return;
    }

    try {
      const response = await fetch("http://165.227.65.153:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Login successful!");
        // Redirect to dashboard or another page if needed
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage("Failed to connect to the server.");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>
        {showRegister ? (
          <span>Create an Account</span> // Wrapped in <span> to match JSX type
        ) : (
          <span>
            Welcome to <br /> FishNet
          </span>
        )}
      </h1>
      <div style={styles.formBox}>
        {showRegister && (
          <>
            <input
              style={styles.input}
              type="text"
              placeholder="First Name"
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              style={styles.input}
              type="text"
              placeholder="Last Name"
              onChange={(e) => setLastName(e.target.value)}
            />
          </>
        )}
        <input
          style={styles.input}
          type="text"
          placeholder="Username"
          onChange={(e) => setLogin(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        {showRegister && (
          <input
            style={styles.input}
            type="password"
            placeholder="Confirm Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        )}

        {showRegister ? (
          <button style={styles.button} onClick={handleRegister}>
            Register
          </button>
        ) : (
          <button style={styles.button} onClick={handleLogin}>
            Login
          </button>
        )}

        <p style={styles.message}>{message}</p>

        <button
          style={styles.toggleButton}
          onClick={() => setShowRegister(!showRegister)}
        >
          {showRegister
            ? "Already have an account? Login"
            : "Don't have an account? Register"}
        </button>
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
    height: "100vh",
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  heading: {
    fontSize: "40px",
    textAlign: "center" as "center",
    display: "block",
    width: "100%",
    lineHeight: "1.2",
  },
  formBox: {
    marginTop: "20px",
    padding: "30px",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: "15px",
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
  },
  input: {
    margin: "10px",
    padding: "10px",
    width: "250px",
    borderRadius: "10px",
    border: "1px solid black",
  },
  button: {
    marginTop: "20px",
    padding: "10px",
    width: "150px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "yellow",
    fontSize: "16px",
    cursor: "pointer",
  },
  toggleButton: {
    marginTop: "15px",
    padding: "5px",
    width: "200px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "gray",
    fontSize: "14px",
    cursor: "pointer",
  },
  message: {
    marginTop: "15px",
    fontSize: "14px",
    color: "red",
  },
};
