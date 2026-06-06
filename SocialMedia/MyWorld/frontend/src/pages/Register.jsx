import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useNavigate, Link } from 'react-router-dom'
import { REGISTER } from '../graphql/operations'
import './Auth.css'

function Register({ setIsLoggedIn, setUser }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const [register, { loading }] = useMutation(REGISTER, {
    onCompleted: (data) => {
      localStorage.setItem('token', data.register.token)
      setIsLoggedIn(true)
      setUser(data.register.user)
      navigate('/')
    },
    onError: (err) => {
      setError(err.message || 'Registration failed')
    },
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    await register({ variables: { username, email, password } })
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">MyWorld</h1>
        <h2 style={{ textAlign: 'center', fontSize: '18px', color: '#666', marginBottom: '20px' }}>
          Sign Up
        </h2>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#0066cc', textDecoration: 'none' }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
