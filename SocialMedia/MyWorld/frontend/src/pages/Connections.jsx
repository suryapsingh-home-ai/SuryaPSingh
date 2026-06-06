import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLazyQuery, useQuery, useMutation } from '@apollo/client'
import {
  SEARCH_USERS,
  GET_PENDING_REQUESTS,
  GET_CONNECTIONS,
  SEND_CONNECTION_REQUEST,
  ACCEPT_CONNECTION_REQUEST,
  REJECT_CONNECTION_REQUEST,
} from '../graphql/operations'
import './Connections.css'

const Connections = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('search')

  const [searchUsers, { data: searchData, loading: searchLoading }] =
    useLazyQuery(SEARCH_USERS)

  const { data: pendingData, loading: pendingLoading, refetch: refetchPending } =
    useQuery(GET_PENDING_REQUESTS, { skip: activeTab !== 'pending' })

  const { data: connectionsData, loading: connectionsLoading, refetch: refetchConnections } =
    useQuery(GET_CONNECTIONS, { skip: activeTab !== 'connections' })

  const [sendRequest] = useMutation(SEND_CONNECTION_REQUEST)
  const [acceptRequest] = useMutation(ACCEPT_CONNECTION_REQUEST)
  const [rejectRequest] = useMutation(REJECT_CONNECTION_REQUEST)

  const handleSearch = (e) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.length > 0) {
      searchUsers({ variables: { query } })
    }
  }

  const sendConnectionRequest = async (recipientId) => {
    try {
      await sendRequest({ variables: { recipientId: String(recipientId) } })
      alert('Connection request sent!')
      setSearchQuery('')
    } catch (error) {
      alert(error.message || 'Failed to send request')
    }
  }

  const acceptConnection = async (connectionId) => {
    try {
      await acceptRequest({ variables: { connectionId: String(connectionId) } })
      refetchPending()
      refetchConnections()
    } catch (error) {
      console.error('Accept request error:', error)
    }
  }

  const rejectConnection = async (connectionId) => {
    try {
      await rejectRequest({ variables: { connectionId: String(connectionId) } })
      refetchPending()
    } catch (error) {
      console.error('Reject request error:', error)
    }
  }

  const searchResults = searchQuery.length > 0 ? searchData?.searchUsers || [] : []
  const pendingRequests = pendingData?.pendingConnectionRequests || []
  const connections = connectionsData?.connections || []

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

          {searchLoading && <p>Loading...</p>}

          <div className="search-results">
            {searchResults.map((user) => (
              <div key={user.id} className="user-card">
                <h3>
                  <Link to={`/profile/${user.id}`}>@{user.username}</Link>
                </h3>
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
          {pendingLoading ? (
            <p>Loading...</p>
          ) : pendingRequests.length === 0 ? (
            <p>No pending requests</p>
          ) : (
            pendingRequests.map((request) => (
              <div key={request.id} className="request-card">
                <h3>{request.username}</h3>
                <p>{request.bio}</p>
                <div className="request-actions">
                  <button onClick={() => acceptConnection(request.id)}>Accept</button>
                  <button onClick={() => rejectConnection(request.id)}>Reject</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'connections' && (
        <div className="connections-section">
          {connectionsLoading ? (
            <p>Loading...</p>
          ) : connections.length === 0 ? (
            <p>No connections yet</p>
          ) : (
            connections.map((connection) => (
              <div key={connection.friendId} className="connection-card">
                <h3>
                  <Link to={`/profile/${connection.friendId}`}>
                    @{connection.username}
                  </Link>
                </h3>
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
