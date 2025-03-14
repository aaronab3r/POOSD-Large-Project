git import React, { useState } from "react";

export default function Index(){
  return (
    <div style={styles.container} styles ={{ backgroundImage: "url('./images/background.png')" }}>
    <h1 style={styles.heading}>Welcome to Fish Net!</h1>
    <div className={styles.card}>
          <div className="flex gap-4">
            <button className={`${styles.button} ${styles.button}`}>Login</button>
            <button className={`${styles.button} ${styles.button}`}>Sign Up</button>
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
    height: "100vh",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  card: {
    backgroundColor:"white",
    backgroundOpacity:"50",
  },
  heading: {
    fontSize: "40px",
    color: "white",
  },
  subheading: {
    fontSize: "30px",
    color: "white",
  },
  button: {
    marginTop: "10px",
    padding: "5px",
    width: "100px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "gray",
    fontSize: "14px",
    cursor: "pointer",
  }
}