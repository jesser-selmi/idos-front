import React, { useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import { login } from '../mutations/auth';
import './HomePage.css';
import useRedirectBasedOnRole from '../utils/useRedirectBasedOnRole';

const HomePage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(null);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [status, setStatus] = useState(null);
  const [authLogin] = useMutation(login);

  //Use the custom hook for redirection
  useRedirectBasedOnRole(token);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = (await authLogin({ variables: { email, password } })).data; 
      const token = result.login.data;
      setStatus(result.login.entityResponse.status)
      if(status != 200){
        setErrorMessage(result.login.entityResponse.message)
      }
      localStorage.setItem('authToken', token);
      setToken(token);
    } catch (e) {
      console.error('Error logging in', e);
    }
  };

  return (
    <div className="login-container">
      <h1 style={{ color: '#FF7093' }}>EmplyEase</h1>
      {(status != 200 && status!=null) && <div className="error-message">{errorMessage}</div>} {/* Error message */}
      <form onSubmit={handleLogin} className="login-form">
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">Login</button>
      </form>
    </div>
  );
};

export default HomePage;
