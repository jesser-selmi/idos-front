import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isHoveredHome, setIsHoveredHome] = useState(false);
  const [isHoveredProfile, setIsHoveredProfile] = useState(false);

  const handleRedirect = () => {
    const role = localStorage.getItem('role');
    if (role === 'ADMIN') {
      navigate('/admin');
    } else if (role === 'RH') {
      navigate('/hr');
    } else if (role === 'USER' || role === 'INTERN') {
      navigate('/user');
    }
    setIsHoveredHome(false);
    setIsHoveredProfile(false);
  };

  const handleMouseEnter = (setHovered) => {
    setHovered(true);
  };

  const handleMouseLeave = (setHovered) => {
    setHovered(false);
  };

  // Determine whether to show the "Home page" button
  const showHomePageButton = !['/user', '/admin', '/hr'].includes(location.pathname);

  if (location.pathname === '/' || location.pathname === '/login') {
    return null;
  }

  const buttonBaseStyles = {
    padding: '15px 30px',
    fontSize: '20px',
    cursor: 'pointer',
    backgroundColor: '#FF7093',
    color: '#FFF',
    border: 'none',
    borderRadius: '5px',
    textDecoration: 'none',
    transform: 'scale(1)',
    transition: 'background-color 0.3s, color 0.3s, transform 0.3s, box-shadow 0.3s',
    boxShadow: 'none',
    fontFamily: 'inherit',
  };

  const buttonHoverStyles = {
    backgroundColor: '#8BC34A',
    color: '#fff',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1), 0 0 25px rgba(139, 195, 74, 0.5), 0 0 30px rgba(139, 195, 74, 0.5)',
    transform: 'scale(1.05)',
  };

  const logoutButtonStyles = {
    ...buttonBaseStyles,
    backgroundColor: 'black',
    color: '#fff',
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.logo}>
        <a href="https://idos-digital.com/" style={styles.logoLink}>
          idos-digital
        </a>
      </div>
      <ul style={styles.navbarLinks}>
        {showHomePageButton && (
          <li style={styles.navItem}>
            <span
              style={isHoveredHome ? { ...buttonBaseStyles, ...buttonHoverStyles } : buttonBaseStyles}
              onClick={handleRedirect}
              onMouseEnter={() => handleMouseEnter(setIsHoveredHome)}
              onMouseLeave={() => handleMouseLeave(setIsHoveredHome)}
            >
              Home page
            </span>
          </li>
        )}
        <li style={styles.navItem}>
          <span
            style={isHoveredProfile ? { ...buttonBaseStyles, ...buttonHoverStyles } : buttonBaseStyles}
            onMouseEnter={() => handleMouseEnter(setIsHoveredProfile)}
            onMouseLeave={() => handleMouseLeave(setIsHoveredProfile)}
          >
            <Link to="/profile" style={styles.linkStyle}>Profile</Link>
          </span>
        </li>
        <li style={styles.navItem}>
          <span style={logoutButtonStyles}>
            <Link to="/logout" style={styles.linkStyle}>Log out</Link>
          </span>
        </li>
      </ul>
    </nav>
  );
}

const styles = {
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '99%',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0px 10px',
    backgroundColor: '#FF7093',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    animation: 'slideDown 0.5s ease-in-out',
  },
  logo: {
    fontSize: '24px',
  },
  logoLink: {
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: 'bold',
    transition: 'transform 0.3s ease-in-out',
    fontFamily: 'inherit',
  },
  navbarLinks: {
    listStyle: 'none',
    display: 'flex',
    gap: '20px',
    marginRight: '20px',
  },
  navItem: {
    transition: 'transform 0.3s ease-in-out',
  },
  linkStyle: {
    textDecoration: 'none',
    color: 'inherit',
    fontFamily: 'inherit',
  },
};

export default Navbar;
