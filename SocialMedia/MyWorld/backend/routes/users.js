const express = require('express')
const router = express.Router()
const pool = require('../db')

// Get user profile
router.get('/:userId', async (req, res) => {
  const { userId } = req.params

  try {
    const userResult = await pool.query(
      'SELECT id, username, email, bio FROM users WHERE id = $1',
      [userId]
    )

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    const user = userResult.rows[0]

    // Get friend count
    const friendResult = await pool.query(
      'SELECT COUNT(*) as count FROM friendships WHERE (user_id_1 = $1 OR user_id_2 = $1) AND status = $2',
      [userId, 'accepted']
    )

    user.friendCount = parseInt(friendResult.rows[0].count)
    res.json(user)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to fetch user' })
  }
})

// Get user posts
router.get('/:userId/posts', async (req, res) => {
  const { userId } = req.params

  try {
    const result = await pool.query(
      `SELECT p.*, COUNT(DISTINCT l.id) as likes 
       FROM posts p
       LEFT JOIN likes l ON p.id = l.post_id
       WHERE p.user_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [userId]
    )

    const posts = result.rows.map(row => ({
      id: row.id,
      content: row.content,
      createdAt: row.created_at,
      likes: parseInt(row.likes)
    }))

    res.json(posts)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to fetch user posts' })
  }
})

module.exports = router
