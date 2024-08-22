import React, { useState, useEffect } from "react";
import { CREATE_REQUEST, GET_ALL_USER_REQUESTS } from "../queries/RequestQueries";
import { useMutation, useQuery } from "@apollo/client";

const Request = () => {
  const token = localStorage.getItem('authToken');
  const role = localStorage.getItem('role');

  if ((role !== "USER") && (role !== "INTERN")) {
    return <div style={styles.error}>Error: Forbidden</div>;
  }

  const [requests, setRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newRequest, setNewRequest] = useState({
    type: "TELEWORK_REQUEST",
    date: "",
    duration: 1,
    status: "PENDING"
  });
  const [errors, setErrors] = useState({
    date: "",
    duration: ""
  });
  const [isHoveredAddRequest, setIsHoveredAddRequest] = useState(false);

  const { loading, error, data, refetch } = useQuery(GET_ALL_USER_REQUESTS, {
    context: {
      headers: {
        authorization: `${token}`,
      },
    },
  });

  useEffect(() => {
    if (!loading) {
      setIsLoading(false);
      if (data) {
        setRequests(data.getAllUserRequests.data || []);
      }
    }
  }, [loading, data]);

  const [createRequest] = useMutation(CREATE_REQUEST, {
    context: {
      headers: {
        authorization: `${token}`,
      },
    },
  });

  const handleRequestChange = (e) => {
    const { name, value } = e.target;
    setNewRequest((prevRequest) => ({
      ...prevRequest,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Check if the selected date is in the past
    if (newRequest.date < new Date().toISOString().split('T')[0]) {
      newErrors.date = "The date cannot be in the past.";
    }

    // Check if the duration is at least 1 day
    if (newRequest.duration < 1) {
      newErrors.duration = "Duration must be at least 1 day.";
    }

    // Check for overlapping requests
    const startDate = new Date(newRequest.date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + newRequest.duration - 1);

    const isOverlapping = requests.some((request) => {
      const reqStartDate = new Date(request.date);
      const reqEndDate = new Date(reqStartDate);
      reqEndDate.setDate(reqStartDate.getDate() + request.duration - 1);

      return (
        (startDate <= reqEndDate && endDate >= reqStartDate)
      );
    });

    if (isOverlapping) {
      newErrors.date = "You cannot submit overlapping requests.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddRequest = async () => {
    try {
      if (validateForm()) {
        setRequests((prevRequests) => [...prevRequests, newRequest]);
        const requestToSend = {
          ...newRequest,
          duration: parseInt(newRequest.duration),
        };
        await createRequest({ variables: { request: requestToSend } });

        setNewRequest({
          type: "TELEWORK_REQUEST",
          date: "",
          duration: 1,
          status: "PENDING"
        });
        setIsModalOpen(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const buttonBaseStyles = {
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    backgroundColor: "#FF7093",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    transition: "background-color 0.3s",
  };

  const buttonHoverStyles = {
    backgroundColor: '#8BC34A',
    color: '#fff',
    transform: 'scale(1.05)',
    transition: "background-color 0.3s, color 0.3s, transform 0.3s"
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <h1 style={styles.header}>Requests</h1>
        <button
          style={isHoveredAddRequest ? { ...buttonBaseStyles, ...buttonHoverStyles } : buttonBaseStyles}
          onClick={() => setIsModalOpen(true)}
          onMouseEnter={() => setIsHoveredAddRequest(true)}
          onMouseLeave={() => setIsHoveredAddRequest(false)}
        >
          Add New Request
        </button>
      </div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.headerCell}>Request Type</th>
            <th style={styles.headerCell}>Date</th>
            <th style={styles.headerCell}>Duration</th>
            <th style={styles.headerCell}>Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request, index) => {
            let statusStyle = {};
            let statusText = "";

            switch (request.status.toUpperCase()) {
              case "RH_ACCEPTED":
              case "ADMIN_ACCEPTED":
              case "PENDING":
                statusStyle = {
                  backgroundColor: "yellow",
                  animation: "blink 1s linear infinite",
                  color: "black"
                };
                statusText = "Pending";
                break;
              case "ACCEPTED":
                statusStyle = {
                  backgroundColor: "green",
                  color: "white"
                };
                statusText = "Accepted";
                break;
              case "REJECTED":
                statusStyle = {
                  backgroundColor: "red",
                  color: "white"
                };
                statusText = "Rejected";
                break;
              default:
                statusStyle = {
                  backgroundColor: "white",
                  color: "black"
                };
                statusText = request.status;
            }

            return (
              <tr key={index}>
                <td style={styles.cell}>{request.type}</td>
                <td style={styles.cell}>{request.date}</td>
                <td style={styles.cell}>{request.duration} days</td>
                <td style={{ ...styles.cell, ...statusStyle }}>{statusText}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Add New Request</h2>
            <form style={styles.form}>
              <select
                name="type"
                value={newRequest.type}
                onChange={handleRequestChange}
                style={styles.input}
              >
                <option value="TELEWORK_REQUEST">TELEWORK_REQUEST</option>
                <option value="LEAVE_REQUEST">LEAVE_REQUEST</option>
              </select>
              <input
                type="date"
                name="date"
                value={newRequest.date}
                onChange={handleRequestChange}
                style={styles.input}
                min={new Date().toISOString().split('T')[0]}
                required
              />
              {errors.date && <p style={styles.error}>{errors.date}</p>}
              <input
                type="number"
                name="duration"
                value={newRequest.duration}
                onChange={handleRequestChange}
                style={styles.input}
                min="1"
                required
              />
              {errors.duration && <p style={styles.error}>{errors.duration}</p>}
              <button type="button" style={styles.submitButton} onClick={handleAddRequest}>Add Request</button>
              <button type="button" style={styles.closeButton} onClick={() => setIsModalOpen(false)}>Close</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: "1000px",
    margin: "0 auto",
    textAlign: "center"
  },
  headerContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  header: {
    fontSize: "24px",
    margin: "0"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px"
  },
  headerCell: {
    padding: "10px",
    borderBottom: "2px solid #ddd"
  },
  cell: {
    padding: "10px",
    borderBottom: "1px solid #ddd"
  },
  modalOverlay: {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  modal: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "5px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    width: "300px",
    textAlign: "left"
  },
  form: {
    display: "flex",
    flexDirection: "column"
  },
  input: {
    marginBottom: "10px",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    width: "100%"
  },
  submitButton: {
    padding: "10px",
    fontSize: "16px",
    cursor: "pointer",
    backgroundColor: "#FF7093",
    color: "white",
    border: "none",
    borderRadius: "5px",
    marginTop: "10px",
    transition: "background-color 0.3s, color 0.3s",
  },
  closeButton: {
    padding: "10px",
    fontSize: "16px",
    cursor: "pointer",
    backgroundColor: "#FF7093",
    color: "white",
    border: "none",
    borderRadius: "5px",
    marginTop: "10px",
    transition: "background-color 0.3s, color 0.3s",
  },
  error: {
    color: "red",
    fontSize: "14px",
    marginTop: "5px"
  }
};

export default Request;
