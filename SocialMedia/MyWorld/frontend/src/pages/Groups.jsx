import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './Groups.css'

const Groups = () => {
  const [groups, setGroups] = useState([])
  const [userGroups, setUserGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [groupPosts, setGroupPosts] = useState([])
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDesc, setNewGroupDesc] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [activeTab, setActiveTab] = useState('browse')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (activeTab === 'browse') {
      fetchAllGroups()
    } else if (activeTab === 'mygroups') {
      fetchAllGroups()
    }
  }, [activeTab])

  const fetchAllGroups = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/groups', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setGroups(response.data)
    } catch (error) {
      console.error('Fetch groups error:', error)
    } finally {
      setLoading(false)
    }
  }

  const createGroup = async () => {
    if (!newGroupName) {
      alert('Group name is required')
      return
    }

    try {
      const response = await axios.post(
        '/groups',
        { name: newGroupName, description: newGroupDesc },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      alert('Group created successfully!')
      setNewGroupName('')
      setNewGroupDesc('')
      fetchAllGroups()
    } catch (error) {
      console.error('Create group error:', error)
      alert(error.response?.data?.error || 'Failed to create group')
    }
  }

  const selectGroup = async (groupId) => {
    setSelectedGroup(groupId)
    fetchGroupPosts(groupId)
  }

  const fetchGroupPosts = async (groupId) => {
    setLoading(true)
    try {
      const response = await axios.get(`/groups/${groupId}/posts`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setGroupPosts(response.data)
    } catch (error) {
      console.error('Fetch group posts error:', error)
    } finally {
      setLoading(false)
    }
  }

  const joinGroup = async (groupId) => {
    try {
      await axios.post(
        '/groups/join',
        { groupId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      alert('Joined group successfully!')
      fetchAllGroups()
    } catch (error) {
      console.error('Join group error:', error)
      alert(error.response?.data?.error || 'Failed to join group')
    }
  }

  const postToGroup = async () => {
    if (!newPostContent || !selectedGroup) {
      alert('Content is required')
      return
    }

    try {
      await axios.post(
        '/groups/posts',
        { groupId: selectedGroup, content: newPostContent },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      setNewPostContent('')
      fetchGroupPosts(selectedGroup)
    } catch (error) {
      console.error('Post to group error:', error)
      alert(error.response?.data?.error || 'Failed to post')
    }
  }

  const likePost = async (postId) => {
    try {
      await axios.post(
        '/groups/posts/like',
        { postId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      fetchGroupPosts(selectedGroup)
    } catch (error) {
      console.error('Like post error:', error)
    }
  }

  return (
    <div className="groups-container">
      <h1>Groups</h1>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          Browse Groups
        </button>
        <button
          className={`tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create Group
        </button>
      </div>

      {activeTab === 'create' && (
        <div className="create-group-section">
          <div className="form-group">
            <label>Group Name</label>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Enter group name"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={newGroupDesc}
              onChange={(e) => setNewGroupDesc(e.target.value)}
              placeholder="Enter group description"
            />
          </div>

          <button onClick={createGroup}>Create Group</button>
        </div>
      )}

      {activeTab === 'browse' && (
        <div className="browse-groups-section">
          <div className="groups-list">
            {loading ? (
              <p>Loading...</p>
            ) : (
              groups.map((group) => (
                <div
                  key={group.id}
                  className={`group-card ${selectedGroup === group.id ? 'selected' : ''}`}
                >
                  <h3>{group.name}</h3>
                  <p>{group.description}</p>
                  <p className="admin">Admin: {group.admin_name}</p>
                  <p className="members">Members: {group.member_count}</p>
                  <div className="group-actions">
                    <button onClick={() => selectGroup(group.id)}>View</button>
                    <button onClick={() => joinGroup(group.id)}>Join</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedGroup && (
            <div className="group-detail">
              <div className="post-input">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Post something in this group..."
                />
                <button onClick={postToGroup}>Post</button>
              </div>

              <div className="group-posts">
                <h3>Posts</h3>
                {loading ? (
                  <p>Loading posts...</p>
                ) : groupPosts.length === 0 ? (
                  <p>No posts yet</p>
                ) : (
                  groupPosts.map((post) => (
                    <div key={post.id} className="group-post">
                      <h4>{post.username}</h4>
                      <p>{post.content}</p>
                      <div className="post-meta">
                        <span>{post.likes_count} likes</span>
                        <span>{post.comments_count} comments</span>
                      </div>
                      <button onClick={() => likePost(post.id)}>Like</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Groups
