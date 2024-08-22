import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER_BY_ID, UPDATE_USER } from '../queries/RequestQueries';
import Modal from "../components/Modal";

const Profile = () => {
  const userId = localStorage.getItem('id');
  const token = localStorage.getItem('authToken');
  const { loading, error, data } = useQuery(GET_USER_BY_ID, {
    variables: { id: userId },
    context: {
      headers: {
        authorization: `${token}`,
      },
    },
  });

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [changePasswordData, setChangePasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState(""); // success or error

  const [updateUser] = useMutation(UPDATE_USER, {
    context: {
      headers: {
        authorization: `${token}`,
      },
    },
    onCompleted: (data) => {
      if (data.updateUser.entityResponse.message === "User updated successfully") {
        setNotification("Password changed successfully!");
        setNotificationType("success");
      } else {
        setNotification("Failed to change password.");
        setNotificationType("error");
      }
    },
    onError: () => {
      setNotification("Failed to change password.");
      setNotificationType("error");
    },
  });

  const handleOpenChangePasswordModal = () => {
    setIsChangePasswordOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setChangePasswordData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCloseChangePasswordModal = () => {
    setIsChangePasswordOpen(false);
    setChangePasswordData({ newPassword: "", confirmPassword: "" }); // Clear form data
  };

  // Validate password
  const validatePassword = (password) => {
    const minLength = 6;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    return password.length >= minLength && hasLetter && hasDigit;
  };

  const handleSavePasswordChange = async () => {
    const { newPassword, confirmPassword } = changePasswordData;
    if (newPassword !== confirmPassword) {
      setNotification("Passwords do not match!");
      setNotificationType("error");
      setChangePasswordData({ newPassword: "", confirmPassword: "" });
      return;
    }

    if (!validatePassword(newPassword)) {
      setNotification("Password must be at least 6 characters long and contain both a letter and a digit");
      setNotificationType("error");
      setChangePasswordData({ newPassword: "", confirmPassword: "" });
      return;
    }

    try {
      await updateUser({
        variables: {
          id: userId,
          user: {
            password: newPassword,
          },
        },
      });
    } catch (error) {
      setNotification("Failed to change password.");
      setNotificationType("error");
    }

    handleCloseChangePasswordModal();
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const user = data?.getUserById?.data;

  if (!user) {
    return <p>No user data found.</p>;
  }

  return (
    <div style={styles.profileContainer}>
      <h1 style={styles.heading}>Profile</h1>
      <div style={styles.profileInfo}>
        <p style={styles.profileItem}><strong>First Name:</strong> {user.firstName}</p>
        <p style={styles.profileItem}><strong>Last Name:</strong> {user.lastName}</p>
        <p style={styles.profileItem}><strong>Role:</strong> {localStorage.getItem('role')}</p>
      </div>
      <button
        style={{ ...buttonBaseStyles, marginTop: "20px" }}
        onClick={handleOpenChangePasswordModal}
        onMouseOver={(e) => Object.assign(e.currentTarget.style, buttonHoverStyles)}
        onMouseOut={(e) => Object.assign(e.currentTarget.style, buttonBaseStyles)}
      >
        Change Password
      </button>

      <Modal isOpen={isChangePasswordOpen} onClose={handleCloseChangePasswordModal}>
        <h2>Change Password</h2>
        <input
          type="password"
          name="newPassword"
          placeholder="New Password"
          value={changePasswordData.newPassword}
          onChange={handleInputChange}
          style={styles.input}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={changePasswordData.confirmPassword}
          onChange={handleInputChange}
          style={styles.input}
        />
        <button
          onClick={handleSavePasswordChange}
          style={{ ...buttonBaseStyles, marginTop: "10px" }}
          onMouseOver={(e) => Object.assign(e.currentTarget.style, buttonHoverStyles)}
          onMouseOut={(e) => Object.assign(e.currentTarget.style, buttonBaseStyles)}
        >
          Save
        </button>
      </Modal>

      {notification && (
        <div
          style={{
            ...styles.notification,
            backgroundColor: notificationType === "success" ? "#8BC34A" : "#FF0000", // Green for success, red for error
          }}
        >
          {notification}
          <button onClick={() => setNotification("")} style={styles.closeButton}>
            x
          </button>
        </div>
      )}
    </div>
  );
};

const buttonBaseStyles = {
  padding: "15px 30px",
  fontSize: "20px",
  cursor: "pointer",
  backgroundColor: "#FF7093",
  color: "white",
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

const styles = {
  profileContainer: {
    marginTop: '20px',
    padding: '20px',
    borderRadius: '5px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#ffffff',
  },
  heading: {
    color: '#FF7093',
    marginBottom: '20px',
  },
  profileInfo: {
    fontSize: '18px',
    lineHeight: '1.6',
  },
  profileItem: {
    marginBottom: '10px',
  },
  input: {
    display: "block",
    width: "80%",
    padding: "10px",
    margin: "10px auto",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  notification: {
    padding: "15px",
    color: "#fff",
    borderRadius: "5px",
    position: "fixed",
    top: "60px",  
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1000,
    width: "auto",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#8BC34A", 
  },
  closeButton: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
    marginLeft: "15px",
  },
};

export default Profile;
