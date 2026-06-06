import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { useParams, Link } from 'react-router-dom'
import PostCard from '../components/PostCard'
import {
  GET_ME,
  GET_USER,
  GET_USER_POSTS,
  UPDATE_BIO,
  GET_POSTS,
} from '../graphql/operations'
import './Profile.css'

function Profile({ currentUser }) {
  const { userId } = useParams()
  const isOwnProfile = !userId || userId === String(currentUser?.id)
  const profileId = isOwnProfile ? currentUser?.id : userId

  const [bioText, setBioText] = useState('')
  const [editingBio, setEditingBio] = useState(false)

  const { data: meData, loading: meLoading, refetch: refetchMe } = useQuery(GET_ME, {
    skip: !isOwnProfile || !currentUser,
  })

  const { data: userData, loading: userLoading } = useQuery(GET_USER, {
    variables: { id: profileId },
    skip: isOwnProfile || !profileId,
  })

  const {
    data: postsData,
    loading: postsLoading,
    refetch: refetchPosts,
    client,
  } = useQuery(GET_USER_POSTS, {
    variables: { userId: profileId },
    skip: !profileId,
  })

  const [updateBio, { loading: savingBio }] = useMutation(UPDATE_BIO, {
    onCompleted: () => {
      setEditingBio(false)
      refetchMe()
    },
  })

  const profile = isOwnProfile ? meData?.me : userData?.user
  const posts = postsData?.userPosts || []
  const loading = isOwnProfile ? meLoading : userLoading

  const startEditBio = () => {
    setBioText(profile?.bio || '')
    setEditingBio(true)
  }

  const saveBio = async (e) => {
    e.preventDefault()
    await updateBio({ variables: { bio: bioText } })
  }

  const handleLikeUpdate = (likeResult) => {
    client.cache.updateQuery(
      { query: GET_USER_POSTS, variables: { userId: profileId } },
      (existing) => {
        if (!existing) return existing
        return {
          userPosts: existing.userPosts.map((post) =>
            String(post.id) === String(likeResult.postId)
              ? { ...post, likes: likeResult.likes, likedByMe: likeResult.liked }
              : post
          ),
        }
      }
    )
    client.cache.updateQuery({ query: GET_POSTS }, (existing) => {
      if (!existing) return existing
      return {
        posts: existing.posts.map((post) =>
          String(post.id) === String(likeResult.postId)
            ? { ...post, likes: likeResult.likes, likedByMe: likeResult.liked }
            : post
        ),
      }
    })
  }

  const handlePostDeleted = (postId) => {
    refetchPosts()
    client.cache.updateQuery({ query: GET_POSTS }, (existing) => {
      if (!existing) return existing
      return {
        posts: existing.posts.filter((p) => String(p.id) !== String(postId)),
      }
    })
  }

  if (loading) {
    return (
      <div className="profile-container">
        <p>Loading profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <p>User not found.</p>
        <Link to="/">Back to Feed</Link>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.username.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h1>@{profile.username}</h1>
          {isOwnProfile && <p className="profile-email">{profile.email}</p>}
          <p className="profile-stat">{profile.friendCount ?? 0} connections</p>

          {editingBio ? (
            <form className="bio-form" onSubmit={saveBio}>
              <textarea
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                placeholder="Write a short bio..."
                rows={3}
              />
              <div className="bio-actions">
                <button type="submit" disabled={savingBio}>
                  {savingBio ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setEditingBio(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <p className="profile-bio">
                {profile.bio || (isOwnProfile ? 'No bio yet. Tell people about yourself!' : 'No bio yet.')}
              </p>
              {isOwnProfile && (
                <button type="button" className="edit-bio-btn" onClick={startEditBio}>
                  Edit Bio
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="profile-posts">
        <h2>{isOwnProfile ? 'Your Posts' : `${profile.username}'s Posts`}</h2>
        {postsLoading ? (
          <p>Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="no-posts">No posts yet.</p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              showAuthor={false}
              canDelete={isOwnProfile}
              onLikeUpdate={handleLikeUpdate}
              onDelete={handlePostDeleted}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default Profile
