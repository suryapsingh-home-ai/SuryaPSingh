import React, { useState } from 'react'
import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import {
  GET_GROUPS,
  GET_GROUP_POSTS,
  CREATE_GROUP,
  JOIN_GROUP,
  CREATE_GROUP_POST,
  TOGGLE_GROUP_POST_LIKE,
} from '../graphql/operations'
import './Groups.css'

const Groups = () => {
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDesc, setNewGroupDesc] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [activeTab, setActiveTab] = useState('browse')

  const { data: groupsData, loading: groupsLoading, refetch: refetchGroups } =
    useQuery(GET_GROUPS, { skip: activeTab !== 'browse' })

  const [fetchGroupPosts, { data: postsData, loading: postsLoading }] =
    useLazyQuery(GET_GROUP_POSTS)

  const [createGroup] = useMutation(CREATE_GROUP)
  const [joinGroup] = useMutation(JOIN_GROUP)
  const [createGroupPost] = useMutation(CREATE_GROUP_POST)
  const [toggleLike] = useMutation(TOGGLE_GROUP_POST_LIKE)

  const groups = groupsData?.groups || []
  const groupPosts = postsData?.groupPosts || []

  const handleCreateGroup = async () => {
    if (!newGroupName) {
      alert('Group name is required')
      return
    }

    try {
      await createGroup({
        variables: { name: newGroupName, description: newGroupDesc || null },
      })
      alert('Group created successfully!')
      setNewGroupName('')
      setNewGroupDesc('')
      setActiveTab('browse')
      refetchGroups()
    } catch (error) {
      alert(error.message || 'Failed to create group')
    }
  }

  const selectGroup = (groupId) => {
    setSelectedGroup(groupId)
    fetchGroupPosts({ variables: { groupId: String(groupId) } })
  }

  const handleJoinGroup = async (groupId) => {
    try {
      await joinGroup({ variables: { groupId: String(groupId) } })
      alert('Joined group successfully!')
      refetchGroups()
    } catch (error) {
      alert(error.message || 'Failed to join group')
    }
  }

  const postToGroup = async () => {
    if (!newPostContent || !selectedGroup) {
      alert('Content is required')
      return
    }

    try {
      await createGroupPost({
        variables: {
          groupId: String(selectedGroup),
          content: newPostContent,
        },
      })
      setNewPostContent('')
      fetchGroupPosts({ variables: { groupId: String(selectedGroup) } })
    } catch (error) {
      alert(error.message || 'Failed to post')
    }
  }

  const likePost = async (postId) => {
    try {
      await toggleLike({ variables: { postId: String(postId) } })
      fetchGroupPosts({ variables: { groupId: String(selectedGroup) } })
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

          <button onClick={handleCreateGroup}>Create Group</button>
        </div>
      )}

      {activeTab === 'browse' && (
        <div className="browse-groups-section">
          <div className="groups-list">
            {groupsLoading ? (
              <p>Loading...</p>
            ) : (
              groups.map((group) => (
                <div
                  key={group.id}
                  className={`group-card ${selectedGroup === group.id ? 'selected' : ''}`}
                >
                  <h3>{group.name}</h3>
                  <p>{group.description}</p>
                  <p className="admin">Admin: {group.adminName}</p>
                  <p className="members">Members: {group.memberCount}</p>
                  <div className="group-actions">
                    <button onClick={() => selectGroup(group.id)}>View</button>
                    <button onClick={() => handleJoinGroup(group.id)}>Join</button>
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
                {postsLoading ? (
                  <p>Loading posts...</p>
                ) : groupPosts.length === 0 ? (
                  <p>No posts yet</p>
                ) : (
                  groupPosts.map((post) => (
                    <div key={post.id} className="group-post">
                      <h4>{post.username}</h4>
                      <p>{post.content}</p>
                      <div className="post-meta">
                        <span>{post.likesCount} likes</span>
                        <span>{post.commentsCount} comments</span>
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
