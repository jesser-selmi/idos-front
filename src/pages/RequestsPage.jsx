import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useMutation, useQuery } from "@apollo/client";
import { GET_ALL_REQUESTS, GET_ALL_USERS, UPDATE_REQUEST } from "../queries/RequestQueries";

const RequestsPage = () => {
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('role');
  if (userRole !== "RH" && userRole !== "ADMIN") {
    return <div style={styles.error}>Error: Forbidden</div>;
  }

  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [filterType, setFilterType] = useState("TELEWORK_REQUEST");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Fetch all requests
  const { loading, error, data } = useQuery(GET_ALL_REQUESTS, {
    context: {
      headers: {
        authorization: `${token}`,
      },
    },
  });

  // Fetch all users
  const { loading: loadingUser, error: errorUser, data: userData } = useQuery(GET_ALL_USERS, {
    context: {
      headers: {
        authorization: `${token}`,
      },
    },
  });

  useEffect(() => {
    if (!loadingUser && userData) {
      setUsers(userData.getAllUsers.data || []);
    }
  }, [loadingUser, userData]);

  useEffect(() => {
    if (!loading && data) {
      setRequests(data.getAllRequests.data || []);
    }
  }, [loading, data]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decodedToken = jwtDecode(token.replace("Bearer ", ""));
        const userRole = decodedToken.role;
        if (userRole === "USER" || userRole === "INTERN") {
          setErrorMessage("Forbidden: You do not have access to view this page.");
        }
      } catch (error) {
        setErrorMessage("Error decoding token.");
      }
    } else {
      setErrorMessage("No authentication token found.");
    }
  }, []);

  useEffect(() => {
    const filtered = requests.filter(request => request.type === filterType);
    setFilteredRequests(filtered);
  }, [requests, filterType]);

  // Mutation to update request status
  const [updateRequest] = useMutation(UPDATE_REQUEST, {
    context: {
      headers: {
        authorization: `${token}`,
      },
    },
  });

  const handleStatusChange = async (requestId, newStatus) => {
    await updateRequest({ variables: { request: { status: newStatus }, id: requestId } });
    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === requestId ? { ...request, status: newStatus } : request
      )
    );
  };

  const handlePopup = (request) => {
    setSelectedRequest(request);
    setShowPopup(true);
  };

  const handlePopupAction = async (action) => {
    let newStatus;

    if (action === "ACCEPTED") {
      if (userRole === "ADMIN") {
        if (selectedRequest.status === "RH_ACCEPTED") {
          newStatus = "ACCEPTED";
        } else {
          newStatus = "ADMIN_ACCEPTED";
        }
      } else if (userRole === "RH") {
        if (selectedRequest.status === "ADMIN_ACCEPTED") {
          newStatus = "ACCEPTED";
        } else {
          newStatus = "RH_ACCEPTED";
        }
      }
    } else if (action === "REJECTED") {
      newStatus = "REJECTED";
    }

    if (newStatus) {
      await handleStatusChange(selectedRequest.id, newStatus);
    }
    setShowPopup(false);
    setSelectedRequest(null);
  };

  if (errorMessage) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorMessage}>{errorMessage}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.buttonContainer}>
        <button
          style={{
            ...styles.filterButton,
            backgroundColor: filterType === "TELEWORK_REQUEST" ? "#FF7093" : "transparent",
          }}
          onClick={() => setFilterType("TELEWORK_REQUEST")}
        >
          Telework Requests
        </button>
        <button
          style={{
            ...styles.filterButton,
            backgroundColor: filterType === "LEAVE_REQUEST" ? "#FF7093" : "transparent",
          }}
          onClick={() => setFilterType("LEAVE_REQUEST")}
        >
          Leave Requests
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Employee Name</th>
            <th style={styles.tableHeader}>Date</th>
            <th style={styles.tableHeader}>Duration</th>
            <th style={styles.tableHeader}>Status</th>
            <th style={styles.tableHeader}>Action</th>
          </tr>
        </thead>
        <tbody>
  {filteredRequests.map((request) => (
    <tr key={request.id}>
      <td style={styles.tableCell}>
        {users.find(user => user.id === request.userId)?.firstName} {users.find(user => user.id === request.userId)?.lastName}
      </td>
      <td style={styles.tableCell}>{request.date}</td>
      <td style={styles.tableCell}>{request.duration}</td>
      <td style={styles.tableCell}>
        <span
          style={{
            color:
              request.status === "ACCEPTED"
                ? "green"
                : request.status === "REJECTED"
                ? "red"
                : request.status === "PENDING"
                ? "yellow"
                : "black",
            animation: request.status === "PENDING" ? "blink 1s infinite" : "none",
          }}
        >
          {request.status.replace("_", " ")}
        </span>
      </td>
      <td style={styles.tableCell}>
        {(request.status === "ACCEPTED" || request.status === "REJECTED") && (
          <span style={request.status === "ACCEPTED" ? styles.greenCheck : styles.redCross}>
            {request.status === "ACCEPTED" ? "✔️" : "❌"}
          </span>
        )}
        {(request.status === "PENDING" || request.status === "ADMIN_ACCEPTED" || request.status === "RH_ACCEPTED") && (
          <button onClick={() => handlePopup(request)} style={{ ...styles.actionButton, ...styles.hoverEffect }}>
            Change Status
          </button>
        )}
      </td>
    </tr>
  ))}
