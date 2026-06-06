import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import './App.css'
import Navbar from './components/Navbar'
import Feed from './pages/Feed'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Connections from './pages/Connections'
import Groups from './pages/Groups'
import Marketplace from './pages/Marketplace'
import { GET_ME } from './graphql/operations'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  const token = localStorage.getItem('token')

  const { data: meData, loading: meLoading, error: meError } = useQuery(GET_ME, {
    skip: !token,
  })

  useEffect(() => {
    if (!token) {
      setIsLoggedIn(false)
      setUser(null)
      setAuthChecked(true)
      return
    }

    if (meLoading) return

    if (meError || !meData?.me) {
      localStorage.removeItem('token')
      setIsLoggedIn(false)
      setUser(null)
      setAuthChecked(true)
      return
    }

    setUser(meData.me)
    setIsLoggedIn(true)
    setAuthChecked(true)
  }, [token, meData, meLoading, meError])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    setUser(null)
  }

  if (!authChecked) {
    return (
      <div className="container">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <Router>
      {isLoggedIn && <Navbar user={user} onLogout={handleLogout} />}
      <Routes>
        <Route
          path="/register"
          element={
            isLoggedIn ? (
              <Navigate to="/" />
            ) : (
              <Register setIsLoggedIn={setIsLoggedIn} setUser={setUser} />
            )
          }
        />
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/" />
            ) : (
              <Login setIsLoggedIn={setIsLoggedIn} setUser={setUser} />
            )
          }
        />
        <Route
          path="/"
          element={isLoggedIn ? <Feed /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={
            isLoggedIn ? <Profile currentUser={user} /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/profile/:userId"
          element={
            isLoggedIn ? <Profile currentUser={user} /> : <Navigate to="/login" />
          }
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
        <Route path="*" element={<Navigate to={isLoggedIn ? '/' : '/login'} />} />
      </Routes>
    </Router>
  )
}

export default App
