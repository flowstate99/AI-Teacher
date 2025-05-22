import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';

const Navigation = () => {
  const location = useLocation();
  const { user } = useContext(UserContext);
  
  return (
    <nav className="main-navigation">
      <div className="logo">
        <Link to="/">AI Teacher</Link>
      </div>
      
      <div className="nav-links">
        <Link 
          to="/" 
          className={location.pathname === '/' ? 'active' : ''}
        >
          Dashboard
        </Link>
        
        <Link 
          to="/profile" 
          className={location.pathname === '/profile' ? 'active' : ''}
        >
          Profile {user?.name ? `(${user.name})` : ''}
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;