import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const UserPage = () => {
  const role = localStorage.getItem('role');

  if ((role !== "USER") && (role !== "INTERN")) {
    return <div style={styles.error}>Error: Forbidden</div>;
  }

  const buttonBaseStyles = {
    padding: "15px 30px",
    fontSize: "20px",
    cursor: "pointer",
    backgroundColor: "#FF7093",
    color: "black",
    border: "none",
    borderRadius: "5px",
    textDecoration: "none",
    transform: "scale(1)",
    transition: "background-color 0.3s, color 0.3s, transform 0.3s, box-shadow 0.3s",
    boxShadow: "none",
  };

  const buttonHoverStyles = {
    backgroundColor: "#8BC34A",
    color: "#fff",
    transform: "scale(1.05)",
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1), 0 0 25px rgba(0, 0, 0, 0.1), 0 0 30px rgba(139, 195, 74, 0.5)", // Green shadow
  };

  return (
    <div style={styles.container}>
      <Navbar /> 
      <div style={styles.buttonContainer}>
        <Link
          to="/request"
          style={buttonBaseStyles}
          onMouseOver={(e) => Object.assign(e.currentTarget.style, buttonHoverStyles)}
          onMouseOut={(e) => Object.assign(e.currentTarget.style, buttonBaseStyles)}
        >
          My Requests
        </Link>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: "900px",
    margin: "0 auto",
    textAlign: "center",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh", 
  },
};

export default UserPage;
