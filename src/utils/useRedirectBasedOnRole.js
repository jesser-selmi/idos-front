import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

const redirectBasedOnRole = (token, navigate) => {
  if (token) {
    try {
      const decodedToken = jwtDecode(token.replace(/^Bearer\s*/, '').trim());
      const role = decodedToken.roles[0];
      localStorage.setItem("role", role)
      localStorage.setItem("id", decodedToken.userId);
      switch (role) {
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'RH':
          navigate('/hr');
          break;
        case 'USER':
        case 'INTERN':
          navigate('/user');
          break;
        default:
          navigate('/login');
          break;
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      navigate('/login');
    }
  }
};

const useRedirectBasedOnRole = (token) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      redirectBasedOnRole(token, navigate);
    }
  }, [token, navigate]);
};

export default useRedirectBasedOnRole;
export { redirectBasedOnRole };