import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './Connections.css'

const Connections = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [connections, setConnections] = useState([])
  const [activeTab, setActiveTab] = useState('search')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingRequests()
    } else if (activeTab === 'connections') {
      fetchConnections()
    }
  }, [activeTab])

  const handleSearch = async (e) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.length > 0) {
      setLoading(true)
      try {
        const response = await axios.get('/connections/search', {
          params: { query },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        setSearchResults(response.data)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    } else {
      setSearchResults([])
    }
  }

  const sendConnectionRequest = async (recipientId) => {
    try {
      await axios.post(
        '/connections/request',
        { recipientId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      alert('Connection request sent!')
      setSearchQuery('')
      setSearchResults([])
    } catch (error) {
      console.error('Send request error:', error)
      alert(error.response?.data?.error || 'Failed to send request')
    }
  }

  const fetchPendingRequests = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/connections/requests/pending', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setPendingRequests(response.data)
    } catch (error) {
      console.error('Fetch pending requests error:', error)
    } finally {
      setLoading(false)
    }
  }

  const acceptRequest = async (connectionId) => {
    try {
      await axios.post(
        '/connections/requests/accept',
        { connectionId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      fetchPendingRequests()
      fetchConnections()
    } catch (error) {
      console.error('Accept request error:', error)
    }
  }

  const rejectRequest = async (connectionId) => {
    try {
      await axios.post(
        '/connections/requests/reject',
        { connectionId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      fetchPendingRequests()
    } catch (error) {
      console.error('Reject request error:', error)
    }
  }

  const fetchConnections = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/connections/list', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setConnections(response.data)
    } catch (error) {
      console.error('Fetch connections error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="connections-container">
      <h1>My Connections</h1>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          Find Users
        </button>
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Requests ({pendingRequests.length})
        </button>
        <button
          className={`tab ${activeTab === 'connections' ? 'active' : ''}`}
          onClick={() => setActiveTab('connections')}
        >
          My Connections ({connections.length})
        </button>
      </div>

      {activeTab === 'search' && (
        <div className="search-section">
          <input
            type="text"
            placeholder="Search for users..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />

          {loading && <p>Loading...</p>}

          <div className="search-results">
            {searchResults.map((user) => (
              <div key={user.id} className="user-card">
                <h3>{user.username}</h3>
                <p>{user.bio}</p>
                <button onClick={() => sendConnectionRequest(user.id)}>
                  Send Connection Request
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="pending-section">
          {loading ? (
            <p>Loading...</p>
          ) : pendingRequests.length === 0 ? (
            <p>No pending requests</p>
          ) : (
            pendingRequests.map((request) => (
              <div key={request.id} className="request-card">
                <h3>{request.username}</h3>
                <p>{request.bio}</p>
                <div className="request-actions">
                  <button onClick={() => acceptRequest(request.id)}>Accept</button>
                  <button onClick={() => rejectRequest(request.id)}>Reject</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'connections' && (
        <div className="connections-section">
          {loading ? (
            <p>Loading...</p>
          ) : connections.length === 0 ? (
            <p>No connections yet</p>
          ) : (
            connections.map((connection) => (
              <div key={connection.friend_id} className="connection-card">
                <h3>{connection.username}</h3>
                <p>{connection.bio}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default Connections
