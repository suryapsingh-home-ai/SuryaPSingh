import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          MyWorld
        </Link>
        
        <div className="nav-menu">
          <Link to="/" className="nav-link">
            Feed
          </Link>
          <Link to="/connections" className="nav-link">
            Connections
          </Link>
          <Link to="/groups" className="nav-link">
            Groups
          </Link>
          <Link to="/marketplace" className="nav-link">
            Marketplace
          </Link>
          <button onClick={handleLogout} className="nav-link logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
