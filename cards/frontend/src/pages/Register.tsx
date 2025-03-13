import { useState } from "react";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const app_name = 'cop4331-1.online';
  function buildPath(route:string) : string
  {
      if (process.env.NODE_ENV != 'development')
      {
          return 'http://' + app_name + ':5000/' + route;
      }
      else
      {
          return 'http://localhost:5000/' + route;
      }
  }

  const registerUser = async () => {
    if (!firstName || !lastName || !login || !password) {
      setMessage("All fields are required!");
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
        setMessage(`User registered successfully! ID: ${data.id}`);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage("Failed to connect to the server.");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Register</h1>
      <div style={styles.formBox}>
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
        <button style={styles.button} onClick={registerUser}>
          Register
        </button>
        <p style={styles.message}>{message}</p>
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
  },
  heading: {
    fontSize: "40px",
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
  message: {
    marginTop: "15px",
    fontSize: "14px",
    color: "red",
  },
};