</tbody>
      </table>

      {showPopup && (
        <div style={styles.popup}>
          <h2>Change Status</h2>
          <button onClick={() => handlePopupAction("ACCEPTED")} style={{ ...styles.popupButton, ...styles.hoverEffect }}>
            Accept
          </button>
          <button onClick={() => handlePopupAction("REJECTED")} style={{ ...styles.popupButton, ...styles.hoverEffect }}>
            Reject
          </button>
          <button onClick={() => setShowPopup(false)} style={{ ...styles.popupButton, ...styles.hoverEffect }}>
            Close
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    maxWidth: "800px",
    margin: "0 auto",
  },
  buttonContainer: {
    marginBottom: "50px",
    textAlign: "center",
  },
  filterButton: {
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
    boxShadow: "none"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    backgroundColor: "#f4f4f4",
    padding: "10px",
    border: "1px solid #ddd",
    textAlign: "center",
  },
  tableCell: {
    padding: "12px",
    border: "1px solid #ddd",
    textAlign: "center",
  },
  actionButton: {
    padding: "10px 20px",
    margin: "2px",
    backgroundColor: "#FF7093",
    border: "none",
    borderRadius: "5px",
    color: "white",
    cursor: "pointer",
    textDecoration: "none",
    transform: "scale(1)", 
    transition: "background-color 0.3s, color 0.3s, transform 0.3s, box-shadow 0.3s",
    boxShadow: "none"
  },
  hoverEffect: {
    ":hover": {
      backgroundColor: "#8BC34A",
      color: "#fff",
      transform: "scale(1.05)",
      boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)"
    },
  },
  popup: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#fff",
    padding: "30px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    zIndex: 1000,
    textAlign: "center",
  },
  popupButton: {
    padding: "10px 20px",
    margin: "10px",
    backgroundColor: "#FF7093",
    border: "none",
    borderRadius: "5px",
    color: "white",
    cursor: "pointer",
    textDecoration: "none",
    transform: "scale(1)", 
    transition: "background-color 0.3s, color 0.3s, transform 0.3s, box-shadow 0.3s",
    boxShadow: "none"
  },
  errorContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
  errorMessage: {
    color: "red",
    fontSize: "24px",
  },
  "@keyframes blink": {
    "0%": { opacity: 1 },
    "50%": { opacity: 0 },
    "100%": { opacity: 1 },
  },
};

export default RequestsPage;
