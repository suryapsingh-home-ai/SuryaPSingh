import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './Feed.css'

function Feed({ user }) {
  const [posts, setPosts] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/posts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setPosts(response.data)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    }
  }

  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    try {
      const response = await axios.post(
        'http://localhost:5000/posts',
        { content },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      setPosts([response.data, ...posts])
      setContent('')
    } catch (error) {
      console.error('Failed to create post:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="feed-container">
      <nav className="navbar">
        <div className="navbar-content">
          <h1>MyWorld</h1>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="container">
        <div className="feed">
          <div className="post-creator">
            <form onSubmit={handleCreatePost}>
              <textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <button type="submit" disabled={loading || !content.trim()}>
                {loading ? 'Posting...' : 'Post'}
              </button>
            </form>
          </div>

          <div className="posts-list">
            {posts.length === 0 ? (
              <p className="no-posts">No posts yet. Create one!</p>
            ) : (
              posts.map(post => (
                <div key={post.id} className="post">
                  <p>{post.content}</p>
                  <small>{new Date(post.createdAt).toLocaleDateString()}</small>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Feed
