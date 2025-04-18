import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import backgroundImage from "./images/background.jpg";
import YourIndex from "./YourIndex";

export default function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const app_name = 'cop4331-1.online';

  function buildPath(route: string): string {
    return process.env.NODE_ENV !== 'development'
      ? `http://${app_name}:5000/${route}`
      : `http://localhost:5000/${route}`;
  }

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
      const response = await fetch(buildPath('api/register'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, login, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Registration successful! User ID: ${data.id}`);
        setShowRegister(false); //Switch to login after successful registration
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
      const response = await fetch(buildPath('api/login'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Login successful!");
        // Redirect after login
        window.location.href = '/your-index'; 
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage("Failed to connect to the server.");
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/your-index" element={<YourIndex />} />
        <Route path="/" element={
          <div style={styles.container}>
            {!showAuth ? (
              // Welcome Screen
              <div style={styles.welcomeContainer}>
                <h1 style={styles.heading}>Welcome to Fish Net!</h1>
                <div style={styles.card}>
                  <button style={styles.button} onClick={() => setShowAuth(true)}>
                    Start Diving
                  </button>
                  <Link to="/your-index" style={styles.bypassButton}>
                    Bypass
                  </Link>
                </div>
              </div>
            ) : (
              // Login/Register Screen
              <div style={styles.authContainer}>
                <h1 style={styles.heading}>
                  {showRegister ? (
                    <span>Create an Account</span>
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
                    {showRegister ? "Already have an account? Login" : "Don't have an account? Register"}
                  </button>

                  <button
                    style={styles.toggleButton}
                    onClick={() => setShowAuth(false)}
                  >
                    Back to Welcome Page
                  </button>
                </div>
              </div>
            )}
          </div>
        } />
      </Routes>
    </Router>
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
  welcomeContainer: {
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
  authContainer: {
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontSize: "40px",
    color: "white",
    textAlign: "center" as "center",
  },
  card: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    display:"flex",
    justifyContent: "center", 
    alignItems: "center", 
    flexDirection: "column" as "column", 
    minWidth: "200px", 
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
    padding: "10px",
    width: "150px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "yellow",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
  bypassButton: {
    marginTop: "10px",
    padding: "5px 10px",
    width: "100px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#ff4444",
    color: "white",
    fontSize: "12px",
    cursor: "pointer",
    textDecoration: "none",
    textAlign: "center" as "center",
  },
};
