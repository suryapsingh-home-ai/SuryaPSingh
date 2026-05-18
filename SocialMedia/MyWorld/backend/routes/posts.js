const express = require('express')
const router = express.Router()
const pool = require('../db')

// Get all posts
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, u.id as author_id, u.username, 
             COUNT(DISTINCT l.id) as likes,
             COUNT(DISTINCT c.id) as comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN comments c ON p.id = c.post_id
      ORDER BY p.created_at DESC
      GROUP BY p.id, u.id
    `)

    const posts = result.rows.map(row => ({
      id: row.id,
      content: row.content,
      createdAt: row.created_at,
      likes: parseInt(row.likes),
      comments: parseInt(row.comment_count),
      author: { id: row.author_id, username: row.username }
    }))

    res.json(posts)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to fetch posts' })
  }
})

// Create post
router.post('/', async (req, res) => {
  const { content } = req.body

  if (!content) {
    return res.status(400).json({ message: 'Content is required' })
  }

  try {
    const result = await pool.query(
      'INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING *',
      [req.userId, content]
    )

    const post = result.rows[0]
    const userResult = await pool.query('SELECT id, username FROM users WHERE id = $1', [req.userId])
    const user = userResult.rows[0]

    res.json({
      id: post.id,
      content: post.content,
      createdAt: post.created_at,
      likes: 0,
      comments: 0,
      author: user
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to create post' })
  }
})

// Delete post
router.delete('/:postId', async (req, res) => {
  const { postId } = req.params

  try {
    const postResult = await pool.query('SELECT * FROM posts WHERE id = $1', [postId])
    const post = postResult.rows[0]

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    if (post.user_id !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    await pool.query('DELETE FROM posts WHERE id = $1', [postId])
    res.json({ message: 'Post deleted' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to delete post' })
  }
})

// Like post
router.post('/:postId/like', async (req, res) => {
  const { postId } = req.params

  try {
    const likeExists = await pool.query(
      'SELECT * FROM likes WHERE post_id = $1 AND user_id = $2',
      [postId, req.userId]
    )

    if (likeExists.rows.length > 0) {
      // Unlike
      await pool.query('DELETE FROM likes WHERE post_id = $1 AND user_id = $2', [postId, req.userId])
      res.json({ message: 'Post unliked' })
    } else {
      // Like
      await pool.query(
        'INSERT INTO likes (post_id, user_id) VALUES ($1, $2)',
        [postId, req.userId]
      )
      res.json({ message: 'Post liked' })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to like post' })
  }
})

// Add comment
router.post('/:postId/comments', async (req, res) => {
  const { postId } = req.params
  const { content } = req.body

  if (!content) {
    return res.status(400).json({ message: 'Content is required' })
  }

  try {
    const result = await pool.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [postId, req.userId, content]
    )

    const comment = result.rows[0]
    const userResult = await pool.query('SELECT id, username FROM users WHERE id = $1', [req.userId])
    const user = userResult.rows[0]

    res.json({
      id: comment.id,
      content: comment.content,
      createdAt: comment.created_at,
      author: user
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to add comment' })
  }
})

module.exports = router
