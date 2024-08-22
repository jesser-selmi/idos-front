import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_USERS, UPDATE_USER, CREATE_USER, DELETE_USER } from "../queries/RequestQueries"; 
import Modal from "../components/Modal";
const AllUsers = () => {
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('role');
  
  // Fetch all users
  const { loading, error, data, refetch } = useQuery(GET_ALL_USERS, {
    context: {
      headers: {
        authorization: `${token}`,
      },
    },
  });

  // Mutation to update a user
  const [updateUser] = useMutation(UPDATE_USER, {
    context: {
      headers: {
        authorization: `${token}`,
      },
    },
  });

  // Mutation to create a new user
  const [createUser] = useMutation(CREATE_USER, {
    context: {
      headers: {
        authorization: `${token}`,
      },
    },
  });

  // Mutation to delete a user
  const [deleteUser] = useMutation(DELETE_USER, {
    context: {
      headers: {
        authorization: `${token}`,
      },
    },
  });

  // Component state and handlers
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [updatedUserData, setUpdatedUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
  });
  const [newUserData, setNewUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });

  const [notification, setNotification] = useState({
    type: '', // 'success' or 'error'
    message: '',
    visible: false,
  });

  // Fetch and update users data
  useEffect(() => {
    if (!loading) {
      setIsLoading(false);
      if (data) {
        setUsers(data.getAllUsers.data || []);
      }
    }
  }, [loading, data]);

  // Handle update button click
  const handleUpdateClick = (user) => {
    setSelectedUser(user);
    setUpdatedUserData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    });
    setIsUpdateModalOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Handle add button click
  const handleAddClick = () => {
    setNewUserData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
    });
    setIsAddModalOpen(true);
  };

  // Handle input changes for update and new user forms
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUserData((prevData) => ({
      ...prevData, 
      [name]: value,
    }));
  };

  const handleNewUserInputChange = (e) => {
    const { name, value } = e.target;
    setNewUserData((prevData) => ({
      ...prevData, 
      [name]: value,
    }));
  };

  // Validate password
  const validatePassword = (password) => {
    const minLength = 6;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    return password.length >= minLength && hasLetter && hasDigit;
  };

  // Save changes for update
  const handleSaveChanges = async () => {
    try {
      await updateUser({
        variables: {
          id: selectedUser.id,
          user: {
            firstName: updatedUserData.firstName,
            lastName: updatedUserData.lastName,
            email: updatedUserData.email,
            role: updatedUserData.role,
          },
        },
      });

      await refetch();
      setIsUpdateModalOpen(false);
      
      setNotification({
        type: 'success',
        message: 'Updated successfully',
        visible: true,
      });

    } catch (error) {
      console.error('Error updating user:', error.message);
      
      setNotification({
        type: 'error',
        message: 'Update failed',
        visible: true,
      });
    }
  };

  // Save new user
  const handleSaveNewUser = async () => {
    if (newUserData.password !== newUserData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!validatePassword(newUserData.password)) {
      alert("Password must be at least 6 characters long and contain both a letter and a digit.");
      return;
    }

    try {
      await createUser({
        variables: {
          user: {
            firstName: newUserData.firstName,
            lastName: newUserData.lastName,
            email: newUserData.email,
            password: newUserData.password,
            role: newUserData.role,
          },
        },
      });

      await refetch();
      setIsAddModalOpen(false);
      
      setNotification({
        type: 'success',
        message: 'Added successfully',
        visible: true,
      });

    } catch (error) {
      console.error('Error creating user:', error.message);
      
      setNotification({
        type: 'error',
        message: 'Add failed',
        visible: true,
      });
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    try {
      await deleteUser({ variables: { id: selectedUser.id } });
      
      await refetch();
      setIsDeleteModalOpen(false);
      
      setNotification({
        type: 'success',
        message: 'Deleted successfully',
        visible: true,
      });

    } catch (error) {
      console.error('Error deleting user:', error.message);
      
      setNotification({
        type: 'error',
        message: 'Delete failed',
        visible: true,
      });
    }
  };

  // Handle notification close
  const handleCloseNotification = () => {
    setNotification({ ...notification, visible: false });
  };

  // Render loading or error message
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  

  return (
    <div style={styles.container}>
      {userRole ==="ADMIN"&&(
      <button
        style={styles.addButton}
        onClick={handleAddClick}
        onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.addButtonHover)}
        onMouseOut={(e) => Object.assign(e.currentTarget.style, styles.addButton)}
      >
        Add New Employee
      </button>
      )}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>First Name</th>
            <th style={styles.tableHeader}>Last Name</th>
            <th style={styles.tableHeader}>Email</th>
            <th style={styles.tableHeader}>Role</th>
            <th style={styles.tableHeader}>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td style={styles.tableCell}>{user.firstName}</td>
              <td style={styles.tableCell}>{user.lastName}</td>
              <td style={styles.tableCell}>{user.email}</td>
              <td style={styles.tableCell}>{user.role}</td>
              <td style={styles.tableCell}>
                {userRole === "ADMIN" && (
                <button
                  style={styles.actionButtonDelete}
                  onClick={() => handleDeleteClick(user)}
                  onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.actionButtonAddHover)}
                  onMouseOut={(e) => Object.assign(e.currentTarget.style, styles.actionButtonDelete)}
                >
                  Delete
                </button>
                )}
                <button
                  style={{ ...styles.actionButtonUpdate, marginLeft: '10px' }}
                  onClick={() => handleUpdateClick(user)}
                  onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.actionButtonAddHover)}
                  onMouseOut={(e) => Object.assign(e.currentTarget.style, styles.actionButtonUpdate)}
                >
                  Update
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Update User Modal */}
      <Modal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)}>
        <h2>Update employee</h2>
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={updatedUserData.firstName}
          onChange={handleInputChange}
          style={styles.input}
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={updatedUserData.lastName}
          onChange={handleInputChange}
          style={styles.input}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={updatedUserData.email}
          onChange={handleInputChange}
          style={styles.input}
        />
        <select
          name="role"
          value={updatedUserData.role}
          onChange={handleInputChange}
          style={styles.input}
        >
          <option value="">Select Role</option>
          <option value="ADMIN">ADMIN</option>
          <option value="RH">RH</option>
          <option value="USER">USER</option>
          <option value="INTERN">INTERN</option>
        </select>
        <button style={styles.saveButton} onClick={handleSaveChanges}>
          Save Changes
        </button>
      </Modal>

      {/* Add New User Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <h2>Add New employee</h2>
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={newUserData.firstName}
          onChange={handleNewUserInputChange}
          style={styles.input}
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={newUserData.lastName}
          onChange={handleNewUserInputChange}
          style={styles.input}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={newUserData.email}
          onChange={handleNewUserInputChange}
          style={styles.input}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={newUserData.password}
          onChange={handleNewUserInputChange}
          style={styles.input}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={newUserData.confirmPassword}
          onChange={handleNewUserInputChange}
          style={styles.input}
        />
        <select
          name="role"
          value={newUserData.role}
          onChange={handleNewUserInputChange}
          style={styles.input}
        >
          <option value="">Select Role</option>
          <option value="ADMIN">ADMIN</option>
          <option value="RH">RH</option>
          <option value="USER">USER</option>
          <option value="INTERN">INTERN</option>
        </select>
        <button style={styles.saveButton} onClick={handleSaveNewUser}>
          Add employee
        </button>
      </Modal>

      {/* Delete User Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <h2>Delete employee</h2>
        <p>Are you sure you want to delete this employee?</p>
        <button style={styles.deleteButton} onClick={handleDeleteUser}>
          Yes, Delete
        </button>
      </Modal>

      {/* Notification */}
      {notification.visible && (
        <div style={{ ...styles.notification, ...(notification.type === 'success' ? styles.success : styles.error) }}>
          <p>{notification.message}</p>
          <button style={styles.closeButton} onClick={handleCloseNotification}>
            x
          </button>
        </div>
      )}
    </div>
  );
};

