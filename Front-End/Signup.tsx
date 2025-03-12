import React, { useState } from "react";
import background from "./assets/background.jpg";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const signUp = () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    alert(`Signed up with Username: ${username}`);
  };

  const login = () => {
    alert("Redirecting to login...");
  };

  return (
    <div style={{ ...styles.container, backgroundImage: `url(${background})` }}>
      <h1 style={styles.heading}>Welcome to Fish Net</h1>
      <div style={styles.formBox}>
        <input
          style={styles.input}
          type="text"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Confirm Password"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        
        {/* Login Button (Smaller than Sign Up) */}
        <button style={styles.loginButton} onClick={login}>
          Login
        </button>

        {/* Sign Up Button */}
        <button style={styles.button} onClick={signUp}>
          Sign Up
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
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  heading: {
    fontSize: "40px",
    color: "white",
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
  loginButton: {
    marginTop: "10px",
    padding: "5px",
    width: "100px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "gray",
    fontSize: "14px",
    cursor: "pointer",
  },
  button: {
    marginTop: "15px",
    padding: "10px",
    width: "150px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "yellow",
    fontSize: "16px",
    cursor: "pointer",
  },
};
