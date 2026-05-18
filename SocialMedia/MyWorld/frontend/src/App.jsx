import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios'
import './App.css'
import Navbar from './components/Navbar'
import Feed from './pages/Feed'
import Login from './pages/Login'
import Register from './pages/Register'
import Connections from './pages/Connections'
import Groups from './pages/Groups'
import Marketplace from './pages/Marketplace'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsLoggedIn(true)
    }
    setLoading(false)
  }, [])

  if (loading) return <div className="container"><p>Loading...</p></div>

  return (
    <Router>
      {isLoggedIn && <Navbar />}
      <Routes>
        <Route 
          path="/register" 
          element={<Register setIsLoggedIn={setIsLoggedIn} setUser={setUser} />} 
        />
        <Route 
          path="/login" 
          element={<Login setIsLoggedIn={setIsLoggedIn} setUser={setUser} />} 
        />
        <Route 
          path="/" 
          element={isLoggedIn ? <Feed user={user} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/connections" 
          element={isLoggedIn ? <Connections /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/groups" 
          element={isLoggedIn ? <Groups /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/marketplace" 
          element={isLoggedIn ? <Marketplace /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  )
}

export default App
