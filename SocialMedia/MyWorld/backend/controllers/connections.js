const db = require('../db')

// Search users by username
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' })
    }

    const result = await db.query(
      'SELECT id, username, bio FROM users WHERE username ILIKE $1 LIMIT 20',
      [`%${query}%`]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Search users error:', error)
    res.status(500).json({ error: 'Failed to search users' })
  }
}

// Send connection request
exports.sendConnectionRequest = async (req, res) => {
  try {
    const { recipientId } = req.body
    const userId = req.user.id

    if (userId === recipientId) {
      return res.status(400).json({ error: 'Cannot send request to yourself' })
    }

    // Check if user exists
    const userExists = await db.query('SELECT id FROM users WHERE id = $1', [
      recipientId
    ])
    if (userExists.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check for existing connection
    const normalizedIds = [userId, recipientId].sort()
    const existing = await db.query(
      'SELECT id, status FROM friendships WHERE user_id_1 = $1 AND user_id_2 = $2',
      normalizedIds
    )

    if (existing.rows.length > 0) {
      return res.status(400).json({
        error: `Connection already exists with status: ${existing.rows[0].status}`
      })
    }

    // Create connection request
    const result = await db.query(
      'INSERT INTO friendships (user_id_1, user_id_2, status) VALUES ($1, $2, $3) RETURNING *',
      [...normalizedIds, 'pending']
    )

    res.status(201).json({
      message: 'Connection request sent',
      request: result.rows[0]
    })
  } catch (error) {
    console.error('Send connection request error:', error)
    res.status(500).json({ error: 'Failed to send connection request' })
  }
}

// Get pending connection requests
exports.getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id

    const result = await db.query(
      `SELECT f.id, f.user_id_1 as sender_id, u.username, u.bio 
       FROM friendships f 
       JOIN users u ON u.id = f.user_id_1 
       WHERE f.user_id_2 = $1 AND f.status = 'pending'`,
      [userId]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Get pending requests error:', error)
    res.status(500).json({ error: 'Failed to get pending requests' })
  }
}

// Accept connection request
exports.acceptConnectionRequest = async (req, res) => {
  try {
    const { connectionId } = req.body
    const userId = req.user.id

    const result = await db.query(
      'UPDATE friendships SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id_2 = $3 RETURNING *',
      ['accepted', connectionId, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Connection request not found' })
    }

    res.json({
      message: 'Connection request accepted',
      connection: result.rows[0]
    })
  } catch (error) {
    console.error('Accept connection request error:', error)
    res.status(500).json({ error: 'Failed to accept connection request' })
  }
}

// Reject connection request
exports.rejectConnectionRequest = async (req, res) => {
  try {
    const { connectionId } = req.body
    const userId = req.user.id

    const result = await db.query(
      'DELETE FROM friendships WHERE id = $1 AND user_id_2 = $2 RETURNING *',
      [connectionId, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Connection request not found' })
    }

    res.json({ message: 'Connection request rejected' })
  } catch (error) {
    console.error('Reject connection request error:', error)
    res.status(500).json({ error: 'Failed to reject connection request' })
  }
}

// Get user connections
exports.getUserConnections = async (req, res) => {
  try {
    const userId = req.user.id

    const result = await db.query(
      `SELECT 
        CASE 
          WHEN f.user_id_1 = $1 THEN f.user_id_2 
          ELSE f.user_id_1 
        END as friend_id,
        u.username, u.bio
       FROM friendships f 
       JOIN users u ON u.id = (CASE WHEN f.user_id_1 = $1 THEN f.user_id_2 ELSE f.user_id_1 END)
       WHERE (f.user_id_1 = $1 OR f.user_id_2 = $1) AND f.status = 'accepted'`,
      [userId]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Get user connections error:', error)
    res.status(500).json({ error: 'Failed to get connections' })
  }
}
