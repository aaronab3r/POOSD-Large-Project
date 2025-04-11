import { useState } from "react";
import { buildPath } from "../components/Path";
import { useNavigate } from "react-router-dom";
import backgroundImage from "./images/background.jpg";
import { jwtDecode } from "jwt-decode";
import { storeToken } from "../tokenStorage.tsx";
import Camera from '../../icons/cameraicon.png';
import Map from '../../icons/mapicon.png';
import Person from '../../icons/personicon.png'
import Services from '../components/Services.tsx';

interface JWTPayLoad {
  userId: number;
  firstName: string;
  lastName: string;
}

export default function WelcomePage() {
  const [showAuth, setShowAuth] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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

  const validateEmail = (email: string) => {
    return email.includes('@');
  };

  const requestVerificationEmail = async (userId: number) => {
    try {
      const response = await fetch(buildPath('email/sendverification'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage("Verification email sent! Please check your inbox.");
      } else {
        setMessage(`Error: ${data.error || 'Failed to send verification email'}`);
      }
    } catch (error) {
      console.error('Verification email request error:', error);
      setMessage("Failed to connect to the server. Please check your connection and try again.");
    }
  };


  const requestPasswordReset = async () => {
    if (!email) {
      setMessage("Please enter your email address");
      return;
    }
  
    if (!validateEmail(email)) {
      setMessage("Please enter a valid email address!");
      return;
    }
  
    try {
      const response = await fetch(buildPath('email/passwordreset'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ Email: email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage("Password reset email sent! Please check your inbox for the code.");
        // Optionally redirect to a password reset code entry page
        navigate('/reset-password');
      } else {
        setMessage(`Error: ${data.error || 'Failed to send password reset email'}`);
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      setMessage("Failed to connect to the server. Please check your connection and try again.");
    }
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !username || !password || !confirmPassword) {
      setMessage("All fields are required!");
      return;
    }

    if (!validateEmail(email)) {
      setMessage("Please enter a valid email address!");
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setMessage("Password does not meet complexity requirements!");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      console.log('Attempting to register...');
      const response = await fetch(buildPath('api/register'), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          firstName, 
          lastName, 
          login: username,
          password,
          email
        }),
      });

      console.log('Registration response status:', response.status);
      const data = await response.json();
      console.log('Registration response data:', data);

      if (response.ok) {
        setMessage(`Registration successful! User ID: ${data.id}`);
        // Request verification email
        await requestVerificationEmail(data.id);
        setShowRegister(false);
      } else {
        setMessage(`Error: ${data.error || 'Registration failed'}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage("Failed to connect to the server. Please check your connection and try again.");
    }
  };

  const handleLogin = async () => {
    if ((!email && !username) || !password) {
      setMessage("Please enter email/username and password.");
      return;
    }

    if (email && !validateEmail(email)) {
      setMessage("Please enter a valid email address!");
      return;
    }

    try {
      console.log('Attempting to login...');
      const response = await fetch(buildPath('api/login'), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          login: username || email,
          password 
        }),
      });

      console.log('Login response status:', response.status);
      const data = await response.json();
      console.log('Login response data:', data);

      if (!response.ok) {
        setMessage(data.error || 'Login failed');
        return;
      }

      const { accessToken } = data;
      if (!accessToken) {
        setMessage('No access token received');
        return;
      }

      try {
        const decoded = jwtDecode(accessToken) as JWTPayLoad;
        storeToken(accessToken);

        const ud = decoded;
        const userId = ud.userId;
        const firstName = ud.firstName;
        const lastName = ud.lastName;

        if (userId <= 0) {
          setMessage('User/Password combination incorrect');
        } else {
          const user = {firstName, lastName, id: userId};
          localStorage.setItem('user_data', JSON.stringify(user));
          setMessage('Login Successful!');
          navigate('/map');
        }
      } catch(e: any) {
        console.error('Token decoding error:', e);
        setMessage('Error processing login response');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage("Failed to connect to the server. Please check your connection and try again.");
    }
  };

  return (
    <div style={styles.container}>
      {!showAuth ? (
        // Welcome Screen
        <div>
          <div style={styles.welcomeContainer}>
            <div style={styles.homeBox}>
              <h1 style={styles.heading}>Welcome to FishNet!</h1>
              <p style={styles.subheading}>Make connections beyond the surface level</p>
              <button style={styles.button} onClick={() => setShowAuth(true)}>
                Get started
              </button>
            </div>
          </div>        
          <div style={styles.serviceContainer}> 
            <h1 style={styles.serviceHeading}>Dive into our services</h1>
            <div style={styles.services}>
              <Services icon={Camera} text="Upload discoveries" />
              <Services icon={Map} text="Map your dives" />
              <Services icon={Person} text="Connect with divers" />
            </div>
          </div>
        </div>
      ) : (
        // Login/Register Screen
        <div style={styles.authContainer}>
          <div style={styles.authBox}>
            <h1 style={styles.authHeading}>
              {showRegister ? "Create an Account" : "Welcome to FishNet"}
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
              {!showRegister ? (
                <>
                  <div style={styles.orContainer}>
                    <input
                      style={styles.input}
                      type="email"
                      placeholder="Email"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <div style={styles.orText}>OR</div>
                    <input
                      style={styles.input}
                      type="text"
                      placeholder="Username"
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <input
                    style={styles.input}
                    type="email"
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    style={styles.input}
                    type="text"
                    placeholder="Username"
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </>
              )}
              <div style={styles.passwordContainer}>
                <input
                  style={styles.input}
                  type="password"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                />
                {showRegister && (
                  <>
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
                  </>
                )}
              </div>
              {showRegister && (
                <div style={styles.passwordContainer}>
                  <input
                    style={styles.input}
                    type="password"
                    placeholder="Confirm Password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              )}

              {!showRegister && (
                <div style={styles.forgotPassword}>
                  <button 
                    style={styles.forgotPasswordButton}
                    onClick={requestPasswordReset}
                  >
                    Forgot Password?
                  </button>
                </div>
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
        </div>
      )}
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
  homeBox: {
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    marginTop: "170px",
    padding: "40px",
    maxHeight: "400px",
    borderRadius: "20px",
  },
  welcomeContainer: {
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100vw",
    minHeight: "80vh",
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  },
  serviceContainer: {
    backgroundColor: "rgb(24, 74, 139)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column" as "column",
    padding: "40px 0",
  },
  serviceHeading: {
    color: "white",
    fontSize: "32px",
    marginBottom: "30px",
  },
  services: {
    backgroundColor: "rgb(24, 74, 139)",
    display: "flex",
    flexDirection: "row" as "row",
    minHeight: "200px",
    width: "100vw",
    justifyContent: "center",
    alignItems: "center",
    gap: "40px",
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
  heading: {
    fontSize: "48px",
    color: "white",
    textAlign: "center" as "center",
    marginBottom: "20px",
    fontWeight: "bold",
  },
  authHeading: {
    fontSize: "32px",
    color: "white",
    textAlign: "center" as "center",
    marginBottom: "30px",
    fontWeight: "bold",
  },
  subheading: {
    fontSize: "24px",
    color: "white",
    textAlign: "center" as "center",
    marginBottom: "50px",
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
  forgotPassword: {
    width: "100%",
    textAlign: "right" as "right",
    marginTop: "-10px",
  },
  forgotPasswordButton: {
    backgroundColor: "transparent",
    color: "white",
    border: "none",
    fontSize: "14px",
    cursor: "pointer",
    textDecoration: "underline",
  },
  orContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    gap: "10px",
  },
  orText: {
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    margin: "5px 0",
  },
};