// Inline styles for components
const styles = {
  container: {
    padding: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px',
  },
  tableHeader: {
    borderBottom: '2px solid #333',
    padding: '10px',
    textAlign: 'left',
  },
  tableCell: {
    borderBottom: '1px solid #ccc',
    padding: '10px',
  },
  actionButtonDelete: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '8px 12px',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '5px',
  },
  actionButtonUpdate: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '8px 12px',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '5px',
  },
  actionButtonAddHover: {
    backgroundColor: '#FF7093',
  },
  addButton: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '5px',
    marginBottom: '10px',
  },
  addButtonHover: {
    backgroundColor: '#FF7093',
  },
  input: {
    display: 'block',
    width: '80%',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  saveButton: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '5px',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '5px',
  },
  notification: {
    position: 'fixed',
    top: '60px',
    right: '10px',
    padding: '10px 10px',
    borderRadius: '5px',
    zIndex: 1000,
    color: 'white',
    backgroundColor: '#333', 
    minWidth: '200px',
    display: 'flex', 
    alignItems: 'center', 
  },
  success: {
    backgroundColor: '#28a745',
  },
  error: {
    backgroundColor: '#dc3545',
  },
  closeButton: {
    position: 'absolute',
    top: '13px',
    right: '1px',
    background: 'transparent',
    border: 'none',
    color: 'black',
    fontSize: '20px',
    cursor: 'pointer',
  },
};

export default AllUsers;
