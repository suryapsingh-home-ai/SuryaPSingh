import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useNavigate, Link } from 'react-router-dom'
import { LOGIN } from '../graphql/operations'
import './Auth.css'

function Login({ setIsLoggedIn, setUser }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const [login, { loading }] = useMutation(LOGIN, {
    onCompleted: (data) => {
      localStorage.setItem('token', data.login.token)
      setIsLoggedIn(true)
      setUser(data.login.user)
      navigate('/')
    },
    onError: (err) => {
      setError(err.message || 'Login failed')
    },
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    await login({ variables: { email, password } })
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">MyWorld</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
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
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#0066cc', textDecoration: 'none' }}>
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
